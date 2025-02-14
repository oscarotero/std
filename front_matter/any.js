// Copyright 2018-2025 the Deno authors. MIT license.
import { recognize } from "./_shared.js";
import { extract as extractToml } from "./toml.js";
import { extract as extractYaml } from "./yaml.js";
import { extract as extractJson } from "./json.js";
import { EXTRACT_REGEXP_MAP } from "./_formats.js";
/**
 * Extracts and parses {@link https://yaml.org | YAML}, {@link https://toml.io |
 * TOML}, or {@link https://www.json.org/ | JSON} from the metadata of front
 * matter content, depending on the format.
 *
 * @example
 * ```ts
 * import { extract } from "../front-matter/any.js";
 *
 * const output = `---json
 * {
 *   "title": "Three dashes marks the spot"
 * }
 * ---
 * Hello, world!`;
 * const result = extract(output);
 *
 * result.frontMatter; // '{\n "title": "Three dashes marks the spot"\n}'
 * result.body; // "Hello, world!"
 * result.attrs; // { title: "Three dashes marks the spot" }
 * ```
 *
 * @typeParam T The type of the parsed front matter.
 * @param text The text to extract front matter from.
 * @returns The extracted front matter and body content.
 */
export function extract(text) {
  const formats = [...EXTRACT_REGEXP_MAP.keys()];
  const format = recognize(text, formats);
  switch (format) {
    case "yaml":
      return extractYaml(text);
    case "toml":
      return extractToml(text);
    case "json":
      return extractJson(text);
  }
}
