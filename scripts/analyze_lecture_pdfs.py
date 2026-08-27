#!/usr/bin/env python3
"""Extract every lecture slide's text and render compact visual contact sheets."""

from __future__ import annotations

import json
import re
import subprocess
import tempfile
from pathlib import Path

import pdfplumber
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
SLIDES = ROOT / "course_materials/cornell_cs4620_2018fa/raw/slides"
OUT = ROOT / "site/tmp/pdfs"
SHEETS = OUT / "contact_sheets"


def clean_text(value: str) -> str:
    lines = [re.sub(r"\s+", " ", line).strip() for line in value.splitlines()]
    return "\n".join(line for line in lines if line)


def likely_title(text: str) -> str | None:
    lines = [line for line in text.splitlines() if line]
    candidates = [line for line in lines if 3 <= len(line) <= 90]
    if not candidates:
        return None
    for line in candidates:
        low = line.lower()
        if not any(token in low for token in ("cornell", "cs 4620", "©", "lecture")):
            return line
    return candidates[0]


def render_sheet(pdf: Path, first: int, last: int, destination: Path) -> None:
    with tempfile.TemporaryDirectory() as temp:
        prefix = Path(temp) / "page"
        subprocess.run([
            "pdftoppm", "-f", str(first), "-l", str(last), "-jpeg",
            "-scale-to-x", "360", "-scale-to-y", "-1", "-r", "60",
            str(pdf), str(prefix),
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        images = [Image.open(path).convert("RGB") for path in sorted(Path(temp).glob("page-*.jpg"))]
        if not images:
            return
        cols = 3
        tile_w = 380
        tile_h = max(image.height for image in images) + 34
        rows = (len(images) + cols - 1) // cols
        canvas = Image.new("RGB", (cols * tile_w, rows * tile_h), "#20221f")
        draw = ImageDraw.Draw(canvas)
        for index, image in enumerate(images):
            x = (index % cols) * tile_w + 10
            y = (index // cols) * tile_h + 26
            canvas.paste(image, (x, y))
            draw.text((x, 7 + (index // cols) * tile_h), f"p. {first + index}", fill="white")
        destination.parent.mkdir(parents=True, exist_ok=True)
        canvas.save(destination, quality=82, optimize=True)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    analysis = []
    for pdf in sorted(SLIDES.glob("*.pdf")):
        with pdfplumber.open(pdf) as document:
            pages = []
            for page_number, page in enumerate(document.pages, start=1):
                text = clean_text(page.extract_text(x_tolerance=2, y_tolerance=3) or "")
                pages.append({
                    "page": page_number,
                    "text": text,
                    "title_candidate": likely_title(text),
                    "character_count": len(text),
                })
            record = {"file": pdf.name, "page_count": len(document.pages), "pages": pages}
            analysis.append(record)

        lecture_dir = SHEETS / pdf.stem
        for first in range(1, record["page_count"] + 1, 12):
            last = min(first + 11, record["page_count"])
            render_sheet(pdf, first, last, lecture_dir / f"pages-{first:03d}-{last:03d}.jpg")
        print(pdf.name, record["page_count"], flush=True)

    (OUT / "lecture_analysis.json").write_text(json.dumps(analysis, ensure_ascii=False, indent=2), encoding="utf-8")
    summary = [{
        "file": item["file"],
        "page_count": item["page_count"],
        "candidate_titles": [
            {"page": page["page"], "title": page["title_candidate"]}
            for page in item["pages"] if page["title_candidate"] and page["character_count"] < 360
        ],
    } for item in analysis]
    (OUT / "lecture_outline_candidates.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
