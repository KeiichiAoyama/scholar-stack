package com.research.dashboard.application.dto;

public record ProfileDto(Long id, String username, String name, String email, String nidn, String role, String status,
		String affiliation, String departmentUnit, String phone, String academicGrade, String sintaId, String scopusId,
		String scopusApiKey, String scopusInstToken, String googleScholarId, String sintaUsername, String sintaPassword,
		String nik, String gender, String placeOfBirth, String dateOfBirth, String religion,
		String employmentType, String employeeStatus, String pangkat, String golongan, String jabatanFungsional,
		String prodi, Integer sintaScoreOverall, Integer sintaScore3yr, Integer affilScore, Integer affilScore3yr) {
}
