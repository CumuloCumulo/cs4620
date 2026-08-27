import { marked } from "marked";
import katex from "katex";
import { textbookChapters, textbookSupplements } from "./textbook-manifest";

export type TextbookHeading = { id: string; depth: number; text: string };

const stripMarkdown = (value: string) => value
  .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
  .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
  .replace(/[*_`~]/g, "")
  .trim();

const supplementSlugs = new Map(textbookSupplements.map((item) => [item.file, item.slug]));

function internalMarkdownHref(href: string) {
  let decoded = href;
  try { decoded = decodeURIComponent(href); } catch { /* retain original */ }
  const file = decoded.split("#")[0].replace(/^\.\//, "");
  const hash = decoded.includes("#") ? `#${decoded.split("#").slice(1).join("#")}` : "";
  const chapter = textbookChapters.find((item) => item.file === file);
  if (chapter) return `/book/${chapter.number}${hash}`;
  const supplement = supplementSlugs.get(file);
  if (supplement) return `/book/supplement/${supplement}${hash}`;
  return href;
}

function assetHref(href: string, basePath: string) {
  if (/^(?:https?:|data:|\/)/i.test(href)) return href;
  let decoded = href;
  try { decoded = decodeURIComponent(href); } catch { /* retain original */ }
  const encoded = decoded.split("/").map((part) => encodeURIComponent(part)).join("/");
  return `${basePath}/textbook/${encoded}`;
}

export function renderTextbookMarkdown(source: string) {
  const basePath = process.env.GITHUB_ACTIONS === "true" ? "/cs4620" : "";
  const headings: TextbookHeading[] = [];
  let headingIndex = 0;
  for (const match of source.matchAll(/^(#{2,3})\s+(.+)$/gm)) {
    headings.push({ id: `section-${++headingIndex}`, depth: match[1].length, text: stripMarkdown(match[2]) });
  }

  const math: string[] = [];
  const protectMath = (expression: string, displayMode: boolean) => {
    const html = katex.renderToString(expression.trim(), { displayMode, throwOnError: false, strict: false });
    const index = math.push(html) - 1;
    return displayMode ? `\n\n@@MATH_BLOCK_${index}@@\n\n` : `@@MATH_INLINE_${index}@@`;
  };
  let prepared = source.replace(/\$\$([\s\S]*?)\$\$/g, (_, expression: string) => protectMath(expression, true));
  prepared = prepared.replace(/(?<!\\)\$([^\n$]+?)(?<!\\)\$/g, (_, expression: string) => protectMath(expression, false));

  let renderHeadingIndex = 0;
  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens, depth }) => {
    const text = renderer.parser.parseInline(tokens);
    if (depth < 2 || depth > 3) return `<h${depth}>${text}</h${depth}>`;
    const heading = headings[renderHeadingIndex++];
    return `<h${depth} id="${heading?.id || `section-${renderHeadingIndex}`}">${text}</h${depth}>`;
  };
  renderer.image = ({ href, title, text }) => {
    const src = assetHref(href, basePath);
    const titleAttr = title ? ` title="${title.replaceAll('"', "&quot;")}"` : "";
    return `<figure class="textbook-figure"><img src="${src}" alt="${text.replaceAll('"', "&quot;")}" loading="lazy"${titleAttr}><figcaption>${text || "教材插图"}</figcaption></figure>`;
  };
  renderer.link = ({ href, title, tokens }) => {
    const text = renderer.parser.parseInline(tokens);
    const resolved = /\.md(?:#.*)?$/i.test(href) ? internalMarkdownHref(href) : href;
    const external = /^https?:/i.test(resolved);
    const titleAttr = title ? ` title="${title.replaceAll('"', "&quot;")}"` : "";
    return `<a href="${resolved}"${titleAttr}${external ? ' target="_blank" rel="noreferrer"' : ""}>${text}</a>`;
  };

  let html = marked.parse(prepared, { renderer, gfm: true, breaks: false }) as string;
  math.forEach((value, index) => {
    html = html
      .replaceAll(`<p>@@MATH_BLOCK_${index}@@</p>`, value)
      .replaceAll(`@@MATH_BLOCK_${index}@@`, value)
      .replaceAll(`@@MATH_INLINE_${index}@@`, value);
  });
  html = html.replace(/<blockquote>\s*<p>\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*/gi, '<blockquote class="textbook-callout"><p><strong>$1</strong> ');
  return { html, headings };
}
