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
  const seenPages = new Set<number>();
  const sections = tutorial.sections.map((item) => {
    const [first, last = first] = item.pages.split("–").map(Number);
    const pages = Array.from({ length: last - first + 1 }, (_, index) => first + index)
      .filter((page) => !seenPages.has(page));
    pages.forEach((page) => seenPages.add(page));
    return { ...item, pagesToShow: pages };
  });
  return (
    <div className="tutorial-article">
      <section className="tutorial-opening">
        <p className="tutorial-question">{tutorial.question}</p>
        <p>{tutorial.opening}</p>
      </section>

      {sections.map((item, index) => {
        const splitAt = Math.ceil(item.pagesToShow.length / 2);
        const firstSlides = item.pagesToShow.slice(0, splitAt);
        const secondSlides = item.pagesToShow.slice(splitAt);
        const renderSlides = (pages: number[]) => pages.map((page) => (
          <figure className="tutorial-slide" key={page}>
            <a href={`${basePath}/lecture-slides/${stem}/page-${String(page).padStart(3, "0")}.webp`} target="_blank" rel="noreferrer">
              <img
                src={`${basePath}/lecture-slides/${stem}/page-${String(page).padStart(3, "0")}.webp`}
                alt={`${lecture || "CS4620"} 第 ${page} 页课件`}
                loading={index === 0 && page === firstSlides[0] ? "eager" : "lazy"}
              />
            </a>
            <figcaption>课件第 {page} 页</figcaption>
          </figure>
        ));
        return (
        <section className="tutorial-section" id={item.id} key={item.id}>
          <header>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><h2>{item.title}</h2><small>相关课件：第 {item.pages} 页</small></div>
          </header>
          <p>{item.narration}</p>
          <div className="tutorial-slides">{renderSlides(firstSlides)}</div>
          <p>{item.inference}</p>
          {secondSlides.length > 0 && <div className="tutorial-slides">{renderSlides(secondSlides)}</div>}
          <div className="tutorial-keypoints">
            <strong>现在应当能够说清楚</strong>
            <ul>{item.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul>
          </div>
          <div className="tutorial-check">
            <strong>小练习 {index + 1}</strong>
            <p>{item.check}</p>
          </div>
        </section>
      )})}

      <section className="tutorial-recap" id="lecture-recap">
        <h2>这一讲的主线</h2>
        <p>{tutorial.recap}</p>
      </section>

      <section className="tutorial-practice" id="lecture-practice">
        <span>练习</span>
        <h2>把概念变成可验证的结果</h2>
        <p>{practice}</p>
        <small>先写下预期结果，再计算或编程；完成后保留一个可重复的测试案例。</small>
      </section>

      <a className="slide-link tutorial-pdf-link" href={pdf} target="_blank" rel="noreferrer">
        <span>PDF</span><div><strong>对照完整原始课件</strong><small>{lecture} · 共 {tutorial.pageCount} 页；教程未改写原文件</small></div><b>↗</b>
      </a>
    </div>
  );
}
