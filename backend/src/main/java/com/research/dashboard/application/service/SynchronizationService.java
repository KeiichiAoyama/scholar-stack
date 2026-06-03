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
	private final SintaClient sintaClient;

	public SynchronizationService(AppUserRepository users, LecturerProfileRepository profiles, ArticleRepository articles,
			ResearchProjectRepository researches, CommunityServiceRepository communityServices, SintaClient sintaClient) {
		this.users = users;
		this.profiles = profiles;
		this.articles = articles;
		this.researches = researches;
		this.communityServices = communityServices;
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
		if (isBlank(lecturer.getSintaUsername()) || isBlank(lecturer.getSintaPassword())) {
			warnings.add("SINTA credentials are not configured.");
			return 0;
		}
		try {
			List<ArticleDto> fetched = sintaClient.fetchProfileScopusArticles(lecturer.getSintaUsername(), lecturer.getSintaPassword());
			fetched.forEach(article -> upsertArticle(lecturer, article));
			return fetched.size();
		} catch (RuntimeException exception) {
			warnings.add(message("SINTA Scopus synchronization failed.", exception));
			return 0;
		}
	}

	private int synchronizeGoogleScholar(AppUser lecturer, List<String> warnings) {
		if (isBlank(lecturer.getSintaUsername()) || isBlank(lecturer.getSintaPassword())) {
			warnings.add("SINTA credentials are not configured.");
			return 0;
		}
		try {
			List<ArticleDto> fetched = sintaClient.fetchProfileGoogleScholarArticles(lecturer.getSintaUsername(), lecturer.getSintaPassword());
			fetched.forEach(article -> upsertArticle(lecturer, article));
			return fetched.size();
		} catch (RuntimeException exception) {
			warnings.add(message("SINTA Google Scholar synchronization failed.", exception));
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
		Article article = isSintaProfileArticle(dto)
				? findSintaProfileArticle(lecturer, dto)
				: !"googlescholar".equals(dto.source()) && !isBlank(dto.id())
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

	private Article findSintaProfileArticle(AppUser lecturer, ArticleDto dto) {
		return articles.findByLecturerIdAndSourceAndExternalId(lecturer.getId(), dto.source(), dto.id())
				.or(() -> findBySourceLinkIdentifier(lecturer, dto))
				.or(() -> articles.findFirstByLecturerIdAndSourceAndTitleAndPublicationYearOrderByIdAsc(lecturer.getId(), dto.source(), dto.title(), dto.year()))
				.orElseGet(Article::new);
	}

	private java.util.Optional<Article> findBySourceLinkIdentifier(AppUser lecturer, ArticleDto dto) {
		String candidateIdentifier = sourceLinkIdentifier(dto.link());
		if (isBlank(candidateIdentifier)) {
			return java.util.Optional.empty();
		}
		return articles.findByLecturerIdAndSource(lecturer.getId(), dto.source()).stream()
				.filter(article -> candidateIdentifier.equals(sourceLinkIdentifier(article.getLink()))
						|| candidateIdentifier.equals(sourceLinkIdentifier(article.getExternalId())))
				.findFirst();
	}

	private String sourceLinkIdentifier(String value) {
		if (isBlank(value)) {
			return null;
		}
		String eid = queryValue(value, "eid");
		if (!isBlank(eid)) {
			return eid;
		}
		java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("\\b2-s2\\.0-\\d+\\b").matcher(value);
		return matcher.find() ? matcher.group() : null;
	}

	private String queryValue(String url, String key) {
		try {
			String query = java.net.URI.create(url).getQuery();
			if (query == null) {
				return null;
			}
			for (String pair : query.split("&")) {
				String[] parts = pair.split("=", 2);
				if (parts.length == 2 && key.equals(parts[0])) {
					return parts[1];
				}
			}
			return null;
		} catch (IllegalArgumentException exception) {
			return null;
		}
	}

	private boolean isSintaProfileArticle(ArticleDto dto) {
		return isSintaProfileExternalId(dto.id());
	}

	private boolean isSintaProfileExternalId(String externalId) {
		return externalId != null && externalId.contains("-sinta-");
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
