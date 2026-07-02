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
  save() {
    localStorage.setItem(KEY, JSON.stringify(this.items));
    this.refresh();
    // Lets non-drawer surfaces (PDP free-ship line…) stay honest as the cart changes.
    try { document.dispatchEvent(new CustomEvent('yza:cartchange')); } catch (e) {}
  },
  _key(handle, variant) { return handle + '|' + (variant || ''); },

  // meta.source tags where the add came from (pdp / quick_add / bundle / cart_cross_sell /
  // checkout_cross_sell / order_bump …) — attach rates are then counted from orders.
  add(handle, variant = '', qty = 1, meta = {}) {
    const k = this._key(handle, variant);
    let line = this.items.find(i => this._key(i.handle, i.variant) === k);
    if (line) { line.qty += qty; if (meta.source && !line.src) line.src = meta.source; }
    else { line = { handle, variant, qty }; if (meta.source) line.src = meta.source; this.items.push(line); }
    this.save();
    const product = YZA.getProduct?.(handle);
    YZA.analytics?.track('add_to_cart', {
      handle,
      variant,
      qty,
      category: product?.category || '',
      familyHandle: product?.familyHandle || '',
      price: product?.price || 0,
      source: meta.source || 'pdp',
    });
    // Ad platforms (GA4/Meta/TikTok via tracking.js) — standard add_to_cart.
    try {
      YZA.track?.('add_to_cart', {
        value: ((product?.price || 0) * qty) / 100,
        currency: 'MAD',
        items: [{ item_id: handle, item_name: YZA.i18n?.pick?.(product?.name) || handle, item_variant: variant || '', quantity: qty, price: (product?.price || 0) / 100, item_list_name: meta.source || 'pdp' }],
      });
    } catch (e) {}
    return line;
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

  // ---- Derived money spine — computed on every read, NEVER stored. Every surface
  // that shows an amount (drawer, checkout summary, WhatsApp text, order.php payload,
  // ad pixels) reads THIS, so the figures can't drift apart. ----
  pricing() {
    const subtotal = this.subtotalCents();
    const discounts = [];
    const cfg = YZA.promos?.charmTiers;
    if (cfg?.enabled) {
      let count = 0;
      let charmSubtotal = 0;
      this.items.forEach((i) => {
        const p = YZA.getProduct(i.handle);
        if (!p || p.category !== (cfg.category || 'charms') || p.bundle) return; // trio bundles keep their own pricing
        count += i.qty;
        charmSubtotal += p.price * i.qty;
      });
      const tier = (cfg.tiers || []).filter(tr => count >= tr.min).sort((a, b) => b.min - a.min)[0];
      if (tier && charmSubtotal > 0) {
        // Rounded to WHOLE DH at the source: drawer/checkout/WhatsApp/Woo/GA4 all show the same integer.
        const amount = Math.round((charmSubtotal * tier.pct) / 100 / 100) * 100;
        if (amount > 0) discounts.push({ id: 'charmTier', amountCents: amount, meta: { count, pct: tier.pct } });
      }
    }
    const discountCents = discounts.reduce((s, d) => s + d.amountCents, 0);
    return { subtotalCents: subtotal, discounts, discountCents, totalCents: Math.max(0, subtotal - discountCents) };
  },
  totalCents() { return this.pricing().totalCents; },
  // How many tier-eligible charms are in the cart (for the "add a 3rd" nudge line).
  charmTierCount() {
    const cfg = YZA.promos?.charmTiers;
    if (!cfg?.enabled) return 0;
    return this.items.reduce((n, i) => {
      const p = YZA.getProduct(i.handle);
      return n + ((p && p.category === (cfg.category || 'charms') && !p.bundle) ? i.qty : 0);
    }, 0);
  },

  // ---- Shared free-shipping math (drawer bar, checkout summary, PDP line, nudges).
  // assumeItems: virtual extra items — e.g. the PDP product before it's added. ----
  shippingProgress(opts = {}) {
    const assumed = opts.assumeItems || [];
    const all = this.items.concat(assumed);
    const allAccessories = all.length > 0 && all.every((i) => {
      const p = YZA.getProduct?.(i.handle);
      return p && p.group === 'accessories';
    });
    const threshold = allAccessories
      ? (YZA.servicePolicy?.freeShippingAccessoriesDh || 50000)
      : (YZA.servicePolicy?.freeShippingDh || 150000);
    const assumedCents = assumed.reduce((s, i) => {
      const p = YZA.getProduct?.(i.handle);
      return s + (p ? p.price * (i.qty || 1) : 0);
    }, 0);
    // What the customer actually pays (post-discount) — honest + consistent everywhere.
    const paid = this.pricing().totalCents + assumedCents;
    const remaining = Math.max(0, threshold - paid);
    return {
      thresholdCents: threshold,
      paidCents: paid,
      remainingCents: remaining,
      pct: Math.max(0, Math.min(100, Math.round((paid / threshold) * 100))),
      allAccessories,
      unlocked: remaining === 0 && all.length > 0,
    };
  },

  deliveryProgressHTML() {
    const t = YZA.i18n;
    const s = this.shippingProgress();
    const remaining = s.remainingCents;
    const pct = s.pct;
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
        <span>${t.formatPrice(s.paidCents)}</span>
        <span>${t.formatPrice(s.thresholdCents)}</span>
      </div>`;
  },

  /* — UI — */
  open() {
    document.getElementById('cartDrawer')?.classList.add('is-open');
    document.getElementById('cartOverlay')?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    YZA.analytics?.track('cart_open', { items: this.count(), subtotal_cents: this.subtotalCents(), total_cents: this.pricing().totalCents });
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
    const linesHTML = this.items.map(i => {
      const p = YZA.getProduct(i.handle); if (!p) return '';
      const cartImg = (i.variant && YZA.bagVariantFor?.(p.handle, i.variant)?.img) || p.img;
      const st = YZA.inventoryStatus?.(p) || {};
      return `<div class="cart-line">
        <a class="cart-line__img" href="/produits/${encodeURIComponent(p.handle)}"><img src="${cartImg}" alt="" width="72" height="90" loading="lazy"></a>
        <div class="cart-line__info">
          <a class="cart-line__name" href="/produits/${encodeURIComponent(p.handle)}">${t.pick(p.name)}</a>
          ${i.variant ? `<div class="cart-line__variant">${i.variant}</div>` : ''}
          <div class="cart-line__price">${t.formatPrice(p.price)}</div>
          ${st.almostGone ? `<div class="cart-line__scarcity">${t.tFmt('scarcity.remaining', { n: st.inventory })}</div>` : ''}
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
    body.innerHTML = linesHTML + this.upsellHTML();
    if (foot) {
      foot.hidden = false;
      const pr = this.pricing();
      const sub = foot.querySelector('[data-cart-subtotal]');
      if (sub) sub.textContent = t.formatPrice(pr.totalCents);
      const discEl = foot.querySelector('[data-cart-discount]');
      if (discEl) {
        if (pr.discountCents > 0) {
          const d = pr.discounts[0];
          discEl.hidden = false;
          discEl.innerHTML = `<span>${t.tFmt('promo.charmTier.label', { n: d.meta.count })}</span><strong>−${t.formatPrice(d.amountCents)}</strong>`;
        } else { discEl.hidden = true; discEl.innerHTML = ''; }
      }
      const progress = foot.querySelector('[data-cart-progress]');
      if (progress) progress.innerHTML = this.deliveryProgressHTML();
    }
  },

  // "Complétez votre pièce" — 2 one-tap complement cards under the cart lines.
  // Derived from the live cart on every refresh; hidden when nothing qualifies.
  upsellHTML() {
    const t = YZA.i18n;
    const cfg = YZA.promos?.crossSell;
    if (cfg?.enabled === false || typeof YZA.cartSuggestions !== 'function' || !this.items.length) return '';
    const tierCount = this.charmTierCount();
    // While the trio play is active (1-2 charms), suggestions stay charms so the
    // cards and the "add a 3rd charm" nudge tell one coherent story.
    const trioPlay = tierCount >= 1 && tierCount <= 2 && this.items.every(i => (YZA.getProduct(i.handle) || {}).category === 'charms');
    const sug = YZA.cartSuggestions(this.items, { limit: cfg?.limit || 2, categories: trioPlay ? ['charms'] : undefined });
    if (!sug.length) return '';
    const nudge = tierCount === 1 ? t.t('promo.charmTier.nudge1') : (tierCount === 2 ? t.t('promo.charmTier.nudge2') : '');
    const cards = sug.map(p => {
      const st = YZA.inventoryStatus?.(p) || {};
      return `<div class="upsell-card">
        <a class="upsell-card__img" href="/produits/${encodeURIComponent(p.handle)}"><img src="${p.img}" alt="" width="56" height="72" loading="lazy"></a>
        <div class="upsell-card__body">
          <a class="upsell-card__name" href="/produits/${encodeURIComponent(p.handle)}">${t.pick(p.name)}</a>
          <span class="upsell-card__price">${t.formatPrice(p.price)}</span>
          ${st.almostGone ? `<span class="upsell-card__chip">${t.tFmt('scarcity.remaining', { n: st.inventory })}</span>` : ''}
        </div>
        <button type="button" class="upsell-card__add" data-upsell-add="${p.handle}" aria-label="+">+</button>
      </div>`;
    }).join('');
    return `<div class="cart-upsell">
      <p class="cart-upsell__title">${t.t('cart.upsell.title')}</p>
      ${nudge ? `<p class="cart-upsell__nudge">${nudge}</p>` : ''}
      <div class="cart-upsell__grid">${cards}</div>
    </div>`;
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
    const pr = this.pricing();
    const discLines = pr.discounts.map(d => `${t.tFmt('promo.charmTier.label', { n: d.meta.count })} : −${t.formatPrice(d.amountCents)}`);
    return [c.intro, ...lines, ...discLines, `${c.total} : ${t.formatPrice(pr.totalCents)}`, c.ship, `${c.link} : ${location.href}`].join('\n');
  },

  // Checkout = go to the dedicated /checkout page (shipping + payment). The cart is
  // preserved in localStorage so the page renders from it. WhatsApp handoff now happens
  // at the end of checkout (see js/checkout.js), with the full order + shipping details.
  checkout() {
    if (!this.items.length) { this.close(); window.location.href = '/collections/charms'; return; }
    YZA.analytics?.track('checkout_initiated', { items: this.count(), subtotal_cents: this.subtotalCents(), total_cents: this.pricing().totalCents });
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
        const up = e.target.closest('[data-upsell-add]');
        if (up) {
          this.add(up.dataset.upsellAdd, '', 1, { source: 'cart_cross_sell' });
          YZA.analytics?.track('cross_sell_add', { handle: up.dataset.upsellAdd, source: 'drawer' });
          return;
        }
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
    // Dynamic blocks (cross-sell, scarcity, discount rows) are rendered with t() at build
    // time — rebuild them on language switch (i18n apply() only rewrites [data-i18n] nodes).
    YZA.i18n?.onChange?.(() => this.refresh());
    this.refresh();
  },
};

YZA.cart = cart;
