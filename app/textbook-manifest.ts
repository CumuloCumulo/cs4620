export type TextbookChapter = {
  number: number;
  title: string;
  file: string;
  stage: string;
  color: string;
  description: string;
  assignmentId?: number;
  lectures: { title: string; href: string }[];
};

const colors = ["#f6df78", "#b8f6d6", "#f4b7d2", "#c8c2ff", "#ffc58f"];
const lecture = (title: string, part: number, slug: string) => ({ title, href: `/part/${part}/${slug}` });

export const textbookRepoUrl = "https://github.com/NWPU66/Fundamentals-Of-Computer-Graphics-5th-CN";

export const textbookChapters: TextbookChapter[] = [
  { number: 1, title: "介绍", file: "1 - 介绍.md", stage: "基础", color: colors[0], description: "图形学领域、应用、API、管线、数值问题与程序设计。", lectures: [lecture("Lecture 01 · 课程全景", 1, "introduction")] },
  { number: 2, title: "数学基础", file: "2 - 数学基础.md", stage: "基础", color: colors[1], description: "向量、几何、插值、积分、概率与蒙特卡洛方法。", lectures: [lecture("数学热身", 0, "math-bootcamp"), lecture("Lecture 06.5 · 插值", 2, "interpolation")] },
  { number: 3, title: "光栅图像", file: "3 - 光栅图像.md", stage: "基础", color: colors[2], description: "像素、显示强度、Gamma、RGB 与 Alpha 合成。", lectures: [lecture("Lecture 14 · 图像与显示", 5, "images-displays"), lecture("Lecture 24 · 图像合成", 11, "compositing")] },
  { number: 4, title: "光线追踪", file: "4 - 光线追踪.md", stage: "核心渲染", color: colors[3], description: "相机射线、几何求交、着色、阴影与镜面反射。", assignmentId: 2, lectures: [lecture("Lecture 04 · 射线与求交", 2, "ray-intersection"), lecture("Lecture 05 · 透视", 2, "perspective"), lecture("Lecture 06 · 基础着色", 2, "ray-shading")] },
  { number: 5, title: "表面着色", file: "5 - 表面着色.md", stage: "核心渲染", color: colors[4], description: "光源、Lambert 漫反射、镜面反射与环境光。", lectures: [lecture("Lecture 06 · 基础着色", 2, "ray-shading"), lecture("Lecture 19 · 表面反射", 9, "surface-reflection")] },
  { number: 6, title: "线性代数", file: "6 - 线性代数.md", stage: "空间与管线", color: colors[0], description: "矩阵、行列式、线性系统、特征值与奇异值分解。", lectures: [lecture("Lecture 08 · 几何变换", 3, "transforms")] },
  { number: 7, title: "变换矩阵", file: "7 - 变换矩阵.md", stage: "空间与管线", color: colors[1], description: "二维与三维变换、仿射变换、法线和坐标变换。", lectures: [lecture("Lecture 08 · 几何变换", 3, "transforms")] },
  { number: 8, title: "视图", file: "8 - 视图.md", stage: "空间与管线", color: colors[2], description: "相机、正交与透视投影、视口和视场。", lectures: [lecture("Lecture 05 · 透视", 2, "perspective"), lecture("Lecture 09 · 三维观察", 3, "viewing")] },
  { number: 9, title: "图形管线", file: "9 - 图形管线.md", stage: "空间与管线", color: colors[3], description: "光栅化、裁剪、插值、深度、着色与剔除。", assignmentId: 3, lectures: [lecture("Lecture 10 · 光栅化", 4, "rasterization"), lecture("Lecture 11 · 流水线", 4, "pipeline")] },
  { number: 10, title: "信号处理", file: "10 - 信号处理.md", stage: "采样与外观", color: colors[4], description: "采样、卷积、图像滤波、傅里叶变换与采样定理。", lectures: [lecture("Lecture 14 · 图像与显示", 5, "images-displays"), lecture("Lecture 23 · 抗锯齿", 11, "antialiasing")] },
  { number: 11, title: "纹理映射", file: "11 - 纹理映射.md", stage: "采样与外观", color: colors[0], description: "纹理坐标、过滤、Mipmapping 与纹理的多种应用。", lectures: [lecture("Lecture 07 · 纹理基础", 3, "texture-basics"), lecture("Lecture 13 · 纹理进阶", 5, "texture-techniques")] },
  { number: 12, title: "图形数据结构", file: "12 - 图形数据结构.md", stage: "采样与外观", color: colors[1], description: "三角网格、场景组织、包围体、空间划分与 BSP。", assignmentId: 1, lectures: [lecture("Lecture 02 · 三角网格 I", 1, "triangle-meshes-1"), lecture("Lecture 03 · 三角网格 II", 1, "triangle-meshes-2"), lecture("Lecture 17 · 场景图", 7, "scene-graphs"), lecture("Lecture 22 · 光追加速", 10, "ray-acceleration")] },
  { number: 13, title: "采样", file: "13 - 采样.md", stage: "采样与外观", color: colors[2], description: "连续概率、蒙特卡洛积分与随机点生成。", lectures: [lecture("Lecture 20 · Monte Carlo", 9, "monte-carlo"), lecture("Lecture 23 · 抗锯齿", 11, "antialiasing")] },
  { number: 14, title: "PBR：基于物理的渲染", file: "14 - PBR：基于物理的渲染.md", stage: "采样与外观", color: colors[3], description: "光子、介质、辐射度量、BRDF、渲染方程与路径追踪。", assignmentId: 7, lectures: [lecture("Lecture 19 · 表面反射", 9, "surface-reflection"), lecture("Lecture 20 · Monte Carlo", 9, "monte-carlo"), lecture("Lecture 21 · 高级光追", 10, "advanced-ray-tracing")] },
  { number: 15, title: "曲线", file: "15 - 曲线.md", stage: "建模与运动", color: colors[4], description: "参数曲线、连续性、多项式、Bézier、B-spline 与 NURBS。", assignmentId: 5, lectures: [lecture("Lecture 15 · 样条曲线", 6, "spline-curves"), lecture("Lecture 16 · 细分", 7, "subdivision")] },
  { number: 16, title: "计算机动画", file: "16 - 计算机动画.md", stage: "建模与运动", color: colors[0], description: "动画原则、关键帧、旋转插值、角色与物理动画。", assignmentId: 6, lectures: [lecture("Lecture 17 · 场景图", 7, "scene-graphs"), lecture("Lecture 18 · 动画", 8, "animation")] },
  { number: 17, title: "使用图形硬件", file: "17 - 使用图形硬件.md", stage: "建模与运动", color: colors[1], description: "GPU、OpenGL、缓冲、状态、着色器、网格与纹理对象。", assignmentId: 4, lectures: [lecture("Lecture 11 · 流水线", 4, "pipeline"), lecture("Lecture 12 · OpenGL 与 GLSL", 4, "opengl-glsl")] },
  { number: 18, title: "色彩", file: "18 - 色彩.md", stage: "建模与运动", color: colors[2], description: "色度学、标准观察者、色彩空间、适应与色彩外观。", lectures: [lecture("Lecture 25 · 颜色科学", 12, "color-science")] },
  { number: 19, title: "视觉感知", file: "19 - 视觉感知.md", stage: "拓展", color: colors[3], description: "视觉敏感度、空间线索、对象识别和图片感知。", lectures: [lecture("Lecture 25 · 颜色科学", 12, "color-science")] },
  { number: 20, title: "色调重构", file: "20 - 色调重构.md", stage: "拓展", color: colors[4], description: "动态范围、色彩与多类色调映射算法。", lectures: [lecture("Lecture 14 · 图像与显示", 5, "images-displays")] },
  { number: 21, title: "隐式建模", file: "21 - 隐式建模.md", stage: "拓展", color: colors[0], description: "隐式函数、距离场、混合、CSG、变形与多边形化。", lectures: [lecture("Lecture 04 · 射线与求交", 2, "ray-intersection"), lecture("Lecture 16 · 细分", 7, "subdivision")] },
  { number: 22, title: "游戏中的计算机图形学", file: "22 - 游戏中的计算机图形学.md", stage: "拓展", color: colors[1], description: "平台约束、资源预算、优化、游戏类型与资产流程。", lectures: [lecture("Lecture 11 · 图形流水线", 4, "pipeline"), lecture("Lecture 12 · 图形硬件", 4, "opengl-glsl")] },
  { number: 23, title: "可视化", file: "23 - 可视化.md", stage: "拓展", color: colors[2], description: "数据抽象、视觉编码、交互、组合视图和数据简化。", lectures: [lecture("Lecture 01 · 课程全景", 1, "introduction")] },
];

export const textbookSupplements = [
  { slug: "importance-sampling-conditions", file: "关于蒙特卡洛重要性采样无偏性、有效性的条件.md", title: "重要性采样的无偏性与有效性" },
  { slug: "perspective-matrix", file: "关于透视投影矩阵的推导.md", title: "透视投影矩阵的推导" },
  { slug: "perspective-correct-interpolation", file: "关于透视矫正插值.md", title: "透视矫正插值" },
  { slug: "bezier-bspline", file: "贝塞尔曲线和 B-样条曲线.md", title: "Bézier 曲线和 B-spline 曲线" },
  { slug: "sampling-transform", file: "重要性采样中的分布转换.md", title: "重要性采样中的分布转换" },
  { slug: "metropolis", file: "马尔可夫链与 Metropolis 采样.md", title: "马尔可夫链与 Metropolis 采样" },
];

export const findTextbookChapter = (value: string | number) => textbookChapters.find((chapter) => String(chapter.number) === String(value));
