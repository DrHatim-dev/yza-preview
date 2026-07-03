<?php
/* YZA — server-side per-category <head> for crawlers & link previews.
   Reads the static collections.html shell and stamps the right title/description/canonical/
   og/H1 + CollectionPage JSON-LD for the requested category, from data/collections-seo.json.
   The page still hydrates client-side exactly as before.
   Reached at /collections-seo.php?cat=... (the .htaccess routes /collections/<slug> here). */

$dir   = __DIR__;
$cat   = isset($_GET['cat']) ? preg_replace('/[^a-z0-9-]/', '', (string) $_GET['cat']) : '';
$shell = @file_get_contents($dir . '/collections.html');
if ($shell === false) { http_response_code(500); echo 'shell missing'; exit; }

$map = json_decode(@file_get_contents($dir . '/data/collections-seo.json'), true);
$c   = ($cat && is_array($map) && isset($map[$cat])) ? $map[$cat] : null;

header('Content-Type: text/html; charset=utf-8');

/* Unknown cat: the "all products" shell is still a valid page, so serve it unchanged. */
if (!$c) { echo $shell; exit; }

$e     = function ($s) { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); };
$name  = $e($c['name']);
$title = $e($c['title']);
$desc  = $e($c['desc']);
$image = $e($c['image']);
$url   = $e($c['url']);

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
/* Static H1 text for crawlers (the JS re-renders it live). */
$shell = $rep('#(<span id="collectionTitleText"[^>]*>)[^<]*(</span>)#', '$1' . $name . '$2', $shell);

$ld = array(
  '@context' => 'https://schema.org',
  '@type'    => 'CollectionPage',
  'name'     => $c['name'],
  'description' => $c['desc'],
  'url'      => $c['url'],
  'image'    => $c['image'],
  'isPartOf' => array('@type' => 'WebSite', 'name' => 'YZA', 'url' => 'https://yza-shop.com'),
);
$json = json_encode($ld, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

/* BreadcrumbList (Accueil › Boutique › catégorie) for the SERP breadcrumb rich result. */
$bc = array(
  '@context' => 'https://schema.org',
  '@type'    => 'BreadcrumbList',
  'itemListElement' => array(
    array('@type' => 'ListItem', 'position' => 1, 'name' => 'Accueil',  'item' => 'https://yza-shop.com/'),
    array('@type' => 'ListItem', 'position' => 2, 'name' => 'Boutique', 'item' => 'https://yza-shop.com/collections'),
    array('@type' => 'ListItem', 'position' => 3, 'name' => $c['name'], 'item' => $c['url']),
  ),
);
$bcJson = json_encode($bc, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
$shell = $rep('#</head>#',
  '<script type="application/ld+json" id="collectionSeoLd">' . $json . '</script>' . "\n" .
  '<script type="application/ld+json" id="breadcrumbSeoLd">' . $bcJson . '</script>' . "\n</head>", $shell);

echo $shell;
