package com.research.dashboard.application.dto;

public record PublicationDocumentRequest(String label, String grantName, String fileName, String filePath,
		String relatedType, Long relatedId) {
}
