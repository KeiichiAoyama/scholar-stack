package com.research.dashboard.application.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "article_relations")
public class ArticleRelation {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "article_id", nullable = false)
	private Article article;
	private String relatedType;
	private Long relatedId;
	public Long getId() { return id; } public void setId(Long id) { this.id = id; }
	public Article getArticle() { return article; } public void setArticle(Article article) { this.article = article; }
	public String getRelatedType() { return relatedType; } public void setRelatedType(String relatedType) { this.relatedType = relatedType; }
	public Long getRelatedId() { return relatedId; } public void setRelatedId(Long relatedId) { this.relatedId = relatedId; }
}
