package com.research.dashboard.application.dto;

public record MetricsDto(
		Integer sintaScoreOverall,
		Integer sintaScore3yr,
		Integer affilScore,
		Integer affilScore3yr) {
}
