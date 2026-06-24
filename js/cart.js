/* ============================================================
 YZA - PANIER (localStorage)
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
 const product = YZA.getProduct?.(handle);
 if (YZA.inventoryStatus?.(product).soldOut) {
 YZA.analytics?.track('add_to_cart_blocked', { handle, variant, reason: 'sold_out' });
 return false;
 }
 const k = this._key(handle, variant);
 const line = this.items.find(i => this._key(i.handle, i.variant) === k);
 if (line) line.qty += qty; else this.items.push({ handle, variant, qty });
 this.save();
 YZA.analytics?.track('add_to_cart', {
 handle,
 variant,
 qty,
 category: product?.category || '',
 familyHandle: product?.familyHandle || '',
 price: product?.price || 0,
 });
 return true;
 },
 remove(handle, variant) {
 const line = this.items.find(i => this._key(i.handle, i.variant) === this._key(handle, variant));
 const k = this._key(handle, variant);
 this.items = this.items.filter(i => this._key(i.handle, i.variant) !== k);
 this.save();
 const product = YZA.getProduct?.(handle);
 YZA.analytics?.track('remove_from_cart', {
 handle,
 variant,
 qty: line?.qty || 1,
 category: product?.category || '',
 price: product?.price || 0,
 });
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

 /* - UI - */
 open() {
 const drawer = document.getElementById('cartDrawer');
 const wasOpen = drawer?.classList.contains('is-open');
 drawer?.classList.add('is-open');
 document.getElementById('cartOverlay')?.classList.add('is-open');
 document.body.style.overflow = 'hidden';
 document.body.classList.add('has-cart-drawer');
 if (!wasOpen) YZA.analytics?.track('cart_open', { itemCount: this.count(), subtotal: this.subtotalCents() });
 },
 close() {
 const drawer = document.getElementById('cartDrawer');
 const wasOpen = drawer?.classList.contains('is-open');
 drawer?.classList.remove('is-open');
 document.getElementById('cartOverlay')?.classList.remove('is-open');
 document.body.style.overflow = '';
 document.body.classList.remove('has-cart-drawer');
 if (wasOpen) YZA.analytics?.track('cart_close', { itemCount: this.count(), subtotal: this.subtotalCents() });
 },

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
 <a class="btn btn--outline" href="collections.html?cat=charms" data-i18n="cart.emptyCta">${t.t('cart.emptyCta')}</a></div>`;
 if (foot) foot.hidden = true;
 return;
 }
 body.innerHTML = this.items.map(i => {
 const p = YZA.getProduct(i.handle); if (!p) return '';
 const cartImg = (i.variant && YZA.bagVariantFor?.(p.handle, i.variant)?.img) || p.img;
 return `<div class="cart-line">
 <a class="cart-line__img" href="produit.html?handle=${p.handle}"><img src="${cartImg}" alt="${t.pick(p.name)} - YZA" width="72" height="90" loading="lazy" decoding="async"></a>
 <div class="cart-line__info">
 <a class="cart-line__name" href="produit.html?handle=${p.handle}">${t.pick(p.name)}</a>
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

 checkoutMessage() {
 const t = YZA.i18n;
 const lang = t.lang || 'fr';
 const copy = {
 fr: { hello: 'Bonjour YZA,', intro: 'Je souhaite passer commande.', subtotal: 'Sous-total', language: 'Langue' },
 en: { hello: 'Hello YZA,', intro: 'I would like to place this order.', subtotal: 'Subtotal', language: 'Language' },
 es: { hello: 'Hola YZA,', intro: 'Me gustaría hacer este pedido.', subtotal: 'Subtotal', language: 'Idioma' },
 tr: { hello: 'Merhaba YZA,', intro: 'Bu siparişi vermek istiyorum.', subtotal: 'Ara toplam', language: 'Dil' },
 ar: { hello: 'مرحبا YZA،', intro: 'أود إتمام هذا الطلب.', subtotal: 'المجموع الفرعي', language: 'اللغة' },
 };
 const c = copy[lang] || copy.fr;
 const lines = this.items.map((i) => {
 const p = YZA.getProduct(i.handle);
 if (!p) return '';
 const variant = i.variant ? ` - ${i.variant}` : '';
 return `- ${i.qty} x ${t.pick(p.name)}${variant} - ${t.formatPrice(p.price * i.qty)}`;
 }).filter(Boolean);
 return [
 c.hello,
 c.intro,
 '',
 ...lines,
 '',
 `${c.subtotal}: ${t.formatPrice(this.subtotalCents())}`,
 `${c.language}: ${lang.toUpperCase()}`,
 `Page: ${location.href}`,
 ].join('\n');
 },

 checkout() {
 if (!this.items.length) return;
 const items = this.items.map((i) => {
 const p = YZA.getProduct(i.handle);
 return { handle: i.handle, variant: i.variant || '', qty: i.qty, price: p?.price || 0, name: p ? YZA.i18n.pick(p.name) : i.handle, category: p?.category || '' };
 });
 YZA.analytics?.track('checkout_initiated', {
 items,
 subtotal: this.subtotalCents(),
 currency: 'MAD',
 language: YZA.i18n?.lang || 'fr',
 });
 YZA.decrementInventory?.(items);
 const phone = (YZA.brand?.whatsapp || '').replace(/\D/g, '');
 const url = `https://wa.me/${phone}?text=${encodeURIComponent(this.checkoutMessage())}`;
 window.open(url, '_blank', 'noopener');
 this.items = [];
 this.save();
 this.close();
 },

 init() {
 this.load();
 // délégation d'événements sur le drawer
 const drawer = document.getElementById('cartDrawer');
 if (drawer) {
 drawer.addEventListener('click', (e) => {
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
