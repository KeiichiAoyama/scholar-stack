package com.research.dashboard.application.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.research.dashboard.application.config.ResearchDashboardProperties;
import com.research.dashboard.application.dto.ArticleDto;

@Service
public class ScopusClient {

	private final ResearchDashboardProperties properties;
	private final WebClient webClient;

	public ScopusClient(ResearchDashboardProperties properties, WebClient.Builder webClientBuilder) {
		this.properties = properties;
		this.webClient = webClientBuilder.baseUrl("https://api.elsevier.com").build();
	}

	public List<ArticleDto> fetchArticles(String authorId, String apiKey, String instToken) {
		ensureConfigured(apiKey);

		Map<?, ?> response = webClient.get()
				.uri(uriBuilder -> uriBuilder
						.path("/content/search/scopus")
						.queryParam("query", "AU-ID(" + authorId + ")")
						.queryParam("field", "dc:identifier,dc:title,prism:publicationName,prism:coverDate,citedby-count,author")
						.queryParam("count", "25")
						.queryParam("sort", "coverDate")
						.build())
				.header("X-ELS-APIKey", apiKey)
				.headers(headers -> applyInstToken(headers, instToken))
				.header(HttpHeaders.ACCEPT, "application/json")
				.retrieve()
				.bodyToMono(Map.class)
				.block();

		if (response == null) {
			return List.of();
		}

		Map<?, ?> searchResults = asMap(response.get("search-results"));
		List<?> entries = asList(searchResults.get("entry"));
		List<ArticleDto> articles = new ArrayList<>();
		for (Object rawEntry : entries) {
			Map<?, ?> entry = asMap(rawEntry);
			String identifier = asString(entry.get("dc:identifier"));
			String coverDate = asString(entry.get("prism:coverDate"));
			articles.add(new ArticleDto(
					identifier,
					asString(entry.get("dc:title")),
					asString(entry.get("prism:publicationName")),
					parseYear(coverDate),
					parseInteger(entry.get("citedby-count")),
					null,
					null,
					"none",
					"scopus",
					identifier == null ? null : "https://www.scopus.com/record/display.uri?eid=" + identifier.replace("SCOPUS_ID:", "")));
		}
		return articles;
	}

	private void ensureConfigured(String apiKey) {
		if (apiKey == null || apiKey.isBlank()) {
			throw new SourceFetchException("Scopus API key is not configured.");
		}
	}

	private void applyInstToken(HttpHeaders headers, String instToken) {
		if (instToken != null && !instToken.isBlank()) {
			headers.add("X-ELS-Insttoken", instToken);
		}
	}

	private Map<?, ?> asMap(Object value) {
		return value instanceof Map<?, ?> map ? map : Map.of();
	}

	private List<?> asList(Object value) {
		return value instanceof List<?> list ? list : List.of();
	}

	private String asString(Object value) {
		return value == null ? null : value.toString();
	}

	private Integer parseYear(String date) {
		return date != null && date.length() >= 4 ? parseInteger(date.substring(0, 4)) : null;
	}

	private Integer parseInteger(Object value) {
		try {
			return value == null ? null : Integer.valueOf(value.toString());
		} catch (NumberFormatException ignored) {
			return null;
		}
	}
}
