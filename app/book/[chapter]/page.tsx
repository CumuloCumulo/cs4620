import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssignmentArticle } from "../../components/AssignmentArticle";
import { SiteShell } from "../../components/SiteShell";
import { projects } from "../../course-data";
import { findTextbookChapter, textbookChapters, textbookRepoUrl } from "../../textbook-manifest";
import { renderTextbookMarkdown } from "../../textbook-renderer";
import { readTextbookFile } from "../../textbook-source";

export function generateStaticParams() { return textbookChapters.map((chapter) => ({ chapter: String(chapter.number) })); }

export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }): Promise<Metadata> {
  const { chapter: value } = await params;
  const chapter = findTextbookChapter(value);
  if (!chapter) return {};
  const title = `第 ${chapter.number} 章 · ${chapter.title} | 图形学教材版`;
  return { title, description: chapter.description, openGraph: { title, description: chapter.description, images: [] }, twitter: { title, description: chapter.description, images: [] } };
}

export default async function TextbookChapterPage({ params }: { params: Promise<{ chapter: string }> }) {
  const { chapter: value } = await params;
  const chapter = findTextbookChapter(value);
  if (!chapter) notFound();
  let source: string;
  try { source = await readTextbookFile(chapter.file); }
  catch { notFound(); }
  const { html, headings } = renderTextbookMarkdown(source);
  const previous = textbookChapters[chapter.number - 2];
  const next = textbookChapters[chapter.number];
  const assignment = projects.find((item) => item.id === chapter.assignmentId);
  const sourceUrl = `${textbookRepoUrl}/blob/main/${encodeURIComponent(chapter.file)}`;

  return <SiteShell>
    <main className="textbook-reader" style={{ "--chapter-color": chapter.color } as React.CSSProperties}>
      <header className="textbook-reader-hero">
        <div className="crumb-arrows"><Link href="/">选择版本</Link><Link href="/book">教材版</Link><span>第 {chapter.number} 章</span></div>
        <p>{chapter.stage}</p><h1><span>{String(chapter.number).padStart(2, "0")}</span>{chapter.title}</h1><p>{chapter.description}</p>
      </header>
      <div className="textbook-reader-layout">
        <aside className="textbook-reader-nav">
          <strong>第 {chapter.number} 章</strong>
          <a href="#chapter-start">本章正文</a>
          {headings.map((heading) => <a className={heading.depth === 3 ? "sub" : ""} href={`#${heading.id}`} key={heading.id}>{heading.text}</a>)}
          {assignment && <a className="assignment-nav" href="#chapter-assignment">作业 PA {assignment.id} · {assignment.title}</a>}
        </aside>
        <article className="textbook-reader-content" id="chapter-start">
          <aside className="chapter-study-guide">
            <span>本章配套的 CS4620 课堂补充</span>
            <div>{chapter.lectures.map((item) => <Link href={item.href} key={item.href}>{item.title}<b>↗</b></Link>)}</div>
            <small>建议先读教材正文；需要图示、课堂讲解或更多小练习时，再打开对应课件版。</small>
          </aside>
          <div className="textbook-markdown" dangerouslySetInnerHTML={{ __html: html }} />
          <footer className="chapter-source"><span>本页保留教材原文结构与内容。</span><a href={sourceUrl} target="_blank" rel="noreferrer">在 GitHub 查看本章源文件 ↗</a></footer>
          {assignment && <AssignmentArticle project={assignment} />}
          <nav className="chapter-pager" aria-label="教材章节导航">
            {previous ? <Link href={`/book/${previous.number}`}><small>上一章</small><strong>← {previous.number}. {previous.title}</strong></Link> : <span />}
            {next ? <Link className="next" href={`/book/${next.number}`}><small>下一章</small><strong>{next.number}. {next.title} →</strong></Link> : <Link className="next" href="/book"><small>教材完成</small><strong>返回目录 →</strong></Link>}
          </nav>
        </article>
      </div>
    </main>
  </SiteShell>;
}
