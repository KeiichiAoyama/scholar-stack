package com.research.dashboard.application.controller;

import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.research.dashboard.application.dto.*;
import com.research.dashboard.application.repository.*;
import com.research.dashboard.application.service.ApplicationDataService;
import com.research.dashboard.application.service.DatabaseMapper;

@RestController
@RequestMapping("/api/data")
@CrossOrigin(origins = "http://localhost:5173")
public class DataController {
	private final AppUserRepository users;
	private final ArticleRepository articles;
	private final ResearchProjectRepository researches;
	private final CommunityServiceRepository services;
	private final GrantMasterRepository grants;
	private final DatabaseMapper mapper;
	private final ApplicationDataService dataService;
	public DataController(AppUserRepository users, ArticleRepository articles, ResearchProjectRepository researches,
			CommunityServiceRepository services, GrantMasterRepository grants, DatabaseMapper mapper, ApplicationDataService dataService) {
		this.users = users; this.articles = articles; this.researches = researches; this.services = services; this.grants = grants; this.mapper = mapper; this.dataService = dataService;
	}
	@GetMapping("/users")
	public List<UserDto> users() { return users.findAll().stream().map(mapper::toUserDto).toList(); }
	@GetMapping("/articles")
	public List<ArticleDto> articles(@RequestParam Long lecturerId, @RequestParam(required = false) String source) {
		return (source == null ? articles.findByLecturerId(lecturerId) : articles.findByLecturerIdAndSource(lecturerId, source))
				.stream().map(mapper::toArticleDto).toList();
	}
	@GetMapping("/researches")
	public List<ResearchProjectDto> researches(@RequestParam Long lecturerId) {
		return researches.findByLecturerId(lecturerId).stream().map(mapper::toResearchDto).toList();
	}
	@GetMapping("/services")
	public List<CommunityServiceDto> services(@RequestParam Long lecturerId) {
		return services.findByLecturerId(lecturerId).stream().map(mapper::toCommunityDto).toList();
	}
	@GetMapping("/grants")
	public List<GrantDto> grants() { return grants.findAll().stream().map(mapper::toGrantDto).toList(); }
	@PostMapping("/users")
	public UserDto createUser(@RequestBody UserWriteRequest request) { return dataService.createUser(request); }
	@PutMapping("/users/{id}")
	public UserDto updateUser(@PathVariable Long id, @RequestBody UserWriteRequest request) { return dataService.updateUser(id, request); }
	@DeleteMapping("/users/{id}")
	public void deleteUser(@PathVariable Long id) { dataService.deleteUser(id); }
	@PostMapping("/grants")
	public GrantDto createGrant(@RequestBody GrantWriteRequest request) { return dataService.createGrant(request); }
	@PutMapping("/grants/{id}")
	public GrantDto updateGrant(@PathVariable Long id, @RequestBody GrantWriteRequest request) { return dataService.updateGrant(id, request); }
	@DeleteMapping("/grants/{id}")
	public void deleteGrant(@PathVariable Long id) { dataService.deleteGrant(id); }
	@GetMapping("/articles/{articleId}/document")
	public PublicationDocumentDto document(@PathVariable Long articleId) { return dataService.document(articleId); }
	@GetMapping("/articles/{articleId}/document/file")
	public ResponseEntity<Resource> downloadDocumentFile(@PathVariable Long articleId) { return dataService.downloadDocumentFile(articleId); }
	@PutMapping("/articles/{articleId}/document")
	public PublicationDocumentDto saveDocument(@PathVariable Long articleId, @RequestBody PublicationDocumentRequest request) { return dataService.saveDocument(articleId, request); }
	@PostMapping(value = "/articles/{articleId}/document/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public PublicationDocumentDto uploadDocumentFile(@PathVariable Long articleId, @RequestPart("file") MultipartFile file) {
		return dataService.uploadDocumentFile(articleId, file);
	}
}
