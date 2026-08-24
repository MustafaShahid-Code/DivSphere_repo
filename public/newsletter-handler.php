<?php
/**
 * newsletter-handler.php
 * ────────────────────────
 * Handles the newsletter signup form (Footer.astro and the Resources
 * page). Same self-hosted-mail approach as contact-handler.php — no
 * third-party account required to go live.
 *
 * DEFAULT BEHAVIOUR: every signup is emailed to $recipient below. That
 * is enough to collect addresses from day one, but it does NOT build a
 * mailing list, handle unsubscribes, or send anything to subscribers —
 * for that you need a real email service provider (ESP).
 *
 * UPGRADE PATH — once you're ready to actually send a newsletter:
 *   1. Sign up for an ESP with a free tier (Mailchimp, Brevo, MailerLite,
 *      Resend Audiences, etc).
 *   2. Get an API key and a list/audience ID from that provider.
 *   3. Replace the body of subscribe() below with an API call to that
 *      provider (each publishes a simple "add subscriber" REST endpoint
 *      — a few lines with cURL or file_get_contents + stream context).
 *   4. Keep the email-to-admin fallback if you like, or remove it once
 *      the ESP is the source of truth.
 * Until that's done, treat the emails this script sends as your list —
 * check the inbox periodically and import addresses into an ESP in
 * batches.
 *
 * The signup form (NewsletterSignup.astro) POSTs form-encoded data here
 * via fetch() and expects JSON: {"ok": true} or {"ok": false, "error": "..."}.
 *
 * SET THIS BEFORE GOING LIVE:
 *   Confirm $recipient is the inbox that should collect signups.
 */

// ── Configuration ────────────────────────────────────────────
$recipient = "info@divsphere.co"; // ← confirm this is where you want signups sent.
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

// Honeypot — same pattern as the contact form.
if (!empty($_POST["bot-field"])) {
    respond(true);
}

$email = trim($_POST["email"] ?? "");
$source = trim($_POST["source"] ?? "website"); // which form/page it came from, for context in the notification

if ($email === "") {
    respond(false, "Enter an email address.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, "That email address doesn't look valid.");
}

function stripHeaderInjection(string $value): string {
    return trim(preg_replace('/[\r\n]+/', " ", $value));
}

$email  = stripHeaderInjection($email);
$source = stripHeaderInjection($source);

$subject = "New newsletter signup — $siteName website";
$body = "New newsletter signup\n\n"
      . "Email:  $email\n"
      . "Source: $source\n\n"
      . "This subscriber is not yet in an email service provider — see the\n"
      . "upgrade path notes at the top of newsletter-handler.php.\n";

$hostParts = explode(".", parse_url((isset($_SERVER["HTTPS"]) ? "https://" : "http://") . ($_SERVER["HTTP_HOST"] ?? "divsphere.co"), PHP_URL_HOST) ?? "divsphere.co");
$domain = count($hostParts) >= 2 ? implode(".", array_slice($hostParts, -2)) : "divsphere.co";

$headers = [
    "From: $siteName Website <no-reply@$domain>",
    "Reply-To: $email",
    "Content-Type: text/plain; charset=UTF-8",
];

$sent = mail($recipient, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    respond(false, "Signup failed. Please try again in a moment.");
}

respond(true);
