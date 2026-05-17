package com.research.dashboard.application.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.research.dashboard.application.entity.Article;

public interface ArticleRepository extends JpaRepository<Article, Long> {
	List<Article> findByLecturerId(Long lecturerId);
	List<Article> findByLecturerIdAndSource(Long lecturerId, String source);
	Optional<Article> findByLecturerIdAndSourceAndExternalId(Long lecturerId, String source, String externalId);
	Optional<Article> findFirstByLecturerIdAndSourceAndTitleAndPublicationYearOrderByIdAsc(Long lecturerId, String source, String title, Integer publicationYear);
	long countByLecturerId(Long lecturerId);
}
