#!/usr/bin/env python3
"""Extract the learning-relevant schedule, exams, and books from the course archive."""

import json
from pathlib import Path
from urllib.parse import urljoin

from lxml import etree, html

BASE = "https://www.cs.cornell.edu/courses/cs4620/2018fa/"
ASSIGNMENTS = {
    "#mesh": "/part/1/triangle-meshes-2/#chapter-assignment",
    "#ray1": "/part/2/interpolation/#chapter-assignment",
    "#manip": "/part/4/opengl-glsl/#chapter-assignment",
    "#shaders": "/part/5/images-displays/#chapter-assignment",
    "#splines": "/part/7/scene-graphs/#chapter-assignment",
    "#animation": "/part/8/animation/#chapter-assignment",
    "#ray2": "/part/11/compositing/#chapter-assignment",
}


def normalize(root):
    for node in root.xpath(".//script|.//iframe"):
        node.getparent().remove(node)
    for node in root.xpath(".//*[@href]"):
        value = node.get("href")
        if value in ASSIGNMENTS:
            node.set("href", "%%BASE_PATH%%" + ASSIGNMENTS[value])
        elif value.startswith("#"):
            continue
        else:
            node.set("href", urljoin(BASE, value))
            node.set("target", "_blank")
            node.set("rel", "noreferrer")
    for node in root.xpath(".//img[@src]"):
        value = node.get("src")
        if value in {"images/fcg4.jpg", "images/fo3dg.jpg"}:
            node.set("src", "%%BASE_PATH%%/cornell-assets/" + value)
        else:
            node.set("src", urljoin(BASE, value))
        node.set("loading", "lazy")
        node.set("alt", node.get("alt") or "Course book cover")
    return root


def serialize_children(root):
    return "".join(etree.tostring(child, encoding="unicode", method="html") for child in root)


def sibling_section(document, start_xpath, stop_tag="h2"):
    start = document.xpath(start_xpath)[0]
    wrapper = html.Element("div")
    current = start
    while current is not None:
        if current is not start and current.tag == stop_tag:
            break
        wrapper.append(html.fromstring(etree.tostring(current, encoding="unicode", method="html")))
        current = current.getnext()
    return wrapper


root = Path.cwd()
schedule = html.fragment_fromstring((root / "crawl/cornell_cs4620_2018fa/raw/schedule.html").read_text(), create_parent="div")
normalize(schedule)

course = html.fromstring((root / "crawl/cornell_cs4620_2018fa/raw/course_page.html").read_text())
old_exams = normalize(sibling_section(course, '//*[@id="oldexams"]'))
books = normalize(sibling_section(course, '//*[@id="books"]', stop_tag="script"))

payload = {
    "scheduleHtml": serialize_children(schedule),
    "oldExamsHtml": serialize_children(old_exams),
    "booksHtml": serialize_children(books),
    "sourceUrl": BASE,
}
destination = root / "app/generated/archive-content.ts"
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text("// Generated from the Cornell CS4620 2018FA archive.\nexport const archiveContent = " + json.dumps(payload, ensure_ascii=False) + " as const;\n")
print(json.dumps({"schedule_rows": len(schedule.xpath('.//tr')), "old_exam_links": len(old_exams.xpath('.//a')), "book_links": len(books.xpath('.//a'))}))
