package com.research.dashboard.application.config;

import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.research.dashboard.application.entity.*;
import com.research.dashboard.application.model.RecordStatus;
import com.research.dashboard.application.model.UserRole;
import com.research.dashboard.application.repository.*;

@Configuration
public class DataInitializer {
	@Bean
	CommandLineRunner seedData(AppUserRepository users, LecturerProfileRepository profiles, ArticleRepository articles,
			ResearchProjectRepository researches, CommunityServiceRepository services, GrantMasterRepository grants,
			PasswordEncoder passwordEncoder) {
		return args -> {
			AppUser erick = users.findByUsername("dosen01").orElseGet(() -> users.save(user("dosen01", "Dr. Erick Fernando, S.Kom, M.S.I", "erick.fernando@umn.ac.id", "1029118501",
					UserRole.LECTURER, "Universitas Multimedia Nusantara Jakarta", "Sistem Informasi", "085266296098",
					"Lektor Kepala", "207171", "erick.fernando@umn.ac.id", "qwertyuiop", "57189355900",
					"2d632386bb36e291d4ee4ba6b58cf1bc", null, "JKrLSEYAAAAJ", passwordEncoder)));
			users.findByUsername("dosen02").orElseGet(() -> users.save(user("dosen02", "Ririn Ikana Desanti", "ririn.desanti@umn.ac.id", null, UserRole.LECTURER,
					"Universitas Multimedia Nusantara Jakarta", "Sistem Informasi", null, "Lektor", null, null, null, "56204424000", null, null, null, passwordEncoder)));
			users.findByUsername("admin01").orElseGet(() -> users.save(user("admin01", "Admin UMN", "admin@umn.ac.id", "ADM-UMN-001", UserRole.ADMIN,
					"Universitas Multimedia Nusantara", "Research and Community Service", "021-5422-0808",
					"Institution Administrator", null, null, null, null, null, null, null, passwordEncoder)));

			if (profiles.count() == 0) {
				LecturerProfile profile = new LecturerProfile();
				profile.setUser(erick); profile.setNik("1571022911850061"); profile.setGender("Male"); profile.setPlaceOfBirth("JAMBI");
				profile.setDateOfBirth("1985-11-29"); profile.setReligion("Budha"); profile.setEmploymentType("Dosen Tetap");
				profile.setEmployeeStatus("NON ASN"); profile.setPangkat("Pembina"); profile.setGolongan("IV/a");
				profile.setJabatanFungsional("Lektor Kepala"); profile.setProdi("57201 - S1 Sistem Informasi");
				profile.setSintaScoreOverall(4083); profile.setSintaScore3yr(880); profile.setAffilScore(4083); profile.setAffilScore3yr(880);
				profiles.save(profile);
			}

			if (articles.count() == 0) articles.saveAll(List.of(
					article(erick, "Investigation blockchain technology in the public health sector: A bibliometric analysis", "Multidisciplinary Reviews", 2026, 0, 1, "Fernando E.", "Q4", "scopus"),
					article(erick, "Real-time Fall Detection Prototyping with YOLOv11 Using an Integrated Multi-dataset Framework", "International Journal of Intelligent Engineering and Systems", 2026, 0, 2, "Kurniadi D.", "Q2", "scopus"),
					article(erick, "Systematic Literature Review: Blockchain in Healthcare Data Management", "Health Informatics Journal", 2023, 12, 1, "Fernando E.", "Q3", "googlescholar"),
					article(erick, "Framework Evaluasi Kematangan Digital Organisasi Publik di Indonesia", "Jurnal Sistem Informasi Bisnis", 2021, 8, 1, "Fernando E.", "none", "googlescholar")));

			if (researches.count() == 0) researches.saveAll(List.of(
					research(erick, "Pengembangan Model Arsitektur Blockchain untuk Sistem Informasi Kesehatan Nasional", "Kemendikbud-Ristek", 2024, "Penelitian Dasar", 4, RecordStatus.ACTIVE),
					research(erick, "Implementasi Federated Learning pada Data Rekam Medis Tersebar", "LPDP", 2024, "Penelitian Terapan", 3, RecordStatus.ACTIVE)));
			if (services.count() == 0) services.saveAll(List.of(
					service(erick, "Pelatihan Literasi Digital dan Keamanan Data untuk UMKM Tangerang", "Tangerang, Banten", 2024, "Pengabdian Masyarakat Reguler", "Pelaku UMKM Kota Tangerang"),
					service(erick, "Workshop Transformasi Digital untuk Aparatur Desa", "Kabupaten Tangerang, Banten", 2024, "KKN Tematik", "Aparatur Desa Kecamatan Panongan")));
			if (grants.count() == 0) grants.saveAll(List.of(
					grant("nasional", "BIMA Penelitian Fundamental", "Kemendikbud-Ristek", RecordStatus.ACTIVE),
					grant("nasional", "BIMA Penelitian Terapan", "Kemendikbud-Ristek", RecordStatus.ACTIVE),
					grant("internasional", "Erasmus+", "European Union", RecordStatus.ACTIVE)));
		};
	}
	private AppUser user(String username, String name, String email, String nidn, UserRole role, String affiliation, String department,
			String phone, String grade, String sinta, String sintaUsername, String sintaPassword, String scopus, String scopusApiKey,
			String scopusInstToken, String scholar, PasswordEncoder encoder) {
		AppUser user = new AppUser(); user.setUsername(username); user.setPassword(encoder.encode("password")); user.setName(name); user.setEmail(email);
		user.setNidn(nidn); user.setRole(role); user.setStatus(RecordStatus.ACTIVE); user.setAffiliation(affiliation); user.setDepartmentUnit(department);
		user.setPhone(phone); user.setAcademicGrade(grade); user.setSintaId(sinta); user.setSintaUsername(sintaUsername);
		user.setSintaPassword(sintaPassword); user.setScopusId(scopus); user.setScopusApiKey(scopusApiKey);
		user.setScopusInstToken(scopusInstToken); user.setGoogleScholarId(scholar); return user;
	}
	private Article article(AppUser lecturer, String title, String journal, int year, int citations, int order, String creator, String quartile, String source) {
		Article article = new Article(); article.setLecturer(lecturer); article.setTitle(title); article.setJournalName(journal); article.setPublicationYear(year);
		article.setCitations(citations); article.setAuthorOrder(order); article.setCreatorName(creator); article.setQuartile(quartile); article.setSource(source); article.setLink("#"); return article;
	}
	private ResearchProject research(AppUser lecturer, String title, String funding, int year, String scheme, int members, RecordStatus status) {
		ResearchProject item = new ResearchProject(); item.setLecturer(lecturer); item.setTitle(title); item.setFundingSource(funding); item.setProjectYear(year);
		item.setScheme(scheme); item.setMembers(members); item.setStatus(status); return item;
	}
	private CommunityServiceActivity service(AppUser lecturer, String title, String location, int year, String program, String community) {
		CommunityServiceActivity item = new CommunityServiceActivity(); item.setLecturer(lecturer); item.setTitle(title); item.setLocation(location); item.setActivityYear(year);
		item.setProgram(program); item.setCommunity(community); return item;
	}
	private GrantMaster grant(String type, String name, String provider, RecordStatus status) {
		GrantMaster grant = new GrantMaster(); grant.setType(type); grant.setName(name); grant.setProvider(provider); grant.setStatus(status); return grant;
	}
}
