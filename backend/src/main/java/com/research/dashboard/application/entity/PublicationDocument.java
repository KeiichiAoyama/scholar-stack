package com.research.dashboard.application.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "publication_documents")
public class PublicationDocument {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "article_id", nullable = false, unique = true)
	private Article article;
	private String label;
	private String grantName;
	private String fileName;
	private String filePath;
	public Long getId() { return id; } public void setId(Long id) { this.id = id; }
	public Article getArticle() { return article; } public void setArticle(Article article) { this.article = article; }
	public String getLabel() { return label; } public void setLabel(String label) { this.label = label; }
	public String getGrantName() { return grantName; } public void setGrantName(String grantName) { this.grantName = grantName; }
	public String getFileName() { return fileName; } public void setFileName(String fileName) { this.fileName = fileName; }
	public String getFilePath() { return filePath; } public void setFilePath(String filePath) { this.filePath = filePath; }
}
