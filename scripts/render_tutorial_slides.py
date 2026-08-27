#!/usr/bin/env python3
"""Render the representative source pages referenced by the narrated tutorials."""

from __future__ import annotations

import re
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image


SITE = Path(__file__).resolve().parents[1]
ROOT = SITE.parent
SOURCE = SITE / "app/tutorial-data.ts"
SLIDES = ROOT / "course_materials/cornell_cs4620_2018fa/raw/slides"
OUTPUT = SITE / "public/lecture-slides"


def referenced_pages(source: str) -> list[tuple[str, list[int]]]:
    starts = list(re.finditer(r'^\s{2}"([^"]+\.pdf)": \{', source, re.MULTILINE))
    result: list[tuple[str, list[int]]] = []
    for index, match in enumerate(starts):
        end = starts[index + 1].start() if index + 1 < len(starts) else len(source)
        block = source[match.start():end]
        count_match = re.search(r'pageCount:\s*(\d+)', block)
        if not count_match:
            raise RuntimeError(f"No page count found for {match.group(1)}")
        result.append((match.group(1), list(range(1, int(count_match.group(1)) + 1))))
    return result


def render_pdf(pdf: Path, pages: list[int]) -> int:
    destination_dir = OUTPUT / pdf.stem
    destination_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as temp:
        prefix = Path(temp) / "page"
        subprocess.run([
            "pdftoppm", "-jpeg", "-jpegopt", "quality=88,progressive=y,optimize=y",
            "-scale-to-x", "1400", "-scale-to-y", "-1", str(pdf), str(prefix),
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        rendered = sorted(Path(temp).glob("page-*.jpg"))
        if len(rendered) != len(pages):
            raise RuntimeError(f"Expected {len(pages)} pages for {pdf.name}, got {len(rendered)}")
        for page, source in zip(pages, rendered):
            destination = destination_dir / f"page-{page:03d}.webp"
            with Image.open(source) as image:
                image.convert("RGB").save(destination, "WEBP", quality=80, method=4)
    return len(pages)


def main() -> None:
    source = SOURCE.read_text(encoding="utf-8")
    manifest = referenced_pages(source)
    requested = set(sys.argv[1:])
    if requested:
        manifest = [item for item in manifest if item[0] in requested or Path(item[0]).stem in requested]
        found = {item[0] for item in manifest} | {Path(item[0]).stem for item in manifest}
        missing = requested - found
        if missing:
            raise RuntimeError(f"Unknown lecture names: {', '.join(sorted(missing))}")
    total = 0
    for filename, pages in manifest:
        if not pages:
            raise RuntimeError(f"No representative pages found for {filename}")
        pdf = SLIDES / filename
        total += render_pdf(pdf, pages)
        print(f"{filename}: {len(pages)} pages", flush=True)
    print(f"Rendered {total} tutorial slide images", flush=True)


if __name__ == "__main__":
    main()
