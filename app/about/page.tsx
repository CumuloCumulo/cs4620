import Link from "next/link";
import { SiteShell } from "../components/SiteShell";

export default function AboutPage() {
  return <SiteShell><main className="about-page">
    <section className="about-art"><div className="cube-mini">△</div><div className="cube-mini">RT</div><div className="cube-mini">RGB</div></section>
    <article>
      <p className="overline">ABOUT THE COURSE</p><h1>课程简介</h1>
      <p className="lead">CS4620 是 Cornell University 的计算机图形学导论课程，由 Steve Marschner 授课。本网站在保留 2018 秋原课程顺序的基础上，为中文零基础学习者重新组织了学习入口。</p>
      <h2>你会学到什么</h2><p>课程覆盖三角网格、光线追踪、几何变换、相机与投影、光栅化、OpenGL/GLSL、纹理、样条、动画、BRDF、Monte Carlo、加速结构、抗锯齿、合成和颜色科学。它不是某个软件的使用教程，而是解释图像如何被计算出来。</p>
      <h2>建议基础</h2><p>你需要基本编程能力：变量、函数、循环、数组、类或结构体。数学方面只要求愿意边用边补；Part 0 已提供向量、矩阵、参数方程、导数和概率直觉的最小准备。</p>
      <h2>课程方法</h2><p>每节采用四遍法：预览结构、精读课件、关掉资料复述、用手算或程序验证。完成的标准不是“看完 PDF”，而是能够解释、实现和测试。</p>
      <div className="notice-block"><strong>关于作业数量</strong><p>原站有 7 个作业单元和 7 个编程项目。Mesh 只有编程部分，其余六个同时包含书面部分；本站会完整呈现全部 7 个作业。</p></div>
      <div className="about-actions"><Link href="/part/0">从 Part 0 开始</Link><Link href="/#course">查看课程地图</Link></div>
    </article>
  </main></SiteShell>;
}

