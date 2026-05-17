package com.research.dashboard.application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.research.dashboard.application.entity.GrantMaster;

public interface GrantMasterRepository extends JpaRepository<GrantMaster, Long> {
}
