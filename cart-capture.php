<?php
/* YZA — consented cart-reminder capture. The checkout posts
   {email, recoveryConsent:true, consentVersion, name?, phone?, items?, total?, lang?}
   only after the shopper opts in. We store one "active" pending cart per email
   in a guarded file; order.php flips it to "purchased" on checkout, and
   automation-cron.php sends the recovery emails on a schedule. */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, max-age=0');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { header('Allow: POST'); http_response_code(405); echo json_encode(array('ok' => false)); exit; }
if (!yza_cart_origin_is_allowed()) { http_response_code(403); echo json_encode(array('ok' => false, 'error' => 'origin_not_allowed')); exit; }

/* Fail-closed anti-abuse: cap single-IP bursts so the pending-cart file can't be
   flooded. Normal checkout typing (debounced) stays well under 40/min. */
require_once __DIR__ . '/yza-throttle.php';
if (!yza_throttle('cart', 40, 60)) { http_response_code(429); echo json_encode(array('ok' => false, 'error' => 'rate')); exit; }

/* Optional Brevo sync. No-ops entirely until .private/brevo.php holds a real key. */
require_once __DIR__ . '/brevo.php';

$raw = file_get_contents('php://input');
if ($raw === false) { http_response_code(400); echo json_encode(array('ok' => false, 'error' => 'invalid_request')); exit; }
if (strlen($raw) > 8000) { http_response_code(413); echo json_encode(array('ok' => false)); exit; }
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

if (isset($data['_hp']) && trim((string) $data['_hp']) !== '') { echo json_encode(array('ok' => true)); exit; }
$email = isset($data['email']) ? strtolower(trim((string) $data['email'])) : '';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { http_response_code(400); echo json_encode(array('ok' => false)); exit; }
$action = isset($data['action']) && is_scalar($data['action']) ? trim((string) $data['action']) : 'capture';
if (!in_array($action, array('capture', 'withdraw'), true)) {
  http_response_code(422); echo json_encode(array('ok' => false, 'error' => 'invalid_action')); exit;
}
$recoveryConsent = isset($data['recoveryConsent']) && $data['recoveryConsent'] === true;
if ($action === 'capture' && !$recoveryConsent) {
  http_response_code(422); echo json_encode(array('ok' => false, 'error' => 'recovery_consent_required')); exit;
}

$clean = function ($v, $max = 120) { return substr(preg_replace('/[\r\n\t]+/', ' ', (string) $v), 0, $max); };
$name  = isset($data['name']) ? $clean($data['name'], 80) : '';
$phone = isset($data['phone']) ? $clean($data['phone'], 40) : '';
$lang  = (isset($data['lang']) && in_array($data['lang'], array('fr', 'en', 'es', 'tr', 'ar'), true)) ? $data['lang'] : 'fr';
$total = isset($data['total']) ? intval($data['total']) : 0;
$consentVersion = isset($data['consentVersion']) && is_scalar($data['consentVersion'])
  ? $clean($data['consentVersion'], 40) : 'cart-reminder-v1';
$brevoCartListId = 0;
if ($action === 'withdraw' && yza_brevo_enabled()) {
  $brevoConfig = yza_brevo_config();
  $brevoCartListId = isset($brevoConfig['list_cart']) ? (int) $brevoConfig['list_cart'] : 0;
}

$items = array();
if (isset($data['items']) && is_array($data['items'])) {
  foreach (array_slice($data['items'], 0, 20) as $it) {
    if (!is_array($it)) { continue; }
    $items[] = array(
      'name' => $clean(isset($it['name']) ? $it['name'] : 'Article', 120),
      'qty'  => max(1, intval(isset($it['qty']) ? $it['qty'] : 1)),
      'variant' => $clean(isset($it['variant']) ? $it['variant'] : '', 60),
    );
  }
}

$dir = __DIR__ . '/.private';
if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
$file = $dir . '/yza-carts.php';
$guard = "<?php exit; /* YZA pending carts — one JSON object per line */\n";
if (!is_file($file)) { @file_put_contents($file, $guard); }

$fp = @fopen($file, 'c+');
if (!$fp) { http_response_code(503); echo json_encode(array('ok' => false, 'error' => 'storage_unavailable')); exit; }
$locked = false;
$lockDeadline = microtime(true) + 0.75;
do {
  $locked = @flock($fp, LOCK_EX | LOCK_NB);
  if (!$locked) { usleep(25000); }
} while (!$locked && microtime(true) < $lockDeadline);
if (!$locked) {
  @fclose($fp);
  header('Retry-After: 1');
  http_response_code(503); echo json_encode(array('ok' => false, 'error' => 'storage_busy')); exit;
}
$body = stream_get_contents($fp);
$lines = array_values(array_filter(explode("\n", $body), function ($l) { return trim($l) !== '' && strpos($l, '<?php') !== 0; }));

$now = time();
$found = false;
$records = array();
foreach ($lines as $l) {
  $rec = json_decode($l, true);
  if (!is_array($rec) || !isset($rec['email'])) { continue; }
  if ($rec['email'] === $email && isset($rec['status']) && $rec['status'] === 'active') {
    if ($action === 'withdraw') {
      $rec['status'] = 'withdrawn';
      $rec['recoveryConsent'] = false;
      $rec['consentWithdrawnAt'] = $now;
      $rec['brevoRemovalPending'] = $brevoCartListId > 0;
    } else {
      // Refresh the live cart contents, keep the original created time + steps already sent.
      $rec['name']  = $name !== '' ? $name : (isset($rec['name']) ? $rec['name'] : '');
      $rec['phone'] = $phone !== '' ? $phone : (isset($rec['phone']) ? $rec['phone'] : '');
      $rec['lang']  = $lang;
      $rec['total'] = $total;
      $rec['items'] = $items;
      $rec['recoveryConsent'] = true;
      $rec['consentVersion'] = $consentVersion;
      if (empty($rec['consentedAt'])) { $rec['consentedAt'] = $now; }
    }
    $rec['updated'] = $now;
    $found = true;
  }
  $records[] = $rec;
}
if (!$found && $action === 'capture') {
  $records[] = array(
    'email' => $email, 'name' => $name, 'phone' => $phone, 'lang' => $lang,
    'total' => $total, 'items' => $items, 'created' => $now, 'updated' => $now,
    'steps' => array(), 'status' => 'active', 'recoveryConsent' => true,
    'consentVersion' => $consentVersion, 'consentedAt' => $now,
  );
}

$out = $guard;
foreach ($records as $rec) { $out .= json_encode($rec, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n"; }
$writeOk = @ftruncate($fp, 0) && @rewind($fp);
$written = $writeOk ? @fwrite($fp, $out) : false;
$writeOk = $writeOk && $written === strlen($out) && @fflush($fp);
@flock($fp, LOCK_UN);
@fclose($fp);
if (!$writeOk) {
  http_response_code(503); echo json_encode(array('ok' => false, 'error' => 'storage_unavailable')); exit;
}

/* Withdrawing consent stops local recovery and removes the address from the
   dedicated Brevo cart-reminder list. It does not delete a separately and
   explicitly subscribed newsletter contact. */
if ($action === 'withdraw') {
  $brevoRemoved = true;
  if ($brevoCartListId > 0 && function_exists('yza_brevo_request')) {
    $brevoResult = yza_brevo_request('POST', '/contacts/lists/' . $brevoCartListId . '/contacts/remove', array('emails' => array($email)));
    $brevoRemoved = is_array($brevoResult) && !empty($brevoResult['ok']);
  }
  if (!$brevoRemoved) {
    header('Retry-After: 5');
    http_response_code(503);
    echo json_encode(array('ok' => false, 'withdrawn' => true, 'error' => 'remote_suppression_pending'));
    exit;
  }
  echo json_encode(array('ok' => true, 'withdrawn' => true));
  exit;
}

/* ---- Brevo cart-reminder sync (fail-soft) ----
   This runs only after the explicit recoveryConsent gate above. It adds the
   shopper solely to the dedicated cart-reminder list, never the newsletter
   list. A Brevo automation (trigger: added to this list / attribute updated)
   may send the consented recovery e-mail.
   Custom attributes to create in Brevo: WHATSAPP, LANGUE, CART_TOTAL (number),
   CART_ITEMS (text), CART_UPDATED (text). order.php flips the local record to
   "purchased" and removes the address from this dedicated list. */
if (yza_brevo_enabled()) {
  $bcfg = yza_brevo_config();
  $summary = array();
  foreach ($items as $it) {
    $summary[] = $it['qty'] . '× ' . $it['name'] . ($it['variant'] !== '' ? ' (' . $it['variant'] . ')' : '');
  }
  yza_brevo_upsert_contact($email, array(
    'FIRSTNAME'    => $name,
    'WHATSAPP'     => $phone,
    'LANGUE'       => $lang,
    'CART_TOTAL'   => $total,
    'CART_ITEMS'   => substr(implode(', ', $summary), 0, 240),
    'CART_UPDATED' => gmdate('Y-m-d H:i:s', $now),
  ), isset($bcfg['list_cart']) ? $bcfg['list_cart'] : 0);
}

echo json_encode(array('ok' => true, 'new' => !$found));

function yza_cart_origin_is_allowed() {
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
    return $sourceHost === $requestHost && in_array($scheme, array('http', 'https'), true);
  }
  return $scheme === 'https' && $sourceHost === $requestHost;
}
