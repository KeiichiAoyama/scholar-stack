package com.research.dashboard.application.dto;

import java.util.List;

public record DashboardDto(
		LecturerProfileDto profile,
		MetricsDto metrics,
		List<TrendPointDto> publicationTrend,
		List<ArticleDto> recentArticles,
		List<String> sourceWarnings) {
}
