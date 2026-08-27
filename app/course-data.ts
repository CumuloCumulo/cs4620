export type Lesson = {
  code: string;
  slug: string;
  title: string;
  lecture?: string;
  pdf?: string;
  summary: string;
  objectives: string[];
  concepts: string[];
  checks: string[];
  practice: string;
};

export type CoursePart = {
  id: number;
  title: string;
  description: string;
  color: string;
  project?: string;
  lessons: Lesson[];
};

const slides = "https://www.cs.cornell.edu/courses/cs4620/2018fa/slides/";

const lesson = (
  code: string,
  slug: string,
  title: string,
  lecture: string | undefined,
  pdf: string | undefined,
  summary: string,
  concepts: string[],
  practice: string,
): Lesson => ({
  code, slug, title, lecture, pdf: pdf ? slides + pdf : undefined, summary, concepts, practice,
  objectives: [
    `用自己的话解释“${title}”解决的问题`,
    `辨认算法的输入、输出与所在坐标系`,
    `用一个极小案例验证核心结论`,
  ],
  checks: [
    `不看课件，能否画出本节的概念关系？`,
    `能否说出一个最常见的边界情况？`,
    `如果结果不对，你会先检查哪个中间量？`,
  ],
});

export const parts: CoursePart[] = [
  {
    id: 0, title: "准备与数学热身", color: "#f6df78",
    description: "建立课程所需的最小数学与学习方法，不要求你先成为线性代数高手。",
    lessons: [
      lesson("a", "math-bootcamp", "图形学数学热身", undefined, undefined, "把向量、矩阵、射线参数方程、导数和概率平均与几何直觉连接起来。", ["向量与点积", "叉积与法线", "齐次坐标", "参数方程", "期望与方差"], "实现一个 Vector3，并为长度、点积、叉积、归一化各写普通与边界测试。"),
      lesson("b", "how-to-learn", "如何学习这门课", undefined, undefined, "使用预览、精读、复述、验证四遍法，把幻灯片变成可以调用的知识。", ["主动回忆", "最小实验", "学习日志", "错误分类"], "任选一个陌生公式，标注输入、输出、坐标系和验证方法。"),
    ],
  },
  {
    id: 1, title: "三角网格", color: "#b8f6d6", project: "Mesh",
    description: "从图形学全景进入最常用的曲面表示：顶点、三角形、属性与连接关系。",
    lessons: [
      lesson("a", "introduction", "计算机图形学全景", "Lecture 01", "01intro.pdf", "认识成像、建模、渲染和动画四块版图，以及它们如何组成一张最终图像。", ["成像", "建模", "渲染", "动画"], "选一款游戏或电影镜头，把技术分别归入四块版图。"),
      lesson("b", "triangle-meshes-1", "三角网格 I", "Lecture 02", "02trimesh1.pdf", "用离散三角形逼近连续曲面，理解网格的几何数据与拓扑关系。", ["顶点/边/面", "索引网格", "绕序", "面法线"], "手画一个立方体的三角形索引并检查所有面的朝向。"),
      lesson("c", "triangle-meshes-2", "三角网格 II", "Lecture 03", "学习 OBJ 编码、属性连续性、顶点法线与基本网格处理。", ["OBJ", "顶点法线", "平滑", "属性接缝"], "读取 OBJ，统计顶点和三角形数量，并重新计算顶点法线。"),
    ],
  },
  {
    id: 2, title: "Ray 1：光线追踪基础", color: "#f4b7d2", project: "Ray 1",
    description: "从每个像素发出一条射线，完成求交、透视、光照和三角形内部插值。",
    lessons: [
      lesson("a", "ray-intersection", "射线与求交", "Lecture 04", "04rt-intersect.pdf", "比较 object-order 与 image-order 渲染，并把射线和几何求交写成可验证的代数问题。", ["射线参数 t", "球体求交", "三角形求交", "最近命中"], "给一条射线和两个球，手算所有候选 t 并选出有效最近命中。"),
      lesson("b", "perspective", "透视与相机射线", "Lecture 05", "05perspective.pdf", "从针孔相机模型推导每个像素对应的观察射线，比较正交和透视。", ["针孔相机", "视场角", "像平面", "相机基"], "改变视场角，先预测画面变化，再用程序验证。"),
      lesson("c", "ray-shading", "基础着色", "Lecture 06", "06rt-shading.pdf", "根据光照方向、法线、观察方向和材质计算命中点颜色。", ["Lambert", "Phong", "阴影射线", "反射"], "同一球体依次渲染为法线色、漫反射和带阴影三种结果。"),
      lesson("d", "interpolation", "重心坐标与插值", "Lecture 06.5", "06.5rt-interp.pdf", "用重心坐标在三角形内部插值颜色、法线和纹理坐标。", ["线性插值", "重心坐标", "凸组合", "属性插值"], "为三角形三个顶点赋 RGB，计算重心处颜色并检查端点。"),
    ],
  },
  {
    id: 3, title: "纹理、变换与相机", color: "#c8c2ff", project: "Manipulators",
    description: "掌握整门课最重要的坐标系语言：对象如何被放进世界，相机如何观察它。",
    lessons: [
      lesson("a", "texture-basics", "纹理映射基础", "Lecture 07", "07texture-basics.pdf", "把纹理理解为定义在曲面上的函数，而不只是一张贴纸。", ["UV", "参数化", "接缝", "纹理采样"], "为立方体设计 UV，并标出必须复制顶点属性的位置。"),
      lesson("b", "transforms", "几何变换", "Lecture 08", "08transforms.pdf", "用齐次矩阵统一平移、旋转、缩放与复合，追踪点和法线。", ["仿射变换", "齐次坐标", "矩阵复合", "逆转置"], "交换旋转和平移顺序，手算同一点的不同结果。"),
      lesson("c", "viewing", "三维观察", "Lecture 09", "09viewing.pdf", "从 object space 一路经过 world、camera、clip 到 screen space。", ["观察矩阵", "投影矩阵", "透视除法", "视口"], "为一个世界点写出完整变换链，并标注每一步坐标系。"),
    ],
  },
  {
    id: 4, title: "光栅化与图形流水线", color: "#ffc58f", project: "Manipulators",
    description: "转向现代 GPU 的前向渲染路径：图元覆盖、深度测试与可编程着色阶段。",
    lessons: [
      lesson("a", "rasterization", "光栅化", "Lecture 10", "10rasterization.pdf", "把投影后的三角形转换为片元，处理覆盖、插值和深度。", ["边函数", "片元", "深度缓冲", "透视正确插值"], "用二维边函数软件光栅化三角形，并测试退化与共享边。"),
      lesson("b", "pipeline", "流水线操作", "Lecture 11", "11pipeline.pdf", "理解顶点处理、光栅化、片元处理与帧缓冲的职责边界。", ["裁剪", "背面剔除", "深度测试", "混合"], "为位置、法线、UV、深度和颜色标出产生与使用阶段。"),
      lesson("c", "opengl-glsl", "OpenGL 与 GLSL", "Lecture 12", "12opengl.pdf", "认识现代可编程 GPU，并写出顶点着色器和片元着色器的最小接口。", ["顶点着色器", "片元着色器", "uniform", "varying"], "用伪代码写一个 Lambert 着色器并说明各变量来源。"),
    ],
  },
  {
    id: 5, title: "纹理技术与数字图像", color: "#b8f6d6", project: "Shaders",
    description: "让纹理参与反射、法线和几何，并理解图像从连续信号到显示像素的过程。",
    lessons: [
      lesson("a", "texture-techniques", "纹理映射进阶", "Lecture 13", "13textures.pdf", "用环境、凹凸、法线和位移映射塑造表面外观。", ["立方体贴图", "环境映射", "bump mapping", "displacement"], "比较颜色、凹凸与位移映射对轮廓和法线的不同影响。"),
      lesson("b", "images-displays", "图像与显示", "Lecture 14", "14images.pdf", "从连续二维函数理解像素表示、采样、量化和显示编码。", ["采样", "重建", "量化", "gamma"], "比较 sRGB 数值平均与线性光强平均的结果。"),
    ],
  },
  {
    id: 6, title: "样条曲线", color: "#f4b7d2", project: "Splines",
    description: "用可控的分段多项式构造平滑形状，从几何构造走到连续性分析。",
    lessons: [
      lesson("a", "spline-curves", "二维样条曲线", "Lecture 15", "15spline-curves.pdf", "理解 Bézier、De Casteljau、Catmull-Rom 与曲线连续性。", ["参数曲线", "控制点", "De Casteljau", "C0/C1 连续"], "实现 De Casteljau 并显示中间构造线。"),
    ],
  },
  {
    id: 7, title: "细分与场景图", color: "#f6df78", project: "Splines",
    description: "通过反复细分逼近平滑极限，并用树组织复杂对象和层级变换。",
    lessons: [
      lesson("a", "subdivision", "细分", "Lecture 16", "16subdivision.pdf", "从 Chaikin 角切割理解细分规则、迭代与极限曲面。", ["细分规则", "极限曲线", "Chaikin", "局部规则"], "对折线迭代 1、2、4 次并记录点数和形状变化。"),
      lesson("b", "scene-graphs", "场景图", "Lecture 17", "17scene-graph.pdf", "用树组织对象、分组和局部变换，使编辑与动画具有层级语义。", ["局部变换", "世界变换", "树遍历", "实例化"], "建立太阳—地球—月球场景图并打印每个节点世界矩阵。"),
    ],
  },
  {
    id: 8, title: "动画与三维旋转", color: "#c8c2ff", project: "Animation",
    description: "把时间引入场景，使用关键帧、层级与稳定的旋转插值创造运动。",
    lessons: [
      lesson("a", "animation", "动画", "Lecture 18", "18animation.pdf", "连接动画原则、关键帧、时间插值、四元数和 slerp。", ["关键帧", "时间曲线", "四元数", "slerp"], "让同一旋转分别使用欧拉角 lerp 与 slerp，比较路径和速度。"),
    ],
  },
  {
    id: 9, title: "材质与 Monte Carlo", color: "#ffc58f",
    description: "从经验着色进入物理光传输，用 BRDF 和随机采样处理来自所有方向的光。",
    lessons: [
      lesson("a", "surface-reflection", "表面反射", "Lecture 19", "19surface-reflection.pdf", "用 BRDF 描述入射光如何反射到观察方向，并检查物理约束。", ["BRDF", "互易性", "能量守恒", "微表面"], "画出入射、出射、法线和半程向量，解释粗糙度影响。"),
      lesson("b", "monte-carlo", "Monte Carlo 光照", "Lecture 20", "20monte-carlo.pdf", "把半球光照积分转化为随机样本平均，理解噪声、密度与权重。", ["radiance", "半球积分", "概率密度", "方差"], "用 10、100、10000 个样本估计同一积分并报告误差。"),
    ],
  },
  {
    id: 10, title: "高级光线追踪与加速", color: "#b8f6d6", project: "Ray 2",
    description: "从单样本光追扩展到软阴影、景深和模糊反射，并用空间结构减少求交。",
    lessons: [
      lesson("a", "advanced-ray-tracing", "高级光线追踪", "Lecture 21", "21adv-rt.pdf", "通过多维采样获得软阴影、景深、运动模糊和粗糙反射。", ["分布式光追", "软阴影", "景深", "运动模糊"], "任选软阴影或景深，展示样本数对噪声的影响。"),
      lesson("b", "ray-acceleration", "光线追踪加速", "Lecture 22", "22raytracing-accel.pdf", "用局部空间、包围体和 BVH 排除大量不可能命中的几何。", ["AABB", "BVH", "空间划分", "局部空间射线"], "比较暴力与 BVH 的 primitive 测试次数，并核对命中结果。"),
    ],
  },
  {
    id: 11, title: "抗锯齿与图像合成", color: "#f4b7d2", project: "Ray 2",
    description: "处理像素无法解析的细节，并用正确的 alpha 表示把多层图像组合起来。",
    lessons: [
      lesson("a", "antialiasing", "抗锯齿", "Lecture 23", "23antialiasing.pdf", "从连续信号与离散采样解释锯齿、摩尔纹和闪烁。", ["走样", "预滤波", "重建滤波", "超采样"], "渲染斜线或棋盘格，比较单点与每像素多样本。"),
      lesson("b", "compositing", "图像合成", "Lecture 24", "24compositing.pdf", "区分覆盖率、透明度与颜色，并使用预乘 alpha 的 over 运算。", ["alpha", "over", "预乘 alpha", "层顺序"], "手算 A over B，再交换顺序并解释差异。"),
    ],
  },
  {
    id: 12, title: "颜色科学与结课", color: "#f6df78",
    description: "从光谱和人眼出发理解 RGB，用一次完整复习把整门课连成系统。",
    lessons: [
      lesson("a", "color-science", "颜色科学", "Lecture 25", "25color.pdf", "区分物理光谱、感知颜色、三刺激值、RGB 空间和文件编码。", ["光谱功率分布", "锥体响应", "三刺激值", "色彩空间"], "解释光谱、感知颜色、RGB 数值与 sRGB 编码为何不是同一件事。"),
      lesson("b", "review", "课程复习与结课作品", undefined, undefined, "把建模、变换、成像、着色、采样和显示连接成一条完整图像生成链。", ["知识地图", "期中诊断", "项目复盘", "作品说明"], "闭卷完成 2018 期中题，再挑一个项目补齐测试、性能记录与结果图。"),
    ],
  },
];

export const projects = [
  { id: 1, slug: "mesh", title: "Mesh", part: 1, written: false, summary: "生成并处理三角网格、纹理坐标和顶点法线。", url: "https://www.cs.cornell.edu/courses/cs4620/2018fa/#mesh" },
  { id: 2, slug: "ray1", title: "Ray 1", part: 2, written: true, summary: "从相机射线到求交、着色、阴影与纹理的基础光线追踪器。", url: "https://www.cs.cornell.edu/courses/cs4620/2018fa/#ray1" },
  { id: 3, slug: "manip", title: "Manipulators", part: 3, written: true, summary: "用反投影射线把二维鼠标输入映射到三维变换。", url: "https://www.cs.cornell.edu/courses/cs4620/2018fa/#manip" },
  { id: 4, slug: "shaders", title: "Shaders", part: 5, written: true, summary: "实现微表面、环境、位移和凹凸着色。", url: "https://www.cs.cornell.edu/courses/cs4620/2018fa/#shaders" },
  { id: 5, slug: "splines", title: "Splines", part: 6, written: true, summary: "实现 De Casteljau、Catmull-Rom 转换和旋转曲面。", url: "https://www.cs.cornell.edu/courses/cs4620/2018fa/#splines" },
  { id: 6, slug: "animation", title: "Animation", part: 8, written: true, summary: "关键帧、层级动画和三维旋转插值。", url: "https://www.cs.cornell.edu/courses/cs4620/2018fa/#animation" },
  { id: 7, slug: "ray2", title: "Ray 2", part: 10, written: true, summary: "更真实的材质、采样、递归效果与光追加速。", url: "https://www.cs.cornell.edu/courses/cs4620/2018fa/#ray2" },
];

export const allLessons = parts.flatMap((part) => part.lessons.map((item) => ({ ...item, part })));
export const findPart = (value: string | number) => parts.find((part) => String(part.id) === String(value));

