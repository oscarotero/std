// Copyright 2018-2025 the Deno authors. MIT license.
import { RECOGNIZE_REGEXP_MAP } from "./_formats.js";
export function extractAndParse(input, extractRegExp, parse) {
  const match = extractRegExp.exec(input);
  if (!match || match.index !== 0) {
    throw new TypeError("Unexpected end of input");
  }
  const frontMatter = match.at(-1)?.replace(/^\s+|\s+$/g, "") ?? "";
  const attrs = parse(frontMatter);
  const body = input.replace(match[0], "");
  return { frontMatter, body, attrs };
}
/**
 * Recognizes the format of the front matter in a string.
 * Supports {@link https://yaml.org | YAML}, {@link https://toml.io | TOML} and
 * {@link https://www.json.org/ | JSON}.
 *
 * @param str String to recognize.
 * @param formats A list of formats to recognize. Defaults to all supported formats.
 */
export function recognize(str, formats) {
  const [firstLine] = str.split(/(\r?\n)/);
  for (const format of formats) {
    if (RECOGNIZE_REGEXP_MAP.get(format)?.test(firstLine)) {
      return format;
    }
  }
  throw new TypeError("Unsupported front matter format");
}
