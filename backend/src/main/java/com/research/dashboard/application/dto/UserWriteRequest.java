package com.research.dashboard.application.dto;

public record UserWriteRequest(String username, String password, String name, String nidn, String email, String role,
		String status, String affiliation, String departmentUnit, String phone, String academicGrade, String sintaId,
		String sintaUsername, String sintaPassword, String scopusId, String scopusApiKey, String scopusInstToken,
		String googleScholarId) {
}
