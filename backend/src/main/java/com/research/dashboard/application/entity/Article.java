package com.research.dashboard.application.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "articles")
public class Article {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "lecturer_id", nullable = false)
	private AppUser lecturer;
	private String externalId;
	private String quartile;
	@Column(length = 1000)
	private String title;
	private String journalName;
	private Integer publicationYear;
	private Integer citations;
	private Integer authorOrder;
	private String creatorName;
	private String source;
	@Column(length = 1000)
	private String link;
	public Long getId() { return id; } public void setId(Long id) { this.id = id; }
	public AppUser getLecturer() { return lecturer; } public void setLecturer(AppUser lecturer) { this.lecturer = lecturer; }
	public String getExternalId() { return externalId; } public void setExternalId(String externalId) { this.externalId = externalId; }
	public String getQuartile() { return quartile; } public void setQuartile(String quartile) { this.quartile = quartile; }
	public String getTitle() { return title; } public void setTitle(String title) { this.title = title; }
	public String getJournalName() { return journalName; } public void setJournalName(String journalName) { this.journalName = journalName; }
	public Integer getPublicationYear() { return publicationYear; } public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }
	public Integer getCitations() { return citations; } public void setCitations(Integer citations) { this.citations = citations; }
	public Integer getAuthorOrder() { return authorOrder; } public void setAuthorOrder(Integer authorOrder) { this.authorOrder = authorOrder; }
	public String getCreatorName() { return creatorName; } public void setCreatorName(String creatorName) { this.creatorName = creatorName; }
	public String getSource() { return source; } public void setSource(String source) { this.source = source; }
	public String getLink() { return link; } public void setLink(String link) { this.link = link; }
}
