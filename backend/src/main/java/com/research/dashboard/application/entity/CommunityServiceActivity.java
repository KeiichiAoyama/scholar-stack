package com.research.dashboard.application.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "community_services")
public class CommunityServiceActivity {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "lecturer_id", nullable = false)
	private AppUser lecturer;
	@Column(length = 1000)
	private String title;
	private String location;
	private Integer activityYear;
	private String program;
	private String community;
	public Long getId() { return id; } public void setId(Long id) { this.id = id; }
	public AppUser getLecturer() { return lecturer; } public void setLecturer(AppUser lecturer) { this.lecturer = lecturer; }
	public String getTitle() { return title; } public void setTitle(String title) { this.title = title; }
	public String getLocation() { return location; } public void setLocation(String location) { this.location = location; }
	public Integer getActivityYear() { return activityYear; } public void setActivityYear(Integer activityYear) { this.activityYear = activityYear; }
	public String getProgram() { return program; } public void setProgram(String program) { this.program = program; }
	public String getCommunity() { return community; } public void setCommunity(String community) { this.community = community; }
}
