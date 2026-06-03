package com.research.dashboard.application.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "research-dashboard")
public class ResearchDashboardProperties {

	private final Scopus scopus = new Scopus();
	private String httpUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

	public Scopus getScopus() {
		return scopus;
	}

	public String getHttpUserAgent() {
		return httpUserAgent;
	}

	public void setHttpUserAgent(String httpUserAgent) {
		this.httpUserAgent = httpUserAgent;
	}

	public static class Scopus {
		private String apiKey = "";
		private String instToken = "";

		public String getApiKey() {
			return apiKey;
		}

		public void setApiKey(String apiKey) {
			this.apiKey = apiKey;
		}

		public String getInstToken() {
			return instToken;
		}

		public void setInstToken(String instToken) {
			this.instToken = instToken;
		}
	}
}
