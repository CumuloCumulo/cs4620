import Link from "next/link";
import { parts } from "./course-data";
import { SiteShell } from "./components/SiteShell";

export default function Home() {
  return (
    <SiteShell>
      <main>
        <section className="hero" id="top">
          <div className="hero-copy">
            <h1>深入浅出<br />计算机图形学</h1>
            <h2>CS4620 公开课</h2>
            <Link className="start-button" href="/about">开始课程</Link>
            <p>从三角网格到光线追踪，从矩阵变换到真实感渲染。沿着 Cornell CS4620 的原始课程顺序，系统完成 26 份讲义与 7 个作业项目。</p>
          </div>
          <div className="cube-art" aria-label="由三个线框立方体组成的图形学课程图案">
            <div className="cube cube-top"><span>△</span></div>
            <div className="cube cube-mid"><span>RT</span></div>
            <div className="cube cube-bottom"><span>RGB</span></div>
          </div>
        </section>

        <section className="intro-row">
          <div><span className="big-icon">◉</span><h3>零基础路线</h3><p>先补齐向量、矩阵与概率，再进入原课程。</p></div>
          <div><span className="big-icon">⌘</span><h3>边学边做</h3><p>7 个完整作业单元，每一部分都有可验证产出。</p></div>
        </section>

        <section className="course-section" id="course">
          <div className="section-heading"><p>COURSE CONTENTS</p><h2>课程内容</h2><span>按 12 周路径循序渐进，也可以进入任意 Part 独立学习。</span></div>
          <div className="module-grid">
            {parts.map((part) => (
              <Link className="module-card" style={{ background: part.color }} href={`/part/${part.id}`} key={part.id}>
                <span className="module-no">部分 {part.id}</span>
                <div><h3>{part.title}</h3><p>{part.lessons.map((item) => item.title).join(" · ")}</p></div>
                <span className="card-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="manifesto">
          <p>LEARN BY BUILDING</p>
          <h2>不只“看懂”，<br />还要亲手把图像做出来。</h2>
          <Link href="/projects">查看 7 个作业项目 →</Link>
        </section>
      </main>
    </SiteShell>
  );
}

