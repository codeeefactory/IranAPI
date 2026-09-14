import { readFile } from "node:fs/promises";

export async function readJsonInput(body?: string, bodyFile?: string): Promise<unknown> {
  if (body !== undefined && bodyFile) throw new Error("Use either --body or --body-file, not both.");
  if (body === undefined && !bodyFile) return undefined;
  const source = bodyFile ? await readFile(bodyFile, "utf8") : body!;
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`Request body must be valid JSON: ${(error as Error).message}`);
  }
}
