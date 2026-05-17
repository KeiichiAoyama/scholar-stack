package com.research.dashboard.application.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.research.dashboard.application.dto.ArticleDto;
import com.research.dashboard.application.dto.LecturerProfileDto;
import com.research.dashboard.application.dto.MetricsDto;
import com.research.dashboard.application.dto.SintaCommunityServiceDto;
import com.research.dashboard.application.dto.SintaResearchDto;
import com.research.dashboard.application.dto.SynchronizationResultDto;
import com.research.dashboard.application.entity.AppUser;
import com.research.dashboard.application.entity.Article;
import com.research.dashboard.application.entity.CommunityServiceActivity;
import com.research.dashboard.application.entity.LecturerProfile;
import com.research.dashboard.application.entity.ResearchProject;
import com.research.dashboard.application.repository.AppUserRepository;
import com.research.dashboard.application.repository.ArticleRepository;
import com.research.dashboard.application.repository.CommunityServiceRepository;
import com.research.dashboard.application.repository.LecturerProfileRepository;
import com.research.dashboard.application.repository.ResearchProjectRepository;

@Service
public class SynchronizationService {

	private final AppUserRepository users;
	private final LecturerProfileRepository profiles;
	private final ArticleRepository articles;
	private final ResearchProjectRepository researches;
	private final CommunityServiceRepository communityServices;
	private final ScopusClient scopusClient;
	private final GoogleScholarClient googleScholarClient;
	private final SintaClient sintaClient;

	public SynchronizationService(AppUserRepository users, LecturerProfileRepository profiles, ArticleRepository articles,
			ResearchProjectRepository researches, CommunityServiceRepository communityServices, ScopusClient scopusClient,
			GoogleScholarClient googleScholarClient, SintaClient sintaClient) {
		this.users = users;
		this.profiles = profiles;
		this.articles = articles;
		this.researches = researches;
		this.communityServices = communityServices;
		this.scopusClient = scopusClient;
		this.googleScholarClient = googleScholarClient;
		this.sintaClient = sintaClient;
	}

	@Transactional
	public SynchronizationResultDto synchronize(Long lecturerId, String source) {
		AppUser lecturer = users.findById(lecturerId).orElseThrow();
		List<String> warnings = new ArrayList<>();
		int scopusCount = "scopus".equals(source) ? synchronizeScopus(lecturer, warnings) : 0;
		int scholarCount = "googlescholar".equals(source) ? synchronizeGoogleScholar(lecturer, warnings) : 0;
		int researchCount = "researches".equals(source) ? synchronizeResearches(lecturer, warnings) : 0;
		int serviceCount = "services".equals(source) ? synchronizeCommunityServices(lecturer, warnings) : 0;
		boolean profileUpdated = ("researches".equals(source) || "services".equals(source)) && synchronizeSinta(lecturer, warnings);
		return new SynchronizationResultDto(lecturerId, source, scopusCount, scholarCount, researchCount, serviceCount, profileUpdated, warnings);
	}

	private int synchronizeScopus(AppUser lecturer, List<String> warnings) {
		if (isBlank(lecturer.getScopusId())) {
			warnings.add("Scopus ID is not configured.");
			return 0;
		}
		try {
			List<ArticleDto> fetched = scopusClient.fetchArticles(lecturer.getScopusId(), lecturer.getScopusApiKey(), lecturer.getScopusInstToken());
			fetched.forEach(article -> upsertArticle(lecturer, article));
			enrichScopusMetadata(lecturer, warnings);
			return fetched.size();
		} catch (RuntimeException exception) {
			if (isBlank(lecturer.getSintaId())) {
				warnings.add(message("Scopus synchronization failed.", exception));
				return 0;
			}
			try {
				List<ArticleDto> fallback = sintaClient.fetchScopusArticles(lecturer.getSintaId());
				fallback.forEach(article -> upsertArticle(lecturer, article));
				warnings.add(message("Scopus API failed; used SINTA Scopus view instead.", exception));
				return fallback.size();
			} catch (RuntimeException fallbackException) {
				warnings.add(message("Scopus synchronization failed.", exception));
				warnings.add(message("SINTA Scopus fallback failed.", fallbackException));
				return 0;
			}
		}
	}

	private int synchronizeGoogleScholar(AppUser lecturer, List<String> warnings) {
		if (isBlank(lecturer.getGoogleScholarId())) {
			warnings.add("Google Scholar ID is not configured.");
			return 0;
		}
		try {
			List<ArticleDto> fetched = googleScholarClient.fetchArticles(lecturer.getGoogleScholarId());
			fetched.forEach(article -> upsertArticle(lecturer, article));
			return fetched.size();
		} catch (RuntimeException exception) {
			warnings.add(message("Google Scholar synchronization failed.", exception));
			return 0;
		}
	}

	private boolean synchronizeSinta(AppUser lecturer, List<String> warnings) {
		if (isBlank(lecturer.getSintaId())) {
			warnings.add("SINTA ID is not configured.");
			return false;
		}
		try {
			LecturerProfileDto remoteProfile = sintaClient.fetchProfile(
					lecturer.getId(),
					lecturer.getEmail(),
					lecturer.getSintaId(),
					lecturer.getScopusId(),
					lecturer.getGoogleScholarId());
			MetricsDto metrics = sintaClient.fetchMetrics(lecturer.getSintaId());
			applySintaProfile(lecturer, remoteProfile, metrics);
			return true;
		} catch (RuntimeException exception) {
			warnings.add(message("SINTA synchronization failed.", exception));
			return false;
		}
	}

	private int synchronizeResearches(AppUser lecturer, List<String> warnings) {
		if (isBlank(lecturer.getSintaId())) {
			warnings.add("SINTA ID is not configured.");
			return 0;
		}
		try {
			List<SintaResearchDto> fetched = sintaClient.fetchResearches(lecturer.getSintaId());
			fetched.forEach(item -> upsertResearch(lecturer, item));
			return fetched.size();
		} catch (RuntimeException exception) {
			warnings.add(message("SINTA research synchronization failed.", exception));
			return 0;
		}
	}

	private int synchronizeCommunityServices(AppUser lecturer, List<String> warnings) {
		if (isBlank(lecturer.getSintaId())) {
			warnings.add("SINTA ID is not configured.");
			return 0;
		}
		try {
			List<SintaCommunityServiceDto> fetched = sintaClient.fetchCommunityServices(lecturer.getSintaId());
			fetched.forEach(item -> upsertCommunityService(lecturer, item));
			return fetched.size();
		} catch (RuntimeException exception) {
			warnings.add(message("SINTA community-service synchronization failed.", exception));
			return 0;
		}
	}

	private void applySintaProfile(AppUser lecturer, LecturerProfileDto remoteProfile, MetricsDto metrics) {
		if (!isBlank(remoteProfile.name())) {
			lecturer.setName(remoteProfile.name());
		}
		if (!isBlank(remoteProfile.affiliation())) {
			lecturer.setAffiliation(remoteProfile.affiliation());
		}
		if (!isBlank(remoteProfile.department())) {
			lecturer.setDepartmentUnit(remoteProfile.department());
		}
		users.save(lecturer);

		LecturerProfile profile = profiles.findByUserId(lecturer.getId()).orElseGet(() -> {
			LecturerProfile created = new LecturerProfile();
			created.setUser(lecturer);
			return created;
		});
		profile.setSintaScoreOverall(defaultMetric(metrics.sintaScoreOverall()));
		profile.setSintaScore3yr(defaultMetric(metrics.sintaScore3yr()));
		profile.setAffilScore(defaultMetric(metrics.affilScore()));
		profile.setAffilScore3yr(defaultMetric(metrics.affilScore3yr()));
		profiles.save(profile);
	}

	private void upsertArticle(AppUser lecturer, ArticleDto dto) {
		Article article = !"googlescholar".equals(dto.source()) && !isBlank(dto.id())
				? articles.findByLecturerIdAndSourceAndExternalId(lecturer.getId(), dto.source(), dto.id())
						.or(() -> articles.findFirstByLecturerIdAndSourceAndTitleAndPublicationYearOrderByIdAsc(lecturer.getId(), dto.source(), dto.title(), dto.year()))
						.orElseGet(Article::new)
				: articles.findFirstByLecturerIdAndSourceAndTitleAndPublicationYearOrderByIdAsc(lecturer.getId(), dto.source(), dto.title(), dto.year()).orElseGet(Article::new);
		article.setLecturer(lecturer);
		article.setExternalId(dto.id());
		article.setTitle(dto.title());
		article.setJournalName(prefer(dto.journalName(), article.getJournalName()));
		article.setPublicationYear(dto.year());
		article.setCitations(dto.citations());
		article.setAuthorOrder(dto.authorOrder() == null ? article.getAuthorOrder() : dto.authorOrder());
		article.setCreatorName(prefer(dto.creatorName(), article.getCreatorName()));
		article.setQuartile(preferQuartile(dto.quartile(), article.getQuartile()));
		article.setSource(dto.source());
		article.setLink(dto.link());
		articles.save(article);
	}

	private void enrichScopusMetadata(AppUser lecturer, List<String> warnings) {
		if (isBlank(lecturer.getSintaId())) {
			return;
		}
		try {
			sintaClient.fetchScopusArticles(lecturer.getSintaId()).forEach(article -> upsertArticle(lecturer, article));
		} catch (RuntimeException exception) {
			warnings.add(message("SINTA Scopus metadata enrichment failed.", exception));
		}
	}

	private void upsertResearch(AppUser lecturer, SintaResearchDto dto) {
		ResearchProject research = researches.findByLecturerIdAndTitleAndProjectYear(lecturer.getId(), dto.title(), dto.year()).orElseGet(ResearchProject::new);
		research.setLecturer(lecturer);
		research.setTitle(dto.title());
		research.setFundingSource(dto.fundingSource());
		research.setProjectYear(dto.year());
		research.setScheme(dto.scheme());
		research.setMembers(dto.members());
		research.setStatus(com.research.dashboard.application.model.RecordStatus.ACTIVE);
		researches.save(research);
	}

	private void upsertCommunityService(AppUser lecturer, SintaCommunityServiceDto dto) {
		CommunityServiceActivity activity = communityServices.findByLecturerIdAndTitleAndActivityYear(lecturer.getId(), dto.title(), dto.year()).orElseGet(CommunityServiceActivity::new);
		activity.setLecturer(lecturer);
		activity.setTitle(dto.title());
		activity.setActivityYear(dto.year());
		activity.setProgram(dto.program());
		activity.setCommunity(dto.community());
		communityServices.save(activity);
	}

	private Integer defaultMetric(Integer value) {
		return value == null ? 0 : value;
	}

	private String prefer(String candidate, String existing) {
		return isBlank(candidate) ? existing : candidate;
	}

	private String preferQuartile(String candidate, String existing) {
		if (isBlank(candidate) || "none".equalsIgnoreCase(candidate)) {
			return isBlank(existing) ? "none" : existing;
		}
		return candidate;
	}

	private boolean isBlank(String value) {
		return value == null || value.isBlank();
	}

	private String message(String fallback, RuntimeException exception) {
		return exception.getMessage() == null || exception.getMessage().isBlank() ? fallback : exception.getMessage();
	}
}
