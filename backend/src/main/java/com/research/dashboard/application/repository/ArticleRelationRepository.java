package com.research.dashboard.application.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.research.dashboard.application.entity.ArticleRelation;

public interface ArticleRelationRepository extends JpaRepository<ArticleRelation, Long> {
	List<ArticleRelation> findByArticleId(Long articleId);
}
