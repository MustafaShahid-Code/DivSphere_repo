<?php
/**
 * db.php — shared PDO connection for the inquiry inbox.
 *
 * Included by contact-handler.php (to store new submissions) and by
 * api.php (to list/read/reply to them). Returns null instead of
 * throwing when config.php is missing or incomplete, so the contact
 * form keeps working (email-only, as before) even before the database
 * has been set up — see contact-handler.php's use of this.
 */

function dsInboxConfigured(): bool {
    $configFile = __DIR__ . "/config.php";
    if (!file_exists($configFile)) {
        return false;
    }
    require_once $configFile;
    return defined('DB_HOST') && defined('DB_NAME') && defined('DB_USER')
        && DB_NAME !== "" && DB_USER !== "";
}

/**
 * Returns a PDO connection, or null if the database isn't configured
 * yet or the connection fails. Callers should treat null as "inbox
 * storage unavailable" and degrade gracefully rather than fatal-erroring
 * the whole request.
 */
function dsInboxDb(): ?PDO {
    static $pdo = null;
    static $attempted = false;

    if ($attempted) {
        return $pdo;
    }
    $attempted = true;

    if (!dsInboxConfigured()) {
        return null;
    }

    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (Throwable $e) {
        error_log("[inbox] database connection failed: " . $e->getMessage());
        $pdo = null;
    }

    return $pdo;
}
