/* ============================================================
   YZA — AD-PLATFORM TRACKING (GTM / GA4 / Meta Pixel / TikTok Pixel)
   ------------------------------------------------------------
   One edit point: YZA.tracking in js/products.js — paste the IDs
   and redeploy. While an ID is empty that platform stays fully OFF
   (no script, no cookies, no requests). Events always buffer into
   window.dataLayer, so Google Tag Manager can be dropped in later
   and replay nothing is required — it reads new events immediately.

   Event names = GA4 ecommerce standard, payload = GA4 shape:
     { transaction_id, value, currency:'MAD',
       items:[{ item_id, item_name, item_variant, quantity, price }] }
   Fired site-wide:
     view_item          — product page view (main.js)
     add_to_cart        — any add to cart (cart.js)
     begin_checkout     — checkout page opened with items (checkout.js)
     add_shipping_info  — shipping form validated (checkout.js)
     add_payment_info   — payment method confirmed (checkout.js)
     purchase           — order placed; transaction_id = YZA-xxxx order
                          number (same number in WhatsApp/email/WooCommerce)
   The same payload is auto-mapped to Meta standard events
   (ViewContent / AddToCart / InitiateCheckout / AddPaymentInfo /
   Purchase, with eventID = order number → Conversions-API-ready
   dedup) and TikTok events (… / CompletePayment).
   ============================================================ */
(function () {
  'use strict';
  window.YZA = window.YZA || {};
  window.dataLayer = window.dataLayer || [];

  function cfg() { return (window.YZA && YZA.tracking) || {}; }

  // ---- platform loaders (only called when an ID is configured) ----
  function loadGtm(id) {
    if (window.google_tag_manager) return;
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
  }
  function loadGa4(id) {
    if (window.gtag) return;
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', id);
  }
  function loadMeta(id) {
    if (window.fbq) return;
    var n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!window._fbq) window._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
    fbq('init', String(id));
    fbq('track', 'PageView');
  }
  function loadTiktok(id) {
    if (window.ttq) return;
    // Official ttq stub: queue method calls until the SDK script arrives.
    var t = 'ttq';
    window.TiktokAnalyticsObject = t;
    var ttq = window[t] = window[t] || [];
    ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
    ttq.setAndDefer = function (obj, method) { obj[method] = function () { obj.push([method].concat(Array.prototype.slice.call(arguments, 0))); }; };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (n2) { var e = ttq._i[n2] || []; for (var j = 0; j < ttq.methods.length; j++) ttq.setAndDefer(e, ttq.methods[j]); return e; };
    ttq.load = function (e, n2) {
      var u = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = u;
      ttq._t = ttq._t || {}; ttq._t[e] = +new Date();
      ttq._o = ttq._o || {}; ttq._o[e] = n2 || {};
      var s = document.createElement('script'); s.async = true; s.src = u + '?sdkid=' + e + '&lib=' + t;
      document.head.appendChild(s);
    };
    ttq.load(String(id));
    ttq.page();
  }

  // ---- payload mappers ----
  var META_EVENTS = { view_item: 'ViewContent', add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', add_payment_info: 'AddPaymentInfo', purchase: 'Purchase' };
  var TIKTOK_EVENTS = { view_item: 'ViewContent', add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', add_payment_info: 'AddPaymentInfo', purchase: 'CompletePayment' };

  function items(p) { return (p && p.items) || []; }
  function metaPayload(p) {
    return {
      value: Number(p.value || 0),
      currency: p.currency || 'MAD',
      content_type: 'product',
      content_ids: items(p).map(function (i) { return i.item_id; }),
      contents: items(p).map(function (i) { return { id: i.item_id, quantity: i.quantity || 1, item_price: i.price }; }),
      num_items: items(p).reduce(function (n, i) { return n + (i.quantity || 1); }, 0),
    };
  }
  function tiktokPayload(p) {
    return {
      value: Number(p.value || 0),
      currency: p.currency || 'MAD',
      content_type: 'product',
      contents: items(p).map(function (i) { return { content_id: i.item_id, content_name: i.item_name, quantity: i.quantity || 1, price: i.price }; }),
    };
  }

  // ---- the single tracking entry point ----
  YZA.track = function (event, params) {
    params = params || {};
    // 1) dataLayer (GTM + anything else that reads it). Reset `ecommerce`
    //    between pushes per Google's guidance so payloads never merge.
    try {
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({ event: event, ecommerce: params });
    } catch (e) {}
    // 2) GA4 direct (only when gtag was loaded here, i.e. no GTM).
    try { if (window.gtag && cfg().ga4Id && !cfg().gtmId) gtag('event', event, params); } catch (e) {}
    // 3) Meta Pixel — standard event + eventID for future CAPI dedup.
    try {
      if (window.fbq && cfg().metaPixelId) {
        var me = META_EVENTS[event];
        var mo = params.transaction_id ? { eventID: params.transaction_id } : undefined;
        if (me) fbq('track', me, metaPayload(params), mo);
        else fbq('trackCustom', event, metaPayload(params), mo);
      }
    } catch (e) {}
    // 4) TikTok Pixel — standard event + event_id dedup.
    try {
      if (window.ttq && cfg().tiktokPixelId) {
        var te = TIKTOK_EVENTS[event];
        if (te) window.ttq.track(te, tiktokPayload(params), params.transaction_id ? { event_id: params.transaction_id } : undefined);
      }
    } catch (e) {}
  };

  // ---- boot (products.js defines YZA.tracking and loads before us) ----
  function boot() {
    var c = cfg();
    if (c.gtmId) loadGtm(c.gtmId);
    if (c.ga4Id && !c.gtmId) loadGa4(c.ga4Id);
    if (c.metaPixelId) loadMeta(c.metaPixelId);
    if (c.tiktokPixelId) loadTiktok(c.tiktokPixelId);
  }
  boot();
}());
