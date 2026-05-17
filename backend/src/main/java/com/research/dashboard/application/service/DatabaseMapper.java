package com.research.dashboard.application.service;

import org.springframework.stereotype.Component;
import com.research.dashboard.application.dto.*;
import com.research.dashboard.application.entity.*;

@Component
public class DatabaseMapper {
	public UserDto toUserDto(AppUser user) {
		return new UserDto(user.getId(), user.getUsername(), user.getName(), user.getNidn(), user.getEmail(),
				title(user.getRole().name()), title(user.getStatus().name()), user.getAffiliation(), user.getDepartmentUnit(),
				user.getPhone(), user.getAcademicGrade(), user.getSintaId(), user.getSintaUsername(), user.getScopusId(),
				user.getScopusApiKey(), user.getScopusInstToken(), user.getGoogleScholarId());
	}
	public ArticleDto toArticleDto(Article article) {
		return new ArticleDto(String.valueOf(article.getId()), article.getTitle(), article.getJournalName(),
				article.getPublicationYear(), article.getCitations(), article.getAuthorOrder(), article.getCreatorName(),
				article.getQuartile(), article.getSource(), article.getLink());
	}
	public ResearchProjectDto toResearchDto(ResearchProject project) {
		return new ResearchProjectDto(project.getId(), project.getTitle(), project.getFundingSource(), project.getProjectYear(),
				project.getScheme(), project.getMembers(), title(project.getStatus().name()));
	}
	public CommunityServiceDto toCommunityDto(CommunityServiceActivity activity) {
		return new CommunityServiceDto(activity.getId(), activity.getTitle(), activity.getLocation(), activity.getActivityYear(),
				activity.getProgram(), activity.getCommunity());
	}
	public GrantDto toGrantDto(GrantMaster grant) {
		return new GrantDto(grant.getId(), grant.getType(), grant.getName(), grant.getProvider(), title(grant.getStatus().name()));
	}
	public ProfileDto toProfileDto(AppUser user, LecturerProfile profile) {
		return new ProfileDto(user.getId(), user.getUsername(), user.getName(), user.getEmail(), user.getNidn(),
				title(user.getRole().name()), title(user.getStatus().name()), user.getAffiliation(), user.getDepartmentUnit(),
				user.getPhone(), user.getAcademicGrade(), user.getSintaId(), user.getScopusId(), user.getScopusApiKey(),
				user.getScopusInstToken(), user.getGoogleScholarId(), user.getSintaUsername(), user.getSintaPassword(),
				profile == null ? null : profile.getNik(), profile == null ? null : profile.getGender(),
				profile == null ? null : profile.getPlaceOfBirth(), profile == null ? null : profile.getDateOfBirth(),
				profile == null ? null : profile.getReligion(), profile == null ? null : profile.getEmploymentType(),
				profile == null ? null : profile.getEmployeeStatus(), profile == null ? null : profile.getPangkat(),
				profile == null ? null : profile.getGolongan(), profile == null ? null : profile.getJabatanFungsional(),
				profile == null ? null : profile.getProdi(), profile == null ? null : profile.getSintaScoreOverall(),
				profile == null ? null : profile.getSintaScore3yr(), profile == null ? null : profile.getAffilScore(),
				profile == null ? null : profile.getAffilScore3yr());
	}
	private String title(String value) {
		return value.charAt(0) + value.substring(1).toLowerCase();
	}
}
