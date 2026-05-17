package com.research.dashboard.application.service;

import java.io.IOException;
import java.net.SocketTimeoutException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.HttpStatusException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import com.research.dashboard.application.config.ResearchDashboardProperties;
import com.research.dashboard.application.dto.ArticleDto;
import com.research.dashboard.application.dto.LecturerProfileDto;
import com.research.dashboard.application.dto.MetricsDto;
import com.research.dashboard.application.dto.SintaCommunityServiceDto;
import com.research.dashboard.application.dto.SintaResearchDto;

@Service
public class SintaClient {

	private static final Pattern YEAR_PATTERN = Pattern.compile("\\b(20\\d{2}|19\\d{2})\\b");
	private static final Pattern CITATION_PATTERN = Pattern.compile("(\\d+)\\s+cited", Pattern.CASE_INSENSITIVE);
	private final ResearchDashboardProperties properties;

	public SintaClient(ResearchDashboardProperties properties) {
		this.properties = properties;
	}

	public LecturerProfileDto fetchProfile(Long lecturerId, String email, String sintaId, String scopusId, String googleScholarId) {
		Document document = fetch("https://sinta.kemdiktisaintek.go.id/authors/profile/" + sintaId);
		String title = text(document.selectFirst("h3, h2"));
		List<String> labels = document.select("body").textNodes().stream().map(node -> node.text().trim()).filter(text -> !text.isBlank()).toList();
		String body = document.body().text();
		String affiliation = body.contains("Universitas Multimedia Nusantara Jakarta")
				? "Universitas Multimedia Nusantara Jakarta"
				: null;
		String department = body.contains("S1 - Sistem Informasi") ? "S1 - Sistem Informasi" : null;
		return new LecturerProfileDto(lecturerId, title, email, affiliation, department, sintaId, scopusId, googleScholarId);
	}

	public MetricsDto fetchMetrics(String sintaId) {
		Document document = fetch("https://sinta.kemdiktisaintek.go.id/authors/profile/" + sintaId);
		String body = document.body().text();
		return new MetricsDto(
				extractMetric(body, "SINTA Score Overall"),
				extractMetric(body, "SINTA Score 3Yr"),
				extractMetric(body, "Affil Score"),
				extractMetric(body, "Affil Score 3Yr"));
	}

	public List<ArticleDto> fetchGoogleScholarArticles(String sintaId) {
		Document document = fetch("https://sinta.kemdiktisaintek.go.id/authors/profile/" + sintaId + "/?view=googlescholar");
		return parsePublicationBlocks(document, "googlescholar");
	}

	public List<ArticleDto> fetchScopusArticles(String sintaId) {
		Document document = fetch("https://sinta.kemdiktisaintek.go.id/authors/profile/" + sintaId + "/?view=scopus");
		return parseScopusBlocks(document);
	}

	public List<SintaResearchDto> fetchResearches(String sintaId) {
		Document document = fetch("https://sinta.kemdiktisaintek.go.id/authors/profile/" + sintaId + "/?view=researches");
		return parseResearchBlocks(document);
	}

	public List<SintaCommunityServiceDto> fetchCommunityServices(String sintaId) {
		Document document = fetch("https://sinta.kemdiktisaintek.go.id/authors/profile/" + sintaId + "/?view=services");
		return parseCommunityBlocks(document);
	}

	private List<ArticleDto> parsePublicationBlocks(Document document, String source) {
		List<ArticleDto> results = new ArrayList<>();
		for (Element element : document.select("a")) {
			String title = element.text().trim();
			if (title.length() < 12 || element.parent() == null) {
				continue;
			}
			String containerText = element.parent().parent() == null ? element.parent().text() : element.parent().parent().text();
			Matcher yearMatcher = YEAR_PATTERN.matcher(containerText);
			if (!yearMatcher.find()) {
				continue;
			}
			Matcher citationMatcher = CITATION_PATTERN.matcher(containerText);
			Integer citations = citationMatcher.find() ? Integer.valueOf(citationMatcher.group(1)) : 0;
			String link = element.absUrl("href");
			results.add(new ArticleDto(
					externalId(source, link, results.size()),
					title,
					null,
					Integer.valueOf(yearMatcher.group(1)),
					citations,
					null,
					null,
					"none",
					source,
					link));
		}
		return results.stream().distinct().limit(25).toList();
	}

	private List<ArticleDto> parseScopusBlocks(Document document) {
		List<ArticleDto> results = new ArrayList<>();
		for (Element item : document.select(".ar-list-item")) {
			Element titleLink = item.selectFirst(".ar-title a");
			if (titleLink == null) {
				continue;
			}
			String title = titleLink.text().trim();
			String quartileText = text(item.selectFirst(".ar-quartile"));
			String orderText = item.select(".ar-meta a").stream().map(Element::text)
					.filter(value -> value.startsWith("Author Order :")).findFirst().orElse(null);
			String creatorText = item.select(".ar-meta a").stream().map(Element::text)
					.filter(value -> value.startsWith("Creator :")).findFirst().orElse(null);
			String citedText = text(item.selectFirst(".ar-cited"));
			results.add(new ArticleDto(
					externalId("scopus", titleLink.absUrl("href"), results.size()),
					title,
					text(item.selectFirst(".ar-pub")),
					parseYear(text(item.selectFirst(".ar-year"))),
					parseInteger(citedText == null ? null : citedText.replace(" cited", "")),
					parseAuthorOrder(orderText),
					creatorText == null ? null : creatorText.replace("Creator :", "").trim(),
					parseQuartile(quartileText),
					"scopus",
					titleLink.absUrl("href")));
		}
		return results;
	}

	private List<SintaResearchDto> parseResearchBlocks(Document document) {
		List<SintaResearchDto> results = new ArrayList<>();
		for (Element item : document.select(".ar-list-item")) {
			String title = text(item.selectFirst(".ar-title a"));
			String fundingText = text(item.selectFirst(".ar-pub"));
			Integer year = parseYear(text(item.selectFirst(".ar-year")));
			int members = item.select(".ar-meta a[href*=/authors/profile/]").size();
			if (title == null || year == null) {
				continue;
			}
			results.add(new SintaResearchDto(title, beforeParenthesis(fundingText), insideParenthesis(fundingText), year, members));
		}
		return results;
	}

	private List<SintaCommunityServiceDto> parseCommunityBlocks(Document document) {
		List<SintaCommunityServiceDto> results = new ArrayList<>();
		for (Element item : document.select(".ar-list-item")) {
			String title = text(item.selectFirst(".ar-title a"));
			String program = text(item.selectFirst(".ar-pub"));
			Integer year = parseYear(text(item.selectFirst(".ar-year")));
			if (title == null || year == null) {
				continue;
			}
			results.add(new SintaCommunityServiceDto(title, program, year, "SINTA"));
		}
		return results;
	}

	private Integer extractMetric(String body, String label) {
		Pattern pattern = Pattern.compile("([\\d.]+)\\s+" + Pattern.quote(label));
		Matcher matcher = pattern.matcher(body);
		if (!matcher.find()) {
			return null;
		}
		return Integer.valueOf(matcher.group(1).replace(".", ""));
	}

	private String text(Element element) {
		return element == null ? null : element.text();
	}

	private Integer parseYear(String text) {
		Matcher matcher = YEAR_PATTERN.matcher(text == null ? "" : text);
		return matcher.find() ? Integer.valueOf(matcher.group(1)) : null;
	}

	private Integer parseInteger(String value) {
		try {
			return value == null || value.isBlank() ? null : Integer.valueOf(value.replaceAll("[^0-9]", ""));
		} catch (NumberFormatException ignored) {
			return null;
		}
	}

	private Integer parseAuthorOrder(String value) {
		if (value == null) {
			return null;
		}
		Matcher matcher = Pattern.compile("Author Order\\s*:\\s*(\\d+)").matcher(value);
		return matcher.find() ? Integer.valueOf(matcher.group(1)) : null;
	}

	private String parseQuartile(String value) {
		if (value == null) {
			return "none";
		}
		Matcher matcher = Pattern.compile("\\b(Q[1-4])\\b", Pattern.CASE_INSENSITIVE).matcher(value);
		return matcher.find() ? matcher.group(1).toUpperCase() : "none";
	}

	private String beforeParenthesis(String text) {
		if (text == null) {
			return null;
		}
		int index = text.indexOf('(');
		return index < 0 ? text.trim() : text.substring(0, index).trim();
	}

	private String insideParenthesis(String text) {
		if (text == null) {
			return null;
		}
		int start = text.indexOf('(');
		int end = text.indexOf(')', start + 1);
		return start < 0 || end < 0 ? null : text.substring(start + 1, end).trim();
	}

	private Document fetch(String url) {
		try {
			return Jsoup.connect(url)
					.userAgent(properties.getHttpUserAgent())
					.timeout(30_000)
					.get();
		} catch (HttpStatusException exception) {
			throw new SourceFetchException("SINTA returned HTTP " + exception.getStatusCode() + ".", exception);
		} catch (SocketTimeoutException exception) {
			throw new SourceFetchException("SINTA request timed out after 30 seconds.", exception);
		} catch (IOException exception) {
			throw new SourceFetchException("Unable to fetch SINTA page: " + exception.getClass().getSimpleName() + ".", exception);
		}
	}

	private String externalId(String source, String link, int index) {
		if ("scopus".equals(source)) {
			String eid = queryValue(link, "eid");
			if (eid != null && !eid.isBlank()) {
				return eid;
			}
		}
		return source + "-" + index;
	}

	private String queryValue(String url, String key) {
		try {
			String query = URI.create(url).getQuery();
			if (query == null) {
				return null;
			}
			for (String pair : query.split("&")) {
				String[] parts = pair.split("=", 2);
				if (parts.length == 2 && key.equals(parts[0])) {
					return parts[1];
				}
			}
			return null;
		} catch (IllegalArgumentException exception) {
			return null;
		}
	}
}
