<?php
/* YZA — abandoned-cart recovery worker. Run by a Hostinger cron job every ~15 min:
     curl -s "https://yza-shop.com/automation-cron.php?key=YZACRONKEY"
   Sends the recovery sequence to active pending carts (from cart-capture.php) that have not
   been purchased: step 1 at ~1h, step 2 (scarcity) at ~24h, step 3 (gift) at ~72h. One step
   per cart per run. order.php marks a cart 'purchased' so buyers are never chased.
   ?force=1 (with the key) ignores the delays and sends step 1 now — for testing only. */

/* The secret key lives OUTSIDE the (public) repo — an env var, or a gitignored
   .private/cron-key.php that returns the key. Fails closed if neither is set.
   To rotate: update .private/cron-key.php on the server AND the Hostinger cron URL. */
$CRON_KEY = getenv('YZA_CRON_KEY');
if (!$CRON_KEY) {
  $kf = __DIR__ . '/.private/cron-key.php';
  if (is_file($kf)) { $CRON_KEY = (string) require $kf; }
}
$key = isset($_GET['key']) ? (string) $_GET['key'] : '';
if (!$CRON_KEY || !hash_equals((string) $CRON_KEY, $key)) { http_response_code(403); echo 'forbidden'; exit; }
header('Content-Type: application/json; charset=utf-8');

$force  = isset($_GET['force']) && $_GET['force'] === '1';
$host   = isset($_SERVER['HTTP_HOST']) ? preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST']) : 'yza-shop.com';
$DELAYS = array(1 => 3600, 2 => 86400, 3 => 259200);   // 1h, 24h, 72h
$MAX_SENDS = 40;                                        // throttle per run

$file = __DIR__ . '/.private/yza-carts.php';
if (!is_file($file)) { echo json_encode(array('ok' => true, 'note' => 'no carts yet')); exit; }

$fp = @fopen($file, 'c+');
if (!$fp) { echo json_encode(array('ok' => false)); exit; }
@flock($fp, LOCK_EX);
$body  = stream_get_contents($fp);
$guard = "<?php exit; /* YZA pending carts — one JSON object per line */\n";
$lines = array_values(array_filter(explode("\n", $body), function ($l) { return trim($l) !== '' && strpos($l, '<?php') !== 0; }));

$now = time();
$sent = 0; $scanned = 0; $records = array();
foreach ($lines as $l) {
  $rec = json_decode($l, true);
  if (!is_array($rec) || !isset($rec['email'])) { continue; }
  $scanned++;
  $status = isset($rec['status']) ? $rec['status'] : 'active';
  $steps  = isset($rec['steps']) && is_array($rec['steps']) ? $rec['steps'] : array();

  if ($status === 'active' && $sent < $MAX_SENDS) {
    $age = $now - (isset($rec['created']) ? intval($rec['created']) : $now);
    $due = 0;
    foreach (array(1, 2, 3) as $s) {
      if (in_array($s, $steps)) { continue; }
      if ($force ? ($s === 1) : ($age >= $DELAYS[$s])) { $due = $s; break; }
    }
    if ($due) {
      $ok = yza_send_recovery($due, $rec, $host);
      if ($ok) {
        $steps[] = $due;
        $rec['steps'] = $steps;
        $rec['last_sent'] = $now;
        if ($due >= 3) { $rec['status'] = 'done'; }
        $sent++;
      }
    }
  }
  // Auto-expire very old carts (14 days) so the file stays small.
  if (isset($rec['created']) && ($now - intval($rec['created'])) > 1209600) { $rec['status'] = 'done'; }
  $records[] = $rec;
}

$out = $guard;
foreach ($records as $rec) { $out .= json_encode($rec, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n"; }
@ftruncate($fp, 0); @rewind($fp); @fwrite($fp, $out);
@flock($fp, LOCK_UN); @fclose($fp);

echo json_encode(array('ok' => true, 'scanned' => $scanned, 'sent' => $sent, 'force' => $force));

/* ---------------------------------------------------------------------- */
function yza_send_recovery($step, $rec, $host) {
  $email = $rec['email'];
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { return false; }
  $lang  = isset($rec['lang']) ? $rec['lang'] : 'fr';
  $name  = isset($rec['name']) && $rec['name'] !== '' ? $rec['name'] : '';
  $first = $name !== '' ? trim(strtok($name, ' ')) : '';
  $total = isset($rec['total']) ? intval($rec['total']) : 0;
  $totalTxt = $total > 0 ? ($total . ' DH') : '';
  $itemsHtml = '';
  if (isset($rec['items']) && is_array($rec['items'])) {
    foreach ($rec['items'] as $it) {
      $q = max(1, intval(isset($it['qty']) ? $it['qty'] : 1));
      $nm = htmlspecialchars((isset($it['name']) ? $it['name'] : 'Article') . (!empty($it['variant']) ? ' - ' . $it['variant'] : ''), ENT_QUOTES, 'UTF-8');
      $itemsHtml .= '<li style="margin:0 0 4px">' . $q . ' &times; ' . $nm . '</li>';
    }
  }
  $cartUrl = 'https://' . $host . '/checkout';
  list($subject, $html, $text) = yza_recovery_copy($step, $lang, $first, $totalTxt, $itemsHtml, $cartUrl, $host);

  $boundary = 'yzar' . md5(uniqid('', true));
  $headers  = 'From: YZA <no-reply@' . $host . ">\r\n";
  $headers .= 'Reply-To: contact@' . $host . "\r\n";
  $headers .= 'List-Unsubscribe: <mailto:contact@' . $host . '?subject=STOP>' . "\r\n";
  $headers .= "MIME-Version: 1.0\r\nContent-Type: multipart/alternative; boundary=\"" . $boundary . "\"\r\n";
  $b  = '--' . $boundary . "\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n" . $text . "\r\n\r\n";
  $b .= '--' . $boundary . "\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n" . $html . "\r\n\r\n";
  $b .= '--' . $boundary . '--';
  return @mail($email, '=?UTF-8?B?' . base64_encode($subject) . '?=', $b, $headers, '-fno-reply@' . $host);
}

function yza_recovery_copy($step, $lang, $first, $totalTxt, $itemsHtml, $cartUrl, $host) {
  $en = ($lang === 'en');
  $hi = $first !== '' ? (($en ? 'Hello ' : 'Bonjour ') . htmlspecialchars($first)) : ($en ? 'Hello' : 'Bonjour');
  $itemsBlock = $itemsHtml !== '' ? '<ul style="margin:6px 0 0;padding-left:18px;font-size:14px;line-height:1.6;color:#3a3833">' . $itemsHtml . '</ul>' : '';
  $totalBlock = $totalTxt !== '' ? '<p style="margin:10px 0 0;font-size:15px;color:#1a1917"><strong>' . ($en ? 'Your selection: ' : 'Votre sélection : ') . htmlspecialchars($totalTxt) . '</strong></p>' : '';

  if ($step === 1) {
    $subject = $en ? 'Your pieces are waiting' . ($first ? ', ' . $first : '') : 'Vos pièces vous attendent' . ($first ? ', ' . $first : '');
    $lead = $en
      ? "You left us mid-sentence. It happens &mdash; a tab closes, a child calls, a wifi hiccup. Good news: your cart is exactly where you left it."
      : "Vous nous avez laissées en plein milieu d'une phrase. Ça arrive. Bonne nouvelle : votre panier est toujours là, exactement comme vous l'avez laissé.";
    $reassure = $en
      ? "And if you were hesitating: cash on delivery, bank transfer or PayPal, free Morocco delivery from 500 DH, and every piece is guaranteed &mdash; repaired for life at the atelier, and 30 days to change your mind."
      : "Et si vous hésitiez : paiement à la livraison, par virement ou PayPal, livraison Maroc offerte dès 500 DH, et chaque pièce est garantie &mdash; réparée à vie à l'atelier, et 30 jours pour changer d'avis.";
    $cta = $en ? 'Pick up where you left off' : 'Reprendre ma commande';
  } elseif ($step === 2) {
    $subject = $en ? ($first ? $first . ', ' : '') . "this one won't come back" : ($first ? $first . ', ' : '') . 'celle-ci ne reviendra pas';
    $lead = $en
      ? "An honest word about the piece still in your cart. At YZA, \"limited edition\" isn't a marketing line. Our pieces are made by hand, in small runs, by our artisans in Guéliz."
      : "Un mot honnête sur la pièce restée dans votre panier. Chez YZA, « édition limitée » n'est pas une formule marketing. Nos pièces sont faites main, en petites quantités, par nos artisanes à Guéliz.";
    $reassure = $en
      ? "La Fatima crochets each fruit one at a time &mdash; never twice exactly the same. When a run sells out, it's gone. We never remake it."
      : "La Fatima crochète chaque fruit un à un &mdash; jamais deux fois exactement le même. Quand une série est épuisée, elle ne revient pas. On ne la refait jamais.";
    $cta = $en ? 'Secure my piece' : 'Sécuriser ma pièce';
  } else {
    $subject = $en ? 'A little gift to finish' . ($first ? ', ' . $first : '') . '?' : 'Un petit cadeau pour finir' . ($first ? ', ' . $first : '') . ' ?';
    $lead = $en
      ? "We won't insist any longer &mdash; this is our last little note about this cart. Since your selection charmed us as much as you, we'd like to add something."
      : "On ne va pas insister plus longtemps &mdash; c'est notre dernier petit mot pour ce panier. Comme votre sélection nous a plu autant qu'à vous, on aimerait ajouter quelque chose.";
    $reassure = $en
      ? "Complete your order in the next 48 hours and we'll slip a hand-crocheted raffia charm into the parcel &mdash; a little fruit signed by La Fatima. Our gift. (And if delivery was holding you back, tell Nawal on WhatsApp &mdash; we'll sort it.)"
      : "Si vous finalisez dans les 48 heures, on glisse dans le colis un charm en raphia fait main &mdash; un petit fruit signé La Fatima. Notre cadeau. (Et si la livraison vous retenait, dites-le à Nawal sur WhatsApp, on s'arrange.)";
    $cta = $en ? 'Claim my gift' : 'Recevoir mon cadeau';
  }

  $html = '<!doctype html><html><body style="margin:0;background:#efece6;font-family:Georgia,\'Times New Roman\',serif">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#efece6"><tr><td align="center" style="padding:28px 14px">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #e2ddd2">'
    . '<tr><td style="padding:30px 34px 8px"><div style="font-family:Arial,Helvetica,sans-serif;letter-spacing:.28em;font-size:22px;color:#1a1917;font-weight:600">YZA</div></td></tr>'
    . '<tr><td style="padding:8px 34px 6px">'
    . '<p style="margin:0 0 16px;font-size:20px;line-height:1.3;color:#1a1917">' . $hi . ',</p>'
    . '<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#1a1917">' . $lead . '</p>'
    . ($itemsBlock ? '<div style="margin:0 0 8px;border-top:1px solid #eee7db;border-bottom:1px solid #eee7db;padding:14px 0">' . $itemsBlock . $totalBlock . '</div>' : '')
    . '<p style="margin:14px 0 0;font-size:14px;line-height:1.65;color:#3a3833">' . $reassure . '</p>'
    . '<p style="margin:22px 0 8px"><a href="' . $cartUrl . '" style="display:inline-block;background:#1a1917;color:#fff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:.14em;text-transform:uppercase;padding:13px 26px">' . $cta . '</a></p>'
    . '<p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1a1917">Nawal &middot; <span style="color:#77736a">YZA</span></p>'
    . '</td></tr>'
    . '<tr><td style="padding:22px 34px 26px;border-top:1px solid #eee7db"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#9a958a">' . ($en ? 'You received this because you started an order at yza-shop.com. Reply STOP to unsubscribe.' : 'Vous recevez cet e-mail car vous avez commencé une commande sur yza-shop.com. Répondez STOP pour vous désabonner.') . '<br>YZA &middot; 66 rue Yougoslavie, Guéliz, Marrakech</p></td></tr>'
    . '</table></td></tr></table></body></html>';

  $text = trim(strip_tags(str_replace('&mdash;', '—', $lead . "\n\n" . $reassure . "\n\n" . $cta . ': ' . $cartUrl . "\n\nNawal — YZA")));
  return array($subject, $html, $text);
}
