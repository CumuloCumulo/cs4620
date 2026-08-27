import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "../../../components/SiteShell";
import { textbookRepoUrl, textbookSupplements } from "../../../textbook-manifest";
import { renderTextbookMarkdown } from "../../../textbook-renderer";
import { readTextbookFile } from "../../../textbook-source";

export function generateStaticParams() { return textbookSupplements.map((item) => ({ slug: item.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = textbookSupplements.find((entry) => entry.slug === slug);
  return item ? { title: `${item.title} | 图形学教材补充专题` } : {};
}

export default async function TextbookSupplementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = textbookSupplements.find((entry) => entry.slug === slug);
  if (!item) notFound();
  let source: string;
  try { source = await readTextbookFile(item.file); }
  catch { notFound(); }
  const { html, headings } = renderTextbookMarkdown(source);
  const sourceUrl = `${textbookRepoUrl}/blob/main/${encodeURIComponent(item.file)}`;
  return <SiteShell><main className="textbook-reader supplement-reader" style={{ "--chapter-color": "#b8f6d6" } as React.CSSProperties}>
    <header className="textbook-reader-hero"><div className="crumb-arrows"><Link href="/">选择版本</Link><Link href="/book">教材版</Link><span>补充专题</span></div><p>SUPPLEMENT</p><h1>{item.title}</h1></header>
    <div className="textbook-reader-layout"><aside className="textbook-reader-nav"><strong>专题目录</strong>{headings.map((heading) => <a className={heading.depth === 3 ? "sub" : ""} href={`#${heading.id}`} key={heading.id}>{heading.text}</a>)}</aside><article className="textbook-reader-content"><div className="textbook-markdown" dangerouslySetInnerHTML={{ __html: html }} /><footer className="chapter-source"><Link href="/book">← 返回教材目录</Link><a href={sourceUrl} target="_blank" rel="noreferrer">查看源文件 ↗</a></footer></article></div>
  </main></SiteShell>;
}
