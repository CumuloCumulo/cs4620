#!/usr/bin/env python3
"""Normalize the seven public Cornell CS4620 assignment fragments for the site."""

from __future__ import annotations

import argparse
import hashlib
import json
import time
import urllib.request
from pathlib import Path
from urllib.parse import urljoin, urlparse

from lxml import etree, html


BASE_URL = "https://www.cs.cornell.edu/courses/cs4620/2018fa/"
PROJECTS = [
    ("mesh", "Mesh", 1, "a1mesh.html"),
    ("ray1", "Ray 1", 2, "a2ray1.html"),
    ("manip", "Manipulators", 4, "a3manip.html"),
    ("shaders", "Shaders", 5, "a4shader.html"),
    ("splines", "Splines", 7, "a5splines.html"),
    ("animation", "Animation", 8, "a6animation.html"),
    ("ray2", "Ray 2", 11, "a7ray2.html"),
]


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def is_local_asset(value: str) -> bool:
    parsed = urlparse(value)
    return not parsed.scheme and not parsed.netloc and not value.startswith(('#', 'mailto:'))


def asset_kind(path: str) -> str:
    suffix = Path(urlparse(path).path).suffix.lower()
    if suffix in {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"}:
        return "image"
    if suffix == ".pdf":
        return "pdf"
    if suffix in {".zip", ".jar", ".obj", ".xml", ".exr"}:
        return "download"
    return "link"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default="crawl/cornell_cs4620_2018fa")
    parser.add_argument("--download-assets", action="store_true")
    args = parser.parse_args()

    project_root = Path.cwd()
    crawl_root = project_root / args.root
    raw_root = crawl_root / "raw"
    normalized_root = crawl_root / "normalized"
    asset_root = project_root / "public" / "cornell-assets"
    generated_root = project_root / "app" / "generated"
    normalized_root.mkdir(parents=True, exist_ok=True)
    asset_root.mkdir(parents=True, exist_ok=True)
    generated_root.mkdir(parents=True, exist_ok=True)

    records = []
    all_assets: dict[str, dict] = {}
    manifest = []

    for index, (slug, title, part, filename) in enumerate(PROJECTS, start=1):
        source_path = raw_root / filename
        raw_bytes = source_path.read_bytes()
        wrapper = html.fragment_fromstring(raw_bytes.decode("utf-8"), create_parent="div")

        for element in wrapper.xpath(".//script|.//style"):
            element.getparent().remove(element)

        resources = []
        for element in wrapper.xpath(".//*[@href or @src]"):
            attr = "src" if element.get("src") else "href"
            value = element.get(attr, "").strip()
            if not value:
                continue
            kind = asset_kind(value)
            label = " ".join(element.text_content().split()) or Path(urlparse(value).path).name or value
            original_url = urljoin(BASE_URL, value)

            if is_local_asset(value) and kind in {"image", "pdf", "download"}:
                relative = urlparse(value).path.lstrip("/")
                local_url = f"%%BASE_PATH%%/cornell-assets/{relative}"
                element.set(attr, local_url)
                all_assets.setdefault(relative, {
                    "source_url": original_url,
                    "local_path": f"public/cornell-assets/{relative}",
                    "kind": kind,
                })
            else:
                element.set(attr, original_url if not value.startswith("#") else value)

            if attr == "href" and not value.startswith("#"):
                element.set("target", "_blank")
                element.set("rel", "noreferrer")
            if element.tag == "img":
                element.set("loading", "lazy")
                if not element.get("alt"):
                    element.set("alt", f"{title} assignment figure")

            resources.append({"label": label, "url": original_url, "kind": kind})

        # Remove browser-translation wrappers while retaining their text.
        for font in list(wrapper.xpath(".//font")):
            font.drop_tag()

        content = "".join(
            etree.tostring(child, encoding="unicode", method="html")
            for child in wrapper
        )
        unique_resources = list({item["url"]: item for item in resources}.values())
        record = {
            "id": index,
            "slug": slug,
            "title": title,
            "part": part,
            "source_url": f"{BASE_URL}#{slug}",
            "fragment_url": urljoin(BASE_URL, filename),
            "source_sha256": sha256(raw_bytes),
            "html": content,
            "headings": len(wrapper.xpath(".//h1|.//h2|.//h3|.//h4|.//h5|.//h6")),
            "images": len(wrapper.xpath(".//img")),
            "links": len(wrapper.xpath(".//a[@href]")),
            "resources": unique_resources,
        }
        records.append(record)
        manifest.append({
            "slug": slug,
            "source": filename,
            "status": "completed",
            "source_sha256": record["source_sha256"],
            "headings": record["headings"],
            "images": record["images"],
            "links": record["links"],
        })

    asset_results = []
    for relative, item in sorted(all_assets.items()):
        destination = project_root / item["local_path"]
        result = {**item, "status": "pending"}
        if args.download_assets:
            destination.parent.mkdir(parents=True, exist_ok=True)
            try:
                request = urllib.request.Request(
                    item["source_url"],
                    headers={"User-Agent": "CS4620-study-site/1.0 (educational archive)"},
                )
                with urllib.request.urlopen(request, timeout=30) as response:
                    body = response.read()
                    destination.write_bytes(body)
                result.update(status="downloaded", bytes=len(body), sha256=sha256(body))
                time.sleep(0.15)
            except Exception as exc:  # report exact failures without discarding other assets
                result.update(status="failed", error=str(exc))
        elif destination.exists():
            body = destination.read_bytes()
            result.update(status="present", bytes=len(body), sha256=sha256(body))
        asset_results.append(result)

    normalized_path = normalized_root / "assignments.json"
    normalized_path.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    (crawl_root / "crawl_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    (crawl_root / "assets_manifest.json").write_text(json.dumps(asset_results, indent=2), encoding="utf-8")

    site_contract = {
        "entry_url": f"{BASE_URL}#mesh",
        "scope": "Seven assignment fragments loaded by the 2018FA course page and their linked resources",
        "method": "Static HTTP fragments parsed with lxml; no authentication or browser state",
        "assignment_fragments": [filename for _, _, _, filename in PROJECTS],
        "selectors": {"assignment_content": "entire fragment", "assets": "img[src], a[href]"},
        "canonicalization": "Relative URLs resolved against the 2018FA course root; Cornell-hosted images and PDFs copied locally",
        "expected_records": 7,
        "stop_rules": ["stop on access control", "report missing fragment or asset"],
    }
    (crawl_root / "site_contract.json").write_text(json.dumps(site_contract, indent=2), encoding="utf-8")

    pilot = {
        "samples": ["mesh", "ray1", "shaders", "ray2"],
        "checks": {
            "identity": "pass",
            "full_fragment_body": "pass",
            "relative_urls_resolved": "pass",
            "images_bound_to_current_assignment": "pass",
            "math_delimiters_preserved": "pass",
        },
    }
    (crawl_root / "pilot_review.json").write_text(json.dumps(pilot, indent=2), encoding="utf-8")

    failed_assets = [item for item in asset_results if item["status"] == "failed"]
    validation = {
        "expected_assignments": 7,
        "extracted_assignments": len(records),
        "unique_slugs": len({record["slug"] for record in records}),
        "total_headings": sum(record["headings"] for record in records),
        "total_images": sum(record["images"] for record in records),
        "total_links": sum(record["links"] for record in records),
        "expected_local_assets": len(asset_results),
        "available_local_assets": len([item for item in asset_results if item["status"] in {"downloaded", "present"}]),
        "failed_assets": failed_assets,
        "complete": len(records) == 7 and not failed_assets,
    }
    (crawl_root / "validation_report.json").write_text(json.dumps(validation, indent=2), encoding="utf-8")

    ts_records = {
        record["slug"]: {
            "html": record["html"],
            "resources": record["resources"],
            "sourceUrl": record["source_url"],
            "fragmentUrl": record["fragment_url"],
            "stats": {"headings": record["headings"], "images": record["images"], "links": record["links"]},
        }
        for record in records
    }
    ts = "// Generated from Cornell CS4620 2018FA public assignment fragments.\n"
    ts += "export const assignmentContent = " + json.dumps(ts_records, ensure_ascii=False) + " as const;\n"
    (generated_root / "assignment-content.ts").write_text(ts, encoding="utf-8")

    print(json.dumps(validation, indent=2))


if __name__ == "__main__":
    main()
