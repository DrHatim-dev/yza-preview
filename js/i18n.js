/* ============================================================
 YZA - i18n (FR/EN)
 Détection auto via la langue du navigateur, bascule manuelle
 persistée en localStorage, application via [data-i18n].
 ============================================================ */
window.YZA = window.YZA || {};

const STR = {
 /* - Annonce / header / nav - */
 "announce": { fr: "Garantie 30 jours · Réparations à vie à l’atelier", en: "30-day guarantee · Lifetime atelier repairs" },
 'announce.editions': { fr: 'Éditions limitées · jamais refaites', en: 'Limited editions · never remade', es: 'Ediciones limitadas · nunca reproducidas', tr: 'Sınırlı sayı · asla yeniden üretilmez', ar: 'إصدارات محدودة · لا تُصنع من جديد' },
 'hero.editions': { fr: 'Éditions limitées - une fois parties, elles ne reviennent pas', en: 'Limited editions - once they’re gone, they’re gone' },
 'meta.shipping': { fr: 'Livraison Maroc offerte dès 500 DH', en: 'Free Morocco delivery from 500 DH' },
 'meta.sale': { fr: 'Fruit Market - nos fruits en raphia', en: 'Fruit Market - our raffia fruits' },
 'nav.charms': { fr: 'Charms', en: 'Charms' },
 'nav.rtw': { fr: 'Prêt-à-porter', en: 'Ready-to-wear' },
 'nav.bags': { fr: 'Paniers & Sacs', en: 'Baskets & Bags' },
 'nav.accessories': { fr: 'Accessoires', en: 'Accessories' },
 'nav.girls': { fr: 'YZA Girls', en: 'YZA Girls' },
 'nav.bespoke': { fr: 'Sur-mesure', en: 'Bespoke' },
 'nav.story': { fr: 'Notre histoire', en: 'Our story' },
 'nav.b2b': { fr: 'B2B', en: 'B2B' },
 'nav.lookbook': { fr: 'Lookbook SS26/27', en: 'Lookbook SS26/27' },
 'nav.journal': { fr: 'Journal', en: 'Journal' },
 'nav.archive': { fr: 'Archives', en: 'Archive' },
 'nav.faq': { fr: 'FAQ', en: 'FAQ' },
 'nav.contact': { fr: 'Contact', en: 'Contact' },
 'nav.more': { fr: 'Plus', en: 'More' },
 'nav.studio': { fr: 'Le Studio', en: 'The Studio' },
 'nav.fruitmarket': { fr: 'Le Fruit Market', en: 'The Fruit Market' },
 'nav.sculpture': { fr: 'La Sculpture', en: 'La Sculpture' },
 'mega.cat': { fr: 'Par catégorie', en: 'By category' },
 'mega.explore': { fr: 'À explorer', en: 'Explore' },
 'mega.brand': { fr: 'La marque', en: 'The brand' },
 'mega.editorial': { fr: 'Éditorial', en: 'Editorial' },
 'mega.service': { fr: 'Service client', en: 'Customer care' },
 'mega.feat.lookbook': { fr: 'Collection SS26/27', en: 'SS26/27 collection' },
 'mega.feat.sculpture': { fr: 'Le it-bag de l’atelier', en: 'The atelier it-bag' },
 'mega.feat.studio': { fr: '66 Rue Yougoslavie, Guéliz', en: '66 Rue Yougoslavie, Guéliz' },
 'mega.feat.contact': { fr: 'On vous répond, vraiment', en: 'We actually reply' },
 'a.search': { fr: 'Rechercher', en: 'Search' },
 'a.wishlist': { fr: 'Mes coups de cœur', en: 'Saved' },
 'a.cart': { fr: 'Panier', en: 'Cart' },
 'a.menu': { fr: 'Ouvrir le menu', en: 'Open menu' },
 'a.close': { fr: 'Fermer', en: 'Close' },

 /* - CTA communs - */
 'cta.discover': { fr: 'Découvrir', en: 'Discover' },
 'cta.shop': { fr: 'Parcourir la collection', en: 'Browse the collection' },
 'cta.shopCharms': { fr: 'Voir nos fruits en raphia', en: 'See our raffia fruits' },
 'cta.shopSculpture': { fr: 'Découvrir La Sculpture', en: 'Discover La Sculpture' },
 'cta.discoverAtelier': { fr: 'Pousser la porte de l’atelier', en: 'Step inside the atelier' },
 'card.quickview': { fr: 'Aperçu', en: 'Quick view', es: 'Vista rápida', tr: 'Hızlı bakış', ar: 'عرض سريع' },
 'carousel.prev': { fr: 'Précédent', en: 'Previous' },
 'carousel.next': { fr: 'Suivant', en: 'Next' },
 'charm.style.eyebrow': { fr: 'Le Fruit Market', en: 'The Fruit Market' },
 'charm.style.title': { fr: 'Où poser vos fruits', en: 'Where to wear your fruits' },
 'charm.style.text': { fr: 'Un fruit en raphia s’accroche au quotidien YZA - près d’un panier tressé, sur la table de l’atelier, dans une composition Fruit Market. Un clip, une couleur qui chante, et la pièce devient la vôtre.', en: 'A raffia fruit slips into the YZA everyday - beside a woven basket, on the atelier table, in a Fruit Market composition. One clasp, one colour that sings, and the piece becomes yours.' },
 'charm.style.cap1': { fr: 'Avec un panier tressé', en: 'Beside a woven basket' },
 'charm.style.cap2': { fr: 'Sur la table de l’atelier', en: 'On the atelier table' },
 'charm.style.cap3': { fr: 'En composition Fruit Market', en: 'In a Fruit Market composition' },
 'charm.style.videoCap': { fr: 'L’orange, qui se balance', en: 'The orange, swinging' },
 'print.eyebrow': { fr: 'L’art du raphia', en: 'The art of raffia' },
 'print.title': { fr: 'Le Marché aux Fruits', en: 'The Fruit Market' },
 'print.body': { fr: 'Pas d’imprimé, pas de machine : chaque fruit est crocheté à la main, un fil de raphia à la fois. Une technique lente et exigeante, que peu de mains maîtrisent encore. La couleur, le relief, la rondeur - tout naît du geste, ici, à Guéliz. Notre façon d’emporter le marché de Marrakech, ses agrumes, ses grenades et ses figues, au creux de la main.', en: 'No print, no machine: every fruit is crocheted by hand, one strand of raffia at a time. A slow, exacting technique that few hands still master. The colour, the texture, the curve - all of it comes from the gesture, here in Guéliz. Our way of carrying the Marrakech market - citrus, pomegranates, figs - in the palm of your hand.' },
 'print.caption': { fr: 'Cerise, pastèque, citron - crochetés à la main.', en: 'Cherry, watermelon, lemon - crocheted by hand.' },
 'cta.discover': { fr: 'Découvrir', en: 'Explore' },
 'world.charms.eye': { fr: 'Charms', en: 'Charms' },
 'world.charms.title': { fr: 'Fruits crochetés en raphia', en: 'Crocheted raffia fruits' },
 'world.bags.eye': { fr: 'Paniers', en: 'Baskets' },
 'world.bags.title': { fr: 'La Sculpture', en: 'La Sculpture' },
 'world.rtw.eye': { fr: 'Prêt-à-porter', en: 'Ready-to-wear' },
 'world.rtw.title': { fr: 'Jawhara', en: 'Jawhara' },
 'marquee.marrakech': { fr: 'C’est mieux à Marrakech', en: 'It’s better in Marrakech' },
 'band.craft.eye': { fr: 'Le savoir-faire', en: 'The craft' },
 'band.craft.title': { fr: 'Tout commence à Guéliz, Marrakech', en: 'It all begins in Guéliz, Marrakech' },
 'band.craft.text': { fr: 'De 2 à 70 h de travail manuel : toutes nos pièces sont réalisées par les artisanes de l’atelier YZA.', en: 'From 2 to 70 hours of handwork: every piece is made by the women artisans of the YZA atelier.' },
 'band.closing.eye': { fr: 'Fruit Market', en: 'Fruit Market' },
 'band.closing.title': { fr: 'L’été se porte en raphia', en: 'Summer, worn in raffia' },
 'cta.add': { fr: 'Ajouter au panier', en: 'Add to cart' },
 'cta.added': { fr: 'Ajouté ✓', en: 'Added ✓' },
 'cta.viewAll': { fr: 'Tout voir', en: 'View all' },
 'cta.more': { fr: 'Voir plus', en: 'View more' },
 'cta.learn': { fr: 'Comprendre comment', en: 'See how it’s made' },
 'cta.read': { fr: 'Lire', en: 'Read' },

 /* - Hero accueil - */
 'hero.eyebrow': { fr: 'YZA', en: 'YZA' },
 'hero.title': { fr: 'La Sculpture', en: 'La Sculpture' },
 'hero.subheading': { fr: 'Tissé à la main à Guéliz, Marrakech. Jamais deux fois pareil.', en: 'Hand-woven in Guéliz, Marrakech. Never the same twice.' },
 'hero.text': { fr: 'Raphia, feuille de bananier, perles. Tressée main par les femmes de l’atelier, à Guéliz, Marrakech - un sac à la fois, et jamais deux fois le même.', en: 'Raffia, banana leaf, beads. Hand-woven by the women of the atelier in Guéliz, Marrakech - one bag at a time, and never the same one twice.' },

 /* - Bande d'autorité (presse / pedigree fondatrice) - */
 'press.label': { fr: 'Après 15 ans à Paris dans la mode, Nawal fonde la marque YZA à Marrakech.', en: 'After 15 years in Paris fashion, Nawal founded YZA in Marrakech.' },
 'press.note': { fr: 'YZA, maison amazighe d’aujourd’hui, née d’un retour à Marrakech après quinze ans passés dans la mode à Paris.', en: 'YZA, a contemporary Amazigh house, born of a return to Marrakech after fifteen years in Paris fashion.' },

 /* - Preuve sociale (témoignages) - */
 'social.eyebrow': { fr: 'Elles portent YZA', en: 'They wear YZA' },
 'social.title': { fr: 'De Marrakech à Tokyo', en: 'From Marrakech to Tokyo' },
 'social.rating': { fr: 'Ce que les YZA girls disent', en: 'What the YZA girls say' },
 'social.ratingOf': { fr: 'Note', en: 'Rating' },
 'girls.shopLook': { fr: 'Shop the look', en: 'Shop the look' },
 'girls.soldOut': { fr: 'Cette édition est partie · on ne la refait pas', en: 'This edition is gone · we don’t remake it', es: 'Agotado · nunca se reproduce', tr: 'Tükendi · asla yeniden üretilmez', ar: 'نفد · لا يُصنع من جديد' },
 'girls.shopCurrent': { fr: 'Voir ce qu’on a en ce moment', en: 'See what we have now', es: 'Ver piezas actuales', tr: 'Güncel parçalar', ar: 'تسوّق القطع الحالية' },
 'girls.scarcity.title': { fr: 'Une édition, puis on passe à autre chose', en: 'One edition, then we move on', es: 'Series agotadas, nunca reproducidas', tr: 'Tükenen seriler, asla yeniden üretilmez', ar: 'دفعات نفدت، لا تُصنع من جديد' },
 'girls.scarcity.text': { fr: 'Beaucoup de pièces portées ici…. On ne les refait pas, on aime que vous ayiez des pièces uniques.', en: 'A lot of what’s worn here…. We don’t remake it - we love that you have pieces that stay one of a kind.', es: 'Muchas de las piezas que se llevan aquí son de series ya agotadas, que nunca se reproducirán. Si te gusta una pieza actual, consíguela antes de que se agote: no encontrarás la misma otra vez.', tr: 'Burada giyilen parçaların çoğu çoktan tükenmiş serilerden - bir daha asla üretilmeyecek. Güncel bir parçayı beğendiyseniz, stok bitmeden alın: aynısını bir daha bulamazsınız.', ar: 'كثير من القطع المعروضة هنا من دفعات نفدت بالفعل ولن تُصنع من جديد. إذا أعجبتك قطعة حالية، فاحصل عليها قبل نفاد المخزون: لن تجد مثيلها مرة أخرى.' },

 /* - L'offre (bundles) - */
 'offer.eyebrow': { fr: 'Par où commencer', en: 'Where to begin' },
 'offer.title': { fr: 'YZA en trois pièces', en: 'YZA in three pieces' },
 'offer.text': { fr: 'Un panier design, un look resort et quelques fruits crochetés - vous voilà habillée pour l’été ?', en: 'A design basket, a resort look and a few crocheted fruits - and you’re dressed for summer?' },
 'offer.save': { fr: 'Économisez', en: 'Save' },
 'offer.bundleNote':{ fr: 'Dans sa boîte, prête à offrir', en: 'Boxed, ready to gift' },

 /* - Fiche produit : mise en valeur de l'offre - */
 'pp.limited': { fr: 'Édition limitée · faite main', en: 'Limited edition · made by hand' },
 'pp.was': { fr: 'au lieu de', en: 'instead of' },
 'pp.crosssell': { fr: 'À porter avec', en: 'Lovely with' },
 'pp.reviews': { fr: 'avis', en: 'reviews' },
 'pp.bundle.title': { fr: 'Le trio, ensemble', en: 'The trio, together' },
 'pp.bundle.includes': { fr: 'Vous recevez', en: 'You get' },
 'pp.bundle.total': { fr: 'Total du trio', en: 'Trio total' },
 'pp.bundle.add': { fr: 'Ajouter le trio', en: 'Add the trio' },
 'pp.bundle.added': { fr: 'Trio ajouté ✓', en: 'Trio added ✓' },

 /* - Conversion / boutique locale - */
 'conv.maps.label': { fr: 'Passez nous voir à Guéliz, Marrakech', en: 'Come see us in Guéliz, Marrakech' },
 'conv.maps.bubble': { fr: 'Boutique navigation - Marrakech', en: 'Boutique navigation - Marrakech' },
 'conv.chat.label': { fr: 'Question', en: 'Question' },
 'conv.chat.title': { fr: 'YZA Atelier', en: 'YZA Atelier' },
 'conv.chat.online': { fr: 'En ligne', en: 'Online', es: 'En línea', tr: 'Çevrimiçi', ar: 'متاحون' },
 'conv.chat.greeting': { fr: 'Bonjour, c’est l’atelier. Une question sur une pièce, une taille, une couleur ? Écrivez-nous - on répond dans la journée, une vraie personne au bout.', en: 'Hello - it’s the atelier. A question about a piece, a size, a colour? Write to us - we reply the same day, a real person at the other end.', es: '¡Hola! ¿Pregunta sobre una pieza, talla o color? Escríbanos.', tr: 'Merhaba! Bir parça, beden veya renk hakkında sorunuz mu var? Yazın.', ar: 'مرحباً! لديك سؤال عن قطعة أو مقاس أو لون؟ اكتبي لنا.' },
 'conv.chat.reply': { fr: 'Merci ! Laissez-nous votre prénom et votre WhatsApp - on revient vers vous, et le code YZA10 est pour vous.', en: 'Thank you! Leave your name and WhatsApp - we’ll come back to you, and the YZA10 code is yours.', es: '¡Gracias! Déjanos tu nombre y tu WhatsApp - te respondemos, y el código YZA10 es para ti.', tr: 'Teşekkürler! Adınızı ve WhatsApp numaranızı bırakın - size yanıt veririz, YZA10 kodu sizindir.', ar: 'شكراً! اتركي لنا اسمك ورقم واتساب - نردّ عليكِ، وكود YZA10 لكِ.' },
 'conv.chat.questionPh': { fr: 'Taille, couleur, disponibilité, cadeau...', en: 'Size, colour, availability, gift...' },
 'conv.chat.namePh': { fr: 'Votre prénom', en: 'Your name', es: 'Tu nombre', tr: 'Adınız', ar: 'اسمك' },
 'conv.chat.phonePh': { fr: 'WhatsApp (+212...)', en: 'WhatsApp (+212...)', es: 'WhatsApp (+212...)', tr: 'WhatsApp (+212...)', ar: 'واتساب (+212...)' },
 'conv.chat.sendBtn': { fr: 'Envoyer', en: 'Send', es: 'Enviar', tr: 'Gönder', ar: 'إرسال' },
 'conv.chat.send': { fr: 'Ouvrir WhatsApp avec le code YZA10', en: 'Open WhatsApp with code YZA10' },
 'promo.exit.kicker': { fr: 'Avant de filer', en: 'Before you slip off' },
 'promo.exit.title': { fr: 'Un petit -20 %, de notre part', en: 'A little 20% off, from us' },
 'promo.exit.text': { fr: 'Si une pièce vous est restée en tête, écrivez-nous sur WhatsApp avec le code YZA20 - on vous met le panier de côté, le temps qu’il faut. Dès 150 EUR / environ 1 500 DH. Sans pression, vraiment.', en: 'If a piece stayed on your mind, message us on WhatsApp with code YZA20 - we’ll set your cart aside, for as long as you need. From 150 EUR / approx. 1,500 DH. No pressure, truly.' },
 'promo.exit.cta': { fr: 'Écrire sur WhatsApp', en: 'Message us on WhatsApp' },
 'promo.exit.close': { fr: 'Une autre fois, peut-être', en: 'Maybe another time' },

 /* - Catégories accueil - */
 'home.cats.eyebrow': { fr: 'L’univers YZA', en: 'The YZA world' },
 'home.cats.title': { fr: 'Quatre façons de glisser Marrakech dans votre sac', en: 'Four ways to slip Marrakech into your bag' },
 'cat.charms': { fr: 'Charms en raphia', en: 'Raffia charms' },
 'cat.charms.txt': { fr: 'Un peu de Marrakech accroché au sac - un sac nu, c’est un peu triste.', en: 'A little Marrakech clipped to your bag - a bare bag is a bit of a sad one.' },
 'cat.rtw': { fr: 'Prêt-à-porter', en: 'Ready-to-wear' },
 'cat.rtw.txt': { fr: 'Tops, jupes paréo et pantalons qui se répondent.', en: 'Tops, sarong skirts and trousers that talk to each other.' },
 'cat.bags': { fr: 'Paniers & sacs', en: 'Baskets & bags' },
 'cat.bags.txt': { fr: 'Réalisés à la main. Le même atelier, les mêmes femmes, d’année en année. Pour des années, pas une saison.', en: 'Made by hand. Same atelier, same women, year after year. For years, not a season.' },
 'cat.accessories': { fr: 'Accessoires', en: 'Accessories' },
 'cat.accessories.txt': { fr: 'Des souvenirs de Marrakech qui ne prennent pas la poussière sur une étagère.', en: 'Marrakech souvenirs that won’t sit gathering dust on a shelf.' },
 'cat.bespoke': { fr: 'Sur-mesure', en: 'Bespoke' },
 'cat.bespoke.txt': { fr: 'La Vague, sculptée à la main et nouée rien que pour vous.', en: 'La Vague, hand-sculpted and knotted just for you.' },

 /* - Best-sellers - */
 'home.best.eyebrow': { fr: 'Les plus aimés', en: 'Most loved' },
 'home.best.title': { fr: 'Ceux qui partent en premier', en: 'The first to go' },

 /* - Bloc histoire (accueil) - */
 'home.story.eyebrow': { fr: 'L’atelier', en: 'The atelier' },
 'home.story.title': { fr: 'Fait par des femmes,\nà Guéliz, Marrakech', en: 'Made by women,\nin Guéliz, Marrakech' },
 'home.story.text': { fr: 'Chaque pièce est faite main par les artisanes de l’atelier YZA, ici à Marrakech - de 2 à 70 h de travail selon la pièce, puis une étiquette dorée, gravée à la main, pour finir.', en: 'Each piece is made by hand by the women artisans of the YZA atelier, here in Marrakech - from 2 to 70 hours of work depending on the piece, then a golden tag, hand-engraved, to finish.' },

 /* - Réassurance - */
 'trust.title': { fr: 'Quelques infos', en: 'Good to know' },
 'trust.handmade.t': { fr: 'Entreprise 100 % féminine', en: '100% women-led' },
 'trust.handmade.x': { fr: 'Chaque fruit passe entre des mains qui savent - jamais par une chaîne.', en: 'Every fruit passes through hands that know the work - never a production line.' },
 'trust.women.t': { fr: 'Explore le fait main marocain', en: 'Explore Moroccan handcraft' },
 'trust.women.x': { fr: 'Une main met plus longtemps qu’une machine. C’est précisément ce qu’on cherche - et ça se sent au toucher.', en: 'A hand takes longer than a machine. That’s exactly the point - and you can feel it under your fingers.' },
 'trust.unique.t': { fr: 'Faits pour être portés & partagés', en: 'Made to be worn & shared' },
 'trust.unique.x': { fr: 'Éditions limitées, raphia travaillé sans hâte, pièces pensées pour rester.', en: 'Limited editions, raffia worked without rushing, pieces made to stay.' },
 'trust.secure.t': { fr: 'Pensés pour vivre et voyager', en: 'Made to live & travel' },
 'trust.secure.x': { fr: 'Des fruits, des paniers, des cadeaux qui font le voyage de Marrakech à Paris.', en: 'Fruit, baskets and gifts that make the trip from Marrakech to Paris.' },

 /* - Journal (accueil) - */
 'home.journal.eyebrow': { fr: 'Journal', en: 'Journal' },
 'home.journal.title': { fr: 'Marrakech : histoires, mains, matières', en: 'Marrakech: stories, hands, materials' },

 /* - Newsletter - */
 'news.title': { fr: 'Entrer dans le cercle YZA', en: 'Join the YZA circle' },
 'news.text': { fr: 'Les nouvelles pièces, les réassorts, un mot de l’atelier - une fois par mois, pas davantage. Promis.', en: 'New pieces, restocks, a word from the atelier - once a month, no more. Promise.' },
 'news.ph': { fr: 'Votre e-mail', en: 'Your e-mail' },
 'news.btn': { fr: 'S’inscrire', en: 'Subscribe' },
 'news.ok': { fr: 'Merci ✓ On se retrouve très vite.', en: 'Thank you ✓ See you very soon.' },

 /* - Footer - */
 'footer.tagline':{ fr: 'Le vestiaire moderne de Marrakech.', en: 'Modern Marrakech Wear™.' },
 'footer.shop': { fr: 'Boutique', en: 'Shop' },
 'footer.help': { fr: 'Aide', en: 'Help' },
 'footer.house': { fr: 'La maison', en: 'The house' },
 'footer.rights': { fr: 'Tous droits réservés.', en: 'All rights reserved.' },
 'footer.legal': { fr: 'Mentions légales · Confidentialité', en: 'Legal · Privacy' },

 /* - Panier (drawer) - */
 'cart.title': { fr: 'Votre panier', en: 'Your cart' },
 'cart.empty': { fr: 'Votre panier est encore vide.', en: 'Your cart is still empty.' },
 'cart.emptyCta': { fr: 'Aller voir les fruits', en: 'Go meet the fruits' },
 'cart.subtotal': { fr: 'Sous-total', en: 'Subtotal' },
 'cart.checkout': { fr: 'Passer commande', en: 'Checkout' },
 "cart.note": { fr: "Paiement sécurisé · garantie 30 jours · réparations à vie à l’atelier.", en: "Secure payment · 30-day guarantee · lifetime atelier repairs." },
 'cart.remove': { fr: 'Retirer', en: 'Remove' },
 'cart.thanks': { fr: 'Merci ✓ Démo : la commande se validerait ici.', en: 'Thank you ✓ Demo: checkout would happen here.' },

 /* - Page produit - */
 'pp.add': { fr: 'Ajouter au panier', en: 'Add to cart' },
 'pp.finish': { fr: 'Finition', en: 'Finish' },
 'pp.finish.loop':{ fr: 'Boucle raffia', en: 'Raffia loop' },
 'pp.finish.r2': { fr: 'Boucle de 2 cm', en: 'Ring 2 cm' },
 'pp.finish.r3': { fr: 'Étiquette laiton gravée', en: 'Engraved brass tag' },
 'pp.size': { fr: 'Taille', en: 'Size' },
 'pp.color': { fr: 'Couleur', en: 'Colour' },
 'pp.qty': { fr: 'Quantité', en: 'Quantity' },
 'pp.acc.details':{ fr: 'Détails', en: 'Details' },
 "pp.acc.making": { fr: "Atelier", en: "Made at the atelier" },
 'pp.acc.ship': { fr: 'Livraison, retours & réparations', en: 'Delivery, returns & repairs' },
 'pp.acc.care': { fr: 'Entretien', en: 'Care' },
 'pp.making.txt': { fr: 'Crocheté main en raphia dans notre atelier de Guéliz, à Marrakech - tenu par des femmes, du premier nœud au dernier. Fini d’une étiquette dorée, gravée YZA.', en: 'Hand-crocheted in raffia in our Guéliz atelier in Marrakech - women-run, from the first knot to the last. Finished with a golden tag, engraved YZA.' },
 "pp.ship.txt": { fr: "Livraison Maroc offerte dès 500 DH (panier accessoires) ou 1 500 DH (sacs & prêt-à-porter), expédiée et suivie depuis Marrakech. Garantie 30 jours sur les pièces non portées. Et si le temps fait son œuvre, réparations à vie à l’atelier.", en: "Free Morocco delivery from 500 DH (accessories) or 1,500 DH (bags & ready-to-wear), shipped and tracked from Marrakech. 30-day guarantee on unworn pieces. And when time does its work, lifetime atelier repairs." },
 'pp.care.txt': { fr: 'À l’abri de l’humidité. Un coup de chiffon doux, à la main. Avec les années, le raphia prend une patine qui n’appartient qu’à vous.', en: 'Keep it from damp. A soft dust by hand now and then. Over the years, raffia takes on a patina that belongs to you alone.' },
 'pp.size.label': { fr: 'Dimensions', en: 'Dimensions' },
 'pp.hours': { fr: 'de travail', en: 'of work' },
 'pp.related': { fr: 'À marier avec', en: 'Goes well with' },
 'pp.bespokeNote':{ fr: 'Pièce sur-mesure - nouée pour vous, à la commande.', en: 'Bespoke piece - knotted for you, made to order.' },

 /* - Collections - */
 'col.all': { fr: 'Toute la collection de l’atelier', en: 'The whole atelier collection' },
 'col.charms': { fr: 'Charms en raphia', en: 'Raffia charms' },
 'col.earrings': { fr: 'Boucles fruit', en: 'Fruit earrings' },
 'col.necklaces': { fr: 'Colliers fruit', en: 'Fruit necklaces' },
 'col.accessories': { fr: 'Accessoires', en: 'Accessories' },
 'col.rtw': { fr: 'Prêt-à-porter', en: 'Ready-to-wear' },
 'col.tops': { fr: 'Tops Jawhara', en: 'Jawhara tops' },
 'col.pareos': { fr: 'Jupes paréo Jawhara', en: 'Jawhara pareo skirts' },
 'col.pants': { fr: 'Pantalons Jawhara', en: 'Jawhara pants' },
 'col.bottoms': { fr: 'Bas Jawhara', en: 'Jawhara bottoms' },
 'col.bags': { fr: 'Paniers & sacs', en: 'Baskets & bags' },
 'col.desc.all': { fr: 'Charms, prêt-à-porter Jawhara et sacs Sculpture SS26.', en: 'SS26 charms, Jawhara ready-to-wear and Sculpture bags.' },
 'col.desc.charms': { fr: 'Fruits crochetés à la main en raphia, en éditions limitées.', en: 'Hand-crocheted raffia fruits, in limited editions.' },
 'col.desc.accessories': { fr: 'Bijoux en raphia crocheté - boucles d\'oreilles et colliers.', en: 'Crocheted raffia jewellery - earrings and necklaces.' },
 'col.desc.bags': { fr: 'Paniers et sacs Sculpture, faits main en raphia et cuir.', en: 'Handmade raffia baskets and Sculpture bags.' },
 'col.desc.rtw': { fr: 'Prêt-à-porter en tissu Jawhara, cousu à Marrakech.', en: 'Jawhara fabric ready-to-wear, sewn in Marrakech.' },
 'col.filterCat': { fr: 'Catégorie', en: 'Category' },
 'col.sort': { fr: 'Trier', en: 'Sort' },
 'col.sort.feat': { fr: 'En vedette', en: 'Featured' },
 'col.sort.asc': { fr: 'Prix croissant', en: 'Price: low to high' },
 'col.sort.desc': { fr: 'Prix décroissant', en: 'Price: high to low' },
 'col.results': { fr: 'pièces', en: 'pieces' },

 /* - Badges - */
 'badge.bestseller': { fr: 'Préféré', en: 'Bestseller' },
 'badge.new': { fr: 'Nouveau', en: 'New' },
 'badge.limited': { fr: 'Édition limitée', en: 'Limited' },
 'badge.bespoke': { fr: 'Sur-mesure', en: 'Bespoke' },

 /* - Divers - */
 'breadcrumb.home': { fr: 'Accueil', en: 'Home' },
 'from': { fr: 'À partir de', en: 'From' },
 'lang.label': { fr: 'Langue', en: 'Language' },
};

const LANGS = ['fr', 'en', 'es', 'tr', 'ar'];
const LOCALES = { fr: 'fr-MA', en: 'en-MA', es: 'es-ES', tr: 'tr-TR', ar: 'ar-MA' };
const LANG_FLAGS = {
 fr: '<img aria-hidden="true" class="lang-flag" src="assets/flags/fr.svg" alt="" width="22" height="16" decoding="async">',
 en: '<img aria-hidden="true" class="lang-flag" src="assets/flags/gb.svg" alt="" width="22" height="16" decoding="async">',
 es: '<img aria-hidden="true" class="lang-flag" src="assets/flags/es.svg" alt="" width="22" height="16" decoding="async">',
 tr: '<img aria-hidden="true" class="lang-flag" src="assets/flags/tr.svg" alt="" width="22" height="16" decoding="async">',
 ar: '<img aria-hidden="true" class="lang-flag" src="assets/flags/ma.svg" alt="" width="22" height="16" decoding="async">',
};
const LANG_LABELS = { fr: 'FR', en: 'EN', es: 'ES', tr: 'TR', ar: 'AR' };

const EXTRA = {
 'announce': { es: 'Garantía 30 días · reparaciones de por vida en el atelier', tr: '30 gun garanti · atolyede omur boyu tamir', ar: 'ضمان 30 يوما · تصليحات مدى الحياة في الأتولييه' },
 'meta.shipping': { es: 'Envío gratis en Marruecos desde 1.500 DH', tr: 'Fas ici 1.500 DH uzeri ucretsiz teslimat', ar: 'توصيل مجاني في المغرب ابتداء من 1,500 درهم' },
 'meta.sale': { es: 'Fruit Market - ver charms', tr: 'Fruit Market - charm’ları keşfet', ar: 'Fruit Market - اكتشفي التعليقات' },
 'nav.charms': { es: 'Charms', tr: 'Charm’lar', ar: 'تعليقات' },
 'nav.rtw': { es: 'Prêt-à-porter', tr: 'Hazır giyim', ar: 'ملابس جاهزة' },
 'nav.bags': { es: 'Cestas y bolsos', tr: 'Sepetler ve çantalar', ar: 'سلال وحقائب' },
 'nav.accessories': { es: 'Accesorios', tr: 'Aksesuarlar', ar: 'إكسسوارات' },
 'nav.girls': { es: 'YZA Girls', tr: 'YZA Girls', ar: 'YZA Girls' },
 'nav.b2b': { es: 'B2B', tr: 'B2B', ar: 'B2B' },
 'nav.lookbook': { es: 'Lookbook SS26/27', tr: 'Lookbook SS26/27', ar: 'Lookbook SS26/27' },
 'girls.shopLook': { es: 'Shop the look', tr: 'Shop the look', ar: 'Shop the look' },
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
 'hero.subheading': { es: 'Hand-woven in Guéliz, Marrakech. Never the same twice.', tr: 'Hand-woven in Guéliz, Marrakech. Never the same twice.', ar: 'منسوج يدوياً في Guéliz, Marrakech. لا يتكرر أبداً.' },
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
 'promo.exit.text': { es: 'Escríbenos por WhatsApp con el código YZA20 y te guardamos el carrito. Desde 150 EUR / unos 1.500 DH - sin presión, solo por si acaso.', tr: 'WhatsApp’tan YZA20 koduyla yazın, sepetinizi sizin için ayıralım. 150 EUR / yaklaşık 1.500 DH üzeri - baskı yok, sadece ihtimale karşı.', ar: 'اكتبي لنا عبر واتساب برمز YZA20 وسنحتفظ لكِ بسلتك. ابتداءً من 150 يورو / نحو 1.500 درهم - دون أي ضغط، فقط تحسّباً.' },
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
 'badge.bestseller': { es: 'Favorito', tr: 'Çok satan', ar: 'الأكثر طلبا' },
 'badge.new': { es: 'Nuevo', tr: 'Yeni', ar: 'جديد' },
 'badge.limited': { es: 'Edición limitada', tr: 'Sınırlı', ar: 'إصدار محدود' },
 'nav.more': { fr: 'Plus', en: 'More', es: 'Mas', tr: 'Daha fazla', ar: 'المزيد' },
 'contact.resellers.title': { fr: 'Revendeurs / B2B', en: 'Resellers / B2B', es: 'Revendedores / B2B', tr: 'Bayiler / B2B', ar: 'الموزعون / B2B' },
 'contact.resellers.text': {
 fr: 'Nos séries sont courtes, nouées main à Guéliz, Marrakech - alors on travaille avec quelques boutiques choisies. Écrivez-nous : on parle disponibilités, couleurs, délais, et la suite ensemble.',
 en: 'Our runs are short, hand-knotted in Guéliz, Marrakech - so we work with a handful of chosen boutiques. Write to us: we’ll talk availability, colours, lead times, and the rest together.',
 es: 'Nuestras series son cortas, anudadas a mano en Guéliz, Marrakech - por eso trabajamos con unas pocas boutiques elegidas. Escríbenos: hablamos de disponibilidad, colores, plazos y lo demás, juntas.',
 tr: 'Serilerimiz kısa, Guéliz, Marrakech\"te elle düğümlenir - bu yüzden seçtiğimiz birkaç butikle çalışırız. Bize yazın: uygunluğu, renkleri, teslim sürelerini ve gerisini birlikte konuşuruz.',
 ar: 'إنتاجنا محدود، معقود يدوياً في Guéliz, Marrakech - لذلك نعمل مع قلّة من البوتيكات المختارة. راسلونا: نتحدّث معاً عن التوفّر والألوان ومُدد التسليم وما بعدها.',
 },
 'contact.resellers.cta': { fr: 'Demander le catalogue B2B', en: 'Request B2B catalogue', es: 'Pedir catálogo B2B', tr: 'B2B kataloğu iste', ar: 'طلب كتالوج B2B' },
};


/* --- native es/tr/ar translations merged from audit (auto) --- */
const I18N_NATIVE_OVERRIDES = {"es":{"announce":"Garantía de 30 días · Reparaciones de por vida en el atelier","meta.shipping":"Envío gratis a Marruecos desde 1.500 DH","meta.sale":"Fruit Market - descubre los charms","nav.charms":"Charms","nav.rtw":"Prêt-à-porter","nav.bags":"Cestas y bolsos","nav.accessories":"Accesorios","nav.girls":"YZA Girls","nav.bespoke":"A medida","nav.story":"Nuestra historia","nav.b2b":"B2B","nav.lookbook":"Lookbook SS26/27","nav.journal":"Journal","nav.archive":"Archivo","nav.faq":"FAQ","nav.contact":"Contacto","nav.more":"Más","a.search":"Buscar","a.wishlist":"Favoritos","a.cart":"Cesta","a.menu":"Abrir el menú","a.close":"Cerrar","cta.discover":"Descubrir","cta.shop":"Ver la colección","cta.shopCharms":"Ver los charms","cta.shopSculpture":"Descubrir La Sculpture","cta.discoverAtelier":"Visitar el atelier","card.quickview":"Vista rápida","carousel.prev":"Anterior","carousel.next":"Siguiente","charm.style.eyebrow":"El Fruit Market","charm.style.title":"Cómo llevar tus charms","charm.style.text":"Coloca tus frutas de rafia en el universo YZA: junto a una cesta tejida, sobre la mesa del atelier, en una composici?n Fruit Market. Un clip, un toque de color, y la pieza se hace tuya.","charm.style.cap1":"Junto a una cesta tejida","charm.style.cap2":"Sobre la mesa del atelier","charm.style.cap3":"En una composici?n Fruit Market","charm.style.videoCap":"El charm naranja, en movimiento","print.eyebrow":"Sobre el estampado","print.title":"El Mercado de la Fruta","print.body":"Dibujado a mano en nuestro atelier de Guéliz, nuestro toile traza con trazo terracota los cítricos, las granadas y los higos del zoco, las palmeras, los arcos de los riads y la mujer que lleva su cesta de rafia. Cada línea guarda la memoria de las manos que la anudan: una carta de amor a Marrakech, a su luz, a su mercado.","print.caption":"Cereza, sandía, limón - tejidos a ganchillo a mano.","world.charms.eye":"Charms","world.charms.title":"Frutas de rafia","world.bags.eye":"Cestas","world.bags.title":"La Sculpture","world.rtw.eye":"Prêt-à-porter","world.rtw.title":"Jawhara","marquee.marrakech":"Mejor en Marrakech","band.craft.eye":"El savoir-faire","band.craft.title":"Todo empieza en Guéliz","band.craft.text":"De dos a seis horas de trabajo por fruta, anudada a mano en rafia por las mujeres del atelier.","band.closing.eye":"Fruit Market","band.closing.title":"El verano se lleva en rafia","cta.add":"Añadir a la cesta","cta.added":"Añadido ✓","cta.viewAll":"Ver todo","cta.more":"Ver más","cta.learn":"Saber más","cta.read":"Leer","hero.eyebrow":"YZA","hero.title":"La Sculpture","hero.subheading":"El nuevo icono de Marrakech","hero.text":"Tejida a mano en rafia, hoja de banano y abalorios por las mujeres de nuestro atelier de Guéliz - un bolso cada vez, nunca exactamente igual.","press.label":"Un savoir-faire forjado en París, junto a","press.note":"YZA, casa amazigh contemporánea nacida de un regreso a Marrakech tras quince años en la moda en París.","social.eyebrow":"Ellas llevan YZA","social.title":"De Marrakech a París","social.rating":"Opiniones de nuestras clientas","social.ratingOf":"Valoración","girls.shopLook":"Comprar el look","offer.eyebrow":"Por dónde empezar","offer.title":"Toda la colección SS26, en tres piezas","offer.text":"Un charm, un look Jawhara, un bolso Sculpture - uno de cada, y toda la temporada cabe en tus manos.","offer.save":"Ahorra","offer.bundleNote":"Caja lista para regalar","pp.limited":"Edición limitada · no se repone una vez agotada","pp.was":"antes","pp.crosssell":"Completa con","pp.reviews":"opiniones","pp.bundle.title":"Set fácil","pp.bundle.includes":"Incluye","pp.bundle.total":"Total del set","pp.bundle.add":"Añadir el set","pp.bundle.added":"Set añadido","conv.maps.label":"Cómo llegar a la boutique","conv.maps.bubble":"Boutique navigation - Marrakech","conv.chat.label":"Pregunta","conv.chat.title":"¿Una duda sobre una pieza?","conv.chat.text":"Haznos tu consulta. Déjanos tu nombre y tu WhatsApp y recibe un -10 % en tu pedido.","conv.chat.question":"Pregunta","conv.chat.questionPh":"Talla, color, disponibilidad, regalo...","conv.chat.name":"Nombre completo","conv.chat.phone":"WhatsApp","conv.chat.prepare":"Preparar WhatsApp","conv.chat.send":"Abrir WhatsApp con el código YZA10","conv.chat.ready":"Mensaje listo. Abre WhatsApp para enviarlo y recibir tu código.","promo.exit.kicker":"Antes de irte","promo.exit.title":"-20 % en tu pedido","promo.exit.text":"Recupera tu cesta por WhatsApp con el código YZA20. Válido desde 150 EUR / unos 1.500 DH.","promo.exit.cta":"Recuperar por WhatsApp","promo.exit.close":"Continuar sin oferta","home.cats.eyebrow":"Explorar","home.cats.title":"Cuatro formas de llevar Marrakech","cat.charms":"Charms de rafia","cat.charms.txt":"Frutas para enganchar al bolso.","cat.rtw":"Prêt-à-porter Jawhara","cat.rtw.txt":"Tops, pareos y pantalones a juego.","cat.bags":"Cestas y bolsos","cat.bags.txt":"Tejidos y a ganchillo, a mano.","cat.accessories":"Accesorios fruta","cat.accessories.txt":"Pendientes, collares y frutas a ganchillo.","cat.bespoke":"A medida","cat.bespoke.txt":"Los bolsos esculpidos del atelier.","home.best.eyebrow":"Las favoritas","home.best.title":"Nuestros imprescindibles","home.story.eyebrow":"El atelier","home.story.title":"Hecho por mujeres,\nen Guéliz","home.story.text":"Cada pieza se teje a ganchillo en rafia por las mujeres de nuestro atelier, en Marrakech. De dos a seis horas de trabajo por fruta, y una etiqueta dorada grabada al final.","trust.title":"Servicios YZA","trust.handmade.t":"Hecho únicamente por mujeres marroquíes","trust.handmade.x":"Cada charm pasa por manos expertas, no por una línea de producción.","trust.women.t":"Más manos, menos máquinas","trust.women.x":"Las manos tardan más que las máquinas. Ese es el sentido - y se nota.","trust.unique.t":"Menos desperdicio, más sentido","trust.unique.x":"Series cortas, rafia trabajada con cuidado, piezas pensadas para durar.","trust.secure.t":"Hecho para amar y compartir","trust.secure.x":"Frutas, cestas y regalos que viajan de Marrakech a París.","home.journal.eyebrow":"Journal","home.journal.title":"Marrakech, historias y savoir-faire","news.title":"Únete a YZA","news.text":"Piezas nuevas, reposiciones y una nota del atelier - una vez al mes, nunca más.","news.ph":"Tu e-mail","news.btn":"Suscribirme","news.ok":"Gracias ✓ Hasta muy pronto.","footer.tagline":"Bolsos y charms de ganchillo en rafia, hechos a mano en Marrakech.","footer.shop":"Tienda","footer.help":"Ayuda","footer.house":"La casa","footer.rights":"Todos los derechos reservados.","footer.legal":"Aviso legal · Privacidad","cart.title":"Tu cesta","cart.empty":"Tu cesta está vacía.","cart.emptyCta":"Descubrir los charms","cart.subtotal":"Subtotal","cart.checkout":"Tramitar pedido","cart.note":"Pago seguro · garantía de 30 días · reparaciones de por vida en el atelier.","cart.remove":"Quitar","cart.thanks":"Gracias ✓ Demo: aquí se confirmaría el pedido.","pp.add":"Añadir a la cesta","pp.finish":"Acabado","pp.finish.loop":"Lazada de rafia","pp.finish.r2":"Anilla dorada de 2 cm","pp.finish.r3":"Anilla dorada de 3 cm","pp.size":"Talla","pp.color":"Color","pp.qty":"Cantidad","pp.acc.details":"Detalles","pp.acc.making":"Fabricación","pp.acc.ship":"Envíos, devoluciones y reparaciones","pp.acc.care":"Cuidados","pp.making.txt":"Tejido a ganchillo en rafia en nuestro atelier 100 % femenino de Guéliz, Marrakech. Acabado con una etiqueta dorada grabada YZA.","pp.ship.txt":"Envío gratis a Marruecos desde 1.500 DH. Envío con seguimiento desde Marrakech. Garantía de 30 días en piezas sin usar y reparaciones de por vida gratis en el atelier.","pp.care.txt":"Mantener a salvo de la humedad. Quitar el polvo con suavidad a mano. La rafia adquiere una bonita pátina con el tiempo.","pp.size.label":"Dimensiones","pp.hours":"de trabajo","pp.related":"También te gustará","pp.bespokeNote":"Pieza a medida: fabricada bajo pedido.","col.all":"Toda la tienda","col.charms":"Charms de rafia","col.earrings":"Pendientes fruta","col.necklaces":"Collares fruta","col.accessories":"Accesorios fruta","col.rtw":"Prêt-à-porter","col.tops":"Tops Jawhara","col.pareos":"Pareos Jawhara","col.pants":"Pantalones Jawhara","col.bottoms":"Prendas inferiores Jawhara","col.bags":"Cestas y bolsos","col.filterCat":"Categoría","col.sort":"Ordenar","col.sort.feat":"Destacados","col.sort.asc":"Precio: de menor a mayor","col.sort.desc":"Precio: de mayor a menor","col.results":"piezas","badge.bestseller":"Favorito","badge.new":"Nuevo","badge.limited":"Edición limitada","badge.bespoke":"A medida","breadcrumb.home":"Inicio","from":"Desde","lang.label":"Idioma","pp.colors":"Colores disponibles","pp.availableSizes":"Tallas disponibles","pp.edition":"Edición","pp.material":"Material","pp.fabric":"Tejido","contact.resellers.title":"Distribuidores / B2B","contact.resellers.text":"Nuestras series son cortas, anudadas a mano en Guéliz - por eso trabajamos con unas pocas boutiques elegidas. Escríbenos: hablamos de disponibilidad, colores, plazos y lo demás, juntas.","contact.resellers.cta":"Solicitar el catálogo B2B"},"tr":{"announce":"30 günlük garanti · Atölyede ömür boyu onarım","meta.shipping":"1.500 DH ve üzeri Fas içi ücretsiz teslimat","meta.sale":"Fruit Market - charm'ları keşfedin","nav.charms":"Charm","nav.rtw":"Hazır Giyim","nav.bags":"Sepetler & Çantalar","nav.accessories":"Aksesuarlar","nav.girls":"YZA Girls","nav.bespoke":"Özel Tasarım","nav.story":"Hikayemiz","nav.b2b":"B2B","nav.lookbook":"Lookbook SS26/27","nav.journal":"Günlük","nav.archive":"Arşiv","nav.faq":"SSS","nav.contact":"İletişim","nav.more":"Daha Fazla","a.search":"Ara","a.wishlist":"Favoriler","a.cart":"Sepet","a.menu":"Menüyü aç","a.close":"Kapat","cta.discover":"Keşfet","cta.shop":"Koleksiyonu gör","cta.shopCharms":"Charm'ları gör","cta.shopSculpture":"La Sculpture'ı keşfet","cta.discoverAtelier":"Atölyeyi ziyaret et","card.quickview":"Önizleme","carousel.prev":"Önceki","carousel.next":"Sonraki","charm.style.eyebrow":"Le Fruit Market","charm.style.title":"Charm'larınızı nasıl taşırsınız","charm.style.text":"Rafya meyvelerinizi dilediğiniz çantaya iliştirin - deri bir sepet çanta, yapılı bir el çantası, kapitone bir omuz çantası. Bir klips, bir tutam renk ve parça artık size ait.","charm.style.cap1":"Deri sepet çanta üzerinde","charm.style.cap2":"Yapılı siyah çanta üzerinde","charm.style.cap3":"Kapitone omuz çantası üzerinde","charm.style.videoCap":"Turuncu charm, hareket halinde","print.eyebrow":"Desen hakkında","print.title":"Meyve Pazarı","print.body":"Guéliz'deki atölyemizde elle çizilen kumaşımız, terracotta çizgilerle souk'un narenciyelerini, narlarını ve incirlerini, palmiyeleri, riad kemerlerini ve rafya sepetini taşıyan kadını resmeder. Her çizgi, onu düğümleyen ellerin hafızasını taşır - Marrakech'e, ışığına, pazarına yazılmış bir aşk mektubu.","print.caption":"Kiraz, karpuz, limon - elde tığ işiyle örülmüş.","world.charms.eye":"Charm","world.charms.title":"Rafya meyveler","world.bags.eye":"Sepetler","world.bags.title":"La Sculpture","world.rtw.eye":"Hazır Giyim","world.rtw.title":"Jawhara","marquee.marrakech":"Marrakech'te her şey daha güzel","band.craft.eye":"Zanaat","band.craft.title":"Her şey Guéliz'de başlar","band.craft.text":"Her meyve için iki ila altı saat emek; atölyenin kadınları tarafından rafyadan elle düğümlenir.","band.closing.eye":"Fruit Market","band.closing.title":"Yaz, rafyayla örülür","cta.add":"Sepete ekle","cta.added":"Eklendi ✓","cta.viewAll":"Tümünü gör","cta.more":"Daha fazla gör","cta.learn":"Daha fazla bilgi","cta.read":"Oku","hero.eyebrow":"YZA","hero.title":"La Sculpture","hero.subheading":"Marrakech'in yeni ikonu","hero.text":"Guéliz atölyemizdeki kadınların elinde rafya, muz yaprağı ve boncukla örülür - her seferinde tek bir çanta, hiçbiri tam olarak aynı değil.","press.label":"Paris'te, şu evlerin yanında şekillenen bir zanaat:","press.note":"YZA, Paris modasında geçen on beş yılın ardından Marrakech'e dönüşten doğan çağdaş bir Amazigh markasıdır.","social.eyebrow":"YZA giyenler","social.title":"Marrakech'ten Paris'e","social.rating":"Müşterilerimizden","social.ratingOf":"Puan","girls.shopLook":"Görünümü satın al","offer.eyebrow":"Nereden başlamalı","offer.title":"Tüm SS26, üç parçada","offer.text":"Bir charm, bir Jawhara görünümü, bir Sculpture çanta - her birinden bir tane, ve tüm sezon avucunuzun içinde.","offer.save":"Tasarruf edin","offer.bundleNote":"Hediyeye hazır kutu","pp.limited":"Sınırlı sayıda · tükendiğinde yeniden üretilmez","pp.was":"yerine","pp.crosssell":"Şununla tamamlayın","pp.reviews":"yorum","pp.bundle.title":"Kolay set","pp.bundle.includes":"İçeriği","pp.bundle.total":"Set toplamı","pp.bundle.add":"Seti ekle","pp.bundle.added":"Set eklendi","conv.maps.label":"Mağazaya gel","conv.maps.bubble":"Mağaza navigasyonu - Marrakech","conv.chat.label":"Soru","conv.chat.title":"Bir parça hakkında sorunuz mu var?","conv.chat.text":"Sorunuzu sorun. Siparişinizde -10 % kazanmak için adınızı ve WhatsApp numaranızı bırakın.","conv.chat.question":"Soru","conv.chat.questionPh":"Beden, renk, stok durumu, hediye...","conv.chat.name":"Ad soyad","conv.chat.phone":"WhatsApp","conv.chat.prepare":"WhatsApp'ı hazırla","conv.chat.send":"YZA10 koduyla WhatsApp'ı aç","conv.chat.ready":"Mesaj hazır. Göndermek ve kodunuzu almak için WhatsApp'ı açın.","promo.exit.kicker":"Gitmeden önce","promo.exit.title":"Siparişinizde -20 %","promo.exit.text":"YZA20 koduyla sepetinizi WhatsApp üzerinden kurtarın. 150 EUR / yaklaşık 1.500 DH ve üzeri geçerlidir.","promo.exit.cta":"WhatsApp'ta kurtar","promo.exit.close":"Teklif olmadan devam et","home.cats.eyebrow":"Keşfet","home.cats.title":"Marrakech'i taşımanın dört yolu","cat.charms":"Rafya charm'lar","cat.charms.txt":"Çantanıza iliştirilecek meyveler.","cat.rtw":"Jawhara hazır giyim","cat.rtw.txt":"Uyumlu üstler, pareolar ve pantolonlar.","cat.bags":"Sepetler & çantalar","cat.bags.txt":"Elle örülmüş ve tığ işi.","cat.accessories":"Meyve aksesuarları","cat.accessories.txt":"Elle tığ işi küpeler, kolyeler ve meyve parçaları.","cat.bespoke":"Özel tasarım","cat.bespoke.txt":"Atölyenin heykelimsi çantaları.","home.best.eyebrow":"En sevilenler","home.best.title":"Gözdeler","home.story.eyebrow":"Atölye","home.story.title":"Kadınların elinden,\nGuéliz'de","home.story.text":"Her parça, Marrakech'teki atölyemizin kadınları tarafından rafyadan tığla örülür. Meyve başına iki ila altı saat emek ve sonunda kazınmış altın bir etiket.","trust.title":"YZA hizmetleri","trust.handmade.t":"Yalnızca Faslı kadınların elinden","trust.handmade.x":"Her charm bir üretim hattından değil, usta ellerden geçer.","trust.women.t":"Daha çok el, daha az makine","trust.women.x":"Eller makinelerden daha yavaştır. Mesele de bu - ve bunu hissedebilirsiniz.","trust.unique.t":"Daha az israf, daha çok anlam","trust.unique.x":"Küçük seriler, özenle işlenmiş rafya, kalıcı olması için tasarlanmış parçalar.","trust.secure.t":"Sevilmek ve paylaşılmak için yapıldı","trust.secure.x":"Marrakech'ten Paris'e yolculuk eden meyveler, sepetler ve hediyeler.","home.journal.eyebrow":"Günlük","home.journal.title":"Marrakech, hikayeler & zanaat","news.title":"YZA'ya katılın","news.text":"Yeni parçalar, yeniden stoklar ve atölyeden bir not - ayda bir kez, asla daha fazla.","news.ph":"E-posta adresiniz","news.btn":"Abone ol","news.ok":"Teşekkürler ✓ Yakında görüşmek üzere.","footer.tagline":"Marrakech'te elde örülen tığ işi rafya çantalar ve charm'lar.","footer.shop":"Mağaza","footer.help":"Yardım","footer.house":"Marka","footer.rights":"Tüm hakları saklıdır.","footer.legal":"Yasal bildirim · Gizlilik","cart.title":"Sepetiniz","cart.empty":"Sepetiniz boş.","cart.emptyCta":"Charm'ları keşfedin","cart.subtotal":"Ara toplam","cart.checkout":"Siparişi tamamla","cart.note":"Güvenli ödeme · 30 günlük garanti · atölyede ömür boyu onarım.","cart.remove":"Çıkar","cart.thanks":"Teşekkürler ✓ Demo: sipariş burada onaylanırdı.","pp.add":"Sepete ekle","pp.finish":"Finiş","pp.finish.loop":"Rafya halka","pp.finish.r2":"Altın halka 2 cm","pp.finish.r3":"Altın halka 3 cm","pp.size":"Beden","pp.color":"Renk","pp.qty":"Adet","pp.acc.details":"Detaylar","pp.acc.making":"Nasıl yapılır","pp.acc.ship":"Teslimat, iade & onarım","pp.acc.care":"Bakım","pp.making.txt":"Marrakech, Guéliz'deki tamamı kadınlardan oluşan atölyemizde rafyadan elle tığla örülür. Kazınmış YZA altın etiketiyle tamamlanır.","pp.ship.txt":"1.500 DH ve üzeri Fas içi ücretsiz teslimat. Marrakech'ten takip edilebilir gönderim. Giyilmemiş parçalarda 30 günlük garanti ve atölyede ömür boyu ücretsiz onarım.","pp.care.txt":"Nemden uzak tutun. Elle nazikçe tozunu alın. Rafya zamanla güzel bir patina kazanır.","pp.size.label":"Ölçüler","pp.hours":"emek","pp.related":"Bunları da beğenebilirsiniz","pp.bespokeNote":"Özel tasarım parça - siparişe özel üretilir.","col.all":"Tüm mağaza","col.charms":"Rafya charm'lar","col.earrings":"Meyve küpeler","col.necklaces":"Meyve kolyeler","col.accessories":"Meyve aksesuarları","col.rtw":"Hazır giyim","col.tops":"Jawhara üstler","col.pareos":"Jawhara pareolar","col.pants":"Jawhara pantolonlar","col.bottoms":"Jawhara altlar","col.bags":"Sepetler & çantalar","col.filterCat":"Kategori","col.sort":"Sırala","col.sort.feat":"Öne çıkanlar","col.sort.asc":"Fiyat: artan","col.sort.desc":"Fiyat: azalan","col.results":"parça","badge.bestseller":"Gözde","badge.new":"Yeni","badge.limited":"Sınırlı sayıda","badge.bespoke":"Özel tasarım","breadcrumb.home":"Ana sayfa","from":"Başlangıç fiyatı","lang.label":"Dil","pp.colors":"Mevcut renkler","pp.availableSizes":"Mevcut bedenler","pp.edition":"Edisyon","pp.material":"Malzeme","pp.fabric":"Kumaş","contact.resellers.title":"Bayiler / B2B","contact.resellers.text":"Serilerimiz kısa, Guéliz'de elle düğümlenir - bu yüzden seçtiğimiz birkaç butikle çalışırız. Bize yazın: uygunluğu, renkleri, teslim sürelerini ve gerisini birlikte konuşuruz.","contact.resellers.cta":"B2B kataloğunu iste"},"ar":{"announce":"ضمان 30 يوماً · إصلاحات مدى الحياة في الأتيليه","meta.shipping":"توصيل مجاني داخل المغرب ابتداءً من 1.500 درهم","meta.sale":"Fruit Market - اكتشفي تمائم Charms الجديدة","nav.charms":"التمائم Charms","nav.rtw":"الجاهز للارتداء","nav.bags":"السلال والحقائب","nav.accessories":"الإكسسوارات","nav.girls":"YZA Girls","nav.bespoke":"التفصيل حسب الطلب","nav.story":"حكايتنا","nav.b2b":"B2B","nav.lookbook":"Lookbook SS26/27","nav.journal":"اليوميات","nav.archive":"الأرشيف","nav.faq":"الأسئلة الشائعة","nav.contact":"اتصلي بنا","nav.more":"المزيد","a.search":"البحث","a.wishlist":"المفضّلة","a.cart":"السلة","a.menu":"فتح القائمة","a.close":"إغلاق","cta.discover":"اكتشفي","cta.shop":"تصفّحي المجموعة","cta.shopCharms":"تصفّحي التمائم","cta.shopSculpture":"اكتشفي La Sculpture","cta.discoverAtelier":"زوري الأتيليه","card.quickview":"نظرة سريعة","carousel.prev":"السابق","carousel.next":"التالي","charm.style.eyebrow":"Le Fruit Market","charm.style.title":"كيف تنسّقين تمائمك","charm.style.text":"علّقي ثمارك المنسوجة من الرافيا على أي حقيبة - سلة جلدية، حقيبة يد بقصّة محكمة، أو حقيبة كتف مبطّنة. مشبك واحد، لمسة لون، وتغدو القطعة لكِ وحدك.","charm.style.cap1":"على سلة جلدية","charm.style.cap2":"على حقيبة سوداء بقصّة محكمة","charm.style.cap3":"على حقيبة كتف مبطّنة","charm.style.videoCap":"تميمة البرتقال، في حركتها","print.eyebrow":"عن النقشة","print.title":"Le Marché aux Fruits","print.body":"رُسمت بأيدٍ ماهرة في أتيليهنا بحي Guéliz، تخطّ قماشتنا بخطٍّ بلون التراكوتا حمضيات السوق ورمّانه وتينه، نخيله، أقواس الرياض، والمرأة الحاملة سلّتها من الرافيا. يحفظ كل خطٍّ ذاكرة الأيدي التي عقدته - رسالة حبٍّ إلى Marrakech، إلى ضوئها، إلى سوقها.","print.caption":"كرز، بطّيخ، ليمون - مصنوعة يدويًا بالكروشيه.","world.charms.eye":"التمائم","world.charms.title":"ثمار الرافيا","world.bags.eye":"السلال","world.bags.title":"La Sculpture","world.rtw.eye":"الجاهز للارتداء","world.rtw.title":"Jawhara","marquee.marrakech":"كل شيء أجمل في Marrakech","band.craft.eye":"الحرفة","band.craft.title":"كل شيء يبدأ في Guéliz","band.craft.text":"من ساعتين إلى ست ساعات عملٍ لكل ثمرة، معقودة يدوياً من الرافيا بأنامل نساء الأتيليه.","band.closing.eye":"Fruit Market","band.closing.title":"الصيف يُرتدى من الرافيا","cta.add":"أضيفي إلى السلة","cta.added":"أُضيفت ✓","cta.viewAll":"عرض الكل","cta.more":"عرض المزيد","cta.learn":"اعرفي المزيد","cta.read":"اقرئي","hero.eyebrow":"YZA","hero.title":"La Sculpture","hero.subheading":"أيقونة Marrakech الجديدة","hero.text":"تُنسج يدوياً من الرافيا وورق الموز والخرز بأنامل نساء أتيليهنا في Guéliz - حقيبةٌ واحدة في كل مرة، لا تتشابه اثنتان تماماً.","press.label":"حرفةٌ صُقلت في باريس، إلى جانب","press.note":"YZA، دار أمازيغية معاصرة وُلدت من عودة إلى Marrakech بعد خمسة عشر عاماً في عالم الموضة بباريس.","social.eyebrow":"هنّ يرتدين YZA","social.title":"من Marrakech إلى باريس","social.rating":"آراء عميلاتنا","social.ratingOf":"التقييم","girls.shopLook":"تسوّقي الإطلالة","offer.eyebrow":"من أين تبدئين","offer.title":"مجموعة SS26 كاملةً، في ثلاث قطع","offer.text":"تميمة، وإطلالة Jawhara، وحقيبة Sculpture - واحدة من كلٍّ، فيغدو الموسم كله بين يديك.","offer.save":"وفّري","offer.bundleNote":"علبة جاهزة للإهداء","pp.limited":"إصدار محدود · لا يُعاد صنعه بعد نفاده","pp.was":"بدلاً من","pp.crosssell":"أكمليها بـ","pp.reviews":"رأي","pp.bundle.title":"باقة سهلة","pp.bundle.includes":"تتضمّن","pp.bundle.total":"إجمالي الباقة","pp.bundle.add":"أضيفي الباقة","pp.bundle.added":"أُضيفت الباقة","conv.maps.label":"زيارة المتجر","conv.maps.bubble":"الوصول إلى المتجر - Marrakech","conv.chat.label":"سؤال","conv.chat.title":"سؤال عن قطعة معيّنة؟","conv.chat.text":"اطرحي سؤالك. اتركي اسمك ورقم WhatsApp لتحصلي على خصم -10% على طلبك.","conv.chat.question":"السؤال","conv.chat.questionPh":"المقاس، اللون، التوفّر، الإهداء...","conv.chat.name":"الاسم الكامل","conv.chat.phone":"WhatsApp","conv.chat.prepare":"تجهيز WhatsApp","conv.chat.send":"افتحي WhatsApp بالرمز YZA10","conv.chat.ready":"الرسالة جاهزة. افتحي WhatsApp لإرسالها واستلام رمزك.","promo.exit.kicker":"قبل أن تغادري","promo.exit.title":"خصم -20% على طلبك","promo.exit.text":"استعيدي سلتك عبر WhatsApp بالرمز YZA20. صالح ابتداءً من 150 يورو / نحو 1.500 درهم.","promo.exit.cta":"استعيديها عبر WhatsApp","promo.exit.close":"المتابعة دون العرض","home.cats.eyebrow":"استكشفي","home.cats.title":"أربع طرق لتحملي Marrakech معك","cat.charms":"تمائم الرافيا","cat.charms.txt":"ثمارٌ تُعلّق على حقيبتك.","cat.rtw":"الجاهز للارتداء Jawhara","cat.rtw.txt":"بلوزات وأرواب وسراويل متناسقة.","cat.bags":"السلال والحقائب","cat.bags.txt":"منسوجة ومحبوكة يدوياً.","cat.accessories":"إكسسوارات الفاكهة","cat.accessories.txt":"أقراط وعقود وقطع فاكهة محبوكة يدوياً.","cat.bespoke":"التفصيل حسب الطلب","cat.bespoke.txt":"حقائب الأتيليه المنحوتة.","home.best.eyebrow":"الأكثر حبّاً","home.best.title":"قطع تأسر القلب","home.story.eyebrow":"الأتيليه","home.story.title":"صنعته أيادي نساء،\nفي Guéliz","home.story.text":"تُحبك كل قطعة من الرافيا بأنامل نساء أتيليهنا في Marrakech. من ساعتين إلى ست ساعات عملٍ لكل ثمرة، وفي الختام بطاقة ذهبية منقوشة.","trust.title":"خدمات YZA","trust.handmade.t":"من صنع نساء مغربيات حصراً","trust.handmade.x":"تمرّ كل تميمة بأيدٍ خبيرة، لا بخطّ إنتاج.","trust.women.t":"أيادٍ أكثر، آلات أقل","trust.women.x":"الأيدي أبطأ من الآلات. وهذا هو المقصد - وستشعرين به.","trust.unique.t":"هدرٌ أقل، ومعنىً أعمق.","trust.unique.x":"دفعات صغيرة، رافيا تُعالَج بعناية، وقطع صُنعت لتدوم.","trust.secure.t":"صُنعت لتُحَبّ وتُشارَك","trust.secure.x":"ثمارٌ وسلالٌ وهدايا تسافر من Marrakech إلى باريس.","home.journal.eyebrow":"اليوميات","home.journal.title":"Marrakech، حكايات وحرفة","news.title":"انضمّي إلى YZA","news.text":"قطع جديدة، وإعادة توفّر، وكلمة من الأتيليه - مرة واحدة في الشهر، لا أكثر.","news.ph":"بريدك الإلكتروني","news.btn":"اشتركي","news.ok":"شكراً لكِ ✓ إلى اللقاء قريباً.","footer.tagline":"حقائب وتمائم محبوكة من الرافيا، صُنعت يدوياً في Marrakech.","footer.shop":"المتجر","footer.help":"المساعدة","footer.house":"الدار","footer.rights":"جميع الحقوق محفوظة.","footer.legal":"الإشعارات القانونية · الخصوصية","cart.title":"سلتك","cart.empty":"سلتك فارغة.","cart.emptyCta":"اكتشفي التمائم","cart.subtotal":"المجموع الفرعي","cart.checkout":"إتمام الطلب","cart.note":"دفع آمن · ضمان 30 يوماً · إصلاحات مدى الحياة في الأتيليه.","cart.remove":"إزالة","cart.thanks":"شكراً لكِ ✓ عرض توضيحي: هنا يتم إتمام الطلب.","pp.add":"أضيفي إلى السلة","pp.finish":"التشطيب","pp.finish.loop":"حلقة رافيا","pp.finish.r2":"حلقة ذهبية 2 سم","pp.finish.r3":"حلقة ذهبية 3 سم","pp.size":"المقاس","pp.color":"اللون","pp.qty":"الكمية","pp.acc.details":"التفاصيل","pp.acc.making":"طريقة الصنع","pp.acc.ship":"التوصيل والإرجاع والإصلاحات","pp.acc.care":"العناية","pp.making.txt":"محبوكة يدوياً من الرافيا في أتيليهنا النسائي بالكامل في Guéliz، Marrakech. تُختم ببطاقة ذهبية منقوشة بشعار YZA.","pp.ship.txt":"توصيل مجاني داخل المغرب ابتداءً من 1.500 درهم. شحن مع تتبّع من Marrakech. ضمان 30 يوماً على القطع غير المستعملة، وإصلاحات مجانية مدى الحياة في الأتيليه.","pp.care.txt":"احفظيها بعيداً عن الرطوبة. أزيلي الغبار برفقٍ باليد. يكتسب الرافيا مع الوقت لمعةً عتيقة أخّاذة.","pp.size.label":"الأبعاد","pp.hours":"من العمل","pp.related":"قد يعجبك أيضاً","pp.bespokeNote":"قطعة مُفصّلة حسب الطلب - تُصنع عند الطلب.","col.all":"المتجر بأكمله","col.charms":"تمائم الرافيا","col.earrings":"أقراط الفاكهة","col.necklaces":"عقود الفاكهة","col.accessories":"إكسسوارات الفاكهة","col.rtw":"الجاهز للارتداء","col.tops":"بلوزات Jawhara","col.pareos":"أرواب Jawhara","col.pants":"سراويل Jawhara","col.bottoms":"قطع سفلية Jawhara","col.bags":"السلال والحقائب","col.filterCat":"الفئة","col.sort":"ترتيب","col.sort.feat":"المميّزة","col.sort.asc":"السعر: من الأقل إلى الأعلى","col.sort.desc":"السعر: من الأعلى إلى الأقل","col.results":"قطعة","badge.bestseller":"الأكثر مبيعاً","badge.new":"جديد","badge.limited":"إصدار محدود","badge.bespoke":"حسب الطلب","breadcrumb.home":"الرئيسية","from":"ابتداءً من","lang.label":"اللغة","pp.colors":"الألوان المتوفّرة","pp.availableSizes":"المقاسات المتوفّرة","pp.edition":"الإصدار","pp.material":"الخامة","pp.fabric":"القماش","contact.resellers.title":"الموزّعون / B2B","contact.resellers.text":"إنتاجنا محدود، معقود يدوياً في Guéliz - لذلك نعمل مع قلّة من البوتيكات المختارة. راسلونا: نتحدّث معاً عن التوفّر والألوان ومُدد التسليم وما بعدها.","contact.resellers.cta":"اطلبي كتالوج B2B"}};
Object.keys(I18N_NATIVE_OVERRIDES).forEach(function (lang) {
 var m = I18N_NATIVE_OVERRIDES[lang];
 Object.keys(m).forEach(function (k) { if (STR[k] && m[k]) STR[k][lang] = m[k]; });
});

const i18n = {
 lang: 'fr',
 _cbs: [],
 detect() {
 try {
 const fromUrl = new URLSearchParams(location.search).get('lang');
 if (LANGS.includes(fromUrl)) return fromUrl;
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
 return `${new Intl.NumberFormat(loc, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)} DH`;
 },
 onChange(cb) { this._cbs.push(cb); },
 setLang(l) {
 if (!LANGS.includes(l)) return;
 const previous = this.lang;
 this.lang = l;
 localStorage.setItem('yza.lang', l);
 this.apply();
 if (previous !== l) YZA.analytics?.track('language_change', { from: previous, to: l });
 this._cbs.forEach(cb => { try { cb(l); } catch (e) {} });
 },
 apply(root = document) {
 document.documentElement.lang = this.lang;
 document.documentElement.dir = this.lang === 'ar' ? 'rtl' : 'ltr';
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
