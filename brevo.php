<?php
/* YZA — tiny Brevo (Sendinblue) client. Shared by subscribe.php, cart-capture.php
   and contact.php. Design goals:
     - Fail-soft ALWAYS. A Brevo hiccup must never break a sign-up, a checkout or
       a contact message. Every function returns false on any problem; callers
       keep their local file + mail() behaviour as the safety net.
     - Zero config = zero effect. If .private/brevo.php is missing or the api_key
       is empty/placeholder, yza_brevo_enabled() is false and every call no-ops.
     - No dependencies beyond cURL (present on Hostinger). */

if (!defined('YZA_BREVO_API')) { define('YZA_BREVO_API', 'https://api.brevo.com/v3'); }

/* Load and cache the config array from .private/brevo.php (returns null if absent). */
function yza_brevo_config() {
  static $cfg = false;
  if ($cfg !== false) { return $cfg; }
  $path = __DIR__ . '/.private/brevo.php';
  $cfg = is_file($path) ? @include $path : null;
  if (!is_array($cfg)) { $cfg = null; }
  return $cfg;
}

/* True only when a real-looking API key is configured. */
function yza_brevo_enabled() {
  $cfg = yza_brevo_config();
  if (!$cfg || empty($cfg['api_key'])) { return false; }
  $k = trim((string) $cfg['api_key']);
  if ($k === '' || stripos($k, 'PASTE') !== false) { return false; }
  return true;
}

/* Low-level request. Returns array('ok'=>bool,'code'=>int,'body'=>string) or false. */
function yza_brevo_request($method, $path, $payload = null) {
  if (!yza_brevo_enabled() || !function_exists('curl_init')) { return false; }
  $cfg = yza_brevo_config();
  $ch = curl_init(YZA_BREVO_API . $path);
  if (!$ch) { return false; }
  $headers = array(
    'accept: application/json',
    'content-type: application/json',
    'api-key: ' . $cfg['api_key'],
  );
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, 6);          // hard cap: never hang the visitor
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 4);
  if ($payload !== null) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
  }
  $body = curl_exec($ch);
  if ($body === false) { curl_close($ch); return false; }
  $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  return array('ok' => ($code >= 200 && $code < 300), 'code' => $code, 'body' => (string) $body);
}

/* Create-or-update a contact and (optionally) add it to a list.
   $attributes: e.g. array('FIRSTNAME'=>'Sara','WHATSAPP'=>'+212...','LANGUE'=>'fr').
   NOTE: any attribute key you pass must already exist in Brevo (Contacts →
   Settings → Contact attributes) or Brevo rejects the whole call. */
function yza_brevo_upsert_contact($email, $attributes = array(), $listId = 0) {
  if (!yza_brevo_enabled()) { return false; }
  $attributes = array_filter($attributes, function ($v) { return $v !== '' && $v !== null; });
  $listIds = $listId ? array((int) $listId) : null;

  $payload = array('email' => $email, 'updateEnabled' => true);
  if (!empty($attributes)) { $payload['attributes'] = $attributes; }
  if ($listIds) { $payload['listIds'] = $listIds; }
  $res = yza_brevo_request('POST', '/contacts', $payload);
  if (is_array($res) && $res['ok']) { return true; }

  // Resilience: an unknown custom attribute makes Brevo reject the WHOLE call
  // (400). Retry with e-mail + list only, so a not-yet-created attribute never
  // stops the contact from landing in the list — it just isn't enriched this
  // time. Once the attribute exists in Brevo, the next submit fills it in.
  if (!empty($attributes)) {
    $payload = array('email' => $email, 'updateEnabled' => true);
    if ($listIds) { $payload['listIds'] = $listIds; }
    $res = yza_brevo_request('POST', '/contacts', $payload);
    return is_array($res) ? $res['ok'] : false;
  }
  return false;
}

/* Send a transactional e-mail with raw HTML (used for the built-in multilingual
   welcome mail). Returns true on a 2xx from Brevo. */
function yza_brevo_send_email($toEmail, $toName, $subject, $html, $text = '') {
  if (!yza_brevo_enabled()) { return false; }
  $cfg = yza_brevo_config();
  $payload = array(
    'sender' => array('email' => $cfg['sender_email'], 'name' => isset($cfg['sender_name']) ? $cfg['sender_name'] : 'YZA'),
    'to'     => array(array('email' => $toEmail, 'name' => $toName !== '' ? $toName : $toEmail)),
    'subject' => $subject,
    'htmlContent' => $html,
  );
  if ($text !== '') { $payload['textContent'] = $text; }
  if (!empty($cfg['reply_to'])) { $payload['replyTo'] = array('email' => $cfg['reply_to']); }
  $res = yza_brevo_request('POST', '/smtp/email', $payload);
  return is_array($res) ? $res['ok'] : false;
}

/* Send a transactional e-mail from a Brevo template (client-editable path).
   $params are exposed to the template as {{ params.KEY }}. */
function yza_brevo_send_template($toEmail, $toName, $templateId, $params = array()) {
  if (!yza_brevo_enabled() || !$templateId) { return false; }
  $cfg = yza_brevo_config();
  $payload = array(
    'to' => array(array('email' => $toEmail, 'name' => $toName !== '' ? $toName : $toEmail)),
    'templateId' => (int) $templateId,
  );
  if (!empty($params)) { $payload['params'] = $params; }
  if (!empty($cfg['reply_to'])) { $payload['replyTo'] = array('email' => $cfg['reply_to']); }
  $res = yza_brevo_request('POST', '/smtp/email', $payload);
  return is_array($res) ? $res['ok'] : false;
}
