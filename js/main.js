/* ============================================================
 YZA - MAIN
 Boot du chrome + rendu des grilles depuis le catalogue,
 page produit / collections, interactions, re-rendu i18n.
 ============================================================ */
(function () {
 const $ = (s, r = document) => r.querySelector(s);
 const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
 const T = () => YZA.i18n;
 const params = new URLSearchParams(location.search);
 const esc = (s) => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

 /* ---- Carte produit ---- */
 function displayName(p) {
 return p?.displayName || p?.name || {};
 }
 function displayShort(p) {
 return p?.displayShort || p?.short || {};
 }
 function formatRange(range) {
 if (!Array.isArray(range) || range.length < 2) return '';
 const [min, max] = range;
 return min === max ? T().formatPrice(min) : `${T().formatPrice(min)} - ${T().formatPrice(max)}`;
 }
 function priceHTML(p) {
 const t = T();
 if (p.displayPriceRange) {
 return `<span class="product-card__price">${formatRange(p.displayPriceRange)}</span>`;
 }
 if (p.compareAt && p.compareAt > p.price) {
 return `<span class="product-card__price"><s>${t.formatPrice(p.compareAt)}</s> ${t.formatPrice(p.price)}</span>`;
 }
 return `<span class="product-card__price">${t.formatPrice(p.price)}</span>`;
 }
  function cardPriceText(p) {
    return p.displayPriceRange ? formatRange(p.displayPriceRange) : T().formatPrice(p.price);
  }
  function formatCardPrice(p) {
    const t = T();
    if (Array.isArray(p.displayPriceRange) && p.displayPriceRange.length >= 2) {
      const [min, max] = p.displayPriceRange;
      return min === max ? t.formatPrice(min) : `${t.formatPrice(min)} - ${t.formatPrice(max)}`;
    }
    return t.formatPrice(p.price);
  }
  function stockCopy() {
    const lang = T().lang || 'fr';
    const copy = {
      fr: { almost: 'Bientot epuise', sold: 'Epuise', left: 'piece restante' },
      en: { almost: 'Almost gone', sold: 'Sold out', left: 'piece left' },
      es: { almost: 'Casi agotado', sold: 'Agotado', left: 'pieza restante' },
      tr: { almost: 'Tukenmek uzere', sold: 'Tukendi', left: 'adet kaldi' },
      ar: { almost: 'ينفد قريبا', sold: 'نفد', left: 'قطعة متبقية' },
    };
    return copy[lang] || copy.fr;
  }
  function wishlistHas(handle) {
    try { return (JSON.parse(localStorage.getItem('yza_wishlist')) || []).includes(handle); } catch (e) { return false; }
  }
  function heartIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.3-9-8.3C1.4 8.4 3.4 5 6.8 5c2 0 3.3 1.1 4.1 2.2C11.8 6.1 13.1 5 15.2 5c3.3 0 5.4 3.4 3.8 6.7C17 15.7 12 20 12 20z"/></svg>';
  }
 function productCardCopy() {
 const lang = T().lang || 'fr';
 const copy = {
 fr: { hand: '~48h de travail main', atelier: 'Atelier femmes', limited: 'Édition limitée', bags: '15 pièces · numérotées', hours: 'h de crochet', bundle: 'Bundle facile' },
 en: { hand: '~48h hand-woven', atelier: 'Women atelier', limited: 'Limited edition', bags: '15 pieces · numbered', hours: 'h handwork', bundle: 'Easy bundle' },
 es: { hand: '~48h tejido a mano', atelier: 'Atelier de mujeres', limited: 'No se repite', bags: '15 piezas · numeradas', hours: 'h de trabajo', bundle: 'Pack facil' },
 tr: { hand: '~48s el işi', atelier: 'Kadin atolyeleri', limited: 'Tekrar uretilmez', bags: '15 parça · numaralı', hours: 'saat el isi', bundle: 'Kolay set' },
 ar: { hand: '\u0643\u0631\u0648\u0634\u064A\u0647 \u064A\u062F\u0648\u064A', atelier: '\u0648\u0631\u0634\u0629 \u0646\u0633\u0627\u0626\u064A\u0629', limited: '\u0644\u0646 \u064A\u0639\u0627\u062F \u0625\u0646\u062A\u0627\u062C\u0647', bags: '15 \u0644\u0643\u0644 \u0645\u0642\u0627\u0633/\u0644\u0648\u0646', hours: '\u0633\u0627\u0639\u0627\u062A \u0639\u0645\u0644', bundle: '\u0645\u062C\u0645\u0648\u0639\u0629 \u0633\u0647\u0644\u0629' },
 };
 return copy[lang] || copy.fr;
 }
 function cardProofHTML(p) {
 const c = productCardCopy();
 const craft = p.hours ? `${String(p.hours).replace('.', ',')} ${c.hours}` : (p.category === 'bags' ? c.hand : c.atelier);
 const scarcity = p.category === 'bags' ? c.bags : (p.bundle ? c.bundle : c.limited);
 return `<div class="product-card__meta" aria-label="${esc(craft)}"><span>${esc(craft)}</span><span>${esc(scarcity)}</span></div>`;
 }
  function cardHTML(p, index = 0, eager = false) {
    const t = T();
    const name = t.pick(displayName(p));
    const hoverSrc = p.hoverImg || ((p.gallery && p.gallery[1] && p.gallery[1] !== p.img) ? p.gallery[1] : '');
    const status = YZA.inventoryStatus?.(p) || { inventory: null, soldOut: false, almostGone: false };
    const stock = stockCopy();
    const wished = wishlistHas(p.handle);
    const href = `produit.html?handle=${encodeURIComponent(p.handle)}`;
    const limitedLine = status.almostGone
      ? `<span class="product-card__limited">${status.inventory} ${esc(stock.left)}</span>`
      : '';
    const soldOverlay = status.soldOut ? `<span class="product-card__sold">${esc(stock.sold)}</span>` : '';
    const almostBadge = status.almostGone ? `<span class="product-card__stock">${esc(stock.almost)}</span>` : '';
    const imgLoad = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
    return `<article class="product-card${p.hoverImg ? ' product-card--vibe' : ''}${status.soldOut ? ' is-sold-out' : ''}" style="--i:${index}" data-product-handle="${esc(p.handle)}">
      <button class="product-card__wish${wished ? ' is-active' : ''}" type="button" data-wishlist-toggle="${esc(p.handle)}" aria-pressed="${wished ? 'true' : 'false'}" aria-label="${wished ? 'Remove from wishlist' : 'Add to wishlist'}">${heartIcon()}</button>
      <a class="product-card__media" href="${href}" data-product-card-click="${esc(p.handle)}" aria-label="${esc(name)}">
        ${almostBadge}${soldOverlay}
        <img class="product-card__img" src="${esc(p.img)}" alt="${esc(t.pick(p.name))} - YZA" ${imgLoad} width="461" height="615" decoding="async">
        ${(hoverSrc && isPublicMedia(hoverSrc)) ? `<img class="product-card__img product-card__img--hover" src="${esc(hoverSrc)}" alt="" aria-hidden="true" loading="lazy" width="461" height="615" decoding="async">` : ''}
      </a>
      <a class="product-card__info" href="${href}" data-product-card-click="${esc(p.handle)}">
        <span class="product-card__name" title="${esc(name)}">${esc(name)}</span>
        <span class="product-card__price">${formatCardPrice(p)}</span>
        ${limitedLine}
      </a>
    </article>`;
  }
  function bagVariantCardHTML(item, index = 0, eager = false, displayName) {
    const t = T();
    const fullName = t.pick(item.title);
    const name = displayName || fullName;
    const imgLoad = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
    const product = YZA.getProduct?.(item.handle) || item;
    const status = YZA.inventoryStatus?.(product) || { soldOut: false, almostGone: false, inventory: null };
    const stock = stockCopy();
    const wished = wishlistHas(item.handle);
    return `<article class="product-card product-card--bag-variant${status.soldOut ? ' is-sold-out' : ''}" data-size="${esc(String(item.size || '').toUpperCase())}" style="--i:${index}" data-product-handle="${esc(item.handle || '')}">
      <button class="product-card__wish${wished ? ' is-active' : ''}" type="button" data-wishlist-toggle="${esc(item.handle || '')}" aria-pressed="${wished ? 'true' : 'false'}" aria-label="${wished ? 'Remove from wishlist' : 'Add to wishlist'}">${heartIcon()}</button>
      <a class="product-card__media" href="${esc(item.url)}" data-product-card-click="${esc(item.handle || '')}" aria-label="${esc(fullName)}">
        ${status.almostGone ? `<span class="product-card__stock">${esc(stock.almost)}</span>` : ''}
        ${status.soldOut ? `<span class="product-card__sold">${esc(stock.sold)}</span>` : ''}
        <img class="product-card__img" src="${esc(item.img)}" alt="${esc(fullName)} - YZA" ${imgLoad} width="461" height="615" decoding="async">
        ${(item.gallery && item.gallery[1] && item.gallery[1] !== item.img) ? `<img class="product-card__img product-card__img--hover" src="${esc(item.gallery[1])}" alt="" aria-hidden="true" loading="lazy" width="461" height="615" decoding="async">` : ''}
      </a>
      <a class="product-card__info" href="${esc(item.url)}" data-product-card-click="${esc(item.handle || '')}">
        <span class="product-card__name">${esc(name)}</span>
        <span class="product-card__price">${formatCardPrice(item)}</span>
        ${status.almostGone ? `<span class="product-card__limited">${status.inventory} ${esc(stock.left)}</span>` : ''}
      </a>
    </article>`;
  }
 const stars = (n = 5, label) => {
 const g = '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
 return label ? `<span class="stars" role="img" aria-label="${label}">${g}</span>`
 : `<span class="stars" aria-hidden="true">${g}</span>`;
 };
 const renderGrid = (el, list) => { if (el) el.innerHTML = list.map((p, i) => cardHTML(p, i)).join(''); };

 // ── Unified product carousel (Swiper) ───────────────────────────────
 // Cult-Gaia-style: 4 cards per view on desktop, arrows advance ONE card at
 // a time, looped. Swiper is loaded on demand from the CDN (the site already
 // pulls fonts from a CDN) and reused across every carousel on the page.
 const SWIPER_CSS = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
 const SWIPER_JS = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
 function ensureSwiper() {
 if (window.Swiper) return Promise.resolve(window.Swiper);
 if (YZA._swiperPromise) return YZA._swiperPromise;
 const cssP = new Promise((res) => {
 if (document.querySelector('link[data-swiper-css]')) return res();
 const link = document.createElement('link');
 link.rel = 'stylesheet'; link.href = SWIPER_CSS; link.setAttribute('data-swiper-css', '');
 link.onload = res; link.onerror = res; // never block render on CSS
 document.head.appendChild(link);
 });
 const jsP = new Promise((res, rej) => {
 const s = document.createElement('script');
 s.src = SWIPER_JS; s.async = true;
 s.onload = res; s.onerror = () => rej(new Error('Swiper script failed to load'));
 document.head.appendChild(s);
 });
 YZA._swiperPromise = Promise.all([cssP, jsP]).then(() => window.Swiper);
 return YZA._swiperPromise;
 }
 const navChev = (d) => `<svg viewBox="0 0 15 11" width="15" height="11" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d === 'prev' ? '<path d="M14 5.5H2"/><path d="M5.3 1 0.8 5.5 5.3 10"/>' : '<path d="M1 5.5h12"/><path d="M9.7 1 14.2 5.5 9.7 10"/>'}</svg>`;

 // Build a product carousel into `el` from `list`, using `cardFn` for each card.
 function buildSwiper(el, list, cardFn) {
 if (!el || !list || !list.length) return;
 const make = cardFn || cardHTML;
 const t = T();
 const slides = list.map((p, i) => `<div class="swiper-slide">${make(p, i)}</div>`).join('');
 el.classList.remove('product-grid', 'product-rail');
 el.classList.add('yza-swiper', 'swiper');
 el.innerHTML = `
 <div class="swiper-wrapper">${slides}</div>
 <button type="button" class="yza-swiper__nav yza-swiper__nav--prev" aria-label="${esc(t.t('carousel.prev'))}">${navChev('prev')}</button>
 <button type="button" class="yza-swiper__nav yza-swiper__nav--next" aria-label="${esc(t.t('carousel.next'))}">${navChev('next')}</button>`;
 // Swiper loop needs slides >= 2 * (slidesPerView + loopAdditionalSlides).
 // With slidesPerView=4 desktop + loopAdditionalSlides=4 → 16 needed.
 // Below that, drop the loop and lean on watchOverflow to hide arrows at
 // the ends - the only "loss" is the wraparound, not the slide-by-slide nav.
 const canLoop = list.length >= 16;
 ensureSwiper().then((Swiper) => {
 if (!Swiper) return;
 if (el._swiper) { try { el._swiper.destroy(true, false); } catch (e) {} }
 el._swiper = new Swiper(el, {
 slidesPerView: 1.4,
 slidesPerGroup: 1, // arrows move exactly one product
 spaceBetween: 5,
 loop: canLoop,
 loopAdditionalSlides: canLoop ? 4 : 0,
 watchOverflow: true, // hide arrows when everything already fits
 threshold: 5,
 grabCursor: true,
 // Re-measure when a parent (e.g. an alsoRailBlock that toggles hidden)
 // changes - without this Swiper can mount inside a 0-width container.
 observer: true,
 observeParents: true,
 navigation: {
 prevEl: el.querySelector('.yza-swiper__nav--prev'),
 nextEl: el.querySelector('.yza-swiper__nav--next'),
 },
 breakpoints: {
 600: { slidesPerView: 2.4 },
 900: { slidesPerView: 3 },
 1200: { slidesPerView: 4 },
 },
 });
 }).catch((err) => {
 console.warn('YZA carousel: Swiper unavailable, falling back to scroll row.', err);
 el.classList.remove('swiper');
 el.classList.add('yza-swiper--fallback');
 enableDragScroll(el.querySelector('.swiper-wrapper'));
 });
 if (document.documentElement.classList.contains('js')) requestAnimationFrame(wireReveal);
 }

 // Public entry kept for callers: renders a product carousel.
 function renderCarousel(el, list, cardFn) { buildSwiper(el, list, cardFn); }

 // Manual smooth horizontal scroll. Native scrollBy({behavior:'smooth'}) is
 // silently cancelled by scroll-snap containers in Chromium (the arrow appears
 // to "do nothing"), so we animate scrollLeft ourselves with snap + CSS smooth
 // disabled for the duration, then restore them once we land on a snap point.
 function smoothScrollBy(el, delta) {
 if (!el) return;
 const maxLeft = el.scrollWidth - el.clientWidth;
 const start = el.scrollLeft;
 const target = Math.max(0, Math.min(start + delta, maxLeft));
 const dist = target - start;
 if (Math.abs(dist) < 1) return;
 const dur = 420;
 const ease = (p) => 1 - Math.pow(1 - p, 3); // easeOutCubic
 const prevSnap = el.style.scrollSnapType;
 const prevBehavior = el.style.scrollBehavior;
 el.style.scrollSnapType = 'none';
 el.style.scrollBehavior = 'auto';
 let t0 = null;
 if (el._scrollRaf) cancelAnimationFrame(el._scrollRaf);
 const frame = (ts) => {
 if (t0 === null) t0 = ts;
 const p = Math.min(1, (ts - t0) / dur);
 el.scrollLeft = start + dist * ease(p);
 if (p < 1) {
 el._scrollRaf = requestAnimationFrame(frame);
 } else {
 el._scrollRaf = 0;
 el.style.scrollSnapType = prevSnap;
 el.style.scrollBehavior = prevBehavior;
 }
 };
 el._scrollRaf = requestAnimationFrame(frame);
 }
 YZA.smoothScrollBy = smoothScrollBy;

 // Pointer drag-to-scroll for any horizontal carousel/rail.
 // Mouse + pen are driven manually (with flick momentum); touch keeps the
 // browser's native momentum scrolling, which is already buttery once the
 // snap type is "proximity" instead of "mandatory".
 function enableDragScroll(el) {
 if (!el || el.dataset.dragReady === '1') return;
 el.dataset.dragReady = '1';
 let down = false, moved = false, startX = 0, startLeft = 0, pid = null;
 let lastX = 0, lastT = 0, vx = 0, raf = 0;
 const stopGlide = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
 el.addEventListener('pointerdown', (e) => {
 if (e.pointerType === 'touch') return; // native scroll owns touch
 if (e.button !== 0) return;
 down = true; moved = false; pid = e.pointerId;
 startX = e.clientX; lastX = e.clientX; lastT = e.timeStamp || 0;
 startLeft = el.scrollLeft; vx = 0; stopGlide();
 });
 el.addEventListener('pointermove', (e) => {
 if (!down || e.pointerId !== pid) return;
 const dx = e.clientX - startX;
 if (!moved && Math.abs(dx) > 4) {
 moved = true;
 el.classList.add('is-dragging');
 try { el.setPointerCapture(pid); } catch (_) {}
 }
 if (!moved) return;
 const tNow = e.timeStamp || 0, dt = tNow - lastT;
 if (dt > 0) vx = (e.clientX - lastX) / dt; // px per ms
 lastX = e.clientX; lastT = tNow;
 el.scrollLeft = startLeft - dx;
 e.preventDefault();
 }, { passive: false });
 const release = () => {
 if (!down) return;
 down = false;
 el.classList.remove('is-dragging');
 try { el.releasePointerCapture(pid); } catch (_) {}
 if (moved && Math.abs(vx) > 0.05) { // flick momentum
 let v = -vx * 16;
 const glide = () => {
 v *= 0.94;
 el.scrollLeft += v;
 if (Math.abs(v) > 0.6) raf = requestAnimationFrame(glide);
 };
 raf = requestAnimationFrame(glide);
 }
 };
 el.addEventListener('pointerup', release);
 el.addEventListener('pointercancel', release);
 // Swallow the click that fires right after a drag so cards don't navigate.
 el.addEventListener('click', (e) => {
 if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
 }, true);
 }
 YZA.enableDragScroll = enableDragScroll;

 YZA.renderCarousel = renderCarousel;

 const mediaText = (obj) => obj ? (T().pick(obj) || obj.en || obj.fr || '') : '';
  const mediaImg = (src, alt = 'YZA image', extra = '') => {
    const width = (extra.match(/\bwidth=["']?(\d+)/) || [])[1] || '640';
    const height = (extra.match(/\bheight=["']?(\d+)/) || [])[1] || '860';
    const cleanExtra = extra.replace(/\s*\b(width|height)=["']?\d+["']?/g, '');
    return `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" width="${width}" height="${height}" decoding="async" ${cleanExtra}>`;
  };
 const isPublicMedia = (src) => !YZA.publicProductImage || YZA.publicProductImage(src);

 function initHomeVideoHero() {
 const section = $('[data-video-hero]');
 const video = section?.querySelector('.hero__video');
 if (!section || !video) return;

 const mobileQuery = window.matchMedia('(max-width: 767px)');
 const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
 const sourceForViewport = () => mobileQuery.matches ? video.dataset.mobileSrc : video.dataset.desktopSrc;
 const posterForViewport = () => mobileQuery.matches ? video.dataset.mobilePoster : video.dataset.desktopPoster;
 let canLoadVideo = false;

 const setPoster = () => {
 const poster = posterForViewport();
 if (!poster) return;
 // Resolve to an absolute URL before handing it to the custom property:
 // a relative url() inside --hero-poster is otherwise resolved against
 // css/styles.css (the sheet that consumes the var), giving
 // /css/assets/hero/… → 404 and a black hero whenever autoplay is blocked
 // on mobile (Low Power Mode, data-saver, slow connection).
 const absPoster = new URL(poster, document.baseURI).href;
 video.setAttribute('poster', poster);
 section.style.setProperty('--hero-poster', `url("${absPoster}")`);
 };

 const unloadVideo = () => {
 video.pause();
 video.removeAttribute('src');
 video.load();
 section.classList.remove('is-video-ready');
 section.classList.add('hero--poster-only');
 };

 const playVideo = () => {
 if (document.visibilityState === 'hidden') return;
 const playPromise = video.play();
 if (playPromise?.then) {
 playPromise
 .then(() => section.classList.remove('hero--poster-only'))
 .catch(() => section.classList.add('hero--poster-only'));
 }
 };

 const syncVideo = () => {
 setPoster();
 if (motionQuery.matches) {
 unloadVideo();
 return;
 }

 if (!canLoadVideo) {
 section.classList.add('hero--poster-only');
 return;
 }
 section.classList.remove('hero--poster-only');
 const src = sourceForViewport();
 if (!src) return;
 video.setAttribute('autoplay', '');
 if (video.getAttribute('src') !== src) {
 section.classList.remove('is-video-ready');
 video.setAttribute('src', src);
 video.load();
 }
 playVideo();
 };

 video.addEventListener('loadeddata', () => section.classList.add('is-video-ready'), { once: false });
 document.addEventListener('visibilitychange', syncVideo);
 mobileQuery.addEventListener?.('change', syncVideo);
 motionQuery.addEventListener?.('change', syncVideo);
 const loadOnIntent = () => {
 if (canLoadVideo || motionQuery.matches) return;
 canLoadVideo = true;
 syncVideo();
 };
 if ('IntersectionObserver' in window) {
 document.body.classList.add('is-on-video-hero');
 const heroObserver = new IntersectionObserver(([entry]) => {
 document.body.classList.toggle('is-on-video-hero', entry.isIntersecting && entry.intersectionRatio > 0.18);
 }, { threshold: [0, 0.18] });
 heroObserver.observe(section);
 }
 ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach((type) => {
 window.addEventListener(type, loadOnIntent, { once: true, passive: true });
 });
 setPoster();
 section.classList.add('hero--poster-only');
 syncVideo();
 }

 function initFooterWidgetGuard() {
 const footer = document.querySelector('.footer');
 if (!footer || !('IntersectionObserver' in window)) return;
 const observer = new IntersectionObserver((entries) => {
 const isVisible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0.03);
 document.body.classList.toggle('is-footer-visible', isVisible);
 }, { threshold: [0, 0.03, 0.12] });
 observer.observe(footer);
 }

 function mediaBreakHTML(story) {
 if (!story) return '';
 const title = mediaText(story.title);
 const kicker = mediaText(story.kicker);
 const text = mediaText(story.text);
 const images = story.images || [];
 if (story.layout === 'wide') {
 return `<section class="product-story product-story--wide" data-reveal>
 <div class="product-story__image">${mediaImg(images[0], title || 'YZA editorial product worn on model', 'width="1480" height="920"')}</div>
 <div class="product-story__copy product-story__copy--overlay">
 <p class="eyebrow">${esc(kicker)}</p>
 <h2>${esc(title)}</h2>
 </div>
 </section>`;
 }
 return `<section class="product-story product-story--duo" data-reveal>
 <div class="product-story__copy">
 <p class="eyebrow">${esc(kicker)}</p>
 <h2>${esc(title)}</h2>
 ${text ? `<p>${esc(text)}</p>` : ''}
 </div>
 ${images.slice(0, 2).map((src) => `<div class="product-story__image">${mediaImg(src, title || 'YZA product worn by model', 'width="1120" height="1400"')}</div>`).join('')}
 </section>`;
 }

 function storyCopy() {
 const lang = T().lang || 'fr';
 const copy = {
 fr: {
 duoKicker: 'Porte par la femme YZA',
 duoTitle: 'Le crochet se comprend mieux sur le corps.',
 duoText: 'Chaque piece garde la tension de la main, les heures de crochet et la finition d atelier qui la rendent impossible a comparer a une production machine.',
 fullKicker: 'La rarete est la regle',
 fullTitle: 'Editions limitees, grands standards.',
 },
 en: {
 duoKicker: 'Worn by the YZA woman',
 duoTitle: 'Crochet makes sense on the body.',
 duoText: 'Every piece carries hand tension, crochet hours and atelier finishing, which is why it should not be compared with machine-made alternatives.',
 fullKicker: 'Scarcity is the rule',
 fullTitle: 'Limited editions, high standards.',
 },
 es: {
 duoKicker: 'Llevado por la mujer YZA',
 duoTitle: 'El crochet se entiende sobre el cuerpo.',
 duoText: 'Cada pieza lleva tension de mano, horas de crochet y acabado de atelier.',
 fullKicker: 'La rareza es la regla',
 fullTitle: 'Series pequenas, estandares altos.',
 },
 tr: {
 duoKicker: 'YZA kadini uzerinde',
 duoTitle: 'Krose vucutta anlam kazanir.',
 duoText: 'Her parca el tansiyonu, saatlerce krose ve atolye bitisi tasir.',
 fullKicker: 'Azlik kuraldir',
 fullTitle: 'Kucuk seriler, yuksek standartlar.',
 },
 ar: {
 duoKicker: '\u062A\u0631\u062A\u062F\u064A\u0647\u0627 \u0627\u0645\u0631\u0623\u0629 YZA',
 duoTitle: '\u0627\u0644\u0643\u0631\u0648\u0634\u064A\u0647 \u064A\u0638\u0647\u0631 \u0639\u0644\u0649 \u0627\u0644\u062C\u0633\u062F.',
 duoText: '\u0643\u0644 \u0642\u0637\u0639\u0629 \u062A\u062D\u0645\u0644 \u0633\u0627\u0639\u0627\u062A \u0639\u0645\u0644 \u064A\u062F\u0648\u064A \u0648\u062A\u0634\u0637\u064A\u0628 \u0648\u0631\u0634\u0629.',
 fullKicker: '\u0627\u0644\u0646\u062F\u0631\u0629 \u0647\u064A \u0627\u0644\u0642\u0627\u0639\u062F\u0629',
 fullTitle: '\u0633\u0644\u0633\u0644\u0627\u062A \u0635\u063A\u064A\u0631\u0629 \u0648\u0645\u0639\u0627\u064A\u064A\u0631 \u0639\u0627\u0644\u064A\u0629.',
 },
 };
 return copy[lang] || copy.fr;
 }
 function collectionBreakHTML(setIndex) {
 if (collState.cat === 'charms') {
 const charmBreaks = YZA.media?.charmEditorialBreaks || [];
 if (charmBreaks.length) return mediaBreakHTML(charmBreaks[setIndex % charmBreaks.length]);
 }
 if (['accessories', 'earrings', 'necklaces'].includes(collState.cat)) {
 const accessBreaks = YZA.media?.accessoryEditorialBreaks || [];
 if (accessBreaks.length) return mediaBreakHTML(accessBreaks[setIndex % accessBreaks.length]);
 }
 if (['rtw', 'tops', 'pareos', 'pants', 'bottoms'].includes(collState.cat)) {
 const rtwBreaks = YZA.media?.rtwEditorialBreaks || [];
 if (rtwBreaks.length) return mediaBreakHTML(rtwBreaks[setIndex % rtwBreaks.length]);
 }
 const mediaBreaks = YZA.media?.editorialBreaks || [];
 if (mediaBreaks.length) return mediaBreakHTML(mediaBreaks[setIndex % mediaBreaks.length]);
 const c = storyCopy();
 const duoSets = [
 ['assets/yza-girls/girls-rin-look-1.jpg', 'assets/yza-girls/girls-rin-look-2.jpg'],
 ['assets/products/bag-sculpture-red-seated.jpg', 'assets/products/charms-on-bag.jpg'],
 ['assets/yza-girls/girls-rin-look-3.jpg', 'assets/products/bag-sculpture-group.jpg'],
 ];
 if (setIndex % 3 === 1) {
 const full = ['assets/lifestyle/hero.jpg', 'assets/lifestyle/editorial-grapes.jpg'][setIndex % 2];
 return `<section class="product-story product-story--wide" data-reveal>
 <div class="product-story__image"><img src="${full}" alt="YZA editorial product worn on model" loading="lazy" width="1480" height="920" decoding="async"></div>
 <div class="product-story__copy product-story__copy--overlay">
 <p class="eyebrow">${esc(c.fullKicker)}</p>
 <h2>${esc(c.fullTitle)}</h2>
 </div>
 </section>`;
 }
 const imgs = duoSets[setIndex % duoSets.length];
 return `<section class="product-story product-story--duo" data-reveal>
 <div class="product-story__copy">
 <p class="eyebrow">${esc(c.duoKicker)}</p>
 <h2>${esc(c.duoTitle)}</h2>
 <p>${esc(c.duoText)}</p>
 </div>
 ${imgs.map((src) => `<div class="product-story__image"><img src="${src}" alt="YZA product worn by model" loading="lazy" width="1120" height="1400" decoding="async"></div>`).join('')}
 </section>`;
 }
 function renderCollectionGrid(el, list) {
 if (!el) return;
 // Cap editorial breaks to the number of UNIQUE sets so story images never repeat down the page.
 const breakCount = (YZA.media && YZA.media.editorialBreaks && YZA.media.editorialBreaks.length)
 ? YZA.media.editorialBreaks.length
 : 3;
 el.innerHTML = list.map((p, i) => {
 const setIndex = Math.floor(i / 4);
 const story = ((i + 1) % 4 === 0 && i < list.length - 1 && setIndex < breakCount)
 ? collectionBreakHTML(setIndex) : '';
 return cardHTML(p, i, i < 4) + story;
 }).join('');
 if (document.documentElement.classList.contains('js')) requestAnimationFrame(wireReveal);
 }

 function renderBagCollectionGrid(el, list) {
 if (!el) return;
 const t = T();
 const normalizeLabel = (value) => String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
 const allowedHandles = new Set(list.map((p) => p.handle));
 const q = (collState.q || '').trim().toLowerCase();
 const rowMatches = (row) => {
 if (!q) return true;
 const text = [
 t.pick(row.familyTitle), t.pick(row.rowTitle), t.pick(row.color),
 ...(row.items || []).flatMap((item) => [t.pick(item.title), item.size, t.pick(item.color)]),
 ].join(' ').toLowerCase();
 return text.includes(q);
 };
 const rows = (YZA.bagRows || [])
 .map((row) => ({ ...row, items: q ? (row.items || []) : (row.items || []).filter((item) => allowedHandles.has(item.handle)) }))
 .filter((row) => row.items.length && rowMatches(row));
 const groups = new Map();
 rows.forEach((row) => {
 const key = row.familyHandle || t.pick(row.familyTitle);
 if (!groups.has(key)) groups.set(key, []);
 groups.get(key).push(row);
 });
 const sections = Array.from(groups.entries());
 let cardIndex = 0;
 el.innerHTML = sections.map(([key, familyRows], sectionIndex) => {
 const lead = familyRows[0];
 const title = t.pick(lead.familyTitle);
 const eyebrow = t.pick(lead.familyEyebrow) || t.t('col.bags');
 const text = t.pick(lead.familyText) || '';
 const titleEscRe = new RegExp('^' + title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\u00B7\\-]+', 'i');
 const rowsHtml = familyRows.map((row) => {
 const cards = row.items.map((item) => { const ci = cardIndex++; const dn = t.pick(item.title).replace(titleEscRe, '').trim() || null; return bagVariantCardHTML(item, ci, ci < 4, dn); }).join('');
 const rowTitle = t.pick(row.rowTitle);
 const displayRowTitle = rowTitle.replace(titleEscRe, '').trim() || rowTitle;
 const showRowHead = normalizeLabel(displayRowTitle) !== normalizeLabel(title);
 return `<div class="bag-color-row${showRowHead ? '' : ' bag-color-row--compact'}" data-bag-color="${esc(row.colorSlug || '')}">
 ${showRowHead ? `<div class="bag-color-row__head">
 <h3>${esc(displayRowTitle)}</h3>
 <p>${esc(row.items.map((item) => item.size).join(' / '))}</p>
 </div>` : ''}
 <div class="bag-family-grid">${cards}</div>
 </div>`;
 }).join('');
 const bagBreaks = YZA.media?.bagsEditorialBreaks || [];
 const breakHTML = (sectionIndex < sections.length - 1 && bagBreaks.length)
 ? mediaBreakHTML(bagBreaks[sectionIndex % bagBreaks.length])
 : '';
 return `<section class="bag-family-section" data-bag-family="${esc(key)}" data-reveal style="--i:${sectionIndex}">
 <div class="bag-family-head">
 <div>
 <p class="eyebrow">${esc(eyebrow)}</p>
 <h2>${esc(title)}</h2>
 </div>
 ${text ? `<p>${esc(text)}</p>` : ''}
 </div>
 ${rowsHtml}
 </section>` + breakHTML;
 }).join('');
 if (document.documentElement.classList.contains('js')) requestAnimationFrame(wireReveal);
 }

 /* ================= ACCUEIL ================= */
 function renderHome() {
 const t = T();
 // best-sellers : charms hors coffrets - carrousel landing
 const promoOk = typeof YZA.isLaunchPromoProduct === 'function' ? YZA.isLaunchPromoProduct : (p) => p && p.launchPromo !== false;
 renderCarousel($('#bestGrid'), ['charms', 'bags', 'rtw', 'accessories'].flatMap(g => YZA.byCategory(g).filter(p => !p.bundle && promoOk(p)).slice(0, 3)).slice(0, 12));

 // bande presse (savoir-faire fondatrice)
 const press = $('#pressList');
 if (press) press.innerHTML = YZA.press.map(n => `<span>${n}</span>`).join('');

 // L'offre : 3 entrees de collection depuis le catalogue reel
 const offer = $('#offerGrid');
 if (offer) {
 const picks = typeof YZA.offerPicks === 'function' ? YZA.offerPicks() : YZA.bundles();
 offer.innerHTML = picks.map(p => {
 const save = p.compareAt ? t.formatPrice(p.compareAt - p.price) : '';
 return `<a class="offer-card" href="produit.html?handle=${p.handle}">
 <div class="offer-card__media"><img src="${p.img}" alt="${t.pick(displayName(p))} - YZA" loading="lazy" width="461" height="615" decoding="async">
 ${save ? `<span class="offer-card__save">${t.t('offer.save')} ${save}</span>` : ''}</div>
 <div class="offer-card__body">
 <h3>${t.pick(displayName(p))}</h3>
 <p>${t.pick(displayShort(p))}</p>
 <span class="offer-card__price">${p.compareAt ? `<s>${t.formatPrice(p.compareAt)}</s> ` : ''}${cardPriceText(p)}</span>
 </div></a>`;
 }).join('');
 }

 // Témoignages - EXEMPLES à remplacer par de vrais avis (data-placeholder="reviews")
 const tg = $('#testimonialsGrid');
 if (tg) {
 tg.setAttribute('data-placeholder', 'reviews');
 tg.innerHTML = (YZA.reviewStats?.real ? YZA.testimonials : []).map(r => `<figure class="testimonial">
 ${stars(r.rating, `${t.t('social.ratingOf')} ${r.rating}/5`)}
 <blockquote>${t.pick(r.text)}</blockquote>
 <figcaption>${r.name} · ${t.pick(r.place)}</figcaption>
 </figure>`).join('');
 }
 const rs = $('#ratingSummary');
 if (rs) {
 rs.setAttribute('data-placeholder', 'reviews');
 const st = YZA.reviewStats;
 rs.innerHTML = st.real
 ? `${stars(st.avg, `${t.t('social.ratingOf')} ${String(st.avg).replace('.', ',')}/5`)} <strong>${String(st.avg).replace('.', ',')}/5</strong> · ${st.count} ${t.t('pp.reviews')}`
 : `${stars(5, t.t('social.rating'))} <span>${t.t('social.rating')}</span>`;
 }
 }

 // Colours still sold in the shop. Any other worn colourway is a sold-out batch (never remade).
 const GIRLS_IN_STORE_COLORS = ['violet', 'rouge', 'noir', 'bleu', 'rose'];
 function girlSoldOut(girl) { return GIRLS_IN_STORE_COLORS.indexOf(String((girl && girl.color) || '').toLowerCase()) === -1; }
 function scarcityPill(extra = '') { return `<span class="scarcity-pill${extra}">${esc(T().t('girls.soldOut'))}</span>`; }

 function girlsCardHTML(girl, index = 0, compact = false) {
 const handles = girl.lookProductHandles || [];
 const handle = handles[0] || '';
 const href = handle ? `produit.html?handle=${handle}` : (girl.lookHref || `yza-girls.html#${esc(girl.color || 'girls')}`);
 const soldOut = girlSoldOut(girl);
 const cta = soldOut ? T().t('girls.shopCurrent') : T().t('girls.shopLook');
 return `<a class="${compact ? 'girls-home-card' : 'girls-card'}${soldOut ? ' is-soldout' : ''}" href="${href}" data-shop-look="${esc(handle || girl.id || '')}" style="--i:${index}">
 <figure>
 ${mediaImg(girl.src, girl.alt || girl.product || 'YZA Girl', 'width="720" height="960"')}
 <figcaption>
 <strong>${esc(girl.name || 'YZA Girl')}</strong>
 <span>${esc(girl.product || '')}${girl.city ? ` / ${esc(girl.city)}` : ''}</span>
 <em>${esc(cta)}</em>
 </figcaption>
 </figure>
 </a>`;
 }

 // Full-bleed band videos: only play the one(s) in view (saves CPU / mobile data).
 // renderPage() (and thus this) re-runs on every language change, so reuse one
 // observer and disconnect it first - otherwise each switch leaks another observer.
 let bandVideoIO = null;
 function initBandVideos() {
 const vids = $$('.video-band__media');
 if (!vids.length || !('IntersectionObserver' in window)) return;
 if (bandVideoIO) bandVideoIO.disconnect();
 bandVideoIO = new IntersectionObserver((entries) => {
 entries.forEach((e) => {
 const v = e.target;
 if (e.isIntersecting) { const p = v.play && v.play(); if (p && p.catch) p.catch(() => {}); }
 else if (v.pause) v.pause();
 });
 }, { threshold: 0.2 });
 vids.forEach((v) => bandVideoIO.observe(v));
 }

 // Instagram-style feed tile: portrait image + hover overlay (no permanent caption).
 function girlsFeedCardHTML(girl, index = 0) {
 const handles = girl.lookProductHandles || [];
 const handle = handles[0] || '';
 const href = handle ? `produit.html?handle=${handle}` : (girl.lookHref || `yza-girls.html#${esc(girl.color || 'girls')}`);
 const soldOut = girlSoldOut(girl);
 const cta = soldOut ? T().t('girls.shopCurrent') : T().t('girls.shopLook');
 return `<a class="girls-feed__item${soldOut ? ' is-soldout' : ''}" href="${href}" data-shop-look="${esc(handle || girl.id || '')}" style="--i:${index}">
 ${mediaImg(girl.src, girl.alt || girl.product || 'YZA Girl', 'width="720" height="960"')}
 <span class="girls-feed__overlay" aria-hidden="true"><span class="girls-feed__cta">${esc(cta)}</span></span>
 </a>`;
 }

 function renderGirlsPreview() {
 const el = $('#girlsPreviewGrid');
 if (!el || !YZA.media?.yzaGirls?.length) return;
 const publicGirls = YZA.media.yzaGirls
 .filter((girl) => isPublicMedia(girl.src))
 .filter((girl) => !/la vague/i.test([girl.product, girl.alt, girl.id].filter(Boolean).join(' ')));
 el.innerHTML = publicGirls.slice(0, 12).map((girl, index) => girlsFeedCardHTML(girl, index)).join('');
 el.querySelectorAll('[data-shop-look]').forEach((link) => {
 link.addEventListener('click', () => YZA.analytics?.track('yza_girls_shop_look_click', { handle: link.dataset.shopLook || '', source: 'home_preview' }));
 });
 }

 function renderGirlsPage() {
 const wall = $('#girlsMasonry');
 if (!wall || !YZA.media?.yzaGirls?.length) return;
 const publicGirls = YZA.media.yzaGirls.filter((girl) => isPublicMedia(girl.src));
 wall.innerHTML = publicGirls.map((girl, index) => girlsCardHTML(girl, index)).join('');
 wall.querySelectorAll('[data-shop-look]').forEach((link) => {
 link.addEventListener('click', () => YZA.analytics?.track('yza_girls_shop_look_click', { handle: link.dataset.shopLook || '', source: 'girls_page' }));
 });

 // Track every image already shown so nothing repeats further down the page.
 const used = new Set(publicGirls.map((girl) => girl.src));
 const pickImages = (images, n) => {
 const out = [];
 (images || []).filter(isPublicMedia).forEach((src) => { if (out.length < n && !used.has(src)) { used.add(src); out.push(src); } });
 return out;
 };

 const storyMap = $('#girlsProductMap');
 if (storyMap) {
 const keys = ['jaune', 'violet', 'noir', 'rouge', 'bags', 'charms', 'rtw'];
 storyMap.innerHTML = keys.map((key) => {
 const story = YZA.media.productStories?.[key];
 if (!story) return '';
 const title = mediaText(story.title);
 const text = mediaText(story.text);
 return `<article class="girls-product-story" id="${esc(key)}">
 <div class="girls-product-story__copy">
 <p class="eyebrow">${esc(mediaText(story.label))}</p>
 <h3>${esc(title)}</h3>
 <p>${esc(text)}</p>
 <a class="link-underline" href="${story.cta || 'collections.html'}">${T().t('cta.shop')}</a>
 </div>
 <div class="girls-product-story__images">
 ${pickImages(story.images, 3).map((src) => `<span>${mediaImg(src, title, 'width="560" height="720"')}</span>`).join('')}
 </div>
 </article>`;
 }).join('');
 }

 renderArchiveWall(used);
 }

 async function renderArchiveWall(used) {
 used = used instanceof Set ? used : new Set();
 const el = $('#girlsArchiveWall');
 if (!el || el.dataset.loaded) return;
 el.dataset.loaded = 'loading';
 try {
 let data = null;
 const ledger = await fetch('data/media-ledger-public.json').catch(() => null);
 if (ledger?.ok) data = await ledger.json();
 if (!data) { el.dataset.loaded = 'empty'; el.innerHTML = ''; return; }
 // Visual blocklist (data/archive-blocklist-public.json): public-safe paths flagged by pixel
 // analysis as black-background cutouts, logos/glyphs, or document-page scans.
 // Keeps the living wall to real editorial photography only.
 const norm = (s) => String(s || '').replace(/\\/g, '/');
 let blocked = new Set();
 try {
 const bl = await fetch('data/archive-blocklist-public.json').then((r) => (r.ok ? r.json() : []));
 blocked = new Set((bl || []).map(norm));
 } catch (e) { /* no blocklist available -> fall back to pattern filter only */ }
 const blockedArchive = /postcard|family-tree|mastercard|visa|payment|favicon|logo|brand|map|waze|google|apple|whatsapp|charte|template|reference|intro-cafe|yza-lookbook-page-\d|p6[1-4]_img\d+_xref14/i;
 const entries = (data.entries || [])
 .filter((entry) => entry.kind === 'image')
 .filter((entry) => {
 if (entry.isReferenceOnly || entry.usage === 'private-reference') return false;
 const group = entry.group || entry.usageGroup || '';
 // Wholesale line sheets, order forms, brand-charter scans, QA shots and
 // internal dossier material must never surface as public imagery.
 if (['charte', 'raffia', 'dossier', 'linesheet2026', 'sheets', 'qa', 'audit', '_charms'].includes(group)) return false;
 if (/linesh|line-?sheet|order ?form|wholesale/i.test([entry.href, entry.fileName, entry.title].filter(Boolean).join(' '))) return false;
 if (blocked.has(norm(entry.href || entry.publicPath))) return false;
 const label = [entry.href, entry.publicPath, entry.fileName, entry.title, group].filter(Boolean).join(' ');
 if (blockedArchive.test(label) || !isPublicMedia(label)) return false;
 return ['lookbook', 'yza-girls'].includes(group) || entry.usage === 'public-yza-editorial' || entry.usage === 'public-yza-product';
 })
 .filter((entry) => entry.href || entry.publicPath)
 .filter((entry) => { const s = entry.href || entry.publicPath; if (!s || used.has(s)) return false; used.add(s); return true; })
 .slice(0, 220);
 el.innerHTML = entries.map((entry, index) => {
 const src = entry.href || entry.publicPath;
 return `<figure class="girls-archive-item" style="--i:${index}">
 ${mediaImg(src, entry.title || entry.fileName || 'YZA source image', `width="${entry.width || 640}" height="${entry.height || 860}"`)}
 </figure>`;
 }).join('');
 el.dataset.loaded = 'true';
 } catch (err) {
 el.dataset.loaded = 'error';
 el.innerHTML = '';
 console.warn('YZA archive wall could not load', err);
 }
 }

 /* ================= COLLECTIONS ================= */
 const collState = { cat: params.get('cat') || 'all', q: params.get('q') || '', sort: 'feat' };
 function collFiltered() {
 let list = YZA.byCategory(collState.cat);
 if (collState.q) {
 list = typeof YZA.searchProducts === 'function'
 ? YZA.searchProducts(collState.q, YZA.products.length, list).map((row) => row.product)
 : list;
 }
 if (collState.sort === 'asc') list = [...list].sort((a, b) => a.price - b.price);
 if (collState.sort === 'desc') list = [...list].sort((a, b) => b.price - a.price);
 return list;
 }
 // Charms-only editorial: raffia fruit charms in YZA studio and basket context.
 function renderCharmStyling() {
 const el = $('#charmStyling'); if (!el) return;
 if (collState.cat !== 'charms' || collState.q) { el.hidden = true; el.innerHTML = ''; return; }
 const t = T();
 const shots = [
 { src: 'assets/products/fruit-market/styling/charms-raffia-basket-bowl.jpg', cap: t.t('charm.style.cap1'), width: 1080, height: 1440 },
 { src: 'assets/products/fruit-market/styling/charms-atelier-raffia-detail.jpg', cap: t.t('charm.style.cap2'), width: 720, height: 961 },
 { src: 'assets/products/fruit-market/styling/charms-fruit-market-bundle.jpg', cap: t.t('charm.style.cap3'), width: 1536, height: 2048 },
 ];
 el.hidden = false;
 el.innerHTML = `
 <div class="charm-styling__head" data-reveal>
 <p class="eyebrow">${esc(t.t('charm.style.eyebrow'))}</p>
 <h2>${esc(t.t('charm.style.title'))}</h2>
 <p class="charm-styling__text">${esc(t.t('charm.style.text'))}</p>
 </div>
 <div class="charm-styling__grid">
 ${shots.map((s, i) => i === 0 ? `<figure class="charm-styling__item charm-styling__item--first" data-reveal style="--i:0">
 <img class="charm-desktop-img" src="${esc(s.src)}" alt="${esc(s.cap)} - YZA" loading="lazy" width="${s.width}" height="${s.height}" decoding="async">
 <video class="charm-mobile-video" autoplay muted loop playsinline preload="metadata" poster="${esc(s.src)}">
 <source src="assets/video/charm-styling.mp4" type="video/mp4">
 </video>
 <figcaption>${esc(s.cap)}</figcaption>
 </figure>` : `<figure class="charm-styling__item" data-reveal style="--i:${i}">
 <img src="${esc(s.src)}" alt="${esc(s.cap)} - YZA" loading="lazy" width="${s.width}" height="${s.height}" decoding="async">
 <figcaption>${esc(s.cap)}</figcaption>
 </figure>`).join('')}
 <figure class="charm-styling__item charm-styling__item--video" data-reveal style="--i:3">
 <video autoplay muted loop playsinline preload="metadata">
 <source src="assets/video/band-charm.mp4" type="video/mp4">
 </video>
 <figcaption>${esc(t.t('charm.style.videoCap'))}</figcaption>
 </figure>
 </div>
 <a class="link-underline charm-styling__cta" href="collections.html?cat=charms">${esc(t.t('cta.shopCharms'))}</a>`;
 if (document.documentElement.classList.contains('js')) requestAnimationFrame(wireReveal);
 }
 function renderCollections() {
 const grid = $('#collectionGrid'); if (!grid) return;
 const list = collFiltered();
 grid.classList.toggle('collection-grid--bag-families', collState.cat === 'bags');
 if (collState.cat === 'bags') renderBagCollectionGrid(grid, list);
 else renderCollectionGrid(grid, list);
 renderCharmStyling();
 const count = $('#resultCount'); if (count) count.textContent = list.length + ' ' + T().t('col.results');
 const titleKey = ({
 charms: 'col.charms',
 earrings: 'col.earrings',
 necklaces: 'col.necklaces',
 accessories: 'col.accessories',
 rtw: 'col.rtw',
 tops: 'col.tops',
 pareos: 'col.pareos',
 pants: 'col.pants',
 bottoms: 'col.bottoms',
 bags: 'col.bags',
 })[collState.cat] || 'col.all';
 const tEl = $('#collectionTitle'); if (tEl) { tEl.setAttribute('data-i18n', titleKey); tEl.textContent = T().t(titleKey); }
 const descKey = ({ charms: 'col.desc.charms', earrings: 'col.desc.accessories', necklaces: 'col.desc.accessories', accessories: 'col.desc.accessories', bags: 'col.desc.bags', rtw: 'col.desc.rtw', tops: 'col.desc.rtw', pareos: 'col.desc.rtw', pants: 'col.desc.rtw', bottoms: 'col.desc.rtw' })[collState.cat] || 'col.desc.all';
 const dEl = $('#collectionDesc'); if (dEl) { dEl.setAttribute('data-i18n', descKey); dEl.textContent = T().t(descKey); }
 // Top-level pills mirror the site nav exactly (Charms · Accessories · Bags · Prêt-à-porter).
 // Map any granular landing (earrings, tops, …) onto its parent pill so the active state is always clear.
 const PILL_PARENT = { earrings: 'accessories', necklaces: 'accessories', tops: 'rtw', pareos: 'rtw', pants: 'rtw', bottoms: 'rtw' };
 const activePill = PILL_PARENT[collState.cat] || collState.cat;
 $$('[data-cat]').forEach(b => {
 b.hidden = false;
 b.setAttribute('aria-pressed', b.dataset.cat === activePill ? 'true' : 'false');
 });
 if ($('#searchEcho')) $('#searchEcho').textContent = collState.q ? `"${collState.q}"` : '';
 }
 function wireCollections() {
 if (!$('#collectionGrid')) return;
 $$('[data-cat]').forEach(b => b.addEventListener('click', () => {
 collState.cat = b.dataset.cat;
 history.replaceState(null, '', 'collections.html' + (collState.cat !== 'all' ? '?cat=' + collState.cat : ''));
 collState.q = ''; const si = $('#collSearch'); if (si) si.value = '';
 YZA.analytics?.track('category_filter', { category: collState.cat });
 renderCollections();
 }));
 const sort = $('#sortSelect');
 if (sort) sort.addEventListener('change', () => { collState.sort = sort.value; renderCollections(); });
 }

 /* ================= PAGE PRODUIT ================= */
 function productPageCopy() {
 const lang = T().lang || 'fr';
 const copy = {
 fr: {
 similar: 'Produits similaires',
 also: 'Vous aimerez aussi',
 all: 'Tout voir',
 supportKicker: 'Besoin d aide ?',
 supportTitle: 'Toutes les reponses avant de commander',
 phone: 'Telephone / WhatsApp',
 store: 'Boutique Marrakech',
 prices: 'Guide prix',
 menus: 'Menus utiles',
 craft: 'Chaque piece est crochetee a la main dans l atelier de Guéliz, Marrakech. Pas de machine, peu de quantites, finitions controlees piece par piece.',
 scarce: 'Edition limitee: une fois vendue, la piece ne sera pas refaite a l identique.',
 add: 'Ajouter rapidement',
 },
 en: {
 similar: 'Similar products',
 also: 'You may also like',
 all: 'All products',
 supportKicker: 'Need help?',
 supportTitle: 'Everything buyers need before ordering',
 phone: 'Phone / WhatsApp',
 store: 'Marrakech store',
 prices: 'Price guide',
 menus: 'Useful menus',
 craft: 'Every piece is hand-crocheted in the Guéliz, Marrakech atelier. No machine shortcut, small quantities, finishing checked piece by piece.',
 scarce: 'Limited edition: once sold, the same piece is not remade.',
 add: 'Quick add',
 },
 es: {
 similar: 'Productos similares',
 also: 'Tambien te puede gustar',
 all: 'Ver todo',
 supportKicker: 'Necesitas ayuda?',
 supportTitle: 'Todo antes de comprar',
 phone: 'Telefono / WhatsApp',
 store: 'Tienda Marrakech',
 prices: 'Guia de precios',
 menus: 'Menus utiles',
 craft: 'Cada pieza esta tejida a crochet a mano en el atelier de Guéliz, Marrakech, en pequenas cantidades.',
 scarce: 'Edicion limitada: cuando se agota, no se rehace igual.',
 add: 'Anadir rapido',
 },
 tr: {
 similar: 'Benzer urunler',
 also: 'Bunlari da sevebilirsin',
 all: 'Tum urunler',
 supportKicker: 'Yardim lazim mi?',
 supportTitle: 'Siparis oncesi tum bilgiler',
 phone: 'Telefon / WhatsApp',
 store: 'Marakes magaza',
 prices: 'Fiyat rehberi',
 menus: 'Faydali menuler',
 craft: 'Her parca Guéliz, Marrakech atolyelerinde elle krose yapilir, kucuk adetlerle uretilir.',
 scarce: 'Sinirli uretim: tukenen parca ayni sekilde tekrar uretilmez.',
 add: 'Hizli ekle',
 },
 ar: {
 similar: 'منتجات مشابهة',
 also: 'قد يعجبك ايضا',
 all: 'عرض الكل',
 supportKicker: 'تحتاجين مساعدة؟',
 supportTitle: 'كل المعلومات قبل الطلب',
 phone: 'الهاتف / واتساب',
 store: 'متجر مراكش',
 prices: 'دليل الاسعار',
 menus: 'روابط مفيدة',
 craft: 'كل قطعة تصنع بالكروشيه يدويا في ورشة كليز وبكميات صغيرة مع فحص التشطيب قطعة بقطعة.',
 scarce: 'اصدار محدود: عند النفاد لا يعاد انتاج نفس القطعة.',
 add: 'اضافة سريعة',
 },
 };
 return copy[lang] || copy.fr;
 }

 function priceRangeLabel(list) {
 const prices = list.map((p) => p.price).filter(Boolean);
 if (!prices.length) return '-';
 const min = Math.min(...prices);
 const max = Math.max(...prices);
 return min === max ? T().formatPrice(min) : `${T().formatPrice(min)} - ${T().formatPrice(max)}`;
 }

  function productSupportHTML(p) {
    const t = T();
    const lang = t.lang || 'fr';
    const copy = {
      fr: [
        ['LIVRAISON OFFERTE DES 1 500 DH', 'Livraison suivie au Maroc et retrait possible au studio de Gueliz.'],
        ['RETOURS 30 JOURS', 'Essayez tranquillement, retour possible si la piece reste non portee.'],
        ['ATELIER FEMININ A MARRAKECH', 'Chaque piece passe par les mains de notre atelier.'],
      ],
      en: [
        ['FREE SHIPPING FROM 1,500 DH', 'Tracked Morocco delivery and studio pickup in Gueliz.'],
        ['30-DAY RETURNS', 'Try it calmly, return it unworn if it is not right.'],
        ['WOMEN-LED ATELIER IN MARRAKECH', 'Every piece passes through the hands of our atelier.'],
      ],
      es: [
        ['ENVIO GRATIS DESDE 1.500 DH', 'Entrega con seguimiento en Marruecos y recogida en Gueliz.'],
        ['DEVOLUCIONES 30 DIAS', 'Pruebala con calma, devuelvela sin usar si no encaja.'],
        ['ATELIER FEMENINO EN MARRAKECH', 'Cada pieza pasa por las manos de nuestro atelier.'],
      ],
      tr: [
        ['1.500 DH UZERI UCRETSIZ TESLIMAT', 'Fas ici takipli teslimat ve Gueliz studyo teslimi.'],
        ['30 GUN IADE', 'Sakin deneyin, kullanilmadiysa iade edin.'],
        ['MARRAKECH KADIN ATOLYESI', 'Her parca atolyemizin ellerinden gecer.'],
      ],
      ar: [
        ['توصيل مجاني من 1,500 درهم', 'توصيل متتبع داخل المغرب واستلام من استوديو كليز.'],
        ['ارجاع خلال 30 يوما', 'جربيها بهدوء، ويمكن ارجاعها غير مستعملة.'],
        ['اتولييه نسائي في مراكش', 'كل قطعة تمر بين ايدي اتولييهنا.'],
      ],
    };
    const icons = ['shipping', 'returns', 'repair'];
    return `<div class="product-support__reassurance">
      ${(copy[lang] || copy.fr).map((item, index) => `<article class="product-support__tile">
        <span class="product-support__icon">${YZA.serviceIcons?.[icons[index]] || ''}</span>
        <h2>${esc(item[0])}</h2>
        <p>${esc(item[1])}</p>
      </article>`).join('')}
    </div>`;
  }

  function railCardHTML(p, index = 0) {
    return cardHTML(p, index);
  }

 // Tifinagh sign per product - Amazigh script, decorative (aucune signification imposée).
 const TIFINAGH_MAP = [
 [/cherr/i, 'ⵣ'],
 [/grape/i, 'ⴰ'],
 [/whole-lemon|lemon-slice|lemon-raffia/i, 'ⵓ'],
 [/whole-orange|orange-slice|orange-raffia/i, 'ⵔ'],
 [/tomato/i, 'ⵜ'],
 [/avocado/i, 'ⵎ'],
 [/kiwi/i, 'ⵏ'],
 [/watermelon|pasteque/i, 'ⵡ'],
 [/nouvelle-vague/i, 'ⵍ'],
 ];
 function motifTag(p) {
 const h = (p && p.handle) || '';
 for (const [re, sign] of TIFINAGH_MAP) if (re.test(h)) return `<span class="product-tifinagh" aria-hidden="true">${sign}</span>`;
 return '';
 }
 function renderProductStory(p) {
 const root = $('#productStory');
 if (!root) return;
 if (p.fruitStory) {
 const t = T();
 const story = p.fruitStory;
 const gal = productGallery(p).filter(isPublicMedia);
 const images = [...new Set([...(gal.slice(1, 5)), p.img].filter(Boolean))].slice(0, 4);
 root.hidden = false;
 root.innerHTML = `<div class="product-color-story__inner charm-story" data-reveal>
 <div class="product-color-story__copy charm-story__copy">
 ${motifTag(p)}
 <p class="eyebrow">Fruit Market</p>
 <h2>${esc(t.pick(story.title))}</h2>
 <p>${esc(t.pick(story.body))}</p>
 <div class="charm-story__collection">
 <h3>${esc(t.pick(story.collectionTitle))}</h3>
 <p>${esc(t.pick(story.collectionBody))}</p>
 </div>
 <div class="product-color-story__facts">
 <span>${p.hours ? `${String(p.hours).replace('.', ',')} h crochet` : t.t('pp.limited')}</span>
 <span>${p.dimensions ? esc(t.pick(p.dimensions)).split('(')[0].trim() : t.t('pp.limited')}</span>
 </div>
 <a class="link-underline" href="collections.html?cat=charms">${esc(t.t('cta.shopCharms') || t.t('cta.shop'))}</a>
 </div>
 <div class="product-color-story__grid">
 ${images.map((src, index) => `<figure class="product-color-story__image product-color-story__image--${index}">
 ${mediaImg(src, `${t.pick(p.name)} - YZA Fruit Market`, 'width="760" height="980"')}
 </figure>`).join('')}
 </div>
 </div>`;
 return;
 }
 const story = YZA.media?.pickStory?.(p);
 if (!story) {
 root.hidden = true;
 root.innerHTML = '';
 return;
 }
 const t = T();
 const title = mediaText(story.title);
 const text = mediaText(story.text);
 const label = mediaText(story.label);
 const images = [...new Set([p.img, ...(story.images || [])].filter(Boolean))].filter(isPublicMedia).slice(0, 4);
 root.hidden = false;
 root.innerHTML = `<div class="product-color-story__inner" data-reveal>
 <div class="product-color-story__copy">
 ${motifTag(p)}
 <p class="eyebrow">${esc(label)}</p>
 <h2>${esc(title)}</h2>
 <p>${esc(text)}</p>
 <div class="product-color-story__facts">
 <span>${p.hours ? `${String(p.hours).replace('.', ',')} h crochet` : t.t('pp.limited')}</span>
 <span>${p.edition ? esc(t.pick(p.edition)).split('.')[0] : t.t('pp.limited')}</span>
 </div>
 <a class="link-underline" href="${story.cta || 'collections.html'}">${esc(t.t('cta.shop'))}</a>
 </div>
 <div class="product-color-story__grid">
 ${images.map((src, index) => `<figure class="product-color-story__image product-color-story__image--${index}">
 ${mediaImg(src, `${t.pick(p.name)} - YZA story`, 'width="760" height="980"')}
 </figure>`).join('')}
 </div>
 </div>`;
 }

 function renderProductLifestyleStrip(p) {
 const strip = $('#productLifestyleStrip');
 if (!strip) return;
 if (p.lifestyleVideo) {
 strip.hidden = false;
 strip.innerHTML = `
 <div class="lifestyle-strip__inner">
 <video class="lifestyle-strip__vid" autoplay muted loop playsinline preload="metadata">
 <source src="${esc(p.lifestyleVideo)}" type="video/mp4">
 </video>
 <div class="lifestyle-strip__overlay">
 <p class="eyebrow lifestyle-strip__kicker">En situation</p>
 </div>
 </div>`;
 } else {
 strip.hidden = true;
 }
 }

 function renderProductSupport(p) {
 const panel = $('#productSupport');
 if (!panel) return;
 panel.innerHTML = productSupportHTML(p);
 }

  function renderProductRails(p) {
  const c = productPageCopy();
  const similarRail = $('#similarRail');
  const similarLabel = $('#productRailSimilarLabel');
  const alsoLabel = $('#productRailAlsoLabel');
  if (similarLabel) similarLabel.textContent = c.similar;
  if (alsoLabel) alsoLabel.textContent = c.also;
  if (!similarRail) return;

    const promoOk = typeof YZA.isLaunchPromoProduct === 'function' ? YZA.isLaunchPromoProduct : (x) => x && x.launchPromo !== false;
    const available = (x) => !YZA.inventoryStatus?.(x).soldOut && promoOk(x);
    const sameCategory = YZA.byCategory(p.category).filter((x) => x.handle !== p.handle && available(x));
    const sameGroup = p.group ? YZA.products.filter((x) => x.group === p.group && x.handle !== p.handle && available(x)) : [];
 const similar = [...sameCategory, ...sameGroup.filter((x) => !sameCategory.some((s) => s.handle === x.handle))]
 .slice(0, 12);
    const also = YZA.related(p.handle, 16).filter(available).slice(0, 12);

  const lists = { similar, also: also.length ? also : similar };
  const tabs = $$('.product-tabs__tab');
  const renderTab = (name) => {
  tabs.forEach((tab) => {
  const active = tab.dataset.productTab === name;
  tab.classList.toggle('is-active', active);
  tab.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  similarRail.dataset.activeTab = name;
  buildSwiper(similarRail, lists[name] || similar, railCardHTML);
  };
  tabs.forEach((tab) => {
  tab.onclick = () => renderTab(tab.dataset.productTab || 'similar');
  });
  renderTab(similarRail.dataset.activeTab || 'similar');
  }

 function renderProductBundle(p) {
 const panel = $('#pBundle');
 if (!panel) return;
 const bundle = typeof YZA.bundleForProduct === 'function' ? YZA.bundleForProduct(p.handle) : null;
 if (!bundle || bundle.items.length < 2) {
 panel.hidden = true;
 panel.innerHTML = '';
 return;
 }

 const t = T();
 panel.hidden = false;
 panel.innerHTML = `<div class="bundle-panel__head">
 <div>
 <span class="bundle-panel__kicker" data-i18n="pp.bundle.title">${t.t('pp.bundle.title')}</span>
 <h3>${esc(t.pick(bundle.title))}</h3>
 </div>
 <strong>${t.formatPrice(bundle.total)}</strong>
 </div>
 <p>${esc(t.pick(bundle.note))}</p>
 <div class="bundle-panel__items" aria-label="${t.t('pp.bundle.includes')}">
 ${bundle.items.map((item) => `<a href="produit.html?handle=${item.handle}">
 <img aria-hidden="true" src="${item.img}" alt="" width="54" height="72" loading="lazy" decoding="async">
 <span>${esc(t.pick(displayName(item)))}<small>${t.formatPrice(item.price)}</small></span>
 </a>`).join('')}
 </div>
 <button class="btn btn--solid btn--block" data-bundle-add>${t.t('pp.bundle.add')}</button>`;

 panel.querySelector('[data-bundle-add]')?.addEventListener('click', () => {
 bundle.items.forEach((item) => YZA.cart.add(item.handle, '', 1));
 YZA.cart.open();
 YZA.analytics?.track('bundle_add', {
 sourceHandle: p.handle,
 handles: bundle.items.map((item) => item.handle),
 total: bundle.total,
 });
 const btn = panel.querySelector('[data-bundle-add]');
 btn.textContent = t.t('pp.bundle.added');
 setTimeout(() => { btn.textContent = t.t('pp.bundle.add'); }, 1500);
 });
 }

  function productPriceHTML(p) {
    const t = T();
    return (p.compareAt && p.compareAt > p.price ? `<s class="was">${t.formatPrice(p.compareAt)}</s> ` : '') + t.formatPrice(p.price);
  }
  function productPriceCompact(p) {
    const t = T();
    const price = t.formatPrice(p.price).replace(/\s*DH\b/i, ' dh');
    return p.compareAt && p.compareAt > p.price
      ? `<s class="was">${t.formatPrice(p.compareAt).replace(/\s*DH\b/i, ' dh')}</s> ${price}`
      : price;
  }

 function productGallery(product) {
 const gallery = product.familyGallery?.length
 ? product.familyGallery
 : (product.gallery || [product.img]);
 const safe = [...new Set([product.img, ...(gallery || [])].filter(Boolean))].filter(isPublicMedia);
 return safe.length ? safe : [product.img];
 }

 function textObj(fr, en = fr) {
 return { fr, en, es: en, tr: en, ar: en };
 }
 function slugLite(value) {
 return String(value || '')
 .normalize('NFD')
 .replace(/[\u0300-\u036f]/g, '')
 .toLowerCase()
 .replace(/[^a-z0-9]+/g, '-')
 .replace(/^-|-$/g, '');
 }
 function resolveBagVariant(baseProduct) {
 if (!baseProduct || baseProduct.category !== 'bags') return null;
 const queryColor = params.get('color');
 if (queryColor && typeof YZA.bagVariantFor === 'function') {
 const direct = YZA.bagVariantFor(baseProduct.handle, queryColor);
 if (direct) return direct;
 }
 const visual = baseProduct.visualColor || baseProduct.color;
 const colorKeys = [visual?.fr, visual?.en].map(slugLite).filter(Boolean);
 for (const row of YZA.bagRows || []) {
 const match = (row.items || []).find((item) => {
 if (item.handle !== baseProduct.handle) return false;
 const itemKeys = [item.colorSlug, item.color?.fr, item.color?.en].map(slugLite).filter(Boolean);
 return itemKeys.some((key) => colorKeys.includes(key));
 });
 if (match) return { ...match, row };
 }
 return null;
 }
 function bagViewProduct(baseProduct, bagVariant) {
 if (!bagVariant) return baseProduct;
 const title = bagVariant.title || baseProduct.displayName || baseProduct.name;
 const short = bagVariant.short || baseProduct.displayShort || baseProduct.short;
 const colorFr = bagVariant.color?.fr || '';
 const colorEn = bagVariant.color?.en || colorFr;
 const size = bagVariant.size || baseProduct.visualSize || '';
 const desc = textObj(
 `${title.fr}: panier YZA en feuilles de bananier, raphia, cuir et perles. Cette page montre le format ${size} en couleur ${colorFr}.`,
 `${title.en}: YZA basket in banana leaves, raffia, leather and beads. This page shows the ${size} scale with the ${colorEn.toLowerCase()} finish.`
 );
 return {
 ...baseProduct,
 name: title,
 displayName: title,
 short,
 displayShort: short,
 desc,
 img: bagVariant.img || baseProduct.img,
 gallery: bagVariant.gallery || baseProduct.gallery,
 color: bagVariant.color || baseProduct.color,
 visualColor: bagVariant.color || baseProduct.visualColor,
 visualSize: size,
 availableColors: bagVariant.color ? [bagVariant.color] : baseProduct.availableColors,
 availableSizes: size ? [size] : baseProduct.availableSizes,
 activeVariantLabel: textObj(`${size} / ${colorFr}`, `${size} / ${colorEn}`),
 selectedBagVariant: bagVariant,
 };
 }

 function ensureVariantWrap() {
 let wrap = $('#pVariants');
 if (wrap) return wrap;
 wrap = document.createElement('div');
 wrap.className = 'option option--variants';
 wrap.id = 'pVariants';
 wrap.hidden = true;
 wrap.innerHTML = '<div class="option__label" data-variant-label>Options</div><div class="chips chips--variants" id="pVariantOpts"></div>';
 const qtyOption = $('#pQty')?.closest('.option');
 qtyOption?.before(wrap);
 return wrap;
 }

 function ensureProductProofWrap() {
 let wrap = $('#pProof');
 if (wrap) return wrap;
 wrap = document.createElement('section');
 wrap.className = 'product-proof';
 wrap.id = 'pProof';
 const bundle = $('#pBundle');
 bundle?.before(wrap);
 return wrap;
 }

 function renderServiceStrips() {
 const defaultKeys = ['morocco-delivery', 'returns', 'payment', 'limited', 'repairs'];
 const footerKeys = ['morocco-delivery', 'returns', 'payment', 'limited', 'repairs'];
 $$('[data-service-strip]').forEach((strip) => {
 const keys = strip.dataset.serviceStrip === 'footer' ? footerKeys : defaultKeys;
 const className = strip.dataset.serviceStrip === 'footer'
 ? 'footer-service__item footer-service__trust-item'
 : 'service-card';
 strip.innerHTML = keys.map((key) => YZA.serviceCard(key, className)).join('');
 });
 }

 function renderProductTrustChips(p) {
 const wrap = $('#pTrustChips');
 if (!wrap || !p) return;
 const t = T();
 const isAccessories = p.group === 'accessories';
 const threshold = isAccessories
 ? (YZA.servicePolicy?.freeShippingAccessoriesDh || 50000)
 : (YZA.servicePolicy?.freeShippingDh || 150000);
 const deliveryFeature = YZA.serviceFeature('morocco-delivery');
 const deliveryChip = deliveryFeature ? `<span class="product-trust-chip" data-service-chip="morocco-delivery">
 ${YZA.serviceIcon(deliveryFeature.icon, 'product-trust-chip__icon')}
 <span>${t.pick({ fr: `Livraison offerte dès ${t.formatPrice(threshold)}`, en: `Free delivery from ${t.formatPrice(threshold)}` })}</span>
 </span>` : '';
 wrap.innerHTML = deliveryChip + ['returns', 'repairs'].map((key) => YZA.serviceChip(key)).join('');
 }

 function buyingProofCopy() {
 const lang = T().lang || 'fr';
 const copy = {
 fr: {
 title: 'Fait à l\'atelier',
 handwork: 'Travail main',
 material: 'Matière',
 scale: 'Dimensions / échelle',
 fits: 'Ce qui rentre',
 attachment: 'Accroche',
 care: 'Entretien',
 packaging: 'Prêt à offrir',
 batch: 'Série',
 shipping: 'Livraison',
 returns: 'Retours',
 ask: 'Question sur WhatsApp',
 sizeGuide: 'Comparer les tailles',
 styleTip: 'Conseil',
 note: 'Note',
 },
 en: {
 title: 'Buying proof',
 handwork: 'Handwork',
 material: 'Material',
 scale: 'Dimensions / scale',
 fits: 'What fits',
 attachment: 'Attachment',
 care: 'Care',
 packaging: 'Gift-ready',
 batch: 'Batch',
 shipping: 'Shipping',
 returns: 'Returns',
 ask: 'Ask on WhatsApp',
 sizeGuide: 'Compare sizes',
 styleTip: 'Style tip',
 note: 'Note',
 },
 es: {
 title: 'Prueba de compra',
 handwork: 'Trabajo manual',
 material: 'Material',
 scale: 'Escala',
 fits: 'Que cabe',
 attachment: 'Enganche',
 care: 'Cuidado',
 packaging: 'Listo para regalar',
 batch: 'Serie',
 shipping: 'Envio',
 returns: 'Devoluciones',
 ask: 'Pregunta por WhatsApp',
 sizeGuide: 'Comparar tallas',
 styleTip: 'Consejo',
 note: 'Nota',
 },
 tr: {
 title: 'Satin alma kaniti',
 handwork: 'El isi',
 material: 'Malzeme',
 scale: 'Olcek',
 fits: 'Icine siganlar',
 attachment: 'Takma',
 care: 'Bakim',
 packaging: 'Hediye hazir',
 batch: 'Seri',
 shipping: 'Teslimat',
 returns: 'Iade',
 ask: 'WhatsApp soru',
 sizeGuide: 'Bedenleri karsilastir',
 styleTip: 'Stil ipucu',
 note: 'Not',
 },
 ar: {
 title: '\u062F\u0644\u064A\u0644 \u0627\u0644\u0634\u0631\u0627\u0621',
 handwork: '\u0639\u0645\u0644 \u064A\u062F\u0648\u064A',
 material: '\u0627\u0644\u062E\u0627\u0645\u0629',
 scale: '\u0627\u0644\u062D\u062C\u0645',
 fits: '\u0645\u0627 \u064A\u062A\u0633\u0639 \u0644\u0647',
 attachment: '\u0627\u0644\u062A\u0639\u0644\u064A\u0642',
 care: '\u0627\u0644\u0639\u0646\u0627\u064A\u0629',
 packaging: '\u062C\u0627\u0647\u0632 \u0644\u0644\u0647\u062F\u064A\u0629',
 batch: '\u0627\u0644\u0633\u0644\u0633\u0644\u0629',
 shipping: '\u0627\u0644\u0634\u062D\u0646',
 returns: '\u0627\u0644\u0625\u0631\u062C\u0627\u0639',
 ask: '\u0633\u0624\u0627\u0644 \u0639\u0644\u0649 WhatsApp',
 sizeGuide: '\u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u0645\u0642\u0627\u0633\u0627\u062A',
 styleTip: '\u0646\u0635\u064A\u062D\u0629',
 note: '\u0645\u0644\u0627\u062D\u0638\u0629',
 },
 };
 return copy[lang] || copy.fr;
 }

 function productQuestionUrl(product) {
 const phone = (YZA.brand.whatsapp || '').replace(/\D/g, '');
 const t = T();
 const message = [
 'Bonjour YZA, j ai une question avant de commander.',
 `Produit: ${t.pick(displayName(product))}`,
 `Prix: ${t.formatPrice(product.price)}`,
 `Lien: ${location.href}`,
 ].join('\n');
 return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
 }

 function renderProductBuyingProof(product) {
 const wrap = ensureProductProofWrap();
 if (!wrap || !product) return;
 const t = T();
 const c = buyingProofCopy();
 const fields = [
 [c.handwork, product.handworkTime && t.pick(product.handworkTime)],
 [c.material, product.material ? t.pick(product.material) : product.fabric && t.pick(product.fabric)],
 [c.scale, product.dimensions ? t.pick(product.dimensions) : product.size && t.pick(product.size)],
 [c.fits, product.whatFits && t.pick(product.whatFits)],
 [c.attachment, product.attachment && t.pick(product.attachment)],
 [c.care, product.care && t.pick(product.care)],
 [c.packaging, product.packaging && t.pick(product.packaging)],
 [c.batch, product.batch && t.pick(product.batch)],
 [c.shipping, YZA.pickText(YZA.serviceFeature('morocco-delivery')?.text)],
 [c.returns, YZA.pickText(YZA.serviceFeature('returns')?.text)],
 ].filter((row) => row[1]);
 const sizeGuide = product.category === 'bags' && Array.isArray(product.sizeComparison)
 ? `<div class="product-proof__sizes">
 <h3>${esc(c.sizeGuide)}</h3>
 ${product.sizeComparison.map((row) => `<div>
 <strong>${esc(t.pick(row.label))} <span>${t.formatPrice(row.price)}</span></strong>
 <p>${esc(t.pick(row.whatFits))}</p>
 </div>`).join('')}
 </div>`
 : '';
 wrap.innerHTML = `<div class="product-proof__head">
 <p class="eyebrow">${esc(YZA.brand.masterIdea || 'Modern Marrakech wear')}</p>
 <h2>${esc(c.title)}</h2>
 <a class="link-underline" href="${productQuestionUrl(product)}" target="_blank" rel="noopener" data-product-question>${esc(c.ask)}</a>
 </div>
 <div class="product-proof__grid">
 ${fields.map(([label, value]) => `<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('')}
 </div>
 ${sizeGuide}`;
 wrap.querySelector('[data-product-question]')?.addEventListener('click', () => {
 YZA.analytics?.track('product_question_whatsapp', { handle: product.handle, category: product.category });
 });
 }

  function variantLabelFor(product, t) {
    if (product.category === 'bags') return t.t('pp.size');
 if (product.familyHandle === 'jawhara-pareos') {
 return { fr: 'Longueur', en: 'Length', es: 'Largo', tr: 'Uzunluk', ar: 'الطول' }[t.lang] || 'Length';
 }
 if (product.familyHandle === 'jawhara-pants') {
 return { fr: 'Modele', en: 'Model', es: 'Modelo', tr: 'Model', ar: 'الموديل' }[t.lang] || 'Model';
 }
    return t.t('pp.acc.details');
  }

  function productUiCopy() {
    const lang = T().lang || 'fr';
    const copy = {
      fr: {
        add: 'AJOUTER AU PANIER',
        color: 'Couleur',
        delivery: 'Livraison le jour meme',
        hint: 'Envoyer un indice',
        deliveryTitle: 'Livraison le jour meme',
        deliveryBody: 'Disponible a Marrakech selon zone et horaire. Ecrivez-nous sur WhatsApp pour confirmer le tarif et le creneau.',
        sizeFit: 'SIZE & FIT NOTES',
        care: 'COMPOSITION AND CARE',
        returns: 'DELIVERY, EXCHANGES AND RETURNS',
        questions: 'QUESTIONS',
        share: 'SHARE',
        ask: 'Ouvrir WhatsApp',
        shareCopy: 'Copier le lien',
        copied: 'Lien copie',
        hintText: 'Bonjour YZA, je pense que cette piece pourrait te plaire :',
        sold: 'Epuise',
      },
      en: {
        add: 'ADD TO BAG',
        color: 'Color',
        delivery: 'Same Day Delivery',
        hint: 'Drop A Hint',
        deliveryTitle: 'Same Day Delivery',
        deliveryBody: 'Available in Marrakech depending on zone and timing. Message us on WhatsApp to confirm the fee and slot.',
        sizeFit: 'SIZE & FIT NOTES',
        care: 'COMPOSITION AND CARE',
        returns: 'DELIVERY, EXCHANGES AND RETURNS',
        questions: 'QUESTIONS',
        share: 'SHARE',
        ask: 'Open WhatsApp',
        shareCopy: 'Copy link',
        copied: 'Link copied',
        hintText: 'Hello YZA, I think this piece might be perfect for you:',
        sold: 'Sold out',
      },
      es: {
        add: 'ANADIR A LA CESTA',
        color: 'Color',
        delivery: 'Entrega el mismo dia',
        hint: 'Enviar una pista',
        deliveryTitle: 'Entrega el mismo dia',
        deliveryBody: 'Disponible en Marrakech segun zona y horario. Escribenos por WhatsApp para confirmar tarifa y franja.',
        sizeFit: 'TALLA Y AJUSTE',
        care: 'COMPOSICION Y CUIDADOS',
        returns: 'ENTREGA, CAMBIOS Y DEVOLUCIONES',
        questions: 'PREGUNTAS',
        share: 'COMPARTIR',
        ask: 'Abrir WhatsApp',
        shareCopy: 'Copiar enlace',
        copied: 'Enlace copiado',
        hintText: 'Hola YZA, creo que esta pieza te puede gustar:',
        sold: 'Agotado',
      },
      tr: {
        add: 'SEPETE EKLE',
        color: 'Renk',
        delivery: 'Ayni gun teslimat',
        hint: 'Ipucu gonder',
        deliveryTitle: 'Ayni gun teslimat',
        deliveryBody: 'Marrakech icinde bolge ve saate gore mumkun. Ucret ve zaman icin WhatsApp tan yazin.',
        sizeFit: 'BEDEN VE KALIP',
        care: 'ICERIK VE BAKIM',
        returns: 'TESLIMAT, DEGISIM VE IADE',
        questions: 'SORULAR',
        share: 'PAYLAS',
        ask: 'WhatsApp ac',
        shareCopy: 'Baglantiyi kopyala',
        copied: 'Baglanti kopyalandi',
        hintText: 'Merhaba YZA, bu parca sana yakisabilir:',
        sold: 'Tukendi',
      },
      ar: {
        add: 'اضافة الى السلة',
        color: 'اللون',
        delivery: 'توصيل في نفس اليوم',
        hint: 'ارسال تلميح',
        deliveryTitle: 'توصيل في نفس اليوم',
        deliveryBody: 'متاح داخل مراكش حسب المنطقة والوقت. راسلينا عبر واتساب لتأكيد السعر والموعد.',
        sizeFit: 'المقاس والملاءمة',
        care: 'التركيب والعناية',
        returns: 'التوصيل والاستبدال والارجاع',
        questions: 'اسئلة',
        share: 'مشاركة',
        ask: 'فتح واتساب',
        shareCopy: 'نسخ الرابط',
        copied: 'تم نسخ الرابط',
        hintText: 'مرحبا YZA، أعتقد أن هذه القطعة قد تعجبك:',
        sold: 'نفد',
      },
    };
    return copy[lang] || copy.fr;
  }

  function productBullets(product) {
    const t = T();
    const rows = [
      product.material && t.pick(product.material),
      product.fabric && t.pick(product.fabric),
      product.handworkTime && t.pick(product.handworkTime),
      product.dimensions && t.pick(product.dimensions),
      product.edition && t.pick(product.edition),
      product.packaging && t.pick(product.packaging),
    ].filter(Boolean);
    if (!rows.length && product.features) rows.push(...product.features.map((x) => t.pick(x)).filter(Boolean));
    return rows.slice(0, 5);
  }

  function swatchStyle(name) {
    const n = String(name || '').toLowerCase();
    if (/noir|black/.test(n)) return 'background:var(--black)';
    if (/blanc|white|cream/.test(n)) return 'background:var(--paper-card)';
    if (/rouge|red|clay|terracotta|orange/.test(n)) return 'background:var(--terracotta)';
    if (/jaune|yellow|mustard|moutarde|gold/.test(n)) return 'background:var(--brand-yellow)';
    if (/violet|purple/.test(n)) return 'background:var(--violet)';
    if (/vert|green|olive/.test(n)) return 'background:var(--brand-olive)';
    return 'background:var(--n-grege)';
  }

  function renderProductSwatches(product) {
    const wrap = $('#pColorWrap');
    if (!wrap) return;
    const t = T();
    const c = productUiCopy();
    const colors = product.availableColors?.length
      ? product.availableColors.map((item) => t.pick(item)).filter(Boolean)
      : [product.color && t.pick(product.color), product.variantLabel && t.pick(product.variantLabel)].filter(Boolean);
    if (!colors.length) { wrap.hidden = true; return; }
    wrap.hidden = false;
    $('#pColorLabel').textContent = c.color;
    $('#pColorName').textContent = colors[0];
    $('#pColorSwatches').innerHTML = colors.slice(0, 6).map((name, index) =>
      `<button type="button" class="product-color__swatch${index === 0 ? ' is-active' : ''}" aria-label="${esc(name)}" title="${esc(name)}" style="${swatchStyle(name)}" data-color-name="${esc(name)}"></button>`
    ).join('');
    $('#pColorSwatches').onclick = (event) => {
      const btn = event.target.closest('[data-color-name]');
      if (!btn) return;
      $$('#pColorSwatches .product-color__swatch').forEach((el) => el.classList.remove('is-active'));
      btn.classList.add('is-active');
      $('#pColorName').textContent = btn.dataset.colorName || '';
    };
  }

  function openProductModal(title, body) {
    let modal = $('#productMiniModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'product-mini-modal';
      modal.id = 'productMiniModal';
      modal.innerHTML = '<div class="product-mini-modal__card" role="dialog" aria-modal="true"><button type="button" class="product-mini-modal__close" aria-label="Close">+</button><h2></h2><p></p></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', (event) => {
        if (event.target === modal || event.target.closest('.product-mini-modal__close')) modal.classList.remove('is-open');
      });
    }
    modal.querySelector('h2').textContent = title;
    modal.querySelector('p').textContent = body;
    modal.classList.add('is-open');
  }

  function wireProductAux(product, pageName, addHandler) {
    const c = productUiCopy();
    const pageUrl = `${location.origin}${location.pathname}?handle=${encodeURIComponent(product.handle)}`;
    const phone = (YZA.brand?.whatsapp || '').replace(/\D/g, '');
    const sameDay = $('#sameDayDelivery');
    if (sameDay) sameDay.onclick = () => openProductModal(c.deliveryTitle, c.deliveryBody);
    const dropHint = $('#dropHint');
    if (dropHint) dropHint.onclick = () => {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(`${c.hintText}\n${pageName}\n${pageUrl}`)}`, '_blank', 'noopener');
    };
    const q = $('#accQuestions');
    if (q) q.innerHTML = `<p>${esc(c.deliveryBody)}</p><button class="link-underline" type="button" data-open-lead-chat>${esc(c.ask)}</button>`;
    const share = $('#accShare');
    if (share) share.innerHTML = `<button class="link-underline" type="button" data-share-product>${esc(c.shareCopy)}</button>`;
    document.querySelectorAll('[data-open-lead-chat]').forEach((btn) => {
      btn.onclick = () => document.getElementById('leadChatOpen')?.click();
    });
    document.querySelectorAll('[data-share-product]').forEach((btn) => {
      btn.onclick = async () => {
        if (navigator.share) {
          try { await navigator.share({ title: `${pageName} - YZA`, url: pageUrl }); return; } catch (err) {}
        }
        try { await navigator.clipboard.writeText(pageUrl); btn.textContent = c.copied; } catch (err) { location.href = pageUrl; }
      };
    });
    const mobileBar = $('#mobileProductBar');
    const mobileName = $('#mobileProductBarName');
    const mobileAdd = $('#mobileProductAdd');
    if (mobileBar && mobileName && mobileAdd) {
      mobileName.textContent = pageName;
      mobileAdd.textContent = c.add;
      mobileAdd.onclick = addHandler;
      const mainAdd = $('#pAdd');
      if ('IntersectionObserver' in window && mainAdd) {
        const io = new IntersectionObserver(([entry]) => {
          mobileBar.hidden = entry.isIntersecting || window.innerWidth > 860;
        }, { threshold: 0.08 });
        io.observe(mainAdd);
      }
    }
  }

 function renderProduct() {
 const root = $('#productRoot'); if (!root) return;
 const handle = params.get('handle');
 const baseProduct = YZA.getProduct(handle) || YZA.products[0];
 const selectedBagVariant = resolveBagVariant(baseProduct);
 const p = bagViewProduct(baseProduct, selectedBagVariant);
 const t = T();
 const members = selectedBagVariant?.row?.items?.length
 ? selectedBagVariant.row.items.map((item) => {
 const product = YZA.getProduct(item.handle) || p;
 return {
 ...product,
 price: item.price || product.price,
 variantLabel: textObj(item.size, item.size),
 bagUrl: item.url,
 bagColorSlug: item.colorSlug,
 isActiveBagVariant: item.handle === baseProduct.handle && item.colorSlug === selectedBagVariant.colorSlug,
 };
 })
 : (typeof YZA.familyMembers === 'function' ? YZA.familyMembers(p) : [p]);
 let purchaseProduct = p;
 const pageName = t.pick(displayName(p));
 document.title = `${pageName} - YZA`;
 if (root.dataset.viewedHandle !== p.handle) {
 root.dataset.viewedHandle = p.handle;
 YZA.analytics?.track('product_view', {
 handle: p.handle,
 familyHandle: p.familyHandle || '',
 category: p.category,
 price: p.price,
 });
 }

 const gal = productGallery(p);
      // Product JSON-LD + per-product social tags (rich results). Product names stay original.
      try {
        const abs = (u) => (u && String(u).indexOf('http') === 0) ? u : ('https://yza-shop.com/' + String(u || '').replace(/^\//, ''));
        const schemaDesc = (t.pick(p.short || p.displayShort || p.description || {}) || '').toString().replace(/\s+/g, ' ').trim().slice(0, 320);
        const ld = { '@context': 'https://schema.org', '@type': 'Product', name: pageName, image: gal.slice(0, 4).map(abs), brand: { '@type': 'Brand', name: 'YZA' }, category: p.category || undefined, offers: { '@type': 'Offer', price: Number((((p.price || 0)) / 100).toFixed(2)), priceCurrency: 'MAD', availability: 'https://schema.org/InStock', url: 'https://yza-shop.com/produit.html?handle=' + encodeURIComponent(p.handle) } };
        if (schemaDesc) ld.description = schemaDesc;
        let tag = document.getElementById('productSchema');
        if (!tag) { tag = document.createElement('script'); tag.type = 'application/ld+json'; tag.id = 'productSchema'; document.head.appendChild(tag); }
        tag.textContent = JSON.stringify(ld);
        const setMeta = (sel, c) => { const el = document.querySelector(sel); if (el && c) el.setAttribute('content', c); };
        setMeta('meta[property="og:title"]', pageName + ' — YZA');
        if (schemaDesc) setMeta('meta[property="og:description"]', schemaDesc);
        setMeta('meta[property="og:image"]', abs(gal[0]));
      } catch (e) {}
 const lifestyleVid = p.lifestyleVideo || null;
 $('#galMain').innerHTML = `<img id="galMainImg" src="${gal[0]}" alt="${pageName} - YZA" fetchpriority="high" width="900" height="1180" decoding="async">`;
 const imgThumbs = gal.map((src, i) =>
 `<button class="gallery__thumb${i === 0 ? ' is-active' : ''}" data-src="${esc(src)}" data-gtype="img"><img aria-hidden="true" src="${esc(src)}" alt="" loading="lazy" width="76" height="100" decoding="async"></button>`
 ).join('');
 const vidThumb = lifestyleVid
 ? `<button class="gallery__thumb gallery__thumb--play" data-src="${esc(lifestyleVid)}" data-gtype="video" aria-label="Voir en mouvement"><img aria-hidden="true" src="${esc(gal[gal.length - 1])}" alt="" loading="lazy" width="76" height="100" decoding="async"><span class="gallery__play-icon" aria-hidden="true"></span></button>`
 : '';
 $('#galThumbs').innerHTML = imgThumbs + vidThumb;
 $('#galThumbs').onclick = (e) => {
 const b = e.target.closest('.gallery__thumb'); if (!b) return;
 $$('#galThumbs .gallery__thumb').forEach(x => x.classList.remove('is-active'));
 b.classList.add('is-active');
 if (b.dataset.gtype === 'video') {
 $('#galMain').innerHTML = `<video id="galMainVid" autoplay muted loop playsinline src="${b.dataset.src}" style="width:100%;height:100%;object-fit:contain;display:block;background:var(--black)"></video>`;
 } else {
 let mainImg = $('#galMainImg');
 if (!mainImg) {
 $('#galMain').innerHTML = `<img id="galMainImg" src="${b.dataset.src}" alt="${pageName} - YZA" width="900" height="1180" decoding="async">`;
 } else {
 if (mainImg.getAttribute('src') === b.dataset.src) return;
 mainImg.classList.add('is-swapping');
 setTimeout(() => {
 mainImg.src = b.dataset.src;
 requestAnimationFrame(() => mainImg.classList.remove('is-swapping'));
 }, 120);
 }
 }
 };

 const ui = productUiCopy();
 $('#pName').textContent = pageName;
 $('#pPrice').innerHTML = productPriceCompact(purchaseProduct);
 $('#pShort').textContent = t.pick(displayShort(p));
 $('#pBreadcrumbName').textContent = pageName;
 $('#pBullets').innerHTML = productBullets(p).map((item) => `<li>${esc(item)}</li>`).join('');
 renderProductSwatches(p);
 $('#sameDayDelivery').textContent = ui.delivery;
 $('#dropHint').textContent = ui.hint;
 $('#accSizeFitLabel').textContent = ui.sizeFit;
 $('#accCareLabel').textContent = ui.care;
 $('#accDeliveryLabel').textContent = ui.returns;
 $('#accQuestionsLabel').textContent = ui.questions;
 $('#accShareLabel').textContent = ui.share;
 const catInfo = typeof YZA.categoryInfo === 'function' ? YZA.categoryInfo(p) : { key: 'nav.charms', href: 'collections.html?cat=charms' };
 const catCrumb = $('#pBreadcrumbCat');
 if (catCrumb) {
 catCrumb.href = catInfo.href;
 catCrumb.setAttribute('data-i18n', catInfo.key);
 catCrumb.textContent = t.t(catInfo.key);
 }

 // Preuve sociale (note) + mise en valeur de l'offre au moment du prix
 if ($('#pRating')) {
 const st = YZA.reviewStats;
 $('#pRating').setAttribute('data-placeholder', 'reviews');
 $('#pRating').innerHTML = st.real
 ? `${stars(st.avg, `${t.t('social.ratingOf')} ${String(st.avg).replace('.', ',')}/5`)} <span>${String(st.avg).replace('.', ',')}/5 · ${st.count} ${t.t('pp.reviews')}</span>`
 : `${stars(5, t.t('social.rating'))} <span>${t.t('social.rating')}</span>`;
 }
 if ($('#pValue')) {
 const limited = `<span class="pp-limited">${p.edition ? esc(t.pick(p.edition)) : t.t('pp.limited')}</span>`;
 $('#pValue').innerHTML = (p.compareAt && p.compareAt > p.price)
 ? `<span class="pill-save">${t.t('offer.save')} ${t.formatPrice(p.compareAt - p.price)}</span>${limited}`
 : limited;
 }
 const cross = $('#pCross');
 if (cross) {
 const next = YZA.related(p.handle, 1)[0];
 if (next) {
 cross.hidden = false;
 cross.innerHTML = `<a href="produit.html?handle=${next.handle}">${t.t('pp.crosssell')} ${esc(t.pick(displayName(next)))} &rarr;</a>`;
 } else {
 cross.hidden = true;
 }
 }
 const badgeEl = $('#pBadge');
 if (badgeEl && p.badge) { badgeEl.hidden = false; badgeEl.className = `badge badge--${p.badge}`; badgeEl.setAttribute('data-i18n', 'badge.' + p.badge); badgeEl.textContent = t.t('badge.' + p.badge); }
 else if (badgeEl) badgeEl.hidden = true;

 const finishWrap = $('#pFinish');
 if (p.category === 'charms' && !p.bundle) {
 finishWrap.hidden = false;
 $('#pFinishOpts').innerHTML = ['pp.finish.loop', 'pp.finish.r2', 'pp.finish.r3']
 .map((k, i) => `<button class="chip${i === 0 ? ' is-active' : ''}" data-finish="${k}">${t.t(k)}</button>`).join('');
 $('#pFinishOpts').onclick = (e) => {
 const b = e.target.closest('.chip'); if (!b) return;
 $$('#pFinishOpts .chip').forEach(x => x.classList.remove('is-active'));
 b.classList.add('is-active');
 };
 } else { finishWrap.hidden = true; }

 const variantWrap = ensureVariantWrap();
 const variantOpts = $('#pVariantOpts');
 if (members.length > 1 && variantWrap && variantOpts) {
 variantWrap.hidden = false;
 variantWrap.querySelector('[data-variant-label]').textContent = variantLabelFor(p, t);
 variantOpts.innerHTML = members.map((item) => {
 const active = item.isActiveBagVariant || (!selectedBagVariant && item.handle === p.handle) ? ' is-active' : '';
 const label = t.pick(item.variantLabel) || t.pick(item.size) || t.pick(item.name);
 return `<button class="chip chip--variant${active}" type="button" data-product-variant="${item.handle}"${item.bagUrl ? ` data-product-url="${esc(item.bagUrl)}"` : ''}>
 <span>${esc(label)}</span><em aria-hidden="true">${t.formatPrice(item.price)}</em><span class="sr-only"> ${t.formatPrice(item.price)}</span>
 </button>`;
 }).join('');
 variantOpts.onclick = (e) => {
 const btn = e.target.closest('[data-product-variant]');
 if (!btn) return;
 const selected = YZA.getProduct(btn.dataset.productVariant);
 if (!selected) return;
 if (p.category === 'bags') {
 YZA.analytics?.track('product_variant_select', {
 handle: selected.handle,
 familyHandle: selected.familyHandle || '',
 category: selected.category,
 fullPageSwap: true,
 });
 location.href = btn.dataset.productUrl || `produit.html?handle=${encodeURIComponent(selected.handle)}`;
 return;
 }
 purchaseProduct = selected;
 $$('#pVariantOpts .chip').forEach((chip) => chip.classList.remove('is-active'));
 btn.classList.add('is-active');
 $('#pPrice').innerHTML = productPriceCompact(purchaseProduct);
 YZA.analytics?.track('product_variant_select', {
 handle: purchaseProduct.handle,
 familyHandle: purchaseProduct.familyHandle || '',
 category: purchaseProduct.category,
 });
 };
 } else if (variantWrap) {
 variantWrap.hidden = true;
 }

 const detailRows = [];
 if (p.sku) detailRows.push(`<strong>SKU:</strong> ${esc(p.sku)}`);
 if (p.color) detailRows.push(`<strong>${t.t('pp.color')}:</strong> ${esc(t.pick(p.color))}`);
 if (p.availableColors?.length) detailRows.push(`<strong>${t.t('pp.colors')}:</strong> ${p.availableColors.map(c => esc(t.pick(c))).join(', ')}`);
 if (p.availableSizes?.length) detailRows.push(`<strong>${t.t('pp.availableSizes')}:</strong> ${p.availableSizes.map(esc).join(', ')}`);
 if (p.material) detailRows.push(`<strong>${t.t('pp.material')}:</strong> ${esc(t.pick(p.material))}`);
 if (p.fabric) detailRows.push(`<strong>${t.t('pp.fabric')}:</strong> ${esc(t.pick(p.fabric))}`);
 if (p.dimensions) detailRows.push(`<strong>${t.t('pp.size.label')}:</strong> ${esc(t.pick(p.dimensions))}`);
 if (p.attachment) detailRows.push(`<strong>${buyingProofCopy().attachment}:</strong> ${esc(t.pick(p.attachment))}`);
 if (p.whatFits) detailRows.push(`<strong>${buyingProofCopy().fits}:</strong> ${esc(t.pick(p.whatFits))}`);
 if (p.edition) detailRows.push(`<strong>${t.t('pp.edition')}:</strong> ${esc(t.pick(p.edition))}`);
 if (p.howToWear) {
 const wear = p.howToWear;
 const wearItems = Array.isArray(wear.items) ? wear.items : [];
 $('#accDetails').innerHTML = `<div class="charm-wear">
 <p class="charm-wear__intro">${esc(t.pick(p.desc))}</p>
 <h3>${esc(t.pick(wear.title))}</h3>
 <p>${esc(t.pick(wear.intro))}</p>
 <ul>${wearItems.map((item) => `<li>${esc(t.pick(item))}</li>`).join('')}</ul>
 <p><strong>${buyingProofCopy().styleTip} :</strong> ${esc(t.pick(wear.styleTip))}</p>
 <p><strong>${buyingProofCopy().note} :</strong> ${esc(t.pick(wear.note))}</p>
 ${detailRows.length ? `<div class="charm-wear__specs">${detailRows.join('<br>')}</div>` : ''}
 </div>`;
 } else {
 $('#accDetails').innerHTML = `${esc(t.pick(p.desc))}${detailRows.length ? `<br><br>${detailRows.join('<br>')}` : ''}`;
 }

 const making = p.making || (p.group === 'rtw'
 ? { fr: 'Piece Jawhara SS26 pensee pour les ensembles coordonnes et les silhouettes resort.', en: 'SS26 Jawhara piece designed for coordinated sets and resort silhouettes.' }
 : p.category === 'bags'
 ? { fr: 'Sac assemble a partir de feuilles de bananier, raphia et perles, dans la ligne La Sculpture.', en: 'Bag assembled from banana leaves, raffia and beads in the La Sculpture line.' }
 : { fr: t.t('pp.making.txt'), en: t.t('pp.making.txt') });
 const specs = [];
 if (p.size) specs.push(`<strong>${t.t('pp.size.label')} :</strong> ${esc(t.pick(p.size))}`);
 if (p.handworkTime) specs.push(`<strong>${buyingProofCopy().handwork} :</strong> ${esc(t.pick(p.handworkTime))}`);
 const makingEl = $('#accMaking');
 if (makingEl) makingEl.innerHTML = `${esc(t.pick(making))}${specs.length ? `<br><br>${specs.join('<br>')}` : ''}`;
 $('#accShip').innerHTML = typeof YZA.serviceLongText === 'function'
 ? YZA.serviceLongText()
 : esc(t.t('pp.ship.txt'));
 $('#accCare').innerHTML = `${esc(t.pick(p.care) || t.t('pp.care.txt'))}<br><br><strong>${buyingProofCopy().packaging} :</strong> ${esc(t.pick(p.packaging) || '')}`;

 const add = $('#pAdd');
 const addStatus = YZA.inventoryStatus?.(purchaseProduct) || { soldOut: false };
 add.textContent = addStatus.soldOut ? ui.sold : ui.add;
 add.disabled = !!addStatus.soldOut;
 const handleAdd = () => {
 if (add.disabled) return;
 let variant = '';
 if (p.activeVariantLabel) variant = t.pick(p.activeVariantLabel);
 const f = $('#pFinishOpts .chip.is-active');
 if (f && f.dataset.finish !== 'pp.finish.loop') variant = t.t(f.dataset.finish);
 const familyLabel = purchaseProduct.handle !== p.handle
 ? (t.pick(purchaseProduct.variantLabel) || t.pick(purchaseProduct.size) || t.pick(purchaseProduct.name))
 : '';
 if (familyLabel) variant = variant ? `${familyLabel} / ${variant}` : familyLabel;
 const qty = Math.max(1, parseInt($('#pQty').value || '1', 10));
 const added = YZA.cart.add(purchaseProduct.handle, variant, qty);
 if (!added) return;
 YZA.cart.open();
 add.textContent = t.t('cta.added');
 setTimeout(() => { add.textContent = ui.add; }, 1500);
 };
 add.onclick = handleAdd;
 wireProductAux(p, pageName, handleAdd);

 const trust = $('#pTrustChips');
 if (trust) trust.innerHTML = '';
 const bundle = $('#pBundle');
 if (bundle) { bundle.hidden = true; bundle.innerHTML = ''; }
 renderProductSupport(p);
 renderProductRails(p);

 const ld = {
 '@context': 'https://schema.org/', '@type': 'Product',
 name: pageName, image: new URL(p.img, location.href).href,
 description: t.pick(p.desc), brand: { '@type': 'Brand', name: 'YZA' },
 offers: { '@type': 'Offer', priceCurrency: 'MAD', price: (p.price / 100).toFixed(2), availability: 'https://schema.org/LimitedAvailability' }
 };
 let s = $('#productLd'); if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'productLd'; document.head.append(s); }
 s.textContent = JSON.stringify(ld);

 // Per-product SEO: keep canonical + social tags + description in sync with the viewed product.
 // Only updates tags that already exist in the head (safe no-op otherwise).
 const absImg = new URL(p.img, location.href).href;
 const metaDesc = t.pick(p.desc);
 const ogTitle = `${pageName} - YZA`;
 const setMeta = (sel, val) => { const el = document.head.querySelector(sel); if (el && val) el.setAttribute('content', val); };
 const canon = document.head.querySelector('link[rel="canonical"]');
 if (canon) canon.setAttribute('href', 'https://yza-shop.com/produit.html?handle=' + encodeURIComponent(p.handle));
 setMeta('meta[name="description"]', metaDesc);
 setMeta('meta[property="og:title"]', ogTitle);
 setMeta('meta[property="og:description"]', metaDesc);
 setMeta('meta[property="og:image"]', absImg);
 setMeta('meta[name="twitter:title"]', ogTitle);
 setMeta('meta[name="twitter:description"]', metaDesc);
 setMeta('meta[name="twitter:image"]', absImg);
 }

 /* ================= INTERACTIONS GÉNÉRIQUES ================= */
 let _accWired = false;
 function wireAccordion() {
 if (_accWired) return;
 _accWired = true;
 document.addEventListener('click', (e) => {
 const btn = e.target.closest('.accordion__btn');
 if (!btn) return;
 const item = btn.closest('.accordion__item');
 if (!item) return;
 const panel = item.querySelector('.accordion__panel');
 const open = item.classList.toggle('is-open');
 btn.setAttribute('aria-expanded', String(open));
 if (panel) panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0';
 });
 }
 wireAccordion();
 function wireReveal() {
 const io = new IntersectionObserver((entries) => {
 entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
 }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
 $$('[data-reveal]').forEach(el => io.observe(el));
 setTimeout(() => $$('[data-reveal]:not(.is-visible)').forEach(el => el.classList.add('is-visible')), 1600);
 }
  function wireForms() {
 $$('.newsletter__form').forEach(form => form.addEventListener('submit', (e) => {
 e.preventDefault();
 const input = form.querySelector('input[type="email"], input');
 const msg = form.querySelector('[data-news-msg]');
 const email = (input?.value || '').trim();
 const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 if (!ok) {
 if (input) input.classList.add('is-invalid');
 if (msg) { msg.textContent = T().lang === 'fr' ? 'Entrez un e-mail valide.' : 'Enter a valid email.'; msg.hidden = false; }
 YZA.analytics?.track('newsletter_submit_invalid', { source: document.body.dataset.page || '' });
 return;
 }
 input?.classList.remove('is-invalid');
 if (msg) { msg.textContent = T().t('news.ok'); msg.hidden = false; }
 if (input) input.value = '';
 YZA.analytics?.track('newsletter_submit', { source: document.body.dataset.page || '' });
 }));
 $$('[data-contact-form]').forEach(form => form.addEventListener('submit', (e) => {
 e.preventDefault();
 const msg = form.querySelector('[data-form-msg]');
 const fields = Array.from(form.querySelectorAll('[required]'));
 const invalid = fields.find((field) => {
 const value = (field.value || '').trim();
 if (!value) return true;
 if (field.type === 'email') return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
 return false;
 });
 fields.forEach((field) => field.classList.toggle('is-invalid', field === invalid));
 if (invalid) {
 if (msg) { msg.textContent = T().lang === 'fr' ? 'Completez les champs obligatoires.' : 'Complete the required fields.'; msg.hidden = false; }
 invalid.focus({ preventScroll: false });
 YZA.analytics?.track('contact_form_invalid', { source: document.body.dataset.page || '', field: invalid.name || invalid.id || '' });
 return;
 }
 if (msg) msg.hidden = false;
 form.reset();
 YZA.analytics?.track('contact_form_submit', { source: document.body.dataset.page || '' });
    }));
  }
  function wireProductCards() {
    if (YZA._productCardsWired) return;
    YZA._productCardsWired = true;
    const readWishlist = () => {
      try { return JSON.parse(localStorage.getItem('yza_wishlist')) || []; } catch (e) { return []; }
    };
    const writeWishlist = (items) => {
      try { localStorage.setItem('yza_wishlist', JSON.stringify(Array.from(new Set(items)).filter(Boolean))); } catch (e) {}
    };
    document.addEventListener('click', (event) => {
      const wish = event.target.closest('[data-wishlist-toggle]');
      if (wish) {
        event.preventDefault();
        event.stopPropagation();
        const handle = wish.getAttribute('data-wishlist-toggle');
        const list = readWishlist();
        const exists = list.includes(handle);
        const next = exists ? list.filter((item) => item !== handle) : [...list, handle];
        writeWishlist(next);
        document.querySelectorAll(`[data-wishlist-toggle="${CSS.escape(handle)}"]`).forEach((btn) => {
          btn.classList.toggle('is-active', !exists);
          btn.setAttribute('aria-pressed', !exists ? 'true' : 'false');
        });
        YZA.analytics?.track(exists ? 'wishlist_remove' : 'wishlist_add', { handle });
        return;
      }
      const card = event.target.closest('[data-product-card-click]');
      if (card) {
        const handle = card.getAttribute('data-product-card-click');
        const product = YZA.getProduct?.(handle);
        YZA.analytics?.track('product_card_click', {
          handle,
          category: product?.category || '',
          price: product?.price || 0,
        });
      }
    });
  }

 /* ================= ROUTER ================= */
 function renderPage() {
 renderServiceStrips();
 renderHome();
 renderGirlsPreview();
 initBandVideos();
 renderGirlsPage();
 renderCollections();
 renderProduct();
 }
 function activeNav() {
 const page = document.body.dataset.page;
 if (page === 'collections') {
 const cat = params.get('cat') || 'all';
 if (cat === 'bags') return 'nav.bags';
 if (cat === 'rtw' || cat === 'tops' || cat === 'pareos' || cat === 'pants' || cat === 'bottoms') return 'nav.rtw';
 if (cat === 'charms') return 'nav.charms';
 if (cat === 'accessories' || cat === 'earrings' || cat === 'necklaces') return 'nav.accessories';
 }
 return ({
 histoire: 'nav.story',
 girls: 'nav.girls',
 b2b: 'nav.b2b',
 lookbook: 'nav.lookbook',
 journal: 'nav.journal',
 studio: 'nav.studio',
 faq: 'nav.faq',
 contact: 'nav.contact',
 })[page] || '';
 }

 document.addEventListener('DOMContentLoaded', () => {
 document.documentElement.classList.add('js');
 YZA.i18n.lang = YZA.i18n.detect();
 YZA.chrome.mount(activeNav());
 initHomeVideoHero();
 initFooterWidgetGuard();
 renderPage();
 YZA.cart.init();
 wireCollections();
 YZA.i18n.init();
 YZA.i18n.onChange(() => { renderPage(); YZA.cart.refresh(); });
    wireAccordion();
    wireReveal();
    wireForms();
    wireProductCards();
    document.querySelectorAll('.girls-home-grid, .girls-feed, [data-scroll-row]')
 .forEach((el) => enableDragScroll(el));
 });
})();
