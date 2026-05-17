package com.research.dashboard.application.dto;

public record ResearchProjectDto(Long id, String title, String fundingSource, Integer year, String scheme, Integer members, String status) {
}
