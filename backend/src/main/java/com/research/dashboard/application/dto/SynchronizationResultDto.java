package com.research.dashboard.application.dto;

import java.util.List;

public record SynchronizationResultDto(
		Long lecturerId,
		String source,
		int scopusArticles,
		int googleScholarArticles,
		int researches,
		int communityServices,
		boolean profileUpdated,
		List<String> warnings) {
}
