package com.research.dashboard.application.dto;

public record ArticleDto(
		String id,
		String title,
		String journalName,
		Integer year,
		Integer citations,
		Integer authorOrder,
		String creatorName,
		String quartile,
		String source,
		String link) {
}
