<?php
/* YZA — best-effort order record. Receives the checkout JSON and
   (1) mails a copy to contact@yza-shop.com,
   (2) if WordPress+WooCommerce is installed at /wp, creates a WooCommerce
       order too — that's what triggers the push notification in the
       WooCommerce mobile app (via Jetpack) and keeps an order history.
   The buyer's real confirmation happens over WhatsApp; this endpoint is
   a record, so every failure here is non-fatal (the JS ignores the result). */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(array('ok' => false, 'error' => 'method'));
  exit;
}

/* Fail-open anti-abuse: cap bursts from a single IP so this endpoint can't be
   scripted to mail-bomb arbitrary addresses or spam fake Woo orders. A real buyer
   places one order; 30/min/IP never touches them. */
require_once __DIR__ . '/yza-throttle.php';
if (!yza_throttle('order', 30, 60)) { http_response_code(429); echo json_encode(array('ok' => false, 'error' => 'rate')); exit; }

$raw = file_get_contents('php://input');
if (strlen($raw) > 20000) { http_response_code(413); echo json_encode(array('ok' => false)); exit; }
$data = json_decode($raw, true);
if (!is_array($data) || empty($data['text'])) {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'bad request'));
  exit;
}

$to    = 'contact@yza-shop.com';
$order = isset($data['order']) && is_array($data['order']) ? $data['order'] : array();
$ship  = isset($order['shipping']) && is_array($order['shipping']) ? $order['shipping'] : array();

$clean = function ($v, $max = 160) { return substr(preg_replace('/[\r\n]+/', ' ', (string)$v), 0, $max); };

/* Post-order add-on ("AJOUTER au colis de ma commande N°…"). Records the request as an
   email + a Woo order NOTE on the parent order — no totals change (one parcel = one order;
   Nawal confirms the price on WhatsApp). Returns early. */
if (isset($data['type']) && $data['type'] === 'addon') {
  $num  = isset($order['number']) ? $clean($order['number'], 24) : '';
  $body = (string)$data['text'];
  $subj = 'YZA — AJOUT commande' . ($num ? ' ' . $num : '');
  $host = isset($_SERVER['HTTP_HOST']) ? preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST']) : 'yza-shop.com';
  $hdr  = 'From: YZA Boutique <no-reply@' . $host . ">\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n";
  $sent = @mail($to, '=?UTF-8?B?' . base64_encode($subj) . '?=', $body, $hdr);
  $wc = false;
  $wpLoad = __DIR__ . '/wp/wp-load.php';
  if (is_file($wpLoad)) {
    try {
      define('WP_USE_THEMES', false);
      require_once $wpLoad;
      if ($num && function_exists('wc_get_orders')) {
        $found = wc_get_orders(array('limit' => 1, 'meta_key' => '_yza_order_number', 'meta_value' => $num));
        if (!empty($found)) { $found[0]->add_order_note('AJOUT demandé (WhatsApp) : ' . mb_substr($body, 0, 1000)); $wc = true; }
      }
    } catch (Throwable $e) { $wc = false; }
  }
  echo json_encode(array('ok' => (bool)$sent, 'wc' => $wc, 'addon' => true));
  exit;
}
$name   = isset($ship['name']) ? $clean($ship['name'], 120) : 'Client';
$total  = isset($order['totalDh']) ? intval($order['totalDh']) : (isset($order['subtotalDh']) ? intval($order['subtotalDh']) : '');
$method = isset($order['methodLabel']) ? $clean($order['methodLabel'], 60) : '';
$number = isset($order['number']) ? $clean($order['number'], 24) : '';
$buyer  = isset($ship['email']) ? trim((string)$ship['email']) : '';

/* Server-side price sanity check (NON-BLOCKING). Recompute the expected items total from
   the SEO price catalogue; if the client-sent total is >10% under it, only FLAG it in
   Nawal's subject line. The order is never rejected — payment is confirmed by hand on
   WhatsApp. Skips silently unless EVERY item was found in the catalogue (avoids false
   alarms on size-variant handles that aren't in products-seo.json). */
$priceFlag = '';
$expectedDh = yza_expected_total(isset($order['items']) && is_array($order['items']) ? $order['items'] : array());
if ($expectedDh > 0 && $total !== '' && intval($total) < ($expectedDh * 0.9)) {
  $priceFlag = ' [!] PRIX A VERIFIER (attendu ~' . $expectedDh . ' DH avant remises)';
}

$subject = 'YZA — nouvelle commande' . ($number ? ' ' . $number : '') . ($total !== '' ? ' (' . $total . ' DH)' : '') . ($method ? ' · ' . $method : '') . ' — ' . $name . $priceFlag;
$textBody = (string)$data['text'];

$host = isset($_SERVER['HTTP_HOST']) ? preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST']) : 'yza-shop.com';

/* Rich HTML notification for Nawal: product thumbnails + full delivery block +
   totals, so a new order can be prepared and shipped straight from the inbox.
   The original WhatsApp text (which carries the payment coordinates) is kept as the
   plain-text alternative — nothing is lost if a client strips HTML. */
$notifHtml = yza_order_notification($order, $ship, $number, $total, $method, $host);
$boundary  = 'yzaordr' . md5(uniqid('', true));
$headers   = 'From: YZA Boutique <no-reply@' . $host . ">\r\n";
if ($buyer && filter_var($buyer, FILTER_VALIDATE_EMAIL)) {
  $headers .= 'Reply-To: ' . $clean($buyer, 100) . "\r\n";
}
$headers  .= "MIME-Version: 1.0\r\nContent-Type: multipart/alternative; boundary=\"" . $boundary . "\"\r\n";
$mailBody  = '--' . $boundary . "\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n" . $textBody . "\r\n\r\n";
$mailBody .= '--' . $boundary . "\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n" . $notifHtml . "\r\n\r\n";
$mailBody .= '--' . $boundary . '--';

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$sent = @mail($to, $encodedSubject, $mailBody, $headers, '-fno-reply@' . $host);

/* ---- customer confirmation email (the buyer's own copy — was missing) ---- */
$custSent = false;
if ($buyer && filter_var($buyer, FILTER_VALIDATE_EMAIL)) {
  $firstName = trim(strtok((string) $name, ' '));
  $custSubject = ($firstName !== '' ? $firstName . ', ' : '') . 'votre commande YZA est confirmee' . ($number ? ' - ' . $number : '');
  $custItemRows = yza_item_rows_html(isset($order['items']) && is_array($order['items']) ? $order['items'] : array(), $host);
  $custHtml = yza_customer_confirmation($firstName, $number, $total, $custItemRows, $method, $host);
  $chead  = 'From: YZA <no-reply@' . $host . ">\r\n";
  $chead .= 'Reply-To: contact@' . $host . "\r\n";
  $chead .= "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n";
  $custSent = @mail($buyer, '=?UTF-8?B?' . base64_encode($custSubject) . '?=', $custHtml, $chead, '-fno-reply@' . $host);
}

/* ---- WooCommerce bridge (no-op until WordPress exists at /wp) ---- */
$wc = false;
$wpLoad = __DIR__ . '/wp/wp-load.php';
if (is_file($wpLoad)) {
  try {
    define('WP_USE_THEMES', false);
    require_once $wpLoad;
    if (function_exists('wc_create_order')) {
      $wcOrder = wc_create_order();

      // Line items (no catalog sync needed: name + qty + totals are enough).
      $items = isset($order['items']) && is_array($order['items']) ? array_slice($order['items'], 0, 40) : array();
      foreach ($items as $it) {
        if (!is_array($it)) continue;
        $qty   = max(1, intval(isset($it['qty']) ? $it['qty'] : 1));
        $cents = intval(isset($it['price']) ? $it['price'] : 0);      // DH x100 from the site
        $lineDh = round(($cents * $qty) / 100, 2);
        $label = $clean(isset($it['name']) ? $it['name'] : (isset($it['handle']) ? $it['handle'] : 'Article'), 120);
        if (!empty($it['variant'])) $label .= ' — ' . $clean($it['variant'], 60);
        $item = new WC_Order_Item_Product();
        $item->set_name($label);
        $item->set_quantity($qty);
        $item->set_subtotal($lineDh);
        $item->set_total($lineDh);
        $wcOrder->add_item($item);
      }

      // Buyer / shipping details.
      $full  = trim(isset($ship['name']) ? (string)$ship['name'] : '');
      $parts = preg_split('/\s+/', $full, 2);
      $addr = array(
        'first_name' => $clean(isset($parts[0]) ? $parts[0] : '', 60),
        'last_name'  => $clean(isset($parts[1]) ? $parts[1] : '', 60),
        'address_1'  => $clean(isset($ship['address']) ? $ship['address'] : '', 120),
        'city'       => $clean(isset($ship['city']) ? $ship['city'] : '', 60),
        'postcode'   => $clean(isset($ship['zip']) ? $ship['zip'] : '', 20),
        'country'    => 'MA',
        'email'      => ($buyer && filter_var($buyer, FILTER_VALIDATE_EMAIL)) ? $buyer : '',
        'phone'      => $clean(isset($ship['phone']) ? $ship['phone'] : '', 40),
      );
      $countryTxt = isset($ship['country']) ? trim((string)$ship['country']) : '';
      if ($countryTxt !== '' && !preg_match('/maroc|morocco/i', $countryTxt)) {
        $addr['country'] = '';                      // unknown → leave blank, keep the text in the note
      }
      $wcOrder->set_address($addr, 'billing');
      unset($addr['email'], $addr['phone']);
      $wcOrder->set_address($addr, 'shipping');

      /* Discounts (charm tiers, promo codes) → negative fee lines, the standard Woo
         pattern. Inserted BEFORE calculate_totals so the order total matches the site,
         the WhatsApp text and the ad-pixel value exactly. Clamped server-side. */
      $itemsTotalDh = 0;
      foreach ($items as $it) {
        if (is_array($it)) $itemsTotalDh += (intval(isset($it['price']) ? $it['price'] : 0) * max(1, intval(isset($it['qty']) ? $it['qty'] : 1))) / 100;
      }
      $discounts = isset($order['discounts']) && is_array($order['discounts']) ? array_slice($order['discounts'], 0, 5) : array();
      foreach ($discounts as $d) {
        if (!is_array($d)) continue;
        $amountDh = min(intval(isset($d['amountDh']) ? $d['amountDh'] : 0), (int)$itemsTotalDh);
        if ($amountDh <= 0) continue;
        $fee = new WC_Order_Item_Fee();
        $fee->set_name($clean(isset($d['label']) ? $d['label'] : 'Remise', 80));
        $fee->set_total(-$amountDh);
        $fee->set_tax_status('none');
        $wcOrder->add_item($fee);
      }

      $wcOrder->set_payment_method_title($method ? $method : 'WhatsApp');
      $wcOrder->set_currency('MAD');
      if ($number) {
        $wcOrder->update_meta_data('_yza_order_number', $number);
      }
      // Full original text (items, address, method, payment coordinates) as the order note.
      $wcOrder->set_customer_note(mb_substr($body, 0, 4000));
      $wcOrder->calculate_totals(false);
      // COD ships right away = processing; transfers wait for the receipt = on-hold.
      $methodKey = isset($order['method']) ? (string)$order['method'] : '';
      $wcOrder->set_status($methodKey === 'cod' ? 'processing' : 'on-hold');
      $wcOrder->save();
      $wc = (bool)$wcOrder->get_id();
    }
  } catch (Throwable $e) {
    $wc = false; // never let the WP side break the endpoint
  }
}

/* ---- close the abandoned-cart loop: this buyer just ordered, so their pending
   cart (if any) must never receive a recovery email. Flip it to 'purchased'. ---- */
if ($buyer && filter_var($buyer, FILTER_VALIDATE_EMAIL)) { yza_mark_cart_purchased(strtolower(trim($buyer))); }

echo json_encode(array('ok' => (bool)$sent, 'wc' => $wc, 'cust' => isset($custSent) ? (bool)$custSent : false));

/* ---------------------------------------------------------------------- */
function yza_mark_cart_purchased($email) {
  $file = __DIR__ . '/.private/yza-carts.php';
  if (!is_file($file)) { return; }
  $fp = @fopen($file, 'c+');
  if (!$fp) { return; }
  @flock($fp, LOCK_EX);
  $body  = stream_get_contents($fp);
  $guard = "<?php exit; /* YZA pending carts — one JSON object per line */\n";
  $lines = array_values(array_filter(explode("\n", $body), function ($l) { return trim($l) !== '' && strpos($l, '<?php') !== 0; }));
  $out = $guard; $touched = false;
  foreach ($lines as $l) {
    $rec = json_decode($l, true);
    if (is_array($rec) && isset($rec['email']) && $rec['email'] === $email && (!isset($rec['status']) || $rec['status'] === 'active')) {
      $rec['status'] = 'purchased'; $touched = true;
    }
    if (is_array($rec)) { $out .= json_encode($rec, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n"; }
  }
  if ($touched) { @ftruncate($fp, 0); @rewind($fp); @fwrite($fp, $out); }
  @flock($fp, LOCK_UN); @fclose($fp);
}

function yza_customer_confirmation($firstName, $number, $total, $itemRows, $method, $host) {
  $base   = 'https://' . $host;
  $hello  = $firstName !== '' ? 'Bonjour ' . htmlspecialchars($firstName) : 'Bonjour';
  $totalTxt = ($total !== '' && $total !== null) ? (intval($total) . ' DH') : '';
  $isCod  = (stripos((string) $method, 'livraison') !== false || stripos((string) $method, 'cod') !== false);
  $payLine = $isCod
    ? 'Vous reglez a la livraison, en main propre. Rien a avancer.'
    : 'Nawal vous confirme les coordonnees de paiement sur WhatsApp, en direct.';
  $items = $itemRows !== '' ? '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 0">' . $itemRows . '</table>' : '';
  $totalRow = $totalTxt !== '' ? '<p style="margin:12px 0 0;font-size:15px;color:#1a1917"><strong>Total : ' . $totalTxt . '</strong></p>' : '';
  $numTxt = $number ? htmlspecialchars($number) : '';

  return '<!doctype html><html><body style="margin:0;background:#efece6;font-family:Georgia,\'Times New Roman\',serif">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#efece6"><tr><td align="center" style="padding:28px 14px">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2ddd2">'
    . '<tr><td style="padding:30px 34px 8px"><div style="font-family:Arial,Helvetica,sans-serif;letter-spacing:.28em;font-size:22px;color:#1a1917;font-weight:600">YZA</div></td></tr>'
    . '<tr><td style="padding:8px 34px 6px">'
    . '<p style="margin:0 0 16px;font-size:20px;line-height:1.3;color:#1a1917">' . $hello . ',</p>'
    . '<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#1a1917">Votre commande' . ($numTxt ? ' <strong>' . $numTxt . '</strong>' : '') . ' est confirmee. Merci de faire entrer un peu de Marrakech chez vous.</p>'
    . ($items ? '<div style="margin:0 0 6px;border-top:1px solid #eee7db;border-bottom:1px solid #eee7db;padding:14px 0">' . $items . $totalRow . '</div>' : '')
    . '<p style="margin:18px 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#b4532a">Ce qui se passe maintenant</p>'
    . '<p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#3a3833">On prepare votre piece a la main, dans notre atelier 100 % feminin de Gueliz. Vous recevrez un message des qu\'elle part. ' . $payLine . ' Nawal vous a aussi ecrit sur WhatsApp &mdash; c\'est la que tout se confirme, en direct.</p>'
    . '<p style="margin:16px 0 0;font-size:13px;line-height:1.7;color:#77736a">Fait main, fait pour durer : si un jour votre piece a besoin d\'un soin, on la repare a vie a l\'atelier. Et vous avez 30 jours pour changer d\'avis.</p>'
    . '<p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1a1917">Nawal &middot; <span style="color:#77736a">YZA</span></p>'
    . '</td></tr>'
    . '<tr><td style="padding:22px 34px 26px;border-top:1px solid #eee7db"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#9a958a">Une question ? contact@' . htmlspecialchars($host) . ' &middot; <a href="' . $base . '" style="color:#9a958a">yza-shop.com</a><br>YZA &middot; 66 rue Yougoslavie, Gueliz, Marrakech</p></td></tr>'
    . '</table></td></tr></table></body></html>';
}

/* handle -> absolute product image, from the SEO catalogue (37 products). Loaded once. */
function yza_seo_image_map() {
  static $map = null;
  if ($map !== null) { return $map; }
  $map = array();
  $raw = @file_get_contents(__DIR__ . '/data/products-seo.json');
  if ($raw !== false) {
    $j = json_decode($raw, true);
    if (is_array($j)) { foreach ($j as $h => $v) { if (isset($v['image'])) { $map[$h] = $v['image']; } } }
  }
  return $map;
}

/* Expected items total (whole DH) from the SEO price catalogue, for the non-blocking
   server-side sanity check. Returns 0 (= skip the check) unless EVERY item resolves to a
   catalogue price, so unknown/size-variant handles never trigger a false "tampered" flag. */
function yza_expected_total($items) {
  $raw = @file_get_contents(__DIR__ . '/data/products-seo.json');
  if ($raw === false) { return 0; }
  $j = json_decode($raw, true);
  if (!is_array($j)) { return 0; }
  $real = array_values(array_filter($items, 'is_array'));
  if (!$real) { return 0; }
  $sum = 0; $matched = 0;
  foreach ($real as $it) {
    $h = isset($it['handle']) ? (string) $it['handle'] : '';
    if ($h !== '' && isset($j[$h]['price'])) {
      $sum += intval($j[$h]['price']) * max(1, intval(isset($it['qty']) ? $it['qty'] : 1));
      $matched++;
    }
  }
  return ($matched === count($real)) ? $sum : 0;
}

/* DH integer -> "1 234 DH" (thin space thousands, no decimals — YZA prices are whole DH). */
function yza_dh($v) { return number_format((float) $v, 0, ',', ' ') . ' DH'; }

/* Order items -> <tr> rows with a 64px product thumbnail, name/variant/qty, line total.
   Shared by Nawal's notification and the buyer's confirmation. Image resolved by handle;
   a neutral tile is shown if a handle has no image (never a broken-image icon). */
function yza_item_rows_html($items, $host) {
  if (!is_array($items)) { return ''; }
  $map = yza_seo_image_map();
  $rows = '';
  foreach (array_slice($items, 0, 40) as $it) {
    if (!is_array($it)) { continue; }
    $h    = isset($it['handle']) ? preg_replace('/[^a-z0-9-]/i', '', (string) $it['handle']) : '';
    $qty  = max(1, intval(isset($it['qty']) ? $it['qty'] : 1));
    $nm   = htmlspecialchars((string) (isset($it['name']) ? $it['name'] : 'Article'), ENT_QUOTES, 'UTF-8');
    $vr   = !empty($it['variant']) ? htmlspecialchars((string) $it['variant'], ENT_QUOTES, 'UTF-8') : '';
    $cents = intval(isset($it['price']) ? $it['price'] : 0);
    $lineDh = (int) round(($cents * $qty) / 100);
    $img = isset($map[$h]) ? $map[$h] : '';
    $thumb = $img
      ? '<img src="' . htmlspecialchars($img, ENT_QUOTES, 'UTF-8') . '" width="64" height="64" alt="' . $nm . '" style="display:block;width:64px;height:64px;object-fit:cover;border:1px solid #e2ddd2;border-radius:4px">'
      : '<div style="width:64px;height:64px;background:#efece6;border:1px solid #e2ddd2;border-radius:4px"></div>';
    $rows .= '<tr>'
      . '<td width="64" style="padding:9px 12px 9px 0;vertical-align:top">' . $thumb . '</td>'
      . '<td style="padding:9px 0;vertical-align:top;font-family:Arial,Helvetica,sans-serif">'
      .   '<div style="font-size:14px;color:#1a1917;font-weight:600;line-height:1.35">' . $nm . '</div>'
      .   ($vr ? '<div style="font-size:12px;color:#77736a;margin-top:2px">' . $vr . '</div>' : '')
      .   '<div style="font-size:12px;color:#77736a;margin-top:2px">Qte : ' . $qty . '</div>'
      . '</td>'
      . '<td style="padding:9px 0;vertical-align:top;text-align:right;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1a1917;white-space:nowrap">' . ($cents > 0 ? yza_dh($lineDh) : '') . '</td>'
      . '</tr>';
  }
  return $rows;
}

/* Nawal's order-received email: order no + total + payment, a delivery block she can
   ship from, and the itemised list with thumbnails. Payment coordinates live in the
   plain-text alternative (the WhatsApp body), so this stays a clean shipping view. */
function yza_order_notification($order, $ship, $number, $total, $method, $host) {
  $e = function ($s) { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); };
  $items = isset($order['items']) && is_array($order['items']) ? $order['items'] : array();
  $rows  = yza_item_rows_html($items, $host);

  // Delivery details.
  $name    = $e(isset($ship['name']) ? $ship['name'] : '');
  $phoneRaw = isset($ship['phone']) ? trim((string) $ship['phone']) : '';
  $phone   = $e($phoneRaw);
  $wa = preg_replace('/[^0-9]/', '', $phoneRaw);
  if ($wa !== '' && $wa[0] === '0') { $wa = '212' . substr($wa, 1); }   // MA local 0X… -> 212X…
  $addr    = $e(isset($ship['address']) ? $ship['address'] : '');
  $cityZip = trim(($e(isset($ship['zip']) ? $ship['zip'] : '')) . ' ' . ($e(isset($ship['city']) ? $ship['city'] : '')));
  $country = $e(isset($ship['country']) ? $ship['country'] : '');
  $note    = (isset($ship['note']) && trim((string) $ship['note']) !== '') ? $e($ship['note']) : '';
  $buyer   = (isset($ship['email']) && filter_var($ship['email'], FILTER_VALIDATE_EMAIL)) ? $e($ship['email']) : '';

  // Totals.
  $subtotal = isset($order['subtotalDh']) ? intval($order['subtotalDh']) : null;
  $discounts = isset($order['discounts']) && is_array($order['discounts']) ? $order['discounts'] : array();
  $totalTxt = ($total !== '' && $total !== null) ? yza_dh($total) : '';
  $when = '';
  if (!empty($order['at'])) { $ts = strtotime((string) $order['at']); if ($ts) { $when = date('d/m/Y H:i', $ts); } }

  $discRows = '';
  foreach ($discounts as $d) {
    if (!is_array($d)) { continue; }
    $amt = intval(isset($d['amountDh']) ? $d['amountDh'] : 0);
    if ($amt <= 0) { continue; }
    $discRows .= '<tr><td style="padding:2px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#77736a">' . $e(isset($d['label']) ? $d['label'] : 'Remise') . '</td>'
      . '<td style="padding:2px 0;text-align:right;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#b4532a">&minus;' . yza_dh($amt) . '</td></tr>';
  }
  $subRow = ($subtotal !== null) ? '<tr><td style="padding:2px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#77736a">Sous-total</td><td style="padding:2px 0;text-align:right;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#3a3833">' . yza_dh($subtotal) . '</td></tr>' : '';

  $deliveryLines = array();
  if ($name)    { $deliveryLines[] = '<strong style="color:#1a1917">' . $name . '</strong>'; }
  if ($phone)   { $deliveryLines[] = $wa ? '<a href="https://wa.me/' . $wa . '" style="color:#b4532a;text-decoration:none">' . $phone . '</a> &middot; <a href="tel:' . $e($phoneRaw) . '" style="color:#77736a;text-decoration:none">appeler</a>' : $phone; }
  if ($buyer)   { $deliveryLines[] = '<a href="mailto:' . $buyer . '" style="color:#77736a;text-decoration:none">' . $buyer . '</a>'; }
  if ($addr)    { $deliveryLines[] = $addr; }
  if ($cityZip) { $deliveryLines[] = $cityZip; }
  if ($country) { $deliveryLines[] = $country; }
  $delivery = implode('<br>', $deliveryLines);

  $A = 'font-family:Arial,Helvetica,sans-serif';
  return '<!doctype html><html><body style="margin:0;background:#efece6;' . $A . '">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#efece6"><tr><td align="center" style="padding:26px 14px">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e2ddd2">'
    // header: label + order no + total
    . '<tr><td style="padding:24px 30px 6px">'
    .   '<div style="' . $A . ';font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#b4532a">Nouvelle commande</div>'
    .   '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0"><tr>'
    .     '<td style="vertical-align:bottom"><div style="' . $A . ';font-size:22px;font-weight:700;color:#1a1917">' . ($number ? $e($number) : 'YZA') . '</div>'
    .       ($when ? '<div style="' . $A . ';font-size:12px;color:#9a958a;margin-top:2px">' . $when . '</div>' : '') . '</td>'
    .     '<td style="vertical-align:bottom;text-align:right">' . ($totalTxt ? '<div style="' . $A . ';font-size:22px;font-weight:700;color:#1a1917">' . $totalTxt . '</div>' : '')
    .       ($method ? '<div style="' . $A . ';font-size:12px;color:#77736a;margin-top:2px">' . $e($method) . '</div>' : '') . '</td>'
    .   '</tr></table>'
    . '</td></tr>'
    // delivery block
    . '<tr><td style="padding:16px 30px 6px">'
    .   '<div style="background:#faf7f1;border:1px solid #eee7db;border-radius:6px;padding:14px 16px">'
    .     '<div style="' . $A . ';font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#9a958a;margin-bottom:6px">Livraison</div>'
    .     '<div style="' . $A . ';font-size:14px;line-height:1.7;color:#3a3833">' . ($delivery ? $delivery : '—') . '</div>'
    .     ($note ? '<div style="' . $A . ';font-size:13px;line-height:1.6;color:#77736a;margin-top:8px;padding-top:8px;border-top:1px dashed #e2ddd2">&ldquo;' . $note . '&rdquo;</div>' : '')
    .   '</div>'
    . '</td></tr>'
    // items
    . '<tr><td style="padding:14px 30px 4px">'
    .   '<div style="' . $A . ';font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#9a958a;margin-bottom:2px">Articles</div>'
    .   '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' . $rows . '</table>'
    . '</td></tr>'
    // totals
    . '<tr><td style="padding:6px 30px 4px">'
    .   '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eee7db;padding-top:8px">'
    .     $subRow . $discRows
    .     ($totalTxt ? '<tr><td style="padding:8px 0 0;' . $A . ';font-size:15px;font-weight:700;color:#1a1917">Total</td><td style="padding:8px 0 0;text-align:right;' . $A . ';font-size:15px;font-weight:700;color:#1a1917">' . $totalTxt . '</td></tr>' : '')
    .   '</table>'
    . '</td></tr>'
    // WhatsApp CTA + payment-coordinates hint
    . '<tr><td style="padding:16px 30px 24px">'
    .   ($wa ? '<a href="https://wa.me/' . $wa . '" style="display:inline-block;background:#1a1917;color:#fff;text-decoration:none;' . $A . ';font-size:12px;letter-spacing:.12em;text-transform:uppercase;padding:12px 22px;border-radius:2px">Confirmer sur WhatsApp</a>' : '')
    .   '<p style="margin:14px 0 0;' . $A . ';font-size:12px;line-height:1.6;color:#9a958a">Les coordonnees de paiement et le detail brut sont dans la version texte de cet e-mail (et dans le message WhatsApp du client).</p>'
    . '</td></tr>'
    . '</table></td></tr></table></body></html>';
}
