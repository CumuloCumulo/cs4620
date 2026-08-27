"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem("cs4620-theme");
    const shouldDark = saved ? saved === "dark" : true;
    document.documentElement.dataset.theme = shouldDark ? "dark" : "light";
    const frame = window.requestAnimationFrame(() => setDark(shouldDark));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.localStorage.setItem("cs4620-theme", next ? "dark" : "light");
  };

  return (
    <header className="topbar">
      <Link className="brand" href="/" aria-label="CS4620 首页"><span>{"{ ray }"}</span></Link>
      <button className="menu-button" type="button" aria-label="导航菜单" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "×" : "☰"}</button>
      <nav className={menuOpen ? "nav-open" : ""} aria-label="主导航">
        <Link href="/about">关于课程</Link>
        <Link href="/book">教材版</Link>
        <Link href="/#pdf-track">PDF 课件版</Link>
        <Link href="/projects">作业项目</Link>
        <Link href="/archive">原始资源</Link>
        <Link href="/faq">常见问题</Link>
        <Link className="nav-search" href="/search" aria-label="搜索课程">⌕</Link>
        <button type="button" aria-label="切换明暗主题" onClick={toggleTheme}>{dark ? "◐" : "◑"}</button>
        <span className="language">中文⌄</span>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="brand" href="/"><span>{"{ ray }"}</span></Link>
      <p>CS4620 Introduction to Computer Graphics<br />中文自学重建版</p>
      <p>中文教材由本站作者授权使用<br />原始课程 © Cornell University / Steve Marschner</p>
    </footer>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return <><SiteHeader />{children}<SiteFooter /></>;
}
