package com.research.dashboard.application.entity;

import com.research.dashboard.application.model.RecordStatus;
import com.research.dashboard.application.model.UserRole;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class AppUser {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column(nullable = false, unique = true)
	private String username;
	@Column(nullable = false)
	private String password;
	@Column(nullable = false)
	private String name;
	@Column(nullable = false, unique = true)
	private String email;
	private String nidn;
	@Enumerated(EnumType.STRING) @Column(nullable = false)
	private UserRole role;
	@Enumerated(EnumType.STRING) @Column(nullable = false)
	private RecordStatus status;
	private String affiliation;
	private String departmentUnit;
	private String phone;
	private String academicGrade;
	private String sintaId;
	private String sintaUsername;
	private String sintaPassword;
	private String scopusId;
	private String scopusApiKey;
	private String scopusInstToken;
	private String googleScholarId;
	public Long getId() { return id; } public void setId(Long id) { this.id = id; }
	public String getUsername() { return username; } public void setUsername(String username) { this.username = username; }
	public String getPassword() { return password; } public void setPassword(String password) { this.password = password; }
	public String getName() { return name; } public void setName(String name) { this.name = name; }
	public String getEmail() { return email; } public void setEmail(String email) { this.email = email; }
	public String getNidn() { return nidn; } public void setNidn(String nidn) { this.nidn = nidn; }
	public UserRole getRole() { return role; } public void setRole(UserRole role) { this.role = role; }
	public RecordStatus getStatus() { return status; } public void setStatus(RecordStatus status) { this.status = status; }
	public String getAffiliation() { return affiliation; } public void setAffiliation(String affiliation) { this.affiliation = affiliation; }
	public String getDepartmentUnit() { return departmentUnit; } public void setDepartmentUnit(String departmentUnit) { this.departmentUnit = departmentUnit; }
	public String getPhone() { return phone; } public void setPhone(String phone) { this.phone = phone; }
	public String getAcademicGrade() { return academicGrade; } public void setAcademicGrade(String academicGrade) { this.academicGrade = academicGrade; }
	public String getSintaId() { return sintaId; } public void setSintaId(String sintaId) { this.sintaId = sintaId; }
	public String getSintaUsername() { return sintaUsername; } public void setSintaUsername(String sintaUsername) { this.sintaUsername = sintaUsername; }
	public String getSintaPassword() { return sintaPassword; } public void setSintaPassword(String sintaPassword) { this.sintaPassword = sintaPassword; }
	public String getScopusId() { return scopusId; } public void setScopusId(String scopusId) { this.scopusId = scopusId; }
	public String getScopusApiKey() { return scopusApiKey; } public void setScopusApiKey(String scopusApiKey) { this.scopusApiKey = scopusApiKey; }
	public String getScopusInstToken() { return scopusInstToken; } public void setScopusInstToken(String scopusInstToken) { this.scopusInstToken = scopusInstToken; }
	public String getGoogleScholarId() { return googleScholarId; } public void setGoogleScholarId(String googleScholarId) { this.googleScholarId = googleScholarId; }
}
