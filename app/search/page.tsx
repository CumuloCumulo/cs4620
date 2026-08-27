import { allLessons } from "../course-data";
import { SiteShell } from "../components/SiteShell";
import { SearchClient } from "./SearchClient";

export default function SearchPage() {
  const items = allLessons.map(({ part, ...item }) => ({ partId: part.id, partTitle: part.title, code: item.code, slug: item.slug, title: item.title, summary: item.summary, concepts: item.concepts }));
  return <SiteShell><main><SearchClient items={items} /></main></SiteShell>;
}

