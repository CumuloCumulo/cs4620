import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findPart, parts } from "../../course-data";
import { SiteShell } from "../../components/SiteShell";

export function generateStaticParams() { return parts.map((part) => ({ part: String(part.id) })); }

export async function generateMetadata({ params }: { params: Promise<{ part: string }> }): Promise<Metadata> {
  const { part: value } = await params;
  const part = findPart(value);
  if (!part) return {};
  const title = `Part ${part.id} · ${part.title} | CS4620`;
  return { title, description: part.description, openGraph: { title, description: part.description, images: [] }, twitter: { title, description: part.description, images: [] } };
}

export default async function PartPage({ params }: { params: Promise<{ part: string }> }) {
  const { part: value } = await params;
  const part = findPart(value);
  if (!part) notFound();
  const previous = parts[part.id - 1];
  const next = parts[part.id + 1];
  return (
    <SiteShell>
      <main className="part-page" style={{ "--part-color": part.color } as React.CSSProperties}>
        <section className="part-hero">
          <div className="crumb-arrows"><Link href="/#course">CS4620</Link><span>Part {part.id}</span></div>
          <div className="part-symbol" aria-hidden="true"><span>◯</span><i>↗</i></div>
          <div className="part-intro"><p>Part {part.id}</p><h1>{part.title}</h1><p>{part.description}</p>{part.project && <div className="project-chip">关联作业：{part.project}</div>}</div>
          <div className="lesson-arrows">
            {part.lessons.map((item) => <Link href={`/part/${part.id}/${item.slug}`} key={item.slug}><b>{item.code}</b> {item.title}</Link>)}
          </div>
        </section>
        <nav className="part-pager" aria-label="部分导航">
          {previous ? <Link href={`/part/${previous.id}`}><small>上一部分</small><strong>← Part {previous.id}</strong><span>{previous.title}</span></Link> : <span />}
          {next ? <Link href={`/part/${next.id}`} className="next"><small>下一部分</small><strong>Part {next.id} →</strong><span>{next.title}</span></Link> : <Link href="/projects" className="next"><small>完成课程</small><strong>作业项目 →</strong></Link>}
        </nav>
      </main>
    </SiteShell>
  );
}

