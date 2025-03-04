// Copyright 2018-2025 the Deno authors. MIT license.
import { extractFrontMatter } from "./_shared.js";
import { EXTRACT_JSON_REGEXP } from "./_formats.js";
/**
 * Extracts and parses {@link https://www.json.org/ | JSON } from the metadata
 * of front matter content.
 *
 * @example Extract JSON front matter
 * ```ts
 * import { extract } from "../front-matter/json.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const output = `---json
 * { "title": "Three dashes marks the spot" }
 * ---
 * Hello, world!`;
 * const result = extract(output);
 *
 * assertEquals(result, {
 *   frontMatter: '{ "title": "Three dashes marks the spot" }',
 *   body: "Hello, world!",
 *   attrs: { title: "Three dashes marks the spot" },
 * });
 * ```
 *
 * @typeParam T The type of the parsed front matter.
 * @param text The text to extract JSON front matter from.
 * @returns The extracted JSON front matter and body content.
 */
export function extract(text) {
  const { frontMatter, body } = extractFrontMatter(text, EXTRACT_JSON_REGEXP);
  const attrs = JSON.parse(frontMatter);
  return { frontMatter, body, attrs };
}
