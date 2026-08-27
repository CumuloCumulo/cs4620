import Link from "next/link";
import { parts } from "./course-data";
import { SiteShell } from "./components/SiteShell";

export default function Home() {
  return (
    <SiteShell>
      <main>
        <section className="hero" id="top">
          <div className="hero-copy">
            <h1>两条路线<br />学透图形学</h1>
            <h2>完整教材 × Cornell CS4620</h2>
            <div className="hero-actions"><Link className="start-button" href="/book">进入教材版</Link><Link className="start-button secondary" href="#pdf-track">进入 PDF 课件版</Link></div>
            <p>你可以沿着 23 章中文教材系统阅读，也可以跟随 Cornell CS4620 的 26 讲课件学习。两版共享七份原始课程作业，并在对应知识位置互相链接。</p>
          </div>
          <div className="cube-art" aria-label="由三个线框立方体组成的图形学课程图案">
            <div className="cube cube-top"><span>△</span></div>
            <div className="cube cube-mid"><span>RT</span></div>
            <div className="cube cube-bottom"><span>RGB</span></div>
          </div>
        </section>

        <section className="track-selector" aria-label="选择学习版本">
          <Link className="track-card textbook-track" href="/book"><span>01</span><small>TEXTBOOK TRACK</small><h2>教材版</h2><p>完整第 1–23 章与六个补充专题。保留原文、公式和插图，按书本顺序系统学习。</p><b>打开教材目录 →</b></Link>
          <a className="track-card pdf-track" href="#pdf-track"><span>02</span><small>LECTURE TRACK</small><h2>PDF 课件版</h2><p>26 份 Cornell 课件被拆解为带讲解、课件页和小练习的自学教程。</p><b>查看课件路线 ↓</b></a>
        </section>

        <section className="intro-row">
          <div><span className="big-icon">◉</span><h3>零基础路线</h3><p>先补齐向量、矩阵与概率，再进入原课程。</p></div>
          <div><span className="big-icon">⌘</span><h3>边学边做</h3><p>7 个完整作业单元，每一部分都有可验证产出。</p></div>
        </section>

        <section className="course-section" id="pdf-track">
          <div className="section-heading"><p>PDF LECTURE TRACK</p><h2>课件版</h2><span>沿 Cornell CS4620 原始顺序学习 26 讲；每一页课件都保留在教程中。</span></div>
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
