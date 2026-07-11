#!/usr/bin/env python3
"""Fail closed when a GitHub Pages artifact contains secret-shaped content."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


TEXT_SUFFIXES = {
    ".css", ".html", ".js", ".json", ".map", ".md", ".svg", ".txt", ".webmanifest", ".xml"
}
FORBIDDEN_NAMES = {
    ".env", ".env.local", "brevo-credentials.txt", "wp-config.php", "_transfer_readme.txt"
}
FORBIDDEN_PARTS = {".git", ".private", "wp", "node_modules", "vendor"}
PATTERNS = {
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"),
    "Brevo API key": re.compile(r"\bxkeysib-[A-Za-z0-9_-]{20,}\b"),
    "Shopify access token": re.compile(r"\b(?:shpat|shpca|shppa|shpss)_[A-Za-z0-9]{16,}\b"),
    "GitHub token": re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b"),
    "Google API key": re.compile(r"\bAIza[0-9A-Za-z_-]{30,}\b"),
    "AWS access key": re.compile(r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
    "credentialed FTP URL": re.compile(r"\bftps?://[^\s/:]+:[^\s/@]+@", re.IGNORECASE),
    "secret assignment": re.compile(
        r"\b(?:api[_-]?key|api[_-]?secret|client[_-]?secret|password|private[_-]?token)\b"
        r"\s*[:=]\s*['\"][A-Za-z0-9_./+=-]{16,}['\"]",
        re.IGNORECASE,
    ),
}


def scan(root: Path) -> list[str]:
    findings: list[str] = []
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(root)
        lower_parts = {part.lower() for part in rel.parts}
        if path.name.lower() in FORBIDDEN_NAMES or lower_parts.intersection(FORBIDDEN_PARTS):
            findings.append(f"forbidden path: {rel.as_posix()}")
            continue
        if path.suffix.lower() == ".php":
            findings.append(f"PHP must not be published: {rel.as_posix()}")
            continue
        if path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for label, pattern in PATTERNS.items():
            match = pattern.search(text)
            if match:
                line = text.count("\n", 0, match.start()) + 1
                findings.append(f"{label}: {rel.as_posix()}:{line}")
    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", type=Path)
    args = parser.parse_args()
    root = args.root.resolve()
    if not root.is_dir():
        print(f"Secret scan input is not a directory: {root}", file=sys.stderr)
        return 2
    findings = scan(root)
    if findings:
        print("Preview secret scan failed:", file=sys.stderr)
        for finding in findings:
            print(f"- {finding}", file=sys.stderr)
        return 1
    print(f"Secret scan passed for {root}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
