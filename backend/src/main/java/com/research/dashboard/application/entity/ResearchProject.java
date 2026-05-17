package com.research.dashboard.application.entity;

import com.research.dashboard.application.model.RecordStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "research_projects")
public class ResearchProject {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "lecturer_id", nullable = false)
	private AppUser lecturer;
	@Column(length = 1000)
	private String title;
	private String fundingSource;
	private Integer projectYear;
	private String scheme;
	private Integer members;
	@Enumerated(EnumType.STRING)
	private RecordStatus status;
	public Long getId() { return id; } public void setId(Long id) { this.id = id; }
	public AppUser getLecturer() { return lecturer; } public void setLecturer(AppUser lecturer) { this.lecturer = lecturer; }
	public String getTitle() { return title; } public void setTitle(String title) { this.title = title; }
	public String getFundingSource() { return fundingSource; } public void setFundingSource(String fundingSource) { this.fundingSource = fundingSource; }
	public Integer getProjectYear() { return projectYear; } public void setProjectYear(Integer projectYear) { this.projectYear = projectYear; }
	public String getScheme() { return scheme; } public void setScheme(String scheme) { this.scheme = scheme; }
	public Integer getMembers() { return members; } public void setMembers(Integer members) { this.members = members; }
	public RecordStatus getStatus() { return status; } public void setStatus(RecordStatus status) { this.status = status; }
}
