<?php
/**
 * logout.php — ends the inbox session.
 */

require_once __DIR__ . "/auth.php";

header("Content-Type: application/json; charset=utf-8");

dsInboxStartSession();
$_SESSION = [];
session_destroy();

echo json_encode(["ok" => true]);
