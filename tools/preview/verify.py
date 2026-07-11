#!/usr/bin/env python3
"""Verify the generated YZA GitHub Pages preview artifact."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


REQUIRED_ROUTES = (
    "index.html",
    "collections/index.html",
    "collections/charms/index.html",
    "collections/sacs/index.html",
    "contact/index.html",
    "checkout/index.html",
    "histoire/index.html",
    "journal/index.html",
)
TRANSACTION_ENDPOINTS = ("contact.php", "subscribe.php", "cart-capture.php", "order.php")


def verify(root: Path, base: str) -> list[str]:
    errors: list[str] = []
    expected_base = "/" + base.strip("/") + "/"

    for route in REQUIRED_ROUTES:
        if not (root / route).is_file():
            errors.append(f"missing route: {route}")

    products = list((root / "produits").glob("*/index.html")) if (root / "produits").exists() else []
    if len(products) < 1:
        errors.append("no product clean routes were generated")

    forbidden = [
        path.relative_to(root).as_posix()
        for path in root.rglob("*")
        if path.is_file() and (path.suffix.lower() == ".php" or ".private" in path.parts or "wp" in path.parts)
    ]
    if forbidden:
        errors.append("forbidden server/private files: " + ", ".join(forbidden[:10]))

    html_files = sorted(root.rglob("*.html"))
    for path in html_files:
        text = path.read_text(encoding="utf-8")
        rel = path.relative_to(root).as_posix()
        if f'<base href="{expected_base}">' not in text:
            errors.append(f"wrong or missing preview base: {rel}")
        if "data-yza-preview-guard" not in text:
            errors.append(f"preview guard not injected: {rel}")
        if 'content="noindex,nofollow,noarchive"' not in text:
            errors.append(f"noindex missing: {rel}")

    guard_path = root / "preview-guard.js"
    if not guard_path.is_file():
        errors.append("preview-guard.js missing")
    else:
        guard = guard_path.read_text(encoding="utf-8")
        if "Preview — sending disabled" not in guard:
            errors.append("preview guard does not show the required disabled message")
        for endpoint in TRANSACTION_ENDPOINTS:
            if endpoint not in guard:
                errors.append(f"preview guard does not block {endpoint}")
        if "status: 503" not in guard:
            errors.append("preview guard does not fail requests with a non-success response")

    manifest_path = root / "preview-manifest.json"
    if not manifest_path.is_file():
        errors.append("preview manifest missing")
    else:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        if manifest.get("base") != expected_base:
            errors.append("preview manifest base mismatch")
        if manifest.get("fileCount") != len(manifest.get("files", {})):
            errors.append("preview manifest file count mismatch")

    # Root-relative quoted URLs would escape to the account-level Pages root.
    escaped = re.compile(
        r"(?:\b(?:href|src|poster|action)\s*=\s*['\"]|['\"`])"
        r"/(?!/|" + re.escape(expected_base.lstrip("/")) + r")(?=[A-Za-z0-9._-])",
        re.IGNORECASE,
    )
    for path in sorted(root.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in {".css", ".html", ".js", ".json", ".webmanifest"}:
            continue
        if path.name == "preview-guard.js":
            continue
        text = path.read_text(encoding="utf-8")
        match = escaped.search(text)
        if match:
            line = text.count("\n", 0, match.start()) + 1
            errors.append(f"root-relative URL escapes preview base: {path.relative_to(root).as_posix()}:{line}")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", type=Path)
    parser.add_argument("--base", default="/yza-preview/")
    args = parser.parse_args()
    errors = verify(args.root.resolve(), args.base)
    if errors:
        print("Preview verification failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"Preview verification passed for {args.root.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
