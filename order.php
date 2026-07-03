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

$subject = 'YZA — nouvelle commande' . ($number ? ' ' . $number : '') . ($total !== '' ? ' (' . $total . ' DH)' : '') . ($method ? ' · ' . $method : '') . ' — ' . $name;
$body    = (string)$data['text'];

$host = isset($_SERVER['HTTP_HOST']) ? preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST']) : 'yza-shop.com';
$headers  = 'From: YZA Boutique <no-reply@' . $host . ">\r\n";
if ($buyer && filter_var($buyer, FILTER_VALIDATE_EMAIL)) {
  $headers .= 'Reply-To: ' . $clean($buyer, 100) . "\r\n";
}
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$sent = @mail($to, $encodedSubject, $body, $headers);

/* ---- customer confirmation email (the buyer's own copy — was missing) ---- */
$custSent = false;
if ($buyer && filter_var($buyer, FILTER_VALIDATE_EMAIL)) {
  $firstName = trim(strtok((string) $name, ' '));
  $custSubject = ($firstName !== '' ? $firstName . ', ' : '') . 'votre commande YZA est confirmee' . ($number ? ' - ' . $number : '');
  $itemsList = '';
  if (isset($order['items']) && is_array($order['items'])) {
    foreach (array_slice($order['items'], 0, 20) as $it) {
      if (!is_array($it)) { continue; }
      $q  = max(1, intval(isset($it['qty']) ? $it['qty'] : 1));
      $nm = $clean(isset($it['name']) ? $it['name'] : 'Article', 120);
      $vr = !empty($it['variant']) ? ' - ' . $clean($it['variant'], 60) : '';
      $itemsList .= '<li style="margin:0 0 4px">' . $q . ' &times; ' . htmlspecialchars($nm . $vr) . '</li>';
    }
  }
  $custHtml = yza_customer_confirmation($firstName, $number, $total, $itemsList, $method, $host);
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

echo json_encode(array('ok' => (bool)$sent, 'wc' => $wc, 'cust' => isset($custSent) ? (bool)$custSent : false));

/* ---------------------------------------------------------------------- */
function yza_customer_confirmation($firstName, $number, $total, $itemsList, $method, $host) {
  $base   = 'https://' . $host;
  $hello  = $firstName !== '' ? 'Bonjour ' . htmlspecialchars($firstName) : 'Bonjour';
  $totalTxt = ($total !== '' && $total !== null) ? (intval($total) . ' DH') : '';
  $isCod  = (stripos((string) $method, 'livraison') !== false || stripos((string) $method, 'cod') !== false);
  $payLine = $isCod
    ? 'Vous reglez a la livraison, en main propre. Rien a avancer.'
    : 'Nawal vous confirme les coordonnees de paiement sur WhatsApp, en direct.';
  $items = $itemsList !== '' ? '<ul style="margin:6px 0 0;padding-left:18px;font-size:14px;line-height:1.6;color:#3a3833">' . $itemsList . '</ul>' : '';
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
