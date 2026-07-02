/* ============================================================
 YZA - SHARED CHROME
 Header, footer, mobile menu, search, and cart drawer.
 ============================================================ */
window.YZA = window.YZA || {};

/* Self-heal: the previous site on this domain (a WordPress/page-builder placeholder)
   may have registered a service worker that keeps serving its old cached "trans-*"
   shell from the visitor's browser, ignoring what the server now returns. The moment
   the real YZA site loads, tear down any leftover worker + offline caches so the
   stale page can never come back. Harmless when there's nothing to clean. */
(function killStaleServiceWorker() {
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistrations) {
      navigator.serviceWorker.getRegistrations()
        .then(function (regs) { regs.forEach(function (r) { r.unregister(); }); })
        .catch(function () {});
    }
    if (window.caches && caches.keys) {
      caches.keys()
        .then(function (keys) { keys.forEach(function (k) { caches.delete(k); }); })
        .catch(function () {});
    }
  } catch (e) {}
})();

// Clean-URL slugs — mirrors the map in main.js and the rewrites in .htaccess.
// Duplicated locally (not read from YZA.collectionUrl) because chrome.js executes
// before main.js in script load order, so main.js's globals aren't set yet here.
const CAT_SLUGS_REV = { bags: 'sacs', accessories: 'bijoux', rtw: 'pret-a-porter', charms: 'charms', earrings: 'boucles-d-oreilles', necklaces: 'colliers', tops: 'hauts', pareos: 'jupes-pareo', pants: 'pantalons', bottoms: 'bas' };
const collectionUrl = (cat) => { const slug = CAT_SLUGS_REV[cat]; return slug ? `/collections/${slug}` : '/collections'; };
const productUrl = (handle) => handle ? `/produits/${encodeURIComponent(handle)}` : 'produit.html';
const WORDMARK = '<img class="logo__img" src="assets/brand/yza-logo-real.webp" alt="YZA" width="2930" height="865" decoding="async">';
const FOOTER_CHEV = '<svg class="footer__col-chev" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.6 6 6.4 11 1.6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CART_CHEV = '<svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.6 6 6.4 11 1.6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const LANG_CODES = ['fr', 'en', 'es', 'tr', 'ar'];
const flagImg = (cc) => `<img aria-hidden="true" class="lang-flag" src="assets/flags/${cc}.svg" alt="" width="22" height="16" decoding="async">`;
const LANG_META_SAFE = {
 fr: { label: 'FR', flag: flagImg('fr') },
 en: { label: 'EN', flag: flagImg('gb') },
 es: { label: 'ES', flag: flagImg('es') },
 tr: { label: 'TR', flag: flagImg('tr') },
 ar: { label: 'AR', flag: flagImg('ma') },
};
const langSwitcher = () => {
 const current = YZA.i18n?.lang || 'fr';
 const meta = LANG_META_SAFE;
 return `<div class="lang-select" data-lang-menu>
 <button class="lang-select__button" type="button" data-lang-trigger aria-haspopup="listbox" aria-expanded="false" aria-label="${YZA.i18n.t('lang.label')}">
 <span class="lang-select__flag" data-lang-flag>${meta[current]?.flag || meta.fr.flag}</span>
 <span class="lang-select__code" data-lang-current>${meta[current]?.label || meta.fr.label}</span>
 <span class="lang-select__chevron" aria-hidden="true"></span>
 </button>
 <div class="lang-select__menu" role="listbox">
 ${LANG_CODES.map((code) => `<button type="button" role="option" data-lang-btn="${code}" aria-selected="${code === current ? 'true' : 'false'}">
 <span>${meta[code].flag}</span><strong>${meta[code].label}</strong>
 </button>`).join('')}
 </div>
 </div>`;
};

const ICON = {
 search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
 cart: '<svg class="cart-svg" viewBox="0 0 21 20" aria-hidden="true" focusable="false"><path d="M16.0995 20H4.89828C3.65924 20 2.58102 19.1502 2.28655 17.9403L0.0734934 8.8974C-0.11678 8.09085 0.0666979 7.24101 0.574094 6.58711C1.08375 5.93549 1.8607 5.55044 2.68522 5.54589H5.79755C5.31054 -1.85205 15.6895 -1.84521 15.2002 5.54589C16.3758 5.54589 17.4427 5.54589 18.3126 5.54589C19.1371 5.55272 19.914 5.93549 20.4237 6.58939C20.9333 7.24101 21.1168 8.09313 20.9265 8.89968L18.7135 17.9403C18.419 19.1502 17.3408 20.0023 16.1018 20H16.0995ZM2.68522 6.96988C2.29335 6.97216 1.92639 7.15443 1.68402 7.46201C1.44391 7.77187 1.35557 8.17287 1.44618 8.55564L3.65924 17.5963C3.79741 18.1704 4.30934 18.5737 4.89602 18.5714H16.0972C16.6839 18.5714 17.1958 18.1682 17.334 17.5963L19.5471 8.55564C19.6377 8.17287 19.5493 7.7696 19.3092 7.46201C19.0669 7.15215 18.6999 6.96988 18.3103 6.9676C16.1788 6.9676 12.8671 6.9676 9.66871 6.9676H2.68522V6.96988ZM7.21327 5.54589C9.28137 5.54589 11.7708 5.54589 13.7845 5.54589C14.2851 0.027626 6.71041 0.0299044 7.21327 5.54589Z" fill="currentColor"/></svg>',
 heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.3-9-8.3C1.4 8.4 3.4 5 6.8 5c2 0 3.3 1.1 4.1 2.2C11.8 6.1 13.1 5 15.2 5c3.3 0 5.4 3.4 3.8 6.7C17 15.7 12 20 12 20z"/></svg>',
 close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 burger: '<svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
 question: '<svg viewBox="0 0 24 24"><path d="M5 6.5A5.5 5.5 0 0 1 10.5 1h3A5.5 5.5 0 0 1 19 6.5v3A5.5 5.5 0 0 1 13.5 15H10l-5 4v-4.6A5.5 5.5 0 0 1 5 9.5z"/><path d="M10.2 6.4a2.1 2.1 0 0 1 3.9 1.1c0 1.7-2.1 1.7-2.1 3.2"/><path d="M12 13.2h.01"/></svg>',
 // Lucide MessageCircle, sourced from lucide.dev, kept inline so the lead CTA is neutral and fast.
 message: '<svg viewBox="0 0 24 24"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/></svg>',
};

const logoImg = (src, alt, width, height) => `<img src="${src}" alt="${alt}" loading="lazy" width="${width}" height="${height}" decoding="async">`;
const MAP_LOGO = {
  waze: logoImg('assets/brand/map-logos/waze-logo.png', 'Waze', 1024, 296),
  google: logoImg('assets/brand/map-logos/google-maps-icon.svg', 'Google Maps', 256, 367),
  apple: logoImg('assets/brand/map-logos/apple-maps-icon.svg', 'Apple Plans', 512, 512),
};

const phoneDigits = () => (YZA.brand.whatsapp || '').replace(/\D/g, '');
const waUrl = (message) => `https://wa.me/${phoneDigits()}?text=${encodeURIComponent(message)}`;
const mapLinks = () => {
 const q = encodeURIComponent(YZA.brand.mapsQuery || YZA.brand.address || 'YZA Marrakech');
 return {
 waze: `https://waze.com/ul?q=${q}&navigate=yes`,
 google: `https://www.google.com/maps/search/?api=1&query=${q}`,
 apple: `https://maps.apple.com/?q=${q}`,
 };
};

const productDisplayName = (p) => p?.displayName || p?.name || {};
const formatProductPrice = (p) => {
 const t = YZA.i18n;
 if (Array.isArray(p.displayPriceRange) && p.displayPriceRange.length >= 2) {
 const [min, max] = p.displayPriceRange;
 return min === max ? t.formatPrice(min) : `${t.formatPrice(min)} - ${t.formatPrice(max)}`;
 }
 return t.formatPrice(p.price);
};

/* Desktop mega-menu nav. Full-width panels with categorized links and
 editorial feature cards; every page is reachable from the header.
 Mobile (<=860px) hides .nav and uses the drawer accordion instead. */
const navMega = (active) => {
 const t = YZA.i18n;
 const cur = (key) => (key === active ? ' aria-current="page"' : '');

 // Left category rail — Jacquemus-style stacked text links, in visual groups
 // (a "view all / new in" group, then the categories). Each entry is [i18nKey, href].
 const railLink = (entry) => {
   const [key, href] = entry;
   return `<li><a href="${href}" data-i18n="${key}"${cur(key)}>${t.t(key)}</a></li>`;
 };
 const rail = (groups, extra = '') =>
   `<nav class="mega__nav" aria-label="${t.t('a.menu')}">${groups
     .map((items) => `<ul class="mega__nav-list">${items.map(railLink).join('')}</ul>`)
     .join('')}${extra}</nav>`;

 // Centre product grid — square light-grey thumbnails, piece name beneath.
 // Real YZA products, deduped by family, pulled live from the catalogue.
 const repOf = (p) => (typeof YZA.familyRepresentative === 'function' ? YZA.familyRepresentative(p) : p);
 const megaPicks = () => {
   const seen = new Set();
   const out = [];
   const take = (cat, n) => {
     const list = typeof YZA.byCategory === 'function' ? YZA.byCategory(cat) : [];
     let added = 0;
     for (const item of list) {
       const rep = repOf(item);
       if (!rep || !rep.img) continue;
       const key = rep.familyHandle || rep.handle;
       if (seen.has(key)) continue;
       seen.add(key);
       out.push(rep);
       if (++added >= n) break;
     }
   };
   take('bags', 2); take('charms', 2); take('rtw', 1); take('accessories', 1);
   return out.slice(0, 6);
 };
 const megaProd = (p) => {
   const name = t.pick(productDisplayName(p));
   return `<a class="mega-prod" href="${productUrl(p.handle)}">
 <span class="mega-prod__media"><img src="${p.img}" alt="${name} - YZA" loading="lazy" width="360" height="450" decoding="async"></span>
 <span class="mega-prod__name">${name}</span>
 </a>`;
 };
 const products = (items) => `<div class="mega__products">${items.map(megaProd).join('')}</div>`;

 // Right lifestyle image with caption + discover link.
 const hero = (href, img, title, w, h) =>
   `<a class="mega__hero" href="${href}">
 <img aria-hidden="true" src="${img}" alt="" loading="lazy" width="${w}" height="${h}" decoding="async">
 <span class="mega__hero-cap"><strong>${title}</strong><span class="mega__hero-link" data-i18n="cta.discover">${t.t('cta.discover')}</span></span>
 </a>`;

 // Top-level item is a real link to the section landing page (click navigates),
 // while the mega panel still opens on hover/focus (CSS). Sub-pages stay reachable.
 const trigger = (labelKey, href, inner, noprod) =>
 `<div class="nav-item nav-item--mega">
 <a href="${href}" class="nav-trigger" aria-haspopup="true" aria-expanded="false" data-i18n="${labelKey}"${cur(labelKey)}>${t.t(labelKey)}<span class="nav-trigger__chev" aria-hidden="true"></span></a>
 <div class="mega"><div class="container-wide mega__inner${noprod ? ' mega__inner--noprod' : ''}">${inner}</div></div>
 </div>`;
 const navLink = (labelKey, href) =>
 `<div class="nav-item"><a href="${href}" data-i18n="${labelKey}"${cur(labelKey)}>${t.t(labelKey)}</a></div>`;

 const boutique = trigger('footer.shop', '/collections',
   rail([
     [['col.all', '/collections'], ['badge.new', '/collections']],
     [['nav.charms', collectionUrl('charms')], ['nav.bags', collectionUrl('bags')], ['nav.rtw', collectionUrl('rtw')], ['nav.accessories', collectionUrl('accessories')], ['nav.b2b', 'grossistes']],
   ]) +
   products(megaPicks()) +
   hero(collectionUrl('bags'), 'assets/story/nawal-bag-garden.jpg', 'La Sculpture', 1280, 853));

 const maison = trigger('footer.house', 'histoire',
   rail([
     [['nav.story', 'histoire'], ['nav.studio', 'studio']],
     [['nav.girls', 'yza-girls'], ['nav.journal', 'journal']],
   ]) +
   hero('studio', 'assets/editorial/dataset/artisanes-atelier-raffia.jpg', 'L’atelier', 1200, 800), true);

 const aide = trigger('footer.help', 'faq',
   rail([
     [['nav.faq', 'faq'], ['nav.contact', 'contact']],
     [['pp.acc.ship', 'faq#livraison']],
   ], `<div class="mega__studio-block"><address class="mega__studio">${YZA.brand.address}<br>${t.pick(YZA.brand.hours)}</address></div>`) +
   hero('contact', 'assets/yza-girls/girls-fanny-look.jpg', t.t('nav.contact'), 800, 1066), true);

 // "The House" mega replaced by a plain YZA Studio link → studio (no dropdown).
 const studioLink = `<div class="nav-item"><a href="studio"${(active === 'nav.studio' || active === 'footer.house') ? ' aria-current="page"' : ''}>YZA Studio</a></div>`;
 return navLink('badge.new', '/collections') + navLink('nav.charms', collectionUrl('charms')) + navLink('nav.bags', collectionUrl('bags')) + navLink('nav.rtw', collectionUrl('rtw')) + navLink('nav.accessories', collectionUrl('accessories')) + studioLink + navLink('nav.b2b', 'grossistes');
};

/* Mobile drawer - nested accordion (uppercase heads, thin +/- toggles,
 featured image card). One section open by default. */
const drawerAccordion = () => {
 const t = YZA.i18n;
 const link = (key, href) => `<a class="acc__link" href="${href}" data-i18n="${key}">${t.t(key)}</a>`;
 const sign = '<span class="acc__sign" aria-hidden="true"></span>';
 const section = (titleKey, open, inner) => `
 <li class="acc${open ? ' is-open' : ''}">
 <button type="button" class="acc__head" aria-expanded="${open ? 'true' : 'false'}">
 <span data-i18n="${titleKey}">${t.t(titleKey)}</span>${sign}
 </button>
 <div class="acc__panel"><div class="acc__panel-inner">${inner}</div></div>
 </li>`;

 // Feature card → YZA Girls with a real girls photo (client: link it to the girls, change the badly-redone bag photo)
 const feature = `
 <a class="acc__feature" href="/yza-girls">
          <img aria-hidden="true" src="assets/yza-girls/girls-rim-violet.jpg" alt="" loading="lazy" width="540" height="675" decoding="async">
 <span class="acc__feature-label" data-i18n="nav.girls">${t.t('nav.girls')}</span>
 </a>`;

 const boutique = [
 link('nav.charms', collectionUrl('charms')),
 link('nav.rtw', collectionUrl('rtw')),
 link('nav.bags', collectionUrl('bags')),
 link('nav.accessories', collectionUrl('accessories')),
 link('col.all', '/collections'),
 feature,
 ].join('');

 // Stockists lives under YZA Studio, not Boutique (client request)
 const maison = [
 link('nav.story', 'histoire'),
 link('nav.studio', 'studio'),
 link('nav.girls', 'yza-girls'),
 link('nav.b2b', 'grossistes'),
 link('nav.journal', 'journal'),
 ].join('');

 const aide = [
 link('nav.faq', 'faq'),
 link('nav.contact', 'contact'),
 ].join('');

 return `<ul class="acc-list">
 ${section('footer.shop', true, boutique)}
 ${section('footer.house', false, maison)}
 ${section('footer.help', false, aide)}
 </ul>`;
};

const searchCopy = () => {
 const lang = YZA.i18n?.lang || 'fr';
 const copy = {
 fr: {
 title: 'Recherche',
 placeholder: 'Sac, charm, crochet, une couleur de soleil...',
 suggestions: 'Pour commencer',
 hint: 'Tape comme tu parles - on retrouve la pièce, même orthographiée de travers.',
 empty: 'Rien de direct ici. Tente sac, charm, paréo ou crochet - on est là.',
 viewAll: 'Voir toute la collection',
 proof: 'Crochet main, en édition limitée',
 terms: ['Charms crochet', 'Sac sculpture', 'Paréo', 'Foulard', 'Orange', 'Rouge'],
 },
 en: {
 title: 'Search',
 placeholder: 'A bag, a charm, a colour of sun...',
 suggestions: 'Start here',
 hint: 'Type the way you talk - we will find the piece, even if the spelling wanders.',
 empty: 'Nothing direct here. Try bag, charm, pareo or crochet - we are around.',
 viewAll: 'See the whole collection',
 proof: 'Hand crochet, made in limited editions',
 terms: ['Crochet charms', 'Sculpture bag', 'Pareo', 'Scarf', 'Orange', 'Red'],
 },
 es: {
 title: 'Buscar',
 placeholder: 'Un bolso, un charm, un color de sol...',
 suggestions: 'Empieza aqui',
 hint: 'Escribe como hablas - encontramos la pieza, aunque la ortografia se desvie.',
 empty: 'Nada directo aqui. Prueba bolso, charm, pareo o crochet - estamos cerca.',
 viewAll: 'Ver toda la coleccion',
 proof: 'Crochet a mano, en series pequenas',
 terms: ['Charms crochet', 'Bolso sculpture', 'Pareo', 'Panuelo', 'Naranja', 'Rojo'],
 },
 tr: {
 title: 'Arama',
 placeholder: 'Bir canta, bir charm, bir gunes rengi...',
 suggestions: 'Buradan basla',
 hint: 'Konustugun gibi yaz - yazim sasse bile parcayi buluruz.',
 empty: 'Burada dogrudan bir sey yok. Canta, charm, pareo veya krose dene - buradayiz.',
 viewAll: 'Tum koleksiyonu gor',
 proof: 'El isi krose, kucuk serilerde',
 terms: ['Krose charm', 'Sculpture canta', 'Pareo', 'Fular', 'Portakal', 'Kirmizi'],
 },
 ar: {
 title: '\u0628\u062D\u062B',
 placeholder: '\u062D\u0642\u064A\u0628\u0629\u060C \u0634\u0627\u0631\u0645\u060C \u0643\u0631\u0648\u0634\u064A\u0647\u060C \u0644\u0648\u0646 \u0645\u0646 \u0627\u0644\u0634\u0645\u0633...',
 suggestions: '\u0627\u0628\u062F\u0626\u064A \u0645\u0646 \u0647\u0646\u0627',
 hint: '\u0627\u0643\u062A\u0628\u064A \u0643\u0645\u0627 \u062A\u062A\u062D\u062F\u062B\u064A\u0646 \u2014 \u0646\u062C\u062F \u0627\u0644\u0642\u0637\u0639\u0629 \u062D\u062A\u0649 \u0644\u0648 \u062A\u0627\u0647\u062A \u0627\u0644\u0643\u062A\u0627\u0628\u0629.',
 empty: '\u0644\u0627 \u0634\u064A\u0621 \u0645\u0628\u0627\u0634\u0631 \u0647\u0646\u0627. \u062C\u0631\u0628\u064A \u062D\u0642\u064A\u0628\u0629\u060C \u0634\u0627\u0631\u0645\u060C \u0628\u0627\u0631\u064A\u0648 \u0623\u0648 \u0643\u0631\u0648\u0634\u064A\u0647 \u2014 \u0646\u062D\u0646 \u0642\u0631\u064A\u0628\u0648\u0646.',
 viewAll: '\u0634\u0627\u0647\u062F\u064A \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u0643\u0627\u0645\u0644\u0629',
 proof: '\u0643\u0631\u0648\u0634\u064A\u0647 \u064A\u062F\u0648\u064A\u060C \u0628\u0643\u0645\u064A\u0627\u062A \u0635\u063A\u064A\u0631\u0629',
 terms: ['\u0634\u0627\u0631\u0645 \u0643\u0631\u0648\u0634\u064A\u0647', '\u062D\u0642\u064A\u0628\u0629', '\u0628\u0627\u0631\u064A\u0648', '\u0648\u0634\u0627\u062D', '\u0628\u0631\u062A\u0642\u0627\u0644', '\u0623\u062D\u0645\u0631'],
 },
 };
 return copy[lang] || copy.fr;
};

const footerServiceCopy = () => {
 const lang = YZA.i18n?.lang || 'fr';
 const copy = {
 fr: {
 shippingTitle: 'Livraison suivie',
 shippingText: 'Livraison Maroc offerte d\u00e8s 1 500 DH. Et si tu passes, le studio de Gu\u00e9liz t\u2019accueille pour le retrait.',
 helpTitle: 'Besoin d\'aide ? Contactez-nous',
 helpText: 'Tailles, couleurs, id\u00e9es cadeau, ce qui reste en boutique \u2014 \u00e9cris-nous sur WhatsApp, une vraie personne r\u00e9pond.',
 newsTitle: 'Le club YZA Girls',
 newsText: 'Rejoins les YZA Girls : les nouveaux drops en avant-premi\u00e8re, et nos ventes priv\u00e9es d\u2019\u00e9chantillons (les samples de l\u2019atelier) \u00e0 prix doux. Dans ta bo\u00eete avant tout le monde.',
 placeholder: 'Ton e-mail',
 submit: 'Je rejoins',
 },
 en: {
 shippingTitle: 'Tracked delivery',
 shippingText: 'Free Morocco delivery from 1,500 DH. And if you are in town, the Gu\u00e9liz studio is open for pickup.',
 helpTitle: 'We actually answer',
 helpText: 'Sizes, colours, gift ideas, what is still on the shelf \u2014 write to us on WhatsApp, a real person replies.',
 newsTitle: 'The YZA Girls club',
 newsText: 'Join the YZA Girls: new drops in early access, plus private sample sales (the atelier’s samples) at gentle prices. In your inbox before anyone else.',
 placeholder: 'Your e-mail',
 submit: 'Join us',
 },
 es: {
 shippingTitle: 'Envio con seguimiento',
 shippingText: 'Envio gratis en Marruecos desde 1.500 DH. Y si pasas por aqui, el estudio de Gu\u00e9liz te espera para recoger.',
 helpTitle: 'Respondemos de verdad',
 helpText: 'Tallas, colores, ideas de regalo, lo que queda en tienda \u2014 escribenos por WhatsApp, contesta una persona de verdad.',
 newsTitle: 'El club YZA Girls',
 newsText: 'Nuevos drops en preventa — y ventas privadas de muestras (samples del atelier) a precio suave. En tu correo antes que nadie.',
 placeholder: 'Tu e-mail',
 submit: 'Me uno',
 },
 tr: {
 shippingTitle: 'Takipli teslimat',
 shippingText: 'Fas ici 1.500 DH uzeri ucretsiz kargo. Sehirdeysen Gu\u00e9liz studyosu teslim almak icin acik.',
 helpTitle: 'Gercekten cevap veriyoruz',
 helpText: 'Beden, renk, hediye fikri, rafta ne kaldigi \u2014 WhatsApp uzerinden yaz, gercek bir insan cevaplar.',
 newsTitle: 'YZA Girls kulübü',
 newsText: 'Yeni droplar herkesten once — ve ozel numune satislari (atolyenin sample’lari) uygun fiyatlarla, kutuna.',
 placeholder: 'E-posta',
 submit: 'Katiliyorum',
 },
 ar: {
 shippingTitle: 'توصيل متتبع',
 shippingText: 'توصيل مجاني في المغرب ابتداء من 1,500 درهم. وإن مررت بالمدينة، ستوديو كليز يستقبلك للاستلام.',
 helpTitle: 'نجيبك فعلا',
 helpText: 'المقاسات، الالوان، فكرة هدية، ما تبقى في المحل - راسلينا على واتساب، يرد عليك انسان حقيقي.',
 newsTitle: 'نادي YZA Girls',
 newsText: 'أحدث الإصدارات أولاً — وبيع خاص للعيّنات (samples الأتولييه) بأسعار لطيفة، تصلك قبل الجميع.',
 placeholder: 'بريدك الالكتروني',
 submit: 'انضم إلينا',
 },
 };
 return copy[lang] || copy.fr;
};

const footerFactsCopy = () => {
 const lang = YZA.i18n?.lang || 'fr';
 const copy = {
 fr: { studio: 'Studio', hours: 'Horaires', pickup: 'Retrait', delivery: 'Livraison offerte', guarantee: 'Garantie', b2b: 'B2B', stockists: 'Stockistes bienvenus', days: 'jours', country: 'Maroc', lang: 'Français' },
 en: { studio: 'Studio', hours: 'Hours', pickup: 'Pickup', delivery: 'Free delivery', guarantee: 'Guarantee', b2b: 'B2B', stockists: 'Stockists welcome', days: 'days', country: 'Morocco', lang: 'English' },
 es: { studio: 'Studio', hours: 'Horario', pickup: 'Recogida', delivery: 'Envío gratis', guarantee: 'Garantía', b2b: 'B2B', stockists: 'Distribuidores bienvenidos', days: 'días', country: 'Marruecos', lang: 'Español' },
 tr: { studio: 'Stüdyo', hours: 'Saatler', pickup: 'Teslim alma', delivery: 'Ücretsiz teslimat', guarantee: 'Garanti', b2b: 'B2B', stockists: 'Bayiler bekleniyor', days: 'gün', country: 'Fas', lang: 'Türkçe' },
 ar: { studio: 'الستوديو', hours: 'الأوقات', pickup: 'الاستلام', delivery: 'توصيل مجاني', guarantee: 'ضمان', b2b: 'B2B', stockists: 'نرحب بالموزعين', days: 'يوم', country: 'المغرب', lang: 'العربية' },
 };
 return copy[lang] || copy.fr;
};

YZA.chrome = {
 mount(active = '') {
 const t = YZA.i18n;
 const sc = searchCopy();
 this.mountAnalyticsSnippet();
 this.mountSeoTags();
 YZA.analytics?.track('page_view', { title: document.title });

 const head = document.createElement('div');
 head.innerHTML = `
 <div class="announcement">
 <div class="container-wide announcement__inner">
 <p class="announcement__line" data-i18n="announce.unique">${t.t('announce.unique')}</p>
 </div>
 </div>
 <header class="header" id="header">
 <div class="container-wide header__inner">
 <div class="header__left">
 <a class="logo logo--wordmark" href="/" aria-label="YZA - ${t.t('breadcrumb.home')}">${WORDMARK}</a>
 </div>
 <nav class="nav" aria-label="Navigation">${navMega(active)}</nav>
 <div class="header__actions">
 <button type="button" class="header-search" id="searchOpen" data-i18n-attr="aria-label:a.search" aria-label="${t.t('a.search')}"><span data-i18n="a.search">${t.t('a.search')}</span>${ICON.search}</button>
 <div class="lang" role="group" aria-label="${t.t('lang.label')}">${langSwitcher()}</div>
 <button type="button" class="icon-btn cart-btn" data-cart-open data-i18n-attr="aria-label:a.cart" aria-label="${t.t('a.cart')}">${ICON.cart}<span class="cart-count" data-cart-count aria-hidden="true">0</span></button>
 <button type="button" class="icon-btn burger" id="burger" data-i18n-attr="aria-label:a.menu" aria-label="${t.t('a.menu')}">${ICON.burger}</button>
 </div>
 </div>
 </header>`;
 // Mount the announcement + header as DIRECT children of <body> (no wrapper div).
 // position: sticky only sticks within its parent's box, so a short wrapper would
 // clip the header and it would scroll away instead of staying pinned.
 document.body.prepend(...Array.from(head.children));

 // a11y: skip link as the first focusable element + a #main landmark target.
 (function () {
 const mainEl = document.querySelector('main');
 if (mainEl && !mainEl.id) mainEl.id = 'main';
 if (!document.querySelector('.skip-link')) {
 const skip = document.createElement('a');
 skip.className = 'skip-link';
 skip.href = '#main';
 skip.setAttribute('data-i18n', 'a.skip');
 skip.textContent = (window.YZA && YZA.i18n && YZA.i18n.t) ? YZA.i18n.t('a.skip') : 'Aller au contenu';
 document.body.prepend(skip);
 }
 })();

 const drawers = document.createElement('div');
 drawers.innerHTML = `
 <div class="overlay" id="navOverlay"></div>
 <nav class="drawer" id="drawer" aria-label="Menu">
 <div class="drawer__bar">
 <span class="drawer__brand">Menu</span>
 <button type="button" class="icon-btn drawer__close" id="drawerClose" aria-label="${t.t('a.close')}">${ICON.close}</button>
 </div>
 ${drawerAccordion()}
 <div class="drawer__lang lang">${langSwitcher()}</div>
 </nav>

 <div class="search-overlay" id="searchOverlay" role="dialog" aria-modal="true" aria-label="${t.t('a.search')}">
 <div class="search-mega">
 <div class="search-mega__top">
 <a class="logo logo--wordmark" href="/" aria-label="YZA">${WORDMARK}</a>
 <form class="search-box" id="searchForm">
 <input type="search" id="searchInput" name="q" autocomplete="off" placeholder="${sc.placeholder}" aria-label="${sc.title}">
 <button type="submit" class="icon-btn" aria-label="${sc.title}">${ICON.search}</button>
 </form>
 <button type="button" class="icon-btn" id="searchClose" aria-label="${t.t('a.close')}">${ICON.close}</button>
 </div>
 <div class="search-mega__body">
 <aside class="search-mega__suggestions">
 <h2>${sc.suggestions}</h2>
 ${sc.terms.map((term) => `<button type="button" data-search-suggestion="${term}">${term}</button>`).join('')}
 </aside>
 <section class="search-mega__results" aria-live="polite">
 <p class="search-mega__hint" id="searchHint">${sc.hint}</p>
 <div class="search-result-grid" id="searchResults"></div>
 <a class="search-mega__all" id="searchAll" href="/collections">${sc.viewAll}</a>
 </section>
 </div>
 </div>
 </div>

 <div class="overlay" id="cartOverlay"></div>
 <aside class="cart-drawer" id="cartDrawer" aria-label="${t.t('cart.title')}">
 <div class="cart-drawer__head">
 <h2><span data-i18n="cart.count">${t.t('cart.count')}</span> <sup class="cart-drawer__count" data-cart-count></sup></h2>
 <button type="button" class="icon-btn" id="cartClose" aria-label="${t.t('a.close')}">${ICON.close}</button>
 </div>
 <div class="cart-drawer__body" id="cartBody"></div>
 <div class="cart-drawer__foot" id="cartFoot" hidden>
 <div class="cart-progress" data-cart-progress></div>
 <div class="cart-acc">
 <div class="cart-acc__item"><button type="button" class="cart-acc__btn" data-cart-acc><span data-i18n="cart.acc.help">${t.t('cart.acc.help')}</span>${CART_CHEV}</button><div class="cart-acc__panel"><div><a href="https://wa.me/${phoneDigits()}" target="_blank" rel="noopener">WhatsApp ${YZA.brand.whatsappDisplay}</a> · <a href="mailto:${YZA.brand.email}">${YZA.brand.email}</a></div></div></div>
 <div class="cart-acc__item"><button type="button" class="cart-acc__btn" data-cart-acc><span data-i18n="cart.acc.pay">${t.t('cart.acc.pay')}</span>${CART_CHEV}</button><div class="cart-acc__panel"><div><div class="pay-logos"><img src="assets/brand/payment/paypal.svg" alt="PayPal" height="22"><img src="assets/brand/payment/visa.svg" alt="Visa" height="22"><img src="assets/brand/payment/mastercard.svg" alt="Mastercard" height="22"><img src="assets/brand/payment/amex.svg" alt="American Express" height="22"><img src="assets/brand/payment/cod.svg" alt="${t.t('co.pay.cod')}" height="22"></div><p class="cart-acc__note" data-i18n="cart.acc.payTxt">${t.t('cart.acc.payTxt')}</p></div></div></div>
 <div class="cart-acc__item"><button type="button" class="cart-acc__btn" data-cart-acc><span data-i18n="cart.acc.ship">${t.t('cart.acc.ship')}</span>${CART_CHEV}</button><div class="cart-acc__panel"><div data-i18n="cart.acc.shipTxt">${t.t('cart.acc.shipTxt')}</div></div></div>
 </div>
 <div class="cart-foot__discount" data-cart-discount hidden></div>
 <div class="cart-foot__total"><span data-i18n="cart.total">${t.t('cart.total')}<small data-i18n="cart.vat">${t.t('cart.vat')}</small></span><strong data-cart-subtotal>-</strong></div>
 <button class="btn btn--solid btn--block" data-checkout data-i18n="cart.proceed">${t.t('cart.proceed')}</button>
 <a class="btn btn--outline btn--block" href="/checkout" data-i18n="cart.viewCart">${t.t('cart.viewCart')}</a>
 </div>
 </aside>`;
 document.body.append(drawers);

 const serviceKeys = ['morocco-delivery', 'returns', 'payment'];
 const fc = footerFactsCopy();
 const ns = footerServiceCopy();
 const L = (t && t.lang) === 'fr'; // primary FR/EN labels for the newsletter form
 // Pages that ship their own newsletter (e.g. the journal) skip the footer's news column.
 const hasOwnNews = !!document.querySelector('.blog-newsletter, .newsletter');
 const footer = document.createElement('footer');
 footer.className = 'footer';
 footer.innerHTML = `
 <div class="container-wide">
 <div class="footer-service footer-service--trust" data-service-strip="footer" aria-label="YZA services">
 ${serviceKeys.map((key) => YZA.serviceCard(key, 'footer-service__item footer-service__trust-item')).join('')}
 </div>
 <div class="footer__top${hasOwnNews ? ' footer__top--solo' : ''}">
 ${hasOwnNews ? '' : `<div class="footer__top-col footer__newsletter footer__col--acc" data-news-acc>
 <button type="button" class="footer__col-toggle footer__newsletter-head" aria-expanded="false"><span>${ns.newsTitle}</span>${FOOTER_CHEV}</button>
 <p class="footer__newsletter-desc">${ns.newsText}</p>
 <div class="footer__col-panel footer__newsletter-panel">
 <form class="newsletter__form footer-news__form" novalidate>
 <div class="footer-field">
 <label for="footerNewsEmail">${L ? 'E-mail *' : 'Email *'}</label>
 <input id="footerNewsEmail" type="email" required placeholder="${ns.placeholder}" aria-label="${ns.placeholder}">
 </div>
 <div class="footer-field">
 <label for="footerNewsName">${L ? 'Nom & prénom *' : 'Full name *'}</label>
 <input id="footerNewsName" type="text" autocomplete="name" placeholder="${L ? 'Nom & prénom' : 'Full name'}">
 </div>
 <button class="footer-news__btn footer-news__btn--register" type="submit">${ns.submit}</button>
 <p class="form-msg" data-news-msg hidden role="status" aria-live="polite"></p>
 </form>
 </div>
 <button type="button" class="footer-news__cta" data-news-cta>${ns.submit}</button>
 </div>`}
 <div class="footer__top-col footer__contact">
 <h3 class="footer__contact-title">${ns.helpTitle}</h3>
 <p class="footer__contact-hours">${t.pick(YZA.brand.hours)}</p>
 <p class="footer__contact-addr">${YZA.brand.address}</p>
 <div class="footer__contact-links">
 <a href="contact" data-i18n="nav.contact">${t.t('nav.contact')}</a>
 <a href="https://wa.me/${phoneDigits()}" target="_blank" rel="noopener">WhatsApp</a>
 <a href="faq#livraison" data-i18n="pp.acc.ship">${t.t('pp.acc.ship')}</a>
 </div>
 </div>
 </div>
 <div class="footer__nav">
 <div class="footer__nav-cols">
 <div class="footer__col footer__col--acc">
 <button type="button" class="footer__col-toggle" aria-expanded="false"><span data-i18n="footer.shop">${t.t('footer.shop')}</span>${FOOTER_CHEV}</button>
 <div class="footer__col-panel"><ul>
 <li><a href="${collectionUrl('charms')}" data-i18n="nav.charms">${t.t('nav.charms')}</a></li>
 <li><a href="${collectionUrl('rtw')}" data-i18n="nav.rtw">${t.t('nav.rtw')}</a></li>
 <li><a href="${collectionUrl('bags')}" data-i18n="nav.bags">${t.t('nav.bags')}</a></li>
 <li><a href="${collectionUrl('accessories')}" data-i18n="nav.accessories">${t.t('nav.accessories')}</a></li>
 <li><a href="/collections" data-i18n="col.all">${t.t('col.all')}</a></li>
 </ul></div>
 </div>
 <div class="footer__col footer__col--acc">
 <button type="button" class="footer__col-toggle" aria-expanded="false"><span data-i18n="footer.help">${t.t('footer.help')}</span>${FOOTER_CHEV}</button>
 <div class="footer__col-panel"><ul>
 <li><a href="faq" data-i18n="nav.faq">${t.t('nav.faq')}</a></li>
 <li><a href="contact" data-i18n="nav.contact">${t.t('nav.contact')}</a></li>
 <li><a href="faq#livraison" data-i18n="pp.acc.ship">${t.t('pp.acc.ship')}</a></li>
 </ul></div>
 </div>
 <div class="footer__col footer__col--acc">
 <button type="button" class="footer__col-toggle" aria-expanded="false"><span data-i18n="footer.house">${t.t('footer.house')}</span>${FOOTER_CHEV}</button>
 <div class="footer__col-panel"><ul>
 <li><a href="histoire" data-i18n="nav.story">${t.t('nav.story')}</a></li>
 <li><a href="studio" data-i18n="nav.studio">${t.t('nav.studio')}</a></li>
 <li><a href="yza-girls" data-i18n="nav.girls">${t.t('nav.girls')}</a></li>
 <li><a href="journal" data-i18n="nav.journal">${t.t('nav.journal')}</a></li>
 <li><a href="grossistes" data-i18n="nav.b2b">${t.t('nav.b2b')}</a></li>
 <li><a href="mailto:${YZA.brand.email}">${YZA.brand.email}</a></li>
 </ul></div>
 </div>
 </div>
 <div class="footer__nav-follow">
 <h3 class="footer__nav-follow-h" data-i18n="footer.follow">${t.t('footer.follow')}</h3>
 <ul class="footer__nav-follow-list">
 <li><a href="${YZA.brand.instagramUrl}" target="_blank" rel="noopener">Instagram</a></li>
 <li><a href="https://wa.me/${phoneDigits()}" target="_blank" rel="noopener">WhatsApp</a></li>
 </ul>
 </div>
 </div>
 <div class="footer__meta">
 <div class="footer__meta__copy">© <span id="year"></span> YZA / <span data-i18n="footer.rights">${t.t('footer.rights')}</span></div>
 <a class="footer__wordmark footer__meta__logo" href="/" aria-label="YZA – Back to top" role="button" tabindex="0">${WORDMARK}</a>
 <div class="footer__meta__country">${fc.country} · ${fc.lang} / <a href="mentions-legales" data-i18n="footer.legal">${t.t('footer.legal')}</a></div>
 </div>
 </div>`;
 document.body.append(footer);

 // Collapsible footer columns (Jacquemus dropdown style): open on desktop,
 // collapsed accordion on mobile, chevron toggles either way.
 (function () {
 const accs = Array.prototype.slice.call(footer.querySelectorAll('.footer__col--acc'));
 if (!accs.length) return;
 const wide = window.matchMedia('(min-width: 760px)');
 const setOpen = (acc, open) => {
 acc.classList.toggle('is-open', open);
 const btn = acc.querySelector('.footer__col-toggle');
 if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
 };
 const isNews = (acc) => acc.hasAttribute('data-news-acc');
 accs.forEach((acc) => {
 // Nav columns open on desktop; the newsletter form stays collapsed everywhere
 // (Jacquemus shows the black REGISTER CTA until you expand the form).
 setOpen(acc, isNews(acc) ? false : wide.matches);
 const btn = acc.querySelector('.footer__col-toggle');
 // Each column toggles ONLY itself (opening one used to expand the whole menu).
 if (btn) btn.addEventListener('click', () => { setOpen(acc, !acc.classList.contains('is-open')); });
 });
 // The collapsed black "REGISTER" CTA reveals the newsletter form.
 const newsAcc = footer.querySelector('[data-news-acc]');
 const newsCta = footer.querySelector('[data-news-cta]');
 if (newsAcc && newsCta) newsCta.addEventListener('click', () => {
 setOpen(newsAcc, true);
 const email = newsAcc.querySelector('input[type="email"]');
 if (email) email.focus();
 });
 const onBp = () => {}; // grouped re-sync removed — one footer toggle must not move sibling columns
 if (wide.addEventListener) wide.addEventListener('change', onBp);
 else if (wide.addListener) wide.addListener(onBp);
 // Centred wordmark doubles as back-to-top
 const wm = footer.querySelector('.footer__wordmark');
 if (wm) wm.addEventListener('click', (e) => {
 if (document.body.dataset.page === 'home' || location.pathname.endsWith('index.html') || location.pathname === '/') {
 e.preventDefault();
 window.scrollTo({ top: 0, behavior: 'smooth' });
 }
 });
 })();

 this.mountConversionWidgets();
 this.wire();
 const y = document.getElementById('year');
 if (y) y.textContent = new Date().getFullYear();
 },

 mountAnalyticsSnippet() {
 if (document.querySelector('script[data-domain][src*="plausible"]')) return;
 const script = document.createElement('script');
 script.defer = true;
 script.setAttribute('data-domain', 'yza-shop.com');
 script.src = 'https://plausible.io/js/script.js';
 document.head.appendChild(script);
 },

 mountSeoTags() {
 const base = 'https://yza-shop.com';
 const lang = YZA.i18n?.lang || 'fr';
 const title = document.title || 'YZA Marrakech';
 const description = document.head.querySelector('meta[name="description"]')?.getAttribute('content')
 || 'Handmade bags, charms, accessories and resort wear from the YZA atelier in Gueliz, Marrakech.';
 const image = document.head.querySelector('meta[property="og:image"]')?.getAttribute('content')
 || `${base}/assets/hero/la-sculpture-hero-desktop-poster.jpg`;
 const url = new URL(location.href);
 const params = new URLSearchParams(url.search);
 const page = document.body.dataset.page || '';
 let path = url.pathname || '/';
 if (path.endsWith('/index.html')) path = path.slice(0, -10) || '/';
 // Canonicalize to the clean /produits/{handle} and /collections/{slug} URLs regardless
 // of which form the page was actually reached through (old ?handle=/?cat= query links
 // keep working via .htaccess, but every page must declare ONE canonical). Filter/search
 // query params (?q=, ?sort=, ...) always canonicalize up to the clean base — never their own URL.
 if (path === '/produit.html') {
 const handle = params.get('handle');
 path = handle ? `/produits/${encodeURIComponent(handle)}` : '/produit.html';
 } else if (path === '/collections.html') {
 const cat = params.get('cat');
 const slug = cat && CAT_SLUGS_REV[cat];
 path = slug ? `/collections/${slug}` : '/collections';
 } else if (/^\/produits\/[a-zA-Z0-9-]+\/?$/.test(path) || /^\/collections\/[a-z-]+\/?$/.test(path)) {
 path = path.replace(/\/$/, ''); // already clean — just drop any stray query/trailing slash
 }
 const canonical = base + path;

 const ensureLink = (rel, attrs) => {
 const selector = Object.entries(attrs).reduce((acc, [key, value]) => `${acc}[${key}="${value}"]`, `link[rel="${rel}"]`);
 let el = document.head.querySelector(selector);
 if (!el) {
 el = document.createElement('link');
 el.rel = rel;
 Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
 document.head.appendChild(el);
 }
 return el;
 };
 let canon = document.head.querySelector('link[rel="canonical"]');
 if (!canon) {
 canon = document.createElement('link');
 canon.rel = 'canonical';
 document.head.appendChild(canon);
 }
 canon.href = canonical;

 LANG_CODES.forEach((code) => {
 const alt = new URL(canonical);
 alt.searchParams.set('lang', code);
 const link = ensureLink('alternate', { hreflang: code });
 link.href = alt.href;
 });
 const xDefault = ensureLink('alternate', { hreflang: 'x-default' });
 xDefault.href = canonical;

 const meta = (attr, key, content) => {
 let el = document.head.querySelector(`meta[${attr}="${key}"]`);
 if (!el) {
 el = document.createElement('meta');
 el.setAttribute(attr, key);
 document.head.appendChild(el);
 }
 if (!el.getAttribute('content')) el.setAttribute('content', content);
 };
 meta('property', 'og:type', page === 'product' ? 'product' : 'website');
 meta('property', 'og:site_name', 'YZA');
 meta('property', 'og:url', canonical);
 meta('property', 'og:title', title);
 meta('property', 'og:description', description);
 meta('property', 'og:image', image);
 meta('name', 'twitter:card', 'summary_large_image');
 meta('name', 'twitter:title', title);
 meta('name', 'twitter:description', description);
 meta('name', 'twitter:image', image);

 const crumbName = ({
 home: 'Home',
 collections: 'Collection',
 product: 'Product',
 journal: 'Journal',
 histoire: 'Story',
 studio: 'Studio',
 girls: 'YZA Girls',
 b2b: 'B2B',
 lookbook: 'Lookbook',
 faq: 'FAQ',
 contact: 'Contact',
 })[page] || title.replace(/\s+-\s+YZA.*$/i, '');
 const graph = {
 '@context': 'https://schema.org',
 '@graph': [
 {
 '@type': 'WebSite',
 '@id': `${base}/#website`,
 url: `${base}/`,
 name: 'YZA',
 inLanguage: lang,
 potentialAction: {
 '@type': 'SearchAction',
 target: `${base}/collections?q={search_term_string}`,
 'query-input': 'required name=search_term_string',
 },
 },
 {
 '@type': 'Store',
 '@id': `${base}/#store`,
 name: 'YZA',
 url: `${base}/`,
 image,
 telephone: YZA.brand?.whatsappDisplay || YZA.brand?.whatsapp || '',
 email: YZA.brand?.email || '',
 address: {
 '@type': 'PostalAddress',
 streetAddress: '66 rue Yougoslavie',
 addressLocality: 'Marrakech',
 addressRegion: 'Gueliz',
 addressCountry: 'MA',
 },
 },
 {
 '@type': 'BreadcrumbList',
 itemListElement: [
 { '@type': 'ListItem', position: 1, name: 'YZA', item: `${base}/` },
 { '@type': 'ListItem', position: 2, name: crumbName, item: canonical },
 ],
 },
 ],
 };
 let script = document.getElementById('siteLd');
 if (!script) {
 script = document.createElement('script');
 script.type = 'application/ld+json';
 script.id = 'siteLd';
 document.head.appendChild(script);
 }
 script.textContent = JSON.stringify(graph);
 },

 mountConversionWidgets() {
 if (document.getElementById('leadChatOpen')) return;
 const t = YZA.i18n;
 const widgets = document.createElement('div');
 widgets.innerHTML = `
 <button class="lead-chat-fab" id="leadChatOpen" type="button" aria-expanded="false" data-i18n-attr="aria-label:conv.chat.label" aria-label="${t.t('conv.chat.label')}">
 ${ICON.message}<span class="sr-only">${t.t('conv.chat.label')}</span>
 </button>

 <div class="recovery-modal" id="recoveryModal" hidden>
 <div class="recovery-modal__shade" data-recovery-close></div>
 <section class="recovery-card" role="dialog" aria-modal="true" aria-labelledby="recoveryTitle">
 <button class="icon-btn recovery-card__close" type="button" data-recovery-close aria-label="${t.t('a.close')}">${ICON.close}</button>
 <p class="eyebrow" data-i18n="promo.exit.kicker">${t.t('promo.exit.kicker')}</p>
 <h2 id="recoveryTitle" data-i18n="promo.exit.title">${t.t('promo.exit.title')}</h2>
 <p data-i18n="promo.exit.text">${t.t('promo.exit.text')}</p>
 <a class="btn btn--accent btn--block" id="recoveryWhats" href="#" target="_blank" rel="noopener" data-i18n="promo.exit.cta">${t.t('promo.exit.cta')}</a>
 <button class="recovery-card__skip" type="button" data-recovery-close data-i18n="promo.exit.close">${t.t('promo.exit.close')}</button>
 </section>
 </div>`;
 document.body.append(widgets);
 },

 recoveryMessage(source = 'exit') {
 const t = YZA.i18n;
 const promo = YZA.promos?.exitRecovery || { code: 'YZA20', percent: 20, minEuro: 150, minDh: 150000 };
 const cartLines = (YZA.cart?.items || []).map((line) => {
 const p = YZA.getProduct(line.handle);
 return p ? `${line.qty} x ${t.pick(p.name)}` : '';
 }).filter(Boolean);
 const context = cartLines.length
 ? `Panier: ${cartLines.join(', ')}. Sous-total: ${t.formatPrice(YZA.cart.subtotalCents())}.`
 : `Page: ${document.title}.`;
 return [
 `Bonjour YZA, je reflechis a une piece et j aimerais utiliser le code ${promo.code}.`,
 `Le geste: -${promo.percent}% des ${promo.minEuro} EUR / environ ${t.formatPrice(promo.minDh)}.`,
 `Source: ${source}. ${context}`,
 `Lien: ${location.href}`,
 ].join('\n');
 },

 leadMessage(data = {}) {
 const t = YZA.i18n;
 const current = document.body.dataset.page === 'product'
 ? YZA.getProduct?.(new URLSearchParams(location.search).get('handle') || '')
 : null;
 const productLine = current ? `Piece: ${t.pick(productDisplayName(current))}` : `Page: ${document.title}`;
 return [
 'Bonjour YZA, je voudrais demarrer une conversation WhatsApp.',
 productLine,
 data.topic ? `Sujet: ${data.topic}` : 'Sujet: Disponibilite, taille, couleur ou conseil cadeau.',
 `Langue: ${t.lang || 'fr'}`,
 `Lien: ${location.href}`,
 ].join('\n');
 },

 showRecovery(source = 'exit') { return; /* 20% discount exit-popup disabled per owner request */
 if (sessionStorage.getItem('yza.recovery.shown')) return;
 const isProduct = document.body.dataset.page === 'product';
 const isCart = source === 'cart' || document.getElementById('cartDrawer')?.classList.contains('is-open');
 if (!isProduct && !isCart) return;
 const modal = document.getElementById('recoveryModal');
 if (!modal) return;
 const link = document.getElementById('recoveryWhats');
 if (link) link.href = waUrl(this.recoveryMessage(source));
 modal.hidden = false;
 document.body.classList.add('has-recovery-modal');
 modal.classList.add('is-open');
 sessionStorage.setItem('yza.recovery.shown', '1');
 YZA.analytics?.track('exit_recovery_open', { source, isProduct, isCart });
 },

 closeRecovery() {
 const modal = document.getElementById('recoveryModal');
 if (!modal) return;
 modal.classList.remove('is-open');
 document.body.classList.remove('has-recovery-modal');
 setTimeout(() => { modal.hidden = true; }, 220);
 },

 wire() {
 const burger = document.getElementById('burger');
 const drawer = document.getElementById('drawer');
 const navOverlay = document.getElementById('navOverlay');
 const closeNav = () => {
 drawer.classList.remove('is-open');
 navOverlay.classList.remove('is-open');
 document.body.style.overflow = '';
 };
 const openNav = () => {
 drawer.classList.add('is-open');
 navOverlay.classList.add('is-open');
 document.body.style.overflow = 'hidden';
 };
 burger?.addEventListener('click', openNav);
 navOverlay?.addEventListener('click', closeNav);
 document.getElementById('drawerClose')?.addEventListener('click', closeNav);
 drawer?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
 drawer?.querySelectorAll('.acc__head').forEach((head) => {
 head.addEventListener('click', () => {
 const section = head.closest('.acc');
 if (!section) return;
 const open = section.classList.toggle('is-open');
 head.setAttribute('aria-expanded', open ? 'true' : 'false');
 });
 });

 // Desktop mega menu: hover/focus open the panel via CSS; the trigger itself is a
 // link to the section landing page (click navigates). JS only closes sibling panels
 // on hover, outside-click and Escape, and tracks aria-expanded on focus.
 const megaItems = Array.from(document.querySelectorAll('.nav-item--mega'));
 const closeMega = (except) => megaItems.forEach((item) => {
 if (item === except) return;
 item.classList.remove('is-open');
 item.querySelector('.nav-trigger')?.setAttribute('aria-expanded', 'false');
 });
 megaItems.forEach((item) => {
 const trig = item.querySelector('.nav-trigger');
 // The trigger is now a real link: hover/focus opens the panel (CSS) and a click
 // navigates to the section landing page. Just close sibling panels on enter.
 item.addEventListener('mouseenter', () => closeMega(item));
 item.addEventListener('focusin', () => trig?.setAttribute('aria-expanded', 'true'));
 item.addEventListener('focusout', (event) => {
 if (!item.contains(event.relatedTarget)) trig?.setAttribute('aria-expanded', 'false');
 });
 });
 document.addEventListener('click', (event) => {
 if (!event.target.closest('.nav-item--mega')) closeMega(null);
 });

 document.querySelectorAll('[data-lang-menu]').forEach((menu) => {
 const trigger = menu.querySelector('[data-lang-trigger]');
 const close = () => {
 menu.classList.remove('is-open');
 trigger?.setAttribute('aria-expanded', 'false');
 };
 trigger?.addEventListener('click', (event) => {
 event.stopPropagation();
 const open = !menu.classList.contains('is-open');
 document.querySelectorAll('[data-lang-menu].is-open').forEach((other) => {
 if (other !== menu) {
 other.classList.remove('is-open');
 other.querySelector('[data-lang-trigger]')?.setAttribute('aria-expanded', 'false');
 }
 });
 menu.classList.toggle('is-open', open);
 trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
 });
 menu.querySelectorAll('[data-lang-btn]').forEach((btn) => {
 btn.addEventListener('click', close);
 });
 });
 document.addEventListener('click', () => {
 document.querySelectorAll('[data-lang-menu].is-open').forEach((menu) => {
 menu.classList.remove('is-open');
 menu.querySelector('[data-lang-trigger]')?.setAttribute('aria-expanded', 'false');
 });
 });

 const header = document.getElementById('header'); (function(){ var a=document.querySelector('.announcement'); var setH=function(){ if(a) document.documentElement.style.setProperty('--yza-ann-h', a.offsetHeight+'px'); }; setH(); window.addEventListener('resize', setH); window.addEventListener('load', setH); })();
 const onScroll = () => {
 const stuck = window.scrollY > 30; var _y=window.scrollY,_l=window.__yzaLastY||0; if(_y>_l+2&&_y>60) document.body.classList.add('is-scroll-down'); else if(_y<_l-2||_y<=60) document.body.classList.remove('is-scroll-down'); window.__yzaLastY=_y;
 header.classList.toggle('is-stuck', stuck);
 document.body.classList.toggle('is-scrolled', stuck);
 };
 onScroll();
 window.addEventListener('scroll', onScroll, { passive: true });

 // Both the announcement bar and the header go transparent over the hero — both
 // should become solid when the user hovers either. relatedTarget check prevents
 // a flicker when the mouse moves between the two adjacent elements.
 const announcement = document.querySelector('.announcement');
 const bars = [announcement, header].filter(Boolean);
 if (bars.length) {
 const isInBars = (el) => bars.some((b) => b.contains(el));
 const setHover = (on, rel) => {
 if (!on && isInBars(rel)) return;
 document.body.classList.toggle('is-header-hover', on);
 };
 bars.forEach((el) => {
 el.addEventListener('mouseenter', () => setHover(true));
 el.addEventListener('mouseleave', (e) => setHover(false, e.relatedTarget));
 el.addEventListener('focusin', () => setHover(true));
 el.addEventListener('focusout', (e) => setHover(false, e.relatedTarget));
 });
 }

 // Home only: measure the announcement + header so the hero video can tuck up
 // behind a transparent header (white logo/nav over the video, solid on scroll).
 if (document.body.dataset.page === 'home') {
 const setBarsH = () => {
 if (document.body.classList.contains('is-scrolled')) return;
 const a = document.querySelector('.announcement');
 const h = document.getElementById('header');
 const total = (a ? a.offsetHeight : 0) + (h ? h.offsetHeight : 0);
 if (total) document.documentElement.style.setProperty('--yza-bars-h', total + 'px');
 };
 setBarsH();
 window.addEventListener('resize', setBarsH);
 window.addEventListener('load', setBarsH);
 }

 const so = document.getElementById('searchOverlay');
 const searchInput = document.getElementById('searchInput');
 const searchResults = document.getElementById('searchResults');
 const searchHint = document.getElementById('searchHint');
 const searchAll = document.getElementById('searchAll');
 const searchSuggestionTitle = so?.querySelector('.search-mega__suggestions h2');
 const searchSuggestionButtons = Array.from(so?.querySelectorAll('[data-search-suggestion]') || []);
 let lastTrackedSearch = '';
 const refreshSearchStatic = () => {
 const scNow = searchCopy();
 if (searchInput) searchInput.placeholder = scNow.placeholder;
 if (searchSuggestionTitle) searchSuggestionTitle.textContent = scNow.suggestions;
 searchSuggestionButtons.forEach((btn, idx) => {
 const term = scNow.terms[idx] || btn.dataset.searchSuggestion || '';
 btn.textContent = term;
 btn.dataset.searchSuggestion = term;
 });
 };
 const searchCard = (p, idx) => `<a class="search-result-card" href="${productUrl(p.handle)}" style="--i:${idx}">
 <img src="${p.img}" alt="${YZA.i18n.pick(productDisplayName(p))} - YZA" loading="lazy" width="260" height="330" decoding="async">
 <span>${YZA.i18n.t('badge.' + (p.badge || 'limited'))}</span>
 <strong>${YZA.i18n.pick(productDisplayName(p))}</strong>
 <em>${formatProductPrice(p)}</em>
 </a>`;
 const renderSearch = () => {
 const scNow = searchCopy();
 const query = searchInput?.value.trim() || '';
 const rows = typeof YZA.searchProducts === 'function'
 ? YZA.searchProducts(query, 6)
 : (YZA.products || []).slice(0, 6).map((product) => ({ product }));
 if (searchHint) searchHint.textContent = rows.length ? (query ? scNow.proof : scNow.hint) : scNow.empty;
 if (searchAll) searchAll.href = '/collections' + (query ? '?q=' + encodeURIComponent(query) : '');
 if (searchResults) searchResults.innerHTML = rows.map((row, idx) => searchCard(row.product || row, idx)).join('');
 if (query && query !== lastTrackedSearch) {
 lastTrackedSearch = query;
 YZA.analytics?.track('search', { query, resultCount: rows.length });
 }
 };
 const openS = () => {
 refreshSearchStatic();
 so.classList.add('is-open');
 document.body.classList.add('has-search-overlay');
 renderSearch();
 searchInput?.focus();
 YZA.analytics?.track('search_open', { source: 'header' });
 };
 const closeS = () => {
 so.classList.remove('is-open');
 document.body.classList.remove('has-search-overlay');
 };
 document.getElementById('searchOpen')?.addEventListener('click', openS);
 document.getElementById('searchClose')?.addEventListener('click', closeS);
 so?.addEventListener('click', e => { if (e.target === so) closeS(); });
 searchInput?.addEventListener('input', renderSearch);
 so?.querySelectorAll('[data-search-suggestion]').forEach((btn) => {
 btn.addEventListener('click', () => {
 if (!searchInput) return;
 searchInput.value = btn.dataset.searchSuggestion || '';
 renderSearch();
 searchInput.focus();
 });
 });
 document.getElementById('searchForm')?.addEventListener('submit', e => {
 e.preventDefault();
 const q = searchInput?.value.trim() || '';
 YZA.analytics?.track('search_submit', { query: q });
 location.href = '/collections' + (q ? '?q=' + encodeURIComponent(q) : '');
 });
 document.addEventListener('keydown', e => {
 if (e.key === 'Escape') {
 closeS();
 YZA.cart.close();
 closeNav();
 closeMega();
 }
 });
 this.wireConversion();
 },

 wireConversion() {
 if (this._conversionWired) return;
 this._conversionWired = true;

 const chatOpen = document.getElementById('leadChatOpen');
 let chat = null;

 const chatCopy = () => {
 const lang = YZA.i18n?.lang || 'fr';
 const copy = {
 fr: {
 title: 'YZA Atelier', eyebrow: 'WhatsApp', close: 'Fermer',
 greeting: 'Bonjour ! Partagez votre question ci-dessous — taille, couleur, disponibilité ou cadeau. On vous répond dès que possible.',
 msgPh: 'Votre question (optionnel)',
 namePh: 'Votre prénom *',
 phonePh: 'Votre WhatsApp * (+212…)',
 submit: 'Démarrer la conversation →',
 err: 'Prénom et WhatsApp requis.',
 ack: 'Parfait, merci ! Laissez-nous votre prénom et votre WhatsApp, on vous répond tout de suite.',
 sendLabel: 'Envoyer',
 },
 en: {
 title: 'YZA Atelier', eyebrow: 'WhatsApp', close: 'Close',
 greeting: 'Hello ! Share your question below — sizing, colour, availability or gifting. We’ll reply as soon as possible.',
 msgPh: 'Your question (optional)',
 namePh: 'Your first name *',
 phonePh: 'Your WhatsApp * (+…)',
 submit: 'Start the conversation →',
 err: 'First name and WhatsApp required.',
 ack: 'Perfect, thank you! Leave your first name and WhatsApp — we’ll reply right away.',
 sendLabel: 'Send',
 },
 es: {
 title: 'YZA Atelier', eyebrow: 'WhatsApp', close: 'Cerrar',
 greeting: '¡Hola ! Comparta su pregunta — talla, color, disponibilidad o regalo. Le respondemos lo antes posible.',
 msgPh: 'Su pregunta (opcional)',
 namePh: 'Su nombre *',
 phonePh: 'Su WhatsApp * (+…)',
 submit: 'Iniciar la conversación →',
 err: 'Nombre y WhatsApp requeridos.',
 ack: '¡Perfecto, gracias! Déjenos su nombre y WhatsApp — le respondemos enseguida.',
 sendLabel: 'Enviar',
 },
 tr: {
 title: 'YZA Atelier', eyebrow: 'WhatsApp', close: 'Kapat',
 greeting: 'Merhaba ! Sorunuzu paylaşın — beden, renk, stok veya hediye. En kısa sürede yanıtlıyoruz.',
 msgPh: 'Sorunuz (isteğe bağlı)',
 namePh: 'Adınız *',
 phonePh: 'WhatsApp * (+…)',
 submit: 'Konuşmayı başlat →',
 err: 'Ad ve WhatsApp gerekli.',
 ack: 'Harika, teşekkürler! Adınızı ve WhatsApp’ınızı bırakın — hemen yanıtlıyoruz.',
 sendLabel: 'Gönder',
 },
 ar: {
 title: 'YZA Atelier', eyebrow: 'WhatsApp', close: 'إغلاق',
 greeting: 'مرحباً ! شاركنا سؤالك — الحجم، اللون، التوفر أو هدية. سنرد عليكم فور الإمكان.',
 msgPh: 'سؤالك (اختياري)',
 namePh: 'اسمك *',
 phonePh: 'WhatsApp * (+…)',
 submit: '← ابدأ المحادثة',
 err: 'الاسم و WhatsApp مطلوبان.',
 ack: 'ممتاز، شكراً! اترك لنا اسمك ورقم WhatsApp — سنرد فوراً.',
 sendLabel: 'إرسال',
 },
 };
 return copy[lang] || copy.fr;
 };

 const ensureChat = () => {
 if (chat) return chat;
 const c = chatCopy();
 chat = document.createElement('aside');
 chat.className = 'lead-chat';
 chat.id = 'leadChat';
 chat.setAttribute('role', 'dialog');
 chat.setAttribute('aria-modal', 'false');
 chat.setAttribute('aria-labelledby', 'leadChatTitle');
 chat.hidden = true;
 chat.innerHTML = `
 <div class="lead-chat__header">
 <div class="lead-chat__agent">
 <span class="lead-chat__avatar" aria-hidden="true"><img src="assets/brand/yza-logo-real.webp" alt="" width="120" height="35" decoding="async"></span>
 <div class="lead-chat__agent-info">
 <strong id="leadChatTitle">${c.title}</strong>
 <span class="lead-chat__online-status"><span class="lead-chat__dot"></span><span class="lead-chat__eyebrow">${c.eyebrow}</span></span>
 </div>
 </div>
 <button class="icon-btn lead-chat__close" id="leadChatClose" type="button" aria-label="${c.close}">${ICON.close}</button>
 </div>
 <div class="lead-chat__thread" id="leadChatThread">
 <div class="lead-chat__msg lead-chat__msg--bot lead-chat__msg--appear">
 <p id="leadChatGreeting">${c.greeting}</p>
 </div>
 </div>
 <form class="lead-chat__composer" id="leadChatComposer">
 <textarea class="lead-chat__input" id="lcMsg" name="msg" placeholder="${c.msgPh}" rows="1"></textarea>
 <button type="submit" class="lead-chat__send-btn" aria-label="${c.sendLabel}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M3.4 20.4l17.45-7.48a1 1 0 0 0 0-1.84L3.4 3.6a.993.993 0 0 0-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .67.71 1.12 1.39.91z"/></svg></button>
 </form>
 <form class="lead-chat__form" id="leadChatForm" hidden novalidate>
 <input class="lead-chat__field" id="lcName" name="name" type="text" placeholder="${c.namePh}" required autocomplete="given-name">
 <input class="lead-chat__field" id="lcPhone" name="phone" type="tel" placeholder="${c.phonePh}" required autocomplete="tel">
 <p class="lead-chat__err" id="lcErr" hidden></p>
 <button type="submit" class="lead-chat__send">${c.submit}</button>
 </form>`;
 document.body.append(chat);
 chat.querySelector('#leadChatClose')?.addEventListener('click', closeChat);

 const composer = chat.querySelector('#leadChatComposer');
 const form = chat.querySelector('#leadChatForm');
 const thread = chat.querySelector('#leadChatThread');
 let firstMessage = '';
 const addMsg = (text, who) => {
 if (!thread) return;
 const bubble = document.createElement('div');
 bubble.className = `lead-chat__msg lead-chat__msg--${who} lead-chat__msg--appear`;
 const p = document.createElement('p');
 p.textContent = text;
 bubble.appendChild(p);
 thread.appendChild(bubble);
 thread.scrollTop = thread.scrollHeight;
 };

 // Step 1 — the visitor must send a first message; only then do we reveal the
 // name + WhatsApp fields (no contact form is shown up front).
 composer?.addEventListener('submit', (e) => {
 e.preventDefault();
 const msgField = chat.querySelector('#lcMsg');
 const msg = msgField?.value.trim();
 if (!msg) { msgField?.focus(); return; }
 firstMessage = msg;
 addMsg(msg, 'user');
 addMsg(chatCopy().ack, 'bot');
 composer.hidden = true;
 form.hidden = false;
 setTimeout(() => chat.querySelector('#lcName')?.focus({ preventScroll: true }), 60);
 });

 // Step 2 — contact details, then hand off to WhatsApp with the first message.
 form?.addEventListener('submit', (e) => {
 e.preventDefault();
 const name = chat.querySelector('#lcName')?.value.trim();
 const phone = chat.querySelector('#lcPhone')?.value.trim();
 const err = chat.querySelector('#lcErr');
 const cc = chatCopy();
 if (!name || !phone) {
 if (err) { err.textContent = cc.err; err.hidden = false; }
 if (!name) chat.querySelector('#lcName')?.classList.add('is-invalid');
 if (!phone) chat.querySelector('#lcPhone')?.classList.add('is-invalid');
 return;
 }
 if (err) err.hidden = true;
 const current = document.body.dataset.page === 'product'
 ? YZA.getProduct?.(new URLSearchParams(location.search).get('handle') || '')
 : null;
 const productLine = current ? `Piece: ${YZA.i18n?.pick(current.name) || ''}` : `Page: ${document.title}`;
 const waMsg = [
 `Bonjour YZA ! Je m'appelle ${name} (WA: ${phone}).`,
 productLine,
 firstMessage ? `Message: ${firstMessage}` : '',
 `Lien: ${location.href}`,
 ].filter(Boolean).join('\n');
 YZA.analytics?.track('whatsapp_open', { source: chat.dataset.source || 'lead_chat' });
 window.open(waUrl(waMsg), '_blank', 'noopener');
 });
 chat.querySelectorAll('#lcName, #lcPhone').forEach((el) => {
 el.addEventListener('input', () => el.classList.remove('is-invalid'));
 });
 return chat;
 };

 const refreshChatCopy = (panel) => {
 const c = chatCopy();
 const q = (sel) => panel.querySelector(sel);
 if (q('#leadChatTitle')) q('#leadChatTitle').textContent = c.title;
 if (q('.lead-chat__eyebrow')) q('.lead-chat__eyebrow').textContent = c.eyebrow;
 if (q('#leadChatGreeting')) q('#leadChatGreeting').textContent = c.greeting;
 if (q('#lcMsg')) q('#lcMsg').placeholder = c.msgPh;
 if (q('#lcName')) q('#lcName').placeholder = c.namePh;
 if (q('#lcPhone')) q('#lcPhone').placeholder = c.phonePh;
 if (q('.lead-chat__send')) q('.lead-chat__send').textContent = c.submit;
 if (q('.lead-chat__send-btn')) q('.lead-chat__send-btn').setAttribute('aria-label', c.sendLabel);
 q('#leadChatClose')?.setAttribute('aria-label', c.close);
 };

 const openChat = (source = 'lead_chat_button', topic = '') => {
 const panel = ensureChat();
 refreshChatCopy(panel);
 panel.dataset.source = source;
 if (topic) {
 const msgField = panel.querySelector('#lcMsg');
 if (msgField && !msgField.value) msgField.placeholder = topic;
 }
 panel.hidden = false;
 requestAnimationFrame(() => panel.classList.add('is-open'));
 chatOpen?.setAttribute('aria-expanded', 'true');
 setTimeout(() => panel.querySelector('#lcMsg')?.focus({ preventScroll: true }), 40);
 YZA.analytics?.track('chat_open', { source });
 };

 const closeChat = () => {
 if (!chat) return;
 chat.classList.remove('is-open');
 chatOpen?.setAttribute('aria-expanded', 'false');
 setTimeout(() => { chat.hidden = true; }, 220);
 };

 this.openLeadChat = openChat;
 chatOpen?.addEventListener('click', () => openChat('lead_chat_button'));
 document.addEventListener('click', (event) => {
 const trigger = event.target.closest('[data-open-lead-chat]');
 if (!trigger) return;
 event.preventDefault();
 openChat('context_link', trigger.getAttribute('data-chat-topic') || 'Product question');
 });

 document.querySelectorAll('[data-map-click]').forEach((link) => {
 link.addEventListener('click', () => {
 YZA.analytics?.track('map_click', { provider: link.getAttribute('data-map-click') || '' });
 });
 });

 document.querySelectorAll('[data-recovery-close]').forEach((el) => {
 el.addEventListener('click', () => this.closeRecovery());
 });

 document.addEventListener('mouseout', (e) => {
 if (e.relatedTarget || e.toElement || e.clientY > 8) return;
 this.showRecovery('exit');
 });

 const showCartRecovery = () => {
 if (YZA.cart?.count()) this.showRecovery('cart');
 };
 document.getElementById('cartClose')?.addEventListener('click', showCartRecovery);
 document.getElementById('cartOverlay')?.addEventListener('click', showCartRecovery);

 document.addEventListener('keydown', (e) => {
 if (e.key !== 'Escape') return;
 closeChat();
 this.closeRecovery();
 });

 this.setupInstantNav();
 },

 // Make in-site navigation feel instant: prerender the destination the moment a
 // link is hovered/touched (Chromium), and prefetch the document as a fallback
 // (Safari/Firefox). Both are progressive enhancements - no-ops where unsupported.
 setupInstantNav() {
 const eligible = (a) =>
 a && a.tagName === 'A' && a.href &&
 a.origin === location.origin &&
 a.target !== '_blank' &&
 !a.hasAttribute('data-no-prefetch') &&
 !/^(mailto:|tel:|#)/.test(a.getAttribute('href') || '') &&
 a.href.split('#')[0] !== location.href.split('#')[0];

 // 1) Chromium: Speculation Rules → true prerender on intent = instant nav.
 const supportsSpec = 'HTMLScriptElement' in window &&
 HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules');
 if (supportsSpec) {
 const rules = document.createElement('script');
 rules.type = 'speculationrules';
 rules.textContent = JSON.stringify({
 prerender: [{
 where: { and: [
 { href_matches: '/*' },
 { not: { selector_matches: '[data-no-prefetch], [target="_blank"], [rel~="external"]' } },
 ] },
 eagerness: 'moderate',
 }],
 });
 document.head.appendChild(rules);
 return;
 }

 // 2) Fallback: prefetch the destination document on first hover/touch.
 const done = new Set();
 const prefetch = (a) => {
 if (!eligible(a) || done.has(a.href)) return;
 done.add(a.href);
 const link = document.createElement('link');
 link.rel = 'prefetch';
 link.href = a.href;
 document.head.appendChild(link);
 };
 const onIntent = (e) => {
 const a = e.target.closest && e.target.closest('a[href]');
 if (a) prefetch(a);
 };
 document.addEventListener('pointerover', onIntent, { capture: true, passive: true });
 document.addEventListener('touchstart', onIntent, { capture: true, passive: true });
 },
};
