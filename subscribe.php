<?php
/* YZA — free, self-hosted newsletter capture + welcome email.
   Storefront POSTs {email, name?, lang?, page?, _hp?}. We (1) store the address in a
   guarded .private file that can never be read over HTTP, (2) send a branded welcome
   email once (dedupe by email), via the host's own mail() — no third party, no plugin.
   Every failure is soft; the JS only shows success on a 2xx. */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(array('ok' => false, 'error' => 'method')); exit; }

/* Fail-open anti-abuse: cap bursts from a single IP so bots can't script mass
   welcome-email sends / grow the subscriber file. Genuine visitors subscribe once. */
require_once __DIR__ . '/yza-throttle.php';
if (!yza_throttle('subscribe', 12, 60)) { http_response_code(429); echo json_encode(array('ok' => false, 'error' => 'rate')); exit; }

$raw = file_get_contents('php://input');
if (strlen($raw) > 4000) { http_response_code(413); echo json_encode(array('ok' => false)); exit; }
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

// Honeypot: bots fill hidden fields. Pretend success, store nothing.
$hp = isset($data['_hp']) ? trim((string) $data['_hp']) : '';
if ($hp !== '') { echo json_encode(array('ok' => true)); exit; }

$email = isset($data['email']) ? strtolower(trim((string) $data['email'])) : '';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { http_response_code(400); echo json_encode(array('ok' => false, 'error' => 'invalid email')); exit; }

$clean = function ($v, $max = 80) { return substr(preg_replace('/[\r\n\t]+/', ' ', (string) $v), 0, $max); };
$name = isset($data['name']) ? $clean($data['name'], 80) : '';
$lang = (isset($data['lang']) && in_array($data['lang'], array('fr', 'en', 'es', 'tr', 'ar'), true)) ? $data['lang'] : 'fr';
$page = isset($data['page']) ? $clean($data['page'], 80) : '';
$phone = isset($data['phone']) ? $clean(preg_replace('/[^0-9+ ]/', '', (string) $data['phone']), 24) : '';
$source = isset($data['source']) ? $clean(preg_replace('/[^a-z0-9_\-]/i', '', (string) $data['source']), 24) : '';
$host = isset($_SERVER['HTTP_HOST']) ? preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST']) : 'yza-shop.com';

/* ---- storage: a .php file that exits on the first line, so an HTTP request reveals nothing ---- */
$dir = __DIR__ . '/.private';
if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
$store = $dir . '/yza-subscribers.php';
if (!is_file($store)) { @file_put_contents($store, "<?php exit; /* YZA subscribers — tab-separated: ts, email, name, lang, page, ip, phone, source */\n"); }

$already = false;
$lines = @file($store, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
if (is_array($lines)) {
  foreach ($lines as $line) {
    $cols = explode("\t", $line);
    if (isset($cols[1]) && $cols[1] === $email) { $already = true; break; }
  }
}

$ts = gmdate('Y-m-d H:i:s');
$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
if (!$already) {
  @file_put_contents($store, $ts . "\t" . $email . "\t" . $name . "\t" . $lang . "\t" . $page . "\t" . $ip . "\t" . $phone . "\t" . $source . "\n", FILE_APPEND | LOCK_EX);
}

/* ---- welcome email (first subscribe only), sent the same way order.php sends ---- */
$sent = false;
if (!$already) {
  $code = in_array($source, array('popup10', 'newsletter10'), true) ? 'YZA10' : '';
  list($subject, $html, $text) = yza_welcome_email($lang, $name, $host, $code);
  $boundary = 'yza' . md5(uniqid('', true));
  $headers  = 'From: YZA <no-reply@' . $host . ">\r\n";
  $headers .= 'Reply-To: contact@' . $host . "\r\n";
  $headers .= 'List-Unsubscribe: <mailto:contact@' . $host . '?subject=Desabonnement%20newsletter>' . "\r\n";
  $headers .= "MIME-Version: 1.0\r\n";
  $headers .= 'Content-Type: multipart/alternative; boundary="' . $boundary . "\"\r\n";
  $body  = '--' . $boundary . "\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n" . $text . "\r\n\r\n";
  $body .= '--' . $boundary . "\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n" . $html . "\r\n\r\n";
  $body .= '--' . $boundary . "--";
  $sent = @mail($email, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers, '-fno-reply@' . $host);
}

echo json_encode(array('ok' => true, 'welcomed' => (bool) $sent, 'already' => $already));

/* ---------------------------------------------------------------------- */
function yza_welcome_email($lang, $name, $host, $code = '') {
  $base = 'https://' . $host;
  $hello = $name !== '' ? ($lang === 'fr' ? 'Bonjour ' . htmlspecialchars($name) : 'Hello ' . htmlspecialchars($name)) : ($lang === 'fr' ? 'Bonjour' : 'Hello');

  if ($lang === 'en') {
    $subject = 'Welcome to the wardrobe of Marrakesh';
    $lede = "Welcome. You've just stepped into the wardrobe of Marrakesh.";
    $paras = array(
      "YZA was born in Guéliz, inside a former 1940s bar that became our atelier &mdash; a few steps from the market. Today it's women who work here, from the first strand of raffia to the label sewn by hand. The whole house is female. A choice, not an accident.",
      "Nothing here is rushed. A basket bag can take three weeks &mdash; and you can tell. Raffia, doum palm, banana leaf, crochet: local materials, gestures you don't pick up in one summer.",
      "The gentlest way in is a hand-crocheted raffia fruit charm &mdash; a pocket-sized postcard from Marrakesh, from 100 DH. Handmade, guaranteed, repaired for life at the atelier.",
    );
    $cta = 'Discover the pieces';
    $ps = "A question, a colour in mind? We answer for real, on WhatsApp. That's how we work.";
    $foot = "You're receiving this because you subscribed at yza-shop.com. To unsubscribe, just reply with STOP.";
    $ctaUrl = $base . '/collections/charms';
  } else {
    $subject = 'Bienvenue dans le vestiaire de Marrakech';
    $lede = "Bienvenue. Vous venez d'entrer dans le vestiaire de Marrakech.";
    $paras = array(
      "YZA est né au Guéliz, dans un ancien bar des années 1940 devenu notre atelier &mdash; à quelques pas du marché. Aujourd'hui, ce sont des femmes qui y travaillent, du premier brin de raphia jusqu'à l'étiquette cousue main. Toute la maison est féminine. Un choix, pas un hasard.",
      "Ici, rien n'est pressé. Un sac panier peut prendre trois semaines &mdash; et ça se voit. Raphia, doum, feuille de bananier, crochet : des matières d'ici, des gestes qui ne s'apprennent pas en un été.",
      "La façon la plus douce d'entrer dans la maison : un charm fruit en raphia, crocheté main &mdash; une carte postale de Marrakech en format poche, dès 100 DH. Fait main, garanti, réparé à vie à l'atelier.",
    );
    $cta = 'Découvrir les pièces';
    $ps = "Une question, une couleur en tête ? On répond en vrai, sur WhatsApp. C'est comme ça qu'on travaille.";
    $foot = "Vous recevez cet e-mail car vous vous êtes inscrite sur yza-shop.com. Pour vous désabonner, répondez simplement STOP.";
    $ctaUrl = $base . '/collections/charms';
  }

  $codeHtml = ''; $codeText = '';
  if ($code !== '') {
    $codeLabel = ($lang === 'fr') ? 'Votre code -10 % (première commande) :' : 'Your 10% welcome code (first order):';
    $codeNote  = ($lang === 'fr') ? 'Mentionnez-le sur WhatsApp, on l\'applique à votre commande.' : 'Mention it on WhatsApp and we apply it to your order.';
    $codeHtml = '<p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1a1917">' . $codeLabel . ' <strong style="letter-spacing:.12em;border:1px dashed #de733d;color:#c2551f;padding:2px 8px">' . htmlspecialchars($code) . '</strong><br><span style="font-size:12px;color:#77736a">' . $codeNote . '</span></p>';
    $codeText = $codeLabel . ' ' . $code . ' — ' . $codeNote . "\n\n";
  }
  $pblocks = '';
  foreach ($paras as $p) { $pblocks .= '<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#3a3833">' . $p . '</p>'; }

  $html = '<!doctype html><html><body style="margin:0;background:#efece6;font-family:Georgia,\'Times New Roman\',serif">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#efece6"><tr><td align="center" style="padding:28px 14px">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2ddd2">'
    . '<tr><td style="padding:30px 34px 8px"><div style="font-family:Arial,Helvetica,sans-serif;letter-spacing:.28em;font-size:22px;color:#1a1917;font-weight:600">YZA</div></td></tr>'
    . '<tr><td style="padding:8px 34px 6px"><p style="margin:0 0 18px;font-size:20px;line-height:1.3;color:#1a1917">' . $hello . ',</p>'
    . '<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1a1917">' . $lede . '</p>' . $codeHtml . $pblocks
    . '<p style="margin:22px 0 8px"><a href="' . $ctaUrl . '" style="display:inline-block;background:#1a1917;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:.14em;text-transform:uppercase;padding:13px 26px">' . $cta . '</a></p>'
    . '<p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#77736a;font-style:italic">' . $ps . '</p>'
    . '<p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1a1917">Nawal &middot; <span style="color:#77736a">Fondatrice, YZA</span></p>'
    . '</td></tr>'
    . '<tr><td style="padding:22px 34px 26px;border-top:1px solid #eee7db"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#9a958a">' . $foot . '<br>YZA &middot; 66 rue Yougoslavie, Guéliz, Marrakech</p></td></tr>'
    . '</table></td></tr></table></body></html>';

  $text = trim(strip_tags($lede . "\n\n" . $codeText . implode("\n\n", str_replace('&mdash;', '—', $paras)) . "\n\n" . $cta . ': ' . $ctaUrl . "\n\n" . $ps . "\n\nNawal — YZA\n\n" . $foot));
  return array($subject, $html, $text);
}
