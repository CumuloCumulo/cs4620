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

test("renders all 83 transformation pages and preserves every animation frame and semantic vector rule", async () => {
  const response = await render("/part/3/transforms");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /怎样用同一套矩阵机制可靠地移动几何、组合操作、改变坐标系/);
  assert.match(html, /83(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：一个点、一条切线、一条法线和一个局部框架/);
  assert.match(html, /参数式前向套 T，隐式查询先套 T⁻¹/);
  assert.match(html, /三维平移动画第 4 帧/);
  assert.match(html, /最终画面共有四个立方体/);
  assert.match(html, /欧拉角第 2 个物理页：与第 44 页像素级完全相同/);
  assert.match(html, /两页渲染文件哈希一致/);
  assert.match(html, /旋转与平移对照第 3 帧/);
  assert.match(html, /沿任意轴缩放第 6 帧/);
  assert.match(html, /唯一视觉变化是右侧椭圆的法线方向/);
  assert.match(html, /错误 Mn=.*点积=3/);
  assert.match(html, /正确 \(M⁻¹\)ᵀn=.*点积=0/);
  assert.match(html, /T_canonical = F T_frame F⁻¹/);
  assert.match(html, /阶段检查 (?:<!-- -->)?7/);
  assert.match(html, /lecture-slides\/08transforms\/page-001\.webp/);
  assert.match(html, /lecture-slides\/08transforms\/page-083\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/08transforms\/page-\d{3}\.webp/g)).size, 83);
});

test("renders all 33 viewing pages and explains the complete camera-to-screen chain page by page", async () => {
  const response = await render("/part/3/viewing");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /怎样把一个物体局部坐标中的三维点/);
  assert.match(html, /33(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：把世界点投到 800×600 屏幕/);
  assert.match(html, /无文字铁路照片：用真实消失点证明仿射投影不够/);
  assert.match(html, /页内只有摄影署名 Ray Verrier/);
  assert.match(html, /正文与第 5 页像素级相同/);
  assert.match(html, /正文内容区域像素差为 0/);
  assert.match(html, /z'\(z\)=\(a z\+b\)\/\(-z\)/);
  assert.match(html, /near→\+1、far→-1/);
  assert.match(html, /x_ndc=0\.2, y_ndc=0\.2\/0\.75≈0\.2667/);
  assert.match(html, /p_ndc = p_clip\.xyz \/ p_clip\.w/);
  assert.match(html, /阶段检查 (?:<!-- -->)?5/);
  assert.match(html, /lecture-slides\/09viewing\/page-001\.webp/);
  assert.match(html, /lecture-slides\/09viewing\/page-033\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/09viewing\/page-\d{3}\.webp/g)).size, 33);
});

test("renders all 50 rasterization pages and preserves coverage, interpolation, and clipping transitions", async () => {
  const response = await render("/part/4/rasterization");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /怎样把已经投影到屏幕的点、线和三角形/);
  assert.match(html, /50(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：一个带颜色与 UV 的屏幕三角形/);
  assert.match(html, /中心线膨胀成垂直于线的有限宽带/);
  assert.match(html, /紫色带的端盖变成竖直/);
  assert.match(html, /正文与第 28 页完全相同/);
  assert.match(html, /第 28、31、36 页内容区域哈希相同/);
  assert.match(html, /页面明确写 &gt;0，而非 ≥0/);
  assert.match(html, /top-left 半开规则/);
  assert.match(html, /三维中点的投影不是屏幕端点中点/);
  assert.match(html, /u_correct=.*2\/7≈0\.2857/);
  assert.match(html, /-w≤x≤w、-w≤y≤w、-w≤z≤w/);
  assert.match(html, /阶段检查 (?:<!-- -->)?7/);
  assert.match(html, /lecture-slides\/10rasterization\/page-001\.webp/);
  assert.match(html, /lecture-slides\/10rasterization\/page-050\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/10rasterization\/page-\d{3}\.webp/g)).size, 50);
});

test("renders all 38 pipeline pages and preserves culling, visibility, and shading-frequency transitions", async () => {
  const response = await render("/part/4/pipeline");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /同一套图形管线怎样通过改变阶段之间传递的数据/);
  assert.match(html, /38(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：两个重叠三角形与一组曲面法线/);
  assert.match(html, /背面剔除第 1 帧/);
  assert.match(html, /动画第 4 帧：用 n 与 v 的夹角/);
  assert.match(html, /画家动画第 6 帧/);
  assert.match(html, /遮挡图：画家排序其实是一次拓扑排序/);
  assert.match(html, /A then B: A 写 0\.30/);
  assert.match(html, /法线变换第 2 帧/);
  assert.match(html, /n' = normalize\(\(M⁻¹\)ᵀ n\)/);
  assert.match(html, /Gouraud 与 per-fragment/);
  assert.match(html, /minimal: attribute=position/);
  assert.match(html, /阶段检查 (?:<!-- -->)?4/);
  assert.match(html, /lecture-slides\/11pipeline\/page-001\.webp/);
  assert.match(html, /lecture-slides\/11pipeline\/page-038\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/11pipeline\/page-\d{3}\.webp/g)).size, 38);
});

test("renders all 14 OpenGL and GLSL pages with the complete host-to-GPU data path", async () => {
  const response = await render("/part/4/opengl-glsl");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /怎样把上一讲的图形管线真正写成一组 CPU 指令和 GPU 着色器/);
  assert.match(html, /14(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：一组三色三角形如何穿过 WebGL 1/);
  assert.match(html, /页脚 Lecture 11 是讲义复用遗留/);
  assert.match(html, /rendered with DirectX/);
  assert.match(html, /固定功能与可编程/);
  assert.match(html, /source → compile shader objects/);
  assert.match(html, /3 个顶点 → vertex shader 运行 3 次/);
  assert.match(html, /WebGL 1 的规范着色语言是 GLSL ES 1\.00/);
  assert.match(html, /BufferGeometry attribute → GPU vertex buffer/);
  assert.match(html, /阶段检查 (?:<!-- -->)?4/);
  assert.match(html, /lecture-slides\/12opengl\/page-001\.webp/);
  assert.match(html, /lecture-slides\/12opengl\/page-014\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/12opengl\/page-\d{3}\.webp/g)).size, 14);
});

test("renders all 33 advanced texture pages from environment lookup through solid textures", async () => {
  const response = await render("/part/5/texture-techniques");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /当纹理不再只是表面颜色时/);
  assert.match(html, /33(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：一块带波纹高度的平面与同一张环境立方体贴图/);
  assert.match(html, /左右两端都是 due East/);
  assert.match(html, /diffuse、glossy、mirror/);
  assert.match(html, /最大绝对分量决定/);
  assert.match(html, /生产案例第 2 帧/);
  assert.match(html, /课件末行把 n̂ 写成 t̂u×t̂v/);
  assert.match(html, /pᵈ=p\+h n̂/);
  assert.match(html, /只有右侧边缘凹凸/);
  assert.match(html, /n_world=normalize/);
  assert.match(html, /阶段检查 (?:<!-- -->)?5/);
  assert.match(html, /lecture-slides\/13textures\/page-001\.webp/);
  assert.match(html, /lecture-slides\/13textures\/page-033\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/13textures\/page-\d{3}\.webp/g)).size, 33);
});

test("renders all 63 image and display pages from continuous images through tone mapping", async () => {
  const response = await render("/part/5/images-displays");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /一组像素数字怎样穿过采集、存储、量化、传递函数与色调映射/);
  assert.match(html, /63(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：把线性 18% 灰送到 8 位 sRGB 屏幕/);
  assert.match(html, /加色显示第 4 帧/);
  assert.match(html, /量化序列第 8 帧/);
  assert.match(html, /有序抖动第 2 帧/);
  assert.match(html, /误差扩散第 2 帧/);
  assert.match(html, /投影仪实验第 3 帧/);
  assert.match(html, /原讲义笔误/);
  assert.match(html, /0\.46136/);
  assert.match(html, /0\.18116/);
  assert.match(html, /曝光序列第 3 帧/);
  assert.match(html, /Ward、Fattal 与 LCIS/);
  assert.match(html, /阶段检查 (?:<!-- -->)?6/);
  assert.match(html, /lecture-slides\/14images\/page-001\.webp/);
  assert.match(html, /lecture-slides\/14images\/page-063\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/14images\/page-\d{3}\.webp/g)).size, 63);
});

test("renders all 116 spline pages from parameter curves through swept surfaces", async () => {
  const response = await render("/part/6/spline-curves");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /怎样用少量、直观而局部的控制量/);
  assert.match(html, /116(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：四点拱形/);
  assert.match(html, /参数运动第 5 帧/);
  assert.match(html, /Hermite 到 Bézier 第 1 帧/);
  assert.match(html, /de Casteljau 递推还自动完成细分/);
  assert.match(html, /C2 再匹配二阶导数/);
  assert.match(html, /共线还不够 C1/);
  assert.match(html, /向心参数化通常更稳健/);
  assert.match(html, /Cox–de Boor/);
  assert.match(html, /Frenet 标架可由切向、法向、副法向构造/);
  assert.match(html, /阶段检查 (?:<!-- -->)?7/);
  assert.match(html, /lecture-slides\/15spline-curves\/page-001\.webp/);
  assert.match(html, /lecture-slides\/15spline-curves\/page-116\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/15spline-curves\/page-\d{3}\.webp/g)).size, 116);
});

test("renders all 58 subdivision pages from corner cutting through production creases", async () => {
  const response = await render("/part/7/subdivision");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /怎样只重复局部加权规则/);
  assert.match(html, /58(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：一条开放折线与一个三角控制多面体/);
  assert.match(html, /角切割动画第 5 帧/);
  assert.match(html, /第 14 帧：完整一轮 refined polygon/);
  assert.match(html, /第 13 帧：直接显示极限曲面/);
  assert.match(html, /非凡顶点/);
  assert.match(html, /半锐折痕/);
  assert.match(html, /Geri’s Game/);
  assert.match(html, /阶段检查 (?:<!-- -->)?5/);
  assert.match(html, /lecture-slides\/16subdivision\/page-001\.webp/);
  assert.match(html, /lecture-slides\/16subdivision\/page-058\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/16subdivision\/page-\d{3}\.webp/g)).size, 58);
});

test("renders all 23 scene graph pages from flat lists through DAG traversal", async () => {
  const response = await render("/part/7/scene-graphs");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /怎样让场景的数据结构直接表达/);
  assert.match(html, /23(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：房屋、门组与共享窗户/);
  assert.match(html, /移动门要改 8 个变换/);
  assert.match(html, /一次修改 DoorGroup/);
  assert.match(html, /改一个实例位置/);
  assert.match(html, /改共享叶节点/);
  assert.match(html, /M_world\(child\)=M_world\(parent\)M_local\(child\)/);
  assert.match(html, /L' = W_\{newParent\}\^\{-1\} W_\{oldNode\}/);
  assert.match(html, /阶段检查 (?:<!-- -->)?3/);
  assert.match(html, /lecture-slides\/17scene-graph\/page-001\.webp/);
  assert.match(html, /lecture-slides\/17scene-graph\/page-023\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/17scene-graph\/page-\d{3}\.webp/g)).size, 23);
});

test("renders all 69 animation pages from timing through motion capture", async () => {
  const response = await render("/part/8/animation");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /怎样把动画师的意图变成随时间变化的少量参数/);
  assert.match(html, /69(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：让 Luxo 台灯看见球、蓄力并跳过去/);
  assert.match(html, /Timing 重复物理页/);
  assert.match(html, /矩阵线性插值的失败/);
  assert.match(html, /SLERP 推导第 3 帧/);
  assert.match(html, /q=\(cos\(θ\/2\), â sin\(θ\/2\)\)/);
  assert.match(html, /W_jB_j⁻¹/);
  assert.match(html, /识别→标定→逐帧 IK/);
  assert.match(html, /阶段检查 (?:<!-- -->)?6/);
  assert.match(html, /lecture-slides\/18animation\/page-001\.webp/);
  assert.match(html, /lecture-slides\/18animation\/page-069\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/18animation\/page-\d{3}\.webp/g)).size, 69);
});

test("renders all 37 surface reflection pages from BRDF through the rendering equation", async () => {
  const response = await render("/part/9/surface-reflection");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /一束光到达真实表面后/);
  assert.match(html, /37(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：一颗粗糙度可调的玻璃珠/);
  assert.match(html, /互易性：交换光源与相机/);
  assert.match(html, /精确 Fresnel：先算两种偏振振幅/);
  assert.match(html, /一杯水为什么出现许多边界影像/);
  assert.match(html, /单位检查：irradiance、radiance、BRDF/);
  assert.match(html, /BRDF 与 BSDF/);
  assert.match(html, /F：每个可见微面反射多少/);
  assert.match(html, /D：有多少微面正好朝向 h/);
  assert.match(html, /G：合适朝向的微面也可能被邻居挡住/);
  assert.match(html, /Beckmann 分布/);
  assert.match(html, /有限小光源：先写成带立体角的求和/);
  assert.match(html, /取极限：渲染方程的表面反射积分/);
  assert.match(html, /阶段检查 (?:<!-- -->)?5/);
  assert.match(html, /lecture-slides\/19surface-reflection\/page-001\.webp/);
  assert.match(html, /lecture-slides\/19surface-reflection\/page-037\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/19surface-reflection\/page-\d{3}\.webp/g)).size, 37);
});

test("renders all 17 Monte Carlo illumination pages from solid angle through importance sampling", async () => {
  const response = await render("/part/9/monte-carlo");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /渲染方程无法直接解析积分时/);
  assert.match(html, /17(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：估计一块 Lambert 表面接收的环境光/);
  assert.match(html, /角度与立体角/);
  assert.match(html, /单点概率为零/);
  assert.match(html, /标准差是 σ\/√N/);
  assert.match(html, /任何覆盖被积函数支持集的 PDF/);
  assert.match(html, /半球均匀采样：PDF=1(?:<!-- -->)?\/\(2π\)/);
  assert.match(html, /余弦比例采样/);
  assert.match(html, /BRDF 比例采样/);
  assert.match(html, /multiple importance sampling/);
  assert.match(html, /阶段检查 (?:<!-- -->)?4/);
  assert.match(html, /lecture-slides\/20monte-carlo\/page-001\.webp/);
  assert.match(html, /lecture-slides\/20monte-carlo\/page-017\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/20monte-carlo\/page-\d{3}\.webp/g)).size, 17);
});

test("renders all 34 advanced ray tracing pages from one-sample artifacts through distributed rays", async () => {
  const response = await render("/part/10/advanced-ray-tracing");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /为什么基础光线追踪总显得过分锐利/);
  assert.match(html, /34(?:<!-- -->)? 个物理页/);
  assert.match(html, /贯穿例子：一本书、矩形灯与薄透镜相机/);
  assert.match(html, /标题页编号有误/);
  assert.match(html, /五种不连续/);
  assert.match(html, /面积光为何出现部分可见的半影/);
  assert.match(html, /有限孔径：只在焦平面相交/);
  assert.match(html, /均匀采样面积光/);
  assert.match(html, /p_ω\(ω\)=p_A\(y\)/);
  assert.match(html, /BRDF 采样与环境采样/);
  assert.match(html, /课件第 30 页标签左右写反/);
  assert.match(html, /environment\.sample/);
  assert.match(html, /Ray\.time 必须贯穿/);
  assert.match(html, /阶段检查 (?:<!-- -->)?5/);
  assert.match(html, /lecture-slides\/21adv-rt\/page-001\.webp/);
  assert.match(html, /lecture-slides\/21adv-rt\/page-034\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/21adv-rt\/page-\d{3}\.webp/g)).size, 34);
});

test("renders all 60 ray-acceleration pages from local-space instances through spatial subdivision", async () => {
  const response = await render("/part/10/ray-acceleration");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /怎样在不改变任何命中结果的前提下/);
  assert.match(html, /60(?:<!-- -->)? 个物理页/);
  assert.match(html, /四个车轮实例与十个三角形/);
  assert.match(html, /inverse-transpose/);
  assert.match(html, /方向不要重新单位化/);
  assert.match(html, /构建帧 4/);
  assert.match(html, /遍历帧 10/);
  assert.match(html, /t_enter=max/);
  assert.match(html, /dx=-0/);
  assert.match(html, /surface area heuristic/);
  assert.match(html, /3D DDA/);
  assert.match(html, /k-d tree 动画 3/);
  assert.match(html, /阶段检查 (?:<!-- -->)?6/);
  assert.match(html, /lecture-slides\/22raytracing-accel\/page-001\.webp/);
  assert.match(html, /lecture-slides\/22raytracing-accel\/page-060\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/22raytracing-accel\/page-\d{3}\.webp/g)).size, 60);
});

test("renders all 52 antialiasing pages from pixel coverage through mipmapped texture filtering", async () => {
  const response = await render("/part/11/antialiasing");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /为什么增加像素或样本有时仍消不掉锯齿和摩尔纹/);
  assert.match(html, /52(?:<!-- -->)? 个物理页/);
  assert.match(html, /一条斜线、两个球和向远处延伸的网格纹理/);
  assert.match(html, /点采样动画 2/);
  assert.match(html, /加权超采样动画 2/);
  assert.match(html, /dx\+0\.5/);
  assert.match(html, /Supersampling 与 multisampling/);
  assert.match(html, /Jacobian/);
  assert.match(html, /相邻页新增左层四邻居/);
  assert.match(html, /4N\/3/);
  assert.match(html, /各向异性误差/);
  assert.match(html, /阶段检查 (?:<!-- -->)?5/);
  assert.match(html, /lecture-slides\/23antialiasing\/page-001\.webp/);
  assert.match(html, /lecture-slides\/23antialiasing\/page-052\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/23antialiasing\/page-\d{3}\.webp/g)).size, 52);
});

test("renders all 38 compositing pages from binary masks through Porter-Duff operators", async () => {
  const response = await render("/part/11/compositing");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /一个像素里同时有前景、背景和部分覆盖时/);
  assert.match(html, /38(?:<!-- -->)? 个物理页/);
  assert.match(html, /把带细发丝的人像放到建筑前/);
  assert.match(html, /t=0\.3/);
  assert.match(html, /二值遮罩动画 3/);
  assert.match(html, /c′=αc/);
  assert.match(html, /α_E=1-/);
  assert.match(html, /结合律证明动画 5/);
  assert.match(html, /independent coverage assumption/);
  assert.match(html, /positive correlation/);
  assert.match(html, /1×2×3×2=12 reasonable choices/);
  assert.match(html, /阶段检查 (?:<!-- -->)?5/);
  assert.match(html, /lecture-slides\/24compositing\/page-001\.webp/);
  assert.match(html, /lecture-slides\/24compositing\/page-038\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/24compositing\/page-\d{3}\.webp/g)).size, 38);
});

test("renders all 61 color-science pages from spectra through perceptual spaces", async () => {
  const response = await render("/part/12/color-science");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /光本来是波长上的连续能量分布/);
  assert.match(html, /61(?:<!-- -->)? 个物理页/);
  assert.match(html, /把一个苹果的测量光谱重现在 sRGB 显示器上/);
  assert.match(html, /X=∫n\(λ\)p\(λ\)dλ/);
  assert.match(html, /大脑动画 4/);
  assert.match(html, /异谱同色/);
  assert.match(html, /C=\(M_SMLM_RGB\)⁻¹M_SMLs/);
  assert.match(html, /s_reflected\(λ\)=e\(λ\)ρ\(λ\)/);
  assert.match(html, /XYZ 是所有标准色彩空间之间/);
  assert.match(html, /intentional blank gray field/);
  assert.match(html, /Lab 转换必须声明参考白/);
  assert.match(html, /阶段检查 (?:<!-- -->)?5/);
  assert.match(html, /lecture-slides\/25color\/page-001\.webp/);
  assert.match(html, /lecture-slides\/25color\/page-061\.webp/);
  assert.equal(new Set(html.match(/lecture-slides\/25color\/page-\d{3}\.webp/g)).size, 61);
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
