package com.research.dashboard.application.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.research.dashboard.application.entity.CommunityServiceActivity;

public interface CommunityServiceRepository extends JpaRepository<CommunityServiceActivity, Long> {
	List<CommunityServiceActivity> findByLecturerId(Long lecturerId);
	Optional<CommunityServiceActivity> findByLecturerIdAndTitleAndActivityYear(Long lecturerId, String title, Integer activityYear);
}
