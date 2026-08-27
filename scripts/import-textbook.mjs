import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "tmp", "crawl", "fundamentals-graphics-cn", "repo");
const contentTarget = path.join(root, "content", "textbook");
const assetTarget = path.join(root, "public", "textbook", "pic");

await rm(contentTarget, { recursive: true, force: true });
await rm(assetTarget, { recursive: true, force: true });
await mkdir(contentTarget, { recursive: true });
await mkdir(path.dirname(assetTarget), { recursive: true });

const files = (await readdir(source)).filter((file) => file.endsWith(".md"));
for (const file of files) {
  const text = await readFile(path.join(source, file), "utf8");
  await writeFile(path.join(contentTarget, file), text.normalize("NFC"));
}
await cp(path.join(source, "pic"), assetTarget, { recursive: true });

const assets = await readdir(assetTarget, { recursive: true });
console.log(`Imported ${files.length} Markdown files and ${assets.length} textbook assets.`);
