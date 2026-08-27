import type { LectureTutorial } from "../tutorial-data";

export function LectureTutorialArticle({
  tutorial,
  lecture,
  pdf,
  practice,
}: {
  tutorial: LectureTutorial;
  lecture?: string;
  pdf: string;
  practice: string;
}) {
  const basePath = process.env.GITHUB_ACTIONS === "true" ? "/cs4620" : "";
  const stem = tutorial.pdf.replace(/\.pdf$/i, "");
  return (
    <div className="tutorial-article">
      <section className="tutorial-opening" aria-labelledby="lecture-question">
        <p className="tutorial-kicker">本讲要回答的问题</p>
        <h2 id="lecture-question">{tutorial.question}</h2>
        <p>{tutorial.opening}</p>
        <div className="tutorial-legend">
          <p><strong>课件脉络</strong><span>严格按 PDF 的页序、图示和概念组织。</span></p>
          <p><strong>讲解补足</strong><span>根据前后页推测老师会口头补充的过渡与直觉，不冒充课件原文。</span></p>
        </div>
      </section>

      <section className="tutorial-route" aria-labelledby="lecture-route">
        <p className="tutorial-kicker">授课路线</p>
        <h2 id="lecture-route">这一讲怎样一步步展开</h2>
        <ol>{tutorial.arc.map((step) => <li key={step}>{step}</li>)}</ol>
      </section>

      {tutorial.sections.map((item, index) => (
        <section className="tutorial-section" id={item.id} key={item.id}>
          <header>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><small>课件第 {item.pages} 页</small><h2>{item.title}</h2></div>
          </header>
          <div className="tutorial-source-copy">
            <span>课件脉络</span>
            <p>{item.narration}</p>
          </div>
          <figure className="tutorial-slide">
            <img
              src={`${basePath}/lecture-slides/${stem}/page-${String(item.slide).padStart(3, "0")}.webp`}
              alt={`${lecture || "CS4620"} 第 ${item.slide} 页课件`}
              loading={index === 0 ? "eager" : "lazy"}
            />
            <figcaption>原课件第 {item.slide} 页 · Cornell CS4620 Fall 2018</figcaption>
          </figure>
          <div className="tutorial-inference">
            <span>讲解补足</span>
            <p>{item.inference}</p>
          </div>
          <div className="tutorial-keypoints">
            <strong>听到这里，抓住三点</strong>
            <ul>{item.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul>
          </div>
          <details className="tutorial-check">
            <summary>停一下：确认自己真的理解了</summary>
            <p>{item.check}</p>
          </details>
        </section>
      ))}

      <section className="tutorial-recap" id="lecture-recap">
        <p className="tutorial-kicker">本讲收束</p>
        <h2>把这些页面串成一句话</h2>
        <p>{tutorial.recap}</p>
      </section>

      <section className="tutorial-practice" id="lecture-practice">
        <span>课后验证</span>
        <h2>不要停在“好像看懂了”</h2>
        <p>{practice}</p>
        <small>先写下预期结果，再计算或编程；完成后保留一个可重复的测试案例。</small>
      </section>

      <a className="slide-link tutorial-pdf-link" href={pdf} target="_blank" rel="noreferrer">
        <span>PDF</span><div><strong>对照完整原始课件</strong><small>{lecture} · 共 {tutorial.pageCount} 页；教程未改写原文件</small></div><b>↗</b>
      </a>
    </div>
  );
}
