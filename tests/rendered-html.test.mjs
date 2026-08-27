import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html", host: "localhost" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the CS4620 course home", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /深入浅出/);
  assert.match(html, /计算机图形学/);
  assert.match(html, /教材版/);
  assert.match(html, /PDF 课件版/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("renders representative course detail routes with specific metadata", async () => {
  for (const [path, visible, title] of [
    ["/part/1", "三角网格", "Part 1"],
    ["/part/10/ray-acceleration", "光线追踪加速", "光线追踪加速"],
  ]) {
    const response = await render(path);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, new RegExp(visible));
    assert.match(html, new RegExp(`<title>[^<]*${title}`));
    assert.doesNotMatch(html, /property="og:image"[^>]*og\.png/);
  }
});

test("starter preview dependency and files are removed", async () => {
  const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(readFile(new URL("../app/_sites-preview/SkeletonPreview.tsx", templateRoot), "utf8"));
});

test("renders the PDF lectures as narrated tutorials", async () => {
  const response = await render("/part/1/triangle-meshes-1");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /怎样用有限个三角形近似连续曲面/);
  assert.match(html, /现在应当能够说清楚/);
  assert.match(html, /小练习/);
  assert.match(html, /教材衔接/);
  assert.match(html, /教材知识点/);
  assert.match(html, /索引网格把共享写进数据/);
  assert.match(html, /第 12 章 图形数据结构/);
  assert.match(html, /Fundamentals-Of-Computer-Graphics-5th-CN/);
  assert.match(html, /lecture-slides\/02trimesh1\/page-005\.webp/);
  assert.match(html, /lecture-slides\/02trimesh1\/page-040\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/02trimesh1\/page-\d{3}\.webp/g)).size, 40);
  assert.doesNotMatch(html, /课件脉络|讲解补足/);
  assert.match(html, /对照完整原始课件/);
});

test("indexes the textbook knowledge points in course search", async () => {
  const searchPage = await readFile(new URL("../app/search/page.tsx", import.meta.url), "utf8");
  const textbookData = await readFile(new URL("../app/textbook-data.ts", import.meta.url), "utf8");
  assert.match(searchPage, /item\.pdf\?\.split\("\/"\)\.pop\(\)/);
  assert.match(searchPage, /textbookCompanions\[pdfName\]/);
  assert.match(searchPage, /point\.title, point\.explanation, point\.chapter/);
  assert.match(textbookData, /索引网格把共享写进数据/);
  assert.match(textbookData, /透视正确插值要撤销投影除法/);
  assert.match(textbookData, /标准误差按平方根速度下降/);
});

test("renders the complete textbook track and all chapter cards", async () => {
  const response = await render("/book");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /沿着完整教材/);
  assert.match(html, /PBR：基于物理的渲染/);
  assert.match(html, /游戏中的计算机图形学/);
  assert.match(html, /马尔可夫链与 Metropolis 采样/);
  assert.equal(new Set(html.match(/href="\/book\/[0-9]+"/g)).size, 23);
});

test("renders original textbook prose, figures, math, lecture links and placed assignments", async () => {
  const chapter12 = await render("/book/12");
  assert.equal(chapter12.status, 200);
  const meshHtml = await chapter12.text();
  assert.match(meshHtml, /某些数据结构似乎在图形应用程序中反复出现/);
  assert.match(meshHtml, /12\.1 三角形网格/);
  assert.match(meshHtml, /textbook\/pic\/Pasted%20image%2020240321093633\.png/);
  assert.match(meshHtml, /Lecture 02 · 三角网格 I/);
  assert.match(meshHtml, /作业 PA[\s\S]*1[\s\S]*Mesh/);
  assert.match(meshHtml, /Cornell 原题/);

  const chapter15 = await render("/book/15");
  assert.equal(chapter15.status, 200);
  const curveHtml = await chapter15.text();
  assert.match(curveHtml, /15\.6\.4 NURBS/);
  assert.match(curveHtml, /class="katex/);
  assert.match(curveHtml, /作业 PA[\s\S]*5[\s\S]*Splines/);
});
