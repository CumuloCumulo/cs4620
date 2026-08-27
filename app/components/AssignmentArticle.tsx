import Script from "next/script";
import type { CourseProject } from "../course-data";
import { assignmentContent } from "../generated/assignment-content";

export function AssignmentArticle({ project }: { project: CourseProject }) {
  const record = assignmentContent[project.slug as keyof typeof assignmentContent];
  if (!record) return null;
  const basePath = process.env.GITHUB_ACTIONS === "true" ? "/cs4620" : "";
  const originalHtml = record.html.replaceAll("%%BASE_PATH%%", basePath);
  const linkedResources = (record.resources as readonly { label: string; url: string; kind: string }[])
    .filter((resource) => resource.kind !== "image");

  return <section className="chapter-assignment" id="chapter-assignment">
    <Script id="mathjax-config" strategy="beforeInteractive">{`window.MathJax={tex:{inlineMath:[['\\\\(','\\\\)']],displayMath:[['\\\\[','\\\\]']]},options:{skipHtmlTags:['script','noscript','style','textarea','pre','code']}};`}</Script>
    <Script id="mathjax" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" strategy="afterInteractive" />

    <div className="assignment-kicker"><span>章节作业 · Cornell 原题</span><b>PA {project.id}</b></div>
    <h2>{project.title}</h2>
    <p className="assignment-lead">以下是 Cornell CS4620 Fall 2018 作业正文的完整学习版，不是摘要。原有标题、公式、代码、图片、参考链接、框架说明、测试与提交要求均被保留。</p>

    <aside className="assignment-resource-index" aria-label="作业资源索引">
      <div><span>{record.stats.headings}</span><small>正文标题</small></div>
      <div><span>{record.stats.images}</span><small>示例图片</small></div>
      <div><span>{record.stats.links}</span><small>资源链接</small></div>
      <details>
        <summary>展开全部链接资源</summary>
        <ul>{linkedResources.map((resource) => <li key={`${resource.url}-${resource.label}`}><a href={resource.url} target="_blank" rel="noreferrer"><span>{resource.kind.toUpperCase()}</span>{resource.label || resource.url}</a></li>)}</ul>
      </details>
    </aside>

    <div className="historical-note"><strong>历史课程说明</strong><p>截止日期、Piazza、CMS 和旧框架环境属于 2018 年原课程记录。自学时保留它们用于还原课程，但无需遵守旧日期；失效链接旁仍保留原始上下文。</p></div>

    <article className="cornell-assignment-document" dangerouslySetInnerHTML={{ __html: originalHtml }} />

    <footer className="assignment-source-footer">
      <p>来源：Cornell University · CS4620 Introduction to Computer Graphics · Fall 2018</p>
      <a href={record.sourceUrl} target="_blank" rel="noreferrer">对照 Cornell 原始页面 ↗</a>
    </footer>
  </section>;
}
