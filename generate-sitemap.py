#!/usr/bin/env python3
"""Regenerate sitemap.xml after adding new gallery images."""

# Primary (Netlify) + mirror (GitHub Pages)
SITES = [
    "https://doraste-lines.netlify.app",
    "https://doraste-lines.github.io/doraste-lines",
]

lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
]

for idx, base in enumerate(SITES):
    priority = "1.0" if idx == 0 else "0.9"
    lines.extend([
        "  <url>",
        f"    <loc>{base}/</loc>",
        f"    <changefreq>weekly</changefreq>",
        f"    <priority>{priority}</priority>",
    ])
    for i in range(1, 95):
        lines.extend([
            "    <image:image>",
            f"      <image:loc>{base}/box{i}.jpg</image:loc>",
            f"      <image:title>Doraste_Lines Inspirational Quote Art {i}</image:title>",
            f"      <image:caption>Original quote art and visual poetry by Don Doraste Buntu (@doraste_lines)</image:caption>",
            "    </image:image>",
        ])
    lines.append("  </url>")

lines.extend(["</urlset>", ""])

with open("sitemap.xml", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print("Wrote sitemap.xml")
