package com.research.dashboard.application.dto;

public record ExploreLecturerDto(Long id, String name, String nidn, String email, String status, String department,
		Integer score, Integer score3yr, Long publicationCount) {
}
