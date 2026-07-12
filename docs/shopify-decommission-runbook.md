# Shopify decommission runbook — YZA legacy store

Target store: `yza-shop-2950.myshopify.com`
Replacement platform: Hostinger storefront plus the existing `/wp` WooCommerce order recorder
Status: preparation and evidence capture may proceed; irreversible actions require the store owner at the keyboard

Execution record (11 July 2026): **no remote Shopify deactivation or erasure, no local Shopify-artifact deletion, and no Recycle Bin purge is asserted by this runbook.** All evidence-table rows and completion fields below are pending until the owner performs or witnesses the applicable action and the reference is recorded.

## Hard stop

This runbook **must stop before** any of the following:

- clicking the final Shopify plan-cancellation/deactivation confirmation;
- submitting customer personal-data erasure to Shopify Support;
- submitting merchant personal-data erasure through Shopify Privacy Controls;
- permanently deleting the encrypted export archive;
- deleting the local Shopify app or mirror; or
- emptying synchronized trash/Recycle Bin copies that contain the last recoverable copy.

At each stop, obtain a fresh, action-specific confirmation from the store owner after they have reviewed the evidence table. Store-owner login, password, and two-step authentication must be entered by the owner. No credential or secret value belongs in this document, a terminal transcript, Git, an issue, or a chat message.

Shopify states that a store can be deactivated only by the store owner and that required two-step authentication must be completed. A deactivated store is normally retained for two years; separate customer-data erasure makes the store unrecoverable. See [Shopify’s deactivation guidance](https://help.shopify.com/en/manual/your-account/manage-orgs-and-stores/manage-pricing-plan/deactivate-store) and [data-erasure guidance](https://help.shopify.com/en/manual/privacy-and-security/privacy/delete-data?lang=en).

## Protected production boundaries

- Production truth is the verified Hostinger snapshot at `<PRIVATE_HOSTINGER_SNAPSHOT>`. Resolve this placeholder in an owner-only local checklist; never commit a personal absolute path.
- Preserve Hostinger `/wp`. It is WooCommerce, not Shopify.
- Preserve legacy Shopify URL redirects in the active `.htaccess`; they protect indexed links and bookmarks.
- Do not alter production DNS, Hostinger files, or `/wp` while decommissioning Shopify.
- Verify both `https://yza-shop.com/` and `https://www.yza-shop.com/` continue to resolve to and serve Hostinger before and after remote Shopify actions.

## Phase A — identify authority and scope

Record evidence without secrets:

| Check | Required evidence | Status / reference |
|---|---|---|
| Store owner | Owner confirms the Shopify admin account and 2FA access | Pending |
| Store identity | Admin store name and `yza-shop-2950.myshopify.com` match | Pending |
| Other Shopify stores | List every store tied to the owner email; merchant erasure affects all associated shops/accounts | Pending |
| Plan and billing cycle | Plan type, next billing date, pending balance | Pending |
| Domain ownership | Registrar, nameservers, renewal owner, and Shopify-managed domains | Pending |
| Open obligations | Unfulfilled orders, refunds, subscriptions, pre-orders, chargebacks, gift cards | Pending |
| Required retention | Accounting, tax, consumer-protection, and dispute-retention period confirmed with the business adviser | Pending |

If any row is unknown, the remote closure gate remains closed.

## Phase B — create the temporary encrypted archive

### Archive content

Export or capture all applicable records before uninstalling apps or losing admin access:

1. **Catalog**
   - products, variants, SKUs, barcodes, vendors, tags, collections, options;
   - inventory by location and inventory adjustment records available to the account;
   - product media and Shopify Files, with an asset manifest and source URLs;
   - redirects, navigation, pages, blog posts, policies, and SEO fields.
2. **Orders and customers**
   - orders, line items, discounts, taxes, shipping, fulfillments, refunds, cancellations, notes, and payment status;
   - customer records, consent/marketing state, addresses, tags, and account status;
   - draft orders, abandoned checkouts/recovery records where export is legally permitted;
   - subscriptions and pre-orders managed by apps, including their provider-side records.
3. **Commercial obligations**
   - active discounts and automatic discounts;
   - gift cards, balances, issue/expiry details, and a resolution plan;
   - returns, exchanges, warranties, repair commitments, and unresolved support cases.
4. **Finance**
   - payouts, transactions, fees, chargebacks/disputes, tax reports, invoices, billing history, and app charges;
   - pending payouts and a contact route for disputes after admin access is lost.
5. **Store configuration**
   - shipping zones/rates, taxes/duties, locations, markets, currencies, languages, notifications, checkout settings, pixels, and consent settings;
   - staff/collaborator list and roles;
   - domains, DNS records, SSL state, renewal settings, and registrar transfer codes only in the approved secret vault—not in the archive manifest.
6. **Themes and code**
   - every theme download, including unpublished/duplicate themes;
   - theme purchase/license receipts and any transfer eligibility;
   - custom scripts, app blocks, checkout customizations, and a screenshot of theme assignments.
7. **Apps and integrations**
   - installed public, private, and custom apps;
   - app owner/vendor, purpose, billing channel, data held, export method, deletion contact, API scopes, webhooks, pixels, and external automation endpoints;
   - provider-side exports for apps whose data is not stored in Shopify.

### Archive controls

- Place exports in a temporary working folder outside any Git repository and outside public/synchronized sharing by default.
- Build an inventory with relative path, file size, SHA-256, export date, and source screen/API.
- Encrypt with a modern authenticated format (for example, AES-256 in an approved archive tool).
- Store the archive password/recovery key in the owner’s password manager, never next to the archive.
- Make two verified copies on separate media before remote deactivation.
- Open-test representative CSV, JSON, image, theme, and finance files after encryption/decryption.
- Record the legally approved destruction date. Customer exports must not become an indefinite “just in case” backup.

### Export acceptance gate

Do not continue until:

- counts for products, variants, customers, orders, gift cards, and installed apps are recorded;
- open orders/refunds/chargebacks have named owners and a resolution path;
- representative exports open correctly;
- both encrypted copies match their hashes; and
- the store owner signs the archive manifest.

## Phase C — disconnect apps, webhooks, access, and billing

Perform these steps while admin access remains active:

1. Export app-owned data and obtain a deletion/retention confirmation from each provider.
2. Record every app’s Shopify billing status and any billing performed directly by the vendor.
3. Cancel provider-side subscriptions first where Shopify cancellation would not stop direct billing.
4. List and remove custom apps, private app credentials, Admin API tokens, Storefront API tokens, app proxies, webhooks, pixels, and automation callbacks after their export is verified.
5. Revoke collaborator accounts, staff accounts, service accounts, deployment tokens, and GitHub/CI secrets that exist solely for Shopify.
6. Disable Shopify-connected email/SMS, analytics, catalog feeds, Meta/Google channels, social shop feeds, fulfillment integrations, and marketplace connectors after confirming Hostinger alternatives.
7. Rotate any credential that appeared in a local `.env`, transfer file, logs, or prior repository history. Revocation, not file deletion, is the security boundary.
8. Capture the final app/access/webhook inventory showing zero active credentials that can mutate the legacy store.

Do not copy raw tokens or secret suffixes into evidence. Record only provider, credential type, created/revoked timestamp, and the owner who verified revocation.

## Phase D — settle commercial and domain obligations

- Fulfill, refund, migrate, or otherwise resolve every open order and subscription/pre-order.
- Resolve gift-card liabilities; export the gift-card CSV and decide the customer remedy.
- Download final bills and verify outstanding app usage, transaction, label, and subscription charges.
- Confirm pending payouts will settle to the correct bank account.
- Preserve the evidence required to contest existing chargebacks. Shopify warns that deactivation removes admin access needed to submit further evidence unless the store is reactivated.
- Cancel third-party app billing not handled by Shopify.
- Transfer any Shopify-managed domain to the approved registrar before closure, and disable unexpected renewals.
- Confirm the custom YZA domain is already managed outside Shopify and points to HTTPS on Hostinger.
- Record a passive response/header check for apex and `www`; do not change DNS merely because the legacy `myshopify.com` host remains reachable.

## Phase E — owner-attended store deactivation

### Pre-click confirmation

Read this aloud or show it to the owner immediately before the final action:

> We have verified the encrypted exports, open obligations, domains, external billing, apps, and credential revocation. The active YZA site is served by Hostinger. We are about to cancel the Shopify plan and deactivate `yza-shop-2950.myshopify.com`. This ends normal admin access at the end of the applicable billing cycle and may trigger pending charges. Continue?

Only an explicit “continue” at this moment authorizes the click.

### Shopify admin path

The current Shopify help sequence is:

1. Owner signs in and completes 2FA.
2. Go to **Settings → Plan**.
3. Choose **Cancel plan** (or the trial equivalent).
4. Review downgrade/pause options, domains, and pending charges.
5. Choose **Cancel my plan and uninstall all apps**, then continue.
6. Select a reason and optional comment.
7. Review whether payment details should be retained; the full-erasure plan normally does not need convenience retention.
8. Re-enter the owner password and perform the final cancellation.
9. Save Shopify’s deactivation confirmation email and final status screen into the encrypted evidence archive.

If Shopify Plus, an organization-level restriction, a pending bill, or an ownership/2FA issue changes the flow, stop and use Shopify Support. Do not improvise around account controls.

## Phase F — separate customer and merchant erasure requests

### Customer personal data for the deactivated store

Shopify documents this as a separate support request:

- the store must already be deactivated;
- only the store owner can request it;
- it applies to the selected store, not other Shopify stores;
- Shopify states that processing is generally completed within 14 days, subject to legal exceptions;
- after completion, customer data is unrecoverable and the store cannot be reopened;
- a change of mind must reach Support before the stated 14-day window expires.

**Second hard stop:** show the owner the archive manifest and legal-retention decision, then obtain explicit confirmation immediately before Support receives the request.

Suggested support request, without customer data or secrets:

> I am the owner of the deactivated store `yza-shop-2950.myshopify.com`. Please erase the personal data of all customers from this deactivated store. I understand that this is separate from deactivation, is not recoverable after completion, and will prevent the store from being reopened. Please confirm the request identifier and completion status.

Save the case ID, request date, expected completion date, and completion notice in the encrypted archive.

### Merchant personal data

Shopify merchant erasure applies across associated Shopify shops/accounts, not only YZA. It can be requested only after **all** stores and accounts tied to the owner email are deactivated. Shopify says processing can take up to 30 days and may be limited by law.

**Third hard stop:** enumerate every associated store/account and obtain explicit owner confirmation before using [Shopify Privacy Controls](https://privacy.shopify.com/) → **Erase my data**.

Do not request merchant erasure while another legitimate Shopify store remains in use.

## Phase G — remote verification before local deletion

All rows must be satisfied:

| Remote verification | Pass criterion | Evidence |
|---|---|---|
| Deactivation | Confirmation email/status saved; no active plan shown | Pending |
| Legacy storefront | `yza-shop-2950.myshopify.com` no longer offers active checkout/storefront behavior expected from the old shop | Pending |
| Apps and webhooks | Inventory shows no active Shopify mutation credentials or direct vendor billing | Pending |
| Customer erasure | Shopify Support completion notice received | Pending |
| Merchant erasure | Completion notice received, or documented as intentionally not requested because another account/store exists | Pending |
| Domains | Apex and `www` still serve Hostinger over valid HTTPS | Pending |
| Hostinger flows | Passive pages and approved staging tests remain independent of Shopify | Pending |
| Archive | Two encrypted, hash-matching copies; owner can decrypt a representative file | Pending |

Customer-erasure completion is irreversible. If it has completed, “rollback” means using the lawful encrypted business export for permitted records; it cannot reactivate the Shopify store.

## Phase H — local Shopify artifact removal

Only after Phase G is signed:

1. Compare the Shopify mirror’s asset hashes against the Hostinger production snapshot and active redesign worktree.
2. Move any genuinely unique, lawful, still-needed YZA-owned asset into the private archive with provenance and licensing notes. Do not move customer data into the public project.
3. Confirm the following are obsolete and contain no unique Hostinger runtime dependency:
   - `<LEGACY_SHOPIFY_APP_DIR>` (legacy Shopify app, including its credential-bearing `.env`);
   - `<LEGACY_SHOPIFY_MIRROR_DIR>` (legacy Shopify capture).
   Resolve both placeholders in an owner-only local checklist after the remote closure evidence is complete. Do not commit personal absolute paths.
4. Obtain a final deletion confirmation naming both exact absolute paths.
5. Delete only those literal paths—never a parent `YZA`, `Documents`, `OneDrive`, or computed wildcard path.
6. Let OneDrive finish synchronizing the deletion, then inspect OneDrive Recycle Bin and Windows Recycle Bin.
7. Before permanently emptying either bin, obtain a separate confirmation because this removes the final local recovery copy.
8. Search filenames and text for Shopify-specific environment keys, API credentials, store domain, theme files, and transfer copies. Do not print found secret values; report path and credential type only.
9. Verify revocation at the provider. A clean search does not replace credential rotation.

### Must remain

- Hostinger production snapshot and approved safety archives.
- Active Hostinger HTML/CSS/JS/PHP project.
- Hostinger `/wp` WooCommerce recorder and its data/configuration.
- `.htaccess` redirects from legacy Shopify URLs to the correct Hostinger routes.
- Legally required encrypted business records for their approved retention period.

## Completion record

The decommission is complete only when this final record is filled:

- Store deactivated at: `__________`
- Deactivation confirmation archived at: `__________`
- Customer erasure case/completion: `__________`
- Merchant erasure status: `__________`
- Final billing/payout review by: `__________`
- App/vendor billing review by: `__________`
- Credential revocation review by: `__________`
- Apex/`www` Hostinger verification at: `__________`
- Local deletion approval at: `__________`
- Recycle-bin permanent deletion approval at: `__________`
- Encrypted archive retention/destruction owner: `__________`

No blank in the applicable fields may be interpreted as implicit approval.
