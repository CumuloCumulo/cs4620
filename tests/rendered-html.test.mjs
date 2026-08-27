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
  assert.match(html, /课程内容/);
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
  assert.match(html, /lecture-slides\/02trimesh1\/page-005\.webp/);
  assert.match(html, /lecture-slides\/02trimesh1\/page-040\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/02trimesh1\/page-\d{3}\.webp/g)).size, 40);
  assert.doesNotMatch(html, /课件脉络|讲解补足/);
  assert.match(html, /对照完整原始课件/);
});
