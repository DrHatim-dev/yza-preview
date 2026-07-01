(function () {
 const YZA = window.YZA || {};
 const PRODUCT_ALIASES = {
 'la sculpture xs': 'la-sculpture-xs-basket-bag-ss26',
 'la sculpture s': 'la-sculpture-s-basket-bag-ss26',
 'la sculpture m': 'la-sculpture-m-basket-bag-ss26',
 'la nouvelle vague xs': 'la-nouvelle-vague-xs-basket-bag-ss26',
 'la nouvelle vague s': 'la-nouvelle-vague-s-basket-bag-ss26',
 'la nouvelle vague m': 'la-nouvelle-vague-m-basket-bag-ss26',
 'new edition bag xs': 'la-nouvelle-vague-xs-basket-bag-ss26',
 'new edition bag s': 'la-nouvelle-vague-s-basket-bag-ss26',
 'new edition bag m': 'la-nouvelle-vague-m-basket-bag-ss26',
 'raffia lemon slice charm': 'raffia-lemon-slice-charm-ss26',
 'raffia orange slice charm': 'raffia-orange-slice-charm-ss26',
 'raffia cherries charm': 'raffia-cherries-charm-ss26',
 'raffia grapes charm': 'raffia-grapes-charm-ss26',
 'raffia whole lemon charm': 'raffia-whole-lemon-charm-ss26',
 'raffia whole orange charm': 'raffia-whole-orange-charm-ss26',
 'raffia watermelon slice charm': 'raffia-watermelon-slice-charm-ss26',
 'raffia avocado half charm': 'raffia-avocado-half-charm-ss26',
 'raffia kiwi slice charm': 'raffia-kiwi-slice-charm-ss26',
 'raffia tomato charm': 'raffia-tomato-charm-ss26',
 'orange raffia earrings': 'orange-raffia-earrings-ss26',
 'lemon raffia earrings': 'lemon-raffia-earrings-ss26',
 'cherries raffia earrings': 'cherries-raffia-earrings-ss26',
 'grapes raffia earrings': 'grapes-raffia-earrings-ss26',
 'kiwi raffia earrings': 'kiwi-raffia-earrings-ss26',
 'watermelon raffia earrings': 'watermelon-raffia-earrings-ss26',
 'tomatoes raffia earrings': 'tomatoes-raffia-earrings-ss26',
 'orange slice raffia necklace': 'orange-slice-raffia-necklace-ss26',
 'lemon slice raffia necklace': 'lemon-slice-raffia-necklace-ss26',
 'watermelon slice raffia necklace': 'watermelon-slice-raffia-necklace-ss26',
 'grapes raffia necklace': 'grapes-raffia-necklace-ss26',
 'cherries raffia necklace': 'cherries-raffia-necklace-ss26',
 'yza pareo skirt - short': 'yza-pareo-skirt-short-jawhara-ss26',
 'yza pareo skirt - midi': 'yza-pareo-skirt-midi-jawhara-ss26',
 'yza pareo skirt - long': 'yza-pareo-skirt-long-jawhara-ss26',
 'yza pareo skirt - x long': 'yza-pareo-skirt-x-long-jawhara-ss26',
 'yza palazzo pants': 'yza-palazzo-pants-jawhara-ss26',
 'yza wrap pants': 'yza-wrap-pants-jawhara-ss26',
 'yza scarf top': 'yza-scarf-top-jawhara-ss26',
 'yza bateau top': 'yza-bateau-top-jawhara-ss26',
 'yza button-up shirt': 'yza-button-up-shirt-jawhara-ss26',
 };

 function normalize(value) {
 return String(value || '')
 .toLowerCase()
 .normalize('NFD')
 .replace(/[\u0300-\u036f]/g, '')
 .replace(/[^a-z0-9]+/g, ' ')
 .trim();
 }

 function text(value) {
 if (!value) return '';
 if (typeof value === 'string') return value;
 return value.fr || value.en || Object.values(value)[0] || '';
 }

 function track(eventName, payload) {
 if (YZA.analytics && typeof YZA.analytics.track === 'function') {
 YZA.analytics.track(eventName, payload || {});
 }
 }

 function getProducts() {
 const promoOk = typeof YZA.isLaunchPromoProduct === 'function' ? YZA.isLaunchPromoProduct : (product) => product && product.launchPromo !== false;
 return Array.isArray(YZA.products) ? YZA.products.filter((product) => product && product.publicVisible !== false && promoOk(product)) : [];
 }

 function resolveProduct(label) {
 const key = normalize(label);
 const alias = PRODUCT_ALIASES[key]
 || Object.entries(PRODUCT_ALIASES).find(([label]) => normalize(label) === key)?.[1];
 if (alias && typeof YZA.getProduct === 'function') {
 return YZA.getProduct(alias);
 }

 const products = getProducts();
 const direct = products.find((product) => {
 const names = [product.handle, text(product.name), text(product.displayName), text(product.variantLabel)];
 return names.some((name) => normalize(name) === key);
 });
 if (direct) return direct;

 if (typeof YZA.searchProducts === 'function') {
 const result = YZA.searchProducts(label, 1);
 if (Array.isArray(result) && result[0]) return result[0].product || result[0];
 }

 return products.find((product) => normalize(text(product.name)).includes(key) || key.includes(normalize(text(product.name))));
 }

 function formatPrice(product) {
 if (YZA.i18n && typeof YZA.i18n.formatPrice === 'function') {
 return YZA.i18n.formatPrice(product.price, product.currency || 'MAD');
 }
 const amount = Math.round((Number(product.price) || 0) / 100);
 const lang = (document.documentElement.lang || 'fr');
 const loc = ({ fr:'fr-MA', en:'en-MA', es:'es-ES', tr:'tr-TR', ar:'ar-MA' })[lang] || 'fr-MA';
 const num = new Intl.NumberFormat(loc, { numberingSystem: 'latn' }).format(amount);
 return `${num} ${lang === 'ar' ? 'درهم' : 'DH'}`;
 }

 function productCard(product, context) {
 const name = text(product.displayName || product.name);
 const short = text(product.displayShort || product.short);
 const href = `/produits/${encodeURIComponent(product.handle)}`;
 return `
 <a class="blog-product-card" href="${href}" data-blog-product-click="${product.handle}" data-blog-product-context="${context}">
 <span class="blog-product-card__media">
          <img src="${product.img}" alt="${name} - YZA" loading="lazy" width="461" height="615" decoding="async">
 </span>
 <span class="blog-product-card__body">
 <span class="blog-product-card__meta">${product.categoryLabel ? text(product.categoryLabel) : 'YZA'}</span>
 <strong>${name}</strong>
 <span>${short}</span>
 <span class="blog-product-card__price">${formatPrice(product)}</span>
 </span>
 </a>`;
 }

 function hydrateProductModules() {
 document.querySelectorAll('[data-blog-products]').forEach((module) => {
 let labels = [];
 try {
 labels = JSON.parse(module.getAttribute('data-blog-products') || '[]');
 } catch (error) {
 labels = [];
 }
 const context = module.getAttribute('data-blog-product-context') || (document.body.dataset.blogPost || document.body.dataset.blogSlug || 'journal-index');
 const promoOk = typeof YZA.isLaunchPromoProduct === 'function' ? YZA.isLaunchPromoProduct : (product) => product && product.launchPromo !== false;
 const products = labels.map(resolveProduct).filter((product) => product && product.handle && product.img && promoOk(product));
 const unique = [];
 products.forEach((product) => {
 if (!unique.some((item) => item.handle === product.handle)) unique.push(product);
 });
 if (!unique.length) {
 module.innerHTML = '<p class="blog-empty">Pieces from this story are being linked.</p>';
 return;
 }
 module.innerHTML = unique.slice(0, 4).map((product) => productCard(product, context)).join('');
 });
 }

 function setupFaqs() {
 document.querySelectorAll('.blog-faq__button').forEach((button) => {
 button.addEventListener('click', () => {
 const item = button.closest('.blog-faq__item');
 const panel = (item && item.querySelector('.blog-faq__panel'))
 || (button.getAttribute('aria-controls') ? document.getElementById(button.getAttribute('aria-controls')) : null);
 const nextState = button.getAttribute('aria-expanded') !== 'true';
 button.setAttribute('aria-expanded', String(nextState));
 if (panel) panel.hidden = !nextState;
 track('blog_faq_toggle', {
 slug: document.body.dataset.blogPost || document.body.dataset.blogSlug || 'journal-index',
 question: button.textContent.trim(),
 open: nextState,
 });
 });
 });
 }

 function setupToc() {
 document.querySelectorAll('.blog-toc a').forEach((link) => {
 link.addEventListener('click', () => {
 track('blog_toc_click', {
 slug: document.body.dataset.blogPost || document.body.dataset.blogSlug || 'journal-index',
 target: link.getAttribute('href'),
 });
 });
 });
 }

 function setupFilters() {
 const params = new URLSearchParams(window.location.search);
 const active = params.get('cluster');
 const chips = document.querySelectorAll('[data-blog-filter]');
 if (active) {
 const clusterCards = document.querySelectorAll('[data-cluster]');
 clusterCards.forEach((card) => { card.hidden = card.getAttribute('data-cluster') !== active; });
 // Fallback: a cluster with no matching cards must not blank the grid.
 if (![...clusterCards].some((c) => !c.hidden)) clusterCards.forEach((c) => { c.hidden = false; });
 }
 chips.forEach((chip) => {
 if (chip.getAttribute('data-blog-filter') === active) chip.setAttribute('aria-current', 'true');
 chip.addEventListener('click', () => {
 track('blog_filter_click', {
 filter: chip.getAttribute('data-blog-filter'),
 label: chip.textContent.trim(),
 });
 });
 });
 }

 function setupNewsletter() {
 const form = document.querySelector('.blog-newsletter__form');
 if (!form) return;
 form.addEventListener('submit', (event) => {
 event.preventDefault();
 const email = form.querySelector('input[type="email"]');
 const message = (form.closest('.blog-newsletter') || document).querySelector('[data-blog-news-msg]');
 track('blog_newsletter_submit', {
 slug: document.body.dataset.blogPost || document.body.dataset.blogSlug || 'journal-index',
 filled: Boolean(email && email.value),
 });
 if (email) email.value = '';
 if (message) { message.textContent = 'Merci. The next YZA story will arrive quietly.'; message.hidden = false; }
 });
 }

 function setupProductTracking() {
 document.addEventListener('click', (event) => {
 const link = event.target.closest('[data-blog-product-click]');
 if (!link) return;
 track('blog_product_click', {
 slug: document.body.dataset.blogPost || document.body.dataset.blogSlug || 'journal-index',
 handle: link.getAttribute('data-blog-product-click'),
 context: link.getAttribute('data-blog-product-context'),
 });
 });
 }

 function mountServiceTrust() {
 if (!document.body.classList.contains('blog-page') || document.querySelector('[data-blog-service-trust]')) return;
 if (typeof YZA.serviceCard !== 'function') return;
 const target = document.querySelector('.blog-newsletter') || document.querySelector('main');
 if (!target || !target.parentNode) return;
 const section = document.createElement('section');
 section.className = 'blog-service-trust section--surface';
 section.setAttribute('data-blog-service-trust', '');
 section.innerHTML = `<div class="container-wide">
 <div class="service-strip service-strip--compact">
 ${['returns', 'payment', 'limited'].map((key) => YZA.serviceCard(key)).join('')}
 </div>
 </div>`;
 target.parentNode.insertBefore(section, target);
 }

 function init() {
 if (!document.body.classList.contains('blog-page')) return;
 track('blog_view', {
 slug: document.body.dataset.blogPost || document.body.dataset.blogSlug || 'journal-index',
 title: document.title,
 path: window.location.pathname,
 });
 hydrateProductModules();
 setupFaqs();
 setupToc();
 setupFilters();
 setupNewsletter();
 setupProductTracking();
 mountServiceTrust();
 }

 if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', init);
 } else {
 init();
 }
})();
