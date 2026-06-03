package com.research.dashboard.application.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.net.SocketTimeoutException;
import java.net.URI;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.ArrayDeque;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.HttpStatusException;
import org.jsoup.Connection;
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
	private static final String SINTA_BASE_URL = "https://sinta.kemdiktisaintek.go.id";
	private static final int MAX_ATTEMPTS = 3;
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

	public List<ArticleDto> fetchProfileGoogleScholarArticles(String username, String password) {
		return fetchProfileArticles(username, password, "/profile/google", "googlescholar");
	}

	public List<ArticleDto> fetchProfileScopusArticles(String username, String password) {
		return fetchProfileArticles(username, password, "/profile/scopus", "scopus");
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
					externalId(source, link, title, results.size()),
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
		return results.stream().distinct().toList();
	}

	private List<ArticleDto> fetchProfileArticles(String username, String password, String path, String source) {
		RuntimeException lastException = null;
		for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
			try {
				List<Document> documents;
				try {
					Map<String, String> cookies = login(username, password);
					documents = fetchProfileDocuments(path, cookies);
				} catch (RuntimeException exception) {
					documents = fetchProfileDocumentsWithPowerShell(username, password, path);
				}
				List<ArticleDto> articles = parseProfileDocuments(documents, source);
				validateCompleteProfileFetch(documents, articles);
				return articles;
			} catch (RuntimeException exception) {
				lastException = exception;
				sleepBeforeRetry(attempt);
			}
		}
		throw lastException;
	}

	private List<Document> fetchProfileDocuments(String path, Map<String, String> cookies) {
		List<Document> documents = new ArrayList<>();
		Document firstPage = fetchAuthenticated(SINTA_BASE_URL + path, cookies);
		documents.add(firstPage);
		int totalPages = parseTotalPages(firstPage);
		if (totalPages > 1) {
			for (int page = 2; page <= totalPages; page++) {
				documents.add(fetchAuthenticated(SINTA_BASE_URL + path + "?page=" + page, cookies));
			}
		} else {
			documents.addAll(fetchLinkedProfilePages(path, cookies));
		}
		return documents;
	}

	private List<ArticleDto> parseProfileDocuments(List<Document> documents, String source) {
		Map<String, ArticleDto> articlesByKey = new LinkedHashMap<>();
		for (Document document : documents) {
			addParsedArticles(document, source, articlesByKey);
		}
		return new ArrayList<>(articlesByKey.values());
	}

	private List<Document> fetchLinkedProfilePages(String path, Map<String, String> cookies) {
		List<Document> documents = new ArrayList<>();
		Queue<String> pending = new ArrayDeque<>();
		Set<String> visited = new LinkedHashSet<>();
		pending.add(SINTA_BASE_URL + path);

		while (!pending.isEmpty() && visited.size() < 100) {
			String url = pending.remove();
			String normalized = normalizeUrl(url);
			if (!visited.add(normalized)) {
				continue;
			}
			Document document = fetchAuthenticated(url, cookies);
			documents.add(document);
			for (Element link : document.select("a[href]")) {
				String href = link.absUrl("href");
				if (href.isBlank()) {
					continue;
				}
				String next = normalizeUrl(href);
				if (samePath(next, path) && !visited.contains(next)) {
					pending.add(next);
				}
			}
		}
		return documents;
	}

	private void addParsedArticles(Document document, String source, Map<String, ArticleDto> articlesByKey) {
		List<ArticleDto> parsed = "scopus".equals(source) ? parseScopusBlocks(document) : parseProfilePublicationBlocks(document, source);
		for (ArticleDto article : parsed) {
			articlesByKey.putIfAbsent(articleKey(article), article);
		}
	}

	private int parseTotalPages(Document document) {
		Matcher matcher = Pattern.compile("Page\\s+\\d+\\s+of\\s+(\\d+)", Pattern.CASE_INSENSITIVE).matcher(document.text());
		return matcher.find() ? Integer.parseInt(matcher.group(1)) : 1;
	}

	private void validateCompleteProfileFetch(List<Document> documents, List<ArticleDto> articles) {
		if (documents.isEmpty()) {
			throw new SourceFetchException("SINTA returned no profile pages.");
		}
		int expectedRecords = parseTotalRecords(documents.get(0));
		if (expectedRecords > 0 && articles.size() < expectedRecords) {
			throw new SourceFetchException("Incomplete SINTA fetch: parsed " + articles.size() + " of " + expectedRecords + " records.");
		}
	}

	private int parseTotalRecords(Document document) {
		Matcher matcher = Pattern.compile("Total\\s+Records?\\s*:?\\s*(\\d+)", Pattern.CASE_INSENSITIVE).matcher(document.text());
		return matcher.find() ? Integer.parseInt(matcher.group(1)) : 0;
	}

	private List<Document> fetchProfileDocumentsWithPowerShell(String username, String password, String path) {
		if (!System.getProperty("os.name", "").toLowerCase().contains("win")) {
			throw new SourceFetchException("SINTA Java connection failed and PowerShell fallback is only available on Windows.");
		}
		String script = """
				$ErrorActionPreference = 'Stop'
				$base = 'https://sinta.kemdiktisaintek.go.id'
				$path = $env:SINTA_PROFILE_PATH
				$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
				Invoke-WebRequest -Uri "$base/logins" -WebSession $session -UseBasicParsing | Out-Null
				Invoke-WebRequest -Uri "$base/logins/do_login" -Method Post -WebSession $session -Body @{ username = $env:SINTA_USERNAME; password = $env:SINTA_PASSWORD } -UseBasicParsing | Out-Null
				function Emit-Page($content) {
					[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content))
				}
				$first = Invoke-WebRequest -Uri "$base$path" -WebSession $session -UseBasicParsing
				Emit-Page $first.Content
				$totalPages = 1
				$match = [regex]::Match($first.Content, 'Page\\s+\\d+\\s+of\\s+(\\d+)', 'IgnoreCase')
				if ($match.Success) { $totalPages = [int]$match.Groups[1].Value }
				for ($page = 2; $page -le $totalPages; $page++) {
					$response = Invoke-WebRequest -Uri "$base$path`?page=$page" -WebSession $session -UseBasicParsing
					Emit-Page $response.Content
				}
				""";
		try {
			ProcessBuilder builder = new ProcessBuilder("powershell.exe", "-NoProfile", "-NonInteractive", "-Command", script);
			builder.environment().put("SINTA_USERNAME", username);
			builder.environment().put("SINTA_PASSWORD", password);
			builder.environment().put("SINTA_PROFILE_PATH", path);
			Process process = builder.start();
			String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
			String error = new String(process.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
			int exitCode = process.waitFor();
			if (exitCode != 0) {
				throw new SourceFetchException("PowerShell SINTA fetch failed: " + error.strip());
			}
			List<Document> documents = new ArrayList<>();
			for (String line : output.lines().map(String::trim).filter(line -> !line.isBlank()).toList()) {
				String html = new String(Base64.getDecoder().decode(line), StandardCharsets.UTF_8);
				documents.add(Jsoup.parse(html, SINTA_BASE_URL + path));
			}
			return documents;
		} catch (IOException exception) {
			throw new SourceFetchException("Unable to run PowerShell SINTA fallback.", exception);
		} catch (InterruptedException exception) {
			Thread.currentThread().interrupt();
			throw new SourceFetchException("PowerShell SINTA fallback was interrupted.", exception);
		}
	}

	private List<ArticleDto> parseProfilePublicationBlocks(Document document, String source) {
		List<ArticleDto> results = new ArrayList<>();
		for (Element item : document.select(".ar-list-item")) {
			Element titleLink = item.selectFirst(".ar-title a, a[href]");
			String title = text(titleLink);
			Integer year = parseYear(text(item.selectFirst(".ar-year")));
			if (title == null || title.length() < 3) {
				continue;
			}
			String link = titleLink == null ? null : titleLink.absUrl("href");
			String orderText = item.select(".ar-meta a, .ar-meta span").stream().map(Element::text)
					.filter(value -> value.startsWith("Author Order :")).findFirst().orElse(null);
			String creatorText = item.select(".ar-meta a, .ar-meta span").stream().map(Element::text)
					.filter(value -> value.startsWith("Creator :")).findFirst().orElse(null);
			String citedText = text(item.selectFirst(".ar-cited"));
			results.add(new ArticleDto(
					externalId(source, link, title, results.size()),
					title,
					text(item.selectFirst(".ar-pub")),
					year,
					parseInteger(citedText == null ? null : citedText.replace(" cited", "")),
					parseAuthorOrder(orderText),
					creatorText == null ? null : creatorText.replace("Creator :", "").trim(),
					parseQuartile(text(item.selectFirst(".ar-quartile"))),
					source,
					link));
		}
		if (!results.isEmpty()) {
			return results;
		}
		results = parseProfileTableRows(document, source);
		return results.isEmpty() ? parsePublicationBlocks(document, source) : results;
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
			String link = titleLink.absUrl("href");
			results.add(new ArticleDto(
					externalId("scopus", link, title, results.size()),
					title,
					text(item.selectFirst(".ar-pub")),
					parseYear(text(item.selectFirst(".ar-year"))),
					parseInteger(citedText == null ? null : citedText.replace(" cited", "")),
					parseAuthorOrder(orderText),
					creatorText == null ? null : creatorText.replace("Creator :", "").trim(),
					parseQuartile(quartileText),
					"scopus",
					link));
		}
		return results.isEmpty() ? parseProfileTableRows(document, "scopus") : results;
	}

	private List<ArticleDto> parseProfileTableRows(Document document, String source) {
		List<ArticleDto> results = new ArrayList<>();
		for (Element row : document.select("table tr")) {
			Element titleLink = "scopus".equals(source)
					? row.selectFirst("a[href*=scopus.com/record/display.uri]")
					: row.selectFirst("td a[href]:not([href*=sourceid])");
			if (titleLink == null) {
				continue;
			}
			String title = titleLink.text().trim();
			if (title.length() < 3) {
				continue;
			}
			String rowText = row.text();
			String link = titleLink.absUrl("href");
			Element journalLink = row.selectFirst("a[href*=sourceid]");
			String creator = extractLabeledValue(rowText, "Creator");
			Integer year = parseYear(rowText);
			Integer citations = parseCitationCount(rowText);
			results.add(new ArticleDto(
					profileRowExternalId(source, link, title, document.location(), results.size()),
					title,
					journalLink == null ? null : journalLink.text(),
					year,
					citations,
					parseAuthorOrder(rowText),
					creator,
					parseQuartile(rowText),
					source,
					link));
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

	private Integer parseCitationCount(String value) {
		if (value == null) {
			return null;
		}
		Matcher matcher = Pattern.compile("(\\d+)\\s+cited", Pattern.CASE_INSENSITIVE).matcher(value);
		return matcher.find() ? Integer.valueOf(matcher.group(1)) : 0;
	}

	private Integer parseAuthorOrder(String value) {
		if (value == null) {
			return null;
		}
		Matcher matcher = Pattern.compile("Author Order\\s*:\\s*(\\d+)").matcher(value);
		return matcher.find() ? Integer.valueOf(matcher.group(1)) : null;
	}

	private String extractLabeledValue(String text, String label) {
		if (text == null) {
			return null;
		}
		Matcher matcher = Pattern.compile(Pattern.quote(label) + "\\s*:\\s*(.*?)(?:\\s{2,}|\\s+Journal\\b|\\s+Conference\\b|\\s+publish\\b|$)", Pattern.CASE_INSENSITIVE).matcher(text);
		return matcher.find() ? matcher.group(1).trim() : null;
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

	private Document fetchAuthenticated(String url, Map<String, String> cookies) {
		RuntimeException lastException = null;
		for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
			try {
				return fetchAuthenticatedOnce(url, cookies);
			} catch (RuntimeException exception) {
				lastException = exception;
				sleepBeforeRetry(attempt);
			}
		}
		throw lastException;
	}

	private Document fetchAuthenticatedOnce(String url, Map<String, String> cookies) {
		try {
			Connection.Response response = Jsoup.connect(url)
					.userAgent(properties.getHttpUserAgent())
					.timeout(30_000)
					.cookies(cookies)
					.followRedirects(true)
					.execute();
			cookies.putAll(response.cookies());
			Document document = response.parse();
			if (isLoginPage(document)) {
				throw new SourceFetchException("SINTA session is not authenticated.");
			}
			return document;
		} catch (HttpStatusException exception) {
			throw new SourceFetchException("SINTA returned HTTP " + exception.getStatusCode() + ".", exception);
		} catch (SocketTimeoutException exception) {
			throw new SourceFetchException("SINTA request timed out after 30 seconds.", exception);
		} catch (IOException exception) {
			throw new SourceFetchException("Unable to fetch SINTA page: " + exception.getClass().getSimpleName() + ".", exception);
		}
	}

	private Map<String, String> login(String username, String password) {
		if (isBlank(username) || isBlank(password)) {
			throw new SourceFetchException("SINTA username and password are required.");
		}
		RuntimeException lastException = null;
		for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
			try {
				return loginOnce(username, password);
			} catch (RuntimeException exception) {
				lastException = exception;
				sleepBeforeRetry(attempt);
			}
		}
		throw lastException;
	}

	private Map<String, String> loginOnce(String username, String password) {
		try {
			Connection.Response loginPage = Jsoup.connect(SINTA_BASE_URL + "/logins")
					.userAgent(properties.getHttpUserAgent())
					.timeout(30_000)
					.followRedirects(true)
					.execute();
			Map<String, String> cookies = new HashMap<>(loginPage.cookies());
			Document loginDocument = loginPage.parse();
			Element form = loginDocument.selectFirst("form");
			String action = form == null ? SINTA_BASE_URL + "/logins/do_login" : form.absUrl("action");

			Connection request = Jsoup.connect(action.isBlank() ? SINTA_BASE_URL + "/logins/do_login" : action)
					.userAgent(properties.getHttpUserAgent())
					.timeout(30_000)
					.cookies(cookies)
					.followRedirects(true)
					.method(Connection.Method.POST)
					.data("username", username)
					.data("password", password);
			if (form != null) {
				for (Element input : form.select("input[name]")) {
					String name = input.attr("name");
					if ("username".equals(name) || "password".equals(name)) {
						continue;
					}
					request.data(name, input.attr("value"));
				}
			}
			Connection.Response response = request.execute();
			cookies.putAll(response.cookies());
			Document document = response.parse();
			if (isLoginPage(document)) {
				throw new SourceFetchException("SINTA login failed. Check the stored SINTA credentials.");
			}
			return cookies;
		} catch (HttpStatusException exception) {
			throw new SourceFetchException("SINTA login returned HTTP " + exception.getStatusCode() + ".", exception);
		} catch (SocketTimeoutException exception) {
			throw new SourceFetchException("SINTA login timed out after 30 seconds.", exception);
		} catch (IOException exception) {
			throw new SourceFetchException("Unable to login to SINTA: " + exception.getClass().getSimpleName() + ".", exception);
		}
	}

	private void sleepBeforeRetry(int attempt) {
		if (attempt >= MAX_ATTEMPTS) {
			return;
		}
		try {
			Thread.sleep(1000L * attempt);
		} catch (InterruptedException exception) {
			Thread.currentThread().interrupt();
		}
	}

	private boolean isLoginPage(Document document) {
		return document.location().contains("/logins") || document.selectFirst("form[action*=do_login]") != null;
	}

	private String externalId(String source, String link, String title, int index) {
		if ("scopus".equals(source)) {
			String eid = queryValue(link, "eid");
			if (eid != null && !eid.isBlank()) {
				return eid;
			}
		}
		String base = !isBlank(link) ? link : title;
		return isBlank(base) ? source + "-" + index : source + "-" + Integer.toHexString(base.hashCode());
	}

	private String profileRowExternalId(String source, String link, String title, String pageUrl, int rowIndex) {
		String base = String.join("|",
				source,
				link == null ? "" : link,
				title == null ? "" : title,
				pageUrl == null ? "" : normalizeUrl(pageUrl),
				String.valueOf(rowIndex));
		return source + "-sinta-" + Integer.toHexString(base.hashCode());
	}

	private String articleKey(ArticleDto article) {
		if (!isBlank(article.id())) {
			return article.source() + ":" + article.id();
		}
		return article.source() + ":" + article.title() + ":" + article.year();
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

	private String normalizeUrl(String url) {
		int fragmentIndex = url.indexOf('#');
		return fragmentIndex < 0 ? url : url.substring(0, fragmentIndex);
	}

	private boolean samePath(String url, String path) {
		try {
			String candidatePath = URI.create(url).getPath();
			return candidatePath != null && (path.equals(candidatePath) || candidatePath.startsWith(path + "/"));
		} catch (IllegalArgumentException exception) {
			return false;
		}
	}

	private boolean isBlank(String value) {
		return value == null || value.isBlank();
	}
}
