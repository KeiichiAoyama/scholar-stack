package com.research.dashboard.application.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.research.dashboard.application.dto.AuthRequest;
import com.research.dashboard.application.dto.AuthResponse;
import com.research.dashboard.application.entity.AppUser;
import com.research.dashboard.application.model.RecordStatus;
import com.research.dashboard.application.repository.AppUserRepository;

@Service
public class AuthService {
	private final AppUserRepository users;
	private final PasswordEncoder passwordEncoder;
	public AuthService(AppUserRepository users, PasswordEncoder passwordEncoder) {
		this.users = users;
		this.passwordEncoder = passwordEncoder;
	}
	public AuthResponse login(AuthRequest request) {
		AppUser user = users.findByUsername(request.username())
				.filter(candidate -> candidate.getStatus() == RecordStatus.ACTIVE)
				.filter(candidate -> passwordEncoder.matches(request.password(), candidate.getPassword()))
				.orElseThrow(() -> new IllegalArgumentException("Invalid username or password."));
		return new AuthResponse(user.getId(), user.getUsername(), user.getName(),
				title(user.getRole().name()), user.getSintaId());
	}
	private String title(String value) {
		return value.charAt(0) + value.substring(1).toLowerCase();
	}
}
