// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { extractAndParse } from "./_shared.js";
import { parse } from "../yaml/parse.js";
import { EXTRACT_YAML_REGEXP } from "./_formats.js";
/**
 * Extracts and parses {@link https://yaml.org | YAML} from the metadata of
 * front matter content.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @example Extract YAML front matter
 * ```ts
 * import { extract } from "../front-matter/unstable_yaml.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const output = `---yaml
 * date: 2022-01-01
 * ---
 * Hello, world!`;
 * const result = extract(output, { schema: "json" });
 *
 * assertEquals(result, {
 *   frontMatter: "date: 2022-01-01",
 *   body: "Hello, world!",
 *   attrs: { date: "2022-01-01" },
 * });
 * ```
 *
 * @typeParam T The type of the parsed front matter.
 * @param text The text to extract YAML front matter from.
 * @param options The options to pass to `@std/yaml/parse`.
 * @returns The extracted YAML front matter and body content.
 */
export function extract(text, options) {
  return extractAndParse(text, EXTRACT_YAML_REGEXP, (s) => parse(s, options));
}
