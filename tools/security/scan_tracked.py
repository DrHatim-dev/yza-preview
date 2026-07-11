#!/usr/bin/env python3
"""Scan tracked and non-ignored candidate files for secrets before a push."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path


TEXT_SUFFIXES = {
    "", ".css", ".html", ".ini", ".js", ".json", ".md", ".php",
    ".py", ".svg", ".txt", ".webmanifest", ".xml", ".yaml", ".yml",
}
FORBIDDEN_NAMES = {
    ".env", ".env.local", "brevo-credentials.txt", "wp-config.php",
    "_transfer_readme.txt",
}
FORBIDDEN_PARTS = {".private", "node_modules", "vendor"}
PATTERNS = {
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"),
    "Brevo API key": re.compile(r"\bxkeysib-[A-Za-z0-9_-]{20,}\b"),
    "Shopify access token": re.compile(r"\b(?:shpat|shpca|shppa|shpss)_[A-Za-z0-9]{16,}\b"),
    "GitHub token": re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b"),
    "Google API key": re.compile(r"\bAIza[0-9A-Za-z_-]{30,}\b"),
    "AWS access key": re.compile(r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
    "credentialed network URL": re.compile(
        r"\b(?:ftps?|https?)://[A-Za-z0-9._~-]+:[A-Za-z0-9._~!$&'()*+,;=%-]{3,64}@[A-Za-z0-9.-]+",
        re.IGNORECASE,
    ),
    "literal secret assignment": re.compile(
        r"\b(?:api[_-]?key|api[_-]?secret|client[_-]?secret|password|private[_-]?token)\b"
        r"\s*[:=]\s*['\"][A-Za-z0-9_./+=-]{16,}['\"]",
        re.IGNORECASE,
    ),
}


def candidate_files(root: Path) -> list[Path]:
    result = subprocess.run(
        [
            "git", "-c", f"safe.directory={root.as_posix()}", "ls-files",
            "--cached", "--others", "--exclude-standard", "-z",
        ],
        cwd=root,
        check=True,
        capture_output=True,
    )
    return [root / value.decode("utf-8") for value in result.stdout.split(b"\0") if value]


def scan(root: Path) -> list[str]:
    findings: list[str] = []
    for path in candidate_files(root):
        rel = path.relative_to(root)
        lower_parts = {part.lower() for part in rel.parts}
        if path.name.lower() in FORBIDDEN_NAMES or lower_parts.intersection(FORBIDDEN_PARTS):
            findings.append(f"forbidden tracked path: {rel.as_posix()}")
            continue
        if path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        for label, pattern in PATTERNS.items():
            match = pattern.search(text)
            if match:
                line = text.count("\n", 0, match.start()) + 1
                findings.append(f"{label}: {rel.as_posix()}:{line}")
    return findings


def main() -> int:
    root = Path(__file__).resolve().parents[2]
    findings = scan(root)
    if findings:
        print("Tracked-source secret scan failed:", file=sys.stderr)
        for finding in findings:
            print(f"- {finding}", file=sys.stderr)
        return 1
    print(f"Tracked-source secret scan passed ({len(candidate_files(root))} candidate files).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
