/* ============================================================
   YZA — PANIER (localStorage)
   API : add / remove / setQty / count / subtotal + drawer.
   Branchable plus tard sur Shopify/Stripe (remplacer checkout()).
   ============================================================ */
window.YZA = window.YZA || {};

const KEY = 'yza.cart';

const cart = {
  items: [],
  load() { try { this.items = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { this.items = []; } },
  save() { localStorage.setItem(KEY, JSON.stringify(this.items)); this.refresh(); },
  _key(handle, variant) { return handle + '|' + (variant || ''); },

  add(handle, variant = '', qty = 1) {
    const k = this._key(handle, variant);
    const line = this.items.find(i => this._key(i.handle, i.variant) === k);
    if (line) line.qty += qty; else this.items.push({ handle, variant, qty });
    this.save();
    const product = YZA.getProduct?.(handle);
    YZA.analytics?.track('add_to_cart', {
      handle,
      variant,
      qty,
      category: product?.category || '',
      familyHandle: product?.familyHandle || '',
      price: product?.price || 0,
    });
    // Ad platforms (GA4/Meta/TikTok via tracking.js) — standard add_to_cart.
    try {
      YZA.track?.('add_to_cart', {
        value: ((product?.price || 0) * qty) / 100,
        currency: 'MAD',
        items: [{ item_id: handle, item_name: YZA.i18n?.pick?.(product?.name) || handle, item_variant: variant || '', quantity: qty, price: (product?.price || 0) / 100 }],
      });
    } catch (e) {}
  },
  remove(handle, variant) {
    const k = this._key(handle, variant);
    this.items = this.items.filter(i => this._key(i.handle, i.variant) !== k);
    this.save();
  },
  setQty(handle, variant, qty) {
    const line = this.items.find(i => this._key(i.handle, i.variant) === this._key(handle, variant));
    if (!line) return;
    line.qty = Math.max(1, qty);
    this.save();
  },
  count() { return this.items.reduce((n, i) => n + i.qty, 0); },
  subtotalCents() {
    return this.items.reduce((s, i) => {
      const p = YZA.getProduct(i.handle);
      return s + (p ? p.price * i.qty : 0);
    }, 0);
  },
  deliveryProgressHTML() {
    const t = YZA.i18n;
    const subtotal = this.subtotalCents();
    const allAccessories = this.items.length > 0 && this.items.every(i => {
      const p = YZA.getProduct?.(i.handle);
      return p && p.group === 'accessories';
    });
    const threshold = allAccessories
      ? (YZA.servicePolicy?.freeShippingAccessoriesDh || 50000)
      : (YZA.servicePolicy?.freeShippingDh || 150000);
    const remaining = Math.max(0, threshold - subtotal);
    const pct = Math.max(0, Math.min(100, Math.round((subtotal / threshold) * 100)));
    const lang = t.lang || 'fr';
    const copy = {
      fr: remaining
        ? `Ajoutez ${t.formatPrice(remaining)} pour la livraison offerte au Maroc.`
        : 'Livraison offerte au Maroc débloquée.',
      en: remaining
        ? `Add ${t.formatPrice(remaining)} more for free delivery in Morocco.`
        : 'Free delivery in Morocco unlocked.',
      es: remaining
        ? `Anade ${t.formatPrice(remaining)} para envio gratis en Marruecos.`
        : 'Envio gratis en Marruecos desbloqueado.',
      tr: remaining
        ? `Fas ici ucretsiz teslimat icin ${t.formatPrice(remaining)} daha ekleyin.`
        : 'Fas ici ucretsiz teslimat acildi.',
      ar: remaining
        ? `أضيفي ${t.formatPrice(remaining)} للحصول على توصيل مجاني في المغرب.`
        : 'تم تفعيل التوصيل المجاني داخل المغرب.',
    };
    return `<p>${copy[lang] || copy.fr}</p>
      <div class="cart-progress__track" aria-hidden="true"><span style="width:${pct}%"></span></div>
      <div class="cart-progress__meta">
        <span>${t.formatPrice(subtotal)}</span>
        <span>${t.formatPrice(threshold)}</span>
      </div>`;
  },

  /* — UI — */
  open() {
    document.getElementById('cartDrawer')?.classList.add('is-open');
    document.getElementById('cartOverlay')?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    YZA.analytics?.track('cart_open', { items: this.count(), subtotal_cents: this.subtotalCents() });
  },
  close() { document.getElementById('cartDrawer')?.classList.remove('is-open'); document.getElementById('cartOverlay')?.classList.remove('is-open'); document.body.style.overflow = ''; },

  refresh() {
    const t = YZA.i18n;
    // compteur
    const n = this.count();
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = n;
      el.classList.toggle('is-visible', n > 0);
    });
    // corps du drawer
    const body = document.getElementById('cartBody');
    const foot = document.getElementById('cartFoot');
    if (!body) return;
    if (!this.items.length) {
      body.innerHTML = `<div class="cart-empty">
        <p data-i18n="cart.empty">${t.t('cart.empty')}</p>
        <a class="btn btn--outline" href="/collections/charms" data-i18n="cart.emptyCta">${t.t('cart.emptyCta')}</a></div>`;
      if (foot) foot.hidden = true;
      return;
    }
    body.innerHTML = this.items.map(i => {
      const p = YZA.getProduct(i.handle); if (!p) return '';
      const cartImg = (i.variant && YZA.bagVariantFor?.(p.handle, i.variant)?.img) || p.img;
      return `<div class="cart-line">
        <a class="cart-line__img" href="/produits/${encodeURIComponent(p.handle)}"><img src="${cartImg}" alt="" width="72" height="90" loading="lazy"></a>
        <div class="cart-line__info">
          <a class="cart-line__name" href="/produits/${encodeURIComponent(p.handle)}">${t.pick(p.name)}</a>
          ${i.variant ? `<div class="cart-line__variant">${i.variant}</div>` : ''}
          <div class="cart-line__price">${t.formatPrice(p.price)}</div>
          <div class="cart-line__row">
            <div class="qty" data-handle="${p.handle}" data-variant="${i.variant}">
              <button class="qty__btn" data-act="dec" aria-label="-">−</button>
              <span class="qty__n">${i.qty}</span>
              <button class="qty__btn" data-act="inc" aria-label="+">+</button>
            </div>
            <button class="cart-line__remove" data-remove data-handle="${p.handle}" data-variant="${i.variant}">${t.t('cart.remove')}</button>
          </div>
        </div></div>`;
    }).join('');
    if (foot) {
      foot.hidden = false;
      const sub = foot.querySelector('[data-cart-subtotal]');
      if (sub) sub.textContent = t.formatPrice(this.subtotalCents());
      const progress = foot.querySelector('[data-cart-progress]');
      if (progress) progress.innerHTML = this.deliveryProgressHTML();
    }
  },

  // Build the WhatsApp order message in the active language (product names stay original).
  orderMessage() {
    const t = YZA.i18n;
    const lang = (t && t.lang) || 'fr';
    const lines = this.items.map((line) => {
      const p = YZA.getProduct(line.handle);
      if (!p) return '';
      const variant = line.variant ? ` (${line.variant})` : '';
      return `• ${line.qty} × ${t.pick(p.name)}${variant} — ${t.formatPrice(p.price * line.qty)}`;
    }).filter(Boolean);
    const tpl = {
      fr: { intro: 'Bonjour YZA, je souhaite commander :', total: 'Total', ship: 'Livraison et retour à confirmer ensemble.', link: 'Page' },
      en: { intro: 'Hello YZA, I would like to order:', total: 'Total', ship: 'Delivery and return to confirm together.', link: 'Page' },
      es: { intro: 'Hola YZA, me gustaria hacer un pedido:', total: 'Total', ship: 'Envio y devolucion a confirmar juntos.', link: 'Pagina' },
      tr: { intro: 'Merhaba YZA, siparis vermek istiyorum:', total: 'Toplam', ship: 'Teslimat ve iade birlikte onaylanacak.', link: 'Sayfa' },
      ar: { intro: 'مرحبا YZA، أود تقديم طلب:', total: 'المجموع', ship: 'يتم تأكيد التوصيل والإرجاع معا.', link: 'الصفحة' },
    };
    const c = tpl[lang] || tpl.fr;
    return [c.intro, ...lines, `${c.total} : ${t.formatPrice(this.subtotalCents())}`, c.ship, `${c.link} : ${location.href}`].join('\n');
  },

  // Checkout = go to the dedicated /checkout page (shipping + payment). The cart is
  // preserved in localStorage so the page renders from it. WhatsApp handoff now happens
  // at the end of checkout (see js/checkout.js), with the full order + shipping details.
  checkout() {
    if (!this.items.length) { this.close(); window.location.href = '/collections/charms'; return; }
    YZA.analytics?.track('checkout_initiated', { items: this.count(), subtotal_cents: this.subtotalCents() });
    window.location.href = '/checkout';
  },

  init() {
    this.load();
    // délégation d'événements sur le drawer
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
      drawer.addEventListener('click', (e) => {
        const acc = e.target.closest('[data-cart-acc]');
        if (acc) { acc.closest('.cart-acc__item')?.classList.toggle('is-open'); return; }
        const rm = e.target.closest('[data-remove]');
        if (rm) { this.remove(rm.dataset.handle, rm.dataset.variant); return; }
        const qbtn = e.target.closest('.qty__btn');
        if (qbtn) {
          const q = qbtn.closest('.qty');
          const line = this.items.find(i => i.handle === q.dataset.handle && (i.variant || '') === (q.dataset.variant || ''));
          if (line) this.setQty(q.dataset.handle, q.dataset.variant, line.qty + (qbtn.dataset.act === 'inc' ? 1 : -1));
          return;
        }
        if (e.target.closest('[data-checkout]')) this.checkout();
      });
    }
    document.querySelectorAll('[data-cart-open]').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); this.open(); }));
    document.getElementById('cartOverlay')?.addEventListener('click', () => this.close());
    document.getElementById('cartClose')?.addEventListener('click', () => this.close());
    this.refresh();
  },
};

YZA.cart = cart;
