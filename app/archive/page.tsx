import { SiteShell } from "../components/SiteShell";
import { archiveContent } from "../generated/archive-content";

export default function ArchivePage() {
  const basePath = process.env.GITHUB_ACTIONS === "true" ? "/cs4620" : "";
  const withBase = (value: string) => value.replaceAll("%%BASE_PATH%%", basePath);
  return <SiteShell><main className="archive-page">
    <header>
      <p className="overline">CORNELL CS4620 · FALL 2018</p>
      <h1>原始课程资源库</h1>
      <p>完整保留原课程表中的课件、教材章节、演示、素材、作业节点，以及课程主页列出的历年试卷和教材资源。日期仅用于还原 2018 年课程节奏。</p>
      <a href={archiveContent.sourceUrl} target="_blank" rel="noreferrer">打开 Cornell 原始课程主页 ↗</a>
    </header>
    <nav className="archive-jump" aria-label="资源页导航"><a href="#schedule">课程表与演示</a><a href="#exams">历年试卷</a><a href="#books">教材与补充资料</a></nav>
    <section id="schedule"><h2>课程表、阅读与演示</h2><div className="archive-document schedule-document" dangerouslySetInnerHTML={{ __html: withBase(archiveContent.scheduleHtml) }} /></section>
    <section id="exams"><h2>历年试卷与答案</h2><div className="archive-document" dangerouslySetInnerHTML={{ __html: withBase(archiveContent.oldExamsHtml) }} /></section>
    <section id="books"><h2>教材与补充材料</h2><div className="archive-document books-document" dangerouslySetInnerHTML={{ __html: withBase(archiveContent.booksHtml) }} /></section>
  </main></SiteShell>;
}
