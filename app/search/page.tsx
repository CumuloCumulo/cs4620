import { allLessons } from "../course-data";
import { SiteShell } from "../components/SiteShell";
import { textbookCompanions } from "../textbook-data";
import { SearchClient } from "./SearchClient";

export default function SearchPage() {
  const items = allLessons.map(({ part, ...item }) => {
    const pdfName = item.pdf?.split("/").pop();
    const textbook = pdfName ? textbookCompanions[pdfName] : undefined;
    const textbookTerms = textbook?.points.flatMap((point) => [point.title, point.explanation, point.chapter, point.sections, point.formula ?? ""]) ?? [];
    return { partId: part.id, partTitle: part.title, code: item.code, slug: item.slug, title: item.title, summary: item.summary, concepts: [...item.concepts, ...textbookTerms] };
  });
  return <SiteShell><main><SearchClient items={items} /></main></SiteShell>;
}
