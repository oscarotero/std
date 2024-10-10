// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { extractAndParse } from "./_shared.js";
import { parse } from "../yaml/parse.js";
import { EXTRACT_YAML_REGEXP } from "./_formats.js";
/**
 * Extracts and parses {@link https://yaml.org | YAML} from the metadata of
 * front matter content.
 *
 * @example Extract YAML front matter
 * ```ts
 * import { extract } from "../front-matter/yaml.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const output = `---yaml
 * title: Three dashes marks the spot
 * ---
 * Hello, world!`;
 * const result = extract(output);
 *
 * assertEquals(result, {
 *   frontMatter: "title: Three dashes marks the spot",
 *   body: "Hello, world!",
 *   attrs: { title: "Three dashes marks the spot" },
 * });
 * ```
 *
 * Note: If you need to pass the options to the yaml parse,
 * use the new version of this API from `@std/yaml/unstable-yaml`.
 *
 * @typeParam T The type of the parsed front matter.
 * @param text The text to extract YAML front matter from.
 * @returns The extracted YAML front matter and body content.
 */
export function extract(text) {
  return extractAndParse(text, EXTRACT_YAML_REGEXP, (s) => parse(s));
}
