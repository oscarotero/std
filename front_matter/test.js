// Copyright 2018-2025 the Deno authors. MIT license.
import { EXTRACT_REGEXP_MAP } from "./_formats.js";
/**
 * Tests if a string has valid front matter.
 * Supports {@link https://yaml.org | YAML}, {@link https://toml.io | TOML} and
 * {@link https://www.json.org/ | JSON}.
 *
 * @param str String to test.
 * @param formats A list of formats to test for. Defaults to all supported formats.
 * @returns `true` if the string has valid front matter, otherwise `false`.
 *
 * @example Test for valid YAML front matter
 * ```ts
 * import { test } from "../front-matter/test.js";
 * import { assert } from "../assert/mod.js";
 *
 * const result = test(
 * `---
 * title: Three dashes marks the spot
 * ---
 * `);
 * assert(result);
 * ```
 *
 * @example Test for valid TOML front matter
 * ```ts
 * import { test } from "../front-matter/test.js";
 * import { assert } from "../assert/mod.js";
 *
 * const result = test(
 * `---toml
 * title = 'Three dashes followed by format marks the spot'
 * ---
 * `);
 * assert(result);
 * ```
 *
 * @example Test for valid JSON front matter
 * ```ts
 * import { test } from "../front-matter/test.js";
 * import { assert } from "../assert/mod.js";
 *
 * const result = test(
 * `---json
 * {"title": "Three dashes followed by format marks the spot"}
 * ---
 * `);
 * assert(result);
 * ```
 *
 * @example JSON front matter is not valid as YAML
 * ```ts
 * import { test } from "../front-matter/test.js";
 * import { assertFalse } from "../assert/mod.js";
 *
 * const result = test(
 * `---json
 * {"title": "Three dashes followed by format marks the spot"}
 * ---
 * `, ["yaml"]);
 * assertFalse(result);
 * ```
 */
export function test(str, formats) {
  if (!formats) {
    formats = [...EXTRACT_REGEXP_MAP.keys()];
  }
  for (const format of formats) {
    const regexp = EXTRACT_REGEXP_MAP.get(format);
    if (!regexp) {
      throw new TypeError(`Unable to test for ${format} front matter format`);
    }
    const match = regexp.exec(str);
    if (match?.index === 0) {
      return true;
    }
  }
  return false;
}
