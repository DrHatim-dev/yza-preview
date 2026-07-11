# GitHub Pages visual-preview deployment

## Purpose and boundary

This preview exists for visual, responsive, navigation, and interaction review before Hostinger staging. It deliberately cannot execute PHP or report transactional success. The production Hostinger site and `/wp` WooCommerce recorder are not contacted by this build.

The expected public URL for this repository is:

`https://drhatim-dev.github.io/yza-preview/`

## One-time repository setting

In GitHub, open **Settings → Pages → Build and deployment** and select **GitHub Actions** as the source. Do not configure a custom domain for this visual preview.

The workflow deploys only when the exact branch `codex/maison-marrakech-redesign` is pushed. Pull requests run the same build, route verification, and secret scan without publishing. Manual workflow runs on another branch also build but cannot deploy.

## Deterministic build contract

`tools/preview/build.py` reads only Git-tracked or non-ignored files that match a narrow static allowlist. It never copies PHP, `/wp`, `.private`, credentials, deployment files, or arbitrary `data/` files. It then:

1. rewrites root-relative URLs to the repository base;
2. normalizes the pathname exposed to the existing clean-route router;
3. injects a no-index policy and `preview-guard.js` before storefront scripts;
4. creates static `index.html` aliases for all supported collections and catalog product handles;
5. writes a sorted SHA-256 manifest with no timestamps.

Running the same revision with the same base path produces the same bytes and manifest.

## Transaction safety

The preview guard blocks:

- `contact.php`;
- `subscribe.php`;
- `cart-capture.php`;
- `order.php`.

It covers `fetch`, `XMLHttpRequest`, `sendBeacon`, contact/newsletter form submits, the promotional signup, and the checkout place-order button. A blocked action shows **“Preview — sending disabled”** and endpoint requests receive a JSON error with status `503`; no code path receives a false `2xx` success.

The generated artifact contains no `.php` file, so GitHub Pages cannot execute server code even if the browser guard is bypassed.

## Release procedure

1. Run the four commands in [README-preview.md](../README-preview.md) locally.
2. Review `git status` and ensure no credential, subscriber, Brevo, transfer, or WordPress configuration file is staged.
3. Push `codex/maison-marrakech-redesign` only after the secret scan passes.
4. Wait for both `build-and-verify` and `deploy` to succeed.
5. Open the Pages URL in a private window and verify the homepage, one collection, one product, story, contact, cart, and checkout.
6. Attempt one contact/newsletter/order action and confirm the disabled-preview message appears with no success state.
7. Record visual approval before creating the separate password-protected Hostinger staging site.

## Troubleshooting

- A 404 on a known product usually means its handle was not present in `js/products.js` when the build ran. The builder fails if it finds no handles.
- An asset request escaping to `https://drhatim-dev.github.io/` means a root-relative URL was not rewritten. `verify.py` detects quoted escapes and should be extended for any newly introduced syntax.
- A failed secret scan prints only the finding type and file/line; it intentionally never prints the sensitive value.
- Never solve a preview route issue by adding PHP, copying `.htaccess`, publishing `/wp`, or disabling the safety guard.
