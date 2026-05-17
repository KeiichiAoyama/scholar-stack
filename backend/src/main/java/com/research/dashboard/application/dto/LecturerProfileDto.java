package com.research.dashboard.application.dto;

public record LecturerProfileDto(
		Long id,
		String name,
		String email,
		String affiliation,
		String department,
		String sintaId,
		String scopusId,
		String googleScholarId) {
}
