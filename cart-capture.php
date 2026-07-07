<?php
/* YZA — abandoned-cart capture. The checkout posts {email, name?, phone?, items?, total?, lang?}
   as soon as a valid email is typed. We store one "active" pending cart per email in a guarded
   file; order.php flips it to "purchased" on checkout, and automation-cron.php sends the
   recovery emails on a schedule. No third party, no plugin. */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(array('ok' => false)); exit; }

/* Fail-open anti-abuse: cap single-IP bursts so the pending-cart file can't be
   flooded. Normal checkout typing (debounced) stays well under 40/min. */
require_once __DIR__ . '/yza-throttle.php';
if (!yza_throttle('cart', 40, 60)) { http_response_code(429); echo json_encode(array('ok' => false, 'error' => 'rate')); exit; }

$raw = file_get_contents('php://input');
if (strlen($raw) > 8000) { http_response_code(413); echo json_encode(array('ok' => false)); exit; }
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

if (isset($data['_hp']) && trim((string) $data['_hp']) !== '') { echo json_encode(array('ok' => true)); exit; }
$email = isset($data['email']) ? strtolower(trim((string) $data['email'])) : '';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { http_response_code(400); echo json_encode(array('ok' => false)); exit; }

$clean = function ($v, $max = 120) { return substr(preg_replace('/[\r\n\t]+/', ' ', (string) $v), 0, $max); };
$name  = isset($data['name']) ? $clean($data['name'], 80) : '';
$phone = isset($data['phone']) ? $clean($data['phone'], 40) : '';
$lang  = (isset($data['lang']) && in_array($data['lang'], array('fr', 'en', 'es', 'tr', 'ar'), true)) ? $data['lang'] : 'fr';
$total = isset($data['total']) ? intval($data['total']) : 0;

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
if (!$fp) { echo json_encode(array('ok' => false)); exit; }
@flock($fp, LOCK_EX);
$body = stream_get_contents($fp);
$lines = array_values(array_filter(explode("\n", $body), function ($l) { return trim($l) !== '' && strpos($l, '<?php') !== 0; }));

$now = time();
$found = false;
$records = array();
foreach ($lines as $l) {
  $rec = json_decode($l, true);
  if (!is_array($rec) || !isset($rec['email'])) { continue; }
  if ($rec['email'] === $email && isset($rec['status']) && $rec['status'] === 'active') {
    // Refresh the live cart contents, keep the original created time + steps already sent.
    $rec['name']  = $name !== '' ? $name : (isset($rec['name']) ? $rec['name'] : '');
    $rec['phone'] = $phone !== '' ? $phone : (isset($rec['phone']) ? $rec['phone'] : '');
    $rec['lang']  = $lang;
    $rec['total'] = $total;
    $rec['items'] = $items;
    $rec['updated'] = $now;
    $found = true;
  }
  $records[] = $rec;
}
if (!$found) {
  $records[] = array(
    'email' => $email, 'name' => $name, 'phone' => $phone, 'lang' => $lang,
    'total' => $total, 'items' => $items, 'created' => $now, 'updated' => $now,
    'steps' => array(), 'status' => 'active',
  );
}

$out = $guard;
foreach ($records as $rec) { $out .= json_encode($rec, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n"; }
@ftruncate($fp, 0);
@rewind($fp);
@fwrite($fp, $out);
@flock($fp, LOCK_UN);
@fclose($fp);

echo json_encode(array('ok' => true, 'new' => !$found));
