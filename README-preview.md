# YZA visual preview

The GitHub Pages build is a visual approval environment, not a functioning shop. It publishes the redesign from `codex/maison-marrakech-redesign` under the repository subpath and leaves the Hostinger source tree unchanged.

**Current status (11 July 2026):** the preview unit tests, deterministic local build, route/guard verification, and generated-artifact secret scan passed against the then-dirty worktree. That run is not tied to a release commit and does not assert that the branch has been pushed, that Pages has deployed, or that a public preview has passed browser/creative QA. Record the deployed URL and commit only in [`docs/staging-release-checklist.md`](docs/staging-release-checklist.md) after the workflow succeeds.

When the local gate/workflow succeeds, the generated preview:

- creates static aliases for clean collection, product, journal, and page routes;
- rewrites root-relative assets and navigation for `/yza-preview/`;
- excludes PHP, `/wp`, private data, ignored files, credentials, and deployment tooling;
- marks every page `noindex,nofollow,noarchive`;
- disables Plausible production analytics;
- blocks contact, newsletter, cart-capture, and order submissions with HTTP `503` semantics and the visible message **“Preview — sending disabled”**;
- runs a secret scan before GitHub accepts the deployment artifact.

Run the complete local gate from the repository root:

```powershell
python tools/security/scan_tracked.py
python tools/preview/test_preview.py
python tools/preview/build.py --base /yza-preview/ --output dist-preview
python tools/preview/verify.py dist-preview --base /yza-preview/
python tools/preview/secret_scan.py dist-preview
```

`tools/preview/secret_scan.py` is deliberately an **artifact** gate: it rejects PHP, `.git`, `/wp`, and other server/private shapes that legitimately exist in the source tree but must never enter Pages. `tools/security/scan_tracked.py` is the separate pre-push gate: it scans every tracked source file, including PHP, while forbidding private and credential paths. Do not run `secret_scan.py .` and interpret its expected server-file failures as a completed source scan.

Do not test real forms, PHP, email, WhatsApp order handoff, WooCommerce recording, or payments on GitHub Pages. Those belong on the isolated, password-protected Hostinger staging environment after visual approval.

See [docs/preview-deployment.md](docs/preview-deployment.md) for the deployment and approval procedure.
