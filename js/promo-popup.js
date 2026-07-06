/* YZA — homepage welcome popup: captures e-mail + WhatsApp for 10% off the first order.
   Self-contained (injects its own styles + markup), home page only, shows once per visitor,
   reuses /subscribe.php for capture (adds a WhatsApp field + source tag). Styled in the YZA
   brand (white/ink + Fraunces display), laid out like the split-image reference. */
(function () {
  'use strict';
  if (!document || !document.body) return;
  // Runs on every discovery page (home, collections, product, story pages) so it greets a
  // visitor whatever page they land on — but NEVER interrupts a purchase: skip the cart /
  // checkout / order-confirmation flow.
  var NOPE = { checkout: 1, cart: 1, panier: 1, order: 1, confirmation: 1, merci: 1, account: 1, compte: 1 };
  if (NOPE[document.body.dataset.page]) return;

  var KEY = 'yza_promo10_v1';
  var ONCE_PER = 86400000; // 24h — greet each visitor at most once per day
  // Shows the first time they open the site each day, then stays quiet for the next 24h.
  try { var last = parseInt(localStorage.getItem(KEY) || '0', 10); if (last && (Date.now() - last) < ONCE_PER) return; } catch (e) { /* private mode: still show */ }

  var CODE = 'YZA10';
  var IMG = 'assets/hero/la-sculpture-lifestyle.jpg';
  var lang = (window.YZA && YZA.i18n && YZA.i18n.lang) || document.documentElement.getAttribute('lang') || 'fr';

  var COPY = {
    fr: { eyebrow: 'Entrez votre e-mail pour profiter', big1: '-10 %', big2: 'sur votre première commande',
      email: 'Votre adresse e-mail', wa: 'Votre WhatsApp (+212…)', btn: 'Profiter de -10 %',
      fine: 'On vous envoie votre code de bienvenue. Désinscription à tout moment.',
      okTitle: 'Bienvenue dans le vestiaire de Marrakech', okBody: 'Votre code : ',
      okAfter: ' — mentionnez-le sur WhatsApp, on applique -10 % à votre première commande.',
      errEmail: 'Entrez un e-mail valide.', errWa: 'Entrez votre numéro WhatsApp.', close: 'Fermer', sending: 'Un instant…',
      retry: 'Envoi impossible pour le moment — réessayez.' },
    en: { eyebrow: 'Enter your email to enjoy', big1: '10% off', big2: 'your first order',
      email: 'Your email address', wa: 'Your WhatsApp (+…)', btn: 'Enjoy 10% off',
      fine: "We'll email your welcome code. Unsubscribe anytime.",
      okTitle: 'Welcome to the wardrobe of Marrakesh', okBody: 'Your code: ',
      okAfter: ' — mention it on WhatsApp and we apply 10% to your first order.',
      errEmail: 'Enter a valid email.', errWa: 'Enter your WhatsApp number.', close: 'Close', sending: 'One moment…',
      retry: 'Could not send right now — please retry.' },
    es: { eyebrow: 'Introduce tu email para disfrutar', big1: '-10 %', big2: 'en tu primer pedido',
      email: 'Tu correo electrónico', wa: 'Tu WhatsApp (+…)', btn: 'Disfrutar del -10 %',
      fine: 'Te enviamos tu código de bienvenida. Puedes darte de baja cuando quieras.',
      okTitle: 'Bienvenida al vestuario de Marrakech', okBody: 'Tu código: ',
      okAfter: ' — menciónalo en WhatsApp y aplicamos -10 % a tu primer pedido.',
      errEmail: 'Introduce un email válido.', errWa: 'Introduce tu número de WhatsApp.', close: 'Cerrar', sending: 'Un momento…',
      retry: 'No se pudo enviar ahora — inténtalo de nuevo.' },
    tr: { eyebrow: 'Yararlanmak için e-postanızı girin', big1: '%10 indirim', big2: 'ilk siparişinizde',
      email: 'E-posta adresiniz', wa: 'WhatsApp numaranız (+…)', btn: '%10 indirimi al',
      fine: 'Hoş geldin kodunuzu e-postayla gönderiyoruz. İstediğiniz zaman çıkabilirsiniz.',
      okTitle: 'Marakeş’in gardırobuna hoş geldiniz', okBody: 'Kodunuz: ',
      okAfter: ' — WhatsApp’ta belirtin, ilk siparişinize %10 uygulayalım.',
      errEmail: 'Geçerli bir e-posta girin.', errWa: 'WhatsApp numaranızı girin.', close: 'Kapat', sending: 'Bir saniye…',
      retry: 'Şu an gönderilemedi — tekrar deneyin.' },
    ar: { eyebrow: 'أدخلي بريدك الإلكتروني للاستفادة', big1: '10٪-', big2: 'على طلبك الأول',
      email: 'بريدك الإلكتروني', wa: 'رقم WhatsApp (+…)', btn: 'استفيدي من 10٪-',
      fine: 'سنرسل لك رمز الترحيب عبر البريد. يمكنك إلغاء الاشتراك في أي وقت.',
      okTitle: 'مرحبًا بك في خزانة مراكش', okBody: 'رمزك: ',
      okAfter: ' — اذكريه على WhatsApp ونطبّق خصم 10٪ على طلبك الأول.',
      errEmail: 'أدخلي بريدًا صحيحًا.', errWa: 'أدخلي رقم WhatsApp.', close: 'إغلاق', sending: 'لحظة…',
      retry: 'تعذّر الإرسال الآن — أعيدي المحاولة.' }
  };
  var c = COPY[lang] || COPY.fr;
  var rtl = lang === 'ar';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (m) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m]; }); };

  var css = ''
    + '.yzapop-ov{position:fixed;inset:0;z-index:9990;display:flex;align-items:center;justify-content:center;padding:20px;'
    + 'background:rgba(24,22,20,.55);opacity:0;visibility:hidden;transition:opacity .35s ease,visibility .35s;}'
    + '.yzapop-ov.is-open{opacity:1;visibility:visible;}'
    + '.yzapop{position:relative;display:flex;width:100%;max-width:860px;max-height:92vh;overflow:hidden;background:#fffdf8;'
    + 'box-shadow:0 24px 70px rgba(20,18,16,.32);transform:translateY(14px) scale(.99);transition:transform .4s cubic-bezier(.2,.7,.2,1);}'
    + '.yzapop-ov.is-open .yzapop{transform:none;}'
    + '.yzapop__img{flex:0 0 44%;background:#efece6 center/cover no-repeat;min-height:520px;}'
    + '.yzapop__body{flex:1 1 auto;display:flex;flex-direction:column;justify-content:center;padding:clamp(28px,4vw,52px);overflow-y:auto;}'
    + '.yzapop__ey{font-family:var(--font-body,"Jost",sans-serif);text-transform:uppercase;letter-spacing:.22em;font-size:11px;'
    + 'color:#8a8378;margin:0 0 14px;}'
    + '.yzapop__h{font-family:var(--font-serif,"Fraunces",serif);font-weight:400;line-height:.92;color:#1f1f1f;margin:0 0 22px;'
    + 'text-transform:uppercase;}'
    + '.yzapop__h b{display:block;font-weight:500;font-size:clamp(3rem,7vw,4.4rem);}'
    + '.yzapop__h span{display:block;font-size:clamp(1.2rem,2.4vw,1.7rem);letter-spacing:.01em;margin-top:.15em;}'
    + '.yzapop__f{display:flex;flex-direction:column;gap:12px;margin:6px 0 0;}'
    + '.yzapop__f input{font-family:var(--font-body,"Jost",sans-serif);font-size:16px;color:#1f1f1f;background:transparent;'
    + 'border:1px solid rgba(31,31,31,.35);padding:14px 16px;width:100%;border-radius:0;outline:none;transition:border-color .2s;-webkit-appearance:none;}'
    + '.yzapop__f input:focus{border-color:#1f1f1f;}'
    + '.yzapop__f input.is-bad{border-color:#c0392b;}'
    + '.yzapop__btn{font-family:var(--font-body,"Jost",sans-serif);text-transform:uppercase;letter-spacing:.18em;font-size:12px;'
    + 'background:#1f1f1f;color:#fff;border:0;padding:16px;cursor:pointer;transition:background .2s;margin-top:4px;}'
    + '.yzapop__btn:hover{background:#de733d;}'
    + '.yzapop__btn[disabled]{opacity:.6;cursor:default;}'
    + '.yzapop__fine{font-family:var(--font-body,"Jost",sans-serif);font-size:11.5px;line-height:1.5;color:#8a8378;margin:14px 0 0;}'
    + '.yzapop__msg{font-family:var(--font-body,"Jost",sans-serif);font-size:12.5px;color:#c0392b;margin:10px 0 0;min-height:1em;}'
    + '.yzapop__x{position:absolute;top:12px;' + (rtl ? 'left' : 'right') + ':14px;width:34px;height:34px;border:0;background:transparent;'
    + 'font-size:26px;line-height:1;color:#1f1f1f;cursor:pointer;opacity:.7;transition:opacity .2s;z-index:2;}'
    + '.yzapop__x:hover{opacity:1;}'
    + '.yzapop__ok{font-family:var(--font-body,"Jost",sans-serif);}'
    + '.yzapop__ok h3{font-family:var(--font-serif,"Fraunces",serif);font-weight:400;font-size:clamp(1.5rem,3vw,2rem);color:#1f1f1f;margin:0 0 14px;line-height:1.05;}'
    + '.yzapop__ok p{font-size:14px;line-height:1.6;color:#4a463f;margin:0;}'
    + '.yzapop__code{display:inline-block;font-family:var(--font-body,"Jost",sans-serif);letter-spacing:.14em;font-weight:600;'
    + 'color:#de733d;border:1px dashed #de733d;padding:4px 12px;margin:2px 2px;}'
    + '@media(max-width:640px){'
    + '.yzapop-ov{padding:12px;align-items:center;}'
    + '.yzapop{flex-direction:column;width:100%;max-width:420px;max-height:94vh;}'
    + '.yzapop__img{flex-basis:auto;min-height:118px;height:19vh;}'
    + '.yzapop__body{padding:24px 20px 26px;justify-content:flex-start;overflow-y:auto;}'
    + '.yzapop__ey{font-size:10.5px;letter-spacing:.2em;margin-bottom:10px;}'
    + '.yzapop__h{margin-bottom:16px;}'
    + '.yzapop__h b{font-size:clamp(2.4rem,12vw,3.1rem);}'
    + '.yzapop__h span{font-size:clamp(1.05rem,4.6vw,1.3rem);}'
    + '.yzapop__f{gap:10px;}'
    + '.yzapop__f input{padding:13px 14px;}'
    + '.yzapop__btn{padding:15px;}'
    + '.yzapop__fine{font-size:11px;margin-top:12px;}'
    + '.yzapop__x{width:42px;height:42px;top:4px;font-size:30px;' + (rtl ? 'left' : 'right') + ':4px;}'
    + '}';

  var img = '<div class="yzapop__img" style="background-image:url(' + IMG + ')" role="img" aria-label="YZA"></div>';
  var form = ''
    + '<p class="yzapop__ey">' + esc(c.eyebrow) + '</p>'
    + '<h2 class="yzapop__h"><b>' + esc(c.big1) + '</b><span>' + esc(c.big2) + '</span></h2>'
    + '<form class="yzapop__f" novalidate>'
    + '<input type="email" name="email" autocomplete="email" placeholder="' + esc(c.email) + '" aria-label="' + esc(c.email) + '">'
    + '<input type="tel" name="phone" autocomplete="tel" placeholder="' + esc(c.wa) + '" aria-label="' + esc(c.wa) + '">'
    + '<input type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;">'
    + '<button type="submit" class="yzapop__btn">' + esc(c.btn) + '</button>'
    + '<p class="yzapop__msg" data-msg></p>'
    + '<p class="yzapop__fine">' + esc(c.fine) + '</p>'
    + '</form>';

  var ov = document.createElement('div');
  ov.className = 'yzapop-ov';
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  ov.setAttribute('aria-label', c.big1 + ' ' + c.big2);
  if (rtl) ov.setAttribute('dir', 'rtl');
  ov.innerHTML = '<div class="yzapop"><button type="button" class="yzapop__x" aria-label="' + esc(c.close) + '">&times;</button>'
    + img + '<div class="yzapop__body">' + form + '</div></div>';

  var style = document.createElement('style');
  style.textContent = css;

  var opened = false, done = false;
  function remember() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} }
  function open() {
    if (opened || done) return;
    opened = true;
    remember(); // mark shown as soon as it opens, so it never double-pops on in-session navigation
    document.head.appendChild(style);
    document.body.appendChild(ov);
    void ov.offsetWidth; // force an initial frame so the enter transition animates (rAF is throttled in bg tabs)
    ov.classList.add('is-open');
    setTimeout(function () { var i = ov.querySelector('input[name=email]'); if (i) try { i.focus({ preventScroll: true }); } catch (e) { i.focus(); } }, 320);
    if (window.YZA && YZA.analytics) YZA.analytics.track('promo10_open', { source: 'home_popup' });
  }
  function close() {
    ov.classList.remove('is-open');
    remember();
    setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 380);
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  ov.addEventListener('click', function (e) {
    if (e.target === ov) close();
    if (e.target.closest('.yzapop__x')) close();
  });
  document.addEventListener('keydown', onKey);

  ov.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    var emailEl = f.querySelector('input[name=email]');
    var phoneEl = f.querySelector('input[name=phone]');
    var hpEl = f.querySelector('input[name=company]');
    var msg = f.querySelector('[data-msg]');
    var email = (emailEl.value || '').trim();
    var phone = (phoneEl.value || '').trim();
    var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    var okPhone = phone.replace(/[^0-9]/g, '').length >= 6;
    emailEl.classList.toggle('is-bad', !okEmail);
    phoneEl.classList.toggle('is-bad', okEmail && !okPhone);
    if (!okEmail) { msg.textContent = c.errEmail; emailEl.focus(); return; }
    if (!okPhone) { msg.textContent = c.errWa; phoneEl.focus(); return; }
    msg.style.color = '#8a8378'; msg.textContent = c.sending;
    var btn = f.querySelector('.yzapop__btn'); if (btn) btn.disabled = true;
    fetch('/subscribe.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, phone: phone, lang: lang, page: 'home_popup', source: 'popup10', _hp: hpEl ? hpEl.value : '' })
    }).then(function (r) { return r.ok; }).catch(function () { return false; }).then(function (sent) {
      if (btn) btn.disabled = false;
      if (!sent) { msg.style.color = '#c0392b'; msg.textContent = c.retry; return; }
      done = true; remember();
      if (window.YZA && YZA.analytics) YZA.analytics.track('promo10_submit', { source: 'home_popup' });
      var body = ov.querySelector('.yzapop__body');
      body.innerHTML = '<div class="yzapop__ok"><h3>' + esc(c.okTitle) + '</h3>'
        + '<p>' + esc(c.okBody) + '<span class="yzapop__code">' + esc(CODE) + '</span>' + esc(c.okAfter) + '</p></div>';
    });
  });

  // Trigger: whichever comes first — a short dwell so it reliably greets every visit,
  // plus 45% scroll and desktop exit-intent as accelerators.
  var t = setTimeout(open, 3200);
  function onScroll() {
    var sc = window.scrollY || document.documentElement.scrollTop || 0;
    var h = (document.documentElement.scrollHeight - window.innerHeight) || 1;
    if (sc / h > 0.45) { clearTimeout(t); window.removeEventListener('scroll', onScroll); open(); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  function onExit(e) { if (e.clientY <= 0) { clearTimeout(t); document.removeEventListener('mouseout', onExit); open(); } }
  if (window.matchMedia && window.matchMedia('(pointer:fine)').matches) document.addEventListener('mouseout', onExit);
})();
