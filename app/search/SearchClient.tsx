"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type SearchItem = { id: string; eyebrow: string; href: string; title: string; summary: string; concepts: string[] };

export function SearchClient({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter((item) => [item.title, item.summary, item.eyebrow, ...item.concepts].join(" ").toLowerCase().includes(q));
  }, [items, query]);
  return (
    <div className="search-page">
      <h1>搜索课程</h1>
      <label><span>从教材原文与课件教程中搜索</span><input type="search" placeholder="输入关键词，例如：法线、BVH、颜色" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      {query && <section className="search-results"><h2>找到 {results.length} 条关于 “{query}” 的结果</h2>{results.length ? <ol>{results.map((item) => <li key={item.id}><Link href={item.href}><small>{item.eyebrow}</small>{item.title}</Link><p>{item.summary}</p></li>)}</ol> : <p>换一个更短的关键词试试。</p>}</section>}
    </div>
  );
}
