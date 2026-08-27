import Link from "next/link";
import { projects } from "../course-data";
import { SiteShell } from "../components/SiteShell";

export default function ProjectsPage() {
  return <SiteShell><main className="projects-page">
    <header><p className="overline">7 PROGRAMMING ASSIGNMENTS</p><h1>作业项目</h1><p>七个单元贯穿整个课程。每张卡片都标明是否包含书面部分，并连接到对应学习 Part 与 Cornell 原始题目。</p></header>
    <div className="project-list">{projects.map((project) => <article key={project.id}>
      <span className="project-number">PA {project.id}</span><div><h2>{project.title}</h2><p>{project.summary}</p><div className="project-tags"><span>编程项目</span><span>{project.written ? "含书面部分" : "仅编程，无书面部分"}</span></div></div>
      <div className="project-links"><Link href={`/part/${project.part}`}>学习 Part {project.part} →</Link><a href={project.url} target="_blank" rel="noreferrer">原始题目 ↗</a></div>
    </article>)}</div>
  </main></SiteShell>;
}

