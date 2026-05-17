package com.research.dashboard.application.controller;

import org.springframework.web.bind.annotation.*;
import com.research.dashboard.application.dto.AuthRequest;
import com.research.dashboard.application.dto.AuthResponse;
import com.research.dashboard.application.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
	private final AuthService authService;
	public AuthController(AuthService authService) { this.authService = authService; }
	@PostMapping("/login")
	public AuthResponse login(@RequestBody AuthRequest request) { return authService.login(request); }
}
