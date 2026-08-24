<?php
/**
 * api.php — the inquiry inbox's entire backend, behind one endpoint.
 *
 * Actions (via ?action=):
 *   unread_count   GET,  no auth   — {"count": N}, used for the bell/dot
 *                                    badge on the CMS admin page.
 *   list           GET,  auth      — every inquiry, newest first.
 *   detail         GET,  auth      — one inquiry + its reply thread.
 *   mark_read      POST, auth      — {id, read: bool}
 *   reply          POST, auth      — {id, body} → sends email via SMTP,
 *                                    logs the reply, marks the inquiry read.
 *
 * `unread_count` is deliberately left unauthenticated: it exposes a
 * single integer and nothing else, so the admin page's notification
 * dot can poll it before the visitor has signed into the inbox itself
 * (that page uses a separate GitHub-OAuth-gated session). Every other
 * action requires the real session set by login.php.
 */

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/auth.php";

header("Content-Type: application/json; charset=utf-8");

function dsRespond(bool $ok, array $extra = [], int $status = 200): never {
    http_response_code($ok ? $status : ($status === 200 ? 422 : $status));
    echo json_encode(array_merge(["ok" => $ok], $extra));
    exit;
}

$action = $_GET["action"] ?? "";

// ── unread_count — public ───────────────────────────────────────
if ($action === "unread_count" && $_SERVER["REQUEST_METHOD"] === "GET") {
    $pdo = dsInboxDb();
    if (!$pdo) {
        dsRespond(true, ["count" => 0]);
    }
    try {
        $count = (int)$pdo->query("SELECT COUNT(*) FROM inquiries WHERE is_read = 0")->fetchColumn();
        dsRespond(true, ["count" => $count]);
    } catch (Throwable $e) {
        error_log("[inbox] unread_count failed: " . $e->getMessage());
        dsRespond(true, ["count" => 0]);
    }
}

// ── everything else requires a signed-in session ────────────────
dsInboxRequireAuth();

$pdo = dsInboxDb();
if (!$pdo) {
    dsRespond(false, ["error" => "The database isn't configured yet — see public/inbox/config.sample.php."], 500);
}

if ($action === "list" && $_SERVER["REQUEST_METHOD"] === "GET") {
    $rows = $pdo->query(
        "SELECT id, name, email, company, service, message, submitted_at, is_read, read_at
         FROM inquiries ORDER BY submitted_at DESC"
    )->fetchAll();
    dsRespond(true, ["inquiries" => $rows]);
}

if ($action === "detail" && $_SERVER["REQUEST_METHOD"] === "GET") {
    $id = (int)($_GET["id"] ?? 0);
    if ($id <= 0) {
        dsRespond(false, ["error" => "Missing id."], 400);
    }

    $stmt = $pdo->prepare("SELECT * FROM inquiries WHERE id = ?");
    $stmt->execute([$id]);
    $inquiry = $stmt->fetch();
    if (!$inquiry) {
        dsRespond(false, ["error" => "Not found."], 404);
    }

    $repliesStmt = $pdo->prepare("SELECT id, reply_body, sent_at, sent_ok FROM inquiry_replies WHERE inquiry_id = ? ORDER BY sent_at ASC");
    $repliesStmt->execute([$id]);

    dsRespond(true, ["inquiry" => $inquiry, "replies" => $repliesStmt->fetchAll()]);
}

$input = json_decode(file_get_contents("php://input"), true) ?? [];

if ($action === "mark_read" && $_SERVER["REQUEST_METHOD"] === "POST") {
    $id = (int)($input["id"] ?? 0);
    $read = !empty($input["read"]);
    if ($id <= 0) {
        dsRespond(false, ["error" => "Missing id."], 400);
    }

    $stmt = $pdo->prepare("UPDATE inquiries SET is_read = ?, read_at = ? WHERE id = ?");
    $stmt->execute([$read ? 1 : 0, $read ? date("Y-m-d H:i:s") : null, $id]);

    dsRespond(true);
}

if ($action === "reply" && $_SERVER["REQUEST_METHOD"] === "POST") {
    require_once __DIR__ . "/mail.php";
    require_once __DIR__ . "/config.php";

    $id = (int)($input["id"] ?? 0);
    $body = trim((string)($input["body"] ?? ""));
    if ($id <= 0 || $body === "") {
        dsRespond(false, ["error" => "A reply message is required."], 400);
    }

    $stmt = $pdo->prepare("SELECT * FROM inquiries WHERE id = ?");
    $stmt->execute([$id]);
    $inquiry = $stmt->fetch();
    if (!$inquiry) {
        dsRespond(false, ["error" => "Not found."], 404);
    }

    $subject = "Re: your enquiry to " . (defined('SMTP_FROM_NAME') ? SMTP_FROM_NAME : "DivSphere");
    [$sent, $error] = dsSendReply($inquiry["email"], $inquiry["name"], $subject, $body);

    $logStmt = $pdo->prepare("INSERT INTO inquiry_replies (inquiry_id, reply_body, sent_ok) VALUES (?, ?, ?)");
    $logStmt->execute([$id, $body, $sent ? 1 : 0]);

    if ($sent) {
        $pdo->prepare("UPDATE inquiries SET is_read = 1, read_at = COALESCE(read_at, ?) WHERE id = ?")
            ->execute([date("Y-m-d H:i:s"), $id]);
        dsRespond(true);
    }

    dsRespond(false, ["error" => $error], 502);
}

dsRespond(false, ["error" => "Unknown action."], 400);
