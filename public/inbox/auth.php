<?php
/**
 * auth.php — session guard shared by every protected inbox endpoint.
 *
 * Real server-side auth, unlike the client-side-only hash check on the
 * local CMS dev gate (see src/pages/admin/index.astro) — the session
 * is set by login.php after password_verify() succeeds on the server,
 * and every API call below re-checks it before touching the database
 * or sending mail.
 */

function dsInboxStartSession(): void {
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || ($_SERVER['SERVER_PORT'] ?? '') == 443;

    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/inbox/',
        'domain'   => '',
        'secure'   => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_name('ds_inbox_session');
    session_start();
}

function dsInboxIsAuthed(): bool {
    dsInboxStartSession();
    return !empty($_SESSION['ds_inbox_authed']);
}

/** Ends the request with 401 JSON unless the visitor is logged in. */
function dsInboxRequireAuth(): void {
    if (!dsInboxIsAuthed()) {
        header("Content-Type: application/json; charset=utf-8");
        http_response_code(401);
        echo json_encode(["ok" => false, "error" => "Not signed in."]);
        exit;
    }
}
