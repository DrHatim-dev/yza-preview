#!/usr/bin/env python3
"""Small deterministic unit tests for preview path rewriting and safety rules."""

from __future__ import annotations

import unittest
from pathlib import Path

import build


class PreviewBuildTests(unittest.TestCase):
    def test_base_normalization(self) -> None:
        self.assertEqual(build.normalized_base("yza-preview"), "/yza-preview/")
        self.assertEqual(build.normalized_base("/yza-preview/"), "/yza-preview/")

    def test_rewrites_root_urls_only(self) -> None:
        source = (
            '<base href="/">'
            '<a href="/">Home</a>'
            '<a href="/collections">Shop</a>'
            '<img src="//cdn.example/image.jpg">'
            '<a href="https://example.test/x">External</a>'
            "<script>fetch('/subscribe.php')</script>"
        )
        result = build.rewrite_root_urls(source, "/yza-preview/")
        self.assertIn('<base href="/yza-preview/">', result)
        self.assertIn('href="/yza-preview/"', result)
        self.assertIn('href="/yza-preview/collections"', result)
        self.assertIn("fetch('/yza-preview/subscribe.php')", result)
        self.assertIn('src="//cdn.example/image.jpg"', result)
        self.assertIn('href="https://example.test/x"', result)

    def test_preserves_bare_javascript_root_sentinel(self) -> None:
        source = "const path = normalized || '/'; if (path === '/') ok();"
        result = build.rewrite_root_urls(source, "/yza-preview/")
        self.assertEqual(result, source)

    def test_replaces_nested_document_base(self) -> None:
        source = '<html><head><base href="../../../"></head></html>'
        result = build.rewrite_root_urls(source, "/yza-preview/")
        self.assertIn('<base href="/yza-preview/">', result)
        self.assertNotIn('../../../', result)

    def test_safe_allowlist_rejects_server_and_private_files(self) -> None:
        self.assertFalse(build.is_safe_public_source(Path("contact.php")))
        self.assertFalse(build.is_safe_public_source(Path("wp/wp-config.php")))
        self.assertFalse(build.is_safe_public_source(Path(".private/cron-key.php")))
        self.assertFalse(build.is_safe_public_source(Path("data/customer-export.json")))
        self.assertTrue(build.is_safe_public_source(Path("data/media-ledger-public.json")))
        self.assertTrue(build.is_safe_public_source(Path("assets/brand/logo.webp")))

    def test_injection_is_noindex_and_early_guard(self) -> None:
        html = '<!doctype html><html><head><title>YZA</title></head><body></body></html>'
        result = build.inject_preview_head(html, "/yza-preview/")
        self.assertIn('noindex,nofollow,noarchive', result)
        self.assertIn('data-yza-preview-guard', result)
        self.assertLess(result.index('data-yza-preview-guard'), result.index('</head>'))


if __name__ == "__main__":
    unittest.main()
