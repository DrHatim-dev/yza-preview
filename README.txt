YZA - SITE E-COMMERCE PREMIUM
=============================

Site multilingue FR/EN/ES/TR/AR en HTML/CSS/JS pur, sans build ni
dependance runtime. Le site se lance comme dossier statique.

LANCER EN LOCAL
---------------
Depuis le dossier parent `YZA` :

 npm run yza:manifest
 npm run yza:serve

Puis ouvrir :

 http://localhost:8083/yza-site/

STRUCTURE
---------
 index.html Accueil
 collections.html Grille filtrable (?cat=all | charms | earrings | necklaces | bags | tops | pareos | pants)
 produit.html Page produit dynamique (?handle=...)
 histoire.html Histoire, atelier, La Sculpture, co-creation
 studio.html Le Studio - visite de l'atelier (Gueliz)
 yza-girls.html Social proof shoppable
 lookbook.html Lookbook SS26/27 editorial, 68 pages
 b2b.html Wholesale / stockists
 blogs/journal/ Journal editorial + SEO articles
 journal.html Compatibility redirect to the Journal
 faq.html FAQ
 contact.html Contact + revendeurs B2B

 css/tokens.css Palette + typographies
 css/styles.css Mise en page & composants
 js/products.js Catalogue SS26 depuis les sources + notes business
 js/i18n.js Dictionnaire FR/EN/ES/TR/AR + prix DH
 js/cart.js Panier localStorage
 js/chrome.js Header, footer, menu, recherche, panier
 js/main.js Rendu pages, filtres, produits lies

CATALOGUE SS26/27 CONFORME XLSX
-------------------------------
Mise a jour du 19 juin 2026 :

 Source canonique :
 - C:/Users/alexa/Downloads/yza_codex_package_xlsx_prices_conforme.zip

 Package de controle :
 - C:/Users/alexa/Downloads/yza_lookbook_2026_2027_Codex_package_PRICED_FROM_EXCEL_WITH_ASSETS.zip

 Total produits publies : 37
 - 3 Pairing Tops
 - 4 Pareo Skirts
 - 2 Pants
 - 6 Basket Bags
 - 10 Fruit Charms
 - 7 Fruit Earrings
 - 5 Fruit Necklaces

 Variantes Excel conservees : 123
 Draft/TBC exclus du site public : 23

Regle anti-doublons :
 Les variantes couleur/taille/fabric ne sont pas dupliquees en cartes produit
 quand l'image ne prouve pas clairement la variante. Elles restent disponibles
 dans les selecteurs et les donnees produit.

Sources utilisees :
 - manifest/yza_lookbook_2026_2027_manifest_PRICED_FROM_EXCEL.json
 - pricing/yza_variant_manifest_from_excel.json
 - pricing/yza_price_truth_table_from_excel.csv
 - pricing/yza_price_reconciliation_old_pdf_vs_excel.csv
 - assets/yza/lookbook-2026-2027/pages/
 - assets/yza/lookbook-2026-2027/embedded/
 - Accessoires SS26 (1).xlsx
 - RTW SS26.xlsx

Prix :
 Les prix actifs viennent des Excel, pas des pages recap du PDF.
 Les prix du storefront sont stockes en centimes de dirham marocain.

 Mapping prix :
 - price = retail = Prix de vente TTC DIRECT
 - wholesale = Prix de vente HT
 - stockist_retail_ttc = Prix de vente TTC DISTRIBUTEUR

 old_lookbook_pdf_price reste conserve uniquement en audit interne et n'est
 jamais affiche sur les pages publiques.

Produits flaggues en verification interne :
 - YZA Pareo Skirt - X Long
 - YZA Wrap Pants
 - La Nouvelle Vague XS/S/M
 - Raffia Avocado Half Charm

MERCHANDISING
-------------
Toutes les fiches produit ont une galerie/carrousel basee sur les meilleurs
angles disponibles dans les assets. Quand il manque une image propre pour une
variante exacte, la variante reste dans les details au lieu de devenir une
carte dupliquee.

Le site insiste sur :
 - edition limitee, non refaite une fois epuisee
 - petites series : 15 sacs par taille et par couleur, 90 sacs au total
 - complexite du crochet, du raphia, des perles et de l'assemblage main
 - cross-sells : charms <-> sacs, tops <-> bas, bundle trio en entree

Bundles :
 Les fiches produit affichent un bloc "Bundle facile" calcule par
 `YZA.bundleForProduct(handle)`. Le bouton ajoute en un clic les pieces qui
 se vendent logiquement ensemble :
 - sac La Sculpture + trio de charms
 - top Jawhara + bas Jawhara
 - bas Jawhara + top Jawhara
 - charm + bundle trio Fruit Market

REVENDEURS
----------
Section B2B ajoutee sur `contact.html` :
 - MOQ 10 sacs
 - contact WhatsApp direct
 - message oriente boutique / disponibilites / delais

RECOMMANDATIONS
---------------
`YZA.related(handle)` combine :
 - cross-sells explicites par produit
 - top <-> bottom coordonne
 - bag <-> charm
 - bundle trio pour augmenter l'AOV
 - meme collection/categorie en fallback

Le lien "Completer avec..." de la page produit utilise cette logique.

CONVERSION LOCALE / WHATSAPP
----------------------------
Adresse boutique / atelier utilisee pour les liens directions :

 YZA, 66 rue Yougoslavie, Gueliz, Marrakech, Maroc

Le chrome global ajoute :
 - une pilule fixe avec Waze, Google Maps et Apple Plans
 - un mini chat "Question" qui demande question, nom complet et WhatsApp,
 puis prepare un message WhatsApp avec le code YZA10 (-10 %)
 - une popup de recuperation sur les pages produit et lors de la sortie du
 panier avec le code YZA20 (-20 %) valable des 150 EUR / environ 1 500 DH

Les liens WhatsApp utilisent `YZA.brand.whatsapp` et ne transmettent rien sans
clic explicite de l'utilisateur.

BRAND SYSTEM
------------
Sources de marque conservees dans :

 assets/brand/materials/

Logo visible :
 assets/brand/yza-logo-real.webp

Ce fichier provient du logo original haute resolution trouve dans les assets
Shopify YZA (`noir.8c34e396.png`, contenu WebP). Il est affiche plus petit
dans le header/footer pour eviter le flou. Aucun logo redessine ou genere
n'est utilise dans le chrome.

Logos de navigation locale :
 assets/brand/map-logos/

Les logos Waze, Google Maps, Apple Plans et WhatsApp sont conserves comme
fichiers image sources du web et ne sont plus des pictogrammes dessines a la main.

Icones :
 assets/brand/icons/

Palette stricte :
 #e8bec0 rose
 #de733d orange
 #b19f31 olive
 #fdc733 jaune
 #000000 noir
 #ffffff blanc

Typographies :
 Titres : Ogg, fallback Cormorant Garamond, serif
 Texte/UI : Outfit, fallback system sans
 Labels main : Tlab Remograph, fallback Gaegu, cursive

PANIER
------
Le panier fonctionne cote client via localStorage. Le checkout reste une demo :
remplacer `checkout()` dans `js/cart.js` pour brancher Stripe, Hostinger,
Shopify Buy Button, ou autre solution.

NOTES
-----
Les avis clients dans `YZA.testimonials` restent des exemples de structure.
Remplacer par de vrais avis avant production publique.

Les images RTW et sacs ajoutees dans `assets/products/` proviennent des assets
locaux extraits du lookbook et du miroir YZA deja presents dans ce workspace.
