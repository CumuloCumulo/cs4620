import Link from "next/link";
import { parts, projects } from "../course-data";
import { SiteShell } from "../components/SiteShell";

export default function ProjectsPage() {
  return <SiteShell><main className="projects-page">
    <header><p className="overline">7 PROGRAMMING ASSIGNMENTS</p><h1>作业索引</h1><p>这里仅用于总览。每份作业的完整学习版都嵌在对应章节最后一节，完成正文后自然进入作业，不需要离开课程。</p></header>
    <div className="project-list">{projects.map((project) => <article key={project.id}>
      <span className="project-number">PA {project.id}</span><div><h2>{project.title}</h2><p>{project.summary}</p><div className="project-tags"><span>编程项目</span><span>{project.written ? "含书面部分" : "仅编程，无书面部分"}</span></div></div>
      <div className="project-links"><Link href={`/part/${project.part}/${parts.find((part) => part.id === project.part)?.lessons.at(-1)?.slug}#chapter-assignment`}>打开完整原题与资源 →</Link><span>位于 Part {project.part} 末尾</span></div>
    </article>)}</div>
  </main></SiteShell>;
}
