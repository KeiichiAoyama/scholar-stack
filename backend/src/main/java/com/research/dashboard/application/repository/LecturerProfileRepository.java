package com.research.dashboard.application.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.research.dashboard.application.entity.LecturerProfile;

public interface LecturerProfileRepository extends JpaRepository<LecturerProfile, Long> {
	Optional<LecturerProfile> findByUserId(Long userId);
}
