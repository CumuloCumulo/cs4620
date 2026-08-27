#!/usr/bin/env python3
"""Render the representative source pages referenced by the narrated tutorials."""

from __future__ import annotations

import re
import subprocess
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
        # The authoring helper stores the representative PDF page as argument four.
        pages = sorted({int(value) for value in re.findall(
            r'section\(\s*"[^"]+",\s*"[^"]+",\s*"[^"]+",\s*(\d+),', block
        )})
        result.append((match.group(1), pages))
    return result


def render(pdf: Path, page: int, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as temp:
        prefix = Path(temp) / "page"
        subprocess.run([
            "pdftoppm", "-f", str(page), "-l", str(page), "-singlefile", "-png",
            "-scale-to-x", "1600", "-scale-to-y", "-1", str(pdf), str(prefix),
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        with Image.open(prefix.with_suffix(".png")) as image:
            image.convert("RGB").save(destination, "WEBP", quality=84, method=6)


def main() -> None:
    source = SOURCE.read_text(encoding="utf-8")
    manifest = referenced_pages(source)
    total = 0
    for filename, pages in manifest:
        if not pages:
            raise RuntimeError(f"No representative pages found for {filename}")
        pdf = SLIDES / filename
        for page in pages:
            destination = OUTPUT / pdf.stem / f"page-{page:03d}.webp"
            render(pdf, page, destination)
            total += 1
        print(f"{filename}: {', '.join(map(str, pages))}", flush=True)
    print(f"Rendered {total} tutorial slide images", flush=True)


if __name__ == "__main__":
    main()
