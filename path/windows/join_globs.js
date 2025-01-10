// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { join } from "./join.js";
import { SEPARATOR } from "./constants.js";
import { normalizeGlob } from "./normalize_glob.js";
/**
 * Like join(), but doesn't collapse "**\/.." when `globstar` is true.
 *
 * @example Usage
 *
 * ```ts
 * import { joinGlobs } from "join_globs.js";
 * import { assertEquals } from "../../assert/mod.js";
 *
 * const joined = joinGlobs(["foo", "**", "bar"], { globstar: true });
 * assertEquals(joined, "foo\\**\\bar");
 * ```
 *
 * @param globs The globs to join.
 * @param options The options for glob pattern.
 * @returns The joined glob pattern.
 */
export function joinGlobs(globs, options = {}) {
  const { globstar = false } = options;
  if (!globstar || globs.length === 0) {
    return join(...globs);
  }
  let joined;
  for (const glob of globs) {
    const path = glob;
    if (path.length > 0) {
      if (!joined) {
        joined = path;
      } else {
        joined += `${SEPARATOR}${path}`;
      }
    }
  }
  if (!joined) {
    return ".";
  }
  return normalizeGlob(joined, { globstar });
}
