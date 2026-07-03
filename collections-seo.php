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

/* Server-rendered product cards inside #collectionGrid — so crawlers and first
   paint see real products (name, image, price, deep link) instead of an empty
   grid until the 140 KB products.js JS finishes parsing. The client render then
   replaces this content on hydration (renderCollections sets grid.innerHTML). */
$prod = json_decode(@file_get_contents($dir . '/data/products-seo.json'), true);
$catMap = array(
  'charms'      => array('charms'),
  'bags'        => array('bags'),
  'accessories' => array('earrings', 'necklaces'),
  'earrings'    => array('earrings'),
  'necklaces'   => array('necklaces'),
  'rtw'         => array('tops', 'pareos', 'pants'),
  'tops'        => array('tops'),
  'pareos'      => array('pareos'),
  'pants'       => array('pants'),
  'bottoms'     => array('pareos', 'pants'),
);
$wanted = isset($catMap[$cat]) ? $catMap[$cat] : array();
$cards = ''; $ldItems = array(); $pos = 0;
if (is_array($prod) && $wanted) {
  foreach ($prod as $handle => $item) {
    if (!is_array($item) || !in_array(($item['category'] ?? ''), $wanted, true)) { continue; }
    $pos++;
    $name  = $e($item['name']);
    $img   = $e($item['image']);
    $purl  = $e($item['url']);
    $priceRaw = isset($item['price']) ? (int) $item['price'] : 0;
    $priceTxt = $priceRaw > 0 ? number_format($priceRaw, 0, ',', ' ') . ' DH' : '';
    $cards .= '<article class="product-card" data-server-render="1">'
      . '<a class="product-card__link" href="' . $purl . '">'
      . '<img class="product-card__img" src="' . $img . '" alt="' . $name . '" width="600" height="750" loading="' . ($pos <= 4 ? 'eager' : 'lazy') . '">'
      . '<h3 class="product-card__name">' . $name . '</h3>'
      . ($priceTxt !== '' ? '<p class="product-card__price">' . $priceTxt . '</p>' : '')
      . '</a></article>';
    $ldItems[] = array(
      '@type'    => 'ListItem',
      'position' => $pos,
      'url'      => $item['url'],
      'name'     => $item['name'],
      'image'    => $item['image'],
    );
    if ($pos >= 24) { break; }
  }
}
if ($cards !== '') {
  $shell = $rep('#(<div class="product-grid" id="collectionGrid")([^>]*)>[^<]*</div>#', '$1$2>' . $cards . '</div>', $shell);
}
$ldItemList = array(
  '@context'        => 'https://schema.org',
  '@type'           => 'ItemList',
  'name'            => $c['name'],
  'itemListElement' => $ldItems,
);
$ilJson = $ldItems ? json_encode($ldItemList, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) : '';

$shell = $rep('#</head>#',
  '<script type="application/ld+json" id="collectionSeoLd">' . $json . '</script>' . "\n" .
  '<script type="application/ld+json" id="breadcrumbSeoLd">' . $bcJson . '</script>' . "\n" .
  ($ilJson ? '<script type="application/ld+json" id="itemListSeoLd">' . $ilJson . '</script>' . "\n" : '') .
  '</head>', $shell);

echo $shell;
