/* ============================================================
 YZA - CATALOGUE SS26/27
 Public product catalogue.
 ============================================================ */
window.YZA = window.YZA || {};

YZA.analytics = YZA.analytics || {
 _queue: [],
 _eventKey: 'yza_events',
 _counterKey: 'yza_counters',
 _sessionKey: 'yza_session_id',
 _sessionSeenKey: 'yza_session_seen',

 _sessionId() {
 try {
 let id = sessionStorage.getItem(this._sessionKey);
 if (!id) {
 id = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
 sessionStorage.setItem(this._sessionKey, id);
 }
 return id;
 } catch (err) { return 'session_unavailable'; }
 },

 _read(key, fallback) {
 try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (err) { return fallback; }
 },

 _write(key, value) {
 try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) {}
 },

 _emptyCounters() {
 return {
 views_by_handle: {},
 cart_adds_by_handle: {},
 most_viewed: [],
 most_added_to_cart: [],
 total_sessions: 0,
 total_page_views: 0,
 first_seen: '',
 last_seen: '',
 sessions: {},
 funnel_by_handle: {},
 };
 },

 _top(obj) {
 return Object.entries(obj || {})
 .sort((a, b) => b[1] - a[1])
 .slice(0, 10)
 .map(([handle, count]) => ({ handle, count }));
 },

 _bumpFunnel(counters, handle, field, amount = 1) {
 if (!handle) return;
 counters.funnel_by_handle[handle] = counters.funnel_by_handle[handle] || { views: 0, cart_adds: 0, checkouts: 0 };
 counters.funnel_by_handle[handle][field] = (counters.funnel_by_handle[handle][field] || 0) + amount;
 },

 _persist(eventName, eventPayload) {
 const now = eventPayload.timestamp || new Date().toISOString();
 const events = this._read(this._eventKey, []);
 events.push({ event: eventName, ...eventPayload, timestamp: now });
 while (events.length > 5000) events.shift();
 this._write(this._eventKey, events);

 const counters = { ...this._emptyCounters(), ...this._read(this._counterKey, {}) };
 counters.views_by_handle = counters.views_by_handle || {};
 counters.cart_adds_by_handle = counters.cart_adds_by_handle || {};
 counters.sessions = counters.sessions || {};
 counters.funnel_by_handle = counters.funnel_by_handle || {};
 counters.first_seen = counters.first_seen || now;
 counters.last_seen = now;

 const sid = eventPayload.session_id || this._sessionId();
 if (!counters.sessions[sid]) {
 counters.sessions[sid] = { first_seen: now, last_seen: now, page_views: 0, events: 0 };
 counters.total_sessions = Object.keys(counters.sessions).length;
 }
 counters.sessions[sid].last_seen = now;
 counters.sessions[sid].events = (counters.sessions[sid].events || 0) + 1;

 if (eventName === 'page_view') {
 counters.total_page_views = (counters.total_page_views || 0) + 1;
 counters.sessions[sid].page_views = (counters.sessions[sid].page_views || 0) + 1;
 }
 if (eventName === 'product_view' && eventPayload.handle) {
 counters.views_by_handle[eventPayload.handle] = (counters.views_by_handle[eventPayload.handle] || 0) + 1;
 this._bumpFunnel(counters, eventPayload.handle, 'views');
 }
 if (eventName === 'add_to_cart' && eventPayload.handle) {
 const qty = Number(eventPayload.qty) || 1;
 counters.cart_adds_by_handle[eventPayload.handle] = (counters.cart_adds_by_handle[eventPayload.handle] || 0) + qty;
 this._bumpFunnel(counters, eventPayload.handle, 'cart_adds', qty);
 }
 if (eventName === 'checkout_initiated' && Array.isArray(eventPayload.items)) {
 eventPayload.items.forEach((item) => this._bumpFunnel(counters, item.handle, 'checkouts', Number(item.qty) || 1));
 }
 counters.most_viewed = this._top(counters.views_by_handle);
 counters.most_added_to_cart = this._top(counters.cart_adds_by_handle);
 this._write(this._counterKey, counters);
 },

 _send(eventName, eventPayload) {
 try {
 if (typeof window.plausible === 'function') {
 window.plausible(eventName, { props: eventPayload });
 }
 } catch (err) {}
 },

 track(eventName, payload = {}) {
 try {
 const bodyPage = typeof document !== 'undefined' ? document.body?.dataset?.page : '';
 const path = typeof location !== 'undefined' ? location.pathname : '';
 const eventPayload = {
 page: bodyPage || '',
 path: path || '',
 language: YZA.i18n?.lang || document?.documentElement?.lang || 'fr',
 referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
 session_id: this._sessionId(),
 timestamp: new Date().toISOString(),
 ...payload,
 };
 if (typeof document !== 'undefined' && document.prerendering) {
 this._queue.push([eventName, eventPayload]);
 return;
 }
 this._persist(eventName, eventPayload);
 this._send(eventName, eventPayload);
 } catch (err) {}
 },
};
if (typeof document !== 'undefined' && document.prerendering) {
 document.addEventListener('prerenderingchange', () => {
 YZA.analytics._queue.splice(0).forEach(([n, p]) => YZA.analytics._send(n, p));
 }, { once: true });
}

YZA.brand = {
 email: 'info@yza-shop.com',
 emailSupport: 'support@yza-shop.com',
 emailB2b: 'b2b@yza-shop.com',
 whatsapp: '+212693296630',
 whatsappDisplay: '+212 693 296 630',
 instagram: 'yzahandmade',
 instagramUrl: 'https://instagram.com/yzahandmade',
 city: 'Marrakech',
 address: '66 rue Yougoslavie, Guéliz, Marrakech, Maroc',
 addressShort: '66 rue Yougoslavie, Guéliz',
 mapsQuery: 'YZA Studio, 66 rue Yougoslavie, Guéliz, Marrakech, Maroc',
 hours: { fr: 'Mercredi - dimanche : 12 h - 20 h\nLundi : 12 h - 16 h\nMardi : fermé', en: 'Wednesday - Sunday: 12 - 8pm\nMonday: 12 - 4pm\nTuesday: closed' },
 pickup: { fr: 'Retrait au studio à Guéliz, sur confirmation.', en: 'Studio pickup in Guéliz, on confirmation.' },
 masterIdea: 'Modern Marrakech wear™',
};

// ---- Checkout / payment config (edit here) ----
YZA.payment = {
 eurRate: 11,            // 1 EUR ≈ 11 DH — used only to SHOW an estimate for EUR methods
 orderEndpoint: 'order.php',
 paypalLink: '',                       // optional PayPal.me URL — overrides the email flow if set
 paypalEmail: 'nawalrmili@gmail.com',  // PayPal-to-PayPal: builds a pre-filled EUR payment to this address
 eur: {
  iban: 'FR76 1469 0000 0157 0005 2012 414',
  bic: 'CMCIFRP1MON',
  bank: 'Monabanq',
  holder: 'Nawal Rmili',
 },
 morocco: {
  rib: '007 450 0008577000000432 93',   // Attijariwafa bank — Marrakech Hassan II
  bank: 'Attijariwafa bank',
  holder: 'NAWAL RMILI YZA',
  swift: 'BCMAMAMC',
 },
};

// ---- Ad-platform tracking config (edit here, see js/tracking.js) ----
// Paste an ID to switch that platform ON; empty = OFF (no script, no cookies).
// Standard ecommerce events fire site-wide either way (view_item, add_to_cart,
// begin_checkout, add_shipping_info, add_payment_info, purchase) with MAD
// amounts and the YZA-xxxx order number as transaction_id.
YZA.tracking = {
 gtmId: '',           // Google Tag Manager  'GTM-XXXXXXX'  (preferred — manages GA4/Ads in one place)
 ga4Id: '',           // Google Analytics 4  'G-XXXXXXXXXX' (used only if no GTM)
 metaPixelId: '',     // Meta / Facebook & Instagram Pixel  (numbers only)
 tiktokPixelId: '',   // TikTok Pixel        'XXXXXXXXXXXXXXXXXX'
};

YZA.servicePolicy = {
 returnsDays: 30,
 freeShippingDh: 150000,
 freeShippingAccessoriesDh: 50000,
 b2bMoqBags: 10,
 shipping: { fr: 'Expédition suivie sous 2 à 5 jours ouvrés. Livraison Maroc offerte dès 500 DH (accessoires) ou 1 500 DH (sacs & prêt-à-porter).', en: 'Tracked shipping in 2 to 5 business days. Free Morocco delivery from 500 DH (accessories) or 1,500 DH (bags & ready-to-wear).' },
 packaging: { fr: "Emballage prêt à offrir, avec étiquette YZA et mot de l\"atelier.", en: "Gift-ready packaging with YZA tag and atelier note." },
 guarantee: { fr: "Garantie à vie : vos pièces se réparent à vie à l'atelier de Guéliz, elles ne se jettent pas. Et vous avez 30 jours pour changer d'avis — retour non porté, dans son état d'origine.", en: "Lifetime guarantee: your pieces are repaired for life at the Guéliz atelier, never thrown away. And you have 30 days to change your mind — returned unworn, in original condition." },
 repairs: { fr: "Réparations à vie offertes à l\"atelier de Guéliz. À distance, seuls les frais d\"envoi peuvent s\"appliquer.", en: "Lifetime repairs are free at the Guéliz atelier. For remote repairs, shipping may apply." },
};

YZA.serviceIcons = {
 returns: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 8v30"/><path d="m21 27 11 11 11-11"/><path d="M16 14v13M48 14v13"/><path d="M12 46c5.5 5.4 12.5 8 20 8s14.5-2.6 20-8"/><path d="M19 40 12 46l7 6"/><path d="M45 40l7 6-7 6"/></svg>',
 payment: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 8v48M18 19h28M16 31h32M18 45h28"/><path d="M24 12 12 24M40 12l12 12M24 52 12 40M40 52l12-12"/><path d="M32 28v8"/></svg>',
 limited: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 8v48M8 32h48"/><path d="m18 18 28 28M46 18 18 46"/><path d="M22 10h20M22 54h20M10 22v20M54 22v20"/><circle cx="32" cy="32" r="5"/></svg>',
 shipping: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 24h30v22H10z"/><path d="M40 31h8l6 7v8H40z"/><circle cx="22" cy="49" r="4"/><circle cx="48" cy="49" r="4"/><path d="M16 18h18M13 31h16"/></svg>',
 international: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="22"/><path d="M10 32h44M32 10c7 6.5 10 14 10 22s-3 15.5-10 22M32 10c-7 6.5-10 14-10 22s3 15.5 10 22"/><path d="M16 21c5 3 10 4 16 4s11-1 16-4M16 43c5-3 10-4 16-4s11 1 16 4"/></svg>',
 repair: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M19 45 45 19"/><path d="m39 13 12 12"/><path d="m14 50 12-3-9-9z"/><path d="M43 43c5 1 9 4 9 8 0 5-8 8-20 8s-20-3-20-8c0-4 4-7 9-8"/></svg>',
};

YZA.serviceFeatures = [
 {
 key: 'returns',
 icon: 'returns',
 title: { fr: "Garantie à vie", en: "Lifetime guarantee", es: "Garantía de por vida", tr: "Ömür boyu garanti", ar: "ضمان مدى الحياة" },
 text: { fr: "Vos pièces se réparent à vie à l'atelier — elles ne se jettent pas. Et 30 jours pour changer d'avis : retour non porté, dans son état d'origine.", en: "Your pieces are repaired for life at the atelier — never thrown away. Plus 30 days to change your mind: returned unworn, in original condition.", es: "Tus piezas se reparan de por vida en el atelier — no se tiran. Y 30 días para cambiar de opinión: devolución sin usar y en estado original.", tr: "Parçalarınız atölyede ömür boyu tamir edilir — asla atılmaz. Ayrıca fikrinizi değiştirmek için 30 gün: kullanılmamış, orijinal halinde iade.", ar: "قطعك تُصلَّح مدى الحياة في الأتولييه — لا تُرمى. ولديك 30 يومًا لتغيّري رأيك: إرجاع غير مستعمل وبحالته الأصلية." },
 short: { fr: "Garantie à vie", en: "Lifetime guarantee", es: "De por vida", tr: "Ömür boyu", ar: "مدى الحياة" },
 },
 {
 key: 'payment',
 icon: 'payment',
 title: { fr: 'Paiement sécurisé', en: 'Secure payment', es: 'Pago seguro', tr: 'Guvenli odeme', ar: 'دفع آمن' },
 text: { fr: 'Plusieurs moyens sécurisés : paiement à la livraison, virement bancaire, PayPal ou carte via PayPal. Vous choisissez au moment de commander.', en: 'Several secure options: cash on delivery, bank transfer, PayPal or card via PayPal. You choose at checkout.', es: 'Varias opciones seguras: pago contra entrega, transferencia bancaria, PayPal o tarjeta vía PayPal. Eliges al finalizar la compra.', tr: 'Birkaç güvenli seçenek: kapıda ödeme, banka havalesi, PayPal veya PayPal ile kart. Sipariş sırasında siz seçersiniz.', ar: 'عدة وسائل آمنة: الدفع عند الاستلام، تحويل بنكي، باي بال أو بطاقة عبر باي بال. تختارين عند الطلب.' },
 short: { fr: 'Paiement multiple', en: 'Multiple methods', es: 'Pago múltiple', tr: 'Çoklu ödeme', ar: 'دفع متعدد' },
 },
 {
 key: 'limited',
 icon: 'limited',
 title: { fr: 'Éditions limitées', en: 'Limited editions', es: 'Ediciones limitadas', tr: 'Sinirli seri', ar: 'إصدارات محدودة' },
 text: { fr: "Faites lentement à l'atelier. Aucun réassort garanti.", en: 'Made slowly at the atelier. No guaranteed restock.', es: 'Series pequenas hechas lentamente en el atelier. Sin reposicion garantizada.', tr: 'Atolyede yavas uretilen kucuk seriler. Stok yenileme garantisi yok.', ar: 'دفعات صغيرة تصنع ببطء في الأتولييه. لا يوجد إعادة إنتاج مضمونة.' },
 short: { fr: 'Édition limitée', en: 'Limited edition', es: 'Serie limitada', tr: 'Sinirli', ar: 'محدود' },
 },
 {
 key: 'morocco-delivery',
 icon: 'shipping',
 title: { fr: 'Livraison Maroc offerte', en: 'Free Morocco delivery', es: 'Envio Marruecos gratis', tr: 'Fas ici ucretsiz teslimat', ar: 'توصيل مجاني في المغرب' },
 text: { fr: 'Livraison suivie offerte au Maroc dès 500 DH (accessoires) ou 1 500 DH (sacs & prêt-à-porter). Retrait au studio possible à Guéliz.', en: 'Tracked Morocco delivery is free from 500 DH (accessories) or 1,500 DH (bags & ready-to-wear). Studio pickup available in Guéliz.', es: 'Envio con seguimiento en Marruecos gratis desde 500 DH (accesorios) o 1.500 DH (bolsos y ropa). Retiro en Guéliz.', tr: 'Fas ici takipli teslimat aksesuar icin 500 DH, canta ve giysi icin 1.500 DH uzeri ucretsiz. Guéliz studyo teslimi var.', ar: 'توصيل متتبع مجاني داخل المغرب من 500 درهم (إكسسوارات) أو 1,500 درهم (حقائب وملابس). يمكن الاستلام من كليز.' },
 short: { fr: 'Offert dès 500 DH', en: 'Free from 500 DH', es: 'Gratis desde 500 DH', tr: '500 DH uzeri', ar: 'من 500 درهم' },
 },
 {
 key: 'international',
 icon: 'international',
 title: { fr: 'Expédition internationale', en: 'International shipping', es: 'Envio internacional', tr: 'Uluslararasi teslimat', ar: 'شحن دولي' },
 text: { fr: 'Envoi suivi depuis Marrakech. Droits et taxes peuvent varier selon le pays.', en: 'Tracked shipping from Marrakech. Duties and taxes may vary by country.', es: 'Envio con seguimiento desde Marrakech. Impuestos pueden variar.', tr: 'Marakes ten takipli gonderim. Vergiler ulkeye gore degisebilir.', ar: 'شحن متتبع من مراكش. الرسوم والضرائب تختلف حسب البلد.' },
 short: { fr: 'Suivi monde', en: 'Tracked worldwide', es: 'Seguimiento', tr: 'Takipli', ar: 'متتبع' },
 },
 {
 key: 'repairs',
 icon: 'repair',
 title: { fr: 'Réparations à vie', en: 'Lifetime repairs', es: 'Reparaciones de por vida', tr: 'Omur boyu tamir', ar: 'تصليحات مدى الحياة' },
 text: { fr: "À l’atelier, les réparations YZA sont offertes. À distance, seuls les frais d’envoi peuvent s’appliquer.", en: "YZA repairs are free at the atelier. For remote repairs, shipping may apply.", es: 'Las reparaciones YZA son gratis en el atelier. A distancia puede aplicar envio.', tr: 'YZA tamirleri atolyede ucretsizdir. Uzaktan gonderim ucreti uygulanabilir.', ar: 'تصليحات YZA مجانية في الأتولييه. عن بعد قد تطبق مصاريف الشحن.' },
 short: { fr: 'Réparations à vie', en: 'Lifetime repairs', es: 'Reparaciones', tr: 'Omur boyu tamir', ar: 'تصليحات مدى الحياة' },
 },
];

YZA.serviceFeature = (key) => (YZA.serviceFeatures || []).find((item) => item.key === key);

YZA.pickText = (value) => {
 if (!value) return '';
 if (typeof value === 'string') return value;
 if (YZA.i18n && typeof YZA.i18n.pick === 'function') return YZA.i18n.pick(value);
 return value.fr || value.en || Object.values(value)[0] || '';
};

// Berber/Amazigh symbol set (hand-keyed PNGs matching the brand-values strip), one per service.
YZA.serviceIconFiles = { returns: 'svc-returns-new', payment: 'svc-payment-new', limited: 'svc-limited-new', shipping: 'svc-delivery-new', international: 'svc-international', repair: 'svc-repair-new' };
YZA.serviceIcon = (name, className = 'service-symbol') => {
 const file = YZA.serviceIconFiles[name] || 'svc-limited';
 return `<img aria-hidden="true" class="${className}" src="assets/brand/icons/${file}.png" alt="" width="88" height="88" loading="lazy" decoding="async">`;
};

// Amazigh geometric service icons (raster, black-on-white) for the footer/home
// service strips. mix-blend-mode: multiply drops the white ground on light bg.
YZA.serviceStripIcons = {
 shipping: 'svc-amazigh-delivery.png',
 returns: 'svc-amazigh-returns.jpg',
 payment: 'svc-amazigh-payment.jpg',
 limited: 'svc-amazigh-limited.png',
 repair: 'svc-amazigh-repair.png',
 international: 'svc-international.png',
};

// Thin-line Amazigh/Berber service glyphs (the original set Nawal had — vertical
// totem, four-fold cross-star, woven band). Path-only SVGs: stroke/size/caps come
// from `.service-card__icon svg` in styles.css, so they inherit the ink colour and
// stay crisp at any scale. Visual order on the strip matches the brand-values screen.
YZA.serviceStripGlyphs = {
 // vertical totem
 shipping: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6V27"/><path d="M26 11H38"/><path d="M32 18L25 24M32 18L39 24"/><path d="M32 27L41 36L32 45L23 36Z"/><path d="M32 45V50M32 50L24 58M32 50L40 58"/><path d="M21 58H27M37 58H43"/></svg>',
 // four-fold cross-star
 returns: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 24L40 32L32 40L24 32Z"/><path d="M32 24V8M27 12H37"/><path d="M32 40V56M27 52H37"/><path d="M24 32H8M12 27V37"/><path d="M40 32H56M52 27V37"/><path d="M40 24L45 19M24 24L19 19M40 40L45 45M24 40L19 45"/><path d="M32 29L35 32L32 35L29 32Z"/></svg>',
 // woven band
 payment: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 20L44 32L32 44L20 32Z"/><path d="M32 25V39M25 32H39"/><path d="M18 23L9 32L18 41"/><path d="M46 23L55 32L46 41"/><path d="M26 12V16M32 11V16M38 12V16"/><path d="M26 48V52M32 48V53M38 48V52"/></svg>',
};
YZA.serviceStripGlyphs.limited = YZA.serviceStripGlyphs.payment;
YZA.serviceStripGlyph = (name) => YZA.serviceStripGlyphs[name] || YZA.serviceStripGlyphs.returns;

YZA.serviceCard = (key, className = 'service-card') => {
 const item = YZA.serviceFeature(key);
 if (!item) return '';
 const classes = Array.from(new Set(['service-card', ...String(className).split(/\s+/).filter(Boolean)])).join(' ');
 return `<article class="${classes}" data-service-card="${item.key}">
 <span class="service-card__icon">${YZA.serviceStripGlyph(item.icon)}</span>
 <h3>${YZA.pickText(item.title)}</h3>
 <p>${YZA.pickText(item.text)}</p>
 </article>`;
};

YZA.serviceChip = (key) => {
 const item = YZA.serviceFeature(key);
 if (!item) return '';
 return `<span class="product-trust-chip" data-service-chip="${item.key}">
 ${YZA.serviceIcon(item.icon, 'product-trust-chip__icon')}
 <span>${YZA.pickText(item.short || item.title)}</span>
 </span>`;
};

YZA.serviceLongText = () => {
 const parts = ['morocco-delivery', 'international', 'returns', 'repairs'].map((key) => {
 const item = YZA.serviceFeature(key);
 return item ? `<p><strong>${YZA.pickText(item.title)}.</strong> ${YZA.pickText(item.text)}</p>` : '';
 }).filter(Boolean);
 return `<div class="service-long-copy">${parts.join('')}</div>`;
};

const PRODUCTS = [
 {
 "handle": "yza-scarf-top-jawhara-ss26",
 "fewLeft": true,
 "legacyHandles": [],
 "sku": "T-FL-JWP-BL",
 "name": {
 "fr": "Top foulard Jawhara",
 "en": "YZA Scarf Top",
 "es": "YZA Scarf Top",
 "tr": "YZA Scarf Top",
 "ar": "YZA Scarf Top"
 },
 "displayName": {
 "fr": "Top foulard Jawhara",
 "en": "YZA Scarf Top",
 "es": "YZA Scarf Top",
 "tr": "YZA Scarf Top",
 "ar": "YZA Scarf Top"
 },
 "short": {
 "fr": "Top foulard Jawhara, piece Jawhara a associer aux pareos et sacs YZA.",
 "en": "A size-flexible Jawhara scarf top designed for cool summer sets, finished with handmade Shoushia tassel details inspired by Moroccan tassels.",
 "es": "Top foulard Jawhara de talla flexible, pensado para looks de verano frescos, acabado con detalles de borlas Shoushia hechas a mano inspiradas en los flecos marroquíes.",
 "tr": "Serin yaz kombinleri için tasarlanmış, beden esnekliği olan Jawhara fular top; Fas frangılarından ilham alınan el yapımı Shoushia püskülleriyle tamamlanmış.",
 "ar": "توب فولار Jawhara مرن في المقاس، مصمَّم لأطقم الصيف المنعشة، مزيَّن بتفاصيل شراشيب Shoushia المصنوعة يدوياً من وحي الشراريب المغربية."
 },
 "displayShort": {
 "fr": "Top foulard Jawhara, piece Jawhara a associer aux pareos et sacs YZA.",
 "en": "A size-flexible Jawhara scarf top designed for cool summer sets, finished with handmade Shoushia tassel details inspired by Moroccan tassels.",
 "es": "Top foulard Jawhara de talla flexible, pensado para looks de verano frescos, acabado con detalles de borlas Shoushia hechas a mano inspiradas en los flecos marroquíes.",
 "tr": "Serin yaz kombinleri için tasarlanmış, beden esnekliği olan Jawhara fular top; Fas frangılarından ilham alınan el yapımı Shoushia püskülleriyle tamamlanmış.",
 "ar": "توب فولار Jawhara مرن في المقاس، مصمَّم لأطقم الصيف المنعشة، مزيَّن بتفاصيل شراشيب Shoushia المصنوعة يدوياً من وحي الشراريب المغربية."
 },
 "desc": {
 "fr": "Top foulard Jawhara, piece Jawhara a associer aux pareos et sacs YZA.",
 "en": "The YZA Scarf Top is part of the Resort Marrakesh Wear line: a modern Marrakchi wardrobe designed from Jawhara, a striped textile associated with eastern formalwear and reimagined for summer movement. Pair it with the pareo skirt, palazzo pants, wrap pants or basket bags.",
 "es": "El YZA Scarf Top forma parte de la línea Resort Marrakech Wear: un guardarropa marrakchí moderno concebido en Jawhara, un tejido a rayas asociado a la elegancia oriental y reinventado para el movimiento del verano. Combínalo con la falda pareo, los pantalones palazzo, los pantalones cruzados o las cestas.",
 "tr": "YZA Scarf Top, Resort Marrakech Wear serisinin bir parçası: doğu resmi kıyafetleriyle özdeşleşmiş çizgili bir tekstil olan Jawhara'dan tasarlanmış, yaz hareketliliği için yeniden yorumlanmış modern bir Marakeşli dolabı. Pareo etek, palazzo pantolon, etek pantolon veya sepet çantalarla kombin et.",
 "ar": "يُشكّل YZA Scarf Top جزءاً من خط Resort Marrakech Wear: خزانة ملابس مراكشية معاصرة مصنوعة من Jawhara، نسيج مخطَّط مرتبط بالأناقة الشرقية وأُعيد تخيّله لحرية الحركة صيفاً. ارتديه مع تنورة الباريو أو البنطال البالاتزو أو البنطال الملفوف أو السلال."
 },
 "price": 36000,
 "currency": "MAD",
 "category": "tops",
 "sourceCategory": "Pairing Tops",
 "categoryLabel": {
 "fr": "Tops",
 "en": "Tops",
 "es": "Tops",
 "tr": "Üstler",
 "ar": "قطع علوية"
 },
 "group": "rtw",
 "collection": {
 "fr": "Resort Marrakech Wear",
 "en": "Resort Marrakech Wear",
 "es": "Resort Marrakech Wear",
 "tr": "Resort Marrakech Wear",
 "ar": "Resort Marrakech Wear"
 },
 "season": "All Seasons 2026",
 "img": "assets/lookbook-ss26-27/embedded/p30_img02_xref1220_f762d6e64853.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p30_img02_xref1220_f762d6e64853.jpeg",
 "assets/lookbook-ss26-27/embedded/p31_img02_xref1227_829199726349.jpeg",
 "assets/lookbook-ss26-27/embedded/p32_img04_xref1239_3935f6e23a7c.jpeg"
 ],
 "familyHandle": "jawhara-tops",
 "familyOrder": 1,
 "variantLabel": {
 "fr": "Foulard",
 "en": "Scarf",
 "es": "Fular",
 "tr": "Fular",
 "ar": "فولار"
 },
 "availableColors": [
 {
 "fr": "Blanc",
 "en": "White",
 "es": "Blanco",
 "tr": "Beyaz",
 "ar": "أبيض"
 },
 {
 "fr": "Noir",
 "en": "Black",
 "es": "Negro",
 "tr": "Siyah",
 "ar": "أسود"
 },
 {
 "fr": "Jaune moutarde",
 "en": "Mustard yellow",
 "es": "Amarillo mostaza",
 "tr": "Hardal sarısı",
 "ar": "أصفر خردل"
 },
 {
 "fr": "Vert",
 "en": "Green",
 "es": "Verde",
 "tr": "Yeşil",
 "ar": "أخضر"
 },
 {
 "fr": "Rose vieux",
 "en": "Dusty rose",
 "es": "Rosa viejo",
 "tr": "Soluk pembe",
 "ar": "وردي عتيق"
 },
 {
 "fr": "Rouge",
 "en": "Red",
 "es": "Rojo",
 "tr": "Kırmızı",
 "ar": "أحمر"
 },
 {
 "fr": "Bordeaux",
 "en": "Bordeaux",
 "es": "Burdeos",
 "tr": "Bordo",
 "ar": "بوردو"
 },
 {
 "fr": "Bleu majorelle",
 "en": "Majorelle blue",
 "es": "Azul Majorelle",
 "tr": "Majorelle mavisi",
 "ar": "أزرق ماجوريل"
 },
 {
 "fr": "Vert profond",
 "en": "Deep green",
 "es": "Verde profundo",
 "tr": "Koyu yeşil",
 "ar": "أخضر عميق"
 }
 ],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "yza-scarf-top-jawhara-ss26",
 "sku": "T-FL-JWP-BL",
 "category": "Top",
 "source_type": "Foulard",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-scarf-top-jawhara-ss26",
 "sku": "T-FL-JWP-NR",
 "category": "Top",
 "source_type": "Foulard",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-scarf-top-jawhara-ss26",
 "sku": "T-FL-JWP-JM",
 "category": "Top",
 "source_type": "Foulard",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-scarf-top-jawhara-ss26",
 "sku": "T-FL-JWP-VR",
 "category": "Top",
 "source_type": "Foulard",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-scarf-top-jawhara-ss26",
 "sku": "T-FL-JWP-RV",
 "category": "Top",
 "source_type": "Foulard",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-scarf-top-jawhara-ss26",
 "sku": "T-FL-JWP-RG",
 "category": "Top",
 "source_type": "Foulard",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-scarf-top-jawhara-ss26",
 "sku": "T-FL-JWP-BD",
 "category": "Top",
 "source_type": "Foulard",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-scarf-top-jawhara-ss26",
 "sku": "T-FL-JWP-BLU",
 "category": "Top",
 "source_type": "Foulard",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-scarf-top-jawhara-ss26",
 "sku": "T-FL-JWP-VP",
 "category": "Top",
 "source_type": "Foulard",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 }
 ],
 "variantCount": 9,
 "variant_count_from_xlsx_catalog": 9,
 "tags": [
 "SS26",
 "Resort Wear",
 "Jawhara",
 "Scarf top",
 "Handmade detail",
 "Marrakech"
 ],
 "seoTitle": "YZA Scarf Top - Jawhara Resort Wear Handmade in Marrakech",
 "seoKeywords": [
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Resort Marrakesh Wear",
 "Top foulard Jawhara",
 "YZA",
 "YZA Scarf Top",
 "a",
 "crochet",
 "fait main",
 "handmade",
 "jawhara",
 "jupe",
 "pantalon",
 "pareo",
 "porter",
 "pret",
 "ready",
 "resort",
 "rtw",
 "to",
 "top",
 "tops",
 "wear",
 "yza-scarf-top-jawhara-ss26"
 ],
 "languageSearchTerms": [
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Resort Marrakesh Wear",
 "Top foulard Jawhara",
 "YZA",
 "YZA Scarf Top",
 "a",
 "crochet",
 "fait main",
 "handmade",
 "jawhara",
 "jupe",
 "pantalon",
 "pareo",
 "porter",
 "pret",
 "ready",
 "resort",
 "rtw",
 "to",
 "top",
 "tops",
 "wear",
 "yza-scarf-top-jawhara-ss26"
 ],
 "material": {
 "fr": "Jawhara viscose & silk, details faits main",
 "en": "Jawhara viscose & silk with handmade details",
 "es": "Jawhara poly y seda con detalles hechos a mano",
 "tr": "El yapımı detaylı Jawhara poly ve ipek",
 "ar": "Jawhara بولي وحرير مع تفاصيل مصنوعة يدوياً"
 },
 "fabric": {
 "fr": "Jawhara (viscose & silk)",
 "en": "Jawhara (viscose & silk)",
 "es": "Jawhara (poly y seda) — o co-creación a partir de 100 piezas por tejido",
 "tr": "Jawhara (poly ve ipek) — ya da kumaş başına 100 parçadan başlayan ortak üretim",
 "ar": "Jawhara (بولي وحرير) — أو إنتاج مشترك ابتداءً من 100 قطعة لكل قماش"
 },
 "color": null,
 "size": {
 "fr": "Size-free / tie-adjustable unless codebase requires sizing; do not invent fixed measurements",
 "en": "Size-free / tie-adjustable unless codebase requires sizing; do not invent fixed measurements",
 "es": "Talla única / ajustable con lazada",
 "tr": "Tek beden / bağlama ile ayarlanabilir",
 "ar": "مقاس حر / قابل للضبط بالربط"
 },
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Size-free / tie-adjustable unless codebase requires sizing; do not invent fixed measurements",
 "en": "Size-free / tie-adjustable unless codebase requires sizing; do not invent fixed measurements",
 "es": "Talla única / ajustable con lazada",
 "tr": "Tek beden / bağlama ile ayarlanabilir",
 "ar": "مقاس حر / قابل للضبط بالربط"
 },
 "whatFits": null,
 "attachment": null,
 "handworkTime": {
 "fr": "Coupe, finitions et details Jawhara controles a la main.",
 "en": "Cut, finishing and Jawhara details checked by hand.",
 "es": "Corte, acabados y detalles Jawhara verificados a mano.",
 "tr": "Kesim, bitişler ve Jawhara detayları elle kontrol edilir.",
 "ar": "القصّ والتشطيب وتفاصيل Jawhara تُراجع يدوياً."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Piece Jawhara finie a la main, pensee pour les ensembles d ete et les looks resort.",
 "en": "Hand-finished Jawhara piece designed for summer sets and resort looks.",
 "es": "Pieza Jawhara terminada a mano, pensada para conjuntos de verano y looks resort.",
 "tr": "Elle tamamlanan Jawhara parçası; yaz kombinleri ve resort görünümleri için tasarlandı.",
 "ar": "قطعة Jawhara تُنهى يدوياً، مصمَّمة لأطقم الصيف ومظاهر المنتجعات."
 },
 "care": {
 "fr": "Lavage doux à froid recommandé. Séchage à l’air libre. Repassage délicat sur l’envers.",
 "en": "Gentle cold wash recommended. Air dry. Delicate ironing inside out.",
 "es": "Lavado suave en frío recomendado. Secar al aire. Planchar con delicadeza del revés.",
 "tr": "Nazik soğuk yıkama önerilir. Havada kurutun. İçi dışına çevrilerek hassas ütüleme.",
 "ar": "يُنصح بالغسيل اللطيف على البارد. تجفيف في الهواء. كيّ خفيف من الجانب الداخلي."
 },
 "packaging": {
 "fr": "Emballage YZA sobre, prêt pour cadeau ou retrait studio.",
 "en": "Minimal YZA packaging, ready for gifting or studio pickup.",
 "es": "Embalaje YZA discreto, listo para regalo o recogida en el estudio.",
 "tr": "Sade YZA ambalajı, hediye veya stüdyodan teslim almaya hazır.",
 "ar": "تغليف YZA أنيق وبسيط، جاهز للهدية أو الاستلام من الاستوديو."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli gönderim. Guéliz’de stüdyodan teslim alma mümkün.",
 "ar": "شحن متتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Édition limitée Jawhara; les tissus peuvent changer selon disponibilite.",
 "en": "Limited-edition Jawhara; fabrics may change depending on availability.",
 "es": "Éditions limitées Jawhara; los tejidos pueden cambiar según la disponibilidad.",
 "tr": "Küçük Jawhara serisi; kumaşlar temin durumuna göre değişebilir.",
 "ar": "دُفعة Jawhara محدودة؛ قد تتغير الأقمشة حسب التوفر."
 },
 "edition": {
 "fr": "Édition limitée Jawhara; les tissus peuvent changer selon disponibilite.",
 "en": "Limited-edition Jawhara; fabrics may change depending on availability.",
 "es": "Éditions limitées Jawhara; los tejidos pueden cambiar según la disponibilidad.",
 "tr": "Küçük Jawhara serisi; kumaşlar temin durumuna göre değişebilir.",
 "ar": "دُفعة Jawhara محدودة؛ قد تتغير الأقمشة حسب التوفر."
 },
 "badge": "limited",
 "hours": null,
 "giftable": false,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "raffia-cherries-charm-ss26",
 "yza-pareo-skirt-short-jawhara-ss26"
 ]
 },
 {
 "handle": "yza-bateau-top-jawhara-ss26",
 "legacyHandles": [],
 "sku": "T-CB-JWP-BL",
 "name": {
 "fr": "Top bateau Jawhara",
 "en": "YZA Bateau Top",
 "es": "YZA Bateau Top",
 "tr": "YZA Bateau Top",
 "ar": "YZA Bateau Top"
 },
 "displayName": {
 "fr": "Top bateau Jawhara",
 "en": "YZA Bateau Top",
 "es": "YZA Bateau Top",
 "tr": "YZA Bateau Top",
 "ar": "YZA Bateau Top"
 },
 "short": {
 "fr": "Top bateau Jawhara, piece Jawhara a associer aux pareos et sacs YZA.",
 "en": "A Jawhara bateau top for summer sets, finished with handmade Amazigh letter beading.",
 "es": "Top Jawhara de cuello barca para conjuntos de verano, acabado con bordado de letras Amazigh hecho a mano.",
 "tr": "Yaz kombinleri için Jawhara col bateau top; el yapımı Amazigh harf boncuk işlemesiyle tamamlanmış.",
 "ar": "توب Jawhara بياقة بارو لأطقم الصيف، مزيَّن بخرز حروف Amazigh المصنوع يدوياً."
 },
 "displayShort": {
 "fr": "Top bateau Jawhara, piece Jawhara a associer aux pareos et sacs YZA.",
 "en": "A Jawhara bateau top for summer sets, finished with handmade Amazigh letter beading.",
 "es": "Top Jawhara de cuello barca para conjuntos de verano, acabado con bordado de letras Amazigh hecho a mano.",
 "tr": "Yaz kombinleri için Jawhara col bateau top; el yapımı Amazigh harf boncuk işlemesiyle tamamlanmış.",
 "ar": "توب Jawhara بياقة بارو لأطقم الصيف، مزيَّن بخرز حروف Amazigh المصنوع يدوياً."
 },
 "desc": {
 "fr": "Top bateau Jawhara, piece Jawhara a associer aux pareos et sacs YZA.",
 "en": "The YZA Bateau Top is part of the Resort Marrakesh Wear line. Made in Jawhara, a striped textile traditionally associated with formalwear, it translates local wardrobe codes into a modern, size-flexible summer piece.",
 "es": "El YZA Bateau Top forma parte de la línea Resort Marrakech Wear. Confeccionado en Jawhara, un tejido a rayas asociado tradicionalmente a la ropa de ceremonia, traduce los códigos del guardarropa local en una pieza de verano moderna y de talla flexible.",
 "tr": "YZA Bateau Top, Resort Marrakech Wear serisinin bir parçası. Geleneksel olarak resmi kıyafetlerle ilişkilendirilen çizgili bir tekstil olan Jawhara'dan yapılmış; yerel dolap kodlarını modern, beden esnekliğine sahip bir yaz parçasına dönüştürüyor.",
 "ar": "يُشكّل YZA Bateau Top جزءاً من خط Resort Marrakech Wear. مصنوع من Jawhara، نسيج مخطَّط مرتبط تقليدياً بالملابس الرسمية، يُترجم أكواد خزانة الملابس المحلية إلى قطعة صيفية معاصرة مرنة في المقاس."
 },
 "price": 55000,
 "currency": "MAD",
 "category": "tops",
 "sourceCategory": "Pairing Tops",
 "categoryLabel": {
 "fr": "Tops",
 "en": "Tops",
 "es": "Tops",
 "tr": "Üstler",
 "ar": "قطع علوية"
 },
 "group": "rtw",
 "collection": {
 "fr": "Resort Marrakech Wear",
 "en": "Resort Marrakech Wear",
 "es": "Resort Marrakech Wear",
 "tr": "Resort Marrakech Wear",
 "ar": "Resort Marrakech Wear"
 },
 "season": "All Seasons 2026",
 "img": "assets/lookbook-ss26-27/embedded/p29_img04_xref1215_ea0a78123e7b.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p29_img04_xref1215_ea0a78123e7b.jpeg",
 "assets/lookbook-ss26-27/embedded/p29_img03_xref1214_6b93fb974a48.jpeg"
 ],
 "familyHandle": "jawhara-tops",
 "familyOrder": 2,
 "variantLabel": {
 "fr": "Bateau",
 "en": "Bateau",
 "es": "Cuello barca",
 "tr": "Kayık yaka",
 "ar": "ياقة بارو"
 },
 "availableColors": [
 {
 "fr": "Blanc",
 "en": "White",
 "es": "Blanco",
 "tr": "Beyaz",
 "ar": "أبيض"
 },
 {
 "fr": "Noir",
 "en": "Black",
 "es": "Negro",
 "tr": "Siyah",
 "ar": "أسود"
 },
 {
 "fr": "Jaune moutarde",
 "en": "Mustard yellow",
 "es": "Amarillo mostaza",
 "tr": "Hardal sarısı",
 "ar": "أصفر خردل"
 },
 {
 "fr": "Vert",
 "en": "Green",
 "es": "Verde",
 "tr": "Yeşil",
 "ar": "أخضر"
 },
 {
 "fr": "Rose vieux",
 "en": "Dusty rose",
 "es": "Rosa viejo",
 "tr": "Soluk pembe",
 "ar": "وردي عتيق"
 },
 {
 "fr": "Rouge",
 "en": "Red",
 "es": "Rojo",
 "tr": "Kırmızı",
 "ar": "أحمر"
 },
 {
 "fr": "Bordeaux",
 "en": "Bordeaux",
 "es": "Burdeos",
 "tr": "Bordo",
 "ar": "بوردو"
 },
 {
 "fr": "Bleu majorelle",
 "en": "Majorelle blue",
 "es": "Azul Majorelle",
 "tr": "Majorelle mavisi",
 "ar": "أزرق ماجوريل"
 },
 {
 "fr": "Vert profond",
 "en": "Deep green",
 "es": "Verde profundo",
 "tr": "Koyu yeşil",
 "ar": "أخضر عميق"
 }
 ],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "yza-bateau-top-jawhara-ss26",
 "sku": "T-CB-JWP-BL",
 "category": "Top",
 "source_type": "col bateau",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-bateau-top-jawhara-ss26",
 "sku": "T-CB-JWP-NR",
 "category": "Top",
 "source_type": "col bateau",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-bateau-top-jawhara-ss26",
 "sku": "T-CB-JWP-JM",
 "category": "Top",
 "source_type": "col bateau",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-bateau-top-jawhara-ss26",
 "sku": "T-CB-JWP-VR",
 "category": "Top",
 "source_type": "col bateau",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-bateau-top-jawhara-ss26",
 "sku": "T-CB-JWP-RV",
 "category": "Top",
 "source_type": "col bateau",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-bateau-top-jawhara-ss26",
 "sku": "T-CB-JWP-RG",
 "category": "Top",
 "source_type": "col bateau",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-bateau-top-jawhara-ss26",
 "sku": "T-CB-JWP-BD",
 "category": "Top",
 "source_type": "col bateau",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-bateau-top-jawhara-ss26",
 "sku": "T-CB-JWP-BLU",
 "category": "Top",
 "source_type": "col bateau",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-bateau-top-jawhara-ss26",
 "sku": "T-CB-JWP-VP",
 "category": "Top",
 "source_type": "col bateau",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 }
 ],
 "variantCount": 9,
 "variant_count_from_xlsx_catalog": 9,
 "tags": [
 "SS26",
 "Resort Wear",
 "Jawhara",
 "Bateau top",
 "Amazigh beading",
 "Marrakech"
 ],
 "seoTitle": "YZA Bateau Top - Jawhara Resort Wear Handmade in Marrakech",
 "seoKeywords": [
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Resort Marrakesh Wear",
 "Top bateau Jawhara",
 "YZA",
 "YZA Bateau Top",
 "a",
 "crochet",
 "fait main",
 "handmade",
 "jawhara",
 "jupe",
 "pantalon",
 "pareo",
 "porter",
 "pret",
 "ready",
 "resort",
 "rtw",
 "to",
 "top",
 "tops",
 "wear",
 "yza-bateau-top-jawhara-ss26"
 ],
 "languageSearchTerms": [
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Resort Marrakesh Wear",
 "Top bateau Jawhara",
 "YZA",
 "YZA Bateau Top",
 "a",
 "crochet",
 "fait main",
 "handmade",
 "jawhara",
 "jupe",
 "pantalon",
 "pareo",
 "porter",
 "pret",
 "ready",
 "resort",
 "rtw",
 "to",
 "top",
 "tops",
 "wear",
 "yza-bateau-top-jawhara-ss26"
 ],
 "material": {
 "fr": "Jawhara viscose & silk, details faits main",
 "en": "Jawhara viscose & silk with handmade details",
 "es": "Jawhara poly y seda con detalles hechos a mano",
 "tr": "El yapımı detaylı Jawhara poly ve ipek",
 "ar": "Jawhara بولي وحرير مع تفاصيل مصنوعة يدوياً"
 },
 "fabric": {
 "fr": "Jawhara (viscose & silk)",
 "en": "Jawhara (viscose & silk)",
 "es": "Jawhara (poly y seda) — o co-creación a partir de 100 piezas por tejido",
 "tr": "Jawhara (poly ve ipek) — ya da kumaş başına 100 parçadan başlayan ortak üretim",
 "ar": "Jawhara (بولي وحرير) — أو إنتاج مشترك ابتداءً من 100 قطعة لكل قماش"
 },
 "color": null,
 "size": {
 "fr": "Size-free / adjustable unless existing product spec defines sizes; do not invent exact measurements",
 "en": "Size-free / adjustable unless existing product spec defines sizes; do not invent exact measurements",
 "es": "Talla única / ajustable",
 "tr": "Tek beden / ayarlanabilir",
 "ar": "مقاس حر / قابل للضبط"
 },
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Size-free / adjustable unless existing product spec defines sizes; do not invent exact measurements",
 "en": "Size-free / adjustable unless existing product spec defines sizes; do not invent exact measurements",
 "es": "Talla única / ajustable",
 "tr": "Tek beden / ayarlanabilir",
 "ar": "مقاس حر / قابل للضبط"
 },
 "whatFits": null,
 "attachment": null,
 "handworkTime": {
 "fr": "Coupe, finitions et details Jawhara controles a la main.",
 "en": "Cut, finishing and Jawhara details checked by hand.",
 "es": "Corte, acabados y detalles Jawhara verificados a mano.",
 "tr": "Kesim, bitişler ve Jawhara detayları elle kontrol edilir.",
 "ar": "القصّ والتشطيب وتفاصيل Jawhara تُراجع يدوياً."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Piece Jawhara finie a la main, pensee pour les ensembles d ete et les looks resort.",
 "en": "Hand-finished Jawhara piece designed for summer sets and resort looks.",
 "es": "Pieza Jawhara terminada a mano, pensada para conjuntos de verano y looks resort.",
 "tr": "Elle tamamlanan Jawhara parçası; yaz kombinleri ve resort görünümleri için tasarlandı.",
 "ar": "قطعة Jawhara تُنهى يدوياً، مصمَّمة لأطقم الصيف ومظاهر المنتجعات."
 },
 "care": {
 "fr": "Lavage doux à froid recommandé. Séchage à l’air libre. Repassage délicat sur l’envers.",
 "en": "Gentle cold wash recommended. Air dry. Delicate ironing inside out.",
 "es": "Lavado suave en frío recomendado. Secar al aire. Planchar con delicadeza del revés.",
 "tr": "Nazik soğuk yıkama önerilir. Havada kurutun. İçi dışına çevrilerek hassas ütüleme.",
 "ar": "يُنصح بالغسيل اللطيف على البارد. تجفيف في الهواء. كيّ خفيف من الجانب الداخلي."
 },
 "packaging": {
 "fr": "Emballage YZA sobre, prêt pour cadeau ou retrait studio.",
 "en": "Minimal YZA packaging, ready for gifting or studio pickup.",
 "es": "Embalaje YZA discreto, listo para regalo o recogida en el estudio.",
 "tr": "Sade YZA ambalajı, hediye veya stüdyodan teslim almaya hazır.",
 "ar": "تغليف YZA أنيق وبسيط، جاهز للهدية أو الاستلام من الاستوديو."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli gönderim. Guéliz’de stüdyodan teslim alma mümkün.",
 "ar": "شحن متتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Édition limitée Jawhara; les tissus peuvent changer selon disponibilite.",
 "en": "Limited-edition Jawhara; fabrics may change depending on availability.",
 "es": "Éditions limitées Jawhara; los tejidos pueden cambiar según la disponibilidad.",
 "tr": "Küçük Jawhara serisi; kumaşlar temin durumuna göre değişebilir.",
 "ar": "دُفعة Jawhara محدودة؛ قد تتغير الأقمشة حسب التوفر."
 },
 "edition": {
 "fr": "Édition limitée Jawhara; les tissus peuvent changer selon disponibilite.",
 "en": "Limited-edition Jawhara; fabrics may change depending on availability.",
 "es": "Éditions limitées Jawhara; los tejidos pueden cambiar según la disponibilidad.",
 "tr": "Küçük Jawhara serisi; kumaşlar temin durumuna göre değişebilir.",
 "ar": "دُفعة Jawhara محدودة؛ قد تتغير الأقمشة حسب التوفر."
 },
 "badge": "limited",
 "hours": null,
 "giftable": false,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "raffia-cherries-charm-ss26",
 "yza-pareo-skirt-short-jawhara-ss26"
 ]
 },
 {
 "handle": "yza-button-up-shirt-jawhara-ss26",
 "legacyHandles": [],
 "sku": "T-CH-S-JWP-BL",
 "name": {
 "fr": "Chemise Jawhara",
 "en": "YZA Button-Up Shirt",
 "es": "YZA Button-Up Shirt",
 "tr": "YZA Button-Up Shirt",
 "ar": "YZA Button-Up Shirt"
 },
 "displayName": {
 "fr": "Chemise Jawhara",
 "en": "YZA Button-Up Shirt",
 "es": "YZA Button-Up Shirt",
 "tr": "YZA Button-Up Shirt",
 "ar": "YZA Button-Up Shirt"
 },
 "short": {
 "fr": "Chemise Jawhara, piece Jawhara a associer aux pareos et sacs YZA.",
 "en": "A Jawhara button-up shirt in S/M/L, designed as part of YZA’s cool summer sets and finished with handmade Amazigh letter beading.",
 "es": "Camisa Jawhara abotonada en S/M/L, diseñada para los conjuntos frescos de verano de YZA y acabada con bordado de letras Amazigh hecho a mano.",
 "tr": "S/M/L bedenlerinde Jawhara düğmeli gömlek; YZA’nın serin yaz kombinleri için tasarlandı, el yapımı Amazigh harf boncuk işlemesiyle tamamlandı.",
 "ar": "قميص Jawhara بأزرار بمقاسات S/M/L، مصمَّم لأطقم الصيف المنعشة من YZA ومزيَّن بخرز حروف Amazigh المصنوع يدوياً."
 },
 "displayShort": {
 "fr": "Chemise Jawhara, piece Jawhara a associer aux pareos et sacs YZA.",
 "en": "A Jawhara button-up shirt in S/M/L, designed as part of YZA’s cool summer sets and finished with handmade Amazigh letter beading.",
 "es": "Camisa Jawhara abotonada en S/M/L, diseñada para los conjuntos frescos de verano de YZA y acabada con bordado de letras Amazigh hecho a mano.",
 "tr": "S/M/L bedenlerinde Jawhara düğmeli gömlek; YZA’nın serin yaz kombinleri için tasarlandı, el yapımı Amazigh harf boncuk işlemesiyle tamamlandı.",
 "ar": "قميص Jawhara بأزرار بمقاسات S/M/L، مصمَّم لأطقم الصيف المنعشة من YZA ومزيَّن بخرز حروف Amazigh المصنوع يدوياً."
 },
 "desc": {
 "fr": "Chemise Jawhara, piece Jawhara a associer aux pareos et sacs YZA.",
 "en": "The YZA Button-Up Shirt reworks Jawhara fabric into a modern Marrakchi wardrobe staple. It belongs to the Resort Marrakesh Wear family and is designed to pair with YZA pareo skirts, palazzo pants, wrap pants and basket bags.",
 "es": "El YZA Button-Up Shirt reinterpreta el tejido Jawhara como un básico del guardarropa marrakchí moderno. Pertenece a la familia Resort Marrakech Wear y está pensado para combinar con las faldas pareo, los pantalones palazzo, los pantalones cruzados y las cestas de YZA.",
 "tr": "YZA Button-Up Shirt, Jawhara kumaşını modern bir Marakeşli dolap temel parçasına dönüştürüyor. Resort Marrakech Wear ailesine ait olan bu gömlek, YZA’nın pareo etekleri, palazzo pantolonları, etek pantolonları ve sepet çantalarıyla kombin için tasarlandı.",
 "ar": "يُعيد YZA Button-Up Shirt تشكيل قماش Jawhara ليصبح قطعة أساسية في خزانة الملابس المراكشية المعاصرة. ينتمي إلى عائلة Resort Marrakech Wear ومصمَّم للتنسيق مع تنانير الباريو وبنطال البالاتزو والبنطال الملفوف والسلال من YZA."
 },
 "price": 88000,
 "currency": "MAD",
 "category": "tops",
 "sourceCategory": "Pairing Tops",
 "categoryLabel": {
 "fr": "Tops",
 "en": "Tops",
 "es": "Tops",
 "tr": "Üstler",
 "ar": "قطع علوية"
 },
 "group": "rtw",
 "collection": {
 "fr": "Resort Marrakech Wear",
 "en": "Resort Marrakech Wear",
 "es": "Resort Marrakech Wear",
 "tr": "Resort Marrakech Wear",
 "ar": "Resort Marrakech Wear"
 },
 "season": "All Seasons 2026",
 "img": "assets/lookbook-ss26-27/embedded/p30_img03_xref1221_6a80517bd62a.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p30_img03_xref1221_6a80517bd62a.jpeg",
 "assets/lookbook-ss26-27/embedded/p30_img01_xref1219_8b2d1136309d.jpeg",
 "assets/lookbook-ss26-27/embedded/p29_img01_xref1212_d56a9ef89119.jpeg"
 ],
 "familyHandle": "jawhara-tops",
 "familyOrder": 3,
 "variantLabel": {
 "fr": "Chemise S/M/L",
 "en": "Shirt S/M/L",
 "es": "Camisa S/M/L",
 "tr": "Gömlek S/M/L",
 "ar": "قميص S/M/L"
 },
 "availableColors": [
 {
 "fr": "Blanc",
 "en": "White",
 "es": "Blanco",
 "tr": "Beyaz",
 "ar": "أبيض"
 },
 {
 "fr": "Noir",
 "en": "Black",
 "es": "Negro",
 "tr": "Siyah",
 "ar": "أسود"
 },
 {
 "fr": "Jaune moutarde",
 "en": "Mustard yellow",
 "es": "Amarillo mostaza",
 "tr": "Hardal sarısı",
 "ar": "أصفر خردل"
 },
 {
 "fr": "Vert",
 "en": "Green",
 "es": "Verde",
 "tr": "Yeşil",
 "ar": "أخضر"
 },
 {
 "fr": "Rose vieux",
 "en": "Dusty rose",
 "es": "Rosa viejo",
 "tr": "Soluk pembe",
 "ar": "وردي عتيق"
 },
 {
 "fr": "Rouge",
 "en": "Red",
 "es": "Rojo",
 "tr": "Kırmızı",
 "ar": "أحمر"
 },
 {
 "fr": "Bordeaux",
 "en": "Bordeaux",
 "es": "Burdeos",
 "tr": "Bordo",
 "ar": "بوردو"
 },
 {
 "fr": "Bleu majorelle",
 "en": "Majorelle blue",
 "es": "Azul Majorelle",
 "tr": "Majorelle mavisi",
 "ar": "أزرق ماجوريل"
 },
 {
 "fr": "Vert profond",
 "en": "Deep green",
 "es": "Verde profundo",
 "tr": "Koyu yeşil",
 "ar": "أخضر عميق"
 }
 ],
 "availableSizes": [
 "S",
 "M",
 "L"
 ],
 "variants": [
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-S-JWP-BL",
 "category": "Top",
 "source_type": "Chemise S",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": "S",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-M-JWP-BL",
 "category": "Top",
 "source_type": "Chemise M",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": "M",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-L-JWP-BL",
 "category": "Top",
 "source_type": "Chemise L",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": "L",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-S-JWP-NR",
 "category": "Top",
 "source_type": "Chemise S",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": "S",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-M-JWP-NR",
 "category": "Top",
 "source_type": "Chemise M",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": "M",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-L-JWP-NR",
 "category": "Top",
 "source_type": "Chemise L",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": "L",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-S-JWP-JM",
 "category": "Top",
 "source_type": "Chemise S",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": "S",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-M-JWP-JM",
 "category": "Top",
 "source_type": "Chemise M",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": "M",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-L-JWP-JM",
 "category": "Top",
 "source_type": "Chemise L",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": "L",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-S-JWP-VR",
 "category": "Top",
 "source_type": "Chemise S",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": "S",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-M-JWP-VR",
 "category": "Top",
 "source_type": "Chemise M",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": "M",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-L-JWP-VR",
 "category": "Top",
 "source_type": "Chemise L",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": "L",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-S-JWP-RV",
 "category": "Top",
 "source_type": "Chemise S",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": "S",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-M-JWP-RV",
 "category": "Top",
 "source_type": "Chemise M",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": "M",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-L-JWP-RV",
 "category": "Top",
 "source_type": "Chemise L",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": "L",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-S-JWP-RG",
 "category": "Top",
 "source_type": "Chemise S",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": "S",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-M-JWP-RG",
 "category": "Top",
 "source_type": "Chemise M",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": "M",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-L-JWP-RG",
 "category": "Top",
 "source_type": "Chemise L",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": "L",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-S-JWP-BD",
 "category": "Top",
 "source_type": "Chemise S",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": "S",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-M-JWP-BD",
 "category": "Top",
 "source_type": "Chemise M",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": "M",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-L-JWP-BD",
 "category": "Top",
 "source_type": "Chemise L",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": "L",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-S-JWP-BLU",
 "category": "Top",
 "source_type": "Chemise S",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": "S",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-M-JWP-BLU",
 "category": "Top",
 "source_type": "Chemise M",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": "M",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-L-JWP-BLU",
 "category": "Top",
 "source_type": "Chemise L",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": "L",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-S-JWP-VP",
 "category": "Top",
 "source_type": "Chemise S",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": "S",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-M-JWP-VP",
 "category": "Top",
 "source_type": "Chemise M",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": "M",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-L-JWP-VP",
 "category": "Top",
 "source_type": "Chemise L",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": "L",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 }
 ],
 "variantCount": 27,
 "variant_count_from_xlsx_catalog": 27,
 "tags": [
 "SS26",
 "Resort Wear",
 "Jawhara",
 "Button up shirt",
 "Amazigh beading",
 "Marrakech"
 ],
 "seoTitle": "YZA Button-Up Shirt - Jawhara Resort Wear Handmade in Marrakech",
 "seoKeywords": [
 "Chemise Jawhara",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Resort Marrakesh Wear",
 "YZA",
 "YZA Button-Up Shirt",
 "a",
 "crochet",
 "fait main",
 "handmade",
 "jawhara",
 "jupe",
 "pantalon",
 "pareo",
 "porter",
 "pret",
 "ready",
 "resort",
 "rtw",
 "to",
 "top",
 "tops",
 "wear",
 "yza-button-up-shirt-jawhara-ss26"
 ],
 "languageSearchTerms": [
 "Chemise Jawhara",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Resort Marrakesh Wear",
 "YZA",
 "YZA Button-Up Shirt",
 "a",
 "crochet",
 "fait main",
 "handmade",
 "jawhara",
 "jupe",
 "pantalon",
 "pareo",
 "porter",
 "pret",
 "ready",
 "resort",
 "rtw",
 "to",
 "top",
 "tops",
 "wear",
 "yza-button-up-shirt-jawhara-ss26"
 ],
 "material": {
 "fr": "Jawhara viscose & silk, details faits main",
 "en": "Jawhara viscose & silk with handmade details",
 "es": "Jawhara poly y seda con detalles hechos a mano",
 "tr": "El yapımı detaylı Jawhara poly ve ipek",
 "ar": "Jawhara بولي وحرير مع تفاصيل مصنوعة يدوياً"
 },
 "fabric": {
 "fr": "Jawhara (viscose & silk)",
 "en": "Jawhara (viscose & silk)",
 "es": "Jawhara (poly y seda) — o co-creación a partir de 100 piezas por tejido",
 "tr": "Jawhara (poly ve ipek) — ya da kumaş başına 100 parçadan başlayan ortak üretim",
 "ar": "Jawhara (بولي وحرير) — أو إنتاج مشترك ابتداءً من 100 قطعة لكل قماش"
 },
 "color": null,
 "size": {
 "fr": "S / M / L",
 "en": "S / M / L",
 "es": "S / M / L",
 "tr": "S / M / L",
 "ar": "S / M / L"
 },
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "S / M / L",
 "en": "S / M / L",
 "es": "S / M / L",
 "tr": "S / M / L",
 "ar": "S / M / L"
 },
 "whatFits": null,
 "attachment": null,
 "handworkTime": {
 "fr": "Coupe, finitions et details Jawhara controles a la main.",
 "en": "Cut, finishing and Jawhara details checked by hand.",
 "es": "Corte, acabados y detalles Jawhara verificados a mano.",
 "tr": "Kesim, bitişler ve Jawhara detayları elle kontrol edilir.",
 "ar": "القصّ والتشطيب وتفاصيل Jawhara تُراجع يدوياً."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Piece Jawhara finie a la main, pensee pour les ensembles d ete et les looks resort.",
 "en": "Hand-finished Jawhara piece designed for summer sets and resort looks.",
 "es": "Pieza Jawhara terminada a mano, pensada para conjuntos de verano y looks resort.",
 "tr": "Elle tamamlanan Jawhara parçası; yaz kombinleri ve resort görünümleri için tasarlandı.",
 "ar": "قطعة Jawhara تُنهى يدوياً، مصمَّمة لأطقم الصيف ومظاهر المنتجعات."
 },
 "care": {
 "fr": "Lavage doux à froid recommandé. Séchage à l’air libre. Repassage délicat sur l’envers.",
 "en": "Gentle cold wash recommended. Air dry. Delicate ironing inside out.",
 "es": "Lavado suave en frío recomendado. Secar al aire. Planchar con delicadeza del revés.",
 "tr": "Nazik soğuk yıkama önerilir. Havada kurutun. İçi dışına çevrilerek hassas ütüleme.",
 "ar": "يُنصح بالغسيل اللطيف على البارد. تجفيف في الهواء. كيّ خفيف من الجانب الداخلي."
 },
 "packaging": {
 "fr": "Emballage YZA sobre, prêt pour cadeau ou retrait studio.",
 "en": "Minimal YZA packaging, ready for gifting or studio pickup.",
 "es": "Embalaje YZA discreto, listo para regalo o recogida en el estudio.",
 "tr": "Sade YZA ambalajı, hediye veya stüdyodan teslim almaya hazır.",
 "ar": "تغليف YZA أنيق وبسيط، جاهز للهدية أو الاستلام من الاستوديو."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli gönderim. Guéliz’de stüdyodan teslim alma mümkün.",
 "ar": "شحن متتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Édition limitée Jawhara; les tissus peuvent changer selon disponibilite.",
 "en": "Limited-edition Jawhara; fabrics may change depending on availability.",
 "es": "Éditions limitées Jawhara; los tejidos pueden cambiar según la disponibilidad.",
 "tr": "Küçük Jawhara serisi; kumaşlar temin durumuna göre değişebilir.",
 "ar": "دُفعة Jawhara محدودة؛ قد تتغير الأقمشة حسب التوفر."
 },
 "edition": {
 "fr": "Édition limitée Jawhara; les tissus peuvent changer selon disponibilite.",
 "en": "Limited-edition Jawhara; fabrics may change depending on availability.",
 "es": "Éditions limitées Jawhara; los tejidos pueden cambiar según la disponibilidad.",
 "tr": "Küçük Jawhara serisi; kumaşlar temin durumuna göre değişebilir.",
 "ar": "دُفعة Jawhara محدودة؛ قد تتغير الأقمشة حسب التوفر."
 },
 "badge": "limited",
 "hours": null,
 "giftable": false,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "raffia-cherries-charm-ss26",
 "yza-pareo-skirt-short-jawhara-ss26"
 ]
 },
 {
 "handle": "yza-pareo-skirt-short-jawhara-ss26",
 "legacyHandles": [
 "pareo-short"
 ],
 "sku": "B-JPC-JWP-BL",
 "name": {
 "fr": "Jupe pareo courte Jawhara",
 "en": "YZA Pareo Skirt - Short",
 "es": "YZA Pareo Skirt - Short",
 "tr": "YZA Pareo Skirt - Short",
 "ar": "YZA Pareo Skirt - Short"
 },
 "displayName": {
 "fr": "Jupe pareo courte Jawhara",
 "en": "YZA Pareo Skirt - Short",
 "es": "YZA Pareo Skirt - Short",
 "tr": "YZA Pareo Skirt - Short",
 "ar": "YZA Pareo Skirt - Short"
 },
 "short": {
 "fr": "Jupe pareo courte Jawhara, taille libre XS a XXL.",
 "en": "A short, size-free Jawhara pareo skirt fitting XS to XXL, finished with handmade Amazigh letter beading.",
 "es": "Falda pareo corta Jawhara de talla libre de XS a XXL, acabada con bordado de letras Amazigh hecho a mano.",
 "tr": "XS'ten XXL'ye kadar uygun, beden esnekliğine sahip kısa Jawhara pareo etek; el yapımı Amazigh harf boncuk işlemesiyle tamamlandı.",
 "ar": "تنورة باريو Jawhara قصيرة مرنة في المقاس من XS إلى XXL، مزيَّنة بخرز حروف Amazigh المصنوع يدوياً."
 },
 "displayShort": {
 "fr": "Jupe pareo courte Jawhara, taille libre XS a XXL.",
 "en": "A short, size-free Jawhara pareo skirt fitting XS to XXL, finished with handmade Amazigh letter beading.",
 "es": "Falda pareo corta Jawhara de talla libre de XS a XXL, acabada con bordado de letras Amazigh hecho a mano.",
 "tr": "XS'ten XXL'ye kadar uygun, beden esnekliğine sahip kısa Jawhara pareo etek; el yapımı Amazigh harf boncuk işlemesiyle tamamlandı.",
 "ar": "تنورة باريو Jawhara قصيرة مرنة في المقاس من XS إلى XXL، مزيَّنة بخرز حروف Amazigh المصنوع يدوياً."
 },
 "desc": {
 "fr": "Jupe pareo courte Jawhara, taille libre XS a XXL.",
 "en": "The YZA Pareo Skirt is a size-free Resort Marrakesh Wear piece made in Jawhara, a striped textile traditionally used in formalwear. The short length is designed for movement from seaside days to summer nights out.",
 "es": "La YZA Pareo Skirt es una pieza Resort Marrakech Wear de talla libre confeccionada en Jawhara, un tejido a rayas usado tradicionalmente en ropa de ceremonia. El largo corto está pensado para el movimiento: de los días en la playa a las noches de verano.",
 "tr": "YZA Pareo Etek, geleneksel olarak resmi kıyafetlerde kullanılan çizgili bir tekstil olan Jawhara'dan yapılmış beden esnekliğine sahip bir Resort Marrakech Wear parçasıdır. Kısa boyu, deniz kenarı günlerinden yaz gecelerine hareketi desteklemek için tasarlandı.",
 "ar": "تنورة YZA Pareo Skirt قطعة Resort Marrakech Wear مرنة في المقاس، مصنوعة من Jawhara، نسيج مخطَّط استُخدم تقليدياً في الملابس الرسمية. الطول القصير مصمَّم للحركة، من أيام الشاطئ إلى سهرات الصيف."
 },
 "price": 44000,
 "currency": "MAD",
 "category": "pareos",
 "sourceCategory": "Pareo Skirts",
 "categoryLabel": {
 "fr": "Pareos",
 "en": "Pareos",
 "es": "Pareos",
 "tr": "Pareolar",
 "ar": "باريو"
 },
 "group": "rtw",
 "collection": {
 "fr": "Resort Marrakech Wear",
 "en": "Resort Marrakech Wear",
 "es": "Resort Marrakech Wear",
 "tr": "Resort Marrakech Wear",
 "ar": "Resort Marrakech Wear"
 },
 "season": "All Seasons 2026",
 "img": "assets/lookbook-ss26-27/embedded/p30_img01_xref1219_8b2d1136309d.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p30_img01_xref1219_8b2d1136309d.jpeg",
 "assets/lookbook-ss26-27/embedded/p29_img04_xref1215_ea0a78123e7b.jpeg"
 ],
 "familyHandle": "jawhara-pareos",
 "familyOrder": 1,
 "variantLabel": {
 "fr": "Courte",
 "en": "Short",
 "es": "Corta",
 "tr": "Kısa",
 "ar": "قصيرة"
 },
 "availableColors": [
 {
 "fr": "Blanc",
 "en": "White",
 "es": "Blanco",
 "tr": "Beyaz",
 "ar": "أبيض"
 },
 {
 "fr": "Noir",
 "en": "Black",
 "es": "Negro",
 "tr": "Siyah",
 "ar": "أسود"
 },
 {
 "fr": "Jaune moutarde",
 "en": "Mustard yellow",
 "es": "Amarillo mostaza",
 "tr": "Hardal sarısı",
 "ar": "أصفر خردل"
 },
 {
 "fr": "Vert",
 "en": "Green",
 "es": "Verde",
 "tr": "Yeşil",
 "ar": "أخضر"
 },
 {
 "fr": "Rose vieux",
 "en": "Dusty rose",
 "es": "Rosa viejo",
 "tr": "Soluk pembe",
 "ar": "وردي عتيق"
 },
 {
 "fr": "Rouge",
 "en": "Red",
 "es": "Rojo",
 "tr": "Kırmızı",
 "ar": "أحمر"
 },
 {
 "fr": "Bordeaux",
 "en": "Bordeaux",
 "es": "Burdeos",
 "tr": "Bordo",
 "ar": "بوردو"
 },
 {
 "fr": "Bleu majorelle",
 "en": "Majorelle blue",
 "es": "Azul Majorelle",
 "tr": "Majorelle mavisi",
 "ar": "أزرق ماجوريل"
 },
 {
 "fr": "Vert profond",
 "en": "Deep green",
 "es": "Verde profundo",
 "tr": "Koyu yeşil",
 "ar": "أخضر عميق"
 }
 ],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "yza-pareo-skirt-short-jawhara-ss26",
 "sku": "B-JPC-JWP-BL",
 "category": "Bottoms",
 "source_type": "Pareo courte",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-short-jawhara-ss26",
 "sku": "B-JPC-JWP-NR",
 "category": "Bottoms",
 "source_type": "Pareo courte",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-short-jawhara-ss26",
 "sku": "B-JPC-JWP-JM",
 "category": "Bottoms",
 "source_type": "Pareo courte",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-short-jawhara-ss26",
 "sku": "B-JPC-JWP-VR",
 "category": "Bottoms",
 "source_type": "Pareo courte",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-short-jawhara-ss26",
 "sku": "B-JPC-JWP-RV",
 "category": "Bottoms",
 "source_type": "Pareo courte",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-short-jawhara-ss26",
 "sku": "B-JPC-JWP-RG",
 "category": "Bottoms",
 "source_type": "Pareo courte",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-short-jawhara-ss26",
 "sku": "B-JPC-JWP-BD",
 "category": "Bottoms",
 "source_type": "Pareo courte",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-short-jawhara-ss26",
 "sku": "B-JPC-JWP-BLU",
 "category": "Bottoms",
 "source_type": "Pareo courte",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-short-jawhara-ss26",
 "sku": "B-JPC-JWP-VP",
 "category": "Bottoms",
 "source_type": "Pareo courte",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 }
 ],
 "variantCount": 9,
 "variant_count_from_xlsx_catalog": 9,
 "tags": [
 "SS26",
 "Resort Wear",
 "Jawhara",
 "Pareo skirt",
 "Short",
 "Size free",
 "Amazigh beading"
 ],
 "seoTitle": "YZA Pareo Skirt Short - Jawhara Resort Wear Handmade in Marrakech",
 "seoKeywords": [
 "Guéliz",
 "Guéliz",
 "Jupe pareo courte Jawhara",
 "Marrakech",
 "Marrakesh",
 "Resort Marrakesh Wear",
 "YZA",
 "YZA Pareo Skirt - Short",
 "a",
 "crochet",
 "fait main",
 "handmade",
 "jawhara",
 "jupe",
 "pantalon",
 "pareo",
 "pareos",
 "porter",
 "pret",
 "ready",
 "resort",
 "rtw",
 "to",
 "top",
 "wear",
 "yza-pareo-skirt-short-jawhara-ss26"
 ],
 "languageSearchTerms": [
 "Guéliz",
 "Guéliz",
 "Jupe pareo courte Jawhara",
 "Marrakech",
 "Marrakesh",
 "Resort Marrakesh Wear",
 "YZA",
 "YZA Pareo Skirt - Short",
 "a",
 "crochet",
 "fait main",
 "handmade",
 "jawhara",
 "jupe",
 "pantalon",
 "pareo",
 "pareos",
 "porter",
 "pret",
 "ready",
 "resort",
 "rtw",
 "to",
 "top",
 "wear",
 "yza-pareo-skirt-short-jawhara-ss26"
 ],
 "material": {
 "fr": "Jawhara viscose & silk, details faits main",
 "en": "Jawhara viscose & silk with handmade details",
 "es": "Jawhara poly y seda con detalles hechos a mano",
 "tr": "El yapımı detaylı Jawhara poly ve ipek",
 "ar": "Jawhara بولي وحرير مع تفاصيل مصنوعة يدوياً"
 },
 "fabric": {
 "fr": "Jawhara (viscose & silk)",
 "en": "Jawhara (viscose & silk)",
 "es": "Jawhara (poly y seda) — o co-creación a partir de 100 piezas por tejido",
 "tr": "Jawhara (poly ve ipek) — ya da kumaş başına 100 parçadan başlayan ortak üretim",
 "ar": "Jawhara (بولي وحرير) — أو إنتاج مشترك ابتداءً من 100 قطعة لكل قماش"
 },
 "color": null,
 "size": {
 "fr": "Size free, fits XS to XXL",
 "en": "Size free, fits XS to XXL",
 "es": "Talla única, de XS a XXL",
 "tr": "Tek beden, XS ile XXL arasına uyuyor",
 "ar": "مقاس حر، يناسب من XS إلى XXL"
 },
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Size free, fits XS to XXL",
 "en": "Size free, fits XS to XXL",
 "es": "Talla única, de XS a XXL",
 "tr": "Tek beden, XS ile XXL arasına uyuyor",
 "ar": "مقاس حر، يناسب من XS إلى XXL"
 },
 "whatFits": null,
 "attachment": null,
 "handworkTime": {
 "fr": "Coupe, finitions et details Jawhara controles a la main.",
 "en": "Cut, finishing and Jawhara details checked by hand.",
 "es": "Corte, acabados y detalles Jawhara verificados a mano.",
 "tr": "Kesim, bitişler ve Jawhara detayları elle kontrol edilir.",
 "ar": "القصّ والتشطيب وتفاصيل Jawhara تُراجع يدوياً."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Piece Jawhara finie a la main, pensee pour les ensembles d ete et les looks resort.",
 "en": "Hand-finished Jawhara piece designed for summer sets and resort looks.",
 "es": "Pieza Jawhara terminada a mano, pensada para conjuntos de verano y looks resort.",
 "tr": "Elle tamamlanan Jawhara parçası; yaz kombinleri ve resort görünümleri için tasarlandı.",
 "ar": "قطعة Jawhara تُنهى يدوياً، مصمَّمة لأطقم الصيف ومظاهر المنتجعات."
 },
 "care": {
 "fr": "Lavage doux à froid recommandé. Séchage à l’air libre. Repassage délicat sur l’envers.",
 "en": "Gentle cold wash recommended. Air dry. Delicate ironing inside out.",
 "es": "Lavado suave en frío recomendado. Secar al aire. Planchar con delicadeza del revés.",
 "tr": "Nazik soğuk yıkama önerilir. Havada kurutun. İçi dışına çevrilerek hassas ütüleme.",
 "ar": "يُنصح بالغسيل اللطيف على البارد. تجفيف في الهواء. كيّ خفيف من الجانب الداخلي."
 },
 "packaging": {
 "fr": "Emballage YZA sobre, prêt pour cadeau ou retrait studio.",
 "en": "Minimal YZA packaging, ready for gifting or studio pickup.",
 "es": "Embalaje YZA discreto, listo para regalo o recogida en el estudio.",
 "tr": "Sade YZA ambalajı, hediye veya stüdyodan teslim almaya hazır.",
 "ar": "تغليف YZA أنيق وبسيط، جاهز للهدية أو الاستلام من الاستوديو."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli gönderim. Guéliz’de stüdyodan teslim alma mümkün.",
 "ar": "شحن متتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Édition limitée Jawhara; les tissus peuvent changer selon disponibilite.",
 "en": "Limited-edition Jawhara; fabrics may change depending on availability.",
 "es": "Éditions limitées Jawhara; los tejidos pueden cambiar según la disponibilidad.",
 "tr": "Küçük Jawhara serisi; kumaşlar temin durumuna göre değişebilir.",
 "ar": "دُفعة Jawhara محدودة؛ قد تتغير الأقمشة حسب التوفر."
 },
 "edition": {
 "fr": "Édition limitée Jawhara; les tissus peuvent changer selon disponibilite.",
 "en": "Limited-edition Jawhara; fabrics may change depending on availability.",
 "es": "Éditions limitées Jawhara; los tejidos pueden cambiar según la disponibilidad.",
 "tr": "Küçük Jawhara serisi; kumaşlar temin durumuna göre değişebilir.",
 "ar": "دُفعة Jawhara محدودة؛ قد تتغير الأقمشة حسب التوفر."
 },
 "badge": "limited",
 "hours": null,
 "giftable": false,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "raffia-cherries-charm-ss26",
 "yza-scarf-top-jawhara-ss26"
 ]
 },
 {
 "handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "fewLeft": true,
 "legacyHandles": [
 "pareo-midi"
 ],
 "sku": "B-JPM-JWP-BL",
 "name": {
 "fr": "Jupe pareo midi Jawhara",
 "en": "YZA Pareo Skirt - Midi",
 "es": "YZA Pareo Skirt - Midi",
 "tr": "YZA Pareo Skirt - Midi",
 "ar": "YZA Pareo Skirt - Midi"
 },
 "displayName": {
 "fr": "Jupe pareo midi Jawhara",
 "en": "YZA Pareo Skirt - Midi",
 "es": "YZA Pareo Skirt - Midi",
 "tr": "YZA Pareo Skirt - Midi",
 "ar": "YZA Pareo Skirt - Midi"
 },
 "short": {
 "fr": "Jupe pareo midi Jawhara, taille libre XS a XXL.",
 "en": "A midi, size-free Jawhara pareo skirt fitting XS to XXL, finished with handmade Amazigh letter beading.",
 "es": "Falda pareo midi Jawhara de talla libre de XS a XXL, acabada con bordado de letras Amazigh hecho a mano.",
 "tr": "XS'ten XXL'ye kadar uygun, beden esnekliğine sahip midi Jawhara pareo etek; el yapımı Amazigh harf boncuk işlemesiyle tamamlandı.",
 "ar": "تنورة باريو Jawhara ميدي مرنة في المقاس من XS إلى XXL، مزيَّنة بخرز حروف Amazigh المصنوع يدوياً."
 },
 "displayShort": {
 "fr": "Jupe pareo midi Jawhara, taille libre XS a XXL.",
 "en": "A midi, size-free Jawhara pareo skirt fitting XS to XXL, finished with handmade Amazigh letter beading.",
 "es": "Falda pareo midi Jawhara de talla libre de XS a XXL, acabada con bordado de letras Amazigh hecho a mano.",
 "tr": "XS'ten XXL'ye kadar uygun, beden esnekliğine sahip midi Jawhara pareo etek; el yapımı Amazigh harf boncuk işlemesiyle tamamlandı.",
 "ar": "تنورة باريو Jawhara ميدي مرنة في المقاس من XS إلى XXL، مزيَّنة بخرز حروف Amazigh المصنوع يدوياً."
 },
 "desc": {
 "fr": "Jupe pareo midi Jawhara, taille libre XS a XXL.",
 "en": "The YZA Pareo Skirt in midi length is part of the Resort Marrakesh Wear wardrobe: modular, timeless and designed to move through life with you. Made in Jawhara and finished with handmade Amazigh letter beading.",
 "es": "La YZA Pareo Skirt en largo midi forma parte del guardarropa Resort Marrakech Wear: modular, atemporal y diseñada para acompañarte en cada momento. Confeccionada en Jawhara y acabada con bordado de letras Amazigh hecho a mano.",
 "tr": "Midi boyunda YZA Pareo Etek, Resort Marrakech Wear gardırobunun bir parçasıdır: modüler, zamansız ve hayatınla birlikte hareket etmek için tasarlandı. Jawhara'dan yapılmış, el yapımı Amazigh harf boncuk işlemesiyle tamamlandı.",
 "ar": "تنورة YZA Pareo Skirt بالطول الميدي جزء من خزانة Resort Marrakech Wear: قطعة معيارية، خارج الزمن، مصمَّمة لترافقكِ في كل لحظة. مصنوعة من Jawhara ومزيَّنة بخرز حروف Amazigh المصنوع يدوياً."
 },
 "price": 51000,
 "currency": "MAD",
 "category": "pareos",
 "sourceCategory": "Pareo Skirts",
 "categoryLabel": {
 "fr": "Pareos",
 "en": "Pareos",
 "es": "Pareos",
 "tr": "Pareolar",
 "ar": "باريو"
 },
 "group": "rtw",
 "collection": {
 "fr": "Resort Marrakech Wear",
 "en": "Resort Marrakech Wear",
 "es": "Resort Marrakech Wear",
 "tr": "Resort Marrakech Wear",
 "ar": "Resort Marrakech Wear"
 },
 "season": "All Seasons 2026",
 "img": "assets/lookbook-ss26-27/embedded/p29_img01_xref1212_d56a9ef89119.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p29_img01_xref1212_d56a9ef89119.jpeg",
 "assets/lookbook-ss26-27/embedded/p29_img04_xref1215_ea0a78123e7b.jpeg"
 ],
 "familyHandle": "jawhara-pareos",
 "familyOrder": 2,
 "variantLabel": {
 "fr": "Midi",
 "en": "Midi",
 "es": "Midi",
 "tr": "Midi",
 "ar": "ميدي"
 },
 "availableColors": [
 {
 "fr": "Blanc",
 "en": "White",
 "es": "Blanco",
 "tr": "Beyaz",
 "ar": "أبيض"
 },
 {
 "fr": "Noir",
 "en": "Black",
 "es": "Negro",
 "tr": "Siyah",
 "ar": "أسود"
 },
 {
 "fr": "Jaune moutarde",
 "en": "Mustard yellow",
 "es": "Amarillo mostaza",
 "tr": "Hardal sarısı",
 "ar": "أصفر خردل"
 },
 {
 "fr": "Vert",
 "en": "Green",
 "es": "Verde",
 "tr": "Yeşil",
 "ar": "أخضر"
 },
 {
 "fr": "Rose vieux",
 "en": "Dusty rose",
 "es": "Rosa viejo",
 "tr": "Soluk pembe",
 "ar": "وردي عتيق"
 },
 {
 "fr": "Rouge",
 "en": "Red",
 "es": "Rojo",
 "tr": "Kırmızı",
 "ar": "أحمر"
 },
 {
 "fr": "Bordeaux",
 "en": "Bordeaux",
 "es": "Burdeos",
 "tr": "Bordo",
 "ar": "بوردو"
 },
 {
 "fr": "Bleu majorelle",
 "en": "Majorelle blue",
 "es": "Azul Majorelle",
 "tr": "Majorelle mavisi",
 "ar": "أزرق ماجوريل"
 },
 {
 "fr": "Vert profond",
 "en": "Deep green",
 "es": "Verde profundo",
 "tr": "Koyu yeşil",
 "ar": "أخضر عميق"
 }
 ],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "sku": "B-JPM-JWP-BL",
 "category": "Bottoms",
 "source_type": "Pareo midi",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "sku": "B-JPM-JWP-NR",
 "category": "Bottoms",
 "source_type": "Pareo midi",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "sku": "B-JPM-JWP-JM",
 "category": "Bottoms",
 "source_type": "Pareo midi",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "sku": "B-JPM-JWP-VR",
 "category": "Bottoms",
 "source_type": "Pareo midi",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "sku": "B-JPM-JWP-RV",
 "category": "Bottoms",
 "source_type": "Pareo midi",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "sku": "B-JPM-JWP-RG",
 "category": "Bottoms",
 "source_type": "Pareo midi",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "sku": "B-JPM-JWP-BD",
 "category": "Bottoms",
 "source_type": "Pareo midi",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "sku": "B-JPM-JWP-BLU",
 "category": "Bottoms",
 "source_type": "Pareo midi",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "sku": "B-JPM-JWP-VP",
 "category": "Bottoms",
 "source_type": "Pareo midi",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 }
 ],
 "variantCount": 9,
 "variant_count_from_xlsx_catalog": 9,
 "tags": [
 "SS26",
 "Resort Wear",
 "Jawhara",
 "Pareo skirt",
 "Midi",
 "Size free",
 "Amazigh beading"
 ],
 "seoTitle": "YZA Pareo Skirt Midi - Jawhara Resort Wear Handmade in Marrakech",
 "seoKeywords": [
 "Guéliz",
 "Guéliz",
 "Jupe pareo midi Jawhara",
 "Marrakech",
 "Marrakesh",
 "Resort Marrakesh Wear",
 "YZA",
 "YZA Pareo Skirt - Midi",
 "a",
 "crochet",
 "fait main",
 "handmade",
 "jawhara",
 "jupe",
 "pantalon",
 "pareo",
 "pareos",
 "porter",
 "pret",
 "ready",
 "resort",
 "rtw",
 "to",
 "top",
 "wear",
 "yza-pareo-skirt-midi-jawhara-ss26"
 ],
 "languageSearchTerms": [
 "Guéliz",
 "Guéliz",
 "Jupe pareo midi Jawhara",
 "Marrakech",
 "Marrakesh",
 "Resort Marrakesh Wear",
 "YZA",
 "YZA Pareo Skirt - Midi",
 "a",
 "crochet",
 "fait main",
 "handmade",
 "jawhara",
 "jupe",
 "pantalon",
 "pareo",
 "pareos",
 "porter",
 "pret",
 "ready",
 "resort",
 "rtw",
 "to",
 "top",
 "wear",
 "yza-pareo-skirt-midi-jawhara-ss26"
 ],
 "material": {
 "fr": "Jawhara viscose & silk, details faits main",
 "en": "Jawhara viscose & silk with handmade details",
 "es": "Jawhara poly y seda con detalles hechos a mano",
 "tr": "El yapımı detaylı Jawhara poly ve ipek",
 "ar": "Jawhara بولي وحرير مع تفاصيل مصنوعة يدوياً"
 },
 "fabric": {
 "fr": "Jawhara (viscose & silk)",
 "en": "Jawhara (viscose & silk)",
 "es": "Jawhara (poly y seda) — o co-creación a partir de 100 piezas por tejido",
 "tr": "Jawhara (poly ve ipek) — ya da kumaş başına 100 parçadan başlayan ortak üretim",
 "ar": "Jawhara (بولي وحرير) — أو إنتاج مشترك ابتداءً من 100 قطعة لكل قماش"
 },
 "color": null,
 "size": {
 "fr": "Size free, fits XS to XXL",
 "en": "Size free, fits XS to XXL",
 "es": "Talla única, de XS a XXL",
 "tr": "Tek beden, XS ile XXL arasına uyuyor",
 "ar": "مقاس حر، يناسب من XS إلى XXL"
 },
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Size free, fits XS to XXL",
 "en": "Size free, fits XS to XXL",
 "es": "Talla única, de XS a XXL",
 "tr": "Tek beden, XS ile XXL arasına uyuyor",
 "ar": "مقاس حر، يناسب من XS إلى XXL"
 },
 "whatFits": null,
 "attachment": null,
 "handworkTime": {
 "fr": "Coupe, finitions et details Jawhara controles a la main.",
 "en": "Cut, finishing and Jawhara details checked by hand.",
 "es": "Corte, acabados y detalles Jawhara verificados a mano.",
 "tr": "Kesim, bitişler ve Jawhara detayları elle kontrol edilir.",
 "ar": "القصّ والتشطيب وتفاصيل Jawhara تُراجع يدوياً."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Piece Jawhara finie a la main, pensee pour les ensembles d ete et les looks resort.",
 "en": "Hand-finished Jawhara piece designed for summer sets and resort looks.",
 "es": "Pieza Jawhara terminada a mano, pensada para conjuntos de verano y looks resort.",
 "tr": "Elle tamamlanan Jawhara parçası; yaz kombinleri ve resort görünümleri için tasarlandı.",
 "ar": "قطعة Jawhara تُنهى يدوياً، مصمَّمة لأطقم الصيف ومظاهر المنتجعات."
 },
 "care": {
 "fr": "Lavage doux à froid recommandé. Séchage à l’air libre. Repassage délicat sur l’envers.",
 "en": "Gentle cold wash recommended. Air dry. Delicate ironing inside out.",
 "es": "Lavado suave en frío recomendado. Secar al aire. Planchar con delicadeza del revés.",
 "tr": "Nazik soğuk yıkama önerilir. Havada kurutun. İçi dışına çevrilerek hassas ütüleme.",
 "ar": "يُنصح بالغسيل اللطيف على البارد. تجفيف في الهواء. كيّ خفيف من الجانب الداخلي."
 },
 "packaging": {
 "fr": "Emballage YZA sobre, prêt pour cadeau ou retrait studio.",
 "en": "Minimal YZA packaging, ready for gifting or studio pickup.",
 "es": "Embalaje YZA discreto, listo para regalo o recogida en el estudio.",
 "tr": "Sade YZA ambalajı, hediye veya stüdyodan teslim almaya hazır.",
 "ar": "تغليف YZA أنيق وبسيط، جاهز للهدية أو الاستلام من الاستوديو."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli gönderim. Guéliz’de stüdyodan teslim alma mümkün.",
 "ar": "شحن متتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Édition limitée Jawhara; les tissus peuvent changer selon disponibilite.",
 "en": "Limited-edition Jawhara; fabrics may change depending on availability.",
 "es": "Éditions limitées Jawhara; los tejidos pueden cambiar según la disponibilidad.",
 "tr": "Küçük Jawhara serisi; kumaşlar temin durumuna göre değişebilir.",
 "ar": "دُفعة Jawhara محدودة؛ قد تتغير الأقمشة حسب التوفر."
 },
 "edition": {
 "fr": "Édition limitée Jawhara; les tissus peuvent changer selon disponibilite.",
 "en": "Limited-edition Jawhara; fabrics may change depending on availability.",
 "es": "Éditions limitées Jawhara; los tejidos pueden cambiar según la disponibilidad.",
 "tr": "Küçük Jawhara serisi; kumaşlar temin durumuna göre değişebilir.",
 "ar": "دُفعة Jawhara محدودة؛ قد تتغير الأقمشة حسب التوفر."
 },
 "badge": "bestseller",
 "hours": null,
 "giftable": false,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "raffia-cherries-charm-ss26",
 "yza-scarf-top-jawhara-ss26"
 ]
 },
 {
 "handle": "yza-pareo-skirt-long-jawhara-ss26",
 "legacyHandles": [
 "pareo-long"
 ],
 "sku": "B-JPL-JWP-BL",
 "name": {
 "fr": "Jupe pareo longue Jawhara",
 "en": "YZA Pareo Skirt - Long",
 "es": "YZA Pareo Skirt - Long",
 "tr": "YZA Pareo Skirt - Long",
 "ar": "YZA Pareo Skirt - Long"
 },
 "displayName": {
 "fr": "Jupe pareo longue Jawhara",
 "en": "YZA Pareo Skirt - Long",
 "es": "YZA Pareo Skirt - Long",
 "tr": "YZA Pareo Skirt - Long",
 "ar": "YZA Pareo Skirt - Long"
 },
 "short": {
 "fr": "Jupe pareo longue Jawhara, taille libre XS a XXL.",
 "en": "A long, size-free Jawhara pareo skirt fitting XS to XXL, finished with handmade Amazigh letter beading.",
 "es": "Falda pareo larga Jawhara de talla libre de XS a XXL, acabada con bordado de letras Amazigh hecho a mano.",
 "tr": "XS'ten XXL'ye kadar uygun, beden esnekliğine sahip uzun Jawhara pareo etek; el yapımı Amazigh harf boncuk işlemesiyle tamamlandı.",
 "ar": "تنورة باريو Jawhara طويلة مرنة في المقاس من XS إلى XXL، مزيَّنة بخرز حروف Amazigh المصنوع يدوياً."
 },
 "displayShort": {
 "fr": "Jupe pareo longue Jawhara, taille libre XS a XXL.",
 "en": "A long, size-free Jawhara pareo skirt fitting XS to XXL, finished with handmade Amazigh letter beading.",
 "es": "Falda pareo larga Jawhara de talla libre de XS a XXL, acabada con bordado de letras Amazigh hecho a mano.",
 "tr": "XS'ten XXL'ye kadar uygun, beden esnekliğine sahip uzun Jawhara pareo etek; el yapımı Amazigh harf boncuk işlemesiyle tamamlandı.",
 "ar": "تنورة باريو Jawhara طويلة مرنة في المقاس من XS إلى XXL، مزيَّنة بخرز حروف Amazigh المصنوع يدوياً."
 },
 "desc": {
 "fr": "Jupe pareo longue Jawhara, taille libre XS a XXL.",
 "en": "The long YZA Pareo Skirt brings the Resort Marrakesh Wear silhouette into a fluid, full-length piece made for summer lunches, seaside movement and evening dressing.",
 "es": "La YZA Pareo Skirt larga traslada la silueta Resort Marrakech Wear a una pieza fluida de largo completo, pensada para almuerzos de verano, movimiento junto al mar y veladas elegantes.",
 "tr": "Uzun YZA Pareo Etek, Resort Marrakech Wear siluetini yaz öğle yemekleri, deniz kenarı hareketleri ve gece kıyafetleri için tasarlanmış akışkan, tam boylu bir parçaya dönüştürüyor.",
 "ar": "تنورة YZA Pareo Skirt الطويلة تُجسّد صورة Resort Marrakech Wear في قطعة سائلة كاملة الطول، مصمَّمة لغداءات الصيف والحركة على ضفاف البحر والتلبّس الليلي."
 },
 "price": 59000,
 "currency": "MAD",
 "category": "pareos",
 "sourceCategory": "Pareo Skirts",
 "categoryLabel": {
 "fr": "Pareos",
 "en": "Pareos",
 "es": "Pareos",
 "tr": "Pareolar",
 "ar": "باريو"
 },
 "group": "rtw",
 "collection": {
 "fr": "Resort Marrakech Wear",
 "en": "Resort Marrakech Wear",
 "es": "Resort Marrakech Wear",
 "tr": "Resort Marrakech Wear",
 "ar": "Resort Marrakech Wear"
 },
 "season": "All Seasons 2026",
 "img": "assets/lookbook-ss26-27/embedded/p29_img03_xref1214_6b93fb974a48.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p29_img03_xref1214_6b93fb974a48.jpeg",
 "assets/lookbook-ss26-27/embedded/p30_img03_xref1221_6a80517bd62a.jpeg"
 ],
 "familyHandle": "jawhara-pareos",
 "familyOrder": 3,
 "variantLabel": {
 "fr": "Longue",
 "en": "Long",
 "es": "Larga",
 "tr": "Uzun",
 "ar": "طويلة"
 },
 "availableColors": [
 {
 "fr": "Blanc",
 "en": "White",
 "es": "Blanco",
 "tr": "Beyaz",
 "ar": "أبيض"
 },
 {
 "fr": "Noir",
 "en": "Black",
 "es": "Negro",
 "tr": "Siyah",
 "ar": "أسود"
 },
 {
 "fr": "Jaune moutarde",
 "en": "Mustard yellow",
 "es": "Amarillo mostaza",
 "tr": "Hardal sarısı",
 "ar": "أصفر خردل"
 },
 {
 "fr": "Vert",
 "en": "Green",
 "es": "Verde",
 "tr": "Yeşil",
 "ar": "أخضر"
 },
 {
 "fr": "Rose vieux",
 "en": "Dusty rose",
 "es": "Rosa viejo",
 "tr": "Soluk pembe",
 "ar": "وردي عتيق"
 },
 {
 "fr": "Rouge",
 "en": "Red",
 "es": "Rojo",
 "tr": "Kırmızı",
 "ar": "أحمر"
 },
 {
 "fr": "Bordeaux",
 "en": "Bordeaux",
 "es": "Burdeos",
 "tr": "Bordo",
 "ar": "بوردو"
 },
 {
 "fr": "Bleu majorelle",
 "en": "Majorelle blue",
 "es": "Azul Majorelle",
 "tr": "Majorelle mavisi",
 "ar": "أزرق ماجوريل"
 },
 {
 "fr": "Vert profond",
 "en": "Deep green",
 "es": "Verde profundo",
 "tr": "Koyu yeşil",
 "ar": "أخضر عميق"
 }
 ],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "yza-pareo-skirt-long-jawhara-ss26",
 "sku": "B-JPL-JWP-BL",
 "category": "Bottoms",
 "source_type": "Pareo longue",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-long-jawhara-ss26",
 "sku": "B-JPL-JWP-NR",
 "category": "Bottoms",
 "source_type": "Pareo longue",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-long-jawhara-ss26",
 "sku": "B-JPL-JWP-JM",
 "category": "Bottoms",
 "source_type": "Pareo longue",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-long-jawhara-ss26",
 "sku": "B-JPL-JWP-VR",
 "category": "Bottoms",
 "source_type": "Pareo longue",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-long-jawhara-ss26",
 "sku": "B-JPL-JWP-RV",
 "category": "Bottoms",
 "source_type": "Pareo longue",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-long-jawhara-ss26",
 "sku": "B-JPL-JWP-RG",
 "category": "Bottoms",
 "source_type": "Pareo longue",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-long-jawhara-ss26",
 "sku": "B-JPL-JWP-BD",
 "category": "Bottoms",
 "source_type": "Pareo longue",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-long-jawhara-ss26",
 "sku": "B-JPL-JWP-BLU",
 "category": "Bottoms",
 "source_type": "Pareo longue",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-long-jawhara-ss26",
 "sku": "B-JPL-JWP-VP",
 "category": "Bottoms",
 "source_type": "Pareo longue",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 }
 ],
 "variantCount": 9,
 "variant_count_from_xlsx_catalog": 9,
 "tags": [
 "SS26",
 "Resort Wear",
 "Jawhara",
 "Pareo skirt",
 "Long",
 "Size free",
 "Amazigh beading"
 ],
 "seoTitle": "YZA Pareo Skirt Long - Jawhara Resort Wear Handmade in Marrakech",
 "seoKeywords": [
 "Guéliz",
 "Guéliz",
 "Jupe pareo longue Jawhara",
 "Marrakech",
 "Marrakesh",
 "Resort Marrakesh Wear",
 "YZA",
 "YZA Pareo Skirt - Long",
 "a",
 "crochet",
 "fait main",
 "handmade",
 "jawhara",
 "jupe",
 "pantalon",
 "pareo",
 "pareos",
 "porter",
 "pret",
 "ready",
 "resort",
 "rtw",
 "to",
 "top",
 "wear",
 "yza-pareo-skirt-long-jawhara-ss26"
 ],
 "languageSearchTerms": [
 "Guéliz",
 "Guéliz",
 "Jupe pareo longue Jawhara",
 "Marrakech",
 "Marrakesh",
 "Resort Marrakesh Wear",
 "YZA",
 "YZA Pareo Skirt - Long",
 "a",
 "crochet",
 "fait main",
 "handmade",
 "jawhara",
 "jupe",
 "pantalon",
 "pareo",
 "pareos",
 "porter",
 "pret",
 "ready",
 "resort",
 "rtw",
 "to",
 "top",
 "wear",
 "yza-pareo-skirt-long-jawhara-ss26"
 ],
 "material": {
 "fr": "Jawhara viscose & silk, details faits main",
 "en": "Jawhara viscose & silk with handmade details",
 "es": "Jawhara poly y seda con detalles hechos a mano",
 "tr": "El yapımı detaylı Jawhara poly ve ipek",
 "ar": "Jawhara بولي وحرير مع تفاصيل مصنوعة يدوياً"
 },
 "fabric": {
 "fr": "Jawhara (viscose & silk)",
 "en": "Jawhara (viscose & silk)",
 "es": "Jawhara (poly y seda) — o co-creación a partir de 100 piezas por tejido",
 "tr": "Jawhara (poly ve ipek) — ya da kumaş başına 100 parçadan başlayan ortak üretim",
 "ar": "Jawhara (بولي وحرير) — أو إنتاج مشترك ابتداءً من 100 قطعة لكل قماش"
 },
 "color": null,
 "size": {
 "fr": "Size free, fits XS to XXL",
 "en": "Size free, fits XS to XXL",
 "es": "Talla única, de XS a XXL",
 "tr": "Tek beden, XS ile XXL arasına uyuyor",
 "ar": "مقاس حر، يناسب من XS إلى XXL"
 },
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Size free, fits XS to XXL",
 "en": "Size free, fits XS to XXL",
 "es": "Talla única, de XS a XXL",
 "tr": "Tek beden, XS ile XXL arasına uyuyor",
 "ar": "مقاس حر، يناسب من XS إلى XXL"
 },
 "whatFits": null,
 "attachment": null,
 "handworkTime": {
 "fr": "Coupe, finitions et details Jawhara controles a la main.",
 "en": "Cut, finishing and Jawhara details checked by hand.",
 "es": "Corte, acabados y detalles Jawhara verificados a mano.",
 "tr": "Kesim, bitişler ve Jawhara detayları elle kontrol edilir.",
 "ar": "القصّ والتشطيب وتفاصيل Jawhara تُراجع يدوياً."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Piece Jawhara finie a la main, pensee pour les ensembles d ete et les looks resort.",
 "en": "Hand-finished Jawhara piece designed for summer sets and resort looks.",
 "es": "Pieza Jawhara terminada a mano, pensada para conjuntos de verano y looks resort.",
 "tr": "Elle tamamlanan Jawhara parçası; yaz kombinleri ve resort görünümleri için tasarlandı.",
 "ar": "قطعة Jawhara تُنهى يدوياً، مصمَّمة لأطقم الصيف ومظاهر المنتجعات."
 },
 "care": {
 "fr": "Lavage doux à froid recommandé. Séchage à l’air libre. Repassage délicat sur l’envers.",
 "en": "Gentle cold wash recommended. Air dry. Delicate ironing inside out.",
 "es": "Lavado suave en frío recomendado. Secar al aire. Planchar con delicadeza del revés.",
 "tr": "Nazik soğuk yıkama önerilir. Havada kurutun. İçi dışına çevrilerek hassas ütüleme.",
 "ar": "يُنصح بالغسيل اللطيف على البارد. تجفيف في الهواء. كيّ خفيف من الجانب الداخلي."
 },
 "packaging": {
 "fr": "Emballage YZA sobre, prêt pour cadeau ou retrait studio.",
 "en": "Minimal YZA packaging, ready for gifting or studio pickup.",
 "es": "Embalaje YZA discreto, listo para regalo o recogida en el estudio.",
 "tr": "Sade YZA ambalajı, hediye veya stüdyodan teslim almaya hazır.",
 "ar": "تغليف YZA أنيق وبسيط، جاهز للهدية أو الاستلام من الاستوديو."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli gönderim. Guéliz’de stüdyodan teslim alma mümkün.",
 "ar": "شحن متتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Édition limitée Jawhara; les tissus peuvent changer selon disponibilite.",
 "en": "Limited-edition Jawhara; fabrics may change depending on availability.",
 "es": "Éditions limitées Jawhara; los tejidos pueden cambiar según la disponibilidad.",
 "tr": "Küçük Jawhara serisi; kumaşlar temin durumuna göre değişebilir.",
 "ar": "دُفعة Jawhara محدودة؛ قد تتغير الأقمشة حسب التوفر."
 },
 "edition": {
 "fr": "Édition limitée Jawhara; les tissus peuvent changer selon disponibilite.",
 "en": "Limited-edition Jawhara; fabrics may change depending on availability.",
 "es": "Éditions limitées Jawhara; los tejidos pueden cambiar según la disponibilidad.",
 "tr": "Küçük Jawhara serisi; kumaşlar temin durumuna göre değişebilir.",
 "ar": "دُفعة Jawhara محدودة؛ قد تتغير الأقمشة حسب التوفر."
 },
 "badge": "limited",
 "hours": null,
 "giftable": false,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "raffia-cherries-charm-ss26",
 "yza-scarf-top-jawhara-ss26"
 ]
 },
 {
 "handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "legacyHandles": [
 "pareo-xlong"
 ],
 "sku": "B-JPLP-JWP-BL",
 "name": {
 "fr": "Jupe pareo extra longue Jawhara",
 "en": "YZA Pareo Skirt - X Long",
 "es": "YZA Pareo Skirt - X Long",
 "tr": "YZA Pareo Skirt - X Long",
 "ar": "YZA Pareo Skirt - X Long"
 },
 "displayName": {
 "fr": "Jupe pareo extra longue Jawhara",
 "en": "YZA Pareo Skirt - X Long",
 "es": "YZA Pareo Skirt - X Long",
 "tr": "YZA Pareo Skirt - X Long",
 "ar": "YZA Pareo Skirt - X Long"
 },
 "short": {
 "fr": "Jupe pareo extra longue Jawhara, taille libre XS a XXL.",
 "en": "An extra-long, size-free Jawhara pareo skirt fitting XS to XXL, finished with handmade Amazigh letter beading.",
 "es": "Falda pareo extra larga Jawhara de talla libre de XS a XXL, acabada con bordado de letras Amazigh hecho a mano.",
 "tr": "XS'ten XXL'ye kadar uygun, beden esnekliğine sahip ekstra uzun Jawhara pareo etek; el yapımı Amazigh harf boncuk işlemesiyle tamamlandı.",
 "ar": "تنورة باريو Jawhara إكسترا طويلة مرنة في المقاس من XS إلى XXL، مزيَّنة بخرز حروف Amazigh المصنوع يدوياً."
 },
 "displayShort": {
 "fr": "Jupe pareo extra longue Jawhara, taille libre XS a XXL.",
 "en": "An extra-long, size-free Jawhara pareo skirt fitting XS to XXL, finished with handmade Amazigh letter beading.",
 "es": "Falda pareo extra larga Jawhara de talla libre de XS a XXL, acabada con bordado de letras Amazigh hecho a mano.",
 "tr": "XS'ten XXL'ye kadar uygun, beden esnekliğine sahip ekstra uzun Jawhara pareo etek; el yapımı Amazigh harf boncuk işlemesiyle tamamlandı.",
 "ar": "تنورة باريو Jawhara إكسترا طويلة مرنة في المقاس من XS إلى XXL، مزيَّنة بخرز حروف Amazigh المصنوع يدوياً."
 },
 "desc": {
 "fr": "Jupe pareo extra longue Jawhara, taille libre XS a XXL.",
 "en": "The X Long YZA Pareo Skirt is the most dramatic length in the pareo skirt family: a fluid Jawhara piece built for movement and finished by hand.",
 "es": "La YZA Pareo Skirt X Long es el largo más espectacular de la familia pareo: una pieza fluida en Jawhara construida para el movimiento y terminada a mano.",
 "tr": "X Long YZA Pareo Etek, pareo etek ailesinin en dramatik boyudur: hareket için inşa edilmiş ve elle tamamlanmış akışkan bir Jawhara parçası.",
 "ar": "تنورة YZA Pareo Skirt X Long هي الأطول والأكثر حضوراً في عائلة الباريو: قطعة Jawhara سائلة مصنوعة للحركة ومُنهاة يدوياً."
 },
 "price": 59000,
 "currency": "MAD",
 "category": "pareos",
 "sourceCategory": "Pareo Skirts",
 "categoryLabel": {
 "fr": "Pareos",
 "en": "Pareos",
 "es": "Pareos",
 "tr": "Pareolar",
 "ar": "باريو"
 },
 "group": "rtw",
 "collection": {
 "fr": "Resort Marrakech Wear",
 "en": "Resort Marrakech Wear",
 "es": "Resort Marrakech Wear",
 "tr": "Resort Marrakech Wear",
 "ar": "Resort Marrakech Wear"
 },
 "season": "All Seasons 2026",
 "img": "assets/lookbook-ss26-27/embedded/p29_img02_xref1213_fe747a323e9f.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p29_img02_xref1213_fe747a323e9f.jpeg",
 "assets/lookbook-ss26-27/embedded/p29_img03_xref1214_6b93fb974a48.jpeg"
 ],
 "familyHandle": "jawhara-pareos",
 "familyOrder": 4,
 "variantLabel": {
 "fr": "Extra longue",
 "en": "Extra long",
 "es": "Extra larga",
 "tr": "Ekstra uzun",
 "ar": "إكسترا طويلة"
 },
 "availableColors": [
 {
 "fr": "Blanc",
 "en": "White",
 "es": "Blanco",
 "tr": "Beyaz",
 "ar": "أبيض"
 },
 {
 "fr": "Noir",
 "en": "Black",
 "es": "Negro",
 "tr": "Siyah",
 "ar": "أسود"
 },
 {
 "fr": "Jaune moutarde",
 "en": "Mustard yellow",
 "es": "Amarillo mostaza",
 "tr": "Hardal sarısı",
 "ar": "أصفر خردل"
 },
 {
 "fr": "Vert",
 "en": "Green",
 "es": "Verde",
 "tr": "Yeşil",
 "ar": "أخضر"
 },
 {
 "fr": "Rose vieux",
 "en": "Dusty rose",
 "es": "Rosa viejo",
 "tr": "Soluk pembe",
 "ar": "وردي عتيق"
 },
 {
 "fr": "Rouge",
 "en": "Red",
 "es": "Rojo",
 "tr": "Kırmızı",
 "ar": "أحمر"
 },
 {
 "fr": "Bordeaux",
 "en": "Bordeaux",
 "es": "Burdeos",
 "tr": "Bordo",
 "ar": "بوردو"
 },
 {
 "fr": "Bleu majorelle",
 "en": "Majorelle blue",
 "es": "Azul Majorelle",
 "tr": "Majorelle mavisi",
 "ar": "أزرق ماجوريل"
 },
 {
 "fr": "Vert profond",
 "en": "Deep green",
 "es": "Verde profundo",
 "tr": "Koyu yeşil",
 "ar": "أخضر عميق"
 }
 ],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "sku": "B-JPLP-JWP-BL",
 "category": "Bottoms",
 "source_type": "Pareo longue petite",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "sku": "B-JPLP-JWP-NR",
 "category": "Bottoms",
 "source_type": "Pareo longue petite",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "sku": "B-JPLP-JWP-JM",
 "category": "Bottoms",
 "source_type": "Pareo longue petite",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "sku": "B-JPLP-JWP-VR",
 "category": "Bottoms",
 "source_type": "Pareo longue petite",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "sku": "B-JPLP-JWP-RV",
 "category": "Bottoms",
 "source_type": "Pareo longue petite",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "sku": "B-JPLP-JWP-RG",
 "category": "Bottoms",
 "source_type": "Pareo longue petite",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "sku": "B-JPLP-JWP-BD",
 "category": "Bottoms",
 "source_type": "Pareo longue petite",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "sku": "B-JPLP-JWP-BLU",
 "category": "Bottoms",
 "source_type": "Pareo longue petite",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "sku": "B-JPLP-JWP-VP",
 "category": "Bottoms",
 "source_type": "Pareo longue petite",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 }
 ],
 "variantCount": 9,
 "variant_count_from_xlsx_catalog": 9,
 "tags": [
 "SS26",
 "Resort Wear",
 "Jawhara",
 "Pareo skirt",
 "X Long",
 "Size free",
 "Amazigh beading"
 ],
 "seoTitle": "YZA Pareo Skirt X Long - Jawhara Resort Wear Handmade in Marrakech",
 "seoKeywords": [
 "Guéliz",
 "Guéliz",
 "Jupe pareo extra longue Jawhara",
 "Marrakech",
 "Marrakesh",
 "Resort Marrakesh Wear",
 "YZA",
 "YZA Pareo Skirt - X Long",
 "a",
 "crochet",
 "fait main",
 "handmade",
 "jawhara",
 "jupe",
 "pantalon",
 "pareo",
 "pareos",
 "porter",
 "pret",
 "ready",
 "resort",
 "rtw",
 "to",
 "top",
 "wear",
 "yza-pareo-skirt-x-long-jawhara-ss26"
 ],
 "languageSearchTerms": [
 "Guéliz",
 "Guéliz",
 "Jupe pareo extra longue Jawhara",
 "Marrakech",
 "Marrakesh",
 "Resort Marrakesh Wear",
 "YZA",
 "YZA Pareo Skirt - X Long",
 "a",
 "crochet",
 "fait main",
 "handmade",
 "jawhara",
 "jupe",
 "pantalon",
 "pareo",
 "pareos",
 "porter",
 "pret",
 "ready",
 "resort",
 "rtw",
 "to",
 "top",
 "wear",
 "yza-pareo-skirt-x-long-jawhara-ss26"
 ],
 "material": {
 "fr": "Jawhara viscose & silk, details faits main",
 "en": "Jawhara viscose & silk with handmade details",
 "es": "Jawhara poly y seda con detalles hechos a mano",
 "tr": "El yapımı detaylı Jawhara poly ve ipek",
 "ar": "Jawhara بولي وحرير مع تفاصيل مصنوعة يدوياً"
 },
 "fabric": {
 "fr": "Jawhara (viscose & silk)",
 "en": "Jawhara (viscose & silk)",
 "es": "Jawhara (poly y seda) — o co-creación a partir de 100 piezas por tejido",
 "tr": "Jawhara (poly ve ipek) — ya da kumaş başına 100 parçadan başlayan ortak üretim",
 "ar": "Jawhara (بولي وحرير) — أو إنتاج مشترك ابتداءً من 100 قطعة لكل قماش"
 },
 "color": null,
 "size": {
 "fr": "Size free, fits XS to XXL",
 "en": "Size free, fits XS to XXL",
 "es": "Talla única, de XS a XXL",
 "tr": "Tek beden, XS ile XXL arasına uyuyor",
 "ar": "مقاس حر، يناسب من XS إلى XXL"
 },
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Size free, fits XS to XXL",
 "en": "Size free, fits XS to XXL",
 "es": "Talla única, de XS a XXL",
 "tr": "Tek beden, XS ile XXL arasına uyuyor",
 "ar": "مقاس حر، يناسب من XS إلى XXL"
 },
 "whatFits": null,
 "attachment": null,
 "handworkTime": {
 "fr": "Coupe, finitions et details Jawhara controles a la main.",
 "en": "Cut, finishing and Jawhara details checked by hand.",
 "es": "Corte, acabados y detalles Jawhara verificados a mano.",
 "tr": "Kesim, bitişler ve Jawhara detayları elle kontrol edilir.",
 "ar": "القصّ والتشطيب وتفاصيل Jawhara تُراجع يدوياً."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Piece Jawhara finie a la main, pensee pour les ensembles d ete et les looks resort.",
 "en": "Hand-finished Jawhara piece designed for summer sets and resort looks.",
 "es": "Pieza Jawhara terminada a mano, pensada para conjuntos de verano y looks resort.",
 "tr": "Elle tamamlanan Jawhara parçası; yaz kombinleri ve resort görünümleri için tasarlandı.",
 "ar": "قطعة Jawhara تُنهى يدوياً، مصمَّمة لأطقم الصيف ومظاهر المنتجعات."
 },
 "care": {
 "fr": "Lavage doux à froid recommandé. Séchage à l’air libre. Repassage délicat sur l’envers.",
 "en": "Gentle cold wash recommended. Air dry. Delicate ironing inside out.",
 "es": "Lavado suave en frío recomendado. Secar al aire. Planchar con delicadeza del revés.",
 "tr": "Nazik soğuk yıkama önerilir. Havada kurutun. İçi dışına çevrilerek hassas ütüleme.",
 "ar": "يُنصح بالغسيل اللطيف على البارد. تجفيف في الهواء. كيّ خفيف من الجانب الداخلي."
 },
 "packaging": {
 "fr": "Emballage YZA sobre, prêt pour cadeau ou retrait studio.",
 "en": "Minimal YZA packaging, ready for gifting or studio pickup.",
 "es": "Embalaje YZA discreto, listo para regalo o recogida en el estudio.",
 "tr": "Sade YZA ambalajı, hediye veya stüdyodan teslim almaya hazır.",
 "ar": "تغليف YZA أنيق وبسيط، جاهز للهدية أو الاستلام من الاستوديو."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli gönderim. Guéliz’de stüdyodan teslim alma mümkün.",
 "ar": "شحن متتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Édition limitée Jawhara; les tissus peuvent changer selon disponibilite.",
 "en": "Limited-edition Jawhara; fabrics may change depending on availability.",
 "es": "Éditions limitées Jawhara; los tejidos pueden cambiar según la disponibilidad.",
 "tr": "Küçük Jawhara serisi; kumaşlar temin durumuna göre değişebilir.",
 "ar": "دُفعة Jawhara محدودة؛ قد تتغير الأقمشة حسب التوفر."
 },
 "edition": {
 "fr": "Édition limitée Jawhara; les tissus peuvent changer selon disponibilite.",
 "en": "Limited-edition Jawhara; fabrics may change depending on availability.",
 "es": "Éditions limitées Jawhara; los tejidos pueden cambiar según la disponibilidad.",
 "tr": "Küçük Jawhara serisi; kumaşlar temin durumuna göre değişebilir.",
 "ar": "دُفعة Jawhara محدودة؛ قد تتغير الأقمشة حسب التوفر."
 },
 "badge": "limited",
 "hours": null,
 "giftable": false,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "raffia-cherries-charm-ss26",
 "yza-scarf-top-jawhara-ss26"
 ]
 },
 {
 "handle": "yza-palazzo-pants-jawhara-ss26",
 "legacyHandles": [
 "palazzo-pants"
 ],
 "sku": "B-PT-JWP-BL",
 "name": {
 "fr": "Pantalon palazzo Jawhara",
 "en": "YZA Palazzo Pants",
 "es": "YZA Palazzo Pants",
 "tr": "YZA Palazzo Pants",
 "ar": "YZA Palazzo Pants"
 },
 "displayName": {
 "fr": "Pantalon palazzo Jawhara",
 "en": "YZA Palazzo Pants",
 "es": "YZA Palazzo Pants",
 "tr": "YZA Palazzo Pants",
 "ar": "YZA Palazzo Pants"
 },
 "short": {
 "fr": "Pantalon palazzo Jawhara, taille libre XS a XXL.",
 "en": "Size-free Jawhara palazzo pants fitting XS to XXL, ultra long, easily tailored, with big pockets and handmade Shoushia tassel details.",
 "es": "Pantalón palazzo Jawhara de talla libre de XS a XXL, ultra largo, fácil de adaptar, con grandes bolsillos y detalles de borlas Shoushia hechos a mano.",
 "tr": "XS'ten XXL'ye kadar uygun, beden esnekliğine sahip Jawhara palazzo pantolon; ultra uzun, kolayca kısaltılabilir, büyük cepler ve el yapımı Shoushia püskülleriyle.",
 "ar": "بنطال بالاتزو Jawhara مرن في المقاس من XS إلى XXL، فائق الطول، قابل للتعديل بسهولة، بجيوب واسعة وتفاصيل شراشيب Shoushia المصنوعة يدوياً."
 },
 "displayShort": {
 "fr": "Pantalon palazzo Jawhara, taille libre XS a XXL.",
 "en": "Size-free Jawhara palazzo pants fitting XS to XXL, ultra long, easily tailored, with big pockets and handmade Shoushia tassel details.",
 "es": "Pantalón palazzo Jawhara de talla libre de XS a XXL, ultra largo, fácil de adaptar, con grandes bolsillos y detalles de borlas Shoushia hechos a mano.",
 "tr": "XS'ten XXL'ye kadar uygun, beden esnekliğine sahip Jawhara palazzo pantolon; ultra uzun, kolayca kısaltılabilir, büyük cepler ve el yapımı Shoushia püskülleriyle.",
 "ar": "بنطال بالاتزو Jawhara مرن في المقاس من XS إلى XXL، فائق الطول، قابل للتعديل بسهولة، بجيوب واسعة وتفاصيل شراشيب Shoushia المصنوعة يدوياً."
 },
 "desc": {
 "fr": "Pantalon palazzo Jawhara, taille libre XS a XXL.",
 "en": "The YZA Palazzo Pants are part of the Resort Marrakesh Wear wardrobe. Made in Jawhara and cut as a size-free silhouette, they are designed to be ultra long, easily tailored and practical with big pockets.",
 "es": "Los YZA Palazzo Pants forman parte del guardarropa Resort Marrakech Wear. Confeccionados en Jawhara y cortados como una silueta de talla libre, están pensados para ser ultra largos, fáciles de adaptar y prácticos con grandes bolsillos.",
 "tr": "YZA Palazzo Pantolon, Resort Marrakech Wear gardırobunun bir parçasıdır. Jawhara'dan yapılmış ve beden esnekliğine sahip bir siluet olarak kesilmiş; ultra uzun, kolayca kısaltılabilir ve büyük cepler sayesinde pratik olmak üzere tasarlandı.",
 "ar": "بنطال YZA Palazzo جزء من خزانة Resort Marrakech Wear. مصنوع من Jawhara ومقصوص بخط حر في المقاس، مصمَّم ليكون فائق الطول قابلاً للتعديل بيسر، عملياً بجيوب واسعة."
 },
 "price": 76000,
 "currency": "MAD",
 "category": "pants",
 "sourceCategory": "Pants",
 "categoryLabel": {
 "fr": "Pantalons",
 "en": "Pants",
 "es": "Pantalones",
 "tr": "Pantolonlar",
 "ar": "بناطيل"
 },
 "group": "rtw",
 "collection": {
 "fr": "Resort Marrakech Wear",
 "en": "Resort Marrakech Wear",
 "es": "Resort Marrakech Wear",
 "tr": "Resort Marrakech Wear",
 "ar": "Resort Marrakech Wear"
 },
 "season": "All Seasons 2026",
 "img": "assets/lookbook-ss26-27/embedded/p31_img02_xref1227_829199726349.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p31_img02_xref1227_829199726349.jpeg",
 "assets/lookbook-ss26-27/embedded/p32_img04_xref1239_3935f6e23a7c.jpeg"
 ],
 "familyHandle": "jawhara-pants",
 "familyOrder": 1,
 "variantLabel": {
 "fr": "Palazzo",
 "en": "Palazzo",
 "es": "Palazzo",
 "tr": "Palazzo",
 "ar": "بالاتزو"
 },
 "availableColors": [
 {
 "fr": "Blanc",
 "en": "White",
 "es": "Blanco",
 "tr": "Beyaz",
 "ar": "أبيض"
 },
 {
 "fr": "Noir",
 "en": "Black",
 "es": "Negro",
 "tr": "Siyah",
 "ar": "أسود"
 },
 {
 "fr": "Jaune moutarde",
 "en": "Mustard yellow",
 "es": "Amarillo mostaza",
 "tr": "Hardal sarısı",
 "ar": "أصفر خردل"
 },
 {
 "fr": "Vert",
 "en": "Green",
 "es": "Verde",
 "tr": "Yeşil",
 "ar": "أخضر"
 },
 {
 "fr": "Rose vieux",
 "en": "Dusty rose",
 "es": "Rosa viejo",
 "tr": "Soluk pembe",
 "ar": "وردي عتيق"
 },
 {
 "fr": "Rouge",
 "en": "Red",
 "es": "Rojo",
 "tr": "Kırmızı",
 "ar": "أحمر"
 },
 {
 "fr": "Bordeaux",
 "en": "Bordeaux",
 "es": "Burdeos",
 "tr": "Bordo",
 "ar": "بوردو"
 },
 {
 "fr": "Bleu majorelle",
 "en": "Majorelle blue",
 "es": "Azul Majorelle",
 "tr": "Majorelle mavisi",
 "ar": "أزرق ماجوريل"
 },
 {
 "fr": "Vert profond",
 "en": "Deep green",
 "es": "Verde profundo",
 "tr": "Koyu yeşil",
 "ar": "أخضر عميق"
 }
 ],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "yza-palazzo-pants-jawhara-ss26",
 "sku": "B-PT-JWP-BL",
 "category": "Bottoms",
 "source_type": "Pantalon",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-palazzo-pants-jawhara-ss26",
 "sku": "B-PT-JWP-NR",
 "category": "Bottoms",
 "source_type": "Pantalon",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-palazzo-pants-jawhara-ss26",
 "sku": "B-PT-JWP-JM",
 "category": "Bottoms",
 "source_type": "Pantalon",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-palazzo-pants-jawhara-ss26",
 "sku": "B-PT-JWP-VR",
 "category": "Bottoms",
 "source_type": "Pantalon",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-palazzo-pants-jawhara-ss26",
 "sku": "B-PT-JWP-RV",
 "category": "Bottoms",
 "source_type": "Pantalon",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-palazzo-pants-jawhara-ss26",
 "sku": "B-PT-JWP-RG",
 "category": "Bottoms",
 "source_type": "Pantalon",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-palazzo-pants-jawhara-ss26",
 "sku": "B-PT-JWP-BD",
 "category": "Bottoms",
 "source_type": "Pantalon",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-palazzo-pants-jawhara-ss26",
 "sku": "B-PT-JWP-BLU",
 "category": "Bottoms",
 "source_type": "Pantalon",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-palazzo-pants-jawhara-ss26",
 "sku": "B-PT-JWP-VP",
 "category": "Bottoms",
 "source_type": "Pantalon",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 }
 ],
 "variantCount": 9,
 "variant_count_from_xlsx_catalog": 9,
 "tags": [
 "SS26",
 "Resort Wear",
 "Jawhara",
 "Palazzo pants",
 "Size free",
 "Shoushia",
 "Big pockets"
 ],
 "seoTitle": "YZA Palazzo Pants - Jawhara Resort Wear Handmade in Marrakech",
 "seoKeywords": [
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Pantalon palazzo Jawhara",
 "Resort Marrakesh Wear",
 "YZA",
 "YZA Palazzo Pants",
 "a",
 "crochet",
 "fait main",
 "handmade",
 "jawhara",
 "jupe",
 "pantalon",
 "pants",
 "pareo",
 "porter",
 "pret",
 "ready",
 "resort",
 "rtw",
 "to",
 "top",
 "wear",
 "yza-palazzo-pants-jawhara-ss26"
 ],
 "languageSearchTerms": [
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Pantalon palazzo Jawhara",
 "Resort Marrakesh Wear",
 "YZA",
 "YZA Palazzo Pants",
 "a",
 "crochet",
 "fait main",
 "handmade",
 "jawhara",
 "jupe",
 "pantalon",
 "pants",
 "pareo",
 "porter",
 "pret",
 "ready",
 "resort",
 "rtw",
 "to",
 "top",
 "wear",
 "yza-palazzo-pants-jawhara-ss26"
 ],
 "material": {
 "fr": "Jawhara viscose & silk, details faits main",
 "en": "Jawhara viscose & silk with handmade details",
 "es": "Jawhara poly y seda con detalles hechos a mano",
 "tr": "El yapımı detaylı Jawhara poly ve ipek",
 "ar": "Jawhara بولي وحرير مع تفاصيل مصنوعة يدوياً"
 },
 "fabric": {
 "fr": "Jawhara (viscose & silk)",
 "en": "Jawhara (viscose & silk)",
 "es": "Jawhara (poly y seda) — o co-creación a partir de 100 piezas por tejido",
 "tr": "Jawhara (poly ve ipek) — ya da kumaş başına 100 parçadan başlayan ortak üretim",
 "ar": "Jawhara (بولي وحرير) — أو إنتاج مشترك ابتداءً من 100 قطعة لكل قماش"
 },
 "color": null,
 "size": {
 "fr": "Size free, fits XS to XXL; ultra long and easily tailored",
 "en": "Size free, fits XS to XXL; ultra long and easily tailored",
 "es": "Talla única, de XS a XXL; ultra largo y fácil de adaptar",
 "tr": "Tek beden, XS ile XXL arasına uyuyor; ultra uzun ve kolayca kısaltılabilir",
 "ar": "مقاس حر، يناسب من XS إلى XXL؛ فائق الطول وسهل التعديل"
 },
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Size free, fits XS to XXL; ultra long and easily tailored",
 "en": "Size free, fits XS to XXL; ultra long and easily tailored",
 "es": "Talla única, de XS a XXL; ultra largo y fácil de adaptar",
 "tr": "Tek beden, XS ile XXL arasına uyuyor; ultra uzun ve kolayca kısaltılabilir",
 "ar": "مقاس حر، يناسب من XS إلى XXL؛ فائق الطول وسهل التعديل"
 },
 "whatFits": null,
 "attachment": null,
 "handworkTime": {
 "fr": "Coupe, finitions et details Jawhara controles a la main.",
 "en": "Cut, finishing and Jawhara details checked by hand.",
 "es": "Corte, acabados y detalles Jawhara verificados a mano.",
 "tr": "Kesim, bitişler ve Jawhara detayları elle kontrol edilir.",
 "ar": "القصّ والتشطيب وتفاصيل Jawhara تُراجع يدوياً."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Piece Jawhara finie a la main, pensee pour les ensembles d ete et les looks resort.",
 "en": "Hand-finished Jawhara piece designed for summer sets and resort looks.",
 "es": "Pieza Jawhara terminada a mano, pensada para conjuntos de verano y looks resort.",
 "tr": "Elle tamamlanan Jawhara parçası; yaz kombinleri ve resort görünümleri için tasarlandı.",
 "ar": "قطعة Jawhara تُنهى يدوياً، مصمَّمة لأطقم الصيف ومظاهر المنتجعات."
 },
 "care": {
 "fr": "Lavage doux à froid recommandé. Séchage à l’air libre. Repassage délicat sur l’envers.",
 "en": "Gentle cold wash recommended. Air dry. Delicate ironing inside out.",
 "es": "Lavado suave en frío recomendado. Secar al aire. Planchar con delicadeza del revés.",
 "tr": "Nazik soğuk yıkama önerilir. Havada kurutun. İçi dışına çevrilerek hassas ütüleme.",
 "ar": "يُنصح بالغسيل اللطيف على البارد. تجفيف في الهواء. كيّ خفيف من الجانب الداخلي."
 },
 "packaging": {
 "fr": "Emballage YZA sobre, prêt pour cadeau ou retrait studio.",
 "en": "Minimal YZA packaging, ready for gifting or studio pickup.",
 "es": "Embalaje YZA discreto, listo para regalo o recogida en el estudio.",
 "tr": "Sade YZA ambalajı, hediye veya stüdyodan teslim almaya hazır.",
 "ar": "تغليف YZA أنيق وبسيط، جاهز للهدية أو الاستلام من الاستوديو."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli gönderim. Guéliz’de stüdyodan teslim alma mümkün.",
 "ar": "شحن متتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Édition limitée Jawhara; les tissus peuvent changer selon disponibilite.",
 "en": "Limited-edition Jawhara; fabrics may change depending on availability.",
 "es": "Éditions limitées Jawhara; los tejidos pueden cambiar según la disponibilidad.",
 "tr": "Küçük Jawhara serisi; kumaşlar temin durumuna göre değişebilir.",
 "ar": "دُفعة Jawhara محدودة؛ قد تتغير الأقمشة حسب التوفر."
 },
 "edition": {
 "fr": "Édition limitée Jawhara; les tissus peuvent changer selon disponibilite.",
 "en": "Limited-edition Jawhara; fabrics may change depending on availability.",
 "es": "Éditions limitées Jawhara; los tejidos pueden cambiar según la disponibilidad.",
 "tr": "Küçük Jawhara serisi; kumaşlar temin durumuna göre değişebilir.",
 "ar": "دُفعة Jawhara محدودة؛ قد تتغير الأقمشة حسب التوفر."
 },
 "badge": "limited",
 "hours": null,
 "giftable": false,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "raffia-cherries-charm-ss26",
 "yza-scarf-top-jawhara-ss26"
 ]
 },
 {
 "handle": "yza-wrap-pants-jawhara-ss26",
 "legacyHandles": [
 "wrap-pants"
 ],
 "sku": null,
 "name": {
 "fr": "Pantalon wrap Jawhara",
 "en": "YZA Wrap Pants",
 "es": "YZA Wrap Pants",
 "tr": "YZA Wrap Pants",
 "ar": "YZA Wrap Pants"
 },
 "displayName": {
 "fr": "Pantalon wrap Jawhara",
 "en": "YZA Wrap Pants",
 "es": "YZA Wrap Pants",
 "tr": "YZA Wrap Pants",
 "ar": "YZA Wrap Pants"
 },
 "short": {
 "fr": "Pantalon wrap Jawhara, taille libre XS a XXL.",
 "en": "Size-free Jawhara wrap pants fitting XS to XXL, reimagining an iconic local style with handmade Amazigh letter beading.",
 "es": "Pantalón wrap Jawhara de talla libre de XS a XXL, que reimagina un estilo local icónico con bordado de letras Amazigh hecho a mano.",
 "tr": "XS'ten XXL'ye kadar uygun, beden esnekliğine sahip Jawhara wrap pantolon; el yapımı Amazigh harf boncuk işlemesiyle ikonik yerel bir stili yeniden yorumluyor.",
 "ar": "بنطال Jawhara ملفوف مرن في المقاس من XS إلى XXL، يُعيد تخيّل أسلوب محلي أيقوني بخرز حروف Amazigh المصنوع يدوياً."
 },
 "displayShort": {
 "fr": "Pantalon wrap Jawhara, taille libre XS a XXL.",
 "en": "Size-free Jawhara wrap pants fitting XS to XXL, reimagining an iconic local style with handmade Amazigh letter beading.",
 "es": "Pantalón wrap Jawhara de talla libre de XS a XXL, que reimagina un estilo local icónico con bordado de letras Amazigh hecho a mano.",
 "tr": "XS'ten XXL'ye kadar uygun, beden esnekliğine sahip Jawhara wrap pantolon; el yapımı Amazigh harf boncuk işlemesiyle ikonik yerel bir stili yeniden yorumluyor.",
 "ar": "بنطال Jawhara ملفوف مرن في المقاس من XS إلى XXL، يُعيد تخيّل أسلوب محلي أيقوني بخرز حروف Amazigh المصنوع يدوياً."
 },
 "desc": {
 "fr": "Pantalon wrap Jawhara, taille libre XS a XXL.",
 "en": "The YZA Wrap Pants are a modern play on an iconic local style. Made in Jawhara and designed to fit XS to XXL, they translate Marrakchi ease into a resortwear silhouette.",
 "es": "Los YZA Wrap Pants son una reinterpretación moderna de un estilo local icónico. Confeccionados en Jawhara y diseñados para ir de XS a XXL, traducen la soltura marrakchí en una silueta de resortwear.",
 "tr": "YZA Wrap Pantolon, ikonik bir yerel stilin modern yorumudur. Jawhara'dan yapılmış ve XS ile XXL arasına uyacak şekilde tasarlanmış; Marakeşli rahatlığı bir resortwear siluetine dönüştürüyor.",
 "ar": "بنطال YZA Wrap إعادة صياغة عصرية لأسلوب محلي أيقوني. مصنوع من Jawhara ومصمَّم ليناسب من XS إلى XXL، يُترجم خفّة الروح المراكشية إلى صورة resortwear أنيقة."
 },
 "price": 98000,
 "currency": "MAD",
 "category": "pants",
 "sourceCategory": "Pants",
 "categoryLabel": {
 "fr": "Pantalons",
 "en": "Pants",
 "es": "Pantalones",
 "tr": "Pantolonlar",
 "ar": "بناطيل"
 },
 "group": "rtw",
 "collection": {
 "fr": "Resort Marrakech Wear",
 "en": "Resort Marrakech Wear",
 "es": "Resort Marrakech Wear",
 "tr": "Resort Marrakech Wear",
 "ar": "Resort Marrakech Wear"
 },
 "season": "All Seasons 2026",
 "img": "assets/lookbook-ss26-27/embedded/p38_img01_xref1287_56cb4d596aa0.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p38_img01_xref1287_56cb4d596aa0.jpeg",
 "assets/lookbook-ss26-27/embedded/p38_img04_xref1290_050054976c5b.jpeg"
 ],
 "familyHandle": "jawhara-pants",
 "familyOrder": 2,
 "variantLabel": {
 "fr": "Wrap",
 "en": "Wrap",
 "es": "Envolvente",
 "tr": "Kuşaklı",
 "ar": "ملفوف"
 },
 "availableColors": [],
 "availableSizes": [],
 "variants": [],
 "variantCount": 0,
 "variant_count_from_xlsx_catalog": null,
 "tags": [
 "SS26",
 "Resort Wear",
 "Jawhara",
 "Wrap pants",
 "Size free",
 "Amazigh beading"
 ],
 "seoTitle": "YZA Wrap Pants - Jawhara Resort Wear Handmade in Marrakech",
 "seoKeywords": [
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Pantalon wrap Jawhara",
 "Resort Marrakesh Wear",
 "YZA",
 "YZA Wrap Pants",
 "a",
 "crochet",
 "fait main",
 "handmade",
 "jawhara",
 "jupe",
 "pantalon",
 "pants",
 "pareo",
 "porter",
 "pret",
 "ready",
 "resort",
 "rtw",
 "to",
 "top",
 "wear",
 "yza-wrap-pants-jawhara-ss26"
 ],
 "languageSearchTerms": [
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Pantalon wrap Jawhara",
 "Resort Marrakesh Wear",
 "YZA",
 "YZA Wrap Pants",
 "a",
 "crochet",
 "fait main",
 "handmade",
 "jawhara",
 "jupe",
 "pantalon",
 "pants",
 "pareo",
 "porter",
 "pret",
 "ready",
 "resort",
 "rtw",
 "to",
 "top",
 "wear",
 "yza-wrap-pants-jawhara-ss26"
 ],
 "material": {
 "fr": "Jawhara viscose & silk, details faits main",
 "en": "Jawhara viscose & silk with handmade details",
 "es": "Jawhara poly y seda con detalles hechos a mano",
 "tr": "El yapımı detaylı Jawhara poly ve ipek",
 "ar": "Jawhara بولي وحرير مع تفاصيل مصنوعة يدوياً"
 },
 "fabric": {
 "fr": "Jawhara (viscose & silk)",
 "en": "Jawhara (viscose & silk)",
 "es": "Jawhara (viscose & silk) - or co-creación a partir de 100 piezas por tejido",
 "tr": "Jawhara (viscose & silk) - veya kumaş başına 100 parçadan başlayan ko-kreasyonlar",
 "ar": "Jawhara (viscose & silk) - أو تعاون إبداعي يبدأ من 100 قطعة لكل قماش"
 },
 "color": null,
 "size": {
 "fr": "Size free, fits XS to XXL",
 "en": "Size free, fits XS to XXL",
 "es": "Talla única, de XS a XXL",
 "tr": "Tek beden, XS ile XXL arasına uyuyor",
 "ar": "مقاس حر، يناسب من XS إلى XXL"
 },
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Size free, fits XS to XXL",
 "en": "Size free, fits XS to XXL",
 "es": "Talla única, de XS a XXL",
 "tr": "Tek beden, XS ile XXL arasına uyuyor",
 "ar": "مقاس حر، يناسب من XS إلى XXL"
 },
 "whatFits": null,
 "attachment": null,
 "handworkTime": {
 "fr": "Coupe, finitions et details Jawhara controles a la main.",
 "en": "Cut, finishing and Jawhara details checked by hand.",
 "es": "Corte, acabados y detalles Jawhara verificados a mano.",
 "tr": "Kesim, bitişler ve Jawhara detayları elle kontrol edilir.",
 "ar": "القصّ والتشطيب وتفاصيل Jawhara تُراجع يدوياً."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Piece Jawhara finie a la main, pensee pour les ensembles d ete et les looks resort.",
 "en": "Hand-finished Jawhara piece designed for summer sets and resort looks.",
 "es": "Pieza Jawhara terminada a mano, pensada para conjuntos de verano y looks resort.",
 "tr": "Elle tamamlanan Jawhara parçası; yaz kombinleri ve resort görünümleri için tasarlandı.",
 "ar": "قطعة Jawhara تُنهى يدوياً، مصمَّمة لأطقم الصيف ومظاهر المنتجعات."
 },
 "care": {
 "fr": "Lavage doux à froid recommandé. Séchage à l'air libre. Repassage délicat sur l'envers.",
 "en": "Gentle cold wash recommended. Air dry. Delicate ironing inside out.",
 "es": "Lavado suave en frío recomendado. Secar al aire. Planchar con delicadeza del revés.",
 "tr": "Nazik soğuk yıkama önerilir. Havada kurutun. İçi dışına çevrilerek hassas ütüleme.",
 "ar": "يُنصح بالغسيل اللطيف على البارد. تجفيف في الهواء. كيّ خفيف من الجانب الداخلي."
 },
 "packaging": {
 "fr": "Emballage YZA sobre, prêt pour cadeau ou retrait studio.",
 "en": "Minimal YZA packaging, ready for gifting or studio pickup.",
 "es": "Embalaje YZA discreto, listo para regalo o recogida en el estudio.",
 "tr": "Sade YZA ambalajı, hediye veya stüdyodan teslim almaya hazır.",
 "ar": "تغليف YZA أنيق وبسيط، جاهز للهدية أو الاستلام من الاستوديو."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli gönderim. Guéliz'de stüdyodan teslim alma mümkün.",
 "ar": "شحن متتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Édition limitée Jawhara; les tissus peuvent changer selon disponibilite.",
 "en": "Limited-edition Jawhara; fabrics may change depending on availability.",
 "es": "Éditions limitées Jawhara; los tejidos pueden cambiar según la disponibilidad.",
 "tr": "Küçük Jawhara serisi; kumaşlar temin durumuna göre değişebilir.",
 "ar": "دُفعة Jawhara محدودة؛ قد تتغير الأقمشة حسب التوفر."
 },
 "edition": {
 "fr": "Édition limitée Jawhara; les tissus peuvent changer selon disponibilite.",
 "en": "Limited-edition Jawhara; fabrics may change depending on availability.",
 "es": "Éditions limitées Jawhara; los tejidos pueden cambiar según la disponibilidad.",
 "tr": "Küçük Jawhara serisi; kumaşlar temin durumuna göre değişebilir.",
 "ar": "دُفعة Jawhara محدودة؛ قد تتغير الأقمشة حسب التوفر."
 },
 "badge": "limited",
 "hours": null,
 "giftable": false,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "raffia-cherries-charm-ss26",
 "yza-scarf-top-jawhara-ss26"
 ]
 },
 {
 "handle": "la-sculpture-xs-basket-bag-ss26",
 "fewLeft": true,
 "legacyHandles": [
 "sculpture-xs-noir",
 "sculpture-xs-rouge",
 "sculpture-xs-violet"
 ],
 "sku": null,
 "name": {
 "fr": "La Sculpture XS - Rouge",
 "en": "La Sculpture XS - Red",
 "es": "La Sculpture XS - Rojo",
 "tr": "La Sculpture XS - Kırmızı",
 "ar": "La Sculpture XS - أحمر"
 },
 "displayName": {
 "fr": "La Sculpture XS - Rouge",
 "en": "La Sculpture XS - Red",
 "es": "La Sculpture XS - Rojo",
 "tr": "La Sculpture XS - Kırmızı",
 "ar": "La Sculpture XS - أحمر"
 },
 "short": {
 "fr": "Format XS, couleur rouge, feuilles de bananier, raphia, cuir et perles.",
 "en": "XS scale, red finish, banana leaves, raffia, leather and beads.",
 "es": "Talla XS, acabado rojo, hojas de bananero, rafia, cuero y cuentas.",
 "tr": "XS beden, kırmızı renk, muz yaprağı, rafya, deri ve boncuklar.",
 "ar": "حجم XS، لون أحمر، أوراق الموز، الرافيا، الجلد والخرز."
 },
 "displayShort": {
 "fr": "Format XS, couleur rouge, feuilles de bananier, raphia, cuir et perles.",
 "en": "XS scale, red finish, banana leaves, raffia, leather and beads.",
 "es": "Talla XS, acabado rojo, hojas de bananero, rafia, cuero y cuentas.",
 "tr": "XS beden, kırmızı renk, muz yaprağı, rafya, deri ve boncuklar.",
 "ar": "حجم XS، لون أحمر، أوراق الموز، الرافيا، الجلد والخرز."
 },
 "desc": {
 "fr": "La Sculpture XS - Rouge: un panier YZA en feuilles de bananier, raphia, cuir et perles. Cette page montre uniquement la couleur rouge et le format XS, pour comprendre la taille, la couleur et les details reels de la piece.",
 "en": "La Sculpture XS - Red: a YZA basket in banana leaves, raffia, leather and beads. This page shows only the red finish and XS scale, so the size, colour and real details stay clear.",
 "es": "La Sculpture XS - Rojo: una cesta YZA en hojas de bananero, rafia, cuero y cuentas. Esta página muestra únicamente el acabado rojo y la talla XS, para que el tamaño, el color y los detalles reales queden claros.",
 "tr": "La Sculpture XS - Kırmızı: muz yaprağı, rafya, deri ve boncuklardan yapılmış bir YZA sepeti. Bu sayfa yalnızca kırmızı rengi ve XS bedeni gösterir; boyut, renk ve gerçek detaylar net kalır.",
 "ar": "La Sculpture XS - أحمر: سلة YZA من أوراق الموز والرافيا والجلد والخرز. تعرض هذه الصفحة فقط اللون الأحمر وحجم XS، ليظل الحجم واللون والتفاصيل الحقيقية واضحة."
 },
 "price": 80000,
 "currency": "MAD",
 "category": "bags",
 "sourceCategory": "Basket Bags",
 "categoryLabel": {
 "fr": "Paniers & sacs",
 "en": "Bags",
 "es": "Bolsos y cestas",
 "tr": "Çantalar ve sepetler",
 "ar": "حقائب وسلال"
 },
 "group": "bags",
 "collection": {
 "fr": "Paniers iconiques",
 "en": "Iconic basket bags",
 "es": "Iconic basket bags",
 "tr": "Iconic basket bags",
 "ar": "Iconic basket bags"
 },
 "season": "All Seasons 2026",
 "img": "assets/lookbook-ss26-27/embedded/p40_img01_xref1305_5ae097cc9e5a.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p40_img01_xref1305_5ae097cc9e5a.jpeg",
 "assets/lookbook-ss26-27/embedded/p42_img01_xref1321_1a08834f9d69.jpeg",
 "assets/lookbook-ss26-27/embedded/p43_img01_xref1325_6be88260cccd.jpeg",
 "assets/lookbook-ss26-27/embedded/p48_img01_xref1345_c06ef6230440.jpeg"
 ],
 "familyHandle": "la-sculpture",
 "familyOrder": 1,
 "variantLabel": {
 "fr": "XS / Rouge",
 "en": "XS / Red",
 "es": "XS / Rojo",
 "tr": "XS / Kırmızı",
 "ar": "XS / أحمر"
 },
 "availableColors": [
 {
 "fr": "Rouge",
 "en": "Red",
 "es": "Rojo",
 "tr": "Kırmızı",
 "ar": "أحمر"
 }
 ],
 "availableSizes": [
 "XS"
 ],
 "variants": [
 {
 "product_handle": "la-sculpture-xs-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Sculpture",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": "Noir",
 "size": "Mini",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 5
 },
 {
 "product_handle": "la-sculpture-xs-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Sculpture",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": "Rouge",
 "size": "Mini",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 8
 },
 {
 "product_handle": "la-sculpture-xs-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Sculpture",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": "Violet",
 "size": "Mini",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 11
 }
 ],
 "variantCount": 3,
 "variant_count_from_xlsx_catalog": 3,
 "tags": [
 "SS26",
 "Basket bag",
 "La Sculpture",
 "Banana leaves",
 "Raffia",
 "Beads",
 "Marrakech"
 ],
 "seoTitle": "La Sculpture XS Basket Bag - Handmade in Marrakech",
 "seoKeywords": [
 "Guéliz",
 "Guéliz",
 "Iconic Basket Bags",
 "La Sculpture XS",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "bag",
 "bags",
 "basket",
 "bolsa",
 "canta",
 "crochet",
 "fait main",
 "fits",
 "handmade",
 "la-sculpture-xs-basket-bag-ss26",
 "m",
 "panier",
 "s",
 "sac",
 "what",
 "xs",
 "حقيبة",
 "La Sculpture",
 "La Sculpture",
 "XS",
 "Rouge",
 "Red",
 "La Sculpture XS",
 "La Sculpture XS"
 ],
 "languageSearchTerms": [
 "Guéliz",
 "Guéliz",
 "Iconic Basket Bags",
 "La Sculpture XS",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "bag",
 "bags",
 "basket",
 "bolsa",
 "canta",
 "crochet",
 "fait main",
 "fits",
 "handmade",
 "la-sculpture-xs-basket-bag-ss26",
 "m",
 "panier",
 "s",
 "sac",
 "what",
 "xs",
 "حقيبة",
 "La Sculpture",
 "La Sculpture",
 "XS",
 "Rouge",
 "Red",
 "La Sculpture XS",
 "La Sculpture XS"
 ],
 "material": {
 "fr": "Feuilles de bananier, Raffia, Perles",
 "en": "Banana leaves, Raffia, Beads",
 "es": "Hojas de bananero, Rafia, Cuentas",
 "tr": "Muz yaprağı, Rafya, Boncuklar",
 "ar": "أوراق الموز، الرافيا، الخرز"
 },
 "fabric": {
 "fr": "Banana leaves, raffia & beads; 3 colors in stock",
 "en": "Banana leaves, raffia & beads; 3 colors in stock",
 "es": "Hojas de bananero, rafia y cuentas; 3 colores en stock",
 "tr": "Muz yaprağı, rafya ve boncuklar; 3 renk stokta",
 "ar": "أوراق الموز والرافيا والخرز؛ 3 ألوان في المخزون"
 },
 "color": {
 "fr": "Rouge",
 "en": "Red",
 "es": "Rojo",
 "tr": "Kırmızı",
 "ar": "أحمر"
 },
 "size": {
 "fr": "XS",
 "en": "XS",
 "es": "XS",
 "tr": "XS",
 "ar": "XS"
 },
 "visualSize": "XS",
 "visualColor": {
 "fr": "Rouge",
 "en": "Red",
 "es": "Rojo",
 "tr": "Kırmızı",
 "ar": "أحمر"
 },
 "bagFamilyTitle": {
 "fr": "La Sculpture",
 "en": "La Sculpture",
 "es": "La Sculpture",
 "tr": "La Sculpture",
 "ar": "La Sculpture"
 },
 "bagFamilyEyebrow": {
 "fr": "Collection Sculpture",
 "en": "Collection Sculpture",
 "es": "Collection Sculpture",
 "tr": "Collection Sculpture",
 "ar": "Collection Sculpture"
 },
 "bagFamilyText": {
 "fr": "Trois formats, trois lectures couleur. Chaque sac garde sa propre page, ses propres images et son propre rythme d’atelier.",
 "en": "Three scales, three colour readings. Each bag keeps its own page, image set and atelier rhythm.",
 "es": "Tres formatos, tres lecturas de color. Cada bolso mantiene su propia página, imágenes y ritmo de atelier.",
 "tr": "Üç beden, üç renk yorumu. Her çanta kendi sayfasını, görsel setini ve atölye ritmini korur.",
 "ar": "ثلاثة أحجام، ثلاث قراءات للون. كل حقيبة تحتفظ بصفحتها الخاصة ومجموعة صورها وإيقاع الأتيليه."
 },
 "bagFamilyOrder": 1,
 "dimensions": {
 "fr": "Format XS: mini panier main ou epaule courte.",
 "en": "XS scale: mini hand or short-shoulder basket.",
 "es": "Talla XS: mini cesta de mano o hombro corto.",
 "tr": "XS beden: mini el ya da kısa omuz sepeti.",
 "ar": "حجم XS: سلة يد صغيرة أو حمالة قصيرة."
 },
 "whatFits": {
 "fr": "Telephone, porte-cartes, cles, rouge a levres.",
 "en": "Phone, card holder, keys and lipstick.",
 "es": "Teléfono, tarjetero, llaves y pintalabios.",
 "tr": "Telefon, kart kılıfı, anahtarlar ve ruj.",
 "ar": "هاتف، حامل بطاقات، مفاتيح وأحمر شفاه."
 },
 "attachment": null,
 "handworkTime": {
 "fr": "35 à 85 heures par sac : tressage, gaine des anses, perlage et contrôle final, à la main.",
 "en": "35 to 85 hours per bag: weaving, handle wrapping, beadwork and final check, by hand.",
 "es": "35 a 85 horas por bolso: tejido, forrado de asas, abalorios y revisión final, a mano.",
 "tr": "Çanta başına 35–85 saat: dokuma, sap kaplama, boncuk işi ve son kontrol, elde.",
 "ar": "من 35 إلى 85 ساعة لكل حقيبة: نسيج، تغليف المقابض، أعمال الخرز والفحص النهائي، يدوياً."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Structure tressee, anses gainees, perles et finitions verifiees piece par piece dans l atelier de Guéliz.",
 "en": "Woven structure, wrapped handles, beadwork and finishing checked piece by piece in the Guéliz atelier.",
 "es": "Estructura tejida, asas forradas, cuentas y acabados revisados pieza a pieza en el atelier de Guéliz.",
 "tr": "Dokuma yapı, kaplı saplar, boncuk işi ve bitişler Guéliz atelyesinde parça parça kontrol edildi.",
 "ar": "هيكل منسوج، مقابض مغطاة، خرز وتشطيبات مفحوصة قطعة بقطعة في أتيليه قوليز."
 },
 "care": {
 "fr": "Depoussierer doucement. Eviter l humidite, la pluie et le poids excessif. Ranger rempli pour garder la forme.",
 "en": "Dust gently. Avoid humidity, rain and excessive weight. Store filled to keep the shape.",
 "es": "Quitar el polvo con suavidad. Evitar la humedad, la lluvia y el peso excesivo. Guardar relleno para mantener la forma.",
 "tr": "Nazikçe tozunu alın. Nem, yağmur ve aşırı ağırlıktan kaçının. Şeklini korumak için dolu saklayın.",
 "ar": "نظّف الغبار بلطف. تجنب الرطوبة والمطر والثقل الزائد. احفظه ممتلئاً للحفاظ على الشكل."
 },
 "packaging": {
 "fr": "Emballage YZA sobre, prêt pour cadeau ou retrait studio.",
 "en": "Minimal YZA packaging, ready for gifting or studio pickup.",
 "es": "Embalaje YZA minimalista, listo para regalo o recogida en el estudio.",
 "tr": "Sade YZA ambalajı, hediye veya stüdyodan teslim için hazır.",
 "ar": "تغليف YZA بسيط، جاهز للهدية أو الاستلام من الاستوديو."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz’de stüdyo teslimi mevcut.",
 "ar": "شحن مع تتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في قوليز."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "15 sacs par taille et couleur quand la serie est active; pas de restock garanti.",
 "en": "15 bags per size and colour when the batch is active; no guaranteed restock.",
 "es": "15 bolsos por talla y color cuando el lote está activo; sin reposición garantizada.",
 "tr": "Seri aktifken beden ve renk başına 15 çanta; garantili yeniden stok yok.",
 "ar": "15 حقيبة لكل حجم ولون عندما يكون الدفعة نشطة؛ لا إعادة تخزين مضمونة."
 },
 "edition": {
 "fr": "15 sacs par taille et couleur quand la serie est active; pas de restock garanti.",
 "en": "15 bags per size and colour when the batch is active; no guaranteed restock.",
 "es": "15 bolsos por talla y color cuando el lote está activo; sin reposición garantizada.",
 "tr": "Seri aktifken beden ve renk başına 15 çanta; garantili yeniden stok yok.",
 "ar": "15 حقيبة لكل حجم ولون عندما يكون الدفعة نشطة؛ لا إعادة تخزين مضمونة."
 },
 "badge": "bestseller",
 "hours": null,
 "giftable": false,
 "publicVisible": true,
 "sizeComparison": [
 {
 "label": {
 "fr": "XS / Rouge",
 "en": "XS / Red",
 "es": "XS / Rojo",
 "tr": "XS / Kırmızı",
 "ar": "XS / أحمر"
 },
 "price": 80000,
 "whatFits": {
 "fr": "Telephone, porte-cartes, cles, rouge a levres.",
 "en": "Phone, card holder, keys and lipstick.",
 "es": "Teléfono, tarjetero, llaves y pintalabios.",
 "tr": "Telefon, kart kılıfı, anahtarlar ve ruj.",
 "ar": "هاتف، حامل بطاقات، مفاتيح وأحمر شفاه."
 }
 },
 {
 "label": {
 "fr": "S / Violet",
 "en": "S / Violet",
 "es": "S / Violeta",
 "tr": "S / Mor",
 "ar": "S / بنفسجي"
 },
 "price": 93000,
 "whatFits": {
 "fr": "Telephone, portefeuille, lunettes, foulard fin et essentiels.",
 "en": "Phone, wallet, sunglasses, light scarf and essentials.",
 "es": "Teléfono, cartera, gafas de sol, fular ligero y esenciales.",
 "tr": "Telefon, cüzdan, güneş gözlüğü, ince fular ve temel eşyalar.",
 "ar": "هاتف، محفظة، نظارات شمسية، وشاح خفيف ومستلزمات أساسية."
 }
 },
 {
 "label": {
 "fr": "M / Noir",
 "en": "M / Black",
 "es": "M / Negro",
 "tr": "M / Siyah",
 "ar": "M / أسود"
 },
 "price": 100000,
 "whatFits": {
 "fr": "Essentiels + trousse, livre fin, foulard et petite pochette.",
 "en": "Essentials plus pouch, slim book, scarf and small clutch.",
 "es": "Esenciales más neceser, libro fino, fular y pequeño clutch.",
 "tr": "Temel eşyalar artı poşet, ince kitap, fular ve küçük el çantası.",
 "ar": "مستلزمات أساسية مع حقيبة صغيرة، كتاب رفيع، وشاح وحقيبة صغيرة."
 }
 }
 ],
 "crossSell": [
 "raffia-cherries-charm-ss26",
 "yza-pareo-skirt-short-jawhara-ss26",
 "yza-scarf-top-jawhara-ss26"
 ]
 },
 {
 "handle": "la-sculpture-s-basket-bag-ss26",
 "legacyHandles": [
 "sculpture-s-rouge",
 "sculpture-s-violet"
 ],
 "sku": null,
 "name": {
 "fr": "La Sculpture S - Violet",
 "en": "La Sculpture S - Violet",
 "es": "La Sculpture S - Violeta",
 "tr": "La Sculpture S - Mor",
 "ar": "La Sculpture S - بنفسجي"
 },
 "displayName": {
 "fr": "La Sculpture S - Violet",
 "en": "La Sculpture S - Violet",
 "es": "La Sculpture S - Violeta",
 "tr": "La Sculpture S - Mor",
 "ar": "La Sculpture S - بنفسجي"
 },
 "short": {
 "fr": "Format S, couleur violet, feuilles de bananier, raphia, cuir et perles.",
 "en": "S scale, violet finish, banana leaves, raffia, leather and beads.",
 "es": "Talla S, acabado violeta, hojas de bananero, rafia, cuero y cuentas.",
 "tr": "S beden, mor renk, muz yaprağı, rafya, deri ve boncuklar.",
 "ar": "حجم S، لون بنفسجي، أوراق الموز، الرافيا، الجلد والخرز."
 },
 "displayShort": {
 "fr": "Format S, couleur violet, feuilles de bananier, raphia, cuir et perles.",
 "en": "S scale, violet finish, banana leaves, raffia, leather and beads.",
 "es": "Talla S, acabado violeta, hojas de bananero, rafia, cuero y cuentas.",
 "tr": "S beden, mor renk, muz yaprağı, rafya, deri ve boncuklar.",
 "ar": "حجم S، لون بنفسجي، أوراق الموز، الرافيا، الجلد والخرز."
 },
 "desc": {
 "fr": "La Sculpture S - Violet: un panier YZA en feuilles de bananier, raphia, cuir et perles. Cette page montre uniquement la couleur violet et le format S, pour comprendre la taille, la couleur et les details reels de la piece.",
 "en": "La Sculpture S - Violet: a YZA basket in banana leaves, raffia, leather and beads. This page shows only the violet finish and S scale, so the size, colour and real details stay clear.",
 "es": "La Sculpture S - Violeta: una cesta YZA en hojas de bananero, rafia, cuero y cuentas. Esta página muestra únicamente el acabado violeta y la talla S, para que el tamaño, el color y los detalles reales queden claros.",
 "tr": "La Sculpture S - Mor: muz yaprağı, rafya, deri ve boncuklardan yapılmış bir YZA sepeti. Bu sayfa yalnızca mor rengi ve S bedeni gösterir; boyut, renk ve gerçek detaylar net kalır.",
 "ar": "La Sculpture S - بنفسجي: سلة YZA من أوراق الموز والرافيا والجلد والخرز. تعرض هذه الصفحة فقط اللون البنفسجي وحجم S، ليظل الحجم واللون والتفاصيل الحقيقية واضحة."
 },
 "price": 93000,
 "currency": "MAD",
 "category": "bags",
 "sourceCategory": "Basket Bags",
 "categoryLabel": {
 "fr": "Paniers & sacs",
 "en": "Bags",
 "es": "Bolsos y cestas",
 "tr": "Çantalar ve sepetler",
 "ar": "حقائب وسلال"
 },
 "group": "bags",
 "collection": {
 "fr": "Paniers iconiques",
 "en": "Iconic basket bags",
 "es": "Iconic basket bags",
 "tr": "Iconic basket bags",
 "ar": "Iconic basket bags"
 },
 "season": "All Seasons 2026",
 "img": "assets/products/bag-sculpture-violet-solo.webp",
 "gallery": [
 "assets/products/bag-sculpture-violet-solo.webp",
 "assets/lookbook-ss26-27/embedded/p45_img01_xref1333_caaad580c061.jpeg",
 "assets/lookbook-ss26-27/embedded/p41_img03_xref1315_841b5b884798.jpeg"
 ],
 "familyHandle": "la-sculpture",
 "familyOrder": 2,
 "variantLabel": {
 "fr": "S / Violet",
 "en": "S / Violet",
 "es": "S / Violeta",
 "tr": "S / Mor",
 "ar": "S / بنفسجي"
 },
 "availableColors": [
 {
 "fr": "Violet",
 "en": "Violet",
 "es": "Violeta",
 "tr": "Mor",
 "ar": "بنفسجي"
 }
 ],
 "availableSizes": [
 "S"
 ],
 "variants": [
 {
 "product_handle": "la-sculpture-s-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Sculpture",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": "Noir",
 "size": "Moyen",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 6
 },
 {
 "product_handle": "la-sculpture-s-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Sculpture",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": "Rouge",
 "size": "Moyen",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 9
 },
 {
 "product_handle": "la-sculpture-s-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Sculpture",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": "Violet",
 "size": "Moyen",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 12
 }
 ],
 "variantCount": 3,
 "variant_count_from_xlsx_catalog": 3,
 "tags": [
 "SS26",
 "Basket bag",
 "La Sculpture",
 "Banana leaves",
 "Raffia",
 "Beads",
 "Marrakech"
 ],
 "seoTitle": "La Sculpture S Basket Bag - Handmade in Marrakech",
 "seoKeywords": [
 "Guéliz",
 "Guéliz",
 "Iconic Basket Bags",
 "La Sculpture S",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "bag",
 "bags",
 "basket",
 "bolsa",
 "canta",
 "crochet",
 "fait main",
 "fits",
 "handmade",
 "la-sculpture-s-basket-bag-ss26",
 "m",
 "panier",
 "s",
 "sac",
 "what",
 "xs",
 "حقيبة",
 "La Sculpture",
 "La Sculpture",
 "S",
 "Violet",
 "Violet",
 "La Sculpture S",
 "La Sculpture S"
 ],
 "languageSearchTerms": [
 "Guéliz",
 "Guéliz",
 "Iconic Basket Bags",
 "La Sculpture S",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "bag",
 "bags",
 "basket",
 "bolsa",
 "canta",
 "crochet",
 "fait main",
 "fits",
 "handmade",
 "la-sculpture-s-basket-bag-ss26",
 "m",
 "panier",
 "s",
 "sac",
 "what",
 "xs",
 "حقيبة",
 "La Sculpture",
 "La Sculpture",
 "S",
 "Violet",
 "Violet",
 "La Sculpture S",
 "La Sculpture S"
 ],
 "material": {
 "fr": "Feuilles de bananier, Raffia, Perles",
 "en": "Banana leaves, Raffia, Beads",
 "es": "Hojas de bananero, Rafia, Cuentas",
 "tr": "Muz yaprağı, Rafya, Boncuklar",
 "ar": "أوراق الموز، الرافيا، الخرز"
 },
 "fabric": {
 "fr": "Banana leaves, raffia & beads; 3 colors in stock",
 "en": "Banana leaves, raffia & beads; 3 colors in stock",
 "es": "Hojas de bananero, rafia y cuentas; 3 colores en stock",
 "tr": "Muz yaprağı, rafya ve boncuklar; 3 renk stokta",
 "ar": "أوراق الموز والرافيا والخرز؛ 3 ألوان في المخزون"
 },
 "color": {
 "fr": "Violet",
 "en": "Violet",
 "es": "Violeta",
 "tr": "Mor",
 "ar": "بنفسجي"
 },
 "size": {
 "fr": "S",
 "en": "S",
 "es": "S",
 "tr": "S",
 "ar": "S"
 },
 "visualSize": "S",
 "visualColor": {
 "fr": "Violet",
 "en": "Violet",
 "es": "Violeta",
 "tr": "Mor",
 "ar": "بنفسجي"
 },
 "bagFamilyTitle": {
 "fr": "La Sculpture",
 "en": "La Sculpture",
 "es": "La Sculpture",
 "tr": "La Sculpture",
 "ar": "La Sculpture"
 },
 "bagFamilyEyebrow": {
 "fr": "Collection Sculpture",
 "en": "Collection Sculpture",
 "es": "Collection Sculpture",
 "tr": "Collection Sculpture",
 "ar": "Collection Sculpture"
 },
 "bagFamilyText": {
 "fr": "Trois formats, trois lectures couleur. Chaque sac garde sa propre page, ses propres images et son propre rythme d'atelier.",
 "en": "Three scales, three colour readings. Each bag keeps its own page, image set and atelier rhythm.",
 "es": "Tres formatos, tres lecturas de color. Cada bolso mantiene su propia página, imágenes y ritmo de atelier.",
 "tr": "Üç beden, üç renk yorumu. Her çanta kendi sayfasını, görsel setini ve atölye ritmini korur.",
 "ar": "ثلاثة أحجام، ثلاث قراءات للون. كل حقيبة تحتفظ بصفحتها الخاصة ومجموعة صورها وإيقاع الأتيليه."
 },
 "bagFamilyOrder": 1,
 "dimensions": {
 "fr": "Format S: panier journee compact.",
 "en": "S scale: compact day basket.",
 "es": "Talla S: cesta de día compacta.",
 "tr": "S beden: kompakt günlük sepet.",
 "ar": "حجم S: سلة يومية مضغوطة."
 },
 "whatFits": {
 "fr": "Telephone, portefeuille, lunettes, foulard fin et essentiels.",
 "en": "Phone, wallet, sunglasses, light scarf and essentials.",
 "es": "Teléfono, cartera, gafas de sol, fular ligero y esenciales.",
 "tr": "Telefon, cüzdan, güneş gözlüğü, ince fular ve temel eşyalar.",
 "ar": "هاتف، محفظة، نظارات شمسية، وشاح خفيف ومستلزمات أساسية."
 },
 "attachment": null,
 "handworkTime": {
 "fr": "35 à 85 heures par sac : tressage, gaine des anses, perlage et contrôle final, à la main.",
 "en": "35 to 85 hours per bag: weaving, handle wrapping, beadwork and final check, by hand.",
 "es": "35 a 85 horas por bolso: tejido, forrado de asas, abalorios y revisión final, a mano.",
 "tr": "Çanta başına 35–85 saat: dokuma, sap kaplama, boncuk işi ve son kontrol, elde.",
 "ar": "من 35 إلى 85 ساعة لكل حقيبة: نسيج، تغليف المقابض، أعمال الخرز والفحص النهائي، يدوياً."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Structure tressee, anses gainees, perles et finitions verifiees piece par piece dans l atelier de Guéliz.",
 "en": "Woven structure, wrapped handles, beadwork and finishing checked piece by piece in the Guéliz atelier.",
 "es": "Estructura tejida, asas forradas, cuentas y acabados revisados pieza a pieza en el atelier de Guéliz.",
 "tr": "Dokuma yapı, kaplı saplar, boncuk işi ve bitişler Guéliz atelyesinde parça parça kontrol edildi.",
 "ar": "هيكل منسوج، مقابض مغطاة، خرز وتشطيبات مفحوصة قطعة بقطعة في أتيليه قوليز."
 },
 "care": {
 "fr": "Depoussierer doucement. Eviter l humidite, la pluie et le poids excessif. Ranger rempli pour garder la forme.",
 "en": "Dust gently. Avoid humidity, rain and excessive weight. Store filled to keep the shape.",
 "es": "Quitar el polvo con suavidad. Evitar la humedad, la lluvia y el peso excesivo. Guardar relleno para mantener la forma.",
 "tr": "Nazikçe tozunu alın. Nem, yağmur ve aşırı ağırlıktan kaçının. Şeklini korumak için dolu saklayın.",
 "ar": "نظّف الغبار بلطف. تجنب الرطوبة والمطر والثقل الزائد. احفظه ممتلئاً للحفاظ على الشكل."
 },
 "packaging": {
 "fr": "Emballage YZA sobre, prêt pour cadeau ou retrait studio.",
 "en": "Minimal YZA packaging, ready for gifting or studio pickup.",
 "es": "Embalaje YZA minimalista, listo para regalo o recogida en el estudio.",
 "tr": "Sade YZA ambalajı, hediye veya stüdyodan teslim için hazır.",
 "ar": "تغليف YZA بسيط، جاهز للهدية أو الاستلام من الاستوديو."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz’de stüdyo teslimi mevcut.",
 "ar": "شحن مع تتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في قوليز."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "15 sacs par taille et couleur quand la serie est active; pas de restock garanti.",
 "en": "15 bags per size and colour when the batch is active; no guaranteed restock.",
 "es": "15 bolsos por talla y color cuando el lote está activo; sin reposición garantizada.",
 "tr": "Seri aktifken beden ve renk başına 15 çanta; garantili yeniden stok yok.",
 "ar": "15 حقيبة لكل حجم ولون عندما يكون الدفعة نشطة؛ لا إعادة تخزين مضمونة."
 },
 "edition": {
 "fr": "15 sacs par taille et couleur quand la serie est active; pas de restock garanti.",
 "en": "15 bags per size and colour when the batch is active; no guaranteed restock.",
 "es": "15 bolsos por talla y color cuando el lote está activo; sin reposición garantizada.",
 "tr": "Seri aktifken beden ve renk başına 15 çanta; garantili yeniden stok yok.",
 "ar": "15 حقيبة لكل حجم ولون عندما يكون الدفعة نشطة؛ لا إعادة تخزين مضمونة."
 },
 "badge": "limited",
 "hours": null,
 "giftable": false,
 "publicVisible": true,
 "sizeComparison": [
 {
 "label": {
 "fr": "XS / Rouge",
 "en": "XS / Red",
 "es": "XS / Rojo",
 "tr": "XS / Kırmızı",
 "ar": "XS / أحمر"
 },
 "price": 80000,
 "whatFits": {
 "fr": "Telephone, porte-cartes, cles, rouge a levres.",
 "en": "Phone, card holder, keys and lipstick.",
 "es": "Teléfono, tarjetero, llaves y pintalabios.",
 "tr": "Telefon, kart kılıfı, anahtarlar ve ruj.",
 "ar": "هاتف، حامل بطاقات، مفاتيح وأحمر شفاه."
 }
 },
 {
 "label": {
 "fr": "S / Violet",
 "en": "S / Violet",
 "es": "S / Violeta",
 "tr": "S / Mor",
 "ar": "S / بنفسجي"
 },
 "price": 93000,
 "whatFits": {
 "fr": "Telephone, portefeuille, lunettes, foulard fin et essentiels.",
 "en": "Phone, wallet, sunglasses, light scarf and essentials.",
 "es": "Teléfono, cartera, gafas de sol, fular ligero y esenciales.",
 "tr": "Telefon, cüzdan, güneş gözlüğü, ince fular ve temel eşyalar.",
 "ar": "هاتف، محفظة، نظارات شمسية، وشاح خفيف ومستلزمات أساسية."
 }
 },
 {
 "label": {
 "fr": "M / Noir",
 "en": "M / Black",
 "es": "M / Negro",
 "tr": "M / Siyah",
 "ar": "M / أسود"
 },
 "price": 100000,
 "whatFits": {
 "fr": "Essentiels + trousse, livre fin, foulard et petite pochette.",
 "en": "Essentials plus pouch, slim book, scarf and small clutch.",
 "es": "Esenciales más neceser, libro fino, fular y pequeño clutch.",
 "tr": "Temel eşyalar artı poşet, ince kitap, fular ve küçük el çantası.",
 "ar": "مستلزمات أساسية مع حقيبة صغيرة، كتاب رفيع، وشاح وحقيبة صغيرة."
 }
 }
 ],
 "crossSell": [
 "raffia-cherries-charm-ss26",
 "yza-pareo-skirt-short-jawhara-ss26",
 "yza-scarf-top-jawhara-ss26"
 ]
 },
 {
 "handle": "la-sculpture-m-basket-bag-ss26",
 "legacyHandles": [
 "sculpture-m-noir"
 ],
 "sku": null,
 "name": {
 "fr": "La Sculpture M - Noir",
 "en": "La Sculpture M - Black",
 "es": "La Sculpture M - Negro",
 "tr": "La Sculpture M - Siyah",
 "ar": "La Sculpture M - أسود"
 },
 "displayName": {
 "fr": "La Sculpture M - Noir",
 "en": "La Sculpture M - Black",
 "es": "La Sculpture M - Negro",
 "tr": "La Sculpture M - Siyah",
 "ar": "La Sculpture M - أسود"
 },
 "short": {
 "fr": "Format M, couleur noir, feuilles de bananier, raphia, cuir et perles.",
 "en": "M scale, black finish, banana leaves, raffia, leather and beads.",
 "es": "Talla M, acabado negro, hojas de bananero, rafia, cuero y cuentas.",
 "tr": "M beden, siyah renk, muz yaprağı, rafya, deri ve boncuklar.",
 "ar": "حجم M، لون أسود، أوراق الموز، الرافيا، الجلد والخرز."
 },
 "displayShort": {
 "fr": "Format M, couleur noir, feuilles de bananier, raphia, cuir et perles.",
 "en": "M scale, black finish, banana leaves, raffia, leather and beads.",
 "es": "Talla M, acabado negro, hojas de bananero, rafia, cuero y cuentas.",
 "tr": "M beden, siyah renk, muz yaprağı, rafya, deri ve boncuklar.",
 "ar": "حجم M، لون أسود، أوراق الموز، الرافيا، الجلد والخرز."
 },
 "desc": {
 "fr": "La Sculpture M - Noir: un panier YZA en feuilles de bananier, raphia, cuir et perles. Cette page montre uniquement la couleur noir et le format M, pour comprendre la taille, la couleur et les details reels de la piece.",
 "en": "La Sculpture M - Black: a YZA basket in banana leaves, raffia, leather and beads. This page shows only the black finish and M scale, so the size, colour and real details stay clear.",
 "es": "La Sculpture M - Negro: una cesta YZA en hojas de bananero, rafia, cuero y cuentas. Esta página muestra únicamente el acabado negro y la talla M, para que el tamaño, el color y los detalles reales queden claros.",
 "tr": "La Sculpture M - Siyah: muz yaprağı, rafya, deri ve boncuklardan yapılmış bir YZA sepeti. Bu sayfa yalnızca siyah rengi ve M bedeni gösterir; boyut, renk ve gerçek detaylar net kalır.",
 "ar": "La Sculpture M - أسود: سلة YZA من أوراق الموز والرافيا والجلد والخرز. تعرض هذه الصفحة فقط اللون الأسود وحجم M، ليظل الحجم واللون والتفاصيل الحقيقية واضحة."
 },
 "price": 100000,
 "currency": "MAD",
 "category": "bags",
 "sourceCategory": "Basket Bags",
 "categoryLabel": {
 "fr": "Paniers & sacs",
 "en": "Bags",
 "es": "Bolsos y cestas",
 "tr": "Çantalar ve sepetler",
 "ar": "حقائب وسلال"
 },
 "group": "bags",
 "collection": {
 "fr": "Paniers iconiques",
 "en": "Iconic basket bags",
 "es": "Iconic basket bags",
 "tr": "Iconic basket bags",
 "ar": "Iconic basket bags"
 },
 "season": "All Seasons 2026",
 "img": "assets/lookbook-ss26-27/embedded/p46_img01_xref1337_7dae31225680.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p46_img01_xref1337_7dae31225680.jpeg",
 "assets/lookbook-ss26-27/embedded/p47_img01_xref1341_0932d247e77e.jpeg",
 "assets/lookbook-ss26-27/embedded/p48_img02_xref1346_42bfdc1a3e34.jpeg",
 "assets/lookbook-ss26-27/embedded/p48_img03_xref1347_e6608af984d1.jpeg"
 ],
 "familyHandle": "la-sculpture",
 "familyOrder": 3,
 "variantLabel": {
 "fr": "M / Noir",
 "en": "M / Black",
 "es": "M / Negro",
 "tr": "M / Siyah",
 "ar": "M / أسود"
 },
 "availableColors": [
 {
 "fr": "Noir",
 "en": "Black",
 "es": "Negro",
 "tr": "Siyah",
 "ar": "أسود"
 }
 ],
 "availableSizes": [
 "M"
 ],
 "variants": [
 {
 "product_handle": "la-sculpture-m-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Sculpture",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": "Noir",
 "size": "Grand",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 7
 },
 {
 "product_handle": "la-sculpture-m-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Sculpture",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": "Rouge",
 "size": "Grand",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 10
 },
 {
 "product_handle": "la-sculpture-m-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Sculpture",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": "Violet",
 "size": "Grand",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 13
 }
 ],
 "variantCount": 3,
 "variant_count_from_xlsx_catalog": 3,
 "tags": [
 "SS26",
 "Basket bag",
 "La Sculpture",
 "Banana leaves",
 "Raffia",
 "Beads",
 "Marrakech"
 ],
 "seoTitle": "La Sculpture M Basket Bag - Handmade in Marrakech",
 "seoKeywords": [
 "Guéliz",
 "Guéliz",
 "Iconic Basket Bags",
 "La Sculpture M",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "bag",
 "bags",
 "basket",
 "bolsa",
 "canta",
 "crochet",
 "fait main",
 "fits",
 "handmade",
 "la-sculpture-m-basket-bag-ss26",
 "m",
 "panier",
 "s",
 "sac",
 "what",
 "xs",
 "حقيبة",
 "La Sculpture",
 "La Sculpture",
 "M",
 "Noir",
 "Black",
 "La Sculpture M",
 "La Sculpture M"
 ],
 "languageSearchTerms": [
 "Guéliz",
 "Guéliz",
 "Iconic Basket Bags",
 "La Sculpture M",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "bag",
 "bags",
 "basket",
 "bolsa",
 "canta",
 "crochet",
 "fait main",
 "fits",
 "handmade",
 "la-sculpture-m-basket-bag-ss26",
 "m",
 "panier",
 "s",
 "sac",
 "what",
 "xs",
 "حقيبة",
 "La Sculpture",
 "La Sculpture",
 "M",
 "Noir",
 "Black",
 "La Sculpture M",
 "La Sculpture M"
 ],
 "material": {
 "fr": "Feuilles de bananier, Raffia, Perles",
 "en": "Banana leaves, Raffia, Beads",
 "es": "Hojas de bananero, Rafia, Cuentas",
 "tr": "Muz yaprağı, Rafya, Boncuklar",
 "ar": "أوراق الموز، الرافيا، الخرز"
 },
 "fabric": {
 "fr": "Banana leaves, raffia & beads; 3 colors in stock",
 "en": "Banana leaves, raffia & beads; 3 colors in stock",
 "es": "Hojas de bananero, rafia y cuentas; 3 colores en stock",
 "tr": "Muz yaprağı, rafya ve boncuklar; 3 renk stokta",
 "ar": "أوراق الموز والرافيا والخرز؛ 3 ألوان في المخزون"
 },
 "color": {
 "fr": "Noir",
 "en": "Black",
 "es": "Negro",
 "tr": "Siyah",
 "ar": "أسود"
 },
 "size": {
 "fr": "M",
 "en": "M",
 "es": "M",
 "tr": "M",
 "ar": "M"
 },
 "visualSize": "M",
 "visualColor": {
 "fr": "Noir",
 "en": "Black",
 "es": "Negro",
 "tr": "Siyah",
 "ar": "أسود"
 },
 "bagFamilyTitle": {
 "fr": "La Sculpture",
 "en": "La Sculpture",
 "es": "La Sculpture",
 "tr": "La Sculpture",
 "ar": "La Sculpture"
 },
 "bagFamilyEyebrow": {
 "fr": "Collection Sculpture",
 "en": "Collection Sculpture",
 "es": "Collection Sculpture",
 "tr": "Collection Sculpture",
 "ar": "Collection Sculpture"
 },
 "bagFamilyText": {
 "fr": "Trois formats, trois lectures couleur. Chaque sac garde sa propre page, ses propres images et son propre rythme d’atelier.",
 "en": "Three scales, three colour readings. Each bag keeps its own page, image set and atelier rhythm.",
 "es": "Tres formatos, tres lecturas de color. Cada bolso mantiene su propia página, imágenes y ritmo de atelier.",
 "tr": "Üç beden, üç renk yorumu. Her çanta kendi sayfasını, görsel setini ve atölye ritmini korur.",
 "ar": "ثلاثة أحجام، ثلاث قراءات للون. كل حقيبة تحتفظ بصفحتها الخاصة ومجموعة صورها وإيقاع الأتيليه."
 },
 "bagFamilyOrder": 1,
 "dimensions": {
 "fr": "Format M: panier statement avec plus de volume.",
 "en": "M scale: statement basket with more volume.",
 "es": "Talla M: cesta statement con más volumen.",
 "tr": "M beden: daha fazla hacimli statement sepet.",
 "ar": "حجم M: سلة statement بحجم أكبر."
 },
 "whatFits": {
 "fr": "Essentiels + trousse, livre fin, foulard et petite pochette.",
 "en": "Essentials plus pouch, slim book, scarf and small clutch.",
 "es": "Esenciales más neceser, libro fino, fular y pequeño clutch.",
 "tr": "Temel eşyalar artı poşet, ince kitap, fular ve küçük el çantası.",
 "ar": "مستلزمات أساسية مع حقيبة صغيرة، كتاب رفيع، وشاح وحقيبة صغيرة."
 },
 "attachment": null,
 "handworkTime": {
 "fr": "35 à 85 heures par sac : tressage, gaine des anses, perlage et contrôle final, à la main.",
 "en": "35 to 85 hours per bag: weaving, handle wrapping, beadwork and final check, by hand.",
 "es": "35 a 85 horas por bolso: tejido, forrado de asas, abalorios y revisión final, a mano.",
 "tr": "Çanta başına 35–85 saat: dokuma, sap kaplama, boncuk işi ve son kontrol, elde.",
 "ar": "من 35 إلى 85 ساعة لكل حقيبة: نسيج، تغليف المقابض، أعمال الخرز والفحص النهائي، يدوياً."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Structure tressee, anses gainees, perles et finitions verifiees piece par piece dans l atelier de Guéliz.",
 "en": "Woven structure, wrapped handles, beadwork and finishing checked piece by piece in the Guéliz atelier.",
 "es": "Estructura tejida, asas forradas, cuentas y acabados revisados pieza a pieza en el atelier de Guéliz.",
 "tr": "Dokuma yapı, kaplı saplar, boncuk işi ve bitişler Guéliz atelyesinde parça parça kontrol edildi.",
 "ar": "هيكل منسوج، مقابض مغطاة، خرز وتشطيبات مفحوصة قطعة بقطعة في أتيليه قوليز."
 },
 "care": {
 "fr": "Depoussierer doucement. Eviter l humidite, la pluie et le poids excessif. Ranger rempli pour garder la forme.",
 "en": "Dust gently. Avoid humidity, rain and excessive weight. Store filled to keep the shape.",
 "es": "Quitar el polvo con suavidad. Evitar la humedad, la lluvia y el peso excesivo. Guardar relleno para mantener la forma.",
 "tr": "Nazikçe tozunu alın. Nem, yağmur ve aşırı ağırlıktan kaçının. Şeklini korumak için dolu saklayın.",
 "ar": "نظّف الغبار بلطف. تجنب الرطوبة والمطر والثقل الزائد. احفظه ممتلئاً للحفاظ على الشكل."
 },
 "packaging": {
 "fr": "Emballage YZA sobre, prêt pour cadeau ou retrait studio.",
 "en": "Minimal YZA packaging, ready for gifting or studio pickup.",
 "es": "Embalaje YZA minimalista, listo para regalo o recogida en el estudio.",
 "tr": "Sade YZA ambalajı, hediye veya stüdyodan teslim için hazır.",
 "ar": "تغليف YZA بسيط، جاهز للهدية أو الاستلام من الاستوديو."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz’de stüdyo teslimi mevcut.",
 "ar": "شحن مع تتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في قوليز."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "15 sacs par taille et couleur quand la serie est active; pas de restock garanti.",
 "en": "15 bags per size and colour when the batch is active; no guaranteed restock.",
 "es": "15 bolsos por talla y color cuando el lote está activo; sin reposición garantizada.",
 "tr": "Seri aktifken beden ve renk başına 15 çanta; garantili yeniden stok yok.",
 "ar": "15 حقيبة لكل حجم ولون عندما يكون الدفعة نشطة؛ لا إعادة تخزين مضمونة."
 },
 "edition": {
 "fr": "15 sacs par taille et couleur quand la serie est active; pas de restock garanti.",
 "en": "15 bags per size and colour when the batch is active; no guaranteed restock.",
 "es": "15 bolsos por talla y color cuando el lote está activo; sin reposición garantizada.",
 "tr": "Seri aktifken beden ve renk başına 15 çanta; garantili yeniden stok yok.",
 "ar": "15 حقيبة لكل حجم ولون عندما يكون الدفعة نشطة؛ لا إعادة تخزين مضمونة."
 },
 "badge": "limited",
 "hours": null,
 "giftable": false,
 "publicVisible": true,
 "sizeComparison": [
 {
 "label": {
 "fr": "XS / Rouge",
 "en": "XS / Red",
 "es": "XS / Rojo",
 "tr": "XS / Kırmızı",
 "ar": "XS / أحمر"
 },
 "price": 80000,
 "whatFits": {
 "fr": "Telephone, porte-cartes, cles, rouge a levres.",
 "en": "Phone, card holder, keys and lipstick.",
 "es": "Teléfono, tarjetero, llaves y pintalabios.",
 "tr": "Telefon, kart kılıfı, anahtarlar ve ruj.",
 "ar": "هاتف، حامل بطاقات، مفاتيح وأحمر شفاه."
 }
 },
 {
 "label": {
 "fr": "S / Violet",
 "en": "S / Violet",
 "es": "S / Violeta",
 "tr": "S / Mor",
 "ar": "S / بنفسجي"
 },
 "price": 93000,
 "whatFits": {
 "fr": "Telephone, portefeuille, lunettes, foulard fin et essentiels.",
 "en": "Phone, wallet, sunglasses, light scarf and essentials.",
 "es": "Teléfono, cartera, gafas de sol, fular ligero y esenciales.",
 "tr": "Telefon, cüzdan, güneş gözlüğü, ince fular ve temel eşyalar.",
 "ar": "هاتف، محفظة، نظارات شمسية، وشاح خفيف ومستلزمات أساسية."
 }
 },
 {
 "label": {
 "fr": "M / Noir",
 "en": "M / Black",
 "es": "M / Negro",
 "tr": "M / Siyah",
 "ar": "M / أسود"
 },
 "price": 100000,
 "whatFits": {
 "fr": "Essentiels + trousse, livre fin, foulard et petite pochette.",
 "en": "Essentials plus pouch, slim book, scarf and small clutch.",
 "es": "Esenciales más neceser, libro fino, fular y pequeño clutch.",
 "tr": "Temel eşyalar artı poşet, ince kitap, fular ve küçük el çantası.",
 "ar": "مستلزمات أساسية مع حقيبة صغيرة، كتاب رفيع، وشاح وحقيبة صغيرة."
 }
 }
 ],
 "crossSell": [
 "raffia-cherries-charm-ss26",
 "yza-pareo-skirt-short-jawhara-ss26",
 "yza-scarf-top-jawhara-ss26"
 ]
 },
 {
 "handle": "la-nouvelle-vague-xs-basket-bag-ss26",
 "legacyHandles": [],
 "sku": null,
 "name": {
 "fr": "La Nouvelle Vague XS - Bleu",
 "en": "New Edition Bag XS - Blue",
 "es": "New Edition Bag XS - Blue",
 "tr": "New Edition Bag XS - Blue",
 "ar": "New Edition Bag XS - Blue"
 },
 "displayName": {
 "fr": "La Nouvelle Vague XS - Bleu",
 "en": "New Edition Bag XS - Blue",
 "es": "New Edition Bag XS - Blue",
 "tr": "New Edition Bag XS - Blue",
 "ar": "New Edition Bag XS - Blue"
 },
 "short": {
 "fr": "Format XS, couleur bleu, feuilles de bananier, raphia, cuir et perles.",
 "en": "XS scale, blue finish, banana leaves, raffia, leather and beads.",
 "es": "Talla XS, acabado azul, hojas de bananero, rafia, cuero y cuentas.",
 "tr": "XS beden, mavi renk, muz yaprağı, rafya, deri ve boncuklar.",
 "ar": "حجم XS، لون أزرق، أوراق الموز، الرافيا، الجلد والخرز."
 },
 "displayShort": {
 "fr": "Format XS, couleur bleu, feuilles de bananier, raphia, cuir et perles.",
 "en": "XS scale, blue finish, banana leaves, raffia, leather and beads.",
 "es": "Talla XS, acabado azul, hojas de bananero, rafia, cuero y cuentas.",
 "tr": "XS beden, mavi renk, muz yaprağı, rafya, deri ve boncuklar.",
 "ar": "حجم XS، لون أزرق، أوراق الموز، الرافيا، الجلد والخرز."
 },
 "desc": {
 "fr": "La Nouvelle Vague XS - Bleu: un panier YZA en feuilles de bananier, raphia, cuir et perles. Cette page montre uniquement la couleur bleu et le format XS, pour comprendre la taille, la couleur et les details reels de la piece.",
 "en": "New Edition Bag XS - Blue: a YZA basket in banana leaves, raffia, leather and beads. This page shows only the blue finish and XS scale, so the size, colour and real details stay clear.",
 "es": "La Nouvelle Vague XS - Azul: una cesta YZA en hojas de bananero, rafia, cuero y cuentas. Esta página muestra únicamente el acabado azul y la talla XS, para que el tamaño, el color y los detalles reales queden claros.",
 "tr": "La Nouvelle Vague XS - Mavi: muz yaprağı, rafya, deri ve boncuklardan yapılmış bir YZA sepeti. Bu sayfa yalnızca mavi rengi ve XS bedeni gösterir; boyut, renk ve gerçek detaylar net kalır.",
 "ar": "La Nouvelle Vague XS - أزرق: سلة YZA من أوراق الموز والرافيا والجلد والخرز. تعرض هذه الصفحة فقط اللون الأزرق وحجم XS، ليظل الحجم واللون والتفاصيل الحقيقية واضحة."
 },
 "price": 49000,
 "currency": "MAD",
 "category": "bags",
 "sourceCategory": "Basket Bags",
 "categoryLabel": {
 "fr": "Paniers & sacs",
 "en": "Bags",
 "es": "Bolsos y cestas",
 "tr": "Çantalar ve sepetler",
 "ar": "حقائب وسلال"
 },
 "group": "bags",
 "collection": {
 "fr": "Paniers iconiques",
 "en": "Iconic basket bags",
 "es": "Iconic basket bags",
 "tr": "Iconic basket bags",
 "ar": "Iconic basket bags"
 },
 "season": "All Seasons 2026",
 "img": "assets/products/bag-nouvelle-vague-still.webp",
 "gallery": [
 "assets/products/bag-nouvelle-vague-still.webp",
 "assets/lookbook-ss26-27/embedded/p50_img01_xref1362_b250c91a59d1.jpeg"
 ],
 "familyHandle": "la-nouvelle-vague",
 "familyOrder": 1,
 "variantLabel": {
 "fr": "XS / Bleu",
 "en": "XS / Blue",
 "es": "XS / Azul",
 "tr": "XS / Mavi",
 "ar": "XS / أزرق"
 },
 "availableColors": [
 {
 "fr": "Bleu",
 "en": "Blue",
 "es": "Azul",
 "tr": "Mavi",
 "ar": "أزرق"
 }
 ],
 "availableSizes": [
 "XS"
 ],
 "variants": [
 {
 "product_handle": "la-nouvelle-vague-xs-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Market",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": null,
 "size": "Mini",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 21
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Basket bag",
 "La Nouvelle Vague",
 "Banana leaves",
 "Leather",
 "Beads",
 "Marrakech"
 ],
 "seoTitle": "La Nouvelle Vague XS Basket Bag - Handmade in Marrakech",
 "seoKeywords": [
 "Guéliz",
 "Guéliz",
 "Iconic Basket Bags",
 "La Nouvelle Vague XS",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "bag",
 "bags",
 "basket",
 "bolsa",
 "canta",
 "crochet",
 "fait main",
 "fits",
 "handmade",
 "la-nouvelle-vague-xs-basket-bag-ss26",
 "m",
 "panier",
 "s",
 "sac",
 "what",
 "xs",
 "حقيبة",
 "La Nouvelle Vague",
 "New Edition Bag",
 "XS",
 "Bleu",
 "Blue",
 "La Nouvelle Vague XS",
 "New Edition Bag XS"
 ],
 "languageSearchTerms": [
 "Guéliz",
 "Guéliz",
 "Iconic Basket Bags",
 "La Nouvelle Vague XS",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "bag",
 "bags",
 "basket",
 "bolsa",
 "canta",
 "crochet",
 "fait main",
 "fits",
 "handmade",
 "la-nouvelle-vague-xs-basket-bag-ss26",
 "m",
 "panier",
 "s",
 "sac",
 "what",
 "xs",
 "حقيبة",
 "La Nouvelle Vague",
 "New Edition Bag",
 "XS",
 "Bleu",
 "Blue",
 "La Nouvelle Vague XS",
 "New Edition Bag XS"
 ],
 "material": {
 "fr": "Feuilles de bananier, Cuir, Perles",
 "en": "Banana leaves, Leather, Beads",
 "es": "Hojas de bananero, Cuero, Cuentas",
 "tr": "Muz yaprağı, Deri, Boncuklar",
 "ar": "أوراق الموز، الجلد، الخرز"
 },
 "fabric": {
 "fr": "Banana leaves, leather & beads; 3 sizes x 3 colors",
 "en": "Banana leaves, leather & beads; 3 sizes x 3 colors",
 "es": "Hojas de bananero, cuero y cuentas; 3 tallas x 3 colores",
 "tr": "Muz yaprağı, deri ve boncuklar; 3 beden x 3 renk",
 "ar": "أوراق الموز والجلد والخرز؛ 3 أحجام × 3 ألوان"
 },
 "color": {
 "fr": "Bleu",
 "en": "Blue",
 "es": "Azul",
 "tr": "Mavi",
 "ar": "أزرق"
 },
 "size": {
 "fr": "XS",
 "en": "XS",
 "es": "XS",
 "tr": "XS",
 "ar": "XS"
 },
 "visualSize": "XS",
 "visualColor": {
 "fr": "Bleu",
 "en": "Blue",
 "es": "Azul",
 "tr": "Mavi",
 "ar": "أزرق"
 },
 "bagFamilyTitle": {
 "fr": "La Nouvelle Vague",
 "en": "New Edition Bag",
 "es": "New Edition Bag",
 "tr": "New Edition Bag",
 "ar": "New Edition Bag"
 },
 "bagFamilyEyebrow": {
 "fr": "New edition bag",
 "en": "New edition bag",
 "es": "Nueva edición",
 "tr": "Yeni koleksiyon çantası",
 "ar": "حقيبة إصدار جديد"
 },
 "bagFamilyText": {
 "fr": "La ligne plus souple et solaire: anses bijou, foulard et formats faciles a porter en ville ou en vacances.",
 "en": "The softer sunlit line: beaded handles, scarf styling and easy scales for city days or holidays.",
 "es": "La línea más suave y luminosa: asas con cuentas, estilo con fular y formatos fáciles para la ciudad o las vacaciones.",
 "tr": "Daha yumuşak ve güneşli çizgi: boncuklu saplar, fular stili ve şehir günleri veya tatil için kolay bedenler.",
 "ar": "الخط الأكثر نعومة وإشراقاً: مقابض خرزية، تنسيق مع وشاح وأحجام سهلة لأيام المدينة أو العطلات."
 },
 "bagFamilyOrder": 2,
 "dimensions": {
 "fr": "Format XS: mini panier main ou epaule courte.",
 "en": "XS scale: mini hand or short-shoulder basket.",
 "es": "Talla XS: mini cesta de mano o hombro corto.",
 "tr": "XS beden: mini el ya da kısa omuz sepeti.",
 "ar": "حجم XS: سلة يد صغيرة أو حمالة قصيرة."
 },
 "whatFits": {
 "fr": "Telephone, porte-cartes, cles, rouge a levres.",
 "en": "Phone, card holder, keys and lipstick.",
 "es": "Teléfono, tarjetero, llaves y pintalabios.",
 "tr": "Telefon, kart kılıfı, anahtarlar ve ruj.",
 "ar": "هاتف، حامل بطاقات، مفاتيح وأحمر شفاه."
 },
 "attachment": null,
 "handworkTime": {
 "fr": "Assemblage main: tressage, gaine des anses, perlage et controle final.",
 "en": "Hand assembly: weaving, handle wrapping, beadwork and final check.",
 "es": "Ensamblaje manual: tejido, forrado de asas, abalorios y revisión final.",
 "tr": "El montajı: dokuma, sap kaplama, boncuk işi ve son kontrol.",
 "ar": "تجميع يدوي: نسيج، تغليف المقابض، أعمال الخرز والفحص النهائي."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Structure tressee, anses gainees, perles et finitions verifiees piece par piece dans l atelier de Guéliz.",
 "en": "Woven structure, wrapped handles, beadwork and finishing checked piece by piece in the Guéliz atelier.",
 "es": "Estructura tejida, asas forradas, cuentas y acabados revisados pieza a pieza en el atelier de Guéliz.",
 "tr": "Dokuma yapı, kaplı saplar, boncuk işi ve bitişler Guéliz atelyesinde parça parça kontrol edildi.",
 "ar": "هيكل منسوج، مقابض مغطاة، خرز وتشطيبات مفحوصة قطعة بقطعة في أتيليه قوليز."
 },
 "care": {
 "fr": "Depoussierer doucement. Eviter l humidite, la pluie et le poids excessif. Ranger rempli pour garder la forme.",
 "en": "Dust gently. Avoid humidity, rain and excessive weight. Store filled to keep the shape.",
 "es": "Quitar el polvo con suavidad. Evitar la humedad, la lluvia y el peso excesivo. Guardar relleno para mantener la forma.",
 "tr": "Nazikçe tozunu alın. Nem, yağmur ve aşırı ağırlıktan kaçının. Şeklini korumak için dolu saklayın.",
 "ar": "نظّف الغبار بلطف. تجنب الرطوبة والمطر والثقل الزائد. احفظه ممتلئاً للحفاظ على الشكل."
 },
 "packaging": {
 "fr": "Emballage YZA sobre, prêt pour cadeau ou retrait studio.",
 "en": "Minimal YZA packaging, ready for gifting or studio pickup.",
 "es": "Embalaje YZA minimalista, listo para regalo o recogida en el estudio.",
 "tr": "Sade YZA ambalajı, hediye veya stüdyodan teslim için hazır.",
 "ar": "تغليف YZA بسيط، جاهز للهدية أو الاستلام من الاستوديو."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz’de stüdyo teslimi mevcut.",
 "ar": "شحن مع تتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في قوليز."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "15 sacs par taille et couleur quand la serie est active; pas de restock garanti.",
 "en": "15 bags per size and colour when the batch is active; no guaranteed restock.",
 "es": "15 bolsos por talla y color cuando el lote está activo; sin reposición garantizada.",
 "tr": "Seri aktifken beden ve renk başına 15 çanta; garantili yeniden stok yok.",
 "ar": "15 حقيبة لكل حجم ولون عندما يكون الدفعة نشطة؛ لا إعادة تخزين مضمونة."
 },
 "edition": {
 "fr": "15 sacs par taille et couleur quand la serie est active; pas de restock garanti.",
 "en": "15 bags per size and colour when the batch is active; no guaranteed restock.",
 "es": "15 bolsos por talla y color cuando el lote está activo; sin reposición garantizada.",
 "tr": "Seri aktifken beden ve renk başına 15 çanta; garantili yeniden stok yok.",
 "ar": "15 حقيبة لكل حجم ولون عندما يكون الدفعة نشطة؛ لا إعادة تخزين مضمونة."
 },
 "badge": "limited",
 "hours": null,
 "giftable": false,
 "publicVisible": true,
 "sizeComparison": [
 {
 "label": {
 "fr": "XS / Bleu",
 "en": "XS / Blue",
 "es": "XS / Azul",
 "tr": "XS / Mavi",
 "ar": "XS / أزرق"
 },
 "price": 49000,
 "whatFits": {
 "fr": "Telephone, porte-cartes, cles, rouge a levres.",
 "en": "Phone, card holder, keys and lipstick.",
 "es": "Teléfono, tarjetero, llaves y pintalabios.",
 "tr": "Telefon, kart kılıfı, anahtarlar ve ruj.",
 "ar": "هاتف، حامل بطاقات، مفاتيح وأحمر شفاه."
 }
 },
 {
 "label": {
 "fr": "S / Rose",
 "en": "S / Pink",
 "es": "S / Rosa",
 "tr": "S / Pembe",
 "ar": "S / وردي"
 },
 "price": 60000,
 "whatFits": {
 "fr": "Telephone, portefeuille, lunettes, foulard fin et essentiels.",
 "en": "Phone, wallet, sunglasses, light scarf and essentials.",
 "es": "Teléfono, cartera, gafas de sol, fular ligero y esenciales.",
 "tr": "Telefon, cüzdan, güneş gözlüğü, ince fular ve temel eşyalar.",
 "ar": "هاتف، محفظة، نظارات شمسية، وشاح خفيف ومستلزمات أساسية."
 }
 },
 {
 "label": {
 "fr": "M / Bleu ciel",
 "en": "M / Sky blue",
 "es": "M / Azul cielo",
 "tr": "M / Gökyüzü mavisi",
 "ar": "M / أزرق سماوي"
 },
 "price": 66000,
 "whatFits": {
 "fr": "Essentiels + trousse, livre fin, foulard et petite pochette.",
 "en": "Essentials plus pouch, slim book, scarf and small clutch.",
 "es": "Esenciales más neceser, libro fino, fular y pequeño clutch.",
 "tr": "Temel eşyalar artı poşet, ince kitap, fular ve küçük el çantası.",
 "ar": "مستلزمات أساسية مع حقيبة صغيرة، كتاب رفيع، وشاح وحقيبة صغيرة."
 }
 }
 ],
 "crossSell": [
 "raffia-cherries-charm-ss26",
 "yza-pareo-skirt-short-jawhara-ss26",
 "yza-scarf-top-jawhara-ss26"
 ]
 },
 {
 "handle": "la-nouvelle-vague-s-basket-bag-ss26",
 "legacyHandles": [],
 "sku": null,
 "name": {
 "fr": "La Nouvelle Vague S - Rose",
 "en": "New Edition Bag S - Pink",
 "es": "New Edition Bag S - Pink",
 "tr": "New Edition Bag S - Pink",
 "ar": "New Edition Bag S - Pink"
 },
 "displayName": {
 "fr": "La Nouvelle Vague S - Rose",
 "en": "New Edition Bag S - Pink",
 "es": "New Edition Bag S - Pink",
 "tr": "New Edition Bag S - Pink",
 "ar": "New Edition Bag S - Pink"
 },
 "short": {
 "fr": "Format S, finition rose, feuilles de bananier, raphia, cuir et perles.",
 "en": "S scale, pink finish, banana leaves, raffia, leather and beads.",
 "es": "Talla S, acabado rosa, hojas de bananero, rafia, cuero y cuentas.",
 "tr": "S beden, pembe renk, muz yaprağı, rafya, deri ve boncuklar.",
 "ar": "حجم S، لون وردي، أوراق الموز، الرافيا، الجلد والخرز."
 },
 "displayShort": {
 "fr": "Format S, finition rose, feuilles de bananier, raphia, cuir et perles.",
 "en": "S scale, pink finish, banana leaves, raffia, leather and beads.",
 "es": "Talla S, acabado rosa, hojas de bananero, rafia, cuero y cuentas.",
 "tr": "S beden, pembe renk, muz yaprağı, rafya, deri ve boncuklar.",
 "ar": "حجم S، لون وردي، أوراق الموز، الرافيا، الجلد والخرز."
 },
 "desc": {
 "fr": "La Nouvelle Vague S - Rose: un panier YZA en feuilles de bananier, raphia, cuir et perles. Cette page montre uniquement la finition rose et le format S, pour comprendre la taille, la couleur et les details reels de la piece.",
 "en": "New Edition Bag S - Pink: a YZA basket in banana leaves, raffia, leather and beads. This page shows only the pink finish and S scale, so the size, colour and real details stay clear.",
 "es": "La Nouvelle Vague S - Rosa: una cesta YZA en hojas de bananero, rafia, cuero y cuentas. Esta página muestra únicamente el acabado rosa y la talla S, para que el tamaño, el color y los detalles reales queden claros.",
 "tr": "La Nouvelle Vague S - Pembe: muz yaprağı, rafya, deri ve boncuklardan yapılmış bir YZA sepeti. Bu sayfa yalnızca pembe rengi ve S bedeni gösterir; boyut, renk ve gerçek detaylar net kalır.",
 "ar": "La Nouvelle Vague S - وردي: سلة YZA من أوراق الموز والرافيا والجلد والخرز. تعرض هذه الصفحة فقط اللون الوردي وحجم S، ليظل الحجم واللون والتفاصيل الحقيقية واضحة."
 },
 "price": 60000,
 "currency": "MAD",
 "category": "bags",
 "sourceCategory": "Basket Bags",
 "categoryLabel": {
 "fr": "Paniers & sacs",
 "en": "Bags",
 "es": "Bolsos y cestas",
 "tr": "Çantalar ve sepetler",
 "ar": "حقائب وسلال"
 },
 "group": "bags",
 "collection": {
 "fr": "Paniers iconiques",
 "en": "Iconic basket bags",
 "es": "Iconic basket bags",
 "tr": "Iconic basket bags",
 "ar": "Iconic basket bags"
 },
 "season": "All Seasons 2026",
 "img": "assets/products/bag-nouvelle-vague-still-pink.webp",
 "gallery": [
 "assets/products/bag-nouvelle-vague-still-pink.webp",
 "assets/lookbook-ss26-27/embedded/p50_img01_xref1362_b250c91a59d1.jpeg"
 ],
 "familyHandle": "la-nouvelle-vague",
 "familyOrder": 2,
 "variantLabel": {
 "fr": "S / Rose",
 "en": "S / Pink",
 "es": "S / Rosa",
 "tr": "S / Pembe",
 "ar": "S / وردي"
 },
 "availableColors": [
 {
 "fr": "Rose",
 "en": "Pink",
 "es": "Rosa",
 "tr": "Pembe",
 "ar": "وردي"
 }
 ],
 "availableSizes": [
 "S"
 ],
 "variants": [
 {
 "product_handle": "la-nouvelle-vague-s-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Market",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": null,
 "size": "Moyen",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 22
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Basket bag",
 "La Nouvelle Vague",
 "Banana leaves",
 "Leather",
 "Beads",
 "Marrakech"
 ],
 "seoTitle": "La Nouvelle Vague S Basket Bag - Handmade in Marrakech",
 "seoKeywords": [
 "Guéliz",
 "Guéliz",
 "Iconic Basket Bags",
 "La Nouvelle Vague S",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "bag",
 "bags",
 "basket",
 "bolsa",
 "canta",
 "crochet",
 "fait main",
 "fits",
 "handmade",
 "la-nouvelle-vague-s-basket-bag-ss26",
 "m",
 "panier",
 "s",
 "sac",
 "what",
 "xs",
 "حقيبة",
 "La Nouvelle Vague",
 "New Edition Bag",
 "S",
 "Rose",
 "Pink",
 "La Nouvelle Vague S",
 "New Edition Bag S"
 ],
 "languageSearchTerms": [
 "Guéliz",
 "Guéliz",
 "Iconic Basket Bags",
 "La Nouvelle Vague S",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "bag",
 "bags",
 "basket",
 "bolsa",
 "canta",
 "crochet",
 "fait main",
 "fits",
 "handmade",
 "la-nouvelle-vague-s-basket-bag-ss26",
 "m",
 "panier",
 "s",
 "sac",
 "what",
 "xs",
 "حقيبة",
 "La Nouvelle Vague",
 "New Edition Bag",
 "S",
 "Rose",
 "Pink",
 "La Nouvelle Vague S",
 "New Edition Bag S"
 ],
 "material": {
 "fr": "Feuilles de bananier, Cuir, Perles",
 "en": "Banana leaves, Leather, Beads",
 "es": "Hojas de bananero, Cuero, Cuentas",
 "tr": "Muz yaprağı, Deri, Boncuklar",
 "ar": "أوراق الموز، الجلد، الخرز"
 },
 "fabric": {
 "fr": "Banana leaves, leather & beads; 3 sizes x 3 colors",
 "en": "Banana leaves, leather & beads; 3 sizes x 3 colors",
 "es": "Hojas de bananero, cuero y cuentas; 3 tallas x 3 colores",
 "tr": "Muz yaprağı, deri ve boncuklar; 3 beden x 3 renk",
 "ar": "أوراق الموز والجلد والخرز؛ 3 أحجام × 3 ألوان"
 },
 "color": {
 "fr": "Rose",
 "en": "Pink",
 "es": "Rosa",
 "tr": "Pembe",
 "ar": "وردي"
 },
 "size": {
 "fr": "S",
 "en": "S",
 "es": "S",
 "tr": "S",
 "ar": "S"
 },
 "visualSize": "S",
 "visualColor": {
 "fr": "Rose",
 "en": "Pink",
 "es": "Rosa",
 "tr": "Pembe",
 "ar": "وردي"
 },
 "bagFamilyTitle": {
 "fr": "La Nouvelle Vague",
 "en": "New Edition Bag",
 "es": "New Edition Bag",
 "tr": "New Edition Bag",
 "ar": "New Edition Bag"
 },
 "bagFamilyEyebrow": {
 "fr": "New edition bag",
 "en": "New edition bag",
 "es": "Nueva edición",
 "tr": "Yeni koleksiyon çantası",
 "ar": "حقيبة إصدار جديد"
 },
 "bagFamilyText": {
 "fr": "La ligne plus souple et solaire: anses bijou, foulard et formats faciles a porter en ville ou en vacances.",
 "en": "The softer sunlit line: beaded handles, scarf styling and easy scales for city days or holidays.",
 "es": "La línea más suave y luminosa: asas con cuentas, estilo con fular y formatos fáciles para la ciudad o las vacaciones.",
 "tr": "Daha yumuşak ve güneşli çizgi: boncuklu saplar, fular stili ve şehir günleri veya tatil için kolay bedenler.",
 "ar": "الخط الأكثر نعومة وإشراقاً: مقابض خرزية، تنسيق مع وشاح وأحجام سهلة لأيام المدينة أو العطلات."
 },
 "bagFamilyOrder": 2,
 "dimensions": {
 "fr": "Format S: panier journee compact.",
 "en": "S scale: compact day basket.",
 "es": "Talla S: cesta de día compacta.",
 "tr": "S beden: kompakt günlük sepet.",
 "ar": "حجم S: سلة يومية مضغوطة."
 },
 "whatFits": {
 "fr": "Telephone, portefeuille, lunettes, foulard fin et essentiels.",
 "en": "Phone, wallet, sunglasses, light scarf and essentials.",
 "es": "Teléfono, cartera, gafas de sol, fular ligero y esenciales.",
 "tr": "Telefon, cüzdan, güneş gözlüğü, ince fular ve temel eşyalar.",
 "ar": "هاتف، محفظة، نظارات شمسية، وشاح خفيف ومستلزمات أساسية."
 },
 "attachment": null,
 "handworkTime": {
 "fr": "Assemblage main: tressage, gaine des anses, perlage et controle final.",
 "en": "Hand assembly: weaving, handle wrapping, beadwork and final check.",
 "es": "Ensamblaje manual: tejido, forrado de asas, abalorios y revisión final.",
 "tr": "El montajı: dokuma, sap kaplama, boncuk işi ve son kontrol.",
 "ar": "تجميع يدوي: نسيج، تغليف المقابض، أعمال الخرز والفحص النهائي."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Structure tressee, anses gainees, perles et finitions verifiees piece par piece dans l atelier de Guéliz.",
 "en": "Woven structure, wrapped handles, beadwork and finishing checked piece by piece in the Guéliz atelier.",
 "es": "Estructura tejida, asas forradas, cuentas y acabados revisados pieza a pieza en el atelier de Guéliz.",
 "tr": "Dokuma yapı, kaplı saplar, boncuk işi ve bitişler Guéliz atelyesinde parça parça kontrol edildi.",
 "ar": "هيكل منسوج، مقابض مغطاة، خرز وتشطيبات مفحوصة قطعة بقطعة في أتيليه قوليز."
 },
 "care": {
 "fr": "Depoussierer doucement. Eviter l humidite, la pluie et le poids excessif. Ranger rempli pour garder la forme.",
 "en": "Dust gently. Avoid humidity, rain and excessive weight. Store filled to keep the shape.",
 "es": "Quitar el polvo con suavidad. Evitar la humedad, la lluvia y el peso excesivo. Guardar relleno para mantener la forma.",
 "tr": "Nazikçe tozunu alın. Nem, yağmur ve aşırı ağırlıktan kaçının. Şeklini korumak için dolu saklayın.",
 "ar": "نظّف الغبار بلطف. تجنب الرطوبة والمطر والثقل الزائد. احفظه ممتلئاً للحفاظ على الشكل."
 },
 "packaging": {
 "fr": "Emballage YZA sobre, prêt pour cadeau ou retrait studio.",
 "en": "Minimal YZA packaging, ready for gifting or studio pickup.",
 "es": "Embalaje YZA minimalista, listo para regalo o recogida en el estudio.",
 "tr": "Sade YZA ambalajı, hediye veya stüdyodan teslim için hazır.",
 "ar": "تغليف YZA بسيط، جاهز للهدية أو الاستلام من الاستوديو."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz’de stüdyo teslimi mevcut.",
 "ar": "شحن مع تتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في قوليز."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "15 sacs par taille et couleur quand la serie est active; pas de restock garanti.",
 "en": "15 bags per size and colour when the batch is active; no guaranteed restock.",
 "es": "15 bolsos por talla y color cuando el lote está activo; sin reposición garantizada.",
 "tr": "Seri aktifken beden ve renk başına 15 çanta; garantili yeniden stok yok.",
 "ar": "15 حقيبة لكل حجم ولون عندما يكون الدفعة نشطة؛ لا إعادة تخزين مضمونة."
 },
 "edition": {
 "fr": "15 sacs par taille et couleur quand la serie est active; pas de restock garanti.",
 "en": "15 bags per size and colour when the batch is active; no guaranteed restock.",
 "es": "15 bolsos por talla y color cuando el lote está activo; sin reposición garantizada.",
 "tr": "Seri aktifken beden ve renk başına 15 çanta; garantili yeniden stok yok.",
 "ar": "15 حقيبة لكل حجم ولون عندما يكون الدفعة نشطة؛ لا إعادة تخزين مضمونة."
 },
 "badge": "limited",
 "hours": null,
 "giftable": false,
 "publicVisible": true,
 "sizeComparison": [
 {
 "label": {
 "fr": "XS / Bleu",
 "en": "XS / Blue",
 "es": "XS / Azul",
 "tr": "XS / Mavi",
 "ar": "XS / أزرق"
 },
 "price": 49000,
 "whatFits": {
 "fr": "Telephone, porte-cartes, cles, rouge a levres.",
 "en": "Phone, card holder, keys and lipstick.",
 "es": "Teléfono, tarjetero, llaves y pintalabios.",
 "tr": "Telefon, kart kılıfı, anahtarlar ve ruj.",
 "ar": "هاتف، حامل بطاقات، مفاتيح وأحمر شفاه."
 }
 },
 {
 "label": {
 "fr": "S / Rose",
 "en": "S / Pink",
 "es": "S / Rosa",
 "tr": "S / Pembe",
 "ar": "S / وردي"
 },
 "price": 60000,
 "whatFits": {
 "fr": "Telephone, portefeuille, lunettes, foulard fin et essentiels.",
 "en": "Phone, wallet, sunglasses, light scarf and essentials.",
 "es": "Teléfono, cartera, gafas de sol, fular ligero y esenciales.",
 "tr": "Telefon, cüzdan, güneş gözlüğü, ince fular ve temel eşyalar.",
 "ar": "هاتف، محفظة، نظارات شمسية، وشاح خفيف ومستلزمات أساسية."
 }
 },
 {
 "label": {
 "fr": "M / Bleu ciel",
 "en": "M / Sky blue",
 "es": "M / Azul cielo",
 "tr": "M / Gökyüzü mavisi",
 "ar": "M / أزرق سماوي"
 },
 "price": 66000,
 "whatFits": {
 "fr": "Essentiels + trousse, livre fin, foulard et petite pochette.",
 "en": "Essentials plus pouch, slim book, scarf and small clutch.",
 "es": "Esenciales más neceser, libro fino, fular y pequeño clutch.",
 "tr": "Temel eşyalar artı poşet, ince kitap, fular ve küçük el çantası.",
 "ar": "مستلزمات أساسية مع حقيبة صغيرة، كتاب رفيع، وشاح وحقيبة صغيرة."
 }
 }
 ],
 "crossSell": [
 "raffia-cherries-charm-ss26",
 "yza-pareo-skirt-short-jawhara-ss26",
 "yza-scarf-top-jawhara-ss26"
 ]
 },
 {
 "handle": "la-nouvelle-vague-m-basket-bag-ss26",
 "fewLeft": true,
 "legacyHandles": [],
 "sku": null,
 "name": {
 "fr": "La Nouvelle Vague M - Bleu ciel",
 "en": "New Edition Bag M - Sky blue",
 "es": "New Edition Bag M - Sky blue",
 "tr": "New Edition Bag M - Sky blue",
 "ar": "New Edition Bag M - Sky blue"
 },
 "displayName": {
 "fr": "La Nouvelle Vague M - Bleu ciel",
 "en": "New Edition Bag M - Sky blue",
 "es": "New Edition Bag M - Sky blue",
 "tr": "New Edition Bag M - Sky blue",
 "ar": "New Edition Bag M - Sky blue"
 },
 "short": {
 "fr": "Format M, couleur bleu ciel, feuilles de bananier, raphia, cuir et perles.",
 "en": "M scale, sky blue finish, banana leaves, raffia, leather and beads.",
 "es": "Talla M, acabado azul cielo, hojas de bananero, rafia, cuero y cuentas.",
 "tr": "M beden, gökyüzü mavisi renk, muz yaprağı, rafya, deri ve boncuklar.",
 "ar": "حجم M، لون أزرق سماوي، أوراق الموز، الرافيا، الجلد والخرز."
 },
 "displayShort": {
 "fr": "Format M, couleur bleu ciel, feuilles de bananier, raphia, cuir et perles.",
 "en": "M scale, sky blue finish, banana leaves, raffia, leather and beads.",
 "es": "Talla M, acabado azul cielo, hojas de bananero, rafia, cuero y cuentas.",
 "tr": "M beden, gökyüzü mavisi renk, muz yaprağı, rafya, deri ve boncuklar.",
 "ar": "حجم M، لون أزرق سماوي، أوراق الموز، الرافيا، الجلد والخرز."
 },
 "desc": {
 "fr": "La Nouvelle Vague M - Bleu ciel: un panier YZA en feuilles de bananier, raphia, cuir et perles. Cette page montre uniquement la couleur bleu ciel et le format M, pour comprendre la taille, la couleur et les details reels de la piece.",
 "en": "New Edition Bag M - Sky blue: a YZA basket in banana leaves, raffia, leather and beads. This page shows only the sky blue finish and M scale, so the size, colour and real details stay clear.",
 "es": "La Nouvelle Vague M - Azul cielo: una cesta YZA en hojas de bananero, rafia, cuero y cuentas. Esta página muestra únicamente el acabado azul cielo y la talla M, para que el tamaño, el color y los detalles reales queden claros.",
 "tr": "La Nouvelle Vague M - Gökyüzü mavisi: muz yaprağı, rafya, deri ve boncuklardan yapılmış bir YZA sepeti. Bu sayfa yalnızca gökyüzü mavisi rengi ve M bedeni gösterir; boyut, renk ve gerçek detaylar net kalır.",
 "ar": "La Nouvelle Vague M - أزرق سماوي: سلة YZA من أوراق الموز والرافيا والجلد والخرز. تعرض هذه الصفحة فقط اللون الأزرق السماوي وحجم M، ليظل الحجم واللون والتفاصيل الحقيقية واضحة."
 },
 "price": 66000,
 "currency": "MAD",
 "category": "bags",
 "sourceCategory": "Basket Bags",
 "categoryLabel": {
 "fr": "Paniers & sacs",
 "en": "Bags",
 "es": "Bolsos y cestas",
 "tr": "Çantalar ve sepetler",
 "ar": "حقائب وسلال"
 },
 "group": "bags",
 "collection": {
 "fr": "Paniers iconiques",
 "en": "Iconic basket bags",
 "es": "Iconic basket bags",
 "tr": "Iconic basket bags",
 "ar": "Iconic basket bags"
 },
 "season": "All Seasons 2026",
 "img": "assets/products/bag-nouvelle-vague-still-2.webp",
 "gallery": [
 "assets/products/bag-nouvelle-vague-still-2.webp",
 "assets/lookbook-ss26-27/embedded/p50_img01_xref1362_b250c91a59d1.jpeg"
 ],
 "familyHandle": "la-nouvelle-vague",
 "familyOrder": 3,
 "variantLabel": {
 "fr": "M / Bleu ciel",
 "en": "M / Sky blue",
 "es": "M / Azul cielo",
 "tr": "M / Gökyüzü mavisi",
 "ar": "M / أزرق سماوي"
 },
 "availableColors": [
 {
 "fr": "Bleu ciel",
 "en": "Sky blue",
 "es": "Azul cielo",
 "tr": "Gökyüzü mavisi",
 "ar": "أزرق سماوي"
 }
 ],
 "availableSizes": [
 "M"
 ],
 "variants": [
 {
 "product_handle": "la-nouvelle-vague-m-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Market",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": null,
 "size": "Grand",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 23
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Basket bag",
 "La Nouvelle Vague",
 "Banana leaves",
 "Leather",
 "Beads",
 "Marrakech"
 ],
 "seoTitle": "La Nouvelle Vague M Basket Bag - Handmade in Marrakech",
 "seoKeywords": [
 "Guéliz",
 "Guéliz",
 "Iconic Basket Bags",
 "La Nouvelle Vague M",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "bag",
 "bags",
 "basket",
 "bolsa",
 "canta",
 "crochet",
 "fait main",
 "fits",
 "handmade",
 "la-nouvelle-vague-m-basket-bag-ss26",
 "m",
 "panier",
 "s",
 "sac",
 "what",
 "xs",
 "حقيبة",
 "La Nouvelle Vague",
 "New Edition Bag",
 "M",
 "Bleu ciel",
 "Sky blue",
 "La Nouvelle Vague M",
 "New Edition Bag M"
 ],
 "languageSearchTerms": [
 "Guéliz",
 "Guéliz",
 "Iconic Basket Bags",
 "La Nouvelle Vague M",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "bag",
 "bags",
 "basket",
 "bolsa",
 "canta",
 "crochet",
 "fait main",
 "fits",
 "handmade",
 "la-nouvelle-vague-m-basket-bag-ss26",
 "m",
 "panier",
 "s",
 "sac",
 "what",
 "xs",
 "حقيبة",
 "La Nouvelle Vague",
 "New Edition Bag",
 "M",
 "Bleu ciel",
 "Sky blue",
 "La Nouvelle Vague M",
 "New Edition Bag M"
 ],
 "material": {
 "fr": "Feuilles de bananier, Cuir, Perles",
 "en": "Banana leaves, Leather, Beads",
 "es": "Hojas de bananero, Cuero, Cuentas",
 "tr": "Muz yaprağı, Deri, Boncuklar",
 "ar": "أوراق الموز، الجلد، الخرز"
 },
 "fabric": {
 "fr": "Banana leaves, leather & beads; 3 sizes x 3 colors",
 "en": "Banana leaves, leather & beads; 3 sizes x 3 colors",
 "es": "Hojas de bananero, cuero y cuentas; 3 tallas x 3 colores",
 "tr": "Muz yaprağı, deri ve boncuklar; 3 beden x 3 renk",
 "ar": "أوراق الموز والجلد والخرز؛ 3 أحجام × 3 ألوان"
 },
 "color": {
 "fr": "Bleu ciel",
 "en": "Sky blue",
 "es": "Azul cielo",
 "tr": "Gökyüzü mavisi",
 "ar": "أزرق سماوي"
 },
 "size": {
 "fr": "M",
 "en": "M",
 "es": "M",
 "tr": "M",
 "ar": "M"
 },
 "visualSize": "M",
 "visualColor": {
 "fr": "Bleu ciel",
 "en": "Sky blue",
 "es": "Azul cielo",
 "tr": "Gökyüzü mavisi",
 "ar": "أزرق سماوي"
 },
 "bagFamilyTitle": {
 "fr": "La Nouvelle Vague",
 "en": "New Edition Bag",
 "es": "New Edition Bag",
 "tr": "New Edition Bag",
 "ar": "New Edition Bag"
 },
 "bagFamilyEyebrow": {
 "fr": "New edition bag",
 "en": "New edition bag",
 "es": "Nueva edición",
 "tr": "Yeni koleksiyon çantası",
 "ar": "حقيبة إصدار جديد"
 },
 "bagFamilyText": {
 "fr": "La ligne plus souple et solaire: anses bijou, foulard et formats faciles a porter en ville ou en vacances.",
 "en": "The softer sunlit line: beaded handles, scarf styling and easy scales for city days or holidays.",
 "es": "La línea más suave y luminosa: asas con cuentas, estilo con fular y formatos fáciles para la ciudad o las vacaciones.",
 "tr": "Daha yumuşak ve güneşli çizgi: boncuklu saplar, fular stili ve şehir günleri veya tatil için kolay bedenler.",
 "ar": "الخط الأكثر نعومة وإشراقاً: مقابض خرزية، تنسيق مع وشاح وأحجام سهلة لأيام المدينة أو العطلات."
 },
 "bagFamilyOrder": 2,
 "dimensions": {
 "fr": "Format M: panier statement avec plus de volume.",
 "en": "M scale: statement basket with more volume.",
 "es": "Talla M: cesta statement con más volumen.",
 "tr": "M beden: daha fazla hacimli statement sepet.",
 "ar": "حجم M: سلة statement بحجم أكبر."
 },
 "whatFits": {
 "fr": "Essentiels + trousse, livre fin, foulard et petite pochette.",
 "en": "Essentials plus pouch, slim book, scarf and small clutch.",
 "es": "Esenciales más neceser, libro fino, fular y pequeño clutch.",
 "tr": "Temel eşyalar artı poşet, ince kitap, fular ve küçük el çantası.",
 "ar": "مستلزمات أساسية مع حقيبة صغيرة، كتاب رفيع، وشاح وحقيبة صغيرة."
 },
 "attachment": null,
 "handworkTime": {
 "fr": "Assemblage main: tressage, gaine des anses, perlage et controle final.",
 "en": "Hand assembly: weaving, handle wrapping, beadwork and final check.",
 "es": "Ensamblaje manual: tejido, forrado de asas, abalorios y revisión final.",
 "tr": "El montajı: dokuma, sap kaplama, boncuk işi ve son kontrol.",
 "ar": "تجميع يدوي: نسيج، تغليف المقابض، أعمال الخرز والفحص النهائي."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Structure tressee, anses gainees, perles et finitions verifiees piece par piece dans l atelier de Guéliz.",
 "en": "Woven structure, wrapped handles, beadwork and finishing checked piece by piece in the Guéliz atelier.",
 "es": "Estructura tejida, asas forradas, cuentas y acabados revisados pieza a pieza en el atelier de Guéliz.",
 "tr": "Dokuma yapı, kaplı saplar, boncuk işi ve bitişler Guéliz atelyesinde parça parça kontrol edildi.",
 "ar": "هيكل منسوج، مقابض مغطاة، خرز وتشطيبات مفحوصة قطعة بقطعة في أتيليه قوليز."
 },
 "care": {
 "fr": "Depoussierer doucement. Eviter l humidite, la pluie et le poids excessif. Ranger rempli pour garder la forme.",
 "en": "Dust gently. Avoid humidity, rain and excessive weight. Store filled to keep the shape.",
 "es": "Quitar el polvo con suavidad. Evitar la humedad, la lluvia y el peso excesivo. Guardar relleno para mantener la forma.",
 "tr": "Nazikçe tozunu alın. Nem, yağmur ve aşırı ağırlıktan kaçının. Şeklini korumak için dolu saklayın.",
 "ar": "نظّف الغبار بلطف. تجنب الرطوبة والمطر والثقل الزائد. احفظه ممتلئاً للحفاظ على الشكل."
 },
 "packaging": {
 "fr": "Emballage YZA sobre, prêt pour cadeau ou retrait studio.",
 "en": "Minimal YZA packaging, ready for gifting or studio pickup.",
 "es": "Embalaje YZA minimalista, listo para regalo o recogida en el estudio.",
 "tr": "Sade YZA ambalajı, hediye veya stüdyodan teslim için hazır.",
 "ar": "تغليف YZA بسيط، جاهز للهدية أو الاستلام من الاستوديو."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz’de stüdyo teslimi mevcut.",
 "ar": "شحن مع تتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في قوليز."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "15 sacs par taille et couleur quand la serie est active; pas de restock garanti.",
 "en": "15 bags per size and colour when the batch is active; no guaranteed restock.",
 "es": "15 bolsos por talla y color cuando el lote está activo; sin reposición garantizada.",
 "tr": "Seri aktifken beden ve renk başına 15 çanta; garantili yeniden stok yok.",
 "ar": "15 حقيبة لكل حجم ولون عندما يكون الدفعة نشطة؛ لا إعادة تخزين مضمونة."
 },
 "edition": {
 "fr": "15 sacs par taille et couleur quand la serie est active; pas de restock garanti.",
 "en": "15 bags per size and colour when the batch is active; no guaranteed restock.",
 "es": "15 bolsos por talla y color cuando el lote está activo; sin reposición garantizada.",
 "tr": "Seri aktifken beden ve renk başına 15 çanta; garantili yeniden stok yok.",
 "ar": "15 حقيبة لكل حجم ولون عندما يكون الدفعة نشطة؛ لا إعادة تخزين مضمونة."
 },
 "badge": "limited",
 "hours": null,
 "giftable": false,
 "publicVisible": true,
 "sizeComparison": [
 {
 "label": {
 "fr": "XS / Bleu",
 "en": "XS / Blue",
 "es": "XS / Azul",
 "tr": "XS / Mavi",
 "ar": "XS / أزرق"
 },
 "price": 49000,
 "whatFits": {
 "fr": "Telephone, porte-cartes, cles, rouge a levres.",
 "en": "Phone, card holder, keys and lipstick.",
 "es": "Teléfono, tarjetero, llaves y pintalabios.",
 "tr": "Telefon, kart kılıfı, anahtarlar ve ruj.",
 "ar": "هاتف، حامل بطاقات، مفاتيح وأحمر شفاه."
 }
 },
 {
 "label": {
 "fr": "S / Rose",
 "en": "S / Pink",
 "es": "S / Rosa",
 "tr": "S / Pembe",
 "ar": "S / وردي"
 },
 "price": 60000,
 "whatFits": {
 "fr": "Telephone, portefeuille, lunettes, foulard fin et essentiels.",
 "en": "Phone, wallet, sunglasses, light scarf and essentials.",
 "es": "Teléfono, cartera, gafas de sol, fular ligero y esenciales.",
 "tr": "Telefon, cüzdan, güneş gözlüğü, ince fular ve temel eşyalar.",
 "ar": "هاتف، محفظة، نظارات شمسية، وشاح خفيف ومستلزمات أساسية."
 }
 },
 {
 "label": {
 "fr": "M / Bleu ciel",
 "en": "M / Sky blue",
 "es": "M / Azul cielo",
 "tr": "M / Gökyüzü mavisi",
 "ar": "M / أزرق سماوي"
 },
 "price": 66000,
 "whatFits": {
 "fr": "Essentiels + trousse, livre fin, foulard et petite pochette.",
 "en": "Essentials plus pouch, slim book, scarf and small clutch.",
 "es": "Esenciales más neceser, libro fino, fular y pequeño clutch.",
 "tr": "Temel eşyalar artı poşet, ince kitap, fular ve küçük el çantası.",
 "ar": "مستلزمات أساسية مع حقيبة صغيرة، كتاب رفيع، وشاح وحقيبة صغيرة."
 }
 }
 ],
 "crossSell": [
 "raffia-cherries-charm-ss26",
 "yza-pareo-skirt-short-jawhara-ss26",
 "yza-scarf-top-jawhara-ss26"
 ]
 },
 {
 "handle": "raffia-cherries-charm-ss26",
 "fewLeft": true,
 "legacyHandles": [
 "cerises"
 ],
 "sku": null,
 "name": {
 "fr": "Charm cerises en raphia",
 "en": "Raffia Cherries Charm",
 "es": "Raffia Cherries Charm",
 "tr": "Raffia Cherries Charm",
 "ar": "Raffia Cherries Charm"
 },
 "displayName": {
 "fr": "Charm cerises en raphia",
 "en": "Raffia Cherries Charm",
 "es": "Raffia Cherries Charm",
 "tr": "Raffia Cherries Charm",
 "ar": "Raffia Cherries Charm"
 },
 "short": {
 "fr": "Charm cerises en raphia crocheté main selon l’aakad, la technique des boutons de caftan. Boucle raffia et anneau doré 2 cm.",
 "en": "Raffia cherries charm, hand-crocheted with the aakad — the Moroccan caftan-button technique. Raffia loop and 2 cm gold ring.",
 "es": "Charm de cerezas en rafia, tejido a mano con la técnica aakad de los botones del caftán marroquí. Lazo de rafia y aro dorado de 2 cm.",
 "tr": "Fas kaftan düğmesi tekniği aakad ile elde tığ işlenmiş rafya kiraz charm’ı. Rafya halka ve 2 cm altın halka.",
 "ar": "ميدالية كرز من الرافيا، مصنوعة يدويًا بتقنية العقاد — أزرار القفطان المغربي. حلقة رافيا وحلقة ذهبية 2 سم."
 },
 "displayShort": {
 "fr": "Charm cerises en raphia crocheté main selon l’aakad, la technique des boutons de caftan. Boucle raffia et anneau doré 2 cm.",
 "en": "Raffia cherries charm, hand-crocheted with the aakad — the Moroccan caftan-button technique. Raffia loop and 2 cm gold ring.",
 "es": "Charm de cerezas en rafia, tejido a mano con la técnica aakad de los botones del caftán marroquí. Lazo de rafia y aro dorado de 2 cm.",
 "tr": "Fas kaftan düğmesi tekniği aakad ile elde tığ işlenmiş rafya kiraz charm’ı. Rafya halka ve 2 cm altın halka.",
 "ar": "ميدالية كرز من الرافيا، مصنوعة يدويًا بتقنية العقاد — أزرار القفطان المغربي. حلقة رافيا وحلقة ذهبية 2 سم."
 },
 "desc": {
 "fr": "Deux cerises qui ne sont jamais tout à fait jumelles, reliées par une tige nouée à la main. On les fait à l’aakad, la technique des boutons de caftan — dont la forme s’inspire justement de la cerise, et qui vient de Sefrou, la ville qui célèbre la cerise chaque année. Légères, joueuses, un peu romantiques : parfaites sur un mini sac, une pochette ou un porte-clés.",
 "en": "Two cherries that are never quite twins, joined by a hand-knotted stem. We make them with the aakad, the Moroccan caftan-button technique — whose shape is itself inspired by the cherry, and which comes from Sefrou, the town that celebrates cherries every year. Light, playful, a little romantic: perfect on a mini bag, a clutch or your keys.",
 "es": "Dos cerezas que nunca son del todo gemelas, unidas por un tallo anudado a mano. Las hacemos con el aakad, la técnica de los botones del caftán marroquí, cuya forma se inspira precisamente en la cereza y que proviene de Sefrou, la ciudad que celebra la cereza cada año. Ligeras, traviesas, un poco románticas: perfectas en un mini bolso, un clutch o el llavero.",
 "tr": "Hiçbir zaman tam ikiz olmayan, elde düğümlenmiş bir sapla birleştirilmiş iki kiraz. Onları aakad ile yapıyoruz — biçimi kirazdan ilham alan ve her yıl kiraz festivali düzenleyen Sefrou şehrinden gelen Fas kaftan düğmesi tekniği. Hafif, oyuncu, biraz romantik: mini çantada, clutch'ta ya da anahtarlıkta mükemmel.",
 "ar": "كرزتان لا تتطابقان تمامًا أبدًا، تربطهما ساق معقودة يدويًا. نصنعهما بتقنية العقاد — تقنية أزرار القفطان المغربي التي يُستوحى شكلها من الكرزة نفسها، والتي تأتي من مدينة صفرو التي تحتفل بالكرز كل عام. خفيفتان ومرحتان وبلمسة رومانسية: مثاليتان على حقيبة صغيرة أو clutch أو مفاتيحك."
 },
 "price": 10000,
 "currency": "MAD",
 "category": "charms",
 "sourceCategory": "Fruit Charms",
 "categoryLabel": {
 "fr": "Charms",
 "en": "Charms",
 "es": "Complementos",
 "tr": "Charmlar",
 "ar": "تعليقات الحقيبة"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/original-shop/charms/raffia-cherries-charm-ss26-01.png",
 "gallery": [
 "assets/original-shop/charms/raffia-cherries-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-cherries-charm-ss26-02.webp",
 "assets/original-shop/charms/raffia-cherries-charm-ss26-03.jpg",
 "assets/original-shop/charms/raffia-cherries-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-cherries-charm-ss26-08.jpg",
 "assets/original-shop/charms/raffia-cherries-charm-ss26-10.webp",
 "assets/products/accessories-clean/cherries-accessory-clean.png",
 "assets/lookbook-ss26-27/embedded/p58_img02_xref1416_b7482fc1dffb.jpeg",
 "assets/lookbook-ss26-27/embedded/p59_img01_xref1426_ab1030bf5e96.jpeg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-58.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-59.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-60.jpg"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "raffia-cherries-charm-ss26",
 "sku": null,
 "category": "CHARM",
 "source_type": "cerises",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 13
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit charm",
 "Cherries",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Raffia Cherries Charm - Handmade Fruit Charm in Marrakech",
 "seoKeywords": [
 "Accessories",
 "Charm cerises en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Cherries Charm",
 "YZA",
 "accessories",
 "bag",
 "cadeau",
 "cereza",
 "cerise",
 "cerises",
 "charm",
 "charms",
 "cherries",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "handmade",
 "porte",
 "raffia-cherries-charm-ss26",
 "كرز"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Charm cerises en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Cherries Charm",
 "YZA",
 "accessories",
 "bag",
 "cadeau",
 "cereza",
 "cerise",
 "cerises",
 "charm",
 "charms",
 "cherries",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "handmade",
 "porte",
 "raffia-cherries-charm-ss26",
 "كرز"
 ],
 "material": {
 "fr": "raphia crochete main et aiguille raffia",
 "en": "hand-crocheted and needle-crocheted raffia",
 "es": "rafia tejida a mano con ganchillo y aguja",
 "tr": "el örgüsü ve iğne örgüsü rafya",
 "ar": "رافيا مصنوعة بالكروشيه اليدوي والإبرة"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Solo rafia — tejida a ganchillo",
 "tr": "Yalnızca rafya — kroşe",
 "ar": "رافيا فقط — مصنوعة بالكروشيه"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Environ 8 cm (chaque piece peut legerement varier).",
 "en": "Approx. 8 cm (each piece may vary slightly).",
 "es": "Aprox. 8 cm (cada pieza puede variar ligeramente).",
 "tr": "Yaklaşık 8 cm (her parça hafifçe farklılık gösterebilir).",
 "ar": "حوالي 8 سم (قد تختلف كل قطعة قليلاً)."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Boucle en raffia et anneau doré 2 cm. Anneau de 3 cm disponible pour les bundles.",
 "en": "Raffia loop and 2 cm gold ring. 3 cm ring available for bundles.",
 "es": "Lazo de rafia y aro dorado de 2 cm. Aro de 3 cm disponible para los bundles.",
 "tr": "Rafya halka ve 2 cm altın halka. Bundle'lar için 3 cm halka mevcut.",
 "ar": "حلقة رافيا وحلقة ذهبية 2 سم. تتوفر حلقة 3 سم للحزم."
 },
 "handworkTime": {
 "fr": "1,5 h de crochet main pour ce fruit.",
 "en": "1.5 hours of hand crochet for this fruit.",
 "es": "1,5 horas de crochet a mano para esta fruta.",
 "tr": "Bu meyve için 1,5 saat el kroşesi.",
 "ar": "1.5 ساعة كروشيه يدوي لهذه الفاكهة."
 },
 "howToWear": {
 "title": {
 "fr": "Comment le porter",
 "en": "How to wear it",
 "es": "Cómo llevarlo",
 "tr": "Nasıl kullanılır",
 "ar": "كيف تلبسينه"
 },
 "intro": {
 "fr": "Utilisez ce Fruit Charm sur:",
 "en": "Use this Fruit Charm on:",
 "es": "Úsalo en:",
 "tr": "Bu Meyve Charm'ı şunlara takın:",
 "ar": "استخدمي هذا الميدالية الفاكهة على:"
 },
 "items": [
 {
 "fr": "Les sacs YZA, La Vague et autres paniers de la marque.",
 "en": "YZA bags, La Vague and other YZA baskets.",
 "es": "Bolsos YZA, La Vague y otros cestos de la marca.",
 "tr": "YZA çantaları, La Vague ve diğer YZA sepetleri.",
 "ar": "حقائب YZA، La Vague وسلال YZA الأخرى."
 },
 {
 "fr": "Vos sacs en cuir pour ajouter une touche de personnalité et de couleur.",
 "en": "Leather bags to add personality and colour.",
 "es": "Bolsos de piel para añadir personalidad y color.",
 "tr": "Kişilik ve renk katmak için deri çantalar.",
 "ar": "الحقائب الجلدية لإضافة شخصية ولون."
 },
 {
 "fr": "Paniers en paille, market totes et sacs de plage.",
 "en": "Straw baskets, market totes and beach bags.",
 "es": "Cestos de paja, bolsas de mercado y bolsas de playa.",
 "tr": "Hasır sepetler, alışveriş çantaları ve plaj çantaları.",
 "ar": "السلال القشية، وحقائب السوق، وحقائب الشاطئ."
 },
 {
 "fr": "Clés, porte-clés et pochettes.",
 "en": "Keys, keychains and pouches.",
 "es": "Llaves, llaveros y bolsillos.",
 "tr": "Anahtarlar, anahtarlıklar ve kılıflar.",
 "ar": "المفاتيح والمفاتيح وحافظات المفاتيح."
 }
 ],
 "styleTip": {
 "fr": "Parfaites sur un mini sac, du cuir noir, des clés ou une pochette de soirée. Portez-les seules pour garder le mouvement net.",
 "en": "Best on mini bags, black leather, keys and evening clutches. Keep them alone so the movement stays clean.",
 "es": "Mejor en mini bolsos, cuero negro, llaves y clutches de noche. Llévalo solo para que el movimiento sea limpio.",
 "tr": "Mini çantalar, siyah deri, anahtarlar ve gece clutch'larında en iyisi. Hareketi temiz tutmak için yalnız bırakın.",
 "ar": "الأفضل على الحقائب الصغيرة والجلد الأسود والمفاتيح وحقائب السهرة. احتفظ به وحده ليظل الحركة نظيفة."
 },
 "note": {
 "fr": "Chaque charm vient avec une petite boucle. L anneau dore est inclus dans les bundles et peut etre ajoute au studio pour un charm seul.",
 "en": "Every charm comes with a small loop. The gold ring is included with bundles and can be added in studio for single charms.",
 "es": "Cada charm incluye un lazo pequeño. El aro dorado viene incluido en los bundles y puede añadirse en el estudio para charms individuales.",
 "tr": "Her charm küçük bir halkayla birlikte gelir. Altın halka bundle'lara dahildir; tek charmlar için stüdyoda eklenebilir.",
 "ar": "كل ميدالية تأتي مع حلقة صغيرة. الحلقة الذهبية مشمولة في الحزم ويمكن إضافتها في الأستوديو للميداليات المفردة."
 }
 },
 "fruitStory": {
 "title": {
 "fr": "Cherries: the flirt of the market.",
 "en": "Cherries: the flirt of the market.",
 "es": "Las cerezas: el coqueteo del mercado.",
 "tr": "Kirazlar: pazarın cilvebazkârı.",
 "ar": "الكرز: غنج السوق."
 },
 "body": {
 "fr": "Les cerises sont faites pour bouger. Elles accrochent le regard comme le fruit rouge sur un étal de Guéliz : petites, vives, impossibles à ignorer. On les réalise à l’aakad, la technique des boutons de caftan tressés à la main, citée dans le dossier d’inscription du caftan marocain au patrimoine immatériel de l’UNESCO (2025). L’intérieur est rembourré avec les chutes de raffia — zéro déchet.",
 "en": "The cherries are made to move. They catch the eye the way red fruit does at a Guéliz market stall: small, bright, impossible not to notice. We make them with the aakad, the hand-braided caftan-button technique cited in the 2025 UNESCO intangible-heritage file for the Moroccan caftan. Each one is padded inside with raffia offcuts — zero waste.",
 "es": "Las cerezas están hechas para moverse. Llaman la atención como la fruta roja en un puesto de Guéliz: pequeñas, brillantes, imposibles de ignorar. Las hacemos con el aakad, la técnica de botones de caftán trenzados a mano, citada en el expediente de 2025 de la UNESCO sobre el patrimonio inmaterial del caftán marroquí. El interior se rellena con recortes de rafia: cero residuos.",
 "tr": "Kirazlar hareket etmek için yapıldı. Guéliz tezgâhındaki kırmızı meyve gibi göz alıyor: küçük, parlak, fark etmemek imkânsız. Onları aakad ile yapıyoruz — 2025 UNESCO somut olmayan kültürel miras dosyasında anılan, elde örülen kaftan düğmesi tekniği. İçi rafya kırpıntılarıyla dolduruluyor — sıfır atık.",
 "ar": "الكرز مصنوع للتأرجح. يلفت النظر كالفاكهة الحمراء على طاولة في Guéliz: صغير، نابض، يستحيل تجاهله. نصنعه بتقنية العقاد — تقنية أزرار القفطان المضفورة يدويًا، المذكورة في ملف اليونسكو لعام 2025 للتراث غير المادي للقفطان المغربي. تُحشى كل قطعة من الداخل بقصاصات الرافيا — بلا هدر."
 },
 "collectionTitle": {
 "fr": "Fruit Market : inspiré des marchés de Marrakech",
 "en": "Fruit Market: inspired by the Marrakesh markets",
 "es": "Fruit Market: inspirado en los mercados de Marrakech",
 "tr": "Fruit Market: Marakeş pazarlarından ilham alınmıştır",
 "ar": "Fruit Market: مستوحى من أسواق مراكش"
 },
 "collectionBody": {
 "fr": "Les Fruit Charms viennent des étals de notre quartier de Guéliz — ceux de la médina comme ceux des camionnettes au coin de la rue. Oranges, citrons, pastèques, avocats, raisins, cerises : le raffia est teint par nos soins dans des couleurs emblématiques, puis crocheté fruit par fruit — l’une des techniques les plus délicates. Un charm ne se clipse pas qu’au sac : il se porte aussi sur un bijou, et avec les petits anneaux dorés offerts à l’achat des boucles, plusieurs charms se combinent ou se portent en collier. De véritables cartes postales de Marrakech.",
 "en": "The YZA Fruit Charms come from the stalls of our Guéliz neighbourhood — the médina ones and the street-corner vans alike. Oranges, lemons, watermelons, avocados, grapes, cherries: we hand-dye the raffia in iconic shades, then crochet it fruit by fruit — one of the most delicate crafts there is. A charm doesn’t only clip to a bag: it wears on jewellery too, and with the little gold rings gifted when you buy the earrings, several charms combine or wear as a necklace. True postcards from Marrakesh.",
 "es": "Los Fruit Charms de YZA vienen de los puestos de nuestro barrio de Guéliz, tanto los de la medina como las camionetas de la esquina. Naranjas, limones, sandías, aguacates, uvas, cerezas: teñimos la rafia a mano en colores emblemáticos y luego la tejemos fruta por fruta, una de las técnicas más delicadas. Un charm no solo se engancha al bolso: también se lleva en una joya, y con los pequeños aros dorados que se regalan al comprar los pendientes, varios charms se combinan o se llevan como collar. Verdaderas postales de Marrakech.",
 "tr": "YZA Meyve Charmları, Guéliz mahallemizin tezgâhlarından gelir — hem medinadakiler hem de sokak köşesindeki kamyonetler. Portakal, limon, karpuz, avokado, üzüm, kiraz: rafyayı ikonik tonlarda elde boyar, sonra meyve meyve örüyoruz — var olan en zarif tekniklerden biri. Bir charm yalnızca çantaya takılmaz: bir takının üzerinde de taşınır ve küpe alırken hediye edilen küçük altın halkalarla birkaç charm birleşir ya da kolye gibi takılır. Marakeş’ten gerçek kartpostallar.",
 "ar": "تأتي ميداليات الفاكهة من YZA من أكشاك حيّنا Guéliz — من المدينة القديمة ومن شاحنات زوايا الشوارع. برتقال، ليمون، بطيخ، أفوكادو، عنب، كرز: نصبغ الرافيا يدويًا بألوان مميزة، ثم نحيكها فاكهةً فاكهة — إحدى أدقّ التقنيات. الميدالية لا تُعلّق على الحقيبة فقط: تُلبس على قطعة مجوهرات أيضًا، ومع الحلقات الذهبية الصغيرة المُهداة عند شراء الأقراط، تتجمّع عدة ميداليات أو تُلبس كقلادة. بطاقات بريدية حقيقية من مراكش."
 },
 "liveUrl": "https://yza-shop.com/products/cherry-raffia-bag-charm"
 },
 "making": {
 "fr": "Chaque paire de cerises est réalisée à l’aakad, les petits boutons du caftan marocain tressés un à un à la main, puis reliée par une tige nouée. C’est La Fatima qui maîtrise cette technique à l’atelier de Guéliz. Le raffia — la matière la plus difficile à crocheter, mais très durable une fois la pièce finie — est teint à la main et travaillé fibre par fibre, et l’intérieur est rembourré de chutes de raffia. Le prénom de l’artisane est inscrit sur l’étiquette.",
 "en": "Each pair of cherries is made with the aakad — the small Moroccan caftan buttons braided one by one by hand — then joined by a knotted stem. It is La Fatima who masters this technique in the Guéliz atelier. The raffia, the hardest material to crochet yet very durable once the piece is finished, is hand-dyed and worked fibre by fibre, and the inside is padded with raffia offcuts. The artisan's first name is written on the tag.",
 "es": "Cada par de cerezas se hace con el aakad —los pequeños botones del caftán marroquí trenzados uno a uno a mano— y luego se une con un tallo anudado. Es La Fatima quien domina esta técnica en el taller de Guéliz. La rafia, el material más difícil de tejer pero muy duradero una vez terminada la pieza, se tiñe a mano y se trabaja fibra por fibra, y el interior se rellena con recortes de rafia. El nombre de la artesana se inscribe en la etiqueta.",
 "tr": "Her kiraz çifti aakad ile yapılır — Fas kaftanının küçük düğmeleri tek tek elde örülür — sonra düğümlü bir sapla birleştirilir. Bu tekniğe Guéliz atölyesinde hâkim olan La Fatima'dır. Örülmesi en zor ama parça bittiğinde çok dayanıklı olan rafya, elde boyanır ve lif lif işlenir; içi rafya kırpıntılarıyla doldurulur. Ustanın adı etikete yazılır.",
 "ar": "يُصنع كل زوج من الكرز بتقنية العقاد — أزرار القفطان المغربي الصغيرة المضفورة واحدةً واحدة باليد — ثم يُربط بساق معقودة. La Fatima هي من تتقن هذه التقنية في أتيليه Guéliz. الرافيا، أصعب مادة للحياكة لكنها متينة جدًا بعد اكتمال القطعة، تُصبغ يدويًا وتُشغل ليفةً بليفة، ويُحشى الداخل بقصاصات الرافيا. يُكتب اسم الحرفية على البطاقة."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l'eau ; s'il est mouillé, le faire sécher à l'air libre à l'ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l'anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "La rafia no necesita cuidados especiales. Evitar el agua; si se moja, dejar secar al aire libre alejada del sol directo. Evitar la exposición prolongada al sol para preservar los colores. Si el elemento dorado pierde su color, puede reemplazarse.",
 "tr": "Rafyanın özel bakıma ihtiyacı yoktur. Suyla temastan kaçının; ıslanırsa doğrudan güneş ışığından uzakta açık havada kurumaya bırakın. Renkleri korumak için uzun süreli güneş maruziyetinden kaçının. Altın öge rengini kaybederse değiştirilebilir.",
 "ar": "الرافيا لا تحتاج إلى عناية خاصة. تجنبي الماء؛ إذا ابتلت، جففيها في الهواء الطلق بعيداً عن أشعة الشمس المباشرة. تجنبي التعرض المطوّل للشمس للحفاظ على الألوان. إذا فقد العنصر الذهبي لونه، يمكن استبداله."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l'artisane qui l'a réalisée est inscrit sur l'étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Lista para regalar, con el nombre de la artesana que realizó la pieza grabado en la etiqueta YZA.",
 "tr": "Hediye için hazır; parçayı yapan ustanın adı YZA etiketine kazınmıştır.",
 "ar": "جاهزة للإهداء، مع اسم الحرفية التي صنعت القطعة منقوشاً على بطاقة YZA."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz'deki stüdyodan teslim alma mevcut.",
 "ar": "شحن مع تتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الأستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Satisfecho o reembolsado — 30 días",
 "tr": "Memnun olun ya da iade edin — 30 gün",
 "ar": "راضٍ أو مُستردّ — 30 يومًا"
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "badge": "limited",
 "hours": 1.5,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "watermelon-raffia-earrings-ss26",
 "lemon-slice-raffia-necklace-ss26"
 ]
 },
 {
 "handle": "raffia-grapes-charm-ss26",
 "fewLeft": true,
 "legacyHandles": [
 "raisin",
 "raisins"
 ],
 "sku": null,
 "name": {
 "fr": "Charm raisins en raphia",
 "en": "Raffia Grapes Charm",
 "es": "Raffia Grapes Charm",
 "tr": "Raffia Grapes Charm",
 "ar": "Raffia Grapes Charm"
 },
 "displayName": {
 "fr": "Charm raisins en raphia",
 "en": "Raffia Grapes Charm",
 "es": "Raffia Grapes Charm",
 "tr": "Raffia Grapes Charm",
 "ar": "Raffia Grapes Charm"
 },
 "short": {
 "fr": "Charm raisins en raphia, crocheté main et noué à l’aakad, la technique des boutons de caftan. Anneau doré 2,5 cm.",
 "en": "A raffia grapes charm, hand-crocheted and knotted with the aakad — the caftan-button technique. 2.5 cm gold ring.",
 "es": "Charm de uvas en rafia, tejido a mano y anudado con el aakad, la técnica de los botones de caftán. Aro dorado de 2,5 cm.",
 "tr": "Elde tığ işlenmiş ve aakad — kaftan düğmesi tekniği — ile düğümlenmiş rafya üzüm charm’ı. 2,5 cm altın halka.",
 "ar": "ميدالية عنب من الرافيا، مصنوعة يدويًا ومعقودة بتقنية العقاد — أزرار القفطان. حلقة ذهبية 2.5 سم."
 },
 "displayShort": {
 "fr": "Charm raisins en raphia, crocheté main et noué à l’aakad, la technique des boutons de caftan. Anneau doré 2,5 cm.",
 "en": "A raffia grapes charm, hand-crocheted and knotted with the aakad — the caftan-button technique. 2.5 cm gold ring.",
 "es": "Charm de uvas en rafia, tejido a mano y anudado con el aakad, la técnica de los botones de caftán. Aro dorado de 2,5 cm.",
 "tr": "Elde tığ işlenmiş ve aakad — kaftan düğmesi tekniği — ile düğümlenmiş rafya üzüm charm’ı. 2,5 cm altın halka.",
 "ar": "ميدالية عنب من الرافيا، مصنوعة يدويًا ومعقودة بتقنية العقاد — أزرار القفطان. حلقة ذهبية 2.5 سم."
 },
 "desc": {
 "fr": "Une petite grappe comme un bijou textile : volume, mouvement, plusieurs grains crochetés un par un et noués à l’aakad, la technique des boutons de caftan.",
 "en": "A tiny bunch of grapes, almost like textile jewellery: volume and movement, many grapes crocheted one by one and knotted with the aakad, the caftan-button technique.",
 "es": "Un pequeño racimo de uvas, casi como una joya textil: volumen y movimiento, varias uvas tejidas una a una y anudadas con el aakad, la técnica de los botones de caftán.",
 "tr": "Küçük bir üzüm salkımı, neredeyse bir tekstil takısı gibi: hacim ve hareket, tek tek örülüp aakad — kaftan düğmesi tekniği — ile düğümlenen üzümler.",
 "ar": "عنقود عنب صغير يشبه المجوهرات النسيجية: حجم وحركة، حبات عنب متعددة تُحاك واحدةً واحدة وتُعقد بتقنية العقاد، تقنية أزرار القفطان."
 },
 "price": 19000,
 "currency": "MAD",
 "category": "charms",
 "sourceCategory": "Fruit Charms",
 "categoryLabel": {
 "fr": "Charms",
 "en": "Charms",
 "es": "Complementos",
 "tr": "Charmlar",
 "ar": "تعليقات الحقيبة"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/original-shop/charms/raffia-grapes-charm-ss26-01.png",
 "gallery": [
 "assets/original-shop/charms/raffia-grapes-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-grapes-charm-ss26-02.webp",
 "assets/original-shop/charms/raffia-grapes-charm-ss26-03.jpg",
 "assets/original-shop/charms/raffia-grapes-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-grapes-charm-ss26-08.jpg",
 "assets/original-shop/charms/raffia-grapes-charm-ss26-10.webp",
 "assets/products/accessories-clean/grapes-accessory-clean.png",
 "assets/lookbook-ss26-27/embedded/p59_img01_xref1426_ab1030bf5e96.jpeg",
 "assets/lookbook-ss26-27/embedded/p57_img04_xref1411_21775b2a985c.jpeg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-58.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-59.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-60.jpg",
 "assets/lifestyle/charms/grapes-therow.webp"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "raffia-grapes-charm-ss26",
 "sku": null,
 "category": "CHARM",
 "source_type": "grapes",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 12
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit charm",
 "Grapes",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Raffia Grapes Charm - Handmade Fruit Charm in Marrakech",
 "seoKeywords": [
 "Accessories",
 "Charm raisins en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Grapes Charm",
 "YZA",
 "accessories",
 "bag",
 "cadeau",
 "charm",
 "charms",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "grapes",
 "handmade",
 "porte",
 "raffia-grapes-charm-ss26",
 "raisin",
 "raisins",
 "uvas",
 "عنب"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Charm raisins en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Grapes Charm",
 "YZA",
 "accessories",
 "bag",
 "cadeau",
 "charm",
 "charms",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "grapes",
 "handmade",
 "porte",
 "raffia-grapes-charm-ss26",
 "raisin",
 "raisins",
 "uvas",
 "عنب"
 ],
 "material": {
 "fr": "raphia crochete main et aiguille raffia",
 "en": "hand-crocheted and needle-crocheted raffia",
 "es": "rafia tejida a mano con ganchillo y aguja",
 "tr": "el örgüsü ve iğne örgüsü rafya",
 "ar": "رافيا مصنوعة بالكروشيه اليدوي والإبرة"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Solo rafia — tejida a ganchillo",
 "tr": "Yalnızca rafya — kroşe",
 "ar": "رافيا فقط — مصنوعة بالكروشيه"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Environ 8 x 4 cm (chaque piece peut legerement varier).",
 "en": "Approx. 8 x 4 cm (each piece may vary slightly).",
 "es": "Aprox. 8 x 4 cm (cada pieza puede variar ligeramente).",
 "tr": "Yaklaşık 8 x 4 cm (her parça hafifçe farklılık gösterebilir).",
 "ar": "حوالي 8 x 4 سم (قد تختلف كل قطعة قليلاً)."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Boucle en raffia et anneau doré 2 cm. Anneau de 3 cm disponible pour les bundles.",
 "en": "Raffia loop and 2 cm gold ring. 3 cm ring available for bundles.",
 "es": "Lazo de rafia y aro dorado de 2 cm. Aro de 3 cm disponible para los bundles.",
 "tr": "Rafya halka ve 2 cm altın halka. Bundle'lar için 3 cm halka mevcut.",
 "ar": "حلقة رافيا وحلقة ذهبية 2 سم. تتوفر حلقة 3 سم للحزم."
 },
 "handworkTime": {
 "fr": "4 h de crochet main pour ce fruit.",
 "en": "4 hours of hand crochet for this fruit.",
 "es": "4 horas de crochet a mano para esta fruta.",
 "tr": "Bu meyve için 4 saat el kroşesi.",
 "ar": "4 ساعات كروشيه يدوي لهذه الفاكهة."
 },
 "howToWear": {
 "title": {
 "fr": "Comment le porter",
 "en": "How to wear it",
 "es": "Cómo llevarlo",
 "tr": "Nasıl kullanılır",
 "ar": "كيف تلبسينه"
 },
 "intro": {
 "fr": "Utilisez ce Fruit Charm sur:",
 "en": "Use this Fruit Charm on:",
 "es": "Úsalo en:",
 "tr": "Bu Meyve Charm'ı şunlara takın:",
 "ar": "استخدمي هذا الميدالية الفاكهة على:"
 },
 "items": [
 {
 "fr": "Les sacs YZA, La Vague et autres paniers de la marque.",
 "en": "YZA bags, La Vague and other YZA baskets.",
 "es": "Bolsos YZA, La Vague y otros cestos de la marca.",
 "tr": "YZA çantaları, La Vague ve diğer YZA sepetleri.",
 "ar": "حقائب YZA، La Vague وسلال YZA الأخرى."
 },
 {
 "fr": "Vos sacs en cuir pour ajouter une touche de personnalité et de couleur.",
 "en": "Leather bags to add personality and colour.",
 "es": "Bolsos de piel para añadir personalidad y color.",
 "tr": "Kişilik ve renk katmak için deri çantalar.",
 "ar": "الحقائب الجلدية لإضافة شخصية ولون."
 },
 {
 "fr": "Paniers en paille, market totes et sacs de plage.",
 "en": "Straw baskets, market totes and beach bags.",
 "es": "Cestos de paja, bolsas de mercado y bolsas de playa.",
 "tr": "Hasır sepetler, alışveriş çantaları ve plaj çantaları.",
 "ar": "السلال القشية، وحقائب السوق، وحقائب الشاطئ."
 },
 {
 "fr": "Clés, porte-clés et pochettes.",
 "en": "Keys, keychains and pouches.",
 "es": "Llaves, llaveros y bolsillos.",
 "tr": "Anahtarlar, anahtarlıklar ve kılıflar.",
 "ar": "المفاتيح والمفاتيح وحافظات المفاتيح."
 }
 ],
 "styleTip": {
 "fr": "Parfaites sur des anses épurées et des paniers du soir. Laissez le volume pendre librement plutôt que de l’encombrer de trop de charms.",
 "en": "Best on clean handles and evening baskets. Let the volume hang freely rather than crowding it with too many charms.",
 "es": "Mejor en asas limpias y cestos de noche. Deja que el volumen cuelgue libremente en lugar de saturarlo con demasiados charms.",
 "tr": "Temiz kulplar ve akşam sepetlerinde en iyisi. Çok fazla charm ile kalabalıklaştırmak yerine hacmin serbestçe sarkmasına izin verin.",
 "ar": "الأفضل على المقابض النظيفة وسلال المساء. اتركي الحجم يتدلى بحرية بدلاً من ازدحامه بالعديد من الميداليات."
 },
 "note": {
 "fr": "Chaque charm vient avec une petite boucle. L anneau dore est inclus dans les bundles et peut etre ajoute au studio pour un charm seul.",
 "en": "Every charm comes with a small loop. The gold ring is included with bundles and can be added in studio for single charms.",
 "es": "Cada charm incluye un lazo pequeño. El aro dorado viene incluido en los bundles y puede añadirse en el estudio para charms individuales.",
 "tr": "Her charm küçük bir halkayla birlikte gelir. Altın halka bundle'lara dahildir; tek charmlar için stüdyoda eklenebilir.",
 "ar": "كل ميدالية تأتي مع حلقة صغيرة. الحلقة الذهبية مشمولة في الحزم ويمكن إضافتها في الأستوديو للميداليات المفردة."
 }
 },
 "fruitStory": {
 "title": {
 "fr": "Grapes: the most sculptural charm.",
 "en": "Grapes: the most sculptural charm.",
 "es": "Las uvas: el charm más escultural.",
 "tr": "Üzümler: en heykelvari charm.",
 "ar": "العنب: الميدالية الأكثر نحتاً."
 },
 "body": {
 "fr": "Le raisin est le charm le plus sculptural : de nombreux petits grains, chacun façonné séparément puis équilibré en une grappe qui bouge. On le noue à l’aakad, la technique des boutons de caftan. Plus proche d’un bijou textile que d’un simple accessoire.",
 "en": "The grapes are the most sculptural charm: many small pieces, each shaped separately, then balanced into one moving cluster. We knot them with the aakad, the caftan-button technique. Closer to textile jewellery than a simple accessory.",
 "es": "Las uvas son el charm más escultural: muchas piezas pequeñas, cada una formada por separado y equilibradas en un racimo en movimiento. Las anudamos con el aakad, la técnica de los botones de caftán. Más cerca de una joya textil que de un accesorio sencillo.",
 "tr": "Üzüm en heykelvari charm: pek çok küçük parça, her biri ayrı şekillendirilir, sonra hareketli bir salkımda dengelenir. Onları aakad — kaftan düğmesi tekniği — ile düğümlüyoruz. Sıradan bir aksesuardan çok tekstil takısına yakın.",
 "ar": "العنب هو الميدالية الأكثر نحتًا: حبات صغيرة كثيرة، كل واحدة تُشكَّل على حدة ثم تُوازَن في عنقود متحرك. نعقدها بتقنية العقاد، تقنية أزرار القفطان. أقرب إلى مجوهرات نسيجية منه إلى إكسسوار بسيط."
 },
 "collectionTitle": {
 "fr": "Fruit Market : inspiré des marchés de Marrakech",
 "en": "Fruit Market: inspired by the Marrakesh markets",
 "es": "Fruit Market: inspirado en los mercados de Marrakech",
 "tr": "Fruit Market: Marakeş pazarlarından ilham alınmıştır",
 "ar": "Fruit Market: مستوحى من أسواق مراكش"
 },
 "collectionBody": {
 "fr": "Les Fruit Charms viennent des étals de notre quartier de Guéliz — ceux de la médina comme ceux des camionnettes au coin de la rue. Oranges, citrons, pastèques, avocats, raisins, cerises : le raffia est teint par nos soins dans des couleurs emblématiques, puis crocheté fruit par fruit — l’une des techniques les plus délicates. Un charm ne se clipse pas qu’au sac : il se porte aussi sur un bijou, et avec les petits anneaux dorés offerts à l’achat des boucles, plusieurs charms se combinent ou se portent en collier. De véritables cartes postales de Marrakech.",
 "en": "The YZA Fruit Charms come from the stalls of our Guéliz neighbourhood — the médina ones and the street-corner vans alike. Oranges, lemons, watermelons, avocados, grapes, cherries: we hand-dye the raffia in iconic shades, then crochet it fruit by fruit — one of the most delicate crafts there is. A charm doesn’t only clip to a bag: it wears on jewellery too, and with the little gold rings gifted when you buy the earrings, several charms combine or wear as a necklace. True postcards from Marrakesh.",
 "es": "Los Fruit Charms de YZA vienen de los puestos de nuestro barrio de Guéliz, tanto los de la medina como las camionetas de la esquina. Naranjas, limones, sandías, aguacates, uvas, cerezas: teñimos la rafia a mano en colores emblemáticos y luego la tejemos fruta por fruta, una de las técnicas más delicadas. Un charm no solo se engancha al bolso: también se lleva en una joya, y con los pequeños aros dorados que se regalan al comprar los pendientes, varios charms se combinan o se llevan como collar. Verdaderas postales de Marrakech.",
 "tr": "YZA Meyve Charmları, Guéliz mahallemizin tezgâhlarından gelir — hem medinadakiler hem de sokak köşesindeki kamyonetler. Portakal, limon, karpuz, avokado, üzüm, kiraz: rafyayı ikonik tonlarda elde boyar, sonra meyve meyve örüyoruz — var olan en zarif tekniklerden biri. Bir charm yalnızca çantaya takılmaz: bir takının üzerinde de taşınır ve küpe alırken hediye edilen küçük altın halkalarla birkaç charm birleşir ya da kolye gibi takılır. Marakeş’ten gerçek kartpostallar.",
 "ar": "تأتي ميداليات الفاكهة من YZA من أكشاك حيّنا Guéliz — من المدينة القديمة ومن شاحنات زوايا الشوارع. برتقال، ليمون، بطيخ، أفوكادو، عنب، كرز: نصبغ الرافيا يدويًا بألوان مميزة، ثم نحيكها فاكهةً فاكهة — إحدى أدقّ التقنيات. الميدالية لا تُعلّق على الحقيبة فقط: تُلبس على قطعة مجوهرات أيضًا، ومع الحلقات الذهبية الصغيرة المُهداة عند شراء الأقراط، تتجمّع عدة ميداليات أو تُلبس كقلادة. بطاقات بريدية حقيقية من مراكش."
 },
 "liveUrl": "https://yza-shop.com/products/grapes-raffia-bag-charm"
 },
 "making": {
 "fr": "Le raisin est le charm qui explique le mieux son prix : de nombreux petits grains, chacun crocheté séparément puis noué à l’aakad — la technique des boutons de caftan — pour former une grappe qui bouge. Plus proche d’un bijou textile que d’un simple accessoire. Réalisé à la main par La Fatima dans l’atelier de Guéliz, puis contrôlé avant la pose de l’étiquette YZA.",
 "en": "The grapes are the charm that explains the price fastest: many small pieces, each crocheted separately then knotted with the aakad — the caftan-button technique — into one moving cluster. Closer to textile jewellery than a simple accessory. Hand-made by La Fatima in the Guéliz atelier, then checked before the YZA tag is added.",
 "es": "Las uvas son el charm que mejor explica su precio: muchas piezas pequeñas, cada una tejida por separado y luego anudada con el aakad —la técnica de los botones de caftán— en un racimo en movimiento. Más cerca de una joya textil que de un accesorio sencillo. Hecho a mano por La Fatima en el taller de Guéliz y revisado antes de poner la etiqueta YZA.",
 "tr": "Üzüm, fiyatını en iyi açıklayan charm: pek çok küçük parça, her biri ayrı örülür, sonra aakad — kaftan düğmesi tekniği — ile düğümlenip hareketli bir salkım olur. Sıradan bir aksesuardan çok tekstil takısına yakın. Guéliz atölyesinde La Fatima tarafından elde yapılır, ardından YZA etiketi eklenmeden önce kontrol edilir.",
 "ar": "العنب هو الميدالية التي تُبرّر سعرها بأوضح شكل: حبات صغيرة كثيرة، كل واحدة تُحاك على حدة ثم تُعقد بتقنية العقاد — تقنية أزرار القفطان — في عنقود متحرك. أقرب إلى مجوهرات نسيجية منه إلى إكسسوار بسيط. تصنعه La Fatima يدويًا في أتيليه Guéliz، ثم يُفحص قبل إضافة علامة YZA."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l'eau ; s'il est mouillé, le faire sécher à l'air libre à l'ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l'anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "La rafia no necesita cuidados especiales. Evitar el agua; si se moja, dejar secar al aire libre alejada del sol directo. Evitar la exposición prolongada al sol para preservar los colores. Si el elemento dorado pierde su color, puede reemplazarse.",
 "tr": "Rafyanın özel bakıma ihtiyacı yoktur. Suyla temastan kaçının; ıslanırsa doğrudan güneş ışığından uzakta açık havada kurumaya bırakın. Renkleri korumak için uzun süreli güneş maruziyetinden kaçının. Altın öge rengini kaybederse değiştirilebilir.",
 "ar": "الرافيا لا تحتاج إلى عناية خاصة. تجنبي الماء؛ إذا ابتلت، جففيها في الهواء الطلق بعيداً عن أشعة الشمس المباشرة. تجنبي التعرض المطوّل للشمس للحفاظ على الألوان. إذا فقد العنصر الذهبي لونه، يمكن استبداله."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l'artisane qui l'a réalisée est inscrit sur l'étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Lista para regalar, con el nombre de la artesana que realizó la pieza grabado en la etiqueta YZA.",
 "tr": "Hediye için hazır; parçayı yapan ustanın adı YZA etiketine kazınmıştır.",
 "ar": "جاهزة للإهداء، مع اسم الحرفية التي صنعت القطعة منقوشاً على بطاقة YZA."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz'deki stüdyodan teslim alma mevcut.",
 "ar": "شحن مع تتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الأستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Satisfecho o reembolsado — 30 días",
 "tr": "Memnun olun ya da iade edin — 30 gün",
 "ar": "راضٍ أو مُستردّ — 30 يومًا"
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "badge": "limited",
 "hours": 4,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "watermelon-raffia-earrings-ss26",
 "lemon-slice-raffia-necklace-ss26"
 ]
 },
 {
 "handle": "raffia-whole-lemon-charm-ss26",
 "legacyHandles": [
 "citron"
 ],
 "sku": null,
 "name": {
 "fr": "Charm citron entier en raphia",
 "en": "Raffia Whole Lemon Charm",
 "es": "Raffia Whole Lemon Charm",
 "tr": "Raffia Whole Lemon Charm",
 "ar": "Raffia Whole Lemon Charm"
 },
 "displayName": {
 "fr": "Charm citron entier en raphia",
 "en": "Raffia Whole Lemon Charm",
 "es": "Raffia Whole Lemon Charm",
 "tr": "Raffia Whole Lemon Charm",
 "ar": "Raffia Whole Lemon Charm"
 },
 "short": {
 "fr": "Charm citron entier en raphia, crochete main avec anneau dore 2,5 cm.",
 "en": "A whole lemon raffia charm, crocheted by hand with a 2.5 cm gold ring.",
 "es": "Un charm de limón entero en rafia, tejido a mano con aro dorado de 2,5 cm.",
 "tr": "Bir bütün limon rafya charm, 2,5 cm altın halkayla el kroşesiyle yapılmış.",
 "ar": "ميدالية ليمون كامل من الرافيا، مصنوعة بالكروشيه اليدوي مع حلقة ذهبية 2.5 سم."
 },
 "displayShort": {
 "fr": "Charm citron entier en raphia, crochete main avec anneau dore 2,5 cm.",
 "en": "A whole lemon raffia charm, crocheted by hand with a 2.5 cm gold ring.",
 "es": "Un charm de limón entero en rafia, tejido a mano con aro dorado de 2,5 cm.",
 "tr": "Bir bütün limon rafya charm, 2,5 cm altın halkayla el kroşesiyle yapılmış.",
 "ar": "ميدالية ليمون كامل من الرافيا، مصنوعة بالكروشيه اليدوي مع حلقة ذهبية 2.5 سم."
 },
 "desc": {
 "fr": "Un citron de marche en raphia: vif, graphique, plein d energie. Beau sur cuir noir, denim et paille naturelle.",
 "en": "A juicy lemon from the market, in raffia form: bright, cheeky and full of energy. Works beautifully on dark leather, denim and natural straw.",
 "es": "Un limón jugoso del mercado, en forma de rafia: brillante, pícaro y lleno de energía. Queda perfecto en cuero oscuro, denim y paja natural.",
 "tr": "Pazardan bir sulu limon, rafya formunda: parlak, şakacı ve enerjiye dolu. Koyu deri, denim ve doğal hasır üzerinde harika duruyor.",
 "ar": "ليمونة طازجة من السوق بشكل رافيا: مشرقة، شقية ومليئة بالطاقة. تبدو رائعة على الجلد الداكن والدنيم والقش الطبيعي."
 },
 "price": 23000,
 "currency": "MAD",
 "category": "charms",
 "sourceCategory": "Fruit Charms",
 "categoryLabel": {
 "fr": "Charms",
 "en": "Charms",
 "es": "Complementos",
 "tr": "Charmlar",
 "ar": "تعليقات الحقيبة"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/original-shop/charms/raffia-whole-lemon-charm-ss26-01.png",
 "gallery": [
 "assets/original-shop/charms/raffia-whole-lemon-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-whole-lemon-charm-ss26-02.webp",
 "assets/original-shop/charms/raffia-whole-lemon-charm-ss26-03.jpg",
 "assets/original-shop/charms/raffia-whole-lemon-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-whole-lemon-charm-ss26-08.webp",
 "assets/original-shop/charms/raffia-whole-lemon-charm-ss26-09.webp",
 "assets/products/accessories-clean/lemon-raffia-earrings-clean.webp",
 "assets/lookbook-ss26-27/embedded/p53_img01_xref1380_788fc851111b.jpeg",
 "assets/lookbook-ss26-27/embedded/p59_img01_xref1426_ab1030bf5e96.jpeg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-58.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-59.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-60.jpg",
 "assets/lifestyle/charms/lemon-bottega.webp"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "raffia-whole-lemon-charm-ss26",
 "sku": null,
 "category": "CHARM",
 "source_type": "lemon",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 8
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit charm",
 "Lemon",
 "Whole fruit",
 "Raffia"
 ],
 "seoTitle": "Whole Lemon Raffia Charm - Handmade in Marrakech",
 "seoKeywords": [
 "Accessories",
 "Charm citron entier en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Whole Lemon Charm",
 "YZA",
 "accessories",
 "bag",
 "cadeau",
 "charm",
 "charms",
 "citron",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "handmade",
 "limon",
 "porte",
 "raffia-whole-lemon-charm-ss26",
 "ليمون"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Charm citron entier en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Whole Lemon Charm",
 "YZA",
 "accessories",
 "bag",
 "cadeau",
 "charm",
 "charms",
 "citron",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "handmade",
 "limon",
 "porte",
 "raffia-whole-lemon-charm-ss26",
 "ليمون"
 ],
 "material": {
 "fr": "raphia crochete main raffia",
 "en": "hand-crocheted raffia",
 "es": "rafia tejida a mano con ganchillo",
 "tr": "el örgüsü rafya",
 "ar": "رافيا مصنوعة بالكروشيه اليدوي"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Solo rafia — tejida a ganchillo",
 "tr": "Yalnızca rafya — kroşe",
 "ar": "رافيا فقط — مصنوعة بالكروشيه"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Environ 4.5 cm diameter (chaque piece peut legerement varier).",
 "en": "Approx. 4.5 cm diameter (each piece may vary slightly).",
 "es": "Aprox. 4,5 cm de diámetro (cada pieza puede variar ligeramente).",
 "tr": "Yaklaşık 4,5 cm çap (her parça hafifçe farklılık gösterebilir).",
 "ar": "حوالي 4.5 سم قطر (قد تختلف كل قطعة قليلاً)."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Boucle en raffia et anneau doré 2 cm. Anneau de 3 cm disponible pour les bundles.",
 "en": "Raffia loop and 2 cm gold ring. 3 cm ring available for bundles.",
 "es": "Lazo de rafia y aro dorado de 2 cm. Aro de 3 cm disponible para los bundles.",
 "tr": "Rafya halka ve 2 cm altın halka. Bundle'lar için 3 cm halka mevcut.",
 "ar": "حلقة رافيا وحلقة ذهبية 2 سم. تتوفر حلقة 3 سم للحزم."
 },
 "handworkTime": {
 "fr": "3 h de crochet main pour ce fruit.",
 "en": "3 hours of hand crochet for this fruit.",
 "es": "3 horas de crochet a mano para esta fruta.",
 "tr": "Bu meyve için 3 saat el kroşesi.",
 "ar": "3 ساعات كروشيه يدوي لهذه الفاكهة."
 },
 "howToWear": {
 "title": {
 "fr": "Comment le porter",
 "en": "How to wear it",
 "es": "Cómo llevarlo",
 "tr": "Nasıl kullanılır",
 "ar": "كيف تلبسينه"
 },
 "intro": {
 "fr": "Utilisez ce Fruit Charm sur:",
 "en": "Use this Fruit Charm on:",
 "es": "Úsalo en:",
 "tr": "Bu Meyve Charm'ı şunlara takın:",
 "ar": "استخدمي هذا الميدالية الفاكهة على:"
 },
 "items": [
 {
 "fr": "Les sacs YZA, La Vague et autres paniers de la marque.",
 "en": "YZA bags, La Vague and other YZA baskets.",
 "es": "Bolsos YZA, La Vague y otros cestos de la marca.",
 "tr": "YZA çantaları, La Vague ve diğer YZA sepetleri.",
 "ar": "حقائب YZA، La Vague وسلال YZA الأخرى."
 },
 {
 "fr": "Vos sacs en cuir pour ajouter une touche de personnalité et de couleur.",
 "en": "Leather bags to add personality and colour.",
 "es": "Bolsos de piel para añadir personalidad y color.",
 "tr": "Kişilik ve renk katmak için deri çantalar.",
 "ar": "الحقائب الجلدية لإضافة شخصية ولون."
 },
 {
 "fr": "Paniers en paille, market totes et sacs de plage.",
 "en": "Straw baskets, market totes and beach bags.",
 "es": "Cestos de paja, bolsas de mercado y bolsas de playa.",
 "tr": "Hasır sepetler, alışveriş çantaları ve plaj çantaları.",
 "ar": "السلال القشية، وحقائب السوق، وحقائب الشاطئ."
 },
 {
 "fr": "Clés, porte-clés et pochettes.",
 "en": "Keys, keychains and pouches.",
 "es": "Llaves, llaveros y bolsillos.",
 "tr": "Anahtarlar, anahtarlıklar ve kılıflar.",
 "ar": "المفاتيح والمفاتيح وحافظات المفاتيح."
 }
 ],
 "styleTip": {
 "fr": "Best on dark leather, denim, natural straw and black handles. Wear alone for one sharp colour note.",
 "en": "Best on dark leather, denim, natural straw and black handles. Wear alone for one sharp colour note.",
 "es": "Mejor en cuero oscuro, denim, paja natural y asas negras. Llévalo solo para una nota de color nítida.",
 "tr": "Koyu deri, denim, doğal hasır ve siyah kulplarda en iyisi. Tek keskin renk notu için yalnız kullanın.",
 "ar": "الأفضل على الجلد الداكن والدنيم والقش الطبيعي والمقابض السوداء. ارتدِه وحده لنغمة لون حادة."
 },
 "note": {
 "fr": "Chaque charm vient avec une petite boucle. L anneau dore est inclus dans les bundles et peut etre ajoute au studio pour un charm seul.",
 "en": "Every charm comes with a small loop. The gold ring is included with bundles and can be added in studio for single charms.",
 "es": "Cada charm incluye un lazo pequeño. El aro dorado viene incluido en los bundles y puede añadirse en el estudio para charms individuales.",
 "tr": "Her charm küçük bir halkayla birlikte gelir. Altın halka bundle'lara dahildir; tek charmlar için stüdyoda eklenebilir.",
 "ar": "كل ميدالية تأتي مع حلقة صغيرة. الحلقة الذهبية مشمولة في الحزم ويمكن إضافتها في الأستوديو للميداليات المفردة."
 }
 },
 "fruitStory": {
 "title": {
 "fr": "Lemon: the clean pop.",
 "en": "Lemon: the clean pop.",
 "es": "El limón: el toque nítido.",
 "tr": "Limon: temiz bir renk patlaması.",
 "ar": "الليمون: اللمسة النقية."
 },
 "body": {
 "fr": "The whole lemon is a small Marrakesh wake-up call. It brings the colour of juice stalls, taxi mornings and market crates to a handle. The round shape keeps it bold without becoming loud.",
 "en": "The whole lemon is a small Marrakesh wake-up call. It brings the colour of juice stalls, taxi mornings and market crates to a handle. The round shape keeps it bold without becoming loud.",
 "es": "El limón entero es un pequeño despertar marrakchí. Trae el color de los puestos de zumo, las mañanas de taxi y las cajas del mercado a la asa. La forma redonda lo hace llamativo sin volverse estrepitoso.",
 "tr": "Bütün limon, küçük bir Marakeş uyanış çağrısı. Meyve suyu tezgahlarının, taksi sabahlarının ve pazar kasalarının rengini bir sapaya taşıyor. Yuvarlak şekli, gürültülü olmadan cesur kalmasını sağlıyor.",
 "ar": "الليمون الكامل صرخة صحيان صغيرة من مراكش. يحمل لون أكشاك العصير وصباحات التاكسي وأقفاص السوق إلى المقبض. الشكل الدائري يجعله جريئاً دون أن يصبح صاخباً."
 },
 "collectionTitle": {
 "fr": "Fruit Market : inspiré des marchés de Marrakech",
 "en": "Fruit Market: inspired by the Marrakesh markets",
 "es": "Fruit Market: inspirado en los mercados de Marrakech",
 "tr": "Fruit Market: Marakeş pazarlarından ilham alınmıştır",
 "ar": "Fruit Market: مستوحى من أسواق مراكش"
 },
 "collectionBody": {
 "fr": "Les Fruit Charms viennent des étals de notre quartier de Guéliz — ceux de la médina comme ceux des camionnettes au coin de la rue. Oranges, citrons, pastèques, avocats, raisins, cerises : le raffia est teint par nos soins dans des couleurs emblématiques, puis crocheté fruit par fruit — l’une des techniques les plus délicates. Un charm ne se clipse pas qu’au sac : il se porte aussi sur un bijou, et avec les petits anneaux dorés offerts à l’achat des boucles, plusieurs charms se combinent ou se portent en collier. De véritables cartes postales de Marrakech.",
 "en": "The YZA Fruit Charms come from the stalls of our Guéliz neighbourhood — the médina ones and the street-corner vans alike. Oranges, lemons, watermelons, avocados, grapes, cherries: we hand-dye the raffia in iconic shades, then crochet it fruit by fruit — one of the most delicate crafts there is. A charm doesn’t only clip to a bag: it wears on jewellery too, and with the little gold rings gifted when you buy the earrings, several charms combine or wear as a necklace. True postcards from Marrakesh.",
 "es": "Los Fruit Charms de YZA vienen de los puestos de nuestro barrio de Guéliz, tanto los de la medina como las camionetas de la esquina. Naranjas, limones, sandías, aguacates, uvas, cerezas: teñimos la rafia a mano en colores emblemáticos y luego la tejemos fruta por fruta, una de las técnicas más delicadas. Un charm no solo se engancha al bolso: también se lleva en una joya, y con los pequeños aros dorados que se regalan al comprar los pendientes, varios charms se combinan o se llevan como collar. Verdaderas postales de Marrakech.",
 "tr": "YZA Meyve Charmları, Guéliz mahallemizin tezgâhlarından gelir — hem medinadakiler hem de sokak köşesindeki kamyonetler. Portakal, limon, karpuz, avokado, üzüm, kiraz: rafyayı ikonik tonlarda elde boyar, sonra meyve meyve örüyoruz — var olan en zarif tekniklerden biri. Bir charm yalnızca çantaya takılmaz: bir takının üzerinde de taşınır ve küpe alırken hediye edilen küçük altın halkalarla birkaç charm birleşir ya da kolye gibi takılır. Marakeş’ten gerçek kartpostallar.",
 "ar": "تأتي ميداليات الفاكهة من YZA من أكشاك حيّنا Guéliz — من المدينة القديمة ومن شاحنات زوايا الشوارع. برتقال، ليمون، بطيخ، أفوكادو، عنب، كرز: نصبغ الرافيا يدويًا بألوان مميزة، ثم نحيكها فاكهةً فاكهة — إحدى أدقّ التقنيات. الميدالية لا تُعلّق على الحقيبة فقط: تُلبس على قطعة مجوهرات أيضًا، ومع الحلقات الذهبية الصغيرة المُهداة عند شراء الأقراط، تتجمّع عدة ميداليات أو تُلبس كقلادة. بطاقات بريدية حقيقية من مراكش."
 },
 "liveUrl": "https://yza-shop.com/products/lemon-raffia-bag-charm"
 },
 "making": {
 "fr": "The whole lemon is a small Marrakesh wake-up call. It brings the colour of juice stalls, taxi mornings and market crates to a handle. The round shape keeps it bold without becoming loud. Chaque piece est travaillee au crochet main dans l atelier de Guéliz, puis controlee avant la pose de l etiquette YZA.",
 "en": "The whole lemon is a small Marrakesh wake-up call. It brings the colour of juice stalls, taxi mornings and market crates to a handle. The round shape keeps it bold without becoming loud. Each piece is hand-crocheted in the Guéliz atelier, then checked before the YZA tag is added.",
 "es": "El limón entero es un pequeño despertar marrakchí. Trae el color de los puestos de zumo, las mañanas de taxi y las cajas del mercado a la asa. La forma redonda lo hace llamativo sin volverse estrepitoso. Cada pieza está tejida a mano en el taller de Guéliz y revisada antes de poner la etiqueta YZA.",
 "tr": "Bütün limon, küçük bir Marakeş uyanış çağrısı. Meyve suyu tezgahlarının, taksi sabahlarının ve pazar kasalarının rengini bir sapaya taşıyor. Yuvarlak şekli, gürültülü olmadan cesur kalmasını sağlıyor. Her parça Guéliz atölyesinde el kroşesiyle yapılır, ardından YZA etiketi eklenmeden önce kontrol edilir.",
 "ar": "الليمون الكامل صرخة صحيان صغيرة من مراكش. يحمل لون أكشاك العصير وصباحات التاكسي وأقفاص السوق إلى المقبض. الشكل الدائري يجعله جريئاً دون أن يصبح صاخباً. كل قطعة مصنوعة بالكروشيه اليدوي في أتيليه Guéliz، ثم تُفحص قبل إضافة علامة YZA."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l'eau ; s'il est mouillé, le faire sécher à l'air libre à l'ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l'anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "La rafia no necesita cuidados especiales. Evitar el agua; si se moja, dejar secar al aire libre alejada del sol directo. Evitar la exposición prolongada al sol para preservar los colores. Si el elemento dorado pierde su color, puede reemplazarse.",
 "tr": "Rafyanın özel bakıma ihtiyacı yoktur. Suyla temastan kaçının; ıslanırsa doğrudan güneş ışığından uzakta açık havada kurumaya bırakın. Renkleri korumak için uzun süreli güneş maruziyetinden kaçının. Altın öge rengini kaybederse değiştirilebilir.",
 "ar": "الرافيا لا تحتاج إلى عناية خاصة. تجنبي الماء؛ إذا ابتلت، جففيها في الهواء الطلق بعيداً عن أشعة الشمس المباشرة. تجنبي التعرض المطوّل للشمس للحفاظ على الألوان. إذا فقد العنصر الذهبي لونه، يمكن استبداله."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l'artisane qui l'a réalisée est inscrit sur l'étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Lista para regalar, con el nombre de la artesana que realizó la pieza grabado en la etiqueta YZA.",
 "tr": "Hediye için hazır; parçayı yapan ustanın adı YZA etiketine kazınmıştır.",
 "ar": "جاهزة للإهداء، مع اسم الحرفية التي صنعت القطعة منقوشاً على بطاقة YZA."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz'deki stüdyodan teslim alma mevcut.",
 "ar": "شحن مع تتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الأستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Satisfecho o reembolsado — 30 días",
 "tr": "Memnun olun ya da iade edin — 30 gün",
 "ar": "راضٍ أو مُستردّ — 30 يومًا"
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "badge": "limited",
 "hours": 3,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "watermelon-raffia-earrings-ss26",
 "lemon-slice-raffia-necklace-ss26"
 ]
 },
 {
 "handle": "raffia-whole-orange-charm-ss26",
 "legacyHandles": [
 "orange"
 ],
 "sku": null,
 "name": {
 "fr": "Charm orange entiere en raphia",
 "en": "Raffia Whole Orange Charm",
 "es": "Raffia Whole Orange Charm",
 "tr": "Raffia Whole Orange Charm",
 "ar": "Raffia Whole Orange Charm"
 },
 "displayName": {
 "fr": "Charm orange entiere en raphia",
 "en": "Raffia Whole Orange Charm",
 "es": "Raffia Whole Orange Charm",
 "tr": "Raffia Whole Orange Charm",
 "ar": "Raffia Whole Orange Charm"
 },
 "short": {
 "fr": "Charm orange entiere en raphia, crochete main avec anneau dore 2,5 cm.",
 "en": "A whole orange raffia charm, crocheted by hand with a 2.5 cm gold ring.",
 "es": "Un charm de naranja entera en rafia, tejido a mano con aro dorado de 2,5 cm.",
 "tr": "Bir bütün portakal rafya charm, 2,5 cm altın halkayla el kroşesiyle yapılmış.",
 "ar": "ميدالية برتقالة كاملة من الرافيا، مصنوعة بالكروشيه اليدوي مع حلقة ذهبية 2.5 سم."
 },
 "displayShort": {
 "fr": "Charm orange entiere en raphia, crochete main avec anneau dore 2,5 cm.",
 "en": "A whole orange raffia charm, crocheted by hand with a 2.5 cm gold ring.",
 "es": "Un charm de naranja entera en rafia, tejido a mano con aro dorado de 2,5 cm.",
 "tr": "Bir bütün portakal rafya charm, 2,5 cm altın halkayla el kroşesiyle yapılmış.",
 "ar": "ميدالية برتقالة كاملة من الرافيا، مصنوعة بالكروشيه اليدوي مع حلقة ذهبية 2.5 سم."
 },
 "desc": {
 "fr": "Une petite orange ronde comme un soleil sur la anse: chaleur, couleur et presence graphique sur cuir ou panier.",
 "en": "A small, round orange turned into a charm, like a little sun on your handle. Brings warmth and colour to both leather bags and straw baskets.",
 "es": "Una pequeña naranja redonda convertida en charm, como un pequeño sol en tu asa. Aporta calidez y color tanto a bolsos de piel como a cestos de paja.",
 "tr": "Küçük, yuvarlak bir portakal charm'a dönüştürülmüş, kulpunuzda küçük bir güneş gibi. Hem deri çantalara hem de hasır sepetlere sıcaklık ve renk katıyor.",
 "ar": "برتقالة صغيرة مستديرة تحولت إلى ميدالية، كشمس صغيرة على مقبض حقيبتك. تضفي دفئاً ولوناً على الحقائب الجلدية والسلال القشية على حد سواء."
 },
 "price": 23000,
 "currency": "MAD",
 "category": "charms",
 "sourceCategory": "Fruit Charms",
 "categoryLabel": {
 "fr": "Charms",
 "en": "Charms",
 "es": "Complementos",
 "tr": "Charmlar",
 "ar": "تعليقات الحقيبة"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/original-shop/charms/raffia-whole-orange-charm-ss26-01.png",
 "gallery": [
 "assets/original-shop/charms/raffia-whole-orange-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-whole-orange-charm-ss26-02.webp",
 "assets/original-shop/charms/raffia-whole-orange-charm-ss26-03.jpg",
 "assets/original-shop/charms/raffia-whole-orange-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-whole-orange-charm-ss26-08.webp",
 "assets/original-shop/charms/raffia-whole-orange-charm-ss26-09.webp",
 "assets/products/accessories-clean/orange-raffia-earrings-clean.webp",
 "assets/lookbook-ss26-27/embedded/p59_img01_xref1426_ab1030bf5e96.jpeg",
 "assets/lookbook-ss26-27/embedded/p58_img02_xref1416_b7482fc1dffb.jpeg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-58.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-59.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-60.jpg"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "raffia-whole-orange-charm-ss26",
 "sku": null,
 "category": "CHARM",
 "source_type": "orange",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 6
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit charm",
 "Orange",
 "Whole fruit",
 "Raffia"
 ],
 "seoTitle": "Whole Orange Raffia Charm - Handmade in Marrakech",
 "seoKeywords": [
 "Accessories",
 "Charm orange entiere en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Whole Orange Charm",
 "YZA",
 "accessories",
 "bag",
 "cadeau",
 "charm",
 "charms",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "handmade",
 "naranja",
 "orange",
 "porte",
 "raffia-whole-orange-charm-ss26",
 "برتقال"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Charm orange entiere en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Whole Orange Charm",
 "YZA",
 "accessories",
 "bag",
 "cadeau",
 "charm",
 "charms",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "handmade",
 "naranja",
 "orange",
 "porte",
 "raffia-whole-orange-charm-ss26",
 "برتقال"
 ],
 "material": {
 "fr": "raphia crochete main raffia",
 "en": "hand-crocheted raffia",
 "es": "rafia tejida a mano con ganchillo",
 "tr": "el örgüsü rafya",
 "ar": "رافيا مصنوعة بالكروشيه اليدوي"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Solo rafia — tejida a ganchillo",
 "tr": "Yalnızca rafya — kroşe",
 "ar": "رافيا فقط — مصنوعة بالكروشيه"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Environ 4.5 cm diameter (chaque piece peut legerement varier).",
 "en": "Approx. 4.5 cm diameter (each piece may vary slightly).",
 "es": "Aprox. 4,5 cm de diámetro (cada pieza puede variar ligeramente).",
 "tr": "Yaklaşık 4,5 cm çap (her parça hafifçe farklılık gösterebilir).",
 "ar": "حوالي 4.5 سم قطر (قد تختلف كل قطعة قليلاً)."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Boucle en raffia et anneau doré 2 cm. Anneau de 3 cm disponible pour les bundles.",
 "en": "Raffia loop and 2 cm gold ring. 3 cm ring available for bundles.",
 "es": "Lazo de rafia y aro dorado de 2 cm. Aro de 3 cm disponible para los bundles.",
 "tr": "Rafya halka ve 2 cm altın halka. Bundle'lar için 3 cm halka mevcut.",
 "ar": "حلقة رافيا وحلقة ذهبية 2 سم. تتوفر حلقة 3 سم للحزم."
 },
 "handworkTime": {
 "fr": "3 h de crochet main pour ce fruit.",
 "en": "3 hours of hand crochet for this fruit.",
 "es": "3 horas de crochet a mano para esta fruta.",
 "tr": "Bu meyve için 3 saat el kroşesi.",
 "ar": "3 ساعات كروشيه يدوي لهذه الفاكهة."
 },
 "howToWear": {
 "title": {
 "fr": "Comment le porter",
 "en": "How to wear it",
 "es": "Cómo llevarlo",
 "tr": "Nasıl kullanılır",
 "ar": "كيف تلبسينه"
 },
 "intro": {
 "fr": "Utilisez ce Fruit Charm sur:",
 "en": "Use this Fruit Charm on:",
 "es": "Úsalo en:",
 "tr": "Bu Meyve Charm'ı şunlara takın:",
 "ar": "استخدمي هذا الميدالية الفاكهة على:"
 },
 "items": [
 {
 "fr": "Les sacs YZA, La Vague et autres paniers de la marque.",
 "en": "YZA bags, La Vague and other YZA baskets.",
 "es": "Bolsos YZA, La Vague y otros cestos de la marca.",
 "tr": "YZA çantaları, La Vague ve diğer YZA sepetleri.",
 "ar": "حقائب YZA، La Vague وسلال YZA الأخرى."
 },
 {
 "fr": "Vos sacs en cuir pour ajouter une touche de personnalité et de couleur.",
 "en": "Leather bags to add personality and colour.",
 "es": "Bolsos de piel para añadir personalidad y color.",
 "tr": "Kişilik ve renk katmak için deri çantalar.",
 "ar": "الحقائب الجلدية لإضافة شخصية ولون."
 },
 {
 "fr": "Paniers en paille, market totes et sacs de plage.",
 "en": "Straw baskets, market totes and beach bags.",
 "es": "Cestos de paja, bolsas de mercado y bolsas de playa.",
 "tr": "Hasır sepetler, alışveriş çantaları ve plaj çantaları.",
 "ar": "السلال القشية، وحقائب السوق، وحقائب الشاطئ."
 },
 {
 "fr": "Clés, porte-clés et pochettes.",
 "en": "Keys, keychains and pouches.",
 "es": "Llaves, llaveros y bolsillos.",
 "tr": "Anahtarlar, anahtarlıklar ve kılıflar.",
 "ar": "المفاتيح والمفاتيح وحافظات المفاتيح."
 }
 ],
 "styleTip": {
 "fr": "Best alone for a graphic touch, or mixed with lemon and tomato for a warm market story.",
 "en": "Best alone for a graphic touch, or mixed with lemon and tomato for a warm market story.",
 "es": "Mejor solo para un toque gráfico, o combinado con limón y tomate para contar una historia de mercado cálida.",
 "tr": "Grafik bir dokunuş için yalnız ya da sıcak bir pazar hikayesi için limon ve domatesle karıştırılmış en iyisi.",
 "ar": "الأفضل وحده للمسة رسومية، أو مع الليمون والطماطم لرواية قصة سوق دافئة."
 },
 "note": {
 "fr": "Chaque charm vient avec une petite boucle. L anneau dore est inclus dans les bundles et peut etre ajoute au studio pour un charm seul.",
 "en": "Every charm comes with a small loop. The gold ring is included with bundles and can be added in studio for single charms.",
 "es": "Cada charm incluye un lazo pequeño. El aro dorado viene incluido en los bundles y puede añadirse en el estudio para charms individuales.",
 "tr": "Her charm küçük bir halkayla birlikte gelir. Altın halka bundle'lara dahildir; tek charmlar için stüdyoda eklenebilir.",
 "ar": "كل ميدالية تأتي مع حلقة صغيرة. الحلقة الذهبية مشمولة في الحزم ويمكن إضافتها في الأستوديو للميداليات المفردة."
 }
 },
 "fruitStory": {
 "title": {
 "fr": "Orange: the little sun.",
 "en": "Orange: the little sun.",
 "es": "La naranja: el pequeño sol.",
 "tr": "Portakal: küçük güneş.",
 "ar": "البرتقال: الشمس الصغيرة."
 },
 "body": {
 "fr": "This is the charm closest to Marrakesh light. A round orange on the handle feels simple from far away, then you see the hand tension and the tiny stitches up close.",
 "en": "This is the charm closest to Marrakesh light. A round orange on the handle feels simple from far away, then you see the hand tension and the tiny stitches up close.",
 "es": "Este es el charm más cercano a la luz de Marrakech. Una naranja redonda en el asa parece sencilla de lejos; de cerca se ven la tensión manual y los diminutos puntos.",
 "tr": "Bu, Marakeş ışığına en yakın charm. Kulptaki yuvarlak portakal uzaktan sade görünüyor, yakından bakınca el gerginliğini ve küçük iğneleri fark ediyorsunuz.",
 "ar": "هذه هي الميدالية الأقرب إلى ضوء مراكش. البرتقالة المستديرة على المقبض تبدو بسيطة من بعيد، ثم من قريب ترى شدّ اليد والغرز الدقيقة."
 },
 "collectionTitle": {
 "fr": "Fruit Market : inspiré des marchés de Marrakech",
 "en": "Fruit Market: inspired by the Marrakesh markets",
 "es": "Fruit Market: inspirado en los mercados de Marrakech",
 "tr": "Fruit Market: Marakeş pazarlarından ilham alınmıştır",
 "ar": "Fruit Market: مستوحى من أسواق مراكش"
 },
 "collectionBody": {
 "fr": "Les Fruit Charms viennent des étals de notre quartier de Guéliz — ceux de la médina comme ceux des camionnettes au coin de la rue. Oranges, citrons, pastèques, avocats, raisins, cerises : le raffia est teint par nos soins dans des couleurs emblématiques, puis crocheté fruit par fruit — l’une des techniques les plus délicates. Un charm ne se clipse pas qu’au sac : il se porte aussi sur un bijou, et avec les petits anneaux dorés offerts à l’achat des boucles, plusieurs charms se combinent ou se portent en collier. De véritables cartes postales de Marrakech.",
 "en": "The YZA Fruit Charms come from the stalls of our Guéliz neighbourhood — the médina ones and the street-corner vans alike. Oranges, lemons, watermelons, avocados, grapes, cherries: we hand-dye the raffia in iconic shades, then crochet it fruit by fruit — one of the most delicate crafts there is. A charm doesn’t only clip to a bag: it wears on jewellery too, and with the little gold rings gifted when you buy the earrings, several charms combine or wear as a necklace. True postcards from Marrakesh.",
 "es": "Los Fruit Charms de YZA vienen de los puestos de nuestro barrio de Guéliz, tanto los de la medina como las camionetas de la esquina. Naranjas, limones, sandías, aguacates, uvas, cerezas: teñimos la rafia a mano en colores emblemáticos y luego la tejemos fruta por fruta, una de las técnicas más delicadas. Un charm no solo se engancha al bolso: también se lleva en una joya, y con los pequeños aros dorados que se regalan al comprar los pendientes, varios charms se combinan o se llevan como collar. Verdaderas postales de Marrakech.",
 "tr": "YZA Meyve Charmları, Marakeş pazar tezgahlarından geliyor: portakal, limon, karpuz, domates, avokado, üzüm ve kiraz; çanta nız için küçük rafya parçalarına dönüştürülmüş. Her meyve, Guéliz atölyesinde lif lif el kroşesiyle yapılır, ardından altın YZA etiketiyle bitirilir.",
 "ar": "تأتي ميداليات الفاكهة من YZA من أكشاك حيّنا Guéliz — من المدينة القديمة ومن شاحنات زوايا الشوارع. برتقال، ليمون، بطيخ، أفوكادو، عنب، كرز: نصبغ الرافيا يدويًا بألوان مميزة، ثم نحيكها فاكهةً فاكهة — إحدى أدقّ التقنيات. الميدالية لا تُعلّق على الحقيبة فقط: تُلبس على قطعة مجوهرات أيضًا، ومع الحلقات الذهبية الصغيرة المُهداة عند شراء الأقراط، تتجمّع عدة ميداليات أو تُلبس كقلادة. بطاقات بريدية حقيقية من مراكش."
 },
 "liveUrl": "https://yza-shop.com/products/orange-raffia-bag-charm"
 },
 "making": {
 "fr": "This is the charm closest to Marrakesh light. A round orange on the handle feels simple from far away, then you see the hand tension and the tiny stitches up close. Chaque piece est travaillee au crochet main dans l atelier de Guéliz, puis controlee avant la pose de l etiquette YZA.",
 "en": "This is the charm closest to Marrakesh light. A round orange on the handle feels simple from far away, then you see the hand tension and the tiny stitches up close. Each piece is hand-crocheted in the Guéliz atelier, then checked before the YZA tag is added.",
 "es": "Este es el charm más cercano a la luz de Marrakech. Una naranja redonda en el asa parece sencilla de lejos; de cerca se ven la tensión manual y los diminutos puntos. Cada pieza está tejida a mano en el taller de Guéliz y revisada antes de poner la etiqueta YZA.",
 "tr": "Bu, Marakeş ışığına en yakın charm. Kulptaki yuvarlak portakal uzaktan sade görünüyor, yakından bakınca el gerginliğini ve küçük iğneleri fark ediyorsunuz. Her parça Guéliz atölyesinde el kroşesiyle yapılır, ardından YZA etiketi eklenmeden önce kontrol edilir.",
 "ar": "هذه هي الميدالية الأقرب إلى ضوء مراكش. البرتقالة المستديرة على المقبض تبدو بسيطة من بعيد، ثم من قريب ترى شدّ اليد والغرز الدقيقة. كل قطعة مصنوعة بالكروشيه اليدوي في أتيليه Guéliz، ثم تُفحص قبل إضافة علامة YZA."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l'eau ; s'il est mouillé, le faire sécher à l'air libre à l'ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l'anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "La rafia no necesita cuidados especiales. Evitar el agua; si se moja, dejar secar al aire libre alejada del sol directo. Evitar la exposición prolongada al sol para preservar los colores. Si el elemento dorado pierde su color, puede reemplazarse.",
 "tr": "Rafyanın özel bakıma ihtiyacı yoktur. Suyla temastan kaçının; ıslanırsa doğrudan güneş ışığından uzakta açık havada kurumaya bırakın. Renkleri korumak için uzun süreli güneş maruziyetinden kaçının. Altın öge rengini kaybederse değiştirilebilir.",
 "ar": "الرافيا لا تحتاج إلى عناية خاصة. تجنبي الماء؛ إذا ابتلت، جففيها في الهواء الطلق بعيداً عن أشعة الشمس المباشرة. تجنبي التعرض المطوّل للشمس للحفاظ على الألوان. إذا فقد العنصر الذهبي لونه، يمكن استبداله."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l'artisane qui l'a réalisée est inscrit sur l'étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Lista para regalar, con el nombre de la artesana que realizó la pieza grabado en la etiqueta YZA.",
 "tr": "Hediye için hazır; parçayı yapan ustanın adı YZA etiketine kazınmıştır.",
 "ar": "جاهزة للإهداء، مع اسم الحرفية التي صنعت القطعة منقوشاً على بطاقة YZA."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz’deki stüdyodan teslim alma mevcut.",
 "ar": "شحن مع تتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الأستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Satisfecho o reembolsado — 30 días",
 "tr": "Memnun olun ya da iade edin — 30 gün",
 "ar": "راضٍ أو مُستردّ — 30 يومًا"
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "badge": "limited",
 "hours": 3,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "watermelon-raffia-earrings-ss26",
 "lemon-slice-raffia-necklace-ss26"
 ]
 },
 {
 "handle": "raffia-tomato-charm-ss26",
 "legacyHandles": [
 "tomate"
 ],
 "sku": null,
 "name": {
 "fr": "Charm tomate en raphia",
 "en": "Raffia Tomato Charm",
 "es": "Raffia Tomato Charm",
 "tr": "Raffia Tomato Charm",
 "ar": "Raffia Tomato Charm"
 },
 "displayName": {
 "fr": "Charm tomate en raphia",
 "en": "Raffia Tomato Charm",
 "es": "Raffia Tomato Charm",
 "tr": "Raffia Tomato Charm",
 "ar": "Raffia Tomato Charm"
 },
 "short": {
 "fr": "Charm tomate en raphia, crochete main avec anneau dore 2,5 cm.",
 "en": "A raffia tomato charm, crocheted by hand with a 2.5 cm gold ring.",
 "es": "Un charm de tomate en rafia, tejido a mano con aro dorado de 2,5 cm.",
 "tr": "Bir rafya domates charm, 2,5 cm altın halkayla el kroşesiyle yapılmış.",
 "ar": "ميدالية طماطم من الرافيا، مصنوعة بالكروشيه اليدوي مع حلقة ذهبية 2.5 سم."
 },
 "displayShort": {
 "fr": "Charm tomate en raphia, crochete main avec anneau dore 2,5 cm.",
 "en": "A raffia tomato charm, crocheted by hand with a 2.5 cm gold ring.",
 "es": "Un charm de tomate en rafia, tejido a mano con aro dorado de 2,5 cm.",
 "tr": "Bir rafya domates charm, 2,5 cm altın halkayla el kroşesiyle yapılmış.",
 "ar": "ميدالية طماطم من الرافيا، مصنوعة بالكروشيه اليدوي مع حلقة ذهبية 2.5 سم."
 },
 "desc": {
 "fr": "Une mini tomate de marche a Guéliz: rouge profond, petit vert, graphique et porte-bonheur du quotidien.",
 "en": "A tiny tomato straight from a Guéliz market. Deep red with a small green top, cute and graphic. Clip it as a small everyday good-luck talisman.",
 "es": "Un pequeño tomate directo del mercado de Guéliz. Rojo intenso con un pequeño tallo verde, mono y gráfico. Llévalo como un pequeño talismán de la suerte del día a día.",
 "tr": "Guéliz pazarından gelen küçük bir domates. Küçük yeşil sapıyla koyu kırmızı, sevimli ve grafik. Günlük bir küçük şans tılsımı olarak takın.",
 "ar": "طماطمة صغيرة مباشرة من سوق Guéliz. أحمر عميق مع قمة خضراء صغيرة، لطيفة وذات طابع رسومي. علّقيها كتعويذة حظ صغيرة للحياة اليومية."
 },
 "price": 23000,
 "currency": "MAD",
 "category": "charms",
 "sourceCategory": "Fruit Charms",
 "categoryLabel": {
 "fr": "Charms",
 "en": "Charms",
 "es": "Complementos",
 "tr": "Charmlar",
 "ar": "تعليقات الحقيبة"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/original-shop/charms/raffia-tomato-charm-ss26-01.png",
 "gallery": [
 "assets/original-shop/charms/raffia-tomato-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-tomato-charm-ss26-02.webp",
 "assets/original-shop/charms/raffia-tomato-charm-ss26-03.jpg",
 "assets/original-shop/charms/raffia-tomato-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-tomato-charm-ss26-08.webp",
 "assets/original-shop/charms/raffia-tomato-charm-ss26-09.webp",
 "assets/products/accessories-clean/tomatoes-earrings-clean.webp",
 "assets/lookbook-ss26-27/embedded/p58_img02_xref1416_b7482fc1dffb.jpeg",
 "assets/lookbook-ss26-27/embedded/p59_img01_xref1426_ab1030bf5e96.jpeg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-58.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-59.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-60.jpg"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "raffia-tomato-charm-ss26",
 "sku": null,
 "category": "CHARM",
 "source_type": "tomate",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 9
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit charm",
 "Tomato",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Tomato Raffia Charm - Handmade in Marrakech",
 "seoKeywords": [
 "Accessories",
 "Charm tomate en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Tomato Charm",
 "YZA",
 "accessories",
 "bag",
 "cadeau",
 "charm",
 "charms",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "handmade",
 "porte",
 "raffia-tomato-charm-ss26",
 "tomate",
 "tomato",
 "طماطم"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Charm tomate en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Tomato Charm",
 "YZA",
 "accessories",
 "bag",
 "cadeau",
 "charm",
 "charms",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "handmade",
 "porte",
 "raffia-tomato-charm-ss26",
 "tomate",
 "tomato",
 "طماطم"
 ],
 "material": {
 "fr": "raphia crochete main raffia",
 "en": "hand-crocheted raffia",
 "es": "rafia tejida a mano con ganchillo",
 "tr": "el örgüsü rafya",
 "ar": "رافيا مصنوعة بالكروشيه اليدوي"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Solo rafia — tejida a ganchillo",
 "tr": "Yalnızca rafya — kroşe",
 "ar": "رافيا فقط — مصنوعة بالكروشيه"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Environ 4.5 cm diameter (chaque piece peut legerement varier).",
 "en": "Approx. 4.5 cm diameter (each piece may vary slightly).",
 "es": "Aprox. 4,5 cm de diámetro (cada pieza puede variar ligeramente).",
 "tr": "Yaklaşık 4,5 cm çap (her parça hafifçe farklılık gösterebilir).",
 "ar": "حوالي 4.5 سم قطر (قد تختلف كل قطعة قليلاً)."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Boucle en raffia et anneau doré 2 cm. Anneau de 3 cm disponible pour les bundles.",
 "en": "Raffia loop and 2 cm gold ring. 3 cm ring available for bundles.",
 "es": "Lazo de rafia y aro dorado de 2 cm. Aro de 3 cm disponible para los bundles.",
 "tr": "Rafya halka ve 2 cm altın halka. Bundle'lar için 3 cm halka mevcut.",
 "ar": "حلقة رافيا وحلقة ذهبية 2 سم. تتوفر حلقة 3 سم للحزم."
 },
 "handworkTime": {
 "fr": "3 h de crochet main pour ce fruit.",
 "en": "3 hours of hand crochet for this fruit.",
 "es": "3 horas de crochet a mano para esta fruta.",
 "tr": "Bu meyve için 3 saat el kroşesi.",
 "ar": "3 ساعات كروشيه يدوي لهذه الفاكهة."
 },
 "howToWear": {
 "title": {
 "fr": "Comment le porter",
 "en": "How to wear it",
 "es": "Cómo llevarlo",
 "tr": "Nasıl kullanılır",
 "ar": "كيف تلبسينه"
 },
 "intro": {
 "fr": "Utilisez ce Fruit Charm sur:",
 "en": "Use this Fruit Charm on:",
 "es": "Úsalo en:",
 "tr": "Bu Meyve Charm’ı şunlara takın:",
 "ar": "استخدمي هذا الميدالية الفاكهة على:"
 },
 "items": [
 {
 "fr": "Les sacs YZA, La Vague et autres paniers de la marque.",
 "en": "YZA bags, La Vague and other YZA baskets.",
 "es": "Bolsos YZA, La Vague y otros cestos de la marca.",
 "tr": "YZA çantaları, La Vague ve diğer YZA sepetleri.",
 "ar": "حقائب YZA، La Vague وسلال YZA الأخرى."
 },
 {
 "fr": "Vos sacs en cuir pour ajouter une touche de personnalité et de couleur.",
 "en": "Leather bags to add personality and colour.",
 "es": "Bolsos de piel para añadir personalidad y color.",
 "tr": "Kişilik ve renk katmak için deri çantalar.",
 "ar": "الحقائب الجلدية لإضافة شخصية ولون."
 },
 {
 "fr": "Paniers en paille, market totes et sacs de plage.",
 "en": "Straw baskets, market totes and beach bags.",
 "es": "Cestos de paja, bolsas de mercado y bolsas de playa.",
 "tr": "Hasır sepetler, alışveriş çantaları ve plaj çantaları.",
 "ar": "السلال القشية، وحقائب السوق، وحقائب الشاطئ."
 },
 {
 "fr": "Clés, porte-clés et pochettes.",
 "en": "Keys, keychains and pouches.",
 "es": "Llaves, llaveros y bolsillos.",
 "tr": "Anahtarlar, anahtarlıklar ve kılıflar.",
 "ar": "المفاتيح والمفاتيح وحافظات المفاتيح."
 }
 ],
 "styleTip": {
 "fr": "Best on straw, denim and black bags. Pair with watermelon when the look needs more red.",
 "en": "Best on straw, denim and black bags. Pair with watermelon when the look needs more red.",
 "es": "Mejor en paja, denim y bolsos negros. Combínalo con sandía cuando el look necesita más rojo.",
 "tr": "Hasır, denim ve siyah çantalarda en iyisi. Görünüm daha fazla kırmızıya ihtiyaç duyduğunda karpuzla eşleştirin.",
 "ar": "الأفضل على القش والدنيم والحقائب السوداء. زوّجيه بالبطيخ حين يحتاج اللوك المزيد من الأحمر."
 },
 "note": {
 "fr": "Chaque charm vient avec une petite boucle. L anneau dore est inclus dans les bundles et peut etre ajoute au studio pour un charm seul.",
 "en": "Every charm comes with a small loop. The gold ring is included with bundles and can be added in studio for single charms.",
 "es": "Cada charm incluye un lazo pequeño. El aro dorado viene incluido en los bundles y puede añadirse en el estudio para charms individuales.",
 "tr": "Her charm küçük bir halkayla birlikte gelir. Altın halka bundle’lara dahildir; tek charmlar için stüdyoda eklenebilir.",
 "ar": "كل ميدالية تأتي مع حلقة صغيرة. الحلقة الذهبية مشمولة في الحزم ويمكن إضافتها في الأستوديو للميداليات المفردة."
 }
 },
 "fruitStory": {
 "title": {
 "fr": "Tomato: the market talisman.",
 "en": "Tomato: the market talisman.",
 "es": "El tomate: el talismán del mercado.",
 "tr": "Domates: pazarın tılsımı.",
 "ar": "الطماطم: تعويذة السوق."
 },
 "body": {
 "fr": "The tomato is humble in the best way. It comes from the everyday market table, not a fantasy. In raffia, it becomes a tiny red talisman: familiar, funny, very YZA.",
 "en": "The tomato is humble in the best way. It comes from the everyday market table, not a fantasy. In raffia, it becomes a tiny red talisman: familiar, funny, very YZA.",
 "es": "El tomate es humilde de la mejor manera. Viene de la mesa del mercado de todos los días, no de la fantasía. En rafia, se convierte en un pequeño talismán rojo: familiar, gracioso, muy YZA.",
 "tr": "Domates en iyi anlamda alçakgönüllüdür. Hayal gücünden değil, günlük pazar tezgahından geliyor. Rafyada küçük kırmızı bir tılsım oluyor: tanıdık, eğlenceli, çok YZA.",
 "ar": "الطماطم متواضعة بأفضل معنى. تأتي من طاولة السوق اليومية، لا من الخيال. في الرافيا، تصبح تعويذة حمراء صغيرة: مألوفة، مضحكة، YZA جداً."
 },
 "collectionTitle": {
 "fr": "Fruit Market : inspiré des marchés de Marrakech",
 "en": "Fruit Market: inspired by the Marrakesh markets",
 "es": "Fruit Market: inspirado en los mercados de Marrakech",
 "tr": "Fruit Market: Marakeş pazarlarından ilham alınmıştır",
 "ar": "Fruit Market: مستوحى من أسواق مراكش"
 },
 "collectionBody": {
 "fr": "Les Fruit Charms viennent des étals de notre quartier de Guéliz — ceux de la médina comme ceux des camionnettes au coin de la rue. Oranges, citrons, pastèques, avocats, raisins, cerises : le raffia est teint par nos soins dans des couleurs emblématiques, puis crocheté fruit par fruit — l’une des techniques les plus délicates. Un charm ne se clipse pas qu’au sac : il se porte aussi sur un bijou, et avec les petits anneaux dorés offerts à l’achat des boucles, plusieurs charms se combinent ou se portent en collier. De véritables cartes postales de Marrakech.",
 "en": "The YZA Fruit Charms come from the stalls of our Guéliz neighbourhood — the médina ones and the street-corner vans alike. Oranges, lemons, watermelons, avocados, grapes, cherries: we hand-dye the raffia in iconic shades, then crochet it fruit by fruit — one of the most delicate crafts there is. A charm doesn’t only clip to a bag: it wears on jewellery too, and with the little gold rings gifted when you buy the earrings, several charms combine or wear as a necklace. True postcards from Marrakesh.",
 "es": "Los Fruit Charms de YZA vienen de los puestos de nuestro barrio de Guéliz, tanto los de la medina como las camionetas de la esquina. Naranjas, limones, sandías, aguacates, uvas, cerezas: teñimos la rafia a mano en colores emblemáticos y luego la tejemos fruta por fruta, una de las técnicas más delicadas. Un charm no solo se engancha al bolso: también se lleva en una joya, y con los pequeños aros dorados que se regalan al comprar los pendientes, varios charms se combinan o se llevan como collar. Verdaderas postales de Marrakech.",
 "tr": "YZA Meyve Charmları, Guéliz mahallemizin tezgâhlarından gelir — hem medinadakiler hem de sokak köşesindeki kamyonetler. Portakal, limon, karpuz, avokado, üzüm, kiraz: rafyayı ikonik tonlarda elde boyar, sonra meyve meyve örüyoruz — var olan en zarif tekniklerden biri. Bir charm yalnızca çantaya takılmaz: bir takının üzerinde de taşınır ve küpe alırken hediye edilen küçük altın halkalarla birkaç charm birleşir ya da kolye gibi takılır. Marakeş’ten gerçek kartpostallar.",
 "ar": "تأتي ميداليات الفاكهة من YZA من أكشاك حيّنا Guéliz — من المدينة القديمة ومن شاحنات زوايا الشوارع. برتقال، ليمون، بطيخ، أفوكادو، عنب، كرز: نصبغ الرافيا يدويًا بألوان مميزة، ثم نحيكها فاكهةً فاكهة — إحدى أدقّ التقنيات. الميدالية لا تُعلّق على الحقيبة فقط: تُلبس على قطعة مجوهرات أيضًا، ومع الحلقات الذهبية الصغيرة المُهداة عند شراء الأقراط، تتجمّع عدة ميداليات أو تُلبس كقلادة. بطاقات بريدية حقيقية من مراكش."
 },
 "liveUrl": "https://yza-shop.com/products/tomato-raffia-bag-charm"
 },
 "making": {
 "fr": "The tomato is humble in the best way. It comes from the everyday market table, not a fantasy. In raffia, it becomes a tiny red talisman: familiar, funny, very YZA. Chaque piece est travaillee au crochet main dans l atelier de Guéliz, puis controlee avant la pose de l etiquette YZA.",
 "en": "The tomato is humble in the best way. It comes from the everyday market table, not a fantasy. In raffia, it becomes a tiny red talisman: familiar, funny, very YZA. Each piece is hand-crocheted in the Guéliz atelier, then checked before the YZA tag is added.",
 "es": "El tomate es humilde de la mejor manera. Viene de la mesa del mercado de todos los días, no de la fantasía. En rafia, se convierte en un pequeño talismán rojo: familiar, gracioso, muy YZA. Cada pieza está tejida a mano en el taller de Guéliz y revisada antes de poner la etiqueta YZA.",
 "tr": "Domates en iyi anlamda alçakgönüllüdür. Hayal gücünden değil, günlük pazar tezgahından geliyor. Rafyada küçük kırmızı bir tılsım oluyor: tanıdık, eğlenceli, çok YZA. Her parça Guéliz atölyesinde el kroşesiyle yapılır, ardından YZA etiketi eklenmeden önce kontrol edilir.",
 "ar": "الطماطم متواضعة بأفضل معنى. تأتي من طاولة السوق اليومية، لا من الخيال. في الرافيا، تصبح تعويذة حمراء صغيرة: مألوفة، مضحكة، YZA جداً. كل قطعة مصنوعة بالكروشيه اليدوي في أتيليه Guéliz، ثم تُفحص قبل إضافة علامة YZA."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l'eau ; s'il est mouillé, le faire sécher à l'air libre à l'ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l'anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "La rafia no necesita cuidados especiales. Evitar el agua; si se moja, dejar secar al aire libre alejada del sol directo. Evitar la exposición prolongada al sol para preservar los colores. Si el elemento dorado pierde su color, puede reemplazarse.",
 "tr": "Rafyanın özel bakıma ihtiyacı yoktur. Suyla temastan kaçının; ıslanırsa doğrudan güneş ışığından uzakta açık havada kurumaya bırakın. Renkleri korumak için uzun süreli güneş maruziyetinden kaçının. Altın öge rengini kaybederse değiştirilebilir.",
 "ar": "الرافيا لا تحتاج إلى عناية خاصة. تجنبي الماء؛ إذا ابتلت، جففيها في الهواء الطلق بعيداً عن أشعة الشمس المباشرة. تجنبي التعرض المطوّل للشمس للحفاظ على الألوان. إذا فقد العنصر الذهبي لونه، يمكن استبداله."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l’artisane qui l’a réalisée est inscrit sur l’étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Lista para regalar, con el nombre de la artesana que realizó la pieza grabado en la etiqueta YZA.",
 "tr": "Hediye için hazır; parçayı yapan ustanın adı YZA etiketine kazınmıştır.",
 "ar": "جاهزة للإهداء، مع اسم الحرفية التي صنعت القطعة منقوشاً على بطاقة YZA."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz’deki stüdyodan teslim alma mevcut.",
 "ar": "شحن مع تتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الأستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Satisfecho o reembolsado — 30 días",
 "tr": "Memnun olun ya da iade edin — 30 gün",
 "ar": "راضٍ أو مُستردّ — 30 يومًا"
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "badge": "limited",
 "hours": 3,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "watermelon-raffia-earrings-ss26",
 "lemon-slice-raffia-necklace-ss26"
 ]
 },
 {
 "handle": "raffia-lemon-slice-charm-ss26",
 "legacyHandles": [
 "tranche-citron"
 ],
 "sku": null,
 "name": {
 "fr": "Charm tranche de citron en raphia",
 "en": "Raffia Lemon Slice Charm",
 "es": "Raffia Lemon Slice Charm",
 "tr": "Raffia Lemon Slice Charm",
 "ar": "Raffia Lemon Slice Charm"
 },
 "displayName": {
 "fr": "Charm tranche de citron en raphia",
 "en": "Raffia Lemon Slice Charm",
 "es": "Raffia Lemon Slice Charm",
 "tr": "Raffia Lemon Slice Charm",
 "ar": "Raffia Lemon Slice Charm"
 },
 "short": {
 "fr": "Charm tranche de citron en raphia, crochete main avec anneau dore 2,5 cm.",
 "en": "A crocheted raffia lemon slice charm with a 2.5 cm gold ring.",
 "es": "Un charm de rodaja de limón en rafia tejido a ganchillo, con aro dorado de 2,5 cm.",
 "tr": "Bir tığ işi rafya limon dilimi charm, 2,5 cm altın halkayla.",
 "ar": "ميدالية شريحة ليمون من الرافيا بالكروشيه، مع حلقة ذهبية 2.5 سم."
 },
 "displayShort": {
 "fr": "Charm tranche de citron en raphia, crochete main avec anneau dore 2,5 cm.",
 "en": "A crocheted raffia lemon slice charm with a 2.5 cm gold ring.",
 "es": "Un charm de rodaja de limón en rafia tejido a ganchillo, con aro dorado de 2,5 cm.",
 "tr": "Bir tığ işi rafya limon dilimi charm, 2,5 cm altın halkayla.",
 "ar": "ميدالية شريحة ليمون من الرافيا بالكروشيه، مع حلقة ذهبية 2.5 سم."
 },
 "desc": {
 "fr": "Frais, vif, presque citronnade: une touche jaune nette pour reveiller sac noir, nude ou panier.",
 "en": "Bright, zesty and super fresh. The Lemon Slice charm wakes up black, nude or straw bags with a clean pop of yellow.",
 "es": "Brillante, vibrante y superfresh. El charm de rodaja de limón despierta bolsos negros, nude o de paja con un toque limpio de amarillo.",
 "tr": "Parlak, ferahlatıcı ve süper taze. Limon Dilimi charm, siyah, nud veya hasır çantaları temiz bir sarı renk patlamasıyla canlandırıyor.",
 "ar": "مشرقة ومنعشة جداً. ميدالية شريحة الليمون تُحيي الحقائب السوداء أو البيج أو القشية بلمسة صفراء نقية."
 },
 "price": 19000,
 "currency": "MAD",
 "category": "charms",
 "sourceCategory": "Fruit Charms",
 "categoryLabel": {
 "fr": "Charms",
 "en": "Charms",
 "es": "Complementos",
 "tr": "Charmlar",
 "ar": "تعليقات الحقيبة"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/original-shop/charms/raffia-lemon-slice-charm-ss26-01.png",
 "gallery": [
 "assets/original-shop/charms/raffia-lemon-slice-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-lemon-slice-charm-ss26-02.jpg",
 "assets/original-shop/charms/raffia-lemon-slice-charm-ss26-03.webp",
 "assets/original-shop/charms/raffia-lemon-slice-charm-ss26-06.webp",
 "assets/original-shop/charms/raffia-lemon-slice-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-lemon-slice-charm-ss26-08.webp",
 "assets/products/accessories-clean/lemon-slice-necklace-clean.webp",
 "assets/lookbook-ss26-27/embedded/p58_img02_xref1416_b7482fc1dffb.jpeg",
 "assets/lookbook-ss26-27/embedded/p59_img01_xref1426_ab1030bf5e96.jpeg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-58.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-59.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-60.jpg"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "raffia-lemon-slice-charm-ss26",
 "sku": null,
 "category": "CHARM",
 "source_type": "lemon slice",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 7
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit charm",
 "Lemon slice",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Lemon Slice Raffia Charm - Handmade in Marrakech",
 "seoKeywords": [
 "Accessories",
 "Charm tranche de citron en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Lemon Slice Charm",
 "YZA",
 "accessories",
 "bag",
 "cadeau",
 "charm",
 "charms",
 "citron",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "handmade",
 "limon",
 "porte",
 "raffia-lemon-slice-charm-ss26",
 "ليمون"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Charm tranche de citron en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Lemon Slice Charm",
 "YZA",
 "accessories",
 "bag",
 "cadeau",
 "charm",
 "charms",
 "citron",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "handmade",
 "limon",
 "porte",
 "raffia-lemon-slice-charm-ss26",
 "ليمون"
 ],
 "material": {
 "fr": "raphia crochete main raffia",
 "en": "hand-crocheted raffia",
 "es": "rafia tejida a mano con ganchillo",
 "tr": "el örgüsü rafya",
 "ar": "رافيا مصنوعة بالكروشيه اليدوي"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Solo rafia — tejida a ganchillo",
 "tr": "Yalnızca rafya — kroşe",
 "ar": "رافيا فقط — مصنوعة بالكروشيه"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Environ 6 x 4 cm (chaque piece peut legerement varier).",
 "en": "Approx. 6 x 4 cm (each piece may vary slightly).",
 "es": "Aprox. 6 x 4 cm (cada pieza puede variar ligeramente).",
 "tr": "Yaklaşık 6 x 4 cm (her parça hafifçe farklılık gösterebilir).",
 "ar": "حوالي 6 x 4 سم (قد تختلف كل قطعة قليلاً)."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Boucle en raffia et anneau doré 2 cm. Anneau de 3 cm disponible pour les bundles.",
 "en": "Raffia loop and 2 cm gold ring. 3 cm ring available for bundles.",
 "es": "Lazo de rafia y aro dorado de 2 cm. Aro de 3 cm disponible para los bundles.",
 "tr": "Rafya halka ve 2 cm altın halka. Bundle'lar için 3 cm halka mevcut.",
 "ar": "حلقة رافيا وحلقة ذهبية 2 سم. تتوفر حلقة 3 سم للحزم."
 },
 "handworkTime": {
 "fr": "1 h de crochet main pour ce fruit.",
 "en": "1 hours of hand crochet for this fruit.",
 "es": "1 hora de crochet a mano para esta fruta.",
 "tr": "Bu meyve için 1 saat el kroşesi.",
 "ar": "ساعة واحدة من الكروشيه اليدوي لهذه الفاكهة."
 },
 "howToWear": {
 "title": {
 "fr": "Comment le porter",
 "en": "How to wear it",
 "es": "Cómo llevarlo",
 "tr": "Nasıl kullanılır",
 "ar": "كيف تلبسينه"
 },
 "intro": {
 "fr": "Utilisez ce Fruit Charm sur:",
 "en": "Use this Fruit Charm on:",
 "es": "Úsalo en:",
 "tr": "Bu Meyve Charm'ı şunlara takın:",
 "ar": "استخدمي هذا الميدالية الفاكهة على:"
 },
 "items": [
 {
 "fr": "Les sacs YZA, La Vague et autres paniers de la marque.",
 "en": "YZA bags, La Vague and other YZA baskets.",
 "es": "Bolsos YZA, La Vague y otros cestos de la marca.",
 "tr": "YZA çantaları, La Vague ve diğer YZA sepetleri.",
 "ar": "حقائب YZA، La Vague وسلال YZA الأخرى."
 },
 {
 "fr": "Vos sacs en cuir pour ajouter une touche de personnalité et de couleur.",
 "en": "Leather bags to add personality and colour.",
 "es": "Bolsos de piel para añadir personalidad y color.",
 "tr": "Kişilik ve renk katmak için deri çantalar.",
 "ar": "الحقائب الجلدية لإضافة شخصية ولون."
 },
 {
 "fr": "Paniers en paille, market totes et sacs de plage.",
 "en": "Straw baskets, market totes and beach bags.",
 "es": "Cestos de paja, bolsas de mercado y bolsas de playa.",
 "tr": "Hasır sepetler, alışveriş çantaları ve plaj çantaları.",
 "ar": "السلال القشية، وحقائب السوق، وحقائب الشاطئ."
 },
 {
 "fr": "Clés, porte-clés et pochettes.",
 "en": "Keys, keychains and pouches.",
 "es": "Llaves, llaveros y bolsillos.",
 "tr": "Anahtarlar, anahtarlıklar ve kılıflar.",
 "ar": "المفاتيح والمفاتيح وحافظات المفاتيح."
 }
 ],
 "styleTip": {
 "fr": "Best on black, nude, straw and beach totes. Add orange slice for the bold citrus duo.",
 "en": "Best on black, nude, straw and beach totes. Add orange slice for the bold citrus duo.",
 "es": "Mejor en negro, nude, paja y bolsas de playa. Añade rodaja de naranja para el atrevido dúo cítrico.",
 "tr": "Siyah, nud, hasır ve plaj çantalarında en iyisi. Cesur turunçgil ikilisi için portakal dilimi ekleyin.",
 "ar": "الأفضل على الأسود والبيج والقش وحقائب الشاطئ. أضيفي شريحة البرتقال للثنائي الحمضي الجريء."
 },
 "note": {
 "fr": "Chaque charm vient avec une petite boucle. L anneau dore est inclus dans les bundles et peut etre ajoute au studio pour un charm seul.",
 "en": "Every charm comes with a small loop. The gold ring is included with bundles and can be added in studio for single charms.",
 "es": "Cada charm incluye un lazo pequeño. El aro dorado viene incluido en los bundles y puede añadirse en el estudio para charms individuales.",
 "tr": "Her charm küçük bir halkayla birlikte gelir. Altın halka bundle'lara dahildir; tek charmlar için stüdyoda eklenebilir.",
 "ar": "كل ميدالية تأتي مع حلقة صغيرة. الحلقة الذهبية مشمولة في الحزم ويمكن إضافتها في الأستوديو للميداليات المفردة."
 }
 },
 "fruitStory": {
 "title": {
 "fr": "Lemon slice: Marrakesh lemonade.",
 "en": "Lemon slice: Marrakesh lemonade.",
 "es": "Rodaja de limón: limonada marrakchí.",
 "tr": "Limon dilimi: Marakeş limonalası.",
 "ar": "شريحة الليمون: عصير ليمون مراكش."
 },
 "body": {
 "fr": "The lemon slice is the lightest way into Fruit Market: a little sun, a little acid, very easy to style. It feels like the first sip of fresh juice when the city is already warm.",
 "en": "The lemon slice is the lightest way into Fruit Market: a little sun, a little acid, very easy to style. It feels like the first sip of fresh juice when the city is already warm.",
 "es": "La rodaja de limón es la manera más ligera de entrar en Fruit Market: un poco de sol, un poco de acidez, muy fácil de combinar. Es como el primer sorbo de zumo fresco cuando la ciudad ya calienta.",
 "tr": "Limon dilimi, Fruit Market'e girmenin en hafif yolu: biraz güneş, biraz asitlik, stilize etmesi çok kolay. Şehir zaten ısındığında taze meyve suyunun ilk yudumu gibi hissettiriyor.",
 "ar": "شريحة الليمون هي أخف طريقة للدخول إلى Fruit Market: بعض الشمس، بعض الحموضة، سهلة التنسيق جداً. تشعر كأول رشفة عصير طازج حين تكون المدينة دافئة بالفعل."
 },
 "collectionTitle": {
 "fr": "Fruit Market : inspiré des marchés de Marrakech",
 "en": "Fruit Market: inspired by the Marrakesh markets",
 "es": "Fruit Market: inspirado en los mercados de Marrakech",
 "tr": "Fruit Market: Marakeş pazarlarından ilham alınmıştır",
 "ar": "Fruit Market: مستوحى من أسواق مراكش"
 },
 "collectionBody": {
 "fr": "Les Fruit Charms viennent des étals de notre quartier de Guéliz — ceux de la médina comme ceux des camionnettes au coin de la rue. Oranges, citrons, pastèques, avocats, raisins, cerises : le raffia est teint par nos soins dans des couleurs emblématiques, puis crocheté fruit par fruit — l’une des techniques les plus délicates. Un charm ne se clipse pas qu’au sac : il se porte aussi sur un bijou, et avec les petits anneaux dorés offerts à l’achat des boucles, plusieurs charms se combinent ou se portent en collier. De véritables cartes postales de Marrakech.",
 "en": "The YZA Fruit Charms come from the stalls of our Guéliz neighbourhood — the médina ones and the street-corner vans alike. Oranges, lemons, watermelons, avocados, grapes, cherries: we hand-dye the raffia in iconic shades, then crochet it fruit by fruit — one of the most delicate crafts there is. A charm doesn’t only clip to a bag: it wears on jewellery too, and with the little gold rings gifted when you buy the earrings, several charms combine or wear as a necklace. True postcards from Marrakesh.",
 "es": "Los Fruit Charms de YZA vienen de los puestos de nuestro barrio de Guéliz, tanto los de la medina como las camionetas de la esquina. Naranjas, limones, sandías, aguacates, uvas, cerezas: teñimos la rafia a mano en colores emblemáticos y luego la tejemos fruta por fruta, una de las técnicas más delicadas. Un charm no solo se engancha al bolso: también se lleva en una joya, y con los pequeños aros dorados que se regalan al comprar los pendientes, varios charms se combinan o se llevan como collar. Verdaderas postales de Marrakech.",
 "tr": "YZA Meyve Charmları, Guéliz mahallemizin tezgâhlarından gelir — hem medinadakiler hem de sokak köşesindeki kamyonetler. Portakal, limon, karpuz, avokado, üzüm, kiraz: rafyayı ikonik tonlarda elde boyar, sonra meyve meyve örüyoruz — var olan en zarif tekniklerden biri. Bir charm yalnızca çantaya takılmaz: bir takının üzerinde de taşınır ve küpe alırken hediye edilen küçük altın halkalarla birkaç charm birleşir ya da kolye gibi takılır. Marakeş’ten gerçek kartpostallar.",
 "ar": "تأتي ميداليات الفاكهة من YZA من أكشاك حيّنا Guéliz — من المدينة القديمة ومن شاحنات زوايا الشوارع. برتقال، ليمون، بطيخ، أفوكادو، عنب، كرز: نصبغ الرافيا يدويًا بألوان مميزة، ثم نحيكها فاكهةً فاكهة — إحدى أدقّ التقنيات. الميدالية لا تُعلّق على الحقيبة فقط: تُلبس على قطعة مجوهرات أيضًا، ومع الحلقات الذهبية الصغيرة المُهداة عند شراء الأقراط، تتجمّع عدة ميداليات أو تُلبس كقلادة. بطاقات بريدية حقيقية من مراكش."
 },
 "liveUrl": "https://yza-shop.com/products/lemon-slice-raphia-bag-charm"
 },
 "making": {
 "fr": "The lemon slice is the lightest way into Fruit Market: a little sun, a little acid, very easy to style. It feels like the first sip of fresh juice when the city is already warm. Chaque piece est travaillee au crochet main dans l atelier de Guéliz, puis controlee avant la pose de l etiquette YZA.",
 "en": "The lemon slice is the lightest way into Fruit Market: a little sun, a little acid, very easy to style. It feels like the first sip of fresh juice when the city is already warm. Each piece is hand-crocheted in the Guéliz atelier, then checked before the YZA tag is added.",
 "es": "La rodaja de limón es la manera más ligera de entrar en Fruit Market: un poco de sol, un poco de acidez, muy fácil de combinar. Es como el primer sorbo de zumo fresco cuando la ciudad ya calienta. Cada pieza está tejida a mano en el taller de Guéliz y revisada antes de poner la etiqueta YZA.",
 "tr": "Limon dilimi, Fruit Market'e girmenin en hafif yolu: biraz güneş, biraz asitlik, stilize etmesi çok kolay. Şehir zaten ısındığında taze meyve suyunun ilk yudumu gibi hissettiriyor. Her parça Guéliz atölyesinde el kroşesiyle yapılır, ardından YZA etiketi eklenmeden önce kontrol edilir.",
 "ar": "شريحة الليمون هي أخف طريقة للدخول إلى Fruit Market: بعض الشمس، بعض الحموضة، سهلة التنسيق جداً. تشعر كأول رشفة عصير طازج حين تكون المدينة دافئة بالفعل. كل قطعة مصنوعة بالكروشيه اليدوي في أتيليه Guéliz، ثم تُفحص قبل إضافة علامة YZA."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l'eau ; s'il est mouillé, le faire sécher à l'air libre à l'ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l'anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "La rafia no necesita cuidados especiales. Evitar el agua; si se moja, dejar secar al aire libre alejada del sol directo. Evitar la exposición prolongada al sol para preservar los colores. Si el elemento dorado pierde su color, puede reemplazarse.",
 "tr": "Rafyanın özel bakıma ihtiyacı yoktur. Suyla temastan kaçının; ıslanırsa doğrudan güneş ışığından uzakta açık havada kurumaya bırakın. Renkleri korumak için uzun süreli güneş maruziyetinden kaçının. Altın öge rengini kaybederse değiştirilebilir.",
 "ar": "الرافيا لا تحتاج إلى عناية خاصة. تجنبي الماء؛ إذا ابتلت، جففيها في الهواء الطلق بعيداً عن أشعة الشمس المباشرة. تجنبي التعرض المطوّل للشمس للحفاظ على الألوان. إذا فقد العنصر الذهبي لونه، يمكن استبداله."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l'artisane qui l'a réalisée est inscrit sur l'étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Lista para regalar, con el nombre de la artesana que realizó la pieza grabado en la etiqueta YZA.",
 "tr": "Hediye için hazır; parçayı yapan ustanın adı YZA etiketine kazınmıştır.",
 "ar": "جاهزة للإهداء، مع اسم الحرفية التي صنعت القطعة منقوشاً على بطاقة YZA."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz'deki stüdyodan teslim alma mevcut.",
 "ar": "شحن مع تتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الأستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Satisfecho o reembolsado — 30 días",
 "tr": "Memnun olun ya da iade edin — 30 gün",
 "ar": "راضٍ أو مُستردّ — 30 يومًا"
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "badge": "limited",
 "hours": 1,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "watermelon-raffia-earrings-ss26",
 "lemon-slice-raffia-necklace-ss26"
 ]
 },
 {
 "handle": "raffia-orange-slice-charm-ss26",
 "legacyHandles": [
 "tranche-orange"
 ],
 "sku": null,
 "name": {
 "fr": "Charm tranche d orange en raphia",
 "en": "Raffia Orange Slice Charm",
 "es": "Raffia Orange Slice Charm",
 "tr": "Raffia Orange Slice Charm",
 "ar": "Raffia Orange Slice Charm"
 },
 "displayName": {
 "fr": "Charm tranche d orange en raphia",
 "en": "Raffia Orange Slice Charm",
 "es": "Raffia Orange Slice Charm",
 "tr": "Raffia Orange Slice Charm",
 "ar": "Raffia Orange Slice Charm"
 },
 "short": {
 "fr": "Charm tranche d orange en raphia, crochete main avec anneau dore 2,5 cm.",
 "en": "A crocheted raffia orange slice charm with a 2.5 cm gold ring.",
 "es": "Un charm de rodaja de naranja en rafia tejido a ganchillo, con aro dorado de 2,5 cm.",
 "tr": "Bir tığ işi rafya portakal dilimi charm, 2,5 cm altın halkayla.",
 "ar": "ميدالية شريحة برتقال من الرافيا بالكروشيه، مع حلقة ذهبية 2.5 سم."
 },
 "displayShort": {
 "fr": "Charm tranche d orange en raphia, crochete main avec anneau dore 2,5 cm.",
 "en": "A crocheted raffia orange slice charm with a 2.5 cm gold ring.",
 "es": "Un charm de rodaja de naranja en rafia tejido a ganchillo, con aro dorado de 2,5 cm.",
 "tr": "Bir tığ işi rafya portakal dilimi charm, 2,5 cm altın halkayla.",
 "ar": "ميدالية شريحة برتقال من الرافيا بالكروشيه، مع حلقة ذهبية 2.5 سم."
 },
 "desc": {
 "fr": "Inspiree des stands de jus d orange: une tranche solaire pour panier, tote de plage ou sac cuir minimal.",
 "en": "Inspired by orange juice stalls, this crocheted Orange Slice brings a soft, sunny glow to baskets, beach totes and simple leather bags.",
 "es": "Inspirado en los puestos de zumo de naranja, esta rodaja de naranja tejida a ganchillo aporta un suave resplandor soleado a cestos, bolsas de playa y bolsos de piel sencillos.",
 "tr": "Portakal suyu tezgahlarından ilham alan bu kroşe Portakal Dilimi, sepetlere, plaj çantalarına ve sade deri çantalara yumuşak, güneşli bir parıltı katıyor.",
 "ar": "مستوحاة من أكشاك عصير البرتقال، تضفي شريحة البرتقال المكروشيهة هذه توهجاً مشمساً ناعماً على السلال وحقائب الشاطئ والحقائب الجلدية البسيطة."
 },
 "price": 19000,
 "currency": "MAD",
 "category": "charms",
 "sourceCategory": "Fruit Charms",
 "categoryLabel": {
 "fr": "Charms",
 "en": "Charms",
 "es": "Complementos",
 "tr": "Charmlar",
 "ar": "تعليقات الحقيبة"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/original-shop/charms/raffia-orange-slice-charm-ss26-01.png",
 "gallery": [
 "assets/original-shop/charms/raffia-orange-slice-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-orange-slice-charm-ss26-02.webp",
 "assets/original-shop/charms/raffia-orange-slice-charm-ss26-03.jpg",
 "assets/original-shop/charms/raffia-orange-slice-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-orange-slice-charm-ss26-08.webp",
 "assets/original-shop/charms/raffia-orange-slice-charm-ss26-09.webp",
 "assets/products/accessories-clean/orange-slice-necklace-clean.webp",
 "assets/lookbook-ss26-27/embedded/p58_img02_xref1416_b7482fc1dffb.jpeg",
 "assets/lookbook-ss26-27/embedded/p59_img01_xref1426_ab1030bf5e96.jpeg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-58.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-59.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-60.jpg"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "raffia-orange-slice-charm-ss26",
 "sku": null,
 "category": "CHARM",
 "source_type": "orange slice",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 5
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit charm",
 "Orange slice",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Orange Slice Raffia Charm - Handmade in Marrakech",
 "seoKeywords": [
 "Accessories",
 "Charm tranche d orange en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Orange Slice Charm",
 "YZA",
 "accessories",
 "bag",
 "cadeau",
 "charm",
 "charms",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "handmade",
 "naranja",
 "orange",
 "porte",
 "raffia-orange-slice-charm-ss26",
 "برتقال"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Charm tranche d orange en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Orange Slice Charm",
 "YZA",
 "accessories",
 "bag",
 "cadeau",
 "charm",
 "charms",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "handmade",
 "naranja",
 "orange",
 "porte",
 "raffia-orange-slice-charm-ss26",
 "برتقال"
 ],
 "material": {
 "fr": "raphia crochete main raffia",
 "en": "hand-crocheted raffia",
 "es": "rafia tejida a mano con ganchillo",
 "tr": "el örgüsü rafya",
 "ar": "رافيا مصنوعة بالكروشيه اليدوي"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Solo rafia — tejida a ganchillo",
 "tr": "Yalnızca rafya — kroşe",
 "ar": "رافيا فقط — مصنوعة بالكروشيه"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Environ 6 x 4 cm (chaque piece peut legerement varier).",
 "en": "Approx. 6 x 4 cm (each piece may vary slightly).",
 "es": "Aprox. 6 x 4 cm (cada pieza puede variar ligeramente).",
 "tr": "Yaklaşık 6 x 4 cm (her parça hafifçe farklılık gösterebilir).",
 "ar": "حوالي 6 x 4 سم (قد تختلف كل قطعة قليلاً)."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Boucle en raffia et anneau doré 2 cm. Anneau de 3 cm disponible pour les bundles.",
 "en": "Raffia loop and 2 cm gold ring. 3 cm ring available for bundles.",
 "es": "Lazo de rafia y aro dorado de 2 cm. Aro de 3 cm disponible para los bundles.",
 "tr": "Rafya halka ve 2 cm altın halka. Bundle'lar için 3 cm halka mevcut.",
 "ar": "حلقة رافيا وحلقة ذهبية 2 سم. تتوفر حلقة 3 سم للحزم."
 },
 "handworkTime": {
 "fr": "1 h de crochet main pour ce fruit.",
 "en": "1 hours of hand crochet for this fruit.",
 "es": "1 hora de crochet a mano para esta fruta.",
 "tr": "Bu meyve için 1 saat el kroşesi.",
 "ar": "ساعة واحدة من الكروشيه اليدوي لهذه الفاكهة."
 },
 "howToWear": {
 "title": {
 "fr": "Comment le porter",
 "en": "How to wear it",
 "es": "Cómo llevarlo",
 "tr": "Nasıl kullanılır",
 "ar": "كيف تلبسينه"
 },
 "intro": {
 "fr": "Utilisez ce Fruit Charm sur:",
 "en": "Use this Fruit Charm on:",
 "es": "Úsalo en:",
 "tr": "Bu Meyve Charm'ı şunlara takın:",
 "ar": "استخدمي هذا الميدالية الفاكهة على:"
 },
 "items": [
 {
 "fr": "Les sacs YZA, La Vague et autres paniers de la marque.",
 "en": "YZA bags, La Vague and other YZA baskets.",
 "es": "Bolsos YZA, La Vague y otros cestos de la marca.",
 "tr": "YZA çantaları, La Vague ve diğer YZA sepetleri.",
 "ar": "حقائب YZA، La Vague وسلال YZA الأخرى."
 },
 {
 "fr": "Vos sacs en cuir pour ajouter une touche de personnalité et de couleur.",
 "en": "Leather bags to add personality and colour.",
 "es": "Bolsos de piel para añadir personalidad y color.",
 "tr": "Kişilik ve renk katmak için deri çantalar.",
 "ar": "الحقائب الجلدية لإضافة شخصية ولون."
 },
 {
 "fr": "Paniers en paille, market totes et sacs de plage.",
 "en": "Straw baskets, market totes and beach bags.",
 "es": "Cestos de paja, bolsas de mercado y bolsas de playa.",
 "tr": "Hasır sepetler, alışveriş çantaları ve plaj çantaları.",
 "ar": "السلال القشية، وحقائب السوق، وحقائب الشاطئ."
 },
 {
 "fr": "Clés, porte-clés et pochettes.",
 "en": "Keys, keychains and pouches.",
 "es": "Llaves, llaveros y bolsillos.",
 "tr": "Anahtarlar, anahtarlıklar ve kılıflar.",
 "ar": "المفاتيح والمفاتيح وحافظات المفاتيح."
 }
 ],
 "styleTip": {
 "fr": "Best on baskets, market totes and simple leather bags. Mix with avocado and lemon slice for a fresh trio.",
 "en": "Best on baskets, market totes and simple leather bags. Mix with avocado and lemon slice for a fresh trio.",
 "es": "Mejor en cestos, totes de mercado y bolsos de piel sencillos. Mezcla con aguacate y rodaja de limón para un trío fresco.",
 "tr": "Sepetler, pazar tote'ları ve sade deri çantalarda en iyisi. Taze bir üçlü için avokado ve limon dilimi ile karıştırın.",
 "ar": "الأفضل على السلال وحقائب السوق والحقائب الجلدية البسيطة. امزجيه مع الأفوكادو وشريحة الليمون للثلاثي الطازج."
 },
 "note": {
 "fr": "Chaque charm vient avec une petite boucle. L anneau dore est inclus dans les bundles et peut etre ajoute au studio pour un charm seul.",
 "en": "Every charm comes with a small loop. The gold ring is included with bundles and can be added in studio for single charms.",
 "es": "Cada charm incluye un lazo pequeño. El aro dorado viene incluido en los bundles y puede añadirse en el estudio para charms individuales.",
 "tr": "Her charm küçük bir halkayla birlikte gelir. Altın halka bundle'lara dahildir; tek charmlar için stüdyoda eklenebilir.",
 "ar": "كل ميدالية تأتي مع حلقة صغيرة. الحلقة الذهبية مشمولة في الحزم ويمكن إضافتها في الأستوديو للميداليات المفردة."
 }
 },
 "fruitStory": {
 "title": {
 "fr": "Orange slice: juice stall energy.",
 "en": "Orange slice: juice stall energy.",
 "es": "Rodaja de naranja: la energía del puesto de zumo.",
 "tr": "Portakal dilimi: meyve suyu tezgahı enerjisi.",
 "ar": "شريحة البرتقال: طاقة كشك العصير."
 },
 "body": {
 "fr": "The orange slice is made for handles that need movement and colour without weight. It keeps the graphic shape of the fruit and the warmth of Marrakesh mornings.",
 "en": "The orange slice is made for handles that need movement and colour without weight. It keeps the graphic shape of the fruit and the warmth of Marrakesh mornings.",
 "es": "La rodaja de naranja está hecha para asas que necesitan movimiento y color sin peso. Mantiene la forma gráfica de la fruta y el calor de las mañanas de Marrakech.",
 "tr": "Portakal dilimi, ağırlık olmadan hareket ve renge ihtiyaç duyan kulplar için yapılmış. Meyvenin grafik şeklini ve Marakeş sabahlarının sıcaklığını koruyor.",
 "ar": "شريحة البرتقال مصنوعة للمقابض التي تحتاج حركة ولوناً دون ثقل. تحافظ على الشكل الرسومي للفاكهة ودفء صباحات مراكش."
 },
 "collectionTitle": {
 "fr": "Fruit Market : inspiré des marchés de Marrakech",
 "en": "Fruit Market: inspired by the Marrakesh markets",
 "es": "Fruit Market: inspirado en los mercados de Marrakech",
 "tr": "Fruit Market: Marakeş pazarlarından ilham alınmıştır",
 "ar": "Fruit Market: مستوحى من أسواق مراكش"
 },
 "collectionBody": {
 "fr": "Les Fruit Charms viennent des étals de notre quartier de Guéliz — ceux de la médina comme ceux des camionnettes au coin de la rue. Oranges, citrons, pastèques, avocats, raisins, cerises : le raffia est teint par nos soins dans des couleurs emblématiques, puis crocheté fruit par fruit — l’une des techniques les plus délicates. Un charm ne se clipse pas qu’au sac : il se porte aussi sur un bijou, et avec les petits anneaux dorés offerts à l’achat des boucles, plusieurs charms se combinent ou se portent en collier. De véritables cartes postales de Marrakech.",
 "en": "The YZA Fruit Charms come from the stalls of our Guéliz neighbourhood — the médina ones and the street-corner vans alike. Oranges, lemons, watermelons, avocados, grapes, cherries: we hand-dye the raffia in iconic shades, then crochet it fruit by fruit — one of the most delicate crafts there is. A charm doesn’t only clip to a bag: it wears on jewellery too, and with the little gold rings gifted when you buy the earrings, several charms combine or wear as a necklace. True postcards from Marrakesh.",
 "es": "Los Fruit Charms de YZA vienen de los puestos de nuestro barrio de Guéliz, tanto los de la medina como las camionetas de la esquina. Naranjas, limones, sandías, aguacates, uvas, cerezas: teñimos la rafia a mano en colores emblemáticos y luego la tejemos fruta por fruta, una de las técnicas más delicadas. Un charm no solo se engancha al bolso: también se lleva en una joya, y con los pequeños aros dorados que se regalan al comprar los pendientes, varios charms se combinan o se llevan como collar. Verdaderas postales de Marrakech.",
 "tr": "YZA Meyve Charmları, Guéliz mahallemizin tezgâhlarından gelir — hem medinadakiler hem de sokak köşesindeki kamyonetler. Portakal, limon, karpuz, avokado, üzüm, kiraz: rafyayı ikonik tonlarda elde boyar, sonra meyve meyve örüyoruz — var olan en zarif tekniklerden biri. Bir charm yalnızca çantaya takılmaz: bir takının üzerinde de taşınır ve küpe alırken hediye edilen küçük altın halkalarla birkaç charm birleşir ya da kolye gibi takılır. Marakeş’ten gerçek kartpostallar.",
 "ar": "تأتي ميداليات الفاكهة من YZA من أكشاك حيّنا Guéliz — من المدينة القديمة ومن شاحنات زوايا الشوارع. برتقال، ليمون، بطيخ، أفوكادو، عنب، كرز: نصبغ الرافيا يدويًا بألوان مميزة، ثم نحيكها فاكهةً فاكهة — إحدى أدقّ التقنيات. الميدالية لا تُعلّق على الحقيبة فقط: تُلبس على قطعة مجوهرات أيضًا، ومع الحلقات الذهبية الصغيرة المُهداة عند شراء الأقراط، تتجمّع عدة ميداليات أو تُلبس كقلادة. بطاقات بريدية حقيقية من مراكش."
 },
 "liveUrl": "https://yza-shop.com/products/orange-slice-raffia-crochet-bag-charm"
 },
 "making": {
 "fr": "The orange slice is made for handles that need movement and colour without weight. It keeps the graphic shape of the fruit and the warmth of Marrakesh mornings. Chaque piece est travaillee au crochet main dans l atelier de Guéliz, puis controlee avant la pose de l etiquette YZA.",
 "en": "The orange slice is made for handles that need movement and colour without weight. It keeps the graphic shape of the fruit and the warmth of Marrakesh mornings. Each piece is hand-crocheted in the Guéliz atelier, then checked before the YZA tag is added.",
 "es": "La rodaja de naranja está hecha para asas que necesitan movimiento y color sin peso. Mantiene la forma gráfica de la fruta y el calor de las mañanas de Marrakech. Cada pieza está tejida a mano en el taller de Guéliz y revisada antes de poner la etiqueta YZA.",
 "tr": "Portakal dilimi, ağırlık olmadan hareket ve renge ihtiyaç duyan kulplar için yapılmış. Meyvenin grafik şeklini ve Marakeş sabahlarının sıcaklığını koruyor. Her parça Guéliz atölyesinde el kroşesiyle yapılır, ardından YZA etiketi eklenmeden önce kontrol edilir.",
 "ar": "شريحة البرتقال مصنوعة للمقابض التي تحتاج حركة ولوناً دون ثقل. تحافظ على الشكل الرسومي للفاكهة ودفء صباحات مراكش. كل قطعة مصنوعة بالكروشيه اليدوي في أتيليه Guéliz، ثم تُفحص قبل إضافة علامة YZA."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l'eau ; s'il est mouillé, le faire sécher à l'air libre à l'ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l'anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "La rafia no necesita cuidados especiales. Evitar el agua; si se moja, dejar secar al aire libre alejada del sol directo. Evitar la exposición prolongada al sol para preservar los colores. Si el elemento dorado pierde su color, puede reemplazarse.",
 "tr": "Rafyanın özel bakıma ihtiyacı yoktur. Suyla temastan kaçının; ıslanırsa doğrudan güneş ışığından uzakta açık havada kurumaya bırakın. Renkleri korumak için uzun süreli güneş maruziyetinden kaçının. Altın öge rengini kaybederse değiştirilebilir.",
 "ar": "الرافيا لا تحتاج إلى عناية خاصة. تجنبي الماء؛ إذا ابتلت، جففيها في الهواء الطلق بعيداً عن أشعة الشمس المباشرة. تجنبي التعرض المطوّل للشمس للحفاظ على الألوان. إذا فقد العنصر الذهبي لونه، يمكن استبداله."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l'artisane qui l'a réalisée est inscrit sur l'étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Lista para regalar, con el nombre de la artesana que realizó la pieza grabado en la etiqueta YZA.",
 "tr": "Hediye için hazır; parçayı yapan ustanın adı YZA etiketine kazınmıştır.",
 "ar": "جاهزة للإهداء، مع اسم الحرفية التي صنعت القطعة منقوشاً على بطاقة YZA."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz'deki stüdyodan teslim alma mevcut.",
 "ar": "شحن مع تتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الأستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Satisfecho o reembolsado — 30 días",
 "tr": "Memnun olun ya da iade edin — 30 gün",
 "ar": "راضٍ أو مُستردّ — 30 يومًا"
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "badge": "bestseller",
 "hours": 1,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "watermelon-raffia-earrings-ss26",
 "lemon-slice-raffia-necklace-ss26"
 ]
 },
 {
 "handle": "raffia-kiwi-slice-charm-ss26",
 "fewLeft": true,
 "legacyHandles": [
 "kiwi"
 ],
 "sku": null,
 "name": {
 "fr": "Charm tranche de kiwi en raphia",
 "en": "Raffia Kiwi Slice Charm",
 "es": "Raffia Kiwi Slice Charm",
 "tr": "Raffia Kiwi Slice Charm",
 "ar": "Raffia Kiwi Slice Charm"
 },
 "displayName": {
 "fr": "Charm tranche de kiwi en raphia",
 "en": "Raffia Kiwi Slice Charm",
 "es": "Raffia Kiwi Slice Charm",
 "tr": "Raffia Kiwi Slice Charm",
 "ar": "Raffia Kiwi Slice Charm"
 },
 "short": {
 "fr": "Charm tranche de kiwi en raphia, crochete main avec anneau dore 2,5 cm.",
 "en": "A crocheted raffia kiwi slice charm with a 2.5 cm gold ring.",
 "es": "Un charm de rodaja de kiwi en rafia tejido a ganchillo, con aro dorado de 2,5 cm.",
 "tr": "Bir tığ işi rafya kivi dilimi charm, 2,5 cm altın halkayla.",
 "ar": "ميدالية شريحة كيوي من الرافيا بالكروشيه، مع حلقة ذهبية 2.5 سم."
 },
 "displayShort": {
 "fr": "Charm tranche de kiwi en raphia, crochete main avec anneau dore 2,5 cm.",
 "en": "A crocheted raffia kiwi slice charm with a 2.5 cm gold ring.",
 "es": "Un charm de rodaja de kiwi en rafia tejido a ganchillo, con aro dorado de 2,5 cm.",
 "tr": "Bir tığ işi rafya kivi dilimi charm, 2,5 cm altın halkayla.",
 "ar": "ميدالية شريحة كيوي من الرافيا بالكروشيه، مع حلقة ذهبية 2.5 سم."
 },
 "desc": {
 "fr": "Discretement drole et inattendu: vert doux, petits points contrastes et crochet main pour un accent chic.",
 "en": "Quietly fun and a little unexpected. The Kiwi Slice mixes soft greens with tiny contrasting seeds, hand-crocheted in raffia for a subtle, chic accent.",
 "es": "Discretamente divertido y un poco inesperado. La rodaja de kiwi mezcla verdes suaves con pequeñas semillas contrastadas, tejida a mano en rafia para un acento sutil y chic.",
 "tr": "Sessizce eğlenceli ve biraz beklenmedik. Kivi Dilimi, yumuşak yeşilleri küçük zıt renkli tohumlarla harmanlıyor; rafyadan el kroşesiyle yapılmış, narin ve şik bir aksan.",
 "ar": "ممتع بهدوء ومفاجئ قليلاً. تمزج شريحة الكيوي بين الخضرة الناعمة والبذور الصغيرة المتباينة، مصنوعة بالكروشيه اليدوي من الرافيا كلمسة راقية ودقيقة."
 },
 "price": 19000,
 "currency": "MAD",
 "category": "charms",
 "sourceCategory": "Fruit Charms",
 "categoryLabel": {
 "fr": "Charms",
 "en": "Charms",
 "es": "Complementos",
 "tr": "Charmlar",
 "ar": "تعليقات الحقيبة"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/original-shop/charms/raffia-kiwi-slice-charm-ss26-01.png",
 "gallery": [
 "assets/original-shop/charms/raffia-kiwi-slice-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-kiwi-slice-charm-ss26-02.webp",
 "assets/original-shop/charms/raffia-kiwi-slice-charm-ss26-03.jpg",
 "assets/original-shop/charms/raffia-kiwi-slice-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-kiwi-slice-charm-ss26-08.webp",
 "assets/original-shop/charms/raffia-kiwi-slice-charm-ss26-09.webp",
 "assets/products/accessories-clean/kiwi-raffia-earrings-clean.png",
 "assets/lookbook-ss26-27/embedded/p59_img01_xref1426_ab1030bf5e96.jpeg",
 "assets/products/accessories-clean/watermelon-slice-accessory-clean.webp",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-58.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-59.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-60.jpg",
 "assets/lifestyle/charms/kiwi-jacquemus.webp"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "raffia-kiwi-slice-charm-ss26",
 "sku": null,
 "category": "CHARM",
 "source_type": "kiwi slice",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 11
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit charm",
 "Kiwi slice",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Kiwi Slice Raffia Charm - Handmade in Marrakech",
 "seoKeywords": [
 "Accessories",
 "Charm tranche de kiwi en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Kiwi Slice Charm",
 "YZA",
 "accessories",
 "bag",
 "cadeau",
 "charm",
 "charms",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "handmade",
 "kiwi",
 "porte",
 "raffia-kiwi-slice-charm-ss26",
 "كيوي"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Charm tranche de kiwi en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Kiwi Slice Charm",
 "YZA",
 "accessories",
 "bag",
 "cadeau",
 "charm",
 "charms",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "handmade",
 "kiwi",
 "porte",
 "raffia-kiwi-slice-charm-ss26",
 "كيوي"
 ],
 "material": {
 "fr": "raphia crochete main raffia",
 "en": "hand-crocheted raffia",
 "es": "rafia tejida a mano con ganchillo",
 "tr": "el örgüsü rafya",
 "ar": "رافيا مصنوعة بالكروشيه اليدوي"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Solo rafia — tejida a ganchillo",
 "tr": "Yalnızca rafya — kroşe",
 "ar": "رافيا فقط — مصنوعة بالكروشيه"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Environ 6 x 4 cm (chaque piece peut legerement varier).",
 "en": "Approx. 6 x 4 cm (each piece may vary slightly).",
 "es": "Aprox. 6 x 4 cm (cada pieza puede variar ligeramente).",
 "tr": "Yaklaşık 6 x 4 cm (her parça hafifçe farklılık gösterebilir).",
 "ar": "حوالي 6 x 4 سم (قد تختلف كل قطعة قليلاً)."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Boucle en raffia et anneau doré 2 cm. Anneau de 3 cm disponible pour les bundles.",
 "en": "Raffia loop and 2 cm gold ring. 3 cm ring available for bundles.",
 "es": "Lazo de rafia y aro dorado de 2 cm. Aro de 3 cm disponible para los bundles.",
 "tr": "Rafya halka ve 2 cm altın halka. Bundle'lar için 3 cm halka mevcut.",
 "ar": "حلقة رافيا وحلقة ذهبية 2 سم. تتوفر حلقة 3 سم للحزم."
 },
 "handworkTime": {
 "fr": "1,5 h de crochet main pour ce fruit.",
 "en": "1.5 hours of hand crochet for this fruit.",
 "es": "1,5 horas de crochet a mano para esta fruta.",
 "tr": "Bu meyve için 1,5 saat el kroşesi.",
 "ar": "1.5 ساعة كروشيه يدوي لهذه الفاكهة."
 },
 "howToWear": {
 "title": {
 "fr": "Comment le porter",
 "en": "How to wear it",
 "es": "Cómo llevarlo",
 "tr": "Nasıl kullanılır",
 "ar": "كيف تلبسينه"
 },
 "intro": {
 "fr": "Utilisez ce Fruit Charm sur:",
 "en": "Use this Fruit Charm on:",
 "es": "Úsalo en:",
 "tr": "Bu Meyve Charm'ı şunlara takın:",
 "ar": "استخدمي هذا الميدالية الفاكهة على:"
 },
 "items": [
 {
 "fr": "Les sacs YZA, La Vague et autres paniers de la marque.",
 "en": "YZA bags, La Vague and other YZA baskets.",
 "es": "Bolsos YZA, La Vague y otros cestos de la marca.",
 "tr": "YZA çantaları, La Vague ve diğer YZA sepetleri.",
 "ar": "حقائب YZA، La Vague وسلال YZA الأخرى."
 },
 {
 "fr": "Vos sacs en cuir pour ajouter une touche de personnalité et de couleur.",
 "en": "Leather bags to add personality and colour.",
 "es": "Bolsos de piel para añadir personalidad y color.",
 "tr": "Kişilik ve renk katmak için deri çantalar.",
 "ar": "الحقائب الجلدية لإضافة شخصية ولون."
 },
 {
 "fr": "Paniers en paille, market totes et sacs de plage.",
 "en": "Straw baskets, market totes and beach bags.",
 "es": "Cestos de paja, bolsas de mercado y bolsas de playa.",
 "tr": "Hasır sepetler, alışveriş çantaları ve plaj çantaları.",
 "ar": "السلال القشية، وحقائب السوق، وحقائب الشاطئ."
 },
 {
 "fr": "Clés, porte-clés et pochettes.",
 "en": "Keys, keychains and pouches.",
 "es": "Llaves, llaveros y bolsillos.",
 "tr": "Anahtarlar, anahtarlıklar ve kılıflar.",
 "ar": "المفاتيح والمفاتيح وحافظات المفاتيح."
 }
 ],
 "styleTip": {
 "fr": "Best on beige, cream, tan and straw. Pair with grapes when you want a cooler green-purple story.",
 "en": "Best on beige, cream, tan and straw. Pair with grapes when you want a cooler green-purple story.",
 "es": "Mejor en beige, crema, tostado y paja. Combínalo con uvas cuando quieras una historia verde-morada más fresca.",
 "tr": "Bej, krem, bronz ve hasırda en iyisi. Daha serin bir yeşil-mor hikayesi için üzümle eşleştirin.",
 "ar": "الأفضل على البيج والكريم والتان والقش. زوّجيه بالعنب حين تريدين قصة خضراء-بنفسجية أكثر هدوءاً."
 },
 "note": {
 "fr": "Chaque charm vient avec une petite boucle. L anneau dore est inclus dans les bundles et peut etre ajoute au studio pour un charm seul.",
 "en": "Every charm comes with a small loop. The gold ring is included with bundles and can be added in studio for single charms.",
 "es": "Cada charm incluye un lazo pequeño. El aro dorado viene incluido en los bundles y puede añadirse en el estudio para charms individuales.",
 "tr": "Her charm küçük bir halkayla birlikte gelir. Altın halka bundle'lara dahildir; tek charmlar için stüdyoda eklenebilir.",
 "ar": "كل ميدالية تأتي مع حلقة صغيرة. الحلقة الذهبية مشمولة في الحزم ويمكن إضافتها في الأستوديو للميداليات المفردة."
 }
 },
 "fruitStory": {
 "title": {
 "fr": "Kiwi: the unexpected green.",
 "en": "Kiwi: the unexpected green.",
 "es": "El kiwi: el verde inesperado.",
 "tr": "Kivi: beklenmedik yeşil.",
 "ar": "الكيوي: الأخضر غير المتوقع."
 },
 "body": {
 "fr": "A kiwi slice is not the obvious fruit charm, and that is the point. It gives the collection a modern wink: graphic seeds, soft green and a shape that feels almost like a tiny patch of summer.",
 "en": "A kiwi slice is not the obvious fruit charm, and that is the point. It gives the collection a modern wink: graphic seeds, soft green and a shape that feels almost like a tiny patch of summer.",
 "es": "Una rodaja de kiwi no es el charm de fruta obvio, y eso es precisamente el punto. Le da a la colección un guiño moderno: semillas gráficas, verde suave y una forma que parece casi un pequeño retazo de verano.",
 "tr": "Kivi dilimi, bariz meyve charm'{ı} değil ve bu aslında amacı. Koleksiyona modern bir göz kırpma katıyor: grafik tohumlar, yumuşak yeşil ve neredeyse küçük bir yaz parçası gibi hissettiren bir şekil.",
 "ar": "شريحة الكيوي ليست ميدالية الفاكهة المعتادة، وهذا هو المقصود بالضبط. إنها تضفي على المجموعة إيماءة عصرية: بذور رسومية، خضرة ناعمة وشكل يبدو تقريباً كقطعة صيف صغيرة."
 },
 "collectionTitle": {
 "fr": "Fruit Market : inspiré des marchés de Marrakech",
 "en": "Fruit Market: inspired by the Marrakesh markets",
 "es": "Fruit Market: inspirado en los mercados de Marrakech",
 "tr": "Fruit Market: Marakeş pazarlarından ilham alınmıştır",
 "ar": "Fruit Market: مستوحى من أسواق مراكش"
 },
 "collectionBody": {
 "fr": "Les Fruit Charms viennent des étals de notre quartier de Guéliz — ceux de la médina comme ceux des camionnettes au coin de la rue. Oranges, citrons, pastèques, avocats, raisins, cerises : le raffia est teint par nos soins dans des couleurs emblématiques, puis crocheté fruit par fruit — l’une des techniques les plus délicates. Un charm ne se clipse pas qu’au sac : il se porte aussi sur un bijou, et avec les petits anneaux dorés offerts à l’achat des boucles, plusieurs charms se combinent ou se portent en collier. De véritables cartes postales de Marrakech.",
 "en": "The YZA Fruit Charms come from the stalls of our Guéliz neighbourhood — the médina ones and the street-corner vans alike. Oranges, lemons, watermelons, avocados, grapes, cherries: we hand-dye the raffia in iconic shades, then crochet it fruit by fruit — one of the most delicate crafts there is. A charm doesn’t only clip to a bag: it wears on jewellery too, and with the little gold rings gifted when you buy the earrings, several charms combine or wear as a necklace. True postcards from Marrakesh.",
 "es": "Los Fruit Charms de YZA vienen de los puestos de nuestro barrio de Guéliz, tanto los de la medina como las camionetas de la esquina. Naranjas, limones, sandías, aguacates, uvas, cerezas: teñimos la rafia a mano en colores emblemáticos y luego la tejemos fruta por fruta, una de las técnicas más delicadas. Un charm no solo se engancha al bolso: también se lleva en una joya, y con los pequeños aros dorados que se regalan al comprar los pendientes, varios charms se combinan o se llevan como collar. Verdaderas postales de Marrakech.",
 "tr": "YZA Meyve Charmları, Guéliz mahallemizin tezgâhlarından gelir — hem medinadakiler hem de sokak köşesindeki kamyonetler. Portakal, limon, karpuz, avokado, üzüm, kiraz: rafyayı ikonik tonlarda elde boyar, sonra meyve meyve örüyoruz — var olan en zarif tekniklerden biri. Bir charm yalnızca çantaya takılmaz: bir takının üzerinde de taşınır ve küpe alırken hediye edilen küçük altın halkalarla birkaç charm birleşir ya da kolye gibi takılır. Marakeş’ten gerçek kartpostallar.",
 "ar": "تأتي ميداليات الفاكهة من YZA من أكشاك حيّنا Guéliz — من المدينة القديمة ومن شاحنات زوايا الشوارع. برتقال، ليمون، بطيخ، أفوكادو، عنب، كرز: نصبغ الرافيا يدويًا بألوان مميزة، ثم نحيكها فاكهةً فاكهة — إحدى أدقّ التقنيات. الميدالية لا تُعلّق على الحقيبة فقط: تُلبس على قطعة مجوهرات أيضًا، ومع الحلقات الذهبية الصغيرة المُهداة عند شراء الأقراط، تتجمّع عدة ميداليات أو تُلبس كقلادة. بطاقات بريدية حقيقية من مراكش."
 },
 "liveUrl": "https://yza-shop.com/products/kiwi-raffia-crochet-bag-charm"
 },
 "making": {
 "fr": "A kiwi slice is not the obvious fruit charm, and that is the point. It gives the collection a modern wink: graphic seeds, soft green and a shape that feels almost like a tiny patch of summer. Chaque piece est travaillee au crochet main dans l atelier de Guéliz, puis controlee avant la pose de l etiquette YZA.",
 "en": "A kiwi slice is not the obvious fruit charm, and that is the point. It gives the collection a modern wink: graphic seeds, soft green and a shape that feels almost like a tiny patch of summer. Each piece is hand-crocheted in the Guéliz atelier, then checked before the YZA tag is added.",
 "es": "Una rodaja de kiwi no es el charm de fruta obvio, y eso es precisamente el punto. Le da a la colección un guiño moderno: semillas gráficas, verde suave y una forma que parece casi un pequeño retazo de verano. Cada pieza está tejida a mano en el taller de Guéliz y revisada antes de poner la etiqueta YZA.",
 "tr": "Kivi dilimi, bariz meyve charm'{ı} değil ve bu aslında amacı. Koleksiyona modern bir göz kırpma katıyor: grafik tohumlar, yumuşak yeşil ve neredeyse küçük bir yaz parçası gibi hissettiren bir şekil. Her parça Guéliz atölyesinde el kroşesiyle yapılır, ardından YZA etiketi eklenmeden önce kontrol edilir.",
 "ar": "شريحة الكيوي ليست ميدالية الفاكهة المعتادة، وهذا هو المقصود بالضبط. إنها تضفي على المجموعة إيماءة عصرية: بذور رسومية، خضرة ناعمة وشكل يبدو تقريباً كقطعة صيف صغيرة. كل قطعة مصنوعة بالكروشيه اليدوي في أتيليه Guéliz، ثم تُفحص قبل إضافة علامة YZA."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l'eau ; s'il est mouillé, le faire sécher à l'air libre à l'ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l'anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "La rafia no necesita cuidados especiales. Evitar el agua; si se moja, dejar secar al aire libre alejada del sol directo. Evitar la exposición prolongada al sol para preservar los colores. Si el elemento dorado pierde su color, puede reemplazarse.",
 "tr": "Rafyanın özel bakıma ihtiyacı yoktur. Suyla temastan kaçının; ıslanırsa doğrudan güneş ışığından uzakta açık havada kurumaya bırakın. Renkleri korumak için uzun süreli güneş maruziyetinden kaçının. Altın öge rengini kaybederse değiştirilebilir.",
 "ar": "الرافيا لا تحتاج إلى عناية خاصة. تجنبي الماء؛ إذا ابتلت، جففيها في الهواء الطلق بعيداً عن أشعة الشمس المباشرة. تجنبي التعرض المطوّل للشمس للحفاظ على الألوان. إذا فقد العنصر الذهبي لونه، يمكن استبداله."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l'artisane qui l'a réalisée est inscrit sur l'étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Lista para regalar, con el nombre de la artesana que realizó la pieza grabado en la etiqueta YZA.",
 "tr": "Hediye için hazır; parçayı yapan ustanın adı YZA etiketine kazınmıştır.",
 "ar": "جاهزة للإهداء، مع اسم الحرفية التي صنعت القطعة منقوشاً على بطاقة YZA."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz'deki stüdyodan teslim alma mevcut.",
 "ar": "شحن مع تتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الأستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Satisfecho o reembolsado — 30 días",
 "tr": "Memnun olun ya da iade edin — 30 gün",
 "ar": "راضٍ أو مُستردّ — 30 يومًا"
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "badge": "limited",
 "hours": 1.5,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "watermelon-raffia-earrings-ss26",
 "lemon-slice-raffia-necklace-ss26"
 ]
 },
 {
 "handle": "raffia-watermelon-slice-charm-ss26",
 "legacyHandles": [
 "pasteque"
 ],
 "sku": null,
 "name": {
 "fr": "Charm tranche de pasteque en raphia",
 "en": "Raffia Watermelon Slice Charm",
 "es": "Raffia Watermelon Slice Charm",
 "tr": "Raffia Watermelon Slice Charm",
 "ar": "Raffia Watermelon Slice Charm"
 },
 "displayName": {
 "fr": "Charm tranche de pasteque en raphia",
 "en": "Raffia Watermelon Slice Charm",
 "es": "Raffia Watermelon Slice Charm",
 "tr": "Raffia Watermelon Slice Charm",
 "ar": "Raffia Watermelon Slice Charm"
 },
 "short": {
 "fr": "Charm tranche de pasteque en raphia, crochete main avec anneau dore 2,5 cm.",
 "en": "A crocheted raffia watermelon slice charm with a 2.5 cm gold ring.",
 "es": "Un charm de rodaja de sandía en rafia tejido a ganchillo, con aro dorado de 2,5 cm.",
 "tr": "Bir tığ işi rafya karpuz dilimi charm, 2,5 cm altın halkayla.",
 "ar": "ميدالية شريحة بطيخ من الرافيا بالكروشيه، مع حلقة ذهبية 2.5 سم."
 },
 "displayShort": {
 "fr": "Charm tranche de pasteque en raphia, crochete main avec anneau dore 2,5 cm.",
 "en": "A crocheted raffia watermelon slice charm with a 2.5 cm gold ring.",
 "es": "Un charm de rodaja de sandía en rafia tejido a ganchillo, con aro dorado de 2,5 cm.",
 "tr": "Bir tığ işi rafya karpuz dilimi charm, 2,5 cm altın halkayla.",
 "ar": "ميدالية شريحة بطيخ من الرافيا بالكروشيه، مع حلقة ذهبية 2.5 سم."
 },
 "desc": {
 "fr": "Une petite tranche d ete marrakchi: rose, vert, fraiche et joyeuse sur sac ou panier.",
 "en": "A tiny slice of Marrakesh summer. This hand-crocheted watermelon charm adds a playful pop of pink and green to any bag or basket.",
 "es": "Una pequeña rodaja del verano de Marrakech. Este charm de sandía tejido a mano añade un toque juguetón de rosa y verde a cualquier bolso o cesto.",
 "tr": "Marakeş yazından küçük bir dilim. Bu el kroşesiyle yapılmış karpuz charm, her çanta veya sepete eğlenceli bir pembe-yeşil renk patlaması katıyor.",
 "ar": "شريحة صغيرة من صيف مراكش. تضيف هذه الميدالية المكروشيهة يدوياً لمسة مرحة من الوردي والأخضر لأي حقيبة أو سلة."
 },
 "price": 19000,
 "currency": "MAD",
 "category": "charms",
 "sourceCategory": "Fruit Charms",
 "categoryLabel": {
 "fr": "Charms",
 "en": "Charms",
 "es": "Complementos",
 "tr": "Charmlar",
 "ar": "تعليقات الحقيبة"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/original-shop/charms/raffia-watermelon-slice-charm-ss26-01.png",
 "gallery": [
 "assets/original-shop/charms/raffia-watermelon-slice-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-watermelon-slice-charm-ss26-02.jpg",
 "assets/original-shop/charms/raffia-watermelon-slice-charm-ss26-03.webp",
 "assets/original-shop/charms/raffia-watermelon-slice-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-watermelon-slice-charm-ss26-08.webp",
 "assets/original-shop/charms/raffia-watermelon-slice-charm-ss26-09.webp",
 "assets/products/accessories-clean/watermelon-slice-accessory-clean.webp",
 "assets/lookbook-ss26-27/embedded/p58_img02_xref1416_b7482fc1dffb.jpeg",
 "assets/lookbook-ss26-27/embedded/p59_img01_xref1426_ab1030bf5e96.jpeg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-58.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-59.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-60.jpg"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "raffia-watermelon-slice-charm-ss26",
 "sku": null,
 "category": "CHARM",
 "source_type": "pasteque slice",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 10
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit charm",
 "Watermelon slice",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Watermelon Slice Raffia Charm - Handmade in Marrakech",
 "seoKeywords": [
 "Accessories",
 "Charm tranche de pasteque en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Watermelon Slice Charm",
 "YZA",
 "accessories",
 "bag",
 "cadeau",
 "charm",
 "charms",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "handmade",
 "pasteque",
 "porte",
 "raffia-watermelon-slice-charm-ss26",
 "sandia",
 "watermelon",
 "بطيخ"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Charm tranche de pasteque en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Watermelon Slice Charm",
 "YZA",
 "accessories",
 "bag",
 "cadeau",
 "charm",
 "charms",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "handmade",
 "pasteque",
 "porte",
 "raffia-watermelon-slice-charm-ss26",
 "sandia",
 "watermelon",
 "بطيخ"
 ],
 "material": {
 "fr": "raphia crochete main raffia",
 "en": "hand-crocheted raffia",
 "es": "rafia tejida a mano con ganchillo",
 "tr": "el örgüsü rafya",
 "ar": "رافيا مصنوعة بالكروشيه اليدوي"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Solo rafia — tejida a ganchillo",
 "tr": "Yalnızca rafya — kroşe",
 "ar": "رافيا فقط — مصنوعة بالكروشيه"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Environ 6 x 4 cm (chaque piece peut legerement varier).",
 "en": "Approx. 6 x 4 cm (each piece may vary slightly).",
 "es": "Aprox. 6 x 4 cm (cada pieza puede variar ligeramente).",
 "tr": "Yaklaşık 6 x 4 cm (her parça hafifçe farklılık gösterebilir).",
 "ar": "حوالي 6 x 4 سم (قد تختلف كل قطعة قليلاً)."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Boucle en raffia et anneau doré 2 cm. Anneau de 3 cm disponible pour les bundles.",
 "en": "Raffia loop and 2 cm gold ring. 3 cm ring available for bundles.",
 "es": "Lazo de rafia y aro dorado de 2 cm. Aro de 3 cm disponible para los bundles.",
 "tr": "Rafya halka ve 2 cm altın halka. Bundle'lar için 3 cm halka mevcut.",
 "ar": "حلقة رافيا وحلقة ذهبية 2 سم. تتوفر حلقة 3 سم للحزم."
 },
 "handworkTime": {
 "fr": "1,5 h de crochet main pour ce fruit.",
 "en": "1.5 hours of hand crochet for this fruit.",
 "es": "1,5 horas de crochet a mano para esta fruta.",
 "tr": "Bu meyve için 1,5 saat el kroşesi.",
 "ar": "1.5 ساعة كروشيه يدوي لهذه الفاكهة."
 },
 "howToWear": {
 "title": {
 "fr": "Comment le porter",
 "en": "How to wear it",
 "es": "Cómo llevarlo",
 "tr": "Nasıl kullanılır",
 "ar": "كيف تلبسينه"
 },
 "intro": {
 "fr": "Utilisez ce Fruit Charm sur:",
 "en": "Use this Fruit Charm on:",
 "es": "Úsalo en:",
 "tr": "Bu Meyve Charm'ı şunlara takın:",
 "ar": "استخدمي هذا الميدالية الفاكهة على:"
 },
 "items": [
 {
 "fr": "Les sacs YZA, La Vague et autres paniers de la marque.",
 "en": "YZA bags, La Vague and other YZA baskets.",
 "es": "Bolsos YZA, La Vague y otros cestos de la marca.",
 "tr": "YZA çantaları, La Vague ve diğer YZA sepetleri.",
 "ar": "حقائب YZA، La Vague وسلال YZA الأخرى."
 },
 {
 "fr": "Vos sacs en cuir pour ajouter une touche de personnalité et de couleur.",
 "en": "Leather bags to add personality and colour.",
 "es": "Bolsos de piel para añadir personalidad y color.",
 "tr": "Kişilik ve renk katmak için deri çantalar.",
 "ar": "الحقائب الجلدية لإضافة شخصية ولون."
 },
 {
 "fr": "Paniers en paille, market totes et sacs de plage.",
 "en": "Straw baskets, market totes and beach bags.",
 "es": "Cestos de paja, bolsas de mercado y bolsas de playa.",
 "tr": "Hasır sepetler, alışveriş çantaları ve plaj çantaları.",
 "ar": "السلال القشية، وحقائب السوق، وحقائب الشاطئ."
 },
 {
 "fr": "Clés, porte-clés et pochettes.",
 "en": "Keys, keychains and pouches.",
 "es": "Llaves, llaveros y bolsillos.",
 "tr": "Anahtarlar, anahtarlıklar ve kılıflar.",
 "ar": "المفاتيح والمفاتيح وحافظات المفاتيح."
 }
 ],
 "styleTip": {
 "fr": "Best on beach totes, white baskets and holiday bags. Add tomato for a red Fruit Market moment.",
 "en": "Best on beach totes, white baskets and holiday bags. Add tomato for a red Fruit Market moment.",
 "es": "Mejor en bolsas de playa, cestos blancos y bolsos de vacaciones. Añade tomate para un momento Fruit Market en rojo.",
 "tr": "Plaj çantaları, beyaz sepetler ve tatil çantalarında en iyisi. Kırmızı bir Fruit Market anı için domates ekleyin.",
 "ar": "الأفضل على حقائب الشاطئ والسلال البيضاء وحقائب العطلات. أضيفي الطماطم للحظة Fruit Market حمراء."
 },
 "note": {
 "fr": "Chaque charm vient avec une petite boucle. L anneau dore est inclus dans les bundles et peut etre ajoute au studio pour un charm seul.",
 "en": "Every charm comes with a small loop. The gold ring is included with bundles and can be added in studio for single charms.",
 "es": "Cada charm incluye un lazo pequeño. El aro dorado viene incluido en los bundles y puede añadirse en el estudio para charms individuales.",
 "tr": "Her charm küçük bir halkayla birlikte gelir. Altın halka bundle'lara dahildir; tek charmlar için stüdyoda eklenebilir.",
 "ar": "كل ميدالية تأتي مع حلقة صغيرة. الحلقة الذهبية مشمولة في الحزم ويمكن إضافتها في الأستوديو للميداليات المفردة."
 }
 },
 "fruitStory": {
 "title": {
 "fr": "Watermelon: summer in one slice.",
 "en": "Watermelon: summer in one slice.",
 "es": "Sandía: el verano en una rodaja.",
 "tr": "Karpuz: bir dilimde yaz.",
 "ar": "البطيخ: الصيف في شريحة واحدة."
 },
 "body": {
 "fr": "Watermelon is the charm for heat, terraces and long afternoons. It carries the most immediate summer feeling in the collection: a bright slice, made slowly, meant to travel.",
 "en": "Watermelon is the charm for heat, terraces and long afternoons. It carries the most immediate summer feeling in the collection: a bright slice, made slowly, meant to travel.",
 "es": "La sandía es el charm del calor, las terrazas y las tardes largas. Es el que transmite la sensación de verano más inmediata de la colección: una rodaja brillante, hecha despacio, destinada a viajar.",
 "tr": "Karpuz, sıcak için, teraslar için ve uzun öğleden sonralar için yapılmış charm. Koleksiyondaki en anlık yaz hissini taşıyor: yavaş yapılmış, seyahat etmek için tasarlanmış parlak bir dilim.",
 "ar": "البطيخ هو ميدالية الحر والشرفات والعصريات الطويلة. تحمل الشعور الصيفي الأكثر فورية في المجموعة: شريحة مشرقة، مصنوعة بتأنّ، تُقصد للسفر."
 },
 "collectionTitle": {
 "fr": "Fruit Market : inspiré des marchés de Marrakech",
 "en": "Fruit Market: inspired by the Marrakesh markets",
 "es": "Fruit Market: inspirado en los mercados de Marrakech",
 "tr": "Fruit Market: Marakeş pazarlarından ilham alınmıştır",
 "ar": "Fruit Market: مستوحى من أسواق مراكش"
 },
 "collectionBody": {
 "fr": "Les Fruit Charms viennent des étals de notre quartier de Guéliz — ceux de la médina comme ceux des camionnettes au coin de la rue. Oranges, citrons, pastèques, avocats, raisins, cerises : le raffia est teint par nos soins dans des couleurs emblématiques, puis crocheté fruit par fruit — l’une des techniques les plus délicates. Un charm ne se clipse pas qu’au sac : il se porte aussi sur un bijou, et avec les petits anneaux dorés offerts à l’achat des boucles, plusieurs charms se combinent ou se portent en collier. De véritables cartes postales de Marrakech.",
 "en": "The YZA Fruit Charms come from the stalls of our Guéliz neighbourhood — the médina ones and the street-corner vans alike. Oranges, lemons, watermelons, avocados, grapes, cherries: we hand-dye the raffia in iconic shades, then crochet it fruit by fruit — one of the most delicate crafts there is. A charm doesn’t only clip to a bag: it wears on jewellery too, and with the little gold rings gifted when you buy the earrings, several charms combine or wear as a necklace. True postcards from Marrakesh.",
 "es": "Los Fruit Charms de YZA vienen de los puestos de nuestro barrio de Guéliz, tanto los de la medina como las camionetas de la esquina. Naranjas, limones, sandías, aguacates, uvas, cerezas: teñimos la rafia a mano en colores emblemáticos y luego la tejemos fruta por fruta, una de las técnicas más delicadas. Un charm no solo se engancha al bolso: también se lleva en una joya, y con los pequeños aros dorados que se regalan al comprar los pendientes, varios charms se combinan o se llevan como collar. Verdaderas postales de Marrakech.",
 "tr": "YZA Meyve Charmları, Guéliz mahallemizin tezgâhlarından gelir — hem medinadakiler hem de sokak köşesindeki kamyonetler. Portakal, limon, karpuz, avokado, üzüm, kiraz: rafyayı ikonik tonlarda elde boyar, sonra meyve meyve örüyoruz — var olan en zarif tekniklerden biri. Bir charm yalnızca çantaya takılmaz: bir takının üzerinde de taşınır ve küpe alırken hediye edilen küçük altın halkalarla birkaç charm birleşir ya da kolye gibi takılır. Marakeş’ten gerçek kartpostallar.",
 "ar": "تأتي ميداليات الفاكهة من YZA من أكشاك حيّنا Guéliz — من المدينة القديمة ومن شاحنات زوايا الشوارع. برتقال، ليمون، بطيخ، أفوكادو، عنب، كرز: نصبغ الرافيا يدويًا بألوان مميزة، ثم نحيكها فاكهةً فاكهة — إحدى أدقّ التقنيات. الميدالية لا تُعلّق على الحقيبة فقط: تُلبس على قطعة مجوهرات أيضًا، ومع الحلقات الذهبية الصغيرة المُهداة عند شراء الأقراط، تتجمّع عدة ميداليات أو تُلبس كقلادة. بطاقات بريدية حقيقية من مراكش."
 },
 "liveUrl": "https://yza-shop.com/products/watermelon-raffia-bag-charm"
 },
 "making": {
 "fr": "Watermelon is the charm for heat, terraces and long afternoons. It carries the most immediate summer feeling in the collection: a bright slice, made slowly, meant to travel. Chaque piece est travaillee au crochet main dans l atelier de Guéliz, puis controlee avant la pose de l etiquette YZA.",
 "en": "Watermelon is the charm for heat, terraces and long afternoons. It carries the most immediate summer feeling in the collection: a bright slice, made slowly, meant to travel. Each piece is hand-crocheted in the Guéliz atelier, then checked before the YZA tag is added.",
 "es": "La sandía es el charm del calor, las terrazas y las tardes largas. Es el que transmite la sensación de verano más inmediata de la colección: una rodaja brillante, hecha despacio, destinada a viajar. Cada pieza está tejida a mano en el taller de Guéliz y revisada antes de poner la etiqueta YZA.",
 "tr": "Karpuz, sıcak için, teraslar için ve uzun öğleden sonralar için yapılmış charm. Koleksiyondaki en anlık yaz hissini taşıyor: yavaş yapılmış, seyahat etmek için tasarlanmış parlak bir dilim. Her parça Guéliz atölyesinde el kroşesiyle yapılır, ardından YZA etiketi eklenmeden önce kontrol edilir.",
 "ar": "البطيخ هو ميدالية الحر والشرفات والعصريات الطويلة. تحمل الشعور الصيفي الأكثر فورية في المجموعة: شريحة مشرقة، مصنوعة بتأنّ، تُقصد للسفر. كل قطعة مصنوعة بالكروشيه اليدوي في أتيليه Guéliz، ثم تُفحص قبل إضافة علامة YZA."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l'eau ; s'il est mouillé, le faire sécher à l'air libre à l'ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l'anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "La rafia no necesita cuidados especiales. Evitar el agua; si se moja, dejar secar al aire libre alejada del sol directo. Evitar la exposición prolongada al sol para preservar los colores. Si el elemento dorado pierde su color, puede reemplazarse.",
 "tr": "Rafyanın özel bakıma ihtiyacı yoktur. Suyla temastan kaçının; ıslanırsa doğrudan güneş ışığından uzakta açık havada kurumaya bırakın. Renkleri korumak için uzun süreli güneş maruziyetinden kaçının. Altın öge rengini kaybederse değiştirilebilir.",
 "ar": "الرافيا لا تحتاج إلى عناية خاصة. تجنبي الماء؛ إذا ابتلت، جففيها في الهواء الطلق بعيداً عن أشعة الشمس المباشرة. تجنبي التعرض المطوّل للشمس للحفاظ على الألوان. إذا فقد العنصر الذهبي لونه، يمكن استبداله."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l'artisane qui l'a réalisée est inscrit sur l'étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Lista para regalar, con el nombre de la artesana que realizó la pieza grabado en la etiqueta YZA.",
 "tr": "Hediye için hazır; parçayı yapan ustanın adı YZA etiketine kazınmıştır.",
 "ar": "جاهزة للإهداء، مع اسم الحرفية التي صنعت القطعة منقوشاً على بطاقة YZA."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz'deki stüdyodan teslim alma mevcut.",
 "ar": "شحن مع تتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الأستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Satisfecho o reembolsado — 30 días",
 "tr": "Memnun olun ya da iade edin — 30 gün",
 "ar": "راضٍ أو مُستردّ — 30 يومًا"
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "badge": "limited",
 "hours": 1.5,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "watermelon-raffia-earrings-ss26",
 "lemon-slice-raffia-necklace-ss26"
 ]
 },
 {
 "handle": "raffia-avocado-half-charm-ss26",
 "fewLeft": true,
 "legacyHandles": [
 "avocat",
 "avocado"
 ],
 "sku": null,
 "name": {
 "fr": "Charm demi avocat en raphia",
 "en": "Raffia Avocado Half Charm",
 "es": "Raffia Avocado Half Charm",
 "tr": "Raffia Avocado Half Charm",
 "ar": "Raffia Avocado Half Charm"
 },
 "displayName": {
 "fr": "Charm demi avocat en raphia",
 "en": "Raffia Avocado Half Charm",
 "es": "Raffia Avocado Half Charm",
 "tr": "Raffia Avocado Half Charm",
 "ar": "Raffia Avocado Half Charm"
 },
 "short": {
 "fr": "Charm demi avocat en raphia, crochete main avec anneau dore 2,5 cm.",
 "en": "A crocheted raffia avocado half charm shown in the SS26 fruit charm grid. Price needs confirmation before publishing.",
 "es": "Un charm de medio aguacate en rafia tejido a ganchillo, con aro dorado de 2,5 cm.",
 "tr": "Bir tığ işi rafya avokado yarısı charm, 2,5 cm altın halkayla.",
 "ar": "ميدالية نصف أفوكادو من الرافيا بالكروشيه، مع حلقة ذهبية 2.5 سم."
 },
 "displayShort": {
 "fr": "Charm demi avocat en raphia, crochete main avec anneau dore 2,5 cm.",
 "en": "A crocheted raffia avocado half charm shown in the SS26 fruit charm grid. Price needs confirmation before publishing.",
 "es": "Un charm de medio aguacate en rafia tejido a ganchillo, con aro dorado de 2,5 cm.",
 "tr": "Bir tığ işi rafya avokado yarısı charm, 2,5 cm altın halkayla.",
 "ar": "ميدالية نصف أفوكادو من الرافيا بالكروشيه، مع حلقة ذهبية 2.5 سم."
 },
 "desc": {
 "fr": "Un clin d oeil aux rooftops au soleil: avocat vert doux, noyau contraste et crochet main en raphia. A porter sur panier, tote ou sac de ville.",
 "en": "A nod to brunches and rooftops in the sun. The Avocado charm mixes soft greens with a contrasting pit, all hand-crocheted in raffia. Looks great on straw baskets and canvas totes.",
 "es": "Un guiño a los brunchs y azoteas al sol. El charm de aguacate mezcla verdes suaves con un hueso contrastado, todo tejido a mano en rafia. Queda genial en cestos de paja y totes de lona.",
 "tr": "Güneşli brönchlara ve çatı teraslarına bir selam. Avokado charm, yumuşak yeşilleri zıt renkli çekirdekle harmanlıyor; tamamı rafyadan el kroşesiyle yapılmış. Hasır sepetler ve tuval tote çantalarda harika görünüyor.",
 "ar": "تحية للبرانش وأسطح المنازل تحت الشمس. تمزج ميدالية الأفوكادو بين الخضرة الناعمة والنواة المتباينة، كل شيء مصنوع بالكروشيه اليدوي من الرافيا. تبدو رائعة على السلال القشية وحقائب الكانفاس."
 },
 "price": 19000,
 "currency": "MAD",
 "category": "charms",
 "sourceCategory": "Fruit Charms",
 "categoryLabel": {
 "fr": "Charms",
 "en": "Charms",
 "es": "Complementos",
 "tr": "Charmlar",
 "ar": "تعليقات الحقيبة"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/original-shop/charms/raffia-avocado-half-charm-ss26-01.png",
 "gallery": [
 "assets/original-shop/charms/raffia-avocado-half-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-avocado-half-charm-ss26-02.webp",
 "assets/original-shop/charms/raffia-avocado-half-charm-ss26-03.jpg",
 "assets/original-shop/charms/raffia-avocado-half-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-avocado-half-charm-ss26-08.webp",
 "assets/original-shop/charms/raffia-avocado-half-charm-ss26-09.webp",
 "assets/lookbook-ss26-27/embedded/p60_img01_xref2285_8f75334c5653.webp",
 "assets/lookbook-ss26-27/embedded/p59_img01_xref1426_ab1030bf5e96.jpeg",
 "assets/lookbook-ss26-27/embedded/p58_img02_xref1416_b7482fc1dffb.jpeg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-60.jpg",
 "assets/lifestyle/charms/avocado-puzzle.jpg"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [],
 "variantCount": 0,
 "variant_count_from_xlsx_catalog": null,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit charm",
 "Avocado",
 "Raffia",
 "TBC"
 ],
 "seoTitle": "Avocado Raffia Charm - Handmade in Marrakech",
 "seoKeywords": [
 "Accessories",
 "Charm demi avocat en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Avocado Half Charm",
 "YZA",
 "accessories",
 "aguacate",
 "avocado",
 "avocat",
 "bag",
 "cadeau",
 "charm",
 "charms",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "handmade",
 "porte",
 "raffia-avocado-half-charm-ss26",
 "افوكادو"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Charm demi avocat en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Raffia Avocado Half Charm",
 "YZA",
 "accessories",
 "aguacate",
 "avocado",
 "avocat",
 "bag",
 "cadeau",
 "charm",
 "charms",
 "cle",
 "crochet",
 "fait main",
 "gift",
 "handmade",
 "porte",
 "raffia-avocado-half-charm-ss26",
 "افوكادو"
 ],
 "material": {
 "fr": "raphia crochete main raffia",
 "en": "hand-crocheted raffia",
 "es": "rafia tejida a mano con ganchillo",
 "tr": "el örgüsü rafya",
 "ar": "رافيا مصنوعة بالكروشيه اليدوي"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Solo rafia — tejida a ganchillo",
 "tr": "Yalnızca rafya — kroşe",
 "ar": "رافيا فقط — مصنوعة بالكروشيه"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Environ 6 x 3 cm (chaque piece peut legerement varier).",
 "en": "Approx. 6 x 3 cm (each piece may vary slightly).",
 "es": "Aprox. 6 x 3 cm (cada pieza puede variar ligeramente).",
 "tr": "Yaklaşık 6 x 3 cm (her parça hafifçe farklılık gösterebilir).",
 "ar": "حوالي 6 x 3 سم (قد تختلف كل قطعة قليلاً)."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Boucle en raffia et anneau doré 2 cm. Anneau de 3 cm disponible pour les bundles.",
 "en": "Raffia loop and 2 cm gold ring. 3 cm ring available for bundles.",
 "es": "Lazo de rafia y aro dorado de 2 cm. Aro de 3 cm disponible para los bundles.",
 "tr": "Rafya halka ve 2 cm altın halka. Bundle'lar için 3 cm halka mevcut.",
 "ar": "حلقة رافيا وحلقة ذهبية 2 سم. تتوفر حلقة 3 سم للحزم."
 },
 "handworkTime": {
 "fr": "2 h de crochet main pour ce fruit.",
 "en": "2 hours of hand crochet for this fruit.",
 "es": "2 horas de crochet a mano para esta fruta.",
 "tr": "Bu meyve için 2 saat el kroşesi.",
 "ar": "ساعتان كروشيه يدوي لهذه الفاكهة."
 },
 "howToWear": {
 "title": {
 "fr": "Comment le porter",
 "en": "How to wear it",
 "es": "Cómo llevarlo",
 "tr": "Nasıl kullanılır",
 "ar": "كيف تلبسينه"
 },
 "intro": {
 "fr": "Utilisez ce Fruit Charm sur:",
 "en": "Use this Fruit Charm on:",
 "es": "Úsalo en:",
 "tr": "Bu Meyve Charm'ı şunlara takın:",
 "ar": "استخدمي هذا الميدالية الفاكهة على:"
 },
 "items": [
 {
 "fr": "Les sacs YZA, La Vague et autres paniers de la marque.",
 "en": "YZA bags, La Vague and other YZA baskets.",
 "es": "Bolsos YZA, La Vague y otros cestos de la marca.",
 "tr": "YZA çantaları, La Vague ve diğer YZA sepetleri.",
 "ar": "حقائب YZA، La Vague وسلال YZA الأخرى."
 },
 {
 "fr": "Vos sacs en cuir pour ajouter une touche de personnalité et de couleur.",
 "en": "Leather bags to add personality and colour.",
 "es": "Bolsos de piel para añadir personalidad y color.",
 "tr": "Kişilik ve renk katmak için deri çantalar.",
 "ar": "الحقائب الجلدية لإضافة شخصية ولون."
 },
 {
 "fr": "Paniers en paille, market totes et sacs de plage.",
 "en": "Straw baskets, market totes and beach bags.",
 "es": "Cestos de paja, bolsas de mercado y bolsas de playa.",
 "tr": "Hasır sepetler, alışveriş çantaları ve plaj çantaları.",
 "ar": "السلال القشية، وحقائب السوق، وحقائب الشاطئ."
 },
 {
 "fr": "Clés, porte-clés et pochettes.",
 "en": "Keys, keychains and pouches.",
 "es": "Llaves, llaveros y bolsillos.",
 "tr": "Anahtarlar, anahtarlıklar ve kılıflar.",
 "ar": "المفاتيح والمفاتيح وحافظات المفاتيح."
 }
 ],
 "styleTip": {
 "fr": "Best on natural straw, canvas totes and cream leather. Mix with lemon slice for a fresh market set.",
 "en": "Best on natural straw, canvas totes and cream leather. Mix with lemon slice for a fresh market set.",
 "es": "Mejor en paja natural, totes de lona y cuero crema. Combínalo con rodaja de limón para un set de mercado fresco.",
 "tr": "Doğal hasır, tuval tote'lar ve krem deride en iyisi. Taze bir pazar seti için limon dilimi ile karıştırın.",
 "ar": "الأفضل على القش الطبيعي وحقائب الكانفاس والجلد الكريمي. امزجيه مع شريحة الليمون لطقم سوق طازج."
 },
 "note": {
 "fr": "Chaque charm vient avec une petite boucle. L anneau dore est inclus dans les bundles et peut etre ajoute au studio pour un charm seul.",
 "en": "Every charm comes with a small loop. The gold ring is included with bundles and can be added in studio for single charms.",
 "es": "Cada charm incluye un lazo pequeño. El aro dorado viene incluido en los bundles y puede añadirse en el estudio para charms individuales.",
 "tr": "Her charm küçük bir halkayla birlikte gelir. Altın halka bundle'lara dahildir; tek charmlar için stüdyoda eklenebilir.",
 "ar": "كل ميدالية تأتي مع حلقة صغيرة. الحلقة الذهبية مشمولة في الحزم ويمكن إضافتها في الأستوديو للميداليات المفردة."
 }
 },
 "fruitStory": {
 "title": {
 "fr": "Avocado: soft green, city sun.",
 "en": "Avocado: soft green, city sun.",
 "es": "El aguacate: verde suave, sol urbano.",
 "tr": "Avokado: yumuşak yeşil, şehir güneşi.",
 "ar": "الأفوكادو: الأخضر الناعم وشمس المدينة."
 },
 "body": {
 "fr": "Inspired by long Marrakesh brunches and the new generation of basket carriers. The avocado is quieter than the citrus fruits: softer, greener, a little more minimal. It works when the bag already has colour and needs a calm signature.",
 "en": "Inspired by long Marrakesh brunches and the new generation of basket carriers. The avocado is quieter than the citrus fruits: softer, greener, a little more minimal. It works when the bag already has colour and needs a calm signature.",
 "es": "Inspirado en los largos brunchs de Marrakech y la nueva generación de portadoras de cestos. El aguacate es más tranquilo que los cítricos: más suave, más verde, un poco más minimalista. Funciona cuando el bolso ya tiene color y necesita una firma serena.",
 "tr": "Uzun Marakeş brönchlarından ve yeni nesil sepet taşıyıcılarından ilham alınmış. Avokado, narenciye meyvelerinden daha sessiz: daha yumuşak, daha yeşil, biraz daha minimal. Çanta zaten renkli olduğunda ve sakin bir imzaya ihtiyaç duyduğunda işe yarıyor.",
 "ar": "مستوحاة من البرانش الطويلة بمراكش والجيل الجديد من حاملات السلال. الأفوكادو أهدأ من الفواكه الحمضية: أكثر نعومة، أكثر خضرة، أكثر مينيمالية قليلاً. تعمل حين تكون الحقيبة ملونة بالفعل وتحتاج توقيعاً هادئاً."
 },
 "collectionTitle": {
 "fr": "Fruit Market : inspiré des marchés de Marrakech",
 "en": "Fruit Market: inspired by the Marrakesh markets",
 "es": "Fruit Market: inspirado en los mercados de Marrakech",
 "tr": "Fruit Market: Marakeş pazarlarından ilham alınmıştır",
 "ar": "Fruit Market: مستوحى من أسواق مراكش"
 },
 "collectionBody": {
 "fr": "Les Fruit Charms viennent des étals de notre quartier de Guéliz — ceux de la médina comme ceux des camionnettes au coin de la rue. Oranges, citrons, pastèques, avocats, raisins, cerises : le raffia est teint par nos soins dans des couleurs emblématiques, puis crocheté fruit par fruit — l’une des techniques les plus délicates. Un charm ne se clipse pas qu’au sac : il se porte aussi sur un bijou, et avec les petits anneaux dorés offerts à l’achat des boucles, plusieurs charms se combinent ou se portent en collier. De véritables cartes postales de Marrakech.",
 "en": "The YZA Fruit Charms come from the stalls of our Guéliz neighbourhood — the médina ones and the street-corner vans alike. Oranges, lemons, watermelons, avocados, grapes, cherries: we hand-dye the raffia in iconic shades, then crochet it fruit by fruit — one of the most delicate crafts there is. A charm doesn’t only clip to a bag: it wears on jewellery too, and with the little gold rings gifted when you buy the earrings, several charms combine or wear as a necklace. True postcards from Marrakesh.",
 "es": "Los Fruit Charms de YZA vienen de los puestos de nuestro barrio de Guéliz, tanto los de la medina como las camionetas de la esquina. Naranjas, limones, sandías, aguacates, uvas, cerezas: teñimos la rafia a mano en colores emblemáticos y luego la tejemos fruta por fruta, una de las técnicas más delicadas. Un charm no solo se engancha al bolso: también se lleva en una joya, y con los pequeños aros dorados que se regalan al comprar los pendientes, varios charms se combinan o se llevan como collar. Verdaderas postales de Marrakech.",
 "tr": "YZA Meyve Charmları, Guéliz mahallemizin tezgâhlarından gelir — hem medinadakiler hem de sokak köşesindeki kamyonetler. Portakal, limon, karpuz, avokado, üzüm, kiraz: rafyayı ikonik tonlarda elde boyar, sonra meyve meyve örüyoruz — var olan en zarif tekniklerden biri. Bir charm yalnızca çantaya takılmaz: bir takının üzerinde de taşınır ve küpe alırken hediye edilen küçük altın halkalarla birkaç charm birleşir ya da kolye gibi takılır. Marakeş’ten gerçek kartpostallar.",
 "ar": "تأتي ميداليات الفاكهة من YZA من أكشاك حيّنا Guéliz — من المدينة القديمة ومن شاحنات زوايا الشوارع. برتقال، ليمون، بطيخ، أفوكادو، عنب، كرز: نصبغ الرافيا يدويًا بألوان مميزة، ثم نحيكها فاكهةً فاكهة — إحدى أدقّ التقنيات. الميدالية لا تُعلّق على الحقيبة فقط: تُلبس على قطعة مجوهرات أيضًا، ومع الحلقات الذهبية الصغيرة المُهداة عند شراء الأقراط، تتجمّع عدة ميداليات أو تُلبس كقلادة. بطاقات بريدية حقيقية من مراكش."
 },
 "liveUrl": "https://yza-shop.com/products/avocado-raffia-bag-charm"
 },
 "making": {
 "fr": "Inspired by long Marrakesh brunches and the new generation of basket carriers. The avocado is quieter than the citrus fruits: softer, greener, a little more minimal. It works when the bag already has colour and needs a calm signature. Chaque piece est travaillee au crochet main dans l atelier de Guéliz, puis controlee avant la pose de l etiquette YZA.",
 "en": "Inspired by long Marrakesh brunches and the new generation of basket carriers. The avocado is quieter than the citrus fruits: softer, greener, a little more minimal. It works when the bag already has colour and needs a calm signature. Each piece is hand-crocheted in the Guéliz atelier, then checked before the YZA tag is added.",
 "es": "Inspirado en los largos brunchs de Marrakech y la nueva generación de portadoras de cestos. El aguacate es más tranquilo que los cítricos: más suave, más verde, un poco más minimalista. Funciona cuando el bolso ya tiene color y necesita una firma serena. Cada pieza está tejida a mano en el taller de Guéliz y revisada antes de poner la etiqueta YZA.",
 "tr": "Uzun Marakeş brönchlarından ve yeni nesil sepet taşıyıcılarından ilham alınmış. Avokado, narenciye meyvelerinden daha sessiz: daha yumuşak, daha yeşil, biraz daha minimal. Çanta zaten renkli olduğunda ve sakin bir imzaya ihtiyaç duyduğunda işe yarıyor. Her parça Guéliz atölyesinde el kroşesiyle yapılır, ardından YZA etiketi eklenmeden önce kontrol edilir.",
 "ar": "مستوحاة من البرانش الطويلة بمراكش والجيل الجديد من حاملات السلال. الأفوكادو أهدأ من الفواكه الحمضية: أكثر نعومة، أكثر خضرة، أكثر مينيمالية قليلاً. تعمل حين تكون الحقيبة ملونة بالفعل وتحتاج توقيعاً هادئاً. كل قطعة مصنوعة بالكروشيه اليدوي في أتيليه Guéliz، ثم تُفحص قبل إضافة علامة YZA."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l'eau ; s'il est mouillé, le faire sécher à l'air libre à l'ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l'anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "La rafia no necesita cuidados especiales. Evitar el agua; si se moja, dejar secar al aire libre alejada del sol directo. Evitar la exposición prolongada al sol para preservar los colores. Si el elemento dorado pierde su color, puede reemplazarse.",
 "tr": "Rafyanın özel bakıma ihtiyacı yoktur. Suyla temastan kaçının; ıslanırsa doğrudan güneş ışığından uzakta açık havada kurumaya bırakın. Renkleri korumak için uzun süreli güneş maruziyetinden kaçının. Altın öge rengini kaybederse değiştirilebilir.",
 "ar": "الرافيا لا تحتاج إلى عناية خاصة. تجنبي الماء؛ إذا ابتلت، جففيها في الهواء الطلق بعيداً عن أشعة الشمس المباشرة. تجنبي التعرض المطوّل للشمس للحفاظ على الألوان. إذا فقد العنصر الذهبي لونه، يمكن استبداله."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l'artisane qui l'a réalisée est inscrit sur l'étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Lista para regalar, con el nombre de la artesana que realizó la pieza grabado en la etiqueta YZA.",
 "tr": "Hediye için hazır; parçayı yapan ustanın adı YZA etiketine kazınmıştır.",
 "ar": "جاهزة للإهداء، مع اسم الحرفية التي صنعت القطعة منقوشاً على بطاقة YZA."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en el estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz'deki stüdyodan teslim alma mevcut.",
 "ar": "شحن مع تتبع في غضون 2 إلى 5 أيام عمل. الاستلام من الأستوديو متاح في Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Satisfecho o reembolsado — 30 días",
 "tr": "Memnun olun ya da iade edin — 30 gün",
 "ar": "راضٍ أو مُستردّ — 30 يومًا"
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Pequeña serie de taller, producida al ritmo del crochet a mano.",
 "tr": "Küçük atölye serisi, el kroşesi hızında üretildi.",
 "ar": "دفعة أتيليه صغيرة، تُنتج بإيقاع الكروشيه اليدوي."
 },
 "badge": "limited",
 "hours": 2,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "la-sculpture-xs-basket-bag-ss26",
 "watermelon-raffia-earrings-ss26",
 "lemon-slice-raffia-necklace-ss26"
 ]
 },
 {
 "handle": "watermelon-raffia-earrings-ss26",
 "legacyHandles": [],
 "sku": null,
 "name": {
 "fr": "Boucles pasteque en raphia",
 "en": "Watermelon Raffia Earrings",
 "es": "Watermelon Raffia Earrings",
 "tr": "Watermelon Raffia Earrings",
 "ar": "Watermelon Raffia Earrings"
 },
 "displayName": {
 "fr": "Boucles pasteque en raphia",
 "en": "Watermelon Raffia Earrings",
 "es": "Watermelon Raffia Earrings",
 "tr": "Watermelon Raffia Earrings",
 "ar": "Watermelon Raffia Earrings"
 },
 "short": {
 "fr": "Boucles pasteque en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "Crocheted raffia watermelon earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "es": "Pendientes de sandía en rafia, tejidos a mano con aros dorados de 1,5 cm y nombre de la artesana en la etiqueta.",
 "tr": "El yapımı rafia karpuz küpeleri, 1,5 cm altın halkalar ve el etiketinde zanaatkar adıyla.",
 "ar": "أقراط بطيخ من الرافيا، منسوجة يدويًا مع حلقات ذهبية 1,5 سم واسم الحرفية على البطاقة."
 },
 "displayShort": {
 "fr": "Boucles pasteque en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "Crocheted raffia watermelon earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "es": "Pendientes de sandía en rafia, tejidos a mano con aros dorados de 1,5 cm y nombre de la artesana en la etiqueta.",
 "tr": "El yapımı rafia karpuz küpeleri, 1,5 cm altın halkalar ve el etiketinde zanaatkar adıyla.",
 "ar": "أقراط بطيخ من الرافيا، منسوجة يدويًا مع حلقات ذهبية 1,5 سم واسم الحرفية على البطاقة."
 },
 "desc": {
 "fr": "Boucles pasteque en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "Part of YZA’s Accessories line, these fruit earrings are crocheted in raffia and designed as wearable postcards from Marrakesh.",
 "es": "Parte de la línea de accesorios de YZA, estos pendientes de fruta están tejidos en rafia y diseñados como postales portables de Marrakech.",
 "tr": "YZA’nın Aksesuar serisinden bu meyve küpeleri rafiadan tığ işiyle örülmüş ve Marakeş’ten taşınabilir kartpostallar olarak tasarlanmıştır.",
 "ar": "من خط الإكسسوارات لدى YZA، هذه الأقراط الفاكهية منسوجة بالرافيا وصُمِّمت كبطاقات بريدية مرتدَاة من مراكش."
 },
 "price": 43000,
 "currency": "MAD",
 "category": "earrings",
 "sourceCategory": "Fruit Earrings",
 "categoryLabel": {
 "fr": "Boucles",
 "en": "Earrings",
 "es": "Pendientes",
 "tr": "Küpeler",
 "ar": "أقراط"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/products/accessories-clean/watermelon-slice-accessory-clean.webp",
 "gallery": [
 "assets/products/accessories-clean/watermelon-slice-accessory-clean.webp",
 "assets/lookbook-ss26-27/embedded/p56_img02_xref1402_2ffff76a0151.jpeg"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "watermelon-raffia-earrings-ss26",
 "sku": null,
 "category": "BO",
 "source_type": "pastéques x2",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 15
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit earrings",
 "Watermelon",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Watermelon Raffia Earrings - Handmade in Marrakech",
 "seoKeywords": [
 "Accessories",
 "Boucles pasteque en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Watermelon Raffia Earrings",
 "YZA",
 "accessories",
 "bijoux",
 "boucles",
 "crochet",
 "earrings",
 "fait main",
 "handmade",
 "kupe",
 "pasteque",
 "pendientes",
 "sandia",
 "watermelon",
 "watermelon-raffia-earrings-ss26",
 "اقراط",
 "بطيخ"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Boucles pasteque en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Watermelon Raffia Earrings",
 "YZA",
 "accessories",
 "bijoux",
 "boucles",
 "crochet",
 "earrings",
 "fait main",
 "handmade",
 "kupe",
 "pasteque",
 "pendientes",
 "sandia",
 "watermelon",
 "watermelon-raffia-earrings-ss26",
 "اقراط",
 "بطيخ"
 ],
 "material": {
 "fr": "Raffia, Creoles dorees",
 "en": "Raffia, Gold earrings",
 "es": "Rafia, Aros dorados",
 "tr": "Rafya, Altın halkalar",
 "ar": "رافيا، حلقات ذهبية"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Solo rafia - tejido a ganchillo",
 "tr": "Yalnızca rafya - tığ işi",
 "ar": "رافيا فقط - كروشيه"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Petit format bijou textile, leger et visible.",
 "en": "Small textile-jewellery scale, light and visible.",
 "es": "Escala pequeña de joyería textil, ligero y visible.",
 "tr": "Küçük tekstil-mücevheri ölçeği, hafif ve görünür.",
 "ar": "حجم مجوهرات نسيجية صغيرة، خفيف وواضح."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Creole doree 1,5 cm.",
 "en": "1.5 cm gold earring.",
 "es": "Aro dorado de 1,5 cm.",
 "tr": "1,5 cm altın halka.",
 "ar": "حلقة ذهبية 1,5 سم."
 },
 "handworkTime": {
 "fr": "Crochet main et montage bijou, piece par piece.",
 "en": "Hand crochet and jewellery assembly, piece by piece.",
 "es": "Ganchillo a mano y montaje de joyería, pieza por pieza.",
 "tr": "El tığ işi ve mücevher montajı, parça parça.",
 "ar": "كروشيه يدوي وتجميع مجوهرات، قطعة قطعة."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Fruit crochete main puis monte sur creole doree legere.",
 "en": "Hand-crocheted fruit mounted on a light golden earring.",
 "es": "Fruta tejida a mano montada sobre un aro dorado ligero.",
 "tr": "El yapımı tığ işi meyve, hafif bir altın halkaya monte edilmiş.",
 "ar": "فاكهة منسوجة يدويًا ومثبتة على حلقة ذهبية خفيفة."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l’eau ; s’il est mouillé, le faire sécher à l’air libre à l’ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l’anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "La rafia no necesita cuidados especiales. Evitar el agua; si se moja, secar al aire libre alejado del sol directo. Evitar la exposición prolongada al sol para preservar los colores. Si el elemento dorado pierde su color, puede reemplazarse.",
 "tr": "Rafyanın özel bakıma ihtiyacı yoktur. Suyla temastan kaçının; ıslanırsa doğrudan güneş ışığından uzakta açık havada kurutun. Renkleri korumak için uzun süreli güneş maruziyetinden kaçının. Altın unsur rengini kaybederse değiştirilebilir.",
 "ar": "الرافيا لا تحتاج إلى عناية خاصة. تجنب الماء؛ إذا ابتلت، جففها في الهواء الطلق بعيدًا عن أشعة الشمس المباشرة. تجنب التعرض المطول للشمس للحفاظ على الألوان. إذا فقد العنصر الذهبي لونه، يمكن استبداله."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l’artisane qui l’a réalisée est inscrit sur l’étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Listo para regalar, con el nombre de la artesana que realizó la pieza grabado en la etiqueta YZA.",
 "tr": "Hediyeye hazır, parçayı yapan zanaatkarın adı YZA etiketine kazınmış.",
 "ar": "جاهز للإهداء، مع اسم الحرفية التي صنعت القطعة منقوشًا على بطاقة YZA."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz’deki stüdyodan teslim alma mevcut.",
 "ar": "شحن مع تتبع خلال 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في جيليز."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Éditions limitées de atelier, producidas al ritmo del ganchillo a mano.",
 "tr": "Küçük atölye serisi, el tığ işi temposunda üretilmiştir.",
 "ar": "دُفعة أتيليه صغيرة، مُنتَجة على وتيرة الكروشيه اليدوي."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Éditions limitées de atelier, producidas al ritmo del ganchillo a mano.",
 "tr": "Küçük atölye serisi, el tığ işi temposunda üretilmiştir.",
 "ar": "دُفعة أتيليه صغيرة، مُنتَجة على وتيرة الكروشيه اليدوي."
 },
 "badge": "limited",
 "hours": 5,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "raffia-cherries-charm-ss26",
 "la-sculpture-xs-basket-bag-ss26",
 "lemon-slice-raffia-necklace-ss26"
 ]
 },
 {
 "handle": "kiwi-raffia-earrings-ss26",
 "legacyHandles": [],
 "sku": null,
 "name": {
 "fr": "Boucles kiwi en raphia",
 "en": "Kiwi Raffia Earrings",
 "es": "Kiwi Raffia Earrings",
 "tr": "Kiwi Raffia Earrings",
 "ar": "Kiwi Raffia Earrings"
 },
 "displayName": {
 "fr": "Boucles kiwi en raphia",
 "en": "Kiwi Raffia Earrings",
 "es": "Kiwi Raffia Earrings",
 "tr": "Kiwi Raffia Earrings",
 "ar": "Kiwi Raffia Earrings"
 },
 "short": {
 "fr": "Boucles kiwi en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "Crocheted raffia kiwi earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "es": "Crocheted raffia kiwi earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "tr": "Crocheted raffia kiwi earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "ar": "Crocheted raffia kiwi earrings with 1.5 cm gold earrings and artisan credits on the hand tag."
 },
 "displayShort": {
 "fr": "Boucles kiwi en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "Crocheted raffia kiwi earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "es": "Crocheted raffia kiwi earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "tr": "Crocheted raffia kiwi earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "ar": "Crocheted raffia kiwi earrings with 1.5 cm gold earrings and artisan credits on the hand tag."
 },
 "desc": {
 "fr": "Boucles kiwi en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "Part of YZA’s Accessories line, these fruit earrings are crocheted in raffia and designed as wearable postcards from Marrakesh.",
 "es": "Part of YZA’s Accessories line, these fruit earrings are crocheted in raffia and designed as wearable postcards from Marrakesh.",
 "tr": "Part of YZA’s Accessories line, these fruit earrings are crocheted in raffia and designed as wearable postcards from Marrakesh.",
 "ar": "Part of YZA’s Accessories line, these fruit earrings are crocheted in raffia and designed as wearable postcards from Marrakesh."
 },
 "price": 43000,
 "currency": "MAD",
 "category": "earrings",
 "sourceCategory": "Fruit Earrings",
 "categoryLabel": {
 "fr": "Boucles",
 "en": "Earrings",
 "es": "Earrings",
 "tr": "Earrings",
 "ar": "Earrings"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/products/accessories-clean/kiwi-raffia-earrings-clean.png",
 "gallery": [
 "assets/products/accessories-clean/kiwi-raffia-earrings-clean.png"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "kiwi-raffia-earrings-ss26",
 "sku": null,
 "category": "BO",
 "source_type": "kiwi slice x2",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 18
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit earrings",
 "Kiwi",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Kiwi Raffia Earrings - Handmade in Marrakech",
 "seoKeywords": [
 "Accessories",
 "Boucles kiwi en raphia",
 "Guéliz",
 "Guéliz",
 "Kiwi Raffia Earrings",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "accessories",
 "bijoux",
 "boucles",
 "crochet",
 "earrings",
 "fait main",
 "handmade",
 "kiwi",
 "kiwi-raffia-earrings-ss26",
 "kupe",
 "pendientes",
 "اقراط",
 "كيوي"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Boucles kiwi en raphia",
 "Guéliz",
 "Guéliz",
 "Kiwi Raffia Earrings",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "accessories",
 "bijoux",
 "boucles",
 "crochet",
 "earrings",
 "fait main",
 "handmade",
 "kiwi",
 "kiwi-raffia-earrings-ss26",
 "kupe",
 "pendientes",
 "اقراط",
 "كيوي"
 ],
 "material": {
 "fr": "Raffia, Creoles dorees",
 "en": "Raffia, Gold earrings",
 "es": "Raffia, Gold earrings",
 "tr": "Raffia, Gold earrings",
 "ar": "Raffia, Gold earrings"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Raffia only - crocheted",
 "tr": "Raffia only - crocheted",
 "ar": "Raffia only - crocheted"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Petit format bijou textile, leger et visible.",
 "en": "Small textile-jewellery scale, light and visible.",
 "es": "Small textile-jewellery scale, light and visible.",
 "tr": "Small textile-jewellery scale, light and visible.",
 "ar": "Small textile-jewellery scale, light and visible."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Creole doree 1,5 cm.",
 "en": "1.5 cm gold earring.",
 "es": "1.5 cm gold earring.",
 "tr": "1.5 cm gold earring.",
 "ar": "1.5 cm gold earring."
 },
 "handworkTime": {
 "fr": "Crochet main et montage bijou, piece par piece.",
 "en": "Hand crochet and jewellery assembly, piece by piece.",
 "es": "Hand crochet and jewellery assembly, piece by piece.",
 "tr": "Hand crochet and jewellery assembly, piece by piece.",
 "ar": "Hand crochet and jewellery assembly, piece by piece."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Fruit crochete main puis monte sur creole doree legere.",
 "en": "Hand-crocheted fruit mounted on a light golden earring.",
 "es": "Hand-crocheted fruit mounted on a light golden earring.",
 "tr": "Hand-crocheted fruit mounted on a light golden earring.",
 "ar": "Hand-crocheted fruit mounted on a light golden earring."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l'eau ; s'il est mouillé, le faire sécher à l'air libre à l'ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l'anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "tr": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "ar": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l'artisane qui l'a réalisée est inscrit sur l'étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "tr": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "ar": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "tr": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "ar": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Small atelier batch, produced at hand-crochet pace.",
 "tr": "Small atelier batch, produced at hand-crochet pace.",
 "ar": "Small atelier batch, produced at hand-crochet pace."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Small atelier batch, produced at hand-crochet pace.",
 "tr": "Small atelier batch, produced at hand-crochet pace.",
 "ar": "Small atelier batch, produced at hand-crochet pace."
 },
 "badge": "limited",
 "hours": 5,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "raffia-cherries-charm-ss26",
 "la-sculpture-xs-basket-bag-ss26",
 "lemon-slice-raffia-necklace-ss26"
 ]
 },
 {
 "handle": "lemon-raffia-earrings-ss26",
 "legacyHandles": [],
 "sku": null,
 "name": {
 "fr": "Boucles citron en raphia",
 "en": "Lemon Raffia Earrings",
 "es": "Lemon Raffia Earrings",
 "tr": "Lemon Raffia Earrings",
 "ar": "Lemon Raffia Earrings"
 },
 "displayName": {
 "fr": "Boucles citron en raphia",
 "en": "Lemon Raffia Earrings",
 "es": "Lemon Raffia Earrings",
 "tr": "Lemon Raffia Earrings",
 "ar": "Lemon Raffia Earrings"
 },
 "short": {
 "fr": "Boucles citron en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "Crocheted raffia lemon earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "es": "Pendientes de limón en rafia, tejidos a mano con aros dorados de 1,5 cm y nombre de la artesana en la etiqueta.",
 "tr": "El yapımı rafia limon küpeleri, 1,5 cm altın halkalar ve el etiketinde zanaatkar adıyla.",
 "ar": "أقراط ليمون من الرافيا، منسوجة يدويًا مع حلقات ذهبية 1,5 سم واسم الحرفية على البطاقة."
 },
 "displayShort": {
 "fr": "Boucles citron en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "Crocheted raffia lemon earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "es": "Pendientes de limón en rafia, tejidos a mano con aros dorados de 1,5 cm y nombre de la artesana en la etiqueta.",
 "tr": "El yapımı rafia limon küpeleri, 1,5 cm altın halkalar ve el etiketinde zanaatkar adıyla.",
 "ar": "أقراط ليمون من الرافيا، منسوجة يدويًا مع حلقات ذهبية 1,5 سم واسم الحرفية على البطاقة."
 },
 "desc": {
 "fr": "Boucles citron en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "A raffia fruit earring style from YZA’s Accessories collection, handmade as part of the SS26 fruit family.",
 "es": "Un estilo de pendiente de fruta en rafia de la colección de accesorios de YZA, hecho a mano como parte de la familia de frutas SS26.",
 "tr": "YZA’nın Aksesuar koleksiyonundan rafia meyve küpesi modeli, SS26 meyve ailesinin bir parçası olarak el yapımı.",
 "ar": "تصميم أقراط فاكهة من الرافيا من مجموعة الإكسسوارات لدى YZA، مصنوع يدويًا ضمن عائلة الفاكهة SS26."
 },
 "price": 46000,
 "currency": "MAD",
 "category": "earrings",
 "sourceCategory": "Fruit Earrings",
 "categoryLabel": {
 "fr": "Boucles",
 "en": "Earrings",
 "es": "Pendientes",
 "tr": "Küpeler",
 "ar": "أقراط"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/products/accessories-clean/lemon-raffia-earrings-clean.webp",
 "lifestyleVideo": "assets/lifestyle/accessories/lemon-earrings.mp4",
 "gallery": [
 "assets/products/accessories-clean/lemon-raffia-earrings-clean.webp",
 "assets/lifestyle/accessories/lemon-earrings-cafe.webp"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "lemon-raffia-earrings-ss26",
 "sku": null,
 "category": "BO",
 "source_type": "lemon",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 16
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit earrings",
 "Lemon",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Lemon Raffia Earrings - Handmade in Marrakech",
 "seoKeywords": [
 "Accessories",
 "Boucles citron en raphia",
 "Guéliz",
 "Guéliz",
 "Lemon Raffia Earrings",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "accessories",
 "bijoux",
 "boucles",
 "citron",
 "crochet",
 "earrings",
 "fait main",
 "handmade",
 "kupe",
 "lemon-raffia-earrings-ss26",
 "limon",
 "pendientes",
 "اقراط",
 "ليمون"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Boucles citron en raphia",
 "Guéliz",
 "Guéliz",
 "Lemon Raffia Earrings",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "accessories",
 "bijoux",
 "boucles",
 "citron",
 "crochet",
 "earrings",
 "fait main",
 "handmade",
 "kupe",
 "lemon-raffia-earrings-ss26",
 "limon",
 "pendientes",
 "اقراط",
 "ليمون"
 ],
 "material": {
 "fr": "Raffia, Creoles dorees",
 "en": "Raffia, Gold earrings",
 "es": "Rafia, Aros dorados",
 "tr": "Rafya, Altın halkalar",
 "ar": "رافيا، حلقات ذهبية"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Solo rafia - tejido a ganchillo",
 "tr": "Yalnızca rafya - tığ işi",
 "ar": "رافيا فقط - كروشيه"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Petit format bijou textile, leger et visible.",
 "en": "Small textile-jewellery scale, light and visible.",
 "es": "Escala pequeña de joyería textil, ligero y visible.",
 "tr": "Küçük tekstil-mücevheri ölçeği, hafif ve görünür.",
 "ar": "حجم مجوهرات نسيجية صغيرة، خفيف وواضح."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Creole doree 1,5 cm.",
 "en": "1.5 cm gold earring.",
 "es": "Aro dorado de 1,5 cm.",
 "tr": "1,5 cm altın halka.",
 "ar": "حلقة ذهبية 1,5 سم."
 },
 "handworkTime": {
 "fr": "Crochet main et montage bijou, piece par piece.",
 "en": "Hand crochet and jewellery assembly, piece by piece.",
 "es": "Ganchillo a mano y montaje de joyería, pieza por pieza.",
 "tr": "El tığ işi ve mücevher montajı, parça parça.",
 "ar": "كروشيه يدوي وتجميع مجوهرات، قطعة قطعة."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Fruit crochete main puis monte sur creole doree legere.",
 "en": "Hand-crocheted fruit mounted on a light golden earring.",
 "es": "Fruta tejida a mano montada sobre un aro dorado ligero.",
 "tr": "El yapımı tığ işi meyve, hafif bir altın halkaya monte edilmiş.",
 "ar": "فاكهة منسوجة يدويًا ومثبتة على حلقة ذهبية خفيفة."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l’eau ; s’il est mouillé, le faire sécher à l’air libre à l’ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l’anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "La rafia no necesita cuidados especiales. Evitar el agua; si se moja, secar al aire libre alejado del sol directo. Evitar la exposición prolongada al sol para preservar los colores. Si el elemento dorado pierde su color, puede reemplazarse.",
 "tr": "Rafyanın özel bakıma ihtiyacı yoktur. Suyla temastan kaçının; ıslanırsa doğrudan güneş ışığından uzakta açık havada kurutun. Renkleri korumak için uzun süreli güneş maruziyetinden kaçının. Altın unsur rengini kaybederse değiştirilebilir.",
 "ar": "الرافيا لا تحتاج إلى عناية خاصة. تجنب الماء؛ إذا ابتلت، جففها في الهواء الطلق بعيدًا عن أشعة الشمس المباشرة. تجنب التعرض المطول للشمس للحفاظ على الألوان. إذا فقد العنصر الذهبي لونه، يمكن استبداله."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l’artisane qui l’a réalisée est inscrit sur l’étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Listo para regalar, con el nombre de la artesana que realizó la pieza grabado en la etiqueta YZA.",
 "tr": "Hediyeye hazır, parçayı yapan zanaatkarın adı YZA etiketine kazınmış.",
 "ar": "جاهز للإهداء، مع اسم الحرفية التي صنعت القطعة منقوشًا على بطاقة YZA."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz’deki stüdyodan teslim alma mevcut.",
 "ar": "شحن مع تتبع خلال 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في جيليز."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Éditions limitées de atelier, producidas al ritmo del ganchillo a mano.",
 "tr": "Küçük atölye serisi, el tığ işi temposunda üretilmiştir.",
 "ar": "دُفعة أتيليه صغيرة، مُنتَجة على وتيرة الكروشيه اليدوي."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Éditions limitées de atelier, producidas al ritmo del ganchillo a mano.",
 "tr": "Küçük atölye serisi, el tığ işi temposunda üretilmiştir.",
 "ar": "دُفعة أتيليه صغيرة، مُنتَجة على وتيرة الكروشيه اليدوي."
 },
 "badge": "bestseller",
 "hours": 5,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "raffia-cherries-charm-ss26",
 "la-sculpture-xs-basket-bag-ss26",
 "lemon-slice-raffia-necklace-ss26"
 ]
 },
 {
 "handle": "orange-raffia-earrings-ss26",
 "legacyHandles": [],
 "sku": null,
 "name": {
 "fr": "Boucles orange en raphia",
 "en": "Orange Raffia Earrings",
 "es": "Orange Raffia Earrings",
 "tr": "Orange Raffia Earrings",
 "ar": "Orange Raffia Earrings"
 },
 "displayName": {
 "fr": "Boucles orange en raphia",
 "en": "Orange Raffia Earrings",
 "es": "Orange Raffia Earrings",
 "tr": "Orange Raffia Earrings",
 "ar": "Orange Raffia Earrings"
 },
 "short": {
 "fr": "Boucles orange en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "Crocheted raffia orange earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "es": "Pendientes de naranja en rafia, tejidos a mano con aros dorados de 1,5 cm y nombre de la artesana en la etiqueta.",
 "tr": "El yapımı rafia portakal küpeleri, 1,5 cm altın halkalar ve el etiketinde zanaatkar adıyla.",
 "ar": "أقراط برتقال من الرافيا، منسوجة يدويًا مع حلقات ذهبية 1,5 سم واسم الحرفية على البطاقة."
 },
 "displayShort": {
 "fr": "Boucles orange en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "Crocheted raffia orange earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "es": "Pendientes de naranja en rafia, tejidos a mano con aros dorados de 1,5 cm y nombre de la artesana en la etiqueta.",
 "tr": "El yapımı rafia portakal küpeleri, 1,5 cm altın halkalar ve el etiketinde zanaatkar adıyla.",
 "ar": "أقراط برتقال من الرافيا، منسوجة يدويًا مع حلقات ذهبية 1,5 سم واسم الحرفية على البطاقة."
 },
 "desc": {
 "fr": "Boucles orange en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "A raffia fruit earring style from YZA’s Accessories collection, handmade as part of the SS26 fruit family.",
 "es": "Un estilo de pendiente de fruta en rafia de la colección de accesorios de YZA, hecho a mano como parte de la familia de frutas SS26.",
 "tr": "YZA’nın Aksesuar koleksiyonundan rafia meyve küpesi modeli, SS26 meyve ailesinin bir parçası olarak el yapımı.",
 "ar": "تصميم أقراط فاكهة من الرافيا من مجموعة الإكسسوارات لدى YZA، مصنوع يدويًا ضمن عائلة الفاكهة SS26."
 },
 "price": 46000,
 "currency": "MAD",
 "category": "earrings",
 "sourceCategory": "Fruit Earrings",
 "categoryLabel": {
 "fr": "Boucles",
 "en": "Earrings",
 "es": "Pendientes",
 "tr": "Küpeler",
 "ar": "أقراط"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/products/accessories-clean/orange-raffia-earrings-clean.webp",
 "gallery": [
 "assets/products/accessories-clean/orange-raffia-earrings-clean.webp"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "orange-raffia-earrings-ss26",
 "sku": null,
 "category": "BO",
 "source_type": "oranges",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 14
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit earrings",
 "Orange",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Orange Raffia Earrings - Handmade in Marrakech",
 "seoKeywords": [
 "Accessories",
 "Boucles orange en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Orange Raffia Earrings",
 "YZA",
 "accessories",
 "bijoux",
 "boucles",
 "crochet",
 "earrings",
 "fait main",
 "handmade",
 "kupe",
 "naranja",
 "orange",
 "orange-raffia-earrings-ss26",
 "pendientes",
 "اقراط",
 "برتقال"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Boucles orange en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Orange Raffia Earrings",
 "YZA",
 "accessories",
 "bijoux",
 "boucles",
 "crochet",
 "earrings",
 "fait main",
 "handmade",
 "kupe",
 "naranja",
 "orange",
 "orange-raffia-earrings-ss26",
 "pendientes",
 "اقراط",
 "برتقال"
 ],
 "material": {
 "fr": "Raffia, Creoles dorees",
 "en": "Raffia, Gold earrings",
 "es": "Rafia, Aros dorados",
 "tr": "Rafya, Altın halkalar",
 "ar": "رافيا، حلقات ذهبية"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Solo rafia - tejido a ganchillo",
 "tr": "Yalnızca rafya - tığ işi",
 "ar": "رافيا فقط - كروشيه"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Petit format bijou textile, leger et visible.",
 "en": "Small textile-jewellery scale, light and visible.",
 "es": "Escala pequeña de joyería textil, ligero y visible.",
 "tr": "Küçük tekstil-mücevheri ölçeği, hafif ve görünür.",
 "ar": "حجم مجوهرات نسيجية صغيرة، خفيف وواضح."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Creole doree 1,5 cm.",
 "en": "1.5 cm gold earring.",
 "es": "Aro dorado de 1,5 cm.",
 "tr": "1,5 cm altın halka.",
 "ar": "حلقة ذهبية 1,5 سم."
 },
 "handworkTime": {
 "fr": "Crochet main et montage bijou, piece par piece.",
 "en": "Hand crochet and jewellery assembly, piece by piece.",
 "es": "Ganchillo a mano y montaje de joyería, pieza por pieza.",
 "tr": "El tığ işi ve mücevher montajı, parça parça.",
 "ar": "كروشيه يدوي وتجميع مجوهرات، قطعة قطعة."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Fruit crochete main puis monte sur creole doree legere.",
 "en": "Hand-crocheted fruit mounted on a light golden earring.",
 "es": "Fruta tejida a mano montada sobre un aro dorado ligero.",
 "tr": "El yapımı tığ işi meyve, hafif bir altın halkaya monte edilmiş.",
 "ar": "فاكهة منسوجة يدويًا ومثبتة على حلقة ذهبية خفيفة."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l’eau ; s’il est mouillé, le faire sécher à l’air libre à l’ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l’anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "La rafia no necesita cuidados especiales. Evitar el agua; si se moja, secar al aire libre alejado del sol directo. Evitar la exposición prolongada al sol para preservar los colores. Si el elemento dorado pierde su color, puede reemplazarse.",
 "tr": "Rafyanın özel bakıma ihtiyacı yoktur. Suyla temastan kaçının; ıslanırsa doğrudan güneş ışığından uzakta açık havada kurutun. Renkleri korumak için uzun süreli güneş maruziyetinden kaçının. Altın unsur rengini kaybederse değiştirilebilir.",
 "ar": "الرافيا لا تحتاج إلى عناية خاصة. تجنب الماء؛ إذا ابتلت، جففها في الهواء الطلق بعيدًا عن أشعة الشمس المباشرة. تجنب التعرض المطول للشمس للحفاظ على الألوان. إذا فقد العنصر الذهبي لونه، يمكن استبداله."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l’artisane qui l’a réalisée est inscrit sur l’étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Listo para regalar, con el nombre de la artesana que realizó la pieza grabado en la etiqueta YZA.",
 "tr": "Hediyeye hazır, parçayı yapan zanaatkarın adı YZA etiketine kazınmış.",
 "ar": "جاهز للإهداء، مع اسم الحرفية التي صنعت القطعة منقوشًا على بطاقة YZA."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz’deki stüdyodan teslim alma mevcut.",
 "ar": "شحن مع تتبع خلال 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في جيليز."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Éditions limitées de atelier, producidas al ritmo del ganchillo a mano.",
 "tr": "Küçük atölye serisi, el tığ işi temposunda üretilmiştir.",
 "ar": "دُفعة أتيليه صغيرة، مُنتَجة على وتيرة الكروشيه اليدوي."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Éditions limitées de atelier, producidas al ritmo del ganchillo a mano.",
 "tr": "Küçük atölye serisi, el tığ işi temposunda üretilmiştir.",
 "ar": "دُفعة أتيليه صغيرة، مُنتَجة على وتيرة الكروشيه اليدوي."
 },
 "badge": "limited",
 "hours": 5,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "raffia-cherries-charm-ss26",
 "la-sculpture-xs-basket-bag-ss26",
 "lemon-slice-raffia-necklace-ss26"
 ]
 },
 {
 "handle": "grapes-raffia-earrings-ss26",
 "legacyHandles": [],
 "sku": null,
 "name": {
 "fr": "Boucles raisins en raphia",
 "en": "Grapes Raffia Earrings",
 "es": "Grapes Raffia Earrings",
 "tr": "Grapes Raffia Earrings",
 "ar": "Grapes Raffia Earrings"
 },
 "displayName": {
 "fr": "Boucles raisins en raphia",
 "en": "Grapes Raffia Earrings",
 "es": "Grapes Raffia Earrings",
 "tr": "Grapes Raffia Earrings",
 "ar": "Grapes Raffia Earrings"
 },
 "short": {
 "fr": "Boucles raisins en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "Crocheted raffia grapes earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "es": "Crocheted raffia grapes earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "tr": "Crocheted raffia grapes earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "ar": "Crocheted raffia grapes earrings with 1.5 cm gold earrings and artisan credits on the hand tag."
 },
 "displayShort": {
 "fr": "Boucles raisins en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "Crocheted raffia grapes earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "es": "Crocheted raffia grapes earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "tr": "Crocheted raffia grapes earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "ar": "Crocheted raffia grapes earrings with 1.5 cm gold earrings and artisan credits on the hand tag."
 },
 "desc": {
 "fr": "Boucles raisins en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "A raffia fruit earring style from YZA’s Accessories collection, handmade as part of the SS26 fruit family.",
 "es": "A raffia fruit earring style from YZA’s Accessories collection, handmade as part of the SS26 fruit family.",
 "tr": "A raffia fruit earring style from YZA’s Accessories collection, handmade as part of the SS26 fruit family.",
 "ar": "A raffia fruit earring style from YZA’s Accessories collection, handmade as part of the SS26 fruit family."
 },
 "price": 43000,
 "currency": "MAD",
 "category": "earrings",
 "sourceCategory": "Fruit Earrings",
 "categoryLabel": {
 "fr": "Boucles",
 "en": "Earrings",
 "es": "Earrings",
 "tr": "Earrings",
 "ar": "Earrings"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/products/accessories-clean/grapes-accessory-clean.png",
 "lifestyleVideo": "assets/lifestyle/accessories/grapes-earrings.mp4",
 "gallery": [
 "assets/products/accessories-clean/grapes-accessory-clean.png",
 "assets/lookbook-ss26-27/embedded/p55_img01_xref1397_f3009f829bf8.jpeg",
 "assets/lifestyle/accessories/grapes-earrings-souk.webp"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "grapes-raffia-earrings-ss26",
 "sku": null,
 "category": "BO",
 "source_type": "grapes x2",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 19
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit earrings",
 "Grapes",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Grapes Raffia Earrings - Handmade in Marrakech",
 "seoKeywords": [
 "Accessories",
 "Boucles raisins en raphia",
 "Grapes Raffia Earrings",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "accessories",
 "bijoux",
 "boucles",
 "crochet",
 "earrings",
 "fait main",
 "grapes",
 "grapes-raffia-earrings-ss26",
 "handmade",
 "kupe",
 "pendientes",
 "raisin",
 "raisins",
 "uvas",
 "اقراط",
 "عنب"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Boucles raisins en raphia",
 "Grapes Raffia Earrings",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "accessories",
 "bijoux",
 "boucles",
 "crochet",
 "earrings",
 "fait main",
 "grapes",
 "grapes-raffia-earrings-ss26",
 "handmade",
 "kupe",
 "pendientes",
 "raisin",
 "raisins",
 "uvas",
 "اقراط",
 "عنب"
 ],
 "material": {
 "fr": "Raffia, Creoles dorees",
 "en": "Raffia, Gold earrings",
 "es": "Raffia, Gold earrings",
 "tr": "Raffia, Gold earrings",
 "ar": "Raffia, Gold earrings"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Raffia only - crocheted",
 "tr": "Raffia only - crocheted",
 "ar": "Raffia only - crocheted"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Petit format bijou textile, leger et visible.",
 "en": "Small textile-jewellery scale, light and visible.",
 "es": "Small textile-jewellery scale, light and visible.",
 "tr": "Small textile-jewellery scale, light and visible.",
 "ar": "Small textile-jewellery scale, light and visible."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Creole doree 1,5 cm.",
 "en": "1.5 cm gold earring.",
 "es": "1.5 cm gold earring.",
 "tr": "1.5 cm gold earring.",
 "ar": "1.5 cm gold earring."
 },
 "handworkTime": {
 "fr": "Crochet main et montage bijou, piece par piece.",
 "en": "Hand crochet and jewellery assembly, piece by piece.",
 "es": "Hand crochet and jewellery assembly, piece by piece.",
 "tr": "Hand crochet and jewellery assembly, piece by piece.",
 "ar": "Hand crochet and jewellery assembly, piece by piece."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Fruit crochete main puis monte sur creole doree legere.",
 "en": "Hand-crocheted fruit mounted on a light golden earring.",
 "es": "Hand-crocheted fruit mounted on a light golden earring.",
 "tr": "Hand-crocheted fruit mounted on a light golden earring.",
 "ar": "Hand-crocheted fruit mounted on a light golden earring."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l'eau ; s'il est mouillé, le faire sécher à l'air libre à l'ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l'anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "tr": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "ar": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l'artisane qui l'a réalisée est inscrit sur l'étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "tr": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "ar": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "tr": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "ar": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Small atelier batch, produced at hand-crochet pace.",
 "tr": "Small atelier batch, produced at hand-crochet pace.",
 "ar": "Small atelier batch, produced at hand-crochet pace."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Small atelier batch, produced at hand-crochet pace.",
 "tr": "Small atelier batch, produced at hand-crochet pace.",
 "ar": "Small atelier batch, produced at hand-crochet pace."
 },
 "badge": "limited",
 "hours": 5,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "raffia-cherries-charm-ss26",
 "la-sculpture-xs-basket-bag-ss26",
 "lemon-slice-raffia-necklace-ss26"
 ]
 },
 {
 "handle": "cherries-raffia-earrings-ss26",
 "legacyHandles": [],
 "sku": null,
 "name": {
 "fr": "Boucles cerises en raphia",
 "en": "Cherries Raffia Earrings",
 "es": "Cherries Raffia Earrings",
 "tr": "Cherries Raffia Earrings",
 "ar": "Cherries Raffia Earrings"
 },
 "displayName": {
 "fr": "Boucles cerises en raphia",
 "en": "Cherries Raffia Earrings",
 "es": "Cherries Raffia Earrings",
 "tr": "Cherries Raffia Earrings",
 "ar": "Cherries Raffia Earrings"
 },
 "short": {
 "fr": "Boucles cerises en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "Crocheted raffia cherries earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "es": "Crocheted raffia cherries earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "tr": "Crocheted raffia cherries earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "ar": "Crocheted raffia cherries earrings with 1.5 cm gold earrings and artisan credits on the hand tag."
 },
 "displayShort": {
 "fr": "Boucles cerises en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "Crocheted raffia cherries earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "es": "Crocheted raffia cherries earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "tr": "Crocheted raffia cherries earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "ar": "Crocheted raffia cherries earrings with 1.5 cm gold earrings and artisan credits on the hand tag."
 },
 "desc": {
 "fr": "Boucles cerises en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "A raffia fruit earring style from YZA’s Accessories collection, handmade as part of the SS26 fruit family.",
 "es": "A raffia fruit earring style from YZA’s Accessories collection, handmade as part of the SS26 fruit family.",
 "tr": "A raffia fruit earring style from YZA’s Accessories collection, handmade as part of the SS26 fruit family.",
 "ar": "A raffia fruit earring style from YZA’s Accessories collection, handmade as part of the SS26 fruit family."
 },
 "price": 25000,
 "currency": "MAD",
 "category": "earrings",
 "sourceCategory": "Fruit Earrings",
 "categoryLabel": {
 "fr": "Boucles",
 "en": "Earrings",
 "es": "Earrings",
 "tr": "Earrings",
 "ar": "Earrings"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/products/accessories-clean/cherries-accessory-clean.png",
 "gallery": [
 "assets/products/accessories-clean/cherries-accessory-clean.png",
 "assets/lookbook-ss26-27/embedded/p58_img02_xref1416_b7482fc1dffb.jpeg"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "cherries-raffia-earrings-ss26",
 "sku": null,
 "category": "BO",
 "source_type": "cerises x2",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 20
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit earrings",
 "Cherries",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Cherries Raffia Earrings - Handmade in Marrakech",
 "seoKeywords": [
 "Accessories",
 "Boucles cerises en raphia",
 "Cherries Raffia Earrings",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "accessories",
 "bijoux",
 "boucles",
 "cereza",
 "cerise",
 "cerises",
 "cherries",
 "cherries-raffia-earrings-ss26",
 "crochet",
 "earrings",
 "fait main",
 "handmade",
 "kupe",
 "pendientes",
 "اقراط",
 "كرز"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Boucles cerises en raphia",
 "Cherries Raffia Earrings",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "accessories",
 "bijoux",
 "boucles",
 "cereza",
 "cerise",
 "cerises",
 "cherries",
 "cherries-raffia-earrings-ss26",
 "crochet",
 "earrings",
 "fait main",
 "handmade",
 "kupe",
 "pendientes",
 "اقراط",
 "كرز"
 ],
 "material": {
 "fr": "Raffia, Creoles dorees",
 "en": "Raffia, Gold earrings",
 "es": "Raffia, Gold earrings",
 "tr": "Raffia, Gold earrings",
 "ar": "Raffia, Gold earrings"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Raffia only - crocheted",
 "tr": "Raffia only - crocheted",
 "ar": "Raffia only - crocheted"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Petit format bijou textile, leger et visible.",
 "en": "Small textile-jewellery scale, light and visible.",
 "es": "Small textile-jewellery scale, light and visible.",
 "tr": "Small textile-jewellery scale, light and visible.",
 "ar": "Small textile-jewellery scale, light and visible."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Creole doree 1,5 cm.",
 "en": "1.5 cm gold earring.",
 "es": "1.5 cm gold earring.",
 "tr": "1.5 cm gold earring.",
 "ar": "1.5 cm gold earring."
 },
 "handworkTime": {
 "fr": "Crochet main et montage bijou, piece par piece.",
 "en": "Hand crochet and jewellery assembly, piece by piece.",
 "es": "Hand crochet and jewellery assembly, piece by piece.",
 "tr": "Hand crochet and jewellery assembly, piece by piece.",
 "ar": "Hand crochet and jewellery assembly, piece by piece."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Fruit crochete main puis monte sur creole doree legere.",
 "en": "Hand-crocheted fruit mounted on a light golden earring.",
 "es": "Hand-crocheted fruit mounted on a light golden earring.",
 "tr": "Hand-crocheted fruit mounted on a light golden earring.",
 "ar": "Hand-crocheted fruit mounted on a light golden earring."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l'eau ; s'il est mouillé, le faire sécher à l'air libre à l'ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l'anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "tr": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "ar": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l'artisane qui l'a réalisée est inscrit sur l'étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "tr": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "ar": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "tr": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "ar": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Small atelier batch, produced at hand-crochet pace.",
 "tr": "Small atelier batch, produced at hand-crochet pace.",
 "ar": "Small atelier batch, produced at hand-crochet pace."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Small atelier batch, produced at hand-crochet pace.",
 "tr": "Small atelier batch, produced at hand-crochet pace.",
 "ar": "Small atelier batch, produced at hand-crochet pace."
 },
 "badge": "limited",
 "hours": 5,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "raffia-cherries-charm-ss26",
 "la-sculpture-xs-basket-bag-ss26",
 "lemon-slice-raffia-necklace-ss26"
 ]
 },
 {
 "handle": "tomatoes-raffia-earrings-ss26",
 "legacyHandles": [],
 "sku": null,
 "name": {
 "fr": "Boucles tomates en raphia",
 "en": "Tomatoes Raffia Earrings",
 "es": "Tomatoes Raffia Earrings",
 "tr": "Tomatoes Raffia Earrings",
 "ar": "Tomatoes Raffia Earrings"
 },
 "displayName": {
 "fr": "Boucles tomates en raphia",
 "en": "Tomatoes Raffia Earrings",
 "es": "Tomatoes Raffia Earrings",
 "tr": "Tomatoes Raffia Earrings",
 "ar": "Tomatoes Raffia Earrings"
 },
 "short": {
 "fr": "Boucles tomates en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "Crocheted raffia tomato earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "es": "Crocheted raffia tomato earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "tr": "Crocheted raffia tomato earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "ar": "Crocheted raffia tomato earrings with 1.5 cm gold earrings and artisan credits on the hand tag."
 },
 "displayShort": {
 "fr": "Boucles tomates en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "Crocheted raffia tomato earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "es": "Crocheted raffia tomato earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "tr": "Crocheted raffia tomato earrings with 1.5 cm gold earrings and artisan credits on the hand tag.",
 "ar": "Crocheted raffia tomato earrings with 1.5 cm gold earrings and artisan credits on the hand tag."
 },
 "desc": {
 "fr": "Boucles tomates en raphia, crochet main avec creoles dorees 1,5 cm.",
 "en": "A raffia fruit earring style from YZA’s Accessories collection, handmade as part of the SS26 fruit family.",
 "es": "A raffia fruit earring style from YZA’s Accessories collection, handmade as part of the SS26 fruit family.",
 "tr": "A raffia fruit earring style from YZA’s Accessories collection, handmade as part of the SS26 fruit family.",
 "ar": "A raffia fruit earring style from YZA’s Accessories collection, handmade as part of the SS26 fruit family."
 },
 "price": 50000,
 "currency": "MAD",
 "category": "earrings",
 "sourceCategory": "Fruit Earrings",
 "categoryLabel": {
 "fr": "Boucles",
 "en": "Earrings",
 "es": "Earrings",
 "tr": "Earrings",
 "ar": "Earrings"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/products/accessories-clean/tomatoes-earrings-clean.webp",
 "gallery": [
 "assets/products/accessories-clean/tomatoes-earrings-clean.webp",
 "assets/lifestyle/accessories/tomato-earrings-riad.webp"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "tomatoes-raffia-earrings-ss26",
 "sku": null,
 "category": "BO",
 "source_type": "tomate x2",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 17
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit earrings",
 "Tomatoes",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Tomatoes Raffia Earrings - Handmade in Marrakech",
 "seoKeywords": [
 "Accessories",
 "Boucles tomates en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Tomatoes Raffia Earrings",
 "YZA",
 "accessories",
 "bijoux",
 "boucles",
 "crochet",
 "earrings",
 "fait main",
 "handmade",
 "kupe",
 "pendientes",
 "tomate",
 "tomato",
 "tomatoes-raffia-earrings-ss26",
 "اقراط",
 "طماطم"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Boucles tomates en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Tomatoes Raffia Earrings",
 "YZA",
 "accessories",
 "bijoux",
 "boucles",
 "crochet",
 "earrings",
 "fait main",
 "handmade",
 "kupe",
 "pendientes",
 "tomate",
 "tomato",
 "tomatoes-raffia-earrings-ss26",
 "اقراط",
 "طماطم"
 ],
 "material": {
 "fr": "Raffia, Creoles dorees",
 "en": "Raffia, Gold earrings",
 "es": "Raffia, Gold earrings",
 "tr": "Raffia, Gold earrings",
 "ar": "Raffia, Gold earrings"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Raffia only - crocheted",
 "tr": "Raffia only - crocheted",
 "ar": "Raffia only - crocheted"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Petit format bijou textile, leger et visible.",
 "en": "Small textile-jewellery scale, light and visible.",
 "es": "Small textile-jewellery scale, light and visible.",
 "tr": "Small textile-jewellery scale, light and visible.",
 "ar": "Small textile-jewellery scale, light and visible."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Creole doree 1,5 cm.",
 "en": "1.5 cm gold earring.",
 "es": "1.5 cm gold earring.",
 "tr": "1.5 cm gold earring.",
 "ar": "1.5 cm gold earring."
 },
 "handworkTime": {
 "fr": "Crochet main et montage bijou, piece par piece.",
 "en": "Hand crochet and jewellery assembly, piece by piece.",
 "es": "Hand crochet and jewellery assembly, piece by piece.",
 "tr": "Hand crochet and jewellery assembly, piece by piece.",
 "ar": "Hand crochet and jewellery assembly, piece by piece."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Fruit crochete main puis monte sur creole doree legere.",
 "en": "Hand-crocheted fruit mounted on a light golden earring.",
 "es": "Hand-crocheted fruit mounted on a light golden earring.",
 "tr": "Hand-crocheted fruit mounted on a light golden earring.",
 "ar": "Hand-crocheted fruit mounted on a light golden earring."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l'eau ; s'il est mouillé, le faire sécher à l'air libre à l'ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l'anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "tr": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "ar": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l'artisane qui l'a réalisée est inscrit sur l'étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "tr": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "ar": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "tr": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "ar": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Small atelier batch, produced at hand-crochet pace.",
 "tr": "Small atelier batch, produced at hand-crochet pace.",
 "ar": "Small atelier batch, produced at hand-crochet pace."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Small atelier batch, produced at hand-crochet pace.",
 "tr": "Small atelier batch, produced at hand-crochet pace.",
 "ar": "Small atelier batch, produced at hand-crochet pace."
 },
 "badge": "limited",
 "hours": 5,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "raffia-cherries-charm-ss26",
 "la-sculpture-xs-basket-bag-ss26",
 "lemon-slice-raffia-necklace-ss26"
 ]
 },
 {
 "handle": "lemon-slice-raffia-necklace-ss26",
 "legacyHandles": [],
 "sku": null,
 "name": {
 "fr": "Collier tranche de citron en raphia",
 "en": "Lemon Slice Raffia Necklace",
 "es": "Lemon Slice Raffia Necklace",
 "tr": "Lemon Slice Raffia Necklace",
 "ar": "Lemon Slice Raffia Necklace"
 },
 "displayName": {
 "fr": "Collier tranche de citron en raphia",
 "en": "Lemon Slice Raffia Necklace",
 "es": "Lemon Slice Raffia Necklace",
 "tr": "Lemon Slice Raffia Necklace",
 "ar": "Lemon Slice Raffia Necklace"
 },
 "short": {
 "fr": "Collier tranche de citron en raphia, fruit en raphia crochete sur cordon.",
 "en": "A crocheted raffia lemon slice necklace, handmade as a tiny postcard from Marrakesh.",
 "es": "Collar de rafia con rodaja de limón, tejido a mano como pequeña postal de Marrakech.",
 "tr": "El yapımı rafia limon dilimi kolyesi, Marakeş'ten küçük bir kartpostal olarak.",
 "ar": "قلادة رافيا بشريحة ليمون، منسوجة يدويًا كبطاقة بريدية صغيرة من مراكش."
 },
 "displayShort": {
 "fr": "Collier tranche de citron en raphia, fruit en raphia crochete sur cordon.",
 "en": "A crocheted raffia lemon slice necklace, handmade as a tiny postcard from Marrakesh.",
 "es": "Collar de rafia con rodaja de limón, tejido a mano como pequeña postal de Marrakech.",
 "tr": "El yapımı rafia limon dilimi kolyesi, Marakeş'ten küçük bir kartpostal olarak.",
 "ar": "قلادة رافيا بشريحة ليمون، منسوجة يدويًا كبطاقة بريدية صغيرة من مراكش."
 },
 "desc": {
 "fr": "Collier tranche de citron en raphia, fruit en raphia crochete sur cordon.",
 "en": "Lemon Slice Raffia Necklace belongs to YZA's Accessories line: crocheted fruit in raffia, designed as a playful wearable object rooted in the Marrakesh Fruit Market universe.",
 "es": "El Collar de Rafia con Rodaja de Limón pertenece a la línea de accesorios de YZA: fruta tejida en rafia, diseñada como un objeto portador lúdico del universo del Mercado de Fruta de Marrakech.",
 "tr": "Limon Dilimi Rafia Kolyesi, YZA'nın Aksesuar serisine ait: rafiadan örülmüş meyve, Marakeş Meyve Pazarı evrenine dayanan eğlenceli bir giyilebilir nesne olarak tasarlanmıştır.",
 "ar": "قلادة شريحة الليمون من الرافيا تنتمي إلى خط الإكسسوارات لدى YZA: فاكهة منسوجة بالرافيا، صُمِّمت كقطعة مرتدَاة مرحة من عالم سوق الفاكهة في مراكش."
 },
 "price": 26000,
 "currency": "MAD",
 "category": "necklaces",
 "sourceCategory": "Fruit Necklaces",
 "categoryLabel": {
 "fr": "Colliers",
 "en": "Necklaces",
 "es": "Collares",
 "tr": "Kolyeler",
 "ar": "عقود"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/products/accessories-clean/lemon-slice-necklace-clean.webp",
 "gallery": [
 "assets/products/accessories-clean/lemon-slice-necklace-clean.webp",
 "assets/lifestyle/accessories/lemon-necklace-rooftop.webp"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "lemon-slice-raffia-necklace-ss26",
 "sku": null,
 "category": "Necklace",
 "source_type": "lemon slice",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 21
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit necklace",
 "Lemon slice",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Lemon Slice Raffia Necklace - Handmade Raffia Necklace from Marrakech",
 "seoKeywords": [
 "Accessories",
 "Collier tranche de citron en raphia",
 "Guéliz",
 "Guéliz",
 "Lemon Slice Raffia Necklace",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "accessories",
 "bijoux",
 "citron",
 "collar",
 "collier",
 "crochet",
 "fait main",
 "handmade",
 "kolye",
 "lemon-slice-raffia-necklace-ss26",
 "limon",
 "necklace",
 "necklaces",
 "عقد",
 "ليمون"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Collier tranche de citron en raphia",
 "Guéliz",
 "Guéliz",
 "Lemon Slice Raffia Necklace",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "accessories",
 "bijoux",
 "citron",
 "collar",
 "collier",
 "crochet",
 "fait main",
 "handmade",
 "kolye",
 "lemon-slice-raffia-necklace-ss26",
 "limon",
 "necklace",
 "necklaces",
 "عقد",
 "ليمون"
 ],
 "material": {
 "fr": "Raffia, Cordon, Boucle de finition",
 "en": "Raffia, Cord, Finishing loop",
 "es": "Rafia, Cordón, Presilla de acabado",
 "tr": "Rafya, Kordon, Bitirme ilmeği",
 "ar": "رافيا، خيط، حلقة إنهاء"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Solo rafia - tejido a ganchillo",
 "tr": "Yalnızca rafya - tığ işi",
 "ar": "رافيا فقط - كروشيه"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Petit format bijou textile, leger et visible.",
 "en": "Small textile-jewellery scale, light and visible.",
 "es": "Escala pequeña de joyería textil, ligero y visible.",
 "tr": "Küçük tekstil-mücevheri ölçeği, hafif ve görünür.",
 "ar": "حجم مجوهرات نسيجية صغيرة، خفيف وواضح."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Cordon textile avec boucle de finition.",
 "en": "Textile cord with finishing loop.",
 "es": "Cordón textil con presilla de acabado.",
 "tr": "Bitirme ilmekli tekstil kordonu.",
 "ar": "خيط نسيجي مع حلقة إنهاء."
 },
 "handworkTime": {
 "fr": "Crochet main et montage sur cordon, piece par piece.",
 "en": "Hand crochet and cord assembly, piece by piece.",
 "es": "Ganchillo a mano y montaje en cordón, pieza por pieza.",
 "tr": "El tığ işi ve kordon montajı, parça parça.",
 "ar": "كروشيه يدوي وتجميع الخيط، قطعة قطعة."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Fruit crochete main, monte sur cordon comme bijou textile.",
 "en": "Hand-crocheted fruit mounted on a cord as textile jewellery.",
 "es": "Fruta tejida a mano montada sobre un cordón como joyería textil.",
 "tr": "El yapımı tığ işi meyve, tekstil mücevheri olarak bir kordona monte edilmiş.",
 "ar": "فاكهة منسوجة يدويًا ومثبتة على خيط كمجوهرات نسيجية."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l’eau ; s’il est mouillé, le faire sécher à l’air libre à l’ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l’anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "La rafia no necesita cuidados especiales. Evitar el agua; si se moja, secar al aire libre alejado del sol directo. Evitar la exposición prolongada al sol para preservar los colores. Si el elemento dorado pierde su color, puede reemplazarse.",
 "tr": "Rafyanın özel bakıma ihtiyacı yoktur. Suyla temastan kaçının; ıslanırsa doğrudan güneş ışığından uzakta açık havada kurutun. Renkleri korumak için uzun süreli güneş maruziyetinden kaçının. Altın unsur rengini kaybederse değiştirilebilir.",
 "ar": "الرافيا لا تحتاج إلى عناية خاصة. تجنب الماء؛ إذا ابتلت، جففها في الهواء الطلق بعيدًا عن أشعة الشمس المباشرة. تجنب التعرض المطول للشمس للحفاظ على الألوان. إذا فقد العنصر الذهبي لونه، يمكن استبداله."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l’artisane qui l’a réalisée est inscrit sur l’étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Listo para regalar, con el nombre de la artesana que realizó la pieza grabado en la etiqueta YZA.",
 "tr": "Hediyeye hazır, parçayı yapan zanaatkarın adı YZA etiketine kazınmış.",
 "ar": "جاهز للإهداء، مع اسم الحرفية التي صنعت القطعة منقوشًا على بطاقة YZA."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz’deki stüdyodan teslim alma mevcut.",
 "ar": "شحن مع تتبع خلال 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في جيليز."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Éditions limitées de atelier, producidas al ritmo del ganchillo a mano.",
 "tr": "Küçük atölye serisi, el tığ işi temposunda üretilmiştir.",
 "ar": "دُفعة أتيليه صغيرة، مُنتَجة على وتيرة الكروشيه اليدوي."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Éditions limitées de atelier, producidas al ritmo del ganchillo a mano.",
 "tr": "Küçük atölye serisi, el tığ işi temposunda üretilmiştir.",
 "ar": "دُفعة أتيليه صغيرة، مُنتَجة على وتيرة الكروشيه اليدوي."
 },
 "badge": "limited",
 "hours": 2.5,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "raffia-cherries-charm-ss26",
 "la-sculpture-xs-basket-bag-ss26",
 "watermelon-raffia-earrings-ss26"
 ]
 },
 {
 "handle": "orange-slice-raffia-necklace-ss26",
 "legacyHandles": [],
 "sku": null,
 "name": {
 "fr": "Collier tranche d orange en raphia",
 "en": "Orange Slice Raffia Necklace",
 "es": "Orange Slice Raffia Necklace",
 "tr": "Orange Slice Raffia Necklace",
 "ar": "Orange Slice Raffia Necklace"
 },
 "displayName": {
 "fr": "Collier tranche d orange en raphia",
 "en": "Orange Slice Raffia Necklace",
 "es": "Orange Slice Raffia Necklace",
 "tr": "Orange Slice Raffia Necklace",
 "ar": "Orange Slice Raffia Necklace"
 },
 "short": {
 "fr": "Collier tranche d orange en raphia, fruit en raphia crochete sur cordon.",
 "en": "A crocheted raffia orange slice necklace, handmade as a tiny postcard from Marrakesh.",
 "es": "Collar de rafia con rodaja de naranja, tejido a mano como pequeña postal de Marrakech.",
 "tr": "El yapımı rafia portakal dilimi kolyesi, Marakeş'ten küçük bir kartpostal olarak.",
 "ar": "قلادة رافيا بشريحة برتقال، منسوجة يدويًا كبطاقة بريدية صغيرة من مراكش."
 },
 "displayShort": {
 "fr": "Collier tranche d orange en raphia, fruit en raphia crochete sur cordon.",
 "en": "A crocheted raffia orange slice necklace, handmade as a tiny postcard from Marrakesh.",
 "es": "Collar de rafia con rodaja de naranja, tejido a mano como pequeña postal de Marrakech.",
 "tr": "El yapımı rafia portakal dilimi kolyesi, Marakeş'ten küçük bir kartpostal olarak.",
 "ar": "قلادة رافيا بشريحة برتقال، منسوجة يدويًا كبطاقة بريدية صغيرة من مراكش."
 },
 "desc": {
 "fr": "Collier tranche d orange en raphia, fruit en raphia crochete sur cordon.",
 "en": "Orange Slice Raffia Necklace belongs to YZA's Accessories line: crocheted fruit in raffia, designed as a playful wearable object rooted in the Marrakesh Fruit Market universe.",
 "es": "El Collar de Rafia con Rodaja de Naranja pertenece a la línea de accesorios de YZA: fruta tejida en rafia, diseñada como un objeto portador lúdico del universo del Mercado de Fruta de Marrakech.",
 "tr": "Portakal Dilimi Rafia Kolyesi, YZA'nın Aksesuar serisine ait: rafiadan örülmüş meyve, Marakeş Meyve Pazarı evrenine dayanan eğlenceli bir giyilebilir nesne olarak tasarlanmıştır.",
 "ar": "قلادة شريحة البرتقال من الرافيا تنتمي إلى خط الإكسسوارات لدى YZA: فاكهة منسوجة بالرافيا، صُمِّمت كقطعة مرتدَاة مرحة من عالم سوق الفاكهة في مراكش."
 },
 "price": 26000,
 "currency": "MAD",
 "category": "necklaces",
 "sourceCategory": "Fruit Necklaces",
 "categoryLabel": {
 "fr": "Colliers",
 "en": "Necklaces",
 "es": "Collares",
 "tr": "Kolyeler",
 "ar": "عقود"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/products/accessories-clean/orange-slice-necklace-clean.webp",
 "gallery": [
 "assets/products/accessories-clean/orange-slice-necklace-clean.webp"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "orange-slice-raffia-necklace-ss26",
 "sku": null,
 "category": "Necklace",
 "source_type": "orange slice",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 23
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit necklace",
 "Orange slice",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Orange Slice Raffia Necklace - Handmade Raffia Necklace from Marrakech",
 "seoKeywords": [
 "Accessories",
 "Collier tranche d orange en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Orange Slice Raffia Necklace",
 "YZA",
 "accessories",
 "bijoux",
 "collar",
 "collier",
 "crochet",
 "fait main",
 "handmade",
 "kolye",
 "naranja",
 "necklace",
 "necklaces",
 "orange",
 "orange-slice-raffia-necklace-ss26",
 "برتقال",
 "عقد"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Collier tranche d orange en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Orange Slice Raffia Necklace",
 "YZA",
 "accessories",
 "bijoux",
 "collar",
 "collier",
 "crochet",
 "fait main",
 "handmade",
 "kolye",
 "naranja",
 "necklace",
 "necklaces",
 "orange",
 "orange-slice-raffia-necklace-ss26",
 "برتقال",
 "عقد"
 ],
 "material": {
 "fr": "Raffia, Cordon, Boucle de finition",
 "en": "Raffia, Cord, Finishing loop",
 "es": "Rafia, Cordón, Presilla de acabado",
 "tr": "Rafya, Kordon, Bitirme ilmeği",
 "ar": "رافيا، خيط، حلقة إنهاء"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Solo rafia - tejido a ganchillo",
 "tr": "Yalnızca rafya - tığ işi",
 "ar": "رافيا فقط - كروشيه"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Petit format bijou textile, leger et visible.",
 "en": "Small textile-jewellery scale, light and visible.",
 "es": "Escala pequeña de joyería textil, ligero y visible.",
 "tr": "Küçük tekstil-mücevheri ölçeği, hafif ve görünür.",
 "ar": "حجم مجوهرات نسيجية صغيرة، خفيف وواضح."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Cordon textile avec boucle de finition.",
 "en": "Textile cord with finishing loop.",
 "es": "Cordón textil con presilla de acabado.",
 "tr": "Bitirme ilmekli tekstil kordonu.",
 "ar": "خيط نسيجي مع حلقة إنهاء."
 },
 "handworkTime": {
 "fr": "Crochet main et montage sur cordon, piece par piece.",
 "en": "Hand crochet and cord assembly, piece by piece.",
 "es": "Ganchillo a mano y montaje en cordón, pieza por pieza.",
 "tr": "El tığ işi ve kordon montajı, parça parça.",
 "ar": "كروشيه يدوي وتجميع الخيط، قطعة قطعة."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Fruit crochete main, monte sur cordon comme bijou textile.",
 "en": "Hand-crocheted fruit mounted on a cord as textile jewellery.",
 "es": "Fruta tejida a mano montada sobre un cordón como joyería textil.",
 "tr": "El yapımı tığ işi meyve, tekstil mücevheri olarak bir kordona monte edilmiş.",
 "ar": "فاكهة منسوجة يدويًا ومثبتة على خيط كمجوهرات نسيجية."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l’eau ; s’il est mouillé, le faire sécher à l’air libre à l’ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l’anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "La rafia no necesita cuidados especiales. Evitar el agua; si se moja, secar al aire libre alejado del sol directo. Evitar la exposición prolongada al sol para preservar los colores. Si el elemento dorado pierde su color, puede reemplazarse.",
 "tr": "Rafyanın özel bakıma ihtiyacı yoktur. Suyla temastan kaçının; ıslanırsa doğrudan güneş ışığından uzakta açık havada kurutun. Renkleri korumak için uzun süreli güneş maruziyetinden kaçının. Altın unsur rengini kaybederse değiştirilebilir.",
 "ar": "الرافيا لا تحتاج إلى عناية خاصة. تجنب الماء؛ إذا ابتلت، جففها في الهواء الطلق بعيدًا عن أشعة الشمس المباشرة. تجنب التعرض المطول للشمس للحفاظ على الألوان. إذا فقد العنصر الذهبي لونه، يمكن استبداله."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l’artisane qui l’a réalisée est inscrit sur l’étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Listo para regalar, con el nombre de la artesana que realizó la pieza grabado en la etiqueta YZA.",
 "tr": "Hediyeye hazır, parçayı yapan zanaatkarın adı YZA etiketine kazınmış.",
 "ar": "جاهز للإهداء، مع اسم الحرفية التي صنعت القطعة منقوشًا على بطاقة YZA."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz’deki stüdyodan teslim alma mevcut.",
 "ar": "شحن مع تتبع خلال 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في جيليز."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Éditions limitées de atelier, producidas al ritmo del ganchillo a mano.",
 "tr": "Küçük atölye serisi, el tığ işi temposunda üretilmiştir.",
 "ar": "دُفعة أتيليه صغيرة، مُنتَجة على وتيرة الكروشيه اليدوي."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Éditions limitées de atelier, producidas al ritmo del ganchillo a mano.",
 "tr": "Küçük atölye serisi, el tığ işi temposunda üretilmiştir.",
 "ar": "دُفعة أتيليه صغيرة، مُنتَجة على وتيرة الكروشيه اليدوي."
 },
 "badge": "limited",
 "hours": 2.5,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "raffia-cherries-charm-ss26",
 "la-sculpture-xs-basket-bag-ss26",
 "watermelon-raffia-earrings-ss26"
 ]
 },
 {
 "handle": "watermelon-slice-raffia-necklace-ss26",
 "legacyHandles": [],
 "sku": null,
 "name": {
 "fr": "Collier tranche de pasteque en raphia",
 "en": "Watermelon Slice Raffia Necklace",
 "es": "Watermelon Slice Raffia Necklace",
 "tr": "Watermelon Slice Raffia Necklace",
 "ar": "Watermelon Slice Raffia Necklace"
 },
 "displayName": {
 "fr": "Collier tranche de pasteque en raphia",
 "en": "Watermelon Slice Raffia Necklace",
 "es": "Watermelon Slice Raffia Necklace",
 "tr": "Watermelon Slice Raffia Necklace",
 "ar": "Watermelon Slice Raffia Necklace"
 },
 "short": {
 "fr": "Collier tranche de pasteque en raphia, fruit en raphia crochete sur cordon.",
 "en": "A crocheted raffia watermelon slice necklace, handmade as a tiny postcard from Marrakesh.",
 "es": "Collar de rafia con rodaja de sandía, tejido a mano como pequeña postal de Marrakech.",
 "tr": "El yapımı rafia karpuz dilimi kolyesi, Marakeş'ten küçük bir kartpostal olarak.",
 "ar": "قلادة رافيا بشريحة بطيخ، منسوجة يدويًا كبطاقة بريدية صغيرة من مراكش."
 },
 "displayShort": {
 "fr": "Collier tranche de pasteque en raphia, fruit en raphia crochete sur cordon.",
 "en": "A crocheted raffia watermelon slice necklace, handmade as a tiny postcard from Marrakesh.",
 "es": "Collar de rafia con rodaja de sandía, tejido a mano como pequeña postal de Marrakech.",
 "tr": "El yapımı rafia karpuz dilimi kolyesi, Marakeş'ten küçük bir kartpostal olarak.",
 "ar": "قلادة رافيا بشريحة بطيخ، منسوجة يدويًا كبطاقة بريدية صغيرة من مراكش."
 },
 "desc": {
 "fr": "Collier tranche de pasteque en raphia, fruit en raphia crochete sur cordon.",
 "en": "Watermelon Slice Raffia Necklace belongs to YZA's Accessories line: crocheted fruit in raffia, designed as a playful wearable object rooted in the Marrakesh Fruit Market universe.",
 "es": "El Collar de Rafia con Rodaja de Sandía pertenece a la línea de accesorios de YZA: fruta tejida en rafia, diseñada como un objeto portador lúdico del universo del Mercado de Fruta de Marrakech.",
 "tr": "Karpuz Dilimi Rafia Kolyesi, YZA'nın Aksesuar serisine ait: rafiadan örülmüş meyve, Marakeş Meyve Pazarı evrenine dayanan eğlenceli bir giyilebilir nesne olarak tasarlanmıştır.",
 "ar": "قلادة شريحة البطيخ من الرافيا تنتمي إلى خط الإكسسوارات لدى YZA: فاكهة منسوجة بالرافيا، صُمِّمت كقطعة مرتدَاة مرحة من عالم سوق الفاكهة في مراكش."
 },
 "price": 26000,
 "currency": "MAD",
 "category": "necklaces",
 "sourceCategory": "Fruit Necklaces",
 "categoryLabel": {
 "fr": "Colliers",
 "en": "Necklaces",
 "es": "Collares",
 "tr": "Kolyeler",
 "ar": "عقود"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/original-shop/charms/raffia-watermelon-slice-charm-ss26-04.webp",
 "gallery": [
 "assets/original-shop/charms/raffia-watermelon-slice-charm-ss26-04.webp"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "watermelon-slice-raffia-necklace-ss26",
 "sku": null,
 "category": "Necklace",
 "source_type": "watermelon slice",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 22
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit necklace",
 "Watermelon slice",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Watermelon Slice Raffia Necklace - Handmade Raffia Necklace from Marrakech",
 "seoKeywords": [
 "Accessories",
 "Collier tranche de pasteque en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Watermelon Slice Raffia Necklace",
 "YZA",
 "accessories",
 "bijoux",
 "collar",
 "collier",
 "crochet",
 "fait main",
 "handmade",
 "kolye",
 "necklace",
 "necklaces",
 "pasteque",
 "sandia",
 "watermelon",
 "watermelon-slice-raffia-necklace-ss26",
 "بطيخ",
 "عقد"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Collier tranche de pasteque en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "Watermelon Slice Raffia Necklace",
 "YZA",
 "accessories",
 "bijoux",
 "collar",
 "collier",
 "crochet",
 "fait main",
 "handmade",
 "kolye",
 "necklace",
 "necklaces",
 "pasteque",
 "sandia",
 "watermelon",
 "watermelon-slice-raffia-necklace-ss26",
 "بطيخ",
 "عقد"
 ],
 "material": {
 "fr": "Raffia, Cordon, Boucle de finition",
 "en": "Raffia, Cord, Finishing loop",
 "es": "Rafia, Cordón, Presilla de acabado",
 "tr": "Rafya, Kordon, Bitirme ilmeği",
 "ar": "رافيا، خيط، حلقة إنهاء"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Solo rafia - tejido a ganchillo",
 "tr": "Yalnızca rafya - tığ işi",
 "ar": "رافيا فقط - كروشيه"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Petit format bijou textile, leger et visible.",
 "en": "Small textile-jewellery scale, light and visible.",
 "es": "Escala pequeña de joyería textil, ligero y visible.",
 "tr": "Küçük tekstil-mücevheri ölçeği, hafif ve görünür.",
 "ar": "حجم مجوهرات نسيجية صغيرة، خفيف وواضح."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Cordon textile avec boucle de finition.",
 "en": "Textile cord with finishing loop.",
 "es": "Cordón textil con presilla de acabado.",
 "tr": "Bitirme ilmekli tekstil kordonu.",
 "ar": "خيط نسيجي مع حلقة إنهاء."
 },
 "handworkTime": {
 "fr": "Crochet main et montage sur cordon, piece par piece.",
 "en": "Hand crochet and cord assembly, piece by piece.",
 "es": "Ganchillo a mano y montaje en cordón, pieza por pieza.",
 "tr": "El tığ işi ve kordon montajı, parça parça.",
 "ar": "كروشيه يدوي وتجميع الخيط، قطعة قطعة."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Fruit crochete main, monte sur cordon comme bijou textile.",
 "en": "Hand-crocheted fruit mounted on a cord as textile jewellery.",
 "es": "Fruta tejida a mano montada sobre un cordón como joyería textil.",
 "tr": "El yapımı tığ işi meyve, tekstil mücevheri olarak bir kordona monte edilmiş.",
 "ar": "فاكهة منسوجة يدويًا ومثبتة على خيط كمجوهرات نسيجية."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l’eau ; s’il est mouillé, le faire sécher à l’air libre à l’ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l’anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "La rafia no necesita cuidados especiales. Evitar el agua; si se moja, secar al aire libre alejado del sol directo. Evitar la exposición prolongada al sol para preservar los colores. Si el elemento dorado pierde su color, puede reemplazarse.",
 "tr": "Rafyanın özel bakıma ihtiyacı yoktur. Suyla temastan kaçının; ıslanırsa doğrudan güneş ışığından uzakta açık havada kurutun. Renkleri korumak için uzun süreli güneş maruziyetinden kaçının. Altın unsur rengini kaybederse değiştirilebilir.",
 "ar": "الرافيا لا تحتاج إلى عناية خاصة. تجنب الماء؛ إذا ابتلت، جففها في الهواء الطلق بعيدًا عن أشعة الشمس المباشرة. تجنب التعرض المطول للشمس للحفاظ على الألوان. إذا فقد العنصر الذهبي لونه، يمكن استبداله."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l’artisane qui l’a réalisée est inscrit sur l’étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Listo para regalar, con el nombre de la artesana que realizó la pieza grabado en la etiqueta YZA.",
 "tr": "Hediyeye hazır, parçayı yapan zanaatkarın adı YZA etiketine kazınmış.",
 "ar": "جاهز للإهداء، مع اسم الحرفية التي صنعت القطعة منقوشًا على بطاقة YZA."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Envío con seguimiento en 2 a 5 días hábiles. Recogida en estudio disponible en Guéliz.",
 "tr": "2 ila 5 iş günü içinde takipli kargo. Guéliz’deki stüdyodan teslim alma mevcut.",
 "ar": "شحن مع تتبع خلال 2 إلى 5 أيام عمل. الاستلام من الاستوديو متاح في جيليز."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Éditions limitées de atelier, producidas al ritmo del ganchillo a mano.",
 "tr": "Küçük atölye serisi, el tığ işi temposunda üretilmiştir.",
 "ar": "دُفعة أتيليه صغيرة، مُنتَجة على وتيرة الكروشيه اليدوي."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Éditions limitées de atelier, producidas al ritmo del ganchillo a mano.",
 "tr": "Küçük atölye serisi, el tığ işi temposunda üretilmiştir.",
 "ar": "دُفعة أتيليه صغيرة، مُنتَجة على وتيرة الكروشيه اليدوي."
 },
 "badge": "limited",
 "hours": 2.5,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "raffia-cherries-charm-ss26",
 "la-sculpture-xs-basket-bag-ss26",
 "watermelon-raffia-earrings-ss26"
 ]
 },
 {
 "handle": "grapes-raffia-necklace-ss26",
 "legacyHandles": [],
 "sku": null,
 "name": {
 "fr": "Collier raisins en raphia",
 "en": "Grapes Raffia Necklace",
 "es": "Grapes Raffia Necklace",
 "tr": "Grapes Raffia Necklace",
 "ar": "Grapes Raffia Necklace"
 },
 "displayName": {
 "fr": "Collier raisins en raphia",
 "en": "Grapes Raffia Necklace",
 "es": "Grapes Raffia Necklace",
 "tr": "Grapes Raffia Necklace",
 "ar": "Grapes Raffia Necklace"
 },
 "short": {
 "fr": "Collier raisins en raphia, fruit en raphia crochete sur cordon.",
 "en": "A crocheted raffia grapes necklace, handmade as a tiny postcard from Marrakesh.",
 "es": "A crocheted raffia grapes necklace, handmade as a tiny postcard from Marrakesh.",
 "tr": "A crocheted raffia grapes necklace, handmade as a tiny postcard from Marrakesh.",
 "ar": "A crocheted raffia grapes necklace, handmade as a tiny postcard from Marrakesh."
 },
 "displayShort": {
 "fr": "Collier raisins en raphia, fruit en raphia crochete sur cordon.",
 "en": "A crocheted raffia grapes necklace, handmade as a tiny postcard from Marrakesh.",
 "es": "A crocheted raffia grapes necklace, handmade as a tiny postcard from Marrakesh.",
 "tr": "A crocheted raffia grapes necklace, handmade as a tiny postcard from Marrakesh.",
 "ar": "A crocheted raffia grapes necklace, handmade as a tiny postcard from Marrakesh."
 },
 "desc": {
 "fr": "Collier raisins en raphia, fruit en raphia crochete sur cordon.",
 "en": "Grapes Raffia Necklace belongs to YZA's Accessories line: crocheted fruit in raffia, designed as a playful wearable object rooted in the Marrakesh Fruit Market universe.",
 "es": "Grapes Raffia Necklace belongs to YZA's Accessories line: crocheted fruit in raffia, designed as a playful wearable object rooted in the Marrakesh Fruit Market universe.",
 "tr": "Grapes Raffia Necklace belongs to YZA's Accessories line: crocheted fruit in raffia, designed as a playful wearable object rooted in the Marrakesh Fruit Market universe.",
 "ar": "Grapes Raffia Necklace belongs to YZA's Accessories line: crocheted fruit in raffia, designed as a playful wearable object rooted in the Marrakesh Fruit Market universe."
 },
 "price": 26000,
 "currency": "MAD",
 "category": "necklaces",
 "sourceCategory": "Fruit Necklaces",
 "categoryLabel": {
 "fr": "Colliers",
 "en": "Necklaces",
 "es": "Necklaces",
 "tr": "Necklaces",
 "ar": "Necklaces"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/original-shop/charms/raffia-grapes-charm-ss26-04.webp",
 "gallery": [
 "assets/original-shop/charms/raffia-grapes-charm-ss26-04.webp"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "grapes-raffia-necklace-ss26",
 "sku": null,
 "category": "Necklace",
 "source_type": "grapes",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 24
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit necklace",
 "Grapes",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Grapes Raffia Necklace - Handmade Raffia Necklace from Marrakech",
 "seoKeywords": [
 "Accessories",
 "Collier raisins en raphia",
 "Grapes Raffia Necklace",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "accessories",
 "bijoux",
 "collar",
 "collier",
 "crochet",
 "fait main",
 "grapes",
 "grapes-raffia-necklace-ss26",
 "handmade",
 "kolye",
 "necklace",
 "necklaces",
 "raisin",
 "raisins",
 "uvas",
 "عقد",
 "عنب"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Collier raisins en raphia",
 "Grapes Raffia Necklace",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "accessories",
 "bijoux",
 "collar",
 "collier",
 "crochet",
 "fait main",
 "grapes",
 "grapes-raffia-necklace-ss26",
 "handmade",
 "kolye",
 "necklace",
 "necklaces",
 "raisin",
 "raisins",
 "uvas",
 "عقد",
 "عنب"
 ],
 "material": {
 "fr": "Raffia, Cordon, Boucle de finition",
 "en": "Raffia, Cord, Finishing loop",
 "es": "Raffia, Cord, Finishing loop",
 "tr": "Raffia, Cord, Finishing loop",
 "ar": "Raffia, Cord, Finishing loop"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Raffia only - crocheted",
 "tr": "Raffia only - crocheted",
 "ar": "Raffia only - crocheted"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Petit format bijou textile, leger et visible.",
 "en": "Small textile-jewellery scale, light and visible.",
 "es": "Small textile-jewellery scale, light and visible.",
 "tr": "Small textile-jewellery scale, light and visible.",
 "ar": "Small textile-jewellery scale, light and visible."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Cordon textile avec boucle de finition.",
 "en": "Textile cord with finishing loop.",
 "es": "Textile cord with finishing loop.",
 "tr": "Textile cord with finishing loop.",
 "ar": "Textile cord with finishing loop."
 },
 "handworkTime": {
 "fr": "Crochet main et montage sur cordon, piece par piece.",
 "en": "Hand crochet and cord assembly, piece by piece.",
 "es": "Hand crochet and cord assembly, piece by piece.",
 "tr": "Hand crochet and cord assembly, piece by piece.",
 "ar": "Hand crochet and cord assembly, piece by piece."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Fruit crochete main, monte sur cordon comme bijou textile.",
 "en": "Hand-crocheted fruit mounted on a cord as textile jewellery.",
 "es": "Hand-crocheted fruit mounted on a cord as textile jewellery.",
 "tr": "Hand-crocheted fruit mounted on a cord as textile jewellery.",
 "ar": "Hand-crocheted fruit mounted on a cord as textile jewellery."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l'eau ; s'il est mouillé, le faire sécher à l'air libre à l'ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l'anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "tr": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "ar": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l'artisane qui l'a réalisée est inscrit sur l'étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "tr": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "ar": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "tr": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "ar": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Small atelier batch, produced at hand-crochet pace.",
 "tr": "Small atelier batch, produced at hand-crochet pace.",
 "ar": "Small atelier batch, produced at hand-crochet pace."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Small atelier batch, produced at hand-crochet pace.",
 "tr": "Small atelier batch, produced at hand-crochet pace.",
 "ar": "Small atelier batch, produced at hand-crochet pace."
 },
 "badge": "limited",
 "hours": 2.5,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "raffia-cherries-charm-ss26",
 "la-sculpture-xs-basket-bag-ss26",
 "watermelon-raffia-earrings-ss26"
 ]
 },
 {
 "handle": "cherries-raffia-necklace-ss26",
 "legacyHandles": [],
 "sku": null,
 "name": {
 "fr": "Collier cerises en raphia",
 "en": "Cherries Raffia Necklace",
 "es": "Cherries Raffia Necklace",
 "tr": "Cherries Raffia Necklace",
 "ar": "Cherries Raffia Necklace"
 },
 "displayName": {
 "fr": "Collier cerises en raphia",
 "en": "Cherries Raffia Necklace",
 "es": "Cherries Raffia Necklace",
 "tr": "Cherries Raffia Necklace",
 "ar": "Cherries Raffia Necklace"
 },
 "short": {
 "fr": "Collier cerises en raphia, fruit en raphia crochete sur cordon.",
 "en": "A crocheted raffia cherries necklace, handmade as a tiny postcard from Marrakesh.",
 "es": "A crocheted raffia cherries necklace, handmade as a tiny postcard from Marrakesh.",
 "tr": "A crocheted raffia cherries necklace, handmade as a tiny postcard from Marrakesh.",
 "ar": "A crocheted raffia cherries necklace, handmade as a tiny postcard from Marrakesh."
 },
 "displayShort": {
 "fr": "Collier cerises en raphia, fruit en raphia crochete sur cordon.",
 "en": "A crocheted raffia cherries necklace, handmade as a tiny postcard from Marrakesh.",
 "es": "A crocheted raffia cherries necklace, handmade as a tiny postcard from Marrakesh.",
 "tr": "A crocheted raffia cherries necklace, handmade as a tiny postcard from Marrakesh.",
 "ar": "A crocheted raffia cherries necklace, handmade as a tiny postcard from Marrakesh."
 },
 "desc": {
 "fr": "Collier cerises en raphia, fruit en raphia crochete sur cordon.",
 "en": "Cherries Raffia Necklace belongs to YZA's Accessories line: crocheted fruit in raffia, designed as a playful wearable object rooted in the Marrakesh Fruit Market universe.",
 "es": "Cherries Raffia Necklace belongs to YZA's Accessories line: crocheted fruit in raffia, designed as a playful wearable object rooted in the Marrakesh Fruit Market universe.",
 "tr": "Cherries Raffia Necklace belongs to YZA's Accessories line: crocheted fruit in raffia, designed as a playful wearable object rooted in the Marrakesh Fruit Market universe.",
 "ar": "Cherries Raffia Necklace belongs to YZA's Accessories line: crocheted fruit in raffia, designed as a playful wearable object rooted in the Marrakesh Fruit Market universe."
 },
 "price": 17000,
 "currency": "MAD",
 "category": "necklaces",
 "sourceCategory": "Fruit Necklaces",
 "categoryLabel": {
 "fr": "Colliers",
 "en": "Necklaces",
 "es": "Necklaces",
 "tr": "Necklaces",
 "ar": "Necklaces"
 },
 "group": "accessories",
 "collection": {
 "fr": "Fruit Market",
 "en": "Fruit Market",
 "es": "Fruit Market",
 "tr": "Fruit Market",
 "ar": "Fruit Market"
 },
 "season": "All Seasons",
 "img": "assets/original-shop/charms/raffia-cherries-charm-ss26-04.webp",
 "lifestyleVideo": "assets/lifestyle/accessories/cherry-necklace.mp4",
 "gallery": [
 "assets/original-shop/charms/raffia-cherries-charm-ss26-04.webp",
 "assets/lifestyle/accessories/cherry-necklace-doorway.webp"
 ],
 "familyHandle": null,
 "familyOrder": 50,
 "variantLabel": null,
 "availableColors": [],
 "availableSizes": [],
 "variants": [
 {
 "product_handle": "cherries-raffia-necklace-ss26",
 "sku": null,
 "category": "Necklace",
 "source_type": "cerises",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 25
 }
 ],
 "variantCount": 1,
 "variant_count_from_xlsx_catalog": 1,
 "tags": [
 "SS26",
 "Accessories",
 "Fruit necklace",
 "Cherries",
 "Raffia",
 "Marrakech"
 ],
 "seoTitle": "Cherries Raffia Necklace - Handmade Raffia Necklace from Marrakech",
 "seoKeywords": [
 "Accessories",
 "Cherries Raffia Necklace",
 "Collier cerises en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "accessories",
 "bijoux",
 "cereza",
 "cerise",
 "cerises",
 "cherries",
 "cherries-raffia-necklace-ss26",
 "collar",
 "collier",
 "crochet",
 "fait main",
 "handmade",
 "kolye",
 "necklace",
 "necklaces",
 "عقد",
 "كرز"
 ],
 "languageSearchTerms": [
 "Accessories",
 "Cherries Raffia Necklace",
 "Collier cerises en raphia",
 "Guéliz",
 "Guéliz",
 "Marrakech",
 "Marrakesh",
 "YZA",
 "accessories",
 "bijoux",
 "cereza",
 "cerise",
 "cerises",
 "cherries",
 "cherries-raffia-necklace-ss26",
 "collar",
 "collier",
 "crochet",
 "fait main",
 "handmade",
 "kolye",
 "necklace",
 "necklaces",
 "عقد",
 "كرز"
 ],
 "material": {
 "fr": "Raffia, Cordon, Boucle de finition",
 "en": "Raffia, Cord, Finishing loop",
 "es": "Raffia, Cord, Finishing loop",
 "tr": "Raffia, Cord, Finishing loop",
 "ar": "Raffia, Cord, Finishing loop"
 },
 "fabric": {
 "fr": "Raffia only - crocheted",
 "en": "Raffia only - crocheted",
 "es": "Raffia only - crocheted",
 "tr": "Raffia only - crocheted",
 "ar": "Raffia only - crocheted"
 },
 "color": null,
 "size": null,
 "visualSize": null,
 "visualColor": null,
 "bagFamilyTitle": null,
 "bagFamilyEyebrow": null,
 "bagFamilyText": null,
 "bagFamilyOrder": null,
 "dimensions": {
 "fr": "Petit format bijou textile, leger et visible.",
 "en": "Small textile-jewellery scale, light and visible.",
 "es": "Small textile-jewellery scale, light and visible.",
 "tr": "Small textile-jewellery scale, light and visible.",
 "ar": "Small textile-jewellery scale, light and visible."
 },
 "whatFits": null,
 "attachment": {
 "fr": "Cordon textile avec boucle de finition.",
 "en": "Textile cord with finishing loop.",
 "es": "Textile cord with finishing loop.",
 "tr": "Textile cord with finishing loop.",
 "ar": "Textile cord with finishing loop."
 },
 "handworkTime": {
 "fr": "Crochet main et montage sur cordon, piece par piece.",
 "en": "Hand crochet and cord assembly, piece by piece.",
 "es": "Hand crochet and cord assembly, piece by piece.",
 "tr": "Hand crochet and cord assembly, piece by piece.",
 "ar": "Hand crochet and cord assembly, piece by piece."
 },
 "howToWear": null,
 "fruitStory": null,
 "making": {
 "fr": "Fruit crochete main, monte sur cordon comme bijou textile.",
 "en": "Hand-crocheted fruit mounted on a cord as textile jewellery.",
 "es": "Hand-crocheted fruit mounted on a cord as textile jewellery.",
 "tr": "Hand-crocheted fruit mounted on a cord as textile jewellery.",
 "ar": "Hand-crocheted fruit mounted on a cord as textile jewellery."
 },
 "care": {
 "fr": "Le raffia ne nécessite aucun entretien particulier. Éviter l'eau ; s'il est mouillé, le faire sécher à l'air libre à l'ombre. Éviter de le laisser au soleil pour préserver les couleurs. Si l'anneau doré perd sa couleur, il peut être remplacé.",
 "en": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "es": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "tr": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced.",
 "ar": "Raffia needs no special care. Avoid water; if it gets wet, dry in open air away from direct sunlight. Avoid prolonged sun exposure to preserve the colours. If the gold element loses its colour, it can be replaced."
 },
 "packaging": {
 "fr": "Prêt à offrir : la pièce arrive dans une jolie boîte noire signée YZA, et le prénom de l'artisane qui l'a réalisée est inscrit sur l'étiquette (hand tag).",
 "en": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "es": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "tr": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag.",
 "ar": "Gift-ready: the piece comes in a pretty black box signed YZA, and the first name of the artisan who made it is written on the hand tag."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "es": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "tr": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz.",
 "ar": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d’origine.",
 "en": "30-day guarantee if the piece has not been worn.",
 "es": "Garantia 30 dias: reembolso si la pieza vuelve sin usar y en su estado original.",
 "tr": "30 gun garanti: kullanilmamis parca orijinal halinde donerse iade.",
 "ar": "ضمان 30 يوما: استرداد عند إرجاع القطعة غير مستعملة وفي حالتها الأصلية."
 },
 "batch": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Small atelier batch, produced at hand-crochet pace.",
 "tr": "Small atelier batch, produced at hand-crochet pace.",
 "ar": "Small atelier batch, produced at hand-crochet pace."
 },
 "edition": {
 "fr": "Petite série atelier, produite au rythme du crochet main.",
 "en": "Small atelier batch, produced at hand-crochet pace.",
 "es": "Small atelier batch, produced at hand-crochet pace.",
 "tr": "Small atelier batch, produced at hand-crochet pace.",
 "ar": "Small atelier batch, produced at hand-crochet pace."
 },
 "badge": "limited",
 "hours": 2.5,
 "giftable": true,
 "publicVisible": true,
 "crossSell": [
 "raffia-cherries-charm-ss26",
 "la-sculpture-xs-basket-bag-ss26",
 "watermelon-raffia-earrings-ss26"
 ]
 }
];
const BAG_ROWS = [
 {
 "familyHandle": "la-sculpture",
 "familyTitle": {
 "fr": "La Sculpture",
 "en": "La Sculpture",
 "es": "La Sculpture",
 "tr": "La Sculpture",
 "ar": "La Sculpture"
 },
 "familyEyebrow": {
 "fr": "Collection Sculpture",
 "en": "Collection Sculpture",
 "es": "Collection Sculpture",
 "tr": "Collection Sculpture",
 "ar": "Collection Sculpture"
 },
 "familyText": {
 "fr": "Choisissez d'abord la couleur, puis la taille. Chaque lien vous dirige vers le bon sac.",
 "en": "Choose the colour first, then the size. Each link opens the right bag page.",
 "es": "Elige primero el color y luego la talla. Cada enlace abre la página del bolso correcto.",
 "tr": "Önce rengi, sonra bedeni seçin. Her bağlantı doğru çanta sayfasını açar.",
 "ar": "اختر اللون أولاً ثم المقاس. كل رابط يفتح صفحة الحقيبة الصحيحة."
 },
 "rowTitle": {
 "fr": "La Sculpture - Rouge",
 "en": "La Sculpture - Red",
 "es": "La Sculpture - Rojo",
 "tr": "La Sculpture - Kırmızı",
 "ar": "La Sculpture - أحمر"
 },
 "color": {
 "fr": "Rouge",
 "en": "Red",
 "es": "Rojo",
 "tr": "Kırmızı",
 "ar": "أحمر"
 },
 "colorSlug": "rouge",
 "img": "assets/products/la-sculpture/sculpt-hot-red-s.jpg",
 "gallery": [
 "assets/products/la-sculpture/sculpt-hot-red-xs.jpg",
 "assets/products/la-sculpture/sculpt-hot-red-s.jpg",
 "assets/products/la-sculpture/sculpt-hot-red-m.jpg"
 ],
 "items": [
 {
 "handle": "la-sculpture-xs-basket-bag-ss26",
 "size": "XS",
 "color": {
 "fr": "Rouge",
 "en": "Red",
 "es": "Rojo",
 "tr": "Kırmızı",
 "ar": "أحمر"
 },
 "colorSlug": "rouge",
 "title": {
 "fr": "La Sculpture XS - Rouge",
 "en": "La Sculpture XS - Red",
 "es": "La Sculpture XS - Rojo",
 "tr": "La Sculpture XS - Kırmızı",
 "ar": "La Sculpture XS - أحمر"
 },
 "short": {
 "fr": "Format XS, couleur rouge.",
 "en": "XS scale, Red.",
 "es": "Talla XS, color rojo.",
 "tr": "XS beden, kırmızı renk.",
 "ar": "مقاس XS، لون أحمر."
 },
 "price": 80000,
 "img": "assets/lookbook-ss26-27/embedded/p40_img01_xref1305_5ae097cc9e5a.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p40_img01_xref1305_5ae097cc9e5a.jpeg",
 "assets/lookbook-ss26-27/embedded/p42_img01_xref1321_1a08834f9d69.jpeg",
 "assets/lookbook-ss26-27/embedded/p43_img01_xref1325_6be88260cccd.jpeg",
 "assets/lookbook-ss26-27/embedded/p48_img01_xref1345_c06ef6230440.jpeg"
 ],
 "url": "/produits/la-sculpture-xs-basket-bag-ss26?color=rouge"
 },
 {
 "handle": "la-sculpture-s-basket-bag-ss26",
 "size": "S",
 "color": {
 "fr": "Rouge",
 "en": "Red",
 "es": "Rojo",
 "tr": "Kırmızı",
 "ar": "أحمر"
 },
 "colorSlug": "rouge",
 "title": {
 "fr": "La Sculpture S - Rouge",
 "en": "La Sculpture S - Red",
 "es": "La Sculpture S - Rojo",
 "tr": "La Sculpture S - Kırmızı",
 "ar": "La Sculpture S - أحمر"
 },
 "short": {
 "fr": "Format S, couleur rouge.",
 "en": "S scale, Red.",
 "es": "Talla S, color rojo.",
 "tr": "S beden, kırmızı renk.",
 "ar": "مقاس S، لون أحمر."
 },
 "price": 93000,
 "img": "assets/lookbook-ss26-27/embedded/p40_img01_xref1305_5ae097cc9e5a.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p40_img01_xref1305_5ae097cc9e5a.jpeg",
 "assets/lookbook-ss26-27/embedded/p42_img01_xref1321_1a08834f9d69.jpeg",
 "assets/lookbook-ss26-27/embedded/p43_img01_xref1325_6be88260cccd.jpeg",
 "assets/lookbook-ss26-27/embedded/p48_img01_xref1345_c06ef6230440.jpeg"
 ],
 "url": "/produits/la-sculpture-s-basket-bag-ss26?color=rouge"
 },
 {
 "handle": "la-sculpture-m-basket-bag-ss26",
 "size": "M",
 "color": {
 "fr": "Rouge",
 "en": "Red",
 "es": "Rojo",
 "tr": "Kırmızı",
 "ar": "أحمر"
 },
 "colorSlug": "rouge",
 "title": {
 "fr": "La Sculpture M - Rouge",
 "en": "La Sculpture M - Red",
 "es": "La Sculpture M - Rojo",
 "tr": "La Sculpture M - Kırmızı",
 "ar": "La Sculpture M - أحمر"
 },
 "short": {
 "fr": "Format M, couleur rouge.",
 "en": "M scale, Red.",
 "es": "Talla M, color rojo.",
 "tr": "M beden, kırmızı renk.",
 "ar": "مقاس M، لون أحمر."
 },
 "price": 100000,
 "img": "assets/lookbook-ss26-27/embedded/p40_img01_xref1305_5ae097cc9e5a.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p40_img01_xref1305_5ae097cc9e5a.jpeg",
 "assets/lookbook-ss26-27/embedded/p42_img01_xref1321_1a08834f9d69.jpeg",
 "assets/lookbook-ss26-27/embedded/p43_img01_xref1325_6be88260cccd.jpeg",
 "assets/lookbook-ss26-27/embedded/p48_img01_xref1345_c06ef6230440.jpeg"
 ],
 "url": "/produits/la-sculpture-m-basket-bag-ss26?color=rouge"
 }
 ]
 },
 {
 "familyHandle": "la-sculpture",
 "familyTitle": {
 "fr": "La Sculpture",
 "en": "La Sculpture",
 "es": "La Sculpture",
 "tr": "La Sculpture",
 "ar": "La Sculpture"
 },
 "familyEyebrow": {
 "fr": "Collection Sculpture",
 "en": "Collection Sculpture",
 "es": "Collection Sculpture",
 "tr": "Collection Sculpture",
 "ar": "Collection Sculpture"
 },
 "familyText": {
 "fr": "Choisissez d'abord la couleur, puis la taille. Chaque lien vous dirige vers le bon sac.",
 "en": "Choose the colour first, then the size. Each link opens the right bag page.",
 "es": "Elige primero el color y luego la talla. Cada enlace abre la página del bolso correcto.",
 "tr": "Önce rengi, sonra bedeni seçin. Her bağlantı doğru çanta sayfasını açar.",
 "ar": "اختر اللون أولاً ثم المقاس. كل رابط يفتح صفحة الحقيبة الصحيحة."
 },
 "rowTitle": {
 "fr": "La Sculpture - Violet",
 "en": "La Sculpture - Violet",
 "es": "La Sculpture - Violeta",
 "tr": "La Sculpture - Mor",
 "ar": "La Sculpture - بنفسجي"
 },
 "color": {
 "fr": "Violet",
 "en": "Violet",
 "es": "Violeta",
 "tr": "Mor",
 "ar": "بنفسجي"
 },
 "colorSlug": "violet",
 "img": "assets/products/la-sculpture/sculpt-deep-violet-s.jpg",
 "gallery": [
 "assets/products/la-sculpture/sculpt-deep-violet-xs.jpg",
 "assets/products/la-sculpture/sculpt-deep-violet-s.jpg",
 "assets/products/la-sculpture/sculpt-deep-violet-m.jpg"
 ],
 "items": [
 {
 "handle": "la-sculpture-xs-basket-bag-ss26",
 "size": "XS",
 "color": {
 "fr": "Violet",
 "en": "Violet",
 "es": "Violeta",
 "tr": "Mor",
 "ar": "بنفسجي"
 },
 "colorSlug": "violet",
 "title": {
 "fr": "La Sculpture XS - Violet",
 "en": "La Sculpture XS - Violet",
 "es": "La Sculpture XS - Violeta",
 "tr": "La Sculpture XS - Mor",
 "ar": "La Sculpture XS - بنفسجي"
 },
 "short": {
 "fr": "Format XS, couleur violet.",
 "en": "XS scale, Violet.",
 "es": "Talla XS, color violeta.",
 "tr": "XS beden, mor renk.",
 "ar": "مقاس XS، لون بنفسجي."
 },
 "price": 80000,
 "img": "assets/lookbook-ss26-27/embedded/p41_img03_xref1315_841b5b884798.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p41_img03_xref1315_841b5b884798.jpeg",
 "assets/lookbook-ss26-27/embedded/p44_img01_xref1329_bf91110d6d83.jpeg",
 "assets/lookbook-ss26-27/embedded/p45_img01_xref1333_caaad580c061.jpeg"
 ],
 "url": "/produits/la-sculpture-xs-basket-bag-ss26?color=violet"
 },
 {
 "handle": "la-sculpture-s-basket-bag-ss26",
 "size": "S",
 "color": {
 "fr": "Violet",
 "en": "Violet",
 "es": "Violeta",
 "tr": "Mor",
 "ar": "بنفسجي"
 },
 "colorSlug": "violet",
 "title": {
 "fr": "La Sculpture S - Violet",
 "en": "La Sculpture S - Violet",
 "es": "La Sculpture S - Violeta",
 "tr": "La Sculpture S - Mor",
 "ar": "La Sculpture S - بنفسجي"
 },
 "short": {
 "fr": "Format S, couleur violet.",
 "en": "S scale, Violet.",
 "es": "Talla S, color violeta.",
 "tr": "S beden, mor renk.",
 "ar": "مقاس S، لون بنفسجي."
 },
 "price": 93000,
 "img": "assets/lookbook-ss26-27/embedded/p41_img03_xref1315_841b5b884798.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p41_img03_xref1315_841b5b884798.jpeg",
 "assets/lookbook-ss26-27/embedded/p44_img01_xref1329_bf91110d6d83.jpeg",
 "assets/lookbook-ss26-27/embedded/p45_img01_xref1333_caaad580c061.jpeg"
 ],
 "url": "/produits/la-sculpture-s-basket-bag-ss26?color=violet"
 },
 {
 "handle": "la-sculpture-m-basket-bag-ss26",
 "size": "M",
 "color": {
 "fr": "Violet",
 "en": "Violet",
 "es": "Violeta",
 "tr": "Mor",
 "ar": "بنفسجي"
 },
 "colorSlug": "violet",
 "title": {
 "fr": "La Sculpture M - Violet",
 "en": "La Sculpture M - Violet",
 "es": "La Sculpture M - Violeta",
 "tr": "La Sculpture M - Mor",
 "ar": "La Sculpture M - بنفسجي"
 },
 "short": {
 "fr": "Format M, couleur violet.",
 "en": "M scale, Violet.",
 "es": "Talla M, color violeta.",
 "tr": "M beden, mor renk.",
 "ar": "مقاس M، لون بنفسجي."
 },
 "price": 100000,
 "img": "assets/lookbook-ss26-27/embedded/p41_img03_xref1315_841b5b884798.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p41_img03_xref1315_841b5b884798.jpeg",
 "assets/lookbook-ss26-27/embedded/p44_img01_xref1329_bf91110d6d83.jpeg",
 "assets/lookbook-ss26-27/embedded/p45_img01_xref1333_caaad580c061.jpeg"
 ],
 "url": "/produits/la-sculpture-m-basket-bag-ss26?color=violet"
 }
 ]
 },
 {
 "familyHandle": "la-sculpture",
 "familyTitle": {
 "fr": "La Sculpture",
 "en": "La Sculpture",
 "es": "La Sculpture",
 "tr": "La Sculpture",
 "ar": "La Sculpture"
 },
 "familyEyebrow": {
 "fr": "Collection Sculpture",
 "en": "Collection Sculpture",
 "es": "Collection Sculpture",
 "tr": "Collection Sculpture",
 "ar": "Collection Sculpture"
 },
 "familyText": {
 "fr": "Choisissez d'abord la couleur, puis la taille. Chaque lien vous dirige vers le bon sac.",
 "en": "Choose the colour first, then the size. Each link opens the right bag page.",
 "es": "Elige primero el color y luego la talla. Cada enlace abre la página del bolso correcto.",
 "tr": "Önce rengi, sonra bedeni seçin. Her bağlantı doğru çanta sayfasını açar.",
 "ar": "اختر اللون أولاً ثم المقاس. كل رابط يفتح صفحة الحقيبة الصحيحة."
 },
 "rowTitle": {
 "fr": "La Sculpture - Noir",
 "en": "La Sculpture - Black",
 "es": "La Sculpture - Negro",
 "tr": "La Sculpture - Siyah",
 "ar": "La Sculpture - أسود"
 },
 "color": {
 "fr": "Noir",
 "en": "Black",
 "es": "Negro",
 "tr": "Siyah",
 "ar": "أسود"
 },
 "colorSlug": "noir",
 "img": "assets/products/la-sculpture/sculpt-black-olive-s.jpg",
 "gallery": [
 "assets/products/la-sculpture/sculpt-black-olive-xs.jpg",
 "assets/products/la-sculpture/sculpt-black-olive-s.jpg",
 "assets/products/la-sculpture/sculpt-black-olive-m.jpg"
 ],
 "items": [
 {
 "handle": "la-sculpture-xs-basket-bag-ss26",
 "size": "XS",
 "color": {
 "fr": "Noir",
 "en": "Black",
 "es": "Negro",
 "tr": "Siyah",
 "ar": "أسود"
 },
 "colorSlug": "noir",
 "title": {
 "fr": "La Sculpture XS - Noir",
 "en": "La Sculpture XS - Black",
 "es": "La Sculpture XS - Negro",
 "tr": "La Sculpture XS - Siyah",
 "ar": "La Sculpture XS - أسود"
 },
 "short": {
 "fr": "Format XS, couleur noir.",
 "en": "XS scale, Black.",
 "es": "Talla XS, color negro.",
 "tr": "XS beden, siyah renk.",
 "ar": "مقاس XS، لون أسود."
 },
 "price": 80000,
 "img": "assets/lookbook-ss26-27/embedded/p46_img01_xref1337_7dae31225680.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p46_img01_xref1337_7dae31225680.jpeg",
 "assets/lookbook-ss26-27/embedded/p47_img01_xref1341_0932d247e77e.jpeg",
 "assets/lookbook-ss26-27/embedded/p48_img02_xref1346_42bfdc1a3e34.jpeg",
 "assets/lookbook-ss26-27/embedded/p48_img03_xref1347_e6608af984d1.jpeg"
 ],
 "url": "/produits/la-sculpture-xs-basket-bag-ss26?color=noir"
 },
 {
 "handle": "la-sculpture-s-basket-bag-ss26",
 "size": "S",
 "color": {
 "fr": "Noir",
 "en": "Black",
 "es": "Negro",
 "tr": "Siyah",
 "ar": "أسود"
 },
 "colorSlug": "noir",
 "title": {
 "fr": "La Sculpture S - Noir",
 "en": "La Sculpture S - Black",
 "es": "La Sculpture S - Negro",
 "tr": "La Sculpture S - Siyah",
 "ar": "La Sculpture S - أسود"
 },
 "short": {
 "fr": "Format S, couleur noir.",
 "en": "S scale, Black.",
 "es": "Talla S, color negro.",
 "tr": "S beden, siyah renk.",
 "ar": "مقاس S، لون أسود."
 },
 "price": 93000,
 "img": "assets/lookbook-ss26-27/embedded/p46_img01_xref1337_7dae31225680.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p46_img01_xref1337_7dae31225680.jpeg",
 "assets/lookbook-ss26-27/embedded/p47_img01_xref1341_0932d247e77e.jpeg",
 "assets/lookbook-ss26-27/embedded/p48_img02_xref1346_42bfdc1a3e34.jpeg",
 "assets/lookbook-ss26-27/embedded/p48_img03_xref1347_e6608af984d1.jpeg"
 ],
 "url": "/produits/la-sculpture-s-basket-bag-ss26?color=noir"
 },
 {
 "handle": "la-sculpture-m-basket-bag-ss26",
 "size": "M",
 "color": {
 "fr": "Noir",
 "en": "Black",
 "es": "Negro",
 "tr": "Siyah",
 "ar": "أسود"
 },
 "colorSlug": "noir",
 "title": {
 "fr": "La Sculpture M - Noir",
 "en": "La Sculpture M - Black",
 "es": "La Sculpture M - Negro",
 "tr": "La Sculpture M - Siyah",
 "ar": "La Sculpture M - أسود"
 },
 "short": {
 "fr": "Format M, couleur noir.",
 "en": "M scale, Black.",
 "es": "Talla M, color negro.",
 "tr": "M beden, siyah renk.",
 "ar": "مقاس M، لون أسود."
 },
 "price": 100000,
 "img": "assets/lookbook-ss26-27/embedded/p46_img01_xref1337_7dae31225680.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p46_img01_xref1337_7dae31225680.jpeg",
 "assets/lookbook-ss26-27/embedded/p47_img01_xref1341_0932d247e77e.jpeg",
 "assets/lookbook-ss26-27/embedded/p48_img02_xref1346_42bfdc1a3e34.jpeg",
 "assets/lookbook-ss26-27/embedded/p48_img03_xref1347_e6608af984d1.jpeg"
 ],
 "url": "/produits/la-sculpture-m-basket-bag-ss26?color=noir"
 }
 ]
 },
 {
 "familyHandle": "la-nouvelle-vague",
 "familyTitle": {
 "fr": "La Nouvelle Vague",
 "en": "New Edition Bag",
 "es": "New Edition Bag",
 "tr": "New Edition Bag",
 "ar": "New Edition Bag"
 },
 "familyEyebrow": {
 "fr": "New edition bag",
 "en": "New edition bag",
 "es": "New edition bag",
 "tr": "New edition bag",
 "ar": "New edition bag"
 },
 "familyText": {
 "fr": "La Nouvelle Vague garde les formats publies dans le manifest: chaque carte ouvre la page du format et du coloris photographies.",
 "en": "La Nouvelle Vague keeps the published manifest scales: each card opens the photographed size and colour.",
 "es": "La Nouvelle Vague keeps the published manifest scales: each card opens the photographed size and colour.",
 "tr": "La Nouvelle Vague keeps the published manifest scales: each card opens the photographed size and colour.",
 "ar": "La Nouvelle Vague keeps the published manifest scales: each card opens the photographed size and colour."
 },
 "rowTitle": {
 "fr": "La Nouvelle Vague",
 "en": "New Edition Bag",
 "es": "New Edition Bag",
 "tr": "New Edition Bag",
 "ar": "New Edition Bag"
 },
 "color": {
 "fr": "Edition active",
 "en": "Active edition",
 "es": "Active edition",
 "tr": "Active edition",
 "ar": "Active edition"
 },
 "colorSlug": "edition",
 "img": "assets/products/la-vague/lavague-black-s.jpg",
 "gallery": [
 "assets/products/la-vague/lavague-black-xs.jpg",
 "assets/products/la-vague/lavague-black-s.jpg",
 "assets/products/la-vague/lavague-black-m.jpg"
 ],
 "items": [
 {
 "handle": "la-nouvelle-vague-xs-basket-bag-ss26",
 "size": "XS",
 "color": {
 "fr": "Bleu",
 "en": "Blue",
 "es": "Blue",
 "tr": "Blue",
 "ar": "Blue"
 },
 "colorSlug": "bleu",
 "title": {
 "fr": "La Nouvelle Vague XS - Bleu",
 "en": "New Edition Bag XS - Blue",
 "es": "New Edition Bag XS - Blue",
 "tr": "New Edition Bag XS - Blue",
 "ar": "New Edition Bag XS - Blue"
 },
 "short": {
 "fr": "Format XS, couleur bleu.",
 "en": "XS scale, blue finish.",
 "es": "XS scale, blue finish.",
 "tr": "XS scale, blue finish.",
 "ar": "XS scale, blue finish."
 },
 "price": 49000,
 "img": "assets/lookbook-ss26-27/embedded/p50_img01_xref1362_b250c91a59d1.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p50_img01_xref1362_b250c91a59d1.jpeg",
 "assets/lookbook-ss26-27/embedded/p51_img01_xref1366_21749db6b994.jpeg",
 "assets/lookbook-ss26-27/embedded/p52_img01_xref1373_10bd8ebf12c0.jpeg"
 ],
 "url": "/produits/la-nouvelle-vague-xs-basket-bag-ss26?color=bleu"
 },
 {
 "handle": "la-nouvelle-vague-s-basket-bag-ss26",
 "size": "S",
 "color": {
 "fr": "Rose",
 "en": "Pink",
 "es": "Pink",
 "tr": "Pink",
 "ar": "Pink"
 },
 "colorSlug": "rose",
 "title": {
 "fr": "La Nouvelle Vague S - Rose",
 "en": "New Edition Bag S - Pink",
 "es": "New Edition Bag S - Pink",
 "tr": "New Edition Bag S - Pink",
 "ar": "New Edition Bag S - Pink"
 },
 "short": {
 "fr": "Format S, finition rose.",
 "en": "S scale, pink finish.",
 "es": "S scale, pink finish.",
 "tr": "S scale, pink finish.",
 "ar": "S scale, pink finish."
 },
 "price": 60000,
 "img": "assets/lookbook-ss26-27/embedded/p51_img01_xref1366_21749db6b994.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p51_img01_xref1366_21749db6b994.jpeg",
 "assets/lookbook-ss26-27/embedded/p50_img01_xref1362_b250c91a59d1.jpeg",
 "assets/lookbook-ss26-27/embedded/p52_img01_xref1373_10bd8ebf12c0.jpeg"
 ],
 "url": "/produits/la-nouvelle-vague-s-basket-bag-ss26?color=rose"
 },
 {
 "handle": "la-nouvelle-vague-m-basket-bag-ss26",
 "size": "M",
 "color": {
 "fr": "Bleu ciel",
 "en": "Sky blue",
 "es": "Sky blue",
 "tr": "Sky blue",
 "ar": "Sky blue"
 },
 "colorSlug": "bleu-ciel",
 "title": {
 "fr": "La Nouvelle Vague M - Bleu ciel",
 "en": "New Edition Bag M - Sky blue",
 "es": "New Edition Bag M - Sky blue",
 "tr": "New Edition Bag M - Sky blue",
 "ar": "New Edition Bag M - Sky blue"
 },
 "short": {
 "fr": "Format M, couleur bleu ciel.",
 "en": "M scale, sky blue finish.",
 "es": "M scale, sky blue finish.",
 "tr": "M scale, sky blue finish.",
 "ar": "M scale, sky blue finish."
 },
 "price": 66000,
 "img": "assets/lookbook-ss26-27/embedded/p52_img01_xref1373_10bd8ebf12c0.jpeg",
 "gallery": [
 "assets/lookbook-ss26-27/embedded/p52_img01_xref1373_10bd8ebf12c0.jpeg",
 "assets/lookbook-ss26-27/embedded/p50_img01_xref1362_b250c91a59d1.jpeg",
 "assets/lookbook-ss26-27/embedded/p51_img01_xref1366_21749db6b994.jpeg"
 ],
 "url": "/produits/la-nouvelle-vague-m-basket-bag-ss26?color=bleu-ciel"
 }
 ]
 }
];
const PRODUCT_ALIASES = {
 "cerises": "raffia-cherries-charm-ss26",
 "raisin": "raffia-grapes-charm-ss26",
 "raisins": "raffia-grapes-charm-ss26",
 "tranche-citron": "raffia-lemon-slice-charm-ss26",
 "citron": "raffia-whole-lemon-charm-ss26",
 "tranche-orange": "raffia-orange-slice-charm-ss26",
 "orange": "raffia-whole-orange-charm-ss26",
 "tomate": "raffia-tomato-charm-ss26",
 "kiwi": "raffia-kiwi-slice-charm-ss26",
 "pasteque": "raffia-watermelon-slice-charm-ss26",
 "avocat": "raffia-avocado-half-charm-ss26",
 "avocado": "raffia-avocado-half-charm-ss26",
 "sculpture-xs-noir": "la-sculpture-xs-basket-bag-ss26",
 "sculpture-xs-rouge": "la-sculpture-xs-basket-bag-ss26",
 "sculpture-xs-violet": "la-sculpture-xs-basket-bag-ss26",
 "sculpture-s-rouge": "la-sculpture-s-basket-bag-ss26",
 "sculpture-s-violet": "la-sculpture-s-basket-bag-ss26",
 "sculpture-m-noir": "la-sculpture-m-basket-bag-ss26",
 "pareo-short": "yza-pareo-skirt-short-jawhara-ss26",
 "pareo-midi": "yza-pareo-skirt-midi-jawhara-ss26",
 "pareo-long": "yza-pareo-skirt-long-jawhara-ss26",
 "pareo-xlong": "yza-pareo-skirt-x-long-jawhara-ss26",
 "palazzo-pants": "yza-palazzo-pants-jawhara-ss26",
 "wrap-pants": "yza-wrap-pants-jawhara-ss26"
};
const VARIANTS = [
 {
 "product_handle": "yza-bateau-top-jawhara-ss26",
 "sku": "T-CB-JWP-BL",
 "category": "Top",
 "source_type": "col bateau",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-short-jawhara-ss26",
 "sku": "B-JPC-JWP-BL",
 "category": "Bottoms",
 "source_type": "Pareo courte",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-scarf-top-jawhara-ss26",
 "sku": "T-FL-JWP-BL",
 "category": "Top",
 "source_type": "Foulard",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "sku": "B-JPM-JWP-BL",
 "category": "Bottoms",
 "source_type": "Pareo midi",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-S-JWP-BL",
 "category": "Top",
 "source_type": "Chemise S",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": "S",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-long-jawhara-ss26",
 "sku": "B-JPL-JWP-BL",
 "category": "Bottoms",
 "source_type": "Pareo longue",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-M-JWP-BL",
 "category": "Top",
 "source_type": "Chemise M",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": "M",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "sku": "B-JPLP-JWP-BL",
 "category": "Bottoms",
 "source_type": "Pareo longue petite",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-L-JWP-BL",
 "category": "Top",
 "source_type": "Chemise L",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": "L",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-palazzo-pants-jawhara-ss26",
 "sku": "B-PT-JWP-BL",
 "category": "Bottoms",
 "source_type": "Pantalon",
 "fabric": "Jawhara poly",
 "color": "Blanc",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-bateau-top-jawhara-ss26",
 "sku": "T-CB-JWP-NR",
 "category": "Top",
 "source_type": "col bateau",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-short-jawhara-ss26",
 "sku": "B-JPC-JWP-NR",
 "category": "Bottoms",
 "source_type": "Pareo courte",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-scarf-top-jawhara-ss26",
 "sku": "T-FL-JWP-NR",
 "category": "Top",
 "source_type": "Foulard",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "sku": "B-JPM-JWP-NR",
 "category": "Bottoms",
 "source_type": "Pareo midi",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-S-JWP-NR",
 "category": "Top",
 "source_type": "Chemise S",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": "S",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-long-jawhara-ss26",
 "sku": "B-JPL-JWP-NR",
 "category": "Bottoms",
 "source_type": "Pareo longue",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-M-JWP-NR",
 "category": "Top",
 "source_type": "Chemise M",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": "M",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "sku": "B-JPLP-JWP-NR",
 "category": "Bottoms",
 "source_type": "Pareo longue petite",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-L-JWP-NR",
 "category": "Top",
 "source_type": "Chemise L",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": "L",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-palazzo-pants-jawhara-ss26",
 "sku": "B-PT-JWP-NR",
 "category": "Bottoms",
 "source_type": "Pantalon",
 "fabric": "Jawhara poly",
 "color": "Noir",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-bateau-top-jawhara-ss26",
 "sku": "T-CB-JWP-JM",
 "category": "Top",
 "source_type": "col bateau",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-short-jawhara-ss26",
 "sku": "B-JPC-JWP-JM",
 "category": "Bottoms",
 "source_type": "Pareo courte",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-scarf-top-jawhara-ss26",
 "sku": "T-FL-JWP-JM",
 "category": "Top",
 "source_type": "Foulard",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "sku": "B-JPM-JWP-JM",
 "category": "Bottoms",
 "source_type": "Pareo midi",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-S-JWP-JM",
 "category": "Top",
 "source_type": "Chemise S",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": "S",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-long-jawhara-ss26",
 "sku": "B-JPL-JWP-JM",
 "category": "Bottoms",
 "source_type": "Pareo longue",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-M-JWP-JM",
 "category": "Top",
 "source_type": "Chemise M",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": "M",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "sku": "B-JPLP-JWP-JM",
 "category": "Bottoms",
 "source_type": "Pareo longue petite",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-L-JWP-JM",
 "category": "Top",
 "source_type": "Chemise L",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": "L",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-palazzo-pants-jawhara-ss26",
 "sku": "B-PT-JWP-JM",
 "category": "Bottoms",
 "source_type": "Pantalon",
 "fabric": "Jawhara poly",
 "color": "Jaune moutarde",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-bateau-top-jawhara-ss26",
 "sku": "T-CB-JWP-VR",
 "category": "Top",
 "source_type": "col bateau",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-short-jawhara-ss26",
 "sku": "B-JPC-JWP-VR",
 "category": "Bottoms",
 "source_type": "Pareo courte",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-scarf-top-jawhara-ss26",
 "sku": "T-FL-JWP-VR",
 "category": "Top",
 "source_type": "Foulard",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "sku": "B-JPM-JWP-VR",
 "category": "Bottoms",
 "source_type": "Pareo midi",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-S-JWP-VR",
 "category": "Top",
 "source_type": "Chemise S",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": "S",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-long-jawhara-ss26",
 "sku": "B-JPL-JWP-VR",
 "category": "Bottoms",
 "source_type": "Pareo longue",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-M-JWP-VR",
 "category": "Top",
 "source_type": "Chemise M",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": "M",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "sku": "B-JPLP-JWP-VR",
 "category": "Bottoms",
 "source_type": "Pareo longue petite",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-L-JWP-VR",
 "category": "Top",
 "source_type": "Chemise L",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": "L",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-palazzo-pants-jawhara-ss26",
 "sku": "B-PT-JWP-VR",
 "category": "Bottoms",
 "source_type": "Pantalon",
 "fabric": "Jawhara poly",
 "color": "Vert",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-bateau-top-jawhara-ss26",
 "sku": "T-CB-JWP-RV",
 "category": "Top",
 "source_type": "col bateau",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-short-jawhara-ss26",
 "sku": "B-JPC-JWP-RV",
 "category": "Bottoms",
 "source_type": "Pareo courte",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-scarf-top-jawhara-ss26",
 "sku": "T-FL-JWP-RV",
 "category": "Top",
 "source_type": "Foulard",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "sku": "B-JPM-JWP-RV",
 "category": "Bottoms",
 "source_type": "Pareo midi",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-S-JWP-RV",
 "category": "Top",
 "source_type": "Chemise S",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": "S",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-long-jawhara-ss26",
 "sku": "B-JPL-JWP-RV",
 "category": "Bottoms",
 "source_type": "Pareo longue",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-M-JWP-RV",
 "category": "Top",
 "source_type": "Chemise M",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": "M",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "sku": "B-JPLP-JWP-RV",
 "category": "Bottoms",
 "source_type": "Pareo longue petite",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-L-JWP-RV",
 "category": "Top",
 "source_type": "Chemise L",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": "L",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-palazzo-pants-jawhara-ss26",
 "sku": "B-PT-JWP-RV",
 "category": "Bottoms",
 "source_type": "Pantalon",
 "fabric": "Jawhara poly",
 "color": "Rose vieux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-bateau-top-jawhara-ss26",
 "sku": "T-CB-JWP-RG",
 "category": "Top",
 "source_type": "col bateau",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-short-jawhara-ss26",
 "sku": "B-JPC-JWP-RG",
 "category": "Bottoms",
 "source_type": "Pareo courte",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-scarf-top-jawhara-ss26",
 "sku": "T-FL-JWP-RG",
 "category": "Top",
 "source_type": "Foulard",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "sku": "B-JPM-JWP-RG",
 "category": "Bottoms",
 "source_type": "Pareo midi",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-S-JWP-RG",
 "category": "Top",
 "source_type": "Chemise S",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": "S",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-long-jawhara-ss26",
 "sku": "B-JPL-JWP-RG",
 "category": "Bottoms",
 "source_type": "Pareo longue",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-M-JWP-RG",
 "category": "Top",
 "source_type": "Chemise M",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": "M",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "sku": "B-JPLP-JWP-RG",
 "category": "Bottoms",
 "source_type": "Pareo longue petite",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-L-JWP-RG",
 "category": "Top",
 "source_type": "Chemise L",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": "L",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-palazzo-pants-jawhara-ss26",
 "sku": "B-PT-JWP-RG",
 "category": "Bottoms",
 "source_type": "Pantalon",
 "fabric": "Jawhara poly",
 "color": "Rouge",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-bateau-top-jawhara-ss26",
 "sku": "T-CB-JWP-BD",
 "category": "Top",
 "source_type": "col bateau",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-short-jawhara-ss26",
 "sku": "B-JPC-JWP-BD",
 "category": "Bottoms",
 "source_type": "Pareo courte",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-scarf-top-jawhara-ss26",
 "sku": "T-FL-JWP-BD",
 "category": "Top",
 "source_type": "Foulard",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "sku": "B-JPM-JWP-BD",
 "category": "Bottoms",
 "source_type": "Pareo midi",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-S-JWP-BD",
 "category": "Top",
 "source_type": "Chemise S",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": "S",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-long-jawhara-ss26",
 "sku": "B-JPL-JWP-BD",
 "category": "Bottoms",
 "source_type": "Pareo longue",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-M-JWP-BD",
 "category": "Top",
 "source_type": "Chemise M",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": "M",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "sku": "B-JPLP-JWP-BD",
 "category": "Bottoms",
 "source_type": "Pareo longue petite",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-L-JWP-BD",
 "category": "Top",
 "source_type": "Chemise L",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": "L",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-palazzo-pants-jawhara-ss26",
 "sku": "B-PT-JWP-BD",
 "category": "Bottoms",
 "source_type": "Pantalon",
 "fabric": "Jawhara poly",
 "color": "Bordeaux",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-bateau-top-jawhara-ss26",
 "sku": "T-CB-JWP-BLU",
 "category": "Top",
 "source_type": "col bateau",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-short-jawhara-ss26",
 "sku": "B-JPC-JWP-BLU",
 "category": "Bottoms",
 "source_type": "Pareo courte",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-scarf-top-jawhara-ss26",
 "sku": "T-FL-JWP-BLU",
 "category": "Top",
 "source_type": "Foulard",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "sku": "B-JPM-JWP-BLU",
 "category": "Bottoms",
 "source_type": "Pareo midi",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-S-JWP-BLU",
 "category": "Top",
 "source_type": "Chemise S",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": "S",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-long-jawhara-ss26",
 "sku": "B-JPL-JWP-BLU",
 "category": "Bottoms",
 "source_type": "Pareo longue",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-M-JWP-BLU",
 "category": "Top",
 "source_type": "Chemise M",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": "M",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "sku": "B-JPLP-JWP-BLU",
 "category": "Bottoms",
 "source_type": "Pareo longue petite",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-L-JWP-BLU",
 "category": "Top",
 "source_type": "Chemise L",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": "L",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-palazzo-pants-jawhara-ss26",
 "sku": "B-PT-JWP-BLU",
 "category": "Bottoms",
 "source_type": "Pantalon",
 "fabric": "Jawhara poly",
 "color": "Bleu majorelle",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-bateau-top-jawhara-ss26",
 "sku": "T-CB-JWP-VP",
 "category": "Top",
 "source_type": "col bateau",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-short-jawhara-ss26",
 "sku": "B-JPC-JWP-VP",
 "category": "Bottoms",
 "source_type": "Pareo courte",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-scarf-top-jawhara-ss26",
 "sku": "T-FL-JWP-VP",
 "category": "Top",
 "source_type": "Foulard",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "sku": "B-JPM-JWP-VP",
 "category": "Bottoms",
 "source_type": "Pareo midi",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-S-JWP-VP",
 "category": "Top",
 "source_type": "Chemise S",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": "S",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-long-jawhara-ss26",
 "sku": "B-JPL-JWP-VP",
 "category": "Bottoms",
 "source_type": "Pareo longue",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-M-JWP-VP",
 "category": "Top",
 "source_type": "Chemise M",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": "M",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "sku": "B-JPLP-JWP-VP",
 "category": "Bottoms",
 "source_type": "Pareo longue petite",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-button-up-shirt-jawhara-ss26",
 "sku": "T-CH-L-JWP-VP",
 "category": "Top",
 "source_type": "Chemise L",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": "L",
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "yza-palazzo-pants-jawhara-ss26",
 "sku": "B-PT-JWP-VP",
 "category": "Bottoms",
 "source_type": "Pantalon",
 "fabric": "Jawhara poly",
 "color": "Vert profond",
 "size": null,
 "source_file": "",
 "source_sheet": "RTW HIVER 26"
 },
 {
 "product_handle": "raffia-orange-slice-charm-ss26",
 "sku": null,
 "category": "CHARM",
 "source_type": "orange slice",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 5
 },
 {
 "product_handle": "la-sculpture-xs-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Sculpture",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": "Noir",
 "size": "Mini",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 5
 },
 {
 "product_handle": "raffia-whole-orange-charm-ss26",
 "sku": null,
 "category": "CHARM",
 "source_type": "orange",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 6
 },
 {
 "product_handle": "la-sculpture-s-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Sculpture",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": "Noir",
 "size": "Moyen",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 6
 },
 {
 "product_handle": "raffia-lemon-slice-charm-ss26",
 "sku": null,
 "category": "CHARM",
 "source_type": "lemon slice",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 7
 },
 {
 "product_handle": "la-sculpture-m-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Sculpture",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": "Noir",
 "size": "Grand",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 7
 },
 {
 "product_handle": "raffia-whole-lemon-charm-ss26",
 "sku": null,
 "category": "CHARM",
 "source_type": "lemon",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 8
 },
 {
 "product_handle": "la-sculpture-xs-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Sculpture",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": "Rouge",
 "size": "Mini",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 8
 },
 {
 "product_handle": "raffia-tomato-charm-ss26",
 "sku": null,
 "category": "CHARM",
 "source_type": "tomate",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 9
 },
 {
 "product_handle": "la-sculpture-s-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Sculpture",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": "Rouge",
 "size": "Moyen",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 9
 },
 {
 "product_handle": "raffia-watermelon-slice-charm-ss26",
 "sku": null,
 "category": "CHARM",
 "source_type": "pasteque slice",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 10
 },
 {
 "product_handle": "la-sculpture-m-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Sculpture",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": "Rouge",
 "size": "Grand",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 10
 },
 {
 "product_handle": "raffia-kiwi-slice-charm-ss26",
 "sku": null,
 "category": "CHARM",
 "source_type": "kiwi slice",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 11
 },
 {
 "product_handle": "la-sculpture-xs-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Sculpture",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": "Violet",
 "size": "Mini",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 11
 },
 {
 "product_handle": "raffia-grapes-charm-ss26",
 "sku": null,
 "category": "CHARM",
 "source_type": "grapes",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 12
 },
 {
 "product_handle": "la-sculpture-s-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Sculpture",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": "Violet",
 "size": "Moyen",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 12
 },
 {
 "product_handle": "raffia-cherries-charm-ss26",
 "sku": null,
 "category": "CHARM",
 "source_type": "cerises",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 13
 },
 {
 "product_handle": "la-sculpture-m-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Sculpture",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": "Violet",
 "size": "Grand",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 13
 },
 {
 "product_handle": "orange-raffia-earrings-ss26",
 "sku": null,
 "category": "BO",
 "source_type": "oranges",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 14
 },
 {
 "product_handle": "watermelon-raffia-earrings-ss26",
 "sku": null,
 "category": "BO",
 "source_type": "pastéques x2",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 15
 },
 {
 "product_handle": "lemon-raffia-earrings-ss26",
 "sku": null,
 "category": "BO",
 "source_type": "lemon",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 16
 },
 {
 "product_handle": "tomatoes-raffia-earrings-ss26",
 "sku": null,
 "category": "BO",
 "source_type": "tomate x2",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 17
 },
 {
 "product_handle": "kiwi-raffia-earrings-ss26",
 "sku": null,
 "category": "BO",
 "source_type": "kiwi slice x2",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 18
 },
 {
 "product_handle": "grapes-raffia-earrings-ss26",
 "sku": null,
 "category": "BO",
 "source_type": "grapes x2",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 19
 },
 {
 "product_handle": "cherries-raffia-earrings-ss26",
 "sku": null,
 "category": "BO",
 "source_type": "cerises x2",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 20
 },
 {
 "product_handle": "lemon-slice-raffia-necklace-ss26",
 "sku": null,
 "category": "Necklace",
 "source_type": "lemon slice",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 21
 },
 {
 "product_handle": "la-nouvelle-vague-xs-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Market",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": null,
 "size": "Mini",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 21
 },
 {
 "product_handle": "watermelon-slice-raffia-necklace-ss26",
 "sku": null,
 "category": "Necklace",
 "source_type": "watermelon slice",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 22
 },
 {
 "product_handle": "la-nouvelle-vague-s-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Market",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": null,
 "size": "Moyen",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 22
 },
 {
 "product_handle": "orange-slice-raffia-necklace-ss26",
 "sku": null,
 "category": "Necklace",
 "source_type": "orange slice",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 23
 },
 {
 "product_handle": "la-nouvelle-vague-m-basket-bag-ss26",
 "sku": null,
 "category": "Bags",
 "source_type": "Market",
 "fabric": "Banana leaves / raffia/leather/beads per lookbook family",
 "color": null,
 "size": "Grand",
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 23
 },
 {
 "product_handle": "grapes-raffia-necklace-ss26",
 "sku": null,
 "category": "Necklace",
 "source_type": "grapes",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 24
 },
 {
 "product_handle": "cherries-raffia-necklace-ss26",
 "sku": null,
 "category": "Necklace",
 "source_type": "cerises",
 "fabric": "Raffia",
 "color": null,
 "size": null,
 "source_file": "",
 "source_sheet": "ACCESS HIVER 26",
 "source_row": 25
 }
];
const CATALOG_SOURCE = {
 "name": "YZA SS26/27 XLSX-priced catalog",
 "priceSource": "Excel retail / Prix de vente TTC DIRECT",
 "productCount": 37,
 "variantCount": 123,
 "draftTbcItemsExcluded": 23,
 "lookbookPages": 68,
 "embeddedImages": 178
};
const ASSET_MANIFEST = {
 "lookbookPages": [
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-01.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-02.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-03.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-04.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-05.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-06.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-07.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-08.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-09.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-10.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-11.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-12.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-13.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-14.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-15.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-16.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-17.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-18.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-19.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-20.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-21.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-22.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-23.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-24.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-25.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-26.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-27.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-28.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-29.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-30.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-31.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-32.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-33.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-34.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-35.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-36.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-37.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-38.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-39.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-40.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-41.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-42.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-43.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-44.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-45.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-46.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-47.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-48.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-49.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-50.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-51.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-52.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-53.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-54.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-55.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-56.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-57.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-58.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-59.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-60.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-65.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-66.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-67.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-68.jpg"
 ],
 "usedProductAssets": [
 "assets/lookbook-ss26-27/embedded/p29_img01_xref1212_d56a9ef89119.jpeg",
 "assets/lookbook-ss26-27/embedded/p29_img02_xref1213_fe747a323e9f.jpeg",
 "assets/lookbook-ss26-27/embedded/p29_img03_xref1214_6b93fb974a48.jpeg",
 "assets/lookbook-ss26-27/embedded/p29_img04_xref1215_ea0a78123e7b.jpeg",
 "assets/lookbook-ss26-27/embedded/p30_img01_xref1219_8b2d1136309d.jpeg",
 "assets/lookbook-ss26-27/embedded/p30_img02_xref1220_f762d6e64853.jpeg",
 "assets/lookbook-ss26-27/embedded/p30_img03_xref1221_6a80517bd62a.jpeg",
 "assets/lookbook-ss26-27/embedded/p31_img02_xref1227_829199726349.jpeg",
 "assets/lookbook-ss26-27/embedded/p32_img04_xref1239_3935f6e23a7c.jpeg",
 "assets/lookbook-ss26-27/embedded/p38_img01_xref1287_56cb4d596aa0.jpeg",
 "assets/lookbook-ss26-27/embedded/p38_img04_xref1290_050054976c5b.jpeg",
 "assets/lookbook-ss26-27/embedded/p40_img01_xref1305_5ae097cc9e5a.jpeg",
 "assets/lookbook-ss26-27/embedded/p41_img03_xref1315_841b5b884798.jpeg",
 "assets/lookbook-ss26-27/embedded/p42_img01_xref1321_1a08834f9d69.jpeg",
 "assets/lookbook-ss26-27/embedded/p43_img01_xref1325_6be88260cccd.jpeg",
 "assets/lookbook-ss26-27/embedded/p44_img01_xref1329_bf91110d6d83.jpeg",
 "assets/lookbook-ss26-27/embedded/p45_img01_xref1333_caaad580c061.jpeg",
 "assets/lookbook-ss26-27/embedded/p46_img01_xref1337_7dae31225680.jpeg",
 "assets/lookbook-ss26-27/embedded/p47_img01_xref1341_0932d247e77e.jpeg",
 "assets/lookbook-ss26-27/embedded/p48_img01_xref1345_c06ef6230440.jpeg",
 "assets/lookbook-ss26-27/embedded/p48_img02_xref1346_42bfdc1a3e34.jpeg",
 "assets/lookbook-ss26-27/embedded/p48_img03_xref1347_e6608af984d1.jpeg",
 "assets/lookbook-ss26-27/embedded/p48_img04_xref1348_332e7fac044c.jpeg",
 "assets/lookbook-ss26-27/embedded/p50_img01_xref1362_b250c91a59d1.jpeg",
 "assets/lookbook-ss26-27/embedded/p51_img01_xref1366_21749db6b994.jpeg",
 "assets/lookbook-ss26-27/embedded/p52_img01_xref1373_10bd8ebf12c0.jpeg",
 "assets/lookbook-ss26-27/embedded/p53_img01_xref1380_788fc851111b.jpeg",
 "assets/lookbook-ss26-27/embedded/p55_img01_xref1397_f3009f829bf8.jpeg",
 "assets/lookbook-ss26-27/embedded/p56_img02_xref1402_2ffff76a0151.jpeg",
 "assets/lookbook-ss26-27/embedded/p57_img04_xref1411_21775b2a985c.jpeg",
 "assets/lookbook-ss26-27/embedded/p58_img02_xref1416_b7482fc1dffb.jpeg",
 "assets/lookbook-ss26-27/embedded/p59_img01_xref1426_ab1030bf5e96.jpeg",
 "assets/lookbook-ss26-27/embedded/p60_img01_xref2285_8f75334c5653.webp",
 "assets/products/accessories-clean/lemon-slice-necklace-clean.webp",
 "assets/products/accessories-clean/orange-slice-necklace-clean.webp",
 "assets/products/accessories-clean/kiwi-raffia-earrings-clean.png",
 "assets/products/accessories-clean/watermelon-slice-accessory-clean.webp",
 "assets/products/accessories-clean/orange-raffia-earrings-clean.webp",
 "assets/products/accessories-clean/lemon-raffia-earrings-clean.webp",
 "assets/products/accessories-clean/grapes-accessory-clean.png",
 "assets/products/accessories-clean/cherries-accessory-clean.png",
 "assets/products/accessories-clean/tomatoes-earrings-clean.webp",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-26.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-27.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-28.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-29.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-31.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-32.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-33.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-34.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-35.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-36.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-37.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-38.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-39.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-54.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-55.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-56.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-57.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-58.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-59.jpg",
 "assets/lookbook-ss26-27/pages/yza-lookbook-page-60.jpg",
 "assets/original-shop/charms/raffia-avocado-half-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-avocado-half-charm-ss26-02.webp",
 "assets/original-shop/charms/raffia-avocado-half-charm-ss26-03.jpg",
 "assets/original-shop/charms/raffia-avocado-half-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-avocado-half-charm-ss26-08.webp",
 "assets/original-shop/charms/raffia-avocado-half-charm-ss26-09.webp",
 "assets/original-shop/charms/raffia-cherries-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-cherries-charm-ss26-02.webp",
 "assets/original-shop/charms/raffia-cherries-charm-ss26-03.jpg",
 "assets/original-shop/charms/raffia-cherries-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-cherries-charm-ss26-08.jpg",
 "assets/original-shop/charms/raffia-cherries-charm-ss26-10.webp",
 "assets/original-shop/charms/raffia-grapes-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-grapes-charm-ss26-02.webp",
 "assets/original-shop/charms/raffia-grapes-charm-ss26-03.jpg",
 "assets/original-shop/charms/raffia-grapes-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-grapes-charm-ss26-08.jpg",
 "assets/original-shop/charms/raffia-grapes-charm-ss26-10.webp",
 "assets/original-shop/charms/raffia-kiwi-slice-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-kiwi-slice-charm-ss26-02.webp",
 "assets/original-shop/charms/raffia-kiwi-slice-charm-ss26-03.jpg",
 "assets/original-shop/charms/raffia-kiwi-slice-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-kiwi-slice-charm-ss26-08.webp",
 "assets/original-shop/charms/raffia-kiwi-slice-charm-ss26-09.webp",
 "assets/original-shop/charms/raffia-lemon-slice-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-lemon-slice-charm-ss26-02.jpg",
 "assets/original-shop/charms/raffia-lemon-slice-charm-ss26-03.webp",
 "assets/original-shop/charms/raffia-lemon-slice-charm-ss26-06.webp",
 "assets/original-shop/charms/raffia-lemon-slice-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-lemon-slice-charm-ss26-08.webp",
 "assets/original-shop/charms/raffia-orange-slice-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-orange-slice-charm-ss26-02.webp",
 "assets/original-shop/charms/raffia-orange-slice-charm-ss26-03.jpg",
 "assets/original-shop/charms/raffia-orange-slice-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-orange-slice-charm-ss26-08.webp",
 "assets/original-shop/charms/raffia-orange-slice-charm-ss26-09.webp",
 "assets/original-shop/charms/raffia-tomato-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-tomato-charm-ss26-02.webp",
 "assets/original-shop/charms/raffia-tomato-charm-ss26-03.jpg",
 "assets/original-shop/charms/raffia-tomato-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-tomato-charm-ss26-08.webp",
 "assets/original-shop/charms/raffia-tomato-charm-ss26-09.webp",
 "assets/original-shop/charms/raffia-watermelon-slice-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-watermelon-slice-charm-ss26-02.jpg",
 "assets/original-shop/charms/raffia-watermelon-slice-charm-ss26-03.webp",
 "assets/original-shop/charms/raffia-watermelon-slice-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-watermelon-slice-charm-ss26-08.webp",
 "assets/original-shop/charms/raffia-watermelon-slice-charm-ss26-09.webp",
 "assets/original-shop/charms/raffia-whole-lemon-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-whole-lemon-charm-ss26-02.webp",
 "assets/original-shop/charms/raffia-whole-lemon-charm-ss26-03.jpg",
 "assets/original-shop/charms/raffia-whole-lemon-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-whole-lemon-charm-ss26-08.webp",
 "assets/original-shop/charms/raffia-whole-lemon-charm-ss26-09.webp",
 "assets/original-shop/charms/raffia-whole-orange-charm-ss26-01.png",
 "assets/original-shop/charms/raffia-whole-orange-charm-ss26-02.webp",
 "assets/original-shop/charms/raffia-whole-orange-charm-ss26-03.jpg",
 "assets/original-shop/charms/raffia-whole-orange-charm-ss26-07.webp",
 "assets/original-shop/charms/raffia-whole-orange-charm-ss26-08.webp",
 "assets/original-shop/charms/raffia-whole-orange-charm-ss26-09.webp"
 ],
 "blockedPublicPatterns": [
 "postcard",
 "logo",
 "payment",
 "price-sheet",
 "family-tree",
 "placeholder"
 ]
};

const BLOCKED_PUBLIC_IMAGE_PATTERNS = [
 /postcard/i,
 /mastercard|visa|payment|card-logo/i,
 /favicon|logo/i,
 /family-tree/i,
 /price[_-]?sheet|truth[_-]?table|reconciliation/i,
 /placeholder/i,
];

function isPublicProductImage(src) {
 const value = String(src || '');
 if (!value) return false;
 return !BLOCKED_PUBLIC_IMAGE_PATTERNS.some((pattern) => pattern.test(value));
}
function stripDiacritics(value) {
 return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function pickText(obj) {
 if (!obj) return '';
 if (typeof obj === 'string') return obj;
 return obj.fr || obj.en || Object.values(obj).find(Boolean) || '';
}
function normalizeSearch(value) {
 return stripDiacritics(value).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}
function levenshtein(a, b) {
 a = normalizeSearch(a); b = normalizeSearch(b);
 if (!a) return b.length;
 if (!b) return a.length;
 const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
 const cur = new Array(b.length + 1);
 for (let i = 1; i <= a.length; i += 1) {
 cur[0] = i;
 for (let j = 1; j <= b.length; j += 1) {
 const cost = a[i - 1] === b[j - 1] ? 0 : 1;
 cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
 }
 for (let j = 0; j <= b.length; j += 1) prev[j] = cur[j];
 }
 return prev[b.length];
}
function searchHaystack(product) {
 return normalizeSearch([
 product.handle,
 pickText(product.name), pickText(product.displayName),
 pickText(product.short), pickText(product.desc),
 product.category, product.group, product.sourceCategory,
 ...(product.tags || []), ...(product.seoKeywords || []), ...(product.languageSearchTerms || []),
 ...(product.availableColors || []).map(pickText), ...(product.availableSizes || []),
 ].filter(Boolean).join(' '));
}
function visualHaystack(product) {
 return normalizeSearch([
 product.handle,
 pickText(product.name), pickText(product.displayName),
 product.category, product.group, product.sourceCategory,
 pickText(product.color), pickText(product.visualColor), pickText(product.variantLabel),
 product.img,
 ...(product.tags || []),
 ].filter(Boolean).join(' '));
}
const COLOR_QUERY_ALIASES = {
 rouge: ['rouge', 'red', 'hot red'],
 red: ['rouge', 'red', 'hot red'],
 noir: ['noir', 'black'],
 black: ['noir', 'black'],
 violet: ['violet', 'purple', 'deep violet'],
 purple: ['violet', 'purple', 'deep violet'],
 orange: ['orange'],
 jaune: ['jaune', 'yellow', 'lemon', 'citron'],
 yellow: ['jaune', 'yellow', 'lemon', 'citron'],
 citron: ['jaune', 'yellow', 'lemon', 'citron'],
 vert: ['vert', 'green', 'kiwi', 'olive'],
 green: ['vert', 'green', 'kiwi', 'olive'],
 rose: ['rose', 'pink'],
 pink: ['rose', 'pink'],
 bleu: ['bleu', 'blue', 'majorelle'],
 blue: ['bleu', 'blue', 'majorelle'],
 pasteque: ['pasteque', 'watermelon'],
 watermelon: ['pasteque', 'watermelon'],
 cerise: ['cerise', 'cerises', 'cherry', 'cherries'],
 cherries: ['cerise', 'cerises', 'cherry', 'cherries'],
 tomate: ['tomate', 'tomato'],
 tomato: ['tomate', 'tomato'],
};
function colorQueryTerms(q) {
 const value = normalizeSearch(q);
 return COLOR_QUERY_ALIASES[value] || null;
}

const PRODUCT_MAP = new Map(PRODUCTS.map((product) => [product.handle, product]));
Object.entries(PRODUCT_ALIASES).forEach(([alias, handle]) => {
 const product = PRODUCT_MAP.get(handle);
 if (product) PRODUCT_MAP.set(alias, product);
});

function publicProductList(source = PRODUCTS) {
 return (source || PRODUCTS).filter((product) => product.publicVisible !== false && isPublicProductImage(product.img));
}
function isLaunchPromoProduct(product) {
 return Boolean(product && product.publicVisible !== false && product.launchPromo !== false && isPublicProductImage(product.img));
}
function launchPromoList(source = PRODUCTS) {
 return publicProductList(source).filter((product) => product.launchPromo !== false);
}
function byCategory(category = 'all') {
 const key = String(category || 'all').toLowerCase();
 const list = publicProductList();
 if (key === 'all') return list;
 if (key === 'rtw' || key === 'ready-to-wear') return list.filter((p) => p.group === 'rtw');
 if (key === 'accessories' || key === 'accessoires') return list.filter((p) => p.group === 'accessories' && p.category !== 'charms');
 if (key === 'bottoms') return list.filter((p) => p.category === 'pareos' || p.category === 'pants');
 return list.filter((p) => p.category === key || p.group === key || p.sourceCategory?.toLowerCase() === key);
}

const CATEGORY_INFO = {
 charms: { key: 'col.charms', title: 'col.charms', href: '/collections/charms' },
 earrings: { key: 'col.earrings', title: 'col.earrings', href: '/collections/boucles-d-oreilles' },
 necklaces: { key: 'col.necklaces', title: 'col.necklaces', href: '/collections/colliers' },
 bags: { key: 'col.bags', title: 'col.bags', href: '/collections/sacs' },
 tops: { key: 'col.tops', title: 'col.tops', href: '/collections/hauts' },
 pareos: { key: 'col.pareos', title: 'col.pareos', href: '/collections/jupes-pareo' },
 pants: { key: 'col.pants', title: 'col.pants', href: '/collections/pantalons' },
 rtw: { key: 'col.rtw', title: 'col.rtw', href: '/collections/pret-a-porter' },
 accessories: { key: 'col.accessories', title: 'col.accessories', href: '/collections/bijoux' },
};
function categoryInfo(productOrCategory) {
 const key = typeof productOrCategory === 'string' ? productOrCategory : (productOrCategory?.category || productOrCategory?.group || 'all');
 return CATEGORY_INFO[key] || (key === 'all' ? { key: 'col.all', title: 'col.all', href: '/collections' } : CATEGORY_INFO.accessories);
}
function familyMembers(product) {
 const item = typeof product === 'string' ? getProduct(product) : product;
 if (!item?.familyHandle) return item ? [item] : [];
 return PRODUCTS.filter((p) => p.familyHandle === item.familyHandle && p.publicVisible !== false)
 .sort((a, b) => (a.familyOrder || 50) - (b.familyOrder || 50));
}
function familyRepresentative(product) {
 const members = familyMembers(product);
 return members.find((p) => p.publicVisible !== false && isPublicProductImage(p.img)) || members[0] || product;
}
function getProduct(handle) {
 if (!handle) return null;
 return PRODUCT_MAP.get(handle) || PRODUCT_MAP.get(PRODUCT_ALIASES[handle]) || null;
}
function bagVariantFor(handle, colorSlug) {
 const normalized = normalizeSearch(colorSlug || '').replace(/ /g, '-');
 if (!handle || !normalized) return null;
 for (const row of BAG_ROWS) {
 const item = (row.items || []).find((entry) => {
 const itemSlug = normalizeSearch(entry.colorSlug || row.colorSlug || '').replace(/ /g, '-');
 return entry.handle === handle && itemSlug === normalized;
 });
 if (item) return { ...item, row };
 }
 return null;
}
function related(handle, limit = 4) {
 const product = getProduct(handle);
 if (!product) return publicProductList().slice(0, limit);
 const seen = new Set([product.handle]);
 const out = [];
 const add = (candidate) => {
 if (!candidate || seen.has(candidate.handle) || candidate.publicVisible === false || !isPublicProductImage(candidate.img)) return;
 seen.add(candidate.handle); out.push(candidate);
 };
 (product.crossSell || []).map(getProduct).forEach(add);
 publicProductList().filter((p) => p.category === product.category || p.group === product.group).forEach(add);
 publicProductList().forEach(add);
 return out.slice(0, limit);
}
function searchProducts(query, limit = 8, source = PRODUCTS) {
 const q = normalizeSearch(query);
 const list = publicProductList(source);
 if (!q) return list.slice(0, limit).map((product) => ({ product, score: 0 }));
 const tokens = q.split(/\s+/).filter(Boolean);
 const strictColorTerms = colorQueryTerms(q);
 const rows = list.map((product) => {
 const hay = searchHaystack(product);
 const visualHay = visualHaystack(product);
 if (strictColorTerms && !strictColorTerms.some((term) => visualHay.includes(normalizeSearch(term)))) return null;
 let score = 0;
 if (strictColorTerms && strictColorTerms.some((term) => visualHay.includes(normalizeSearch(term)))) score += 80;
 if (hay.includes(q)) score += 90;
 tokens.forEach((token) => {
 if (hay.includes(token)) score += 25;
 const words = hay.split(' ').filter(Boolean).slice(0, 160);
 const close = words.some((word) => word.length >= 3 && levenshtein(token, word) <= (token.length <= 4 ? 1 : 2));
 if (close) score += 10;
 });
 return { product, score };
 }).filter((row) => row && row.score > 0).sort((a, b) => b.score - a.score || a.product.price - b.product.price);
 return rows.slice(0, limit);
}
function bundleForProduct(handle) {
 const product = getProduct(handle);
 if (!product) return null;
 const picks = [];
 const add = (h) => { const p = getProduct(h); if (p && !picks.some((x) => x.handle === p.handle)) picks.push(p); };
 add(product.handle);
 if (product.category === 'bags') {
 add('raffia-orange-slice-charm-ss26'); add('yza-scarf-top-jawhara-ss26');
 } else if (product.group === 'rtw') {
 add(product.category === 'tops' ? 'yza-pareo-skirt-midi-jawhara-ss26' : 'yza-scarf-top-jawhara-ss26'); add('la-sculpture-xs-basket-bag-ss26');
 } else if (product.category === 'charms') {
 add('raffia-orange-slice-charm-ss26'); add('raffia-cherries-charm-ss26'); add('raffia-watermelon-slice-charm-ss26');
 } else if (product.category === 'earrings' || product.category === 'necklaces') {
 add('yza-scarf-top-jawhara-ss26'); add('la-sculpture-xs-basket-bag-ss26');
 } else {
 add('raffia-orange-slice-charm-ss26'); add('la-sculpture-xs-basket-bag-ss26');
 }
 const items = picks.slice(0, 3);
 if (items.length < 2) return null;
 const total = items.reduce((sum, item) => sum + item.price, 0);
 const noteByCategory = {
 charms: { fr: 'Cerises, tranche d\'orange et pastèque - trois fruits du marché de Marrakech, crochetés main à l\'atelier de Guéliz.', en: 'Cherries, orange slice and watermelon - three market fruits from Marrakech, hand-crocheted at the Guéliz atelier.' },
 bags: { fr: 'Le sac, un charm raffia et le haut foulard - les trois pièces pensées ensemble.', en: 'The bag, a raffia charm and the scarf top - three pieces designed together.' },
 rtw: { fr: 'Les deux pièces du look, plus le sac en raphia pour compléter la silhouette.', en: 'The two pieces of the look, plus the raffia bag to complete the silhouette.' },
 earrings: { fr: 'Le bijou, le haut foulard et le panier - trois pièces pour un look complet signé YZA.', en: 'The earrings, the scarf top and the basket - three pieces for a complete YZA look.' },
 necklaces:{ fr: 'Le bijou, le haut foulard et le panier - trois pièces pour un look complet signé YZA.', en: 'The necklace, the scarf top and the basket - three pieces for a complete YZA look.' },
 };
 const noteKey = product.category === 'charms' ? 'charms' : product.group === 'rtw' ? 'rtw' : product.category === 'bags' ? 'bags' : product.category === 'earrings' ? 'earrings' : product.category === 'necklaces' ? 'necklaces' : null;
 return {
 title: product.category === 'charms' ? { fr: 'Trio Fruit Market', en: 'Fruit Market trio' } : { fr: 'Set YZA coordonné', en: 'Coordinated YZA set' },
 note: noteKey ? noteByCategory[noteKey] : { fr: 'Trois pièces pensées ensemble.', en: 'Three pieces designed together.' },
 items,
 total,
 };
}
function offerPicks() {
 // Cross-category starter set. Avoid repeating any product/image already shown in the
 // home best-sellers (charms) grid, per the one-image-per-page rule.
 return ['la-sculpture-xs-basket-bag-ss26', 'yza-pareo-skirt-midi-jawhara-ss26', 'watermelon-raffia-earrings-ss26'].map(getProduct).filter(Boolean);
}

BAG_ROWS.forEach((row) => {
 const media = (row.gallery || [row.img]).filter(Boolean);
 (row.items || []).forEach((item, index) => {
 const primary = media[index % media.length] || item.img || row.img;
 item.img = primary;
 item.gallery = [primary];
 });
});

// --- Stage B: owner-approved premium pricing + internal-field protection ---
// Premium psychological anchors (see data/price-proposal.md). Values in MAD centimes.
const PREMIUM_PRICES = {
 'yza-scarf-top-jawhara-ss26': 35000,
 'yza-bateau-top-jawhara-ss26': 55000,
 'yza-button-up-shirt-jawhara-ss26': 89000,
 'yza-pareo-skirt-short-jawhara-ss26': 45000,
 'yza-pareo-skirt-midi-jawhara-ss26': 50000,
 'yza-pareo-skirt-long-jawhara-ss26': 59000,
 'yza-pareo-skirt-x-long-jawhara-ss26': 59000,
 'yza-palazzo-pants-jawhara-ss26': 75000,
 'yza-wrap-pants-jawhara-ss26': 99000,
 'la-sculpture-xs-basket-bag-ss26': 99000,
 'la-sculpture-s-basket-bag-ss26': 129000,
 'la-sculpture-m-basket-bag-ss26': 165000,
 'la-nouvelle-vague-xs-basket-bag-ss26': 99000,
 'la-nouvelle-vague-s-basket-bag-ss26': 129000,
 'la-nouvelle-vague-m-basket-bag-ss26': 165000,
 'raffia-cherries-charm-ss26': 10000,
 'raffia-grapes-charm-ss26': 19000,
 'raffia-whole-lemon-charm-ss26': 23000,
 'raffia-whole-orange-charm-ss26': 23000,
 'raffia-tomato-charm-ss26': 23000,
 'raffia-lemon-slice-charm-ss26': 19000,
 'raffia-orange-slice-charm-ss26': 19000,
 'raffia-kiwi-slice-charm-ss26': 19000,
 'raffia-watermelon-slice-charm-ss26': 19000,
 'raffia-avocado-half-charm-ss26': 19000,
 'watermelon-raffia-earrings-ss26': 45000,
 'kiwi-raffia-earrings-ss26': 45000,
 'lemon-raffia-earrings-ss26': 45000,
 'orange-raffia-earrings-ss26': 45000,
 'grapes-raffia-earrings-ss26': 45000,
 'cherries-raffia-earrings-ss26': 25000,
 'tomatoes-raffia-earrings-ss26': 50000,
 'lemon-slice-raffia-necklace-ss26': 26000,
 'orange-slice-raffia-necklace-ss26': 26000,
 'watermelon-slice-raffia-necklace-ss26': 26000,
 'grapes-raffia-necklace-ss26': 26000,
 'cherries-raffia-necklace-ss26': 17000,
};
// Internal channel/cost fields that must never ship on public pages (B2B page reads js/b2b-data.js instead).
const INTERNAL_PRICE_FIELDS = ['wholesale', 'wholesale_cents', 'stockist_retail_ttc', 'stockist_retail_ttc_cents', 'retailExact', 'cost_price_from_xlsx', 'old_lookbook_pdf_price'];
// 1) Apply premium prices.
PRODUCTS.forEach((p) => {
 if (Object.prototype.hasOwnProperty.call(PREMIUM_PRICES, p.handle)) p.price = PREMIUM_PRICES[p.handle];
 if (p.compareAt != null && p.compareAt <= p.price) p.compareAt = null;
});
// 2) Sync in-product size-comparison tables to the live price of the matching size in the same family.
PRODUCTS.forEach((p) => {
 if (!Array.isArray(p.sizeComparison) || !p.familyHandle) return;
 p.sizeComparison.forEach((row) => {
 const token = String((row.label && (row.label.en || row.label.fr)) || '').trim().split(/[\s/]+/)[0].toUpperCase();
 const sib = PRODUCTS.find((q) => q.familyHandle === p.familyHandle && (q.availableSizes || []).map((s) => String(s).toUpperCase()).includes(token));
 if (sib && sib.price != null) row.price = sib.price;
 });
});
// 2b) Size-comparison rows describe FIT per size, not colour - strip any fictional "/ Colour"
// suffix so a size is never tied to a single colourway (every size comes in every colour).
PRODUCTS.forEach((p) => {
 if (!Array.isArray(p.sizeComparison)) return;
 p.sizeComparison.forEach((row) => {
 if (row.label && typeof row.label === 'object') {
 Object.keys(row.label).forEach((lang) => {
 if (typeof row.label[lang] === 'string') row.label[lang] = row.label[lang].split('/')[0].trim();
 });
 }
 });
});
// 3) Keep color-first bag rows in sync with the live product price.
BAG_ROWS.forEach((row) => {
 (row.items || []).forEach((item) => {
 const prod = PRODUCT_MAP.get(item.handle);
 if (prod && prod.price != null) item.price = prod.price;
 });
});
// 4) Strip internal price fields from the public catalog.
PRODUCTS.forEach((p) => { INTERNAL_PRICE_FIELDS.forEach((f) => { delete p[f]; }); });

// 5) Fruit Market accessories: premium nano-banana 4K stills (referenced from the real
// raffia-fruits linesheet), one distinct image per product (charm loop / earring hoop / necklace chain).
const ACCESSORY_IMAGES = {
 'raffia-cherries-charm-ss26': 'assets/products/fruit-market/charm-cherries.jpg',
 'raffia-grapes-charm-ss26': 'assets/products/fruit-market/charm-grapes.jpg',
 'raffia-whole-orange-charm-ss26': 'assets/products/fruit-market/charm-whole-orange.jpg',
 'raffia-whole-lemon-charm-ss26': 'assets/products/fruit-market/charm-whole-lemon.jpg',
 'raffia-tomato-charm-ss26': 'assets/products/fruit-market/charm-tomato.jpg',
 'raffia-lemon-slice-charm-ss26': 'assets/products/fruit-market/charm-lemon-slice.jpg',
 'raffia-orange-slice-charm-ss26': 'assets/products/fruit-market/charm-orange-slice.jpg',
 'raffia-kiwi-slice-charm-ss26': 'assets/products/fruit-market/charm-kiwi-slice.jpg',
 'raffia-watermelon-slice-charm-ss26': 'assets/products/fruit-market/charm-watermelon-slice.jpg',
 'raffia-avocado-half-charm-ss26': 'assets/products/fruit-market/charm-avocado.jpg',
 'watermelon-raffia-earrings-ss26': 'assets/products/fruit-market/earrings-watermelon.jpg',
 'kiwi-raffia-earrings-ss26': 'assets/products/fruit-market/earrings-kiwi.jpg',
 'lemon-raffia-earrings-ss26': 'assets/products/fruit-market/earrings-lemon.jpg',
 'orange-raffia-earrings-ss26': 'assets/products/fruit-market/earrings-orange.jpg',
 'grapes-raffia-earrings-ss26': 'assets/products/fruit-market/earrings-grapes.jpg',
 'cherries-raffia-earrings-ss26': 'assets/products/fruit-market/earrings-cherries.jpg',
 'tomatoes-raffia-earrings-ss26': 'assets/products/fruit-market/earrings-tomato.jpg',
 'lemon-slice-raffia-necklace-ss26': 'assets/products/fruit-market/necklace-lemon-slice.jpg',
 'orange-slice-raffia-necklace-ss26': 'assets/products/fruit-market/necklace-orange-slice.jpg',
 'watermelon-slice-raffia-necklace-ss26': 'assets/products/fruit-market/necklace-watermelon-slice.jpg',
 'grapes-raffia-necklace-ss26': 'assets/products/fruit-market/necklace-grapes.jpg',
 'cherries-raffia-necklace-ss26': 'assets/products/fruit-market/necklace-cherries.jpg',
 // La Sculpture base-product cards (home / search / cart) - real playbook stills per colour identity.
 'la-sculpture-xs-basket-bag-ss26': 'assets/products/launch-shop-ref/la-sculpture-xs-hot-red.jpg',
 'la-sculpture-s-basket-bag-ss26': 'assets/products/launch-shop-ref/la-sculpture-s-deep-violet.jpg',
 'la-sculpture-m-basket-bag-ss26': 'assets/products/launch-shop-ref/la-sculpture-m-black-olive.jpg',
 // La Vague / La Vaguelette - real photography per colourway (re-set below by the La Vague block).
 'la-nouvelle-vague-xs-basket-bag-ss26': 'assets/products/la-vague/lv-black-xs.jpg',
 'la-nouvelle-vague-s-basket-bag-ss26': 'assets/products/la-vague/lv-nude-s.jpg',
 'la-nouvelle-vague-m-basket-bag-ss26': 'assets/products/la-vague/lv-black-m.jpg',
 // Jawhara RTW - real photography (client shoot + SS26 lookbook). Replaces the former
 // AI 'rtw-clean' nano-banana stills. These heroes are also the first entry in PRODUCT_MEDIA.
 'yza-scarf-top-jawhara-ss26': 'assets/lookbook-ss26-27/embedded/p33_img02_xref1247_4e3188b3ffc2.jpeg',
 'yza-bateau-top-jawhara-ss26': 'assets/lookbook-ss26-27/embedded/p30_img01_xref1219_8b2d1136309d.jpeg',
 'yza-button-up-shirt-jawhara-ss26': 'assets/lookbook-ss26-27/embedded/p29_img02_xref1213_fe747a323e9f.jpeg',
 'yza-pareo-skirt-short-jawhara-ss26': 'assets/lookbook-ss26-27/embedded/p29_img04_xref1215_ea0a78123e7b.jpeg',
 'yza-pareo-skirt-midi-jawhara-ss26': 'assets/lookbook-ss26-27/embedded/p30_img02_xref1220_f762d6e64853.jpeg',
 'yza-pareo-skirt-long-jawhara-ss26': 'assets/lookbook-ss26-27/embedded/p29_img03_xref1214_6b93fb974a48.jpeg',
 'yza-pareo-skirt-x-long-jawhara-ss26': 'assets/lookbook-ss26-27/embedded/p38_img01_xref1287_56cb4d596aa0.jpeg',
 'yza-palazzo-pants-jawhara-ss26': 'assets/products/jawhara/client/palazzo-02.jpg',
 'yza-wrap-pants-jawhara-ss26': 'assets/products/jawhara/client/palazzo-01.jpg',
};
PRODUCTS.forEach((p) => {
 const src = ACCESSORY_IMAGES[p.handle];
 if (src) {
 p.img = src;
 const lifestyleExtra = (p.gallery || []).filter(x => x.includes('/lifestyle/'));
 p.gallery = [src, ...lifestyleExtra];
 }
});

// Per-product "in-use / vibe" hover image (charm styled on a raffia bag, sunny close-up). Shown on card hover.
const HOVER_IMAGES = {
 'raffia-cherries-charm-ss26': 'assets/original-shop/charms/raffia-cherries-charm-ss26-01.png',
 'raffia-grapes-charm-ss26': 'assets/products/fruit-market/vibe/vibe-grapes.jpg',
 'raffia-whole-orange-charm-ss26': 'assets/products/fruit-market/vibe/vibe-whole-orange.jpg',
 'raffia-whole-lemon-charm-ss26': 'assets/products/fruit-market/vibe/vibe-whole-lemon.jpg',
 'raffia-tomato-charm-ss26': 'assets/products/fruit-market/vibe/vibe-tomato.jpg',
 'raffia-lemon-slice-charm-ss26': 'assets/products/fruit-market/vibe/vibe-lemon-slice.jpg',
 'raffia-orange-slice-charm-ss26': 'assets/products/fruit-market/vibe/vibe-orange-slice.jpg',
 'raffia-kiwi-slice-charm-ss26': 'assets/products/fruit-market/vibe/vibe-kiwi-slice.jpg',
 'raffia-watermelon-slice-charm-ss26': 'assets/products/fruit-market/vibe/vibe-watermelon-slice.jpg',
 'raffia-avocado-half-charm-ss26': 'assets/products/fruit-market/vibe/vibe-avocado.jpg',
 // Earrings - worn-on-model hover (5 lookbook, 2 AI-generated portraits)
 'lemon-raffia-earrings-ss26': 'assets/lookbook-ss26-27/embedded/p53_img01_xref1380_788fc851111b.jpeg',
 'grapes-raffia-earrings-ss26': 'assets/lookbook-ss26-27/embedded/p55_img01_xref1397_f3009f829bf8.jpeg',
 'tomatoes-raffia-earrings-ss26': 'assets/lookbook-ss26-27/embedded/p56_img02_xref1402_2ffff76a0151.jpeg',
 'orange-raffia-earrings-ss26': 'assets/lookbook-ss26-27/embedded/p56_img03_xref1403_fde2f9db3673.jpeg',
 'watermelon-raffia-earrings-ss26': 'assets/products/fruit-market/vibe/vibe-watermelon-earrings.jpg',
 'kiwi-raffia-earrings-ss26': 'assets/products/fruit-market/vibe/vibe-kiwi-earrings.jpg',
 'cherries-raffia-earrings-ss26': 'assets/products/fruit-market/vibe/vibe-cherries-earrings.jpg',
 // Necklaces - worn-on-model hover (1 lookbook, 4 AI-generated portraits)
 'grapes-raffia-necklace-ss26': 'assets/lookbook-ss26-27/embedded/p57_img03_xref1410_1be99390666d.jpeg',
 'lemon-slice-raffia-necklace-ss26': 'assets/products/fruit-market/vibe/vibe-lemon-slice-necklace.jpg',
 'orange-slice-raffia-necklace-ss26': 'assets/products/fruit-market/vibe/vibe-orange-slice-necklace.jpg',
 'watermelon-slice-raffia-necklace-ss26': 'assets/products/fruit-market/vibe/vibe-watermelon-slice-necklace.jpg',
 'cherries-raffia-necklace-ss26': 'assets/products/fruit-market/vibe/vibe-cherries-necklace.jpg',
};
PRODUCTS.forEach((p) => { if (HOVER_IMAGES[p.handle]) p.hoverImg = HOVER_IMAGES[p.handle]; });

// 6) Unified bag colour NAMES across La Sculpture + La Vague (Deep Violet / Hot Red / Black Olive).
// Renames display strings only; colorSlug (used for variant URLs) is left untouched.
const BAG_COLOR_RE = /\b(Bleu ciel|Sky blue|Rouge|Red|Violet|Noir|Black|Bleu|Blue|Rose|Pink)\b/gi;
const BAG_COLOR_MAP = { 'Rouge': 'Hot Red', 'Red': 'Hot Red', 'Rose': 'Hot Red', 'Pink': 'Hot Red', 'Violet': 'Deep Violet', 'Bleu': 'Deep Violet', 'Blue': 'Deep Violet', 'Noir': 'Black Olive', 'Black': 'Black Olive', 'Bleu ciel': 'Black Olive', 'Sky blue': 'Black Olive' };
const BAG_COLOR_MAP_LC = Object.fromEntries(Object.entries(BAG_COLOR_MAP).map(([k, v]) => [k.toLowerCase(), v]));
const reColorStr = (s) => (typeof s === 'string' ? s.replace(BAG_COLOR_RE, (m) => BAG_COLOR_MAP_LC[m.toLowerCase()] || m) : s);
const reColorObj = (o) => { if (o && typeof o === 'object') for (const k of Object.keys(o)) o[k] = reColorStr(o[k]); return o; };
function normalizeBagColours(entry) {
 ['variantLabel', 'color'].forEach((f) => { if (entry[f]) reColorObj(entry[f]); });
 ['name', 'displayName', 'short', 'displayShort', 'desc', 'title', 'rowTitle'].forEach((f) => { if (entry[f]) reColorObj(entry[f]); });
 if (Array.isArray(entry.availableColors)) entry.availableColors.forEach(reColorObj);
}
PRODUCTS.forEach((p) => { if (p.category === 'bags' || p.group === 'bags') normalizeBagColours(p); });
BAG_ROWS.forEach((row) => { normalizeBagColours(row); (row.items || []).forEach(normalizeBagColours); });

// --- La Vague / La Vaguelette: handwoven raffia totes, reconciled to the REAL catalogue. ---
// Real colourways from the @yzahandmade catalogue: La Vague - Black & Nude; La Vaguelette - Camel
// (the mini silhouette). Product handles stay "la-nouvelle-vague-*" (legacy keys shared with
// js/b2b-data.js + blog URLs - renaming them would break pricing + links); only the customer-facing
// name, colourways and imagery are reconciled to the real line. This matches js/media.js, which
// already calls these bags "La Vague". All imagery is real photography from the brand's own posts.
const L5 = (fr, en) => ({ fr: fr, en: en, es: en, tr: en, ar: en });
const LNV_DIR = 'assets/products/la-vague/';
const lnvImg = (slug, size) => `${LNV_DIR}lv-${slug}-${String(size).toLowerCase()}.jpg`;
// `line` carries the real family name per colourway (Camel is the La Vaguelette mini).
const LNV_COLORS = [
 { slug: 'black', fr: 'Noir', en: 'Black', es: 'Negro', tr: 'Siyah', ar: 'أسود', line: 'La Nouvelle Vague' },
 { slug: 'nude', fr: 'Nude', en: 'Nude', es: 'Nude', tr: 'Nude', ar: 'نود', line: 'La Nouvelle Vague' },
 // 'camel' removed: its images (lv-camel-*) were a different bag (a square scalloped tote),
 // not La Nouvelle Vague. Re-add only with real camel photos of the actual bag.
];
const LNV_SIZES = [
 { size: 'XS', handle: 'la-nouvelle-vague-xs-basket-bag-ss26' },
 { size: 'S', handle: 'la-nouvelle-vague-s-basket-bag-ss26' },
 { size: 'M', handle: 'la-nouvelle-vague-m-basket-bag-ss26' },
];
// Per-colourway galleries so each colour shows ITS OWN photos on the PDP (previously
// every colour fell back to the black-first base media). Black = full client shoot;
// Nude = client XS shots + real stills for S/M.
const LNV_GALLERY = {
 black: {
 XS: [
 { type: 'image', src: 'assets/products/la-vague/client/black-xs-01.jpg' },
 { type: 'image', src: 'assets/products/la-vague/client/black-xs-02.jpg' },
 { type: 'image', src: 'assets/products/la-vague/client/black-xs-03.jpg' },
 { type: 'video', src: 'assets/lifestyle/bags/vague-3e649f7c202b.mp4', poster: 'assets/lifestyle/bags/vague-3e649f7c202b-poster.jpg' },
 ],
 S: [
 { type: 'image', src: 'assets/products/la-vague/client/black-s-01.jpg' },
 { type: 'image', src: 'assets/products/la-vague/client/black-s-02.jpg' },
 { type: 'image', src: 'assets/products/la-vague/client/black-s-03.jpg' },
 { type: 'image', src: 'assets/products/la-vague/client/black-s-04.jpg' },
 { type: 'image', src: 'assets/products/la-vague/client/black-s-05.jpg' },
 { type: 'image', src: 'assets/products/la-vague/client/black-s-06.jpg' },
 ],
 M: [
 { type: 'image', src: 'assets/products/la-vague/client/black-m-01.jpg' },
 { type: 'image', src: 'assets/products/la-vague/client/black-m-02.jpg' },
 { type: 'image', src: 'assets/products/la-vague/client/black-m-03.jpg' },
 { type: 'image', src: 'assets/products/la-vague/client/black-m-04.jpg' },
 { type: 'image', src: 'assets/products/la-vague/client/black-m-05.jpg' },
 ],
 },
 nude: {
 XS: [
 { type: 'image', src: 'assets/products/la-vague/client/nude-xs-01.jpg' },
 { type: 'image', src: 'assets/products/la-vague/client/nude-xs-02.jpg' },
 { type: 'image', src: 'assets/products/la-vague/client/nude-xs-03.jpg' },
 ],
 S: [{ type: 'image', src: 'assets/products/la-vague/lv-nude-s.jpg' }],
 M: [{ type: 'image', src: 'assets/products/la-vague/lv-nude-m.jpg' }],
 },
};
// Preserve Batch-B es/tr/ar translations when only fr/en are provided.
const _merge = (fr, en, prev) => {
  var es = (prev && prev.es && prev.es !== prev.en) ? prev.es : en;
  var tr = (prev && prev.tr && prev.tr !== prev.en) ? prev.tr : en;
  var ar = (prev && prev.ar && prev.ar !== prev.en) ? prev.ar : en;
  return { fr: fr, en: en, es: es, tr: tr, ar: ar };
};
LNV_SIZES.forEach((sz, i) => {
 const p = PRODUCT_MAP.get(sz.handle);
 if (!p) return;
 p.name = L5('La Nouvelle Vague ' + sz.size, 'La Nouvelle Vague ' + sz.size);
 p.displayName = L5('La Nouvelle Vague ' + sz.size, 'La Nouvelle Vague ' + sz.size);
 p.short = _merge(
 'Format ' + sz.size + ', raphia tissé main et cuir.',
 sz.size + ' scale, handwoven raffia and leather.',
 p.short
 );
 p.displayShort = _merge(
 'Format ' + sz.size + ', raphia tissé main et cuir.',
 sz.size + ' scale, handwoven raffia and leather.',
 p.displayShort
 );
 p.desc = _merge(
 'La Vague ' + sz.size + ' : un panier en raphia tissé main dans notre atelier de Marrakech, finition cuir - proposé en Noir, Nude et Camel.',
 'La Vague ' + sz.size + ': a raffia basket bag handwoven in our Marrakech atelier with a leather finish - offered in Black, Nude and Camel.',
 p.desc
 );
 p.color = L5(LNV_COLORS[0].fr, LNV_COLORS[0].en);
 p.visualColor = null;
 p.availableColors = LNV_COLORS.map((c) => L5(c.fr, c.en));
 p.availableSizes = ['XS', 'S', 'M'];
 // Base card: one real colourway per size for visual variety (no image reused on a page).
 const baseColor = LNV_COLORS[i % LNV_COLORS.length].slug;
 p.img = lnvImg(baseColor, sz.size);
 p.gallery = LNV_COLORS.map((c) => lnvImg(c.slug, sz.size));
 p.hoverImg = lnvImg(LNV_COLORS[(i + 1) % LNV_COLORS.length].slug, sz.size);
 p.launchPromo = false;
 delete p.madeToOrder;
});
for (let i = BAG_ROWS.length - 1; i >= 0; i--) { if (BAG_ROWS[i].familyHandle === 'la-nouvelle-vague') BAG_ROWS.splice(i, 1); }
LNV_COLORS.forEach((c) => {
 BAG_ROWS.push({
 familyHandle: 'la-nouvelle-vague',
 familyTitle: L5('La Nouvelle Vague', 'La Nouvelle Vague'),
 familyEyebrow: L5('Feuilles de bananier · Cuir · Perles', 'Banana leaves · Leather · Beads'),
 familyText: L5("Choisissez d'abord la couleur, puis la taille. Chaque lien vous dirige vers le bon sac.", 'Choose the colour first, then the size. Each link opens the right bag page.'),
 rowTitle: { fr: c.line + ' · ' + c.fr, en: c.line + ' · ' + c.en, es: c.line + ' · ' + c.es, tr: c.line + ' · ' + c.tr, ar: c.line + ' · ' + c.ar },
 color: { fr: c.fr, en: c.en, es: c.es, tr: c.tr, ar: c.ar },
 colorSlug: c.slug,
 img: lnvImg(c.slug, 's'),
 gallery: LNV_SIZES.map((sz) => lnvImg(c.slug, sz.size)),
 items: LNV_SIZES.map((sz) => {
 const prod = PRODUCT_MAP.get(sz.handle);
 const media = (LNV_GALLERY[c.slug] && LNV_GALLERY[c.slug][sz.size]) || [{ type: 'image', src: lnvImg(c.slug, sz.size) }];
 const gal = media.filter((m) => m.type === 'image').map((m) => m.src);
 return {
 handle: sz.handle,
 size: sz.size,
 color: { fr: c.fr, en: c.en, es: c.es, tr: c.tr, ar: c.ar },
 colorSlug: c.slug,
 title: { fr: c.line + ' ' + sz.size + ' · ' + c.fr, en: c.line + ' ' + sz.size + ' · ' + c.en, es: c.line + ' ' + sz.size + ' · ' + c.es, tr: c.line + ' ' + sz.size + ' · ' + c.tr, ar: c.line + ' ' + sz.size + ' · ' + c.ar },
 short: { fr: 'Format ' + sz.size + ', couleur ' + c.fr + '.', en: sz.size + ' scale, ' + c.en + '.', es: 'Talla ' + sz.size + ', color ' + c.es + '.', tr: sz.size + ' beden, ' + c.tr + ' renk.', ar: 'مقاس ' + sz.size + '، لون ' + c.ar + '.' },
 price: prod ? prod.price : null,
 img: gal[0],
 gallery: gal,
 media: media,
 url: '/produits/' + sz.handle + '?color=' + c.slug,
 };
 }),
 });
});

// La Sculpture: each colour-row size card uses its size-specific still (XS/S/M differ via fruit-scale references).
const SCULPT_COLOR_FILE = { noir: 'black-olive', rouge: 'hot-red', violet: 'deep-violet' };
// Real angle + situation shots per colourway, appended after the size card on the product page.
const SCULPT_ANGLES = {
 noir: ['assets/products/bag-sculpture-black.jpg', 'assets/products/bag-sculpture-black-detail.jpg', 'assets/products/bag-sculpture-black-still.jpg'],
 rouge: ['assets/products/bag-sculpture-red.jpg', 'assets/products/bag-sculpture-red-seated.jpg', 'assets/products/bag-sculpture-red-detail.jpg', 'assets/products/bag-sculpture-red-still.jpg'],
 violet: ['assets/products/bag-sculpture-violet.jpg', 'assets/products/bag-sculpture-violet-stack.jpg'],
};
const SCULPT_LAUNCH_DIR = 'assets/products/launch-shop-ref/';
const sculptLaunchImg = (color, size) => `${SCULPT_LAUNCH_DIR}la-sculpture-${String(size).toLowerCase()}-${color}.jpg`;
// Real client product media (downloaded from yza-shop.com) per colourway + size, in the
// brand's own display order (images + videos interleaved). Drives the product gallery so
// each La Sculpture page mirrors the live shop. Falls back to launch-ref stills if absent.
const SCULPT_MEDIA = {
  rouge: {
    xs: [
      { type: 'image', src: 'assets/products/la-sculpture/client/rouge-xs-01.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/rouge-xs-02.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/rouge-xs-03.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-0ddacc88bf0e.mp4', poster: 'assets/lifestyle/bags/sculpt-0ddacc88bf0e-poster.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/rouge-xs-04.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/rouge-xs-05.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/rouge-xs-06.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-96c4de8f62d8.mp4', poster: 'assets/lifestyle/bags/sculpt-96c4de8f62d8-poster.jpg' },
    ],
    s: [
      { type: 'image', src: 'assets/products/la-sculpture/client/rouge-s-01.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/rouge-s-02.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/rouge-s-03.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/rouge-s-04.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-9e0be019838c.mp4', poster: 'assets/lifestyle/bags/sculpt-9e0be019838c-poster.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/rouge-s-05.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-c364378af353.mp4', poster: 'assets/lifestyle/bags/sculpt-c364378af353-poster.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/rouge-s-06.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-db3e01c697d6.mp4', poster: 'assets/lifestyle/bags/sculpt-db3e01c697d6-poster.jpg' },
    ],
    m: [
      { type: 'image', src: 'assets/products/la-sculpture/client/rouge-m-01.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/rouge-m-02.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/rouge-m-03.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-fb5882a2b09a.mp4', poster: 'assets/lifestyle/bags/sculpt-fb5882a2b09a-poster.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/rouge-m-04.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/rouge-m-05.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-81e047c7187b.mp4', poster: 'assets/lifestyle/bags/sculpt-81e047c7187b-poster.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-00e7fdbabe4c.mp4', poster: 'assets/lifestyle/bags/sculpt-00e7fdbabe4c-poster.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-68a448af9a8f.mp4', poster: 'assets/lifestyle/bags/sculpt-68a448af9a8f-poster.jpg' },
    ],
  },
  violet: {
    xs: [
      { type: 'image', src: 'assets/products/la-sculpture/client/violet-xs-01.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/violet-xs-02.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/violet-xs-03.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/violet-xs-04.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/violet-xs-05.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-8b72ff737263.mp4', poster: 'assets/lifestyle/bags/sculpt-8b72ff737263-poster.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-9111447ff8ee.mp4', poster: 'assets/lifestyle/bags/sculpt-9111447ff8ee-poster.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-0822a661c6da.mp4', poster: 'assets/lifestyle/bags/sculpt-0822a661c6da-poster.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-ac10c7a24b8a.mp4', poster: 'assets/lifestyle/bags/sculpt-ac10c7a24b8a-poster.jpg' },
    ],
    s: [
      { type: 'image', src: 'assets/products/la-sculpture/client/violet-s-01.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/violet-s-02.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/violet-s-03.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/violet-s-04.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/violet-s-05.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-c89e10dfa2c1.mp4', poster: 'assets/lifestyle/bags/sculpt-c89e10dfa2c1-poster.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/violet-s-06.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-9ce9dfc2c755.mp4', poster: 'assets/lifestyle/bags/sculpt-9ce9dfc2c755-poster.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-79d964b70e17.mp4', poster: 'assets/lifestyle/bags/sculpt-79d964b70e17-poster.jpg' },
    ],
    m: [
      { type: 'image', src: 'assets/products/la-sculpture/client/violet-m-01.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/violet-m-02.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/violet-m-03.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-d6a04c707ca9.mp4', poster: 'assets/lifestyle/bags/sculpt-d6a04c707ca9-poster.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/violet-m-04.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/violet-m-05.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/violet-m-06.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-900417588600.mp4', poster: 'assets/lifestyle/bags/sculpt-900417588600-poster.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/violet-m-07.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-ad7ef6541720.mp4', poster: 'assets/lifestyle/bags/sculpt-ad7ef6541720-poster.jpg' },
    ],
  },
  noir: {
    xs: [
      { type: 'image', src: 'assets/products/la-sculpture/client/noir-xs-01.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/noir-xs-02.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/noir-xs-03.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/noir-xs-04.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/noir-xs-05.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/noir-xs-06.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/noir-xs-07.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-ac10c7a24b8a.mp4', poster: 'assets/lifestyle/bags/sculpt-ac10c7a24b8a-poster.jpg' },
    ],
    s: [
      { type: 'image', src: 'assets/products/la-sculpture/client/noir-s-01.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/noir-s-02.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/noir-s-03.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-9bfeffb491ae.mp4', poster: 'assets/lifestyle/bags/sculpt-9bfeffb491ae-poster.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/noir-s-04.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/noir-s-05.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-9afd0b29e5b8.mp4', poster: 'assets/lifestyle/bags/sculpt-9afd0b29e5b8-poster.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-79d964b70e17.mp4', poster: 'assets/lifestyle/bags/sculpt-79d964b70e17-poster.jpg' },
    ],
    m: [
      { type: 'image', src: 'assets/products/la-sculpture/client/noir-m-01.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/noir-m-02.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/noir-m-03.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/noir-m-04.jpg' },
      { type: 'image', src: 'assets/products/la-sculpture/client/noir-m-05.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-9bfeffb491ae.mp4', poster: 'assets/lifestyle/bags/sculpt-9bfeffb491ae-poster.jpg' },
      { type: 'video', src: 'assets/lifestyle/bags/sculpt-ad7ef6541720.mp4', poster: 'assets/lifestyle/bags/sculpt-ad7ef6541720-poster.jpg' },
    ],
  },
};
// Per-variant dimension overrides where the client size differs from the size default
// (the Deep Violet M is woven larger than the red/black M). Localised; carried onto the
// colour view via bagViewProduct, so the bullet shows the real measurement per variant.
const SCULPT_DIM_OVERRIDE = {
 'violet-m': {
 fr: 'Le plus grand format en Deep Violet, plus généreux encore. Dimensions : 44 × 38 × 18 cm.',
 en: 'The largest size in Deep Violet, more generous still. Dimensions: 44 × 38 × 18 cm.',
 es: 'La talla más grande en Deep Violet, aún más amplia. Dimensiones: 44 × 38 × 18 cm.',
 tr: 'Deep Violet renginde en büyük beden, daha da geniş. Ölçüler: 44 × 38 × 18 cm.',
 ar: 'أكبر مقاس بلون Deep Violet، أكثر سعة. الأبعاد: 44 × 38 × 18 سم.',
 },
};
BAG_ROWS.forEach((row) => {
 if (row.familyHandle !== 'la-sculpture') return;
 const cf = SCULPT_COLOR_FILE[row.colorSlug];
 if (!cf) return;
 (row.items || []).forEach((it) => {
 const sz = String(it.size || '').toLowerCase();
 const dimOver = SCULPT_DIM_OVERRIDE[row.colorSlug + '-' + sz];
 if (dimOver) it.dimensions = dimOver;
 const media = (SCULPT_MEDIA[row.colorSlug] || {})[sz];
 if (media && media.length) {
 it.media = media;
 it.gallery = media.filter((m) => m.type === 'image').map((m) => m.src);
 it.img = it.gallery[0] || sculptLaunchImg(cf, sz);
 } else {
 const img = sculptLaunchImg(cf, sz);
 it.img = img; it.gallery = [img, ...(SCULPT_ANGLES[row.colorSlug] || [])];
 }
 });
 const rowMedia = (SCULPT_MEDIA[row.colorSlug] || {}).s;
 const rowImg = ((rowMedia || []).filter((m) => m.type === 'image')[0] || {}).src;
 row.img = rowImg || sculptLaunchImg(cf, 's');
 row.gallery = [row.img];
});

// La Sculpture: de-couple each size from a single colourway. Every XS/S/M is woven in all three
// real finishes (Hot Red · Deep Violet · Black Olive), so the per-size product no longer carries a
// colour in its name/short/desc - mirrors the La Vague reconciliation above and the real catalogue.
// Display strings only; handles, variants, availableColors and the color-first BAG_ROWS are untouched.
const SCULPT_SIZE_COPY = [
 { handle: 'la-sculpture-xs-basket-bag-ss26', size: 'XS', fr: 'le plus petit', en: 'the smallest' },
 { handle: 'la-sculpture-s-basket-bag-ss26', size: 'S', fr: 'le format intermédiaire', en: 'the mid-size' },
 { handle: 'la-sculpture-m-basket-bag-ss26', size: 'M', fr: 'le plus grand', en: 'the largest' },
];
SCULPT_SIZE_COPY.forEach((s) => {
 const p = PRODUCT_MAP.get(s.handle);
 if (!p) return;
 p.name = L5('La Sculpture ' + s.size, 'La Sculpture ' + s.size);
 p.displayName = L5('La Sculpture ' + s.size, 'La Sculpture ' + s.size);
 p.short = _merge(
 'Format ' + s.size + ', tissé main en feuilles de bananier, raphia, cuir et perles.',
 s.size + ' scale, handwoven in banana leaves, raffia, leather and beads.',
 p.short
 );
 p.displayShort = _merge(
 'Format ' + s.size + ', tissé main en feuilles de bananier, raphia, cuir et perles.',
 s.size + ' scale, handwoven in banana leaves, raffia, leather and beads.',
 p.displayShort
 );
 p.desc = _merge(
 'La Sculpture ' + s.size + ' : ' + s.fr + ' de nos paniers sculpturaux, tissé main à Marrakech en feuilles de bananier, raphia, cuir et perles. Disponible en Hot Red, Deep Violet et Black Olive.',
 'La Sculpture ' + s.size + ': ' + s.en + ' of our sculptural baskets, handwoven in Marrakech from banana leaves, raffia, leather and beads. Available in Hot Red, Deep Violet and Black Olive.',
 p.desc
 );
 // Size-comparison cards first (XS/S/M to scale), then real angle + situation shots
 // of La Sculpture so the product page shows the bag from several views, not just the cards.
 const gallery = ['hot-red', 'deep-violet', 'black-olive'].map((color) => sculptLaunchImg(color, s.size))
 .concat(['assets/products/bag-sculpture-violet-stack.jpg', 'assets/products/bag-sculpture-black-detail.jpg', 'assets/products/bag-sculpture-red-seated.jpg', 'assets/products/bag-sculpture-group.jpg']);
 p.gallery = gallery;
 p.img = s.size === 'S' ? gallery[1] : s.size === 'M' ? gallery[2] : gallery[0];
});

// ============================================================
// Client media parity (charms + palazzo + La Nouvelle Vague).
// Real photography and product videos harvested from the client's
// live store (yza-shop.com), shown in the same ordered multi-image +
// inline-video gallery as La Sculpture. Cluster/wrong-product shots
// and the generic "BAG CHARMS" banner video were dropped; a few weak
// hero shots were re-shot via Higgsfield image-to-image (product kept
// identical, photography only). Sets p.media (ordered), p.gallery
// (image-only) and p.img (first image). Runs after the size/colour
// reconciliations and before PERSONA_COPY (which never touches media).
// ============================================================
const PRODUCT_MEDIA = {
  'raffia-avocado-half-charm-ss26': [
    { type: 'image', src: 'assets/products/charms/client/avocado-half-01.jpg' },
    { type: 'image', src: 'assets/products/charms/client/avocado-half-02.jpg' },
    { type: 'video', src: 'assets/lifestyle/charms/charm-d08f3acaf82b.mp4', poster: 'assets/lifestyle/charms/charm-d08f3acaf82b-poster.jpg' },
  ],
  'raffia-tomato-charm-ss26': [
    { type: 'image', src: 'assets/products/charms/client/tomato-01.jpg' },
    { type: 'image', src: 'assets/products/charms/client/tomato-02.jpg' },
    { type: 'video', src: 'assets/lifestyle/charms/charm-075e4ebee205.mp4', poster: 'assets/lifestyle/charms/charm-075e4ebee205-poster.jpg' },
  ],
  'raffia-whole-lemon-charm-ss26': [
    { type: 'image', src: 'assets/products/charms/client/whole-lemon-01.jpg' },
    { type: 'image', src: 'assets/products/charms/client/whole-lemon-02.jpg' },
    { type: 'video', src: 'assets/lifestyle/charms/charm-72452055e49d.mp4', poster: 'assets/lifestyle/charms/charm-72452055e49d-poster.jpg' },
  ],
  'raffia-whole-orange-charm-ss26': [
    { type: 'image', src: 'assets/products/charms/client/whole-orange-01.jpg' },
    { type: 'image', src: 'assets/products/charms/client/whole-orange-02.jpg' },
    { type: 'video', src: 'assets/lifestyle/charms/charm-dcf1596e0299.mp4', poster: 'assets/lifestyle/charms/charm-dcf1596e0299-poster.jpg' },
  ],
  'raffia-cherries-charm-ss26': [
    { type: 'image', src: 'assets/products/fruit-market/charm-cherries.jpg' },
    { type: 'image', src: 'assets/products/charms/client/cherries-02.jpg' },
    { type: 'video', src: 'assets/lifestyle/charms/charm-c5fb0ffd41ab.mp4', poster: 'assets/lifestyle/charms/charm-c5fb0ffd41ab-poster.jpg' },
  ],
  'raffia-grapes-charm-ss26': [
    { type: 'image', src: 'assets/products/charms/client/grapes-01.jpg' },
    { type: 'image', src: 'assets/products/charms/client/grapes-02.jpg' },
    { type: 'video', src: 'assets/lifestyle/charms/charm-a7c647c95af5.mp4', poster: 'assets/lifestyle/charms/charm-a7c647c95af5-poster.jpg' },
  ],
  'raffia-lemon-slice-charm-ss26': [
    { type: 'image', src: 'assets/products/charms/client/lemon-slice-01.jpg' },
    { type: 'video', src: 'assets/lifestyle/charms/charm-f09995fb69e4.mp4', poster: 'assets/lifestyle/charms/charm-f09995fb69e4-poster.jpg' },
  ],
  'raffia-orange-slice-charm-ss26': [
    { type: 'image', src: 'assets/products/charms/client/orange-slice-01.jpg' },
    { type: 'image', src: 'assets/products/charms/client/orange-slice-02.jpg' },
    { type: 'image', src: 'assets/products/charms/client/orange-slice-04.jpg' },
    { type: 'image', src: 'assets/products/charms/client/orange-slice-05.jpg' },
    { type: 'video', src: 'assets/lifestyle/charms/charm-242b97edd7d8.mp4', poster: 'assets/lifestyle/charms/charm-242b97edd7d8-poster.jpg' },
  ],
  'raffia-kiwi-slice-charm-ss26': [
    { type: 'image', src: 'assets/products/charms/client/kiwi-slice-01.jpg' },
    { type: 'image', src: 'assets/products/charms/client/kiwi-slice-02.jpg' },
    { type: 'video', src: 'assets/lifestyle/charms/charm-1019b2c088a4.mp4', poster: 'assets/lifestyle/charms/charm-1019b2c088a4-poster.jpg' },
  ],
  'raffia-watermelon-slice-charm-ss26': [
    { type: 'image', src: 'assets/products/charms/client/watermelon-slice-01.jpg' },
    { type: 'image', src: 'assets/products/charms/client/watermelon-slice-03.jpg' },
    { type: 'image', src: 'assets/products/charms/client/watermelon-slice-04.jpg' },
    { type: 'video', src: 'assets/lifestyle/charms/charm-922dd93c197c.mp4', poster: 'assets/lifestyle/charms/charm-922dd93c197c-poster.jpg' },
  ],
  // Ready-to-wear: real Jawhara photography from the client shoot + SS26 lookbook
  // (replaces the original AI/stock 'rtw-clean' placeholders, which showed wrong
  // fabrics/colourways and none of the signature gold tassels or Berber signs).
  'yza-scarf-top-jawhara-ss26': [
    { type: 'image', src: 'assets/lookbook-ss26-27/embedded/p33_img02_xref1247_4e3188b3ffc2.jpeg' },
    { type: 'image', src: 'assets/lookbook-ss26-27/embedded/p32_img04_xref1239_3935f6e23a7c.jpeg' },
  ],
  'yza-bateau-top-jawhara-ss26': [
    { type: 'image', src: 'assets/lookbook-ss26-27/embedded/p30_img01_xref1219_8b2d1136309d.jpeg' },
  ],
  'yza-button-up-shirt-jawhara-ss26': [
    { type: 'image', src: 'assets/lookbook-ss26-27/embedded/p29_img02_xref1213_fe747a323e9f.jpeg' },
  ],
  'yza-pareo-skirt-short-jawhara-ss26': [
    { type: 'image', src: 'assets/lookbook-ss26-27/embedded/p29_img04_xref1215_ea0a78123e7b.jpeg' },
  ],
  'yza-pareo-skirt-midi-jawhara-ss26': [
    { type: 'image', src: 'assets/lookbook-ss26-27/embedded/p30_img02_xref1220_f762d6e64853.jpeg' },
  ],
  'yza-pareo-skirt-long-jawhara-ss26': [
    { type: 'image', src: 'assets/lookbook-ss26-27/embedded/p29_img03_xref1214_6b93fb974a48.jpeg' },
  ],
  'yza-pareo-skirt-x-long-jawhara-ss26': [
    { type: 'image', src: 'assets/lookbook-ss26-27/embedded/p38_img01_xref1287_56cb4d596aa0.jpeg' },
    { type: 'image', src: 'assets/lookbook-ss26-27/embedded/p34_img04_xref1256_50e34c751e78.jpeg' },
  ],
  'yza-wrap-pants-jawhara-ss26': [
    { type: 'image', src: 'assets/products/jawhara/client/palazzo-01.jpg' },
  ],
  'yza-palazzo-pants-jawhara-ss26': [
    { type: 'image', src: 'assets/products/jawhara/client/palazzo-02.jpg' },
    { type: 'image', src: 'assets/products/jawhara/client/palazzo-06.jpg' },
    { type: 'image', src: 'assets/products/jawhara/client/palazzo-07.jpg' },
    { type: 'image', src: 'assets/products/jawhara/client/palazzo-09.jpg' },
    { type: 'image', src: 'assets/products/jawhara/client/palazzo-10.jpg' },
    { type: 'image', src: 'assets/products/jawhara/client/palazzo-11.jpg' },
    { type: 'image', src: 'assets/products/jawhara/client/palazzo-12.jpg' },
    { type: 'video', src: 'assets/lifestyle/rtw/palazzo-0c3974e0ce54.mp4', poster: 'assets/lifestyle/rtw/palazzo-0c3974e0ce54-poster.jpg' },
  ],
  'la-nouvelle-vague-xs-basket-bag-ss26': [
    { type: 'image', src: 'assets/products/la-vague/client/black-xs-01.jpg' },
    { type: 'image', src: 'assets/products/la-vague/client/black-xs-02.jpg' },
    { type: 'image', src: 'assets/products/la-vague/client/black-xs-03.jpg' },
    { type: 'video', src: 'assets/lifestyle/bags/vague-3e649f7c202b.mp4', poster: 'assets/lifestyle/bags/vague-3e649f7c202b-poster.jpg' },
  ],
  'la-nouvelle-vague-s-basket-bag-ss26': [
    { type: 'image', src: 'assets/products/la-vague/client/black-s-01.jpg' },
    { type: 'image', src: 'assets/products/la-vague/client/black-s-02.jpg' },
    { type: 'image', src: 'assets/products/la-vague/client/black-s-03.jpg' },
    { type: 'image', src: 'assets/products/la-vague/client/black-s-04.jpg' },
    { type: 'image', src: 'assets/products/la-vague/client/black-s-05.jpg' },
    { type: 'image', src: 'assets/products/la-vague/client/black-s-06.jpg' },
  ],
  'la-nouvelle-vague-m-basket-bag-ss26': [
    { type: 'image', src: 'assets/products/la-vague/client/black-m-01.jpg' },
    { type: 'image', src: 'assets/products/la-vague/client/black-m-02.jpg' },
    { type: 'image', src: 'assets/products/la-vague/client/black-m-03.jpg' },
    { type: 'image', src: 'assets/products/la-vague/client/black-m-04.jpg' },
    { type: 'image', src: 'assets/products/la-vague/client/black-m-05.jpg' },
  ],
};
Object.keys(PRODUCT_MEDIA).forEach((h) => {
  const p = PRODUCT_MAP.get(h);
  if (!p) return;
  const media = PRODUCT_MEDIA[h];
  if (!media || !media.length) return;
  p.media = media;
  p.gallery = media.filter((m) => m.type === 'image').map((m) => m.src);
  if (p.gallery.length) p.img = p.gallery[0];
});


// ============================================================
// PERSONA_COPY - Nawal Rmili voice rewrite (Phase C).
// Prose/spec fields only, applied after the internal-price-field
// strip so it never reintroduces cost fields. Never touches
// price/img/gallery/availableColors/variant/B2B logic.
// es/tr/ar fall back to en via the existing L5() helper.
// ============================================================
(function () {
 var PERSONA_COPY = {
 "rtw": [
 {
 "handle": "yza-scarf-top-jawhara-ss26",
 "short": {
  "fr": "Un foulard qui devient haut, noué dans le dos. Dos nu, et toi qui décides du serrage.",
  "en": "A scarf that becomes a top, tied at the back. Bare back, and you set the hold.",
  "es": "Un pañuelo que se vuelve top, anudado en la espalda. Espalda al aire, y tú decides el ajuste.",
  "tr": "Eşarptan doğan bir üst, sırtta bağlanır. Açık sırt, sıkılığına sen karar verirsin.",
  "ar": "وشاح يتحوّل إلى بلوزة، يُعقد عند الظهر. ظهر مكشوف، وأنتِ من تحدّد شدّ العقدة."
 },
 "desc": {
  "fr": "Il ressemble à un foulard, il se porte comme un secret : on l'enroule sur le buste, on croise le cordon et on le noue dans le dos, à la mode licou, dos nu et petite ouverture sur le côté. Au bout des cordons, des pampilles perlées d'or que La Fatima façonne une à une à Guéliz. Le tombé souple du Jawhara fait le reste, et c'est ton nœud qui dessine la ligne : serré haut pour le jour, dénoué quand la chaleur tombe. Coupé et fini main. Deux fois noué, jamais deux fois la même silhouette.",
  "en": "It looks like a scarf and wears like a secret: you wrap it over the bust, cross the cords and tie them at the back, halter-style, bare back and a small opening at the side. At the ends of the cords, gold beaded pampilles that La Fatima shapes one by one in Guéliz. The soft drape of the Jawhara does the rest, and your knot draws the line: tied high for the day, loosened when the heat lifts. Cut and finished by hand. Knotted twice, never the same silhouette twice.",
  "es": "Parece un pañuelo y se lleva como un secreto: se enrolla sobre el busto, se cruzan los cordones y se anudan en la espalda, estilo halter, espalda al aire y una pequeña abertura al costado. En las puntas de los cordones, borlas de cuentas doradas que La Fatima forma una a una en Guéliz. La caída suave del Jawhara hace el resto, y tu nudo dibuja la línea: ceñido arriba de día, aflojado cuando cae el calor. Cortado y acabado a mano. Anudado dos veces, nunca la misma silueta dos veces.",
  "tr": "Bir eşarba benzer, bir sır gibi taşınır: göğsün üzerine sarılır, ipler çaprazlanıp sırtta bağlanır, halter tarzı, açık sırt ve yanda küçük bir açıklık. İplerin uçlarında, La Fatima'nın Guéliz'de tek tek şekillendirdiği altın boncuklu püsküller. Jawhara'nın yumuşak dökümü gerisini halleder, çizgiyi senin düğümün çizer: gündüz yukarıdan sıkı, sıcak dindiğinde gevşek. Elde kesilip bitirilir. İki kez bağlanır, hiçbir zaman aynı siluet iki kez olmaz.",
  "ar": "يبدو كوشاح ويُلبَس كسرّ: يُلَفّ حول الصدر، تُعقد الأربطة متقاطعةً عند الظهر على طريقة الرسن، بظهر مكشوف وفتحة صغيرة على الجانب. عند أطراف الأربطة شراريب مطرّزة بالخرز الذهبي تصوغها لافاطمة واحدةً واحدة في كليز. دُوزان قماش الجوهرة الناعم يفعل الباقي، وعقدتكِ هي من ترسم الخط: مشدود عالياً للنهار، مُرخى حين يهدأ الحرّ. مقصوص ومُنجَز يدوياً. يُعقد مرّتين، ولا يتكرّر القوام مرّتين."
 },
 "material": {
  "fr": "Jawhara, notre tissu maison - soie et viscose, avec un fil de lurex discret qui fond dans la couleur. Tombé souple et fluide, lavable en machine à 30°C, ne se froisse presque pas.",
  "en": "Jawhara, our house fabric - silk and viscose, with a discreet lurex thread that melts into the colour. Soft, fluid drape, machine-washable at 30°C, almost crease-free.",
  "es": "Jawhara, nuestro tejido de la casa - seda y viscosa, con un discreto hilo de lúrex que se funde en el color. Caída suave y fluida, lavable a máquina a 30°C, casi no se arruga.",
  "tr": "Jawhara, kendi kumaşımız - ipek ve viskon, renge karışan gizli bir lureks ipliğiyle. Yumuşak ve akışkan döküm, 30°C'de makinede yıkanabilir, neredeyse hiç kırışmaz.",
  "ar": "الجوهرة، قماشنا الخاص - حرير وفيسكوز، مع خيط لوريكس خفيّ يذوب في اللون. دُوزان ناعم وانسيابي، قابل للغسل في الغسالة عند 30°م، ولا يتجعّد تقريباً."
 },
 "fabric": {
  "fr": "Le Jawhara traditionnel est une soie tissée main, réservée aux caftans de fête portés une fois puis rangés. Le nôtre naît chez nous en dix couleurs, chacune avec un nom qui vient de Marrakech et son fil signature, or ou argent ; coupe et finitions passent toutes par nos mains.",
  "en": "Traditional Jawhara is a hand-woven silk kept for festive caftans, worn once and then stored away. Ours is made in-house in ten colours, each with a name drawn from Marrakech and its signature thread, gold or silver; its cut and finishing all pass through our hands.",
  "es": "El Jawhara tradicional es una seda tejida a mano reservada a los caftanes de fiesta, que se llevan una vez y se guardan. El nuestro nace en casa en diez colores, cada uno con un nombre venido de Marrakech y su hilo distintivo, oro o plata; su corte y sus acabados pasan todos por nuestras manos.",
  "tr": "Geleneksel Jawhara, bir kez giyilip kaldırılan bayramlık kaftanlara ayrılmış, elde dokunan bir ipektir. Bizimki atölyemizde on renkte doğar, her biri Marakeş'ten gelen bir isim ve altın ya da gümüş imza ipliğiyle; kesimi ve bitişleri tümüyle ellerimizden geçer.",
  "ar": "الجوهرة التقليدية حرير منسوج يدوياً يُخصَّص للقفاطين الاحتفالية، تُلبَس مرّة ثم تُصان. أمّا جوهرتنا فتُصنع عندنا بعشرة ألوان، لكلٍّ منها اسم مستوحى من مراكش وخيطه المميّز، ذهبي أو فضّي؛ قصّها وتشطيبها يمرّان جميعاً بأيدينا."
 },
 "handworkTime": {
  "fr": "Coupé et fini main à l'atelier de Guéliz, et les pampilles perlées façonnées une à une par La Fatima - sans presser le geste.",
  "en": "Cut and finished by hand at the Guéliz atelier, with the beaded pampilles shaped one by one by La Fatima - never rushing the gesture.",
  "es": "Cortado y acabado a mano en el taller de Guéliz, con las borlas de cuentas formadas una a una por La Fatima - sin apresurar el gesto.",
  "tr": "Guéliz atölyesinde elde kesilip bitirilir, boncuklu püsküller La Fatima tarafından tek tek şekillendirilir - hareketi hiç aceleye getirmeden.",
  "ar": "مقصوص ومُنجَز يدوياً في مشغل كليز، والشراريب المطرّزة بالخرز تصوغها لافاطمة واحدةً واحدة - دون استعجالٍ للحركة."
 },
 "dimensions": {
 "fr": "Sans taille - c'est le nœud qui fait la mesure.",
 "en": "Size-free - the knot makes the measure."
 },
 "edition": {
  "fr": "Édition limitée Jawhara, faite main à Guéliz.",
  "en": "Limited Jawhara edition, handmade in Guéliz.",
  "es": "Edición limitada Jawhara, hecha a mano en Guéliz.",
  "tr": "Sınırlı Jawhara serisi, Guéliz'de el yapımı.",
  "ar": "إصدار محدود من الجوهرة، مصنوع يدوياً في كليز."
 }
 },
 {
 "handle": "yza-bateau-top-jawhara-ss26",
 "short": {
  "fr": "Une encolure bateau qui dégage les épaules, nouée d'un petit nœud sur le côté. De la plage au soir.",
  "en": "A boat neckline that bares the shoulders, tied with a small knot at the side. Beach to evening.",
  "es": "Un escote barco que despeja los hombros, atado con un pequeño nudo al costado. De la playa a la noche.",
  "tr": "Omuzları açan bir kayık yaka, yanda küçük bir düğümle bağlanır. Plajdan akşama.",
  "ar": "ياقة قاربية تكشف الكتفين، تُربط بعقدة صغيرة على الجانب. من الشاطئ إلى المساء."
 },
 "desc": {
  "fr": "Tout tient dans l'encolure : une horizontale franche qui découvre les clavicules et laisse les épaules respirer. Il s'ouvre sur les côtés et se ferme de petits nœuds - à toi de régler l'aisance. Porte-le seul ou par-dessus une brassière, du bain du matin à la terrasse du soir. Jawhara au tombé souple, sans taille, coupé et fini main à Guéliz. Il s'accorde à une jupe paréo comme à un palazzo. Une main est passée par là : d'un exemplaire à l'autre, la ligne respire un peu différemment.",
  "en": "It all lives in the neckline: a frank horizontal that uncovers the collarbones and lets the shoulders breathe. It opens at the sides and closes with small knots - the ease is yours to set. Wear it alone or over a bralette, from the morning swim to the evening terrace. Soft-draping Jawhara, size-free, cut and finished by hand in Guéliz. It pairs with a pareo skirt as readily as with palazzo trousers. A hand passed through it: from one to the next, the line breathes a touch differently.",
  "es": "Todo vive en el escote: una horizontal franca que descubre las clavículas y deja respirar los hombros. Se abre por los costados y se cierra con pequeños nudos - la holgura la decides tú. Llévalo solo o sobre un top de sujeción, del baño de la mañana a la terraza de la noche. Jawhara de caída suave, sin talla, cortado y acabado a mano en Guéliz. Combina con una falda pareo tanto como con un palazzo. Una mano pasó por aquí: de una prenda a otra, la línea respira un poco distinta.",
  "tr": "Her şey yakada yaşar: köprücük kemiklerini açığa çıkaran ve omuzların nefes almasını sağlayan net bir yatay çizgi. Yanlardan açılır ve küçük düğümlerle kapanır - rahatlığı sen ayarlarsın. Tek başına ya da bir bralet üstüne giy, sabah yüzüşünden akşam terasına. Yumuşak dökümlü Jawhara, bedensiz, Guéliz'de elde kesilip bitirilmiştir. Bir pareo etekle de palazzo pantolonla da uyum sağlar. Buradan bir el geçmiştir: her parçada çizgi biraz farklı nefes alır.",
  "ar": "كلّ شيء يكمن في الياقة: خط أفقي واضح يكشف عظمتَي التّرقوة ويترك الكتفين يتنفّسان. يُفتح من الجانبين ويُغلق بعقدٍ صغيرة - أنتِ من تضبط الاتّساع. البسيه وحده أو فوق حمّالة صدرية، من سباحة الصباح إلى شرفة المساء. جوهرة ناعمة الدُّوزان، بلا مقاس، مقصوصة ومُنجَزة يدوياً في كليز. تنسجم مع تنّورة باريو كما مع بنطال بالازو. مرّت به يدٌ: من قطعة إلى أخرى، يتنفّس الخط باختلافٍ طفيف."
 },
 "material": {
  "fr": "Jawhara, notre tissu maison - soie et viscose, avec un fil de lurex discret qui fond dans la couleur. Fluide et léger, lavable en machine à 30°C, ne se froisse presque pas.",
  "en": "Jawhara, our house fabric - silk and viscose, with a discreet lurex thread that melts into the colour. Fluid and light, machine-washable at 30°C, almost crease-free.",
  "es": "Jawhara, nuestro tejido de la casa - seda y viscosa, con un discreto hilo de lúrex que se funde en el color. Fluido y ligero, lavable a máquina a 30°C, casi no se arruga.",
  "tr": "Jawhara, kendi kumaşımız - ipek ve viskon, renge karışan gizli bir lureks ipliğiyle. Akışkan ve hafif, 30°C'de makinede yıkanabilir, neredeyse hiç kırışmaz.",
  "ar": "الجوهرة، قماشنا الخاص - حرير وفيسكوز، مع خيط لوريكس خفيّ يذوب في اللون. انسيابي وخفيف، قابل للغسل في الغسالة عند 30°م، ولا يتجعّد تقريباً."
 },
 "fabric": {
  "fr": "Le Jawhara traditionnel est une soie tissée main, réservée aux caftans de fête portés une fois puis rangés. Le nôtre naît chez nous en dix couleurs, chacune avec un nom venu de Marrakech et son fil signature, or ou argent ; coupe, finitions et détails ne quittent jamais nos mains.",
  "en": "Traditional Jawhara is a hand-woven silk kept for festive caftans, worn once and then stored away. Ours is made in-house in ten colours, each with a name drawn from Marrakech and its signature thread, gold or silver; cut, finishing and details never leave our hands.",
  "es": "El Jawhara tradicional es una seda tejida a mano reservada a los caftanes de fiesta, que se llevan una vez y se guardan. El nuestro nace en casa en diez colores, cada uno con un nombre venido de Marrakech y su hilo distintivo, oro o plata; corte, acabados y detalles nunca dejan nuestras manos.",
  "tr": "Geleneksel Jawhara, bir kez giyilip kaldırılan bayramlık kaftanlara ayrılmış, elde dokunan bir ipektir. Bizimki atölyemizde on renkte doğar, her biri Marakeş'ten gelen bir isim ve altın ya da gümüş imza ipliğiyle; kesim, bitiş ve ayrıntılar ellerimizden hiç ayrılmaz.",
  "ar": "الجوهرة التقليدية حرير منسوج يدوياً يُخصَّص للقفاطين الاحتفالية، تُلبَس مرّة ثم تُصان. أمّا جوهرتنا فتُصنع عندنا بعشرة ألوان، لكلٍّ منها اسم مستوحى من مراكش وخيطه المميّز، ذهبي أو فضّي؛ القصّ والتشطيب والتفاصيل لا تفارق أيدينا أبداً."
 },
 "handworkTime": {
  "fr": "Coupé et fini main à l'atelier de Guéliz, le temps qu'il faut.",
  "en": "Cut and finished by hand at the Guéliz atelier, in the time it takes.",
  "es": "Cortado y acabado a mano en el taller de Guéliz, el tiempo que haga falta.",
  "tr": "Guéliz atölyesinde elde kesilip bitirilir, gerektiği kadar zamanla.",
  "ar": "مقصوص ومُنجَز يدوياً في مشغل كليز، بالوقت الذي يلزم."
 },
 "dimensions": {
 "fr": "Sans taille - il se règle sur toi.",
 "en": "Size-free - it settles around you."
 },
 "edition": {
  "fr": "Édition limitée Jawhara, faite main à Guéliz.",
  "en": "Limited Jawhara edition, handmade in Guéliz.",
  "es": "Edición limitada Jawhara, hecha a mano en Guéliz.",
  "tr": "Sınırlı Jawhara serisi, Guéliz'de el yapımı.",
  "ar": "إصدار محدود من الجوهرة، مصنوع يدوياً في كليز."
 }
 },
 {
 "handle": "yza-button-up-shirt-jawhara-ss26",
 "short": {
  "fr": "Une chemise boutonnée de nacre, fluide sous les doigts. Du col fermé au col ouvert.",
  "en": "A button-up with mother-of-pearl, fluid under the fingers. Buttoned to the throat or wide open.",
  "es": "Una camisa abotonada de nácar, fluida bajo los dedos. Del cuello cerrado al cuello abierto.",
  "tr": "Sedef düğmeli, parmakların altında akışkan bir gömlek. Yakası kapalıdan yakası açığa.",
  "ar": "قميص بأزرار من صدف اللؤلؤ، انسيابي تحت الأصابع. من ياقة مغلقة إلى ياقة مفتوحة."
 },
 "desc": {
  "fr": "Une rangée de boutons de nacre, un tombé qui glisse, et la lumière du matin qui passe au travers : la chemise se porte presque comme une peau. Sur le col, un signe amazigh brodé et perlé à la main par La Fatima, discret comme une signature. Jawhara coupée et finie main à Guéliz, en S, M et L - la seule pièce vraiment taillée. Ouvre-la sur un maillot pour la plage, ferme-la jusqu'au col quand le vent se lève. Une seule pièce pour le marché et pour la terrasse du soir.",
  "en": "A row of mother-of-pearl buttons, a drape that slides, the morning light coming through: the shirt sits almost like skin. On the collar, an Amazigh sign embroidered and beaded by hand by La Fatima, discreet as a signature. Jawhara, cut and finished by hand in Guéliz, in S, M and L - the one piece that is truly sized. Open it over a swimsuit for the beach, close it to the collar when the wind picks up. One piece for the market and the evening terrace alike.",
  "es": "Una hilera de botones de nácar, una caída que se desliza, y la luz de la mañana que atraviesa: la camisa se lleva casi como una piel. En el cuello, un signo amazigh bordado y con cuentas a mano por La Fatima, discreto como una firma. Jawhara cortada y acabada a mano en Guéliz, en S, M y L - la única prenda verdaderamente entallada. Ábrela sobre un bañador para la playa, ciérrala hasta el cuello cuando se levanta el viento. Una sola prenda para el mercado y para la terraza de la noche.",
  "tr": "Bir sıra sedef düğme, kayan bir döküm ve içinden geçen sabah ışığı: gömlek neredeyse bir ten gibi oturur. Yakada, La Fatima'nın elle işleyip boncukladığı bir Amazig işareti, bir imza kadar sade. Jawhara, Guéliz'de elde kesilip bitirilir, S, M ve L - gerçekten bedenlenmiş tek parça. Plaj için mayonun üstüne aç, rüzgâr çıktığında yakaya kadar kapat. Hem pazar hem akşam terası için tek bir parça.",
  "ar": "صفٌّ من أزرار صدف اللؤلؤ، دُوزان ينساب، وضوء الصباح يعبر من خلاله: يُلبَس القميص كأنّه بشرة. على الياقة، رمز أمازيغي مطرّز ومُزيّن بالخرز يدوياً بيد لافاطمة، خفيّ كتوقيع. جوهرة مقصوصة ومُنجَزة يدوياً في كليز، بمقاسات S وM وL - القطعة الوحيدة ذات المقاس الحقيقي. افتحيه فوق لباس السباحة للشاطئ، وأغلقيه حتى الياقة حين يهبّ الريح. قطعة واحدة للسوق ولشرفة المساء معاً."
 },
 "material": {
  "fr": "Jawhara, notre tissu maison - soie et viscose, avec un fil de lurex discret qui fond dans la couleur. Tombé souple, lavable en machine à 30°C, ne se froisse presque pas ; boutons de nacre.",
  "en": "Jawhara, our house fabric - silk and viscose, with a discreet lurex thread that melts into the colour. Soft drape, machine-washable at 30°C, almost crease-free; mother-of-pearl buttons.",
  "es": "Jawhara, nuestro tejido de la casa - seda y viscosa, con un discreto hilo de lúrex que se funde en el color. Caída suave, lavable a máquina a 30°C, casi no se arruga; botones de nácar.",
  "tr": "Jawhara, kendi kumaşımız - ipek ve viskon, renge karışan gizli bir lureks ipliğiyle. Yumuşak döküm, 30°C'de makinede yıkanabilir, neredeyse hiç kırışmaz; sedef düğmeler.",
  "ar": "الجوهرة، قماشنا الخاص - حرير وفيسكوز، مع خيط لوريكس خفيّ يذوب في اللون. دُوزان ناعم، قابل للغسل في الغسالة عند 30°م، ولا يتجعّد تقريباً؛ أزرار من صدف اللؤلؤ."
 },
 "fabric": {
  "fr": "Le Jawhara traditionnel est une soie tissée main, réservée aux caftans de fête portés une fois puis rangés. Le nôtre naît chez nous en dix couleurs, chacune avec un nom venu de Marrakech et son fil signature, or ou argent ; coupe et finitions se contrôlent à la main, du col brodé au dernier bouton de nacre.",
  "en": "Traditional Jawhara is a hand-woven silk kept for festive caftans, worn once and then stored away. Ours is made in-house in ten colours, each with a name drawn from Marrakech and its signature thread, gold or silver; cut and finishing are checked by hand, from the embroidered collar to the last mother-of-pearl button.",
  "es": "El Jawhara tradicional es una seda tejida a mano reservada a los caftanes de fiesta, que se llevan una vez y se guardan. El nuestro nace en casa en diez colores, cada uno con un nombre venido de Marrakech y su hilo distintivo, oro o plata; corte y acabados se controlan a mano, del cuello bordado al último botón de nácar.",
  "tr": "Geleneksel Jawhara, bir kez giyilip kaldırılan bayramlık kaftanlara ayrılmış, elde dokunan bir ipektir. Bizimki atölyemizde on renkte doğar, her biri Marakeş'ten gelen bir isim ve altın ya da gümüş imza ipliğiyle; kesim ve bitiş elde denetlenir, işlemeli yakadan son sedef düğmeye dek.",
  "ar": "الجوهرة التقليدية حرير منسوج يدوياً يُخصَّص للقفاطين الاحتفالية، تُلبَس مرّة ثم تُصان. أمّا جوهرتنا فتُصنع عندنا بعشرة ألوان، لكلٍّ منها اسم مستوحى من مراكش وخيطه المميّز، ذهبي أو فضّي؛ القصّ والتشطيب يُراقبان يدوياً، من الياقة المطرّزة إلى آخر زرٍّ من صدف اللؤلؤ."
 },
 "handworkTime": {
  "fr": "Coupée et finie main à l'atelier de Guéliz, avec le signe amazigh du col brodé à la main par La Fatima - sans hâte.",
  "en": "Cut and finished by hand at the Guéliz atelier, with the collar's Amazigh sign hand-embroidered by La Fatima - without haste.",
  "es": "Cortada y acabada a mano en el taller de Guéliz, con el signo amazigh del cuello bordado a mano por La Fatima - sin prisa.",
  "tr": "Guéliz atölyesinde elde kesilip bitirilir, yakadaki Amazig işareti La Fatima tarafından elle işlenir - acelesiz.",
  "ar": "مقصوصة ومُنجَزة يدوياً في مشغل كليز، ورمز الياقة الأمازيغي مطرّز يدوياً بيد لافاطمة - دون عجل."
 },
 "dimensions": {
 "fr": "Trois tailles : S, M, L.",
 "en": "Three sizes: S, M, L."
 },
 "edition": {
  "fr": "Édition limitée Jawhara, faite main à Guéliz.",
  "en": "Limited Jawhara edition, handmade in Guéliz.",
  "es": "Edición limitada Jawhara, hecha a mano en Guéliz.",
  "tr": "Sınırlı Jawhara serisi, Guéliz'de el yapımı.",
  "ar": "إصدار محدود من الجوهرة، مصنوع يدوياً في كليز."
 }
 },
 {
 "handle": "yza-pareo-skirt-short-jawhara-ss26",
 "short": {
 "fr": "Une jupe paréo courte, nouée d'une main. Une pièce de tissu, libre sur les jambes.",
 "en": "A short pareo skirt, knotted in one move. A single cloth, free over the legs."
 },
 "desc": {
  "fr": "Le geste est ancien : on l'enroule, on croise, on noue à la taille - et c'est mis, en quelques secondes, comme un vrai paréo. Longueur courte, ceinture haute et large qui tient bien, et des volants au bas qui donnent au tissu un vrai mouvement, presque dansant. Une fente presque invisible ne se révèle que quand on marche. Sur la ceinture, La Fatima brode ou perle main un signe amazigh. Jawhara au tombé souple - soie et viscose, un fil de lurex discret - se lave en machine, ne marque pas au repassage, reste quasi infroissable. Coupée main à Guéliz, sans taille, du XS au XXL selon le nœud. Sur un maillot ou sous un top bateau, elle attend le soleil - pas grand-chose d'autre.",
  "en": "The gesture is old: wrap it, cross it, knot at the waist - and it's on in seconds, like a real pareo. Short length, a wide high belt that holds, and ruffles at the hem that give the cloth real movement, almost dancing. A near-invisible slit shows only when you walk. On the belt, La Fatima hand-embroiders or beads an Amazigh sign. Soft-draping Jawhara - silk and viscose, a discreet lurex thread - is machine-washable, doesn't mark under the iron, stays nearly wrinkle-free. Cut by hand in Guéliz, size-free, XS to XXL by your knot. Over a swimsuit or under a bateau top, it waits for the sun - not much else.",
  "es": "El gesto es antiguo: se enrolla, se cruza, se anuda a la cintura - y ya está puesta, en segundos, como un pareo de verdad. Largo corto, cinturón alto y ancho que sujeta bien, y volantes en el bajo que dan a la tela un movimiento real, casi danzante. Una abertura casi invisible solo se revela al caminar. En el cinturón, La Fatima borda o borda con cuentas a mano un signo amazigh. Jawhara de caída suave - seda y viscosa, un hilo de lúrex discreto - se lava a máquina, no se marca al planchar y queda casi inarrugable. Cortada a mano en Guéliz, sin talla, de la XS a la XXL según el nudo. Sobre un bañador o bajo un top barco, espera al sol - poco más.",
  "tr": "Hareket eski: sararsın, çaprazlarsın, belde bağlarsın - ve saniyeler içinde giyilir, gerçek bir pareo gibi. Kısa boy, iyi tutan yüksek ve geniş bir kuşak, ve eteğinde kumaşa gerçek bir hareket, neredeyse dans eden bir hava katan farbalalar. Neredeyse görünmez bir yırtmaç yalnızca yürürken belli olur. Kuşağın üzerine La Fatima elle bir Amazigh işareti işler ya da boncukla süsler. Yumuşak dökümlü Jawhara - ipek ve viskon, ince bir lüreks ipliği - makinede yıkanır, ütüde iz bırakmaz, neredeyse hiç buruşmaz. Guéliz'de elle kesilir, bedensiz, düğüme göre XS'ten XXL'e. Bir mayonun üstüne ya da bir kayık yaka bluzun altına, güneşi bekler - başka pek bir şey değil.",
  "ar": "الحركة قديمة: تلفّينه، تعقدينه عند الخصر - فيُرتدى في ثوانٍ، كباريو حقيقي. طول قصير، حزام عريض ومرتفع يمسك جيداً، وكشاكش عند الحاشية تمنح القماش حركة حقيقية تكاد ترقص. شقّ يكاد لا يُرى لا يظهر إلا حين تمشين. على الحزام، تطرّز لافاطمة أو تُرصّع يدوياً رمزاً أمازيغياً. جوهرة ناعم الانسدال - حرير وفيسكوز، مع خيط لوريكس خفيف - يُغسل في الغسالة، ولا يترك أثراً عند الكي، ويبقى شبه خالٍ من التجاعيد. تُقصّ يدوياً في كليز، بلا مقاس، من XS إلى XXL حسب العقدة. فوق ثوب سباحة أو تحت بلوزة بياقة قارب، تنتظر الشمس - ولا شيء آخر تقريباً."
 },
 "material": {
  "fr": "Jawhara, notre tissu maison - soie et viscose, avec un fil de lurex discret ; tombe souple, se lave en machine, quasi infroissable.",
  "en": "Jawhara, our house fabric - silk and viscose, with a discreet lurex thread; soft drape, machine-washable, nearly wrinkle-free.",
  "es": "Jawhara, nuestro tejido de la casa - seda y viscosa, con un hilo de lúrex discreto; caída suave, lavable a máquina, casi inarrugable.",
  "tr": "Jawhara, kendi kumaşımız - ipek ve viskon, ince bir lüreks ipliğiyle; yumuşak döküm, makinede yıkanabilir, neredeyse hiç buruşmaz.",
  "ar": "جوهرة، قماشنا الخاص - حرير وفيسكوز، مع خيط لوريكس خفيف؛ انسدال ناعم، يُغسل في الغسالة، شبه خالٍ من التجاعيد."
 },
 "fabric": {
  "fr": "Jawhara naît chez nous ; coupe, volants et signe amazigh sur la ceinture restent à la main, à Guéliz.",
  "en": "Jawhara is ours; cut, ruffles and the Amazigh sign on the belt stay by hand, in Guéliz.",
  "es": "Jawhara nace en casa; corte, volantes y el signo amazigh del cinturón quedan a mano, en Guéliz.",
  "tr": "Jawhara bizim elimizden çıkar; kesim, farbalalar ve kuşaktaki Amazigh işareti Guéliz'de elle kalır.",
  "ar": "جوهرة يُصنع عندنا؛ القص والكشاكش والرمز الأمازيغي على الحزام تبقى يدوية، في كليز."
 },
 "handworkTime": {
  "fr": "Coupée et finie main à l'atelier ; le signe amazigh est brodé ou perlé par La Fatima.",
  "en": "Cut and finished by hand at the atelier; the Amazigh sign is embroidered or beaded by La Fatima.",
  "es": "Cortada y acabada a mano en el taller; el signo amazigh lo borda o borda con cuentas La Fatima.",
  "tr": "Atölyede elle kesilip bitirilir; Amazigh işaretini La Fatima işler ya da boncukla süsler.",
  "ar": "تُقصّ وتُنهى يدوياً في الورشة؛ والرمز الأمازيغي تطرّزه أو تُرصّعه لافاطمة."
 },
 "dimensions": {
 "fr": "Sans taille - le nœud règle du XS au XXL.",
 "en": "Size-free - the knot sets it from XS to XXL."
 },
 "edition": {
 "fr": "Édition limitée Jawhara, faite main ; le tissu peut varier selon les arrivages.",
 "en": "Limited Jawhara edition, handmade."
 }
 },
 {
 "handle": "yza-pareo-skirt-midi-jawhara-ss26",
 "short": {
 "fr": "Une jupe paréo midi, à nouer une fois pour la journée. Le vent fait le reste.",
 "en": "A midi pareo skirt, knotted once for the day. The wind does the rest."
 },
 "desc": {
  "fr": "En longueur midi, la jupe paréo gagne un peu de tenue sans rien perdre de sa nonchalance : on l'enroule, on croise, on noue - c'est mis en quelques secondes comme un vrai paréo, et on n'y pense plus. Ceinture haute et large qui tient bien, volants au bas pour un vrai mouvement presque dansant, et une fente presque invisible qui ne se révèle qu'au pas. Sur la ceinture, La Fatima brode ou perle main un signe amazigh. Jawhara au tombé souple - soie et viscose, un fil de lurex discret - se lave en machine, ne marque pas au repassage, reste quasi infroissable. Coupée main à Guéliz, sans taille, du XS au XXL selon le nœud. Elle prend le vent à la moindre brise - au marché le matin, sur le pas de la porte au crépuscule.",
  "en": "At midi length the pareo skirt gains a little hold without losing its ease: wrap it, cross it, knot it - it's on in seconds like a real pareo, and you forget about it. A wide high belt that holds, ruffles at the hem for real, almost-dancing movement, and a near-invisible slit that shows only as you walk. On the belt, La Fatima hand-embroiders or beads an Amazigh sign. Soft-draping Jawhara - silk and viscose, a discreet lurex thread - is machine-washable, doesn't mark under the iron, stays nearly wrinkle-free. Cut by hand in Guéliz, size-free, XS to XXL by your knot. It catches the slightest breeze - at the market in the morning, on the doorstep at dusk.",
  "es": "En largo midi, la falda pareo gana un poco de cuerpo sin perder nada de su desenfado: se enrolla, se cruza, se anuda - queda puesta en segundos como un pareo de verdad, y te olvidas de ella. Cinturón alto y ancho que sujeta bien, volantes en el bajo para un movimiento real casi danzante, y una abertura casi invisible que solo se revela al andar. En el cinturón, La Fatima borda o borda con cuentas a mano un signo amazigh. Jawhara de caída suave - seda y viscosa, un hilo de lúrex discreto - se lava a máquina, no se marca al planchar y queda casi inarrugable. Cortada a mano en Guéliz, sin talla, de la XS a la XXL según el nudo. Atrapa la menor brisa - en el mercado por la mañana, en el umbral al atardecer.",
  "tr": "Midi boyda pareo etek, rahatlığından hiçbir şey yitirmeden biraz duruş kazanır: sararsın, çaprazlarsın, bağlarsın - gerçek bir pareo gibi saniyeler içinde giyilir ve onu unutursun. İyi tutan yüksek ve geniş bir kuşak, eteğinde gerçek, neredeyse dans eden bir hareket için farbalalar, ve yalnızca yürürken belli olan neredeyse görünmez bir yırtmaç. Kuşağın üzerine La Fatima elle bir Amazigh işareti işler ya da boncukla süsler. Yumuşak dökümlü Jawhara - ipek ve viskon, ince bir lüreks ipliği - makinede yıkanır, ütüde iz bırakmaz, neredeyse hiç buruşmaz. Guéliz'de elle kesilir, bedensiz, düğüme göre XS'ten XXL'e. En hafif esintiyi yakalar - sabah pazarda, alacakaranlıkta kapı eşiğinde.",
  "ar": "بطولٍ ميدي، تكتسب تنورة الباريو قليلاً من الثبات دون أن تفقد شيئاً من عفويّتها: تلفّينها، تعقدينها - تُرتدى في ثوانٍ كباريو حقيقي، ثم تنسينها. حزام عريض ومرتفع يمسك جيداً، وكشاكش عند الحاشية لحركة حقيقية تكاد ترقص، وشقّ يكاد لا يُرى لا يظهر إلا مع المشي. على الحزام، تطرّز لافاطمة أو تُرصّع يدوياً رمزاً أمازيغياً. جوهرة ناعم الانسدال - حرير وفيسكوز، مع خيط لوريكس خفيف - يُغسل في الغسالة، ولا يترك أثراً عند الكي، ويبقى شبه خالٍ من التجاعيد. تُقصّ يدوياً في كليز، بلا مقاس، من XS إلى XXL حسب العقدة. تلتقط أخفّ نسمة - في السوق صباحاً، وعلى عتبة الباب عند الغسق."
 },
 "material": {
  "fr": "Jawhara, notre tissu maison - soie et viscose, avec un fil de lurex discret ; tombe souple, se lave en machine, quasi infroissable.",
  "en": "Jawhara, our house fabric - silk and viscose, with a discreet lurex thread; soft drape, machine-washable, nearly wrinkle-free.",
  "es": "Jawhara, nuestro tejido de la casa - seda y viscosa, con un hilo de lúrex discreto; caída suave, lavable a máquina, casi inarrugable.",
  "tr": "Jawhara, kendi kumaşımız - ipek ve viskon, ince bir lüreks ipliğiyle; yumuşak döküm, makinede yıkanabilir, neredeyse hiç buruşmaz.",
  "ar": "جوهرة، قماشنا الخاص - حرير وفيسكوز، مع خيط لوريكس خفيف؛ انسدال ناعم، يُغسل في الغسالة، شبه خالٍ من التجاعيد."
 },
 "fabric": {
  "fr": "Jawhara naît chez nous ; coupe, volants et signe amazigh sur la ceinture restent à la main, à Guéliz.",
  "en": "Jawhara is ours; cut, ruffles and the Amazigh sign on the belt stay by hand, in Guéliz.",
  "es": "Jawhara nace en casa; corte, volantes y el signo amazigh del cinturón quedan a mano, en Guéliz.",
  "tr": "Jawhara bizim elimizden çıkar; kesim, farbalalar ve kuşaktaki Amazigh işareti Guéliz'de elle kalır.",
  "ar": "جوهرة يُصنع عندنا؛ القص والكشاكش والرمز الأمازيغي على الحزام تبقى يدوية، في كليز."
 },
 "handworkTime": {
  "fr": "Coupée et finie main à l'atelier ; le signe amazigh est brodé ou perlé par La Fatima.",
  "en": "Cut and finished by hand at the atelier; the Amazigh sign is embroidered or beaded by La Fatima.",
  "es": "Cortada y acabada a mano en el taller; el signo amazigh lo borda o borda con cuentas La Fatima.",
  "tr": "Atölyede elle kesilip bitirilir; Amazigh işaretini La Fatima işler ya da boncukla süsler.",
  "ar": "تُقصّ وتُنهى يدوياً في الورشة؛ والرمز الأمازيغي تطرّزه أو تُرصّعه لافاطمة."
 },
 "dimensions": {
 "fr": "Sans taille - du XS au XXL, au gré du nœud.",
 "en": "Size-free - XS to XXL, however you knot it."
 },
 "edition": {
 "fr": "Édition limitée Jawhara, faite main ; le tissu change parfois selon les arrivages.",
 "en": "Limited Jawhara edition, handmade; the fabric sometimes changes with deliveries."
 }
 },
 {
 "handle": "yza-pareo-skirt-long-jawhara-ss26",
 "short": {
 "fr": "Une jupe paréo longue jusqu'à la cheville. Le tissu court avec chaque pas.",
 "en": "A long pareo skirt to the ankle. The cloth runs along with each step."
 },
 "desc": {
  "fr": "La longueur descend jusqu'à la cheville et donne au tissu de quoi se déployer - il suit la jambe, s'ouvre au pas, se referme à l'arrêt. On l'enroule, on croise, on noue : mise en quelques secondes comme un vrai paréo. Ceinture haute et large qui tient bien, volants au bas pour un mouvement presque dansant, et une fente presque invisible qui ne se révèle qu'à la marche. Sur la ceinture, La Fatima brode ou perle main un signe amazigh. Jawhara au tombé souple - soie et viscose, un fil de lurex discret - se lave en machine, ne marque pas au repassage, reste quasi infroissable. Coupée main à Guéliz, sans taille, du XS au XXL selon le nœud. Une pièce sobre qui tient le jour entier et glisse vers le soir sans qu'on la change.",
  "en": "The length drops to the ankle and gives the cloth room to open - it trails the leg, parts as you walk, closes when you stop. Wrap it, cross it, knot it: on in seconds like a real pareo. A wide high belt that holds, ruffles at the hem for an almost-dancing movement, and a near-invisible slit that shows only as you walk. On the belt, La Fatima hand-embroiders or beads an Amazigh sign. Soft-draping Jawhara - silk and viscose, a discreet lurex thread - is machine-washable, doesn't mark under the iron, stays nearly wrinkle-free. Cut by hand in Guéliz, size-free, XS to XXL by your knot. A plain piece that holds the whole day and slips into evening unchanged.",
  "es": "El largo baja hasta el tobillo y da a la tela espacio para desplegarse - sigue la pierna, se abre al andar, se cierra al detenerse. Se enrolla, se cruza, se anuda: puesta en segundos como un pareo de verdad. Cinturón alto y ancho que sujeta bien, volantes en el bajo para un movimiento casi danzante, y una abertura casi invisible que solo se revela al caminar. En el cinturón, La Fatima borda o borda con cuentas a mano un signo amazigh. Jawhara de caída suave - seda y viscosa, un hilo de lúrex discreto - se lava a máquina, no se marca al planchar y queda casi inarrugable. Cortada a mano en Guéliz, sin talla, de la XS a la XXL según el nudo. Una pieza sobria que aguanta el día entero y se desliza hacia la noche sin cambiarla.",
  "tr": "Boy bileğe iner ve kumaşa açılacak yer verir - bacağı izler, yürürken açılır, durunca kapanır. Sararsın, çaprazlarsın, bağlarsın: gerçek bir pareo gibi saniyeler içinde giyilir. İyi tutan yüksek ve geniş bir kuşak, neredeyse dans eden bir hareket için eteğinde farbalalar, ve yalnızca yürürken belli olan neredeyse görünmez bir yırtmaç. Kuşağın üzerine La Fatima elle bir Amazigh işareti işler ya da boncukla süsler. Yumuşak dökümlü Jawhara - ipek ve viskon, ince bir lüreks ipliği - makinede yıkanır, ütüde iz bırakmaz, neredeyse hiç buruşmaz. Guéliz'de elle kesilir, bedensiz, düğüme göre XS'ten XXL'e. Bütün gün dayanan ve değiştirilmeden akşama kayan sade bir parça.",
  "ar": "ينزل الطول حتى الكاحل ويمنح القماش متّسعاً لينفرد - يتبع الساق، ينفتح مع الخطوة، ينغلق عند الوقوف. تلفّينه، تعقدينه: يُرتدى في ثوانٍ كباريو حقيقي. حزام عريض ومرتفع يمسك جيداً، وكشاكش عند الحاشية لحركة تكاد ترقص، وشقّ يكاد لا يُرى لا يظهر إلا مع المشي. على الحزام، تطرّز لافاطمة أو تُرصّع يدوياً رمزاً أمازيغياً. جوهرة ناعم الانسدال - حرير وفيسكوز، مع خيط لوريكس خفيف - يُغسل في الغسالة، ولا يترك أثراً عند الكي، ويبقى شبه خالٍ من التجاعيد. تُقصّ يدوياً في كليز، بلا مقاس، من XS إلى XXL حسب العقدة. قطعة بسيطة تصمد اليوم بأكمله وتنساب إلى المساء دون تبديل."
 },
 "material": {
  "fr": "Jawhara, notre tissu maison - soie et viscose, avec un fil de lurex discret ; tombe souple, se lave en machine, quasi infroissable.",
  "en": "Jawhara, our house fabric - silk and viscose, with a discreet lurex thread; soft drape, machine-washable, nearly wrinkle-free.",
  "es": "Jawhara, nuestro tejido de la casa - seda y viscosa, con un hilo de lúrex discreto; caída suave, lavable a máquina, casi inarrugable.",
  "tr": "Jawhara, kendi kumaşımız - ipek ve viskon, ince bir lüreks ipliğiyle; yumuşak döküm, makinede yıkanabilir, neredeyse hiç buruşmaz.",
  "ar": "جوهرة، قماشنا الخاص - حرير وفيسكوز، مع خيط لوريكس خفيف؛ انسدال ناعم، يُغسل في الغسالة، شبه خالٍ من التجاعيد."
 },
 "fabric": {
  "fr": "Jawhara naît chez nous ; coupe, volants et signe amazigh sur la ceinture restent à la main, à Guéliz.",
  "en": "Jawhara is ours; cut, ruffles and the Amazigh sign on the belt stay by hand, in Guéliz.",
  "es": "Jawhara nace en casa; corte, volantes y el signo amazigh del cinturón quedan a mano, en Guéliz.",
  "tr": "Jawhara bizim elimizden çıkar; kesim, farbalalar ve kuşaktaki Amazigh işareti Guéliz'de elle kalır.",
  "ar": "جوهرة يُصنع عندنا؛ القص والكشاكش والرمز الأمازيغي على الحزام تبقى يدوية، في كليز."
 },
 "handworkTime": {
  "fr": "Coupée et finie main à l'atelier ; le signe amazigh est brodé ou perlé par La Fatima.",
  "en": "Cut and finished by hand at the atelier; the Amazigh sign is embroidered or beaded by La Fatima.",
  "es": "Cortada y acabada a mano en el taller; el signo amazigh lo borda o borda con cuentas La Fatima.",
  "tr": "Atölyede elle kesilip bitirilir; Amazigh işaretini La Fatima işler ya da boncukla süsler.",
  "ar": "تُقصّ وتُنهى يدوياً في الورشة؛ والرمز الأمازيغي تطرّزه أو تُرصّعه لافاطمة."
 },
 "dimensions": {
 "fr": "Sans taille - le nœud porte du XS au XXL.",
 "en": "Size-free - the knot carries it XS to XXL."
 },
 "edition": {
 "fr": "Édition limitée Jawhara, faite main.",
 "en": "Limited Jawhara edition, handmade."
 }
 },
 {
 "handle": "yza-pareo-skirt-x-long-jawhara-ss26",
 "short": {
 "fr": "Une jupe paréo extra-longue qui effleure le sol. De la longueur, beaucoup d'aisance.",
 "en": "An extra-long pareo skirt that grazes the floor. Length, and plenty of ease."
 },
 "desc": {
  "fr": "Le tissu va jusqu'au sol et l'effleure à chaque pas - la lumière de Marrakech s'y accroche tout en bas. On l'enroule, on croise, on noue : mise en quelques secondes comme un vrai paréo. Ceinture haute et large qui tient bien, volants au bas pour un mouvement presque dansant, et une fente presque invisible qui ne se révèle qu'à la marche. Sur la ceinture, La Fatima brode ou perle main un signe amazigh. Jawhara au tombé souple - soie et viscose, un fil de lurex discret - se lave en machine, ne marque pas au repassage, reste quasi infroissable. Coupée main à Guéliz, sans taille, du XS au XXL selon le nœud. Pour les jours où l'on a envie de traîner un peu de longueur derrière soi sans rien sacrifier à la liberté du pas.",
  "en": "The cloth reaches the floor and grazes it at every step - the Marrakech light snags right at the hem. Wrap it, cross it, knot it: on in seconds like a real pareo. A wide high belt that holds, ruffles at the hem for an almost-dancing movement, and a near-invisible slit that shows only as you walk. On the belt, La Fatima hand-embroiders or beads an Amazigh sign. Soft-draping Jawhara - silk and viscose, a discreet lurex thread - is machine-washable, doesn't mark under the iron, stays nearly wrinkle-free. Cut by hand in Guéliz, size-free, XS to XXL by your knot. For the days you want to trail a little length behind you without giving up an inch of stride.",
  "es": "La tela llega hasta el suelo y lo roza a cada paso - la luz de Marrakech se engancha justo abajo. Se enrolla, se cruza, se anuda: puesta en segundos como un pareo de verdad. Cinturón alto y ancho que sujeta bien, volantes en el bajo para un movimiento casi danzante, y una abertura casi invisible que solo se revela al caminar. En el cinturón, La Fatima borda o borda con cuentas a mano un signo amazigh. Jawhara de caída suave - seda y viscosa, un hilo de lúrex discreto - se lava a máquina, no se marca al planchar y queda casi inarrugable. Cortada a mano en Guéliz, sin talla, de la XS a la XXL según el nudo. Para los días en que apetece arrastrar un poco de largo tras de sí sin sacrificar nada de la libertad del paso.",
  "tr": "Kumaş yere kadar iner ve her adımda yeri okşar - Marakeş ışığı tam eteğin ucunda takılır. Sararsın, çaprazlarsın, bağlarsın: gerçek bir pareo gibi saniyeler içinde giyilir. İyi tutan yüksek ve geniş bir kuşak, neredeyse dans eden bir hareket için eteğinde farbalalar, ve yalnızca yürürken belli olan neredeyse görünmez bir yırtmaç. Kuşağın üzerine La Fatima elle bir Amazigh işareti işler ya da boncukla süsler. Yumuşak dökümlü Jawhara - ipek ve viskon, ince bir lüreks ipliği - makinede yıkanır, ütüde iz bırakmaz, neredeyse hiç buruşmaz. Guéliz'de elle kesilir, bedensiz, düğüme göre XS'ten XXL'e. Adımın özgürlüğünden bir parça bile ödün vermeden ardında biraz uzunluk sürüklemek istediğin günler için.",
  "ar": "يصل القماش حتى الأرض ويلامسها مع كل خطوة - يعلق ضوء مراكش في أسفله تماماً. تلفّينه، تعقدينه: يُرتدى في ثوانٍ كباريو حقيقي. حزام عريض ومرتفع يمسك جيداً، وكشاكش عند الحاشية لحركة تكاد ترقص، وشقّ يكاد لا يُرى لا يظهر إلا مع المشي. على الحزام، تطرّز لافاطمة أو تُرصّع يدوياً رمزاً أمازيغياً. جوهرة ناعم الانسدال - حرير وفيسكوز، مع خيط لوريكس خفيف - يُغسل في الغسالة، ولا يترك أثراً عند الكي، ويبقى شبه خالٍ من التجاعيد. تُقصّ يدوياً في كليز، بلا مقاس، من XS إلى XXL حسب العقدة. لأيامٍ ترغبين فيها بجرّ قليل من الطول خلفك دون التنازل عن ذرّة من حرية الخطوة."
 },
 "material": {
  "fr": "Jawhara, notre tissu maison - soie et viscose, avec un fil de lurex discret ; tombe souple, se lave en machine, quasi infroissable.",
  "en": "Jawhara, our house fabric - silk and viscose, with a discreet lurex thread; soft drape, machine-washable, nearly wrinkle-free.",
  "es": "Jawhara, nuestro tejido de la casa - seda y viscosa, con un hilo de lúrex discreto; caída suave, lavable a máquina, casi inarrugable.",
  "tr": "Jawhara, kendi kumaşımız - ipek ve viskon, ince bir lüreks ipliğiyle; yumuşak döküm, makinede yıkanabilir, neredeyse hiç buruşmaz.",
  "ar": "جوهرة، قماشنا الخاص - حرير وفيسكوز، مع خيط لوريكس خفيف؛ انسدال ناعم، يُغسل في الغسالة، شبه خالٍ من التجاعيد."
 },
 "fabric": {
  "fr": "Jawhara naît chez nous ; coupe, volants et signe amazigh sur la ceinture restent à la main, à Guéliz.",
  "en": "Jawhara is ours; cut, ruffles and the Amazigh sign on the belt stay by hand, in Guéliz.",
  "es": "Jawhara nace en casa; corte, volantes y el signo amazigh del cinturón quedan a mano, en Guéliz.",
  "tr": "Jawhara bizim elimizden çıkar; kesim, farbalalar ve kuşaktaki Amazigh işareti Guéliz'de elle kalır.",
  "ar": "جوهرة يُصنع عندنا؛ القص والكشاكش والرمز الأمازيغي على الحزام تبقى يدوية، في كليز."
 },
 "handworkTime": {
  "fr": "Coupée et finie main à l'atelier ; le signe amazigh est brodé ou perlé par La Fatima.",
  "en": "Cut and finished by hand at the atelier; the Amazigh sign is embroidered or beaded by La Fatima.",
  "es": "Cortada y acabada a mano en el taller; el signo amazigh lo borda o borda con cuentas La Fatima.",
  "tr": "Atölyede elle kesilip bitirilir; Amazigh işaretini La Fatima işler ya da boncukla süsler.",
  "ar": "تُقصّ وتُنهى يدوياً في الورشة؛ والرمز الأمازيغي تطرّزه أو تُرصّعه لافاطمة."
 },
 "dimensions": {
 "fr": "Sans taille - du XS au XXL selon le nœud.",
 "en": "Size-free - XS to XXL depending on the knot."
 },
 "edition": {
 "fr": "Édition limitée Jawhara, faite main.",
 "en": "Limited Jawhara edition, handmade."
 }
 },
 {
 "handle": "yza-palazzo-pants-jawhara-ss26",
 "short": {
 "fr": "Un palazzo large qui suit le pas comme une vague. Coupé long, à mettre à ta hauteur.",
 "en": "A wide palazzo that follows your stride like a wave. Cut long, set to your height."
 },
 "desc": {
  "fr": "La jambe s'ouvre en XXL et le tissu ondule derrière chaque pas - on dirait presque une jupe. Taille haute, coulisse à nouer, et un pli tulipe qu'on a gardé volontairement au-dessus du cordon pour donner du mouvement au ventre. Au bout de la coulisse, La Fatima fixe main deux pampilles perlées d'or qui dansent quand on marche. Des poches invisibles, un tombé souple : soie et viscose, un fil de lurex discret qui capte la lumière de Marrakech. Jawhara se lave en machine, ne marque pas au repassage, reste quasi infroissable. Coupé et fini main à Guéliz. Sans taille, du XS au XXL. On l'a fait très long à dessein : un ourlet rapide, sur mesure à la commande, et il tombe pile à ta cheville. Pieds nus ou en sandales, du matin au soir, il ne demande rien.",
  "en": "The leg opens to an XXL width and the cloth ripples behind each step - almost a skirt. High waist, drawstring to tie, and a tulip pleat we deliberately kept above the cord to give the front some movement. At the cord ends, La Fatima hand-fixes two golden beaded pampilles that dance as you walk. Invisible pockets, a soft drape: silk and viscose, a discreet lurex thread that catches the Marrakech light. Jawhara is machine-washable, doesn't mark under the iron, stays nearly wrinkle-free. Cut and finished by hand in Guéliz. Size-free, XS to XXL. We made it very long on purpose: a quick hem, custom on order, and it lands right at your ankle. Bare feet or sandals, morning to night, it asks nothing of you.",
  "es": "La pierna se abre en un ancho XXL y la tela ondula tras cada paso - casi una falda. Talle alto, cordón para anudar y un pliegue tulipa que dejamos a propósito por encima del cordón para dar movimiento al frente. En los extremos del cordón, La Fatima fija a mano dos pampallitas doradas con cuentas que bailan al caminar. Bolsillos invisibles y una caída suave: seda y viscosa, con un hilo de lúrex discreto que atrapa la luz de Marrakech. Jawhara se lava a máquina, no se marca al planchar y queda casi inarrugable. Cortado y acabado a mano en Guéliz. Sin talla, de la XS a la XXL. Lo hicimos muy largo a propósito: un dobladillo rápido, a medida bajo pedido, y cae justo en el tobillo. Descalza o en sandalias, de la mañana a la noche, no te pide nada.",
  "tr": "Paça XXL genişliğinde açılır ve kumaş her adımda arkadan dalgalanır - neredeyse bir etek. Yüksek bel, bağlanan bir büzgü ipi ve öne hareket katmak için ipin üstünde bilerek bıraktığımız bir lale pilisi. İp uçlarında La Fatima, yürürken dans eden iki altın boncuklu püskülü elle tutturur. Görünmez cepler, yumuşak bir dökümlülük: ipek ve viskon, Marakeş ışığını yakalayan ince bir lüreks ipliği. Jawhara makinede yıkanır, ütüde iz bırakmaz, neredeyse hiç buruşmaz. Guéliz'de elle kesilip bitirilir. Bedensiz, XS'ten XXL'e. Bilerek çok uzun yaptık: hızlı bir baskı dikişi, siparişe özel, ve tam bileğine iner. Yalın ayak ya da sandaletle, sabahtan akşama, senden hiçbir şey istemez.",
  "ar": "تنفتح الساق باتساع XXL ويتموّج القماش خلف كل خطوة - يكاد يشبه التنورة. خصر مرتفع، ورباط يُعقد، وثنية على شكل زهرة التوليب أبقيناها عمداً فوق الرباط لتمنح المقدمة بعض الحركة. عند طرفي الرباط، تثبّت لافاطمة يدوياً شرّابتين ذهبيتين مرصّعتين بالخرز ترقصان مع المشي. جيوب خفية وانسدال ناعم: حرير وفيسكوز، مع خيط لوريكس خفيف يلتقط ضوء مراكش. يُغسل جوهرة في الغسالة، ولا يترك أثراً عند الكي، ويبقى شبه خالٍ من التجاعيد. يُقصّ ويُنهى يدوياً في كليز. بلا مقاس، من XS إلى XXL. صنعناه طويلاً جداً عن قصد: تنّورة سريعة، مفصّلة عند الطلب، فيستقر تماماً عند كاحلك. حافية أو بصندل، من الصباح إلى المساء، لا يطلب منك شيئاً."
 },
 "material": {
  "fr": "Jawhara, notre tissu maison - soie et viscose, avec un fil de lurex discret ; tombe souple, se lave en machine, quasi infroissable.",
  "en": "Jawhara, our house fabric - silk and viscose, with a discreet lurex thread; soft drape, machine-washable, nearly wrinkle-free.",
  "es": "Jawhara, nuestro tejido de la casa - seda y viscosa, con un hilo de lúrex discreto; caída suave, lavable a máquina, casi inarrugable.",
  "tr": "Jawhara, kendi kumaşımız - ipek ve viskon, ince bir lüreks ipliğiyle; yumuşak döküm, makinede yıkanabilir, neredeyse hiç buruşmaz.",
  "ar": "جوهرة، قماشنا الخاص - حرير وفيسكوز، مع خيط لوريكس خفيف؛ انسدال ناعم، يُغسل في الغسالة، شبه خالٍ من التجاعيد."
 },
 "fabric": {
  "fr": "Jawhara naît chez nous ; coupe, ourlet et pampilles perlées restent dans nos mains, à Guéliz.",
  "en": "Jawhara is ours; cut, hem and beaded pampilles stay in our hands, in Guéliz.",
  "es": "Jawhara nace en casa; corte, dobladillo y pampallitas con cuentas quedan en nuestras manos, en Guéliz.",
  "tr": "Jawhara bizim elimizden çıkar; kesim, baskı dikişi ve boncuklu püsküller Guéliz'de bizim ellerimizde kalır.",
  "ar": "جوهرة يُصنع عندنا؛ القص والتنّورة والشرّابات المرصّعة تبقى بين أيدينا، في كليز."
 },
 "handworkTime": {
  "fr": "Coupé et fini main à l'atelier ; les pampilles perlées sont posées une à une par La Fatima.",
  "en": "Cut and finished by hand at the atelier; the beaded pampilles are set one by one by La Fatima.",
  "es": "Cortado y acabado a mano en el taller; las pampallitas con cuentas las coloca una a una La Fatima.",
  "tr": "Atölyede elle kesilip bitirilir; boncuklu püskülleri La Fatima tek tek yerleştirir.",
  "ar": "يُقصّ ويُنهى يدوياً في الورشة؛ والشرّابات المرصّعة تضعها لافاطمة واحدةً واحدة."
 },
 "dimensions": {
 "fr": "Sans taille - du XS au XXL, coupé très long, ourlet facile.",
 "en": "Size-free - XS to XXL, cut very long, easy to hem."
 },
 "edition": {
 "fr": "Édition limitée Jawhara, faite main.",
 "en": "Limited Jawhara edition, handmade."
 }
 },
 {
 "handle": "yza-wrap-pants-jawhara-ss26",
 "short": {
 "fr": "Un pantalon portefeuille noué à la taille. Pas de bouton, pas de pression sur le ventre.",
 "en": "Wrap trousers tied at the waist. No button, no pressure on the belly."
 },
 "desc": {
  "fr": "Notre pantalon sans taille par excellence : pas de bouton ni de zip, deux pans qui se croisent, un dos plat à cordon et une ceinture qui se noue devant. La taille s'ouvre ou se resserre selon le jour, rien ne serre le ventre. Sur la ceinture, La Fatima brode ou perle main un signe amazigh, ton sur ton, discret comme une signature. Jawhara au tombé souple - soie et viscose, un fil de lurex discret - se lave en machine, ne marque pas au repassage, reste quasi infroissable. Coupé et fini main à Guéliz. Sans taille, du XS au XXL : c'est le nœud qui mène. Du marché du matin à la terrasse du soir, on oublie qu'on le porte.",
  "en": "Our no-size basic par excellence: no button, no zip, two panels that cross, a flat corded back and a belt that ties in front. The waist opens or draws in as the day asks, nothing grips the belly. On the belt, La Fatima hand-embroiders or beads an Amazigh sign, tone on tone, discreet as a signature. Soft-draping Jawhara - silk and viscose, a discreet lurex thread - is machine-washable, doesn't mark under the iron, stays nearly wrinkle-free. Cut and finished by hand in Guéliz. Size-free, XS to XXL: the knot leads. From the morning market to the evening terrace, you forget you have them on.",
  "es": "Nuestro básico sin talla por excelencia: sin botón ni cremallera, dos paños que se cruzan, una espalda plana con cordón y un cinturón que se anuda delante. El talle se abre o se ajusta según el día, nada aprieta el vientre. En el cinturón, La Fatima borda o borda con cuentas a mano un signo amazigh, tono sobre tono, discreto como una firma. Jawhara de caída suave - seda y viscosa, un hilo de lúrex discreto - se lava a máquina, no se marca al planchar y queda casi inarrugable. Cortado y acabado a mano en Guéliz. Sin talla, de la XS a la XXL: manda el nudo. Del mercado de la mañana a la terraza de la noche, te olvidas de que lo llevas.",
  "tr": "Bedensiz temel parçamızın en hası: düğme yok, fermuar yok, çaprazlanan iki pan, ipli düz bir arka ve önden bağlanan bir kuşak. Bel, günün isteğine göre açılır ya da toplanır, hiçbir şey karnı sıkmaz. Kuşağın üzerine La Fatima, imza kadar ince, ton sıra ton bir Amazigh işareti elle işler ya da boncukla süsler. Yumuşak dökümlü Jawhara - ipek ve viskon, ince bir lüreks ipliği - makinede yıkanır, ütüde iz bırakmaz, neredeyse hiç buruşmaz. Guéliz'de elle kesilip bitirilir. Bedensiz, XS'ten XXL'e: düğüm yönetir. Sabah pazarından akşam terasına, üzerinde olduğunu unutursun.",
  "ar": "بنطالنا بلا مقاس بامتياز: بلا زر ولا سحّاب، طيّتان تتقاطعان، ظهر مسطّح برباط، وحزام يُعقد من الأمام. يتّسع الخصر أو يضيق حسب اليوم، ولا شيء يضغط على البطن. على الحزام، تطرّز لافاطمة أو تُرصّع يدوياً رمزاً أمازيغياً، لوناً على لون، خفياً كتوقيع. جوهرة ناعم الانسدال - حرير وفيسكوز، مع خيط لوريكس خفيف - يُغسل في الغسالة، ولا يترك أثراً عند الكي، ويبقى شبه خالٍ من التجاعيد. يُقصّ ويُنهى يدوياً في كليز. بلا مقاس، من XS إلى XXL: العقدة هي التي تقود. من سوق الصباح إلى شرفة المساء، تنسى أنك ترتديه."
 },
 "material": {
  "fr": "Jawhara, notre tissu maison - soie et viscose, avec un fil de lurex discret ; tombe souple, se lave en machine, quasi infroissable.",
  "en": "Jawhara, our house fabric - silk and viscose, with a discreet lurex thread; soft drape, machine-washable, nearly wrinkle-free.",
  "es": "Jawhara, nuestro tejido de la casa - seda y viscosa, con un hilo de lúrex discreto; caída suave, lavable a máquina, casi inarrugable.",
  "tr": "Jawhara, kendi kumaşımız - ipek ve viskon, ince bir lüreks ipliğiyle; yumuşak döküm, makinede yıkanabilir, neredeyse hiç buruşmaz.",
  "ar": "جوهرة، قماشنا الخاص - حرير وفيسكوز، مع خيط لوريكس خفيف؛ انسدال ناعم، يُغسل في الغسالة، شبه خالٍ من التجاعيد."
 },
 "fabric": {
  "fr": "Jawhara naît chez nous ; coupe, finitions et signe amazigh sur la ceinture restent à la main, à Guéliz.",
  "en": "Jawhara is ours; cut, finishing and the Amazigh sign on the belt stay by hand, in Guéliz.",
  "es": "Jawhara nace en casa; corte, acabados y el signo amazigh del cinturón quedan a mano, en Guéliz.",
  "tr": "Jawhara bizim elimizden çıkar; kesim, bitişler ve kuşaktaki Amazigh işareti Guéliz'de elle kalır.",
  "ar": "جوهرة يُصنع عندنا؛ القص والتشطيب والرمز الأمازيغي على الحزام تبقى يدوية، في كليز."
 },
 "handworkTime": {
  "fr": "Coupé et fini main à l'atelier ; le signe amazigh est brodé ou perlé par La Fatima.",
  "en": "Cut and finished by hand at the atelier; the Amazigh sign is embroidered or beaded by La Fatima.",
  "es": "Cortado y acabado a mano en el taller; el signo amazigh lo borda o borda con cuentas La Fatima.",
  "tr": "Atölyede elle kesilip bitirilir; Amazigh işaretini La Fatima işler ya da boncukla süsler.",
  "ar": "يُقصّ ويُنهى يدوياً في الورشة؛ والرمز الأمازيغي تطرّزه أو تُرصّعه لافاطمة."
 },
 "dimensions": {
 "fr": "Sans taille - le nœud règle du XS au XXL.",
 "en": "Size-free - the knot sets it from XS to XXL."
 },
 "edition": {
 "fr": "Édition limitée Jawhara, faite main ; le tissu varie parfois selon les arrivages.",
 "en": "Limited Jawhara edition, handmade; the fabric sometimes varies with deliveries."
 }
 }
 ],
 "bags": [
 {
 "handle": "la-sculpture-xs-basket-bag-ss26",
 "short": {
  "fr": "Le plus petit panier de la famille - et pourtant il en avale : téléphone, carnet, lunettes, un foulard, tous vos essentiels du jour. Raphia et feuille de bananier, rien que ce que la terre a donné.",
  "en": "The smallest basket in the family - and yet it swallows it all: phone, notebook, sunglasses, a scarf, your whole day's essentials. Raffia and banana leaf, nothing but what the earth gave.",
  "es": "El cesto más pequeño de la familia y, aun así, se lo traga todo: móvil, cuaderno, gafas, un pañuelo, todos tus imprescindibles del día. Rafia y hoja de banano, nada más que lo que dio la tierra.",
  "tr": "Ailenin en küçük sepeti ama yine de hepsini yutuyor: telefon, defter, gözlük, bir eşarp, günün tüm gerekliliği. Rafya ve muz yaprağı, yalnızca toprağın verdiği.",
  "ar": "أصغر سلة في العائلة، ومع ذلك تبتلع كل شيء: الهاتف، دفتر، النظارات، وشاح، كل أساسيات يومك. رافيا وورق الموز، لا شيء سوى ما جادت به الأرض."
 },
 "desc": {
  "fr": "Assez petit pour tenir dans la paume, et bien plus contenant qu'on ne le croit. Ici, rien que du raphia et de la feuille de bananier - pas un gramme de cuir, rien que ce que la terre a donné, façonné à la main. Les anses cachent une âme en fil de fer que Fatima cintre à la main avant de l'envelopper de raphia, comme un sculpteur travaille le métal avant d'y poser l'argile : vous pouvez les recourber, les repositionner à votre gré. Les formes rappellent les arches des portes de la médina, le tracé sinueux des ruelles ; les couleurs, celles des vieilles portes marocaines - rouge, noir, violet. À l'intérieur, un pochon doublé de Jawhara, ponctué de pompons de raphia. Téléphone, porte-cartes, clés, lunettes, un petit foulard : tout y trouve sa place, on referme et on part les mains libres. Deux anses ne sont jamais tout à fait pareilles, deux paniers non plus.",
  "en": "Small enough to sit in the palm, and far roomier than you'd think. Here it's raffia and banana leaf only - not a gram of leather, nothing but what the earth gave, shaped by hand. The handles hide a wire core that Fatima bends by hand before wrapping it in raffia, the way a sculptor works the metal before laying on the clay: you can curve them, reposition them as you like. The shapes echo the arches of the medina doors, the winding line of the alleys; the colours, those of old Moroccan doors - red, black, purple. Inside, a Jawhara-lined pouch dotted with raffia pompoms. Phone, card holder, keys, sunglasses, a small scarf: it all finds a place, close it and leave hands free. No two handles are ever quite alike, and no two baskets either.",
  "es": "Lo bastante pequeño para caber en la palma, y mucho más amplio de lo que parece. Aquí solo hay rafia y hoja de banano - ni un gramo de cuero, nada más que lo que dio la tierra, moldeado a mano. Las asas esconden un alma de alambre que Fatima curva a mano antes de envolverla en rafia, como un escultor trabaja el metal antes de posar la arcilla: puedes doblarlas, recolocarlas a tu gusto. Las formas evocan los arcos de las puertas de la medina, el trazado sinuoso de las callejuelas; los colores, los de las viejas puertas marroquíes - rojo, negro, violeta. Dentro, una bolsita forrada de Jawhara, salpicada de pompones de rafia. Móvil, tarjetero, llaves, gafas, un pañuelo pequeño: todo encuentra su sitio, se cierra y sales con las manos libres. No hay dos asas iguales, ni dos cestos tampoco.",
  "tr": "Avuca sığacak kadar küçük, sandığınızdan çok daha ferah. Burada yalnızca rafya ve muz yaprağı var - bir gram deri yok, yalnızca toprağın verdiği, elle biçimlenmiş. Saplar, Fatima'nın rafyayla sarmadan önce elle büktüğü bir tel özü saklıyor; tıpkı bir heykeltıraşın kili koymadan önce metali işlemesi gibi: dilediğiniz gibi kıvırabilir, yeniden konumlandırabilirsiniz. Biçimler medina kapılarının kemerlerini, sokakların kıvrımlı çizgisini anımsatır; renkler ise eski Fas kapılarının renklerini - kırmızı, siyah, mor. İçinde, rafya ponponlarla süslü, Jawhara astarlı bir kese. Telefon, kartlık, anahtar, gözlük, küçük bir eşarp: hepsi yerini buluyor, kapatıp elleriniz serbest çıkıyorsunuz. İki sap asla tam olarak birbirine benzemez, iki sepet de öyle.",
  "ar": "صغيرة بما يكفي لتستقر في راحة اليد، وأوسع بكثير مما تظن. هنا رافيا وورق الموز فقط - لا غرام واحد من الجلد، لا شيء سوى ما جادت به الأرض، مُشكَّل باليد. تُخفي المقابض روحًا من السلك تُقوّسها فاطمة بيدها قبل أن تلفّها بالرافيا، كما ينحت النحّات المعدن قبل أن يضع الطين: يمكنك ثنيها وإعادة تشكيلها كما يحلو لك. تستحضر الأشكال أقواس أبواب المدينة القديمة وخط الأزقة المتعرّج؛ أما الألوان فألوان الأبواب المغربية العتيقة - الأحمر والأسود والبنفسجي. في الداخل، كيس مبطّن بـ Jawhara مرصّع بكرات الرافيا. الهاتف، حامل البطاقات، المفاتيح، النظارات، وشاح صغير: كل شيء يجد مكانه، تُغلقها وتمضي ويداك حرّتان. لا يتشابه مقبضان تمامًا، ولا سلّتان كذلك."
 },
 "material": {
  "fr": "Raphia et feuille de bananier uniquement - aucun cuir. Anses à âme en fil de fer cintrée main puis gainée de raphia, que l'on peut recourber à volonté ; intérieur avec pochon doublé de Jawhara et pompons de raphia. Coloris Hot Red, Deep Violet ou Black Olive.",
  "en": "Raffia and banana leaf only - no leather. Handles built on a hand-bent wire core sheathed in raffia, which you can reshape at will; interior with a Jawhara-lined pouch and raffia pompoms. In Hot Red, Deep Violet or Black Olive.",
  "es": "Solo rafia y hoja de banano - sin cuero. Asas con alma de alambre curvada a mano y envuelta en rafia, que puedes remodelar a voluntad; interior con bolsita forrada de Jawhara y pompones de rafia. En Hot Red, Deep Violet o Black Olive.",
  "tr": "Yalnızca rafya ve muz yaprağı - deri yok. Elde bükülüp rafyayla sarılan tel özlü saplar dilediğiniz gibi yeniden biçimlenir; içeride Jawhara astarlı kese ve rafya ponponlar. Hot Red, Deep Violet veya Black Olive renklerinde.",
  "ar": "رافيا وورق الموز فقط - بلا جلد. مقابض بروح من السلك تُقوّس باليد ثم تُغلَّف بالرافيا، ويمكنك إعادة تشكيلها كما تشاء؛ الداخل بكيس مبطّن بـ Jawhara وكرات رافيا. بألوان Hot Red أو Deep Violet أو Black Olive."
 },
 "fabric": {
  "fr": "La signature de La Sculpture, c'est l'anse : une âme en fil de fer cintrée à la main puis gainée de raphia, qu'on recourbe à sa guise, sur un tissage serré et solaire de feuille de bananier.",
  "en": "The La Sculpture signature is the handle: a wire core bent by hand then sheathed in raffia, curved however you like, over a tight, sun-warm banana-leaf weave.",
  "es": "La firma de La Sculpture es el asa: un alma de alambre curvada a mano y luego envuelta en rafia, que se dobla a tu antojo, sobre un tejido de hoja de banano apretado y cálido.",
  "tr": "La Sculpture'ün imzası saptır: elde bükülüp rafyayla sarılan, dilediğiniz gibi kıvrılan bir tel öz; sıkı ve güneş sıcaklığında muz yaprağı dokuma üzerinde.",
  "ar": "توقيع La Sculpture هو المقبض: روح من السلك تُقوّس باليد ثم تُغلَّف بالرافيا، تنثنيها كما تشاء، فوق نسيج محكم ودافئ من ورق الموز."
 },
 "handworkTime": {
  "fr": "Tout fait main par Fatima et son équipe à Guéliz - entre 35 et 85 heures selon la pièce, du cintrage des anses au dernier contrôle.",
  "en": "All made by hand by Fatima and her team in Guéliz - between 35 and 85 hours depending on the piece, from bending the handles to the last check.",
  "es": "Todo hecho a mano por Fatima y su equipo en Guéliz - entre 35 y 85 horas según la pieza, desde el curvado de las asas hasta el último control.",
  "tr": "Tümü Guéliz'de Fatima ve ekibi tarafından elde yapılır - parçaya göre 35 ila 85 saat, sapların bükülmesinden son kontrole kadar.",
  "ar": "كل شيء يُصنع يدويًا على يد فاطمة وفريقها في كليز - بين 35 و85 ساعة حسب القطعة، من تقويس المقابض حتى الفحص الأخير."
 },
 "dimensions": {
 "fr": "Le plus petit format - un mini panier à la main ou en courte bandoulière. Dimensions : 36 × 22 × 11 cm.",
 "en": "The smallest size - a mini basket by hand or on a short shoulder strap. Dimensions: 36 × 22 × 11 cm.",
 "es": "La talla más pequeña - un mini cesto en la mano o en bandolera corta. Dimensiones: 36 × 22 × 11 cm.",
 "tr": "En küçük beden - elde ya da kısa askıda mini sepet. Ölçüler: 36 × 22 × 11 cm.",
 "ar": "أصغر مقاس - سلة صغيرة تُحمل باليد أو بحزام كتف قصير. الأبعاد: 36 × 22 × 11 سم."
 },
 "edition": {
 "fr": "Édition très limitée - faite main, par séries de 15 par taille et par coloris, le temps de la série, sans réassort garanti.",
 "en": "Very limited edition - handmade in runs of 15 per size and colour, for as long as the series runs, with no guaranteed restock.",
 "es": "Edición muy limitada - hecha a mano, en series de 15 por talla y color, mientras dure la serie, sin reposición garantizada.",
 "tr": "Çok sınırlı üretim - elde, beden ve renk başına 15 adetlik serilerle, seri sürdüğü sürece, garantili stok yenileme yok.",
 "ar": "إصدار محدود جدًا - مصنوع يدويًا بسلاسل من 15 قطعة لكل مقاس ولون، طوال مدة السلسلة، دون ضمان إعادة التوفير."
 },
 "modelNote": {
 "fr": "Mannequin : Nawal mesure 1 m 55 et porte du XS/S.",
 "en": "Model: Nawal is 1m55 and wears XS/S.",
 "es": "Modelo: Nawal mide 1,55 m y usa XS/S.",
 "tr": "Manken: Nawal 1,55 m boyunda ve XS/S beden giyiyor.",
 "ar": "العارضة: نوال طولها 1.55 م وترتدي مقاس XS/S."
 },
 "styleTip": {
 "fr": "Noir pour une allure sculpturale intemporelle, Rouge pour une déclaration estivale audacieuse, Violet pour un esprit plus artistique et inattendu.",
 "en": "Choose Black for a timeless sculptural look, Red for a bold summer statement, and Purple for a more artistic, unexpected feel.",
 "es": "Elige Negro para un look escultural atemporal, Rojo para una declaración veraniega audaz y Violeta para un aire más artístico e inesperado.",
 "tr": "Zamansız heykelsi bir görünüm için Siyah, iddialı bir yaz ifadesi için Kırmızı, daha sanatsal ve beklenmedik bir hava için Mor'u seçin.",
 "ar": "اختر الأسود لإطلالة نحتية خالدة، والأحمر للمسة صيفية جريئة، والبنفسجي لروح أكثر فنية وغير متوقعة."
 },
 "whatFits": {
 "fr": "Téléphone, carnet, porte-cartes, clés, lunettes et un foulard - bien plus qu'on ne le croit.",
 "en": "Phone, notebook, card holder, keys, sunglasses and a scarf - far more than you'd think."
 },
 "making": {
  "fr": "Chaque panier naît sous les mains de Fatima, à Guéliz : elle cintre l'âme en fil de fer des anses avant de l'envelopper de raphia, comme un sculpteur travaille le métal, puis noue la feuille de bananier brin à brin - de 35 à 85 heures de travail, sans un gramme de cuir.",
  "en": "Each basket comes to life under Fatima's hands in Guéliz: she bends the wire core of the handles before wrapping it in raffia, the way a sculptor works the metal, then ties the banana leaf strand by strand - 35 to 85 hours of work, without a gram of leather.",
  "es": "Cada cesto nace bajo las manos de Fatima, en Guéliz: curva el alma de alambre de las asas antes de envolverla en rafia, como un escultor trabaja el metal, y luego anuda la hoja de banano hebra a hebra - de 35 a 85 horas de trabajo, sin un gramo de cuero.",
  "tr": "Her sepet Guéliz'de Fatima'nın elleri altında hayat bulur: sapların tel özünü, bir heykeltıraşın metali işlemesi gibi rafyayla sarmadan önce büker, ardından muz yaprağını lif lif düğümler - 35 ila 85 saatlik emek, bir gram deri olmadan.",
  "ar": "تُولد كل سلة تحت يدي فاطمة في كليز: تُقوّس روح السلك في المقابض قبل أن تلفّها بالرافيا، كما ينحت النحّات المعدن، ثم تعقد ورق الموز خيطًا خيطًا - من 35 إلى 85 ساعة عمل، دون غرام واحد من الجلد."
 }
 },
 {
 "handle": "la-sculpture-s-basket-bag-ss26",
 "short": {
  "fr": "Le format du milieu, celui qu'on prend sans réfléchir. Léger, il porte la journée - raphia et feuille de bananier, rien que ce que la terre a donné.",
  "en": "The middle size, the one you grab without thinking. Light, it carries the day - raffia and banana leaf, nothing but what the earth gave.",
  "es": "La talla intermedia, la que coges sin pensar. Ligero, lleva la jornada - rafia y hoja de banano, nada más que lo que dio la tierra.",
  "tr": "Orta beden, düşünmeden aldığınız. Hafif, günü taşıyor - rafya ve muz yaprağı, yalnızca toprağın verdiği.",
  "ar": "المقاس المتوسط، الذي تأخذه دون تفكير. خفيف، يحمل يومك كاملًا - رافيا وورق الموز، لا شيء سوى ما جادت به الأرض."
 },
 "desc": {
  "fr": "Le compromis juste : compact mais pas exigu, il suit la journée sans tirer sur l'épaule. Ici, rien que du raphia et de la feuille de bananier - aucun cuir, rien que ce que la terre a donné, façonné à la main. Les anses cachent une âme en fil de fer que Fatima cintre à la main avant de la gainer de raphia, comme un sculpteur travaille le métal avant d'y poser l'argile : recourbez-les, déplacez-les à votre gré. Leur dessin rappelle les arches des portes de la médina et le tracé sinueux des ruelles ; les coloris, ceux des vieilles portes marocaines. À l'intérieur, un pochon doublé de Jawhara et ses pompons de raphia. Téléphone, portefeuille, lunettes, un foulard fin : tout y trouve sa place. Le tissage garde la trace de la main qui l'a fait.",
  "en": "The right middle ground: compact but not cramped, it follows the day without dragging on the shoulder. Here it's raffia and banana leaf only - no leather, nothing but what the earth gave, shaped by hand. The handles hide a wire core Fatima bends by hand before sheathing it in raffia, the way a sculptor works the metal before laying on the clay: curve them, move them as you like. Their drawing echoes the arches of the medina doors and the winding line of the alleys; the colours, those of old Moroccan doors. Inside, a Jawhara-lined pouch and its raffia pompoms. Phone, wallet, sunglasses, a thin scarf: it all finds a place. The weave keeps the mark of the hand that made it.",
  "es": "El punto medio justo: compacto pero no estrecho, sigue la jornada sin tirar del hombro. Aquí solo hay rafia y hoja de banano - sin cuero, nada más que lo que dio la tierra, moldeado a mano. Las asas esconden un alma de alambre que Fatima curva a mano antes de envolverla en rafia, como un escultor trabaja el metal antes de posar la arcilla: cúrvalas, muévelas a tu gusto. Su dibujo evoca los arcos de las puertas de la medina y el trazado sinuoso de las callejuelas; los colores, los de las viejas puertas marroquíes. Dentro, una bolsita forrada de Jawhara y sus pompones de rafia. Móvil, cartera, gafas, un pañuelo fino: todo encuentra su sitio. El tejido guarda la huella de la mano que lo hizo.",
  "tr": "Tam ortada doğru denge: kompakt ama sıkışık değil, omuzu çekmeden günü izler. Burada yalnızca rafya ve muz yaprağı var - deri yok, yalnızca toprağın verdiği, elle biçimlenmiş. Saplar, Fatima'nın rafyayla sarmadan önce elle büktüğü bir tel özü saklar; tıpkı bir heykeltıraşın kili koymadan önce metali işlemesi gibi: dilediğiniz gibi kıvırın, kaydırın. Çizgileri medina kapılarının kemerlerini ve sokakların kıvrımlı hattını anımsatır; renkler eski Fas kapılarının renkleri. İçinde, Jawhara astarlı bir kese ve rafya ponponları. Telefon, cüzdan, gözlük, ince bir eşarp: hepsi yerini bulur. Dokuma, onu yapan elin izini taşır.",
  "ar": "التوازن الصحيح تمامًا: مدمجة لكن غير ضيّقة، تُرافق يومك دون أن تشدّ الكتف. هنا رافيا وورق الموز فقط - بلا جلد، لا شيء سوى ما جادت به الأرض، مُشكَّل باليد. تُخفي المقابض روحًا من السلك تُقوّسها فاطمة بيدها قبل أن تغلّفها بالرافيا، كما ينحت النحّات المعدن قبل أن يضع الطين: قوّسها وحرّكها كما تشاء. يستحضر رسمها أقواس أبواب المدينة القديمة وخط الأزقة المتعرّج؛ وألوانها ألوان الأبواب المغربية العتيقة. في الداخل، كيس مبطّن بـ Jawhara وكرات الرافيا. الهاتف، المحفظة، النظارات، وشاح رفيع: كل شيء يجد مكانه. يحتفظ النسيج بأثر اليد التي صنعته."
 },
 "material": {
  "fr": "Raphia et feuille de bananier uniquement - aucun cuir. Anses à âme en fil de fer cintrée main puis gainée de raphia, que l'on peut recourber à volonté ; intérieur avec pochon doublé de Jawhara et pompons de raphia. Coloris Hot Red, Deep Violet ou Black Olive.",
  "en": "Raffia and banana leaf only - no leather. Handles built on a hand-bent wire core sheathed in raffia, which you can reshape at will; interior with a Jawhara-lined pouch and raffia pompoms. In Hot Red, Deep Violet or Black Olive.",
  "es": "Solo rafia y hoja de banano - sin cuero. Asas con alma de alambre curvada a mano y envuelta en rafia, que puedes remodelar a voluntad; interior con bolsita forrada de Jawhara y pompones de rafia. En Hot Red, Deep Violet o Black Olive.",
  "tr": "Yalnızca rafya ve muz yaprağı - deri yok. Elde bükülüp rafyayla sarılan tel özlü saplar dilediğiniz gibi yeniden biçimlenir; içeride Jawhara astarlı kese ve rafya ponponlar. Hot Red, Deep Violet veya Black Olive renklerinde.",
  "ar": "رافيا وورق الموز فقط - بلا جلد. مقابض بروح من السلك تُقوّس باليد ثم تُغلَّف بالرافيا، ويمكنك إعادة تشكيلها كما تشاء؛ الداخل بكيس مبطّن بـ Jawhara وكرات رافيا. بألوان Hot Red أو Deep Violet أو Black Olive."
 },
 "fabric": {
  "fr": "La signature de La Sculpture, c'est l'anse : une âme en fil de fer cintrée à la main puis gainée de raphia, qu'on recourbe à sa guise, sur un tissage serré et solaire de feuille de bananier.",
  "en": "The La Sculpture signature is the handle: a wire core bent by hand then sheathed in raffia, curved however you like, over a tight, sun-warm banana-leaf weave.",
  "es": "La firma de La Sculpture es el asa: un alma de alambre curvada a mano y luego envuelta en rafia, que se dobla a tu antojo, sobre un tejido de hoja de banano apretado y cálido.",
  "tr": "La Sculpture'ün imzası saptır: elde bükülüp rafyayla sarılan, dilediğiniz gibi kıvrılan bir tel öz; sıkı ve güneş sıcaklığında muz yaprağı dokuma üzerinde.",
  "ar": "توقيع La Sculpture هو المقبض: روح من السلك تُقوّس باليد ثم تُغلَّف بالرافيا، تنثنيها كما تشاء، فوق نسيج محكم ودافئ من ورق الموز."
 },
 "handworkTime": {
  "fr": "Entièrement monté à la main par Fatima et son équipe à Guéliz - de 35 à 85 heures selon la pièce, du cintrage des anses au contrôle final.",
  "en": "Built entirely by hand by Fatima and her team in Guéliz - 35 to 85 hours depending on the piece, from bending the handles to the final check.",
  "es": "Montado enteramente a mano por Fatima y su equipo en Guéliz - de 35 a 85 horas según la pieza, del curvado de las asas al control final.",
  "tr": "Tümüyle Guéliz'de Fatima ve ekibi tarafından elde monte edilir - parçaya göre 35 ila 85 saat, sapların bükülmesinden son kontrole.",
  "ar": "مُجمَّعة يدويًا بالكامل على يد فاطمة وفريقها في كليز - من 35 إلى 85 ساعة حسب القطعة، من تقويس المقابض حتى الفحص النهائي."
 },
 "dimensions": {
 "fr": "Le format du milieu - un panier compact, fait pour tous les jours. Dimensions : 40 × 31 × 14 cm.",
 "en": "The mid-size - a compact basket, made for every day. Dimensions: 40 × 31 × 14 cm.",
 "es": "La talla intermedia - un cesto compacto, para cada día. Dimensiones: 40 × 31 × 14 cm.",
 "tr": "Orta beden - her güne uygun kompakt bir sepet. Ölçüler: 40 × 31 × 14 cm.",
 "ar": "المقاس المتوسط - سلة مدمجة لكل يوم. الأبعاد: 40 × 31 × 14 سم."
 },
 "edition": {
 "fr": "Édition très limitée - faite main, par séries de 15 par taille et par coloris, tant que dure la série, sans réassort garanti.",
 "en": "Very limited edition - handmade in runs of 15 per size and colour, while the series lasts, with no guaranteed restock.",
 "es": "Edición muy limitada - hecha a mano, en series de 15 por talla y color, mientras dure la serie, sin reposición garantizada.",
 "tr": "Çok sınırlı üretim - elde, beden ve renk başına 15 adetlik serilerle, seri sürdüğü sürece, garantili stok yenileme yok.",
 "ar": "إصدار محدود جدًا - مصنوع يدويًا بسلاسل من 15 قطعة لكل مقاس ولون، طوال مدة السلسلة، دون ضمان إعادة التوفير."
 },
 "modelNote": {
 "fr": "Mannequin : Nawal mesure 1 m 55 et porte du XS/S.",
 "en": "Model: Nawal is 1m55 and wears XS/S.",
 "es": "Modelo: Nawal mide 1,55 m y usa XS/S.",
 "tr": "Manken: Nawal 1,55 m boyunda ve XS/S beden giyiyor.",
 "ar": "العارضة: نوال طولها 1.55 م وترتدي مقاس XS/S."
 },
 "styleTip": {
 "fr": "Noir pour une allure sculpturale intemporelle, Rouge pour une déclaration estivale audacieuse, Violet pour un esprit plus artistique et inattendu.",
 "en": "Choose Black for a timeless sculptural look, Red for a bold summer statement, and Purple for a more artistic, unexpected feel.",
 "es": "Elige Negro para un look escultural atemporal, Rojo para una declaración veraniega audaz y Violeta para un aire más artístico e inesperado.",
 "tr": "Zamansız heykelsi bir görünüm için Siyah, iddialı bir yaz ifadesi için Kırmızı, daha sanatsal ve beklenmedik bir hava için Mor'u seçin.",
 "ar": "اختر الأسود لإطلالة نحتية خالدة، والأحمر للمسة صيفية جريئة، والبنفسجي لروح أكثر فنية وغير متوقعة."
 },
 "whatFits": {
 "fr": "Téléphone, portefeuille, lunettes, un foulard fin et les petites choses du jour.",
 "en": "Phone, wallet, sunglasses, a thin scarf and the day's small things."
 },
 "making": {
  "fr": "Chaque panier naît sous les mains de Fatima, à Guéliz : elle cintre l'âme en fil de fer des anses avant de l'envelopper de raphia, comme un sculpteur travaille le métal, puis noue la feuille de bananier brin à brin - de 35 à 85 heures de travail, sans un gramme de cuir.",
  "en": "Each basket comes to life under Fatima's hands in Guéliz: she bends the wire core of the handles before wrapping it in raffia, the way a sculptor works the metal, then ties the banana leaf strand by strand - 35 to 85 hours of work, without a gram of leather.",
  "es": "Cada cesto nace bajo las manos de Fatima, en Guéliz: curva el alma de alambre de las asas antes de envolverla en rafia, como un escultor trabaja el metal, y luego anuda la hoja de banano hebra a hebra - de 35 a 85 horas de trabajo, sin un gramo de cuero.",
  "tr": "Her sepet Guéliz'de Fatima'nın elleri altında hayat bulur: sapların tel özünü, bir heykeltıraşın metali işlemesi gibi rafyayla sarmadan önce büker, ardından muz yaprağını lif lif düğümler - 35 ila 85 saatlik emek, bir gram deri olmadan.",
  "ar": "تُولد كل سلة تحت يدي فاطمة في كليز: تُقوّس روح السلك في المقابض قبل أن تلفّها بالرافيا، كما ينحت النحّات المعدن، ثم تعقد ورق الموز خيطًا خيطًا - من 35 إلى 85 ساعة عمل، دون غرام واحد من الجلد."
 }
 },
 {
 "handle": "la-sculpture-m-basket-bag-ss26",
 "short": {
  "fr": "Le grand format, celui des journées pleines. Un livre, un foulard, une trousse - il suit. Raphia et feuille de bananier, rien que ce que la terre a donné.",
  "en": "The large size, for the full days. A book, a scarf, a pouch - it keeps up. Raffia and banana leaf, nothing but what the earth gave.",
  "es": "La talla grande, la de los días llenos. Un libro, un pañuelo, un neceser - sigue el ritmo. Rafia y hoja de banano, nada más que lo que dio la tierra.",
  "tr": "Büyük beden, dolu günler için. Bir kitap, bir eşarp, bir çanta - ayak uydurur. Rafya ve muz yaprağı, yalnızca toprağın verdiği.",
  "ar": "المقاس الكبير، لأيامك المزدحمة. كتاب، وشاح، حقيبة صغيرة - يواكبك. رافيا وورق الموز، لا شيء سوى ما جادت به الأرض."
 },
 "desc": {
  "fr": "Le plus grand de la lignée, avec du volume pour les jours qui débordent. Marché, plage, départ improvisé : il prend les essentiels, une pochette, un livre fin, un foulard, une petite trousse. Ici, rien que du raphia et de la feuille de bananier - aucun cuir, rien que ce que la terre a donné, façonné à la main. Les anses cachent une âme en fil de fer que Fatima cintre à la main avant de la gainer de raphia, comme un sculpteur travaille le métal avant d'y poser l'argile : recourbez-les à votre gré. Leur galbe rappelle les arches des portes de la médina et le tracé sinueux des ruelles ; les coloris, ceux des vieilles portes marocaines. À l'intérieur, un pochon doublé de Jawhara et ses pompons de raphia. La régularité du tissage n'est jamais mécanique : c'est une main qui l'a tenue.",
  "en": "The largest of the line, with room for the days that spill over. Market, beach, a last-minute departure: it takes the essentials, a pouch, a slim book, a scarf, a little kit. Here it's raffia and banana leaf only - no leather, nothing but what the earth gave, shaped by hand. The handles hide a wire core Fatima bends by hand before sheathing it in raffia, the way a sculptor works the metal before laying on the clay: curve them however you like. Their line echoes the arches of the medina doors and the winding trace of the alleys; the colours, those of old Moroccan doors. Inside, a Jawhara-lined pouch and its raffia pompoms. The evenness of the weave is never mechanical: a hand held it.",
  "es": "El más grande de la línea, con volumen para los días que se desbordan. Mercado, playa, escapada improvisada: se lleva lo esencial, una funda, un libro fino, un pañuelo, un neceser pequeño. Aquí solo hay rafia y hoja de banano - sin cuero, nada más que lo que dio la tierra, moldeado a mano. Las asas esconden un alma de alambre que Fatima curva a mano antes de envolverla en rafia, como un escultor trabaja el metal antes de posar la arcilla: cúrvalas a tu gusto. Su silueta evoca los arcos de las puertas de la medina y el trazado sinuoso de las callejuelas; los colores, los de las viejas puertas marroquíes. Dentro, una bolsita forrada de Jawhara y sus pompones de rafia. La regularidad del tejido nunca es mecánica: la sostuvo una mano.",
  "tr": "Serinin en büyüğü, taşan günler için yer var. Pazar, plaj, son dakika kaçamağı: gereklilikleri alır, bir kılıf, ince bir kitap, bir eşarp, küçük bir çanta. Burada yalnızca rafya ve muz yaprağı var - deri yok, yalnızca toprağın verdiği, elle biçimlenmiş. Saplar, Fatima'nın rafyayla sarmadan önce elle büktüğü bir tel özü saklar; tıpkı bir heykeltıraşın kili koymadan önce metali işlemesi gibi: dilediğiniz gibi kıvırın. Hatları medina kapılarının kemerlerini ve sokakların kıvrımlı izini anımsatır; renkler eski Fas kapılarının renkleri. İçinde, Jawhara astarlı bir kese ve rafya ponponları. Dokumanın düzgünlüğü asla mekanik değildir: onu bir el tuttu.",
  "ar": "الأكبر في العائلة، بحجم يتّسع للأيام الفائضة. السوق، الشاطئ، رحلة مفاجئة: يستوعب الأساسيات، حقيبة صغيرة، كتابًا رفيعًا، وشاحًا، طقم أدوات صغير. هنا رافيا وورق الموز فقط - بلا جلد، لا شيء سوى ما جادت به الأرض، مُشكَّل باليد. تُخفي المقابض روحًا من السلك تُقوّسها فاطمة بيدها قبل أن تغلّفها بالرافيا، كما ينحت النحّات المعدن قبل أن يضع الطين: قوّسها كما تشاء. تستحضر انحناءاتها أقواس أبواب المدينة القديمة وخط الأزقة المتعرّج؛ وألوانها ألوان الأبواب المغربية العتيقة. في الداخل، كيس مبطّن بـ Jawhara وكرات الرافيا. انتظام النسيج ليس آليًا أبدًا: يدٌ هي التي أمسكته."
 },
 "material": {
  "fr": "Raphia et feuille de bananier uniquement - aucun cuir. Anses à âme en fil de fer cintrée main puis gainée de raphia, que l'on peut recourber à volonté ; intérieur avec pochon doublé de Jawhara et pompons de raphia. Coloris Hot Red, Deep Violet ou Black Olive.",
  "en": "Raffia and banana leaf only - no leather. Handles built on a hand-bent wire core sheathed in raffia, which you can reshape at will; interior with a Jawhara-lined pouch and raffia pompoms. In Hot Red, Deep Violet or Black Olive.",
  "es": "Solo rafia y hoja de banano - sin cuero. Asas con alma de alambre curvada a mano y envuelta en rafia, que puedes remodelar a voluntad; interior con bolsita forrada de Jawhara y pompones de rafia. En Hot Red, Deep Violet o Black Olive.",
  "tr": "Yalnızca rafya ve muz yaprağı - deri yok. Elde bükülüp rafyayla sarılan tel özlü saplar dilediğiniz gibi yeniden biçimlenir; içeride Jawhara astarlı kese ve rafya ponponlar. Hot Red, Deep Violet veya Black Olive renklerinde.",
  "ar": "رافيا وورق الموز فقط - بلا جلد. مقابض بروح من السلك تُقوّس باليد ثم تُغلَّف بالرافيا، ويمكنك إعادة تشكيلها كما تشاء؛ الداخل بكيس مبطّن بـ Jawhara وكرات رافيا. بألوان Hot Red أو Deep Violet أو Black Olive."
 },
 "fabric": {
  "fr": "La signature de La Sculpture, c'est l'anse : une âme en fil de fer cintrée à la main puis gainée de raphia, qu'on recourbe à sa guise, sur un tissage serré et solaire de feuille de bananier.",
  "en": "The La Sculpture signature is the handle: a wire core bent by hand then sheathed in raffia, curved however you like, over a tight, sun-warm banana-leaf weave.",
  "es": "La firma de La Sculpture es el asa: un alma de alambre curvada a mano y luego envuelta en rafia, que se dobla a tu antojo, sobre un tejido de hoja de banano apretado y cálido.",
  "tr": "La Sculpture'ün imzası saptır: elde bükülüp rafyayla sarılan, dilediğiniz gibi kıvrılan bir tel öz; sıkı ve güneş sıcaklığında muz yaprağı dokuma üzerinde.",
  "ar": "توقيع La Sculpture هو المقبض: روح من السلك تُقوّس باليد ثم تُغلَّف بالرافيا، تنثنيها كما تشاء، فوق نسيج محكم ودافئ من ورق الموز."
 },
 "handworkTime": {
  "fr": "Fait main de bout en bout par Fatima et son équipe à Guéliz - de 35 à 85 heures selon la pièce, tissage et cintrage des anses compris.",
  "en": "Handmade end to end by Fatima and her team in Guéliz - 35 to 85 hours depending on the piece, weaving and handle-bending included.",
  "es": "Hecho a mano de principio a fin por Fatima y su equipo en Guéliz - de 35 a 85 horas según la pieza, tejido y curvado de las asas incluidos.",
  "tr": "Guéliz'de Fatima ve ekibi tarafından baştan sona elde yapılır - parçaya göre 35 ila 85 saat, dokuma ve sap bükme dahil.",
  "ar": "مصنوعة يدويًا من البداية إلى النهاية على يد فاطمة وفريقها في كليز - من 35 إلى 85 ساعة حسب القطعة، بما في ذلك النسج وتقويس المقابض."
 },
 "dimensions": {
 "fr": "Le plus grand format - un panier de caractère, plus de volume. Dimensions : 40 × 31 × 14 cm.",
 "en": "The largest size - a basket with presence, more volume. Dimensions: 40 × 31 × 14 cm.",
 "es": "La talla más grande - un cesto con carácter, más volumen. Dimensiones: 40 × 31 × 14 cm.",
 "tr": "En büyük beden - karakterli, daha hacimli bir sepet. Ölçüler: 40 × 31 × 14 cm.",
 "ar": "أكبر مقاس - سلة بحضور لافت وحجم أكبر. الأبعاد: 40 × 31 × 14 سم."
 },
 "edition": {
 "fr": "Édition très limitée - faite main, par séries de 15 par taille et par coloris, le temps que vit la série, sans réassort garanti.",
 "en": "Very limited edition - handmade in runs of 15 per size and colour, for the life of the series, with no guaranteed restock.",
 "es": "Edición muy limitada - hecha a mano, en series de 15 por talla y color, mientras dure la serie, sin reposición garantizada.",
 "tr": "Çok sınırlı üretim - elde, beden ve renk başına 15 adetlik serilerle, seri sürdüğü sürece, garantili stok yenileme yok.",
 "ar": "إصدار محدود جدًا - مصنوع يدويًا بسلاسل من 15 قطعة لكل مقاس ولون، طوال مدة السلسلة، دون ضمان إعادة التوفير."
 },
 "modelNote": {
 "fr": "Mannequin : Nawal mesure 1 m 55 et porte du XS/S.",
 "en": "Model: Nawal is 1m55 and wears XS/S.",
 "es": "Modelo: Nawal mide 1,55 m y usa XS/S.",
 "tr": "Manken: Nawal 1,55 m boyunda ve XS/S beden giyiyor.",
 "ar": "العارضة: نوال طولها 1.55 م وترتدي مقاس XS/S."
 },
 "styleTip": {
 "fr": "Noir pour une allure sculpturale intemporelle, Rouge pour une déclaration estivale audacieuse, Violet pour un esprit plus artistique et inattendu.",
 "en": "Choose Black for a timeless sculptural look, Red for a bold summer statement, and Purple for a more artistic, unexpected feel.",
 "es": "Elige Negro para un look escultural atemporal, Rojo para una declaración veraniega audaz y Violeta para un aire más artístico e inesperado.",
 "tr": "Zamansız heykelsi bir görünüm için Siyah, iddialı bir yaz ifadesi için Kırmızı, daha sanatsal ve beklenmedik bir hava için Mor'u seçin.",
 "ar": "اختر الأسود لإطلالة نحتية خالدة، والأحمر للمسة صيفية جريئة، والبنفسجي لروح أكثر فنية وغير متوقعة."
 },
 "whatFits": {
 "fr": "Les essentiels, une pochette, un livre fin, un foulard et une petite trousse.",
 "en": "The essentials, a pouch, a slim book, a scarf and a small kit."
 },
 "making": {
  "fr": "Chaque panier naît sous les mains de Fatima, à Guéliz : elle cintre l'âme en fil de fer des anses avant de l'envelopper de raphia, comme un sculpteur travaille le métal, puis noue la feuille de bananier brin à brin - de 35 à 85 heures de travail, sans un gramme de cuir.",
  "en": "Each basket comes to life under Fatima's hands in Guéliz: she bends the wire core of the handles before wrapping it in raffia, the way a sculptor works the metal, then ties the banana leaf strand by strand - 35 to 85 hours of work, without a gram of leather.",
  "es": "Cada cesto nace bajo las manos de Fatima, en Guéliz: curva el alma de alambre de las asas antes de envolverla en rafia, como un escultor trabaja el metal, y luego anuda la hoja de banano hebra a hebra - de 35 a 85 horas de trabajo, sin un gramo de cuero.",
  "tr": "Her sepet Guéliz'de Fatima'nın elleri altında hayat bulur: sapların tel özünü, bir heykeltıraşın metali işlemesi gibi rafyayla sarmadan önce büker, ardından muz yaprağını lif lif düğümler - 35 ila 85 saatlik emek, bir gram deri olmadan.",
  "ar": "تُولد كل سلة تحت يدي فاطمة في كليز: تُقوّس روح السلك في المقابض قبل أن تلفّها بالرافيا، كما ينحت النحّات المعدن، ثم تعقد ورق الموز خيطًا خيطًا - من 35 إلى 85 ساعة عمل، دون غرام واحد من الجلد."
 }
 },
 {
 "handle": "la-nouvelle-vague-xs-basket-bag-ss26",
 "short": {
  "fr": "Notre plus petit panier du jour, tressé en feuilles de bananier et bordé de cuir, ses anses enroulées de perles de rocaille.",
  "en": "Our smallest everyday basket, woven from banana leaves and edged in leather, its handles wrapped in seed beads.",
  "es": "Nuestra cesta más pequeña para el día a día, tejida en hojas de banano y ribeteada en piel, con asas envueltas en cuentas de rocalla.",
  "tr": "En küçük günlük sepetimiz; muz yaprağından örülmüş, deriyle çevrelenmiş ve sapları rocaille boncuklarıyla sarılmış.",
  "ar": "أصغر سلّاتنا لليوم، منسوجة من أوراق الموز ومحاطة بالجلد، ومقابضها ملفوفة بخرز الرقايل."
 },
 "desc": {
  "fr": "La Nouvelle Vague en XS, c'est le panier que l'on glisse au poignet pour aller au marché ou filer au café : de quoi tenir le téléphone, les clés et un rouge à lèvres, rien de plus. Le corps est tressé à la main en feuilles de bananier, en un point matelassé souple comme un petit édredon, puis bordé de cuir brodé sur le pourtour, surtout le long du bord supérieur. Autour des anses de cuir, nous enroulons des perles de rocaille dont les motifs répondent aux bijoux du sud du Maroc et à notre héritage africain. Sous chaque perle court une fine bande de cuir cachée : elle protège le fil et fait qu'une perle égarée ne se voit jamais. Deux lanières de cuir de chaque côté le laissent se porter à la main, au creux du coude ou à l'épaule. Trois coloris — un bleu ciel, un vert, et un naturel pêche-rose-orangé qui change d'un exemplaire à l'autre. Fait main par Fatima dans notre atelier de Guéliz, à Marrakech ; jamais deux paniers identiques.",
  "en": "La Nouvelle Vague in XS is the basket you slip onto your wrist for the market or a quick coffee: room for your phone, your keys and a lipstick, and little more. The body is hand-woven from banana leaves in a soft matelassé weave, quilted like a tiny eiderdown, then edged with leather embroidery all around, especially along the top rim. Around the leather handles we roll seed beads whose motifs answer to the jewellery of southern Morocco and to our African heritage. Beneath every bead runs a hidden strip of leather: it protects the thread and means a lost bead never shows. Two leather lanyards on each side let it be carried in the hand, in the crook of the elbow or on the shoulder. Three colourways — a sky blue, a green, and a natural peach-pink-orange that shifts from one piece to the next. Handmade by Fatima in our Guéliz atelier in Marrakech; never two baskets alike.",
  "es": "La Nouvelle Vague en XS es la cesta que te cuelgas en la muñeca para ir al mercado o a por un café: sitio para el móvil, las llaves y un pintalabios, poco más. El cuerpo se teje a mano en hojas de banano con un punto matelassé blando como un pequeño edredón, y luego se ribetea con bordado de piel por todo el contorno, sobre todo en el borde superior. Alrededor de las asas de cuero enrollamos cuentas de rocalla cuyos motivos dialogan con la joyería del sur de Marruecos y con nuestra herencia africana. Bajo cada cuenta corre una fina tira de cuero oculta: protege el hilo y hace que una cuenta perdida no se note nunca. Dos correas de cuero a cada lado permiten llevarla en la mano, en el hueco del codo o al hombro. Tres colores — un azul cielo, un verde y un natural melocotón-rosa-naranja que cambia de una pieza a otra. Hecha a mano por Fatima en nuestro taller de Guéliz, en Marrakech; nunca dos cestas iguales.",
  "tr": "XS bedendeki La Nouvelle Vague, pazara ya da hızlı bir kahveye giderken bileğinize geçirdiğiniz sepet: telefonunuza, anahtarlarınıza ve bir rujunuza yer var, fazlası değil. Gövde, küçük bir yorgan gibi yumuşacık bir matlase örgüyle muz yaprağından elde örülür, ardından çepeçevre, özellikle üst kenar boyunca deri işlemeyle çevrelenir. Deri sapların etrafına, motifleri güney Fas'ın takılarına ve Afrika mirasımıza selam duran rocaille boncuklarını sararız. Her boncuğun altında gizli bir deri şerit uzanır: ipliği korur ve kaybolan bir boncuğun asla belli olmamasını sağlar. Her iki yandaki ikişer deri kayış, sepeti elde, dirsek kıvrımında ya da omuzda taşımanıza olanak tanır. Üç renk — bir gök mavisi, bir yeşil ve parçadan parçaya değişen doğal bir şeftali-pembe-turuncu. Marakeş'teki Guéliz atölyemizde Fatima tarafından elde yapılır; hiçbir sepet bir diğerinin aynısı değildir.",
  "ar": "لا نوفيل فاغ بمقاس XS هي السلّة التي تعلّقينها على معصمك للذهاب إلى السوق أو لاحتساء قهوة سريعة: تتّسع لهاتفك ومفاتيحك وأحمر شفاه، لا أكثر. يُنسج الجسم يدويًا من أوراق الموز بنسجة مبطّنة ناعمة كلحاف صغير، ثم يُحاط بتطريز جلدي على كامل الحافة، خاصةً عند الطرف العلوي. حول مقابض الجلد نلفّ خرز الرقايل، الذي تستحضر زخارفه حُليّ جنوب المغرب وإرثنا الإفريقي. تحت كل خرزة يمتدّ شريط جلدي خفيّ: يحمي الخيط ويضمن ألّا يظهر أثر لأي خرزة مفقودة. سيرَان من الجلد على كل جانب يتيحان حملها باليد أو في ثنية المرفق أو على الكتف. ثلاثة ألوان — أزرق سماوي، وأخضر، ولون طبيعي يميل إلى الخوخي-الوردي-البرتقالي يختلف من قطعة إلى أخرى. مصنوعة يدويًا على يد فاطمة في محترفنا بحي غيليز في مراكش؛ ولا تتشابه سلّتان أبدًا."
 },
 "material": {
  "fr": "Corps en feuilles de bananier tressées main. Bordures, anses et lanières en cuir. Perles de rocaille enroulées sur les anses, sur une bande de cuir cachée.",
  "en": "Body of hand-woven banana leaves. Borders, handles and lanyards in leather. Seed beads rolled onto the handles over a hidden strip of leather.",
  "es": "Cuerpo de hojas de banano tejidas a mano. Ribetes, asas y correas de cuero. Cuentas de rocalla enrolladas sobre las asas, sobre una tira de cuero oculta.",
  "tr": "Gövde elde örülmüş muz yaprağından. Kenarlar, saplar ve kayışlar deri. Rocaille boncuklar, gizli bir deri şerit üzerine, sapların etrafına sarılıdır.",
  "ar": "الجسم من أوراق الموز المنسوجة يدويًا. الحواف والمقابض والسيور من الجلد. خرز الرقايل ملفوف حول المقابض فوق شريط جلدي خفيّ."
 },
 "fabric": {
  "fr": "Feuilles de bananier en point matelassé, cuir naturel, perles de rocaille en verre.",
  "en": "Banana leaf in a matelassé weave, natural leather, glass seed beads.",
  "es": "Hoja de banano en punto matelassé, cuero natural, cuentas de rocalla de vidrio.",
  "tr": "Matlase örgüde muz yaprağı, doğal deri, cam rocaille boncuklar.",
  "ar": "أوراق موز بنسجة مبطّنة، جلد طبيعي، خرز رقايل زجاجي."
 },
 "handworkTime": {
  "fr": "Plusieurs jours de travail à la main pour le petit format : le tressage, la bordure de cuir et l'enroulage des perles se font entièrement à la main.",
  "en": "Several days of handwork for the small format: the weaving, the leather border and the bead-wrapping are all done entirely by hand.",
  "es": "Varios días de trabajo a mano para el formato pequeño: el tejido, el ribete de cuero y el enrollado de las cuentas se hacen enteramente a mano.",
  "tr": "Küçük boy için birkaç günlük el işçiliği: örgü, deri kenar ve boncuk sarımı tamamen elde yapılır.",
  "ar": "عدّة أيام من العمل اليدوي للمقاس الصغير: النسج، والحافة الجلدية، ولفّ الخرز تُنجز كلّها يدويًا بالكامل."
 },
 "dimensions": {
 "fr": "Le plus petit format - un mini panier à la main ou en courte bandoulière.",
 "en": "The smallest size - a mini basket by hand or on a short shoulder strap."
 },
 "edition": {
 "fr": "Fait main, par séries de 15 par taille et par coloris, tant que la série existe - sans réassort garanti.",
 "en": "Handmade, in runs of 15 per size and colour, while the series exists - no guaranteed restock."
 },
 "whatFits": {
 "fr": "Téléphone, porte-cartes, clés, lunettes, un foulard - bien plus qu'il n'y paraît.",
 "en": "Phone, card holder, keys, sunglasses, a scarf - more than it looks."
 },
 "making": {
  "fr": "Chaque panier est fait main par Fatima dans notre atelier de Guéliz, à Marrakech. Elle tresse le corps en feuilles de bananier, borde le tour de cuir, puis enroule les perles de rocaille autour des anses — une à une, sur une fine bande de cuir cachée qui protège l'ouvrage et fait qu'une perle perdue ne se remarque jamais. Un travail lent, patient : il n'existe jamais deux paniers identiques.",
  "en": "Each basket is handmade by Fatima in our Guéliz atelier in Marrakech. She weaves the body from banana leaves, edges it in leather, then rolls the seed beads around the handles — one by one, over a hidden strip of leather that protects the work and keeps a lost bead from ever showing. Slow, patient work: no two baskets are ever the same.",
  "es": "Cada cesta está hecha a mano por Fatima en nuestro taller de Guéliz, en Marrakech. Teje el cuerpo en hojas de banano, lo ribetea de cuero y luego enrolla las cuentas de rocalla alrededor de las asas — una a una, sobre una fina tira de cuero oculta que protege la labor y hace que una cuenta perdida no se note nunca. Un trabajo lento y paciente: nunca hay dos cestas iguales.",
  "tr": "Her sepet, Marakeş'teki Guéliz atölyemizde Fatima tarafından elde yapılır. Gövdeyi muz yaprağından örer, kenarını deriyle çevreler, ardından rocaille boncukları sapların etrafına birer birer sarar — işi koruyan ve kaybolan bir boncuğun asla belli olmamasını sağlayan gizli bir deri şeridin üzerine. Yavaş ve sabırlı bir emek: hiçbir sepet bir diğerinin aynısı değildir.",
  "ar": "كل سلّة مصنوعة يدويًا على يد فاطمة في محترفنا بحي غيليز في مراكش. تنسج الجسم من أوراق الموز، وتحيطه بالجلد، ثم تلفّ خرز الرقايل حول المقابض — خرزةً خرزة، فوق شريط جلدي خفيّ يحمي العمل ويضمن ألّا يظهر أثر لأي خرزة مفقودة. عمل بطيء وصبور: ولا تتشابه سلّتان أبدًا."
 }
 },
 {
 "handle": "la-nouvelle-vague-s-basket-bag-ss26",
 "short": {
  "fr": "Notre panier de tous les jours, format juste : feuilles de bananier tressées, bordures de cuir et anses enroulées de perles de rocaille.",
  "en": "Our everyday basket in a just-right size: woven banana leaves, leather borders and handles wrapped in seed beads.",
  "es": "Nuestra cesta de diario en el tamaño justo: hojas de banano tejidas, ribetes de cuero y asas envueltas en cuentas de rocalla.",
  "tr": "Tam kıvamında günlük sepetimiz: örülmüş muz yaprağı, deri kenarlar ve rocaille boncuklarıyla sarılı saplar.",
  "ar": "سلّتنا اليومية بالمقاس الأنسب: أوراق موز منسوجة، وحواف جلدية، ومقابض ملفوفة بخرز الرقايل."
 },
 "desc": {
  "fr": "La Nouvelle Vague en S, c'est le format que l'on prend sans réfléchir : assez grand pour un carnet, un portefeuille et une bouteille d'eau, assez léger pour ne jamais peser. Le corps est tressé à la main en feuilles de bananier, en un point matelassé souple comme un édredon, puis bordé de cuir brodé sur le pourtour, surtout le long du bord supérieur. Autour des anses de cuir, nous enroulons des perles de rocaille dont les motifs répondent aux bijoux du sud du Maroc et à notre héritage africain. Sous chaque perle court une fine bande de cuir cachée : elle protège le fil et fait qu'une perle égarée ne se voit jamais. Deux lanières de cuir de chaque côté le laissent se porter à la main, au creux du coude ou à l'épaule, selon l'humeur du jour. Trois coloris — un bleu ciel, un vert, et un naturel pêche-rose-orangé qui change d'un exemplaire à l'autre. Fait main par Fatima dans notre atelier de Guéliz, à Marrakech ; jamais deux paniers identiques.",
  "en": "La Nouvelle Vague in S is the size you reach for without thinking: big enough for a notebook, a wallet and a bottle of water, light enough never to weigh you down. The body is hand-woven from banana leaves in a soft matelassé weave, quilted like an eiderdown, then edged with leather embroidery all around, especially along the top rim. Around the leather handles we roll seed beads whose motifs answer to the jewellery of southern Morocco and to our African heritage. Beneath every bead runs a hidden strip of leather: it protects the thread and means a lost bead never shows. Two leather lanyards on each side let it be carried in the hand, in the crook of the elbow or on the shoulder, as the day suits. Three colourways — a sky blue, a green, and a natural peach-pink-orange that shifts from one piece to the next. Handmade by Fatima in our Guéliz atelier in Marrakech; never two baskets alike.",
  "es": "La Nouvelle Vague en S es el tamaño que coges sin pensar: lo bastante grande para un cuaderno, una cartera y una botella de agua, lo bastante ligero para no pesar nunca. El cuerpo se teje a mano en hojas de banano con un punto matelassé blando como un edredón, y luego se ribetea con bordado de piel por todo el contorno, sobre todo en el borde superior. Alrededor de las asas de cuero enrollamos cuentas de rocalla cuyos motivos dialogan con la joyería del sur de Marruecos y con nuestra herencia africana. Bajo cada cuenta corre una fina tira de cuero oculta: protege el hilo y hace que una cuenta perdida no se note nunca. Dos correas de cuero a cada lado permiten llevarla en la mano, en el hueco del codo o al hombro, según el día. Tres colores — un azul cielo, un verde y un natural melocotón-rosa-naranja que cambia de una pieza a otra. Hecha a mano por Fatima en nuestro taller de Guéliz, en Marrakech; nunca dos cestas iguales.",
  "tr": "S bedendeki La Nouvelle Vague, düşünmeden uzandığınız boy: bir defter, bir cüzdan ve bir şişe su için yeterince büyük, sizi hiç yormayacak kadar hafif. Gövde, bir yorgan gibi yumuşak bir matlase örgüyle muz yaprağından elde örülür, ardından çepeçevre, özellikle üst kenar boyunca deri işlemeyle çevrelenir. Deri sapların etrafına, motifleri güney Fas'ın takılarına ve Afrika mirasımıza selam duran rocaille boncuklarını sararız. Her boncuğun altında gizli bir deri şerit uzanır: ipliği korur ve kaybolan bir boncuğun asla belli olmamasını sağlar. Her iki yandaki ikişer deri kayış, günün havasına göre sepeti elde, dirsek kıvrımında ya da omuzda taşımanıza olanak tanır. Üç renk — bir gök mavisi, bir yeşil ve parçadan parçaya değişen doğal bir şeftali-pembe-turuncu. Marakeş'teki Guéliz atölyemizde Fatima tarafından elde yapılır; hiçbir sepet bir diğerinin aynısı değildir.",
  "ar": "لا نوفيل فاغ بمقاس S هو المقاس الذي تختارينه دون تفكير: واسع بما يكفي لدفتر ومحفظة وقارورة ماء، وخفيف بما يكفي ألّا يثقل عليك أبدًا. يُنسج الجسم يدويًا من أوراق الموز بنسجة مبطّنة ناعمة كاللحاف، ثم يُحاط بتطريز جلدي على كامل الحافة، خاصةً عند الطرف العلوي. حول مقابض الجلد نلفّ خرز الرقايل، الذي تستحضر زخارفه حُليّ جنوب المغرب وإرثنا الإفريقي. تحت كل خرزة يمتدّ شريط جلدي خفيّ: يحمي الخيط ويضمن ألّا يظهر أثر لأي خرزة مفقودة. سيرَان من الجلد على كل جانب يتيحان حملها باليد أو في ثنية المرفق أو على الكتف، حسب مزاج اليوم. ثلاثة ألوان — أزرق سماوي، وأخضر، ولون طبيعي يميل إلى الخوخي-الوردي-البرتقالي يختلف من قطعة إلى أخرى. مصنوعة يدويًا على يد فاطمة في محترفنا بحي غيليز في مراكش؛ ولا تتشابه سلّتان أبدًا."
 },
 "material": {
  "fr": "Corps en feuilles de bananier tressées main. Bordures, anses et lanières en cuir. Perles de rocaille enroulées sur les anses, sur une bande de cuir cachée.",
  "en": "Body of hand-woven banana leaves. Borders, handles and lanyards in leather. Seed beads rolled onto the handles over a hidden strip of leather.",
  "es": "Cuerpo de hojas de banano tejidas a mano. Ribetes, asas y correas de cuero. Cuentas de rocalla enrolladas sobre las asas, sobre una tira de cuero oculta.",
  "tr": "Gövde elde örülmüş muz yaprağından. Kenarlar, saplar ve kayışlar deri. Rocaille boncuklar, gizli bir deri şerit üzerine, sapların etrafına sarılıdır.",
  "ar": "الجسم من أوراق الموز المنسوجة يدويًا. الحواف والمقابض والسيور من الجلد. خرز الرقايل ملفوف حول المقابض فوق شريط جلدي خفيّ."
 },
 "fabric": {
  "fr": "Feuilles de bananier en point matelassé, cuir naturel, perles de rocaille en verre.",
  "en": "Banana leaf in a matelassé weave, natural leather, glass seed beads.",
  "es": "Hoja de banano en punto matelassé, cuero natural, cuentas de rocalla de vidrio.",
  "tr": "Matlase örgüde muz yaprağı, doğal deri, cam rocaille boncuklar.",
  "ar": "أوراق موز بنسجة مبطّنة، جلد طبيعي، خرز رقايل زجاجي."
 },
 "handworkTime": {
  "fr": "Plusieurs jours de travail à la main : le tressage des feuilles de bananier, la bordure de cuir et l'enroulage des perles se font entièrement à la main.",
  "en": "Several days of handwork: the weaving of the banana leaves, the leather border and the bead-wrapping are all done entirely by hand.",
  "es": "Varios días de trabajo a mano: el tejido de las hojas de banano, el ribete de cuero y el enrollado de las cuentas se hacen enteramente a mano.",
  "tr": "Birkaç günlük el işçiliği: muz yapraklarının örülmesi, deri kenar ve boncuk sarımı tamamen elde yapılır.",
  "ar": "عدّة أيام من العمل اليدوي: نسج أوراق الموز، والحافة الجلدية، ولفّ الخرز تُنجز كلّها يدويًا بالكامل."
 },
 "dimensions": {
 "fr": "Le format du milieu - un panier compact pour tous les jours.",
 "en": "The mid-size - a compact basket for every day."
 },
 "edition": {
 "fr": "Fait main, par séries de 15 par taille et par coloris, tant que dure la série - sans réassort garanti.",
 "en": "Handmade, in runs of 15 per size and colour, while the series lasts - no guaranteed restock."
 },
 "whatFits": {
 "fr": "Téléphone, portefeuille, lunettes, un foulard fin et les petites choses du jour.",
 "en": "Phone, wallet, sunglasses, a thin scarf and the day's small things."
 },
 "making": {
  "fr": "Chaque panier est fait main par Fatima dans notre atelier de Guéliz, à Marrakech. Elle tresse le corps en feuilles de bananier, borde le tour de cuir, puis enroule les perles de rocaille autour des anses — une à une, sur une fine bande de cuir cachée qui protège l'ouvrage et fait qu'une perle perdue ne se remarque jamais. Un travail lent, patient : il n'existe jamais deux paniers identiques.",
  "en": "Each basket is handmade by Fatima in our Guéliz atelier in Marrakech. She weaves the body from banana leaves, edges it in leather, then rolls the seed beads around the handles — one by one, over a hidden strip of leather that protects the work and keeps a lost bead from ever showing. Slow, patient work: no two baskets are ever the same.",
  "es": "Cada cesta está hecha a mano por Fatima en nuestro taller de Guéliz, en Marrakech. Teje el cuerpo en hojas de banano, lo ribetea de cuero y luego enrolla las cuentas de rocalla alrededor de las asas — una a una, sobre una fina tira de cuero oculta que protege la labor y hace que una cuenta perdida no se note nunca. Un trabajo lento y paciente: nunca hay dos cestas iguales.",
  "tr": "Her sepet, Marakeş'teki Guéliz atölyemizde Fatima tarafından elde yapılır. Gövdeyi muz yaprağından örer, kenarını deriyle çevreler, ardından rocaille boncukları sapların etrafına birer birer sarar — işi koruyan ve kaybolan bir boncuğun asla belli olmamasını sağlayan gizli bir deri şeridin üzerine. Yavaş ve sabırlı bir emek: hiçbir sepet bir diğerinin aynısı değildir.",
  "ar": "كل سلّة مصنوعة يدويًا على يد فاطمة في محترفنا بحي غيليز في مراكش. تنسج الجسم من أوراق الموز، وتحيطه بالجلد، ثم تلفّ خرز الرقايل حول المقابض — خرزةً خرزة، فوق شريط جلدي خفيّ يحمي العمل ويضمن ألّا يظهر أثر لأي خرزة مفقودة. عمل بطيء وصبور: ولا تتشابه سلّتان أبدًا."
 }
 },
 {
 "handle": "la-nouvelle-vague-m-basket-bag-ss26",
 "short": {
  "fr": "Notre grand panier qui dit tout : feuilles de bananier tressées, bordures de cuir et anses enroulées de perles de rocaille.",
  "en": "Our roomy statement basket: woven banana leaves, leather borders and handles wrapped in seed beads.",
  "es": "Nuestra cesta grande que lo dice todo: hojas de banano tejidas, ribetes de cuero y asas envueltas en cuentas de rocalla.",
  "tr": "İddiasını ortaya koyan geniş sepetimiz: örülmüş muz yaprağı, deri kenarlar ve rocaille boncuklarıyla sarılı saplar.",
  "ar": "سلّتنا الكبيرة التي تقول كل شيء: أوراق موز منسوجة، وحواف جلدية، ومقابض ملفوفة بخرز الرقايل."
 },
 "desc": {
  "fr": "La Nouvelle Vague en M, c'est le grand panier des journées pleines : la plage avec un paréo et un livre, le marché du samedi, le week-end qui déborde. Assez vaste pour tout emporter, et assez beau pour être la seule pièce que l'on remarque. Le corps est tressé à la main en feuilles de bananier, en un point matelassé souple comme un édredon, puis bordé de cuir brodé sur le pourtour, surtout le long du bord supérieur. Autour des anses de cuir, nous enroulons des perles de rocaille dont les motifs répondent aux bijoux du sud du Maroc et à notre héritage africain. Sous chaque perle court une fine bande de cuir cachée : elle protège le fil et fait qu'une perle égarée ne se voit jamais. Deux lanières de cuir de chaque côté le laissent se porter à la main, au creux du coude ou à l'épaule, même quand il est bien rempli. Trois coloris — un bleu ciel, un vert, et un naturel pêche-rose-orangé qui change d'un exemplaire à l'autre. Fait main par Fatima dans notre atelier de Guéliz, à Marrakech ; jamais deux paniers identiques.",
  "en": "La Nouvelle Vague in M is the big basket for full days: the beach with a sarong and a book, the Saturday market, the weekend that spills over. Roomy enough to carry everything, and beautiful enough to be the only piece anyone notices. The body is hand-woven from banana leaves in a soft matelassé weave, quilted like an eiderdown, then edged with leather embroidery all around, especially along the top rim. Around the leather handles we roll seed beads whose motifs answer to the jewellery of southern Morocco and to our African heritage. Beneath every bead runs a hidden strip of leather: it protects the thread and means a lost bead never shows. Two leather lanyards on each side let it be carried in the hand, in the crook of the elbow or on the shoulder, even when it is well filled. Three colourways — a sky blue, a green, and a natural peach-pink-orange that shifts from one piece to the next. Handmade by Fatima in our Guéliz atelier in Marrakech; never two baskets alike.",
  "es": "La Nouvelle Vague en M es la cesta grande para los días completos: la playa con un pareo y un libro, el mercado del sábado, el fin de semana que se desborda. Lo bastante amplia para llevarlo todo, y lo bastante bonita para ser la única pieza que se mira. El cuerpo se teje a mano en hojas de banano con un punto matelassé blando como un edredón, y luego se ribetea con bordado de piel por todo el contorno, sobre todo en el borde superior. Alrededor de las asas de cuero enrollamos cuentas de rocalla cuyos motivos dialogan con la joyería del sur de Marruecos y con nuestra herencia africana. Bajo cada cuenta corre una fina tira de cuero oculta: protege el hilo y hace que una cuenta perdida no se note nunca. Dos correas de cuero a cada lado permiten llevarla en la mano, en el hueco del codo o al hombro, incluso bien llena. Tres colores — un azul cielo, un verde y un natural melocotón-rosa-naranja que cambia de una pieza a otra. Hecha a mano por Fatima en nuestro taller de Guéliz, en Marrakech; nunca dos cestas iguales.",
  "tr": "M bedendeki La Nouvelle Vague, dolu dolu günlerin büyük sepeti: bir pareo ve bir kitapla plaj, cumartesi pazarı, taşan hafta sonu. Her şeyi taşıyacak kadar geniş ve tek başına dikkat çekecek kadar güzel. Gövde, bir yorgan gibi yumuşak bir matlase örgüyle muz yaprağından elde örülür, ardından çepeçevre, özellikle üst kenar boyunca deri işlemeyle çevrelenir. Deri sapların etrafına, motifleri güney Fas'ın takılarına ve Afrika mirasımıza selam duran rocaille boncuklarını sararız. Her boncuğun altında gizli bir deri şerit uzanır: ipliği korur ve kaybolan bir boncuğun asla belli olmamasını sağlar. Her iki yandaki ikişer deri kayış, iyice dolduğunda bile sepeti elde, dirsek kıvrımında ya da omuzda taşımanıza olanak tanır. Üç renk — bir gök mavisi, bir yeşil ve parçadan parçaya değişen doğal bir şeftali-pembe-turuncu. Marakeş'teki Guéliz atölyemizde Fatima tarafından elde yapılır; hiçbir sepet bir diğerinin aynısı değildir.",
  "ar": "لا نوفيل فاغ بمقاس M هي السلّة الكبيرة للأيام الحافلة: الشاطئ مع باريو وكتاب، وسوق السبت، وعطلة نهاية أسبوع تفيض بالأشياء. واسعة بما يكفي لحمل كل شيء، وجميلة بما يكفي لتكون القطعة الوحيدة التي تلفت الأنظار. يُنسج الجسم يدويًا من أوراق الموز بنسجة مبطّنة ناعمة كاللحاف، ثم يُحاط بتطريز جلدي على كامل الحافة، خاصةً عند الطرف العلوي. حول مقابض الجلد نلفّ خرز الرقايل، الذي تستحضر زخارفه حُليّ جنوب المغرب وإرثنا الإفريقي. تحت كل خرزة يمتدّ شريط جلدي خفيّ: يحمي الخيط ويضمن ألّا يظهر أثر لأي خرزة مفقودة. سيرَان من الجلد على كل جانب يتيحان حملها باليد أو في ثنية المرفق أو على الكتف، حتى وهي ممتلئة. ثلاثة ألوان — أزرق سماوي، وأخضر، ولون طبيعي يميل إلى الخوخي-الوردي-البرتقالي يختلف من قطعة إلى أخرى. مصنوعة يدويًا على يد فاطمة في محترفنا بحي غيليز في مراكش؛ ولا تتشابه سلّتان أبدًا."
 },
 "material": {
  "fr": "Corps en feuilles de bananier tressées main. Bordures, anses et lanières en cuir. Perles de rocaille enroulées sur les anses, sur une bande de cuir cachée.",
  "en": "Body of hand-woven banana leaves. Borders, handles and lanyards in leather. Seed beads rolled onto the handles over a hidden strip of leather.",
  "es": "Cuerpo de hojas de banano tejidas a mano. Ribetes, asas y correas de cuero. Cuentas de rocalla enrolladas sobre las asas, sobre una tira de cuero oculta.",
  "tr": "Gövde elde örülmüş muz yaprağından. Kenarlar, saplar ve kayışlar deri. Rocaille boncuklar, gizli bir deri şerit üzerine, sapların etrafına sarılıdır.",
  "ar": "الجسم من أوراق الموز المنسوجة يدويًا. الحواف والمقابض والسيور من الجلد. خرز الرقايل ملفوف حول المقابض فوق شريط جلدي خفيّ."
 },
 "fabric": {
  "fr": "Feuilles de bananier en point matelassé, cuir naturel, perles de rocaille en verre.",
  "en": "Banana leaf in a matelassé weave, natural leather, glass seed beads.",
  "es": "Hoja de banano en punto matelassé, cuero natural, cuentas de rocalla de vidrio.",
  "tr": "Matlase örgüde muz yaprağı, doğal deri, cam rocaille boncuklar.",
  "ar": "أوراق موز بنسجة مبطّنة، جلد طبيعي، خرز رقايل زجاجي."
 },
 "handworkTime": {
  "fr": "Plusieurs jours de travail à la main pour le grand format : plus de surface à tresser, plus de perles à enrouler — tout se fait entièrement à la main.",
  "en": "Several days of handwork for the large format: more surface to weave, more beads to roll — all done entirely by hand.",
  "es": "Varios días de trabajo a mano para el formato grande: más superficie que tejer, más cuentas que enrollar — todo se hace enteramente a mano.",
  "tr": "Büyük boy için birkaç günlük el işçiliği: örülecek daha çok yüzey, sarılacak daha çok boncuk — hepsi tamamen elde yapılır.",
  "ar": "عدّة أيام من العمل اليدوي للمقاس الكبير: مساحة أكبر للنسج، وخرز أكثر للفّ — كل ذلك يُنجَز يدويًا بالكامل."
 },
 "dimensions": {
 "fr": "Le plus grand format - un panier de caractère, plus de volume.",
 "en": "The largest size - a basket with presence, more volume."
 },
 "edition": {
 "fr": "Fait main, par séries de 15 par taille et par coloris, le temps que vit la série - sans réassort garanti.",
 "en": "Handmade, in runs of 15 per size and colour, for the life of the series - no guaranteed restock."
 },
 "whatFits": {
 "fr": "Les essentiels, une pochette, un livre fin, un foulard et une petite trousse.",
 "en": "The essentials, a pouch, a slim book, a scarf and a small kit."
 },
 "making": {
  "fr": "Chaque panier est fait main par Fatima dans notre atelier de Guéliz, à Marrakech. Elle tresse le corps en feuilles de bananier, borde le tour de cuir, puis enroule les perles de rocaille autour des anses — une à une, sur une fine bande de cuir cachée qui protège l'ouvrage et fait qu'une perle perdue ne se remarque jamais. Un travail lent, patient : il n'existe jamais deux paniers identiques.",
  "en": "Each basket is handmade by Fatima in our Guéliz atelier in Marrakech. She weaves the body from banana leaves, edges it in leather, then rolls the seed beads around the handles — one by one, over a hidden strip of leather that protects the work and keeps a lost bead from ever showing. Slow, patient work: no two baskets are ever the same.",
  "es": "Cada cesta está hecha a mano por Fatima en nuestro taller de Guéliz, en Marrakech. Teje el cuerpo en hojas de banano, lo ribetea de cuero y luego enrolla las cuentas de rocalla alrededor de las asas — una a una, sobre una fina tira de cuero oculta que protege la labor y hace que una cuenta perdida no se note nunca. Un trabajo lento y paciente: nunca hay dos cestas iguales.",
  "tr": "Her sepet, Marakeş'teki Guéliz atölyemizde Fatima tarafından elde yapılır. Gövdeyi muz yaprağından örer, kenarını deriyle çevreler, ardından rocaille boncukları sapların etrafına birer birer sarar — işi koruyan ve kaybolan bir boncuğun asla belli olmamasını sağlayan gizli bir deri şeridin üzerine. Yavaş ve sabırlı bir emek: hiçbir sepet bir diğerinin aynısı değildir.",
  "ar": "كل سلّة مصنوعة يدويًا على يد فاطمة في محترفنا بحي غيليز في مراكش. تنسج الجسم من أوراق الموز، وتحيطه بالجلد، ثم تلفّ خرز الرقايل حول المقابض — خرزةً خرزة، فوق شريط جلدي خفيّ يحمي العمل ويضمن ألّا يظهر أثر لأي خرزة مفقودة. عمل بطيء وصبور: ولا تتشابه سلّتان أبدًا."
 }
 }
 ],
 "charms": [
 {
 "handle": "raffia-cherries-charm-ss26",
 "short": {
 "fr": "Deux cerises crochetées, reliées par la tige. Comme celles qu'on s'accrochait à l'oreille.",
 "en": "Two crocheted cherries, joined at the stem. Like the ones you hung over your ear."
 },
 "desc": {
 "fr": "Deux petites boules rouges et leur tige, crochetées au raffia par les femmes de Guéliz avec l'aakad - la technique des boutons de caftan marocain, dont la forme s'inspire justement de la cerise. Compte environ deux heures de crochet pour les arrondir et les relier - un geste lent, qu'aucune machine ne sait imiter. Clipsées au sac ou aux clés, elles balancent à chaque pas un peu du marché de Marrakech.",
 "en": "Two small red rounds and their stem, crocheted in raffia by the Guéliz women with the aakad - the Moroccan caftan-button technique, whose very shape is inspired by the cherry. Count about two hours of crochet to round them and join them - a slow gesture no machine knows how to copy. Clipped to a bag or keys, they swing a little of the Marrakech market with each step."
 },
 "material": {
 "fr": "Raffia naturel teint de manière artisanale à la main. Ce sont les brins de raffia naturel qui se cassent facilement pendant le travail, ce qui rend le crochet lent et précis - mais une fois crochetée, tissée ou cousue, la pièce devient au contraire très solide et durable, et peu sensible à l'eau. Chaque fruit est d'ailleurs rembourré avec ses propres chutes de raffia, jamais avec de la mousse synthétique. Le crochet est l'une des seules techniques au monde qu'aucune machine ne peut reproduire - cet objet ne pourrait pas être fabriqué autrement.",
 "en": "Natural raffia, hand-dyed the artisanal way. It is the strands of natural raffia that snap easily as they are worked, which makes the crochet slow and precise - but once crocheted, woven or sewn, the piece becomes very strong and long-lasting, and barely sensitive to water. Each fruit is also stuffed with its own raffia offcuts, never synthetic foam. Crochet is one of the only techniques in the world that no machine can replicate - this piece could not be made any other way."
 },
 "fabric": {
 "fr": "Le rouge monte maille après maille ; sous les doigts, chaque cerise trouve sa propre rondeur.",
 "en": "The red rises stitch after stitch; under the fingers, each cherry finds its own roundness."
 },
 "handworkTime": {
 "fr": "Environ deux heures de crochet.",
 "en": "About two hours of crochet."
 },
 "dimensions": {
 "fr": "Environ 8 cm.",
 "en": "About 8 cm."
 },
 "edition": {
 "fr": "Édition limitée, au crochet ; d'une cerise à l'autre, rien d'identique.",
 "en": "Limited edition, by crochet; from one cherry to the next, nothing identical."
 },
 "fruitStoryTitle": {
 "fr": "Les premières de la saison",
 "en": "First of the season"
 },
 "fruitStoryBody": {
 "fr": "Les cerises ouvrent la saison sur les étals - petites, rouges, en tas qui luisent. On les a nouées par deux à l'aakad, la technique des boutons de caftan de Sefrou - comme on se les accrochait à l'oreille quand on était enfant.",
 "en": "Cherries open the season on the stalls - small, red, in piles that gleam. We tied them in pairs with the aakad, Sefrou's caftan-button technique - the way we hooked them over our ears as children."
 },
 "howToWearTitle": {
 "fr": "Porter les cerises",
 "en": "Wearing the cherries"
 },
 "howToWearIntro": {
 "fr": "Un point de rouge qui se glisse partout sans rien alourdir.",
 "en": "A point of red that slips in anywhere without weighing things down."
 },
 "howToWearItems": [
 {
 "fr": "Clipsées à un sac en paille, pour toute une saison.",
 "en": "Clipped to a straw bag, for a whole season."
 },
 {
 "fr": "Au trousseau de clés, le petit signe du matin.",
 "en": "On the key ring, the small sign of the morning."
 },
 {
 "fr": "Sur une anse de cabas neutre, juste pour le réveiller.",
 "en": "On a neutral tote strap, just to wake it up."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Le rouge tient compagnie au lin écru et au denim usé - qu'il reste la seule note vive.",
 "en": "Red keeps company with ecru linen and worn denim - let it stay the only bright note."
 },
 "howToWearNote": {
 "fr": "Crochetées à la main, les deux cerises ne sont jamais jumelles - c'est la main qui parle.",
 "en": "Hand-crocheted, the two cherries are never twins - that's the hand speaking."
 },
 "making": {
 "fr": "Chaque paire de cerises est réalisée à l'aakad, les petits boutons du caftan marocain tressés un à un à la main - une technique venue de Sefrou, la ville qui célèbre la cerise chaque année, et citée au patrimoine immatériel de l'UNESCO (2025). C'est La Fatima qui la maîtrise à l'atelier de Guéliz. Chaque cerise est ensuite reliée par une tige nouée et rembourrée de chutes de raffia, avant la pose de l'étiquette YZA.",
 "en": "Each pair of cherries is made with the aakad, the small Moroccan caftan buttons braided one by one by hand - a technique from Sefrou, the town that celebrates cherries every year, and listed in the UNESCO intangible-heritage file (2025). It's La Fatima who masters it in the Guéliz atelier. Each cherry is then joined by a knotted stem and padded with raffia offcuts, before the YZA tag is added."
 },
 "attachment": {
 "fr": "Petite boucle de raffia. Anneau doré inclus dans les bundles, disponible au studio pour les charms seuls.",
 "en": "Small raffia loop. Gold ring included with bundles, available at the studio for single charms."
 },
 "returns": {
 "fr": "Garantie 30 jours : la pièce revient non portée, dans son état d'origine.",
 "en": "30-day guarantee: the piece comes back unworn, in its original condition."
 },
 "shipping": {
 "fr": "Expédition suivie sous 2 à 5 jours ouvrés. Retrait studio possible à Guéliz.",
 "en": "Tracked shipping in 2 to 5 business days. Studio pickup available in Guéliz."
 }
 },
 {
 "handle": "raffia-grapes-charm-ss26",
 "short": {
 "fr": "Une grappe de raisins, grain à grain. Le plus long de nos fruits à crocheter.",
 "en": "A bunch of grapes, grape by grape. The longest of our fruits to crochet."
 },
 "desc": {
 "fr": "Chaque grain est crocheté à part, puis noué aux autres à l'aakad - la technique des boutons de caftan - jusqu'à former la grappe : c'est ce qui peut demander jusqu'à six heures de travail. Tout ce temps pour qu'elle reste ronde et pleine, avec le volume d'une vraie grappe, sans jamais le poids - le raffia reste très léger. Pendue à un sac ou à une ceinture, elle se balance au soleil, grain contre grain.",
 "en": "Each grape is crocheted on its own, then knotted to the others with the aakad - the caftan-button technique - until the bunch takes shape, which can run up to six hours of work. All that time so it stays round and full, with the volume of a real bunch but never the weight - raffia stays very light. Hung from a bag or a belt, it sways in the sun, grape against grape."
 },
 "material": {
 "fr": "Raffia naturel teint de manière artisanale à la main. Ce sont les brins de raffia naturel qui se cassent facilement pendant le travail, ce qui rend le crochet lent et précis - mais une fois crochetée, tissée ou cousue, la pièce devient au contraire très solide et durable, et peu sensible à l'eau. Chaque fruit est d'ailleurs rembourré avec ses propres chutes de raffia, jamais avec de la mousse synthétique. Le crochet est l'une des seules techniques au monde qu'aucune machine ne peut reproduire - cet objet ne pourrait pas être fabriqué autrement.",
 "en": "Natural raffia, hand-dyed the artisanal way. It is the strands of natural raffia that snap easily as they are worked, which makes the crochet slow and precise - but once crocheted, woven or sewn, the piece becomes very strong and long-lasting, and barely sensitive to water. Each fruit is also stuffed with its own raffia offcuts, never synthetic foam. Crochet is one of the only techniques in the world that no machine can replicate - this piece could not be made any other way."
 },
 "fabric": {
 "fr": "Grain par grain, chacun crocheté seul puis cousu à la grappe : c'est de là que vient le volume.",
 "en": "Grape by grape, each one crocheted alone then sewn to the bunch: that's where the volume comes from."
 },
 "handworkTime": {
 "fr": "Jusqu'à six heures de crochet.",
 "en": "Up to six hours of crochet."
 },
 "dimensions": {
 "fr": "Environ 8 x 4 cm.",
 "en": "About 8 x 4 cm."
 },
 "edition": {
 "fr": "Une poignée de pièces, crochetées à la main ; aucune grappe ne tombe deux fois pareil.",
 "en": "A handful of pieces, crocheted by hand; no two bunches fall the same way."
 },
 "fruitStoryTitle": {
 "fr": "Le poids de fin d'été",
 "en": "Late-summer weight"
 },
 "fruitStoryBody": {
 "fr": "En fin d'été, les grappes pendent lourdes aux étals, tièdes encore du soleil. On les a refaites grain par grain pour retrouver ce poids dans la main - et l'envie d'en détacher un.",
 "en": "Late in summer the bunches hang heavy on the stalls, still warm from the sun. We rebuilt them grape by grape to find that weight in the hand - and the urge to pull one off."
 },
 "howToWearTitle": {
 "fr": "Porter les raisins",
 "en": "Wearing the grapes"
 },
 "howToWearIntro": {
 "fr": "Du volume, du balancement - une grappe qui suit vos pas.",
 "en": "Volume, sway - a bunch that follows your step."
 },
 "howToWearItems": [
 {
 "fr": "À la ceinture d'une robe d'été fluide.",
 "en": "At the belt of a flowing summer dress."
 },
 {
 "fr": "Sur un grand cabas, où elle a la place de respirer.",
 "en": "On a large tote, where it has room to breathe."
 },
 {
 "fr": "Nouée à une anse en cuir, raffia contre cuir.",
 "en": "Tied to a leather strap, raffia against leather."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Laissez-la pendre librement - une grappe demande à bouger, pas à être épinglée.",
 "en": "Let it hang free - a bunch asks to move, not to be pinned."
 },
 "howToWearNote": {
 "fr": "Cousue grain par grain à la main, aucune grappe ne pend exactement comme la précédente.",
 "en": "Sewn grape by grape by hand, no bunch hangs exactly like the last."
 },
 "making": {
 "fr": "Chaque grappe est nouée à l'aakad, la technique des boutons de caftan tressés à la main, puis cousue grain par grain par La Fatima dans l'atelier de Guéliz, avant la pose de l'étiquette YZA.",
 "en": "Each bunch is knotted with the aakad, the hand-braided caftan-button technique, then sewn grape by grape by La Fatima in the Guéliz atelier, before the YZA tag is added."
 }
 },
 {
 "handle": "raffia-whole-lemon-charm-ss26",
"making": {
 "fr": "Chaque citron est crocheté en rond dans notre raffia teint main, rembourré de ses propres chutes de raffia, puis fini à l'atelier de Guéliz par La Fatima, dont le prénom figure sur l'étiquette, avant la pose de la petite plaque dorée YZA gravée.",
 "en": "Each lemon is crocheted in the round in our hand-dyed raffia, padded with its own raffia offcuts, then finished in the Guéliz atelier by La Fatima, whose first name appears on the hand tag, before the little engraved gold YZA plate is added.",
 "es": "Cada limón se teje a ganchillo en redondo con nuestra rafia teñida a mano, se rellena con sus propios recortes de rafia y luego lo termina en el taller de Guéliz La Fatima, cuyo nombre aparece en la etiqueta, antes de colocar la plaquita dorada YZA grabada.",
 "tr": "Her limon, elde boyadığımız rafyayla yuvarlak örülür, kendi rafya kırpıntılarıyla doldurulur, ardından Guéliz atölyesinde adı etiketin üzerinde yer alan La Fatima tarafından tamamlanır ve son olarak kazınmış küçük altın YZA plakası eklenir.",
 "ar": "كل ليمونة تُحاك بالكروشيه على شكل دائري من رافيتنا المصبوغة يدويًا، وتُحشى ببقايا الرافيا الخاصة بها، ثم تُنهى في ورشة جيليز على يد لا فاطمة التي يظهر اسمها على الشارة، قبل تثبيت لوحة YZA الذهبية الصغيرة المحفورة."
},
 "short": {
  "fr": "Un citron entier, tout en rondeur. Un jaune franc, teint à la main, qui sent le soleil de Guéliz.",
  "en": "A whole lemon, all roundness. A clear yellow, hand-dyed, that smells of the Guéliz sun.",
  "es": "Un limón entero, todo redondez. Un amarillo franco, teñido a mano, que huele al sol de Guéliz.",
  "tr": "Bir bütün limon, baştan sona yuvarlak. Elde boyanmış, Guéliz güneşi kokan berrak bir sarı.",
  "ar": "ليمونة كاملة، كلها استدارة. أصفر صافٍ مصبوغ يدويًا، تفوح منه شمس جيليز."
 },
 "desc": {
  "fr": "Né des étals de fruits de Guéliz, ce citron se crochète en rond puis se rembourre pour garder sa forme pleine - environ deux heures d'un jaune teint à la main, franc et net. Le raffia, on le teint nous-mêmes dans nos teintes emblématiques ; le crocheter est l'un des gestes les plus délicats qui soient. On le tourne maille à maille jusqu'à ce qu'il tienne dans la paume comme un vrai, rembourré de ses propres chutes de raffia, jamais de mousse. Fini par l'étiquette dorée YZA gravée, il se clipse à un sac, se glisse sur un bijou, ou se porte en sautoir avec les petits anneaux dorés offerts à l'achat des boucles d'oreilles.",
  "en": "Born of the Guéliz fruit stalls, this lemon is crocheted in the round then filled to keep its full shape - about two hours of a hand-dyed yellow, clean and clear. We dye the raffia ourselves in our signature shades; crocheting it is one of the most delicate crafts there is. We turn it stitch by stitch until it sits in the palm like the real thing, padded with its own raffia offcuts, never foam. Finished with the engraved gold YZA tag, it clips to a bag, slips onto a piece of jewellery, or wears as a necklace with the little gold rings gifted when you buy the earrings.",
  "es": "Nacido de los puestos de fruta de Guéliz, este limón se teje a ganchillo en redondo y se rellena para conservar su forma plena - unas dos horas de un amarillo teñido a mano, franco y nítido. La rafia la teñimos nosotras mismas en nuestros tonos emblemáticos; tejerla a ganchillo es uno de los gestos más delicados que existen. La damos vuelta punto a punto hasta que cabe en la palma como uno de verdad, rellena con sus propios recortes de rafia, nunca con espuma. Rematado con la etiqueta dorada YZA grabada, se engancha a un bolso, se desliza en una joya o se lleva como colgante con las anillitas doradas que regalamos al comprar los pendientes.",
  "tr": "Guéliz'in meyve tezgâhlarından doğan bu limon, dolgun biçimini koruması için önce yuvarlak örülüp sonra doldurulur - elde boyanmış, berrak ve net bir sarıyla yaklaşık iki saat. Rafyayı kendi ikonik tonlarımızda kendimiz boyuyoruz; onu tığla örmek var olan en ince işlerden biridir. İlmek ilmek çevirerek, kendi rafya kırpıntılarıyla doldurup asla sünger kullanmadan, avuca gerçeği gibi oturana dek işliyoruz. Kazınmış altın rengi YZA etiketiyle tamamlanır; bir çantaya takılır, bir takıya geçirilir ya da küpe alırken hediye edilen küçük altın halkalarla kolye gibi taşınır.",
  "ar": "وُلدت هذه الليمونة من بسطات الفاكهة في جيليز، تُحاك بالكروشيه على شكل دائري ثم تُحشى لتحافظ على شكلها الممتلئ - نحو ساعتين من أصفر مصبوغ يدويًا، صافٍ وواضح. نصبغ الرافيا بأنفسنا بألواننا المميزة؛ وحياكتها بالكروشيه من أدقّ الحرف على الإطلاق. نديرها غرزةً غرزة حتى تستقرّ في راحة اليد كأنها حقيقية، محشوّةً ببقايا الرافيا الخاصة بها، لا بالإسفنج أبدًا. تُختَم بشارة YZA الذهبية المحفورة، فتُعلَّق على حقيبة، أو تُدخَل في قطعة مجوهرات، أو تُلبس كقلادة مع الحلقات الذهبية الصغيرة المُهداة عند شراء الأقراط."
 },
 "material": {
  "fr": "Raffia naturel teint à la main par nos soins dans nos teintes emblématiques. Ce sont les brins de raffia naturel qui se cassent facilement pendant le travail, ce qui rend le crochet lent et précis - l'un des gestes les plus délicats qui soient - mais une fois crochetée, tissée ou cousue, la pièce devient au contraire très solide et durable, et peu sensible à l'eau. Chaque fruit est rembourré avec ses propres chutes de raffia, jamais avec de la mousse synthétique : rien ne se perd. Le crochet est l'une des seules techniques au monde qu'aucune machine ne peut reproduire - cet objet ne pourrait pas être fabriqué autrement.",
  "en": "Natural raffia, hand-dyed by us in our signature shades. It is the strands of natural raffia that snap easily as they are worked, which makes the crochet slow and precise - one of the most delicate crafts there is - but once crocheted, woven or sewn, the piece becomes very strong and long-lasting, and barely sensitive to water. Each fruit is padded with its own raffia offcuts, never synthetic foam: nothing is wasted. Crochet is one of the only techniques in the world that no machine can replicate - this piece could not be made any other way.",
  "es": "Rafia natural, teñida a mano por nosotras en nuestros tonos emblemáticos. Son las hebras de rafia natural las que se rompen con facilidad durante el trabajo, lo que hace el ganchillo lento y preciso - uno de los gestos más delicados que existen - pero una vez tejida, entrelazada o cosida, la pieza se vuelve muy resistente y duradera, y apenas sensible al agua. Cada fruta se rellena con sus propios recortes de rafia, nunca con espuma sintética: nada se desperdicia. El ganchillo es una de las pocas técnicas del mundo que ninguna máquina puede reproducir - este objeto no podría fabricarse de otra manera.",
  "tr": "Doğal rafya, kendi ikonik tonlarımızda elimizle boyanmıştır. İşlenirken kolayca kopan, doğal rafya lifleridir; bu da tığ işini yavaş ve titiz kılar - var olan en ince işlerden biri - ama bir kez örülüp, dokunup ya da dikildiğinde parça tam tersine çok sağlam, uzun ömürlü ve suya karşı neredeyse duyarsız hâle gelir. Her meyve kendi rafya kırpıntılarıyla doldurulur, asla sentetik süngerle değil: hiçbir şey israf olmaz. Tığ işi, dünyada hiçbir makinenin taklit edemediği ender tekniklerden biridir - bu nesne başka türlü yapılamazdı.",
  "ar": "رافيا طبيعية مصبوغة يدويًا على أيدينا بألواننا المميزة. خيوط الرافيا الطبيعية هي التي تتكسّر بسهولة أثناء العمل، مما يجعل الكروشيه بطيئًا ودقيقًا - وهو من أدقّ الحرف على الإطلاق - لكن بمجرد حياكتها أو نسجها أو خياطتها تصبح القطعة على العكس متينة جدًا ومعمّرة وقليلة التأثّر بالماء. تُحشى كل ثمرة ببقايا الرافيا الخاصة بها، لا بالإسفنج الصناعي أبدًا: لا شيء يُهدر. الكروشيه من التقنيات القليلة في العالم التي لا تستطيع أي آلة محاكاتها - ولا يمكن صنع هذه القطعة بطريقة أخرى."
 },
 "fabric": {
 "fr": "Travaillé en rond et légèrement garni, il tient sa rondeur jour après jour.",
 "en": "Worked in the round and lightly stuffed, it keeps its roundness day after day."
 },
 "handworkTime": {
  "fr": "Environ deux heures de crochet.",
  "en": "About two hours of crochet.",
  "es": "Cerca de dos horas de ganchillo.",
  "tr": "Yaklaşık iki saatlik tığ işi.",
  "ar": "نحو ساعتين من الحياكة بالكروشيه."
 },
 "dimensions": {
 "fr": "Environ 4,5 cm de diamètre.",
 "en": "About 4.5 cm across."
 },
 "edition": {
 "fr": "Quelques pièces seulement, faites au crochet ; chaque citron a sa rondeur à lui.",
 "en": "Only a few pieces, made at the hook; each lemon has its own roundness."
 },
 "fruitStoryTitle": {
 "fr": "La pyramide jaune",
 "en": "The yellow pyramid"
 },
 "fruitStoryBody": {
  "fr": "Empilés en pyramides sur les étals de Guéliz, les citrons attrapent toute la lumière du matin. C'est ce jaune-là qu'on a voulu garder, teint à la main dans notre raffia : celui qui réveille une table et lance la journée.",
  "en": "Stacked into pyramids on the Guéliz stalls, the lemons catch all the morning light. That's the yellow we wanted to keep, hand-dyed into our raffia: the one that wakes a table and starts the day.",
  "es": "Apilados en pirámides sobre los puestos de Guéliz, los limones atrapan toda la luz de la mañana. Ese es el amarillo que quisimos conservar, teñido a mano en nuestra rafia: el que despierta una mesa y arranca el día.",
  "tr": "Guéliz tezgâhlarında piramitler hâlinde yığılan limonlar, sabahın bütün ışığını yakalar. İşte rafyamıza elde boyadığımız o sarıyı korumak istedik: bir sofrayı uyandıran ve güne başlatan sarı.",
  "ar": "مكدّسةً على شكل أهرام فوق بسطات جيليز، تلتقط الليمونات كل ضوء الصباح. هذا الأصفر أردنا أن نحتفظ به، مصبوغًا يدويًا في رافيتنا: الأصفر الذي يوقظ المائدة ويبدأ النهار."
 },
 "howToWearTitle": {
 "fr": "Porter le citron",
 "en": "Wearing the lemon"
 },
 "howToWearIntro": {
 "fr": "Un point de jaune, et le reste s'éclaire.",
 "en": "A point of yellow, and the rest lights up."
 },
 "howToWearItems": [
 {
 "fr": "Sur un sac en toile claire, le contraste solaire.",
 "en": "On a light canvas bag, the sunny contrast."
 },
 {
 "fr": "Au porte-clés, un rayon glissé dans la poche.",
 "en": "On the keys, a ray slipped in the pocket."
 },
 {
 "fr": "Sur une trousse de plage en raffia, matière contre matière.",
 "en": "On a raffia beach pouch, texture against texture."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Le jaune va au bleu et au blanc - rayures marinières, lin écru.",
 "en": "Yellow goes with blue and white - sailor stripes, ecru linen."
 },
 "howToWearNote": {
 "fr": "Crocheté et garni à la main, aucun citron n'a tout à fait la même rondeur que son voisin.",
 "en": "Crocheted and filled by hand, no lemon has quite the same roundness as its neighbour."
 }
 },
 {
 "handle": "raffia-whole-orange-charm-ss26",
"making": {
 "fr": "Chaque orange est crochetée en rond dans notre raffia teint main, rembourrée de ses propres chutes de raffia, puis finie à l'atelier de Guéliz par La Fatima, dont le prénom figure sur l'étiquette, avant la pose de la petite plaque dorée YZA gravée.",
 "en": "Each orange is crocheted in the round in our hand-dyed raffia, padded with its own raffia offcuts, then finished in the Guéliz atelier by La Fatima, whose first name appears on the hand tag, before the little engraved gold YZA plate is added.",
 "es": "Cada naranja se teje a ganchillo en redondo con nuestra rafia teñida a mano, se rellena con sus propios recortes de rafia y luego la termina en el taller de Guéliz La Fatima, cuyo nombre aparece en la etiqueta, antes de colocar la plaquita dorada YZA grabada.",
 "tr": "Her portakal, elde boyadığımız rafyayla yuvarlak örülür, kendi rafya kırpıntılarıyla doldurulur, ardından Guéliz atölyesinde adı etiketin üzerinde yer alan La Fatima tarafından tamamlanır ve son olarak kazınmış küçük altın YZA plakası eklenir.",
 "ar": "كل برتقالة تُحاك بالكروشيه على شكل دائري من رافيتنا المصبوغة يدويًا، وتُحشى ببقايا الرافيا الخاصة بها، ثم تُنهى في ورشة جيليز على يد لا فاطمة التي يظهر اسمها على الشارة، قبل تثبيت لوحة YZA الذهبية الصغيرة المحفورة."
},
 "short": {
  "fr": "Une orange entière, ronde et pleine. La couleur d'un coucher de soleil, teinte à la main.",
  "en": "A whole orange, round and full. The colour of a sunset, hand-dyed.",
  "es": "Una naranja entera, redonda y plena. El color de un atardecer, teñido a mano.",
  "tr": "Bir bütün portakal, yuvarlak ve dolgun. Elde boyanmış bir gün batımının rengi.",
  "ar": "برتقالة كاملة، مستديرة وممتلئة. لون غروب الشمس، مصبوغ يدويًا."
 },
 "desc": {
  "fr": "Deux heures de crochet en rond, un peu de rembourrage, et l'orange tient sa forme pleine, chaude comme le ciel de fin d'après-midi sur les étals de Guéliz. Le raffia, on le teint nous-mêmes dans nos teintes emblématiques ; La Fatima et les femmes de l'atelier la tournent maille après maille - l'un des gestes les plus délicats qui soient - jusqu'à ce qu'elle ait le galbe d'un vrai fruit, rembourrée de ses seules chutes de raffia. Fini par l'étiquette dorée YZA gravée, il se clipse au sac, se glisse sur un bijou ou se porte en sautoir avec les petits anneaux dorés offerts avec les boucles d'oreilles.",
  "en": "Two hours of crochet in the round, a little stuffing, and the orange holds its full shape, warm as the late-afternoon sky over the Guéliz stalls. We dye the raffia ourselves in our signature shades; La Fatima and the atelier women turn it stitch after stitch - one of the most delicate crafts there is - until it has the curve of a real fruit, padded with its raffia offcuts alone. Finished with the engraved gold YZA tag, it clips to a bag, slips onto a piece of jewellery, or wears as a necklace with the little gold rings gifted with the earrings.",
  "es": "Dos horas de ganchillo en redondo, algo de relleno, y la naranja conserva su forma plena, cálida como el cielo de media tarde sobre los puestos de Guéliz. La rafia la teñimos nosotras mismas en nuestros tonos emblemáticos; La Fatima y las mujeres del taller la dan vuelta punto tras punto - uno de los gestos más delicados que existen - hasta que tiene la curva de una fruta de verdad, rellena solo con sus recortes de rafia. Rematada con la etiqueta dorada YZA grabada, se engancha al bolso, se desliza en una joya o se lleva como colgante con las anillitas doradas que regalamos con los pendientes.",
  "tr": "İki saatlik yuvarlak tığ işi, biraz dolgu ve portakal, Guéliz tezgâhlarının üzerindeki ikindi göğü gibi sıcak, dolgun biçimini korur. Rafyayı kendi ikonik tonlarımızda kendimiz boyuyoruz; La Fatima ve atölyenin kadınları onu ilmek ilmek çevirir - var olan en ince işlerden biri - gerçek bir meyvenin kıvrımını alana dek, yalnızca kendi rafya kırpıntılarıyla doldurarak. Kazınmış altın YZA etiketiyle tamamlanır; çantaya takılır, bir takıya geçirilir ya da küpelerle hediye edilen küçük altın halkalarla kolye gibi taşınır.",
  "ar": "ساعتان من الحياكة الدائرية بالكروشيه، وقليل من الحشو، فتحافظ البرتقالة على شكلها الممتلئ، دافئةً كسماء آخر العصر فوق بسطات جيليز. نصبغ الرافيا بأنفسنا بألواننا المميزة؛ وتديرها لا فاطمة ونساء الورشة غرزةً بعد غرزة - وهو من أدقّ الحرف على الإطلاق - حتى تأخذ انحناء ثمرة حقيقية، محشوّةً ببقايا رافيتها وحدها. تُختَم بشارة YZA الذهبية المحفورة، فتُعلَّق على الحقيبة، أو تُدخَل في قطعة مجوهرات، أو تُلبس كقلادة مع الحلقات الذهبية الصغيرة المُهداة مع الأقراط."
 },
 "material": {
  "fr": "Raffia naturel teint à la main par nos soins dans nos teintes emblématiques. Ce sont les brins de raffia naturel qui se cassent facilement pendant le travail, ce qui rend le crochet lent et précis - l'un des gestes les plus délicats qui soient - mais une fois crochetée, tissée ou cousue, la pièce devient au contraire très solide et durable, et peu sensible à l'eau. Chaque fruit est rembourré avec ses propres chutes de raffia, jamais avec de la mousse synthétique : rien ne se perd. Le crochet est l'une des seules techniques au monde qu'aucune machine ne peut reproduire - cet objet ne pourrait pas être fabriqué autrement.",
  "en": "Natural raffia, hand-dyed by us in our signature shades. It is the strands of natural raffia that snap easily as they are worked, which makes the crochet slow and precise - one of the most delicate crafts there is - but once crocheted, woven or sewn, the piece becomes very strong and long-lasting, and barely sensitive to water. Each fruit is padded with its own raffia offcuts, never synthetic foam: nothing is wasted. Crochet is one of the only techniques in the world that no machine can replicate - this piece could not be made any other way.",
  "es": "Rafia natural, teñida a mano por nosotras en nuestros tonos emblemáticos. Son las hebras de rafia natural las que se rompen con facilidad durante el trabajo, lo que hace el ganchillo lento y preciso - uno de los gestos más delicados que existen - pero una vez tejida, entrelazada o cosida, la pieza se vuelve muy resistente y duradera, y apenas sensible al agua. Cada fruta se rellena con sus propios recortes de rafia, nunca con espuma sintética: nada se desperdicia. El ganchillo es una de las pocas técnicas del mundo que ninguna máquina puede reproducir - este objeto no podría fabricarse de otra manera.",
  "tr": "Doğal rafya, kendi ikonik tonlarımızda elimizle boyanmıştır. İşlenirken kolayca kopan, doğal rafya lifleridir; bu da tığ işini yavaş ve titiz kılar - var olan en ince işlerden biri - ama bir kez örülüp, dokunup ya da dikildiğinde parça tam tersine çok sağlam, uzun ömürlü ve suya karşı neredeyse duyarsız hâle gelir. Her meyve kendi rafya kırpıntılarıyla doldurulur, asla sentetik süngerle değil: hiçbir şey israf olmaz. Tığ işi, dünyada hiçbir makinenin taklit edemediği ender tekniklerden biridir - bu nesne başka türlü yapılamazdı.",
  "ar": "رافيا طبيعية مصبوغة يدويًا على أيدينا بألواننا المميزة. خيوط الرافيا الطبيعية هي التي تتكسّر بسهولة أثناء العمل، مما يجعل الكروشيه بطيئًا ودقيقًا - وهو من أدقّ الحرف على الإطلاق - لكن بمجرد حياكتها أو نسجها أو خياطتها تصبح القطعة على العكس متينة جدًا ومعمّرة وقليلة التأثّر بالماء. تُحشى كل ثمرة ببقايا الرافيا الخاصة بها، لا بالإسفنج الصناعي أبدًا: لا شيء يُهدر. الكروشيه من التقنيات القليلة في العالم التي لا تستطيع أي آلة محاكاتها - ولا يمكن صنع هذه القطعة بطريقة أخرى."
 },
 "fabric": {
 "fr": "Tournée en rond, légèrement garnie, sa couleur chaude monte maille à maille.",
 "en": "Turned in the round, lightly filled, its warm colour rising stitch by stitch."
 },
 "handworkTime": {
  "fr": "Environ deux heures de crochet.",
  "en": "About two hours of crochet.",
  "es": "Cerca de dos horas de ganchillo.",
  "tr": "Yaklaşık iki saatlik tığ işi.",
  "ar": "نحو ساعتين من الحياكة بالكروشيه."
 },
 "dimensions": {
 "fr": "Environ 4,5 cm de diamètre.",
 "en": "About 4.5 cm across."
 },
 "edition": {
 "fr": "Crochetée en petit nombre, à Guéliz ; pas une orange ronde de la même façon.",
 "en": "Crocheted in small numbers, in Guéliz; not one orange round the same way."
 },
 "fruitStoryTitle": {
 "fr": "La couleur des charrettes à jus",
 "en": "The juice-cart colour"
 },
 "fruitStoryBody": {
  "fr": "Sur les charrettes à jus de Guéliz, les oranges roulent par dizaines, leur couleur se mêlant au ciel de fin d'après-midi. On l'a teinte à la main puis crochetée chaude et ronde pour la garder même hors saison.",
  "en": "On the Guéliz juice carts the oranges roll by the dozen, their colour mixing into the late-afternoon sky. We hand-dyed it then crocheted it warm and round to keep it even out of season.",
  "es": "En las carretas de zumo de Guéliz las naranjas ruedan por docenas, su color mezclándose con el cielo de media tarde. La teñimos a mano y la tejimos a ganchillo, cálida y redonda, para conservarla incluso fuera de temporada.",
  "tr": "Guéliz'in meyve suyu arabalarında portakallar düzinelerle yuvarlanır, renkleri ikindi göğüne karışır. Onu elde boyadık, sonra sıcak ve yuvarlak örerek mevsimi geçse bile korumak istedik.",
  "ar": "على عربات العصير في جيليز، تتدحرج البرتقالات بالعشرات، فيمتزج لونها بسماء آخر العصر. صبغناها يدويًا ثم حِكناها بالكروشيه دافئةً ومستديرة لنحتفظ بها حتى خارج موسمها."
 },
 "howToWearTitle": {
 "fr": "Porter l'orange",
 "en": "Wearing the orange"
 },
 "howToWearIntro": {
 "fr": "Une rondeur chaude qui réchauffe une tenue d'un coup.",
 "en": "A warm round that heats up an outfit at once."
 },
 "howToWearItems": [
 {
 "fr": "Sur un sac en cuir cognac, ton sur ton.",
 "en": "On a cognac leather bag, tone on tone."
 },
 {
 "fr": "Au porte-clés, repérable d'un seul regard.",
 "en": "On the keys, spotted in a single look."
 },
 {
 "fr": "Sur une veste en jean, un fruit oublié dans la poche.",
 "en": "On a denim jacket, a fruit forgotten in the pocket."
 }
 ],
 "howToWearStyleTip": {
 "fr": "L'orange s'entend avec le terracotta et le kaki - la palette même de Marrakech.",
 "en": "Orange gets on with terracotta and khaki - the very Marrakech palette."
 },
 "howToWearNote": {
 "fr": "Façonnée et garnie à la main, chaque orange porte sa propre forme.",
 "en": "Shaped and filled by hand, each orange carries its own form."
 }
 },
 {
 "handle": "raffia-tomato-charm-ss26",
"making": {
 "fr": "Chaque tomate est crochetée en rond dans notre raffia teint main, sa couronne verte montée à part puis cousue, rembourrée de ses propres chutes de raffia, puis finie à l'atelier de Guéliz par La Fatima, dont le prénom figure sur l'étiquette, avant la pose de la petite plaque dorée YZA gravée.",
 "en": "Each tomato is crocheted in the round in our hand-dyed raffia, its green crown made separately then sewn on, padded with its own raffia offcuts, then finished in the Guéliz atelier by La Fatima, whose first name appears on the hand tag, before the little engraved gold YZA plate is added.",
 "es": "Cada tomate se teje a ganchillo en redondo con nuestra rafia teñida a mano, su corona verde montada aparte y luego cosida, se rellena con sus propios recortes de rafia y lo termina en el taller de Guéliz La Fatima, cuyo nombre aparece en la etiqueta, antes de colocar la plaquita dorada YZA grabada.",
 "tr": "Her domates, elde boyadığımız rafyayla yuvarlak örülür, yeşil tacı ayrı yapılıp dikilir, kendi rafya kırpıntılarıyla doldurulur, ardından Guéliz atölyesinde adı etiketin üzerinde yer alan La Fatima tarafından tamamlanır ve son olarak kazınmış küçük altın YZA plakası eklenir.",
 "ar": "كل طماطم تُحاك بالكروشيه على شكل دائري من رافيتنا المصبوغة يدويًا، ويُصنَع تاجها الأخضر على حدة ثم يُخاط، وتُحشى ببقايا الرافيا الخاصة بها، ثم تُنهى في ورشة جيليز على يد لا فاطمة التي يظهر اسمها على الشارة، قبل تثبيت لوحة YZA الذهبية الصغيرة المحفورة."
},
 "short": {
  "fr": "Une tomate bien ronde, rouge mûr teint à la main, coiffée de sa couronne verte. Droit du potager.",
  "en": "A nicely round tomato, hand-dyed ripe red, topped with its green crown. Straight from the garden.",
  "es": "Un tomate bien redondo, rojo maduro teñido a mano, coronado con su corona verde. Directo del huerto.",
  "tr": "Güzelce yuvarlak bir domates, elde boyanmış olgun kırmızı, yeşil tacıyla taçlanmış. Doğrudan bahçeden.",
  "ar": "طماطم مستديرة تمامًا، حمراء ناضجة مصبوغة يدويًا، بتاجها الأخضر. مباشرةً من البستان."
 },
 "desc": {
  "fr": "Corps rouge crocheté en rond, petite couronne verte montée à part puis cousue dessus : environ deux heures pour qu'elle garde son galbe plein. Un fruit des étals de Guéliz passé entre les mains des femmes de l'atelier, dans un raffia qu'on teint nous-mêmes - le crocheter est l'un des gestes les plus délicats qui soient. Rembourrée de ses seules chutes de raffia et finie par l'étiquette dorée YZA gravée, elle se clipse sur un sac, une ceinture ou les clés, se glisse sur un bijou, ou se porte en sautoir avec les petits anneaux dorés offerts avec les boucles d'oreilles - le rouge mûr suffit à attirer l'œil.",
  "en": "Red body crocheted in the round, a little green crown made separately then sewn on top: about two hours so it keeps its full curve. A fruit from the Guéliz stalls, passed through the atelier women's hands, in a raffia we dye ourselves - crocheting it is one of the most delicate crafts there is. Padded with its raffia offcuts alone and finished with the engraved gold YZA tag, it clips to a bag, a belt or the keys, slips onto a piece of jewellery, or wears as a necklace with the little gold rings gifted with the earrings - the ripe red is enough to catch the eye.",
  "es": "Cuerpo rojo tejido a ganchillo en redondo, corona verde montada aparte y luego cosida encima: unas dos horas para que conserve su curva plena. Una fruta de los puestos de Guéliz pasada por las manos de las mujeres del taller, en una rafia que teñimos nosotras mismas - tejerla a ganchillo es uno de los gestos más delicados que existen. Rellena solo con sus recortes de rafia y rematada con la etiqueta dorada YZA grabada, se engancha a un bolso, un cinturón o las llaves, se desliza en una joya o se lleva como colgante con las anillitas doradas que regalamos con los pendientes - el rojo maduro basta para atraer la mirada.",
  "tr": "Kırmızı gövde yuvarlak örülür, küçük yeşil taç ayrı yapılıp üzerine dikilir: dolgun kıvrımını koruması için yaklaşık iki saat. Guéliz tezgâhlarından bir meyve, atölye kadınlarının elinden geçmiş, kendi boyadığımız bir rafyayla - onu tığla örmek var olan en ince işlerden biridir. Yalnızca kendi rafya kırpıntılarıyla doldurulup kazınmış altın YZA etiketiyle tamamlanır; bir çantaya, bir kemere ya da anahtarlara takılır, bir takıya geçirilir veya küpelerle hediye edilen küçük altın halkalarla kolye gibi taşınır - olgun kırmızısı gözü yakalamaya yeter.",
  "ar": "جسم أحمر يُحاك بالكروشيه على شكل دائري، وتاج أخضر صغير يُصنَع على حدة ثم يُخاط فوقه: نحو ساعتين لتحافظ على انحنائها الممتلئ. ثمرة من بسطات جيليز مرّت بين أيدي نساء الورشة، في رافيا نصبغها بأنفسنا - وحياكتها بالكروشيه من أدقّ الحرف على الإطلاق. محشوّةً ببقايا رافيتها وحدها ومختومةً بشارة YZA الذهبية المحفورة، تُعلَّق على حقيبة أو حزام أو المفاتيح، أو تُدخَل في قطعة مجوهرات، أو تُلبس كقلادة مع الحلقات الذهبية الصغيرة المُهداة مع الأقراط - يكفي أحمرها الناضج ليلفت النظر."
 },
 "material": {
  "fr": "Raffia naturel teint à la main par nos soins dans nos teintes emblématiques. Ce sont les brins de raffia naturel qui se cassent facilement pendant le travail, ce qui rend le crochet lent et précis - l'un des gestes les plus délicats qui soient - mais une fois crochetée, tissée ou cousue, la pièce devient au contraire très solide et durable, et peu sensible à l'eau. Chaque fruit est rembourré avec ses propres chutes de raffia, jamais avec de la mousse synthétique : rien ne se perd. Le crochet est l'une des seules techniques au monde qu'aucune machine ne peut reproduire - cet objet ne pourrait pas être fabriqué autrement.",
  "en": "Natural raffia, hand-dyed by us in our signature shades. It is the strands of natural raffia that snap easily as they are worked, which makes the crochet slow and precise - one of the most delicate crafts there is - but once crocheted, woven or sewn, the piece becomes very strong and long-lasting, and barely sensitive to water. Each fruit is padded with its own raffia offcuts, never synthetic foam: nothing is wasted. Crochet is one of the only techniques in the world that no machine can replicate - this piece could not be made any other way.",
  "es": "Rafia natural, teñida a mano por nosotras en nuestros tonos emblemáticos. Son las hebras de rafia natural las que se rompen con facilidad durante el trabajo, lo que hace el ganchillo lento y preciso - uno de los gestos más delicados que existen - pero una vez tejida, entrelazada o cosida, la pieza se vuelve muy resistente y duradera, y apenas sensible al agua. Cada fruta se rellena con sus propios recortes de rafia, nunca con espuma sintética: nada se desperdicia. El ganchillo es una de las pocas técnicas del mundo que ninguna máquina puede reproducir - este objeto no podría fabricarse de otra manera.",
  "tr": "Doğal rafya, kendi ikonik tonlarımızda elimizle boyanmıştır. İşlenirken kolayca kopan, doğal rafya lifleridir; bu da tığ işini yavaş ve titiz kılar - var olan en ince işlerden biri - ama bir kez örülüp, dokunup ya da dikildiğinde parça tam tersine çok sağlam, uzun ömürlü ve suya karşı neredeyse duyarsız hâle gelir. Her meyve kendi rafya kırpıntılarıyla doldurulur, asla sentetik süngerle değil: hiçbir şey israf olmaz. Tığ işi, dünyada hiçbir makinenin taklit edemediği ender tekniklerden biridir - bu nesne başka türlü yapılamazdı.",
  "ar": "رافيا طبيعية مصبوغة يدويًا على أيدينا بألواننا المميزة. خيوط الرافيا الطبيعية هي التي تتكسّر بسهولة أثناء العمل، مما يجعل الكروشيه بطيئًا ودقيقًا - وهو من أدقّ الحرف على الإطلاق - لكن بمجرد حياكتها أو نسجها أو خياطتها تصبح القطعة على العكس متينة جدًا ومعمّرة وقليلة التأثّر بالماء. تُحشى كل ثمرة ببقايا الرافيا الخاصة بها، لا بالإسفنج الصناعي أبدًا: لا شيء يُهدر. الكروشيه من التقنيات القليلة في العالم التي لا تستطيع أي آلة محاكاتها - ولا يمكن صنع هذه القطعة بطريقة أخرى."
 },
 "fabric": {
 "fr": "Corps rouge et couronne verte crochetés à part, réunis ensuite à l'aiguille.",
 "en": "Red body and green crown crocheted apart, then brought together with the needle."
 },
 "handworkTime": {
  "fr": "Environ deux heures de crochet.",
  "en": "About two hours of crochet.",
  "es": "Cerca de dos horas de ganchillo.",
  "tr": "Yaklaşık iki saatlik tığ işi.",
  "ar": "نحو ساعتين من الحياكة بالكروشيه."
 },
 "dimensions": {
 "fr": "Environ 4,5 cm de diamètre.",
 "en": "About 4.5 cm across."
 },
 "edition": {
 "fr": "Petite fournée, faite main au crochet ; chaque couronne tombe un peu autrement.",
 "en": "A small batch, hand-made at the hook; each crown sits a little differently."
 },
 "fruitStoryTitle": {
 "fr": "Le détail de la couronne",
 "en": "The crown detail"
 },
 "fruitStoryBody": {
  "fr": "Les tomates arrivent aux étals de Guéliz tièdes encore, rouges et lourdes, posées près des herbes fraîches. On a tenu à leur petite couronne verte - le détail qui dit qu'elles viennent d'être cueillies - et teint le tout à la main dans notre raffia.",
  "en": "Tomatoes reach the Guéliz stalls still warm, red and heavy, set near the fresh herbs. We kept their little green crown - the detail that says they were just picked - and hand-dyed the whole thing into our raffia.",
  "es": "Los tomates llegan a los puestos de Guéliz todavía tibios, rojos y pesados, junto a las hierbas frescas. Conservamos su pequeña corona verde - el detalle que dice que acaban de cosecharse - y lo teñimos todo a mano en nuestra rafia.",
  "tr": "Domatesler Guéliz tezgâhlarına hâlâ ılık, kırmızı ve ağır gelir, taze otların yanına konur. Küçük yeşil taçlarını korumakta ısrar ettik - yeni koparıldıklarını söyleyen ayrıntı - ve hepsini rafyamıza elde boyadık.",
  "ar": "تصل الطماطم إلى بسطات جيليز وهي لا تزال دافئة، حمراء وثقيلة، موضوعةً قرب الأعشاب الطازجة. حرصنا على تاجها الأخضر الصغير - التفصيل الذي يقول إنها قُطفت للتوّ - وصبغنا الكل يدويًا في رافيتنا."
 },
 "howToWearTitle": {
 "fr": "Porter la tomate",
 "en": "Wearing the tomato"
 },
 "howToWearIntro": {
 "fr": "Un rouge gourmand, un brin espiègle, pour ne pas trop se prendre au sérieux.",
 "en": "A juicy red, a touch mischievous, for not taking yourself too seriously."
 },
 "howToWearItems": [
 {
 "fr": "Sur un panier de marché, là où elle va de soi.",
 "en": "On a market basket, where it goes without saying."
 },
 {
 "fr": "Au porte-clés, pour un sourire au réveil.",
 "en": "On the keys, for a smile on waking."
 },
 {
 "fr": "Sur un sac vert ou kaki, son complice naturel.",
 "en": "On a green or khaki bag, its natural partner."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Le rouge et le vert ensemble, sans hésiter - c'est la tomate qui le permet.",
 "en": "Red and green together, no hesitation - the tomato allows it."
 },
 "howToWearNote": {
 "fr": "Crochetée à la main, chaque tomate a sa rondeur et une couronne jamais identique.",
 "en": "Hand-crocheted, each tomato has its roundness and a crown that's never identical."
 }
 },
 {
 "handle": "raffia-lemon-slice-charm-ss26",
"making": {
 "fr": "Chaque tranche est crochetée dans notre raffia teint main, ses quartiers et son zeste tracés par changements de couleur, puis finie à l'atelier de Guéliz par La Fatima, dont le prénom figure sur l'étiquette, avant la pose de la petite plaque dorée YZA gravée.",
 "en": "Each slice is crocheted in our hand-dyed raffia, its segments and rind drawn through colour changes, then finished in the Guéliz atelier by La Fatima, whose first name appears on the hand tag, before the little engraved gold YZA plate is added.",
 "es": "Cada rodaja se teje a ganchillo con nuestra rafia teñida a mano, sus gajos y su ralladura trazados con cambios de color, y luego la termina en el taller de Guéliz La Fatima, cuyo nombre aparece en la etiqueta, antes de colocar la plaquita dorada YZA grabada.",
 "tr": "Her dilim, elde boyadığımız rafyayla örülür, dilimleri ve kabuğu renk değişimleriyle çizilir, ardından Guéliz atölyesinde adı etiketin üzerinde yer alan La Fatima tarafından tamamlanır ve son olarak kazınmış küçük altın YZA plakası eklenir.",
 "ar": "كل شريحة تُحاك بالكروشيه من رافيتنا المصبوغة يدويًا، وتُرسَم فصوصها وقشرتها بتغيّرات اللون، ثم تُنهى في ورشة جيليز على يد لا فاطمة التي يظهر اسمها على الشارة، قبل تثبيت لوحة YZA الذهبية الصغيرة المحفورة."
},
 "short": {
  "fr": "Une rondelle de citron, quartiers clairs et zeste tout autour. Pas une impression : du crochet teint main.",
  "en": "A round of lemon, pale segments and rind all round. Not a print: hand-dyed crochet.",
  "es": "Una rodaja de limón, gajos claros y ralladura alrededor. No es un estampado: ganchillo teñido a mano.",
  "tr": "Bir dilim limon, açık dilimler ve etrafını saran kabuk. Baskı değil: elde boyanmış tığ işi.",
  "ar": "شريحة ليمون، فصوص فاتحة وقشرة تحيط بها. ليست طبعة: كروشيه مصبوغ يدويًا."
 },
 "desc": {
  "fr": "Les quartiers se dessinent en clair sur le jaune, le zeste les cercle d'un dernier rang - tout vient du crochet et de notre raffia teint à la main, jamais de l'impression. Compte près d'une heure pour ce travail minutieux et précis, l'un des gestes les plus délicats qui soient, où chaque section doit se lire. Née des étals de Guéliz et finie par l'étiquette dorée YZA gravée, elle est légère : elle se clipse sur un sac, se glisse sur un bijou, ou se porte en sautoir avec les petits anneaux dorés offerts avec les boucles d'oreilles, et apporte sa pointe acidulée.",
  "en": "The segments are drawn pale against the yellow, the rind ringing them with a last round - all of it crochet in our hand-dyed raffia, never print. Count close to an hour for this exacting, precise work, one of the most delicate crafts there is, where every section has to read. Born of the Guéliz stalls and finished with the engraved gold YZA tag, it is light: it clips to a bag, slips onto a piece of jewellery, or wears as a necklace with the little gold rings gifted with the earrings, and brings its tart little edge.",
  "es": "Los gajos se dibujan claros sobre el amarillo, la ralladura los rodea con una última vuelta - todo es ganchillo en nuestra rafia teñida a mano, nunca estampado. Cuenta cerca de una hora para este trabajo minucioso y preciso, uno de los gestos más delicados que existen, donde cada sección debe leerse. Nacida de los puestos de Guéliz y rematada con la etiqueta dorada YZA grabada, es ligera: se engancha a un bolso, se desliza en una joya o se lleva como colgante con las anillitas doradas que regalamos con los pendientes, y aporta su punta ácida.",
  "tr": "Dilimler sarının üzerine açık renkle çizilir, kabuk son bir sırayla onları çevreler - hepsi elde boyadığımız rafyayla tığ işi, asla baskı değil. Bu titiz ve hassas iş için yaklaşık bir saat sayın - var olan en ince işlerden biri - burada her bölmenin okunması gerekir. Guéliz tezgâhlarından doğmuş ve kazınmış altın YZA etiketiyle tamamlanmış, hafiftir: çantaya takılır, bir takıya geçirilir ya da küpelerle hediye edilen küçük altın halkalarla kolye gibi taşınır ve o ekşimsi dokunuşunu katar.",
  "ar": "تُرسَم الفصوص فاتحةً على الأصفر، وتحيط بها القشرة بصفٍّ أخير - كله كروشيه من رافيتنا المصبوغة يدويًا، لا طباعة أبدًا. احسب نحو ساعة لهذا العمل الدقيق المتقن، وهو من أدقّ الحرف على الإطلاق، حيث يجب أن يظهر كل قسم بوضوح. وُلدت من بسطات جيليز وخُتمت بشارة YZA الذهبية المحفورة، وهي خفيفة: تُعلَّق على حقيبة، أو تُدخَل في قطعة مجوهرات، أو تُلبس كقلادة مع الحلقات الذهبية الصغيرة المُهداة مع الأقراط، وتضيف لمستها الحامضة."
 },
 "material": {
  "fr": "Raffia naturel teint à la main par nos soins dans nos teintes emblématiques. Ce sont les brins de raffia naturel qui se cassent facilement pendant le travail, ce qui rend le crochet lent et précis - l'un des gestes les plus délicats qui soient - mais une fois crochetée, tissée ou cousue, la pièce devient au contraire très solide et durable, et peu sensible à l'eau. Chaque fruit est rembourré avec ses propres chutes de raffia, jamais avec de la mousse synthétique : rien ne se perd. Le crochet est l'une des seules techniques au monde qu'aucune machine ne peut reproduire - cet objet ne pourrait pas être fabriqué autrement.",
  "en": "Natural raffia, hand-dyed by us in our signature shades. It is the strands of natural raffia that snap easily as they are worked, which makes the crochet slow and precise - one of the most delicate crafts there is - but once crocheted, woven or sewn, the piece becomes very strong and long-lasting, and barely sensitive to water. Each fruit is padded with its own raffia offcuts, never synthetic foam: nothing is wasted. Crochet is one of the only techniques in the world that no machine can replicate - this piece could not be made any other way.",
  "es": "Rafia natural, teñida a mano por nosotras en nuestros tonos emblemáticos. Son las hebras de rafia natural las que se rompen con facilidad durante el trabajo, lo que hace el ganchillo lento y preciso - uno de los gestos más delicados que existen - pero una vez tejida, entrelazada o cosida, la pieza se vuelve muy resistente y duradera, y apenas sensible al agua. Cada fruta se rellena con sus propios recortes de rafia, nunca con espuma sintética: nada se desperdicia. El ganchillo es una de las pocas técnicas del mundo que ninguna máquina puede reproducir - este objeto no podría fabricarse de otra manera.",
  "tr": "Doğal rafya, kendi ikonik tonlarımızda elimizle boyanmıştır. İşlenirken kolayca kopan, doğal rafya lifleridir; bu da tığ işini yavaş ve titiz kılar - var olan en ince işlerden biri - ama bir kez örülüp, dokunup ya da dikildiğinde parça tam tersine çok sağlam, uzun ömürlü ve suya karşı neredeyse duyarsız hâle gelir. Her meyve kendi rafya kırpıntılarıyla doldurulur, asla sentetik süngerle değil: hiçbir şey israf olmaz. Tığ işi, dünyada hiçbir makinenin taklit edemediği ender tekniklerden biridir - bu nesne başka türlü yapılamazdı.",
  "ar": "رافيا طبيعية مصبوغة يدويًا على أيدينا بألواننا المميزة. خيوط الرافيا الطبيعية هي التي تتكسّر بسهولة أثناء العمل، مما يجعل الكروشيه بطيئًا ودقيقًا - وهو من أدقّ الحرف على الإطلاق - لكن بمجرد حياكتها أو نسجها أو خياطتها تصبح القطعة على العكس متينة جدًا ومعمّرة وقليلة التأثّر بالماء. تُحشى كل ثمرة ببقايا الرافيا الخاصة بها، لا بالإسفنج الصناعي أبدًا: لا شيء يُهدر. الكروشيه من التقنيات القليلة في العالم التي لا تستطيع أي آلة محاكاتها - ولا يمكن صنع هذه القطعة بطريقة أخرى."
 },
 "fabric": {
 "fr": "Quartiers et zeste naissent de changements de couleur au crochet - aucune impression.",
 "en": "Segments and rind come from colour changes in the crochet - no printing."
 },
 "handworkTime": {
  "fr": "Environ une heure de crochet.",
  "en": "About one hour of crochet.",
  "es": "Cerca de una hora de ganchillo.",
  "tr": "Yaklaşık bir saatlik tığ işi.",
  "ar": "نحو ساعة من الحياكة بالكروشيه."
 },
 "dimensions": {
 "fr": "Environ 6 x 4 cm.",
 "en": "About 6 x 4 cm."
 },
 "edition": {
 "fr": "Faite en petite quantité, au crochet ; les quartiers ne se tracent jamais pareil.",
 "en": "Made in small quantity, by crochet; the segments are never traced the same."
 },
 "fruitStoryTitle": {
 "fr": "Celle qu'on glisse près du thé",
 "en": "The one slipped beside the tea"
 },
 "fruitStoryBody": {
  "fr": "Une tranche de citron, c'est une cuisine de Marrakech en plein été - celle qu'on presse sur le poisson, qu'on pose près du verre de thé. On en a tracé les quartiers un à un, au crochet, dans notre raffia teint main, pour en tenir la fraîcheur.",
  "en": "A lemon slice is a Marrakech kitchen in high summer - the one squeezed over the fish, set beside the glass of tea. We traced its segments one by one, in crochet, in our hand-dyed raffia, to hold that freshness.",
  "es": "Una rodaja de limón es una cocina de Marrakech en pleno verano - la que se exprime sobre el pescado, la que se posa junto al vaso de té. Trazamos sus gajos uno a uno, a ganchillo, en nuestra rafia teñida a mano, para retener esa frescura.",
  "tr": "Bir dilim limon, yaz ortasında bir Marakeş mutfağıdır - balığın üzerine sıkılan, çay bardağının yanına konan. Dilimlerini birer birer, tığ işiyle, elde boyadığımız rafyada çizdik ki o tazeliği tutalım.",
  "ar": "شريحة الليمون هي مطبخ مراكشي في عزّ الصيف - تلك التي تُعصَر على السمك، وتوضع قرب كأس الشاي. رسمنا فصوصها واحدًا واحدًا بالكروشيه، في رافيتنا المصبوغة يدويًا، لنمسك بتلك النضارة."
 },
 "howToWearTitle": {
 "fr": "Porter la tranche de citron",
 "en": "Wearing the lemon slice"
 },
 "howToWearIntro": {
 "fr": "Légère, vive, à peine rembourrée - elle se faufile sans peser.",
 "en": "Light, lively, barely padded - it slips in without weighing in."
 },
 "howToWearItems": [
 {
 "fr": "Sur la fermeture d'une pochette, vite repérée.",
 "en": "On a clutch zip, quickly spotted."
 },
 {
 "fr": "Au porte-clés, en duo avec la tranche d'orange.",
 "en": "On the keys, paired with the orange slice."
 },
 {
 "fr": "Sur un sac bleu marine, le duo du sud.",
 "en": "On a navy bag, the southern duo."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Avec la tranche d'orange, c'est un petit étal de fruits à porter.",
 "en": "With the orange slice, it's a little fruit stall to wear."
 },
 "howToWearNote": {
 "fr": "Faite main, aucune tranche ne trace ses quartiers comme la précédente.",
 "en": "Made by hand, no slice traces its segments like the one before."
 }
 },
 {
 "handle": "raffia-orange-slice-charm-ss26",
"making": {
 "fr": "Chaque tranche est crochetée dans notre raffia teint main, ses quartiers ouverts et son écorce cerclée par changements de couleur, puis finie à l'atelier de Guéliz par La Fatima, dont le prénom figure sur l'étiquette, avant la pose de la petite plaque dorée YZA gravée.",
 "en": "Each slice is crocheted in our hand-dyed raffia, its segments opened and its peel ringed through colour changes, then finished in the Guéliz atelier by La Fatima, whose first name appears on the hand tag, before the little engraved gold YZA plate is added.",
 "es": "Cada rodaja se teje a ganchillo con nuestra rafia teñida a mano, sus gajos abiertos y su corteza rodeada con cambios de color, y luego la termina en el taller de Guéliz La Fatima, cuyo nombre aparece en la etiqueta, antes de colocar la plaquita dorada YZA grabada.",
 "tr": "Her dilim, elde boyadığımız rafyayla örülür, dilimleri açılır ve kabuğu renk değişimleriyle çevrelenir, ardından Guéliz atölyesinde adı etiketin üzerinde yer alan La Fatima tarafından tamamlanır ve son olarak kazınmış küçük altın YZA plakası eklenir.",
 "ar": "كل شريحة تُحاك بالكروشيه من رافيتنا المصبوغة يدويًا، وتُفتَح فصوصها وتُحاط قشرتها بتغيّرات اللون، ثم تُنهى في ورشة جيليز على يد لا فاطمة التي يظهر اسمها على الشارة، قبل تثبيت لوحة YZA الذهبية الصغيرة المحفورة."
},
 "short": {
  "fr": "Une rondelle d'orange, quartiers en éventail sous le cercle de l'écorce. Tout l'orange du sud, teint main.",
  "en": "A round of orange, segments fanning under the ring of peel. All the orange of the south, hand-dyed.",
  "es": "Una rodaja de naranja, gajos en abanico bajo el aro de la corteza. Todo el naranja del sur, teñido a mano.",
  "tr": "Bir dilim portakal, kabuğun halkası altında yelpaze gibi açılan dilimler. Güneyin tüm turuncusu, elde boyanmış.",
  "ar": "شريحة برتقال، فصوص متروحة تحت حلقة القشرة. كل برتقال الجنوب، مصبوغ يدويًا."
 },
 "desc": {
  "fr": "Les quartiers s'ouvrent en éventail, l'écorce les referme d'un dernier rang : autour d'une heure pour ce travail minutieux où rien ne pardonne, l'un des gestes les plus délicats qui soient. Née des étals de Guéliz, dans notre raffia teint à la main, elle tient tout l'orange chaud du sud. Finie par l'étiquette dorée YZA gravée, elle se clipse sur un sac, une trousse ou les clés, se glisse sur un bijou, ou se porte en sautoir avec les petits anneaux dorés offerts avec les boucles d'oreilles - partout où il manque un peu de soleil.",
  "en": "The segments fan open, the peel closing them with a last round: around an hour for this exacting work where nothing is forgiven, one of the most delicate crafts there is. Born of the Guéliz stalls, in our hand-dyed raffia, it holds all the warm orange of the south. Finished with the engraved gold YZA tag, it clips to a bag, a pouch or the keys, slips onto a piece of jewellery, or wears as a necklace with the little gold rings gifted with the earrings - wherever a little sun is missing.",
  "es": "Los gajos se abren en abanico, la corteza los cierra con una última vuelta: alrededor de una hora para este trabajo minucioso donde nada se perdona, uno de los gestos más delicados que existen. Nacida de los puestos de Guéliz, en nuestra rafia teñida a mano, guarda todo el naranja cálido del sur. Rematada con la etiqueta dorada YZA grabada, se engancha a un bolso, un neceser o las llaves, se desliza en una joya o se lleva como colgante con las anillitas doradas que regalamos con los pendientes - allí donde falta un poco de sol.",
  "tr": "Dilimler yelpaze gibi açılır, kabuk son bir sırayla onları kapatır: hiçbir hatayı affetmeyen bu titiz iş için yaklaşık bir saat - var olan en ince işlerden biri. Guéliz tezgâhlarından doğmuş, elde boyadığımız rafyayla, güneyin tüm sıcak turuncusunu taşır. Kazınmış altın YZA etiketiyle tamamlanır; bir çantaya, bir kese ya da anahtarlara takılır, bir takıya geçirilir veya küpelerle hediye edilen küçük altın halkalarla kolye gibi taşınır - biraz güneşin eksik olduğu her yerde.",
  "ar": "تنفتح الفصوص كالمروحة، وتغلقها القشرة بصفٍّ أخير: نحو ساعة لهذا العمل الدقيق الذي لا يغتفر خطأً، وهو من أدقّ الحرف على الإطلاق. وُلدت من بسطات جيليز، في رافيتنا المصبوغة يدويًا، فحملت كل برتقال الجنوب الدافئ. تُختَم بشارة YZA الذهبية المحفورة، وتُعلَّق على حقيبة أو محفظة أو المفاتيح، أو تُدخَل في قطعة مجوهرات، أو تُلبس كقلادة مع الحلقات الذهبية الصغيرة المُهداة مع الأقراط - أينما نقص القليل من الشمس."
 },
 "material": {
  "fr": "Raffia naturel teint à la main par nos soins dans nos teintes emblématiques. Ce sont les brins de raffia naturel qui se cassent facilement pendant le travail, ce qui rend le crochet lent et précis - l'un des gestes les plus délicats qui soient - mais une fois crochetée, tissée ou cousue, la pièce devient au contraire très solide et durable, et peu sensible à l'eau. Chaque fruit est rembourré avec ses propres chutes de raffia, jamais avec de la mousse synthétique : rien ne se perd. Le crochet est l'une des seules techniques au monde qu'aucune machine ne peut reproduire - cet objet ne pourrait pas être fabriqué autrement.",
  "en": "Natural raffia, hand-dyed by us in our signature shades. It is the strands of natural raffia that snap easily as they are worked, which makes the crochet slow and precise - one of the most delicate crafts there is - but once crocheted, woven or sewn, the piece becomes very strong and long-lasting, and barely sensitive to water. Each fruit is padded with its own raffia offcuts, never synthetic foam: nothing is wasted. Crochet is one of the only techniques in the world that no machine can replicate - this piece could not be made any other way.",
  "es": "Rafia natural, teñida a mano por nosotras en nuestros tonos emblemáticos. Son las hebras de rafia natural las que se rompen con facilidad durante el trabajo, lo que hace el ganchillo lento y preciso - uno de los gestos más delicados que existen - pero una vez tejida, entrelazada o cosida, la pieza se vuelve muy resistente y duradera, y apenas sensible al agua. Cada fruta se rellena con sus propios recortes de rafia, nunca con espuma sintética: nada se desperdicia. El ganchillo es una de las pocas técnicas del mundo que ninguna máquina puede reproducir - este objeto no podría fabricarse de otra manera.",
  "tr": "Doğal rafya, kendi ikonik tonlarımızda elimizle boyanmıştır. İşlenirken kolayca kopan, doğal rafya lifleridir; bu da tığ işini yavaş ve titiz kılar - var olan en ince işlerden biri - ama bir kez örülüp, dokunup ya da dikildiğinde parça tam tersine çok sağlam, uzun ömürlü ve suya karşı neredeyse duyarsız hâle gelir. Her meyve kendi rafya kırpıntılarıyla doldurulur, asla sentetik süngerle değil: hiçbir şey israf olmaz. Tığ işi, dünyada hiçbir makinenin taklit edemediği ender tekniklerden biridir - bu nesne başka türlü yapılamazdı.",
  "ar": "رافيا طبيعية مصبوغة يدويًا على أيدينا بألواننا المميزة. خيوط الرافيا الطبيعية هي التي تتكسّر بسهولة أثناء العمل، مما يجعل الكروشيه بطيئًا ودقيقًا - وهو من أدقّ الحرف على الإطلاق - لكن بمجرد حياكتها أو نسجها أو خياطتها تصبح القطعة على العكس متينة جدًا ومعمّرة وقليلة التأثّر بالماء. تُحشى كل ثمرة ببقايا الرافيا الخاصة بها، لا بالإسفنج الصناعي أبدًا: لا شيء يُهدر. الكروشيه من التقنيات القليلة في العالم التي لا تستطيع أي آلة محاكاتها - ولا يمكن صنع هذه القطعة بطريقة أخرى."
 },
 "fabric": {
 "fr": "Les quartiers s'ouvrent par les changements de couleur, l'écorce les cercle d'un dernier rang.",
 "en": "The segments open through colour changes, the peel ringing them with a final round."
 },
 "handworkTime": {
  "fr": "Environ une heure de crochet.",
  "en": "About one hour of crochet.",
  "es": "Cerca de una hora de ganchillo.",
  "tr": "Yaklaşık bir saatlik tığ işi.",
  "ar": "نحو ساعة من الحياكة بالكروشيه."
 },
 "dimensions": {
 "fr": "Environ 6 x 4 cm.",
 "en": "About 6 x 4 cm."
 },
 "edition": {
 "fr": "Une poignée de tranches, crochetées main ; chaque tranche ouvre ses quartiers à sa façon.",
 "en": "A handful of slices, crocheted by hand; each slice opens its segments its own way."
 },
 "fruitStoryTitle": {
 "fr": "L'odeur de Jemaa el-Fna",
 "en": "The Jemaa el-Fna smell"
 },
 "fruitStoryBody": {
  "fr": "Sur les étals de Guéliz, les charrettes pressent les oranges du matin au soir et l'air sent le sucre et le soleil. Une tranche posée sur le bord du verre : c'est ce souvenir-là qu'on a crocheté, dans notre raffia teint à la main.",
  "en": "On the Guéliz stalls the carts press oranges from morning to night and the air smells of sugar and sun. A slice on the rim of the glass: that's the memory we crocheted, in our hand-dyed raffia.",
  "es": "En los puestos de Guéliz las carretas exprimen naranjas de la mañana a la noche y el aire huele a azúcar y sol. Una rodaja en el borde del vaso: ese es el recuerdo que tejimos a ganchillo, en nuestra rafia teñida a mano.",
  "tr": "Guéliz tezgâhlarında arabalar sabahtan akşama portakal sıkar ve hava şeker ile güneş kokar. Bardağın kenarına konmuş bir dilim: işte elde boyadığımız rafyada tığla ördüğümüz o anı.",
  "ar": "على بسطات جيليز، تعصر العربات البرتقال من الصباح إلى المساء ويفوح الهواء بالسكر والشمس. شريحة على حافة الكأس: هذه هي الذكرى التي حِكناها بالكروشيه، في رافيتنا المصبوغة يدويًا."
 },
 "howToWearTitle": {
 "fr": "Porter la tranche d'orange",
 "en": "Wearing the orange slice"
 },
 "howToWearIntro": {
 "fr": "Une rondelle de soleil, souple et facile à vivre.",
 "en": "A round of sun, supple and easy to live with."
 },
 "howToWearItems": [
 {
 "fr": "Sur un grand cabas de plage en paille.",
 "en": "On a large straw beach tote."
 },
 {
 "fr": "Au porte-clés, accordée à la tranche de citron.",
 "en": "On the keys, matched to the lemon slice."
 },
 {
 "fr": "Sur une lanière de téléphone, un détail solaire.",
 "en": "On a phone strap, a sunny detail."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Sur un fond neutre, qu'elle soit le seul éclat de couleur.",
 "en": "Against a neutral backdrop, let it be the only splash of colour."
 },
 "howToWearNote": {
 "fr": "Crochetée à la main, pas une tranche n'ouvre ses quartiers comme la suivante.",
 "en": "Hand-crocheted, not one slice opens its segments like the next."
 }
 },
 {
 "handle": "raffia-kiwi-slice-charm-ss26",
"making": {
 "fr": "Chaque tranche est crochetée en vert tendre dans notre raffia teint main, sa couronne de graines brodée point par point autour du cœur clair, puis finie à l'atelier de Guéliz par La Fatima, dont le prénom figure sur l'étiquette, avant la pose de la petite plaque dorée YZA gravée.",
 "en": "Each slice is crocheted in tender green in our hand-dyed raffia, its crown of seeds embroidered stitch by stitch around the pale heart, then finished in the Guéliz atelier by La Fatima, whose first name appears on the hand tag, before the little engraved gold YZA plate is added.",
 "es": "Cada rodaja se teje a ganchillo en verde tierno con nuestra rafia teñida a mano, su corona de semillas bordada punto a punto alrededor del corazón claro, y luego la termina en el taller de Guéliz La Fatima, cuyo nombre aparece en la etiqueta, antes de colocar la plaquita dorada YZA grabada.",
 "tr": "Her dilim, elde boyadığımız rafyayla yumuşak yeşilde örülür, çekirdek tacı açık göbeğin çevresine ilmek ilmek işlenir, ardından Guéliz atölyesinde adı etiketin üzerinde yer alan La Fatima tarafından tamamlanır ve son olarak kazınmış küçük altın YZA plakası eklenir.",
 "ar": "كل شريحة تُحاك بالكروشيه بالأخضر الناعم من رافيتنا المصبوغة يدويًا، ويُطرَّز تاج بذورها غرزةً غرزة حول القلب الفاتح، ثم تُنهى في ورشة جيليز على يد لا فاطمة التي يظهر اسمها على الشارة، قبل تثبيت لوحة YZA الذهبية الصغيرة المحفورة."
},
 "short": {
  "fr": "Une tranche de kiwi, vert tendre teint main, cœur clair, couronne de graines au centre.",
  "en": "A kiwi slice, hand-dyed tender green, pale heart, a crown of seeds at the centre.",
  "es": "Una rodaja de kiwi, verde tierno teñido a mano, corazón claro, corona de semillas en el centro.",
  "tr": "Bir dilim kivi, elde boyanmış yumuşak yeşil, açık göbek, ortasında çekirdek tacı.",
  "ar": "شريحة كيوي، أخضر ناعم مصبوغ يدويًا، قلب فاتح، وتاج من البذور في الوسط."
 },
 "desc": {
  "fr": "C'est la couronne de graines qui prend le temps : il faut autour d'une heure et demie pour broder ces points sombres un à un autour du cœur clair, sur le disque déjà crocheté en vert tendre - dans notre raffia teint à la main, l'un des gestes les plus délicats qui soient. Tout est fait main, rien n'est imprimé. Née des étals de Guéliz et finie par l'étiquette dorée YZA gravée, légère et à peine rembourrée, elle glisse une couleur qu'on n'attend pas : elle se clipse sur un sac, se glisse sur un bijou, ou se porte en sautoir avec les petits anneaux dorés offerts avec les boucles d'oreilles.",
  "en": "It's the crown of seeds that takes the time: around an hour and a half to embroider those dark dots one by one around the pale heart, onto the disc already crocheted in tender green - in our hand-dyed raffia, one of the most delicate crafts there is. All handmade, nothing printed. Born of the Guéliz stalls and finished with the engraved gold YZA tag, light and barely padded, it slips in a colour you don't expect: it clips to a bag, slips onto a piece of jewellery, or wears as a necklace with the little gold rings gifted with the earrings.",
  "es": "Es la corona de semillas la que lleva tiempo: hace falta alrededor de una hora y media para bordar esos puntos oscuros uno a uno alrededor del corazón claro, sobre el disco ya tejido a ganchillo en verde tierno - en nuestra rafia teñida a mano, uno de los gestos más delicados que existen. Todo está hecho a mano, nada estampado. Nacida de los puestos de Guéliz y rematada con la etiqueta dorada YZA grabada, ligera y apenas rellena, desliza un color que no se espera: se engancha a un bolso, se desliza en una joya o se lleva como colgante con las anillitas doradas que regalamos con los pendientes.",
  "tr": "Zaman alan, çekirdek tacıdır: açık göbeğin çevresine o koyu noktaları birer birer işlemek, önceden yumuşak yeşil örülmüş disk üzerine - elde boyadığımız rafyada - yaklaşık bir buçuk saat sürer; var olan en ince işlerden biri. Her şey elle yapılır, hiçbiri basılı değildir. Guéliz tezgâhlarından doğmuş ve kazınmış altın YZA etiketiyle tamamlanmış, hafif ve az dolgulu, beklenmedik bir renk katar: çantaya takılır, bir takıya geçirilir ya da küpelerle hediye edilen küçük altın halkalarla kolye gibi taşınır.",
  "ar": "تاج البذور هو ما يأخذ الوقت: يلزم نحو ساعة ونصف لتطريز تلك النقاط الداكنة واحدةً واحدة حول القلب الفاتح، على القرص المحاك سلفًا بالأخضر الناعم - في رافيتنا المصبوغة يدويًا، وهو من أدقّ الحرف على الإطلاق. كل شيء مصنوع يدويًا، لا شيء مطبوع. وُلدت من بسطات جيليز وخُتمت بشارة YZA الذهبية المحفورة، خفيفة وقليلة الحشو، تُدخِل لونًا غير متوقّع: تُعلَّق على حقيبة، أو تُدخَل في قطعة مجوهرات، أو تُلبس كقلادة مع الحلقات الذهبية الصغيرة المُهداة مع الأقراط."
 },
 "material": {
  "fr": "Raffia naturel teint à la main par nos soins dans nos teintes emblématiques. Ce sont les brins de raffia naturel qui se cassent facilement pendant le travail, ce qui rend le crochet lent et précis - l'un des gestes les plus délicats qui soient - mais une fois crochetée, tissée ou cousue, la pièce devient au contraire très solide et durable, et peu sensible à l'eau. Chaque fruit est rembourré avec ses propres chutes de raffia, jamais avec de la mousse synthétique : rien ne se perd. Le crochet est l'une des seules techniques au monde qu'aucune machine ne peut reproduire - cet objet ne pourrait pas être fabriqué autrement.",
  "en": "Natural raffia, hand-dyed by us in our signature shades. It is the strands of natural raffia that snap easily as they are worked, which makes the crochet slow and precise - one of the most delicate crafts there is - but once crocheted, woven or sewn, the piece becomes very strong and long-lasting, and barely sensitive to water. Each fruit is padded with its own raffia offcuts, never synthetic foam: nothing is wasted. Crochet is one of the only techniques in the world that no machine can replicate - this piece could not be made any other way.",
  "es": "Rafia natural, teñida a mano por nosotras en nuestros tonos emblemáticos. Son las hebras de rafia natural las que se rompen con facilidad durante el trabajo, lo que hace el ganchillo lento y preciso - uno de los gestos más delicados que existen - pero una vez tejida, entrelazada o cosida, la pieza se vuelve muy resistente y duradera, y apenas sensible al agua. Cada fruta se rellena con sus propios recortes de rafia, nunca con espuma sintética: nada se desperdicia. El ganchillo es una de las pocas técnicas del mundo que ninguna máquina puede reproducir - este objeto no podría fabricarse de otra manera.",
  "tr": "Doğal rafya, kendi ikonik tonlarımızda elimizle boyanmıştır. İşlenirken kolayca kopan, doğal rafya lifleridir; bu da tığ işini yavaş ve titiz kılar - var olan en ince işlerden biri - ama bir kez örülüp, dokunup ya da dikildiğinde parça tam tersine çok sağlam, uzun ömürlü ve suya karşı neredeyse duyarsız hâle gelir. Her meyve kendi rafya kırpıntılarıyla doldurulur, asla sentetik süngerle değil: hiçbir şey israf olmaz. Tığ işi, dünyada hiçbir makinenin taklit edemediği ender tekniklerden biridir - bu nesne başka türlü yapılamazdı.",
  "ar": "رافيا طبيعية مصبوغة يدويًا على أيدينا بألواننا المميزة. خيوط الرافيا الطبيعية هي التي تتكسّر بسهولة أثناء العمل، مما يجعل الكروشيه بطيئًا ودقيقًا - وهو من أدقّ الحرف على الإطلاق - لكن بمجرد حياكتها أو نسجها أو خياطتها تصبح القطعة على العكس متينة جدًا ومعمّرة وقليلة التأثّر بالماء. تُحشى كل ثمرة ببقايا الرافيا الخاصة بها، لا بالإسفنج الصناعي أبدًا: لا شيء يُهدر. الكروشيه من التقنيات القليلة في العالم التي لا تستطيع أي آلة محاكاتها - ولا يمكن صنع هذه القطعة بطريقة أخرى."
 },
 "fabric": {
 "fr": "Le vert et le cœur clair au crochet, les graines brodées par-dessus : aucune impression.",
 "en": "The green and pale heart in crochet, the seeds embroidered on top: no print at all."
 },
 "handworkTime": {
  "fr": "Environ une heure et demie de crochet.",
  "en": "About one and a half hours of crochet.",
  "es": "Cerca de una hora y media de ganchillo.",
  "tr": "Yaklaşık bir buçuk saatlik tığ işi.",
  "ar": "نحو ساعة ونصف من الحياكة بالكروشيه."
 },
 "dimensions": {
 "fr": "Environ 6 x 4 cm.",
 "en": "About 6 x 4 cm."
 },
 "edition": {
 "fr": "Quelques pièces faites main, au crochet ; la couronne de graines retombe chaque fois autrement.",
 "en": "A few hand-made pieces, at the hook; the crown of seeds falls differently each time."
 },
 "fruitStoryTitle": {
 "fr": "La surprise de l'étal",
 "en": "The surprise of the stall"
 },
 "fruitStoryBody": {
  "fr": "Le kiwi surprend les étals de Guéliz - ce vert qu'on n'attend pas entre les agrumes et les melons. On a aimé teindre son vert à la main et broder sa couronne de graines, ce dessin minuscule qui demande tant de patience.",
  "en": "Kiwi catches the Guéliz stalls off guard - that green you don't expect among the citrus and melons. We loved hand-dyeing its green and embroidering its crown of seeds, that tiny pattern that asks for such patience.",
  "es": "El kiwi sorprende a los puestos de Guéliz - ese verde que no se espera entre los cítricos y los melones. Nos encantó teñir su verde a mano y bordar su corona de semillas, ese dibujo minúsculo que pide tanta paciencia.",
  "tr": "Kivi Guéliz tezgâhlarını gafil avlar - narenciye ve kavunlar arasında beklenmeyen o yeşil. Yeşilini elde boyamayı ve çekirdek tacını işlemeyi çok sevdik; bunca sabır isteyen o minik deseni.",
  "ar": "يفاجئ الكيوي بسطات جيليز - ذلك الأخضر غير المتوقّع بين الحمضيات والبطيخ. أحببنا صبغ أخضره يدويًا وتطريز تاج بذوره، ذلك الرسم الدقيق الذي يتطلّب صبرًا كبيرًا."
 },
 "howToWearTitle": {
 "fr": "Porter la tranche de kiwi",
 "en": "Wearing the kiwi slice"
 },
 "howToWearIntro": {
 "fr": "Un vert frais qui se remarque, juste ce qu'il faut.",
 "en": "A fresh green that gets noticed, just enough."
 },
 "howToWearItems": [
 {
 "fr": "Sur un sac crème, pour réveiller le neutre.",
 "en": "On a cream bag, to wake up the neutral."
 },
 {
 "fr": "Au porte-clés, en duo avec une autre tranche.",
 "en": "On the keys, in a duo with another slice."
 },
 {
 "fr": "Sur une trousse de cours ou de bureau.",
 "en": "On a school or office pouch."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Le vert kiwi va au rose poudré et à l'écru - un accord doux et un peu inattendu.",
 "en": "Kiwi green goes with powder pink and ecru - a soft, slightly unexpected pairing."
 },
 "howToWearNote": {
 "fr": "Faite main, pas deux couronnes de graines ne se ressemblent - c'est la signature de la main.",
 "en": "Made by hand, no two crowns of seeds match - the signature of the hand."
 }
 },
 {
 "handle": "raffia-watermelon-slice-charm-ss26",
"making": {
 "fr": "Chaque part est crochetée par rangs de couleur dans notre raffia teint main - rose, blanc, vert - ses pépins brodés un à un, puis finie à l'atelier de Guéliz par La Fatima, dont le prénom figure sur l'étiquette, avant la pose de la petite plaque dorée YZA gravée.",
 "en": "Each wedge is crocheted in rows of colour in our hand-dyed raffia - pink, white, green - its pips embroidered one by one, then finished in the Guéliz atelier by La Fatima, whose first name appears on the hand tag, before the little engraved gold YZA plate is added.",
 "es": "Cada trozo se teje a ganchillo por hileras de color con nuestra rafia teñida a mano - rosa, blanco, verde - sus pepitas bordadas una a una, y luego lo termina en el taller de Guéliz La Fatima, cuyo nombre aparece en la etiqueta, antes de colocar la plaquita dorada YZA grabada.",
 "tr": "Her dilim, elde boyadığımız rafyayla renk sıraları hâlinde örülür - pembe, beyaz, yeşil - çekirdekleri birer birer işlenir, ardından Guéliz atölyesinde adı etiketin üzerinde yer alan La Fatima tarafından tamamlanır ve son olarak kazınmış küçük altın YZA plakası eklenir.",
 "ar": "كل قطعة تُحاك بالكروشيه بصفوف من الألوان من رافيتنا المصبوغة يدويًا - وردي، أبيض، أخضر - وتُطرَّز بذورها واحدةً واحدة، ثم تُنهى في ورشة جيليز على يد لا فاطمة التي يظهر اسمها على الشارة، قبل تثبيت لوحة YZA الذهبية الصغيرة المحفورة."
},
 "short": {
  "fr": "Une part de pastèque, rose vif teint main, liseré blanc, écorce verte, quelques pépins. L'été pur.",
  "en": "A watermelon wedge, hand-dyed bright pink, white edge, green rind, a few pips. Pure summer.",
  "es": "Un trozo de sandía, rosa vivo teñido a mano, borde blanco, corteza verde, algunas pepitas. Verano puro.",
  "tr": "Bir dilim karpuz, elde boyanmış canlı pembe, beyaz kenar, yeşil kabuk, birkaç çekirdek. Saf yaz.",
  "ar": "قطعة بطيخ، وردي زاهٍ مصبوغ يدويًا، حاشية بيضاء، قشرة خضراء، وبعض البذور. الصيف الخالص."
 },
 "desc": {
  "fr": "Trois couleurs qui s'enchaînent par rangs - rose, blanc, vert - et des pépins brodés un à un : compte autour d'une heure et demie pour un triangle bien net, dans notre raffia teint à la main, l'un des gestes les plus délicats qui soient. Née des étals de Guéliz, gaie et à peine rembourrée, finie par l'étiquette dorée YZA gravée, c'est tout l'été : elle se clipse sur un sac de plage ou les clés, se glisse sur un bijou, ou se porte en sautoir avec les petits anneaux dorés offerts avec les boucles d'oreilles - le genre de détail qui fait sourire au passage.",
  "en": "Three colours running on in rows - pink, white, green - with pips stitched in one by one: count around an hour and a half for a clean triangle, in our hand-dyed raffia, one of the most delicate crafts there is. Born of the Guéliz stalls, cheerful and barely padded, finished with the engraved gold YZA tag, it's the whole of summer: it clips to a beach bag or the keys, slips onto a piece of jewellery, or wears as a necklace with the little gold rings gifted with the earrings - the kind of detail that earns a passing smile.",
  "es": "Tres colores que se encadenan por hileras - rosa, blanco, verde - y pepitas bordadas una a una: cuenta alrededor de una hora y media para un triángulo bien nítido, en nuestra rafia teñida a mano, uno de los gestos más delicados que existen. Nacida de los puestos de Guéliz, alegre y apenas rellena, rematada con la etiqueta dorada YZA grabada, es todo el verano: se engancha a un bolso de playa o las llaves, se desliza en una joya o se lleva como colgante con las anillitas doradas que regalamos con los pendientes - de esos detalles que sacan una sonrisa al pasar.",
  "tr": "Sıralar hâlinde birbirini izleyen üç renk - pembe, beyaz, yeşil - ve birer birer işlenen çekirdekler: temiz bir üçgen için yaklaşık bir buçuk saat sayın, elde boyadığımız rafyada, var olan en ince işlerden biri. Guéliz tezgâhlarından doğmuş, neşeli ve az dolgulu, kazınmış altın YZA etiketiyle tamamlanmış, tam anlamıyla yaz: bir plaj çantasına ya da anahtarlara takılır, bir takıya geçirilir veya küpelerle hediye edilen küçük altın halkalarla kolye gibi taşınır - geçerken gülümseten türden bir ayrıntı.",
  "ar": "ثلاثة ألوان تتتابع بالصفوف - وردي، أبيض، أخضر - وبذور تُطرَّز واحدةً واحدة: احسب نحو ساعة ونصف لمثلث نظيف، في رافيتنا المصبوغة يدويًا، وهو من أدقّ الحرف على الإطلاق. وُلدت من بسطات جيليز، مرحةً وقليلة الحشو، مختومةً بشارة YZA الذهبية المحفورة، إنها الصيف كله: تُعلَّق على حقيبة شاطئ أو المفاتيح، أو تُدخَل في قطعة مجوهرات، أو تُلبس كقلادة مع الحلقات الذهبية الصغيرة المُهداة مع الأقراط - من التفاصيل التي تُضحك عابر السبيل."
 },
 "material": {
  "fr": "Raffia naturel teint à la main par nos soins dans nos teintes emblématiques. Ce sont les brins de raffia naturel qui se cassent facilement pendant le travail, ce qui rend le crochet lent et précis - l'un des gestes les plus délicats qui soient - mais une fois crochetée, tissée ou cousue, la pièce devient au contraire très solide et durable, et peu sensible à l'eau. Chaque fruit est rembourré avec ses propres chutes de raffia, jamais avec de la mousse synthétique : rien ne se perd. Le crochet est l'une des seules techniques au monde qu'aucune machine ne peut reproduire - cet objet ne pourrait pas être fabriqué autrement.",
  "en": "Natural raffia, hand-dyed by us in our signature shades. It is the strands of natural raffia that snap easily as they are worked, which makes the crochet slow and precise - one of the most delicate crafts there is - but once crocheted, woven or sewn, the piece becomes very strong and long-lasting, and barely sensitive to water. Each fruit is padded with its own raffia offcuts, never synthetic foam: nothing is wasted. Crochet is one of the only techniques in the world that no machine can replicate - this piece could not be made any other way.",
  "es": "Rafia natural, teñida a mano por nosotras en nuestros tonos emblemáticos. Son las hebras de rafia natural las que se rompen con facilidad durante el trabajo, lo que hace el ganchillo lento y preciso - uno de los gestos más delicados que existen - pero una vez tejida, entrelazada o cosida, la pieza se vuelve muy resistente y duradera, y apenas sensible al agua. Cada fruta se rellena con sus propios recortes de rafia, nunca con espuma sintética: nada se desperdicia. El ganchillo es una de las pocas técnicas del mundo que ninguna máquina puede reproducir - este objeto no podría fabricarse de otra manera.",
  "tr": "Doğal rafya, kendi ikonik tonlarımızda elimizle boyanmıştır. İşlenirken kolayca kopan, doğal rafya lifleridir; bu da tığ işini yavaş ve titiz kılar - var olan en ince işlerden biri - ama bir kez örülüp, dokunup ya da dikildiğinde parça tam tersine çok sağlam, uzun ömürlü ve suya karşı neredeyse duyarsız hâle gelir. Her meyve kendi rafya kırpıntılarıyla doldurulur, asla sentetik süngerle değil: hiçbir şey israf olmaz. Tığ işi, dünyada hiçbir makinenin taklit edemediği ender tekniklerden biridir - bu nesne başka türlü yapılamazdı.",
  "ar": "رافيا طبيعية مصبوغة يدويًا على أيدينا بألواننا المميزة. خيوط الرافيا الطبيعية هي التي تتكسّر بسهولة أثناء العمل، مما يجعل الكروشيه بطيئًا ودقيقًا - وهو من أدقّ الحرف على الإطلاق - لكن بمجرد حياكتها أو نسجها أو خياطتها تصبح القطعة على العكس متينة جدًا ومعمّرة وقليلة التأثّر بالماء. تُحشى كل ثمرة ببقايا الرافيا الخاصة بها، لا بالإسفنج الصناعي أبدًا: لا شيء يُهدر. الكروشيه من التقنيات القليلة في العالم التي لا تستطيع أي آلة محاكاتها - ولا يمكن صنع هذه القطعة بطريقة أخرى."
 },
 "fabric": {
 "fr": "Rose, blanc et vert montent par rangs de couleur ; les pépins sont brodés au point.",
 "en": "Pink, white and green rise in colour rows; the pips are stitched in by hand."
 },
 "handworkTime": {
  "fr": "Environ une heure et demie de crochet.",
  "en": "About one and a half hours of crochet.",
  "es": "Cerca de una hora y media de ganchillo.",
  "tr": "Yaklaşık bir buçuk saatlik tığ işi.",
  "ar": "نحو ساعة ونصف من الحياكة بالكروشيه."
 },
 "dimensions": {
 "fr": "Environ 6 x 4 cm.",
 "en": "About 6 x 4 cm."
 },
 "edition": {
 "fr": "Crochetée en petit nombre, à Guéliz ; chaque part pose ses pépins ailleurs.",
 "en": "Crocheted in small numbers, in Guéliz; each wedge sets its pips elsewhere."
 },
 "fruitStoryTitle": {
 "fr": "Les grandes parts à l'ombre",
 "en": "Big wedges in the shade"
 },
 "fruitStoryBody": {
  "fr": "Aux heures les plus chaudes, sur les étals de Guéliz, on tranche la pastèque en grandes parts roses qu'on partage à l'ombre. On l'a refaite au crochet dans notre raffia teint main - rose, blanc, vert, pépins - pour en garder un peu de fraîcheur.",
  "en": "In the hottest hours, on the Guéliz stalls, the watermelon is sliced into big pink wedges shared in the shade. We rebuilt it in crochet in our hand-dyed raffia - pink, white, green, pips - to keep a little of its coolness.",
  "es": "En las horas de más calor, en los puestos de Guéliz, se corta la sandía en grandes trozos rosados que se comparten a la sombra. La rehicimos a ganchillo en nuestra rafia teñida a mano - rosa, blanco, verde, pepitas - para conservar algo de su frescor.",
  "tr": "En sıcak saatlerde, Guéliz tezgâhlarında karpuz, gölgede paylaşılan iri pembe dilimlere ayrılır. Onu elde boyadığımız rafyada tığla yeniden ördük - pembe, beyaz, yeşil, çekirdekler - serinliğinden bir tutam korumak için.",
  "ar": "في أشدّ الساعات حرًّا، على بسطات جيليز، يُقطَّع البطيخ إلى قطع وردية كبيرة تُتقاسَم في الظل. أعدنا صنعه بالكروشيه في رافيتنا المصبوغة يدويًا - وردي، أبيض، أخضر، بذور - لنحتفظ بشيء من برودته."
 },
 "howToWearTitle": {
 "fr": "Porter la pastèque",
 "en": "Wearing the watermelon"
 },
 "howToWearIntro": {
 "fr": "La couleur de l'été, franche et joyeuse, sur un petit triangle.",
 "en": "The colour of summer, bright and joyful, on a small triangle."
 },
 "howToWearItems": [
 {
 "fr": "Sur un sac de plage, là où elle est chez elle.",
 "en": "On a beach bag, right at home."
 },
 {
 "fr": "Au porte-clés, un éclat de rose au quotidien.",
 "en": "On the keys, a splash of pink every day."
 },
 {
 "fr": "Sur la lanière d'un chapeau de paille.",
 "en": "On the band of a straw hat."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Le rose pastèque va au vert et au bleu d'eau - la palette d'une journée à l'ombre.",
 "en": "Watermelon pink goes with green and water-blue - the palette of a day in the shade."
 },
 "howToWearNote": {
 "fr": "Crochetée à la main, aucune part ne place ses pépins comme une autre.",
 "en": "Hand-crocheted, no wedge sets its pips like another."
 }
 },
 {
 "handle": "raffia-avocado-half-charm-ss26",
"making": {
 "fr": "Chaque demi-avocat réunit trois tons de notre raffia teint main - chair claire, écorce sombre, noyau brun - crochetés puis assemblés à l'aiguille, avant d'être fini à l'atelier de Guéliz par La Fatima, dont le prénom figure sur l'étiquette, et de recevoir la petite plaque dorée YZA gravée.",
 "en": "Each avocado half brings together three tones of our hand-dyed raffia - pale flesh, dark skin, brown stone - crocheted then joined with the needle, before being finished in the Guéliz atelier by La Fatima, whose first name appears on the hand tag, and receiving the little engraved gold YZA plate.",
 "es": "Cada medio aguacate reúne tres tonos de nuestra rafia teñida a mano - pulpa clara, piel oscura, hueso marrón - tejidos a ganchillo y luego ensamblados a aguja, antes de ser terminado en el taller de Guéliz por La Fatima, cuyo nombre aparece en la etiqueta, y recibir la plaquita dorada YZA grabada.",
 "tr": "Her yarım avokado, elde boyadığımız rafyanın üç tonunu bir araya getirir - açık et, koyu kabuk, kahverengi çekirdek - önce örülür sonra iğneyle birleştirilir, ardından Guéliz atölyesinde adı etiketin üzerinde yer alan La Fatima tarafından tamamlanır ve kazınmış küçük altın YZA plakasını alır.",
 "ar": "كل نصف أفوكادو يجمع ثلاث درجات من رافيتنا المصبوغة يدويًا - لبّ فاتح، قشرة داكنة، نواة بنية - تُحاك بالكروشيه ثم تُجمَع بالإبرة، قبل أن يُنهى في ورشة جيليز على يد لا فاطمة التي يظهر اسمها على الشارة، ويتلقّى لوحة YZA الذهبية الصغيرة المحفورة."
},
 "short": {
  "fr": "Un demi-avocat, chair vert tendre teinte main, écorce sombre, noyau brun au creux. Doux et inattendu.",
  "en": "An avocado half, hand-dyed tender green flesh, dark skin, a brown stone in the hollow. Soft and unexpected.",
  "es": "Medio aguacate, pulpa verde tierno teñida a mano, piel oscura, hueso marrón en el hueco. Suave e inesperado.",
  "tr": "Yarım avokado, elde boyanmış yumuşak yeşil et, koyu kabuk, oyukta kahverengi çekirdek. Yumuşak ve beklenmedik.",
  "ar": "نصف أفوكادو، لبّ أخضر ناعم مصبوغ يدويًا، قشرة داكنة، نواة بنية في التجويف. ناعم وغير متوقّع."
 },
 "desc": {
  "fr": "Trois tons à réunir - chair claire, écorce sombre, noyau brun bien rond au centre - soit environ deux heures de crochet dans notre raffia teint à la main, l'un des gestes les plus délicats qui soient. C'est ce noyau lisse posé dans le creux qui fait toute l'image. Né des étals de Guéliz et fini par l'étiquette dorée YZA gravée, doux et un peu inattendu, il se clipse sur un sac ou les clés, se glisse sur un bijou, ou se porte en sautoir avec les petits anneaux dorés offerts avec les boucles d'oreilles - comme un petit signe entre celles qui savent.",
  "en": "Three tones to bring together - pale flesh, dark skin, a round brown stone at the centre - so about two hours of crochet in our hand-dyed raffia, one of the most delicate crafts there is. It's that smooth stone in the hollow that makes the whole picture. Born of the Guéliz stalls and finished with the engraved gold YZA tag, soft and a little unexpected, it clips to a bag or the keys, slips onto a piece of jewellery, or wears as a necklace with the little gold rings gifted with the earrings - like a small sign between those who know.",
  "es": "Tres tonos que reunir - pulpa clara, piel oscura, hueso marrón bien redondo en el centro - unas dos horas de ganchillo en nuestra rafia teñida a mano, uno de los gestos más delicados que existen. Es ese hueso liso posado en el hueco el que hace toda la imagen. Nacido de los puestos de Guéliz y rematado con la etiqueta dorada YZA grabada, suave y algo inesperado, se engancha a un bolso o las llaves, se desliza en una joya o se lleva como colgante con las anillitas doradas que regalamos con los pendientes - como una pequeña señal entre las que saben.",
  "tr": "Bir araya getirilecek üç ton - açık et, koyu kabuk, ortada yuvarlak kahverengi çekirdek - yani elde boyadığımız rafyada yaklaşık iki saatlik tığ işi, var olan en ince işlerden biri. Bütün görüntüyü yaratan, oyuğa yerleşmiş o pürüzsüz çekirdektir. Guéliz tezgâhlarından doğmuş ve kazınmış altın YZA etiketiyle tamamlanmış, yumuşak ve biraz beklenmedik; bir çantaya ya da anahtarlara takılır, bir takıya geçirilir veya küpelerle hediye edilen küçük altın halkalarla kolye gibi taşınır - bilenler arasında küçük bir işaret gibi.",
  "ar": "ثلاثة درجات لونية تُجمَع - لبّ فاتح، قشرة داكنة، نواة بنية مستديرة في الوسط - أي نحو ساعتين من الحياكة بالكروشيه في رافيتنا المصبوغة يدويًا، وهو من أدقّ الحرف على الإطلاق. تلك النواة الملساء المستقرّة في التجويف هي التي تصنع الصورة كلها. وُلد من بسطات جيليز وخُتم بشارة YZA الذهبية المحفورة، ناعمًا وغير متوقّع قليلًا، يُعلَّق على حقيبة أو المفاتيح، أو يُدخَل في قطعة مجوهرات، أو يُلبس كقلادة مع الحلقات الذهبية الصغيرة المُهداة مع الأقراط - كإشارة صغيرة بين العارفات."
 },
 "material": {
  "fr": "Raffia naturel teint à la main par nos soins dans nos teintes emblématiques. Ce sont les brins de raffia naturel qui se cassent facilement pendant le travail, ce qui rend le crochet lent et précis - l'un des gestes les plus délicats qui soient - mais une fois crochetée, tissée ou cousue, la pièce devient au contraire très solide et durable, et peu sensible à l'eau. Chaque fruit est rembourré avec ses propres chutes de raffia, jamais avec de la mousse synthétique : rien ne se perd. Le crochet est l'une des seules techniques au monde qu'aucune machine ne peut reproduire - cet objet ne pourrait pas être fabriqué autrement.",
  "en": "Natural raffia, hand-dyed by us in our signature shades. It is the strands of natural raffia that snap easily as they are worked, which makes the crochet slow and precise - one of the most delicate crafts there is - but once crocheted, woven or sewn, the piece becomes very strong and long-lasting, and barely sensitive to water. Each fruit is padded with its own raffia offcuts, never synthetic foam: nothing is wasted. Crochet is one of the only techniques in the world that no machine can replicate - this piece could not be made any other way.",
  "es": "Rafia natural, teñida a mano por nosotras en nuestros tonos emblemáticos. Son las hebras de rafia natural las que se rompen con facilidad durante el trabajo, lo que hace el ganchillo lento y preciso - uno de los gestos más delicados que existen - pero una vez tejida, entrelazada o cosida, la pieza se vuelve muy resistente y duradera, y apenas sensible al agua. Cada fruta se rellena con sus propios recortes de rafia, nunca con espuma sintética: nada se desperdicia. El ganchillo es una de las pocas técnicas del mundo que ninguna máquina puede reproducir - este objeto no podría fabricarse de otra manera.",
  "tr": "Doğal rafya, kendi ikonik tonlarımızda elimizle boyanmıştır. İşlenirken kolayca kopan, doğal rafya lifleridir; bu da tığ işini yavaş ve titiz kılar - var olan en ince işlerden biri - ama bir kez örülüp, dokunup ya da dikildiğinde parça tam tersine çok sağlam, uzun ömürlü ve suya karşı neredeyse duyarsız hâle gelir. Her meyve kendi rafya kırpıntılarıyla doldurulur, asla sentetik süngerle değil: hiçbir şey israf olmaz. Tığ işi, dünyada hiçbir makinenin taklit edemediği ender tekniklerden biridir - bu nesne başka türlü yapılamazdı.",
  "ar": "رافيا طبيعية مصبوغة يدويًا على أيدينا بألواننا المميزة. خيوط الرافيا الطبيعية هي التي تتكسّر بسهولة أثناء العمل، مما يجعل الكروشيه بطيئًا ودقيقًا - وهو من أدقّ الحرف على الإطلاق - لكن بمجرد حياكتها أو نسجها أو خياطتها تصبح القطعة على العكس متينة جدًا ومعمّرة وقليلة التأثّر بالماء. تُحشى كل ثمرة ببقايا الرافيا الخاصة بها، لا بالإسفنج الصناعي أبدًا: لا شيء يُهدر. الكروشيه من التقنيات القليلة في العالم التي لا تستطيع أي آلة محاكاتها - ولا يمكن صنع هذه القطعة بطريقة أخرى."
 },
 "fabric": {
 "fr": "Trois tons - chair claire, écorce foncée, noyau brun - réunis au crochet puis à l'aiguille.",
 "en": "Three tones - pale flesh, dark skin, brown stone - joined in crochet then with the needle."
 },
 "handworkTime": {
  "fr": "Environ deux heures de crochet.",
  "en": "About two hours of crochet.",
  "es": "Cerca de dos horas de ganchillo.",
  "tr": "Yaklaşık iki saatlik tığ işi.",
  "ar": "نحو ساعتين من الحياكة بالكروشيه."
 },
 "dimensions": {
 "fr": "Environ 6 x 3 cm.",
 "en": "About 6 x 3 cm."
 },
 "edition": {
 "fr": "Petite fournée, faite main au crochet ; le noyau ne se pose jamais deux fois pareil.",
 "en": "A small batch, hand-made at the hook; the stone never sits the same way twice."
 },
 "fruitStoryTitle": {
 "fr": "Un petit soleil sombre",
 "en": "A small dark sun"
 },
 "fruitStoryBody": {
  "fr": "Coupé en deux, l'avocat des étals de Guéliz montre son noyau lisse et brun au creux de la chair verte - un petit soleil sombre. On a aimé cette image et l'avons crochetée telle quelle, dans notre raffia teint main, noyau compris.",
  "en": "Cut in two, the avocado from the Guéliz stalls shows its smooth brown stone in the hollow of the green flesh - a small dark sun. We liked that image and crocheted it just so, in our hand-dyed raffia, stone and all.",
  "es": "Cortado en dos, el aguacate de los puestos de Guéliz muestra su hueso liso y marrón en el hueco de la pulpa verde - un pequeño sol oscuro. Nos gustó esa imagen y la tejimos a ganchillo tal cual, en nuestra rafia teñida a mano, hueso incluido.",
  "tr": "İkiye bölünen, Guéliz tezgâhlarının avokadosu, yeşil etin oyuğunda pürüzsüz kahverengi çekirdeğini gösterir - küçük karanlık bir güneş. Bu görüntüyü sevdik ve olduğu gibi, elde boyadığımız rafyada, çekirdeğiyle birlikte tığla ördük.",
  "ar": "حين يُقطَع نصفين، يُظهر أفوكادو بسطات جيليز نواته الملساء البنية في تجويف اللبّ الأخضر - شمسًا صغيرة داكنة. أحببنا هذه الصورة وحِكناها كما هي بالكروشيه، في رافيتنا المصبوغة يدويًا، مع النواة."
 },
 "howToWearTitle": {
 "fr": "Porter le demi-avocat",
 "en": "Wearing the avocado half"
 },
 "howToWearIntro": {
 "fr": "Une couleur douce et un brin d'humour - pour celles qui se démarquent sans bruit.",
 "en": "A soft colour and a touch of humour - for those who stand apart quietly."
 },
 "howToWearItems": [
 {
 "fr": "Sur un tote de tous les jours, en ton sur ton de verts.",
 "en": "On an everyday tote, in tone-on-tone greens."
 },
 {
 "fr": "Au porte-clés, le détail qui fait sourire.",
 "en": "On the keys, the detail that earns a smile."
 },
 {
 "fr": "Sur un sac kaki ou beige, accord naturel.",
 "en": "On a khaki or beige bag, a natural match."
 }
 ],
 "howToWearStyleTip": {
 "fr": "En camaïeu de vert et de beige, le demi-avocat se fond et ressort à la fois.",
 "en": "In a wash of green and beige, the avocado half both blends in and stands out."
 },
 "howToWearNote": {
 "fr": "Fait main, aucun noyau n'est posé tout à fait au même endroit que le précédent.",
 "en": "Made by hand, no stone is set in quite the same spot as the last."
 }
 }
 ],
 "earrings": [
 {
 "handle": "watermelon-raffia-earrings-ss26",
"making": {
 "fr": "Chaque tranche se construit fil de raffia par fil de raffia : le rose au cœur, le blanc, puis le vert de l'écorce, et les pépins brodés un à un par-dessus - jamais imprimés. Une fois crochetée, La Fatima et les femmes de l'atelier de Guéliz la montent sur une créole dorée, avec un petit anneau doré qui permet de la combiner à d'autres fruits, ou même de la porter en pendentif.",
 "en": "Each slice is built up raffia thread by raffia thread: pink at the heart, then white, then the green of the rind, with the pips embroidered on one by one - never printed. Once crocheted, La Fatima and the women of the Guéliz atelier set it on a gold-tone hoop, with a little gold ring so it can be combined with other fruits, or even worn as a pendant.",
 "es": "Cada rodaja se construye hilo de rafia a hilo de rafia: rosa en el corazón, luego blanco, después el verde de la corteza, con las pepitas bordadas una a una por encima - nunca estampadas. Una vez tejida a ganchillo, La Fatima y las mujeres del taller de Guéliz la montan sobre un aro dorado, con una pequeña anilla dorada que permite combinarla con otras frutas, o incluso llevarla como colgante.",
 "tr": "Her dilim, rafya ipliği ipliğine örülür: ortasında pembe, sonra beyaz, ardından kabuğun yeşili ve üzerine tek tek işlenen çekirdekler - asla baskı değil. Örüldükten sonra La Fatima ve Guéliz atölyesindeki kadınlar onu altın rengi bir halkaya monte eder; küçük altın bir yüzük sayesinde başka meyvelerle birleştirilebilir, hatta kolye ucu olarak takılabilir.",
 "ar": "كل شريحة تُبنى خيط رافيا تلو الآخر: الوردي في القلب، ثم الأبيض، ثم الأخضر عند القشرة، والبذور مطرزة واحدة واحدة فوقها - لا طباعة أبداً. بعد الحياكة، تُركّبها الفاطمة ونساء ورشة كليز على حلق دائري ذهبي اللون، مع حلقة ذهبية صغيرة تتيح دمجها مع فواكه أخرى، أو حتى ارتداءها كتعليقة."
},
 "short": {
 "fr": "Deux tranches de pastèque sur créoles dorées - rose au cœur, vert à l’écorce.",
 "en": "Two watermelon slices on gold-tone hoops - pink at the heart, green at the rind."
 },
 "desc": {
 "fr": "Rose au cœur, blanc puis vert vers l’écorce, quelques pépins brodés par-dessus : la tranche se construit fil de raffia par fil de raffia, jamais imprimée. Les femmes de Guéliz la fixent ensuite à une créole dorée. À l’oreille elle ne pèse rien et bouge à chaque mot - l’étal de pastèque emporté avec soi.",
 "en": "Pink at the heart, white then green toward the rind, a scatter of pips embroidered on top: the slice is built raffia thread by raffia thread, never printed. The Guéliz women then fix it to a gold-tone hoop. On the ear it weighs nothing and moves with every word - the watermelon stall carried along."
 },
 "material": {
 "fr": "Raffia naturel teint de manière artisanale à la main. Ce sont les brins de raffia naturel qui se cassent facilement pendant le travail, ce qui rend le crochet lent et précis - mais une fois crochetée, tissée ou cousue, la pièce devient au contraire très solide et durable, et peu sensible à l’eau. Chaque fruit est d’ailleurs rembourré avec ses propres chutes de raffia, jamais avec de la mousse synthétique. Le crochet est l’une des seules techniques au monde qu’aucune machine ne peut reproduire - ces bijoux ne pourraient pas être fabriqués autrement. Montées sur créoles dorées de 1,5 à 2 cm.",
 "en": "Natural raffia, hand-dyed the artisanal way. It is the strands of natural raffia that snap easily as they are worked, which makes the crochet slow and precise - but once crocheted, woven or sewn, the piece becomes very strong and long-lasting, and barely sensitive to water. Each fruit is also stuffed with its own raffia offcuts, never synthetic foam. Crochet is one of the only techniques in the world that no machine can replicate - these jewels could not be made any other way. Set on gold-tone hoops of 1.5 to 2 cm."
 },
 "fabric": {
 "fr": "Rose et vert naissent du fil de raffia noué à la main, les pépins brodés par-dessus - aucune impression.",
 "en": "Pink and green come from raffia thread knotted by hand, the pips embroidered on top - no printing."
 },
 "handworkTime": {
 "fr": "Crocheté puis monté en bijou, pièce par pièce, à la main.",
 "en": "Crocheted then assembled into jewellery, piece by piece, by hand."
 },
 "dimensions": {
 "fr": "Un bijou ultra léger, qui fait son effet - bien là à l’oreille et pourtant aucun ressenti même après plusieurs heures.",
 "en": "An ultra-light jewel that makes itself felt - right there on the ear, yet no weight at all even after several hours."
 },
 "edition": {
 "fr": "Quelques paires seulement réalisées par mois - chaque paire a sa propre personnalité.",
 "en": "Only a few pairs made each month - each pair has its own personality."
 },
 "fruitStoryTitle": {
 "fr": "Le rose qui éclate au soleil",
 "en": "The pink that bursts in the sun"
 },
 "fruitStoryBody": {
 "fr": "En plein été, on fend la pastèque à même l’étal et le rose éclate sous le soleil. On a tenu cet instant - le frais, l’écorce verte, les graines - dans un fil de raffia.",
 "en": "In high summer the watermelon is split right on the stall and the pink bursts in the sun. We held that instant - the cool, the green rind, the seeds - in a thread of raffia."
 },
 "howToWearTitle": {
 "fr": "Comment la porter",
 "en": "How to wear it"
 },
 "howToWearIntro": {
 "fr": "Une couleur d’été qui aime la lumière et la peau nue.",
 "en": "A summer colour that loves light and bare skin."
 },
 "howToWearItems": [
 {
 "fr": "Sur un lin blanc ou écru, et le rose et le vert parlent seuls.",
 "en": "On white or ecru linen, and the pink and green speak for themselves."
 },
 {
 "fr": "Cheveux relevés, nuque libre - la tranche se balance.",
 "en": "Hair up, neck free - the slice swings."
 },
 {
 "fr": "En plein jour, au marché ou les pieds dans le sable.",
 "en": "In full daylight, at the market or feet in the sand."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Le reste tout sobre - une couleur forte à l’oreille, ça suffit.",
 "en": "Keep everything else plain - one strong colour at the ear is enough."
 },
 "howToWearNote": {
 "fr": "Faite à la main, pas deux tranches n’ont la même forme ni les mêmes graines.",
 "en": "Made by hand, no two slices share the same shape or the same seeds."
 }
 },
 {
 "handle": "kiwi-raffia-earrings-ss26",
"making": {
 "fr": "Chaque disque de kiwi passe du vert tendre des bords au cœur clair, crocheté fil à fil, puis reçoit sa couronne de petites graines brodées une à une - la partie la plus longue, celle qui fait vraiment le kiwi. La Fatima et l'atelier de Guéliz le montent ensuite sur créole dorée, avec un petit anneau doré qui permet de l'associer à d'autres fruits ou de le porter en pendentif.",
 "en": "Each kiwi disc shifts from the tender green of the edges to a pale heart, crocheted thread by thread, then gets its ring of little seeds embroidered one by one - the longest part, the one that truly makes the kiwi. La Fatima and the Guéliz atelier then set it on a gold-tone hoop, with a little gold ring so it can be paired with other fruits or worn as a pendant.",
 "es": "Cada disco de kiwi pasa del verde tierno de los bordes al corazón claro, tejido a ganchillo hilo a hilo, y luego recibe su corona de pequeñas semillas bordadas una a una - la parte más larga, la que de verdad hace el kiwi. La Fatima y el taller de Guéliz lo montan después sobre un aro dorado, con una pequeña anilla dorada que permite asociarlo a otras frutas o llevarlo como colgante.",
 "tr": "Her kivi diski, kenarların yumuşak yeşilinden açık renkli kalbe geçer, iplik iplik örülür, ardından tek tek işlenen küçük çekirdeklerden oluşan halkasını alır - en uzun süren, kiviyi gerçekten kivi yapan kısım. La Fatima ve Guéliz atölyesi sonra onu altın rengi bir halkaya monte eder; küçük altın bir yüzük sayesinde başka meyvelerle eşleştirilebilir ya da kolye ucu olarak takılabilir.",
 "ar": "كل قرص كيوي ينتقل من الأخضر الرقيق عند الحواف إلى القلب الفاتح، محاك خيطاً خيطاً، ثم يتلقى إكليله من البذور الصغيرة المطرزة واحدة واحدة - الجزء الأطول، وهو الذي يصنع الكيوي حقاً. ثم تركّبه الفاطمة وورشة كليز على حلق دائري ذهبي، مع حلقة ذهبية صغيرة تتيح دمجه مع فواكه أخرى أو ارتداءه كتعليقة."
},
 "short": {
 "fr": "Le kiwi en coupe - cœur clair, couronne de graines, sur créoles dorées.",
 "en": "Kiwi in cross-section - pale heart, ring of seeds, on gold-tone hoops."
 },
 "desc": {
 "fr": "Vert tendre vers les bords, cœur clair au centre, et la couronne de petites graines brodées une à une, qui demande tout le soin : c’est elle qui fait le kiwi. Le disque est crocheté fil à fil à Guéliz, puis monté sur créole dorée. À l’oreille, c’est doux et un peu décalé - un fruit ouvert au matin.",
 "en": "Tender green toward the edges, a pale heart at the centre, and the ring of little seeds embroidered one by one that takes all the care: it's the seeds that make the kiwi. The disc is crocheted thread by thread in Guéliz, then set on a gold-tone hoop. On the ear it's soft and a touch offbeat - a fruit opened in the morning."
 },
 "material": {
 "fr": "Raffia naturel teint de manière artisanale à la main. Ce sont les brins de raffia naturel qui se cassent facilement pendant le travail, ce qui rend le crochet lent et précis - mais une fois crochetée, tissée ou cousue, la pièce devient au contraire très solide et durable, et peu sensible à l’eau. Chaque fruit est d’ailleurs rembourré avec ses propres chutes de raffia, jamais avec de la mousse synthétique. Le crochet est l’une des seules techniques au monde qu’aucune machine ne peut reproduire - ces bijoux ne pourraient pas être fabriqués autrement. Montées sur créoles dorées de 1,5 à 2 cm.",
 "en": "Natural raffia, hand-dyed the artisanal way. It is the strands of natural raffia that snap easily as they are worked, which makes the crochet slow and precise - but once crocheted, woven or sewn, the piece becomes very strong and long-lasting, and barely sensitive to water. Each fruit is also stuffed with its own raffia offcuts, never synthetic foam. Crochet is one of the only techniques in the world that no machine can replicate - these jewels could not be made any other way. Set on gold-tone hoops of 1.5 to 2 cm."
 },
 "fabric": {
 "fr": "Le passage de verts crocheté fil à fil, puis la couronne de graines brodée par-dessus - un vrai petit ouvrage.",
 "en": "The shift of greens crocheted thread by thread, then the ring of seeds embroidered over it - true small handwork."
 },
 "handworkTime": {
 "fr": "Crocheté puis monté en bijou, pièce par pièce, à la main.",
 "en": "Crocheted then assembled into jewellery, piece by piece, by hand."
 },
 "dimensions": {
 "fr": "Un bijou ultra léger, qui fait son effet - bien là à l’oreille et pourtant aucun ressenti même après plusieurs heures.",
 "en": "An ultra-light jewel that makes itself felt - right there on the ear, yet no weight at all even after several hours."
 },
 "edition": {
 "fr": "Une poignée de paires, crochetées main ; le vert ne tombe jamais deux fois pareil.",
 "en": "A handful of pairs, crocheted by hand; the green never falls the same twice."
 },
 "fruitStoryTitle": {
 "fr": "Le cœur étoilé",
 "en": "The starred heart"
 },
 "fruitStoryBody": {
 "fr": "Coupé sur l’étal, le kiwi montre d’un coup son cœur étoilé de graines, vert et lumineux. C’est ce vert tendre, frais, qu’on a voulu près du visage.",
 "en": "Cut open on the stall, the kiwi suddenly shows its heart starred with seeds, green and luminous. It's that tender, fresh green we wanted near the face."
 },
 "howToWearTitle": {
 "fr": "Comment le porter",
 "en": "How to wear it"
 },
 "howToWearIntro": {
 "fr": "Un vert doux qui se glisse partout, du matin au soir.",
 "en": "A soft green that slips in anywhere, morning to night."
 },
 "howToWearItems": [
 {
 "fr": "Avec du denim ou du kaki, un accord de verts très facile.",
 "en": "With denim or khaki, an easy green-on-green note."
 },
 {
 "fr": "Sur une chemise blanche, pour une seule touche de couleur.",
 "en": "Over a white shirt, for a single touch of colour."
 },
 {
 "fr": "Au quotidien - un vert qui ne fatigue jamais l’œil.",
 "en": "Every day - a green that never tires the eye."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Mêlé aux dorés que vous portez déjà, la créole s’accorde aux bagues et chaînes fines.",
 "en": "Mixed with the gold you already wear, the hoop suits thin rings and chains."
 },
 "howToWearNote": {
 "fr": "Crocheté à la main, le dégradé de vert tombe chaque fois autrement - la paire est un peu la vôtre.",
 "en": "Crocheted by hand, the green falls differently each time - the pair is a little yours."
 }
 },
 {
 "handle": "lemon-raffia-earrings-ss26",
"making": {
 "fr": "Chaque citron vient tout entier du raffia teint : crocheté serré, puis rembourré de ses propres brins pour garder sa rondeur pleine - jamais de mousse. La Fatima et les femmes de Guéliz le façonnent et le montent sur créole dorée, avec un petit anneau doré qui permet de l'associer à d'autres fruits ou de le porter en pendentif.",
 "en": "Each lemon comes entirely from dyed raffia: crocheted tight, then stuffed with its own strands to hold its full roundness - never foam. La Fatima and the Guéliz women shape it and set it on a gold-tone hoop, with a little gold ring so it can be paired with other fruits or worn as a pendant.",
 "es": "Cada limón nace por completo de la rafia teñida: tejido a ganchillo bien apretado, y luego relleno con sus propias hebras para mantener su redondez plena - nunca espuma. La Fatima y las mujeres de Guéliz lo modelan y lo montan sobre un aro dorado, con una pequeña anilla dorada que permite asociarlo a otras frutas o llevarlo como colgante.",
 "tr": "Her limon tümüyle boyalı rafyadan doğar: sıkıca örülür, ardından dolgun yuvarlaklığını koruması için kendi tellerinden dolgu alır - asla sünger değil. La Fatima ve Guéliz'in kadınları onu biçimlendirip altın rengi bir halkaya monte eder; küçük altın bir yüzük sayesinde başka meyvelerle eşleştirilebilir ya da kolye ucu olarak takılabilir.",
 "ar": "كل ليمونة تأتي بأكملها من الرافيا المصبوغة: محاكة بإحكام، ثم محشوّة بخيوطها الخاصة لتحافظ على استدارتها الممتلئة - لا إسفنج أبداً. تشكّلها الفاطمة ونساء كليز وتركّبنها على حلق دائري ذهبي، مع حلقة ذهبية صغيرة تتيح دمجها مع فواكه أخرى أو ارتداءها كتعليقة."
},
 "short": {
 "fr": "Le citron sur créoles dorées - jaune franc, un peu de lumière à l’oreille. Une boucle entière, une tranche.",
 "en": "Lemon on gold-tone hoops - clear yellow, a little light at the ear. One whole, one slice."
 },
 "desc": {
 "fr": "Un jaune franc, gorgé de soleil, qui vient tout entier du raffia teint : crocheté serré puis rembourré de ses propres brins de raffia, le citron garde sa rondeur pleine. Façonné et monté sur créole dorée à Guéliz. C’est la couleur qui réveille un teint le matin - il en faut peu pour qu’elle suffise.",
 "en": "A clear, sun-soaked yellow that comes entirely from dyed raffia: crocheted tight then stuffed with its own raffia strands, the lemon holds its full roundness. Shaped and set on a gold-tone hoop in Guéliz. It's the colour that wakes a complexion in the morning - it takes little for it to be enough."
 },
 "material": {
 "fr": "Raffia naturel teint de manière artisanale à la main. Ce sont les brins de raffia naturel qui se cassent facilement pendant le travail, ce qui rend le crochet lent et précis - mais une fois crochetée, tissée ou cousue, la pièce devient au contraire très solide et durable, et peu sensible à l’eau. Chaque fruit est d’ailleurs rembourré avec ses propres chutes de raffia, jamais avec de la mousse synthétique. Le crochet est l’une des seules techniques au monde qu’aucune machine ne peut reproduire - ces bijoux ne pourraient pas être fabriqués autrement. Montées sur créoles dorées de 1,5 à 2 cm.",
 "en": "Natural raffia, hand-dyed the artisanal way. It is the strands of natural raffia that snap easily as they are worked, which makes the crochet slow and precise - but once crocheted, woven or sewn, the piece becomes very strong and long-lasting, and barely sensitive to water. Each fruit is also stuffed with its own raffia offcuts, never synthetic foam. Crochet is one of the only techniques in the world that no machine can replicate - these jewels could not be made any other way. Set on gold-tone hoops of 1.5 to 2 cm."
 },
 "fabric": {
 "fr": "Le jaune vient du raffia teint, crocheté serré puis rembourré de raffia pour tenir sa rondeur pleine.",
 "en": "The yellow comes from dyed raffia, crocheted tight then stuffed with raffia to hold its full round shape."
 },
 "handworkTime": {
 "fr": "Crocheté puis monté en bijou, pièce par pièce, à la main.",
 "en": "Crocheted then assembled into jewellery, piece by piece, by hand."
 },
 "dimensions": {
 "fr": "Un bijou ultra léger, qui fait son effet - bien là à l’oreille et pourtant aucun ressenti même après plusieurs heures.",
 "en": "An ultra-light jewel that makes itself felt - right there on the ear, yet no weight at all even after several hours."
 },
 "edition": {
 "fr": "Faite en petit nombre, à Guéliz ; chaque citron a sa petite rondeur.",
 "en": "Made in small numbers, in Guéliz; each lemon has its own little roundness."
 },
 "fruitStoryTitle": {
 "fr": "Partout sur les tables",
 "en": "Everywhere on the tables"
 },
 "fruitStoryBody": {
 "fr": "Le citron est partout à Marrakech - sur les tables, dans le thé, en pyramides jaunes au marché. On a pris ce jaune franc qui sent le soleil et on l’a noué au crochet.",
 "en": "Lemon is everywhere in Marrakech - on the tables, in the tea, in yellow pyramids at the market. We took that clear, sun-smelling yellow and knotted it at the hook."
 },
 "howToWearTitle": {
 "fr": "Comment le porter",
 "en": "How to wear it"
 },
 "howToWearIntro": {
 "fr": "Un jaune qui se porte comme un rai de lumière.",
 "en": "A yellow worn like a shaft of light."
 },
 "howToWearItems": [
 {
 "fr": "Sur du bleu - marine ou denim - le contraste plein été.",
 "en": "Against blue - navy or denim - the full-summer contrast."
 },
 {
 "fr": "Avec du blanc, et le jaune rayonne seul.",
 "en": "With white, and the yellow shines on its own."
 },
 {
 "fr": "Le soir comme en plein jour - il réchauffe le teint.",
 "en": "Evening or full day - it warms the complexion."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Un seul accent suffit : le reste des bijoux, discret et doré.",
 "en": "One accent is enough: the rest of the jewellery quiet and gold."
 },
 "howToWearNote": {
 "fr": "Fait à la main, jamais deux citrons de la même rondeur d’une paire à l’autre.",
 "en": "Made by hand, never two lemons of the same roundness from pair to pair."
 }
 },
 {
 "handle": "orange-raffia-earrings-ss26",
"making": {
 "fr": "Chaque orange tient sa couleur chaude du seul raffia teint : crochetée en rond, puis rembourrée de ses propres brins pour garder son galbe plein. La Fatima et l'atelier de Guéliz la montent sur créole dorée, avec un petit anneau doré qui permet de la combiner à d'autres fruits ou de la porter en pendentif.",
 "en": "Each orange takes its warm colour from dyed raffia alone: crocheted in the round, then stuffed with its own strands to keep its full curve. La Fatima and the Guéliz atelier set it on a gold-tone hoop, with a little gold ring so it can be combined with other fruits or worn as a pendant.",
 "es": "Cada naranja saca su color cálido únicamente de la rafia teñida: tejida a ganchillo en redondo, y luego rellena con sus propias hebras para mantener su curva plena. La Fatima y el taller de Guéliz la montan sobre un aro dorado, con una pequeña anilla dorada que permite combinarla con otras frutas o llevarla como colgante.",
 "tr": "Her portakal sıcak rengini yalnızca boyalı rafyadan alır: yuvarlak örülür, ardından dolgun kavisini koruması için kendi tellerinden dolgu alır. La Fatima ve Guéliz atölyesi onu altın rengi bir halkaya monte eder; küçük altın bir yüzük sayesinde başka meyvelerle birleştirilebilir ya da kolye ucu olarak takılabilir.",
 "ar": "كل برتقالة تستمد لونها الدافئ من الرافيا المصبوغة وحدها: محاكة على شكل دائري، ثم محشوّة بخيوطها الخاصة لتحافظ على تكوّرها الممتلئ. تركّبها الفاطمة وورشة كليز على حلق دائري ذهبي، مع حلقة ذهبية صغيرة تتيح دمجها مع فواكه أخرى أو ارتداءها كتعليقة."
},
 "short": {
 "fr": "L’orange sur créoles dorées - la couleur du jus pressé au coin de la rue. Une boucle entière, une tranche.",
 "en": "Orange on gold-tone hoops - the colour of juice pressed on the street corner. One whole, one slice."
 },
 "desc": {
 "fr": "Chaude et ronde, sa couleur vient du raffia teint et rien d’autre ; crochetée en rond puis rembourrée de ses brins de raffia, l’orange garde son galbe plein. Montée à Guéliz sur créole dorée. À l’oreille, elle pose cette chaleur d’agrume près du visage - un fruit fait de fil, qui suit la fin de journée.",
 "en": "Warm and round, its colour comes from dyed raffia and nothing else; crocheted in the round then stuffed with its raffia strands, the orange keeps its full curve. Set in Guéliz on a gold-tone hoop. On the ear it lays that citrus warmth near the face - a fruit made of thread, following the end of the day."
 },
 "material": {
 "fr": "Raffia naturel teint de manière artisanale à la main. Ce sont les brins de raffia naturel qui se cassent facilement pendant le travail, ce qui rend le crochet lent et précis - mais une fois crochetée, tissée ou cousue, la pièce devient au contraire très solide et durable, et peu sensible à l’eau. Chaque fruit est d’ailleurs rembourré avec ses propres chutes de raffia, jamais avec de la mousse synthétique. Le crochet est l’une des seules techniques au monde qu’aucune machine ne peut reproduire - ces bijoux ne pourraient pas être fabriqués autrement. Montées sur créoles dorées de 1,5 à 2 cm.",
 "en": "Natural raffia, hand-dyed the artisanal way. It is the strands of natural raffia that snap easily as they are worked, which makes the crochet slow and precise - but once crocheted, woven or sewn, the piece becomes very strong and long-lasting, and barely sensitive to water. Each fruit is also stuffed with its own raffia offcuts, never synthetic foam. Crochet is one of the only techniques in the world that no machine can replicate - these jewels could not be made any other way. Set on gold-tone hoops of 1.5 to 2 cm."
 },
 "fabric": {
 "fr": "L’orange vient du raffia teint, crocheté en rond pour garder son galbe - un fruit en fil.",
 "en": "The orange comes from dyed raffia, crocheted in the round to keep its curve - a fruit in thread."
 },
 "handworkTime": {
 "fr": "Crocheté puis monté en bijou, pièce par pièce, à la main.",
 "en": "Crocheted then assembled into jewellery, piece by piece, by hand."
 },
 "dimensions": {
 "fr": "Un bijou ultra léger, qui fait son effet - bien là à l’oreille et pourtant aucun ressenti même après plusieurs heures.",
 "en": "An ultra-light jewel that makes itself felt - right there on the ear, yet no weight at all even after several hours."
 },
 "edition": {
 "fr": "Petite fournée faite main, au crochet ; rondeur et grain changent d’une paire à l’autre.",
 "en": "A small hand-made batch, at the hook; roundness and texture change from pair to pair."
 },
 "fruitStoryTitle": {
 "fr": "Pressée à la minute",
 "en": "Pressed by the minute"
 },
 "fruitStoryBody": {
 "fr": "Sur la place, les charrettes d’oranges s’empilent et le jus se presse à la minute, chaud de soleil. C’est cette orange ronde et pleine de lumière qu’on a crochetée.",
 "en": "On the square the orange carts pile high and the juice is pressed by the minute, warm with sun. It's that round, light-filled orange we crocheted."
 },
 "howToWearTitle": {
 "fr": "Comment la porter",
 "en": "How to wear it"
 },
 "howToWearIntro": {
 "fr": "Une couleur chaude qui aime les peaux dorées et les fins de journée.",
 "en": "A warm colour that loves golden skin and the end of the day."
 },
 "howToWearItems": [
 {
 "fr": "Sur du terracotta, du beige ou du brun - accord ton sur ton tout doux.",
 "en": "With terracotta, beige or brown - a soft tone-on-tone accord."
 },
 {
 "fr": "Avec du rose ou du fuchsia, pour oser la couleur pleine.",
 "en": "With pink or fuchsia, to dare full colour."
 },
 {
 "fr": "À la lumière du soir, l’orange s’embrase un peu plus.",
 "en": "In evening light, the orange glows a little brighter."
 }
 ],
 "howToWearStyleTip": {
 "fr": "À dépareiller avec un autre fruit - une oreille orange, l’autre citron, par exemple.",
 "en": "To mismatch with another fruit - one orange ear, one lemon, for instance."
 },
 "howToWearNote": {
 "fr": "Crochetée à la main, sa rondeur et son grain changent un peu selon la paire.",
 "en": "Crocheted by hand, its roundness and texture shift a little with each pair."
 }
 },
 {
 "handle": "grapes-raffia-earrings-ss26",
"making": {
 "fr": "Chaque grain naît seul au crochet, en raffia teint, avant d'être noué à la grappe entière et suspendu à la créole dorée. Certains reprennent l'aakad, le bouton de caftan tressé main de Sefrou, inscrit au patrimoine du caftan marocain. La Fatima et les femmes de Guéliz assemblent le tout à la main, avec un petit anneau doré qui permet de combiner la grappe à d'autres fruits ou de la porter en pendentif.",
 "en": "Each grape is born on its own at the hook, in dyed raffia, before being knotted into the whole cluster and hung from the gold-tone hoop. Some take up the aakad, the hand-braided Sefrou caftan button, listed in the heritage of the Moroccan caftan. La Fatima and the Guéliz women assemble it all by hand, with a little gold ring so the cluster can be combined with other fruits or worn as a pendant.",
 "es": "Cada grano nace solo al ganchillo, en rafia teñida, antes de anudarse al racimo entero y colgarse del aro dorado. Algunos retoman el aakad, el botón de caftán trenzado a mano de Sefrou, inscrito en el patrimonio del caftán marroquí. La Fatima y las mujeres de Guéliz lo ensamblan todo a mano, con una pequeña anilla dorada que permite combinar el racimo con otras frutas o llevarlo como colgante.",
 "tr": "Her tane, boyalı rafyadan, önce tığ üzerinde tek başına doğar; sonra bütün salkıma düğümlenip altın rengi halkaya asılır. Bazıları, Fas kaftanı mirasına kayıtlı, elde örülmüş Sefrou kaftan düğmesi aakad'ı benimser. La Fatima ve Guéliz'in kadınları her şeyi elde birleştirir; küçük altın bir yüzük sayesinde salkım başka meyvelerle birleştirilebilir ya da kolye ucu olarak takılabilir.",
 "ar": "كل حبة تولد وحدها بالصنارة، من رافيا مصبوغة، قبل أن تُعقد إلى العنقود بأكمله وتُعلّق على الحلق الذهبي. بعضها يستعيد العَقّاد، زر القفطان المضفور يدوياً من صفرو، المُدرَج ضمن تراث القفطان المغربي. تجمّع الفاطمة ونساء كليز كل ذلك يدوياً، مع حلقة ذهبية صغيرة تتيح دمج العنقود مع فواكه أخرى أو ارتداءه كتعليقة."
},
 "short": {
 "fr": "Une petite grappe sur créoles dorées - des grains ronds qui dansent au moindre geste.",
 "en": "A little cluster on gold-tone hoops - round grapes that dance at the slightest move."
 },
 "desc": {
  "fr": "Chaque grain est crocheté à part, puis noué aux autres jusqu'à former la grappe suspendue à la créole - un assemblage entièrement manuel. Certains grains empruntent l'aakad, ce bouton de caftan tressé main venu de Sefrou, à l'origine en forme de cerise, inscrit au patrimoine du caftan marocain. C'est ce qui les fait bouger : à l'oreille, les grains se frôlent et attrapent la lumière, un balancement doux qui se réveille dès qu'on tourne la tête.",
  "en": "Each grape is crocheted apart, then knotted to the others until the cluster hangs from the hoop - assembled entirely by hand. Some grapes borrow the aakad, the hand-braided Moroccan caftan button from Sefrou, cherry-shaped in origin and listed in the heritage of the Moroccan caftan. That's what sets them moving: on the ear the grapes brush together and catch the light, a soft sway that wakes the moment you turn your head.",
  "es": "Cada grano se teje a ganchillo por separado y luego se anuda a los demás hasta formar el racimo que cuelga del aro - un ensamblaje enteramente manual. Algunos granos toman prestado el aakad, ese botón de caftán trenzado a mano de Sefrou, con forma de cereza en su origen, inscrito en el patrimonio del caftán marroquí. Eso es lo que los hace moverse: en la oreja los granos se rozan y atrapan la luz, un balanceo suave que despierta en cuanto giras la cabeza.",
  "tr": "Her tane ayrı ayrı örülür, sonra diğerlerine düğümlenerek halkadan sarkan salkımı oluşturur - tamamen elde birleştirilir. Bazı taneler, Sefrou'dan gelen, kökeninde kiraz biçimli, Fas kaftanı mirasına kayıtlı, elde örülmüş kaftan düğmesi aakad'ı ödünç alır. Onları hareket ettiren de budur: kulakta taneler birbirine değer ve ışığı yakalar, başını çevirir çevirmez uyanan yumuşak bir salınım.",
  "ar": "كل حبة تُحاك على حدة، ثم تُعقد إلى الأخريات حتى تتشكّل العنقود المتدلّي من الحلق - تجميع يدوي بالكامل. بعض الحبات تستعير العَقّاد، ذاك زر القفطان المضفور يدوياً القادم من صفرو، الذي كان في أصله على شكل حبة كرز، والمُدرَج ضمن تراث القفطان المغربي. هذا ما يجعلها تتحرّك: عند الأذن تتلامس الحبات وتلتقط الضوء، تأرجح ناعم يستيقظ ما إن تديري رأسك."
 },
 "material": {
 "fr": "Raffia naturel teint de manière artisanale à la main. Ce sont les brins de raffia naturel qui se cassent facilement pendant le travail, ce qui rend le crochet lent et précis - mais une fois crochetée, tissée ou cousue, la pièce devient au contraire très solide et durable, et peu sensible à l’eau. Chaque fruit est d’ailleurs rembourré avec ses propres chutes de raffia, jamais avec de la mousse synthétique. Le crochet est l’une des seules techniques au monde qu’aucune machine ne peut reproduire - ces bijoux ne pourraient pas être fabriqués autrement. Montées sur créoles dorées de 1,5 à 2 cm.",
 "en": "Natural raffia, hand-dyed the artisanal way. It is the strands of natural raffia that snap easily as they are worked, which makes the crochet slow and precise - but once crocheted, woven or sewn, the piece becomes very strong and long-lasting, and barely sensitive to water. Each fruit is also stuffed with its own raffia offcuts, never synthetic foam. Crochet is one of the only techniques in the world that no machine can replicate - these jewels could not be made any other way. Set on gold-tone hoops of 1.5 to 2 cm."
 },
 "fabric": {
 "fr": "Chaque grain crocheté seul, puis noué à la grappe - tout à la main.",
 "en": "Each grape crocheted on its own, then knotted into the cluster - all by hand."
 },
 "handworkTime": {
 "fr": "Crocheté puis monté en bijou, pièce par pièce, à la main.",
 "en": "Crocheted then assembled into jewellery, piece by piece, by hand."
 },
 "dimensions": {
 "fr": "Un bijou ultra léger, qui fait son effet - bien là à l’oreille et pourtant aucun ressenti même après plusieurs heures.",
 "en": "An ultra-light jewel that makes itself felt - right there on the ear, yet no weight at all even after several hours."
 },
 "edition": {
 "fr": "Quelques paires seulement, faites au crochet ; chaque grappe compte ses grains à sa façon.",
 "en": "Only a few pairs, made at the hook; each cluster counts its grapes its own way."
 },
 "fruitStoryTitle": {
 "fr": "L’ombre de la treille",
 "en": "Shade of the trellis"
 },
 "fruitStoryBody": {
 "fr": "À Marrakech, la vigne grimpe sur les treilles et donne une ombre fraîche, les grappes lourdes au-dessus des têtes. On l’a crochetée grain à grain pour garder un peu de cette ombre douce.",
 "en": "In Marrakech the vine climbs the trellis and gives cool shade, the clusters heavy overhead. We crocheted it grape by grape to keep a little of that soft shade."
 },
 "howToWearTitle": {
 "fr": "Comment la porter",
 "en": "How to wear it"
 },
 "howToWearIntro": {
 "fr": "Une grappe qui bouge - elle aime les cheveux relevés et les épaules nues.",
 "en": "A cluster that moves - it loves hair up and bare shoulders."
 },
 "howToWearItems": [
 {
 "fr": "Avec une encolure dégagée, et les grains se balancent.",
 "en": "With an open neckline, and the grapes swing."
 },
 {
 "fr": "Sur des tons crème ou vert vigne, esprit de table d’été.",
 "en": "With cream or vine-green tones, a summer-table feel."
 },
 {
 "fr": "En fin de journée, la lumière rasante fait danser les grains.",
 "en": "Late in the day, low light sets the grapes dancing."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Qu’elle mène seule : pas de collier, juste la grappe et la lumière.",
 "en": "Let it lead alone: no necklace, just the cluster and the light."
 },
 "howToWearNote": {
 "fr": "Faite à la main, aucune grappe ne compte ses grains comme la voisine.",
 "en": "Made by hand, no cluster counts its grapes like its neighbour."
 }
 },
 {
 "handle": "cherries-raffia-earrings-ss26",
"making": {
 "fr": "Chaque cerise est crochetée ronde en raffia teint, puis reliée à sa jumelle par une tige nouée à la main avant d'être suspendue à la créole dorée. La cerise reprend l'aakad, le bouton de caftan tressé main de Sefrou en forme de cerise, inscrit au patrimoine du caftan marocain. La Fatima et l'atelier de Guéliz montent le tout à la main, avec un petit anneau doré qui permet de les combiner à d'autres fruits ou de les porter en pendentif.",
 "en": "Each cherry is crocheted round in dyed raffia, then joined to its twin by a hand-knotted stem before being hung from the gold-tone hoop. The cherry takes up the aakad, the cherry-shaped hand-braided Sefrou caftan button, listed in the heritage of the Moroccan caftan. La Fatima and the Guéliz atelier mount it all by hand, with a little gold ring so they can be combined with other fruits or worn as a pendant.",
 "es": "Cada cereza se teje a ganchillo bien redonda en rafia teñida, y luego se une a su gemela por un tallo anudado a mano antes de colgarse del aro dorado. La cereza retoma el aakad, el botón de caftán trenzado a mano de Sefrou con forma de cereza, inscrito en el patrimonio del caftán marroquí. La Fatima y el taller de Guéliz lo montan todo a mano, con una pequeña anilla dorada que permite combinarlas con otras frutas o llevarlas como colgante.",
 "tr": "Her kiraz boyalı rafyadan yuvarlak örülür, sonra elde düğümlenmiş bir sapla ikizine bağlanır ve altın rengi halkaya asılır. Kiraz, kiraz biçimli, elde örülmüş Sefrou kaftan düğmesi aakad'ı benimser; Fas kaftanı mirasına kayıtlıdır. La Fatima ve Guéliz atölyesi her şeyi elde monte eder; küçük altın bir yüzük sayesinde başka meyvelerle birleştirilebilir ya da kolye ucu olarak takılabilirler.",
 "ar": "كل كرزة تُحاك مستديرة من رافيا مصبوغة، ثم تُوصل بتوأمها عبر ساق معقودة يدوياً قبل أن تُعلّق على الحلق الذهبي. تستعيد الكرزة العَقّاد، زر القفطان المضفور يدوياً من صفرو على شكل كرزة، المُدرَج ضمن تراث القفطان المغربي. تركّب الفاطمة وورشة كليز كل ذلك يدوياً، مع حلقة ذهبية صغيرة تتيح دمجهما مع فواكه أخرى أو ارتداءهما كتعليقة."
},
 "short": {
 "fr": "Deux cerises reliées par la tige, sur créoles dorées - un rouge joueur à l’oreille.",
 "en": "Two cherries joined at the stem, on gold-tone hoops - a playful red at the ear."
 },
 "desc": {
  "fr": "Deux petites boules rouges, crochetées rondes et reliées par une tige nouée main, qui pendent à la créole dorée. La cerise reprend l'aakad, ce bouton de caftan tressé main venu de Sefrou dont la forme d'origine est justement une cerise - un geste inscrit au patrimoine du caftan marocain. Un rouge gourmand, un brin joueur, le détail qui décroche un sourire. À Guéliz, chaque cerise est faite puis montée à la suivante, sans qu'aucune ne ressemble tout à fait à l'autre.",
  "en": "Two small red rounds, crocheted plump and joined by a hand-knotted stem, hanging from the gold-tone hoop. The cherry takes up the aakad, the hand-braided Moroccan caftan button from Sefrou whose original shape is a cherry itself - a gesture listed in the heritage of the Moroccan caftan. A gourmand red, a touch playful, the detail that pulls a smile. In Guéliz each cherry is made then mounted to the next, with none quite matching the other.",
  "es": "Dos pequeñas bolas rojas, tejidas a ganchillo bien redondas y unidas por un tallo anudado a mano, que cuelgan del aro dorado. La cereza retoma el aakad, ese botón de caftán trenzado a mano de Sefrou cuya forma original es precisamente una cereza - un gesto inscrito en el patrimonio del caftán marroquí. Un rojo goloso, algo juguetón, el detalle que arranca una sonrisa. En Guéliz cada cereza se hace y luego se monta con la siguiente, sin que ninguna se parezca del todo a la otra.",
  "tr": "İki küçük kırmızı yuvarlak, tombul örülmüş ve elde düğümlenmiş bir sapla birbirine bağlı, altın rengi halkadan sarkar. Kiraz, kökeninde bir kiraz biçiminde olan, Sefrou'dan gelen elde örülmüş Fas kaftan düğmesi aakad'ı benimser - Fas kaftanı mirasına kayıtlı bir el işi. Şımarık, biraz oyunbaz bir kırmızı, gülümseten ayrıntı. Guéliz'de her kiraz yapılıp bir sonrakine monte edilir, hiçbiri tam olarak ötekine benzemez.",
  "ar": "كرتان حمراوان صغيرتان، محاكتان مستديرتين ممتلئتين ومربوطتان بساق معقود يدوياً، تتدلّيان من الحلق الذهبي. تستعيد الكرزة العَقّاد، ذاك زر القفطان المضفور يدوياً القادم من صفرو الذي كان شكله الأصلي كرزةً بالضبط - صنعة مُدرَجة ضمن تراث القفطان المغربي. أحمر شهيّ، لعوب قليلاً، التفصيل الذي ينتزع ابتسامة. في كليز، تُصنع كل كرزة ثم تُركَّب إلى التالية، دون أن تشبه أيّ واحدة الأخرى تماماً."
 },
 "material": {
 "fr": "Raffia naturel teint de manière artisanale à la main. Ce sont les brins de raffia naturel qui se cassent facilement pendant le travail, ce qui rend le crochet lent et précis - mais une fois crochetée, tissée ou cousue, la pièce devient au contraire très solide et durable, et peu sensible à l’eau. Chaque fruit est d’ailleurs rembourré avec ses propres chutes de raffia, jamais avec de la mousse synthétique. Le crochet est l’une des seules techniques au monde qu’aucune machine ne peut reproduire - ces bijoux ne pourraient pas être fabriqués autrement. Montées sur créoles dorées de 1,5 à 2 cm.",
 "en": "Natural raffia, hand-dyed the artisanal way. It is the strands of natural raffia that snap easily as they are worked, which makes the crochet slow and precise - but once crocheted, woven or sewn, the piece becomes very strong and long-lasting, and barely sensitive to water. Each fruit is also stuffed with its own raffia offcuts, never synthetic foam. Crochet is one of the only techniques in the world that no machine can replicate - these jewels could not be made any other way. Set on gold-tone hoops of 1.5 to 2 cm."
 },
 "fabric": {
 "fr": "Deux cerises crochetées rondes, reliées par une tige nouée à la main.",
 "en": "Two cherries crocheted round, joined by a hand-knotted stem."
 },
 "handworkTime": {
 "fr": "Crocheté puis monté en bijou, pièce par pièce, à la main.",
 "en": "Crocheted then assembled into jewellery, piece by piece, by hand."
 },
 "dimensions": {
 "fr": "Un bijou ultra léger, qui fait son effet - bien là à l’oreille et pourtant aucun ressenti même après plusieurs heures.",
 "en": "An ultra-light jewel that makes itself felt - right there on the ear, yet no weight at all even after several hours."
 },
 "edition": {
 "fr": "Faite en petit nombre, à Guéliz ; les deux cerises ne tombent jamais jumelles.",
 "en": "Made in small numbers, in Guéliz; the two cherries never fall as twins."
 },
 "fruitStoryTitle": {
 "fr": "Les cerises à deux",
 "en": "Cherries, two by two"
 },
 "fruitStoryBody": {
 "fr": "Les cerises arrivent tôt et brillent, rouges et serrées, dans les cageots du marché. Nous aimons qu’elles aillent toujours par deux - alors nous les avons crochetées ainsi, reliées par leur tige.",
 "en": "Cherries come early and shine, red and tight, in the market crates. We love that they always come in twos - so we crocheted them that way, joined at the stem."
 },
 "howToWearTitle": {
 "fr": "Comment les porter",
 "en": "How to wear them"
 },
 "howToWearIntro": {
 "fr": "Un rouge joueur qui donne tout de suite le sourire.",
 "en": "A playful red that brings the smile straight away."
 },
 "howToWearItems": [
 {
 "fr": "Sur du blanc ou du crème, pour que le rouge claque.",
 "en": "On white or cream, so the red pops."
 },
 {
 "fr": "Avec une robe d’été légère et les cheveux lâchés.",
 "en": "With a light summer dress and hair down."
 },
 {
 "fr": "Quand vous voulez une seule petite touche de couleur, gourmande.",
 "en": "When you want a single, gourmand touch of colour."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Une bouche rouge et ces cerises : c’est tout, c’est juste.",
 "en": "A red lip and these cherries - that is all it takes."
 },
 "howToWearNote": {
 "fr": "Crochetées à la main, les deux cerises ne sont jamais tout à fait jumelles - c’est la marque de la main.",
 "en": "Crocheted by hand, the two cherries are never quite twins - that is the mark of the hand."
 }
 },
 {
 "handle": "tomatoes-raffia-earrings-ss26",
"making": {
 "fr": "Chaque tomate naît en deux temps : le corps rouge crocheté en rond, puis le petit calice vert, faits à part et réunis au fil. En raffia teint, jamais imprimée, elle est ensuite montée sur créole dorée par La Fatima et les femmes de Guéliz, avec un petit anneau doré qui permet de la combiner à d'autres fruits ou de la porter en pendentif.",
 "en": "Each tomato is born in two stages: the red body crocheted in the round, then the little green calyx, made apart and joined at the thread. In dyed raffia, never printed, it is then set on a gold-tone hoop by La Fatima and the Guéliz women, with a little gold ring so it can be combined with other fruits or worn as a pendant.",
 "es": "Cada tomate nace en dos tiempos: el cuerpo rojo tejido a ganchillo en redondo, y luego el pequeño cáliz verde, hechos por separado y reunidos al hilo. En rafia teñida, nunca estampado, se monta después sobre un aro dorado por La Fatima y las mujeres de Guéliz, con una pequeña anilla dorada que permite combinarlo con otras frutas o llevarlo como colgante.",
 "tr": "Her domates iki aşamada doğar: yuvarlak örülen kırmızı gövde, sonra küçük yeşil çanak yaprak, ayrı yapılıp iplikle birleştirilir. Boyalı rafyadan, asla baskı değil, ardından La Fatima ve Guéliz'in kadınları tarafından altın rengi bir halkaya monte edilir; küçük altın bir yüzük sayesinde başka meyvelerle birleştirilebilir ya da kolye ucu olarak takılabilir.",
 "ar": "كل طماطة تولد على مرحلتين: الجسم الأحمر محاك على شكل دائري، ثم الكأس الأخضر الصغير، يُصنعان على حدة ويُجمعان بالخيط. من رافيا مصبوغة، لا طباعة أبداً، ثم تركّبها الفاطمة ونساء كليز على حلق دائري ذهبي، مع حلقة ذهبية صغيرة تتيح دمجها مع فواكه أخرى أو ارتداءها كتعليقة."
},
 "short": {
 "fr": "La tomate au crochet, coiffée de son calice vert - rouge de potager à l’oreille.",
 "en": "Tomato at the crochet hook, capped with its green calyx - garden red at the ear."
 },
 "desc": {
 "fr": "Ronde, rouge, son petit calice vert posé dessus comme un chapeau : la tomate du potager, crochetée en raffia et montée sur créole dorée. Le corps et le calice naissent séparément, puis se rejoignent au fil. À l’oreille, rien de chichi - juste le rouge franc des étals et des tables de Guéliz, à hauteur de joue.",
 "en": "Round, red, its little green calyx set on top like a cap: the garden tomato, crocheted in raffia and mounted on a gold-tone hoop. Body and calyx are born apart, then meet at the thread. On the ear, nothing fussy - just the frank red of the Guéliz stalls and tables, level with the cheek."
 },
 "material": {
 "fr": "Raffia naturel teint de manière artisanale à la main. Ce sont les brins de raffia naturel qui se cassent facilement pendant le travail, ce qui rend le crochet lent et précis - mais une fois crochetée, tissée ou cousue, la pièce devient au contraire très solide et durable, et peu sensible à l’eau. Chaque fruit est d’ailleurs rembourré avec ses propres chutes de raffia, jamais avec de la mousse synthétique. Le crochet est l’une des seules techniques au monde qu’aucune machine ne peut reproduire - ces bijoux ne pourraient pas être fabriqués autrement. Montées sur créoles dorées de 1,5 à 2 cm.",
 "en": "Natural raffia, hand-dyed the artisanal way. It is the strands of natural raffia that snap easily as they are worked, which makes the crochet slow and precise - but once crocheted, woven or sewn, the piece becomes very strong and long-lasting, and barely sensitive to water. Each fruit is also stuffed with its own raffia offcuts, never synthetic foam. Crochet is one of the only techniques in the world that no machine can replicate - these jewels could not be made any other way. Set on gold-tone hoops of 1.5 to 2 cm."
 },
 "fabric": {
 "fr": "Corps rouge et calice vert crochetés à part, puis réunis au fil.",
 "en": "Red body and green calyx crocheted apart, then joined at the thread."
 },
 "handworkTime": {
 "fr": "Crocheté puis monté en bijou, pièce par pièce, à la main.",
 "en": "Crocheted then assembled into jewellery, piece by piece, by hand."
 },
 "dimensions": {
 "fr": "Un bijou ultra léger, qui fait son effet - bien là à l’oreille et pourtant aucun ressenti même après plusieurs heures.",
 "en": "An ultra-light jewel that makes itself felt - right there on the ear, yet no weight at all even after several hours."
 },
 "edition": {
 "fr": "Petite fournée faite main, au crochet ; pas une tomate n’est tout à fait ronde pareil.",
 "en": "A small hand-made batch, at the hook; no two tomatoes are round quite the same."
 },
 "fruitStoryTitle": {
 "fr": "Rouge de la salade de midi",
 "en": "Red of the midday salad"
 },
 "fruitStoryBody": {
 "fr": "À midi, la tomate finit coupée dans l’huile et le sel, sur la table du déjeuner. On a gardé l’avant : ronde, mûre, le calice encore vert, au crochet et au fil.",
 "en": "At noon the tomato ends up sliced into oil and salt, on the lunch table. We kept the before: round, ripe, the calyx still green, in crochet and thread."
 },
 "howToWearTitle": {
 "fr": "Comment la porter",
 "en": "How to wear it"
 },
 "howToWearIntro": {
 "fr": "Un rouge sans détour - laissez-le faire le travail.",
 "en": "A red with no detours - let it do the work."
 },
 "howToWearItems": [
 {
 "fr": "Sur du lin blanc ou écru, comme une nappe d’été.",
 "en": "On white or ecru linen, like a summer cloth."
 },
 {
 "fr": "Près d’un vert profond, et le calice répond tout seul.",
 "en": "Near a deep green, and the calyx answers on its own."
 },
 {
 "fr": "En semaine, quand un seul point vif suffit.",
 "en": "On a weekday, when a single bright point is enough."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Mariez-la à une cerise : deux rouges du marché, deux rondeurs qui se répondent.",
 "en": "Marry it to a cherry: two market reds, two roundnesses answering each other."
 },
 "howToWearNote": {
 "fr": "Faite main, le rouge et le petit calice tombent un peu autrement d’une oreille à l’autre.",
 "en": "Made by hand, the red and the little calyx fall a little differently from one ear to the other."
 }
 }
 ],
 "necklaces": [
 {
 "handle": "lemon-slice-raffia-necklace-ss26",
"making": {
 "fr": "Chaque tranche est crochetée quartier après quartier dans un raffia teint main, puis nouée sur le cordon en cuir.",
 "en": "Each slice is crocheted segment after segment in hand-dyed raffia, then knotted onto the leather cord.",
 "es": "Cada rodaja se teje a crochet gajo tras gajo en rafia teñida a mano, y luego se anuda al cordón de cuero.",
 "tr": "Her dilim, elde boyanmış rafyada dilim dilim tığla örülür, sonra deri korda düğümlenir.",
 "ar": "كل شريحة تُكرّش فلقةً بعد فلقة من رافيا مصبوغة يدوياً، ثم تُعقد على السير الجلدي."
},
 "short": {
  "fr": "Une tranche de citron au crochet de raffia teint main, contre la peau - un quartier de jaune au cou.",
  "en": "A lemon slice crocheted in hand-dyed raffia against the skin - a wedge of yellow at the neck.",
  "es": "Una rodaja de limón a crochet en rafia teñida a mano, contra la piel - un gajo de amarillo en el cuello.",
  "tr": "Elde boyanmış rafyadan tığla örülmüş bir limon dilimi, tenin üstünde - boyunda bir sarı dilim.",
  "ar": "شريحة ليمون مكرّوشيه من رافيا مصبوغة يدوياً، على البشرة - فلقة صفراء عند العنق."
 },
 "desc": {
  "fr": "Un demi-rond de citron, le grain des quartiers monté point par point dans un raffia teint main, noué sur un cordon en cuir avec sa petite boucle. À Guéliz, La Fatima crochète la tranche pendant qu'à côté on coud les cordons - deux gestes, une même table. Posée à même la peau ou sur un col de lin, elle pose un seul quartier de jaune et n'en demande pas plus.",
  "en": "A lemon half-round, the grain of the segments built stitch by stitch in hand-dyed raffia, knotted on a leather cord with its small clasp. In Guéliz, La Fatima crochets the slice while the cords are sewn alongside - two gestures, one table. Worn against bare skin or on a linen collar, it lays down a single wedge of yellow and asks for nothing more.",
  "es": "Un medio-redondo de limón, la textura de los gajos montada punto a punto en rafia teñida a mano, anudado en un cordón de cuero con su pequeño cierre. En Guéliz, La Fatima teje la rodaja a crochet mientras al lado se cosen los cordones - dos gestos, una misma mesa. Contra la piel desnuda o sobre un cuello de lino, pone un solo gajo de amarillo y no pide nada más.",
  "tr": "Yarım daire bir limon; dilimlerin dokusu elde boyanmış rafyada ilmek ilmek örülmüş, küçük tokalı deri bir korda düğümlenmiş. Guéliz'de La Fatima dilimi tığla örerken hemen yanında kordlar dikilir - iki el işi, tek bir masa. Çıplak tenin üstünde ya da keten bir yakada, tek bir sarı dilim koyar ve daha fazlasını istemez.",
  "ar": "نصف دائرة من الليمون، حبيبات الفلقات مبنية غرزةً غرزة من رافيا مصبوغة يدوياً، معقودة على سير جلدي بمشبكه الصغير. في غيليز، تكرّش لافاطمة الشريحة بينما تُخاط الأسيار إلى جانبها - حركتان، طاولة واحدة. على البشرة العارية أو على ياقة من الكتّان، تضع فلقة صفراء واحدة ولا تطلب أكثر."
 },
 "material": {
  "fr": "Raffia teint main crocheté sur cordon en cuir, boucle de finition.",
  "en": "Hand-dyed raffia crocheted on a leather cord, finishing clasp.",
  "es": "Rafia teñida a mano tejida a crochet sobre cordón de cuero, cierre de acabado.",
  "tr": "Deri korda tığla örülmüş elde boyanmış rafya, tamamlayıcı toka.",
  "ar": "رافيا مصبوغة يدوياً مكرّوشيه على سير جلدي، مع مشبك تشطيب."
 },
 "fabric": {
  "fr": "Le crochet creuse les quartiers et lève leur relief, fil après fil.",
  "en": "The crochet hollows the segments and raises their ridge, thread after thread.",
  "es": "El crochet ahueca los gajos y levanta su relieve, hilo tras hilo.",
  "tr": "Tığ, dilimleri oyar ve kabartılarını iplik iplik yükseltir.",
  "ar": "الكروشيه يجوّف الفلقات ويرفع نتوءها، خيطاً بعد خيط."
 },
 "handworkTime": {
  "fr": "Crochetée dans un raffia teint main puis nouée sur le cordon en cuir, pièce par pièce.",
  "en": "Crocheted in hand-dyed raffia then knotted onto the leather cord, piece by piece.",
  "es": "Tejida a crochet en rafia teñida a mano y luego anudada al cordón de cuero, pieza por pieza.",
  "tr": "Elde boyanmış rafyada tığla örülür, sonra deri korda tek tek düğümlenir.",
  "ar": "تُكرّش من رافيا مصبوغة يدوياً ثم تُعقد على السير الجلدي، قطعةً قطعة."
 },
 "dimensions": {
 "fr": "Un petit bijou textile, léger - bien posé contre la peau ou un col de lin.",
 "en": "A small textile-jewel, light - set against the skin or a linen collar."
 },
 "edition": {
 "fr": "Quelques pièces seulement, faites au crochet ; deux tranches ne jaunissent jamais pareil.",
 "en": "Only a few pieces, made at the hook; no two slices yellow the same."
 },
 "fruitStoryTitle": {
 "fr": "Pyramides jaunes du matin",
 "en": "Yellow pyramids of morning"
 },
 "fruitStoryBody": {
  "fr": "Dès le lever du jour, les citrons s'empilent en pyramides sur les étals et prennent la première lumière. On a gardé cette acidité claire et crocheté un quartier de raffia teint main, noué au cordon.",
  "en": "From first light the lemons stack into pyramids on the stalls and take the day's first sun. We kept that clear acidity and crocheted one wedge of hand-dyed raffia, knotted to the cord.",
  "es": "Desde el amanecer, los limones se apilan en pirámides sobre los puestos y toman la primera luz. Conservamos esa acidez clara y tejimos a crochet un gajo de rafia teñida a mano, anudado al cordón.",
  "tr": "Gün ağarır ağarmaz limonlar tezgâhlarda piramitler hâlinde yığılır ve günün ilk ışığını alır. O berrak ekşiliği koruduk ve elde boyanmış rafyadan bir dilim örüp korda düğümledik.",
  "ar": "مع أول ضوء، تتراكم الليمونات أهراماً على البسطات وتلتقط أول نور النهار. احتفظنا بتلك الحموضة الصافية وكرّشنا فلقة من رافيا مصبوغة يدوياً، معقودة على السير."
 },
 "howToWearTitle": {
 "fr": "Comment la porter",
 "en": "How to wear it"
 },
 "howToWearIntro": {
 "fr": "Un quartier de jaune suffit - laissez-le respirer.",
 "en": "One wedge of yellow is enough - let it breathe."
 },
 "howToWearItems": [
 {
 "fr": "Sur une chemise de lin blanc, col ouvert, pour réveiller le neutre.",
 "en": "Over a white linen shirt, collar open, to wake the neutral."
 },
 {
 "fr": "À même la peau, l'été, sous un décolleté qui ne couvre rien.",
 "en": "Against bare skin in summer, under a neckline that covers nothing."
 },
 {
 "fr": "Sur du bleu ou de l'olive, pour le contraste qui décroche un sourire.",
 "en": "On blue or olive, for the contrast that pulls a smile."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Que le citron soit la seule couleur ; tout le reste se tait.",
 "en": "Let the lemon be the only colour; the rest stays quiet."
 },
 "howToWearNote": {
 "fr": "Au crochet, la teinte et le grain glissent un peu d'une tranche à la suivante.",
 "en": "At the hook, the shade and grain slip a little from one slice to the next."
 }
 },
 {
 "handle": "orange-slice-raffia-necklace-ss26",
"making": {
 "fr": "Chaque rondelle est crochetée quartier après quartier dans un raffia teint main, jusqu'à ce que le rond se ferme, puis nouée sur le cordon en cuir.",
 "en": "Each round is crocheted segment after segment in hand-dyed raffia, until the round closes, then knotted onto the leather cord.",
 "es": "Cada redondo se teje a crochet gajo tras gajo en rafia teñida a mano, hasta que el redondo se cierra, y luego se anuda al cordón de cuero.",
 "tr": "Her daire, elde boyanmış rafyada dilim dilim tığla örülür, daire kapanana dek, sonra deri korda düğümlenir.",
 "ar": "كل دائرة تُكرّش فلقةً بعد فلقة من رافيا مصبوغة يدوياً، حتى تُغلَق الدائرة، ثم تُعقد على السير الجلدي."
},
 "short": {
  "fr": "Une tranche d'orange au crochet de raffia teint main, quartier après quartier - un rond chaud au cou.",
  "en": "An orange slice crocheted in hand-dyed raffia, segment after segment - a warm round at the neck.",
  "es": "Una rodaja de naranja a crochet en rafia teñida a mano, gajo tras gajo - un redondo cálido en el cuello.",
  "tr": "Elde boyanmış rafyadan tığla örülmüş bir portakal dilimi, dilim dilim - boyunda sıcak bir daire.",
  "ar": "شريحة برتقال مكرّوشيه من رافيا مصبوغة يدوياً، فلقةً بعد فلقة - دائرة دافئة عند العنق."
 },
 "desc": {
  "fr": "Une rondelle d'orange montée quartier après quartier au crochet, dans un raffia teint main, nouée sur un cordon en cuir avec sa boucle. À Guéliz, les femmes la construisent un quartier à la fois, jusqu'à ce que le rond se ferme. Contre la peau ou sur un col de lin, elle porte la chaleur du jus pressé à l'angle de la place, sans en faire trop.",
  "en": "An orange round built segment after segment at the hook, in hand-dyed raffia, knotted on a leather cord with its clasp. In Guéliz the women raise it one wedge at a time, until the round closes. Against the skin or on a linen collar, it carries the warmth of juice pressed at the corner of the square, without overdoing it.",
  "es": "Un redondo de naranja montado gajo tras gajo a crochet, en rafia teñida a mano, anudado en un cordón de cuero con su cierre. En Guéliz las mujeres lo levantan un gajo cada vez, hasta que el redondo se cierra. Contra la piel o sobre un cuello de lino, lleva el calor del zumo exprimido en la esquina de la plaza, sin exagerar.",
  "tr": "Elde boyanmış rafyadan, dilim dilim tığla örülmüş bir portakal dairesi, tokalı deri bir korda düğümlenmiş. Guéliz'de kadınlar onu her seferinde bir dilim yükseltir, ta ki daire kapanana dek. Tenin üstünde ya da keten bir yakada, meydanın köşesinde sıkılan suyun sıcaklığını taşır, abartmadan.",
  "ar": "دائرة برتقال مبنيّة فلقةً بعد فلقة بالكروشيه، من رافيا مصبوغة يدوياً، معقودة على سير جلدي بمشبكه. في غيليز، تبنيها النساء فلقةً في كل مرة، حتى تُغلَق الدائرة. على البشرة أو على ياقة من الكتّان، تحمل دفء العصير المعصور عند زاوية الساحة، دون مبالغة."
 },
 "material": {
  "fr": "Raffia teint main crocheté sur cordon en cuir, boucle de finition.",
  "en": "Hand-dyed raffia crocheted on a leather cord, finishing clasp.",
  "es": "Rafia teñida a mano tejida a crochet sobre cordón de cuero, cierre de acabado.",
  "tr": "Deri korda tığla örülmüş elde boyanmış rafya, tamamlayıcı toka.",
  "ar": "رافيا مصبوغة يدوياً مكرّوشيه على سير جلدي، مع مشبك تشطيب."
 },
 "fabric": {
  "fr": "Les quartiers se crochètent un à un dans le raffia teint main, jusqu'à ce que le rond se ferme.",
  "en": "The segments are crocheted one by one in hand-dyed raffia, until the round closes.",
  "es": "Los gajos se tejen a crochet uno a uno en rafia teñida a mano, hasta que el redondo se cierra.",
  "tr": "Dilimler, elde boyanmış rafyada tek tek tığla örülür, daire kapanana dek.",
  "ar": "الفلقات تُكرّش واحدةً واحدة من رافيا مصبوغة يدوياً، حتى تُغلَق الدائرة."
 },
 "handworkTime": {
  "fr": "Crochetée dans un raffia teint main puis nouée sur le cordon en cuir, pièce par pièce.",
  "en": "Crocheted in hand-dyed raffia then knotted onto the leather cord, piece by piece.",
  "es": "Tejida a crochet en rafia teñida a mano y luego anudada al cordón de cuero, pieza por pieza.",
  "tr": "Elde boyanmış rafyada tığla örülür, sonra deri korda tek tek düğümlenir.",
  "ar": "تُكرّش من رافيا مصبوغة يدوياً ثم تُعقد على السير الجلدي، قطعةً قطعة."
 },
 "dimensions": {
 "fr": "Un petit bijou textile, léger - bien posé contre la peau ou un col de lin.",
 "en": "A small textile-jewel, light - set against the skin or a linen collar."
 },
 "edition": {
 "fr": "Une poignée de pièces, crochetées main ; aucun rond ne se ferme tout à fait pareil.",
 "en": "A handful of pieces, crocheted by hand; no round closes quite the same."
 },
 "fruitStoryTitle": {
 "fr": "Le jus pressé à l'angle de la place",
 "en": "Juice pressed at the corner of the square"
 },
 "fruitStoryBody": {
  "fr": "L'après-midi, l'orange devient le jus pressé au coin de la place, l'odeur sucrée dans l'air chaud. On a gardé la rondelle entière, crochetée quartier après quartier dans un raffia teint main.",
  "en": "In the afternoon the orange becomes the juice pressed at the corner of the square, the sweet scent in the warm air. We kept the whole round, crocheted segment after segment in hand-dyed raffia.",
  "es": "Por la tarde, la naranja se vuelve el zumo exprimido en la esquina de la plaza, el olor dulce en el aire cálido. Conservamos el redondo entero, tejido a crochet gajo tras gajo en rafia teñida a mano.",
  "tr": "Öğleden sonra portakal, meydanın köşesinde sıkılan suya dönüşür; sıcak havada tatlı kokuya. Bütün daireyi koruduk, elde boyanmış rafyada dilim dilim örülmüş.",
  "ar": "بعد الظهر، يصير البرتقال العصير المعصور عند زاوية الساحة، والرائحة الحلوة في الهواء الدافئ. احتفظنا بالدائرة كاملة، مكرّوشيه فلقةً بعد فلقة من رافيا مصبوغة يدوياً."
 },
 "howToWearTitle": {
 "fr": "Comment la porter",
 "en": "How to wear it"
 },
 "howToWearIntro": {
 "fr": "Un rond chaud, à porter dans la même famille de tons.",
 "en": "A warm round, best worn in its own family of tones."
 },
 "howToWearItems": [
 {
 "fr": "Avec du lin terracotta ou sable, ton sur ton.",
 "en": "With terracotta or sand linen, tone on tone."
 },
 {
 "fr": "Sur un haut blanc, quand une seule couleur suffit.",
 "en": "Over a white top, when one colour is enough."
 },
 {
 "fr": "À même la peau hâlée, l'été, sous un décolleté ouvert.",
 "en": "Against tanned skin in summer, under an open neckline."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Restez dans les matières du marché : lin, coton, raffia, rien de brillant.",
 "en": "Stay in market materials: linen, cotton, raffia, nothing shiny."
 },
 "howToWearNote": {
 "fr": "Au crochet, la couleur et le galbe du rond bougent un peu d'une pièce à l'autre.",
 "en": "At the hook, the colour and curve of the round shift a little from one piece to the next."
 }
 },
 {
 "handle": "watermelon-slice-raffia-necklace-ss26",
"making": {
 "fr": "Chaque part est crochetée par bandes dans un raffia teint main - rose, liseré clair, vert - du cœur à l'écorce, puis nouée sur le cordon en cuir.",
 "en": "Each wedge is crocheted in bands in hand-dyed raffia - pink, pale line, green - from heart to rind, then knotted onto the leather cord.",
 "es": "Cada tajada se teje a crochet por franjas en rafia teñida a mano - rosa, línea clara, verde - del corazón a la cáscara, y luego se anuda al cordón de cuero.",
 "tr": "Her dilim, elde boyanmış rafyada bantlar hâlinde tığla örülür - pembe, açık çizgi, yeşil - yürekten kabuğa, sonra deri korda düğümlenir.",
 "ar": "كل قطعة تُكرّش على شكل أشرطة من رافيا مصبوغة يدوياً - وردي، خط فاتح، أخضر - من القلب إلى القشرة، ثم تُعقد على السير الجلدي."
},
 "short": {
  "fr": "Une tranche de pastèque au crochet de raffia teint main, du cœur rose à l'écorce verte - au cou.",
  "en": "A watermelon slice crocheted in hand-dyed raffia, from pink heart to green rind - at the neck.",
  "es": "Una tajada de sandía a crochet en rafia teñida a mano, del corazón rosa a la cáscara verde - en el cuello.",
  "tr": "Elde boyanmış rafyadan tığla örülmüş bir karpuz dilimi, pembe yürekten yeşil kabuğa - boyunda.",
  "ar": "شريحة بطّيخ مكرّوشيه من رافيا مصبوغة يدوياً، من القلب الوردي إلى القشرة الخضراء - عند العنق."
 },
 "desc": {
  "fr": "Une part de pastèque crochetée par bandes, dans un raffia teint main : le rose du cœur, le liseré clair, le vert de l'écorce, montée sur un cordon en cuir avec sa boucle. La Fatima la mène couche après couche, dans cet ordre, jusqu'à la pointe. Contre la peau ou sur un col de lin, elle garde un quartier d'été qui se porte aussi en plein hiver.",
  "en": "A wedge of watermelon crocheted in bands, in hand-dyed raffia: the pink heart, the pale line, the green rind, mounted on a leather cord with its clasp. La Fatima carries it layer after layer, in that order, down to the point. Against the skin or on a linen collar, it holds a wedge of summer you can wear in deep winter too.",
  "es": "Una tajada de sandía tejida a crochet por franjas, en rafia teñida a mano: el rosa del corazón, la línea clara, el verde de la cáscara, montada en un cordón de cuero con su cierre. La Fatima la lleva capa a capa, en ese orden, hasta la punta. Contra la piel o sobre un cuello de lino, guarda un trozo de verano que se lleva también en pleno invierno.",
  "tr": "Elde boyanmış rafyadan bantlar hâlinde tığla örülmüş bir karpuz dilimi: yüreğin pembesi, açık çizgi, kabuğun yeşili, tokalı deri bir korda monte edilmiş. La Fatima onu kat kat, bu sırayla, uca kadar örer. Tenin üstünde ya da keten bir yakada, kışın ortasında da taşınabilen bir yaz dilimi tutar.",
  "ar": "قطعة بطّيخ مكرّوشيه على شكل أشرطة، من رافيا مصبوغة يدوياً: وردة القلب، الخط الفاتح، خُضرة القشرة، مركّبة على سير جلدي بمشبكه. تقودها لافاطمة طبقةً بعد طبقة، بهذا الترتيب، حتى الطرف. على البشرة أو على ياقة من الكتّان، تحفظ فلقة صيف تُلبَس حتى في عمق الشتاء."
 },
 "material": {
  "fr": "Raffia teint main crocheté sur cordon en cuir, boucle de finition.",
  "en": "Hand-dyed raffia crocheted on a leather cord, finishing clasp.",
  "es": "Rafia teñida a mano tejida a crochet sobre cordón de cuero, cierre de acabado.",
  "tr": "Deri korda tığla örülmüş elde boyanmış rafya, tamamlayıcı toka.",
  "ar": "رافيا مصبوغة يدوياً مكرّوشيه على سير جلدي، مع مشبك تشطيب."
 },
 "fabric": {
  "fr": "Rose, liseré clair, vert : trois bandes de raffia teint main crochetées dans l'ordre, du cœur à l'écorce.",
  "en": "Pink, pale line, green: three bands of hand-dyed raffia crocheted in order, heart to rind.",
  "es": "Rosa, línea clara, verde: tres franjas de rafia teñida a mano tejidas en orden, del corazón a la cáscara.",
  "tr": "Pembe, açık çizgi, yeşil: elde boyanmış rafyadan üç bant, sırayla örülmüş, yürekten kabuğa.",
  "ar": "وردي، خط فاتح، أخضر: ثلاثة أشرطة من رافيا مصبوغة يدوياً مكرّوشيه بالترتيب، من القلب إلى القشرة."
 },
 "handworkTime": {
  "fr": "Crochetée dans un raffia teint main puis nouée sur le cordon en cuir, pièce par pièce.",
  "en": "Crocheted in hand-dyed raffia then knotted onto the leather cord, piece by piece.",
  "es": "Tejida a crochet en rafia teñida a mano y luego anudada al cordón de cuero, pieza por pieza.",
  "tr": "Elde boyanmış rafyada tığla örülür, sonra deri korda tek tek düğümlenir.",
  "ar": "تُكرّش من رافيا مصبوغة يدوياً ثم تُعقد على السير الجلدي، قطعةً قطعة."
 },
 "dimensions": {
 "fr": "Un petit bijou textile, léger - bien posé contre la peau ou un col de lin.",
 "en": "A small textile-jewel, light - set against the skin or a linen collar."
 },
 "edition": {
 "fr": "Faite en petite quantité, au crochet ; le rose et le vert tombent un peu autrement à chaque part.",
 "en": "Made in small quantity, by crochet; the pink and green fall a little differently each wedge."
 },
 "fruitStoryTitle": {
 "fr": "La part qu'on partage à l'ombre",
 "en": "The wedge shared in the shade"
 },
 "fruitStoryBody": {
  "fr": "Quand le soleil tape fort, on ouvre la pastèque en grandes parts qu'on se passe à l'ombre. On en a gardé une, crochetée du cœur rose à l'écorce dans un raffia teint main, à nouer au cou.",
  "en": "When the sun beats hard, the watermelon is opened into big wedges passed around in the shade. We kept one, crocheted from pink heart to rind in hand-dyed raffia, to knot at the neck.",
  "es": "Cuando el sol aprieta fuerte, se abre la sandía en grandes tajadas que se pasan a la sombra. Guardamos una, tejida a crochet del corazón rosa a la cáscara en rafia teñida a mano, para anudar al cuello.",
  "tr": "Güneş sert vurunca karpuz, gölgede elden ele dolaşan büyük dilimlere açılır. Birini sakladık, elde boyanmış rafyada pembe yürekten kabuğa örülmüş, boyunda düğümlenmek için.",
  "ar": "حين تشتدّ الشمس، يُفتَح البطّيخ إلى فلقات كبيرة تُتَداوَل في الظل. احتفظنا بواحدة، مكرّوشيه من القلب الوردي إلى القشرة من رافيا مصبوغة يدوياً، لتُعقَد عند العنق."
 },
 "howToWearTitle": {
 "fr": "Comment la porter",
 "en": "How to wear it"
 },
 "howToWearIntro": {
 "fr": "Deux couleurs dans une part - laissez-la mener.",
 "en": "Two colours in one wedge - let it lead."
 },
 "howToWearItems": [
 {
 "fr": "Sur du blanc ou de l'écru, pour que rose et vert sortent nets.",
 "en": "Over white or ecru, so pink and green come out clean."
 },
 {
 "fr": "À même la peau, au bord de l'eau, par-dessus un maillot.",
 "en": "Against bare skin, by the water, over a swimsuit."
 },
 {
 "fr": "Sur du jean clair, pour un mélange frais et sans effort.",
 "en": "Over light denim, for a fresh, effortless mix."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Rose et vert font tout : gardez les autres bijoux silencieux.",
 "en": "Pink and green do it all: keep other jewellery silent."
 },
 "howToWearNote": {
 "fr": "Au crochet, les nuances de rose et de vert glissent un peu d'une part à l'autre.",
 "en": "At the hook, the pink and green shades slip a little from one wedge to the next."
 }
 },
 {
 "handle": "grapes-raffia-necklace-ss26",
 "short": {
 "fr": "Une grappe de raisin au crochet, grain à grain - elle bouge avec vous.",
 "en": "A crocheted grape cluster, berry by berry - it moves with you."
 },
 "desc": {
 "fr": "Une grappe dont chaque grain est crocheté à part, puis rassemblé sur un cordon en cuir avec sa boucle. À Guéliz, les femmes en font un grain, puis le suivant, jusqu'à ce que la grappe ait juste le volume qu'il faut. Contre la peau ou sur un col de lin, elle a du volume et balance doucement au pas - deux grappes ne comptent jamais le même nombre de grains.",
 "en": "A cluster whose every berry is crocheted apart, then gathered onto a leather cord with its clasp. In Guéliz the women make one berry, then the next, until the cluster has just the right body. Against the skin or on a linen collar, it has body and sways gently as you walk - no two clusters count the same number of grapes."
 },
 "material": {
 "fr": "Raffia crocheté à la main sur cordon en cuir, boucle de finition.",
 "en": "Hand-crocheted raffia on a leather cord, finishing clasp."
 },
 "fabric": {
 "fr": "Chaque grain naît seul, puis rejoint les autres jusqu'à former la grappe.",
 "en": "Each berry is born alone, then joins the rest until the cluster forms."
 },
 "handworkTime": {
 "fr": "Crochetée puis montée en grappe sur le cordon en cuir, à la main ; comptez jusqu'à six heures.",
 "en": "Crocheted then gathered into a cluster on the cord, by hand; allow up to six hours."
 },
 "dimensions": {
 "fr": "Un petit bijou textile, léger - avec assez de volume pour balancer au pas.",
 "en": "A small textile-jewel, light - with enough body to sway as you walk."
 },
 "edition": {
 "fr": "Petite fournée faite main, au crochet ; aucune grappe ne compte ses grains comme la voisine.",
 "en": "A small hand-made batch, at the hook; no cluster counts its grapes like its neighbour."
 },
 "fruitStoryTitle": {
 "fr": "Lourdes juste avant l'automne",
 "en": "Heavy just before autumn"
 },
 "fruitStoryBody": {
 "fr": "En fin d'été, les grappes pendent aux étals, lourdes et lumineuses, juste avant l'automne. On les a refaites grain par grain pour garder ce poids généreux au creux du cou.",
 "en": "At summer's end the clusters hang on the stalls, heavy and bright, just before autumn. We remade them berry by berry to keep that generous weight at the hollow of the neck."
 },
 "howToWearTitle": {
 "fr": "Comment la porter",
 "en": "How to wear it"
 },
 "howToWearIntro": {
 "fr": "Du volume et du mouvement - donnez-lui de l'air.",
 "en": "Body and movement - give it air."
 },
 "howToWearItems": [
 {
 "fr": "Sur une encolure dégagée, pour que les grains tombent libres.",
 "en": "On an open neckline, so the berries fall free."
 },
 {
 "fr": "Près d'une robe prune ou verte, qui répond à la couleur du raisin.",
 "en": "Near a plum or green dress that answers the grape's colour."
 },
 {
 "fr": "Sur une maille fine, l'automne, contre une matière douce.",
 "en": "Over a fine knit in autumn, against a soft texture."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Qu'elle mène seule : sa rondeur remplit déjà le décolleté.",
 "en": "Let it lead alone: its roundness already fills the neckline."
 },
 "howToWearNote": {
 "fr": "Au crochet, le nombre et la forme des grains changent un peu d'une grappe à l'autre.",
 "en": "At the hook, the number and shape of the berries change a little from one cluster to the next."
 }
 },
 {
 "handle": "cherries-raffia-necklace-ss26",
"making": {
 "fr": "Chaque cerise est façonnée à l'aakad - le tressage main des boutons de caftan - dans un raffia teint main, puis nouée par la tige sur le cordon en cuir.",
 "en": "Each cherry is shaped in aakad - the hand-braiding of caftan buttons - in hand-dyed raffia, then knotted by the stem onto the leather cord.",
 "es": "Cada cereza se moldea en aakad - el trenzado a mano de los botones de caftán - en rafia teñida a mano, y luego se anuda por el tallo en el cordón de cuero.",
 "tr": "Her kiraz, elde boyanmış rafyadan aakad - kaftan düğmelerinin elle örülmesi - tekniğiyle biçimlendirilir, sonra sapından deri korda düğümlenir.",
 "ar": "كل كرزة تُشكَّل بتقنية العقاد - ضفر أزرار القفطان يدوياً - من رافيا مصبوغة يدوياً، ثم تُعقد من الساق على السير الجلدي."
},
 "short": {
  "fr": "Deux cerises au crochet en aakad, reliées par la tige - un rouge espiègle au creux du cou.",
  "en": "Two cherries hand-braided in aakad, joined at the stem - a mischievous red at the hollow of the neck.",
  "es": "Dos cerezas trenzadas a mano en aakad, unidas por el tallo - un rojo travieso en el hueco del cuello.",
  "tr": "Aakad tekniğiyle elde örülmüş iki kiraz, saplarından birleşik - boyun çukurunda muzip bir kırmızı.",
  "ar": "كرزتان مضفورتان يدوياً بتقنية العقاد، متّصلتان بالساق - أحمر مرِح عند منحنى العنق."
 },
 "desc": {
  "fr": "Deux boules de raffia teint main, rouge cerise, travaillées à l'aakad - le tressage à la main des boutons de caftan, façonné en cerise, hérité de Sefrou et inscrit au dossier UNESCO du caftan (2025). La Fatima fait l'une, puis l'autre, et les noue par la tige sur un cordon en cuir avec sa boucle - alors la paire n'est jamais tout à fait jumelle. Contre la peau ou sur un col de lin, c'est le rouge espiègle qui décroche un sourire, n'importe quel jour.",
  "en": "Two spheres of hand-dyed cherry-red raffia, worked in aakad - the hand-braiding of caftan buttons, shaped into a cherry, handed down from Sefrou and listed in the UNESCO caftan file (2025). La Fatima makes one, then the other, and knots them by the stem onto a leather cord with its clasp - so the pair is never quite twin. Against the skin or on a linen collar, it is the mischievous red that pulls a smile, any day.",
  "es": "Dos esferas de rafia teñida a mano, rojo cereza, trabajadas en aakad - el trenzado a mano de los botones de caftán, moldeado en cereza, heredado de Sefrou e inscrito en el expediente UNESCO del caftán (2025). La Fatima hace una, luego la otra, y las anuda por el tallo en un cordón de cuero con su cierre - así el par nunca es del todo gemelo. Contra la piel o sobre un cuello de lino, es el rojo travieso el que arranca una sonrisa, cualquier día.",
  "tr": "Elde boyanmış kiraz kırmızısı rafyadan iki küre, aakad tekniğiyle işlenmiş - kaftan düğmelerinin elle örülmesi, kiraz biçiminde, Sefrou'dan miras kalan ve UNESCO kaftan dosyasına (2025) kaydedilen bir teknik. La Fatima önce birini, sonra ötekini örer ve tokalı deri bir korda saplarından düğümler - böylece çift hiçbir zaman tam ikiz olmaz. Tenin üstünde ya da keten bir yakada, herhangi bir gün bir gülümseme koparan o muzip kırmızıdır.",
  "ar": "كرتان من الرافيا المصبوغة يدوياً بلون الكرز الأحمر، مشغولتان بتقنية العقاد - ضفر أزرار القفطان يدوياً على هيئة كرزة، موروث من صفرو ومُدرَج في ملف القفطان لدى اليونسكو (2025). تصنع لافاطمة واحدةً ثم الأخرى، وتعقدهما من الساق على سير جلدي بمشبكه - فلا يكون الزوج توأماً تماماً أبداً. على البشرة أو على ياقة من الكتّان، هو الأحمر المرِح الذي ينتزع ابتسامة، في أي يوم."
 },
 "material": {
  "fr": "Raffia teint main, travaillé à l'aakad, sur cordon en cuir, boucle de finition.",
  "en": "Hand-dyed raffia worked in aakad, on a leather cord, finishing clasp.",
  "es": "Rafia teñida a mano, trabajada en aakad, sobre cordón de cuero, cierre de acabado.",
  "tr": "Aakad tekniğiyle işlenmiş elde boyanmış rafya, deri korda, tamamlayıcı toka.",
  "ar": "رافيا مصبوغة يدوياً ومشغولة بالعقاد، على سير جلدي، مع مشبك تشطيب."
 },
 "fabric": {
  "fr": "Chaque cerise se tresse en rond à l'aakad, puis se noue à sa tige.",
  "en": "Each cherry is braided in the round in aakad, then knotted to its stem.",
  "es": "Cada cereza se trenza en redondo en aakad, y luego se anuda a su tallo.",
  "tr": "Her kiraz aakad tekniğiyle daire biçiminde örülür, sonra sapına düğümlenir.",
  "ar": "كل كرزة تُضفَر دائرياً بالعقاد، ثم تُعقد بساقها."
 },
 "handworkTime": {
  "fr": "Tressées à l'aakad puis nouées sur le cordon en cuir, pièce par pièce, à la main.",
  "en": "Braided in aakad then knotted onto the leather cord, piece by piece, by hand.",
  "es": "Trenzadas en aakad y luego anudadas al cordón de cuero, pieza por pieza, a mano.",
  "tr": "Aakad tekniğiyle örülür, sonra deri korda tek tek elle düğümlenir.",
  "ar": "تُضفَر بالعقاد ثم تُعقد على السير الجلدي، قطعةً قطعة، يدوياً."
 },
 "dimensions": {
 "fr": "Un petit bijou textile, léger - bien posé contre la peau ou un col de lin.",
 "en": "A small textile-jewel, light - set against the skin or a linen collar."
 },
 "edition": {
 "fr": "Crochetée en petit nombre, à Guéliz ; les deux cerises ne sont jamais jumelles.",
 "en": "Crocheted in small numbers, in Guéliz; the two cherries are never twins."
 },
 "fruitStoryTitle": {
 "fr": "Les premières du printemps",
 "en": "The first of spring"
 },
 "fruitStoryBody": {
  "fr": "Au printemps, les cerises arrivent les premières, vendues en petits tas brillants qui font tourner la tête. On les a refaites par paire, à l'aakad, pour garder ce rouge espiègle au creux du cou.",
  "en": "In spring, cherries arrive first, sold in little shining heaps that turn your head. We remade them in pairs, in aakad, to keep that mischievous red at the hollow of the neck.",
  "es": "En primavera, las cerezas llegan las primeras, vendidas en pequeños montones brillantes que hacen girar la cabeza. Las rehicimos por pares, en aakad, para conservar ese rojo travieso en el hueco del cuello.",
  "tr": "İlkbaharda kirazlar ilk gelir, başını döndüren küçük parlak yığınlar hâlinde satılır. Boyun çukurundaki o muzip kırmızıyı korumak için onları aakad tekniğiyle çift çift yeniden yaptık.",
  "ar": "في الربيع، تصل الكرزات أولاً، تُباع في أكوام صغيرة لامعة تُدير الرأس. أعدنا صنعها أزواجاً، بالعقاد، لنحتفظ بذلك الأحمر المرِح عند منحنى العنق."
 },
 "howToWearTitle": {
 "fr": "Comment les porter",
 "en": "How to wear them"
 },
 "howToWearIntro": {
 "fr": "Un rouge joueur - laissez-le donner le ton.",
 "en": "A playful red - let it set the tone."
 },
 "howToWearItems": [
 {
 "fr": "Sur du blanc ou des rayures, pour le côté léger et rétro.",
 "en": "Over white or stripes, for a light, retro feel."
 },
 {
 "fr": "À même la peau, sur une robe noire toute nue, pour le contraste net.",
 "en": "Against bare skin, over a plain black dress, for a clean contrast."
 },
 {
 "fr": "Sur du jean, le week-end, quand rien n'est sérieux.",
 "en": "Over denim on the weekend, when nothing is serious."
 }
 ],
 "howToWearStyleTip": {
 "fr": "Une seule couleur forte : que les cerises soient l'accent, rien d'autre.",
 "en": "One strong colour: let the cherries be the accent, nothing else."
 },
 "howToWearNote": {
 "fr": "Au crochet, la forme et le rouge des deux cerises diffèrent un peu d'une paire à l'autre.",
 "en": "At the hook, the shape and red of the two cherries differ a little from one pair to the next."
 }
 }
 ]
};
 var FRUIT_COLLECTION = {
 "title": {
 "fr": "Le Fruit Market",
 "en": "The Fruit Market"
 },
 "body": {
 "fr": "Tout un marché crocheté à la main - cerises, citrons, pastèque, tomates, avocats, raisins - né des étals gorgés de soleil de notre quartier de Guéliz. Le raffia est teint par nos soins dans des couleurs emblématiques, puis crocheté fruit par fruit, l'une des techniques les plus délicates. Un charm se clipse au sac, mais aussi à un bijou - et avec les petits anneaux dorés offerts à l'achat des boucles, plusieurs se combinent ou se portent en collier. De véritables cartes postales de Marrakech.",
 "en": "A whole market crocheted by hand - cherries, lemons, watermelon, tomatoes, avocados, grapes - born from the sun-soaked stalls of our Guéliz neighbourhood. We hand-dye the raffia in iconic shades, then crochet it fruit by fruit, one of the most delicate crafts. A charm clips to a bag, but also to a piece of jewellery - and with the little gold rings gifted when you buy the earrings, several combine or wear as a necklace. True postcards from Marrakesh."
 }
};
 var L5x = (typeof L5 === 'function') ? L5 : function (fr, en) { return { fr: fr, en: en, es: en, tr: en, ar: en }; };
 // f() merges PERSONA_COPY (fr/en only) with the existing product field so that
 // our es/tr/ar catalog translations are preserved rather than overwritten with en.
 var f = function (o, prev) {
   if (!o) return null;
   var base = L5x(o.fr, o.en);
   return { fr: base.fr, en: base.en, es: o.es || (prev && prev.es) || base.es, tr: o.tr || (prev && prev.tr) || base.tr, ar: o.ar || (prev && prev.ar) || base.ar };
 };
 Object.keys(PERSONA_COPY).forEach(function (cluster) {
 (PERSONA_COPY[cluster] || []).forEach(function (it) {
 var p = PRODUCT_MAP.get(it.handle);
 if (!p) return;
 if (it.short) { var _s = f(it.short, p.short); p.short = _s; p.displayShort = _s; }
 if (it.desc) p.desc = f(it.desc, p.desc);
 if (it.material) p.material = f(it.material, p.material);
 if (it.fabric) p.fabric = f(it.fabric, p.fabric);
 if (it.handworkTime) p.handworkTime = f(it.handworkTime, p.handworkTime);
 if (it.dimensions) p.dimensions = f(it.dimensions, p.dimensions);
 if (it.edition) { var _e = f(it.edition, p.edition); p.edition = _e; p.batch = _e; }
 if (it.whatFits) p.whatFits = f(it.whatFits, p.whatFits);
 if (it.making) p.making = f(it.making, p.making);
 if (it.modelNote) p.modelNote = f(it.modelNote, p.modelNote);
 if (it.styleTip) p.styleTip = f(it.styleTip, p.styleTip);
 if (it.fruitStoryTitle && it.fruitStoryBody) {
 var _pfs = p.fruitStory || {};
 p.fruitStory = {
 title: f(it.fruitStoryTitle, _pfs.title),
 body: f(it.fruitStoryBody, _pfs.body),
 collectionTitle: f(FRUIT_COLLECTION.title, _pfs.collectionTitle),
 collectionBody: f(FRUIT_COLLECTION.body, _pfs.collectionBody),
 };
 }
 if (it.howToWearTitle && it.howToWearIntro) {
 p.howToWear = {
 title: f(it.howToWearTitle),
 intro: f(it.howToWearIntro),
 items: (it.howToWearItems || []).map(function (x) { return f(x); }),
 styleTip: f(it.howToWearStyleTip),
 note: f(it.howToWearNote),
 };
 }
 });
 });
})();

// Fix charm making.fr: PERSONA_COPY only defines making for cherries; all other
// charms have English in their fr field from the original flat-product data.
PRODUCTS.forEach(function(p) {
 if (p.category === 'charms' && p.making && typeof p.making.fr === 'string' && !/^Chaque/i.test(p.making.fr)) {
 p.making.fr = "Chaque pièce est crochetée à la main dans l'atelier de Guéliz, puis contrôlée avant la pose de l'étiquette YZA.";
 }
});

// Fix earring making.fr: base data is unaccented raw text
PRODUCTS.forEach(function(p) {
 if (p.category === 'earrings' && p.making && typeof p.making.fr === 'string' && p.making.fr.indexOf('Chaque') === -1) {
 p.making.fr = "Chaque bijou est crocheté à la main dans l'atelier de Guéliz, puis monté sur créole dorée avant la pose de l'étiquette YZA.";
 p.making.en = 'Each jewel is hand-crocheted in the Guéliz atelier, then set on a gold-tone hoop before the YZA tag is added.';
 }
});

// Fix necklace making.fr: base data is unaccented raw text
PRODUCTS.forEach(function(p) {
 if (p.category === 'necklaces' && p.making && typeof p.making.fr === 'string' && p.making.fr.indexOf('Chaque') === -1) {
 p.making.fr = "Chaque bijou est crocheté à la main dans l'atelier de Guéliz, puis monté sur cordon en cuir avant la pose de l'étiquette YZA.";
 p.making.en = 'Each jewel is hand-crocheted in the Guéliz atelier, then set on a leather cord before the YZA tag is added.';
 }
});

// La Nouvelle Vague: bagFamilyEyebrow → material listing (was generic "New edition bag")
['la-nouvelle-vague-xs-basket-bag-ss26', 'la-nouvelle-vague-s-basket-bag-ss26', 'la-nouvelle-vague-m-basket-bag-ss26'].forEach(function(h) {
 var p = PRODUCT_MAP.get(h);
 if (!p || !p.bagFamilyEyebrow) return;
 p.bagFamilyEyebrow.fr = 'Feuilles de bananier · Raffia · Perles';
 p.bagFamilyEyebrow.en = 'Banana leaves · Raffia · Beads';
 p.bagFamilyEyebrow.es = 'Banana leaves · Raffia · Beads';
 p.bagFamilyEyebrow.tr = 'Banana leaves · Raffia · Beads';
 p.bagFamilyEyebrow.ar = 'Banana leaves · Raffia · Beads';
});

// Fix earring attachment (ACCROCHE): hoop size "1,5 cm" → "1,5 à 2 cm"
PRODUCTS.forEach(function(p) {
 if (p.attachment && typeof p.attachment.fr === 'string' && p.attachment.fr.indexOf('1,5 cm') !== -1) {
 p.attachment.fr = 'Créole dorée 1,5 à 2 cm.';
 p.attachment.en = 'Gold-tone hoop 1.5 to 2 cm.';
 if (p.attachment.es) p.attachment.es = 'Gold-tone hoop 1.5 to 2 cm.';
 if (p.attachment.tr) p.attachment.tr = 'Gold-tone hoop 1.5 to 2 cm.';
 if (p.attachment.ar) p.attachment.ar = 'Gold-tone hoop 1.5 to 2 cm.';
 }
});

// Bag care: factual rewrite - remove humidity myth + store-filled myth, add sun warning + travel solidity
PRODUCTS.forEach(function(p) {
 if (p.category !== 'bags') return;
 var careFr = 'Dépoussiérer doucement à la brosse sèche. En cas de pluie, sécher à l’air libre : le cuir ou la couleur du raffia peut légèrement ternir, mais le sac reste au top. Éviter le soleil direct prolongé - la fibre peut sécher et les couleurs s’éteindre ou jaunir. Conçu pour voyager : solide et stable pendant des années, sans besoin de le rembourrer pour garder sa forme.';
 var careEn = 'Dust gently with a dry brush. If caught in the rain, air-dry flat: the leather or raffia colour may dull slightly, but the bag stays in great shape. Avoid prolonged direct sun - the fibre can dry out and colours may fade or yellow. Built to travel: solid and shape-retaining for years, no stuffing needed.';
 if (p.handle && p.handle.indexOf('la-sculpture') === 0) {
 careFr += ' Les anses sont montées sur fil de fer : pliez-les, repositionnez-les à volonté.';
 careEn += ' The handles are mounted on wire: bend and reposition them whenever you like.';
 }
 if (!p.care) p.care = {};
 p.care.fr = careFr;
 p.care.en = careEn;
 p.care.es = careEn;
 p.care.tr = careEn;
 p.care.ar = careEn;
});

PRODUCTS.forEach(function(p) {
 if (typeof p.inventory === 'undefined') p.inventory = null;
});

function readInventoryOverrides() {
 try { return JSON.parse(localStorage.getItem('yza_inventory_overrides')) || {}; } catch (err) { return {}; }
}

function writeInventoryOverrides(overrides) {
 try { localStorage.setItem('yza_inventory_overrides', JSON.stringify(overrides || {})); } catch (err) {}
}

function effectiveInventory(handle) {
 var product = getProduct(handle);
 if (!product) return null;
 var base = product.inventory;
 if (base === null || typeof base === 'undefined') return null;
 var overrides = readInventoryOverrides();
 var delta = Number(overrides[handle] || 0);
 return Math.max(0, Number(base) + delta);
}

function inventoryStatus(product) {
 if (!product) return { inventory: null, soldOut: false, almostGone: false };
 var inventory = effectiveInventory(product.handle);
 return {
 inventory: inventory,
 soldOut: inventory === 0,
 almostGone: inventory !== null && inventory > 0 && inventory <= 5,
 };
}

function decrementInventory(items) {
 var overrides = readInventoryOverrides();
 var changed = false;
 (items || []).forEach(function(item) {
 var product = getProduct(item.handle);
 if (!product || product.inventory === null || typeof product.inventory === 'undefined') return;
 var qty = Math.max(1, Number(item.qty) || 1);
 overrides[item.handle] = Number(overrides[item.handle] || 0) - qty;
 changed = true;
 });
 if (changed) writeInventoryOverrides(overrides);
 try {
 var log = JSON.parse(localStorage.getItem('yza_order_log')) || [];
 log.push({ at: new Date().toISOString(), items: (items || []).map(function(i) { return { handle: i.handle, variant: i.variant || '', qty: i.qty || 1 }; }) });
 localStorage.setItem('yza_order_log', JSON.stringify(log.slice(-200)));
 } catch (err) {}
}

// One complement engine for every conversion surface: drawer/checkout cross-sell,
// checkout order bump, post-order add-ons, rails. Pure + derived — same context in,
// same suggestions out. Matrix lives in YZA.promos.complements (category or group keys).
function complementCategoriesFor(contextProducts) {
 var matrix = (YZA.promos && YZA.promos.complements) || {};
 var cats = [];
 var push = function (list) { (list || []).forEach(function (c) { if (cats.indexOf(c) === -1) cats.push(c); }); };
 var hasBag = contextProducts.some(function (p) { return p.category === 'bags'; });
 var allCharms = contextProducts.length > 0 && contextProducts.every(function (p) { return p.category === 'charms'; });
 var hasRtw = contextProducts.some(function (p) { return p.group === 'rtw'; });
 if (hasBag) push(matrix.bags);
 if (allCharms) push(matrix.charms);
 if (hasRtw) push(matrix.rtw);
 contextProducts.forEach(function (p) { push(matrix[p.category]); push(matrix[p.group]); });
 push(matrix.default || ['charms']);
 return cats;
}

function cartSuggestions(contextItems, opts) {
 opts = opts || {};
 var limit = opts.limit || ((YZA.promos && YZA.promos.crossSell && YZA.promos.crossSell.limit) || 2);
 var ctx = (contextItems || []).map(function (i) { return i && i.handle ? getProduct(i.handle) : null; }).filter(Boolean);
 // Exclude what's already in context + every family sibling (never the same bag in another size).
 var excluded = new Set();
 ctx.forEach(function (p) {
  excluded.add(p.handle);
  if (p.familyHandle) PRODUCTS.forEach(function (q) { if (q.familyHandle === p.familyHandle) excluded.add(q.handle); });
 });
 (opts.excludeHandles || []).forEach(function (h) { excluded.add(h); });
 var cats = (opts.categories && opts.categories.length) ? opts.categories : complementCategoriesFor(ctx);
 var ok = function (p) {
  if (!p || excluded.has(p.handle)) return false;
  if (p.publicVisible === false || !isPublicProductImage(p.img)) return false;
  if (p.bundle) return false;                                   // never one-tap a pre-made trio
  if (inventoryStatus(p).soldOut) return false;
  if (opts.maxPriceCents && p.price > opts.maxPriceCents) return false;
  if (opts.categories && opts.categories.length && opts.categories.indexOf(p.category) === -1 && opts.categories.indexOf(p.group) === -1) return false;
  return true;
 };
 var byScarcityThenPrice = function (a, b) {
  var ag = inventoryStatus(a).almostGone ? 0 : 1;
  var bg = inventoryStatus(b).almostGone ? 0 : 1;
  return ag - bg || a.price - b.price;
 };
 var seen = new Set();
 var take = function (list) {
  var out = [];
  list.forEach(function (p) { if (ok(p) && !seen.has(p.handle)) { seen.add(p.handle); out.push(p); } });
  return out.sort(byScarcityThenPrice);
 };
 // Curated crossSell picks first (same priority trick as related()), then matrix fills.
 var seeds = take(ctx.reduce(function (acc, p) { return acc.concat((p.crossSell || []).map(getProduct)); }, []));
 var fills = take(cats.reduce(function (acc, cat) {
  return acc.concat(publicProductList().filter(function (p) { return p.category === cat || p.group === cat; }));
 }, []));
 return seeds.concat(fills).slice(0, limit);
}

// Per-charm finish -> photo, for the PDP finish selector image swap.
// Keys: loop (raffia loop), r2 (2 cm gold ring), r3 (engraved brass tag).
// Every charm has all three: real studio shots where the finish was photographed,
// plus image-to-image variants (assets/products/charms/finish/) generated from the
// charm's own real photo where that finish wasn't shot — same charm, only the loop
// hardware differs. Vision-classified + completed 2026-07-01.
const CHARM_FINISH_IMAGES = {
  'raffia-avocado-half-charm-ss26':    { loop: 'assets/products/charms/client/avocado-half-01.jpg', r2: 'assets/products/charms/finish/avocado-ring.jpg', r3: 'assets/products/charms/client/avocado-half-02.jpg' },
  'raffia-cherries-charm-ss26':        { loop: 'assets/products/charms/finish/cherries-loop.jpg', r2: 'assets/products/charms/finish/cherries-ring.jpg', r3: 'assets/products/charms/client/cherries-01.jpg' },
  'raffia-grapes-charm-ss26':          { loop: 'assets/products/charms/finish/grapes-loop.jpg', r2: 'assets/products/charms/finish/grapes-ring.jpg', r3: 'assets/products/charms/client/grapes-02.jpg' },
  'raffia-kiwi-slice-charm-ss26':      { loop: 'assets/products/charms/finish/kiwi-loop.jpg', r2: 'assets/products/charms/finish/kiwi-ring.jpg', r3: 'assets/products/charms/client/kiwi-slice-01.jpg' },
  'raffia-lemon-slice-charm-ss26':     { loop: 'assets/products/charms/finish/lemon-slice-loop.jpg', r2: 'assets/products/charms/finish/lemon-slice-ring.jpg', r3: 'assets/products/fruit-market/charm-lemon-slice.jpg' },
  'raffia-orange-slice-charm-ss26':    { loop: 'assets/products/charms/client/orange-slice-01.jpg', r2: 'assets/products/charms/finish/orange-slice-ring.jpg', r3: 'assets/products/charms/client/orange-slice-02.jpg' },
  'raffia-whole-lemon-charm-ss26':     { loop: 'assets/products/charms/client/whole-lemon-01.jpg', r2: 'assets/products/charms/finish/whole-lemon-ring.jpg', r3: 'assets/products/charms/client/whole-lemon-02.jpg' },
  'raffia-whole-orange-charm-ss26':    { loop: 'assets/products/fruit-market/charm-whole-orange.jpg', r2: 'assets/products/charms/finish/whole-orange-ring.jpg', r3: 'assets/products/charms/client/whole-orange-01.jpg' },
  'raffia-tomato-charm-ss26':          { loop: 'assets/products/charms/finish/tomato-loop.jpg', r2: 'assets/products/charms/finish/tomato-ring.jpg', r3: 'assets/products/charms/client/tomato-01.jpg' },
  'raffia-watermelon-slice-charm-ss26':{ loop: 'assets/products/charms/finish/watermelon-loop.jpg', r2: 'assets/products/charms/finish/watermelon-ring.jpg', r3: 'assets/products/fruit-market/charm-watermelon-slice.jpg' },
};
YZA.charmFinishImages = CHARM_FINISH_IMAGES;
YZA.products = PRODUCTS;
YZA.bagRows = BAG_ROWS;
YZA.catalogSource = CATALOG_SOURCE;
YZA.variants = VARIANTS;
YZA.assetManifest = ASSET_MANIFEST;
YZA.publicProductImage = isPublicProductImage;
YZA.publicProducts = publicProductList;
YZA.isLaunchPromoProduct = isLaunchPromoProduct;
YZA.launchPromoProducts = launchPromoList;
YZA.byCategory = byCategory;
YZA.categoryInfo = categoryInfo;
YZA.familyMembers = familyMembers;
YZA.familyRepresentative = familyRepresentative;
YZA.getProduct = getProduct;
YZA.bagVariantFor = bagVariantFor;
YZA.related = related;
YZA.searchProducts = searchProducts;
YZA.bundleForProduct = bundleForProduct;
YZA.offerPicks = offerPicks;
YZA.bundles = offerPicks;
YZA.inventoryOverrides = readInventoryOverrides;
YZA.effectiveInventory = effectiveInventory;
YZA.inventoryStatus = inventoryStatus;
YZA.decrementInventory = decrementInventory;
YZA.cartSuggestions = cartSuggestions;
YZA.complementsFor = complementCategoriesFor;

YZA.business = {
 salesSplit: { instagram: 0.3, boutique: 0.7 },
 b2b: { moqBags: 10, terms: 'Wholesale partnerships with chosen stockists; full terms shared on request.' },
 exclusions: ['Bijoux', 'Sacs market'],
};
// ── Product editorial stories — the "Point → Histoire → Objection → Métaphore → Invitation" filter ──
// Validated by Nawal (yza-histoires-produits.docx, juin 2026). FR is verbatim from the doc; EN is
// translated. Rendered as a flowing editorial block on the PDP (renderProduct), keyed by `handle`,
// else `familyHandle`. es/tr/ar intentionally omitted → t.pick() falls back to EN until validated.
YZA.PRODUCT_STORIES = {
 'la-sculpture': {
  point: { fr: 'Avant d’être un sac, c’était du fil de fer.', en: 'Before it was a bag, it was wire.' },
  histoire: { fr: 'À l’intérieur des anses, une âme en fil de fer qu’on façonne à la main avant de la recouvrir de raffia — comme un sculpteur travaille le métal avant d’y poser l’argile. C’est de là que vient le nom. La silhouette vient d’ailleurs : les arches des portes de la médina, et le tracé sinueux des ruelles pour y arriver. Deux anses, jamais tout à fait pareilles.', en: 'Inside the handles, a wire core we shape by hand before wrapping it in raffia — the way a sculptor works the metal before laying on the clay. That’s where the name comes from. The silhouette comes from elsewhere: the arches of the medina’s doorways, and the winding lanes that lead to them. Two handles, never quite the same.' },
  objection: { fr: 'C’est notre pièce la plus végétale : raffia et feuille de bananier, sans une once de cuir. Rien que ce que la terre a donné, façonné à la main.', en: 'It’s our most plant-based piece: raffia and banana leaf, without an ounce of leather. Nothing but what the earth gave, shaped by hand.' },
  metaphore: { fr: 'Ce que la médina chuchote derrière ses portes. À porter au bras.', en: 'What the medina whispers behind its doors. To wear on your arm.' },
  invitation: { fr: '3 tailles, en rouge, noir ou violet. Et à l’intérieur, un pochon Jawhara à pompons de raffia, pour ranger ce qu’on ne veut pas voir.', en: '3 sizes, in red, black or violet. And inside, a Jawhara pouch with raffia pompoms, for the things you’d rather keep out of sight.' },
 },
 'la-nouvelle-vague': {
  point: { fr: 'On a mis du cuir là où personne ne le verrait.', en: 'We put leather where no one would ever see it.' },
  histoire: { fr: 'On voulait que ce sac soit aussi un bijou. L’inspiration vient des perles de rocaille, parfois arrangées en motifs par les artisans africains et nord-africains. Sous chaque perle, on a aussi glissé une bande de cuir — pas pour faire joli, pour qu’on ne la voie jamais. Le détail qu’on a ajouté en pensant à ce qui arrive vraiment à un sac qu’on porte tous les jours : une perle qui se détache, un jour, sans prévenir.', en: 'We wanted this bag to be a jewel too. The inspiration comes from seed beads, sometimes arranged into patterns by African and North African artisans. Under each bead, we also slipped a strip of leather — not to look pretty, but so you’d never see it. A detail we added thinking about what really happens to a bag you carry every day: a bead that comes loose, one day, without warning.' },
  objection: { fr: 'Avec le cuir en dessous, même si une perle venait à manquer, ça ne se verrait pas. On n’a pas pensé ce sac pour le jour où vous l’achetez. On l’a pensé pour les années qui suivent.', en: 'With the leather underneath, even if a bead went missing, it wouldn’t show. We didn’t design this bag for the day you buy it. We designed it for the years that follow.' },
  metaphore: { fr: 'La beauté qu’on voit. La solidité qu’on ne voit pas.', en: 'The beauty you see. The strength you don’t.' },
  invitation: { fr: '3 tailles, 3 couleurs. Et un secret : sous les perles, du cuir. Si l’une d’elles s’en va un jour, le sac ne perd rien — il change juste un peu de visage.', en: '3 sizes, 3 colours. And a secret: leather, under the beads. If one of them leaves one day, the bag loses nothing — it just changes its face a little.' },
 },
 'yza-palazzo-pants-jawhara-ss26': {
  point: { fr: 'Ultra large. Jusqu’à ce qu’on tire le cordon.', en: 'Ultra wide. Until you pull the drawstring.' },
  histoire: { fr: 'Le Palazzo Pants se porte taille haute, jambe XXL — puis tout se resserre d’un geste, grâce au cordon à la taille. C’est presque ludique à faire, regarder un pantalon aussi ample se réajuster en une seconde sur une taille fine. Juste au-dessus du cordon, un petit bout de tissu en trop crée des plis — un effet tulipe, presque accidentel, qu’on aurait pu lisser et qu’on a choisi de garder. Au bout du cordon, deux pampilles perlées dorées, faites main par La Fatima.', en: 'The Palazzo Pants sit high on the waist, XXL leg — then everything cinches in with one gesture, thanks to the drawstring. It’s almost playful to do: watching trousers this wide re-fit to a slim waist in a second. Just above the cord, a little extra fabric gathers into pleats — a tulip effect, almost accidental, that we could have smoothed out and chose to keep. At the end of the cord, two golden beaded tassels, handmade by La Fatima.' },
  objection: { fr: 'Le pantalon arrive très long de base. À la commande, vous précisez votre taille en commentaire, et on l’ourlet sur mesure avant de l’envoyer.', en: 'They arrive very long by default. When you order, you note your height in a comment, and we hem them to measure before shipping.' },
  metaphore: { fr: 'Le pantalon le plus large de l’armoire. Le plus facile à dompter.', en: 'The widest trousers in the wardrobe. The easiest to tame.' },
  invitation: { fr: 'Taille haute, jambe ultra large, des poches qui ne se voient pas. Coupé à votre taille, sur demande.', en: 'High waist, ultra-wide leg, pockets you don’t see. Cut to your height, on request.' },
 },
 'jawhara-pareos': {
  point: { fr: 'Structurée comme une vraie jupe. Facile comme un paréo.', en: 'Structured like a real skirt. Easy like a sarong.' },
  histoire: { fr: 'Les volants au bas font la différence : ce n’est plus juste un tissu noué, c’est une vraie pièce, avec du mouvement, presque dansante à chaque pas. La ceinture, large, ferme le tout taille haute et donne une allure structurée, presque travaillée. Et pourtant elle se met et se défait en quelques secondes, exactement comme un paréo — rien à calculer, rien à redraper. Une fente, presque invisible à l’arrêt, se découvre seulement quand vous marchez.', en: 'The ruffles at the hem make the difference: it’s no longer just knotted fabric, it’s a real piece, with movement, almost dancing with every step. The wide belt closes it high on the waist and gives a structured, almost tailored line. And yet it goes on and off in seconds, exactly like a sarong — nothing to calculate, nothing to re-drape. A slit, almost invisible when you stand still, reveals itself only when you walk.' },
  objection: { fr: 'Elle va à toutes les tailles. Et malgré son allure construite, elle s’enfile aussi vite qu’un paréo de plage.', en: 'It fits every size. And despite its constructed look, it slips on as fast as a beach sarong.' },
  metaphore: { fr: 'La structure d’une jupe. La liberté d’un paréo.', en: 'The structure of a skirt. The freedom of a sarong.' },
  invitation: { fr: '3 longueurs, comme 3 humeurs : courte et spontanée, mi-longue et posée, ou extra-longue pour les soirs où vous voulez du talon. Ceinture brodée ou perlée d’un signe amazigh, faite main par La Fatima.', en: '3 lengths, like 3 moods: short and spontaneous, midi and composed, or extra-long for the evenings you want heels. Belt embroidered or beaded with an Amazigh sign, handmade by La Fatima.' },
 },
 'yza-wrap-pants-jawhara-ss26': {
  point: { fr: 'Un classique de garde-robe no size. Version ultra chic.', en: 'A no-size wardrobe classic. Ultra-chic version.' },
  histoire: { fr: 'Le wrap pants, c’est THE basique de toute garde-robe no size — on le retrouve partout, dans toutes les matières, à tous les prix. On a osé le réhabiliter, et on a osé y poser notre Jawhara. Le résultat a dépassé ce qu’on imaginait. À l’arrière, un cordon fin qui garde une coupe plate, nette. Devant, la ceinture plus épaisse se noue joliment et porte la signature : broderie ton sur ton ou perlage d’un signe amazigh, fait main par La Fatima.', en: 'The wrap pants are THE basic of every no-size wardrobe — you find them everywhere, in every fabric, at every price. We dared to rehabilitate them, and dared to put our Jawhara on them. The result went beyond what we imagined. At the back, a fine cord that keeps a flat, clean cut. At the front, the thicker belt ties beautifully and carries the signature: tone-on-tone embroidery or the beading of an Amazigh sign, handmade by La Fatima.' },
  objection: { fr: 'Wrap pants, mais jamais générique : en Jawhara, avec une signature qu’on ne voit que de près.', en: 'Wrap pants, but never generic: in Jawhara, with a signature you only see up close.' },
  metaphore: { fr: 'Un basique que tout le monde connaît. Devenu une pièce que personne n’a.', en: 'A basic everyone knows. Turned into a piece no one has.' },
  invitation: { fr: 'No size, du XS au XXL. Se ferme devant, se noue derrière, va avec n’importe quel haut de la collection.', en: 'No size, from XS to XXL. Closes at the front, ties at the back, goes with any top in the collection.' },
 },
 'yza-bateau-top-jawhara-ss26': {
  point: { fr: 'Un top passe-partout. Ouvert, léger, parfait pour l’été.', en: 'A go-anywhere top. Open, light, perfect for summer.' },
  histoire: { fr: 'Il s’ouvre sur les côtés, se noue par petits nœuds — on peut le porter avec rien en dessous si on le veut, ou sur un bralette, à la plage le jour, avec un jean blanc le soir. C’est le genre de top qu’on met sans réfléchir et qu’on ne quitte plus.', en: 'It opens at the sides, ties with little knots — you can wear it with nothing underneath if you like, or over a bralette, at the beach by day, with white jeans at night. It’s the kind of top you throw on without thinking and never take off.' },
  objection: { fr: 'Les nœuds sur les côtés ajustent la coupe — serré ou flottant, c’est vous qui décidez.', en: 'The knots at the sides adjust the fit — tight or loose, you decide.' },
  metaphore: { fr: 'Le top qu’on attrape sans se poser de question.', en: 'The top you grab without a second thought.' },
  invitation: { fr: 'No size. Se porte sans se prendre la tête — avec n’importe quel bas, YZA ou pas.', en: 'No size. Wears with no fuss — with any bottom, YZA or not.' },
 },
 'yza-button-up-shirt-jawhara-ss26': {
  point: { fr: 'Un classique indémodable. Version YZA.', en: 'A timeless classic. The YZA version.' },
  histoire: { fr: 'Boutonnée en nacre, avec une petite broderie ou un perlage de signe amazigh sur le col, fait main par La Fatima. Elle se porte ouverte sur un maillot, fermée seule, ou tuckée dans la jupe paréo. Et pour celles qui veulent une coupe parfaite — c’est la seule pièce de la collection qui a une vraie taille.', en: 'Buttoned in mother-of-pearl, with a little embroidery or beading of an Amazigh sign on the collar, handmade by La Fatima. Wear it open over a swimsuit, closed on its own, or tucked into the pareo skirt. And for those who want a perfect fit — it’s the only piece in the collection with a real size.' },
  objection: { fr: 'En Jawhara, boutons nacre, signature amazigh sur le col — pas vraiment une chemise qu’on a déjà vue.', en: 'In Jawhara, mother-of-pearl buttons, an Amazigh signature on the collar — not exactly a shirt you’ve seen before.' },
  metaphore: { fr: 'Une chemise occidentale. Réinventée à Marrakech.', en: 'A Western shirt. Reinvented in Marrakech.' },
  invitation: { fr: 'À porter seule sur un maillot, ou tuckée dans notre jupe paréo. En S, M ou L.', en: 'To wear alone over a swimsuit, or tucked into our pareo skirt. In S, M or L.' },
 },
 // ⚠ Mapping assumption: the "scarf top" (halter, tied at the back) = Nawal’s "Top Foulard". Confirm.
 'yza-scarf-top-jawhara-ss26': {
  point: { fr: 'Un top sexy. Dos nu, noué dans le dos.', en: 'A sexy top. Bare back, tied behind.' },
  histoire: { fr: 'Il ressemble à un foulard — et c’est exactement l’idée. Il se noue dans le dos façon halter top, dos nu, avec une ouverture latérale qui dévoile juste ce qu’il faut. Au bout du cordon, des pampilles perlées dorées faites main par La Fatima.', en: 'It looks like a scarf — and that’s exactly the idea. It ties behind the neck like a halter top, bare back, with a side opening that reveals just enough. At the end of the cord, golden beaded tassels handmade by La Fatima.' },
  objection: { fr: 'Le cordon ajuste la hauteur et le serrage — le même top peut donner plusieurs silhouettes différentes selon comment vous le nouez.', en: 'The cord adjusts the height and the tightness — the same top can give several different silhouettes depending on how you tie it.' },
  metaphore: { fr: 'On a toutes essayé de nouer un foulard en top. On a juste décidé de le faire bien.', en: 'We’ve all tried to knot a scarf into a top. We just decided to do it properly.' },
  invitation: { fr: 'No size. En halter top la journée, en bustier le soir, noué sur les hanches à la plage.', en: 'No size. As a halter top by day, a bustier by night, tied on the hips at the beach.' },
 },
};

// Collection-level stories (rendered on the collection page header). rtw stacks the manifesto + the fabric story.
YZA.CATEGORY_STORIES = {
 charms: [{
  point: { fr: 'J’ai toujours trouvé les étals de fruits marocains magnifiques. J’ai voulu en porter un bout.', en: 'I’ve always found Moroccan fruit stalls beautiful. I wanted to wear a piece of one.' },
  histoire: { fr: 'Les étals de Marrakech, ceux de la médina comme ceux des camionnettes au coin de la rue — j’ai toujours trouvé ça beau, ça me rappelle mon père, qui adorait les fruits et s’arrêtait toujours devant. On a commencé en laine, puis on est passées au raffia : la matière la plus dure à crocheter, elle casse au moindre faux geste — mais une fois la pièce finie, elle ne bouge plus. Pour les grappes et les cerises, on utilise l’aakad, la technique des boutons de caftan, qui s’inspire elle-même de la forme d’une cerise, et vient d’une ville, Sefrou, qui célèbre la cerise chaque année.', en: 'The stalls of Marrakech, the ones in the medina and the ones on the street-corner trucks — I’ve always found them beautiful; they remind me of my father, who loved fruit and always stopped in front of them. We started in wool, then moved to raffia: the hardest material to crochet, it snaps at the slightest wrong move — but once the piece is finished, it never budges again. For the grapes and cherries, we use the aakad, the caftan-button technique, which itself takes its shape from a cherry, and comes from a town, Sefrou, that celebrates the cherry every year.' },
  objection: { fr: 'Ce n’est pas figé à un seul usage. Un charm se clipse au sac, mais aussi à un bijou — et avec les petits anneaux dorés offerts à l’achat des boucles, plusieurs charms se combinent ou se portent en collier.', en: 'It isn’t locked to a single use. A charm clips to a bag, but also to a piece of jewellery — and with the little gold rings offered when you buy the earrings, several charms combine or wear as a necklace.' },
  metaphore: { fr: 'Une carte postale de Marrakech. En format poche.', en: 'A postcard from Marrakech. Pocket-sized.' },
  invitation: { fr: 'Cerises, raisins, citrons, oranges, pastèque, avocat. Choisissez votre fruit — ou collectionnez-les tous.', en: 'Cherries, grapes, lemons, oranges, watermelon, avocado. Choose your fruit — or collect them all.' },
 }],
 rtw: [{
  point: { fr: 'Des vêtements pour votre corps. Mais aussi celui de vos sœurs et vos copines — pour n’importe quelle phase de vos vies.', en: 'Clothes for your body. But also your sisters’ and your friends’ — for any phase of your lives.' },
  histoire: { fr: 'J’ai trois sœurs. On s’est toujours échangé nos vêtements — en voyage, pour une soirée, sans y penser. C’est une garde-robe de vacances : du beach club l’après-midi à l’hôtel chic le soir, sans repasser par la chambre. Le no size, ce n’est pas qu’une question de production. C’est pour que la pièce vous suive. Chaque pièce est aussi pensée en duo, un haut et un bas, et n’importe quel haut va avec n’importe quel bas.', en: 'I have three sisters. We’ve always swapped our clothes — travelling, for an evening, without thinking about it. This is a holiday wardrobe: from the beach club in the afternoon to the chic hotel at night, without a stop back at the room. No size isn’t just a production question. It’s so the piece follows you. Each piece is also designed as a duo, a top and a bottom, and any top goes with any bottom.' },
  objection: { fr: 'On imagine souvent le no size large et flou, façon saroual hippie. Ici, chaque pièce se resserre — cordon, ceinture, nœud — pour épouser votre silhouette, pas la noyer. Et elle s’ajuste aussi à votre corps qui change : ballonnée, enceinte, ou simplement un autre jour. Demain, c’est peut-être votre sœur qui la porte.', en: 'People often picture no size as loose and shapeless, hippie-harem style. Here, each piece cinches — cord, belt, knot — to hug your shape, not drown it. And it adjusts to a body that changes: bloated, pregnant, or simply another day. Tomorrow, maybe it’s your sister wearing it.' },
  metaphore: { fr: 'Un vêtement à partager. À porter toute une vie.', en: 'A garment to share. To wear a whole life.' },
  invitation: { fr: 'No size, du XS au XXL. Un haut, un bas, dix couleurs à mélanger. À vous d’inventer la suite.', en: 'No size, from XS to XXL. A top, a bottom, ten colours to mix. The rest is yours to invent.' },
 }, {
  point: { fr: 'Précieux. Jamais too much.', en: 'Precious. Never too much.' },
  histoire: { fr: 'Le Jawhara traditionnel se tisse à la main, en soie, pour le formalwear le plus précieux — celui qu’on porte une fois, qu’on range, qu’on protège. Le nôtre est en soie et viscose, avec un fil lurex discret qui se fond dans la couleur plutôt que de briller fort. Pas de broderie chargée, pas un tissu qui annonce qu’il est précieux. C’est du resort wear : on le porte en vacances, du beach club l’après-midi à un dîner d’hôtel chic le soir, sans jamais changer de tenue.', en: 'Traditional Jawhara is woven by hand, in silk, for the most precious formalwear — the kind you wear once, put away, protect. Ours is in silk and viscose, with a discreet lurex thread that melts into the colour rather than shining loud. No heavy embroidery, no fabric that announces it’s precious. This is resort wear: you wear it on holiday, from the beach club in the afternoon to a chic hotel dinner at night, without ever changing your outfit.' },
  objection: { fr: 'On pense souvent ne pas savoir où le porter, ou qu’un tissu aussi beau doit se protéger comme un trésor. Les deux sont faux. Il rehausse une tenue casual l’après-midi, complète une tenue chic le soir — et il se lave en machine, résiste au fer, ne se froisse presque pas. Un tissu noble qui ne vous demande rien en retour.', en: 'People often think they won’t know where to wear it, or that a fabric this beautiful must be protected like a treasure. Both are false. It lifts a casual look in the afternoon, completes a chic look at night — and it machine-washes, takes an iron, barely creases. A noble fabric that asks nothing of you in return.' },
  metaphore: { fr: 'Un tissu de caftan, habitué à attendre une seule occasion. Le nôtre est fait pour toutes.', en: 'A caftan fabric, used to waiting for a single occasion. Ours is made for all of them.' },
  invitation: { fr: '10 couleurs, chacune avec son nom et son fil signature — doré ou argenté, toujours discret.', en: '10 colours, each with its name and its signature thread — gold or silver, always discreet.' },
 }],
};

// Validated stories with no product on the site yet (La Vague = sur commande; Top Bandeau & the square
// Foulard aren’t in the catalogue). Kept ready to attach the day a product/page exists.
YZA.PARKED_STORIES = {
 'la-vague': {
  point: { fr: 'Mon premier sac avait un défaut. Je n’ai jamais voulu le corriger.', en: 'My first bag had a flaw. I never wanted to fix it.' },
  histoire: { fr: 'Un panier en paille traditionnel, tressé en spirale à la main, en doum blanc de Marrakech — pas le doum qu’on trouve partout dans les montagnes, mais une feuille de palmier dattier qu’on va chercher en grimpant à la corde, qu’on trie, qu’on fait sécher au soleil. Quand on referme la boucle en haut du panier, la spirale ne se ferme jamais parfaitement à plat. Il reste un petit décalage. Une vague.', en: 'A traditional straw basket, coiled by hand in a spiral, in white Marrakech doum — not the doum you find all over the mountains, but a date-palm leaf you climb by rope to reach, sort, and dry in the sun. When you close the loop at the top of the basket, the spiral never quite lies flat. A small offset remains. A wave.' },
  objection: { fr: 'Ce n’est pas de la paille ramassée au hasard. C’est une feuille qu’il a fallu retirer pour que l’arbre continue de pousser, choisie parmi les plus belles, séchée, puis tressée à la main avec un cuir qui, lui aussi, n’a rien d’industriel — un sous-produit réel de ce qu’on consomme déjà, pas une matière qu’on a fait naître pour l’occasion.', en: 'This isn’t straw gathered at random. It’s a leaf that had to be removed for the tree to keep growing, chosen among the finest, dried, then woven by hand with a leather that, too, is nothing industrial — a real by-product of what we already consume, not a material born for the occasion.' },
  metaphore: { fr: 'Un accident de tressage. Devenu un choix de design.', en: 'A weaving accident. Turned into a design choice.' },
  invitation: { fr: 'Sur commande, environ 3 semaines. Choisissez la taille, on choisit ensemble la couleur.', en: 'Made to order, about 3 weeks. Choose the size; we choose the colour together.' },
 },
 'top-bandeau': {
  point: { fr: 'Sexy et confortable. Le petit dernier de la collection.', en: 'Sexy and comfortable. The latest addition to the collection.' },
  histoire: { fr: 'Une brassière en Jawhara, ajustable à l’avant. Le cordon passe derrière la nuque — et au bout, les pampilles perlées dorées faites main par La Fatima. On peut le porter de plusieurs façons, on vous montrera.', en: 'A Jawhara bandeau, adjustable at the front. The cord passes behind the neck — and at its end, the golden beaded tassels handmade by La Fatima. It can be worn several ways; we’ll show you.' },
  objection: { fr: 'Deux tailles, ajustable à l’avant — il épouse sans contraindre.', en: 'Two sizes, adjustable at the front — it hugs without constraining.' },
  metaphore: { fr: 'Une brassière qui ne fait pas de compromis.', en: 'A bandeau that makes no compromise.' },
  invitation: { fr: 'En 2 tailles. Le soir, à la plage, ou partout où vous voulez qu’on vous remarque.', en: 'In 2 sizes. In the evening, at the beach, or anywhere you want to be noticed.' },
 },
 'foulard-carre': {
  point: { fr: 'Juste un carré de Jawhara. Mais pas que.', en: 'Just a square of Jawhara. But not only.' },
  histoire: { fr: '90×90cm de Jawhara. Pas de couture compliquée, pas de construction — juste le tissu, dans toute sa beauté. En top noué, en foulard dans les cheveux, sur les hanches, autour du cou. Ce qu’il devient dépend de vous.', en: '90×90cm of Jawhara. No complicated seam, no construction — just the fabric, in all its beauty. As a knotted top, a scarf in your hair, on your hips, around your neck. What it becomes depends on you.' },
  objection: { fr: 'Pas une pièce à usage unique — un carré de Jawhara qu’on porte avec tout, qu’on réinvente à chaque fois, et qu’on ne se lasse pas.', en: 'Not a single-use piece — a square of Jawhara you wear with everything, reinvent every time, and never tire of.' },
  metaphore: { fr: 'Un carré de tissu. Autant de vies que vous lui donnez.', en: 'A square of fabric. As many lives as you give it.' },
  invitation: { fr: 'À nouer, draper, porter comme vous voulez. Il n’y a pas de mauvaise façon.', en: 'To knot, drape, wear however you like. There’s no wrong way.' },
 },
};

// ---- Conversion knobs (single edit point — every tactic reads from here) ----
YZA.promos = {
 // Legacy exit-modal config (modal itself disabled per owner request). minDh is in CENTIMES (150000 = 1500 DH).
 exitRecovery: { code: 'YZA20', percent: 20, minEuro: 150, minDh: 150000 },
 // Volume reward on charms — GENTLE on purpose (YZA is repricing upward, see market study).
 // Realized discount always displayed as absolute DH, computed once in YZA.cart.pricing().
 charmTiers: { enabled: true, category: 'charms', tiers: [{ min: 2, pct: 5 }, { min: 3, pct: 10 }] },
 crossSell: { enabled: true, limit: 2 },                                  // drawer + checkout "Complétez votre pièce"
 orderBump: { enabled: true, maxPriceCents: 25000, category: 'charms' },  // checkout payment-step one-tap add
 postOrderAddon: { enabled: true, limit: 2 },                             // done-screen "add to my parcel" via WhatsApp
 // Complement matrix consumed by YZA.cartSuggestions (keys = product category or group).
 complements: {
  bags: ['charms', 'accessories'],
  charms: ['charms', 'earrings'],
  rtw: ['bags', 'charms'],
  accessories: ['charms', 'bags'],
  default: ['charms'],
 },
};
YZA.bespoke = {
 minFabricPieces: 100,
 note: { fr: 'Co-création tissu possible à partir de 100 pièces par tissu.', en: 'Fabric co-creation available from 100 pieces per fabric.' },
};
YZA.press = ['Vogue', 'Grazia'];
// real=false hides any "X/5 · N avis" count (no fabricated aggregate). Authentic reviews:
// the first three are the client's ReviewXpo customer reviews (La Vague, FR + EN); the rest
// are genuine Instagram comments from @yzahandmade followers/customers, kept verbatim
// (filtered of emoji-only, price questions, tags and off-topic remarks). place tags the source.
YZA.reviewStats = { avg: 5, count: 3, real: false };
YZA.testimonials = [
 { rating: 5, name: 'Carla', place: { fr: 'Avis vérifié', en: 'Verified review' }, text: { fr: 'Un sac d’une qualité exceptionnelle et qui s’accorde avec toutes mes tenues, je ne m’en passe plus 😍', en: 'A bag of exceptional quality that goes with all my outfits — I can’t be without it 😍' } },
 { rating: 5, name: 'Violette', place: { fr: 'Avis vérifié', en: 'Verified review' }, text: { fr: 'J’adore ! J’ai même eu le droit à une petite pochette gratuite pour sécuriser mes affaires.', en: 'I love it! I even received a little free pouch to keep my things safe.' } },
 { rating: 5, name: 'Mélany', place: { fr: 'Avis vérifié', en: 'Verified review' }, text: { fr: 'Très jolie sac avec un très bon rapport qualité/prix, je recommande sans problème !', en: 'A really lovely bag, great value for money — I recommend it without hesitation!' } },
 { rating: 5, name: 'Sarah E.', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'The best bag ever! Bravo.', en: 'The best bag ever! Bravo.' } },
 { rating: 5, name: 'Laila B.', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'La meilleure expérience ❤️', en: 'La meilleure expérience ❤️' } },
 { rating: 5, name: 'Ashraf', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Great bag — from nature and with nature. One of its advantages is that it isn’t affected by water. It’s amazing.', en: 'Great bag — from nature and with nature. One of its advantages is that it isn’t affected by water. It’s amazing.' } },
 { rating: 5, name: 'La Boutique Concept Stores', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'J’adore, c’est tellement fin et brut à la fois — bravo vraiment ❤️', en: 'J’adore, c’est tellement fin et brut à la fois — bravo vraiment ❤️' } },
 { rating: 5, name: 'Chloé', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Ils sont incroyables.', en: 'Ils sont incroyables.' } },
 { rating: 5, name: 'Common Saints', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Stunning! Loving the light green details.', en: 'Stunning! Loving the light green details.' } },
 { rating: 5, name: 'Wafaa T.', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Ils sont juste magnifiques, et c’est ce qui fait leur charme.', en: 'Ils sont juste magnifiques, et c’est ce qui fait leur charme.' } },
 { rating: 5, name: 'Mouna R.', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Love the new La Vague.', en: 'Love the new La Vague.' } },
 { rating: 5, name: 'Téva', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Le tressage est trop beau !!', en: 'Le tressage est trop beau !!' } },
 { rating: 5, name: 'Galerie Objets Inanimés', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Trop jolis avec les petits fruits !', en: 'Trop jolis avec les petits fruits !' } },
 { rating: 5, name: 'Valérie M.', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Magnifique travail artisanal.', en: 'Magnifique travail artisanal.' } },
 { rating: 5, name: 'Iman', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Qu’est-ce que c’est beau !!!', en: 'Qu’est-ce que c’est beau !!!' } },
 { rating: 5, name: 'Houda B.', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'C’est canon !!', en: 'C’est canon !!' } },
 { rating: 5, name: 'Deborah C.', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'So cute, all your ideas ❤️', en: 'So cute, all your ideas ❤️' } },
 { rating: 5, name: 'IFULKKI', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Love it, so cool! Bravo Nawal !', en: 'Love it, so cool! Bravo Nawal !' } },
 { rating: 5, name: 'Ghita L.', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Simply love it.', en: 'Simply love it.' } },
 { rating: 5, name: 'Sarah C.', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Canon, j’adore — bravo Nawal !', en: 'Canon, j’adore — bravo Nawal !' } },
 { rating: 5, name: 'Steffie', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Magnifique !!', en: 'Magnifique !!' } },
 { rating: 5, name: 'Kenza K.', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Super cute!', en: 'Super cute!' } },
 { rating: 5, name: 'Onka Macramé', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Ces couleurs !!! C’est vraiment très joli ❤️', en: 'Ces couleurs !!! C’est vraiment très joli ❤️' } },
 { rating: 5, name: 'Seven Artisans', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'It’s so good, I loved it.', en: 'It’s so good, I loved it.' } },
 { rating: 5, name: 'Kim M.', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Passion La Vague.', en: 'Passion La Vague.' } },
 { rating: 5, name: 'RENA', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'We love this combo, so much ! ❤️', en: 'We love this combo, so much ! ❤️' } },
 { rating: 5, name: 'Tala', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'I love the size!', en: 'I love the size!' } },
 { rating: 5, name: 'Mathilde', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Il est si beau.', en: 'Il est si beau.' } },
 { rating: 5, name: 'Sarah H.', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Très joli. Bravo !', en: 'Très joli. Bravo !' } },
 { rating: 5, name: 'Inasse', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Beaucoup trop beaux.', en: 'Beaucoup trop beaux.' } },
 { rating: 5, name: 'Laure', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Magnifique — bravo Nawal !', en: 'Magnifique — bravo Nawal !' } },
 { rating: 5, name: 'Joséphine', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Tu m’as eu — on adore !!!', en: 'Tu m’as eu — on adore !!!' } },
 { rating: 5, name: 'Monichera', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Ils sont canons.', en: 'Ils sont canons.' } },
 { rating: 5, name: 'Mariri', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Obsessed.', en: 'Obsessed.' } },
 { rating: 5, name: 'Luun Ceramics', place: { fr: 'Instagram', en: 'Instagram' }, text: { fr: 'Tellement belles, vos pièces — bravo !', en: 'Tellement belles, vos pièces — bravo !' } },
];
