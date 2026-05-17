package com.research.dashboard.application.dto;

public record PublicationDocumentDto(Long articleId, String label, String grantName, String fileName, String filePath,
		String relatedType, Long relatedId) {
}
