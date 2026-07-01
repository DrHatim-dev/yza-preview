<?php
/* YZA — best-effort order email. Receives the checkout JSON and mails a copy to
   info@yza-shop.com. The buyer's real confirmation happens over WhatsApp; this is
   just a record, so failures are non-fatal (the JS ignores the result). */
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

$to    = 'info@yza-shop.com';
$order = isset($data['order']) && is_array($data['order']) ? $data['order'] : array();
$ship  = isset($order['shipping']) && is_array($order['shipping']) ? $order['shipping'] : array();

$clean = function ($v, $max = 160) { return substr(preg_replace('/[\r\n]+/', ' ', (string)$v), 0, $max); };
$name   = isset($ship['name']) ? $clean($ship['name'], 120) : 'Client';
$total  = isset($order['subtotalDh']) ? intval($order['subtotalDh']) : '';
$method = isset($order['methodLabel']) ? $clean($order['methodLabel'], 60) : '';
$buyer  = isset($ship['email']) ? trim((string)$ship['email']) : '';

$subject = 'YZA — nouvelle commande' . ($total !== '' ? ' (' . $total . ' DH)' : '') . ($method ? ' · ' . $method : '') . ' — ' . $name;
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

echo json_encode(array('ok' => (bool)$sent));
