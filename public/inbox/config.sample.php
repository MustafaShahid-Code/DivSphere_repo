<?php
/**
 * config.sample.php — template for the inquiry inbox's server-side
 * configuration.
 *
 * HOW TO USE
 * ──────────
 *   1. Copy this file to `config.php` in this same folder.
 *   2. Fill in every value below.
 *   3. Upload `config.php` directly to the server — do NOT commit it
 *      to git. It holds real credentials (database password, SMTP
 *      password, admin login hash) and `config.php` is already listed
 *      in .gitignore so a normal `git add .` won't pick it up, but if
 *      you're uploading straight to Hostinger via FTP/File Manager
 *      instead of through git, that protection doesn't apply — just
 *      never paste this file's contents anywhere public.
 *
 * Everything in this file is read by the PHP scripts in this folder
 * (db.php, mail.php, auth.php, api.php) — it is never sent to the
 * browser.
 */

// ── Database ──────────────────────────────────────────────────
// Create this database in Hostinger's hPanel → Databases → MySQL
// Databases, then run schema.sql against it once (via phpMyAdmin's
// "Import" tab). Hostinger databases are almost always on "localhost"
// from the PHP script's point of view, even though phpMyAdmin shows a
// different-looking hostname in its own URL.
define('DB_HOST', 'localhost');
define('DB_NAME', '');               // e.g. u123456789_divsphere
define('DB_USER', '');               // e.g. u123456789_dsadmin
define('DB_PASS', '');

// ── Inbox login ───────────────────────────────────────────────
// Use the SAME username/password you already use for the CMS admin
// (ADMIN_USER / ADMIN_PASSWORD in your .env) so there's only one set
// of credentials to remember.
//
// INBOX_PASSWORD_HASH is NOT the plaintext password — generate it by
// running this once, from a terminal, with your real password:
//
//   php -r "echo password_hash('your-real-password', PASSWORD_DEFAULT), PHP_EOL;"
//
// Paste the long $2y$... string it prints below. The plaintext
// password itself is never stored anywhere.
define('INBOX_USER', '');
define('INBOX_PASSWORD_HASH', '');

// ── SMTP (for sending replies to customers) ──────────────────
// Recommended: use the mailbox you already have on this domain
// (e.g. info@divsphere.co) via Hostinger's own SMTP server — check
// hPanel → Emails → your mailbox → "Configuration" for the exact
// host/port Hostinger shows you, it's usually one of these:
//   Host: smtp.hostinger.com   Port: 465 (ssl) or 587 (tls)
// Alternatively, a transactional provider (Resend, SendGrid, etc.)
// works the same way — just use the SMTP details they give you.
define('SMTP_HOST', '');
define('SMTP_PORT', 587);
define('SMTP_USER', '');             // usually the full mailbox address
define('SMTP_PASS', '');
define('SMTP_ENCRYPTION', 'tls');    // 'tls' or 'ssl'
define('SMTP_FROM_EMAIL', 'info@divsphere.co');
define('SMTP_FROM_NAME', 'DivSphere');
