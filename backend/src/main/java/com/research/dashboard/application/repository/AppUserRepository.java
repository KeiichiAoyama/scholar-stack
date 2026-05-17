package com.research.dashboard.application.repository;

import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.research.dashboard.application.entity.AppUser;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
	Optional<AppUser> findByUsername(String username);
	List<AppUser> findByUsernameStartingWith(String prefix);
}
