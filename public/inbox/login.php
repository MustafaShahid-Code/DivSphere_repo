<?php
/**
 * login.php — checks the inbox username/password against config.php
 * (the same credentials as the CMS admin, per config.sample.php) and
 * starts a real server-side session on success.
 */

require_once __DIR__ . "/auth.php";

header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["ok" => false, "error" => "Method not allowed."]);
    exit;
}

$configFile = __DIR__ . "/config.php";
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "The inbox hasn't been configured yet — see public/inbox/config.sample.php."]);
    exit;
}
require_once $configFile;

$input = json_decode(file_get_contents("php://input"), true) ?? [];
$username = trim((string)($input["username"] ?? ""));
$password = (string)($input["password"] ?? "");

// Small fixed delay on every attempt (pass or fail) — cheap brute-force
// friction without needing external infrastructure.
usleep(300000);

$validUser = defined('INBOX_USER') && INBOX_USER !== "" && hash_equals(INBOX_USER, $username);
$validPass = defined('INBOX_PASSWORD_HASH') && INBOX_PASSWORD_HASH !== ""
    && password_verify($password, INBOX_PASSWORD_HASH);

if (!$validUser || !$validPass) {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "That username or password didn't match."]);
    exit;
}

dsInboxStartSession();
session_regenerate_id(true);
$_SESSION['ds_inbox_authed'] = true;

echo json_encode(["ok" => true]);
