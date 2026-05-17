package com.research.dashboard.application.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import com.research.dashboard.application.config.ResearchDashboardProperties;
import com.research.dashboard.application.dto.ArticleDto;

@Service
public class GoogleScholarClient {

	private final ResearchDashboardProperties properties;

	public GoogleScholarClient(ResearchDashboardProperties properties) {
		this.properties = properties;
	}

	public List<ArticleDto> fetchArticles(String scholarId) {
		Document document = fetch("https://scholar.google.co.id/citations?user=" + scholarId + "&hl=en");
		List<ArticleDto> articles = new ArrayList<>();
		for (Element row : document.select("tr.gsc_a_tr")) {
			Element title = row.selectFirst("a.gsc_a_at");
			List<Element> metadataLines = row.select(".gs_gray");
			Element authors = metadataLines.isEmpty() ? null : metadataLines.get(0);
			Element venue = metadataLines.size() < 2 ? null : metadataLines.get(1);
			Element citations = row.selectFirst(".gsc_a_ac");
			Element year = row.selectFirst(".gsc_a_y span");
			if (title == null) {
				continue;
			}
			articles.add(new ArticleDto(
					"googlescholar-" + articles.size(),
					title.text(),
					venue == null ? null : venue.text(),
					parseInteger(year == null ? null : year.text()),
					parseInteger(citations == null ? null : citations.text()),
					null,
					firstAuthor(authors == null ? null : authors.text()),
					"none",
					"googlescholar",
					title.absUrl("href")));
		}
		return articles;
	}

	private Document fetch(String url) {
		try {
			return Jsoup.connect(url)
					.userAgent(properties.getHttpUserAgent())
					.timeout(15_000)
					.get();
		} catch (IOException exception) {
			throw new SourceFetchException("Unable to fetch Google Scholar page.", exception);
		}
	}

	private Integer parseInteger(String value) {
		try {
			return value == null || value.isBlank() ? null : Integer.valueOf(value);
		} catch (NumberFormatException ignored) {
			return null;
		}
	}

	private String firstAuthor(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		String normalized = value.replaceFirst("^Authors?\\s*:\\s*", "").trim();
		int separator = normalized.indexOf(',');
		return separator < 0 ? normalized : normalized.substring(0, separator).trim();
	}
}
