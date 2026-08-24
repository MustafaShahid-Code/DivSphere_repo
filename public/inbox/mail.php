<?php
/**
 * mail.php — sends a reply to a customer via SMTP (PHPMailer).
 *
 * PHPMailer is vendored directly in lib/PHPMailer/ (not installed via
 * Composer) so this works on shared hosting with no CLI/SSH access —
 * just upload the files, no build step.
 */

require_once __DIR__ . "/lib/PHPMailer/Exception.php";
require_once __DIR__ . "/lib/PHPMailer/PHPMailer.php";
require_once __DIR__ . "/lib/PHPMailer/SMTP.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

/**
 * Sends $bodyText to $toEmail as a reply to their enquiry.
 * Returns [true, ""] on success, [false, "error message"] on failure.
 *
 * @return array{0: bool, 1: string}
 */
function dsSendReply(string $toEmail, string $toName, string $subject, string $bodyText): array {
    if (!defined('SMTP_HOST') || SMTP_HOST === "") {
        return [false, "SMTP is not configured yet — see public/inbox/config.sample.php."];
    }

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = SMTP_ENCRYPTION === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;
        $mail->CharSet    = 'UTF-8';

        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $mail->addAddress($toEmail, $toName);
        $mail->addReplyTo(SMTP_FROM_EMAIL, SMTP_FROM_NAME);

        $mail->Subject = $subject;
        $mail->Body    = $bodyText;
        $mail->isHTML(false);

        $mail->send();
        return [true, ""];
    } catch (PHPMailerException | Throwable $e) {
        error_log("[inbox] reply send failed: " . $mail->ErrorInfo);
        return [false, "The reply could not be sent. Check the SMTP settings in config.php."];
    }
}
