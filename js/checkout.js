/* ============================================================
   YZA — CHECKOUT (static, no account)
   3 steps: Cart → Shipping → Payment & Confirmation.
   Order handoff = WhatsApp prefill + best-effort POST to order.php (email).
   Reuses YZA.cart, YZA.i18n.formatPrice/eurEstimate, YZA.payment config.
   ============================================================ */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(boot);

  function boot() {
    // Deferred scripts run in order before DOMContentLoaded, but poll defensively.
    if (!window.YZA || !YZA.cart || !YZA.i18n || typeof YZA.getProduct !== 'function') {
      return setTimeout(boot, 40);
    }
    var root = document.getElementById('checkoutRoot');
    if (!root) return;
    root.removeAttribute('data-reveal');
    root.style.opacity = '1';

    YZA.cart.load();

    // Apply the URL/saved language before the first render (avoids a FR flash when the
    // page is opened directly with ?lang=xx, before chrome.js has set the language).
    try { var dl = YZA.i18n.detect ? YZA.i18n.detect() : YZA.i18n.lang; if (dl && dl !== YZA.i18n.lang) YZA.i18n.setLang(dl); } catch (e) {}

    var state = {
      step: 'cart',          // cart | shipping | payment | done
      method: 'cod',         // cod | rib | iban | paypal
      ship: loadShip(),
      wa: '',
      bumpHandle: undefined, // order-bump pick, frozen on first payment-step entry
      bumpOn: false,         // authoritative bump state (not the DOM)
      lastOrder: null,       // the placed order — feeds the done-screen add-on cards
    };

    var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };
    var T = function (k) { return YZA.i18n.t(k); };
    var fmt = function (c) { return YZA.i18n.formatPrice(c); };
    var eur = function (c) { return YZA.i18n.eurEstimate(c); };
    var PAY = function () { return YZA.payment || {}; };
    var waDigits = function () { return String((YZA.brand && YZA.brand.whatsapp) || '').replace(/\D/g, ''); };

    // ---- data helpers ----
    function lines() {
      return YZA.cart.items.map(function (i) {
        var p = YZA.getProduct(i.handle);
        if (!p) return null;
        var img = (i.variant && YZA.bagVariantFor && YZA.bagVariantFor(p.handle, i.variant) && YZA.bagVariantFor(p.handle, i.variant).img) || p.img;
        var st = (YZA.inventoryStatus && YZA.inventoryStatus(p)) || {};
        return { handle: p.handle, name: YZA.i18n.pick(p.name), variant: i.variant || '', qty: i.qty, price: p.price, line: p.price * i.qty, img: img, src: i.src || '', almostGone: !!st.almostGone, inventory: st.inventory };
      }).filter(Boolean);
    }
    function subtotal() { return YZA.cart.subtotalCents(); }
    // Single money source — see YZA.cart.pricing() (drawer/WhatsApp/Woo/pixels read the same figures).
    function pricing() { return YZA.cart.pricing(); }
    function isFreeShip() { return YZA.cart.shippingProgress().unlocked; }
    var isIntl = function () { return state.method === 'iban' || state.method === 'paypal'; };

    // ---- persistence ----
    function loadShip() { try { return JSON.parse(sessionStorage.getItem('yza.checkout.ship')) || {}; } catch (e) { return {}; } }
    function saveShip() { try { sessionStorage.setItem('yza.checkout.ship', JSON.stringify(state.ship)); } catch (e) {} }

    // ---- render ----
    function stepsBar() {
      var steps = [['cart', T('co.step.cart')], ['shipping', T('co.step.ship')], ['payment', T('co.step.pay')]];
      var order = ['cart', 'shipping', 'payment', 'done'];
      var cur = order.indexOf(state.step === 'done' ? 'payment' : state.step);
      return '<ol class="checkout__steps">' + steps.map(function (s, i) {
        var idx = order.indexOf(s[0]);
        var cls = idx < cur ? ' is-done' : (idx === cur ? ' is-active' : '');
        var clickable = idx < cur && state.step !== 'done';
        return '<li class="checkout__step' + cls + '"' + (clickable ? ' data-goto="' + s[0] + '" role="button" tabindex="0"' : '') + '><span class="checkout__step-n">' + (i + 1) + '</span><span class="checkout__step-t">' + esc(s[1]) + '</span></li>';
      }).join('') + '</ol>';
    }

    function summary() {
      var items = lines();
      var itemRows = items.map(function (it) {
        return '<li class="co-sum__item"><span class="co-sum__thumb"><img src="' + esc(it.img) + '" alt="" width="48" height="60" loading="lazy"></span>' +
          '<span class="co-sum__meta"><span class="co-sum__name">' + esc(it.name) + '</span>' + (it.variant ? '<span class="co-sum__var">' + esc(it.variant) + '</span>' : '') + '<span class="co-sum__qty">×' + it.qty + '</span></span>' +
          '<span class="co-sum__price">' + fmt(it.line) + '</span></li>';
      }).join('');
      var pr = pricing();
      var eurLine = isIntl() ? '<span class="co-sum__eur">' + eur(pr.totalCents) + '</span>' : '';
      var discountRows = pr.discounts.map(function (d) {
        return '<div class="co-sum__row co-sum__row--discount"><span>' + esc(YZA.i18n.tFmt('promo.charmTier.label', { n: d.meta.count })) + '</span><span>−' + fmt(d.amountCents) + '</span></div>';
      }).join('');
      var progress = YZA.cart.items.length ? '<div class="co-sum__progress">' + YZA.cart.deliveryProgressHTML() + '</div>' : '';
      return '<aside class="co-sum" aria-label="' + esc(T('co.summary')) + '">' +
        '<h2 class="co-sum__title">' + esc(T('co.summary')) + '</h2>' +
        '<ul class="co-sum__items">' + itemRows + '</ul>' +
        progress +
        '<div class="co-sum__rows">' +
          '<div class="co-sum__row"><span>' + esc(T('co.subtotal')) + '</span><span>' + fmt(pr.subtotalCents) + '</span></div>' +
          discountRows +
          '<div class="co-sum__row"><span>' + esc(T('co.shipping')) + '</span><span>' + (isFreeShip() ? esc(T('co.shipFree')) : esc(T('co.shipCalc'))) + '</span></div>' +
        '</div>' +
        '<div class="co-sum__total"><span>' + esc(T('co.total')) + '<small>' + esc(T('co.vat')) + '</small></span><strong>' + fmt(pr.totalCents) + eurLine + '</strong></div>' +
        '<p class="co-terms">' + esc(T('co.terms')) + ' <a href="/mentions-legales#cgv">' + esc(T('co.gcs')) + '</a> · <a href="/mentions-legales#confidentialite">' + esc(T('co.privacy')) + '</a>.</p>' +
      '</aside>';
    }

    function cartStep() {
      var items = lines();
      if (!items.length) {
        return '<div class="co-empty"><p>' + esc(T('co.empty')) + '</p><a class="btn btn--solid" href="/collections/charms">' + esc(T('co.emptyCta')) + '</a></div>';
      }
      var rows = items.map(function (it) {
        return '<div class="co-line"><a class="co-line__img" href="/produits/' + encodeURIComponent(it.handle) + '"><img src="' + esc(it.img) + '" alt="" width="80" height="100" loading="lazy"></a>' +
          '<div class="co-line__info"><a class="co-line__name" href="/produits/' + encodeURIComponent(it.handle) + '">' + esc(it.name) + '</a>' +
          (it.variant ? '<div class="co-line__var">' + esc(it.variant) + '</div>' : '') +
          '<div class="co-line__price">' + fmt(it.line) + '</div>' +
          (it.almostGone ? '<div class="co-line__scarcity">' + esc(YZA.i18n.tFmt('scarcity.remaining', { n: it.inventory })) + '</div>' : '') +
          '<div class="co-line__ctl"><div class="qty" data-handle="' + esc(it.handle) + '" data-variant="' + esc(it.variant) + '"><button class="qty__btn" data-act="dec" aria-label="-">−</button><span class="qty__n">' + it.qty + '</span><button class="qty__btn" data-act="inc" aria-label="+">+</button></div>' +
          '<button class="co-line__remove" data-remove data-handle="' + esc(it.handle) + '" data-variant="' + esc(it.variant) + '">' + esc(T('cart.remove')) + '</button></div></div></div>';
      }).join('');
      return '<h1 class="co-h1">' + esc(T('co.step.cart')) + '</h1><div class="co-lines">' + rows + '</div>' + upsellBlock() +
        '<div class="co-actions"><a class="link-underline" href="/collections">' + esc(T('co.continue')) + '</a>' +
        '<button type="button" class="btn btn--solid" data-next="shipping">' + esc(T('co.next')) + '</button></div>';
    }

    // Same "Complétez votre pièce" cards as the drawer, step-1 only.
    function upsellBlock() {
      var cfg = YZA.promos && YZA.promos.crossSell;
      if ((cfg && cfg.enabled === false) || typeof YZA.cartSuggestions !== 'function') return '';
      var tierCount = YZA.cart.charmTierCount ? YZA.cart.charmTierCount() : 0;
      var trioPlay = tierCount >= 1 && tierCount <= 2 && YZA.cart.items.every(function (i) { return (YZA.getProduct(i.handle) || {}).category === 'charms'; });
      var sug = YZA.cartSuggestions(YZA.cart.items, { limit: (cfg && cfg.limit) || 2, categories: trioPlay ? ['charms'] : undefined });
      if (!sug.length) return '';
      var cards = sug.map(function (p) {
        var st = (YZA.inventoryStatus && YZA.inventoryStatus(p)) || {};
        return '<div class="upsell-card">' +
          '<a class="upsell-card__img" href="/produits/' + encodeURIComponent(p.handle) + '"><img src="' + esc(p.img) + '" alt="" width="56" height="72" loading="lazy"></a>' +
          '<div class="upsell-card__body"><a class="upsell-card__name" href="/produits/' + encodeURIComponent(p.handle) + '">' + esc(YZA.i18n.pick(p.name)) + '</a>' +
          '<span class="upsell-card__price">' + fmt(p.price) + '</span>' +
          (st.almostGone ? '<span class="upsell-card__chip">' + esc(YZA.i18n.tFmt('scarcity.remaining', { n: st.inventory })) + '</span>' : '') + '</div>' +
          '<button type="button" class="upsell-card__add" data-upsell-add="' + esc(p.handle) + '" aria-label="+">+</button></div>';
      }).join('');
      return '<div class="cart-upsell cart-upsell--checkout"><p class="cart-upsell__title">' + esc(T('cart.upsell.title')) + '</p><div class="cart-upsell__grid">' + cards + '</div></div>';
    }

    function field(name, labelKey, type, required, extra) {
      var v = state.ship[name] || '';
      var tag = type === 'textarea'
        ? '<textarea id="co-' + name + '" name="' + name + '" rows="2" placeholder="' + esc(extra || '') + '">' + esc(v) + '</textarea>'
        : '<input id="co-' + name + '" name="' + name + '" type="' + type + '" value="' + esc(v) + '" ' + (extra || '') + (required ? ' required' : '') + '>';
      return '<div class="field co-field"><label for="co-' + name + '">' + esc(T(labelKey)) + (required ? ' *' : '') + '</label>' + tag + '<span class="co-field__err" data-err></span></div>';
    }

    function shippingStep() {
      return '<h1 class="co-h1">' + esc(T('co.ship.title')) + '</h1>' +
        '<form class="co-form" id="coShipForm" novalidate>' +
          field('name', 'co.ship.name', 'text', true, 'autocomplete="name"') +
          '<div class="co-form__two">' + field('email', 'co.ship.email', 'email', false, 'autocomplete="email"') + field('phone', 'co.ship.phone', 'tel', true, 'autocomplete="tel"') + '</div>' +
          field('address', 'co.ship.address', 'text', true, 'autocomplete="street-address"') +
          '<div class="co-form__two">' + field('city', 'co.ship.city', 'text', true, 'autocomplete="address-level2"') + field('zip', 'co.ship.zip', 'text', false, 'autocomplete="postal-code"') + '</div>' +
          field('country', 'co.ship.country', 'text', true, 'autocomplete="country-name"') +
          field('note', 'co.ship.note', 'textarea', false, T('co.ship.notePh')) +
        '</form>' +
        '<div class="co-actions"><button type="button" class="btn btn--outline" data-back="cart">' + esc(T('co.back')) + '</button>' +
        '<button type="button" class="btn btn--solid" data-next="payment">' + esc(T('co.next')) + '</button></div>';
    }

    function payDetails(method) {
      var p = PAY();
      if (method === 'cod') return '';
      if (method === 'rib') {
        var rib = (p.morocco && p.morocco.rib) || T('co.pay.ribToCome');
        var bank = p.morocco && p.morocco.bank;
        var holder = (p.morocco && p.morocco.holder) || 'Nawal Rmili';
        return '<div class="pay-details">' +
          (bank ? row(T('co.pay.bank'), bank, false) : '') +
          row('RIB', rib, !!(p.morocco && p.morocco.rib)) +
          row(T('co.pay.holder'), holder, false) +
          '<p class="pay-note pay-note--fee">' + esc(T('co.pay.ribFee')) + '</p>' +
          '<p class="pay-note">' + esc(T('co.pay.note')) + '</p></div>';
      }
      if (method === 'iban') {
        var e = p.eur || {};
        return '<div class="pay-details">' +
          row('IBAN', e.iban || '', true) +
          row('BIC', e.bic || '', true) +
          row(T('co.pay.bank'), e.bank || '', false) +
          row(T('co.pay.holder'), e.holder || '', false) +
          '<p class="pay-eur">' + esc(T('co.total')) + ' ' + eur(pricing().totalCents) + '</p>' +
          '<p class="pay-note">' + esc(T('co.pay.note')) + '</p></div>';
      }
      if (method === 'paypal') {
        if (paypalReady()) {
          return '<div class="pay-details">' +
            '<p class="pay-eur">' + esc(T('co.total')) + ' ' + eur(pricing().totalCents) + '</p>' +
            '<a class="btn btn--solid pay-details__btn" href="' + esc(paypalPayUrl()) + '" target="_blank" rel="noopener">' + esc(T('co.pay.paypalBtn')) + '</a>' +
            '<p class="pay-note">' + esc(T('co.pay.paypalNote')) + '</p></div>';
        }
        return '<div class="pay-details"><p class="pay-note">' + esc(T('co.pay.ribTxt')) + ' ' + eur(pricing().totalCents) + '</p></div>';
      }
      return '';
    }
    function row(label, value, copyable) {
      return '<div class="pay-details__row"><span>' + esc(label) + '</span><code>' + esc(value) + '</code>' +
        (copyable ? '<button type="button" class="pay-copy" data-copy="' + esc(value) + '">' + esc(T('co.pay.copy')) + '</button>' : '') + '</div>';
    }

    function payStep() {
      var methods = [
        { id: 'cod', name: T('co.pay.cod'), txt: T('co.pay.codTxt'), logo: 'assets/brand/payment/cod.svg' },
        { id: 'rib', name: T('co.pay.rib'), txt: T('co.pay.ribTxt'), logo: 'assets/brand/payment/bank.svg' },
        { id: 'iban', name: T('co.pay.iban'), txt: T('co.pay.ibanTxt'), logo: 'assets/brand/payment/bank.svg' },
        { id: 'paypal', name: T('co.pay.paypal'), txt: T('co.pay.paypalTxt'), logos: ['assets/brand/payment/paypal.svg', 'assets/brand/payment/visa.svg', 'assets/brand/payment/mastercard.svg', 'assets/brand/payment/amex.svg'] },
      ];
      var opts = methods.map(function (m) {
        var on = state.method === m.id;
        var logos = (m.logos || [m.logo]).map(function (src) { return '<img src="' + esc(src) + '" alt="" height="20">'; }).join('');
        return '<label class="pay-option' + (on ? ' is-selected' : '') + '">' +
          '<input type="radio" name="pay" value="' + m.id + '"' + (on ? ' checked' : '') + '>' +
          '<span class="pay-option__logo">' + logos + '</span>' +
          '<span class="pay-option__body"><span class="pay-option__name">' + esc(m.name) + '</span><span class="pay-option__txt">' + esc(m.txt) + '</span></span>' +
          '</label>' + (on ? payDetails(m.id) : '');
      }).join('');
      return '<h1 class="co-h1">' + esc(T('co.pay.title')) + '</h1><div class="co-pay">' + opts + '</div>' + bumpCard() +
        '<div class="co-actions"><button type="button" class="btn btn--outline" data-back="shipping">' + esc(T('co.back')) + '</button>' +
        '<button type="button" class="btn btn--solid" data-place>' + esc(T('co.pay.place')) + '</button></div>';
    }

    // One unchecked low-friction add above the Place-order button. state.bumpOn is
    // authoritative; checking adds the item to the real cart (summary updates live).
    function bumpCard() {
      if (!state.bumpHandle) return '';
      var p = YZA.getProduct(state.bumpHandle);
      if (!p) return '';
      var st = (YZA.inventoryStatus && YZA.inventoryStatus(p)) || {};
      if (st.soldOut) return '';
      return '<label class="co-bump' + (state.bumpOn ? ' is-on' : '') + '">' +
        '<input type="checkbox" data-bump' + (state.bumpOn ? ' checked' : '') + '>' +
        '<img src="' + esc(p.img) + '" alt="" width="56" height="72" loading="lazy">' +
        '<span class="co-bump__body"><span class="co-bump__kicker">' + esc(T('co.bump.kicker')) + '</span>' +
        '<span class="co-bump__name">' + esc(YZA.i18n.pick(p.name)) + ' — ' + fmt(p.price) + '</span>' +
        '<span class="co-bump__txt">' + esc(T('co.bump.pitch')) + '</span></span></label>';
    }

    function doneStep() {
      var p = PAY();
      var msg = state.method === 'cod' ? T('co.done.cod') : (state.method === 'paypal' && paypalReady() ? T('co.done.paypal') : T('co.done.transfer'));
      var paypalBtn = (state.method === 'paypal' && paypalReady())
        ? '<a class="btn btn--outline" href="' + esc(paypalPayUrl()) + '" target="_blank" rel="noopener">' + esc(T('co.done.paypalBtn')) + '</a>' : '';
      return '<div class="co-done"><div class="co-done__check" aria-hidden="true">✓</div>' +
        '<h1 class="co-h1">' + esc(T('co.done.title')) + '</h1>' +
        '<p class="co-done__msg">' + esc(msg) + '</p>' +
        '<div class="co-done__actions"><a class="btn btn--solid" href="' + esc(state.wa) + '" target="_blank" rel="noopener">' + esc(T('co.done.wa')) + '</a>' + paypalBtn +
        '<a class="link-underline" href="/">' + esc(T('co.done.home')) + '</a></div></div>' + addonBlock();
    }

    // Post-order add-on: COD/transfer makes adding to a placed order frictionless — the
    // customer taps a suggestion → WhatsApp prefilled "AJOUTER au colis de ma commande N°…".
    function addonBlock() {
      var cfg = YZA.promos && YZA.promos.postOrderAddon;
      if ((cfg && cfg.enabled === false) || !state.lastOrder || typeof YZA.cartSuggestions !== 'function') return '';
      var sug = YZA.cartSuggestions(state.lastOrder.items, { limit: (cfg && cfg.limit) || 2 });
      if (!sug.length) return '';
      var cards = sug.map(function (p) {
        var st = (YZA.inventoryStatus && YZA.inventoryStatus(p)) || {};
        return '<div class="upsell-card">' +
          '<a class="upsell-card__img" href="/produits/' + encodeURIComponent(p.handle) + '"><img src="' + esc(p.img) + '" alt="" width="56" height="72" loading="lazy"></a>' +
          '<div class="upsell-card__body"><span class="upsell-card__name">' + esc(YZA.i18n.pick(p.name)) + '</span><span class="upsell-card__price">' + fmt(p.price) + '</span>' +
          (st.almostGone ? '<span class="upsell-card__chip">' + esc(YZA.i18n.tFmt('scarcity.remaining', { n: st.inventory })) + '</span>' : '') + '</div>' +
          '<button type="button" class="btn btn--outline co-addon__btn" data-addon="' + esc(p.handle) + '">' + esc(T('co.addon.cta')) + '</button></div>';
      }).join('');
      return '<div class="co-addon"><p class="co-addon__title">' + esc(T('co.addon.title')) + '</p><p class="co-addon__sub">' + esc(T('co.addon.sub')) + '</p><div class="co-addon__grid">' + cards + '</div></div>';
    }

    function render() {
      var body;
      if (state.step === 'done') body = '<div class="checkout__main checkout__main--done">' + doneStep() + '</div>';
      else if (state.step === 'cart') body = '<div class="checkout__grid"><section class="checkout__main">' + cartStep() + '</section>' + summary() + '</div>';
      else if (state.step === 'shipping') body = '<div class="checkout__grid"><section class="checkout__main">' + shippingStep() + '</section>' + summary() + '</div>';
      else body = '<div class="checkout__grid"><section class="checkout__main">' + payStep() + '</section>' + summary() + '</div>';

      root.innerHTML = '<div class="checkout__head"><a class="checkout__logo" href="/">YZA</a>' + (state.step === 'done' ? '' : stepsBar()) + '</div>' + body;
      if (window.YZA && YZA.i18n && YZA.i18n.apply) YZA.i18n.apply(root);
    }

    // ---- validation ----
    function collectShip() {
      var f = root.querySelector('#coShipForm');
      if (!f) return true;
      var ok = true;
      var need = ['name', 'phone', 'address', 'city', 'country'];
      Array.prototype.forEach.call(f.elements, function (el) {
        if (!el.name) return;
        state.ship[el.name] = el.value.trim();
      });
      f.querySelectorAll('[data-err]').forEach(function (e) { e.textContent = ''; e.parentElement.classList.remove('is-err'); });
      need.forEach(function (n) {
        var el = f.querySelector('[name="' + n + '"]');
        if (el && !el.value.trim()) { markErr(el, T('co.err.required')); ok = false; }
      });
      var email = f.querySelector('[name="email"]');
      if (email && email.value.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) { markErr(email, T('co.err.email')); ok = false; }
      saveShip();
      return ok;
    }
    function markErr(el, msg) {
      var wrap = el.closest('.co-field');
      if (wrap) { wrap.classList.add('is-err'); var e = wrap.querySelector('[data-err]'); if (e) e.textContent = msg; }
    }

    // ---- order ----
    function methodLabel() {
      return { cod: T('co.pay.cod'), rib: T('co.pay.rib'), iban: T('co.pay.iban'), paypal: T('co.pay.paypal') }[state.method] || state.method;
    }
    function buildOrder() {
      var items = lines().map(function (it) { return { handle: it.handle, name: it.name, variant: it.variant, qty: it.qty, price: it.price, src: it.src || '' }; });
      var pr = pricing();
      var discounts = pr.discounts.map(function (d) {
        return { id: d.id, label: YZA.i18n.tFmt('promo.charmTier.label', { n: d.meta.count }), amountDh: Math.round(d.amountCents / 100) };
      });
      return { number: state.orderNo || '', items: items, subtotalDh: Math.round(pr.subtotalCents / 100), discounts: discounts, totalDh: Math.round(pr.totalCents / 100), method: state.method, methodLabel: methodLabel(), shipping: state.ship, lang: YZA.i18n.lang, page: location.href, at: new Date().toISOString() };
    }
    // Human-friendly unique order number, shared by WhatsApp / email / WooCommerce / ad pixels.
    function orderNo() {
      var t = Date.now().toString(36).toUpperCase();
      var r = Math.floor(Math.random() * 1296).toString(36).toUpperCase();
      return 'YZA-' + t + (r.length < 2 ? '0' + r : r);
    }
    // GA4-shape ecommerce payload (also consumed by the Meta/TikTok mappers in tracking.js).
    function trackPayload(o) {
      return {
        transaction_id: o.number || '',
        value: pricing().totalCents / 100,   // net of discounts — what the customer pays
        currency: 'MAD',
        payment_type: o.method || state.method,
        items: (o.items || lines()).map(function (it) {
          return { item_id: it.handle, item_name: it.name, item_variant: it.variant || '', quantity: it.qty, price: (it.price || 0) / 100, item_list_name: it.src || '' };
        }),
      };
    }
    function orderText(o) {
      var lang = YZA.i18n.lang || 'fr';
      var tpl = {
        fr: { intro: 'Bonjour YZA, je souhaite commander :', total: 'Total', ship: 'Livraison', pay: 'Paiement' },
        en: { intro: 'Hello YZA, I would like to order:', total: 'Total', ship: 'Shipping', pay: 'Payment' },
        es: { intro: 'Hola YZA, quiero hacer un pedido:', total: 'Total', ship: 'Envío', pay: 'Pago' },
        tr: { intro: 'Merhaba YZA, sipariş vermek istiyorum:', total: 'Toplam', ship: 'Teslimat', pay: 'Ödeme' },
        ar: { intro: 'مرحبا YZA، أود تقديم طلب:', total: 'المجموع', ship: 'التوصيل', pay: 'الدفع' },
      };
      var c = tpl[lang] || tpl.fr;
      var lns = o.items.map(function (it) { return '• ' + it.qty + ' × ' + it.name + (it.variant ? ' (' + it.variant + ')' : '') + ' — ' + fmt(it.price * it.qty); });
      var s = o.shipping || {};
      var addr = [s.name, s.phone, s.address, [s.zip, s.city].filter(Boolean).join(' '), s.country].filter(Boolean).join('\n');
      var out = [c.intro];
      if (o.number) out.push('N° : ' + o.number);
      out = out.concat(lns);
      (o.discounts || []).forEach(function (d) { out.push(d.label + ' : −' + fmt(d.amountDh * 100)); });
      var totalC = pricing().totalCents;
      out.push(c.total + ' : ' + fmt(totalC) + (isIntl() ? ' (' + eur(totalC) + ')' : ''));
      out.push('—');
      out.push(c.ship + ' :\n' + addr);
      if (s.note) out.push('“' + s.note + '”');
      out.push('—');
      out.push(c.pay + ' : ' + o.methodLabel);
      // Include the actual payment coordinates for transfer methods (promised in the UI note).
      var p = PAY();
      if (o.method === 'rib' && p.morocco && p.morocco.rib) {
        out.push('RIB (' + (p.morocco.bank || '') + ') : ' + p.morocco.rib);
        out.push(T('co.pay.holder') + ' : ' + (p.morocco.holder || ''));
        out.push(T('co.pay.ribFee'));
      } else if (o.method === 'iban' && p.eur && p.eur.iban) {
        out.push('IBAN (' + (p.eur.bank || '') + ') : ' + p.eur.iban);
        out.push('BIC : ' + (p.eur.bic || '') + ' — ' + T('co.pay.holder') + ' : ' + (p.eur.holder || ''));
        out.push(eur(pricing().totalCents));
      } else if (o.method === 'paypal' && paypalReady()) {
        out.push('PayPal : ' + (p.paypalEmail || p.paypalLink) + ' (' + eur(pricing().totalCents) + ')');
      }
      return out.join('\n');
    }

    function placeOrder() {
      if (!YZA.cart.items.length) { state.step = 'cart'; render(); return; }
      state.orderNo = orderNo();
      var o = buildOrder();
      // best-effort email + WooCommerce record (never blocks the WhatsApp handoff)
      try {
        fetch((YZA.payment && YZA.payment.orderEndpoint) || 'order.php', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: o, text: orderText(o) }),
        }).catch(function () {});
      } catch (e) {}
      state.wa = 'https://wa.me/' + waDigits() + '?text=' + encodeURIComponent(orderText(o));
      try { if (YZA.analytics) YZA.analytics.track('order_placed', { method: state.method, items: YZA.cart.count(), subtotal_cents: subtotal(), total_cents: pricing().totalCents }); } catch (e) {}
      // Ad platforms: one purchase event per order, keyed by the order number.
      try { if (YZA.track) { YZA.track('add_payment_info', trackPayload(o)); YZA.track('purchase', trackPayload(o)); } } catch (e) {}
      try { sessionStorage.setItem('yza.order.sent', String(Date.now())); } catch (e) {}
      state.lastOrder = o;   // feeds the done-screen add-on suggestions (cart is not cleared)
      state.step = 'done';
      render();
      window.open(state.wa, '_blank', 'noopener');
    }

    // EUR amount (integer) from the DH total (net of discounts), for PayPal / IBAN.
    function eurAmt() {
      var rate = (PAY().eurRate) || 11;
      return Math.max(1, Math.round((pricing().totalCents / 100) / rate));
    }
    // Is a live PayPal path configured (paypal.me link OR receiver email)?
    function paypalReady() {
      var p = PAY();
      return !!(p.paypalLink || p.paypalEmail);
    }
    // Build a pre-filled PayPal payment URL for the current order (amount in EUR).
    function paypalPayUrl() {
      var p = PAY();
      var amt = eurAmt();
      var link = String(p.paypalLink || '').trim();
      if (link) {
        if (/^https?:\/\//i.test(link)) {
          return /paypal\.me/i.test(link) ? link.replace(/\/+$/, '') + '/' + amt + 'EUR' : link;
        }
        if (link.indexOf('@') === -1) return 'https://paypal.me/' + link.replace(/^@/, '') + '/' + amt + 'EUR';
      }
      var email = (link.indexOf('@') > -1 ? link : '') || p.paypalEmail || '';
      if (email) {
        return 'https://www.paypal.com/cgi-bin/webscr?cmd=_xclick' +
          '&business=' + encodeURIComponent(email) +
          '&currency_code=EUR&amount=' + amt +
          '&item_name=' + encodeURIComponent('YZA — commande') +
          '&no_shipping=1';
      }
      return '#';
    }

    // ---- events ----
    root.addEventListener('click', function (e) {
      var next = e.target.closest('[data-next]');
      if (next) {
        var to = next.getAttribute('data-next');
        if (to === 'payment' && !collectShip()) return;      // validate shipping before payment
        if (to === 'payment') {
          try { if (YZA.track) YZA.track('add_shipping_info', trackPayload({})); } catch (e3) {}
          // Order bump: pick ONE low-ticket complement and freeze it (no reshuffle on re-renders).
          if (typeof state.bumpHandle === 'undefined') {
            var ob = YZA.promos && YZA.promos.orderBump;
            var pick = (ob && ob.enabled !== false && typeof YZA.cartSuggestions === 'function')
              ? YZA.cartSuggestions(YZA.cart.items, { limit: 1, maxPriceCents: (ob && ob.maxPriceCents) || 25000, categories: [(ob && ob.category) || 'charms'] })[0]
              : null;
            state.bumpHandle = pick ? pick.handle : null;
            if (state.bumpHandle) { try { YZA.analytics && YZA.analytics.track('order_bump_view', { handle: state.bumpHandle }); } catch (e4) {} }
          }
          // Reconcile: the bump line may have been deleted back in step 1.
          if (state.bumpOn && !YZA.cart.items.some(function (i) { return i.handle === state.bumpHandle; })) state.bumpOn = false;
        }
        if (state.step === 'shipping' && to !== 'cart') collectShip();
        state.step = to; render(); scrollTop(); return;
      }
      var up = e.target.closest('[data-upsell-add]');
      if (up) {
        YZA.cart.add(up.getAttribute('data-upsell-add'), '', 1, { source: 'checkout_cross_sell' });
        try { YZA.analytics && YZA.analytics.track('cross_sell_add', { handle: up.getAttribute('data-upsell-add'), source: 'checkout' }); } catch (e2) {}
        render(); return;
      }
      var back = e.target.closest('[data-back]');
      if (back) { if (state.step === 'shipping') collectShip(); state.step = back.getAttribute('data-back'); render(); scrollTop(); return; }
      var go = e.target.closest('[data-goto]');
      if (go) { if (state.step === 'shipping') collectShip(); state.step = go.getAttribute('data-goto'); render(); scrollTop(); return; }
      var place = e.target.closest('[data-place]');
      if (place) { placeOrder(); scrollTop(); return; }
      // Post-order add-on → WhatsApp "add to my parcel" + best-effort record. Button locks after.
      var addon = e.target.closest('[data-addon]');
      if (addon) {
        var ah = addon.getAttribute('data-addon');
        var ap = YZA.getProduct(ah);
        if (ap && state.lastOrder) {
          var amsg = YZA.i18n.tFmt('co.addon.msg', { no: state.lastOrder.number, item: YZA.i18n.pick(ap.name), price: fmt(ap.price) });
          try {
            fetch((YZA.payment && YZA.payment.orderEndpoint) || 'order.php', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'addon', order: { number: state.lastOrder.number, items: [{ handle: ah, name: YZA.i18n.pick(ap.name), qty: 1, price: ap.price }] }, text: amsg }),
            }).catch(function () {});
          } catch (e7) {}
          try { if (YZA.track) YZA.track('post_order_addon', { value: ap.price / 100, currency: 'MAD', items: [{ item_id: ah, item_name: YZA.i18n.pick(ap.name), quantity: 1, price: ap.price / 100 }] }); } catch (e7) {}
          addon.textContent = T('co.addon.sent'); addon.setAttribute('disabled', 'disabled');
          window.open('https://wa.me/' + waDigits() + '?text=' + encodeURIComponent(amsg), '_blank', 'noopener');
        }
        return;
      }
      // cart qty / remove
      var rm = e.target.closest('[data-remove]');
      if (rm) { YZA.cart.remove(rm.getAttribute('data-handle'), rm.getAttribute('data-variant')); render(); return; }
      var qb = e.target.closest('.qty__btn');
      if (qb) {
        var q = qb.closest('.qty');
        var line = YZA.cart.items.find(function (i) { return i.handle === q.dataset.handle && (i.variant || '') === (q.dataset.variant || ''); });
        if (line) YZA.cart.setQty(q.dataset.handle, q.dataset.variant, line.qty + (qb.dataset.act === 'inc' ? 1 : -1));
        render(); return;
      }
      // copy bank detail
      var cp = e.target.closest('[data-copy]');
      if (cp) {
        var val = cp.getAttribute('data-copy');
        try { navigator.clipboard.writeText(val); } catch (e2) {}
        cp.textContent = T('co.pay.copied');
        setTimeout(function () { cp.textContent = T('co.pay.copy'); }, 1500);
        return;
      }
    });
    root.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-goto]')) { e.preventDefault(); e.target.click(); }
    });
    root.addEventListener('change', function (e) {
      var r = e.target.closest('input[name="pay"]');
      if (r) { state.method = r.value; render(); return; }
      // Order bump: check → add to cart; uncheck → decrement/remove. state.bumpOn is authoritative.
      var bump = e.target.closest('input[data-bump]');
      if (bump) {
        if (bump.checked && !state.bumpOn) {
          YZA.cart.add(state.bumpHandle, '', 1, { source: 'order_bump' });
          state.bumpOn = true;
        } else if (!bump.checked && state.bumpOn) {
          var line = YZA.cart.items.find(function (i) { return i.handle === state.bumpHandle && !(i.variant); });
          if (line && line.qty > 1) YZA.cart.setQty(state.bumpHandle, '', line.qty - 1);
          else YZA.cart.remove(state.bumpHandle, '');
          state.bumpOn = false;
        }
        try { YZA.analytics && YZA.analytics.track('order_bump_toggle', { handle: state.bumpHandle, on: state.bumpOn }); } catch (e5) {}
        render();
      }
    });
    root.addEventListener('input', function (e) {
      if (e.target.closest('#coShipForm') && e.target.name) { state.ship[e.target.name] = e.target.value; saveShip(); }
    });

    function scrollTop() { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); } }

    YZA.i18n.onChange(function () { render(); });
    render();
    try { if (YZA.track && YZA.cart.items.length) YZA.track('begin_checkout', trackPayload({})); } catch (e) {}
  }
}());
