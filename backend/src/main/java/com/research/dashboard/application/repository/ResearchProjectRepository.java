package com.research.dashboard.application.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.research.dashboard.application.entity.ResearchProject;

public interface ResearchProjectRepository extends JpaRepository<ResearchProject, Long> {
	List<ResearchProject> findByLecturerId(Long lecturerId);
	Optional<ResearchProject> findByLecturerIdAndTitleAndProjectYear(Long lecturerId, String title, Integer projectYear);
}
