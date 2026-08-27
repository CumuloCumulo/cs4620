import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = "out";
const htmlFiles = [];
const walk = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.name.endsWith(".html")) htmlFiles.push(target);
  }
};
walk(root);

let references = 0;
const missing = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  for (const match of html.matchAll(/(?:href|src)="(\/cs4620\/[^"]+)"/g)) {
    let url = match[1].split(/[?#]/)[0];
    if (!url || url === "/cs4620/") continue;
    references += 1;
    try { url = decodeURIComponent(url); } catch { /* retain encoded URL */ }
    const relative = url.replace(/^\/cs4620\/?/, "");
    const candidates = [path.join(root, relative), path.join(root, relative, "index.html"), path.join(root, `${relative}.html`)];
    if (!candidates.some(existsSync)) missing.push(`${file} -> ${match[1]}`);
  }
}

console.log(JSON.stringify({ htmlPages: htmlFiles.length, internalReferences: references, missing: missing.length, sample: missing.slice(0, 20) }, null, 2));
if (missing.length) process.exitCode = 1;
