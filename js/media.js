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
 city: 'Agadir',
 color: 'jaune',
 product: 'La Vague S Tournesol',
 src: girlAsset('girls-rim-yellow.jpg'),
 alt: { fr: 'YZA Girl portant un sac La Vague jaune à Marrakech', en: 'YZA Girl wearing a yellow La Vague bag in Marrakech', es: 'YZA Girl con bolso La Vague amarillo en Marrakech', tr: 'Marrakech\'te sarı La Vague çanta taşıyan YZA Girl', ar: 'فتاة YZA تحمل حقيبة La Vague الصفراء في مراكش' },
 },
 {
 id: 'rim-yellow-blue',
 name: 'Rim',
 city: 'Marrakech',
 color: 'jaune',
 product: 'La Vague S Tournesol',
 src: girlAsset('girls-rim-blue-yellow.jpg'),
 alt: { fr: 'YZA Girl portant un sac YZA jaune et bleu', en: 'YZA Girl carrying a yellow and blue YZA bag', es: 'YZA Girl con bolso YZA amarillo y azul', tr: 'Sarı ve mavi YZA çanta taşıyan YZA Girl', ar: 'فتاة YZA تحمل حقيبة YZA بالأصفر والأزرق' },
 },
 {
 id: 'rim-violet',
 name: 'Rim',
 city: 'Tanger',
 color: 'violet',
 product: 'La Vague S Violet · sur mesure',
 src: girlAsset('girls-rim-violet.jpg'),
 alt: { fr: 'YZA Girl portant un sac YZA violet', en: 'YZA Girl wearing a violet YZA bag', es: 'YZA Girl con bolso YZA violeta', tr: 'Mor YZA çanta taşıyan YZA Girl', ar: 'فتاة YZA تحمل حقيبة YZA البنفسجية' },
 },
 {
 id: 'fanny-yellow',
 name: 'Fanny',
 city: 'Saint Rémy de Provence',
 color: 'jaune',
 product: 'La Vague S Tournesol',
 src: girlAsset('girls-fanny-yellow.jpg'),
 alt: { fr: 'YZA Girl avec sac YZA jaune et détails crochet', en: 'YZA Girl with yellow YZA bag and crochet details', es: 'YZA Girl con bolso YZA amarillo y detalles de ganchillo', tr: 'Sarı YZA çanta ve tığ işi detaylarıyla YZA Girl', ar: 'فتاة YZA مع حقيبة YZA الصفراء وتفاصيل الكروشيه' },
 },
 {
 id: 'fanny-door',
 name: 'Fanny',
 city: 'Paris',
 color: 'jaune',
 product: 'La Vague XS Nude',
 src: girlAsset('girls-fanny-door.jpg'),
 alt: { fr: 'YZA Girl en ensemble bleu avec sac jaune', en: 'YZA Girl wearing blue set and yellow bag', es: 'YZA Girl con conjunto azul y bolso amarillo', tr: 'Mavi set ve sarı çantayla YZA Girl', ar: 'فتاة YZA بطقم أزرق وحقيبة صفراء' },
 },
 {
 id: 'fanny-jaune',
 name: 'Fanny',
 city: 'Saint Rémy de Provence',
 color: 'jaune',
 product: 'La Vague S Jaune',
 src: girlAsset('girls-fanny-jaune.jpg'),
 alt: { fr: 'Gros plan styling du sac YZA jaune', en: 'Close styling image of yellow YZA bag', es: 'Imagen de estilismo del bolso YZA amarillo en detalle', tr: 'Sarı YZA çantanın yakın çekim stil görüntüsü', ar: 'صورة قريبة لحقيبة YZA الصفراء' },
 },
 {
 id: 'fanny-xs-nude',
 name: 'Fanny',
 city: 'Paris',
 color: 'nude',
 product: 'La Vague XS Nude',
 src: girlAsset('girls-fanny-xs-nude.jpg'),
 alt: { fr: 'YZA Girl portant un panier YZA XS nude', en: 'YZA Girl wearing a nude XS YZA basket', es: 'YZA Girl con cesta YZA XS en color nude', tr: 'Nude rengi XS YZA sepet taşıyan YZA Girl', ar: 'فتاة YZA تحمل سلة YZA بحجم XS باللون البيج' },
 },
 {
 id: 'fanny-desert',
 name: 'Fanny',
 city: 'Marrakech',
 color: 'desert',
 product: 'La Vague S Desert',
 src: girlAsset('girls-fanny-desert.jpg'),
 alt: { fr: 'YZA Girl portant un panier YZA couleur désert', en: 'YZA Girl styling a desert color YZA basket', es: 'YZA Girl estilizando una cesta YZA en color desierto', tr: 'Çöl rengi YZA sepetle poz veren YZA Girl', ar: 'فتاة YZA تحمل سلة YZA بلون الصحراء' },
 },
 {
 id: 'fanny-look',
 name: 'Fanny',
 city: 'Marrakech',
 color: 'violet',
 product: 'YZA styled look',
 src: girlAsset('girls-fanny-look.jpg'),
 alt: { fr: 'YZA Girl en tenue violette avec panier YZA', en: 'YZA Girl wearing a purple outfit with YZA basket', es: 'YZA Girl con conjunto morado y cesta YZA', tr: 'Mor kıyafetle YZA sepet taşıyan YZA Girl', ar: 'فتاة YZA بلباس بنفسجي مع سلة YZA' },
 },
 {
 id: 'fanny-purple',
 name: 'Fanny',
 city: 'Marrakech',
 color: 'violet',
 product: 'YZA styled look',
 src: girlAsset('girls-fanny-purple.jpg'),
 alt: { fr: 'YZA Girl dans un look resort violet', en: 'YZA Girl in a violet resort look', es: 'YZA Girl con look resort en violeta', tr: 'Mor resort görünümlü YZA Girl', ar: 'فتاة YZA بإطلالة منتجع بنفسجية' },
 },
 {
 id: 'amelie-vague-s',
 name: 'Amélie',
 city: 'Paris',
 color: 'naturel',
 product: 'La Vague S',
 src: girlAsset('girls-amelie-vague-s.jpg'),
 alt: { fr: 'YZA Girl portant le panier La Vague S', en: 'YZA Girl carrying La Vague S basket', es: 'YZA Girl con la cesta La Vague S', tr: 'La Vague S sepet taşıyan YZA Girl', ar: 'فتاة YZA تحمل سلة La Vague S' },
 },
 {
 id: 'amelie-bougainvillier',
 name: 'Amélie',
 city: 'Paris',
 color: 'bougainvillier',
 product: 'La Vague S Bougainvillier',
 src: girlAsset('girls-amelie-bougainvillier.jpg'),
 alt: { fr: 'Panier YZA aux accents bougainvillier porté par le modèle', en: 'YZA basket with bougainvillier accents worn by model', es: 'Cesta YZA con detalles buganvilla en el modelo', tr: 'Modelin taşıdığı bougainvillier detaylı YZA sepet', ar: 'سلة YZA بلمسات البوغانفيليا يرتديها موديل' },
 },
 {
 id: 'amelie-fuschia',
 name: 'Amélie',
 city: 'Paris',
 color: 'fuschia',
 product: 'La Vague S Fuschia',
 src: girlAsset('girls-amelie-fuschia.jpg'),
 alt: { fr: 'Panier YZA aux anses fuchsia porté par le modèle', en: 'YZA basket with fuschia handles worn by model', es: 'Cesta YZA con asas fucsia en el modelo', tr: 'Modelin taşıdığı fuşya saplı YZA sepet', ar: 'سلة YZA بمقابض فوشيا يرتديها موديل' },
 },
 {
 id: 'amelie-look',
 name: 'Amélie',
 city: 'Paris',
 color: 'naturel',
 product: 'YZA styled look',
 src: girlAsset('girls-amelie-look.jpg'),
 alt: { fr: 'YZA Girl portant un panier YZA naturel', en: 'YZA Girl wearing a natural YZA basket', es: 'YZA Girl con cesta YZA en color natural', tr: 'Doğal renk YZA sepet taşıyan YZA Girl', ar: 'فتاة YZA تحمل سلة YZA بالألوان الطبيعية' },
 },
 {
 id: 'amelie-portrait',
 name: 'Amélie',
 city: 'Paris',
 color: 'naturel',
 product: 'YZA styled look',
 src: girlAsset('girls-amelie-portrait.jpg'),
 alt: { fr: 'Portrait d\'une YZA Girl avec styling YZA', en: 'YZA Girl portrait with YZA styling', es: 'Retrato de YZA Girl con estilismo YZA', tr: 'YZA stiliyle YZA Girl portresi', ar: 'بورتريه لفتاة YZA بأسلوب YZA' },
 },
 {
 id: 'josephine-marron',
 name: 'Joséphine',
 city: 'Paris',
 color: 'marron',
 product: 'La Vague S Marron',
 src: girlAsset('girls-josephine-marron.jpg'),
 alt: { fr: 'Panier YZA dans un story styling de bar à vins', en: 'YZA basket in a wine bar styling story', es: 'Cesta YZA en un reportaje de estilismo en un wine bar', tr: 'Şarap barı stil hikâyesinde YZA sepet', ar: 'سلة YZA في قصة تصوير بأجواء بار النبيذ' },
 },
 {
 id: 'rin-look-1',
 name: 'Rin',
 city: 'Berlin',
 color: 'editorial',
 product: 'YZA styled look',
 src: girlAsset('girls-rin-look-1.jpg'),
 alt: { fr: 'YZA Girl en shooting éditorial en extérieur', en: 'YZA Girl editorial styling outdoors', es: 'YZA Girl en estilismo editorial al aire libre', tr: 'Açık havada editoryal çekim yapan YZA Girl', ar: 'فتاة YZA في تصوير إديتوريال في الهواء الطلق' },
 },
 {
 id: 'rin-look-2',
 name: 'Rin',
 city: 'Berlin',
 color: 'editorial',
 product: 'YZA styled look',
 src: girlAsset('girls-rin-look-2.jpg'),
 alt: { fr: 'YZA Girl dans un look resort à l\'énergie YZA', en: 'YZA Girl wearing resort look with YZA energy', es: 'YZA Girl con look resort y la energía YZA', tr: 'YZA enerjisiyle resort görünüm taşıyan YZA Girl', ar: 'فتاة YZA بإطلالة منتجع بروح YZA' },
 },
 {
 id: 'rin-look-3',
 name: 'Rin',
 city: 'Berlin',
 color: 'editorial',
 product: 'YZA styled look',
 src: girlAsset('girls-rin-look-3.jpg'),
 alt: { fr: 'YZA Girl en image de street style', en: 'YZA Girl street styling image', es: 'Imagen de street style de YZA Girl', tr: 'YZA Girl sokak stili görüntüsü', ar: 'صورة ستريت ستايل لفتاة YZA' },
 },
 {
 id: 'snap-flowers',
 name: 'YZA Girl',
 city: 'Marrakech',
 color: 'editorial',
 product: 'YZA styled look',
 src: girlAsset('girls-snap-flowers.jpg'),
 alt: { fr: 'YZA Girl tenant des fleurs avec un panier YZA', en: 'YZA Girl holding flowers with a YZA basket', es: 'YZA Girl con flores y una cesta YZA', tr: 'Çiçek tutan ve YZA sepet taşıyan YZA Girl', ar: 'فتاة YZA تمسك زهوراً مع سلة YZA' },
 },
 {
 id: 'rim-yellow-alt',
 name: 'Rim',
 city: 'Marrakech',
 color: 'jaune',
 product: 'YZA styled look',
 src: girlAsset('girls-rim-yellow-alt.jpg'),
 alt: { fr: 'YZA Girl à un festival avec le sac La Sculpture jaune', en: 'YZA Girl at a festival with yellow La Sculpture bag', es: 'YZA Girl en un festival con el bolso La Sculpture amarillo', tr: 'Festivalde sarı La Sculpture çantasıyla YZA Girl', ar: 'فتاة YZA في مهرجان مع حقيبة La Sculpture الصفراء' },
 },
 {
 id: 'intro-cafe',
 name: 'Rim',
 city: 'Marrakech',
 color: 'jaune',
 product: 'YZA styled look',
 src: girlAsset('girls-intro-cafe.jpg'),
 alt: { fr: 'YZA Girl à un événement nocturne avec le sac La Sculpture jaune', en: 'YZA Girl at a night event with yellow La Sculpture bag', es: 'YZA Girl en un evento nocturno con el bolso La Sculpture amarillo', tr: 'Gece etkinliğinde sarı La Sculpture çantasıyla YZA Girl', ar: 'فتاة YZA في حدث ليلي مع حقيبة La Sculpture الصفراء' },
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
 title: { fr: 'Une couleur, jamais deux fois.', en: 'One colour, never twice.' },
 images: [girlAsset('girls-snap-flowers.jpg')],
 },
 ],

 proofPoints: {
 home: [
 ['women-only.png', { fr: 'Atelier 100 % femmes a Guéliz', en: 'All-women atelier in Guéliz', es: 'Atelier 100 % mujeres en Guéliz', tr: 'Guéliz\'de tamamen kadınlardan oluşan atölye', ar: 'أتيلييه نسائي 100 % في Guéliz' }],
 ['more-hands.png', { fr: 'Crochet main, pas de ligne machine', en: 'Hand crochet, no machine line', es: 'Ganchillo a mano, sin línea de máquina', tr: 'Elle tığ işi, makine hattı yok', ar: 'كروشيه يدوي، دون خطوط آلية' }],
 ['less-waste.png', { fr: 'Editions limitees, moins de stock mort', en: 'Limited editions, less dead stock', es: 'Ediciones limitadas, menos stock muerto', tr: 'Sınırlı üretim, daha az ata stok', ar: 'إصدارات محدودة، مخزون أقل' }],
 ['loved-shared.png', { fr: 'Pieces faites pour circuler', en: 'Pieces made to be shared', es: 'Piezas hechas para circular', tr: 'Paylaşılmak için yapılan parçalar', ar: 'قطع مصنوعة لتتداول' }],
 ],
 product: [
 ['woven-line.png', { fr: 'Tension de raphia controlee a la main', en: 'Hand-controlled raffia tension', es: 'Tensión de rafia controlada a mano', tr: 'Elle kontrol edilen rafya gerilimi', ar: 'شد الرافيا متحكّم به يدوياً' }],
 ['atelier-house.png', { fr: 'Finitions verifiees piece par piece', en: 'Finishing checked piece by piece', es: 'Acabados verificados pieza a pieza', tr: 'Bitirme parça parça kontrol edilir', ar: 'التشطيب يُفحص قطعة بقطعة' }],
 ['less-waste.png', { fr: 'Reparation et soin possibles via l atelier', en: 'Repair and care support through the atelier', es: 'Reparación y cuidado posibles a través del atelier', tr: 'Atölye aracılığıyla onarım ve bakım mümkün', ar: 'إمكانية الإصلاح والعناية عبر الأتيلييه' }],
 ['women-only.png', { fr: 'Chaque achat soutient des mains specialisees', en: 'Every purchase supports specialized hands', es: 'Cada compra apoya manos especializadas', tr: 'Her satın alma uzman elleri destekler', ar: 'كل شراء يدعم أيدي متخصصة' }],
 ],
 },

 productStories: {
 bags: {
 title: { fr: 'Porté par vous. Reconnu par toutes.', en: 'Carried by you. Recognised by all.', es: 'Llevado por ti. Reconocido por todas.', tr: 'Seninle taşınan. Herkesçe tanınan.', ar: 'تحملينه أنتِ. تعرفه كلّ.' },
 text: {
 fr: 'Chaque taille prend une présence différente sur le corps. La galerie associe détails, produits et images de clientes pour montrer la vraie valeur du crochet.',
 en: 'Every size has a different presence on the body. The gallery connects detail, product and community images to show the true value of the crochet.',
 es: 'Cada talla tiene una presencia diferente en el cuerpo. La galería une detalles, productos e imágenes de clientas para mostrar el verdadero valor del ganchillo.',
 tr: 'Her bedenin vücutta farklı bir duruşu var. Galeri; detay, ürün ve topluluk görüntülerini bir araya getirerek tığ işinin gerçek değerini gösterir.',
 ar: 'لكل مقاس حضور مختلف على الجسد. المعرض يجمع التفاصيل والمنتجات وصور العميلات لإظهار القيمة الحقيقية للكروشيه.',
 },
 label: { fr: 'crochet main / serie limitee / non refait', en: 'hand crochet / limited run / not remade', es: 'ganchillo a mano / serie limitada / no repetido', tr: 'elle tığ işi / sınırlı seri / tekrar üretilmez', ar: 'كروشيه يدوي / سلسلة محدودة / لن يُعاد' },
 images: [girlAsset('girls-rim-yellow.jpg'), girlAsset('girls-amelie-vague-s.jpg'), girlAsset('girls-fanny-desert.jpg')],
 cta: 'collections.html?cat=bags',
 },
 jaune: {
 title: { fr: 'Jaune: solaire, visible, Marrakech.', en: 'Yellow: sunlit, visible, Marrakech.', es: 'Amarillo: solar, visible, Marrakech.', tr: 'Sarı: güneşli, göze çarpan, Marrakech.', ar: 'أصفر: شمسي، لافت، Marrakech.' },
 text: {
 fr: 'Le jaune YZA vit tres bien avec le bleu Majorelle, le blanc et les looks vacances. C est la couleur qui transforme le panier en signature.',
 en: 'YZA yellow works with Majorelle blue, white and resort looks. It turns the basket into a signature.',
 es: 'El amarillo YZA va muy bien con el azul Majorelle, el blanco y los looks de resort. Es el color que convierte la cesta en firma.',
 tr: 'YZA sarısı Majorelle mavisiyle, beyazla ve tatil kombinleriyle çok iyi uyum sağlar. Sepeti imzaya dönüştüren renk.',
 ar: 'الأصفر YZA يتآلف مع أزرق Majorelle والأبيض وإطلالات المنتجع. إنه اللون الذي يحوّل السلة إلى توقيع.',
 },
 label: { fr: 'couleur capsule / non refait', en: 'capsule colour / not remade', es: 'color cápsula / no repetido', tr: 'kapsül renk / tekrar üretilmez', ar: 'لون كبسول / لن يُعاد' },
 images: [girlAsset('girls-rim-yellow.jpg'), girlAsset('girls-fanny-door.jpg'), girlAsset('girls-fanny-jaune.jpg')],
 cta: 'collections.html?cat=bags',
 },
 violet: {
 title: { fr: 'Violet: plus rare, plus mode.', en: 'Violet: rarer, more fashion.', es: 'Violeta: más raro, más moda.', tr: 'Mor: daha nadir, daha moda.', ar: 'بنفسجي: أندر، أكثر أناقة.' },
 text: {
 fr: 'A porter comme une piece de mode, pas comme un simple accessoire. Les details main rendent chaque boucle legerement vivante.',
 en: 'Wear it as a fashion piece, not a simple accessory. The handwork keeps every loop subtly alive.',
 es: 'Llévala como una pieza de moda, no como un simple accesorio. El trabajo a mano mantiene cada lazada sutilmente viva.',
 tr: 'Onu basit bir aksesuar olarak değil, bir moda parçası olarak taşıyın. El işiçiliği her iliği içten canlı tutar.',
 ar: 'احمليها كقطعة موضة، ليست مجرد إكسسوار. التفاصيل اليدوية تبقي كل حلقة حيّة بشكل خفيّ.',
 },
 label: { fr: 'edition limitee / finition main', en: 'limited edition / hand finishing', es: 'edición limitada / acabado a mano', tr: 'sınırlı üretim / el bitirme', ar: 'إصدار محدود / تشطيب يدوي' },
 images: [girlAsset('girls-rim-violet.jpg'), girlAsset('girls-fanny-purple.jpg'), 'assets/products/bag-sculpture-violet.jpg'],
 cta: 'collections.html?cat=bags',
 },
 noir: {
 title: { fr: 'Noir: la version la plus nette.', en: 'Black: the sharpest version.', es: 'Negro: la versión más definida.', tr: 'Siyah: en keskin versiyon.', ar: 'أسود: النسخة الأكثر حدّة.' },
 text: {
 fr: 'Le noir donne au tressage une lecture plus graphique. Il fonctionne en boutique locale comme sur Instagram parce qu il reste facile a porter.',
 en: 'Black makes the weave read more graphically. It works locally and on Instagram because it remains easy to wear.',
 es: 'El negro da al trenzado una lectura más gráfica. Funciona en tienda local y en Instagram porque sigue siendo fácil de llevar.',
 tr: 'Siyah, örgüye daha grafik bir görünüm katar. Hem yerel mağazada hem Instagram’da işe yarar — giymesi kolay kalmaya devam eder.',
 ar: 'الأسود يمنح الجديلة طابعاً غرافيكياً أكثر. يعمل في المتجر المحلي وعلى إنستغرام لأنه سهل الارتداء.',
 },
 label: { fr: '15 par taille et couleur', en: '15 per size and colour', es: '15 por talla y color', tr: 'Beden ve renk başına 15', ar: '15 لكل مقاس ولون' },
 images: ['assets/products/bag-sculpture-black.jpg', 'assets/products/bag-sculpture-black-detail.jpg', 'assets/products/bag-sculpture-black-still.jpg'],
 cta: 'collections.html?cat=bags',
 },
 rouge: {
 title: { fr: 'Rouge: contraste et main visible.', en: 'Red: contrast and visible handwork.', es: 'Rojo: contraste y artesanía visible.', tr: 'Kırmızı: kontrast ve görünür el işiçiliği.', ar: 'أحمر: تباين وحرفة ظاهرة.' },
 text: {
 fr: 'Le rouge met en evidence les anses, les perles et l assemblage. C est une couleur qui justifie le detail.',
 en: 'Red highlights handles, beadwork and assembly. It is a colour that makes the detail legible.',
 es: 'El rojo resalta las asas, el trabajo con cuentas y el ensamblaje. Es un color que justifica el detalle.',
 tr: 'Kırmızı, sapları, boncuk işini ve montajı öne çıkarır. Detayı okunabilir kılan bir renk.',
 ar: 'الأحمر يبرز المقابض والخرز والتجميع. لون يجعل التفاصيل مقروءة.',
 },
 label: { fr: 'finition couleur / non refait', en: 'colour finishing / not remade', es: 'acabado en color / no repetido', tr: 'renk bitirme / tekrar üretilmez', ar: 'تشطيب لوني / لن يُعاد' },
 images: ['assets/products/bag-sculpture-red.jpg', 'assets/products/bag-sculpture-red-seated.jpg', 'assets/products/charms-on-bag.jpg'],
 cta: 'collections.html?cat=bags',
 },
 charms: {
 title: { fr: 'Le fruit est petit, mais le geste est long.', en: 'The fruit is small, but the handwork is long.', es: 'El fruto es pequeño, pero el gesto es largo.', tr: 'Meyve küçük, ama el emeği uzun.', ar: 'الثمرة صغيرة، لكن الجهد طويل.' },
 text: {
 fr: 'Un charm peut demander plusieurs heures: la forme, la tension et l etiquette doree donnent la difference entre souvenir et objet de mode.',
 en: 'A charm can take hours: shape, tension and the gold tag make the difference between souvenir and fashion object.',
 es: 'Un charm puede llevar horas: la forma, la tensión y la etiqueta dorada marcan la diferencia entre recuerdo y objeto de moda.',
 tr: 'Bir charm saatler alabilir: şekil, gerginlik ve altın etiket, souvenirle moda objesi arasındaki farkı yaratır.',
 ar: 'يمكن للقطعة أن تستغرق ساعات: الشكل، التوتر والبطاقة الذهبية تصنع الفرق بين تذكار وقطعة موضة.',
 },
 label: { fr: '2 a 3 h de crochet / bundle 3 charms', en: '2 to 3h crochet / 3 charm bundle', es: '2 a 3 h de ganchillo / pack de 3 charms', tr: '2-3 saat tığ işi / 3 charm paketi', ar: '2 إلى 3 ساعات كروشيه / طقم 3 قطع' },
 images: ['assets/products/charm-orange-hero.jpg', 'assets/products/charms-cluster.jpg', 'assets/products/charms-on-bag.jpg'],
 cta: 'collections.html?cat=charms',
 },
 rtw: {
 title: { fr: 'Pas de taille à connaître. Juste à porter.', en: 'No size to know. Just wear it.', es: 'Sin talla que conocer. Solo ponérselo.', tr: 'Bilmeniz gereken beden yok. Sadece giyin.', ar: 'لا مقاس تحتاجين معرفته. ارتديه.' },
 text: {
 fr: 'Chaque pièce Jawhara s\'ajuste à votre corps. Pampilles en perles dorées et signes berbères brodés à la main par Lala Fatima - à porter seul ou en set.',
 en: 'Every Jawhara piece adjusts to your body. Hand-crafted golden bead tassels and Berber signs by Lala Fatima - worn alone or as a set.',
 es: 'Cada pieza Jawhara se adapta a tu cuerpo. Pompones de cuentas doradas y signos beréberes bordados a mano por Lala Fatima, solos o en conjunto.',
 tr: 'Her Jawhara parçası bedeninize uyar. Lala Fatima\'nın elle yaptığı altın boncuklu saçaklar ve Berber işaretleri — tek başına veya set olarak giyilir.',
 ar: 'كل قطعة Jawhara تتأقلم مع جسدكِ. شراشيب ذهبية ورموز أمازيغية مطرّزة يداوياً بيد لالة فاطمة — منفردة أو كطقم.',
 },
 label: { fr: 'tailles libres / fait à l\'atelier', en: 'free sizes / atelier-made', es: 'tallas libres / hecho en el atelier', tr: 'serbest bedenler / atölyede yapılmış', ar: 'مقاييس حرة / مصنوع في الأتيلييه' },
 images: ['assets/yza-girls/girls-rin-look-3.jpg', 'assets/products/rtw-scarf-top.jpg', 'assets/products/rtw-palazzo-pants.jpg'],
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
 kicker: { fr: 'Portée par les YZA Girls', en: 'Worn by the YZA Girls', es: 'Llevado por las YZA Girls', tr: 'YZA Girls\'ın taşıdığı', ar: 'ترتديه YZA Girls' },
 title: { fr: 'Un panier, mille histoires.', en: 'One basket, a thousand stories.', es: 'Una cesta, mil historias.', tr: 'Bir sepet, bin hikâye.', ar: 'سلة واحدة، ألف قصة.' },
 text: {
 fr: 'Les images portées montrent la vraie échelle, la tenue des anses et la façon dont chaque couleur dialogue avec un look.',
 en: 'Worn images show true scale, handle structure and how every colour works with an outfit.',
 es: 'Las imágenes en uso muestran la escala real, la estructura de las asas y cómo cada color dialoga con un look.',
 tr: 'Taşınarak çekilen görüntüler gerçek ölçeği, sapların yapısını ve her rengin bir kombine nasıl uyum sağladığını gösterir.',
 ar: 'الصور الحاملة تُظهر الحجم الحقيقي وبنية المقابض وكيف يتناغم كل لون مع إطلالة كاملة.',
 },
 images: [girlAsset('girls-rim-yellow.jpg'), girlAsset('girls-fanny-door.jpg')],
 },
 {
 layout: 'duo',
 kicker: { fr: 'Plus de mains, moins de machines', en: 'More hands, fewer machines', es: 'Más manos, menos máquinas', tr: 'Daha çok el, daha az makine', ar: 'أيدĩ أكثر، آلات أقل' },
 title: { fr: 'Les détails qui font la différence.', en: 'The details that make the difference.', es: 'Los detalles que marcan la diferencia.', tr: 'Farkı yaratan detaylar.', ar: 'التفاصيل التي تصنع الفارق.' },
 text: {
 fr: 'Gros plans, portée, volume : la page montre le travail main avant de montrer le prix.',
 en: 'Close-up, worn scale and volume: the page shows the handwork before the price.',
 es: 'Primer plano, escala de uso y volumen: la página muestra el trabajo manual antes que el precio.',
 tr: 'Yakın çekim, taşınan ölçek ve hacim: sayfa fiyatı göstermeden önce el işçiliğini ortaya koyar.',
 ar: 'صور مقرّبة، الحجم الحقيقي، الكتلة — الصفحة تكشف الحرفة قبل السعر.',
 },
 images: [ss26('p43_img01_xref1325_6be88260cccd.jpeg'), ss26('p47_img01_xref1341_0932d247e77e.jpeg')],
 },
 {
 layout: 'wide',
 kicker: { fr: 'Édition limitée', en: 'Limited edition', es: 'Edición limitada', tr: 'Sınırlı üretim', ar: 'إصدار محدود' },
 title: { fr: 'Une couleur, jamais deux fois.', en: 'One colour, never twice.', es: 'Un color, nunca dos veces.', tr: 'Bir renk, asla iki kez.', ar: 'لون واحد، لن يتكرر أبداً.' },
 images: [girlAsset('girls-snap-flowers.jpg')],
 },
];

YZA.media.charmEditorialBreaks = [
 {
 layout: 'duo',
 kicker: { fr: 'Le geste, pas la machine', en: 'The gesture, not the machine', es: 'El gesto, no la máquina', tr: 'El emeği, makine değil', ar: 'الحرفة، لا الآلة' },
 title: { fr: 'Un charm suffit à changer un look.', en: 'One charm is enough to change a look.', es: 'Un charm basta para cambiar un look.', tr: 'Bir charm bir bakışı değiştirmeye yeter.', ar: 'قطعة واحدة تكفي لتحويل إطلالتك.' },
 text: {
 fr: 'Crocheté à la main en raphia naturel, chaque fruit garde la texture du fil et l\'irrégularité qui le rend unique.',
 en: 'Hand-crocheted in natural raffia, each fruit carries the texture of the thread and the irregularity that makes it unique.',
 es: 'Tejido a mano en rafia natural, cada fruto conserva la textura del hilo y la irregularidad que lo hace único.',
 tr: 'Doğal rafyadan elle tığ işiyle yapılan her meyve, ipliğin dokusunu ve onu eşsiz kılan düzünsüzlüğü taşır.',
 ar: 'كل ثمرة منسوجة يدوياً من الرافيا الطبيعية تحتفظ بملمس الخيط والتفرد الذي لا يتكرر.',
 },
 images: ['assets/products/fruit-market/styling/charms-raffia-basket-bowl.jpg', 'assets/products/fruit-market/styling/charms-atelier-raffia-detail.jpg'],
 },
 {
 layout: 'wide',
 kicker: { fr: 'Fruit Market', en: 'Fruit Market', es: 'Fruit Market', tr: 'Fruit Market', ar: 'Fruit Market' },
 title: { fr: 'La couleur du marché, en miniature.', en: 'The colour of the market, in miniature.', es: 'El color del mercado, en miniatura.', tr: 'Çarşının renkleri, minyatür hâliyle.', ar: 'ألوان السوق في حجم صغير.' },
 images: ['assets/products/fruit-market/styling/charms-fruit-market-bundle.jpg'],
 },
 {
 layout: 'duo',
 kicker: { fr: 'Série limitée', en: 'Limited run', es: 'Serie limitada', tr: 'Sınırlı seri', ar: 'سلسلة محدودة' },
 title: { fr: 'Chaque fruit est une pièce distincte.', en: 'Each fruit is a distinct piece.', es: 'Cada fruto es una pieza única.', tr: 'Her meyve ayrı bir parçadır.', ar: 'كل ثمرة قطعة بذاتها.' },
 text: {
 fr: 'Cerises, kiwis, citrons, tomates : la collection Fruit Market se porte seule ou en grappe, sur tous types de sacs.',
 en: 'Cherries, kiwis, lemons, tomatoes: the Fruit Market collection wears alone or in clusters, on any bag style.',
 es: 'Cerezas, kiwis, limones, tomates: la colección Fruit Market se lleva sola o en racimo, con cualquier bolso.',
 tr: 'Kiraz, kivi, limon, domates: Fruit Market koleksiyonu tek ya da küme hâlinde, her çantayla taşınır.',
 ar: 'كرز، كيوي، ليمون، طماطم — مجموعة Fruit Market تُرتدى منفردةً أو في حزمة، مع أي حقيبة.',
 },
 images: ['assets/products/fruit-market/vibe/vibe-watermelon-slice.jpg', 'assets/products/fruit-market/charm-orange-slice.jpg'],
 },
];

YZA.media.accessoryEditorialBreaks = [
 {
 layout: 'duo',
 kicker: { fr: 'Le fruit devient bijou', en: 'The fruit becomes jewellery', es: 'La fruta se convierte en joya', tr: 'Meyve takıya dönüşüyor', ar: 'الثمرة تصبح حليّة' },
 title: { fr: 'Un bijou qui ne ressemble à aucun autre.', en: 'A jewel like no other.', es: 'Una joya como ninguna otra.', tr: 'Hiçbir takıya benzemeyen bir parça.', ar: 'حليّة لا تشبه سواها.' },
 text: {
 fr: 'Boucles d\'oreilles et colliers en raphia crocheté main. Notre dernière addition à l\'univers YZA.',
 en: 'Hand-crocheted raffia earrings and necklaces. Our latest addition to the YZA universe.',
 es: 'Pendientes y collares de rafia tejida a mano. Última incorporación al universo YZA.',
 tr: 'Elle tığ işiyle örülmüş rafya küüpeler ve kolyeler. YZA evrenine en yeni eklenti.',
 ar: 'أقراط وعقود من الرافيا المحكوكة يدوياً. آخر إضافة لعالم YZA.',
 },
 images: [ss26('p53_img01_xref1380_788fc851111b.jpeg'), ss26('p55_img01_xref1397_f3009f829bf8.jpeg')],
 },
 {
 layout: 'wide',
 kicker: { fr: 'Crochet main, raphia naturel', en: 'Hand crochet, natural raffia', es: 'Ganchillo a mano, rafia natural', tr: 'Elle tığ işi, doğal rafya', ar: 'كروشيه يدوي، رافيا طبيعية' },
 title: { fr: 'La même main, un autre geste.', en: 'The same hand, a different gesture.', es: 'La misma mano, un gesto diferente.', tr: 'Aynı el, farklı bir dokunuş.', ar: 'نفس اليد، حركة مختلفة.' },
 images: [ss26('p57_img01_xref1408_1bfc31d48bf8.jpeg')],
 },
 {
 layout: 'duo',
 kicker: { fr: 'Série limitée', en: 'Limited run', es: 'Serie limitada', tr: 'Sınırlı seri', ar: 'سلسلة محدودة' },
 title: { fr: 'Chaque fruit, une silhouette.', en: 'Each fruit, a silhouette.', es: 'Cada fruto, una silueta.', tr: 'Her meyve, bir silhouet.', ar: 'كل ثمرة، سيلويت خاصة.' },
 text: {
 fr: 'Cerises, raisins, citrons, kiwis : la collection change chaque saison. Ce qui part ne revient pas.',
 en: 'Cherries, grapes, lemons, kiwis: the collection changes every season. What sells out, stays out.',
 es: 'Cerezas, uvas, limones, kiwis: la colección cambia cada temporada. Lo que se agota no vuelve.',
 tr: 'Kiraz, üzüm, limon, kivi: koleksiyon her sezon değişir. Biten geri gelmez.',
 ar: 'كرز، عنب، ليمون، كيوي — المجموعة تتجدد كل موسم. ما نفد، لن يعود.',
 },
 images: ['assets/products/fruit-market/earrings-watermelon.jpg', 'assets/products/fruit-market/necklace-lemon-slice.jpg'],
 },
];

YZA.media.bagsEditorialBreaks = [
 {
 layout: 'duo',
 kicker: { fr: 'Éditions limitées · Marrakech', en: 'Limited editions · Marrakech', es: 'Ediciones limitadas · Marrakech', tr: 'Sınırlı üretim · Marrakech', ar: 'إصدارات محدودة · Marrakech' },
 title: { fr: 'Ce qui part, ne revient plus.', en: 'What goes, stays gone.', es: 'Lo que se va, no vuelve.', tr: 'Giden, geri gelmez.', ar: 'ما رحل، لن يعود.' },
 text: {
 fr: "Fait main dans l'atelier de Guéliz, Marrakech. Structure en feuilles de bananier séchées, tressage raffia couche par couche, bordures en cuir cousues à l'aiguille, anses finies à la perle. Chaque panier est numéroté : 15 pièces par taille et par coloris.",
 en: "Hand-assembled in the Guéliz atelier, Marrakech. Dried banana-leaf core, layer-by-layer raffia weaving, needle-stitched leather trim, bead-finished handles. Each bag is numbered: 15 pieces per size and per colour.",
 es: "Hecho a mano en el atelier de Guéliz, Marrakech. Estructura de hojas de plátano secas, trenzado de rafia capa a capa, ribete de cuero cosido a mano, asas acabadas con cuentas. Cada bolso está numerado: 15 piezas por talla y color.",
 tr: "Guéliz atölyesinde el yapımı, Marrakech. Kuru muz yaprağı çekirdeği, kat kat rafya örgüsü, elle dikilen deri kenarlık, boncukla bitirilen saplar. Her çanta numaralandırılmıştır: boyut ve renk başına 15 parça.",
 ar: "مصنوع يدوياً في أتيلييه Guéliz، Marrakech. هيكل من أوراق الموز المجفّفة، جديلة رافيا طبقة فوق طبقة، حواف جلدية مخيطة يدوياً، مقابض مزيّنة بالخرز. كل حقيبة مرقّمة: 15 قطعة لكل مقاس ولون.",
 },
 images: [ss26('p42_img01_xref1321_1a08834f9d69.jpeg'), ss26('p40_img01_xref1305_5ae097cc9e5a.jpeg')],
 },
 {
 layout: 'wide',
 kicker: { fr: "L'atelier, Marrakech", en: 'The atelier, Marrakech', es: 'El atelier, Marrakech', tr: 'Atölye, Marrakech', ar: 'الأتيلييه، Marrakech' },
 title: { fr: 'Là où chaque panier commence.', en: 'Where every basket begins.', es: 'Donde comienza cada cesta.', tr: 'Her sepetin başladığı yer.', ar: 'حيثُ تبدأ كل سلة.' },
 images: ['assets/editorial/dataset/artisanes-atelier-raffia.jpg'],
 },
 {
 layout: 'duo',
 kicker: { fr: 'Porté par les YZA girls', en: 'Worn by the YZA girls', es: 'Llevado por las YZA girls', tr: 'YZA girls tarafından taşınıyor', ar: 'تحمله YZA girls' },
 title: { fr: 'Porté par vous. Reconnu par toutes.', en: 'Carried by you. Recognised by all.', es: 'Llevado por ti. Reconocido por todas.', tr: 'Seninle taşınan. Herkesçe tanınan.', ar: 'تحملينه أنتِ. تعرفه كلّ.' },
 text: {
 fr: "Le panier YZA se reconnaît. Sur la corniche, au souk, à l'hôtel - il dit quelque chose sur la femme qui le porte. Ce sont nos clientes qui lui donnent sa vraie dimension.",
 en: "The YZA basket is recognisable. On the promenade, at the souk, in the hotel - it says something about the woman who carries it. Our customers give it its true dimension.",
 es: "La cesta YZA es inconfundible. En el paseo, en el zoco, en el hotel: dice algo sobre la mujer que la lleva. Son nuestras clientas quienes le dan su verdadera dimensión.",
 tr: "YZA sepeti tanınırdır. Sahil yolunda, çarşıda, otelde — onu taşıyan kadın hakkında bir şey söyler. Müşterilerimiz ona gerçek boyutunu verir.",
 ar: "سلة YZA لا تخفى. على الكورنيش، في السوق، في الفندق — تقول شيئاً عن المرأة التي تحملها. زبوناتنا هن من يمنحها حجمها الحقيقي.",
 },
 images: [girlAsset('girls-rim-yellow.jpg'), girlAsset('girls-fanny-desert.jpg')],
 },
];

YZA.media.rtwEditorialBreaks = [
 {
 layout: 'duo',
 kicker: { fr: 'Sans taille, sans stress', en: 'One fit, every body', es: 'Una talla, todos los cuerpos', tr: 'Beden sorunu yok, sadece giy', ar: 'بدون مقاس، بدون قلق' },
 title: { fr: 'Aucune prise de tête sur le sizing.', en: 'No second-guessing your size.', es: 'Sin complicaciones con la talla.', tr: 'Beden konusunda hiç tereddütünüz olmasın.', ar: 'لا تفكير في المقاس.' },
 text: {
 fr: "Chaque pièce Jawhara s'ajuste à votre corps - pas l'inverse. Du XS au XL, vous portez la même taille. À prêter à vos sœurs, à emporter en vacances : le vêtement suit, sans question. Aucune mesure à connaître, aucune hésitation.",
 en: "Each Jawhara piece adjusts to your body - not the other way around. XS to XL, same size. Lend it to your sister, pack it for a holiday: the garment follows, no questions asked. No measurements to know, no hesitation.",
 es: "Cada pieza Jawhara se adapta a tu cuerpo, no al revés. De la XS a la XL, la misma talla. Préstasela a tus hermanas, llévatela de vacaciones: el vestido te sigue, sin preguntas. Sin medidas que recordar, sin dudas.",
 tr: "Her Jawhara parçası bedeninize uyar — tersi değil. XS'ten XL'e, aynı beden. Kız kardeşinize ödünç verin, tatile götürün: kıyafet sizi takip eder, soru sormaz. Ölçü bilmek zorunda değilsiniz, tereddüt yok.",
 ar: "كل قطعة Jawhara تتأقلم مع جسدك، ليس العكس. من XS إلى XL، نفس المقاس. أعيريه لأختك، خذيه في إجازتك: القطعة تتبعك، بلا أسئلة. لا مقاييس تحتاجين معرفتها.",
 },
 images: [ss26('p30_img01_xref1219_8b2d1136309d.jpeg'), ss26('p29_img02_xref1213_fe747a323e9f.jpeg')],
 },
 {
 layout: 'wide',
 kicker: { fr: 'Jawhara SS26', en: 'Jawhara SS26', es: 'Jawhara SS26', tr: 'Jawhara SS26', ar: 'Jawhara SS26' },
 title: { fr: 'Le vêtement comme geste.', en: 'Garment as gesture.', es: 'La prenda como gesto.', tr: 'Giysi bir jest olarak.', ar: 'الملبس كحركة.' },
 images: [ss26('p33_img01_xref1246_c55ecdd663e2.jpeg')],
 },
 {
 layout: 'duo',
 kicker: { fr: 'Le tissu Jawhara', en: 'The Jawhara fabric', es: 'El tejido Jawhara', tr: 'Jawhara kumaşı', ar: 'قماش Jawhara' },
 title: { fr: 'Tissé à Marrakech. Pensé pour voyager.', en: 'Woven in Marrakech. Built to travel.', es: 'Tejido en Marrakech. Pensado para viajar.', tr: 'Marrakech\'te dokunmuş. Seyahat için tasarlanmış.', ar: 'منسوج في Marrakech. مصمّم للسفر.' },
 text: {
 fr: "Ce n'est pas le brocart de soie traditionnel - fragile et difficile à entretenir. La faille Jawhara mêle un fil local à de la viscose : elle ne froisse presque pas, se lave facilement, et garde son éclat. Du beach club au dîner chic à l'hôtel - sans changer de valise.",
 en: "This is not traditional silk brocade - fragile and high-maintenance. Jawhara faille blends a local thread with viscose: barely wrinkles, washes easily, holds its lustre. Beach club to candlelit hotel dinner - no wardrobe change needed.",
 es: "No es el brocado de seda tradicional, frágil y difícil de cuidar. La faya Jawhara mezcla un hilo local con viscosa: apenas se arruga, se lava fácilmente y mantiene su brillo. Del beach club a la cena en el hotel, sin cambiar de maleta.",
 tr: "Bu geleneksel ipek brokart değil — kırılgan ve bakım gerektiren. Jawhara fay kumaşı, yerel ipliği viskozla harmanladı: neredeyse buruşmuyor, kolay yıkanıyor, pırlıltısını koruyor. Beach club'tan oteldeki şık akşam yemeğine — bavul değiştirmeden.",
 ar: "ليس بروكار الحرير التقليدي — الهش وعسير العناية. قماش Jawhara يمزج خيطاً محلياً بالفيسكوز: لا يتجعد تقريباً، يغسل بسهولة، يحتفظ ببريقه. من بيتش كلوب إلى عشاء فندقي — دون تغيير الحقيبة.",
 },
 images: [ss26('p36_img01_xref1270_d0b9fda05a39.jpeg'), ss26('p37_img02_xref1278_cd1f2a505109.jpeg')],
 },
 {
 layout: 'duo',
 kicker: { fr: 'À composer comme on veut', en: 'Mix and match freely', es: 'Combina como quieras', tr: 'İstediğin gibi komün yap', ar: 'امزجي كيفما تشائي' },
 title: { fr: 'Un haut. Un bas. Un set. À vous d\'inventer le reste.', en: 'A top. A bottom. A set. The rest is yours to invent.', es: 'Una parte de arriba. Una de abajo. Un conjunto. El resto, invéntátelo.', tr: 'Bir üst. Bir alt. Bir set. Geri kalanı siz yaratın.', ar: 'قطعة علوية. سفلية. طقم. الباقي لكِ.' },
 text: {
 fr: "Chaque pièce fonctionne seule ou en ensemble. Le pareo devient jupe courte ou longue. Le top scarf noué différemment change de silhouette. La collection Jawhara se compose et se recompose - au gré de l'envie, de la saison, de la journée.",
 en: "Every piece works alone or as a set. The pareo becomes a short or long skirt. The scarf top tied differently changes the whole silhouette. The Jawhara collection composes and recomposes - with your mood, the season, the moment.",
 es: "Cada pieza funciona sola o en conjunto. El pareo se convierte en falda corta o larga. El top pañuelo, anudado de otra manera, cambia la silueta entera. La colección Jawhara se compone y recompone, según el humor, la temporada, el día.",
 tr: "Her parça tek başına ya da takım olarak işe yarar. Pareo, kısa ya da uzun eteğe dönüşür. Farklı bağlanmış eşarp top, silhoueti tamamen değiştirir. Jawhara koleksiyonu istediğiniz gibi oluşturulur ve yeniden düzenlenir.",
 ar: "كل قطعة تعمل منفردة أو في طقم. الباريو يصبح تنّورة قصيرة أو طويلة. التوب الوشاح بعقدة مختلفة يغيّر كل السيلويت. مجموعة Jawhara تتشكّل وتتجدّد حسب مزاجك والموسم.",
 },
 images: [ss26('p34_img01_xref1253_5a9f30b239d6.jpeg'), ss26('p38_img04_xref1290_050054976c5b.jpeg')],
 },
 {
 layout: 'wide',
 kicker: { fr: 'La garde-robe moderne de Marrakech', en: 'The modern Marrakech wardrobe', es: 'El armario moderno de Marrakech', tr: 'Marrakech\'in modern garderobu', ar: 'خزانة Marrakech العصرية' },
 title: { fr: 'Pas une djellaba. Ce que les femmes portent vraiment.', en: 'Not a djellaba. What women here actually wear.', es: 'No una djellaba. Lo que las mujeres aquí llevan de verdad.', tr: 'Djellaba değil. Kadınların burada gerçekten giydikleri.', ar: 'ليست جلابية. ما ترتديه النساء فعلاً.' },
 images: [ss26('p38_img01_xref1287_56cb4d596aa0.jpeg')],
 },
 {
 layout: 'duo',
 kicker: { fr: 'Lala Fatima à l\'atelier', en: 'Lala Fatima at the atelier', es: 'Lala Fatima en el atelier', tr: 'Lala Fatima atölyede', ar: 'لالة فاطمة في الأتيلييه' },
 title: { fr: 'Ce qui est fait à la main ne se refait jamais tout à fait pareil.', en: 'What is made by hand is never made quite the same way twice.', es: 'Lo hecho a mano nunca se repite exactamente igual.', tr: 'Elle yapılan, asla tamamen aynı biçimde tekrarlanmaz.', ar: 'ما يُصنع باليد، لن يتكرّر بنفس الطريقة أبداً.' },
 text: {
 fr: "Pampilles en perles dorées réalisées à la main, signe berbère brodé ou perlé : chaque pièce Jawhara porte la signature de Lala Fatima. Pantalons, tops, pareos, robes - la collection se porte seule ou en pièces séparées. Ce qui part ne revient pas.",
 en: "Hand-crafted golden bead tassels, hand-beaded or embroidered Berber signs: each Jawhara piece carries Lala Fatima's signature. Trousers, tops, pareos, dresses - worn alone or as separates. What sells out, stays out.",
 es: "Pompones de cuentas doradas hechos a mano, signos beréberes bordados o perlados: cada pieza Jawhara lleva la firma de Lala Fatima. Pantalones, tops, pareos, vestidos, solos o como separados. Lo que se agota no vuelve.",
 tr: "Elle yapılmış altın boncuklu saçaklar, el boncuklu ya da işlenmiş Berber işaretleri: her Jawhara parçası Lala Fatima'nın imzasını taşır. Pantolonlar, toplar, pareolar, elbiseler — tek başına ya da ayrı parçalar olarak. Biten, geri gelmez.",
 ar: "شراشيب ذهبية مصنوعة يدوياً، رموز أمازيغية مطرّزة أو مرصّعة: كل قطعة Jawhara تحمل توقيع لالة فاطمة. بنطلونات، توبات، باريوهات، فساتين — منفردة أو كطقم. ما نفد، لن يعود.",
 },
 images: [ss26('p32_img04_xref1239_3935f6e23a7c.jpeg'), ss26('p34_img03_xref1255_5291eb6efa41.jpeg')],
 },
];

Object.assign(YZA.media.productStories.bags, {
 images: [ss26('p40_img01_xref1305_5ae097cc9e5a.jpeg'), ss26('p42_img01_xref1321_1a08834f9d69.jpeg'), ss26('p46_img01_xref1337_7dae31225680.jpeg')],
 cta: 'collections.html?cat=bags',
});
Object.assign(YZA.media.productStories.jaune, {
 title: { fr: 'Solaire, visible, Marrakech.', en: 'Sunlit, visible, Marrakech.', es: 'Solar, visible, Marrakech.', tr: 'Güneşli, göze çarpan, Marrakech.', ar: 'شمسي، لافت، Marrakech.' },
 text: {
 fr: 'Pour le lancement, le jaune vit dans les fruits en raphia: citron, orange, tomate et compositions de marche. La couleur reste vive, sans revenir aux anciens visuels de sacs.',
 en: 'For launch, yellow lives in raffia fruits: lemon, orange, tomato and market compositions. The colour stays bright without returning to older bag visuals.',
 es: 'Para el lanzamiento, el amarillo vive en las frutas de rafia: limón, naranja, tomate y composiciones de mercado. El color sigue vivo sin volver a los visuales antiguos de bolsos.',
 tr: 'Lansman için sarı, rafya meyvelerinde yaşıyor: limon, portakal, domates ve pazar kompozisyonları. Renk, eski çanta görsellere dönmeksizin canlı kalıyor.',
 ar: 'للإطلاق، الأصفر يحيا في ثمار الرافيا: ليمون، برتقال، طماطم وتركيبات السوق. اللون يبقى زاهياً دون العودة إلى صور الحقائب القديمة.',
 },
 label: { fr: 'Fruit Market / crochet main', en: 'Fruit Market / hand crochet', es: 'Fruit Market / ganchillo a mano', tr: 'Fruit Market / elle tığ işi', ar: 'Fruit Market / كروشيه يدوي' },
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
 title: { fr: 'Le fruit devient bijou de silhouette.', en: 'The fruit becomes a styling jewel.', es: 'La fruta se convierte en joya de silhouette.', tr: 'Meyve, silhouet takısına dönüşüyor.', ar: 'الثمرة تصبح جوهرة أناقة.' },
 text: {
 fr: 'Boucles et colliers gardent le meme langage que les charms: crochet main, raphia, fruit et finition cadeau.',
 en: 'Earrings and necklaces keep the same language as the charms: hand crochet, raffia, fruit and gift-ready finishing.',
 es: 'Pendientes y collares mantienen el mismo lenguaje que los charms: ganchillo a mano, rafia, fruta y acabado para regalo.',
 tr: 'Küüpeler ve kolyeler, charm’larla aynı dili taşır: elle tığ işi, rafya, meyve ve hediyeye hazır bitirme.',
 ar: 'الأقراط والعقود تحافظ على نفس لغة القطع: كروشيه يدوي، رافيا، ثمرة، تغليف هدية.',
 },
 label: { fr: 'gift-ready / crochet main', en: 'gift-ready / hand crochet', es: 'listo para regalo / ganchillo a mano', tr: 'hediyeye hazır / elle tığ işi', ar: 'جاهز للهدية / كروشيه يدوي' },
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
