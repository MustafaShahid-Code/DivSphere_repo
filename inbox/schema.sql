-- ─────────────────────────────────────────────────────────────
-- DivSphere inquiry inbox — database schema
-- ─────────────────────────────────────────────────────────────
-- Run this ONCE against the MySQL database you create in Hostinger's
-- hPanel (Databases → Management → phpMyAdmin, or the "Import" tab —
-- paste this file's contents and run it). After that, contact-handler.php
-- and the /admin/inbox/ page read and write these two tables.

CREATE TABLE IF NOT EXISTS inquiries (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(255)  NOT NULL,
  email        VARCHAR(255)  NOT NULL,
  company      VARCHAR(255)  NULL,
  service      VARCHAR(255)  NULL,
  message      TEXT          NOT NULL,
  submitted_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_read      TINYINT(1)    NOT NULL DEFAULT 0,
  read_at      DATETIME      NULL,
  INDEX idx_submitted_at (submitted_at),
  INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inquiry_replies (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  inquiry_id  INT UNSIGNED NOT NULL,
  reply_body  TEXT         NOT NULL,
  sent_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_ok     TINYINT(1)   NOT NULL DEFAULT 1,
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE,
  INDEX idx_inquiry_id (inquiry_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
