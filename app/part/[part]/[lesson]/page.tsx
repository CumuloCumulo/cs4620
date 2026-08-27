import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allLessons, findPart, findProjectForPart } from "../../../course-data";
import { ProgressButton } from "../../../components/ProgressButton";
import { AssignmentArticle } from "../../../components/AssignmentArticle";
import { SiteShell } from "../../../components/SiteShell";

export function generateStaticParams() { return allLessons.map(({ part, slug }) => ({ part: String(part.id), lesson: slug })); }

export async function generateMetadata({ params }: { params: Promise<{ part: string; lesson: string }> }): Promise<Metadata> {
  const { part: value, lesson: slug } = await params;
  const part = findPart(value);
  const item = part?.lessons.find((lesson) => lesson.slug === slug);
  if (!part || !item) return {};
  const title = `${item.title} · Part ${part.id} | CS4620`;
  return { title, description: item.summary, openGraph: { title, description: item.summary, images: [] }, twitter: { title, description: item.summary, images: [] } };
}

export default async function LessonPage({ params }: { params: Promise<{ part: string; lesson: string }> }) {
  const { part: value, lesson: slug } = await params;
  const part = findPart(value);
  const item = part?.lessons.find((lesson) => lesson.slug === slug);
  if (!part || !item) notFound();
  const currentIndex = allLessons.findIndex((entry) => entry.part.id === part.id && entry.slug === item.slug);
  const previous = allLessons[currentIndex - 1];
  const next = allLessons[currentIndex + 1];
  const isLastLesson = part.lessons.at(-1)?.slug === item.slug;
  const project = isLastLesson ? findProjectForPart(part.id) : undefined;
  return (
    <SiteShell>
      <main className="lesson-page" style={{ "--part-color": part.color } as React.CSSProperties}>
        <section className="lesson-banner">
          <div className="crumb-arrows"><Link href="/#course">CS4620</Link><Link href={`/part/${part.id}`}>Part {part.id}</Link><span>{item.title}</span></div>
          <div className="ray-diagram" aria-hidden="true"><span className="ray-line" /><span className="ray-ball">●</span><span className="ray-hit">×</span></div>
        </section>
        <div className="lesson-layout">
          <aside className="lesson-nav"><strong>Part {part.id}</strong>{part.lessons.map((entry) => <Link className={entry.slug === item.slug ? "active" : ""} href={`/part/${part.id}/${entry.slug}`} key={entry.slug}>{entry.code} {entry.title}</Link>)}{project && <a className="assignment-nav" href="#chapter-assignment">作业 PA {project.id}：{project.title}</a>}</aside>
          <article className="lesson-content">
            <div className="lesson-title"><span>{item.code}</span><div><p>{item.lecture || `Part ${part.id}`}</p><h1>{item.title}</h1></div></div>
            <p className="lead">{item.summary}</p>
            <ProgressButton lessonId={`${part.id}:${item.slug}`} />

            <h2>本节目标</h2>
            <ul>{item.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>

            <h2>核心概念</h2>
            <div className="concept-grid">{item.concepts.map((concept, index) => <div key={concept}><span>0{index + 1}</span><strong>{concept}</strong></div>)}</div>

            <div className="note-block"><strong>阅读方式</strong><p>先快速浏览课件中的标题和图，再精读公式。为每个公式标出输入、输出、坐标系和边界情况；纯文本摘要不能替代课件中的图形。</p></div>

            {item.pdf && <a className="slide-link" href={item.pdf} target="_blank" rel="noreferrer"><span>PDF</span><div><strong>打开原始讲义</strong><small>{item.lecture} · Cornell CS4620 Fall 2018</small></div><b>↗</b></a>}

            <h2>动手练习</h2>
            <div className="exercise-block"><span>练习 {part.id}.{item.code}</span><p>{item.practice}</p><p className="exercise-tip">建议先写下预期结果，再开始计算或编程。完成后至少保留一个可重复的测试案例。</p></div>

            <h2>完成检查</h2>
            <ol className="check-list">{item.checks.map((check) => <li key={check}>{check}</li>)}</ol>

            {project && <AssignmentArticle project={project} />}

            <nav className="lesson-pager" aria-label="课程前后导航">
              {previous ? <Link href={`/part/${previous.part.id}/${previous.slug}`}><small>上一节</small><strong>← {previous.title}</strong></Link> : <span />}
              {next ? <Link href={`/part/${next.part.id}/${next.slug}`} className="next"><small>下一节</small><strong>{next.title} →</strong></Link> : <Link href="/projects" className="next"><small>课程完成</small><strong>查看项目 →</strong></Link>}
            </nav>
          </article>
        </div>
      </main>
    </SiteShell>
  );
}
