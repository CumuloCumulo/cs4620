import { allLessons } from "../course-data";
import { SiteShell } from "../components/SiteShell";
import { textbookCompanions } from "../textbook-data";
import { textbookChapters, textbookSupplements } from "../textbook-manifest";
import { readTextbookFile } from "../textbook-source";
import { SearchClient, type SearchItem } from "./SearchClient";

export default async function SearchPage() {
  const lectureItems: SearchItem[] = allLessons.map(({ part, ...item }) => {
    const pdfName = item.pdf?.split("/").pop();
    const textbook = pdfName ? textbookCompanions[pdfName] : undefined;
    const textbookTerms = textbook?.points.flatMap((point) => [point.title, point.explanation, point.chapter, point.sections, point.formula ?? ""]) ?? [];
    return { id: `lecture-${part.id}-${item.slug}`, eyebrow: `PDF 课件版 · Part ${part.id}.${item.code}`, href: `/part/${part.id}/${item.slug}`, title: item.title, summary: item.summary, concepts: [...item.concepts, ...textbookTerms] };
  });
  const chapterItems: SearchItem[] = await Promise.all(textbookChapters.map(async (chapter) => ({
    id: `book-${chapter.number}`, eyebrow: `教材版 · 第 ${chapter.number} 章`, href: `/book/${chapter.number}`, title: chapter.title, summary: chapter.description,
    concepts: [await readTextbookFile(chapter.file)],
  })));
  const supplementItems: SearchItem[] = await Promise.all(textbookSupplements.map(async (item) => ({
    id: `supplement-${item.slug}`, eyebrow: "教材版 · 补充专题", href: `/book/supplement/${item.slug}`, title: item.title, summary: "教材补充推导与延伸笔记。",
    concepts: [await readTextbookFile(item.file)],
  })));
  return <SiteShell><main><SearchClient items={[...chapterItems, ...supplementItems, ...lectureItems]} /></main></SiteShell>;
}
