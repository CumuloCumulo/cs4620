import { readFile } from "node:fs/promises";
import path from "node:path";

export async function readTextbookFile(file: string) {
  return readFile(path.join(process.cwd(), "content", "textbook", file), "utf8");
}
