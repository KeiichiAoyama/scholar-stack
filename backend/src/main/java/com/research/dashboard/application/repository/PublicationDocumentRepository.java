package com.research.dashboard.application.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.research.dashboard.application.entity.PublicationDocument;

public interface PublicationDocumentRepository extends JpaRepository<PublicationDocument, Long> {
	Optional<PublicationDocument> findByArticleId(Long articleId);
}
