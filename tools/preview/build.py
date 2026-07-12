#!/usr/bin/env python3
"""Build the YZA static GitHub Pages preview without mutating storefront sources.

The production site relies on Apache clean-route rewrites and PHP endpoints. GitHub
Pages offers neither, so this builder creates deterministic route aliases, rewrites
root-relative URLs for the repository subpath, and installs a browser-side preview
guard that makes every transactional endpoint fail visibly and safely.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path, PurePosixPath


REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT = REPO_ROOT / "dist-preview"

SAFE_DIRECTORIES = {"assets", "blogs", "css", "data", "js"}
SAFE_ROOT_NAMES = {
    ".nojekyll",
    "404.html",
    "b2b.html",
    "checkout.html",
    "collections.html",
    "contact.html",
    "faq.html",
    "favicon.ico",
    "favoris.html",
    "histoire.html",
    "index.html",
    "journal.html",
    "legal.html",
    "produit.html",
    "site.webmanifest",
    "studio.html",
    "yza-girls.html",
}
SAFE_SUFFIXES = {
    ".avif", ".css", ".gif", ".html", ".ico", ".jpeg", ".jpg", ".js",
    ".json", ".m4v", ".mp4", ".ogg", ".otf", ".png", ".svg", ".ttf",
    ".webm", ".webmanifest", ".webp", ".woff", ".woff2",
}

COLLECTION_SLUGS = (
    "charms",
    "sacs",
    "pret-a-porter",
    "bijoux",
    "boucles-d-oreilles",
    "colliers",
    "hauts",
    "jupes-pareo",
    "pantalons",
    "bas",
)

SIMPLE_ROUTE_ALIASES = {
    "b2b.html": ("b2b", "grossistes"),
    "checkout.html": ("checkout",),
    "collections.html": ("collections",),
    "contact.html": ("contact",),
    "faq.html": ("faq",),
    "favoris.html": ("favoris",),
    "histoire.html": ("histoire",),
    "legal.html": ("legal", "mentions-legales"),
    "produit.html": ("produit",),
    "studio.html": ("studio",),
    "yza-girls.html": ("yza-girls",),
}

TEXT_SUFFIXES = {".css", ".html", ".js", ".json", ".svg", ".webmanifest"}


def normalized_base(raw: str) -> str:
    """Return a root-absolute GitHub Pages base with exactly one trailing slash."""
    base = "/" + raw.strip().strip("/") + "/"
    return "/" if base == "//" else base


def git_visible_files(repo_root: Path) -> list[Path]:
    """List tracked and non-ignored files, allowing safe uncommitted redesign work."""
    try:
        output = subprocess.check_output(
            ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
            cwd=repo_root,
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        raise RuntimeError("git ls-files failed; the preview must build from a Git worktree") from exc

    result: list[Path] = []
    for raw in output.decode("utf-8", errors="strict").split("\0"):
        if not raw:
            continue
        rel = Path(raw)
        if is_safe_public_source(rel):
            result.append(rel)
    return sorted(result, key=lambda p: p.as_posix())


def is_safe_public_source(rel: Path) -> bool:
    """Use a narrow allowlist; PHP, WordPress, private data and tooling never ship."""
    posix = PurePosixPath(rel.as_posix())
    if posix.is_absolute() or ".." in posix.parts:
        return False
    if len(posix.parts) == 1:
        return posix.name in SAFE_ROOT_NAMES
    if posix.parts[0] not in SAFE_DIRECTORIES:
        return False
    if posix.parts[0] == "data" and posix.name not in {
        "archive-blocklist-public.json",
        "media-ledger-public.json",
    }:
        return False
    return posix.suffix.lower() in SAFE_SUFFIXES


def rewrite_root_urls(text: str, base: str) -> str:
    """Rewrite root-relative URL strings without touching protocol-relative URLs."""
    # Most documents declare a production-root base. Replacing it makes all relative
    # assets work from both route aliases and the repository subpath.
    text = re.sub(
        r"<base\s+href=(['\"])[^'\"]*\1\s*/?>",
        f'<base href="{base}">',
        text,
        flags=re.IGNORECASE,
    )

    # Quoted strings cover HTML attributes, JS strings/templates, JSON and manifests.
    # Keep a bare JS '/' literal intact: routing code uses it as the normalized
    # production-root sentinel. Attribute rewriting below still converts href="/".
    quoted = re.compile(
        r"(?P<quote>['\"`])/(?!/)(?!"
        + re.escape(base.lstrip("/"))
        + r")(?!(?P=quote))"
    )
    text = quoted.sub(lambda match: f"{match.group('quote')}{base}", text)

    # Cover the uncommon unquoted HTML attribute and CSS url(/asset) forms.
    text = re.sub(
        r"(?P<prefix>\b(?:href|src|poster|action)\s*=\s*['\"]?)/(?!/)(?!" + re.escape(base.lstrip("/")) + r")",
        lambda match: match.group("prefix") + base,
        text,
        flags=re.IGNORECASE,
    )
    text = re.sub(
        r"(?P<prefix>url\(\s*)/(?!/)(?!" + re.escape(base.lstrip("/")) + r")",
        lambda match: match.group("prefix") + base,
        text,
        flags=re.IGNORECASE,
    )
    return text


def transform_text(text: str, suffix: str, base: str) -> str:
    transformed = rewrite_root_urls(text, base)
    if suffix in {".html", ".js"}:
        # Application routing expects production paths such as /collections/charms.
        # The guard exposes that normalized path while the browser retains the real
        # /repository/... URL needed for reloads on GitHub Pages.
        transformed = transformed.replace("location.pathname", "window.__YZA_PREVIEW_PATHNAME__")
    if suffix == ".html":
        transformed = inject_preview_head(transformed, base)
    return transformed


def inject_preview_head(html: str, base: str) -> str:
    """Install noindex policy and the guard before any storefront JavaScript."""
    html = re.sub(
        r"\s*<meta\s+name=['\"]robots['\"][^>]*>",
        "",
        html,
        flags=re.IGNORECASE,
    )
    injection = (
        '\n <meta name="robots" content="noindex,nofollow,noarchive">'
        f'\n <meta name="yza-preview-base" content="{base}">'
        f'\n <script src="{base}preview-guard.js" data-yza-preview-guard></script>\n'
    )
    if re.search(r"</head\s*>", html, flags=re.IGNORECASE):
        return re.sub(r"</head\s*>", injection + "</head>", html, count=1, flags=re.IGNORECASE)
    raise ValueError("HTML document has no closing </head> tag")


def copy_source_file(source: Path, destination: Path, base: str) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if source.suffix.lower() in TEXT_SUFFIXES:
        text = source.read_text(encoding="utf-8")
        destination.write_text(transform_text(text, source.suffix.lower(), base), encoding="utf-8", newline="\n")
    else:
        shutil.copyfile(source, destination)


def extract_product_handles(products_js: Path) -> list[str]:
    source = products_js.read_text(encoding="utf-8")
    handles = set(
        re.findall(
            r"(?:['\"]handle['\"]|\bhandle)\s*:\s*['\"]([A-Za-z0-9-]+)['\"]",
            source,
        )
    )
    if not handles:
        raise RuntimeError("No product handles found; refusing to publish broken product routes")
    return sorted(handles)


def copy_alias(template: Path, route: str, output: Path) -> None:
    destination = output / Path(*PurePosixPath(route.strip("/")).parts) / "index.html"
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(template, destination)


def write_manifest(output: Path, base: str) -> None:
    files: dict[str, str] = {}
    for path in sorted(output.rglob("*"), key=lambda p: p.relative_to(output).as_posix()):
        if path.is_file() and path.name != "preview-manifest.json":
            rel = path.relative_to(output).as_posix()
            files[rel] = hashlib.sha256(path.read_bytes()).hexdigest()
    manifest = {
        "schema": 1,
        "base": base,
        "fileCount": len(files),
        "files": files,
    }
    (output / "preview-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
        newline="\n",
    )


def build(repo_root: Path, output: Path, base: str) -> None:
    repo_root = repo_root.resolve()
    output = output.resolve()
    if output == repo_root or repo_root not in output.parents:
        raise RuntimeError("Preview output must be a dedicated directory inside the repository")
    if output.exists():
        shutil.rmtree(output)
    output.mkdir(parents=True)

    for rel in git_visible_files(repo_root):
        copy_source_file(repo_root / rel, output / rel, base)

    guard_source = repo_root / "tools" / "preview" / "preview-guard.js"
    shutil.copyfile(guard_source, output / "preview-guard.js")
    (output / ".nojekyll").write_bytes(b"")
    (output / "robots.txt").write_text(
        "User-agent: *\nDisallow: /\n",
        encoding="utf-8",
        newline="\n",
    )

    # Apache clean-route equivalents for GitHub Pages.
    for source_name, routes in SIMPLE_ROUTE_ALIASES.items():
        template = output / source_name
        for route in routes:
            copy_alias(template, route, output)

    collection_template = output / "collections.html"
    for slug in COLLECTION_SLUGS:
        copy_alias(collection_template, f"collections/{slug}", output)

    product_template = output / "produit.html"
    for handle in extract_product_handles(repo_root / "js" / "products.js"):
        copy_alias(product_template, f"produits/{handle}", output)

    journal_template = output / "blogs" / "journal" / "index.html"
    if journal_template.exists():
        copy_alias(journal_template, "journal", output)

    write_manifest(output, base)


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", default="/yza-preview/", help="GitHub Pages repository base path")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Build output directory")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    base = normalized_base(args.base)
    build(REPO_ROOT, args.output, base)
    manifest = json.loads((args.output / "preview-manifest.json").read_text(encoding="utf-8"))
    print(f"Built {manifest['fileCount']} preview files at {args.output} for {base}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
