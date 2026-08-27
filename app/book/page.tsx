import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "../components/SiteShell";
import { textbookChapters, textbookRepoUrl, textbookSupplements } from "../textbook-manifest";

export const metadata: Metadata = {
  title: "教材版 · Fundamentals of Computer Graphics | CS4620",
  description: "完整教材第 1–23 章与补充专题，配合 Cornell CS4620 课件和七份作业自学。",
};

export default function TextbookIndexPage() {
  return <SiteShell>
    <main className="textbook-index">
      <header className="textbook-index-hero">
        <p className="overline">TEXTBOOK TRACK · 教材版</p>
        <h1>沿着完整教材<br />系统学习图形学</h1>
        <p>正文直接采用你整理的《Fundamentals of Computer Graphics》第 5 版中文教材；Cornell CS4620 的课件讲解与七份作业作为对应章节的辅助材料。</p>
        <div className="track-actions"><Link className="start-button" href="/book/1">从第 1 章开始</Link><Link href="/#pdf-track">切换到 PDF 课件版 →</Link></div>
      </header>

      <section className="textbook-chapter-grid" aria-label="教材章节">
        {textbookChapters.map((chapter) => <Link className="textbook-chapter-card" href={`/book/${chapter.number}`} style={{ "--chapter-color": chapter.color } as React.CSSProperties} key={chapter.number}>
          <span>{String(chapter.number).padStart(2, "0")}</span>
          <div><small>{chapter.stage}</small><h2>{chapter.title}</h2><p>{chapter.description}</p></div>
          <b>→</b>
        </Link>)}
      </section>

      <section className="textbook-supplements">
        <div><p className="overline">SUPPLEMENTS</p><h2>补充专题</h2><p>与主章节交叉阅读的专项推导和延伸笔记。</p></div>
        <nav>{textbookSupplements.map((item, index) => <Link href={`/book/supplement/${item.slug}`} key={item.slug}><span>{String(index + 1).padStart(2, "0")}</span>{item.title}<b>→</b></Link>)}</nav>
      </section>

      <footer className="textbook-attribution">教材内容由站点作者授权使用。<a href={textbookRepoUrl} target="_blank" rel="noreferrer">查看教材原始仓库 ↗</a></footer>
    </main>
  </SiteShell>;
}
