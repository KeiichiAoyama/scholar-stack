package com.research.dashboard.application.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Comparator;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.research.dashboard.application.dto.*;
import com.research.dashboard.application.entity.*;
import com.research.dashboard.application.model.RecordStatus;
import com.research.dashboard.application.model.UserRole;
import com.research.dashboard.application.repository.*;

@Service
public class ApplicationDataService {
	private static final Path UPLOAD_ROOT = Paths.get("uploads").toAbsolutePath().normalize();
	private final AppUserRepository users; private final LecturerProfileRepository profiles; private final ArticleRepository articles;
	private final ResearchProjectRepository researches; private final CommunityServiceRepository services; private final GrantMasterRepository grants;
	private final PublicationDocumentRepository documents; private final ArticleRelationRepository relations; private final DatabaseMapper mapper;
	private final PasswordEncoder passwordEncoder;
	public ApplicationDataService(AppUserRepository users, LecturerProfileRepository profiles, ArticleRepository articles,
			ResearchProjectRepository researches, CommunityServiceRepository services, GrantMasterRepository grants,
			PublicationDocumentRepository documents, ArticleRelationRepository relations, DatabaseMapper mapper, PasswordEncoder passwordEncoder) {
		this.users = users; this.profiles = profiles; this.articles = articles; this.researches = researches; this.services = services;
		this.grants = grants; this.documents = documents; this.relations = relations; this.mapper = mapper; this.passwordEncoder = passwordEncoder;
	}
	public ProfileDto profile(Long id) {
		AppUser user = user(id);
		return mapper.toProfileDto(user, profiles.findByUserId(id).orElse(null));
	}
	public ProfileDto updateProfile(Long id, ProfileDto request) {
		AppUser user = user(id); user.setName(request.name()); user.setEmail(request.email()); user.setNidn(request.nidn());
		user.setAffiliation(request.affiliation()); user.setDepartmentUnit(request.departmentUnit()); user.setPhone(request.phone());
		user.setAcademicGrade(request.academicGrade()); user.setSintaId(request.sintaId()); user.setScopusId(request.scopusId());
		user.setScopusApiKey(request.scopusApiKey()); user.setScopusInstToken(request.scopusInstToken());
		user.setGoogleScholarId(request.googleScholarId()); user.setSintaUsername(request.sintaUsername());
		user.setSintaPassword(request.sintaPassword()); users.save(user);
		LecturerProfile profile = profiles.findByUserId(id).orElseGet(() -> { LecturerProfile created = new LecturerProfile(); created.setUser(user); return created; });
		profile.setNik(request.nik()); profile.setGender(request.gender()); profile.setPlaceOfBirth(request.placeOfBirth()); profile.setDateOfBirth(request.dateOfBirth());
		profile.setReligion(request.religion()); profile.setEmploymentType(request.employmentType()); profile.setEmployeeStatus(request.employeeStatus());
		profile.setPangkat(request.pangkat()); profile.setGolongan(request.golongan()); profile.setJabatanFungsional(request.jabatanFungsional()); profile.setProdi(request.prodi());
		profiles.save(profile); return mapper.toProfileDto(user, profile);
	}
	public List<ExploreLecturerDto> lecturers() {
		return users.findAll().stream().filter(user -> user.getRole() == UserRole.LECTURER)
				.map(user -> {
					LecturerProfile profile = profiles.findByUserId(user.getId()).orElse(null);
					return new ExploreLecturerDto(user.getId(), user.getName(), user.getNidn(), user.getEmail(), mapper.toUserDto(user).status(),
							user.getDepartmentUnit(), profile == null ? 0 : profile.getSintaScoreOverall(), profile == null ? 0 : profile.getSintaScore3yr(),
							articles.countByLecturerId(user.getId()));
				}).toList();
	}
	public DashboardDto dashboard(Long lecturerId) {
		ProfileDto profile = profile(lecturerId); List<ArticleDto> publicationDtos = articles.findByLecturerId(lecturerId).stream().map(mapper::toArticleDto).toList();
		List<TrendPointDto> trend = publicationDtos.stream().filter(a -> a.year() != null)
				.collect(java.util.stream.Collectors.groupingBy(ArticleDto::year))
				.entrySet().stream().sorted(java.util.Map.Entry.comparingByKey()).map(e -> new TrendPointDto(e.getKey(), e.getValue().size())).toList();
		return new DashboardDto(new LecturerProfileDto(profile.id(), profile.name(), profile.email(), profile.affiliation(), profile.departmentUnit(),
				profile.sintaId(), profile.scopusId(), profile.googleScholarId()),
				new MetricsDto(profile.sintaScoreOverall(), profile.sintaScore3yr(), profile.affilScore(), profile.affilScore3yr()),
				trend, publicationDtos.stream().sorted(Comparator.comparing(ArticleDto::year, Comparator.nullsLast(Comparator.reverseOrder()))).limit(10).toList(), List.of());
	}
	public UserDto createUser(UserWriteRequest request) {
		AppUser user = new AppUser(); applyUser(user, request, true); user.setPassword(passwordEncoder.encode(request.password() == null || request.password().isBlank() ? "password" : request.password()));
		return mapper.toUserDto(users.save(user));
	}
	public UserDto updateUser(Long id, UserWriteRequest request) {
		AppUser user = user(id);
		applyUser(user, request, false);
		if (request.password() != null && !request.password().isBlank()) {
			user.setPassword(passwordEncoder.encode(request.password()));
		}
		return mapper.toUserDto(users.save(user));
	}
	public void deleteUser(Long id) { users.deleteById(id); }
	public GrantDto createGrant(GrantWriteRequest request) { GrantMaster grant = new GrantMaster(); applyGrant(grant, request); return mapper.toGrantDto(grants.save(grant)); }
	public GrantDto updateGrant(Long id, GrantWriteRequest request) { GrantMaster grant = grants.findById(id).orElseThrow(); applyGrant(grant, request); return mapper.toGrantDto(grants.save(grant)); }
	public void deleteGrant(Long id) { grants.deleteById(id); }
	public PublicationDocumentDto saveDocument(Long articleId, PublicationDocumentRequest request) {
		Article article = articles.findById(articleId).orElseThrow();
		PublicationDocument document = documents.findByArticleId(articleId).orElseGet(() -> { PublicationDocument d = new PublicationDocument(); d.setArticle(article); return d; });
		document.setLabel(request.label()); document.setGrantName(request.grantName());
		document.setFileName(prefer(request.fileName(), document.getFileName()));
		document.setFilePath(prefer(request.filePath(), document.getFilePath()));
		documents.save(document);
		relations.findByArticleId(articleId).forEach(relations::delete);
		if (request.relatedType() != null && request.relatedId() != null) { ArticleRelation relation = new ArticleRelation(); relation.setArticle(article); relation.setRelatedType(request.relatedType()); relation.setRelatedId(request.relatedId()); relations.save(relation); }
		return document(articleId);
	}
	public PublicationDocumentDto uploadDocumentFile(Long articleId, MultipartFile file) {
		Article article = articles.findById(articleId).orElseThrow();
		if (file.isEmpty()) {
			throw new IllegalArgumentException("Uploaded file is empty.");
		}
		String originalFileName = file.getOriginalFilename();
		String safeFileName = originalFileName == null ? "" : Paths.get(originalFileName).getFileName().toString();
		if (safeFileName.isBlank()) {
			throw new IllegalArgumentException("Uploaded file name is missing.");
		}
		Path targetDirectory = UPLOAD_ROOT.resolve(uploadDirectory(article.getSource())).resolve(String.valueOf(articleId)).normalize();
		if (!targetDirectory.startsWith(UPLOAD_ROOT)) {
			throw new IllegalArgumentException("Invalid upload path.");
		}
		Path targetFile = targetDirectory.resolve(safeFileName).normalize();
		if (!targetFile.startsWith(targetDirectory)) {
			throw new IllegalArgumentException("Invalid upload file name.");
		}
		try {
			Files.createDirectories(targetDirectory);
			Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
		} catch (IOException exception) {
			throw new IllegalStateException("Unable to store uploaded file.", exception);
		}
		PublicationDocument document = documents.findByArticleId(articleId).orElseGet(() -> { PublicationDocument d = new PublicationDocument(); d.setArticle(article); return d; });
		document.setFileName(safeFileName);
		document.setFilePath(UPLOAD_ROOT.relativize(targetFile).toString().replace('\\', '/'));
		documents.save(document);
		return document(articleId);
	}
	public ResponseEntity<Resource> downloadDocumentFile(Long articleId) {
		PublicationDocument document = documents.findByArticleId(articleId).orElseThrow();
		if (document.getFilePath() == null || document.getFilePath().isBlank()) {
			throw new IllegalArgumentException("No uploaded file is stored for this article.");
		}
		Path targetFile = UPLOAD_ROOT.resolve(document.getFilePath()).normalize();
		if (!targetFile.startsWith(UPLOAD_ROOT) || !Files.exists(targetFile)) {
			throw new IllegalArgumentException("Stored file could not be found.");
		}
		try {
			Resource resource = new UrlResource(targetFile.toUri());
			return ResponseEntity.ok()
					.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
					.body(resource);
		} catch (IOException exception) {
			throw new IllegalStateException("Unable to read stored file.", exception);
		}
	}
	public PublicationDocumentDto document(Long articleId) {
		PublicationDocument document = documents.findByArticleId(articleId).orElse(null);
		ArticleRelation relation = relations.findByArticleId(articleId).stream().findFirst().orElse(null);
		return new PublicationDocumentDto(articleId, document == null ? null : document.getLabel(), document == null ? null : document.getGrantName(),
				document == null ? null : document.getFileName(), document == null ? null : document.getFilePath(),
				relation == null ? null : relation.getRelatedType(), relation == null ? null : relation.getRelatedId());
	}
	private AppUser user(Long id) { return users.findById(id).orElseThrow(); }
	private String prefer(String candidate, String existing) {
		return candidate == null || candidate.isBlank() ? existing : candidate;
	}
	private String uploadDirectory(String source) {
		if ("scopus".equals(source)) {
			return "scopus";
		}
		if ("googlescholar".equals(source)) {
			return "google_scholar";
		}
		throw new IllegalArgumentException("Unsupported article source for uploads.");
	}
	private void applyUser(AppUser user, UserWriteRequest request, boolean creating) {
		UserRole role = UserRole.valueOf(request.role().toUpperCase());
		user.setUsername(resolveUsername(user, request.username(), role, creating)); user.setName(request.name()); user.setNidn(request.nidn()); user.setEmail(request.email());
		user.setRole(role); user.setStatus(RecordStatus.valueOf(request.status().toUpperCase()));
		user.setAffiliation(request.affiliation()); user.setDepartmentUnit(request.departmentUnit()); user.setPhone(request.phone());
		user.setAcademicGrade(request.academicGrade()); user.setSintaId(request.sintaId()); user.setScopusId(request.scopusId()); user.setGoogleScholarId(request.googleScholarId());
		user.setSintaUsername(request.sintaUsername()); user.setSintaPassword(request.sintaPassword()); user.setScopusApiKey(request.scopusApiKey()); user.setScopusInstToken(request.scopusInstToken());
	}
	private void applyGrant(GrantMaster grant, GrantWriteRequest request) {
		grant.setType(request.type()); grant.setName(request.name()); grant.setProvider(request.provider()); grant.setStatus(RecordStatus.valueOf(request.status().toUpperCase()));
	}
	private String resolveUsername(AppUser user, String requestedUsername, UserRole role, boolean creating) {
		if (!creating && "admin01".equals(user.getUsername())) {
			return "admin01";
		}
		if (requestedUsername != null && !requestedUsername.isBlank()) {
			return requestedUsername.trim();
		}
		if (role == UserRole.LECTURER) {
			return nextLecturerUsername();
		}
		throw new IllegalArgumentException("Username is required for admin users.");
	}
	private String nextLecturerUsername() {
		int nextNumber = users.findByUsernameStartingWith("dosen").stream()
				.map(AppUser::getUsername)
				.map(username -> username.replaceFirst("^dosen", ""))
				.filter(suffix -> suffix.matches("\\d+"))
				.mapToInt(Integer::parseInt)
				.max()
				.orElse(0) + 1;
		return "dosen" + String.format("%02d", nextNumber);
	}
}
