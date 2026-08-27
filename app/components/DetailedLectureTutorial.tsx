import Link from "next/link";
import type { DetailedLectureTutorial } from "../detailed-tutorial-data";

export function DetailedLectureTutorialArticle({
  tutorial,
  lecture,
  pdf,
}: {
  tutorial: DetailedLectureTutorial;
  lecture?: string;
  pdf: string;
}) {
  const basePath = process.env.GITHUB_ACTIONS === "true" ? "/cs4620" : "";
  const stem = tutorial.pdf.replace(/\.pdf$/i, "");

  return (
    <div className="deep-tutorial">
      <section className="deep-opening">
        <div className="deep-opening-meta">
          <span>逐页精讲</span>
          <span>{tutorial.pageCount} 个物理页</span>
          <span>{tutorial.estimatedTime}</span>
        </div>
        <h2>{tutorial.question}</h2>
        {tutorial.opening.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </section>

      <section className="deep-study-contract">
        <div>
          <span>READING METHOD</span>
          <h3>每一页都回答三个问题</h3>
        </div>
        <ol>
          <li><strong>课件在说什么？</strong><small>先忠实读取图、文字、公式和例子。</small></li>
          <li><strong>相邻页改变了什么？</strong><small>识别动画新增、尺度变化和论证转折。</small></li>
          <li><strong>我怎样验证？</strong><small>用一个能手算或能写成测试的极小案例。</small></li>
        </ol>
      </section>

      <section className="deep-outcomes">
        <span>完成本讲后</span>
        <ul>{tutorial.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
      </section>

      <section className="running-example">
        <span>RUNNING EXAMPLE</span>
        <h3>{tutorial.runningExample.title}</h3>
        <p>{tutorial.runningExample.description}</p>
        <pre><code>{tutorial.runningExample.code}</code></pre>
      </section>

      {tutorial.chapters.map((chapter, chapterIndex) => (
        <section className="deep-chapter" id={chapter.id} key={chapter.id}>
          <header className="deep-chapter-heading">
            <span>{String(chapterIndex + 1).padStart(2, "0")}</span>
            <div>
              <small>课件第 {chapter.pages} 页</small>
              <h2>{chapter.title}</h2>
              <p>{chapter.purpose}</p>
            </div>
          </header>

          <div className="deep-beats">
            {chapter.beats.map((item, beatIndex) => {
              const beatNumber = tutorial.chapters
                .slice(0, chapterIndex)
                .reduce((total, earlierChapter) => total + earlierChapter.beats.length, 0) + beatIndex + 1;
              return (
                <article className="deep-slide-beat" id={`slide-${item.page}`} key={item.page}>
                  <div className="deep-slide-visual">
                    <div className="deep-slide-label">
                      <span>PDF PAGE {String(item.page).padStart(2, "0")}</span>
                      <small>{beatNumber}/{tutorial.pageCount}</small>
                    </div>
                    <a href={`${basePath}/lecture-slides/${stem}/page-${String(item.page).padStart(3, "0")}.webp`} target="_blank" rel="noreferrer">
                      <img
                        src={`${basePath}/lecture-slides/${stem}/page-${String(item.page).padStart(3, "0")}.webp`}
                        alt={`${lecture || "CS4620"} 第 ${item.page} 页课件：${item.title}`}
                        loading={item.page === 1 ? "eager" : "lazy"}
                      />
                    </a>
                    <small className="deep-slide-zoom">点击课件可查看原尺寸 ↗</small>
                  </div>

                  <div className="deep-slide-copy">
                    <div className="deep-beat-number">{String(beatNumber).padStart(2, "0")}</div>
                    <h3>{item.title}</h3>
                    <div className="slide-delta"><strong>相邻页变化</strong><p>{item.change}</p></div>
                    {item.explanation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

                    <div className="slide-inspect">
                      <strong>读图时盯住</strong>
                      <ul>{item.inspect.map((point) => <li key={point}>{point}</li>)}</ul>
                    </div>

                    {item.formula && <pre className="deep-formula"><code>{item.formula}</code></pre>}

                    {item.example && <div className="worked-example">
                      <strong>{item.example.title}</strong>
                      <ol>{item.example.lines.map((line) => <li key={line}>{line}</li>)}</ol>
                    </div>}

                    {item.textbook && <aside className="slide-textbook">
                      <span>教材接力</span>
                      <h4>{item.textbook.chapter} · {item.textbook.section}</h4>
                      <p>{item.textbook.bridge}</p>
                      <Link href={item.textbook.href}>在教材版继续精读 →</Link>
                    </aside>}

                    {item.pause && <div className="pause-and-do">
                      <span>PAUSE & DO</span>
                      <p>{item.pause}</p>
                    </div>}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="chapter-checkpoint">
            <span>阶段检查 {chapterIndex + 1}</span>
            <p>{chapter.checkpoint}</p>
          </div>
        </section>
      ))}

      <section className="deep-synthesis" id="lecture-recap">
        <span>LECTURE MAP</span>
        <h2>把 {tutorial.pageCount} 页压回一条因果链</h2>
        <ol>{tutorial.synthesis.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section className="deep-final-practice" id="lecture-practice">
        <span>FINAL PRACTICE</span>
        <h2>不是复述术语，而是写出可失败的验证器</h2>
        <p>{tutorial.finalPractice}</p>
        <small>完成标准：至少保留 1 个正确样例、3 个错误样例和每个样例的预期诊断。</small>
      </section>

      <a className="slide-link tutorial-pdf-link" href={pdf} target="_blank" rel="noreferrer">
        <span>PDF</span><div><strong>对照完整原始课件</strong><small>{lecture} · 共 {tutorial.pageCount} 页；逐页精讲保留原始页序</small></div><b>↗</b>
      </a>
    </div>
  );
}
