// Copyright 2018-2025 the Deno authors. MIT license.
import { extractAndParse } from "./_shared.js";
import { parse } from "../toml/parse.js";
import { EXTRACT_TOML_REGEXP } from "./_formats.js";
/**
 * Extracts and parses {@link https://toml.io | TOML} from the metadata of
 * front matter content.
 *
 * @example Extract TOML front matter
 * ```ts
 * import { extract } from "../front-matter/toml.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const output = `---toml
 * title = "Three dashes marks the spot"
 * ---
 * Hello, world!`;
 * const result = extract(output);
 *
 * assertEquals(result, {
 *   frontMatter: 'title = "Three dashes marks the spot"',
 *   body: "Hello, world!",
 *   attrs: { title: "Three dashes marks the spot" },
 * });
 * ```
 *
 * @typeParam T The type of the parsed front matter.
 * @param text The text to extract TOML front matter from.
 * @returns The extracted TOML front matter and body content.
 */
export function extract(text) {
  return extractAndParse(text, EXTRACT_TOML_REGEXP, parse);
}
