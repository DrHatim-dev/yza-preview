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

/* Optional Brevo sync. No-ops entirely until .private/brevo.php holds a real key. */
require_once __DIR__ . '/brevo.php';

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

$code = in_array($source, array('popup10', 'newsletter10'), true) ? 'YZA10' : '';

/* ---- Brevo contact sync (every submit, create-or-update; fail-soft) ----
   Runs on repeat submits too so the list stays current. Skipped when Brevo off.
   Attributes used: FIRSTNAME (standard) + WHATSAPP, LANGUE, SOURCE (custom —
   create them in Brevo → Contacts → Settings → Contact attributes). */
$brevoSynced = false;
if (yza_brevo_enabled()) {
  $bcfg = yza_brevo_config();
  $brevoSynced = yza_brevo_upsert_contact($email, array(
    'FIRSTNAME' => $name,
    'WHATSAPP'  => $phone,
    'LANGUE'    => $lang,
    'SOURCE'    => $source,
  ), isset($bcfg['list_news']) ? $bcfg['list_news'] : 0);
}

/* ---- welcome email (first subscribe only) ----
   Preference order: (1) a per-language Brevo template if configured,
   (2) the built-in multilingual HTML sent through Brevo, (3) the host's own
   mail() — the original path, used whenever Brevo is off or a send fails. */
$sent = false;
if (!$already) {
  list($subject, $html, $text) = yza_welcome_email($lang, $name, $host, $code);

  if (yza_brevo_enabled()) {
    $bcfg = yza_brevo_config();
    $tpl = (isset($bcfg['tpl_welcome']) && isset($bcfg['tpl_welcome'][$lang])) ? (int) $bcfg['tpl_welcome'][$lang] : 0;
    if ($tpl) {
      $sent = yza_brevo_send_template($email, $name, $tpl, array('NAME' => $name, 'CODE' => $code, 'LANG' => $lang));
    } else {
      $sent = yza_brevo_send_email($email, $name, $subject, $html, $text);
    }
  }

  if (!$sent) {
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
}

echo json_encode(array('ok' => true, 'welcomed' => (bool) $sent, 'already' => $already, 'synced' => (bool) $brevoSynced));

/* ---------------------------------------------------------------------- */
function yza_welcome_email($lang, $name, $host, $code = '') {
  $base   = 'https://' . $host;
  $logo   = $base . '/assets/brand/yza-wordmark-upscaled.png';
  $hero   = $base . '/assets/hero/popup-pink-scarf.jpg';
  $ctaUrl = $base . '/collections/charms';
  $fonts  = 'https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&family=Fraunces:ital,opsz,wght@0,9..144,400..600;1,9..144,400..600&display=swap';
  $sans   = "'Jost','Helvetica Neue',Arial,sans-serif";
  $serif  = "'Fraunces','Georgia','Times New Roman',serif";

  if ($lang === 'en') {
    $subject   = 'Welcome to the wardrobe of Marrakesh';
    $eyebrow   = 'The wardrobe of Marrakesh';
    $greet     = 'Hello';
    $lede      = "Welcome. You've just stepped into the wardrobe of Marrakesh.";
    $codeLabel = 'Your 10% code on your first order';
    $codeNote  = 'Mention it on WhatsApp and we apply it to your order.';
    $paras = array(
      "YZA was born in Guéliz, inside a former 1940s bar that became our atelier, a few steps from the market. Today it's women who work here, from the first strand of raffia to the label sewn by hand. The whole house is female. A choice, not an accident.",
      "Nothing here is rushed. A basket bag can take three weeks, and you can tell. Raffia, doum palm, banana leaf, crochet: local materials, gestures you don't pick up in one summer.",
      "The gentlest way in is a hand-crocheted raffia fruit charm. A pocket-sized postcard from Marrakesh, from 100 DH. Handmade, guaranteed, repaired for life at the atelier.",
    );
    $cta  = 'Discover the pieces';
    $ps   = "A question, a colour in mind? We answer for real, on WhatsApp. That's how we work.";
    $sig  = 'Founder of YZA';
    $foot = "You're receiving this because you subscribed at yza-shop.com. To unsubscribe, just reply with STOP.";
  } else {
    $subject   = 'Bienvenue dans le vestiaire de Marrakech';
    $eyebrow   = 'Le vestiaire de Marrakech';
    $greet     = 'Bonjour';
    $lede      = "Bienvenue. Vous venez d'entrer dans le vestiaire de Marrakech.";
    $codeLabel = 'Votre code -10 % sur la première commande';
    $codeNote  = "Mentionnez-le sur WhatsApp, on l'applique à votre commande.";
    $paras = array(
      "YZA est né au Guéliz, dans un ancien bar des années 1940 devenu notre atelier, à quelques pas du marché. Aujourd'hui, ce sont des femmes qui y travaillent, du premier brin de raphia jusqu'à l'étiquette cousue main. Toute la maison est féminine. Un choix, pas un hasard.",
      "Ici, rien n'est pressé. Un sac panier peut prendre trois semaines, et ça se voit. Raphia, doum, feuille de bananier, crochet : des matières d'ici, des gestes qui ne s'apprennent pas en un été.",
      "La façon la plus douce d'entrer dans la maison : un charm fruit en raphia, crocheté main. Une carte postale de Marrakech en format poche, dès 100 DH. Fait main, garanti, réparé à vie à l'atelier.",
    );
    $cta  = 'Découvrir les pièces';
    $ps   = "Une question, une couleur en tête ? On répond en vrai, sur WhatsApp. C'est comme ça qu'on travaille.";
    $sig  = 'Fondatrice de YZA';
    $foot = "Vous recevez cet e-mail car vous vous êtes inscrite sur yza-shop.com. Pour vous désabonner, répondez simplement STOP.";
  }

  $hello = $greet . ($name !== '' ? ' ' . htmlspecialchars($name) : '') . ',';

  $codeHtml = '';
  if ($code !== '') {
    $codeHtml = '<tr><td class="yza-pad" style="padding:22px 40px 0;">'
      . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:16px 18px;border:1px dashed #de733d;background:#fdf6f1;">'
      . '<div style="font-family:' . $sans . ';font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#767676;">' . $codeLabel . '</div>'
      . '<div style="font-family:' . $sans . ';font-size:24px;font-weight:500;letter-spacing:.16em;color:#c2551f;margin-top:7px;">' . htmlspecialchars($code) . '</div>'
      . '<div style="font-family:' . $sans . ';font-size:12px;line-height:1.5;color:#767676;margin-top:7px;">' . $codeNote . '</div>'
      . '</td></tr></table></td></tr>';
  }

  $pblocks = '';
  $last = count($paras) - 1;
  foreach ($paras as $i => $p) {
    $mb = ($i === $last) ? '0' : '0 0 16px';
    $pblocks .= '<p style="margin:' . $mb . ';font-family:' . $sans . ';font-size:15px;line-height:1.72;color:#444444;">' . $p . '</p>';
  }

  $html = <<<HTML
<!doctype html><html lang="$lang"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@import url('$fonts');body{margin:0;padding:0;}img{border:0;outline:none;text-decoration:none;}@media(max-width:620px){.yza-card{width:100%!important;}.yza-pad{padding-left:24px!important;padding-right:24px!important;}}</style></head>
<body style="margin:0;padding:0;background:#f2f1ee;"><div style="display:none;max-height:0;overflow:hidden;opacity:0;">$lede</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f1ee;"><tr><td align="center" style="padding:32px 12px;">
<table role="presentation" class="yza-card" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid rgba(46,46,46,0.10);">
<tr><td align="center" class="yza-pad" style="padding:36px 40px 0;"><img src="$logo" alt="YZA" width="132" style="width:132px;height:auto;display:block;"></td></tr>
<tr><td align="center" class="yza-pad" style="padding:16px 40px 0;"><div style="font-family:$sans;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#de733d;">$eyebrow</div></td></tr>
<tr><td class="yza-pad" style="padding:22px 40px 0;"><h1 style="margin:0 0 12px;font-family:$serif;font-weight:400;font-size:30px;line-height:1.15;color:#2e2e2e;">$hello</h1><p style="margin:0;font-family:$sans;font-size:16px;line-height:1.6;color:#2e2e2e;">$lede</p></td></tr>
$codeHtml
<tr><td align="center" class="yza-pad" style="padding:28px 40px 0;"><img src="$hero" alt="YZA" width="300" style="width:300px;max-width:100%;height:auto;display:block;"></td></tr>
<tr><td class="yza-pad" style="padding:26px 40px 0;">$pblocks</td></tr>
<tr><td class="yza-pad" style="padding:28px 40px 0;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#2e2e2e;"><a href="$ctaUrl" style="display:inline-block;padding:15px 34px;font-family:$sans;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#ffffff;text-decoration:none;">$cta</a></td></tr></table></td></tr>
<tr><td class="yza-pad" style="padding:26px 40px 0;"><p style="margin:0;font-family:$serif;font-style:italic;font-size:15px;line-height:1.6;color:#767676;">$ps</p></td></tr>
<tr><td class="yza-pad" style="padding:18px 40px 32px;"><p style="margin:0;font-family:$sans;font-size:14px;color:#2e2e2e;"><span style="font-weight:500;">Nawal</span>, <span style="color:#767676;">$sig</span></p></td></tr>
<tr><td class="yza-pad" style="padding:20px 40px 32px;border-top:1px solid rgba(46,46,46,0.10);"><p style="margin:0;font-family:$sans;font-size:11px;line-height:1.7;color:#9a958a;">$foot<br>YZA &middot; 66 rue Yougoslavie, Gu&eacute;liz, Marrakech</p></td></tr>
</table></td></tr></table></body></html>
HTML;

  $codeText = ($code !== '') ? $codeLabel . ' : ' . $code . '. ' . $codeNote . "\n\n" : '';
  $text = trim(strip_tags($lede . "\n\n" . $codeText . implode("\n\n", $paras) . "\n\n" . $cta . ': ' . $ctaUrl . "\n\n" . $ps . "\n\nNawal, " . $sig . "\n\n" . $foot));
  return array($subject, $html, $text);
}
