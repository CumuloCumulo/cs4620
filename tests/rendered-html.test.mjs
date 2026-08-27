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
  assert.match(html, /怎样把连续曲面变成有限、紧凑、可以查询并且方向一致的三角形数据/);
  assert.match(html, /40(?:<!-- -->)? 个物理页/);
  assert.match(html, /相邻页变化/);
  assert.match(html, /第 19 页新增的箭头/);
  assert.match(html, /第 37、38 页/);
  assert.match(html, /贯穿例子：由两个三角形组成的正方形/);
  assert.match(html, /教材接力/);
  assert.match(html, /12\.1\.2 索引网格的存储/);
  assert.match(html, /PAUSE &amp; DO/);
  assert.match(html, /阶段检查 (?:<!-- -->)?5/);
  assert.match(html, /lecture-slides\/02trimesh1\/page-001\.webp/);
  assert.match(html, /lecture-slides\/02trimesh1\/page-040\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/02trimesh1\/page-\d{3}\.webp/g)).size, 40);
  assert.match(html, /对照完整原始课件/);
});

test("renders all 39 Triangle meshes 2 pages and preserves animation deltas", async () => {
  const response = await render("/part/1/triangle-meshes-2");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /当索引网格只能告诉我们一个面的三个顶点时/);
  assert.match(html, /39(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：中心顶点周围的四面扇形/);
  assert.match(html, /第 21 页只在第 20 页底图上增加四条蓝色弯箭头/);
  assert.match(html, /新增一条红色竖向双端关系和两条绿色水平关系/);
  assert.match(html, /把动画冻结为 hl\/hr\/tl\/tr、h\/t、l\/r 字段/);
  assert.match(html, /pair\(i\) = i \^ 1/);
  assert.match(html, /阶段检查 (?:<!-- -->)?4/);
  assert.match(html, /lecture-slides\/03trimesh2\/page-001\.webp/);
  assert.match(html, /lecture-slides\/03trimesh2\/page-039\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/03trimesh2\/page-\d{3}\.webp/g)).size, 39);
});

test("renders all 38 ray-intersection pages with camera and intersection derivations", async () => {
  const response = await render("/part/2/ray-intersection");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /怎样从一个像素构造一条三维射线/);
  assert.match(html, /38(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：一条中央射线、一个近三角形和一个远球/);
  assert.match(html, /在第 7 页投影图上新增蓝色箭头/);
  assert.match(html, /新增从光源到命中点的 illumination 箭头/);
  assert.match(html, /在前两层基础上新增第三个半平面/);
  assert.match(html, /t=4 或 6/);
  assert.match(html, /triangle 返回 t=3/);
  assert.match(html, /u=\(i\+0\.5\)\/nx/);
  assert.match(html, /课件伪代码本身有两个值得主动检查的笔误/);
  assert.match(html, /阶段检查 (?:<!-- -->)?5/);
  assert.match(html, /lecture-slides\/04rt-intersect\/page-001\.webp/);
  assert.match(html, /lecture-slides\/04rt-intersect\/page-038\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/04rt-intersect\/page-\d{3}\.webp/g)).size, 38);
});

test("renders all 44 perspective pages and preserves four projection animations", async () => {
  const response = await render("/part/2/perspective");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /同一个三维场景为什么能呈现为工程图、广角照片或移轴建筑照/);
  assert.match(html, /44(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：同一相机基、两根等高线段、四种投影/);
  assert.match(html, /在第 7 页基础上新增更远的第二根 y 线段/);
  assert.match(html, /在第 22 页基础上新增深度更大的第二根 y 线段/);
  assert.match(html, /在第 33 页基础上新增更远的第二根同高线段/);
  assert.match(html, /在第 39 页基础上新增更远的同高线段/);
  assert.match(html, /y'=d·y\/Z/);
  assert.match(html, /焦距本身不改变固定 viewpoint 下的透视比例/);
  assert.match(html, /相机上仰时竖线汇聚/);
  assert.match(html, /阶段检查 (?:<!-- -->)?5/);
  assert.match(html, /lecture-slides\/05perspective\/page-001\.webp/);
  assert.match(html, /lecture-slides\/05perspective\/page-044\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/05perspective\/page-\d{3}\.webp/g)).size, 44);
});

test("renders all 58 ray-shading pages and preserves the staged lighting derivations", async () => {
  const response = await render("/part/2/ray-shading");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /光线已经找到可见点之后/);
  assert.match(html, /58(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：一个点、一盏灯、两个观察位置/);
  assert.match(html, /只新增一条从光源中心指向远处采样点的半径线/);
  assert.match(html, /第 26 页全部保留，并新增第二行/);
  assert.match(html, /新增 modified Blinn-Phong 名称/);
  assert.match(html, /第 50 页公式保留，只新增橙色 Facet distribution 标签/);
  assert.match(html, /新增青色 Fresnel Reflectance 标签/);
  assert.match(html, /蓝色 G 高亮/);
  assert.match(html, /空气到玻璃：F0=.*0\.04/);
  assert.match(html, /intersection record 是解决多返回值的核心结构/);
  assert.match(html, /阶段检查 (?:<!-- -->)?6/);
  assert.match(html, /lecture-slides\/06rt-shading\/page-001\.webp/);
  assert.match(html, /lecture-slides\/06rt-shading\/page-058\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/06rt-shading\/page-\d{3}\.webp/g)).size, 58);
});

test("renders all 9 interpolation pages including both physical frames of printed slide 5", async () => {
  const response = await render("/part/2/interpolation");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /射线命中三角形内部以后/);
  assert.match(html, /9(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：一个 3-4 直角三角形中的命中点/);
  assert.match(html, /第 5 个印刷页分成两个动画帧/);
  assert.match(html, /这是印刷页码 5 的第一物理帧/);
  assert.match(html, /第 5 个物理页的整条位置轴保留/);
  assert.match(html, /页脚仍印作 5/);
  assert.match(html, /uv\(p\)=.*\(1\/4,1\/3\)/);
  assert.match(html, /normalize\(m\).*\(0\.172,0\.306,0\.936\)/);
  assert.match(html, /光追权重来自三维命中位置/);
  assert.match(html, /几何法线维护真实表面朝向/);
  assert.match(html, /阶段检查 (?:<!-- -->)?3/);
  assert.match(html, /lecture-slides\/06\.5rt-interp\/page-001\.webp/);
  assert.match(html, /lecture-slides\/06\.5rt-interp\/page-009\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/06\.5rt-interp\/page-\d{3}\.webp/g)).size, 9);
});

test("renders all 31 texture-mapping pages and preserves map, space, and sampling transitions", async () => {
  const response = await render("/part/3/texture-basics");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /怎样把一张有限的二维图像变成三维表面上连续、可重复并可过滤的材质属性/);
  assert.match(html, /31(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：4×3 编号纹理铺到 4×3 米地板/);
  assert.match(html, /左下新增一张灰度木板图/);
  assert.match(html, /箭头反向/);
  assert.match(html, /三个空间/);
  assert.match(html, /14\.3/);
  assert.match(html, /安全 repeat 应使用/);
  assert.match(html, /双线性只解决放大时格点之间的重建/);
  assert.match(html, /不会在缩小时自动抗混叠/);
  assert.match(html, /阶段检查 (?:<!-- -->)?5/);
  assert.match(html, /lecture-slides\/07texture-basics\/page-001\.webp/);
  assert.match(html, /lecture-slides\/07texture-basics\/page-031\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/07texture-basics\/page-\d{3}\.webp/g)).size, 31);
});

test("indexes the textbook knowledge points in course search", async () => {
  const searchPage = await readFile(new URL("../app/search/page.tsx", import.meta.url), "utf8");
  const textbookData = await readFile(new URL("../app/textbook-data.ts", import.meta.url), "utf8");
  assert.match(searchPage, /item\.pdf\?\.split\("\/"\)\.pop\(\)/);
  assert.match(searchPage, /textbookCompanions\[pdfName\]/);
  assert.match(searchPage, /point\.title, point\.explanation, point\.chapter/);
  assert.match(searchPage, /slide\.change/);
  assert.match(searchPage, /slide\.textbook\?\.bridge/);
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
