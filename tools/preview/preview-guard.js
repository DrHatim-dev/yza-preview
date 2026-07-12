/* YZA GitHub Pages preview guard.
 * Loaded before storefront scripts. It never reports a fake success: every
 * transactional request returns an explicit 503 and every user action displays
 * the same clear visual-preview notice.
 */
(function previewGuard() {
  'use strict';

  var meta = document.querySelector('meta[name="yza-preview-base"]');
  var base = (meta && meta.content) || '/yza-preview/';
  base = '/' + base.replace(/^\/+|\/+$/g, '') + '/';
  var baseWithoutSlash = base.slice(0, -1);
  var rawPath = window.location.pathname || '/';
  window.__YZA_PREVIEW__ = true;
  window.__YZA_PREVIEW_PATHNAME__ = rawPath.indexOf(baseWithoutSlash + '/') === 0
    ? rawPath.slice(baseWithoutSlash.length) || '/'
    : rawPath;

  var message = 'Preview — sending disabled';
  var endpointNames = ['contact.php', 'subscribe.php', 'cart-capture.php', 'order.php'];

  // Prevent the storefront from mounting production Plausible analytics.
  window.plausible = function () {};
  var analyticsMarker = document.createElement('script');
  analyticsMarker.type = 'application/json';
  analyticsMarker.dataset.domain = 'preview.invalid';
  analyticsMarker.src = 'data:application/json,plausible-preview-disabled';
  document.head.appendChild(analyticsMarker);

  function endpointName(input) {
    try {
      var value = input && input.url ? input.url : String(input || '');
      var url = new URL(value, window.location.href);
      var name = url.pathname.split('/').filter(Boolean).pop() || '';
      return endpointNames.indexOf(name) === -1 ? '' : name;
    } catch (error) {
      return '';
    }
  }

  function ensureUi() {
    var badge = document.getElementById('yzaPreviewBadge');
    if (badge) return badge;
    badge = document.createElement('div');
    badge.id = 'yzaPreviewBadge';
    badge.setAttribute('role', 'status');
    badge.setAttribute('aria-live', 'polite');
    badge.textContent = 'VISUAL PREVIEW';
    badge.style.cssText = [
      'position:fixed', 'z-index:2147483647', 'left:50%', 'bottom:14px',
      'transform:translateX(-50%)', 'padding:8px 14px', 'border:1px solid #171512',
      'background:#f7f4ee', 'color:#171512', 'font:500 11px/1.2 Jost,Arial,sans-serif',
      'letter-spacing:.16em', 'text-transform:uppercase', 'box-shadow:0 4px 22px rgba(0,0,0,.12)',
      'pointer-events:none', 'max-width:calc(100vw - 32px)', 'text-align:center'
    ].join(';');
    (document.body || document.documentElement).appendChild(badge);
    return badge;
  }

  function notify() {
    var badge = ensureUi();
    badge.textContent = message;
    badge.style.background = '#171512';
    badge.style.color = '#f7f4ee';
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(function () {
      badge.textContent = 'VISUAL PREVIEW';
      badge.style.background = '#f7f4ee';
      badge.style.color = '#171512';
    }, 4200);
  }

  function setInlineMessage(form) {
    if (!form || !form.querySelector) return;
    var target = form.querySelector('[data-form-msg], [data-news-msg], [data-msg], [role="status"]');
    if (target) {
      target.hidden = false;
      target.textContent = message;
    }
  }

  function disabledResponse(name) {
    notify();
    return new Response(JSON.stringify({
      ok: false,
      error: 'preview_disabled',
      endpoint: name,
      message: message
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }

  var nativeFetch = window.fetch && window.fetch.bind(window);
  if (nativeFetch) {
    window.fetch = function guardedFetch(input, init) {
      var name = endpointName(input);
      return name ? Promise.resolve(disabledResponse(name)) : nativeFetch(input, init);
    };
  }

  if (window.XMLHttpRequest) {
    var nativeOpen = XMLHttpRequest.prototype.open;
    var nativeSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function guardedOpen(method, url) {
      this.__yzaPreviewEndpoint = endpointName(url);
      return nativeOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function guardedSend() {
      if (!this.__yzaPreviewEndpoint) return nativeSend.apply(this, arguments);
      notify();
      try { this.abort(); } catch (error) {}
      return undefined;
    };
  }

  if (navigator.sendBeacon) {
    var nativeBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function guardedBeacon(url, data) {
      if (!endpointName(url)) return nativeBeacon(url, data);
      notify();
      return false;
    };
  }

  // Capture before storefront handlers. This is essential for the legacy contact
  // handler, which otherwise displays an optimistic success without awaiting fetch.
  document.addEventListener('submit', function blockTransactionalForm(event) {
    var form = event.target;
    if (!form || !form.matches) return;
    var targetEndpoint = endpointName(form.getAttribute('action') || '');
    var isTransactional = !!targetEndpoint || form.matches(
      '[data-contact-form], .newsletter__form, .blog-newsletter__form, .yzapop form, [data-preview-transaction]'
    );
    if (!isTransactional) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    setInlineMessage(form);
    notify();
  }, true);

  // Checkout uses a button rather than a form submit.
  document.addEventListener('click', function blockOrderButton(event) {
    var button = event.target && event.target.closest ? event.target.closest('[data-place]') : null;
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    notify();
  }, true);

  document.addEventListener('DOMContentLoaded', ensureUi, { once: true });
}());
