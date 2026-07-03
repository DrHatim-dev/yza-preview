<?php
/* YZA — server-side per-product <head> for crawlers & link previews (SEO/share fix).
   Reads the static produit.html shell and stamps the correct title/description/canonical/
   og/twitter/H1 + Product JSON-LD for the requested handle, from data/products-seo.json.
   The page still hydrates client-side exactly as before — this only fixes what non-JS
   crawlers (Bing, AI bots) and link scrapers (WhatsApp, iMessage) see.
   STAGED: reachable at /produit-seo.php?handle=... ; go-live is a one-line .htaccess swap. */

$dir    = __DIR__;
$handle = isset($_GET['handle']) ? preg_replace('/[^a-z0-9-]/', '', (string) $_GET['handle']) : '';
$shell  = @file_get_contents($dir . '/produit.html');
if ($shell === false) { http_response_code(500); echo 'shell missing'; exit; }

$map = json_decode(@file_get_contents($dir . '/data/products-seo.json'), true);
$p   = ($handle && is_array($map) && isset($map[$handle])) ? $map[$handle] : null;

header('Content-Type: text/html; charset=utf-8');

/* Unknown/removed handle: keep the shell working for humans but tell crawlers not to index. */
if (!$p) {
  http_response_code(404);
  $shell = preg_replace('#</title>#', '</title>' . "\n" . '<meta name="robots" content="noindex,follow">', $shell, 1);
  echo $shell;
  exit;
}

$e   = function ($s) { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); };
$name  = $e($p['name']);
$title = $e($p['title']);
$desc  = $e($p['desc']);
$image = $e($p['image']);
$url   = $e($p['url']);
$price = isset($p['price']) && $p['price'] !== null ? (float) $p['price'] : null;

$rep = function ($pattern, $replacement, $html) {
  $out = preg_replace($pattern, $replacement, $html, 1);
  return $out === null ? $html : $out;
};

$shell = $rep('#<title>.*?</title>#s', '<title>' . $title . '</title>', $shell);
$shell = $rep('#<meta name="description" content="[^"]*"#', '<meta name="description" content="' . $desc . '"', $shell);
$shell = $rep('#<link rel="canonical" href="[^"]*"#', '<link rel="canonical" href="' . $url . '"', $shell);
$shell = $rep('#<meta property="og:title" content="[^"]*"#', '<meta property="og:title" content="' . $title . '"', $shell);
$shell = $rep('#<meta property="og:description" content="[^"]*"#', '<meta property="og:description" content="' . $desc . '"', $shell);
$shell = $rep('#<meta property="og:image" content="[^"]*"#', '<meta property="og:image" content="' . $image . '"', $shell);
$shell = $rep('#<meta property="og:url" content="[^"]*"#', '<meta property="og:url" content="' . $url . '"', $shell);
$shell = $rep('#<meta name="twitter:title" content="[^"]*"#', '<meta name="twitter:title" content="' . $title . '"', $shell);
$shell = $rep('#<meta name="twitter:description" content="[^"]*"#', '<meta name="twitter:description" content="' . $desc . '"', $shell);
$shell = $rep('#<meta name="twitter:image" content="[^"]*"#', '<meta name="twitter:image" content="' . $image . '"', $shell);
/* fr + x-default hreflang should point at the product URL, not the shell */
$shell = $rep('#<link rel="alternate" hreflang="fr" href="[^"]*"#', '<link rel="alternate" hreflang="fr" href="' . $url . '"', $shell);
$shell = $rep('#<link rel="alternate" hreflang="x-default" href="[^"]*"#', '<link rel="alternate" hreflang="x-default" href="' . $url . '"', $shell);
$shell = $rep('#<h1 id="pName">[^<]*</h1>#', '<h1 id="pName">' . $name . '</h1>', $shell);

/* Product JSON-LD injected before </head> (single, truthful availability). */
$ld = array(
  '@context' => 'https://schema.org',
  '@type'    => 'Product',
  'name'     => $p['name'],
  'image'    => $p['image'],
  'description' => $p['desc'],
  'brand'    => array('@type' => 'Brand', 'name' => 'YZA'),
  'url'      => $p['url'],
);
if ($price !== null) {
  $ld['offers'] = array(
    '@type' => 'Offer',
    'price' => $price,
    'priceCurrency' => 'MAD',
    'availability'  => 'https://schema.org/InStock',
    'url' => $p['url'],
  );
}
$json = json_encode($ld, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
$shell = $rep('#</head>#', '<script type="application/ld+json" id="productSeoLd">' . $json . '</script>' . "\n</head>", $shell);

echo $shell;
