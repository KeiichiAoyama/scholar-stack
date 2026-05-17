package com.research.dashboard.application.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.research.dashboard.application.dto.DashboardDto;
import com.research.dashboard.application.dto.ExploreLecturerDto;
import com.research.dashboard.application.dto.ProfileDto;
import com.research.dashboard.application.dto.SynchronizationResultDto;
import com.research.dashboard.application.service.ApplicationDataService;
import com.research.dashboard.application.service.SynchronizationService;

@RestController
@RequestMapping("/api/lecturers")
@CrossOrigin(origins = "http://localhost:5173")
public class LecturerController {

	private final ApplicationDataService dataService;
	private final SynchronizationService synchronizationService;

	public LecturerController(ApplicationDataService dataService, SynchronizationService synchronizationService) {
		this.dataService = dataService;
		this.synchronizationService = synchronizationService;
	}

	@GetMapping
	public List<ExploreLecturerDto> getLecturers() {
		return dataService.lecturers();
	}

	@GetMapping("/{lecturerId}/profile")
	public ProfileDto getProfile(@PathVariable Long lecturerId) {
		return dataService.profile(lecturerId);
	}

	@GetMapping("/{lecturerId}/dashboard")
	public DashboardDto getDashboard(@PathVariable Long lecturerId) {
		return dataService.dashboard(lecturerId);
	}
	@PostMapping("/{lecturerId}/sync/{source}")
	public SynchronizationResultDto synchronize(@PathVariable Long lecturerId, @PathVariable String source) {
		return synchronizationService.synchronize(lecturerId, source);
	}
	@PutMapping("/{lecturerId}/profile")
	public ProfileDto updateProfile(@PathVariable Long lecturerId, @RequestBody ProfileDto request) {
		return dataService.updateProfile(lecturerId, request);
	}

	@GetMapping("/health")
	public ResponseEntity<String> health() {
		return ResponseEntity.ok("ok");
	}
}
