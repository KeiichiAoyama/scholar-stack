package com.research.dashboard.application.dto;

public record UserDto(Long id, String username, String name, String nidn, String email, String role, String status,
		String affiliation, String departmentUnit, String phone, String academicGrade, String sintaId,
		String sintaUsername, String scopusId, String scopusApiKey, String scopusInstToken, String googleScholarId) {
}
