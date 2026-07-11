# YZA preview, staging, and release checklist

Release candidate: `codex/maison-marrakech-redesign`
Runtime implementation commit: `98599eb`
Production truth: `C:\Users\alexa\Documents\YZA-SAFETY-ARCHIVE-2026-07-10\hostinger-application-2026-07-10`
Rule: GitHub Pages proves visuals only; Hostinger staging proves PHP and integrations; neither authorizes production automatically

Execution status (11 July 2026): **local candidate validated; external sign-off pending**. The final JavaScript/Python syntax checks, six preview tests, tracked-source scan, deterministic build, route/guard verification, artifact scan, and Git whitespace gate passed immediately before runtime commit `98599eb`. Two consecutive preview builds produced tree hash `95afc29ccc92241d4ce5925434d1bc051b74786b40dea797b44cb4b8de761c73`. Targeted integrated-browser QA also ran locally at 1440×1000, 1280×720, 390×844, and 360×800. These are local results only: GitHub Pages, staging PHP, Lighthouse, integrations, creative approval, and production remain unapproved. GitHub publication is waiting for an authenticated `gh` session.

## 1. Pre-preview repository gate

- [ ] Work is on `codex/maison-marrakech-redesign`, not the dirty source checkout.
- [ ] The production-baseline commit contains only verified public files from the Hostinger snapshot.
- [ ] `git status` and the intended file manifest are reviewed.
- [ ] No `.private`, WordPress configuration, transfer notes, credentials, subscriber/customer/order exports, Brevo handoff files, encrypted archives, or local safety snapshots are tracked.
- [ ] Secret scan passes across tracked content and the commit range to be pushed; findings are reported by path/type without printing values.
- [ ] Binary and media additions are all real YZA-owned assets with provenance; generated concept images are absent from production assets.
- [ ] Existing storage keys, `YZA.*` APIs, analytics hooks, IDs/data hooks, language attributes, and RTL behavior have not been renamed without a migration.
- [ ] Cache keys for changed immutable CSS/JS are bumped in the release candidate, but production files are not uploaded.

## 2. GitHub Pages visual preview

GitHub Pages cannot execute PHP. It must never present a form submission as delivered.

### Build and deploy

- [ ] Run the deterministic preview build owned by `tools/`/the Pages workflow.
- [ ] Root-relative asset and clean-route references are rewritten for the repository subpath.
- [ ] Direct-load smoke tests pass for home, collections, product, story, studio, contact, checkout, and 404 routes.
- [ ] Preview output is generated, not hand-edited.
- [ ] Secret scan passes on the exact generated output before upload.
- [ ] Public preview URL and commit SHA are recorded.

### Preview-only safety behavior

- [ ] Calls to `contact.php`, `subscribe.php`, `order.php`, cart capture, cron, email, WhatsApp automation, WooCommerce, and any other mutating endpoint are blocked or intercepted.
- [ ] A user attempting submission receives: `Preview — sending disabled` (localized where applicable).
- [ ] The preview never shows a normal success reference, order confirmation, welcome state, or purchase event after an intercepted request.
- [ ] Production pixels and conversion events are disabled in preview mode.
- [ ] Links to WhatsApp/mail do not auto-open or transmit during automated tests.

### GitHub Pages sign-off

- [ ] Creative owner approves desktop and mobile composition.
- [ ] Fidelity comparison is recorded in [`fidelity-ledger.md`](fidelity-ledger.md).
- [ ] Known differences caused by static preview limitations are listed.
- [ ] Approval is explicitly “visual preview approved,” not “production approved.”

## 3. Password-protected Hostinger staging

Target: `staging.yza-shop.com` or an owner-approved equivalent.

### Isolation and access

- [ ] Staging has its own document root; it is not an alias to production.
- [ ] HTTP authentication or Hostinger password protection is enabled before DNS/public access.
- [ ] Credentials are shared through the approved password manager, never Git or chat.
- [ ] `robots.txt` disallows crawling and staging sends `X-Robots-Tag: noindex, nofollow, noarchive`.
- [ ] Staging canonical/OG URLs cannot cause it to be indexed as production.
- [ ] Directory listing is disabled.
- [ ] PHP errors are logged privately and not displayed to visitors.
- [ ] TLS is valid for the staging hostname.

### WooCommerce isolation — non-negotiable

- [ ] Staging uses an isolated WooCommerce/WordPress test installation and separate test database.
- [ ] No production customer, order, session, payment token, subscriber, or log data is copied into staging.
- [ ] Staging `order.php` targets only the isolated test recorder.
- [ ] Test products/SKUs needed for mapping contain synthetic names and no personal data.
- [ ] Payment methods are in display/test mode only; no live capture is possible.
- [ ] Scheduled jobs cannot call production WooCommerce or production email automations.
- [ ] Production `/wp` is not modified, cloned over, migrated, reset, or used as staging.

### Outbound allowlists and tracking

- [ ] Contact delivery is restricted to named internal test recipients.
- [ ] Newsletter/Brevo traffic is restricted to a dedicated test list or approved test address.
- [ ] WhatsApp destinations are replaced with the approved internal test number or disabled with a clear staging notice.
- [ ] Order/transaction emails route only to the allowlist.
- [ ] SMTP/API credentials are staging-specific and stored outside the public document root.
- [ ] Analytics, advertising, affiliate, retargeting, and conversion pixels are disabled.
- [ ] Any retained diagnostic analytics uses a distinct staging property with no production conversion events.
- [ ] Webhooks and CRON endpoints are staging-specific and cannot mutate production.

## 4. Functional acceptance matrix

Record the browser/device, timestamp, tester, result, and evidence for every row.

### Interim local evidence — not staging sign-off

- Home, collection, PDP, story, contact, and checkout rendered without horizontal overflow at the four requested desktop/mobile viewports after the local fixes.
- Across those six runtime pages: 0 duplicate IDs, 0 images without an `alt` attribute, 0 empty `href`, and 0 console errors.
- Menu/cart open-close, `inert`/`aria-hidden`, and opener-focus restoration passed locally.
- Arabic RTL initially expanded to 11,582 px because the honeypot used `left:-9999px`; after correction, `clientWidth === scrollWidth === 1583`. This proves only the tested overflow fix, not native-language or full RTL acceptance.
- XS collection filtering changed the URL and result count. PDP add to cart passed, while unverified Fatima, 35–85-hour, and series-of-15 claims were absent from the tested render.
- Local checkout failure retained cart and customer fields; Retry reused the same `orderNumber`; WhatsApp fallback remained present; no false success appeared.
- Local contact failure retained fields, announced an alert, and showed no false success.
- Search results and opener-focus restoration passed, but initial focus into the search input still requires revalidation.
- No successful PHP, contact delivery, WooCommerce recording, payment, email/Brevo, staging, Lighthouse, or deployed Pages path was tested by this browser run.

| Journey | Required checks | Result/evidence |
|---|---|---|
| Navigation | Desktop five-link nav, mobile drawer, active states, Escape, overlay click, focus trap/restoration | Local partial: menu/cart open-close, `inert`/`aria-hidden`, and focus restoration passed; full keyboard, active-state, Escape/overlay permutations remain pending |
| Language | FR/EN/ES/TR/AR switch; persistence; no missing keys; Arabic RTL | Local partial: one RTL overflow defect was fixed and geometry matched at 1,583 px; language parity, persistence, native review, and all RTL breakpoints remain pending |
| Search | Open/close/focus, query, no results, direct product route, keyboard use | Local partial: results and opener-focus restoration passed; initial input focus and remaining query/keyboard cases require revalidation |
| Collections | Filters, URL state, sort, search, back/forward restoration, editorial interruption, two/three-column layout | Local partial: XS changed URL and result count; sort/search/back-forward/other filters and full visual coverage remain pending |
| Product variants | Correct size/color/finish, price, gallery, thumbnails, inventory state, add to cart | Local partial: representative add to cart passed and unverified claims were absent; complete variant/gallery/inventory matrix remains pending |
| Gallery | Still first, opt-in video, play/pause, offscreen pause, zoom/close, keyboard and labels | Pending |
| Cart | Persistence after reload, quantity, remove, subtotal/shipping, upsell, close/reopen, full-width mobile | Local partial: open-close, `inert`/`aria-hidden`, focus restoration, and retention during checkout failure passed; remaining cart matrix pending |
| Wishlist | Add/remove, persistence, count, product navigation | Pending |
| Waitlist | Sold-out state posts `source="waitlist"` plus page/handle to the test list only | Pending |
| Newsletter | Approved test subscription, one expected welcome flow, no duplicate/production contact | Pending |
| Contact | Validation, honeypot, throttle, server success reference, delivery to allowlist, server failure | Local partial: client failure retained fields, alerted, and did not fake success; PHP validation/delivery/success and staging allowlist remain pending |
| Failed order | Recorder failure keeps cart and every form field; Retry and WhatsApp fallback remain available | Local partial: client failure path retained cart/fields, reused one `orderNumber`, kept fallback, and showed no false success; real recorder/staging evidence pending |
| Successful order | One recorder entry, stable order number, one confirmation, cart cleared only after success | Pending |
| Double submit | Button/keyboard repeats do not create duplicate orders or duplicate events | Pending |
| Payment presentation | COD, Morocco RIB, international IBAN, PayPal presentation matches approved business rules | Pending |
| Recovery | Approved cart capture/recovery behavior remains isolated and allowlisted | Pending |
| Clean routes | Direct load/reload for every public route and representative product/collection links | Local partial: six representative pages loaded with no console errors; full route set, reload aliases, studio, and 404 still pending |
| 404 | Helpful 404, correct chrome, no console or routing loop | Pending |

### Contract assertions

The local browser run supports the client-side failure behavior described below, but the boxes remain unchecked until the PHP contracts and delivery/recording behavior pass on isolated staging.

- [ ] `POST /contact.php` accepts `{name,email,phone?,subject?,message,lang,page,_hp?}`.
- [ ] Contact success is 2xx JSON `{ok:true,reference}`; validation/server failures are appropriate 4xx/5xx JSON `{ok:false,error}`.
- [ ] Contact UI never shows success before the response confirms it.
- [ ] `order.php` returns `{ok,orderNumber,recorded,error?}`.
- [ ] Checkout reuses one generated order number across retry/idempotency handling.
- [ ] `purchase`, cart clear, and final confirmation occur only after `{ok:true,recorded:true}`.
- [ ] Failure retains the complete cart and form state.
- [ ] `/subscribe.php` preserves existing welcome/promo behavior and receives `source="waitlist"` only for the waitlist path.

## 5. Responsive and visual QA

Required native viewports:

- [ ] Desktop 1440×1000.
- [ ] Desktop 1280×720.
- [ ] Mobile 390×844.
- [ ] Mobile 360×800.
- [ ] Tablet portrait and landscape at the implemented breakpoints.
- [ ] Arabic RTL at desktop, tablet, and 390×844.

Interim evidence: the four named desktop/mobile viewports were exercised locally on home, collection, PDP, story, contact, and checkout. They remain unchecked as release gates because they must be repeated against the exact Pages/staging candidate; tablet and complete Arabic RTL coverage were not performed.

At every representative page:

Interim evidence: the six named pages had no horizontal overflow, duplicate IDs, images missing `alt`, empty `href`, or console errors in the tested local runtime. Ancillary routes, zoom, mixed-content/network review, and exact-commit reruns remain pending, so the release checkboxes below are not closed.

- [ ] No horizontal clipping or unexpected scrollbar.
- [ ] Header never overlaps content; announcement/no-announcement states both work.
- [ ] Cart and mobile drawer fit the viewport and safe area.
- [ ] Touch controls are at least 44×44 px.
- [ ] Type scale, gutters, rules, and palette match the approved Maison system.
- [ ] Real image crop preserves the product/founder/atelier focal point.
- [ ] No generated concept image is used as a product or atelier photograph.
- [ ] No duplicate IDs.
- [ ] No missing images, malformed accents, or mojibake.
- [ ] No console error, unhandled rejection, mixed content, or 404 asset.
- [ ] Latest implementation screenshots are compared to accepted concepts and entered in the fidelity ledger.

## 6. Accessibility QA

Interim evidence: menu/cart state hiding (`inert`/`aria-hidden`) and opener-focus restoration passed locally. Search initial input focus still needs revalidation, and no complete keyboard, screen-reader, zoom, contrast, or reduced-motion acceptance is claimed.

- [ ] Keyboard-only path reaches skip link, nav, search, filters, product options, gallery, add-to-cart, cart, forms, and footer.
- [ ] Focus order follows the visual/reading order.
- [ ] Focus is trapped within open overlays and restored to the opener.
- [ ] Escape closes the topmost dismissible overlay.
- [ ] Form labels are explicit; inline errors use `aria-describedby`; first invalid field receives focus.
- [ ] Dynamic cart, waitlist, contact, and checkout statuses use appropriate live regions without excessive repetition.
- [ ] Accordion buttons expose `aria-expanded` and `aria-controls` with unique panel IDs.
- [ ] Gallery buttons expose current state and meaningful labels.
- [ ] Meaningful images have specific alt text; decorative imagery has empty alt.
- [ ] 200% zoom does not hide content or require two-dimensional scrolling for normal text.
- [ ] Contrast passes WCAG AA for body text, UI text, controls, focus, and state indicators.
- [ ] `prefers-reduced-motion` removes nonessential movement and keeps all content visible.
- [ ] Screen-reader smoke covers page title/H1, landmarks, nav name, product price/state, form errors, cart totals, and confirmation.

## 7. Performance and transmission QA

- [ ] Mobile homepage initial transfer is ≤2 MB on a cold load.
- [ ] No video bytes transfer before explicit intent or the approved intent threshold.
- [ ] `Save-Data` receives posters/stills and no automatic prefetch/video.
- [ ] Product and editorial images have explicit width/height plus responsive `srcset`/`sizes` where variants exist.
- [ ] LCP ≤2.5 s on the target mobile profile.
- [ ] CLS ≤0.1, including injected/hydrated chrome and font swap.
- [ ] INP ≤200 ms for nav, filter, variant, add-to-cart, and checkout actions.
- [ ] Lighthouse ≥90 for Performance, Accessibility, Best Practices, and SEO on home, collection, PDP, and checkout/contact representative pages.
- [ ] Network log shows no unexpected production transmission from staging.

## 8. Release approval gate

All approvals must name the exact branch/commit and preview URLs:

- [ ] Creative owner: GitHub Pages visual approval.
- [ ] Creative owner: Hostinger staging visual approval.
- [ ] Engineering: functional/reliability approval.
- [ ] Accessibility QA approval.
- [ ] Performance QA approval.
- [ ] Business owner: copy, product facts, inventory states, payment presentation, address, and contact destinations.
- [ ] Native-language reviewer: ES, TR, AR; Arabic RTL screenshots approved.
- [ ] Final production deployment explicitly authorized in a separate action-time message.

No checkbox inferred from silence is approval.

## 9. Production deployment — only after approval

### Pre-deploy

- [ ] Take a complete Hostinger file and database backup and verify restore instructions.
- [ ] Record the exact backup timestamp and identifier.
- [ ] Generate a reviewed allowlist of files to upload.
- [ ] Confirm the manifest contains no `/wp` path.
- [ ] Confirm the deployment command does not mirror-delete or remove remote extras.
- [ ] Re-run secret scan and build/automated tests on the exact commit.
- [ ] Bump immutable CSS/JS cache keys.
- [ ] Prepare the rollback file manifest from the exact pre-deploy snapshot.

### Deploy

- [ ] Upload only the reviewed manifest through FTPS.
- [ ] Never mirror-delete.
- [ ] Never upload to, delete from, or alter production `/wp` in this front-end release.
- [ ] Keep credentials out of terminal output and logs.

### Immediate smoke

- [ ] Apex and `www` serve the same approved Hostinger release over HTTPS.
- [ ] Home, collection, PDP, story, studio, contact, cart, checkout, legal, robots, sitemap, and 404 load.
- [ ] One tightly controlled production contact/newsletter/order smoke is performed only if separately approved; otherwise use passive checks and logs.
- [ ] No console errors, PHP fatal errors, routing regressions, missing assets, or unexpected third-party transmissions.

### 48-hour monitoring

- [ ] WooCommerce recorder success/failure rates.
- [ ] Checkout completion and retry/fallback behavior.
- [ ] Contact and newsletter delivery/errors.
- [ ] PHP/web-server logs and automation logs.
- [ ] Analytics event sanity without duplicate purchase.
- [ ] Core Web Vitals and top route 404s.
- [ ] Customer-support reports for layout, language, payment, or cart regression.

Rollback immediately from the exact pre-deploy snapshot if checkout, form delivery, routing, payment presentation, order recording, or critical rendering regresses.

## Release record

- Commit SHA: `__________`
- GitHub Pages URL: `__________`
- Staging URL: `__________`
- Fidelity ledger completed by/date: `__________`
- Functional QA by/date: `__________`
- Accessibility QA by/date: `__________`
- Performance QA by/date: `__________`
- Production approval by/date: `__________`
- Pre-deploy backup ID: `__________`
- Uploaded file manifest: `__________`
- Production deploy time: `__________`
- Monitoring owner/window: `__________`
