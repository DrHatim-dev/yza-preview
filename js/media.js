/* ============================================================
 YZA - MEDIA / EDITORIAL DATA
 Public YZA assets only. Reference mirrors are documented in
 data/media-ledger.json and are not used as YZA product images.
 ============================================================ */
window.YZA = window.YZA || {};

const girlAsset = (name) => `assets/yza-girls/${name}`;
const lookbookAsset = (name) => `assets/lookbook-ss26-27/pages/${name}`;

YZA.media = {
 sources: {
 yzaGirls: 'https://yza-shop.com/pages/yza-girls',
 yzaShop: 'https://yza-shop.com',
 zip: 'C:/Users/alexa/Downloads/YZA.zip',
 },

 yzaGirls: [
 {
 id: 'rim-yellow',
 name: 'Rim',
 city: 'Marrakech',
 color: 'jaune',
 product: 'La Vague S Jaune',
 src: girlAsset('girls-rim-yellow.jpg'),
 alt: 'YZA Girl wearing a yellow La Vague bag in Marrakech',
 },
 {
 id: 'rim-yellow-blue',
 name: 'Rim',
 city: 'Marrakech',
 color: 'jaune',
 product: 'La Vague S Jaune Bleu',
 src: girlAsset('girls-rim-blue-yellow.jpg'),
 alt: 'YZA Girl carrying a yellow and blue YZA bag',
 },
 {
 id: 'rim-violet',
 name: 'Rim',
 city: 'Marrakech',
 color: 'violet',
 product: 'La Vague S Violet',
 src: girlAsset('girls-rim-violet.jpg'),
 alt: 'YZA Girl wearing a violet YZA bag',
 },
 {
 id: 'fanny-yellow',
 name: 'Fanny',
 city: 'Paris',
 color: 'jaune',
 product: 'La Vague S Jaune',
 src: girlAsset('girls-fanny-yellow.jpg'),
 alt: 'YZA Girl with yellow YZA bag and crochet details',
 },
 {
 id: 'fanny-door',
 name: 'Fanny',
 city: 'Marrakech',
 color: 'jaune',
 product: 'La Vague S Jaune',
 src: girlAsset('girls-fanny-door.jpg'),
 alt: 'YZA Girl wearing blue set and yellow bag',
 },
 {
 id: 'fanny-jaune',
 name: 'Fanny',
 city: 'Marrakech',
 color: 'jaune',
 product: 'La Vague S Jaune',
 src: girlAsset('girls-fanny-jaune.jpg'),
 alt: 'Close styling image of yellow YZA bag',
 },
 {
 id: 'fanny-xs-nude',
 name: 'Fanny',
 city: 'Paris',
 color: 'nude',
 product: 'La Vague XS Nude',
 src: girlAsset('girls-fanny-xs-nude.jpg'),
 alt: 'YZA Girl wearing a nude XS YZA basket',
 },
 {
 id: 'fanny-xs-nude-2',
 name: 'Fanny',
 city: 'Paris',
 color: 'nude',
 product: 'La Vague XS Nude',
 src: girlAsset('girls-fanny-xs-nude-2.jpg'),
 alt: 'Close view of nude YZA basket worn by model',
 },
 {
 id: 'fanny-desert',
 name: 'Fanny',
 city: 'Marrakech',
 color: 'desert',
 product: 'La Vague S Desert',
 src: girlAsset('girls-fanny-desert.jpg'),
 alt: 'YZA Girl styling a desert color YZA basket',
 },
 {
 id: 'fanny-look',
 name: 'Fanny',
 city: 'Marrakech',
 color: 'violet',
 product: 'YZA styled look',
 src: girlAsset('girls-fanny-look.jpg'),
 alt: 'YZA Girl wearing a purple outfit with YZA basket',
 },
 {
 id: 'fanny-purple',
 name: 'Fanny',
 city: 'Marrakech',
 color: 'violet',
 product: 'YZA styled look',
 src: girlAsset('girls-fanny-purple.jpg'),
 alt: 'YZA Girl in a violet resort look',
 },
 {
 id: 'amelie-vague-s',
 name: 'Amélie',
 city: 'Paris',
 color: 'naturel',
 product: 'La Vague S',
 src: girlAsset('girls-amelie-vague-s.jpg'),
 alt: 'YZA Girl carrying La Vague S basket',
 },
 {
 id: 'amelie-bougainvillier',
 name: 'Amélie',
 city: 'Paris',
 color: 'bougainvillier',
 product: 'La Vague S Bougainvillier',
 src: girlAsset('girls-amelie-bougainvillier.jpg'),
 alt: 'YZA basket with bougainvillier accents worn by model',
 },
 {
 id: 'amelie-fuschia',
 name: 'Amélie',
 city: 'Paris',
 color: 'fuschia',
 product: 'La Vague S Fuschia',
 src: girlAsset('girls-amelie-fuschia.jpg'),
 alt: 'YZA basket with fuschia handles worn by model',
 },
 {
 id: 'amelie-look',
 name: 'Amélie',
 city: 'Paris',
 color: 'naturel',
 product: 'YZA styled look',
 src: girlAsset('girls-amelie-look.jpg'),
 alt: 'YZA Girl wearing a natural YZA basket',
 },
 {
 id: 'amelie-portrait',
 name: 'Amélie',
 city: 'Paris',
 color: 'naturel',
 product: 'YZA styled look',
 src: girlAsset('girls-amelie-portrait.jpg'),
 alt: 'YZA Girl portrait with YZA styling',
 },
 {
 id: 'josephine-marron',
 name: 'Joséphine',
 city: 'Paris',
 color: 'marron',
 product: 'La Vague S Marron',
 src: girlAsset('girls-josephine-marron.jpg'),
 alt: 'YZA basket in a wine bar styling story',
 },
 {
 id: 'rin-look-1',
 name: 'Rin',
 city: 'Berlin',
 color: 'editorial',
 product: 'YZA styled look',
 src: girlAsset('girls-rin-look-1.jpg'),
 alt: 'YZA Girl editorial styling outdoors',
 },
 {
 id: 'rin-look-2',
 name: 'Rin',
 city: 'Berlin',
 color: 'editorial',
 product: 'YZA styled look',
 src: girlAsset('girls-rin-look-2.jpg'),
 alt: 'YZA Girl wearing resort look with YZA energy',
 },
 {
 id: 'rin-look-3',
 name: 'Rin',
 city: 'Berlin',
 color: 'editorial',
 product: 'YZA styled look',
 src: girlAsset('girls-rin-look-3.jpg'),
 alt: 'YZA Girl street styling image',
 },
 {
 id: 'snap-flowers',
 name: 'YZA Girl',
 city: 'Marrakech',
 color: 'editorial',
 product: 'YZA styled look',
 src: girlAsset('girls-snap-flowers.jpg'),
 alt: 'YZA Girl holding flowers with a YZA basket',
 },
 ],

 editorialBreaks: [
 {
 layout: 'duo',
 kicker: { fr: 'Portee par la communaute', en: 'Worn by the community' },
 title: { fr: 'Le panier change avec celle qui le porte.', en: 'The basket changes with the woman who wears it.' },
 text: {
 fr: 'Les images portees montrent la vraie echelle, la tenue des anses et la facon dont chaque couleur dialogue avec un look.',
 en: 'Worn images show true scale, handle structure and how every colour works with an outfit.',
 },
 images: [girlAsset('girls-rim-yellow.jpg'), girlAsset('girls-fanny-door.jpg')],
 },
 {
 layout: 'wide',
 kicker: { fr: 'Atelier, pas machine', en: 'Atelier, not machine' },
 title: { fr: 'Chaque tension de crochet reste visible.', en: 'Every crochet tension stays visible.' },
 images: [lookbookAsset('yza-lookbook-page-43.jpg')],
 },
 {
 layout: 'duo',
 kicker: { fr: 'Couleur et preuve', en: 'Colour with proof' },
 title: { fr: 'Un produit, ses details, son contexte.', en: 'One product, its details, its context.' },
 text: {
 fr: 'Les gros plans et les images portees evitent la comparaison avec des paniers anonymes: on voit le geste, la finition et le style.',
 en: 'Detail and worn images prevent comparison with anonymous baskets: the handwork, finishing and style are visible.',
 },
 images: [girlAsset('girls-amelie-bougainvillier.jpg'), girlAsset('girls-fanny-jaune.jpg')],
 },
 {
 layout: 'wide',
 kicker: { fr: 'Edition limitee', en: 'Limited edition' },
 title: { fr: 'Quand une couleur part, elle part vraiment.', en: 'When a colour sells out, it is gone.' },
 images: [girlAsset('girls-snap-flowers.jpg')],
 },
 ],

 proofPoints: {
 home: [
 ['women-only.png', { fr: 'Atelier 100 % femmes a Guéliz', en: 'All-women atelier in Guéliz' }],
 ['more-hands.png', { fr: 'Crochet main, pas de ligne machine', en: 'Hand crochet, no machine line' }],
 ['less-waste.png', { fr: 'Editions limitees, moins de stock mort', en: 'Limited editions, less dead stock' }],
 ['loved-shared.png', { fr: 'Pieces faites pour circuler', en: 'Pieces made to be shared' }],
 ],
 product: [
 ['woven-line.png', { fr: 'Tension de raphia controlee a la main', en: 'Hand-controlled raffia tension' }],
 ['atelier-house.png', { fr: 'Finitions verifiees piece par piece', en: 'Finishing checked piece by piece' }],
 ['less-waste.png', { fr: 'Reparation et soin possibles via l atelier', en: 'Repair and care support through the atelier' }],
 ['women-only.png', { fr: 'Chaque achat soutient des mains specialisees', en: 'Every purchase supports specialized hands' }],
 ],
 },

 productStories: {
 bags: {
 title: { fr: 'Porté par vous. Reconnu par toutes.', en: 'Carried by you. Recognised by all.' },
 text: {
 fr: 'Chaque taille prend une présence différente sur le corps. La galerie associe détails, produits et images de clientes pour montrer la vraie valeur du crochet.',
 en: 'Every size has a different presence on the body. The gallery connects detail, product and community images to show the true value of the crochet.',
 },
 label: { fr: 'crochet main / serie limitee / non refait', en: 'hand crochet / limited run / not remade' },
 images: [girlAsset('girls-rim-yellow.jpg'), girlAsset('girls-amelie-vague-s.jpg'), girlAsset('girls-fanny-desert.jpg')],
 cta: 'collections.html?cat=bags',
 },
 jaune: {
 title: { fr: 'Jaune: solaire, visible, Marrakech.', en: 'Yellow: sunlit, visible, Marrakech.' },
 text: {
 fr: 'Le jaune YZA vit tres bien avec le bleu Majorelle, le blanc et les looks vacances. C est la couleur qui transforme le panier en signature.',
 en: 'YZA yellow works with Majorelle blue, white and resort looks. It turns the basket into a signature.',
 },
 label: { fr: 'couleur capsule / non refait', en: 'capsule colour / not remade' },
 images: [girlAsset('girls-rim-yellow.jpg'), girlAsset('girls-fanny-door.jpg'), girlAsset('girls-fanny-jaune.jpg')],
 cta: 'collections.html?cat=bags',
 },
 violet: {
 title: { fr: 'Violet: plus rare, plus mode.', en: 'Violet: rarer, more fashion.' },
 text: {
 fr: 'A porter comme une piece de mode, pas comme un simple accessoire. Les details main rendent chaque boucle legerement vivante.',
 en: 'Wear it as a fashion piece, not a simple accessory. The handwork keeps every loop subtly alive.',
 },
 label: { fr: 'edition limitee / finition main', en: 'limited edition / hand finishing' },
 images: [girlAsset('girls-rim-violet.jpg'), girlAsset('girls-fanny-purple.jpg'), 'assets/products/bag-sculpture-violet.jpg'],
 cta: 'collections.html?cat=bags',
 },
 noir: {
 title: { fr: 'Noir: la version la plus nette.', en: 'Black: the sharpest version.' },
 text: {
 fr: 'Le noir donne au tressage une lecture plus graphique. Il fonctionne en boutique locale comme sur Instagram parce qu il reste facile a porter.',
 en: 'Black makes the weave read more graphically. It works locally and on Instagram because it remains easy to wear.',
 },
 label: { fr: '15 par taille et couleur', en: '15 per size and colour' },
 images: ['assets/products/bag-sculpture-black.jpg', 'assets/products/bag-sculpture-black-detail.jpg', 'assets/products/bag-sculpture-black-still.jpg'],
 cta: 'collections.html?cat=bags',
 },
 rouge: {
 title: { fr: 'Rouge: contraste et main visible.', en: 'Red: contrast and visible handwork.' },
 text: {
 fr: 'Le rouge met en evidence les anses, les perles et l assemblage. C est une couleur qui justifie le detail.',
 en: 'Red highlights handles, beadwork and assembly. It is a colour that makes the detail legible.',
 },
 label: { fr: 'finition couleur / non refait', en: 'colour finishing / not remade' },
 images: ['assets/products/bag-sculpture-red.jpg', 'assets/products/bag-sculpture-red-seated.jpg', 'assets/products/charms-on-bag.jpg'],
 cta: 'collections.html?cat=bags',
 },
 charms: {
 title: { fr: 'Le fruit est petit, mais le geste est long.', en: 'The fruit is small, but the handwork is long.' },
 text: {
 fr: 'Un charm peut demander plusieurs heures: la forme, la tension et l etiquette doree donnent la difference entre souvenir et objet de mode.',
 en: 'A charm can take hours: shape, tension and the gold tag make the difference between souvenir and fashion object.',
 },
 label: { fr: '2 a 3 h de crochet / bundle 3 charms', en: '2 to 3h crochet / 3 charm bundle' },
 images: ['assets/products/charm-orange-hero.jpg', 'assets/products/charms-cluster.jpg', 'assets/products/charms-on-bag.jpg'],
 cta: 'collections.html?cat=charms',
 },
 rtw: {
 title: { fr: 'Pas de taille à connaître. Juste à porter.', en: 'No size to know. Just wear it.' },
 text: {
 fr: 'Chaque pièce Jawhara s\'ajuste à votre corps. Pampilles en perles dorées et signes berbères brodés à la main par Lala Fatima - à porter seul ou en set.',
 en: 'Every Jawhara piece adjusts to your body. Hand-crafted golden bead tassels and Berber signs by Lala Fatima - worn alone or as a set.',
 },
 label: { fr: 'tailles libres / fait à l\'atelier', en: 'free sizes / atelier-made' },
 images: ['assets/lifestyle/look-3.jpg', 'assets/products/rtw-scarf-top.jpg', 'assets/products/rtw-palazzo-pants.jpg'],
 cta: 'collections.html?cat=rtw',
 },
 },

 pickStory(product) {
 if (!product) return null;
 if (product.colorSlug && this.productStories[product.colorSlug]) return this.productStories[product.colorSlug];
 if (product.category === 'charms') return this.productStories.charms;
 if (product.group === 'rtw' || product.category === 'tops' || product.category === 'bottoms') return this.productStories.rtw;
 if (product.category === 'bags') return this.productStories.bags;
 return null;
 },
};

const ss26 = (name) => `assets/lookbook-ss26-27/embedded/${name}`;

YZA.media.editorialBreaks = [
 {
 layout: 'duo',
 kicker: { fr: 'Portée par les YZA Girls', en: 'Worn by the YZA Girls' },
 title: { fr: 'Un panier, mille histoires.', en: 'One basket, a thousand stories.' },
 text: {
 fr: 'Les images portées montrent la vraie échelle, la tenue des anses et la façon dont chaque couleur dialogue avec un look.',
 en: 'Worn images show true scale, handle structure and how every colour works with an outfit.',
 },
 images: [girlAsset('girls-rim-yellow.jpg'), girlAsset('girls-fanny-door.jpg')],
 },
 {
 layout: 'duo',
 kicker: { fr: 'Plus de mains, moins de machines', en: 'More hands, fewer machines' },
 title: { fr: 'Les détails qui font la différence.', en: 'The details that make the difference.' },
 text: {
 fr: 'Gros plans, portée, volume : la page montre le travail main avant de montrer le prix.',
 en: 'Close-up, worn scale and volume: the page shows the handwork before the price.',
 },
 images: [ss26('p43_img01_xref1325_6be88260cccd.jpeg'), ss26('p47_img01_xref1341_0932d247e77e.jpeg')],
 },
 {
 layout: 'wide',
 kicker: { fr: 'Édition limitée', en: 'Limited edition' },
 title: { fr: 'Quand une couleur part, elle ne revient jamais !', en: 'When a colour sells out, it never comes back.' },
 images: [girlAsset('girls-snap-flowers.jpg')],
 },
];

YZA.media.charmEditorialBreaks = [
 {
 layout: 'duo',
 kicker: { fr: 'Le geste, pas la machine', en: 'The gesture, not the machine' },
 title: { fr: 'Un charm suffit à changer un look.', en: 'One charm is enough to change a look.' },
 text: {
 fr: 'Crocheté à la main en raphia naturel, chaque fruit garde la texture du fil et l\'irrégularité qui le rend unique.',
 en: 'Hand-crocheted in natural raffia, each fruit carries the texture of the thread and the irregularity that makes it unique.',
 },
 images: ['assets/products/fruit-market/styling/charms-raffia-basket-bowl.jpg', 'assets/products/fruit-market/styling/charms-atelier-raffia-detail.jpg'],
 },
 {
 layout: 'wide',
 kicker: { fr: 'Fruit Market', en: 'Fruit Market' },
 title: { fr: 'La couleur du marché, en miniature.', en: 'The colour of the market, in miniature.' },
 images: ['assets/products/fruit-market/styling/charms-fruit-market-bundle.jpg'],
 },
 {
 layout: 'duo',
 kicker: { fr: 'Série limitée', en: 'Limited run' },
 title: { fr: 'Chaque fruit est une pièce distincte.', en: 'Each fruit is a distinct piece.' },
 text: {
 fr: 'Cerises, kiwis, citrons, tomates : la collection Fruit Market se porte seule ou en grappe, sur tous types de sacs.',
 en: 'Cherries, kiwis, lemons, tomatoes: the Fruit Market collection wears alone or in clusters, on any bag style.',
 },
 images: ['assets/products/fruit-market/vibe/vibe-watermelon-slice.jpg', 'assets/products/fruit-market/charm-orange-slice.jpg'],
 },
];

YZA.media.accessoryEditorialBreaks = [
 {
 layout: 'duo',
 kicker: { fr: 'Le fruit devient bijou', en: 'The fruit becomes jewellery' },
 title: { fr: 'Un bijou qui ne ressemble à aucun autre.', en: 'A jewel like no other.' },
 text: {
 fr: 'Boucles d\'oreilles et colliers en raphia crocheté main. Notre dernière addition à l\'univers YZA.',
 en: 'Hand-crocheted raffia earrings and necklaces. Our latest addition to the YZA universe.',
 },
 images: [ss26('p53_img01_xref1380_788fc851111b.jpeg'), ss26('p55_img01_xref1397_f3009f829bf8.jpeg')],
 },
 {
 layout: 'wide',
 kicker: { fr: 'Crochet main, raphia naturel', en: 'Hand crochet, natural raffia' },
 title: { fr: 'La même main, un autre geste.', en: 'The same hand, a different gesture.' },
 images: [ss26('p57_img01_xref1408_1bfc31d48bf8.jpeg')],
 },
 {
 layout: 'duo',
 kicker: { fr: 'Série limitée', en: 'Limited run' },
 title: { fr: 'Chaque fruit, une silhouette.', en: 'Each fruit, a silhouette.' },
 text: {
 fr: 'Cerises, raisins, citrons, kiwis : la collection change chaque saison. Ce qui part ne revient pas.',
 en: 'Cherries, grapes, lemons, kiwis: the collection changes every season. What sells out, stays out.',
 },
 images: ['assets/products/fruit-market/earrings-watermelon.jpg', 'assets/products/fruit-market/necklace-lemon-slice.jpg'],
 },
];

YZA.media.bagsEditorialBreaks = [
 {
 layout: 'duo',
 kicker: { fr: 'Éditions limitées · Marrakech', en: 'Limited editions · Marrakech' },
 title: { fr: '15 par taille et par coloris. Ce qui part ne revient pas.', en: '15 per size per colour. What goes, stays gone.' },
 text: {
 fr: "Fait main dans l'atelier de Guéliz, Marrakech. Structure en feuilles de bananier séchées, tressage raffia couche par couche, bordures en cuir cousues à l'aiguille, anses finies à la perle. Chaque panier est numéroté : 15 pièces par taille et par coloris.",
 en: "Hand-assembled in the Guéliz atelier, Marrakech. Dried banana-leaf core, layer-by-layer raffia weaving, needle-stitched leather trim, bead-finished handles. Each bag is numbered: 15 pieces per size and per colour.",
 },
 images: [ss26('p42_img01_xref1321_1a08834f9d69.jpeg'), ss26('p40_img01_xref1305_5ae097cc9e5a.jpeg')],
 },
 {
 layout: 'wide',
 kicker: { fr: "L'atelier, Marrakech", en: 'The atelier, Marrakech' },
 title: { fr: 'Là où chaque panier commence.', en: 'Where every basket begins.' },
 images: ['assets/atelier/atelier-wide.jpg'],
 },
 {
 layout: 'duo',
 kicker: { fr: 'Porté par les YZA girls', en: 'Worn by the YZA girls' },
 title: { fr: 'Porté par vous. Reconnu par toutes.', en: 'Carried by you. Recognised by all.' },
 text: {
 fr: "Le panier YZA se reconnaît. Sur la corniche, au souk, à l'hôtel - il dit quelque chose sur la femme qui le porte. Ce sont nos clientes qui lui donnent sa vraie dimension.",
 en: "The YZA basket is recognisable. On the promenade, at the souk, in the hotel - it says something about the woman who carries it. Our customers give it its true dimension.",
 },
 images: [girlAsset('girls-rim-yellow.jpg'), girlAsset('girls-fanny-desert.jpg')],
 },
];

YZA.media.rtwEditorialBreaks = [
 {
 layout: 'duo',
 kicker: { fr: 'Sans taille, sans stress', en: 'One fit, every body' },
 title: { fr: 'Aucune prise de tête sur le sizing.', en: 'No second-guessing your size.' },
 text: {
 fr: "Chaque pièce Jawhara s'ajuste à votre corps - pas l'inverse. Du XS au XL, vous portez la même taille. À prêter à vos sœurs, à emporter en vacances : le vêtement suit, sans question. Aucune mesure à connaître, aucune hésitation.",
 en: "Each Jawhara piece adjusts to your body - not the other way around. XS to XL, same size. Lend it to your sister, pack it for a holiday: the garment follows, no questions asked. No measurements to know, no hesitation.",
 },
 images: [ss26('p30_img01_xref1219_8b2d1136309d.jpeg'), ss26('p29_img02_xref1213_fe747a323e9f.jpeg')],
 },
 {
 layout: 'wide',
 kicker: { fr: 'Jawhara SS26', en: 'Jawhara SS26' },
 title: { fr: 'Le vêtement comme geste.', en: 'Garment as gesture.' },
 images: [ss26('p33_img01_xref1246_c55ecdd663e2.jpeg')],
 },
 {
 layout: 'duo',
 kicker: { fr: 'Le tissu Jawhara', en: 'The Jawhara fabric' },
 title: { fr: 'Tissé à Marrakech. Pensé pour voyager.', en: 'Woven in Marrakech. Built to travel.' },
 text: {
 fr: "Ce n'est pas le brocart de soie traditionnel - fragile et difficile à entretenir. La faille Jawhara mêle un fil local à de la viscose : elle ne froisse presque pas, se lave facilement, et garde son éclat. Du beach club au dîner chic à l'hôtel - sans changer de valise.",
 en: "This is not traditional silk brocade - fragile and high-maintenance. Jawhara faille blends a local thread with viscose: barely wrinkles, washes easily, holds its lustre. Beach club to candlelit hotel dinner - no wardrobe change needed.",
 },
 images: [ss26('p36_img01_xref1270_d0b9fda05a39.jpeg'), ss26('p37_img02_xref1278_cd1f2a505109.jpeg')],
 },
 {
 layout: 'duo',
 kicker: { fr: 'À composer comme on veut', en: 'Mix and match freely' },
 title: { fr: 'Un haut. Un bas. Un set. À vous d\'inventer le reste.', en: 'A top. A bottom. A set. The rest is yours to invent.' },
 text: {
 fr: "Chaque pièce fonctionne seule ou en ensemble. Le pareo devient jupe courte ou longue. Le top scarf noué différemment change de silhouette. La collection Jawhara se compose et se recompose - au gré de l'envie, de la saison, de la journée.",
 en: "Every piece works alone or as a set. The pareo becomes a short or long skirt. The scarf top tied differently changes the whole silhouette. The Jawhara collection composes and recomposes - with your mood, the season, the moment.",
 },
 images: [ss26('p34_img01_xref1253_5a9f30b239d6.jpeg'), ss26('p38_img04_xref1290_050054976c5b.jpeg')],
 },
 {
 layout: 'wide',
 kicker: { fr: 'La garde-robe moderne de Marrakech', en: 'The modern Marrakech wardrobe' },
 title: { fr: 'Pas une djellaba. Ce que les femmes portent vraiment.', en: 'Not a djellaba. What women here actually wear.' },
 images: [ss26('p38_img01_xref1287_56cb4d596aa0.jpeg')],
 },
 {
 layout: 'duo',
 kicker: { fr: 'Lala Fatima à l\'atelier', en: 'Lala Fatima at the atelier' },
 title: { fr: 'Ce qui est fait à la main ne se refait jamais tout à fait pareil.', en: 'What is made by hand is never made quite the same way twice.' },
 text: {
 fr: "Pampilles en perles dorées réalisées à la main, signe berbère brodé ou perlé : chaque pièce Jawhara porte la signature de Lala Fatima. Pantalons, tops, pareos, robes - la collection se porte seule ou en pièces séparées. Ce qui part ne revient pas.",
 en: "Hand-crafted golden bead tassels, hand-beaded or embroidered Berber signs: each Jawhara piece carries Lala Fatima's signature. Trousers, tops, pareos, dresses - worn alone or as separates. What sells out, stays out.",
 },
 images: [ss26('p32_img04_xref1239_3935f6e23a7c.jpeg'), ss26('p34_img03_xref1255_5291eb6efa41.jpeg')],
 },
];

Object.assign(YZA.media.productStories.bags, {
 images: [ss26('p40_img01_xref1305_5ae097cc9e5a.jpeg'), ss26('p42_img01_xref1321_1a08834f9d69.jpeg'), ss26('p46_img01_xref1337_7dae31225680.jpeg')],
 cta: 'collections.html?cat=bags',
});
Object.assign(YZA.media.productStories.jaune, {
 title: { fr: 'Solaire, visible, Marrakech.', en: 'Sunlit, visible, Marrakech.' },
 text: {
 fr: 'Pour le lancement, le jaune vit dans les fruits en raphia: citron, orange, tomate et compositions de marche. La couleur reste vive, sans revenir aux anciens visuels de sacs.',
 en: 'For launch, yellow lives in raffia fruits: lemon, orange, tomato and market compositions. The colour stays bright without returning to older bag visuals.',
 },
 label: { fr: 'Fruit Market / crochet main', en: 'Fruit Market / hand crochet' },
 images: ['assets/products/fruit-market/styling/charms-raffia-basket-bowl.jpg', 'assets/products/fruit-market/styling/charms-fruit-market-bundle.jpg', 'assets/products/fruit-market/charm-whole-lemon.jpg'],
 cta: 'collections.html?cat=charms',
});
Object.assign(YZA.media.productStories.violet, {
 images: [ss26('p41_img03_xref1315_841b5b884798.jpeg'), ss26('p44_img01_xref1329_bf91110d6d83.jpeg'), ss26('p45_img01_xref1333_caaad580c061.jpeg')],
 cta: 'produit.html?handle=la-sculpture-s-basket-bag-ss26',
});
Object.assign(YZA.media.productStories.noir, {
 images: [ss26('p46_img01_xref1337_7dae31225680.jpeg'), ss26('p47_img01_xref1341_0932d247e77e.jpeg'), ss26('p48_img03_xref1347_e6608af984d1.jpeg')],
 cta: 'produit.html?handle=la-sculpture-m-basket-bag-ss26',
});
Object.assign(YZA.media.productStories.rouge, {
 images: [ss26('p40_img01_xref1305_5ae097cc9e5a.jpeg'), ss26('p42_img01_xref1321_1a08834f9d69.jpeg'), ss26('p43_img01_xref1325_6be88260cccd.jpeg')],
 cta: 'produit.html?handle=la-sculpture-xs-basket-bag-ss26',
});
Object.assign(YZA.media.productStories.charms, {
 images: ['assets/products/fruit-market/charm-cherries.jpg', 'assets/products/fruit-market/charm-orange-slice.jpg', 'assets/products/fruit-market/vibe/vibe-watermelon-slice.jpg'],
 cta: 'collections.html?cat=charms',
});
Object.assign(YZA.media.productStories.rtw, {
 images: [ss26('p29_img04_xref1215_ea0a78123e7b.jpeg'), ss26('p30_img03_xref1221_6a80517bd62a.jpeg'), ss26('p38_img01_xref1287_56cb4d596aa0.jpeg')],
 cta: 'collections.html?cat=rtw',
});
YZA.media.productStories.accessories = {
 title: { fr: 'Le fruit devient bijou de silhouette.', en: 'The fruit becomes a styling jewel.' },
 text: {
 fr: 'Boucles et colliers gardent le meme langage que les charms: crochet main, raphia, fruit et finition cadeau.',
 en: 'Earrings and necklaces keep the same language as the charms: hand crochet, raffia, fruit and gift-ready finishing.',
 },
 label: { fr: 'gift-ready / crochet main', en: 'gift-ready / hand crochet' },
 images: ['assets/products/fruit-market/earrings-watermelon.jpg', 'assets/products/fruit-market/necklace-lemon-slice.jpg', 'assets/products/fruit-market/earrings-kiwi.jpg'],
 cta: 'collections.html?cat=accessories',
};
YZA.media.pickStory = function pickStory(product) {
 if (!product) return null;
 // Category first, so a bag colour story never leaks onto an accessory / RTW page.
 if (product.category === 'charms') return this.productStories.charms;
 if (product.category === 'earrings' || product.category === 'necklaces' || product.category === 'accessories') return this.productStories.accessories;
 if (product.group === 'rtw' || product.category === 'tops' || product.category === 'pareos' || product.category === 'pants' || product.category === 'rtw') return this.productStories.rtw;
 if (product.category === 'bags' || product.group === 'bags') {
 if (product.colorSlug && this.productStories[product.colorSlug]) return this.productStories[product.colorSlug];
 return this.productStories.bags;
 }
 return null;
};

const GIRL_LOOK_MATCH = {
 violet: ['la-sculpture-s-basket-bag-ss26'],
 noir: ['la-sculpture-m-basket-bag-ss26'],
 rouge: ['la-sculpture-xs-basket-bag-ss26'],
 bougainvillier: ['la-sculpture-s-basket-bag-ss26'],
 fuschia: ['la-sculpture-xs-basket-bag-ss26'],
 naturel: ['la-sculpture-m-basket-bag-ss26'],
 nude: ['la-sculpture-xs-basket-bag-ss26'],
 desert: ['la-sculpture-s-basket-bag-ss26'],
 marron: ['la-sculpture-xs-basket-bag-ss26'],
 jaune: ['raffia-whole-lemon-charm-ss26'],
 editorial: ['yza-pareo-skirt-midi-jawhara-ss26'],
};

YZA.media.yzaGirls.forEach((girl) => {
 const handles = GIRL_LOOK_MATCH[girl.color] || ['trio-charms-fruit-market'];
 girl.lookProductHandles = handles.filter((handle) => !YZA.getProduct || YZA.getProduct(handle));
 girl.lookHref = girl.lookProductHandles[0]
 ? `produit.html?handle=${girl.lookProductHandles[0]}`
 : 'collections.html';
});
