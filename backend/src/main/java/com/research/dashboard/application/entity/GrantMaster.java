package com.research.dashboard.application.entity;

import com.research.dashboard.application.model.RecordStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "grants")
public class GrantMaster {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String type;
	private String name;
	private String provider;
	@Enumerated(EnumType.STRING)
	private RecordStatus status;
	public Long getId() { return id; } public void setId(Long id) { this.id = id; }
	public String getType() { return type; } public void setType(String type) { this.type = type; }
	public String getName() { return name; } public void setName(String name) { this.name = name; }
	public String getProvider() { return provider; } public void setProvider(String provider) { this.provider = provider; }
	public RecordStatus getStatus() { return status; } public void setStatus(RecordStatus status) { this.status = status; }
}
