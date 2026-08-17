CREATE DATABASE IF NOT EXISTS personal_portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE personal_portfolio;

CREATE TABLE IF NOT EXISTS admin_users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY admin_users_email_unique (email)
);

CREATE TABLE IF NOT EXISTS site_content (
  id TINYINT UNSIGNED NOT NULL,
  content JSON NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT site_content_single_row CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS inquiries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  project_type VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'reviewed', 'responded', 'archived') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY inquiries_status_created_at (status, created_at)
);

CREATE TABLE IF NOT EXISTS media_assets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  size_bytes INT UNSIGNED NOT NULL,
  url_path VARCHAR(512) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY media_assets_filename_unique (filename),
  KEY media_assets_created_at (created_at)
);