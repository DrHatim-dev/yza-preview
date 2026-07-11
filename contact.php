<?php
/* YZA contact endpoint.
   Contract: POST {name,email,phone?,subject?,message,lang,page,_hp?}
   A 2xx response is returned only after the host mail transport accepts the
   message. Brevo enrichment remains optional and never determines delivery. */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, max-age=0');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Allow: POST');
  yza_contact_json(405, array('ok' => false, 'error' => 'method_not_allowed'));
}

if (!yza_contact_origin_is_allowed()) {
  yza_contact_json(403, array('ok' => false, 'error' => 'origin_not_allowed'));
}

require_once __DIR__ . '/yza-throttle.php';
if (!yza_throttle('contact', 8, 60)) {
  yza_contact_json(429, array('ok' => false, 'error' => 'rate_limited'));
}

$raw = file_get_contents('php://input');
if ($raw === false) {
  yza_contact_json(400, array('ok' => false, 'error' => 'invalid_request'));
}
if (strlen($raw) > 16384) {
  yza_contact_json(413, array('ok' => false, 'error' => 'request_too_large'));
}

$contentType = isset($_SERVER['CONTENT_TYPE']) ? strtolower((string) $_SERVER['CONTENT_TYPE']) : '';
if (strpos($contentType, 'application/json') !== false || trim($raw) !== '') {
  $data = json_decode($raw, true);
  if (!is_array($data)) {
    yza_contact_json(400, array('ok' => false, 'error' => 'invalid_json'));
  }
} else {
  $data = $_POST;
}

/* A filled honeypot is an invalid request. Returning a fake success would break
   the endpoint's guarantee that every success has a real server receipt. */
if (yza_contact_value($data, '_hp') !== '') {
  yza_contact_json(422, array('ok' => false, 'error' => 'invalid_request'));
}

$name = yza_contact_value($data, 'name');
$email = strtolower(yza_contact_value($data, 'email'));
$phone = yza_contact_value($data, 'phone');
$subject = yza_contact_value($data, 'subject');
$message = yza_contact_value($data, 'message');
$lang = strtolower(yza_contact_value($data, 'lang'));
$page = yza_contact_value($data, 'page');

if (!yza_contact_length_between($name, 2, 100)) {
  yza_contact_json(422, array('ok' => false, 'error' => 'invalid_name'));
}
if (yza_contact_text_length($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  yza_contact_json(422, array('ok' => false, 'error' => 'invalid_email'));
}
if ($phone !== '' && (yza_contact_text_length($phone) > 40 || !preg_match('/^[0-9+().\x{00A0}\s-]+$/u', $phone))) {
  yza_contact_json(422, array('ok' => false, 'error' => 'invalid_phone'));
}
if ($subject !== '' && !yza_contact_length_between($subject, 2, 120)) {
  yza_contact_json(422, array('ok' => false, 'error' => 'invalid_subject'));
}
if (!yza_contact_length_between($message, 5, 5000)) {
  yza_contact_json(422, array('ok' => false, 'error' => 'invalid_message'));
}
if ($lang === '') { $lang = 'fr'; }
if (!in_array($lang, array('fr', 'en', 'es', 'tr', 'ar'), true)) {
  yza_contact_json(422, array('ok' => false, 'error' => 'invalid_language'));
}
if (yza_contact_text_length($page) > 500 || preg_match('/[\r\n\x00]/', $page)) {
  yza_contact_json(422, array('ok' => false, 'error' => 'invalid_page'));
}

$name = yza_contact_header_text($name);
$subject = yza_contact_header_text($subject);
$phone = yza_contact_single_line($phone);
$page = yza_contact_single_line($page);
$message = str_replace("\0", '', str_replace(array("\r\n", "\r"), "\n", $message));
$message = preg_replace("/\n{4,}/", "\n\n\n", $message);

try {
  $suffix = strtoupper(substr(bin2hex(random_bytes(5)), 0, 10));
} catch (Throwable $e) {
  $suffix = strtoupper(substr(hash('sha256', uniqid('', true)), 0, 10));
}
$reference = 'YZA-C-' . gmdate('Ymd') . '-' . $suffix;
$mailSubject = 'YZA - Contact ' . $reference . ($subject !== '' ? ' - ' . $subject : '');
$body = "Nouveau message depuis yza-shop.com\n"
  . "Reference : " . $reference . "\n"
  . "Nom       : " . $name . "\n"
  . "E-mail    : " . $email . "\n"
  . "Telephone : " . ($phone !== '' ? $phone : '-') . "\n"
  . "Objet     : " . ($subject !== '' ? $subject : '-') . "\n"
  . "Langue    : " . $lang . "\n"
  . "Page      : " . ($page !== '' ? $page : '-') . "\n\n"
  . "Message\n-------\n" . $message . "\n";

$headers = "From: YZA Boutique <no-reply@yza-shop.com>\r\n"
  . 'Reply-To: ' . $email . "\r\n"
  . "MIME-Version: 1.0\r\n"
  . "Content-Type: text/plain; charset=UTF-8\r\n";
$accepted = @mail(
  'contact@yza-shop.com',
  '=?UTF-8?B?' . base64_encode($mailSubject) . '?=',
  $body,
  $headers,
  '-fno-reply@yza-shop.com'
);

if (!$accepted) {
  yza_contact_json(503, array('ok' => false, 'error' => 'delivery_failed'));
}

/* Contact-list enrichment is intentionally fail-soft. The message itself has
   already been accepted by the host mail transport at this point. */
$synced = false;
if (is_file(__DIR__ . '/brevo.php')) {
  require_once __DIR__ . '/brevo.php';
  if (function_exists('yza_brevo_enabled') && yza_brevo_enabled()) {
    $cfg = yza_brevo_config();
    $attributes = array('FIRSTNAME' => $name, 'LANGUE' => $lang);
    if ($phone !== '') { $attributes['WHATSAPP'] = $phone; }
    $synced = yza_brevo_upsert_contact(
      $email,
      $attributes,
      isset($cfg['list_contact']) ? (int) $cfg['list_contact'] : 0
    );
  }
}

yza_contact_json(200, array(
  'ok' => true,
  'reference' => $reference,
  'synced' => (bool) $synced,
));

function yza_contact_json($status, $payload) {
  http_response_code((int) $status);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function yza_contact_value($data, $key) {
  if (!isset($data[$key])) { return ''; }
  if (!is_scalar($data[$key])) {
    yza_contact_json(422, array('ok' => false, 'error' => 'invalid_' . $key));
  }
  return trim((string) $data[$key]);
}

function yza_contact_text_length($value) {
  return function_exists('mb_strlen') ? mb_strlen((string) $value, 'UTF-8') : strlen((string) $value);
}

function yza_contact_length_between($value, $min, $max) {
  $length = yza_contact_text_length(trim((string) $value));
  return $length >= (int) $min && $length <= (int) $max;
}

function yza_contact_single_line($value) {
  return trim(preg_replace('/[\r\n\t]+/', ' ', (string) $value));
}

function yza_contact_header_text($value) {
  return yza_contact_single_line(str_replace("\0", '', (string) $value));
}

function yza_contact_origin_is_allowed() {
  $requestHost = isset($_SERVER['HTTP_HOST']) ? strtolower((string) $_SERVER['HTTP_HOST']) : '';
  $requestHost = preg_replace('/:\d+$/', '', $requestHost);
  $isLocal = in_array($requestHost, array('localhost', '127.0.0.1', '::1'), true);
  if (!$isLocal && !preg_match('/(^|\.)yza-shop\.com$/', $requestHost)) { return false; }

  $source = isset($_SERVER['HTTP_ORIGIN']) ? trim((string) $_SERVER['HTTP_ORIGIN']) : '';
  if ($source === '' && isset($_SERVER['HTTP_REFERER'])) { $source = trim((string) $_SERVER['HTTP_REFERER']); }
  if ($source === '') { return PHP_SAPI === 'cli'; }

  $parts = parse_url($source);
  if (!is_array($parts) || empty($parts['host'])) { return false; }
  $sourceHost = strtolower((string) $parts['host']);
  $scheme = isset($parts['scheme']) ? strtolower((string) $parts['scheme']) : '';
  if ($isLocal) {
    return $sourceHost === $requestHost
      && in_array($scheme, array('http', 'https'), true);
  }
  /* Staging and production use relative endpoints. Requiring the exact host
     prevents one compromised yza-shop.com subdomain from posting into another. */
  return $scheme === 'https' && $sourceHost === $requestHost;
}
