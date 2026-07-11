# Maison Marrakech fidelity ledger

Purpose: compare the implemented storefront against the approved concepts without using generated imagery as production content.

Current evidence state (11 July 2026): targeted viewport renders and runtime checks were completed in the integrated browser against the local worktree at 1440×1000, 1280×720, 390×844, and 360×800, then the validated runtime was committed as `98599eb`. They are recorded below as narrowly scoped local evidence. No final annotated concept-comparison set, public Pages deployment, Hostinger staging run, PHP success-path test, Lighthouse result, or creative approval is asserted by this ledger.

Status legend:

- `PASS` — verified in a browser screenshot at the required viewport.
- `LOCAL PASS` — the named, narrow behavior passed in the integrated local browser; it is not Pages/staging/release evidence.
- `CODE PRESENT` — confirmed by static code inspection only; browser/viewport behavior remains unverified.
- `PARTIAL` — direction is present but a named deviation remains.
- `BLOCKED` — waits for a real photo, verified copy/fact, native review, or staging capability.
- `NOT TESTED` — no evidence yet; never interpret as pass.

## Approved concept references

The concepts below are layout and art-direction specifications only. Product and atelier media in production must be real YZA photography.

| Surface | Concept file |
|---|---|
| Homepage desktop | `C:\Users\alexa\.codex\generated_images\019f493a-004a-7591-a083-8c6bafe2fb5d\exec-c643f570-f5b8-421d-b405-3ab20c2233e2.png` |
| Homepage Ranaco direction — hero and first edit | `C:\Users\alexa\.codex\generated_images\019f493a-004a-7591-a083-8c6bafe2fb5d\exec-6dc64b96-e75d-49fc-8a0a-cc02fe5ddb93.png` |
| Homepage Ranaco direction — editorial/community cadence | `C:\Users\alexa\.codex\generated_images\019f493a-004a-7591-a083-8c6bafe2fb5d\exec-315bd873-80c9-46b8-bb7a-e786f60bab03.png` |
| Homepage Ranaco direction — mobile | `C:\Users\alexa\.codex\generated_images\019f493a-004a-7591-a083-8c6bafe2fb5d\exec-abf54e0d-148e-48e2-b59f-5bb64962ff57.png` |
| Collection desktop | `C:\Users\alexa\.codex\generated_images\019f493a-004a-7591-a083-8c6bafe2fb5d\exec-38bf7098-7e30-423d-9736-f4b55eebc093.png` |
| PDP desktop | `C:\Users\alexa\.codex\generated_images\019f493a-004a-7591-a083-8c6bafe2fb5d\exec-d622aab2-f8b0-4f71-9e2e-1637ebb58c6b.png` |
| Story desktop | `C:\Users\alexa\.codex\generated_images\019f493a-004a-7591-a083-8c6bafe2fb5d\exec-d1c9b902-8b07-432d-b0e0-765e4522ed38.png` |
| Home/PDP mobile | `C:\Users\alexa\.codex\generated_images\019f493a-004a-7591-a083-8c6bafe2fb5d\exec-02dab874-b73d-482d-a76b-856072cca93f.png` |
| Cart and checkout | `C:\Users\alexa\.codex\generated_images\019f493a-004a-7591-a083-8c6bafe2fb5d\exec-192b72dd-61a7-48d0-88f9-7e9eba0ed39b.png` |
| Lower homepage/footer | `C:\Users\alexa\.codex\generated_images\019f493a-004a-7591-a083-8c6bafe2fb5d\exec-3fe6dbbe-ce47-4ebe-ae7e-b7c68f18abf6.png` |

## Local integrated-browser QA — 11 July 2026

These results apply to the local worktree only. They do not validate live PHP, email, Brevo, WooCommerce, payments, Pages deployment, Hostinger staging, Lighthouse, or production.

| Scope | Local result | Evidence and remaining boundary |
|---|---|---|
| Required viewports | LOCAL PASS | Browser viewports were requested at 1440×1000, 1280×720, 390×844, and 360×800. Final annotated concept comparisons and tablet coverage remain pending. |
| Six-page runtime hygiene | LOCAL PASS | Home, collection, PDP, story, contact, and checkout: 0 duplicate IDs, 0 images without an `alt` attribute, 0 empty `href`, and 0 console errors in the tested runtime. This is not a full-site crawl. |
| Horizontal overflow | LOCAL PASS | The six representative pages had no horizontal overflow at the requested desktop/mobile breakpoints after the local fixes. Zoom, tablet, and every ancillary route remain pending. |
| Arabic RTL geometry | LOCAL PASS | The initial 11,582 px overflow was traced to the honeypot positioned with `left:-9999px`; after the fix, `clientWidth` and `scrollWidth` both measured 1,583 px in the tested RTL view. Native-language, full breakpoint, and screen-reader review remain pending. |
| Menu and cart overlays | LOCAL PASS | Open/close, `inert`/`aria-hidden`, and opener focus restoration passed locally. Full keyboard path, Escape/overlay permutations, touch sizing, and visual concept comparison remain release-gate items. |
| Search | LOCAL PASS | Results rendering, initial focus into `#searchInput`, and opener-focus restoration passed after the final overlay fix. Full keyboard result traversal, Escape permutations, and screen-reader review remain pending. |
| Collection XS filter | LOCAL PASS | Choosing XS changed the URL state and visible result count. Sort, search, back/forward restoration, every category, and keyboard/touch equivalence remain pending. |
| PDP purchase path | LOCAL PASS | Add to cart succeeded locally. Unverified Fatima attribution, 35–85-hour claims, and series-of-15 claims were absent from the rendered PDP. Variant matrix, gallery, video network behavior, and verified product facts remain pending. |
| Checkout failure path | LOCAL PASS | A local recorder failure retained cart and customer fields; Retry reused the same `orderNumber`; WhatsApp fallback remained available; no false success appeared. This does not test `order.php`, WooCommerce recording, mail, payment, or a successful order. |
| Contact failure path | LOCAL PASS | Local submission failure retained the entered fields, announced an alert, and showed no false success. Server delivery, reference generation, throttle/honeypot behavior, and success require isolated Hostinger staging. |

## Global fidelity contract

| Comparison point | Approved intent | Implementation hook | Desktop | Mobile | Evidence/deviation |
|---|---|---|---|---|---|
| Typography | Bodoni Moda display; Jost UI/body; clear object-first hierarchy | [`css/tokens.css`](../css/tokens.css), [`assets/fonts`](../assets/fonts), headings/UI in [`css/maison.css`](../css/maison.css) | NOT TESTED | NOT TESTED | Self-hosted Latin/Latin-ext WOFF2 subsets and OFL files are present; record computed font, fallbacks, and network requests |
| Palette | Ivory `#F7F4EE`, ink `#171512`, muted `#68615A`, rule `#D8D0C5`, terracotta `#A84928` | color tokens and component states | NOT TESTED | NOT TESTED | Check contrast as well as visual match |
| Spacing | 72/64 px header, 32–48 px desktop and 20 px mobile gutters, generous vertical cadence | header/container/section rules | PARTIAL | PARTIAL | No horizontal overflow on the six tested pages at the four requested viewports; header overlap, zoom, tablet, and full-site cadence still need coverage |
| Imagery | Real YZA editorial/product imagery, separate portrait crops, no generated production photo | page `picture`/gallery/card media; optimized worktree files under [`assets/optimized`](../assets/optimized) | BLOCKED | BLOCKED | Real YZA crops are wired into the pages; owner focal-point/crop approval is still required |
| Motion | restrained reveal/crossfade; purposeful opt-in video; reduced-motion branch | `[data-reveal]` in [`css/maison.css`](../css/maison.css), media loader in [`js/main.js`](../js/main.js) | NOT TESTED | NOT TESTED | Record normal and reduced-motion behavior |
| Chrome | restrained five-link desktop nav, accessible mobile drawer, quiet editorial footer | [`js/chrome.js`](../js/chrome.js), static skeleton markup | PARTIAL | PARTIAL | Menu/cart open-close, `inert`/`aria-hidden`, focus restoration, and search initial focus passed locally; complete keyboard path, CLS, and footer fidelity remain pending |

## Homepage

| Comparison point | Concept target | Code hook | Status | Evidence/deviation |
|---|---|---|---|---|
| Above-fold composition | Quiet white utility/header → full-bleed YZA campaign photograph → one bottom-left line-arrow CTA | `.ranaco-hero` and `.ranaco-image-cta` in [`index.html`](../index.html), scoped rules in [`css/maison.css`](../css/maison.css) | CODE PRESENT | The split copy-led hero was removed. Public Pages screenshots at 1440×1000 and 390×844 remain required before visual PASS. |
| Copy hierarchy | No visible hero headline or paragraph; the campaign image carries the first viewport and the H1 remains available to assistive technology | `#heroTitle.visually-hidden`, `.ranaco-hero__cta` | CODE PRESENT | CTA is localized in five languages; localized bottom scrim protects contrast without tinting the whole photograph. |
| Scroll cadence | campaign hero → immediate four-up product edit → paired editorial band → four-up community wall → compact proof/reviews → manifesto → FAQ/footer | top-level sections in [`index.html`](../index.html) | CODE PRESENT | Structure now follows the approved Ranaco-inspired cadence; public screenshot and creative approval remain pending. |
| Product presentation | large object image, quiet proof line, price secondary | cards via [`js/main.js`](../js/main.js) | NOT TESTED | Confirm craft line is visible rather than CSS-hidden |
| Footer close | editorial newsletter plus concise service/legal links | footer in [`js/chrome.js`](../js/chrome.js) | NOT TESTED | Compare lower-page concept, then test actual form behavior on staging |

### Above-fold copy comparison

| Item | Approved | Implemented | Status |
|---|---|---|---|
| Eyebrow | None | None | CODE PRESENT |
| H1 | Visually absent; retained semantically | `Le vestiaire moderne de Marrakech` is visually hidden in `#heroTitle` | CODE PRESENT |
| Supporting line | None in the image-led first viewport | None | CODE PRESENT |
| Primary CTA | `Découvrir la collection` | `Découvrir la collection` | CODE PRESENT |
| Secondary CTA | None | None | CODE PRESENT |

### Ranaco-direction comparison notes

1. **Layout:** the hero is now one full-bleed photographic field, followed immediately by a four-up edit with a 4px rhythm; the previous split panel and large copy blocks are absent.
2. **Typography:** visible first-viewport text is limited to a tracked 11px UI CTA; the YZA wordmark and sparse navigation sit on true white chrome.
3. **Palette:** the page uses true white between image fields; a localized bottom scrim is used only where needed for CTA contrast.
4. **Imagery:** desktop and mobile use separate, verified real-YZA campaign photographs; product, atelier and community assets remain YZA-owned rather than generated concept imagery.
5. **Spacing and cadence:** product/community grids use 4px gutters and no outer section padding; the manifesto and FAQ provide the intentional breathing room later in the journey.
6. **Responsive behavior:** phones use a 82vw horizontal product rail and a two-column community wall; tablets switch to a two-column product edit, avoiding oversized single-card rails.
7. **Motion/accessibility:** image and arrow motion use the approved easing and are disabled under reduced motion; keyboard focus exposes the same product/community information as hover.

## Collection

| Comparison point | Concept target | Code hook | Status | Evidence/deviation |
|---|---|---|---|---|
| Intro | collection thesis, quiet count and controls | `.collection-head`, `.toolbar` in [`collections.html`](../collections.html) | NOT TESTED | Capture desktop/mobile and filter overflow |
| Grid | three columns desktop, two mobile | `#collectionGrid` | NOT TESTED | Verify actual card widths at all required viewports |
| Editorial interruption | one real process/campaign block after first row | `.product-story`/`.col-story--ingrid`, collection renderer in [`js/main.js`](../js/main.js) | BLOCKED | Insertion code and real local media paths are present; owner must approve the selected crop and factual caption |
| State | filter/sort/search represented in URL and restored by back/forward | collection logic in [`js/main.js`](../js/main.js) | PARTIAL | XS changed the URL and visible count locally; sort, search, and back/forward restoration remain untested |
| Quick add | focus/touch equivalent, product link remains primary | product-card actions | NOT TESTED | Keyboard and touch evidence required |

## Product detail

| Comparison point | Concept target | Code hook | Status | Evidence/deviation |
|---|---|---|---|---|
| Desktop split | 60/40 gallery and sticky purchase panel | `.product`, `.gallery`, `.product-info` in [`produit.html`](../produit.html) | NOT TESTED | Capture 1440×1000 and sticky state |
| Mobile order | title/proof/price/CTA before media | DOM/order rules for `.product-info` and `.gallery` | NOT TESTED | Capture 390×844 before any scroll |
| Proof | visible material/place/repair, factual only | `#pBullets`, `#productStory`, accordions | PARTIAL | Unverified Fatima, 35–85-hour, and series-of-15 claims were absent from the tested render; positive facts still require product-record approval |
| Sticky CTA | safe-area-aware, appears after inline CTA leaves viewport | `#mobileProductBar` | NOT TESTED | Capture visible state and keyboard/zoom behavior |
| Gallery | still first, real process image, opt-in motion, accessible controls | `#galMain`, `#galThumbs`, [`js/main.js`](../js/main.js) | NOT TESTED | Network evidence must show no early video bytes |

## Story

| Comparison point | Concept target | Code hook | Status | Evidence/deviation |
|---|---|---|---|---|
| Opening | founder-led editorial image and concise thesis | `.maison-story-lead` in [`histoire.html`](../histoire.html) | BLOCKED | A real founder crop and five-language lead are present; owner image/copy/translation approval remains required |
| Documentary proof | atelier process with specific factual captions | `#atelier`, [`studio.html`](../studio.html) | BLOCKED | Verify people/technique/place before captioning |
| Three generations | readable chronology, not a wall of copy | `#generations` | NOT TESTED | Owner approval of dates/building history required |
| Proof rail | factual atelier/location/repair statements | story proof component | BLOCKED | Content validation required |
| Visit CTA | visible studio visit/appointment action | story close → contact/WhatsApp | NOT TESTED | Test destination and allowlist on staging |

## Cart and checkout

| Comparison point | Concept target | Code hook | Status | Evidence/deviation |
|---|---|---|---|---|
| Cart composition | full-width mobile, unclipped lines, quiet totals and CTA | `.cart-drawer` in [`js/chrome.js`](../js/chrome.js) | PARTIAL | Core open/close, state hiding/inertness, focus restoration, and representative no-overflow behavior passed; empty/one-line/multi-line visual comparison remains pending |
| Checkout composition | editorial two-column desktop, readable single-column mobile | `.checkout` in [`checkout.html`](../checkout.html)/[`js/checkout.js`](../js/checkout.js) | PARTIAL | No horizontal overflow at the four requested viewports and local failure state exercised; payment/success/staging visuals remain pending |
| Reliability | confirmation only after recorder success | [`order.php`](../order.php), submit branch in [`js/checkout.js`](../js/checkout.js) | NOT TESTED | Hostinger staging only; Pages cannot prove this |
| Failure state | cart/form retained; Retry and WhatsApp fallback | checkout failure renderer | LOCAL PASS | Local endpoint failure retained cart/fields, Retry kept one `orderNumber`, fallback remained present, and no false success appeared; staging recorder evidence still required |

## Contact

| Comparison point | Required behavior | Code hook | Status | Evidence/deviation |
|---|---|---|---|---|
| Client failure state | Keep entered fields, announce failure, never fake delivery | `[data-contact-form]` in [`contact.html`](../contact.html), [`contact.php`](../contact.php) | LOCAL PASS | Local failure retained fields, produced an alert, and showed no false success |
| Server success/delivery | Return `{ok:true,reference}` only after accepted delivery | [`contact.php`](../contact.php) | NOT TESTED | Requires isolated Hostinger staging with an allowlisted recipient; no PHP or delivery PASS is claimed |

## Required final evidence

Before creative approval, attach or link:

1. Latest implementation screenshots at 1440×1000, 1280×720, 390×844, and 360×800.
2. One side-by-side or annotated comparison per accepted concept surface.
3. At least five explicit comparison notes per key page covering layout, typography, palette, imagery, spacing, and motion/mobile behavior.
4. Normal-motion and reduced-motion evidence.
5. A core-interaction recording or screenshot sequence for nav, collection state, PDP variant/add-to-cart, cart, checkout failure/retry, and checkout success.
6. A list of every intentional deviation with reason and owner acceptance.

Creative approval must cite a commit SHA. If the implementation changes after approval, affected rows return to `NOT TESTED` until rechecked.
