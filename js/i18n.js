/* ============================================================
   YZA — i18n (FR/EN)
   Détection auto via la langue du navigateur, bascule manuelle
   persistée en localStorage, application via [data-i18n].
   ============================================================ */
window.YZA = window.YZA || {};

const STR = {
  /* — Annonce / header / nav — */
  "announce":        { fr: "Garantie 30 jours · Réparations à vie à l’atelier", en: "30-day guarantee · Lifetime atelier repairs" },
  'announce.editions': { fr: 'Éditions limitées · jamais refaites', en: 'Limited editions · never remade', es: 'Ediciones limitadas · nunca reproducidas', tr: 'Sınırlı sayı · asla yeniden üretilmez', ar: 'إصدارات محدودة · لا تُصنع من جديد' },
  'announce.unique': { fr: 'Nos éditions limitées le sont vraiment, quand elles sont épuisées elles ne reviennent jamais.', en: 'Our limited editions really are limited — once they’re sold out, they never come back.', es: 'Cuando una edición se agota, no vuelve jamás y no la volvemos a hacer. Tu pieza es única, solo tuya.', tr: 'Bir edisyon bittiğinde bir daha gelmez ve onu asla yeniden üretmeyiz. Parçan tek ve sana özeldir.', ar: 'حين تنتهي إصدارة لا تعود أبداً ولا نُعيد صنعها. قطعتكِ تبقى فريدة، لكِ وحدكِ.' },
  'hero.editions':     { fr: 'Éditions limitées — une fois parties, elles ne reviennent pas', en: 'Limited editions — once they’re gone, they’re gone', es: 'Ediciones limitadas — una vez agotadas, no vuelven', tr: 'Sınırlı sayı — tükendiğinde geri dönmez', ar: 'إصدارات محدودة — حين تنفد، لا تعود' },
  'meta.shipping':   { fr: 'Livraison Maroc offerte dès 500 DH', en: 'Free Morocco delivery from 500 DH' },
  'meta.sale':       { fr: 'Fruit Market — nos fruits en raphia', en: 'Fruit Market — our raffia fruits' },
  'nav.charms':      { fr: 'Charms', en: 'Charms' },
  'nav.rtw':         { fr: 'Prêt-à-porter', en: 'Ready-to-wear' },
  'nav.bags':        { fr: 'Paniers & Sacs', en: 'Baskets & Bags' },
  'nav.accessories': { fr: 'Bijoux', en: 'Jewellery' },
  'nav.girls':       { fr: 'YZA Girls', en: 'YZA Girls' },
  'nav.bespoke':     { fr: 'Sur-mesure', en: 'Bespoke' },
  'nav.story':       { fr: 'Notre histoire', en: 'Our story' },
  'nav.b2b':         { fr: 'Stockists', en: 'Stockists' },
  'nav.lookbook':    { fr: 'Lookbook SS26/27', en: 'Lookbook SS26/27' },
  'nav.journal':     { fr: 'Journal', en: 'Journal' },
  'nav.archive':     { fr: 'Archives', en: 'Archive' },
  'nav.faq':         { fr: 'FAQ', en: 'FAQ' },
  'nav.contact':     { fr: 'Contact', en: 'Contact' },
  'nav.more':        { fr: 'Plus', en: 'More' },
  'nav.studio':      { fr: 'Le Studio', en: 'The Studio' },
  'nav.fruitmarket': { fr: 'YZA Fruit Market', en: 'YZA Fruit Market' },
  'nav.sculpture':   { fr: 'La Sculpture', en: 'La Sculpture' },
  'mega.cat':        { fr: 'Par catégorie', en: 'By category' },
  'mega.explore':    { fr: 'À explorer', en: 'Explore' },
  'mega.brand':      { fr: 'La marque', en: 'The brand' },
  'mega.editorial':  { fr: 'Éditorial', en: 'Editorial' },
  'mega.service':    { fr: 'Service client', en: 'Customer care' },
  'mega.feat.lookbook':  { fr: 'Collection SS26/27', en: 'SS26/27 collection', es: 'Colección SS26/27', tr: 'SS26/27 koleksiyonu', ar: 'مجموعة SS26/27' },
  'mega.feat.sculpture': { fr: 'Le it-bag de l’atelier', en: 'The atelier it-bag', es: 'El it-bag del atelier', tr: 'Atölyenin it-bag’i', ar: 'حقيبة الأتيليه الأيقونية' },
  'mega.feat.studio':    { fr: '66 Rue Yougoslavie, Guéliz', en: '66 Rue Yougoslavie, Guéliz', es: '66 Rue Yougoslavie, Guéliz', tr: '66 Rue Yougoslavie, Guéliz', ar: '٦٦ شارع يوغوسلافيا، Guéliz' },
  'mega.feat.contact':   { fr: 'On vous répond, vraiment', en: 'We actually reply', es: 'Te respondemos, de verdad', tr: 'Gerçekten yanıt veriyoruz', ar: 'نردّ عليكِ، فعلاً' },
  'a.search':        { fr: 'Rechercher', en: 'Search' },
  'a.wishlist':      { fr: 'Mes coups de cœur', en: 'Saved' },
  'a.cart':          { fr: 'Panier', en: 'Cart' },
  'a.menu':          { fr: 'Ouvrir le menu', en: 'Open menu' },
  'a.close':         { fr: 'Fermer', en: 'Close' },

  /* — CTA communs — */
  'cta.discover':    { fr: 'Découvrir', en: 'Discover' },
  'cta.shop':        { fr: 'Parcourir la collection', en: 'Browse the collection' },
  'cta.shopCharms':  { fr: 'Voir nos fruits en raphia', en: 'See our raffia fruits' },
  'cta.shopSculpture': { fr: 'Découvrir La Sculpture', en: 'Discover La Sculpture' },
  'cta.discoverAtelier': { fr: 'Pousser la porte de l’atelier', en: 'Step inside the atelier' },
  'card.quickview': { fr: 'Aperçu', en: 'Quick view', es: 'Vista rápida', tr: 'Hızlı bakış', ar: 'عرض سريع' },
  'carousel.prev': { fr: 'Précédent', en: 'Previous' },
  'carousel.next': { fr: 'Suivant', en: 'Next' },
  'charm.style.eyebrow': { fr: 'YZA Fruit Market', en: 'YZA Fruit Market' },
  'charm.style.title': { fr: 'Où accrocher vos fruits', en: 'Where to clip your fruits' },
  'charm.style.text': { fr: 'Un charm en raphia se clipse partout : sur un sac type panier, un sac en cuir ou un mini sac chic — mais aussi à ses clés de maison ou de voiture, à son porte-clés, ou à son porte-monnaie dès qu’il y a une accroche. Un clip, une couleur qui chante, et plus rien n’est tout à fait comme celui de la voisine.', en: 'A raffia charm clips on anywhere: a basket bag, a leather bag or a chic mini bag — but also your house or car keys, your keyring, even your coin purse wherever there’s a clasp. One clip, one colour that sings, and nothing looks quite like everyone else’s.' },
  'charm.style.cap1': { fr: 'Dans le panier, prêts à clipser', en: 'In the basket, ready to clip' },
  'charm.style.cap2': { fr: 'Crochetés un à un à Guéliz', en: 'Crocheted one by one in Guéliz' },
  'charm.style.cap3': { fr: 'Un petit étal à emporter', en: 'A little stall to take along' },
  'charm.style.videoCap': { fr: 'L’orange, qui se balance', en: 'The orange, swinging' },
  'charm.style.tag': { fr: 'Faits main en matières naturelles', en: 'Handmade in natural materials' },
  'print.eyebrow': { fr: 'L’art du raphia', en: 'The art of raffia' },
  'print.title': { fr: 'Le Marché aux Fruits', en: 'The Fruit Market' },
  'print.body': { fr: 'Pas d’imprimé, pas de machine : chaque fruit est crocheté à la main, un fil de raphia à la fois. Notre façon d’emporter le marché de Marrakech au creux de la main.', en: 'No print, no machine: every fruit is crocheted by hand, one strand of raffia at a time. Our way of carrying the Marrakech market in the palm of your hand.', es: 'Sin estampado, sin máquina: cada fruta se teje a mano, un hilo de rafia a la vez. Nuestra forma de llevar el mercado de Marrakech en la palma.', tr: 'Baskı yok, makine yok: her meyve elle, tek tek rafya ipliğiyle örülür. Marakeş pazarını avucunuza taşıma şeklimiz.', ar: 'لا طباعة ولا آلة: كل ثمرة تُحاك يدويًا، خيط رافيا تلو الآخر. طريقتنا في حمل سوق مراكش في راحة يدك.' },
  'print.caption': { fr: 'Cerise, pastèque, citron — crochetés à la main.', en: 'Cherry, watermelon, lemon — crocheted by hand.' },
  'fm.bundleKicker':  { fr: 'Trio Marché', en: 'Market Trio', es: 'Trío Mercado', tr: 'Pazar Üçlüsü', ar: 'ثلاثي السوق' },
  'fm.bundleKicker2': { fr: 'Trio Verger', en: 'Orchard Trio', es: 'Trío Huerto', tr: 'Meyve Bahçesi Üçlüsü', ar: 'ثلاثي البستان' },
  'fm.bundleKicker3': { fr: 'Trio Soleil', en: 'Sun Trio', es: 'Trío Sol', tr: 'Güneş Üçlüsü', ar: 'ثلاثي الشمس' },
  'fm.stylingYza':    { fr: 'Sur nos sacs YZA', en: 'On our YZA bags', es: 'Sobre nuestros bolsos YZA', tr: 'YZA çantalarımız üzerinde', ar: 'على حقائب YZA' },
  'fm.stylingAny':    { fr: 'Sur n’importe quel sac', en: 'On any bag', es: 'Sobre cualquier bolso', tr: 'Her çanta üzerinde', ar: 'على أي حقيبة' },
  'fm.stylingBasket': { fr: 'Sur les paniers', en: 'On baskets', es: 'Sobre los paniers', tr: 'Sepetlerin üzerinde', ar: 'على السلال' },
  'fm.stylingCta':    { fr: 'Voir comment les porter', en: 'See how to wear them', es: 'Ver cómo llevarlos', tr: 'Nasıl takılır gör', ar: 'انظر كيف ترتديها' },
  'cta.discover': { fr: 'Découvrir', en: 'Explore' },
  'world.charms.eye': { fr: 'Charms', en: 'Charms' },
  'world.charms.title': { fr: 'Fruits crochetés en raphia', en: 'Crocheted raffia fruits' },
  'world.bags.eye': { fr: 'Paniers', en: 'Baskets' },
  'world.bags.title': { fr: 'La Sculpture', en: 'La Sculpture' },
  'world.rtw.eye': { fr: 'Prêt-à-porter', en: 'Ready-to-wear' },
  'world.rtw.title': { fr: 'Jawhara', en: 'Jawhara' },
  'marquee.marrakech': { fr: 'C’est mieux à Marrakech', en: 'It’s better in Marrakech' },
  'band.craft.eye': { fr: 'Le savoir-faire', en: 'The craft' },
  'band.craft.title': { fr: 'Les détails qui\nfont la différence.', en: 'The details that\nmake the difference.' },
  'band.craft.text': { fr: 'De 2 à 70 h de travail manuel : toutes nos pièces sont réalisées par les artisanes de l’atelier YZA.', en: 'From 2 to 70 hours of handwork: every piece is made by the women artisans of the YZA atelier.' },
  'band.closing.eye': { fr: 'Fruit Market', en: 'Fruit Market' },
  'band.closing.title': { fr: 'L’été se porte en raphia', en: 'Summer, worn in raffia' },
  'band.closing.sub': { fr: 'Charms à croquer, paniers tressés main et prêt-à-porter solaire — éditions limitées, jamais refaites.', en: 'Bite-size charms, hand-woven baskets and sun-ready pieces — limited editions, never remade.', es: 'Charms para comérselos, cestas tejidas a mano y prêt-à-porter solar — ediciones limitadas, nunca reproducidas.', tr: 'Yenilesi charm’lar, el örgüsü sepetler ve güneşe hazır parçalar — sınırlı sayıda, asla yeniden üretilmez.', ar: 'تمائم شهية، سلال محبوكة يدوياً وقطع صيفية — إصدارات محدودة لا تُعاد.' },
  'band.closing.cta': { fr: 'Découvrir la collection →', en: 'Shop the collection →', es: 'Ver la colección →', tr: 'Koleksiyonu keşfet →', ar: 'اكتشفي المجموعة →' },
  'cta.discoverCollections': { fr: 'Découvrir les collections YZA', en: 'Discover the YZA collections', es: 'Descubrir las colecciones YZA', tr: 'YZA koleksiyonlarını keşfet', ar: 'اكتشفي مجموعات YZA' },
  'cta.add':         { fr: 'Ajouter au panier', en: 'Add to cart' },
  'cta.added':       { fr: 'Ajouté ✓', en: 'Added ✓' },
  'cta.viewAll':     { fr: 'Tout voir', en: 'View all' },
  'cta.more':        { fr: 'Voir plus', en: 'View more' },
  'cta.learn':       { fr: 'Comprendre comment', en: 'See how it’s made' },
  'cta.read':        { fr: 'Lire', en: 'Read' },

  /* — Hero accueil — */
  'hero.eyebrow':    { fr: 'YZA', en: 'YZA' },
  'hero.title':      { fr: 'La Sculpture', en: 'La Sculpture' },
  'hero.subheading': { fr: 'Réalisé à la main à Guéliz. Jamais deux fois pareil.', en: 'Handmade in Guéliz. Never the same twice.' },
  'hero.text':       { fr: 'Raphia, doum, feuilles de bananiers, perles… nos artisanes les travaillent à la main dans notre studio à Guéliz, Marrakech. Une pièce à la fois, et jamais deux fois la même.', en: 'Raffia, doum palm, banana leaves, beads… our women artisans work them by hand in our studio in Guéliz, Marrakech. One piece at a time, and never the same one twice.' },

  /* — Bande d'autorité (presse / pedigree fondatrice) — */
  'press.label':     { fr: 'Après 15 ans à Paris dans la mode, Nawal fonde la marque YZA à Marrakech.', en: 'After 15 years in Paris fashion, Nawal founded YZA in Marrakech.' },
  'press.note':      { fr: 'YZA, maison amazighe d’aujourd’hui, née d’un retour à Marrakech après quinze ans passés dans la mode à Paris.', en: 'YZA, a contemporary Amazigh house, born of a return to Marrakech after fifteen years in Paris fashion.' },

  /* — Preuve sociale (témoignages) — */
  'social.eyebrow':  { fr: 'Elles portent YZA', en: 'They wear YZA' },
  'social.title':    { fr: 'De Marrakech à Tokyo', en: 'From Marrakech to Tokyo' },
  'social.rating':   { fr: 'Ce que les YZA girls disent', en: 'What the YZA girls say' },
  'social.ratingOf': { fr: 'Note', en: 'Rating' },
  'home.faq.eyebrow': { fr: 'Bon à savoir', en: 'Good to know', es: 'Bueno saber', tr: 'Bilmekte fayda var', ar: 'معلومات مفيدة' },
  'home.faq.title':   { fr: 'Questions fréquentes', en: 'Frequent questions', es: 'Preguntas frecuentes', tr: 'Sık sorulan sorular', ar: 'الأسئلة الشائعة' },
  'home.faq.all':     { fr: 'Toutes les questions →', en: 'All questions →', es: 'Todas las preguntas →', tr: 'Tüm sorular →', ar: 'كل الأسئلة →' },
  'girls.shopLook':  { fr: 'Voir le look', en: 'Shop the look' },
  'girls.soldOut':   { fr: 'Cette édition est partie · on ne la refait pas', en: 'This edition is gone · we don’t remake it', es: 'Agotado · nunca se reproduce', tr: 'Tükendi · asla yeniden üretilmez', ar: 'نفد · لا يُصنع من جديد' },
  'girls.shopCurrent': { fr: 'Voir ce qu’on a en ce moment', en: 'See what we have now', es: 'Ver piezas actuales', tr: 'Güncel parçalar', ar: 'تسوّق القطع الحالية' },
  'girls.scarcity.title': { fr: 'Une édition, puis on passe à autre chose', en: 'One edition, then we move on', es: 'Series agotadas, nunca reproducidas', tr: 'Tükenen seriler, asla yeniden üretilmez', ar: 'دفعات نفدت، لا تُصنع من جديد' },
  'girls.scarcity.text': { fr: 'Beaucoup des pièces portées ici viennent d’éditions déjà épuisées — jamais refaites. Si une pièce actuelle vous plaît, prenez-la avant la rupture : vous ne retrouverez pas la même.', en: 'Many of the pieces worn here are from editions already sold out — never remade. If a current piece speaks to you, take it before it’s gone: you won’t find the same one again.', es: 'Muchas de las piezas que se llevan aquí son de series ya agotadas, que nunca se reproducirán. Si te gusta una pieza actual, consíguela antes de que se agote: no encontrarás la misma otra vez.', tr: 'Burada giyilen parçaların çoğu çoktan tükenmiş serilerden — bir daha asla üretilmeyecek. Güncel bir parçayı beğendiyseniz, stok bitmeden alın: aynısını bir daha bulamazsınız.', ar: 'كثير من القطع المعروضة هنا من دفعات نفدت بالفعل ولن تُصنع من جديد. إذا أعجبتك قطعة حالية، فاحصل عليها قبل نفاد المخزون: لن تجد مثيلها مرة أخرى.' },

  /* — L'offre (bundles) — */
  'offer.eyebrow':   { fr: 'Par où commencer', en: 'Where to begin' },
  'offer.title':     { fr: 'YZA en quatre pièces', en: 'YZA in four pieces', es: 'YZA en cuatro piezas', tr: 'Dört parçada YZA', ar: 'YZA في أربع قطع' },
  'offer.text':      { fr: 'Un panier, un haut, une jupe et un bijou — faites votre garde-robe d’été.', en: 'A basket, a top, a skirt and a piece of jewellery — build your summer wardrobe.', es: 'Una cesta, un top, una falda y una joya — compón tu vestuario de verano.', tr: 'Bir sepet, bir üst, bir etek ve bir takı — yaz gardırobunuzu kurun.', ar: 'سلة، توب، تنورة وقطعة مجوهرات — اصنعي خزانتك الصيفية.' },
  'offer.save':      { fr: 'Économisez', en: 'Save' },
  'offer.bundleNote':{ fr: 'Dans sa boîte, prête à offrir', en: 'Boxed, ready to gift' },

  /* — Fiche produit : mise en valeur de l'offre — */
  'pp.limited':      { fr: 'Édition limitée · faite main', en: 'Limited edition · made by hand' },
  'pp.was':          { fr: 'au lieu de', en: 'instead of' },
  'pp.crosssell':    { fr: 'À porter avec', en: 'Lovely with' },
  'pp.reviews':      { fr: 'avis', en: 'reviews' },
  'pp.bundle.title': { fr: 'Le trio, ensemble', en: 'The trio, together' },
  'pp.bundle.includes': { fr: 'Vous recevez', en: 'You get' },
  'pp.bundle.total': { fr: 'Total du trio', en: 'Trio total' },
  'pp.bundle.add':   { fr: 'Ajouter le trio', en: 'Add the trio' },
  'pp.bundle.added': { fr: 'Trio ajouté ✓', en: 'Trio added ✓' },

  /* — Conversion / boutique locale — */
  'conv.maps.label': { fr: 'Passez nous voir à Guéliz, Marrakech', en: 'Come see us in Guéliz, Marrakech' },
  'conv.maps.bubble': { fr: 'Boutique navigation - Marrakech', en: 'Boutique navigation - Marrakech' },
  'conv.chat.label': { fr: 'Question', en: 'Question' },
  'conv.chat.title': { fr: 'YZA Atelier', en: 'YZA Atelier' },
  'conv.chat.online': { fr: 'En ligne', en: 'Online', es: 'En línea', tr: 'Çevrimiçi', ar: 'متاحون' },
  'conv.chat.greeting': { fr: 'Bonjour, c’est l’atelier. Une question sur une pièce, une taille, une couleur ? Écrivez-nous — on répond dans la journée, une vraie personne au bout.', en: 'Hello — it’s the atelier. A question about a piece, a size, a colour? Write to us — we reply the same day, a real person at the other end.', es: '¡Hola! ¿Pregunta sobre una pieza, talla o color? Escríbanos.', tr: 'Merhaba! Bir parça, beden veya renk hakkında sorunuz mu var? Yazın.', ar: 'مرحباً! لديك سؤال عن قطعة أو مقاس أو لون؟ اكتبي لنا.' },
  'conv.chat.reply': { fr: 'Merci ! Laissez-nous votre prénom et votre WhatsApp — on revient vers vous, et le code YZA10 est pour vous.', en: 'Thank you! Leave your name and WhatsApp — we’ll come back to you, and the YZA10 code is yours.', es: '¡Gracias! Déjanos tu nombre y tu WhatsApp — te respondemos, y el código YZA10 es para ti.', tr: 'Teşekkürler! Adınızı ve WhatsApp numaranızı bırakın — size yanıt veririz, YZA10 kodu sizindir.', ar: 'شكراً! اتركي لنا اسمك ورقم واتساب — نردّ عليكِ، وكود YZA10 لكِ.' },
  'conv.chat.questionPh': { fr: 'Taille, couleur, disponibilité, cadeau...', en: 'Size, colour, availability, gift...' },
  'conv.chat.namePh': { fr: 'Votre prénom', en: 'Your name', es: 'Tu nombre', tr: 'Adınız', ar: 'اسمك' },
  'conv.chat.phonePh': { fr: 'WhatsApp (+212...)', en: 'WhatsApp (+212...)', es: 'WhatsApp (+34...)', tr: 'WhatsApp (+90...)', ar: 'واتساب (+212...)' },
  'conv.chat.sendBtn': { fr: 'Envoyer', en: 'Send', es: 'Enviar', tr: 'Gönder', ar: 'إرسال' },
  'conv.chat.send': { fr: 'Ouvrir WhatsApp avec le code YZA10', en: 'Open WhatsApp with code YZA10' },
  'promo.exit.kicker': { fr: 'Avant de filer', en: 'Before you slip off' },
  'promo.exit.title': { fr: 'Un petit -20 %, de notre part', en: 'A little 20% off, from us' },
  'promo.exit.text': { fr: 'Si une pièce vous est restée en tête, écrivez-nous sur WhatsApp avec le code YZA20 — on vous met le panier de côté, le temps qu’il faut. Dès 150 EUR / environ 1 500 DH. Sans pression, vraiment.', en: 'If a piece stayed on your mind, message us on WhatsApp with code YZA20 — we’ll set your cart aside, for as long as you need. From 150 EUR / approx. 1,500 DH. No pressure, truly.' },
  'promo.exit.cta': { fr: 'Écrire sur WhatsApp', en: 'Message us on WhatsApp' },
  'promo.exit.close': { fr: 'Une autre fois, peut-être', en: 'Maybe another time' },

  /* — Catégories accueil — */
  'home.cats.eyebrow': { fr: 'L’univers YZA', en: 'The YZA world' },
  'home.cats.title':   { fr: 'Quatre façons de glisser Marrakech dans votre sac', en: 'Four ways to slip Marrakech into your bag' },
  'cat.charms':        { fr: 'Charms en raphia', en: 'Raffia charms' },
  'cat.charms.txt':    { fr: 'Un peu de Marrakech accroché au sac — un sac nu, c’est un peu triste.', en: 'A little Marrakech clipped to your bag — a bare bag is a bit of a sad one.' },
  'cat.rtw':           { fr: 'Prêt-à-porter', en: 'Ready-to-wear' },
  'cat.rtw.txt':       { fr: 'Tops, jupes paréo et pantalons qui se répondent.', en: 'Tops, sarong skirts and trousers that talk to each other.' },
  'cat.bags':          { fr: 'Paniers & sacs', en: 'Baskets & bags' },
  'cat.bags.txt':      { fr: 'Réalisés à la main. Le même atelier, les mêmes femmes, d’année en année. Pour des années, pas une saison.', en: 'Made by hand. Same atelier, same women, year after year. For years, not a season.' },
  'cat.accessories':   { fr: 'Bijoux', en: 'Jewellery' },
  'cat.accessories.txt': { fr: 'Des souvenirs de Marrakech qui ne prennent pas la poussière sur une étagère.', en: 'Marrakech souvenirs that won’t sit gathering dust on a shelf.' },
  'cat.bespoke':       { fr: 'Sur-mesure', en: 'Bespoke' },
  'cat.bespoke.txt':   { fr: 'La Vague, sculptée à la main et nouée rien que pour vous.', en: 'La Vague, hand-sculpted and knotted just for you.' },

  /* — Best-sellers — */
  'home.best.eyebrow': { fr: 'Les plus aimés', en: 'Most loved' },
  'home.best.title':   { fr: 'Ceux qui partent en premier', en: 'The first to go' },

  /* — Bloc histoire (accueil) — */
  'home.story.eyebrow': { fr: 'L’atelier', en: 'The atelier' },
  'home.story.title':   { fr: 'Plus de mains,\nmoins de machines.', en: 'More hands,\nfewer machines.' },
  'home.story.text':    { fr: 'Chaque pièce est faite main par les artisanes de l’atelier YZA, ici à Marrakech — de 2 à 70 h de travail selon la pièce, puis une étiquette dorée, gravée à la main, pour finir.', en: 'Each piece is made by hand by the women artisans of the YZA atelier, here in Marrakech — from 2 to 70 hours of work depending on the piece, then a golden tag, hand-engraved, to finish.' },

  /* — Réassurance — */
  'trust.title':       { fr: 'Quelques infos', en: 'Good to know' },
  'trust.handmade.t':  { fr: 'Entreprise 100 % féminine', en: '100% women-led' },
  'trust.handmade.x':  { fr: 'Chaque fruit passe entre des mains qui savent — jamais par une chaîne.', en: 'Every fruit passes through hands that know the work — never a production line.' },
  'trust.women.t':     { fr: 'Explore le fait main marocain', en: 'Explore Moroccan handcraft' },
  'trust.women.x':     { fr: 'Une main met plus longtemps qu’une machine. C’est précisément ce qu’on cherche — et ça se sent au toucher.', en: 'A hand takes longer than a machine. That’s exactly the point — and you can feel it under your fingers.' },
  'trust.unique.t':    { fr: 'Faits pour être portés & partagés', en: 'Made to be worn & shared' },
  'trust.unique.x':    { fr: 'Éditions limitées, raphia travaillé sans hâte, pièces pensées pour rester.', en: 'Limited editions, raffia worked without rushing, pieces made to stay.' },
  'trust.secure.t':    { fr: 'Pensés pour vivre et voyager', en: 'Made to live & travel' },
  'trust.secure.x':    { fr: 'Des fruits, des paniers, des cadeaux qui font le voyage de Marrakech à Paris.', en: 'Fruit, baskets and gifts that make the trip from Marrakech to Paris.' },

  /* — Journal (accueil) — */
  'home.journal.eyebrow': { fr: 'Journal', en: 'Journal' },
  'home.journal.title':   { fr: 'Marrakech : histoires, mains, matières', en: 'Marrakech: stories, hands, materials' },

  /* — Newsletter — */
  'news.title':   { fr: 'Entrer dans le cercle YZA', en: 'Join the YZA circle' },
  'news.text':    { fr: 'Les nouvelles pièces, les réassorts, un mot de l’atelier — une fois par mois, pas davantage. Promis.', en: 'New pieces, restocks, a word from the atelier — once a month, no more. Promise.' },
  'news.ph':      { fr: 'Votre e-mail', en: 'Your e-mail' },
  'news.btn':     { fr: 'S’inscrire', en: 'Subscribe' },
  'news.ok':      { fr: 'Merci ✓ On se retrouve très vite.', en: 'Thank you ✓ See you very soon.' },

  /* — Footer — */
  'footer.tagline':{ fr: 'Le vestiaire moderne de Marrakech.', en: 'Modern Marrakech Wear™.' },
  'footer.shop':   { fr: 'Boutique', en: 'Shop' },
  'footer.help':   { fr: 'Aide', en: 'Help' },
  'footer.house':  { fr: 'La maison', en: 'The house' },
  'footer.rights': { fr: 'Tous droits réservés.', en: 'All rights reserved.' },
  'footer.legal':  { fr: 'Mentions légales · Confidentialité', en: 'Legal · Privacy' },
  'footer.follow': { fr: 'Suivez-nous', en: 'Follow us', es: 'Síguenos', tr: 'Bizi takip edin', ar: 'تابعنا' },

  /* — Panier (drawer) — */
  'cart.title':    { fr: 'Votre panier', en: 'Your cart' },
  'cart.empty':    { fr: 'Votre panier est encore vide.', en: 'Your cart is still empty.' },
  'cart.emptyCta': { fr: 'Aller voir les fruits', en: 'Go meet the fruits' },
  'cart.subtotal': { fr: 'Sous-total', en: 'Subtotal' },
  'cart.checkout': { fr: 'Passer commande', en: 'Checkout' },
  "cart.note":     { fr: "Paiement sécurisé · garantie 30 jours · réparations à vie à l’atelier.", en: "Secure payment · 30-day guarantee · lifetime atelier repairs." },
  'cart.remove':   { fr: 'Retirer', en: 'Remove' },
  'cart.thanks':   { fr: 'Merci ✓ Démo : la commande se validerait ici.', en: 'Thank you ✓ Demo: checkout would happen here.' },

  /* — Page produit — */
  'pp.add':        { fr: 'Ajouter au panier', en: 'Add to cart' },
  'pp.finish':     { fr: 'Finition', en: 'Finish' },
  'pp.finish.loop':{ fr: 'Boucle raffia', en: 'Raffia loop' },
  'pp.finish.r2':  { fr: 'Boucle de 2 cm', en: 'Ring 2 cm' },
  'pp.finish.r3':  { fr: 'Étiquette laiton gravée', en: 'Engraved brass tag' },
  'pp.size':       { fr: 'Taille', en: 'Size' },
  'pp.color':      { fr: 'Couleur', en: 'Colour' },
  'pp.qty':        { fr: 'Quantité', en: 'Quantity' },
  'pp.acc.details':{ fr: 'Détails', en: 'Details' },
  "pp.acc.making": { fr: "Atelier", en: "Made at the atelier" },
  'pp.acc.ship':   { fr: 'Livraison, retours & réparations', en: 'Delivery, returns & repairs' },
  'pp.acc.care':   { fr: 'Entretien', en: 'Care' },
  'pp.making.txt': { fr: 'Crocheté main en raphia dans notre atelier de Guéliz, à Marrakech — tenu par des femmes, du premier nœud au dernier. Fini d’une étiquette dorée, gravée YZA.', en: 'Hand-crocheted in raffia in our Guéliz atelier in Marrakech — women-run, from the first knot to the last. Finished with a golden tag, engraved YZA.' },
  "pp.ship.txt":   { fr: "Livraison Maroc offerte dès 500 DH (panier accessoires) ou 1 500 DH (sacs & prêt-à-porter), expédiée et suivie depuis Marrakech. Garantie 30 jours sur les pièces non portées. Et si le temps fait son œuvre, réparations à vie à l’atelier.", en: "Free Morocco delivery from 500 DH (accessories) or 1,500 DH (bags & ready-to-wear), shipped and tracked from Marrakech. 30-day guarantee on unworn pieces. And when time does its work, lifetime atelier repairs." },
  'pp.care.txt':   { fr: 'À l’abri de l’humidité. Un coup de chiffon doux, à la main. Avec les années, le raphia prend une patine qui n’appartient qu’à vous.', en: 'Keep it from damp. A soft dust by hand now and then. Over the years, raffia takes on a patina that belongs to you alone.' },
  'pp.size.label': { fr: 'Dimensions', en: 'Dimensions' },
  'pp.hours':      { fr: 'de travail', en: 'of work' },
  'pp.related':    { fr: 'À marier avec', en: 'Goes well with' },
  'pp.bespokeNote':{ fr: 'Pièce sur-mesure — nouée pour vous, à la commande.', en: 'Bespoke piece — knotted for you, made to order.' },

  /* — Collections — */
  'col.all':       { fr: 'Toute la collection de l’atelier', en: 'The whole atelier collection' },
  'col.charms':    { fr: 'Charms en raphia', en: 'Raffia charms' },
  'col.earrings':  { fr: 'Boucles fruit', en: 'Fruit earrings' },
  'col.necklaces': { fr: 'Colliers fruit', en: 'Fruit necklaces' },
  'col.accessories': { fr: 'Bijoux', en: 'Jewellery' },
  'col.rtw':       { fr: 'Prêt-à-porter', en: 'Ready-to-wear' },
  'col.tops':      { fr: 'Tops Jawhara', en: 'Jawhara tops' },
  'col.pareos':    { fr: 'Jupes paréo Jawhara', en: 'Jawhara pareo skirts' },
  'col.pants':     { fr: 'Pantalons Jawhara', en: 'Jawhara pants' },
  'col.bottoms':   { fr: 'Bas Jawhara', en: 'Jawhara bottoms' },
  'col.bags':      { fr: 'Paniers & sacs', en: 'Baskets & bags' },
  'col.desc.all':         { fr: 'Charms, prêt-à-porter Jawhara et sacs Sculpture SS26.', en: 'SS26 charms, Jawhara ready-to-wear and Sculpture bags.', es: 'Charms, prêt-à-porter Jawhara y bolsos Sculpture SS26.', tr: 'SS26 charm’lar, Jawhara hazır giyim ve Sculpture çantalar.', ar: 'تمائم SS26، وملابس Jawhara الجاهزة، وحقائب Sculpture.' },
  'col.desc.charms':      { fr: 'Fruits crochetés à la main en raphia, en éditions limitées.', en: 'Hand-crocheted raffia fruits, in limited editions.', es: 'Frutas tejidas a ganchillo en rafia, en ediciones limitadas.', tr: 'Elde tığ işiyle örülmüş rafya meyveler, sınırlı sayıda.', ar: 'ثمار من الرافيا محبوكة يدويًا بالكروشيه، في إصدارات محدودة.' },
  'col.desc.accessories': { fr: 'Bijoux en raphia crocheté — boucles d\'oreilles et colliers.', en: 'Crocheted raffia jewellery — earrings and necklaces.', es: 'Joyería en rafia a ganchillo — pendientes y collares.', tr: 'Tığ işi rafya takılar — küpeler ve kolyeler.', ar: 'مجوهرات من الرافيا المحبوكة بالكروشيه — أقراط وعقود.' },
  'col.desc.bags':        { fr: 'Paniers et sacs Sculpture, faits main en raphia et cuir.', en: 'Handmade raffia baskets and Sculpture bags.', es: 'Cestas y bolsos Sculpture, hechos a mano en rafia y piel.', tr: 'El yapımı rafya sepetler ve Sculpture çantalar.', ar: 'سلال وحقائب Sculpture مصنوعة يدويًا من الرافيا والجلد.' },
  'col.desc.rtw':         { fr: 'Prêt-à-porter en tissu Jawhara, cousu à Marrakech.', en: 'Jawhara fabric ready-to-wear, sewn in Marrakech.', es: 'Prêt-à-porter en tejido Jawhara, cosido en Marrakech.', tr: 'Marrakech’te dikilmiş Jawhara kumaşı hazır giyim.', ar: 'ملابس جاهزة من قماش Jawhara، مخيطة في Marrakech.' },
  'col.filterCat': { fr: 'Catégorie', en: 'Category' },
  'col.sort':      { fr: 'Trier', en: 'Sort' },
  'col.sort.feat': { fr: 'En vedette', en: 'Featured' },
  'col.sort.asc':  { fr: 'Prix croissant', en: 'Price: low to high' },
  'col.sort.desc': { fr: 'Prix décroissant', en: 'Price: high to low' },
  'col.results':   { fr: 'pièces', en: 'pieces' },
  'col.noresults': { fr: 'Aucune pièce ne correspond à votre recherche', en: 'No pieces match your search' },
  'col.viewby':    { fr: 'Voir par', en: 'View by' },
  'col.colors':    { fr: 'couleurs', en: 'colors' },
  'col.quickadd':  { fr: 'Ajout rapide', en: 'Quick add' },

  /* — Badges — */
  'badge.bestseller': { fr: 'Préféré', en: 'Bestseller' },
  'badge.new':        { fr: 'Nouveau', en: 'New' },
  'badge.limited':    { fr: 'Édition limitée', en: 'Limited' },
  'badge.bespoke':    { fr: 'Sur-mesure', en: 'Bespoke' },

  /* — Divers — */
  'breadcrumb.home': { fr: 'Accueil', en: 'Home' },
  'from':            { fr: 'À partir de', en: 'From' },
  'lang.label':      { fr: 'Langue', en: 'Language' },
};

const LANGS = ['fr', 'en', 'es', 'tr', 'ar'];
const LOCALES = { fr: 'fr-MA', en: 'en-MA', es: 'es-ES', tr: 'tr-TR', ar: 'ar-MA' };
const LANG_FLAGS = {
  fr: '<img class="lang-flag" src="assets/flags/fr.svg" alt="" width="22" height="16">',
  en: '<img class="lang-flag" src="assets/flags/gb.svg" alt="" width="22" height="16">',
  es: '<img class="lang-flag" src="assets/flags/es.svg" alt="" width="22" height="16">',
  tr: '<img class="lang-flag" src="assets/flags/tr.svg" alt="" width="22" height="16">',
  ar: '<img class="lang-flag" src="assets/flags/ma.svg" alt="" width="22" height="16">',
};
const LANG_LABELS = { fr: 'FR', en: 'EN', es: 'ES', tr: 'TR', ar: 'AR' };

const EXTRA = {
  'a.skip': { fr: 'Aller au contenu', en: 'Skip to content', es: 'Saltar al contenido', tr: 'İçeriğe geç', ar: 'تخطَّ إلى المحتوى' },
  // Per-page <title> / meta description (localised by i18n.applyHead from document.body.dataset.page).
  'meta.home.title': { fr: 'YZA — Vêtements, charms & sacs faits main à Marrakech', en: 'YZA — Handmade clothing, charms & bags from Marrakech', es: 'YZA — Ropa, charms y bolsos hechos a mano en Marrakech', tr: "YZA — Marrakech'te el yapımı giysiler, charm'lar ve çantalar", ar: 'YZA — ملابس وتمائم وحقائب مصنوعة يدويًا في مراكش' },
  'meta.home.desc': { fr: 'Sacs, prêt-à-porter et accessoires faits main à Marrakech — raphia, doum, feuille de palmier et notre tissu Jawhara. Atelier 100 % féminin de Guéliz.', en: 'Bags, ready-to-wear and accessories handmade in Marrakech — raffia, doum, palm leaf and our Jawhara fabric. 100% women-run atelier in Guéliz.', es: 'Bolsos, prêt-à-porter y accesorios hechos a mano en Marrakech — rafia, doum, hoja de palmera y nuestro tejido Jawhara. Atelier 100 % femenino en Guéliz.', tr: "Marrakech'te el yapımı çantalar, hazır giyim ve aksesuarlar — rafya, doum, palmiye yaprağı ve Jawhara kumaşımız. Guéliz'de %100 kadın atölyesi.", ar: 'حقائب وملابس جاهزة وإكسسوارات مصنوعة يدويًا في مراكش — رافيا ودوم وسعف النخيل وقماش Jawhara. أتيليه نسائي بالكامل في Guéliz.' },
  'meta.collections.title': { fr: 'Collections — YZA', en: 'Collections — YZA', es: 'Colecciones — YZA', tr: 'Koleksiyonlar — YZA', ar: 'المجموعات — YZA' },
  'meta.collections.desc': { fr: 'Tous les charms, sacs Sculpture et pièces prêt-à-porter YZA SS26, faits main à Marrakech.', en: 'All YZA SS26 charms, Sculpture bags and ready-to-wear, handmade in Marrakech.', es: 'Todos los charms, bolsos Sculpture y prêt-à-porter YZA SS26, hechos a mano en Marrakech.', tr: "Tüm YZA SS26 charm'ları, Sculpture çantaları ve hazır giyim — Marrakech'te el yapımı.", ar: 'كل تمائم YZA SS26 وحقائب Sculpture والملابس الجاهزة، مصنوعة يدويًا في مراكش.' },
  'meta.faq.title': { fr: 'FAQ — YZA', en: 'FAQ — YZA', es: 'Preguntas frecuentes — YZA', tr: 'SSS — YZA', ar: 'الأسئلة الشائعة — YZA' },
  'meta.faq.desc': { fr: "Livraison, retours, sur-mesure et entretien du raphia — tout ce qu'il faut savoir avant de commander chez YZA.", en: 'Delivery, returns, made-to-measure and raffia care — everything to know before ordering from YZA.', es: 'Envíos, devoluciones, a medida y cuidado de la rafia — todo lo que debes saber antes de comprar en YZA.', tr: "Teslimat, iade, özel üretim ve rafya bakımı — YZA'dan sipariş vermeden önce bilmeniz gereken her şey.", ar: 'التوصيل والإرجاع والتفصيل حسب الطلب والعناية بالرافيا — كل ما يلزم معرفته قبل الطلب من YZA.' },
  'meta.contact.title': { fr: 'Contact — YZA, Marrakech', en: 'Contact — YZA, Marrakech', es: 'Contacto — YZA, Marrakech', tr: 'İletişim — YZA, Marrakech', ar: 'اتصلي بنا — YZA، مراكش' },
  'meta.contact.desc': { fr: "Écrivez à l'atelier YZA à Guéliz, Marrakech : e-mail, WhatsApp, Instagram, ou passez nous voir.", en: 'Write to the YZA atelier in Guéliz, Marrakech: email, WhatsApp, Instagram, or come and see us.', es: 'Escribe al atelier YZA en Guéliz, Marrakech: e-mail, WhatsApp, Instagram o ven a vernos.', tr: "Guéliz, Marrakech'teki YZA atölyesine yazın: e-posta, WhatsApp, Instagram veya bizi ziyaret edin.", ar: 'راسلي أتيليه YZA في Guéliz، مراكش: بريد إلكتروني أو WhatsApp أو إنستغرام، أو زورينا.' },
  'meta.story.title': { fr: "L'histoire YZA — Modern Marrakech Wear", en: 'The YZA story — Modern Marrakech Wear', es: 'La historia de YZA — Modern Marrakech Wear', tr: "YZA'nın hikâyesi — Modern Marrakech Wear", ar: 'حكاية YZA — Modern Marrakech Wear' },
  'meta.story.desc': { fr: 'Enracinée à Guéliz, fondée par Nawal Rmili après quinze ans dans la mode à Paris. Un atelier 100 % féminin, le raphia et le tissu Jawhara.', en: 'Rooted in Guéliz, founded by Nawal Rmili after fifteen years in Paris fashion. A 100% women-run atelier, raffia and Jawhara fabric.', es: 'Con raíces en Guéliz, fundada por Nawal Rmili tras quince años en la moda en París. Un atelier 100 % femenino, la rafia y el tejido Jawhara.', tr: "Guéliz'e kök salmış, Paris modasında on beş yılın ardından Nawal Rmili tarafından kuruldu. %100 kadın atölyesi, rafya ve Jawhara kumaşı.", ar: 'متجذّرة في Guéliz، أسّستها Nawal Rmili بعد خمسة عشر عامًا في موضة باريس. أتيليه نسائي بالكامل، الرافيا وقماش Jawhara.' },
  'meta.studio.title': { fr: "Le Studio YZA à Guéliz — visite de l'atelier", en: 'The YZA Studio in Guéliz — atelier visit', es: 'El Studio YZA en Guéliz — visita al atelier', tr: "Guéliz'deki YZA Studio — atölye ziyareti", ar: 'استوديو YZA في Guéliz — زيارة الأتيليه' },
  'meta.studio.desc': { fr: 'Poussez la porte du studio YZA, rue Yougoslavie à Guéliz : thé à la menthe, raphia frais, et les mains qui font chaque pièce.', en: 'Push the door of the YZA studio on rue Yougoslavie in Guéliz: mint tea, fresh raffia, and the hands behind every piece.', es: 'Empuja la puerta del studio YZA en la rue Yougoslavie de Guéliz: té de menta, rafia fresca y las manos tras cada pieza.', tr: "Guéliz'de rue Yougoslavie'deki YZA stüdyosunun kapısını aralayın: naneli çay, taze rafya ve her parçanın arkasındaki eller.", ar: 'ادفعي باب استوديو YZA في rue Yougoslavie بحي Guéliz: شاي بالنعناع، ورافيا طازجة، والأيادي التي تصنع كل قطعة.' },
  'meta.product.title': { fr: 'Pièce YZA — faite main à Marrakech', en: 'YZA piece — handmade in Marrakech', es: 'Pieza YZA — hecha a mano en Marrakech', tr: 'YZA parçası — Marrakech’te el yapımı', ar: 'قطعة YZA — مصنوعة يدويًا في مراكش' },
  'meta.product.desc': { fr: 'Pièce YZA faite main à Marrakech : détails atelier, livraison Maroc & monde, retours 30 jours, checkout par WhatsApp.', en: 'YZA piece handmade in Marrakech: atelier details, Morocco & worldwide shipping, 30-day returns, WhatsApp checkout.', es: 'Pieza YZA hecha a mano en Marrakech: detalles del atelier, envío a Marruecos y al mundo, devoluciones 30 días, pago por WhatsApp.', tr: 'Marrakech’te el yapımı YZA parçası: atölye detayları, Fas ve dünya çapında gönderim, 30 gün iade, WhatsApp ile ödeme.', ar: 'قطعة YZA مصنوعة يدويًا في مراكش: تفاصيل الأتيليه، توصيل داخل المغرب وحول العالم، إرجاع خلال 30 يومًا، إتمام الطلب عبر WhatsApp.' },
  'meta.b2b.title': { fr: 'B2B — Guéliz dans votre boutique | YZA', en: 'B2B — Guéliz in your boutique | YZA', es: 'B2B — Guéliz en tu boutique | YZA', tr: 'B2B — butiğinizde Guéliz | YZA', ar: 'B2B — Guéliz في بوتيكك | YZA' },
  'meta.b2b.desc': { fr: 'Séries limitées YZA pour boutiques sélectionnées : line sheets, lookbooks, exclusivités. Atelier 100 % féminin à Guéliz, Marrakech.', en: 'YZA limited runs for selected boutiques: line sheets, lookbooks, exclusives. 100% women-run atelier in Guéliz, Marrakech.', es: 'Series limitadas YZA para boutiques seleccionadas: line sheets, lookbooks, exclusivas. Atelier 100 % femenino en Guéliz, Marrakech.', tr: 'Seçili butikler için sınırlı sayıda YZA: line sheet, lookbook, özel parçalar. Guéliz, Marrakech’te %100 kadın atölyesi.', ar: 'إصدارات YZA المحدودة لبوتيكات مختارة: line sheets، lookbooks، قطع حصرية. أتيليه نسائي بالكامل في Guéliz، مراكش.' },
  'meta.girls.title': { fr: 'YZA Girls — vraies femmes, vraies pièces', en: 'YZA Girls — real women, real pieces', es: 'YZA Girls — mujeres reales, piezas reales', tr: 'YZA Girls — gerçek kadınlar, gerçek parçalar', ar: 'YZA Girls — نساء حقيقيات، قطع حقيقية' },
  'meta.girls.desc': { fr: 'Elles portent YZA — un lookbook vivant signé par la communauté, de Marrakech à Tokyo. Sisters, friends, femmes libres.', en: 'They wear YZA — a living lookbook by the community, from Marrakech to Tokyo. Sisters, friends, free women.', es: 'Llevan YZA — un lookbook vivo firmado por la comunidad, de Marrakech a Tokio. Hermanas, amigas, mujeres libres.', tr: 'YZA giyiyorlar — topluluğun imzasını taşıyan canlı bir lookbook, Marrakech’ten Tokyo’ya. Kardeşler, arkadaşlar, özgür kadınlar.', ar: 'يرتدين YZA — Lookbook حيّ بإمضاء المجتمع، من Marrakech إلى طوكيو. أخوات، صديقات، نساء حرّات.' },
  'meta.lookbook.title': { fr: 'Lookbook SS26/27 — YZA Modern Marrakech Wear', en: 'Lookbook SS26/27 — YZA Modern Marrakech Wear', es: 'Lookbook SS26/27 — YZA Modern Marrakech Wear', tr: 'Lookbook SS26/27 — YZA Modern Marrakech Wear', ar: 'Lookbook SS26/27 — YZA Modern Marrakech Wear' },
  'meta.lookbook.desc': { fr: 'Le lookbook SS26/27 comme un magazine — pages lentes signées de l’atelier YZA, Guéliz. Charms, Jawhara, Sculpture.', en: 'The SS26/27 lookbook like a magazine — slow pages signed by the YZA atelier in Guéliz. Charms, Jawhara, Sculpture.', es: 'El lookbook SS26/27 como una revista — páginas lentas firmadas por el atelier YZA en Guéliz. Charms, Jawhara, Sculpture.', tr: 'Bir dergi gibi SS26/27 lookbook — Guéliz’deki YZA atölyesinin imzasını taşıyan yavaş sayfalar. Charm, Jawhara, Sculpture.', ar: 'Lookbook SS26/27 كأنه مجلة — صفحاتٌ هادئة بإمضاء أتيليه YZA في Guéliz. تمائم، Jawhara، Sculpture.' },
  'meta.journal.title': { fr: 'Le Journal YZA — Marrakech, histoires & savoir-faire', en: 'The YZA Journal — Marrakech, stories & craft', es: 'El Journal YZA — Marrakech, historias y savoir-faire', tr: 'YZA Journal — Marrakech, hikâyeler ve zanaat', ar: 'يوميات YZA — مراكش، حكايات وحرفة' },
  'meta.journal.desc': { fr: 'Le journal YZA : reportages de l’atelier de Guéliz, guides de style, raphia et tissu Jawhara, vie à Marrakech.', en: 'The YZA journal: reports from the Guéliz atelier, styling guides, raffia and Jawhara fabric, life in Marrakech.', es: 'El journal YZA: reportajes desde el atelier de Guéliz, guías de estilo, rafia y tejido Jawhara, vida en Marrakech.', tr: 'YZA günlüğü: Guéliz atölyesinden haberler, stil rehberleri, rafya ve Jawhara kumaşı, Marrakech’te yaşam.', ar: 'يوميات YZA: تقارير من أتيليه Guéliz، أدلة تنسيق، الرافيا وقماش Jawhara، الحياة في Marrakech.' },
  // Localized alt text — applied via `data-i18n-attr="alt:alt.<key>"`.
  'alt.cat.charms':         { fr: 'Charms fruits en raphia, crochetés à la main à Marrakech', en: 'Hand-crocheted raffia fruit charms from Marrakech', es: 'Charms de fruta en rafia, tejidos a mano en Marrakech', tr: 'Marrakech’te elle tığ işiyle örülmüş rafya meyve charm’ları', ar: 'تمائم فاكهة من الرافيا، محبوكة يدويًا في Marrakech' },
  'alt.cat.rtw':            { fr: 'Ensemble prêt-à-porter YZA — haut et pantalon palazzo en coton Jawhara', en: 'YZA ready-to-wear set — top and palazzo pants in Jawhara cotton', es: 'Conjunto prêt-à-porter YZA — top y pantalón palazzo en algodón Jawhara', tr: 'YZA hazır giyim takımı — Jawhara pamuğundan üst ve palazzo pantolon', ar: 'إطلالة YZA الجاهزة — بلوزة وسروال بالازو من قطن Jawhara' },
  'alt.cat.sculpture':      { fr: 'Sac panier La Sculpture rouge ardent YZA, tressé main', en: 'YZA La Sculpture basket bag in hot red, hand-woven', es: 'Bolso cesta La Sculpture en rojo intenso YZA, tejido a mano', tr: 'YZA La Sculpture sepet çanta — ateş kırmızısı, elle dokunmuş', ar: 'حقيبة سلة La Sculpture بلون أحمر متّقد، منسوجة يدويًا' },
  'alt.cat.accessories':    { fr: 'Boucles et colliers fruits YZA SS26 en raphia', en: 'YZA SS26 raffia fruit earrings and necklaces', es: 'Pendientes y collares de fruta YZA SS26 en rafia', tr: 'YZA SS26 rafya meyve küpeleri ve kolyeleri', ar: 'أقراط وعقود الفاكهة من الرافيا، YZA SS26' },
  'alt.charms.basket':      { fr: 'Charms YZA accrochés sur un sac en paille, près d’un panier de fruits', en: 'YZA fruit charms clipped onto a straw bag, beside a basket of fruit', es: 'Charms YZA enganchados a un bolso de paja, junto a una cesta de fruta', tr: 'Hasır bir çantaya iliştirilmiş YZA meyve charm’ları, bir meyve sepetinin yanında', ar: 'تمائم YZA معلّقة على حقيبة من القش، قرب سلة فاكهة' },
  'alt.charms.pouch':       { fr: 'Charms cerise, pastèque et citron crochetés en raphia, sur un sac en paille', en: 'Cherry, watermelon and lemon raffia charms, on a straw bag', es: 'Charms de cereza, sandía y limón en rafia, sobre un bolso de paja', tr: 'Hasır çanta üzerinde kiraz, karpuz ve limon rafya charm’ları', ar: 'تمائم الكرز والبطّيخ والليمون من الرافيا، على حقيبة قش' },
  'alt.band.charm':         { fr: 'Charm orange en raphia sur un sac en cuir, lumière de Marrakech', en: 'Orange raffia charm on a leather bag, Marrakech light', es: 'Charm naranja en rafia sobre un bolso de piel, luz de Marrakech', tr: 'Deri bir çanta üzerinde turuncu rafya charm, Marrakech ışığında', ar: 'تميمة برتقالية من الرافيا على حقيبة جلدية، تحت ضوء Marrakech' },
  'alt.story.moodboard':    { fr: 'Moodboard YZA — artisanat, couleur et patrimoine de Marrakech', en: 'YZA moodboard — Marrakech craft, colour and heritage', es: 'Moodboard YZA — artesanía, color y patrimonio de Marrakech', tr: 'YZA moodboard — Marrakech zanaatı, rengi ve mirası', ar: 'لوحة إلهام YZA — حرفة Marrakech، ألوانها وتراثها' },
  'alt.story.familyTree':   { fr: 'Arbre généalogique YZA, Guéliz, Marrakech', en: 'YZA family tree in Guéliz, Marrakech', es: 'Árbol genealógico YZA, Guéliz, Marrakech', tr: 'Guéliz, Marrakech’te YZA aile ağacı', ar: 'شجرة عائلة YZA في Guéliz، Marrakech' },
  'alt.story.founder':      { fr: 'Nawal Rmili, fondatrice de YZA, à son bureau d’atelier à Guéliz, Marrakech', en: 'Nawal Rmili, founder of YZA, at her atelier desk in Guéliz, Marrakech', es: 'Nawal Rmili, fundadora de YZA, en su mesa de atelier en Guéliz, Marrakech', tr: 'YZA’nın kurucusu Nawal Rmili, Guéliz, Marrakech’teki atölye masasında', ar: 'Nawal Rmili، مؤسِّسة YZA، على مكتبها في الأتيليه بحي Guéliz، Marrakech' },
  'alt.story.atelier':      { fr: 'L’atelier YZA à Guéliz, Marrakech — les artisanes au travail', en: 'The YZA atelier in Guéliz, Marrakech — the artisans at work', es: 'El atelier YZA en Guéliz, Marrakech — las artesanas trabajando', tr: 'Guéliz, Marrakech’teki YZA atölyesi — çalışan zanaatkâr kadınlar', ar: 'أتيليه YZA في Guéliz، Marrakech — الحرفيات في عملهنّ' },
  'alt.story.atelierTable': { fr: 'Plan de travail à l’atelier YZA — raphia, ciseaux, café', en: 'Workbench at the YZA atelier — raffia, scissors, coffee', es: 'Mesa de trabajo en el atelier YZA — rafia, tijeras, café', tr: 'YZA atölyesinde çalışma tezgâhı — rafya, makas, kahve', ar: 'طاولة العمل في أتيليه YZA — الرافيا، المقصّ، القهوة' },
  'alt.story.atelierRaffia':{ fr: 'Le raphia, matière première de l’atelier YZA', en: 'Raffia, the raw material of the YZA atelier', es: 'La rafia, materia prima del atelier YZA', tr: 'Rafya, YZA atölyesinin hammaddesi', ar: 'الرافيا، المادة الخام لأتيليه YZA' },
  'alt.story.girlLook':     { fr: 'Une YZA Girl portant une pièce de l’atelier, à Marrakech', en: 'A YZA Girl wearing an atelier piece, in Marrakech', es: 'Una YZA Girl con una pieza del atelier, en Marrakech', tr: 'Marrakech’te atölyeden bir parça giyen bir YZA Girl', ar: 'إحدى YZA Girls ترتدي قطعة من الأتيليه، في Marrakech' },
  'alt.story.artisanes':    { fr: 'Les artisanes femmes de l’atelier YZA, Marrakech', en: 'The women artisans of the YZA atelier, Marrakech', es: 'Las artesanas del atelier YZA, Marrakech', tr: 'YZA atölyesinin kadın zanaatkârları, Marrakech', ar: 'حرفيّات أتيليه YZA، Marrakech' },
  'alt.story.bandCraft':    { fr: 'Détail d’artisanat à l’atelier YZA — mains au travail', en: 'Craft detail at the YZA atelier — hands at work', es: 'Detalle de artesanía en el atelier YZA — manos al trabajo', tr: 'YZA atölyesinde zanaat detayı — çalışan eller', ar: 'تفصيلٌ حرفي في أتيليه YZA — أيادٍ في العمل' },
  'alt.story.atelierBoard': { fr: 'À l’intérieur du studio YZA, Guéliz', en: 'Inside the YZA studio, Guéliz', es: 'Dentro del studio YZA, Guéliz', tr: 'YZA stüdyosunun içi, Guéliz', ar: 'داخل استوديو YZA، Guéliz' },
  'alt.story.bagGarden':    { fr: 'Un sac YZA dans le jardin de Guéliz', en: 'A YZA bag in the Guéliz garden', es: 'Un bolso YZA en el jardín de Guéliz', tr: 'Guéliz bahçesinde bir YZA çantası', ar: 'حقيبة YZA في حديقة Guéliz' },
  'alt.story.bandCharm':    { fr: 'Charm fruit en raphia, crocheté à la main', en: 'Raffia fruit charm, crocheted by hand', es: 'Charm de fruta en rafia, tejido a mano', tr: 'Elle tığ işiyle örülmüş rafya meyve charm’ı', ar: 'تميمة فاكهة من الرافيا، محبوكة يدويًا' },
  'alt.editorial.worn':     { fr: 'Pièce éditoriale YZA portée par un modèle', en: 'YZA editorial piece worn on model', es: 'Pieza editorial YZA llevada por una modelo', tr: 'Bir modelin üzerinde YZA editoryal parça', ar: 'قطعة YZA من إطلالة تحرير، ترتديها عارضة' },
  'alt.product.worn':       { fr: 'Pièce YZA portée par un modèle', en: 'YZA piece worn by a model', es: 'Pieza YZA llevada por una modelo', tr: 'Bir modelin üzerinde YZA parçası', ar: 'قطعة YZA ترتديها عارضة' },
  'announce': { es: 'Garantía 30 días · reparaciones de por vida en el atelier', tr: '30 gun garanti · atolyede omur boyu tamir', ar: 'ضمان 30 يوما · تصليحات مدى الحياة في الأتولييه' },
  'meta.shipping': { es: 'Envío gratis en Marruecos desde 1.500 DH', tr: 'Fas ici 1.500 DH uzeri ucretsiz teslimat', ar: 'توصيل مجاني في المغرب ابتداء من 1,500 درهم' },
  'meta.sale': { es: 'Fruit Market — ver charms', tr: 'Fruit Market — charm’ları keşfet', ar: 'Fruit Market — اكتشفي التعليقات' },
  'nav.charms': { es: 'Charms', tr: 'Charm’lar', ar: 'تعليقات' },
  'nav.rtw': { es: 'Prêt-à-porter', tr: 'Hazır giyim', ar: 'ملابس جاهزة' },
  'nav.bags': { es: 'Cestas y bolsos', tr: 'Sepetler ve çantalar', ar: 'سلال وحقائب' },
  'nav.accessories': { es: 'Accesorios', tr: 'Aksesuarlar', ar: 'إكسسوارات' },
  'nav.girls': { es: 'YZA Girls', tr: 'YZA Girls', ar: 'YZA Girls' },
  'nav.b2b': { es: 'Stockists', tr: 'Stockists', ar: 'Stockists' },
  'nav.lookbook': { es: 'Lookbook SS26/27', tr: 'Lookbook SS26/27', ar: 'Lookbook SS26/27' },
  'girls.shopLook': { es: 'Ver el look', tr: 'Look’u keşfet', ar: 'تسوّقي الإطلالة' },
  'nav.bespoke': { es: 'A medida', tr: 'Özel üretim', ar: 'تفصيل خاص' },
  'nav.story': { es: 'Historia', tr: 'Hikayemiz', ar: 'قصتنا' },
  'nav.journal': { es: 'Diario', tr: 'Günlük', ar: 'دفتر' },
  'nav.archive': { es: 'Archivos', tr: 'Arşiv', ar: 'الأرشيف' },
  'nav.faq': { es: 'FAQ', tr: 'SSS', ar: 'أسئلة' },
  'nav.contact': { es: 'Contacto', tr: 'İletişim', ar: 'اتصال' },
  'nav.studio': { es: 'El Estudio', tr: 'Stüdyo', ar: 'الاستوديو' },
  'nav.fruitmarket': { es: 'El Fruit Market', tr: 'Fruit Market', ar: 'Fruit Market' },
  'nav.sculpture': { es: 'La Sculpture', tr: 'La Sculpture', ar: 'La Sculpture' },
  'mega.cat': { es: 'Por categoría', tr: 'Kategoriye göre', ar: 'حسب الفئة' },
  'mega.explore': { es: 'Explorar', tr: 'Keşfet', ar: 'استكشفي' },
  'mega.brand': { es: 'La marca', tr: 'Marka', ar: 'العلامة' },
  'mega.editorial': { es: 'Editorial', tr: 'Editoryal', ar: 'تحرير' },
  'mega.service': { es: 'Atención al cliente', tr: 'Müşteri hizmetleri', ar: 'خدمة العملاء' },
  'a.search': { es: 'Buscar', tr: 'Ara', ar: 'بحث' },
  'a.cart': { es: 'Carrito', tr: 'Sepet', ar: 'السلة' },
  'a.menu': { es: 'Abrir menú', tr: 'Menüyü aç', ar: 'فتح القائمة' },
  'a.close': { es: 'Cerrar', tr: 'Kapat', ar: 'إغلاق' },
  'cta.added': { es: 'Añadido ✓', tr: 'Eklendi ✓', ar: 'تمت الإضافة ✓' },
  'hero.title': { es: 'La Sculpture', tr: 'La Sculpture', ar: 'La Sculpture' },
  'hero.subheading': { es: 'Tejido a mano en Guéliz, Marrakech. Nunca igual dos veces.', tr: 'Guéliz, Marrakech’te elle dokunmuş. Hiçbiri aynı değil.', ar: 'منسوج يدوياً في Guéliz, Marrakech. لا يتكرر أبداً.' },
  'pp.limited': {
    fr: 'Édition limitée · une fois partie, on ne la refait pas',
    en: 'Limited edition · once it’s gone, we don’t remake it',
    es: 'Edición limitada · no se repite al agotarse',
    tr: 'Sınırlı üretim · tükenince tekrar yapılmaz',
    ar: 'إصدار محدود · لا يعاد إنتاجه بعد النفاد',
  },
  'pp.colors': { fr: 'Coloris disponibles', en: 'Available colours', es: 'Colores disponibles', tr: 'Mevcut renkler', ar: 'الألوان المتاحة' },
  'pp.availableSizes': { fr: 'Tailles disponibles', en: 'Available sizes', es: 'Tallas disponibles', tr: 'Mevcut bedenler', ar: 'المقاسات المتاحة' },
  'pp.edition': { fr: 'Édition', en: 'Edition', es: 'Edición', tr: 'Edisyon', ar: 'الإصدار' },
  'pp.material': { fr: 'Matière', en: 'Material', es: 'Material', tr: 'Malzeme', ar: 'الخامة' },
  'pp.fabric': { fr: 'Tissu', en: 'Fabric', es: 'Fabric', tr: 'Kumaş', ar: 'القماش' },
  'pp.crosssell': { es: 'Completar con', tr: 'Şununla tamamla', ar: 'أكملي مع' },
  'pp.add': { es: 'Añadir al carrito', tr: 'Sepete ekle', ar: 'أضيفي إلى السلة' },
  'pp.acc.ship': { es: 'Entrega, devoluciones y reparaciones', tr: 'Teslimat, iade ve tamir', ar: 'التوصيل والإرجاع والتصليح' },
  'pp.ship.txt': { es: 'Envío gratis en Marruecos desde 1.500 DH. Envío con seguimiento desde Marrakech. Garantía 30 días y reparaciones de por vida gratis en el atelier.', tr: 'Fas ici 1.500 DH uzeri ucretsiz teslimat. Marakes ten takipli gonderim. 30 gun garanti ve atolyede omur boyu ucretsiz tamir.', ar: 'توصيل مجاني في المغرب ابتداء من 1,500 درهم. شحن متتبع من مراكش. ضمان 30 يوما وتصليحات مجانية مدى الحياة في الأتولييه.' },
  'pp.related': { es: 'También te puede gustar', tr: 'Bunları da sevebilirsin', ar: 'قد يعجبك أيضا' },
  'pp.bundle.title': { es: 'Pack fácil', tr: 'Kolay set', ar: 'مجموعة سهلة' },
  'pp.bundle.includes': { es: 'Incluye', tr: 'İçerik', ar: 'يشمل' },
  'pp.bundle.total': { es: 'Total pack', tr: 'Set toplamı', ar: 'مجموع المجموعة' },
  'pp.bundle.add': { es: 'Añadir pack', tr: 'Seti sepete ekle', ar: 'إضافة المجموعة' },
  'pp.bundle.added': { es: 'Pack añadido', tr: 'Set eklendi', ar: 'تمت إضافة المجموعة' },
  'conv.maps.label': { es: 'Ir a la tienda', tr: 'Mağazaya git', ar: 'الاتجاه إلى المتجر' },
  'conv.maps.bubble': { es: 'Navegacion boutique - Marrakech', tr: 'Butik navigasyon - Marakes', ar: 'ملاحة البوتيك - مراكش' },
  'conv.chat.label': { es: 'Pregunta', tr: 'Soru', ar: 'سؤال' },
  'conv.chat.title': { es: '¿Pregunta sobre una pieza?', tr: 'Bir parça hakkında soru?', ar: 'لديك سؤال عن قطعة؟' },
  'conv.chat.text': { es: 'Haz tu pregunta. Deja tu nombre y WhatsApp para recibir -10 %.', tr: 'Sorunuzu yazın. %10 indirim için adınızı ve WhatsApp numaranızı bırakın.', ar: 'اكتبي سؤالك واتركي اسمك ورقم واتساب للحصول على خصم 10٪.' },
  'conv.chat.question': { es: 'Pregunta', tr: 'Soru', ar: 'السؤال' },
  'conv.chat.questionPh': { es: 'Talla, color, disponibilidad, regalo...', tr: 'Beden, renk, stok, hediye...', ar: 'المقاس، اللون، التوفر، هدية...' },
  'conv.chat.name': { es: 'Nombre completo', tr: 'Ad soyad', ar: 'الاسم الكامل' },
  'conv.chat.phone': { es: 'WhatsApp', tr: 'WhatsApp', ar: 'واتساب' },
  'conv.chat.prepare': { es: 'Preparar WhatsApp', tr: 'WhatsApp mesajını hazırla', ar: 'تحضير رسالة واتساب' },
  'conv.chat.send': { es: 'Abrir WhatsApp con YZA10', tr: 'YZA10 ile WhatsApp aç', ar: 'فتح واتساب مع رمز YZA10' },
  'conv.chat.ready': { es: 'Mensaje listo. Abre WhatsApp para enviarlo.', tr: 'Mesaj hazır. Göndermek için WhatsApp açın.', ar: 'الرسالة جاهزة. افتحي واتساب لإرسالها.' },
  'promo.exit.kicker': { es: 'Antes de irte', tr: 'Gitmeden önce', ar: 'قبل أن تغادري' },
  'promo.exit.title': { es: '20 %, de nuestra parte', tr: 'Bizden %20', ar: '20% منّا' },
  'promo.exit.text': { es: 'Escríbenos por WhatsApp con el código YZA20 y te guardamos el carrito. Desde 150 EUR / unos 1.500 DH — sin presión, solo por si acaso.', tr: 'WhatsApp’tan YZA20 koduyla yazın, sepetinizi sizin için ayıralım. 150 EUR / yaklaşık 1.500 DH üzeri — baskı yok, sadece ihtimale karşı.', ar: 'اكتبي لنا عبر واتساب برمز YZA20 وسنحتفظ لكِ بسلتك. ابتداءً من 150 يورو / نحو 1.500 درهم — دون أي ضغط، فقط تحسّباً.' },
  'promo.exit.cta': { es: 'Escribir por WhatsApp', tr: 'WhatsApp’tan yazın', ar: 'اكتبي عبر واتساب' },
  'promo.exit.close': { es: 'En otra ocasión', tr: 'Belki başka zaman', ar: 'ربما في وقتٍ آخر' },
  'cart.title': { es: 'Tu carrito', tr: 'Sepetin', ar: 'سلتك' },
  'cart.empty': { es: 'Tu carrito está vacío.', tr: 'Sepetin boş.', ar: 'سلتك فارغة.' },
  'cart.subtotal': { es: 'Subtotal', tr: 'Ara toplam', ar: 'المجموع الفرعي' },
  'cart.checkout': { es: 'Finalizar pedido', tr: 'Siparişi tamamla', ar: 'إتمام الطلب' },
  'cart.note': { es: 'Pago seguro · garantía 30 días · reparaciones de por vida en el atelier.', tr: 'Guvenli odeme · 30 gun garanti · atolyede omur boyu tamir.', ar: 'دفع آمن · ضمان 30 يوما · تصليحات مدى الحياة في الأتولييه.' },
  'col.all': { es: 'Toda la tienda', tr: 'Tüm mağaza', ar: 'كل المتجر' },
  'col.charms': { es: 'Charms de rafia', tr: 'Rafya charm’lar', ar: 'تعليقات الرافيا' },
  'col.earrings': { es: 'Pendientes fruit', tr: 'Meyve kupeler', ar: 'أقراط الفاكهة' },
  'col.necklaces': { es: 'Collares fruit', tr: 'Meyve kolyeler', ar: 'قلائد الفاكهة' },
  'col.accessories': { es: 'Accesorios fruit', tr: 'Meyve aksesuarları', ar: 'إكسسوارات الفاكهة' },
  'col.rtw': { es: 'Prêt-à-porter', tr: 'Hazır giyim', ar: 'ملابس جاهزة' },
  'col.tops': { es: 'Tops Jawhara', tr: 'Jawhara üstler', ar: 'قطع علوية جوهرة' },
  'col.pareos': { es: 'Pareos Jawhara', tr: 'Jawhara pareolar', ar: 'باريو جوهرة' },
  'col.pants': { es: 'Pantalones Jawhara', tr: 'Jawhara pantolonlar', ar: 'بنطال جوهرة' },
  'col.bottoms': { es: 'Prendas inferiores Jawhara', tr: 'Jawhara altlar', ar: 'قطع سفلية جوهرة' },
  'col.bags': { es: 'Cestas y bolsos', tr: 'Sepetler ve çantalar', ar: 'سلال وحقائب' },
  'cat.charms': { es: 'Charms de rafia', tr: 'Rafya charm’lar', ar: 'تعليقات الرافيا' },
  'cat.charms.txt': { es: 'Engancha un poco de Marrakech a cualquier bolso.', tr: 'Herhangi bir çantaya bir tutam Marrakech tak.', ar: 'علّقي قليلاً من Marrakech على أي حقيبة.' },
  'cat.rtw': { es: 'Prêt-à-porter Jawhara', tr: 'Jawhara hazır giyim', ar: 'ملابس جوهرة الجاهزة' },
  'cat.rtw.txt': { es: 'Tops, pareos y pantalones que combinan.', tr: 'Birlikte uyum sağlayan üstler, pareolar ve pantolonlar.', ar: 'بلوزات وباريو وسراويل تتناغم معاً.' },
  'cat.bags': { es: 'Cestas y bolsos', tr: 'Sepetler ve çantalar', ar: 'سلال وحقائب' },
  'cat.bags.txt': { es: 'Hechos a mano. El mismo atelier, las mismas mujeres, año tras año. Para años, no para una temporada.', tr: 'Elle yapıldı. Aynı atölye, aynı kadınlar, yıldan yıla. Yıllar için, bir sezon için değil.', ar: 'صُنعت يدوياً. نفس الأتيليه، نفس النساء، عاماً بعد عام. لسنوات، لا لموسم.' },
  'cat.accessories': { es: 'Accesorios fruit', tr: 'Meyve aksesuarları', ar: 'إكسسوارات الفاكهة' },
  'cat.accessories.txt': { es: 'Pendientes, collares y frutas hechas a mano.', tr: 'El işi küpeler, kolyeler ve meyveler.', ar: 'أقراط وقلائد وفواكه محبوكة يدوياً.' },
  'col.results': { es: 'piezas', tr: 'parça', ar: 'قطعة' },
  'col.noresults': { es: 'Ningún artículo coincide con tu búsqueda', tr: 'Aramanızla eşleşen ürün yok', ar: 'لا توجد قطع تطابق بحثك' },
  'col.viewby': { es: 'Ver por', tr: 'Görünüm', ar: 'عرض حسب' },
  'col.colors': { es: 'colores', tr: 'renk', ar: 'ألوان' },
  'col.quickadd': { es: 'Añadir', tr: 'Hızlı ekle', ar: 'إضافة سريعة' },
  'badge.bestseller': { es: 'Favorito', tr: 'Çok satan', ar: 'الأكثر طلبا' },
  'badge.new': { es: 'Nuevo', tr: 'Yeni', ar: 'جديد' },
  'badge.limited': { es: 'Edición limitada', tr: 'Sınırlı', ar: 'إصدار محدود' },
  'nav.more': { fr: 'Plus', en: 'More', es: 'Mas', tr: 'Daha fazla', ar: 'المزيد' },
  'contact.resellers.title': { fr: 'Revendeurs / B2B', en: 'Resellers / B2B', es: 'Revendedores / B2B', tr: 'Bayiler / B2B', ar: 'الموزعون / B2B' },
  'contact.resellers.text': {
    fr: 'Nos séries sont courtes, nouées main à Guéliz, Marrakech — alors on travaille avec quelques boutiques choisies. Écrivez-nous : on parle disponibilités, couleurs, délais, et la suite ensemble.',
    en: 'Our runs are short, hand-knotted in Guéliz, Marrakech — so we work with a handful of chosen boutiques. Write to us: we’ll talk availability, colours, lead times, and the rest together.',
    es: 'Nuestras series son cortas, anudadas a mano en Guéliz, Marrakech — por eso trabajamos con unas pocas boutiques elegidas. Escríbenos: hablamos de disponibilidad, colores, plazos y lo demás, juntas.',
    tr: 'Serilerimiz kısa, Guéliz, Marrakech\"te elle düğümlenir — bu yüzden seçtiğimiz birkaç butikle çalışırız. Bize yazın: uygunluğu, renkleri, teslim sürelerini ve gerisini birlikte konuşuruz.',
    ar: 'إنتاجنا محدود، معقود يدوياً في Guéliz, Marrakech — لذلك نعمل مع قلّة من البوتيكات المختارة. راسلونا: نتحدّث معاً عن التوفّر والألوان ومُدد التسليم وما بعدها.',
  },
  'contact.resellers.cta': { fr: 'Demander le catalogue B2B', en: 'Request B2B catalogue', es: 'Pedir catálogo B2B', tr: 'B2B kataloğu iste', ar: 'طلب كتالوج B2B' },
};


/* --- native es/tr/ar translations merged from audit (auto) --- */
const I18N_NATIVE_OVERRIDES = {"es":{"announce":"Garantía de 30 días · Reparaciones de por vida en el atelier","meta.shipping":"Envío gratis a Marruecos desde 1.500 DH","meta.sale":"Fruit Market — descubre los charms","nav.charms":"Charms","nav.rtw":"Prêt-à-porter","nav.bags":"Cestas y bolsos","nav.accessories":"Joyas","nav.girls":"YZA Girls","nav.bespoke":"A medida","nav.story":"Nuestra historia","nav.b2b":"Stockists","nav.lookbook":"Lookbook SS26/27","nav.journal":"Journal","nav.archive":"Archivo","nav.faq":"FAQ","nav.contact":"Contacto","nav.more":"Más","a.search":"Buscar","a.wishlist":"Favoritos","a.cart":"Cesta","a.menu":"Abrir el menú","a.close":"Cerrar","cta.discover":"Descubrir","cta.shop":"Ver la colección","cta.shopCharms":"Ver los charms","cta.shopSculpture":"Descubrir La Sculpture","cta.discoverAtelier":"Visitar el atelier","card.quickview":"Vista rápida","carousel.prev":"Anterior","carousel.next":"Siguiente","charm.style.eyebrow":"El Fruit Market","charm.style.title":"Cómo llevar tus charms","charm.style.text":"Engancha tus frutas de rafia en cualquier bolso: una cesta de piel, un bolso estructurado, un bandolera acolchado. Un clip, un toque de color, y la pieza se hace tuya.","charm.style.cap1":"Sobre una cesta de piel","charm.style.cap2":"Sobre un bolso estructurado negro","charm.style.cap3":"Sobre un bandolera acolchado","charm.style.videoCap":"El charm naranja, en movimiento","print.eyebrow":"Sobre el estampado","print.title":"El Mercado de la Fruta","print.body":"Dibujado a mano en nuestro atelier de Guéliz, nuestro toile traza con trazo terracota los cítricos, las granadas y los higos del zoco, las palmeras, los arcos de los riads y la mujer que lleva su cesta de rafia. Cada línea guarda la memoria de las manos que la anudan: una carta de amor a Marrakech, a su luz, a su mercado.","print.caption":"Cereza, sandía, limón — tejidos a ganchillo a mano.","world.charms.eye":"Charms","world.charms.title":"Frutas de rafia","world.bags.eye":"Cestas","world.bags.title":"La Sculpture","world.rtw.eye":"Prêt-à-porter","world.rtw.title":"Jawhara","marquee.marrakech":"Mejor en Marrakech","band.craft.eye":"El savoir-faire","band.craft.title":"Los detalles que\nhacen la diferencia.","band.craft.text":"De dos a seis horas de trabajo por fruta, anudada a mano en rafia por las mujeres del atelier.","band.closing.eye":"Fruit Market","band.closing.title":"El verano se lleva en rafia","cta.add":"Añadir a la cesta","cta.added":"Añadido ✓","cta.viewAll":"Ver todo","cta.more":"Ver más","cta.learn":"Saber más","cta.read":"Leer","hero.eyebrow":"YZA","hero.title":"La Sculpture","hero.subheading":"El nuevo icono de Marrakech","hero.text":"Tejida a mano en rafia, hoja de banano y abalorios por las mujeres de nuestro atelier de Guéliz — un bolso cada vez, nunca exactamente igual.","press.label":"Un savoir-faire forjado en París, junto a","press.note":"YZA, casa amazigh contemporánea nacida de un regreso a Marrakech tras quince años en la moda en París.","social.eyebrow":"Ellas llevan YZA","social.title":"De Marrakech a París","social.rating":"Opiniones de nuestras clientas","social.ratingOf":"Valoración","girls.shopLook":"Comprar el look","offer.eyebrow":"Por dónde empezar","offer.title":"Toda la colección SS26, en tres piezas","offer.text":"Un charm, un look Jawhara, un bolso Sculpture — uno de cada, y toda la temporada cabe en tus manos.","offer.save":"Ahorra","offer.bundleNote":"Caja lista para regalar","pp.limited":"Edición limitada · no se repone una vez agotada","pp.was":"antes","pp.crosssell":"Completa con","pp.reviews":"opiniones","pp.bundle.title":"Set fácil","pp.bundle.includes":"Incluye","pp.bundle.total":"Total del set","pp.bundle.add":"Añadir el set","pp.bundle.added":"Set añadido","conv.maps.label":"Cómo llegar a la boutique","conv.maps.bubble":"Boutique navigation - Marrakech","conv.chat.label":"Pregunta","conv.chat.title":"¿Una duda sobre una pieza?","conv.chat.text":"Haznos tu consulta. Déjanos tu nombre y tu WhatsApp y recibe un -10 % en tu pedido.","conv.chat.question":"Pregunta","conv.chat.questionPh":"Talla, color, disponibilidad, regalo...","conv.chat.name":"Nombre completo","conv.chat.phone":"WhatsApp","conv.chat.prepare":"Preparar WhatsApp","conv.chat.send":"Abrir WhatsApp con el código YZA10","conv.chat.ready":"Mensaje listo. Abre WhatsApp para enviarlo y recibir tu código.","promo.exit.kicker":"Antes de irte","promo.exit.title":"-20 % en tu pedido","promo.exit.text":"Recupera tu cesta por WhatsApp con el código YZA20. Válido desde 150 EUR / unos 1.500 DH.","promo.exit.cta":"Recuperar por WhatsApp","promo.exit.close":"Continuar sin oferta","home.cats.eyebrow":"Explorar","home.cats.title":"Cuatro formas de llevar Marrakech","cat.charms":"Charms de rafia","cat.charms.txt":"Frutas para enganchar al bolso.","cat.rtw":"Prêt-à-porter Jawhara","cat.rtw.txt":"Tops, pareos y pantalones a juego.","cat.bags":"Cestas y bolsos","cat.bags.txt":"Tejidos y a ganchillo, a mano.","cat.accessories":"Joyas","cat.accessories.txt":"Pendientes, collares y frutas a ganchillo.","cat.bespoke":"A medida","cat.bespoke.txt":"Los bolsos esculpidos del atelier.","home.best.eyebrow":"Las favoritas","home.best.title":"Nuestros imprescindibles","home.story.eyebrow":"El atelier","home.story.title":"Más manos,\nmenos máquinas.","home.story.text":"Cada pieza se teje a ganchillo en rafia por las mujeres de nuestro atelier, en Marrakech. De dos a seis horas de trabajo por fruta, y una etiqueta dorada grabada al final.","trust.title":"Servicios YZA","trust.handmade.t":"Hecho únicamente por mujeres marroquíes","trust.handmade.x":"Cada charm pasa por manos expertas, no por una línea de producción.","trust.women.t":"Más manos, menos máquinas","trust.women.x":"Las manos tardan más que las máquinas. Ese es el sentido — y se nota.","trust.unique.t":"Menos desperdicio, más sentido","trust.unique.x":"Series cortas, rafia trabajada con cuidado, piezas pensadas para durar.","trust.secure.t":"Hecho para amar y compartir","trust.secure.x":"Frutas, cestas y regalos que viajan de Marrakech a París.","home.journal.eyebrow":"Journal","home.journal.title":"Marrakech, historias y savoir-faire","news.title":"Únete a YZA","news.text":"Piezas nuevas, reposiciones y una nota del atelier — una vez al mes, nunca más.","news.ph":"Tu e-mail","news.btn":"Suscribirme","news.ok":"Gracias ✓ Hasta muy pronto.","footer.tagline":"Bolsos y charms de ganchillo en rafia, hechos a mano en Marrakech.","footer.shop":"Tienda","footer.help":"Ayuda","footer.house":"La casa","footer.rights":"Todos los derechos reservados.","footer.legal":"Aviso legal · Privacidad","cart.title":"Tu cesta","cart.empty":"Tu cesta está vacía.","cart.emptyCta":"Descubrir los charms","cart.subtotal":"Subtotal","cart.checkout":"Tramitar pedido","cart.note":"Pago seguro · garantía de 30 días · reparaciones de por vida en el atelier.","cart.remove":"Quitar","cart.thanks":"Gracias ✓ Demo: aquí se confirmaría el pedido.","pp.add":"Añadir a la cesta","pp.finish":"Acabado","pp.finish.loop":"Lazada de rafia","pp.finish.r2":"Anilla dorada de 2 cm","pp.finish.r3":"Anilla dorada de 3 cm","pp.size":"Talla","pp.color":"Color","pp.qty":"Cantidad","pp.acc.details":"Detalles","pp.acc.making":"Fabricación","pp.acc.ship":"Envíos, devoluciones y reparaciones","pp.acc.care":"Cuidados","pp.making.txt":"Tejido a ganchillo en rafia en nuestro atelier 100 % femenino de Guéliz, Marrakech. Acabado con una etiqueta dorada grabada YZA.","pp.ship.txt":"Envío gratis a Marruecos desde 1.500 DH. Envío con seguimiento desde Marrakech. Garantía de 30 días en piezas sin usar y reparaciones de por vida gratis en el atelier.","pp.care.txt":"Mantener a salvo de la humedad. Quitar el polvo con suavidad a mano. La rafia adquiere una bonita pátina con el tiempo.","pp.size.label":"Dimensiones","pp.hours":"de trabajo","pp.related":"También te gustará","pp.bespokeNote":"Pieza a medida: fabricada bajo pedido.","col.all":"Toda la tienda","col.charms":"Charms de rafia","col.earrings":"Pendientes fruta","col.necklaces":"Collares fruta","col.accessories":"Joyas","col.rtw":"Prêt-à-porter","col.tops":"Tops Jawhara","col.pareos":"Pareos Jawhara","col.pants":"Pantalones Jawhara","col.bottoms":"Prendas inferiores Jawhara","col.bags":"Cestas y bolsos","col.filterCat":"Categoría","col.sort":"Ordenar","col.sort.feat":"Destacados","col.sort.asc":"Precio: de menor a mayor","col.sort.desc":"Precio: de mayor a menor","col.results":"piezas","badge.bestseller":"Favorito","badge.new":"Nuevo","badge.limited":"Edición limitada","badge.bespoke":"A medida","breadcrumb.home":"Inicio","from":"Desde","lang.label":"Idioma","pp.colors":"Colores disponibles","pp.availableSizes":"Tallas disponibles","pp.edition":"Edición","pp.material":"Material","pp.fabric":"Tejido","contact.resellers.title":"Distribuidores / B2B","contact.resellers.text":"Nuestras series son cortas, anudadas a mano en Guéliz — por eso trabajamos con unas pocas boutiques elegidas. Escríbenos: hablamos de disponibilidad, colores, plazos y lo demás, juntas.","contact.resellers.cta":"Solicitar el catálogo B2B"},"tr":{"announce":"30 günlük garanti · Atölyede ömür boyu onarım","meta.shipping":"1.500 DH ve üzeri Fas içi ücretsiz teslimat","meta.sale":"Fruit Market — charm'ları keşfedin","nav.charms":"Charm","nav.rtw":"Hazır Giyim","nav.bags":"Sepetler & Çantalar","nav.accessories":"Takı","nav.girls":"YZA Girls","nav.bespoke":"Özel Tasarım","nav.story":"Hikayemiz","nav.b2b":"Stockists","nav.lookbook":"Lookbook SS26/27","nav.journal":"Günlük","nav.archive":"Arşiv","nav.faq":"SSS","nav.contact":"İletişim","nav.more":"Daha Fazla","a.search":"Ara","a.wishlist":"Favoriler","a.cart":"Sepet","a.menu":"Menüyü aç","a.close":"Kapat","cta.discover":"Keşfet","cta.shop":"Koleksiyonu gör","cta.shopCharms":"Charm'ları gör","cta.shopSculpture":"La Sculpture'ı keşfet","cta.discoverAtelier":"Atölyeyi ziyaret et","card.quickview":"Önizleme","carousel.prev":"Önceki","carousel.next":"Sonraki","charm.style.eyebrow":"Le Fruit Market","charm.style.title":"Charm'larınızı nasıl taşırsınız","charm.style.text":"Rafya meyvelerinizi dilediğiniz çantaya iliştirin — deri bir sepet çanta, yapılı bir el çantası, kapitone bir omuz çantası. Bir klips, bir tutam renk ve parça artık size ait.","charm.style.cap1":"Deri sepet çanta üzerinde","charm.style.cap2":"Yapılı siyah çanta üzerinde","charm.style.cap3":"Kapitone omuz çantası üzerinde","charm.style.videoCap":"Turuncu charm, hareket halinde","print.eyebrow":"Desen hakkında","print.title":"Meyve Pazarı","print.body":"Guéliz'deki atölyemizde elle çizilen kumaşımız, terracotta çizgilerle souk'un narenciyelerini, narlarını ve incirlerini, palmiyeleri, riad kemerlerini ve rafya sepetini taşıyan kadını resmeder. Her çizgi, onu düğümleyen ellerin hafızasını taşır — Marrakech'e, ışığına, pazarına yazılmış bir aşk mektubu.","print.caption":"Kiraz, karpuz, limon — elde tığ işiyle örülmüş.","world.charms.eye":"Charm","world.charms.title":"Rafya meyveler","world.bags.eye":"Sepetler","world.bags.title":"La Sculpture","world.rtw.eye":"Hazır Giyim","world.rtw.title":"Jawhara","marquee.marrakech":"Marrakech'te her şey daha güzel","band.craft.eye":"Zanaat","band.craft.title":"Farkı yaratan\nayrıntılar.","band.craft.text":"Her meyve için iki ila altı saat emek; atölyenin kadınları tarafından rafyadan elle düğümlenir.","band.closing.eye":"Fruit Market","band.closing.title":"Yaz, rafyayla örülür","cta.add":"Sepete ekle","cta.added":"Eklendi ✓","cta.viewAll":"Tümünü gör","cta.more":"Daha fazla gör","cta.learn":"Daha fazla bilgi","cta.read":"Oku","hero.eyebrow":"YZA","hero.title":"La Sculpture","hero.subheading":"Marrakech'in yeni ikonu","hero.text":"Guéliz atölyemizdeki kadınların elinde rafya, muz yaprağı ve boncukla örülür — her seferinde tek bir çanta, hiçbiri tam olarak aynı değil.","press.label":"Paris'te, şu evlerin yanında şekillenen bir zanaat:","press.note":"YZA, Paris modasında geçen on beş yılın ardından Marrakech'e dönüşten doğan çağdaş bir Amazigh markasıdır.","social.eyebrow":"YZA giyenler","social.title":"Marrakech'ten Paris'e","social.rating":"Müşterilerimizden","social.ratingOf":"Puan","girls.shopLook":"Görünümü satın al","offer.eyebrow":"Nereden başlamalı","offer.title":"Tüm SS26, üç parçada","offer.text":"Bir charm, bir Jawhara görünümü, bir Sculpture çanta — her birinden bir tane, ve tüm sezon avucunuzun içinde.","offer.save":"Tasarruf edin","offer.bundleNote":"Hediyeye hazır kutu","pp.limited":"Sınırlı sayıda · tükendiğinde yeniden üretilmez","pp.was":"yerine","pp.crosssell":"Şununla tamamlayın","pp.reviews":"yorum","pp.bundle.title":"Kolay set","pp.bundle.includes":"İçeriği","pp.bundle.total":"Set toplamı","pp.bundle.add":"Seti ekle","pp.bundle.added":"Set eklendi","conv.maps.label":"Mağazaya gel","conv.maps.bubble":"Mağaza navigasyonu - Marrakech","conv.chat.label":"Soru","conv.chat.title":"Bir parça hakkında sorunuz mu var?","conv.chat.text":"Sorunuzu sorun. Siparişinizde -10 % kazanmak için adınızı ve WhatsApp numaranızı bırakın.","conv.chat.question":"Soru","conv.chat.questionPh":"Beden, renk, stok durumu, hediye...","conv.chat.name":"Ad soyad","conv.chat.phone":"WhatsApp","conv.chat.prepare":"WhatsApp'ı hazırla","conv.chat.send":"YZA10 koduyla WhatsApp'ı aç","conv.chat.ready":"Mesaj hazır. Göndermek ve kodunuzu almak için WhatsApp'ı açın.","promo.exit.kicker":"Gitmeden önce","promo.exit.title":"Siparişinizde -20 %","promo.exit.text":"YZA20 koduyla sepetinizi WhatsApp üzerinden kurtarın. 150 EUR / yaklaşık 1.500 DH ve üzeri geçerlidir.","promo.exit.cta":"WhatsApp'ta kurtar","promo.exit.close":"Teklif olmadan devam et","home.cats.eyebrow":"Keşfet","home.cats.title":"Marrakech'i taşımanın dört yolu","cat.charms":"Rafya charm'lar","cat.charms.txt":"Çantanıza iliştirilecek meyveler.","cat.rtw":"Jawhara hazır giyim","cat.rtw.txt":"Uyumlu üstler, pareolar ve pantolonlar.","cat.bags":"Sepetler & çantalar","cat.bags.txt":"Elle örülmüş ve tığ işi.","cat.accessories":"Takı","cat.accessories.txt":"Elle tığ işi küpeler, kolyeler ve meyve parçaları.","cat.bespoke":"Özel tasarım","cat.bespoke.txt":"Atölyenin heykelimsi çantaları.","home.best.eyebrow":"En sevilenler","home.best.title":"Gözdeler","home.story.eyebrow":"Atölye","home.story.title":"Daha çok el,\ndaha az makine.","home.story.text":"Her parça, Marrakech'teki atölyemizin kadınları tarafından rafyadan tığla örülür. Meyve başına iki ila altı saat emek ve sonunda kazınmış altın bir etiket.","trust.title":"YZA hizmetleri","trust.handmade.t":"Yalnızca Faslı kadınların elinden","trust.handmade.x":"Her charm bir üretim hattından değil, usta ellerden geçer.","trust.women.t":"Daha çok el, daha az makine","trust.women.x":"Eller makinelerden daha yavaştır. Mesele de bu — ve bunu hissedebilirsiniz.","trust.unique.t":"Daha az israf, daha çok anlam","trust.unique.x":"Küçük seriler, özenle işlenmiş rafya, kalıcı olması için tasarlanmış parçalar.","trust.secure.t":"Sevilmek ve paylaşılmak için yapıldı","trust.secure.x":"Marrakech'ten Paris'e yolculuk eden meyveler, sepetler ve hediyeler.","home.journal.eyebrow":"Günlük","home.journal.title":"Marrakech, hikayeler & zanaat","news.title":"YZA'ya katılın","news.text":"Yeni parçalar, yeniden stoklar ve atölyeden bir not — ayda bir kez, asla daha fazla.","news.ph":"E-posta adresiniz","news.btn":"Abone ol","news.ok":"Teşekkürler ✓ Yakında görüşmek üzere.","footer.tagline":"Marrakech'te elde örülen tığ işi rafya çantalar ve charm'lar.","footer.shop":"Mağaza","footer.help":"Yardım","footer.house":"Marka","footer.rights":"Tüm hakları saklıdır.","footer.legal":"Yasal bildirim · Gizlilik","cart.title":"Sepetiniz","cart.empty":"Sepetiniz boş.","cart.emptyCta":"Charm'ları keşfedin","cart.subtotal":"Ara toplam","cart.checkout":"Siparişi tamamla","cart.note":"Güvenli ödeme · 30 günlük garanti · atölyede ömür boyu onarım.","cart.remove":"Çıkar","cart.thanks":"Teşekkürler ✓ Demo: sipariş burada onaylanırdı.","pp.add":"Sepete ekle","pp.finish":"Finiş","pp.finish.loop":"Rafya halka","pp.finish.r2":"Altın halka 2 cm","pp.finish.r3":"Altın halka 3 cm","pp.size":"Beden","pp.color":"Renk","pp.qty":"Adet","pp.acc.details":"Detaylar","pp.acc.making":"Nasıl yapılır","pp.acc.ship":"Teslimat, iade & onarım","pp.acc.care":"Bakım","pp.making.txt":"Marrakech, Guéliz'deki tamamı kadınlardan oluşan atölyemizde rafyadan elle tığla örülür. Kazınmış YZA altın etiketiyle tamamlanır.","pp.ship.txt":"1.500 DH ve üzeri Fas içi ücretsiz teslimat. Marrakech'ten takip edilebilir gönderim. Giyilmemiş parçalarda 30 günlük garanti ve atölyede ömür boyu ücretsiz onarım.","pp.care.txt":"Nemden uzak tutun. Elle nazikçe tozunu alın. Rafya zamanla güzel bir patina kazanır.","pp.size.label":"Ölçüler","pp.hours":"emek","pp.related":"Bunları da beğenebilirsiniz","pp.bespokeNote":"Özel tasarım parça — siparişe özel üretilir.","col.all":"Tüm mağaza","col.charms":"Rafya charm'lar","col.earrings":"Meyve küpeler","col.necklaces":"Meyve kolyeler","col.accessories":"Takı","col.rtw":"Hazır giyim","col.tops":"Jawhara üstler","col.pareos":"Jawhara pareolar","col.pants":"Jawhara pantolonlar","col.bottoms":"Jawhara altlar","col.bags":"Sepetler & çantalar","col.filterCat":"Kategori","col.sort":"Sırala","col.sort.feat":"Öne çıkanlar","col.sort.asc":"Fiyat: artan","col.sort.desc":"Fiyat: azalan","col.results":"parça","badge.bestseller":"Gözde","badge.new":"Yeni","badge.limited":"Sınırlı sayıda","badge.bespoke":"Özel tasarım","breadcrumb.home":"Ana sayfa","from":"Başlangıç fiyatı","lang.label":"Dil","pp.colors":"Mevcut renkler","pp.availableSizes":"Mevcut bedenler","pp.edition":"Edisyon","pp.material":"Malzeme","pp.fabric":"Kumaş","contact.resellers.title":"Bayiler / B2B","contact.resellers.text":"Serilerimiz kısa, Guéliz'de elle düğümlenir — bu yüzden seçtiğimiz birkaç butikle çalışırız. Bize yazın: uygunluğu, renkleri, teslim sürelerini ve gerisini birlikte konuşuruz.","contact.resellers.cta":"B2B kataloğunu iste"},"ar":{"announce":"ضمان 30 يوماً · إصلاحات مدى الحياة في الأتيليه","meta.shipping":"توصيل مجاني داخل المغرب ابتداءً من 1.500 درهم","meta.sale":"Fruit Market — اكتشفي تمائم Charms الجديدة","nav.charms":"التمائم Charms","nav.rtw":"الجاهز للارتداء","nav.bags":"السلال والحقائب","nav.accessories":"مجوهرات","nav.girls":"YZA Girls","nav.bespoke":"التفصيل حسب الطلب","nav.story":"حكايتنا","nav.b2b":"Stockists","nav.lookbook":"Lookbook SS26/27","nav.journal":"اليوميات","nav.archive":"الأرشيف","nav.faq":"الأسئلة الشائعة","nav.contact":"اتصلي بنا","nav.more":"المزيد","a.search":"البحث","a.wishlist":"المفضّلة","a.cart":"السلة","a.menu":"فتح القائمة","a.close":"إغلاق","cta.discover":"اكتشفي","cta.shop":"تصفّحي المجموعة","cta.shopCharms":"تصفّحي التمائم","cta.shopSculpture":"اكتشفي La Sculpture","cta.discoverAtelier":"زوري الأتيليه","card.quickview":"نظرة سريعة","carousel.prev":"السابق","carousel.next":"التالي","charm.style.eyebrow":"Le Fruit Market","charm.style.title":"كيف تنسّقين تمائمك","charm.style.text":"علّقي ثمارك المنسوجة من الرافيا على أي حقيبة — سلة جلدية، حقيبة يد بقصّة محكمة، أو حقيبة كتف مبطّنة. مشبك واحد، لمسة لون، وتغدو القطعة لكِ وحدك.","charm.style.cap1":"على سلة جلدية","charm.style.cap2":"على حقيبة سوداء بقصّة محكمة","charm.style.cap3":"على حقيبة كتف مبطّنة","charm.style.videoCap":"تميمة البرتقال، في حركتها","print.eyebrow":"عن النقشة","print.title":"Le Marché aux Fruits","print.body":"رُسمت بأيدٍ ماهرة في أتيليهنا بحي Guéliz، تخطّ قماشتنا بخطٍّ بلون التراكوتا حمضيات السوق ورمّانه وتينه، نخيله، أقواس الرياض، والمرأة الحاملة سلّتها من الرافيا. يحفظ كل خطٍّ ذاكرة الأيدي التي عقدته — رسالة حبٍّ إلى Marrakech، إلى ضوئها، إلى سوقها.","print.caption":"كرز، بطّيخ، ليمون — مصنوعة يدويًا بالكروشيه.","world.charms.eye":"التمائم","world.charms.title":"ثمار الرافيا","world.bags.eye":"السلال","world.bags.title":"La Sculpture","world.rtw.eye":"الجاهز للارتداء","world.rtw.title":"Jawhara","marquee.marrakech":"كل شيء أجمل في Marrakech","band.craft.eye":"الحرفة","band.craft.title":"التفاصيل التي\nتصنع الفارق.","band.craft.text":"من ساعتين إلى ست ساعات عملٍ لكل ثمرة، معقودة يدوياً من الرافيا بأنامل نساء الأتيليه.","band.closing.eye":"Fruit Market","band.closing.title":"الصيف يُرتدى من الرافيا","cta.add":"أضيفي إلى السلة","cta.added":"أُضيفت ✓","cta.viewAll":"عرض الكل","cta.more":"عرض المزيد","cta.learn":"اعرفي المزيد","cta.read":"اقرئي","hero.eyebrow":"YZA","hero.title":"La Sculpture","hero.subheading":"أيقونة Marrakech الجديدة","hero.text":"تُنسج يدوياً من الرافيا وورق الموز والخرز بأنامل نساء أتيليهنا في Guéliz — حقيبةٌ واحدة في كل مرة، لا تتشابه اثنتان تماماً.","press.label":"حرفةٌ صُقلت في باريس، إلى جانب","press.note":"YZA، دار أمازيغية معاصرة وُلدت من عودة إلى Marrakech بعد خمسة عشر عاماً في عالم الموضة بباريس.","social.eyebrow":"هنّ يرتدين YZA","social.title":"من Marrakech إلى باريس","social.rating":"آراء عميلاتنا","social.ratingOf":"التقييم","girls.shopLook":"تسوّقي الإطلالة","offer.eyebrow":"من أين تبدئين","offer.title":"مجموعة SS26 كاملةً، في ثلاث قطع","offer.text":"تميمة، وإطلالة Jawhara، وحقيبة Sculpture — واحدة من كلٍّ، فيغدو الموسم كله بين يديك.","offer.save":"وفّري","offer.bundleNote":"علبة جاهزة للإهداء","pp.limited":"إصدار محدود · لا يُعاد صنعه بعد نفاده","pp.was":"بدلاً من","pp.crosssell":"أكمليها بـ","pp.reviews":"رأي","pp.bundle.title":"باقة سهلة","pp.bundle.includes":"تتضمّن","pp.bundle.total":"إجمالي الباقة","pp.bundle.add":"أضيفي الباقة","pp.bundle.added":"أُضيفت الباقة","conv.maps.label":"زيارة المتجر","conv.maps.bubble":"الوصول إلى المتجر - Marrakech","conv.chat.label":"سؤال","conv.chat.title":"سؤال عن قطعة معيّنة؟","conv.chat.text":"اطرحي سؤالك. اتركي اسمك ورقم WhatsApp لتحصلي على خصم -10% على طلبك.","conv.chat.question":"السؤال","conv.chat.questionPh":"المقاس، اللون، التوفّر، الإهداء...","conv.chat.name":"الاسم الكامل","conv.chat.phone":"WhatsApp","conv.chat.prepare":"تجهيز WhatsApp","conv.chat.send":"افتحي WhatsApp بالرمز YZA10","conv.chat.ready":"الرسالة جاهزة. افتحي WhatsApp لإرسالها واستلام رمزك.","promo.exit.kicker":"قبل أن تغادري","promo.exit.title":"خصم -20% على طلبك","promo.exit.text":"استعيدي سلتك عبر WhatsApp بالرمز YZA20. صالح ابتداءً من 150 يورو / نحو 1.500 درهم.","promo.exit.cta":"استعيديها عبر WhatsApp","promo.exit.close":"المتابعة دون العرض","home.cats.eyebrow":"استكشفي","home.cats.title":"أربع طرق لتحملي Marrakech معك","cat.charms":"تمائم الرافيا","cat.charms.txt":"ثمارٌ تُعلّق على حقيبتك.","cat.rtw":"الجاهز للارتداء Jawhara","cat.rtw.txt":"بلوزات وأرواب وسراويل متناسقة.","cat.bags":"السلال والحقائب","cat.bags.txt":"منسوجة ومحبوكة يدوياً.","cat.accessories":"مجوهرات","cat.accessories.txt":"أقراط وعقود وقطع فاكهة محبوكة يدوياً.","cat.bespoke":"التفصيل حسب الطلب","cat.bespoke.txt":"حقائب الأتيليه المنحوتة.","home.best.eyebrow":"الأكثر حبّاً","home.best.title":"قطع تأسر القلب","home.story.eyebrow":"الأتيليه","home.story.title":"أيادٍ أكثر،\nآلات أقل.","home.story.text":"تُحبك كل قطعة من الرافيا بأنامل نساء أتيليهنا في Marrakech. من ساعتين إلى ست ساعات عملٍ لكل ثمرة، وفي الختام بطاقة ذهبية منقوشة.","trust.title":"خدمات YZA","trust.handmade.t":"من صنع نساء مغربيات حصراً","trust.handmade.x":"تمرّ كل تميمة بأيدٍ خبيرة، لا بخطّ إنتاج.","trust.women.t":"أيادٍ أكثر، آلات أقل","trust.women.x":"الأيدي أبطأ من الآلات. وهذا هو المقصد — وستشعرين به.","trust.unique.t":"هدرٌ أقل، ومعنىً أعمق.","trust.unique.x":"دفعات صغيرة، رافيا تُعالَج بعناية، وقطع صُنعت لتدوم.","trust.secure.t":"صُنعت لتُحَبّ وتُشارَك","trust.secure.x":"ثمارٌ وسلالٌ وهدايا تسافر من Marrakech إلى باريس.","home.journal.eyebrow":"اليوميات","home.journal.title":"Marrakech، حكايات وحرفة","news.title":"انضمّي إلى YZA","news.text":"قطع جديدة، وإعادة توفّر، وكلمة من الأتيليه — مرة واحدة في الشهر، لا أكثر.","news.ph":"بريدك الإلكتروني","news.btn":"اشتركي","news.ok":"شكراً لكِ ✓ إلى اللقاء قريباً.","footer.tagline":"حقائب وتمائم محبوكة من الرافيا، صُنعت يدوياً في Marrakech.","footer.shop":"المتجر","footer.help":"المساعدة","footer.house":"الدار","footer.rights":"جميع الحقوق محفوظة.","footer.legal":"الإشعارات القانونية · الخصوصية","cart.title":"سلتك","cart.empty":"سلتك فارغة.","cart.emptyCta":"اكتشفي التمائم","cart.subtotal":"المجموع الفرعي","cart.checkout":"إتمام الطلب","cart.note":"دفع آمن · ضمان 30 يوماً · إصلاحات مدى الحياة في الأتيليه.","cart.remove":"إزالة","cart.thanks":"شكراً لكِ ✓ عرض توضيحي: هنا يتم إتمام الطلب.","pp.add":"أضيفي إلى السلة","pp.finish":"التشطيب","pp.finish.loop":"حلقة رافيا","pp.finish.r2":"حلقة ذهبية 2 سم","pp.finish.r3":"حلقة ذهبية 3 سم","pp.size":"المقاس","pp.color":"اللون","pp.qty":"الكمية","pp.acc.details":"التفاصيل","pp.acc.making":"طريقة الصنع","pp.acc.ship":"التوصيل والإرجاع والإصلاحات","pp.acc.care":"العناية","pp.making.txt":"محبوكة يدوياً من الرافيا في أتيليهنا النسائي بالكامل في Guéliz، Marrakech. تُختم ببطاقة ذهبية منقوشة بشعار YZA.","pp.ship.txt":"توصيل مجاني داخل المغرب ابتداءً من 1.500 درهم. شحن مع تتبّع من Marrakech. ضمان 30 يوماً على القطع غير المستعملة، وإصلاحات مجانية مدى الحياة في الأتيليه.","pp.care.txt":"احفظيها بعيداً عن الرطوبة. أزيلي الغبار برفقٍ باليد. يكتسب الرافيا مع الوقت لمعةً عتيقة أخّاذة.","pp.size.label":"الأبعاد","pp.hours":"من العمل","pp.related":"قد يعجبك أيضاً","pp.bespokeNote":"قطعة مُفصّلة حسب الطلب — تُصنع عند الطلب.","col.all":"المتجر بأكمله","col.charms":"تمائم الرافيا","col.earrings":"أقراط الفاكهة","col.necklaces":"عقود الفاكهة","col.accessories":"مجوهرات","col.rtw":"الجاهز للارتداء","col.tops":"بلوزات Jawhara","col.pareos":"أرواب Jawhara","col.pants":"سراويل Jawhara","col.bottoms":"قطع سفلية Jawhara","col.bags":"السلال والحقائب","col.filterCat":"الفئة","col.sort":"ترتيب","col.sort.feat":"المميّزة","col.sort.asc":"السعر: من الأقل إلى الأعلى","col.sort.desc":"السعر: من الأعلى إلى الأقل","col.results":"قطعة","badge.bestseller":"الأكثر مبيعاً","badge.new":"جديد","badge.limited":"إصدار محدود","badge.bespoke":"حسب الطلب","breadcrumb.home":"الرئيسية","from":"ابتداءً من","lang.label":"اللغة","pp.colors":"الألوان المتوفّرة","pp.availableSizes":"المقاسات المتوفّرة","pp.edition":"الإصدار","pp.material":"الخامة","pp.fabric":"القماش","contact.resellers.title":"الموزّعون / B2B","contact.resellers.text":"إنتاجنا محدود، معقود يدوياً في Guéliz — لذلك نعمل مع قلّة من البوتيكات المختارة. راسلونا: نتحدّث معاً عن التوفّر والألوان ومُدد التسليم وما بعدها.","contact.resellers.cta":"اطلبي كتالوج B2B"}};
Object.keys(I18N_NATIVE_OVERRIDES).forEach(function (lang) {
  var m = I18N_NATIVE_OVERRIDES[lang];
  Object.keys(m).forEach(function (k) { if (STR[k] && m[k]) STR[k][lang] = m[k]; });
});

const i18n = {
  lang: 'fr',
  _cbs: [],
  detect() {
    // ?lang= wins (shareable, crawlable), then the saved choice, then the browser.
    try {
      const urlLang = new URLSearchParams(location.search).get('lang');
      if (LANGS.includes(urlLang)) return urlLang;
    } catch (e) {}
    const saved = localStorage.getItem('yza.lang');
    if (LANGS.includes(saved)) return saved;
    const prefs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'fr'])
      .map((lang) => String(lang || '').toLowerCase());
    for (const nav of prefs) {
      if (nav.startsWith('fr')) return 'fr';
      if (nav.startsWith('en')) return 'en';
      if (nav.startsWith('es')) return 'es';
      if (nav.startsWith('tr')) return 'tr';
      if (nav.startsWith('ar')) return 'ar';
    }
    return 'fr';
  },
  t(key) {
    const x = EXTRA[key];
    if (x && x[this.lang]) return x[this.lang];
    const e = STR[key];
    return e ? (e[this.lang] ?? e.en ?? e.fr) : key;
  },
  pick(obj) { return obj ? (obj[this.lang] ?? obj.en ?? obj.fr) : ''; },
  formatPrice(cents) {
    // Prices are stored as whole-DH premium values; show them as-is (no extra rounding).
    const v = Math.round((Number(cents) || 0) / 100);
    const loc = LOCALES[this.lang] || 'fr-MA';
    // Force Latin digits everywhere (avoid Arabic-Indic numerals next to Latin prices on the rest of the page).
    const num = new Intl.NumberFormat(loc, { minimumFractionDigits: 0, maximumFractionDigits: 0, numberingSystem: 'latn' }).format(v);
    const unit = this.lang === 'ar' ? 'درهم' : 'DH';
    return `${num} ${unit}`;
  },
  onChange(cb) { this._cbs.push(cb); },
  setLang(l) {
    if (!LANGS.includes(l)) return;
    const previous = this.lang;
    this.lang = l;
    localStorage.setItem('yza.lang', l);
    // Keep ?lang= in the URL so the choice is shareable and crawlable.
    try {
      const url = new URL(location.href);
      if (l === 'fr') url.searchParams.delete('lang'); else url.searchParams.set('lang', l);
      history.replaceState(null, '', url);
    } catch (e) {}
    this.apply();
    if (previous !== l) YZA.analytics?.track('language_switch', { from: previous, to: l });
    this._cbs.forEach(cb => { try { cb(l); } catch (e) {} });
  },
  apply(root = document) {
    document.documentElement.lang = this.lang;
    document.documentElement.dir = this.lang === 'ar' ? 'rtl' : 'ltr';
    this.applyHead();
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const txt = this.t(el.getAttribute('data-i18n'));
      // gère les retours à la ligne dans certains titres
      if (txt.includes('\n')) { el.innerHTML = txt.split('\n').map(s => s.replace(/</g, '&lt;')).join('<br>'); }
      else el.textContent = txt;
    });
    root.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.getAttribute('data-i18n-attr').split(';').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (attr && key) el.setAttribute(attr, this.t(key));
      });
    });
    // blocs longs : afficher la langue active, sinon EN/FR en fallback
    const groups = new Map();
    root.querySelectorAll('[data-lang]').forEach(el => {
      const key = el.parentElement || el;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    });
    groups.forEach(items => {
      let visible = items.filter(el => el.getAttribute('data-lang') === this.lang);
      if (!visible.length) visible = items.filter(el => el.getAttribute('data-lang') === 'en');
      if (!visible.length) visible = items.filter(el => el.getAttribute('data-lang') === 'fr');
      items.forEach(el => { el.hidden = !visible.includes(el); });
    });
    // boutons de bascule
    root.querySelectorAll('[data-lang-btn]').forEach(b => {
      const active = b.getAttribute('data-lang-btn') === this.lang;
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
      b.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    root.querySelectorAll('[data-lang-select]').forEach(sel => {
      sel.value = this.lang;
    });
    root.querySelectorAll('[data-lang-flag]').forEach(el => {
      el.innerHTML = LANG_FLAGS[this.lang] || LANG_FLAGS.fr;
    });
    root.querySelectorAll('[data-lang-current]').forEach(el => {
      el.textContent = LANG_LABELS[this.lang] || LANG_LABELS.fr;
    });
  },
  // Localise <title>/description/OG per page, and keep canonical + hreflang in sync with ?lang=.
  applyHead() {
    try {
      const page = (document.body && document.body.dataset && document.body.dataset.page) || 'home';
      const val = (k) => { const v = this.t(k); return v && v !== k ? v : ''; };
      const setMeta = (sel, content) => { if (!content) return; const el = document.querySelector(sel); if (el) el.setAttribute('content', content); };
      const title = val('meta.' + page + '.title');
      const desc = val('meta.' + page + '.desc');
      if (title) { document.title = title; setMeta('meta[property="og:title"]', title); }
      if (desc) { setMeta('meta[name="description"]', desc); setMeta('meta[property="og:description"]', desc); }
      // Build a per-language URL that keeps existing params (?cat=, ?handle=); fr is the clean default.
      const urlFor = (l) => {
        const p = new URLSearchParams(location.search);
        if (l && l !== 'fr') p.set('lang', l); else p.delete('lang');
        const qs = p.toString();
        return location.origin + location.pathname + (qs ? '?' + qs : '');
      };
      const canon = document.querySelector('link[rel="canonical"]');
      if (canon) canon.setAttribute('href', urlFor(this.lang));
      document.querySelectorAll('link[data-hreflang]').forEach((n) => n.remove());
      const frag = document.createDocumentFragment();
      const addAlt = (hl, href) => {
        const link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', hl);
        link.setAttribute('href', href);
        link.setAttribute('data-hreflang', '');
        frag.appendChild(link);
      };
      LANGS.forEach((l) => addAlt(l, urlFor(l)));
      addAlt('x-default', urlFor('fr'));
      (document.head || document.documentElement).appendChild(frag);
    } catch (e) {}
  },
  init() {
    this.lang = this.detect();
    this.apply();
    document.querySelectorAll('[data-lang-btn]').forEach(b => {
      b.addEventListener('click', () => this.setLang(b.getAttribute('data-lang-btn')));
    });
    document.querySelectorAll('[data-lang-select]').forEach(sel => {
      sel.addEventListener('change', () => this.setLang(sel.value));
    });
  },
};

YZA.i18n = i18n;
