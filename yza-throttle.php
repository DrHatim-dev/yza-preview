<?php
/* YZA — lightweight, FAIL-OPEN per-IP rate limiter for the public POST endpoints
   (order.php, subscribe.php, cart-capture.php). Stops single-source flooding
   (mass mail / disk-fill / fake-order spam) without ever blocking a genuine
   customer: if anything in here goes wrong, it ALLOWS the request. Stores recent
   request timestamps in .private/rl/ (which is itself HTTP-protected). Fetching
   this file directly over HTTP only defines a function and prints nothing. */
if (!function_exists('yza_throttle')) {
  function yza_throttle($bucket, $max = 30, $window = 60) {
    try {
      $ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';
      if ($ip === '') { return true; }                       // no IP → don't block
      $dir = __DIR__ . '/.private/rl';
      if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
      if (!is_dir($dir)) { return true; }                    // can't store → fail open
      $key  = preg_replace('/[^a-z0-9]/i', '', (string) $bucket) . '_' . md5($ip);
      $file = $dir . '/' . $key . '.txt';
      $now  = time();
      $fp = @fopen($file, 'c+');
      if (!$fp) { return true; }                             // fail open
      @flock($fp, LOCK_EX);
      $raw = stream_get_contents($fp);
      $stamps = array();
      if ($raw) {
        foreach (explode(',', $raw) as $s) {
          $s = (int) $s;
          if ($s > 0 && ($now - $s) < $window) { $stamps[] = $s; }
        }
      }
      $allow = count($stamps) < (int) $max;
      if ($allow) { $stamps[] = $now; }
      @ftruncate($fp, 0); @rewind($fp); @fwrite($fp, implode(',', $stamps));
      @flock($fp, LOCK_UN); @fclose($fp);
      return $allow;
    } catch (Throwable $e) {
      return true;                                            // any error → never block a real order
    }
  }
}
