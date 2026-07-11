# YZA “Maison Marrakech” front-end audit and redesign brief

Status: implementation companion for `codex/maison-marrakech-redesign`
Audience: YZA owner, creative direction, front-end engineering, QA
Evidence cut-off: 11 July 2026

Implementation note: this document distinguishes the preserved Hostinger baseline from code now present in the redesign worktree. “Implemented” means only that the named markup, CSS, or JavaScript exists locally; it does **not** mean browser QA, GitHub Pages deployment, Hostinger staging, or production approval has happened. The authoritative QA state remains [`fidelity-ledger.md`](fidelity-ledger.md) and [`staging-release-checklist.md`](staging-release-checklist.md).

## Technical summary

YZA already has the ingredients of a distinctive house—real Guéliz provenance, recognizable objects, strong photography, repair language, and a women-led atelier—but the current storefront disperses them across too many competing sections and visual systems. The result reads as a busy campaign archive before it reads as one coherent Maison.

The redesign is organized around four changes:

1. Put one object and one point of view above the fold, then reveal commerce gradually.
2. Make craft proof part of every product decision, not a separate brand claim.
3. Make mobile purchase paths at least as deliberate as desktop: title and price before media, a safe sticky CTA, unclipped navigation/cart, and no video transfer before intent.
4. Treat scarcity, provenance, artisan attribution, and edition numbering as structured facts. If a fact is not verified, omit it; never fill the gap with luxury-sounding copy.

This report audits the Hostinger storefront only. Shopify Liquid and Shopify theme work are explicitly out of scope. The preserved runtime is HTML, CSS, vanilla JavaScript, PHP, and the isolated WooCommerce order recorder behind `order.php`.

## Evidence and claim boundaries

- **Observed in code** means the behavior or structure is present in this repository, principally [`index.html`](../index.html), [`collections.html`](../collections.html), [`produit.html`](../produit.html), [`histoire.html`](../histoire.html), [`checkout.html`](../checkout.html), [`contact.html`](../contact.html), [`js/main.js`](../js/main.js), [`js/chrome.js`](../js/chrome.js), [`js/checkout.js`](../js/checkout.js), and [`js/products.js`](../js/products.js).
- **Observed in public navigation** means it was seen during a passive public-site review at desktop/mobile sizes. No checkout or form was submitted.
- **Verified reference move** means the reference site’s public page or accessible page content demonstrated it on 11 July 2026.
- **Inferred reference move** means it was derived from supplied screenshots or visual inspection; exact font files, easing values, implementation libraries, and internal conversion logic were not asserted without DevTools evidence.
- **Content prerequisite** means code can reserve the component, but it must not publish until YZA supplies and approves the fact, translation, photograph, or inventory state.

## Design system to implement

The redesign worktree adds [`css/tokens.css`](../css/tokens.css) plus a last-loaded Maison component layer in [`css/maison.css`](../css/maison.css). The large legacy [`css/styles.css`](../css/styles.css) remains in place for compatibility and still contains historical reference-brand-named rules and comments. Removing or refactoring those legacy layers is therefore **not complete** and must be done only with regression coverage; new Maison work belongs in `tokens.css`/`maison.css` and must not add more reference-brand override layers.

| Token or behavior | Approved value | Implementation hook |
|---|---:|---|
| Editorial display | Bodoni Moda 400/500 | `--font-display`; headings and object names |
| UI/body | Jost 300/400/500 | `--font-sans`; controls, body, metadata |
| Mineral ivory | `#F7F4EE` | `--color-bg` / `--maison-ivory` |
| Ink | `#171512` | `--color-fg` / `--maison-ink` |
| Muted copy | `#68615A` | `--color-muted` |
| Rules | `#D8D0C5` | `--color-border` / `--maison-rule` |
| Accessible terracotta | `#A84928` | `--color-accent` / `--maison-terracotta` |
| Header | 72 px desktop, 64 px mobile | `.site-header`, page top offsets |
| Gutters | 32–48 px desktop, 20 px mobile | `.container`, `.container-wide` |
| Section reveal | `700ms cubic-bezier(.19,1,.22,1)` | `[data-reveal]`; opacity/transform only |
| Image crossfade | `450ms cubic-bezier(.445,.05,.55,.95)` | product/editorial image layers |
| Underline/header feedback | 300 ms | links, nav, sticky header |
| Reduced motion | no nonessential motion | `@media (prefers-reduced-motion: reduce)` |

Bodoni Moda and Jost Latin/Latin-ext WOFF2 subsets are present under [`assets/fonts`](../assets/fonts) with their OFL license files and are declared in `tokens.css`. Browser QA must still confirm that no page falls back to a remote Google Fonts request and that every required language glyph has an acceptable fallback.

Recommended responsive type scale:

| Role | Desktop | Mobile | Notes |
|---|---:|---:|---|
| Home hero H1 | `clamp(4.5rem, 8vw, 7.5rem)` / 0.9 line-height | `clamp(3.25rem, 16vw, 5rem)` / 0.92 | Bodoni Moda 400; keep to two lines maximum |
| Section H2 | `clamp(2.75rem, 5vw, 4.75rem)` / 0.98 | `clamp(2.25rem, 11vw, 3.5rem)` / 1.0 | Bodoni Moda 400 |
| PDP object name | `clamp(2.5rem, 4vw, 4rem)` / 0.98 | `2.5rem` / 1.0 | Name leads; price is not part of the heading |
| Intro/deck | `1.25rem` / 1.5 | `1.0625rem` / 1.5 | Jost 300; max 42–52 characters per line |
| Body | `1rem` / 1.6 | `1rem` / 1.55 | Never below 16 px for form/product reading |
| UI/CTA | `0.75rem`, 0.14 em tracking | `0.75rem`, 0.12 em tracking | Jost 500, uppercase selectively |
| Eyebrow/metadata | `0.6875rem`, 0.18 em tracking | `0.6875rem`, 0.16 em tracking | Avoid low-contrast tiny copy |

## Page-by-page audit

### Homepage: the brand world is present but the hierarchy is not

The baseline [`index.html`](../index.html) contains 15 top-level `<section>` elements: hero, introduction, category cards, icon/press strip, Fruit Market, craft video, best sellers, a second split hero, a four-piece offer, another atelier video, reviews, FAQ, YZA Girls, services, and La Nouvelle Vague. Multiple marquees, videos, category stories, product edits, and trust messages compete to become the next reason to scroll.

| Current element | Exact problem | Buyer consequence | Maison correction and code hook |
|---|---|---|---|
| `.brand-hero` auto-loads a large video, with an inline script assigning `src` immediately | The first screen spends bandwidth and attention on motion before intent; a prior mobile uncached pass transferred about 7.45 MB and the desktop HD hero alone is about 12 MB | Slow arrival weakens luxury perception; motion becomes noise rather than an event | Poster-first split hero in [`index.html`](../index.html) and intent/Save-Data loading in [`js/main.js`](../js/main.js); no video bytes before click or clear intent |
| 15 top-level sections | Message repetition and campaign collision | The shopper cannot tell which object defines the current Maison | Reduce the primary journey to hero → La Sculpture edit → atelier proof → curated edit → community proof → compact FAQ/footer |
| First CTA routes into brand/story rather than the featured object | Narrative and purchase intent are split at the decisive first action | High-intent visitors must hunt for the collection | Primary CTA to `/collections/sacs`; secondary text link to `/histoire` |
| Fruit Market, Jawhara, La Sculpture, and La Nouvelle Vague each receive campaign-level treatment | Four competing “lead stories” appear on one page | No single collection gains status or memory | Feature La Sculpture as the house object; move other stories to collection/editorial pages |
| Product cards hide the generated `.product-card__meta` proof line in the current style cascade | Craft is declared elsewhere but absent at the moment of comparison | Price is compared as catalog price, not object value | Render concise factual proof from `cardProofHTML()` in [`js/main.js`](../js/main.js), visible under title and above price |
| Multiple acquisition/recovery surfaces can overlap | Discount, chat, newsletter, cart recovery, and first viewport can compete | Feels promotional rather than considered | Mutual-exclusion controller in [`js/chrome.js`](../js/chrome.js)/[`js/promo-popup.js`](../js/promo-popup.js); no discount interrupt in first viewport |

Implemented above-fold narrative in the redesign worktree (pending visual and content approval):

- Eyebrow: `Maison artisanale · Guéliz`
- H1: `Le vestiaire moderne de Marrakech`
- Supporting line: `Des pièces façonnées à la main à Guéliz, pensées pour voyager.`
- Primary CTA: `Découvrir la collection`
- Secondary link: `Voir le savoir-faire`

`La Sculpture` is the immediately following signature-object chapter rather than the hero H1, matching the approved hero → La Sculpture → atelier sequence.

Photography prerequisite: select one approved real YZA hero crop in landscape and one separately art-directed portrait crop. Generated concept images are layout references only.

### Collections: it behaves like a filterable catalog, not a curated edit

[`collections.html`](../collections.html) provides a title, short description, category chips, density controls, sort select, product grid, and optional story/styling blocks. The mechanics are useful, but the opening is generic (“Toute la boutique”) and the filter row becomes a narrow horizontal strip on mobile without a strong continuation cue.

| Current element | Exact problem | Buyer consequence | Maison correction and code hook |
|---|---|---|---|
| `.collection-head` opens with a catalog label and count | It describes inventory, not a point of view | The page feels comprehensive rather than selected | Add collection thesis and season/location line in [`collections.html`](../collections.html); keep count quiet |
| `.filter-chips` is horizontally scrollable on mobile | Last options can look clipped; no visible overflow affordance | Categories appear missing or broken | Two-row or snap/gradient treatment with 44 px controls; preserve keyboard reachability |
| Sort/filter state is mainly in runtime state | Back navigation and shared URLs can lose the shopper’s edit | Comparison requires repeated setup | Encode category, sort, and search in `URLSearchParams` in [`js/main.js`](../js/main.js); restore from URL on load/popstate |
| Density choices include 6 columns | Tiny merchandise tiles conflict with material inspection | Products become thumbnails instead of objects | Three columns desktop and two mobile; remove/quiet unsupported densities |
| Product grid has no guaranteed editorial interruption after row one | Product/product/product cadence becomes marketplace-like | Craft story is postponed | Insert `.col-story--ingrid` after the first full row using real atelier imagery and factual copy |
| Quick add is visually optimized for pointer hover | Keyboard/touch equivalence is not guaranteed | Some shoppers cannot access the same shortcut | Keep product link primary; expose labeled quick add on focus and touch in [`js/main.js`](../js/main.js) |

Collection thesis examples:

- La Sculpture: `Une architecture souple, tressée à Guéliz. Trois formats, chaque détail repris à la main.`
- Jawhara: `Le textile rayé de la maison, coupé pour le mouvement et fini à l’atelier.` **Composition must remain omitted until the poly vs viscose/silk conflict is resolved.**
- Fruit Charms: `Des fruits de marché transformés en petits objets de raphia, crochetés un à un.`

### Product detail page: commerce is functional, but proof and mobile order need restructuring

The baseline [`produit.html`](../produit.html) places `.product-info` before `.gallery` in the DOM, which is helpful for mobile title-first order, although the current visual rules have previously displayed media first. It already provides color/finish options, scarcity, add-to-cart, service chips, product story, accordions, recommendations, and `#mobileProductBar`.

| Current element | Exact problem | Buyer consequence | Maison correction and code hook |
|---|---|---|---|
| Product story/proof is fragmented across `#pShort`, `#pBullets`, `#productStory`, `#accMaking`, and `#accCare` | Important value evidence can be hidden or repeated | Price arrives without one confident reason to believe | Keep a visible proof rail: material, place, process/repair. Use accordions for detail, not first proof |
| Price is visually adjacent to title with little house framing | It becomes the dominant comparison unit | Shopper evaluates cost before object worth | H1 first, one proof line, then quieter price; preserve semantic price markup |
| Gallery/video markup can autoplay and assign full media sources | Product video loads without explicit need and has limited pause semantics | Data/CPU cost and accessibility friction | Poster-first; click to play; pause offscreen; `Save-Data` and reduced-motion branches in [`js/main.js`](../js/main.js) |
| Scarcity copy can derive from broad flags | “Few left” risks becoming generic urgency | Unverifiable pressure damages trust | Render only mapped inventory states: `Dernière pièce`, `Disponible sur commande · 3 semaines`, `De retour à l’atelier` |
| `#mobileProductBar` exists but must be safe-area and state aware | A fixed bar can overlap content or remain hidden at the wrong time | CTA is either inaccessible or intrusive | Show after purchase panel leaves viewport; include price/state; `padding-bottom: env(safe-area-inset-bottom)` |
| Gallery controls and accordions need complete focus semantics | Visual interaction may not equal keyboard/screen-reader interaction | Premium polish excludes users | Buttons with names/current state, focus restoration, `aria-expanded`, `aria-controls`, and live add-to-cart feedback |

Required 60/40 desktop structure:

- Gallery: real product stills first, use-on-body scale second, close craft/process third, motion last and opt-in.
- Sticky purchase panel: object name, concise proof, subdued price, variant/state, CTA, repair/delivery signal, then details.
- Mobile: title → factual proof → price/state → CTA → media → details. Sticky CTA appears only after the inline CTA scrolls away.

### Story and studio: strong facts need an editorial sequence and fact governance

[`histoire.html`](../histoire.html) already includes the YZA name, three generations in Guéliz, a founder section, atelier section, evolution, and manifesto. [`studio.html`](../studio.html) provides a studio-focused surface. The material is unusually valuable; the weakness is presentation density and the risk that precise family/building history is published without a single source-of-truth record.

| Current element | Exact problem | Buyer consequence | Maison correction and code hook |
|---|---|---|---|
| Long multilingual paragraphs lead several sections | Story is read as copy volume, not editorial evidence | Scanning users miss founder and atelier proof | Founder-led opening, shorter measure, documentary captions, and a separate proof rail |
| Moodboard and mixed visuals substitute for a documentary opening | Brand references can feel like inspiration rather than authorship | YZA’s own atelier is less memorable | Open with a real founder/atelier image; use moodboard later as process context |
| Historical claims include dates and former building uses | Valuable, but precision increases verification risk | One incorrect detail weakens the full narrative | Content prerequisite: owner-approved chronology/source note before production |
| Artisan/founder identities appear in product/story text | Attribution is powerful only when consent and spelling are verified | Personal data or inaccurate credit can be published | Render names only from verified fields; otherwise `Atelier YZA · Guéliz` |
| Visit CTA is separated from the strongest story proof | Desire is not converted into a real-world action | Story closes without a next step | End story with studio visit/appointment CTA linked to [`contact.html`](../contact.html) or approved WhatsApp flow |

### Navigation, footer, search, cart, and mobile chrome

[`js/chrome.js`](../js/chrome.js) currently constructs most header, footer, search, language, cart, acquisition, and recovery UI after load. It contains useful ARIA updates and event handling, but late injection can shift the page and several independent overlays require one shared modal contract.

| Current element | Exact problem | Buyer consequence | Maison correction and code hook |
|---|---|---|---|
| Header/footer are generated after DOM ready | Page geometry changes after first paint | Layout shift looks unstable | Put static skeleton/landmarks in HTML; hydrate behavior in [`js/chrome.js`](../js/chrome.js) |
| Desktop navigation carries many commerce branches | It reveals catalog breadth before the brand point of view | Feels like a department store menu | Five restrained links: Nouveautés, Sacs, Prêt-à-porter, Bijoux & Charms, La Maison |
| Mobile menu/cart/search/chat are separate overlays | Focus, Escape, scroll lock, and restoration can diverge | Trapped or lost keyboard/touch users | One focus-trap helper; one active overlay; restore focus to opener |
| Current mobile header/logo has overlapped content after scroll in passive review | Sticky state and page offset disagree | Brand mark obstructs shopping | 64 px fixed contract; reserve space; test announcement/no-announcement states |
| Cart drawer can be narrow/clipped on mobile | Quantity/payment/CTA become cramped | Cart feels fragile at commitment point | Full-width under mobile breakpoint, 44 px controls, safe-area footer, no horizontal overflow |
| Footer is dense and newsletter-led | Final brand moment becomes a utility stack | Weak closing memory | Editorial newsletter statement, concise service/legal groups, verified address and social links |

### Contact and checkout: truthfulness is the conversion requirement

The baseline contact form previously displayed a success state without server confirmation. The redesign branch introduces [`contact.php`](../contact.php) and makes [`contact.html`](../contact.html) wait for its JSON response. Checkout must similarly treat [`order.php`](../order.php) as authoritative: no `purchase` event, cart clear, or confirmation before `{ok:true, recorded:true}`.

| Surface | Required behavior | Implementation hook |
|---|---|---|
| Contact | Validate, throttle, origin-check, honeypot, send, then show success with reference | [`contact.php`](../contact.php), `[data-contact-form]` in [`contact.html`](../contact.html) / [`js/main.js`](../js/main.js) |
| Checkout submit | Prevent double submit; reuse one order number; await order recorder | [`js/checkout.js`](../js/checkout.js), [`order.php`](../order.php) |
| Recorder failure | Preserve all cart/form state; offer Retry and existing WhatsApp fallback | `.checkout`, payment/confirmation renderer in [`js/checkout.js`](../js/checkout.js) |
| Analytics | Fire `purchase` only after recorder success | checkout completion branch in [`js/checkout.js`](../js/checkout.js) |
| Preview mode | Do not call PHP and do not simulate success | preview interception owned by the deterministic preview build |

## Reference-site deep dive: verified versus inferred

These are sources of principles, not templates to clone. YZA should preserve its own typography, images, copy, and interaction language.

### Jacquemus

**Verified on the public site:** a broad but carefully named hierarchy (`New In`, families such as The Valéries, Baskets & Raffia, Explore/The House/Our Savoir-faire); product grids with object names, color families, prices, personalization/waitlist states; and a dedicated Valérie savoir-faire page that names the silhouette’s origin, construction stages, number of pattern pieces, material behavior, workshop location, and personalization. See [Jacquemus](https://www.jacquemus.com/en_fr) and [The Valérie savoir-faire](https://www.jacquemus.com/en_fr/savoir-faire-valerie/savoirfaire-valerie.html).

**Inferred from visual review/supplied screenshots:** brand-world imagery receives full-bleed space before dense commerce; product grids use pale neutral fields, small labels, low visual noise, and large object photography; price is present but rarely the largest typographic signal. Exact font names, transition curves, and internal loading strategy were not verified and must not be copied as facts.

**YZA adaptation:** give La Sculpture one canonical object story with verified construction facts, natural material change, atelier location, care/repair, and variants. Implement in `#productStory`, product accordions, and a collection editorial interruption—not as a borrowed look.

### Ranaco Atelier

**Verified on the public site:** navigation separates Shop from named Collections; the home sequence pairs a campaign image/collection CTA with product/category edits; collection language frames materials (“silks, woven knits, and hand loomed crochet”); and secondary routes include sizing, pre-orders, shipping/returns, and a newsletter. See [Ranaco Atelier](https://www.ranacoatelier.com/).

**Inferred from visual review/supplied screenshots:** the visual cadence alternates atmospheric campaign frames with clean four-up product rows; warm neutral product photography and restrained chrome keep the products editorial. Exact typefaces and motion timing were not verified.

**YZA adaptation:** alternate one real Guéliz/atelier frame with a quiet, disciplined product row. Collections should feel like chapters (`La Sculpture`, `Jawhara`, `Fruit Market`) rather than only category filters.

### Cult Gaia

**Verified on the public site:** top-level commerce is extensive but grouped predictably; the homepage uses a campaign-led “Shop the collection” opening followed by new-arrival/set/gown edits; wishlist, cart, store and service routes are present. See [Cult Gaia](https://cultgaia.com/).

**Inferred from visual review/supplied screenshots:** mobile and desktop campaign crops appear separately art-directed; motion/video creates a cinematic first screen while product rows remain sparse; sculptural object photography on neutral fields makes accessories read as design objects. Exact font names, cursor effects, page-transition libraries, and easing values were not verified.

**YZA adaptation:** commission separate mobile crops, isolate object silhouettes on clean backgrounds, and reserve motion for one purposeful moment. Do not adopt the reference site’s promotional 10%-off entry behavior in YZA’s first viewport.

### Comparative reference matrix

| Dimension | Jacquemus | Ranaco Atelier | Cult Gaia | What YZA should take |
|---|---|---|---|---|
| Typography | **Inferred:** compact sans-led commerce with a strong brand wordmark; exact public font files were not verified | **Inferred:** serif wordmark/editorial headings with spaced sans UI; exact families not verified | **Inferred:** high-contrast display wordmark with clean uppercase sans navigation; exact families not verified | Use the approved Bodoni Moda/Jost pair, not lookalike font copying; preserve strong scale contrast and quiet UI |
| Hierarchy | **Verified:** named product families and `Explore → Our Savoir-faire`; **inferred:** campaign imagery precedes dense product discovery | **Verified:** Shop and named Collections are separate; collection promises sit beside category edits | **Verified:** collection CTA opens the page, followed by named commerce edits | Put house object/collection first, product edit second, proof third; keep categories subordinate |
| Palette and whitespace | **Inferred:** pale neutral product fields and generous negative space make silhouettes legible | **Inferred:** warm neutral campaign/product fields create continuity | **Inferred:** clean neutral object fields alternate with saturated campaign imagery | Mineral ivory base, ink rules, terracotta only for meaningful emphasis; avoid decorative accent overload |
| Photography | **Verified from accessible page structure:** all three rely heavily on image-led home modules; **inferred:** Jacquemus and Cult Gaia use strong campaign/object contrast, Ranaco alternates campaign and studio rows | **Inferred:** lifestyle carries world/identity; still life carries comparison. A precise lifestyle:still-life ratio was not measurable reliably from the accessible snapshots | Same | Use one real lifestyle hero, one atelier proof beat, then disciplined object stills; choose the ratio per available real assets rather than inventing a target count |
| Model direction/staging | **Inferred:** architectural locations, direct silhouettes, objects isolated on pale fields | **Inferred:** relaxed warm-location/editorial posing and consistent neutral product studio | **Inferred:** cinematic travel/location frames plus sculptural product stills | Direct models around use and material movement; include scale shots; do not imitate exact reference campaigns |
| Grid/composition | **Inferred:** full-bleed campaign split with precise multi-column commerce | **Inferred:** campaign frame followed by four-up merchandise cadence | **Inferred:** full-width video/campaign followed by sparse product rows | Controlled asymmetry in hero/story; predictable 3/2-column commerce where decisions happen |
| Motion and loading | **Inferred from visual review:** image/video-led entrances and hover media; exact duration/easing/library not verified on any reference | Same | Same; supplied screenshot indicates cinematic video use | Use only approved YZA curves; poster-first, intent-loaded video, opacity/transform only, reduced motion |
| PDP storytelling | **Verified:** Valérie page describes origin, silhouette, pattern-piece construction, materials, workshop and personalization | Product-detail depth was not sufficiently exposed in the accessible homepage snapshot; **to verify** on representative PDP | Product-detail depth was not sufficiently exposed in the accessible homepage snapshot; **to verify** on representative PDP | Make material, place, making, care/repair visible; precise counts only from verified SKU data |
| Copy voice | **Verified:** named objects/families and concrete construction language; price remains present | **Verified:** named collections plus material/process phrases such as silk, woven knits, hand-loomed crochet | **Verified:** commerce uses direct named edits (`NEW ARRIVALS`, `NEW SETS`, `NEW GOWNS`) | Name the object and technique, then the use; remove generic “luxury/unique/timeless” adjectives |
| Commerce architecture | **Verified:** broad categories are available, but house/savoir-faire has a dedicated route | **Verified:** Shop vs Collections; pre-orders/sizing/support remain discoverable | **Verified:** extensive taxonomy, wishlist/cart/store/service paths | Five primary nav links; reveal breadth in drawer/collection page; keep support near commitment points |
| Price treatment | **Verified:** product names, color states and price coexist; **inferred:** price is visually quieter than the object image/name | Not reliably measurable from accessible text alone | Not reliably measurable from accessible text alone | Never hide price; make image, object name and proof more visually dominant |
| Signature interaction | Keyboard product-navigation instructions are publicly exposed on the Jacquemus savoir-faire page; other signature interactions remain **inferred/to verify** | **To verify** in an instrumented browser | **To verify** in an instrumented browser | Prefer accessible gallery navigation, URL-backed filters and purposeful opt-in motion over novelty cursor effects |

## Prioritized elements to adapt

| Priority | Reference principle | YZA placement | Buyer-psychology shift | Code or prerequisite |
|---:|---|---|---|---|
| 1 | One house object receives a named savoir-faire chapter | Home, La Sculpture collection, PDP | From “basket bag” to a recognizable YZA object | [`index.html`](../index.html), [`collections.html`](../collections.html), [`produit.html`](../produit.html), [`js/products.js`](../js/products.js) |
| 2 | Campaign → product → process cadence | Home and collection | Desire is followed by evidence, then action | Home/collection markup and `.col-story--ingrid`; real-photo prerequisite |
| 3 | Object name dominates price | PDP/cards | Price becomes one attribute of a specific object | `.product-info`, `.product-card__body` |
| 4 | Separate mobile art direction | Hero, editorial breaks, story | Mobile feels composed rather than cropped | `picture`/`srcset` in page HTML; photography prerequisite |
| 5 | Material/process detail is visible, not buried | Cards and PDP | Justification becomes concrete at comparison time | `cardProofHTML()` and `#productStory` in [`js/main.js`](../js/main.js) |
| 6 | Named collection chapters | Nav, homepage, collection intro | Browsing becomes entry into a world | [`js/chrome.js`](../js/chrome.js), collection thesis blocks |
| 7 | Quiet neutral product fields | Collection/recommendation rails | Form, weave, and color gain visual authority | product-card media styles in [`css/maison.css`](../css/maison.css), layered after the legacy stylesheet |
| 8 | Purposeful waitlist/pre-order states | PDP sold-out state | Scarcity becomes service, not pressure | [`subscribe.php`](../subscribe.php), `source="waitlist"`, product handle/page |

## Product copy: before, after, and fact gates

French is the source. English below is a transcreation, not a literal translation. ES/TR/AR publication remains blocked pending native-language review. Every example uses an existing product record from [`js/products.js`](../js/products.js); no new material, origin, edition count, or artisan identity is introduced.

### La Sculpture XS / S / M

Current pattern:

> “Format XS, couleur rouge, feuilles de bananier, raphia, cuir et perles.”

Recommended source copy:

- **Name:** `La Sculpture XS — Rouge`
- **FR:** `Une petite architecture tressée en feuilles de bananier, raphia et perles, finie à la main dans l’atelier YZA de Guéliz. Le format XS garde la silhouette sculpturale dans une échelle légère. Chaque pièce est contrôlée avant de quitter l’atelier.`
- **EN:** `A small woven architecture in banana leaves, raffia and beads, hand-finished in YZA’s Guéliz atelier. The XS keeps the sculptural silhouette at a lighter scale. Every piece is checked before it leaves the atelier.`
- **CTA:** `Choisir La Sculpture XS`

Use the same structure for `La Sculpture S — Violet` and `La Sculpture M — Noir`, changing only the verified size/color and approved functional capacity. Do not claim capacity until photographed/measured. Do not display “15 sacs par taille et couleur” or “35 à 85 heures” until the owner validates the number per SKU and the front end reads a verified field rather than generic family copy.

| Actual SKU | Current short copy | Recommended FR card/deck copy |
|---|---|---|
| `la-sculpture-xs-basket-bag-ss26` | `Format XS, couleur rouge, feuilles de bananier, raphia, cuir et perles.` | `La Sculpture XS — Rouge. Feuilles de bananier, raphia et perles, tressés et finis à la main à Guéliz.` |
| `la-sculpture-s-basket-bag-ss26` | `Format S, couleur violet, feuilles de bananier, raphia, cuir et perles.` | `La Sculpture S — Violet. La silhouette sculpturale dans son format intermédiaire, tressée et finie à la main à Guéliz.` |
| `la-sculpture-m-basket-bag-ss26` | `Format M, couleur noir, feuilles de bananier, raphia, cuir et perles.` | `La Sculpture M — Noir. Le grand format de la ligne, tressé et fini à la main à Guéliz.` |

The shorter S/M wording intentionally avoids unverified capacity, weight, use-case, and time claims. The component list must be reconciled before repeating `cuir` because the current material fields do not all agree.

### Jawhara pieces

Current pattern:

> “Top foulard Jawhara, pièce Jawhara à associer aux paréos et sacs YZA.”

Recommended source copy:

- **Name:** `Top foulard Jawhara`
- **FR:** `Le textile rayé Jawhara, coupé pour composer les silhouettes d’été YZA et fini à la main à Guéliz. À nouer avec les paréos et pantalons de la ligne pour un ensemble souple, pensé pour le mouvement.`
- **EN:** `YZA’s striped Jawhara textile, cut for summer silhouettes and hand-finished in Guéliz. Tie it with the line’s pareos or trousers for an easy set designed to move.`
- **CTA:** `Composer l’ensemble Jawhara`

**Blocking catalog conflict:** variant records say `Jawhara poly`, while `material`/`fabric` fields say `viscose & silk`. No composition claim may ship until production, supplier, and care-label records agree. The correction belongs in [`js/products.js`](../js/products.js) and the underlying catalog source, not only in visible copy.

### Charms

Current example:

> “Une petite grappe comme un bijou textile : volume, mouvement, plusieurs grains crochetés un par un et noués à l’aakad…”

Recommended source copy:

- **Name:** `Charm raisins en raphia`
- **FR:** `Un bijou textile en mouvement. Chaque grain est crocheté séparément, puis la grappe est assemblée à l’aakad, le geste des boutons de caftan. Réalisé en petite série à l’atelier YZA de Guéliz.`
- **EN:** `A textile jewel with movement. Each grape is crocheted separately, then the cluster is assembled with aakad, the technique used for caftan buttons. Made in small runs in YZA’s Guéliz atelier.`
- **CTA:** `Ajouter le charm raisins`

Only show the named artisan or a precise four-hour making time when an approved `artisanVerified`/`makingTimeVerified` record exists. Otherwise render `Atelier YZA · Guéliz`.

### Jewellery

Current example:

> “Boucles pastèque en raphia, crochet main avec créoles dorées 1,5 cm.”

Recommended source copy:

- **Name:** `Boucles pastèque — raphia crocheté`
- **FR:** `Deux tranches de pastèque crochetées à la main en raphia, montées sur des créoles dorées légères. Un bijou textile vif, fini et contrôlé à l’atelier de Guéliz.`
- **EN:** `Two watermelon slices hand-crocheted in raffia and set on lightweight gold-tone hoops. A vivid textile jewel, finished and checked in the Guéliz atelier.`
- **CTA:** `Porter les boucles pastèque`

“Gold-tone” is intentionally safer than “gold” until plating/base-metal documentation is approved. Apply the same discipline to necklace cord/clasp language.

## Conversion psychology without invented urgency

| Placement | Exact wording | Display rule | Implementation hook |
|---|---|---|---|
| Card proof line | `Tressé et fini à la main · Guéliz` | Only when place/process fields are verified | `.product-card__meta` via `cardProofHTML()` |
| PDP proof rail | `Matière végétale` · `Fini à Guéliz` · `Réparable à l’atelier` | Use only facts applicable to that SKU | `#pBullets`, `#productStory` |
| Low stock | `Dernière pièce` | Exact available quantity = 1 | `#pScarcity` |
| Made to order | `Disponible sur commande · 3 semaines` | Verified production state and lead time | `#pScarcity`; add-to-cart label/notice |
| Sold out | `De retour à l’atelier` | No purchasable stock | `#pScarcity`; waitlist form |
| Waitlist submit | `Prévenez-moi quand la pièce revient` | Posts to `/subscribe.php` with `source="waitlist"`, product page/handle | product story/purchase panel |
| Artisan credit | `Faite par {nom} · Atelier YZA, Guéliz` | Consent, spelling, and product attribution verified | verified product field only |
| Fallback credit | `Atelier YZA · Guéliz` | Default when no verified name | product proof rail |
| Edition | `Pièce {n} sur {total}` | Both values immutable and verified | structured product field only; otherwise omit |
| Repair | `Cette pièce se répare à l’atelier.` | Applicable repair policy verified | below CTA / care accordion |

No countdown timers, random low-stock labels, fake viewers, or inferred edition totals are permitted.

## Motion and interaction specification

| Interaction | Trigger | Duration/easing | Accessibility behavior | Hook |
|---|---|---|---|---|
| Section reveal | 15–20% intersection | 700 ms, `cubic-bezier(.19,1,.22,1)` | Elements remain readable without JS; reduced motion = immediate | `[data-reveal]` |
| Product image swap | hover/focus/intent | 450 ms, `cubic-bezier(.445,.05,.55,.95)` | Pointer and keyboard equivalent; no layout change | `.product-card__media` |
| Link underline | hover/focus-visible | 300 ms | Visible focus outline remains | `.link-underline`, nav links |
| Sticky header | leave hero / scroll direction | 300 ms | No content overlap; reduced motion = state change only | `.site-header` |
| Mobile drawer/cart | explicit button | transform/opacity only, ≤350 ms | Focus trap, Escape, overlay click, opener restoration | [`js/chrome.js`](../js/chrome.js) |
| Gallery video | click/intent | no decorative autoplay requirement | Labeled play/pause; pause offscreen; no load on Save-Data | gallery renderer in [`js/main.js`](../js/main.js) |

Avoid custom cursors and full-page transition masks in this release. They add QA risk without solving a current buyer problem.

## Accessibility, reliability, and performance gates

- Preserve a logical heading order and place one visible H1 per page.
- Keep all touch targets at least 44×44 px, including swatches, wishlist, close, quantity, filter, and gallery controls.
- Never remove focus outlines without a visible `:focus-visible` replacement.
- Trap and restore focus for navigation, search, cart, chat, and any modal; only one overlay may own scroll lock.
- Accordions require `aria-expanded`, `aria-controls`, unique panel IDs, and keyboard-operable buttons.
- Inline errors must be connected with `aria-describedby`; status updates use appropriate polite/assertive live regions.
- Arabic must be reviewed at every breakpoint with `[dir="rtl"]`; mirroring must not reverse product imagery or number meaning.
- Every meaningful image needs product-specific alt text; decorative marks use empty alt.
- Use explicit media dimensions, responsive `srcset`/`sizes`, portrait mobile crops, poster-first video, and `Save-Data` handling.
- Mobile home initial transfer target: ≤2 MB. No video bytes before intent. LCP ≤2.5 s, CLS ≤0.1, INP ≤200 ms.
- Lighthouse release target at representative pages: ≥90 Performance, Accessibility, Best Practices, and SEO.

## Impact and effort plan

| Rank | Recommendation | Impact | Effort | Release tier | Current worktree state | File/selector |
|---:|---|---|---|---|---|---|
| 1 | Make contact and order completion server-authoritative | Critical | Medium | P0 | Code present; PHP delivery/recording still requires isolated staging validation | [`contact.php`](../contact.php), [`contact.html`](../contact.html), [`order.php`](../order.php), [`js/checkout.js`](../js/checkout.js) |
| 2 | Poster-first/intent video loading | Very high | Medium | P1 | Home has no initial video; Save-Data/media paths are present but network QA is pending | hero/gallery media in [`index.html`](../index.html), [`js/main.js`](../js/main.js) |
| 3 | Repair mobile header/cart clipping and focus | Very high | Medium | P1 | Code present; viewport, keyboard, and focus-restoration QA pending | [`js/chrome.js`](../js/chrome.js), `.site-header`, `.cart-drawer` in [`css/maison.css`](../css/maison.css) |
| 4 | Replace 15-section home with six-beat Maison journey | Very high | Large | P1 | Implemented in markup; visual/content approval pending | [`index.html`](../index.html) |
| 5 | Reorder PDP and expose material/place/repair proof | Very high | Large | P1 | Layout/proof hooks present; SKU facts and responsive behavior still require approval/QA | [`produit.html`](../produit.html), product renderer in [`js/main.js`](../js/main.js), [`css/maison.css`](../css/maison.css) |
| 6 | Consolidate tokens and remove reference-brand override layers | High | Large | P1/P2 | **Partial:** tokens and Maison layer added; legacy `styles.css` reference layers remain | [`css/tokens.css`](../css/tokens.css), [`css/maison.css`](../css/maison.css), legacy [`css/styles.css`](../css/styles.css) |
| 7 | URL-backed collections and editorial interruption | High | Medium | P2 | Code present; popstate/filter and visual QA pending | [`collections.html`](../collections.html), collection renderer in [`js/main.js`](../js/main.js) |
| 8 | Founder-led story and verified proof rail | High | Medium | P2 | Founder lead and real media present; historical/person/craft claims remain an owner content gate | [`histoire.html`](../histoire.html), [`studio.html`](../studio.html) |
| 9 | Restrained nav/footer and unified overlay behavior | High | Medium | P2 | Five-link nav and shared focus logic present; browser/accessibility QA pending | [`js/chrome.js`](../js/chrome.js) |
| 10 | Product copy and inventory-state governance | High | Medium | P2 | Partial; known material conflicts and native-language review remain open | [`js/products.js`](../js/products.js), [`js/i18n.js`](../js/i18n.js); owner/native review prerequisite |
| 11 | Waitlist with truthful product context | Medium | Under 2 h after state mapping | P3 quick win | Client code present; Brevo/test-list behavior requires isolated staging | [`subscribe.php`](../subscribe.php), product purchase panel in [`js/main.js`](../js/main.js) |
| 12 | Final motion refinement | Medium | Under 2 h | P3 quick win | CSS/reveal code present; normal/reduced-motion QA pending | `[data-reveal]`, media crossfades, reduced-motion block in [`css/maison.css`](../css/maison.css) |

## Content and photography prerequisites

The following are explicit production gates, not reasons to invent placeholders:

1. Real desktop/mobile hero crops and approved focal points.
2. A verified component sheet for each La Sculpture size, including whether leather is present in every listed SKU.
3. Resolution of the Jawhara composition conflict (`poly` versus `viscose & silk`) against supplier and care-label records.
4. SKU-level inventory state and made-to-order lead time.
5. Consent, spelling, and product attribution before displaying an artisan name.
6. SKU-level validation of making-time and edition-count claims.
7. Owner-approved three-generation/building chronology.
8. Native review of ES/TR/AR transcreation, including Arabic RTL screenshots.
9. Real atelier/process photographs with captions naming only verified people, places, and techniques.

## Acceptance definition

The redesign is ready for **production approval** only when the GitHub Pages visual preview and password-protected Hostinger staging both pass [`staging-release-checklist.md`](staging-release-checklist.md), and the visual comparison is recorded in [`fidelity-ledger.md`](fidelity-ledger.md). GitHub Pages is not evidence that PHP, contact delivery, WooCommerce recording, email, or payment presentation works.

Production remains untouched until the owner explicitly approves both previews.
