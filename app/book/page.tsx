import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "../components/SiteShell";
import { textbookChapters, textbookRepoUrl, textbookSupplements } from "../textbook-manifest";

export const metadata: Metadata = {
  title: "教材版 · Fundamentals of Computer Graphics | CS4620",
  description: "完整教材第 1–23 章与补充专题，配合 Cornell CS4620 课件和七份作业自学。",
};

const stages = [
  { name: "基础", id: "foundation", description: "建立图形学全景、数学语言与数字图像的基本认识。" },
  { name: "核心渲染", id: "rendering", description: "从相机射线出发，理解几何求交、局部光照与成像。" },
  { name: "空间与管线", id: "pipeline", description: "把矩阵、相机、光栅化和 GPU 流水线串成完整路径。" },
  { name: "采样与外观", id: "appearance", description: "理解纹理、信号处理、随机采样与物理渲染。" },
  { name: "建模与运动", id: "modeling", description: "用曲线、动画与图形硬件组织可编辑的动态场景。" },
  { name: "拓展", id: "extension", description: "继续走向视觉感知、游戏生产和数据可视化。" },
].map((stage, index) => ({
  ...stage,
  index: index + 1,
  chapters: textbookChapters.filter((chapter) => chapter.stage === stage.name),
}));

export default function TextbookIndexPage() {
  return <SiteShell>
    <main className="textbook-index textbook-index-refined">
      <header className="textbook-index-hero">
        <div className="textbook-index-intro">
          <p className="overline">TEXTBOOK TRACK · 教材版</p>
          <h1>计算机图形学<br />完整教材</h1>
          <p>保留《Fundamentals of Computer Graphics》第 5 版中文教材的原文、公式与插图，并在对应章节接入 Cornell CS4620 课件讲解与课程作业。</p>
          <div className="track-actions">
            <Link className="start-button" href="/book/1">从第 1 章开始</Link>
            <Link href="/search">搜索知识点 →</Link>
          </div>
        </div>

        <aside className="textbook-overview" aria-label="教材概览">
          <p className="overline">COURSE OVERVIEW</p>
          <div className="textbook-overview-stats">
            <div><strong>23</strong><span>章教材正文</span></div>
            <div><strong>06</strong><span>个学习阶段</span></div>
            <div><strong>07</strong><span>份课程作业</span></div>
          </div>
          <p>适合第一次系统学习图形学。按顺序阅读教材，需要更多图示或讲解时，再打开对应的 PDF 课件版。</p>
          <Link href="/#pdf-track">查看 PDF 课件版 ↗</Link>
        </aside>
      </header>

      <nav className="textbook-stage-jump" aria-label="教材学习阶段">
        <span>学习路线</span>
        {stages.map((stage) => <a href={`#${stage.id}`} key={stage.id}><b>{String(stage.index).padStart(2, "0")}</b>{stage.name}</a>)}
      </nav>

      <div className="textbook-stage-list">
        {stages.map((stage) => {
          const first = stage.chapters[0].number;
          const last = stage.chapters.at(-1)?.number ?? first;
          return <section className="textbook-stage" id={stage.id} key={stage.id}>
            <header className="textbook-stage-heading">
              <p>STAGE {String(stage.index).padStart(2, "0")}</p>
              <div><h2>{stage.name}</h2><span>{stage.description}</span></div>
              <small>第 {first}–{last} 章</small>
            </header>
            <div className="textbook-chapter-grid" aria-label={`${stage.name}阶段章节`}>
              {stage.chapters.map((chapter) => <Link className="textbook-chapter-card" href={`/book/${chapter.number}`} style={{ "--chapter-color": chapter.color } as React.CSSProperties} key={chapter.number}>
                <span className="textbook-card-number">{String(chapter.number).padStart(2, "0")}</span>
                <div className="textbook-card-copy">
                  <div className="textbook-card-meta">
                    <small>{chapter.lectures.length} 份配套课件</small>
                    {chapter.assignmentId && <small>PA {chapter.assignmentId}</small>}
                  </div>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.description}</p>
                </div>
                <b className="textbook-card-arrow">→</b>
              </Link>)}
            </div>
          </section>;
        })}
      </div>

      <section className="textbook-supplements">
        <div><p className="overline">SUPPLEMENTS</p><h2>补充专题</h2><p>针对正文里推导较快的主题，提供更聚焦的交叉阅读材料。</p></div>
        <nav>{textbookSupplements.map((item, index) => <Link href={`/book/supplement/${item.slug}`} key={item.slug}><span>{String(index + 1).padStart(2, "0")}</span>{item.title}<b>→</b></Link>)}</nav>
      </section>

      <footer className="textbook-attribution">教材内容由站点作者授权使用。<a href={textbookRepoUrl} target="_blank" rel="noreferrer">查看教材原始仓库 ↗</a></footer>
    </main>
  </SiteShell>;
}
