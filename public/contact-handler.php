<?php
/**
 * contact-handler.php
 * ────────────────────
 * Replaces Netlify Forms now that the site is hosted on Hostinger.
 * Hostinger's shared/Business web hosting runs PHP and can send mail
 * for the domain out of the box, so this needs no third-party service
 * and no extra account — it's the same idea as Netlify Forms, just
 * self-hosted.
 *
 * The contact page (src/pages/contact.astro) POSTs form-encoded data
 * here via fetch() and expects a JSON response: {"ok": true} on
 * success, {"ok": false, "error": "..."} otherwise.
 *
 * SET THIS BEFORE GOING LIVE:
 *   Change $recipient below to the real inbox that should receive
 *   enquiries — it currently has no default on purpose, so a
 *   forgotten deploy fails loudly instead of silently emailing no one.
 */

// ── Configuration ────────────────────────────────────────────
$recipient = "info@divsphere.co"; // ← confirm this is the address you want enquiries sent to.
$siteName  = "DivSphere";

// ── Boilerplate ──────────────────────────────────────────────
header("Content-Type: application/json; charset=utf-8");

function respond(bool $ok, string $error = ""): never {
    http_response_code($ok ? 200 : 422);
    echo json_encode($ok ? ["ok" => true] : ["ok" => false, "error" => $error]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    respond(false, "Method not allowed.");
}

// Same honeypot field the form already renders (hidden from people,
// tempting to spam bots) — Netlify used to check this for us; now we do.
if (!empty($_POST["bot-field"])) {
    // Pretend success so a bot doesn't learn its submission was caught.
    respond(true);
}

$name    = trim($_POST["name"] ?? "");
$email   = trim($_POST["email"] ?? "");
$company = trim($_POST["company"] ?? "");
$service = trim($_POST["service"] ?? "");
$message = trim($_POST["message"] ?? "");

if ($name === "" || $email === "" || $message === "") {
    respond(false, "Name, email, and message are required.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, "That email address doesn't look valid.");
}

/**
 * Header injection guard: PHP's mail() builds raw email headers from
 * these strings. Without this, a submitted name/email containing a
 * newline could inject extra headers (e.g. a hidden Bcc:) — strip any
 * CR/LF before they're anywhere near a header.
 */
function stripHeaderInjection(string $value): string {
    return trim(preg_replace('/[\r\n]+/', " ", $value));
}

$name  = stripHeaderInjection($name);
$email = stripHeaderInjection($email);

$subject = "New enquiry from $siteName website" . ($company !== "" ? " — $company" : "");

$body = "New contact form submission\n\n"
      . "Name:    $name\n"
      . "Email:   $email\n"
      . "Company: " . ($company !== "" ? $company : "—") . "\n"
      . "Service: " . ($service !== "" ? $service : "—") . "\n\n"
      . "Message:\n$message\n";

// From: uses the site's own domain (required by most mail servers,
// including Hostinger's, for deliverability — an arbitrary From
// address gets flagged as spoofed). Reply-To is the visitor's address,
// so hitting "Reply" in your inbox goes straight back to them.
$hostParts = explode(".", parse_url((isset($_SERVER["HTTPS"]) ? "https://" : "http://") . ($_SERVER["HTTP_HOST"] ?? "divsphere.co"), PHP_URL_HOST) ?? "divsphere.co");
$domain = count($hostParts) >= 2 ? implode(".", array_slice($hostParts, -2)) : "divsphere.co";

$headers = [
    "From: $siteName Website <no-reply@$domain>",
    "Reply-To: $name <$email>",
    "Content-Type: text/plain; charset=UTF-8",
];

$sent = mail($recipient, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    respond(false, "The message could not be sent. Please try again or email us directly.");
}

respond(true);
