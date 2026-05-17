CREATE DATABASE IF NOT EXISTS scholarstack
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE scholarstack;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  nidn VARCHAR(255),
  role ENUM('LECTURER', 'ADMIN') NOT NULL,
  status ENUM('ACTIVE', 'INACTIVE', 'COMPLETED') NOT NULL,
  affiliation VARCHAR(255),
  department_unit VARCHAR(255),
  phone VARCHAR(255),
  academic_grade VARCHAR(255),
  sinta_id VARCHAR(255),
  sinta_username VARCHAR(255),
  sinta_password VARCHAR(255),
  scopus_id VARCHAR(255),
  scopus_api_key VARCHAR(255),
  scopus_inst_token VARCHAR(255),
  google_scholar_id VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS lecturer_profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL UNIQUE,
  nik VARCHAR(255),
  gender VARCHAR(255),
  place_of_birth VARCHAR(255),
  date_of_birth VARCHAR(255),
  religion VARCHAR(255),
  employment_type VARCHAR(255),
  employee_status VARCHAR(255),
  pangkat VARCHAR(255),
  golongan VARCHAR(255),
  jabatan_fungsional VARCHAR(255),
  prodi VARCHAR(255),
  sinta_score_overall INT NOT NULL DEFAULT 0,
  sinta_score3yr INT NOT NULL DEFAULT 0,
  affil_score INT NOT NULL DEFAULT 0,
  affil_score3yr INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_lecturer_profiles_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS articles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  lecturer_id BIGINT NOT NULL,
  external_id VARCHAR(255),
  quartile VARCHAR(255),
  title VARCHAR(1000),
  journal_name VARCHAR(255),
  publication_year INT,
  citations INT,
  author_order INT,
  creator_name VARCHAR(255),
  source VARCHAR(255),
  link VARCHAR(1000),
  CONSTRAINT fk_articles_lecturer FOREIGN KEY (lecturer_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS research_projects (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  lecturer_id BIGINT NOT NULL,
  title VARCHAR(1000),
  funding_source VARCHAR(255),
  project_year INT,
  scheme VARCHAR(255),
  members INT,
  status ENUM('ACTIVE', 'INACTIVE', 'COMPLETED'),
  CONSTRAINT fk_research_projects_lecturer FOREIGN KEY (lecturer_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS community_services (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  lecturer_id BIGINT NOT NULL,
  title VARCHAR(1000),
  location VARCHAR(255),
  activity_year INT,
  program VARCHAR(255),
  community VARCHAR(255),
  CONSTRAINT fk_community_services_lecturer FOREIGN KEY (lecturer_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS grants (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(255),
  name VARCHAR(255),
  provider VARCHAR(255),
  status ENUM('ACTIVE', 'INACTIVE', 'COMPLETED')
);

CREATE TABLE IF NOT EXISTS publication_documents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  article_id BIGINT NOT NULL UNIQUE,
  label VARCHAR(255),
  grant_name VARCHAR(255),
  file_name VARCHAR(255),
  file_path VARCHAR(255),
  CONSTRAINT fk_publication_documents_article FOREIGN KEY (article_id) REFERENCES articles(id)
);

CREATE TABLE IF NOT EXISTS article_relations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  article_id BIGINT NOT NULL,
  related_type VARCHAR(255),
  related_id BIGINT,
  CONSTRAINT fk_article_relations_article FOREIGN KEY (article_id) REFERENCES articles(id)
);
