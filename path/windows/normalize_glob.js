// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { normalize } from "./normalize.js";
import { SEPARATOR_PATTERN } from "./constants.js";
/**
 * Like normalize(), but doesn't collapse "**\/.." when `globstar` is true.
 *
 * @example Usage
 * ```ts
 * import { normalizeGlob } from "normalize_glob.js";
 * import { assertEquals } from "../../assert/mod.js";
 *
 * const normalized = normalizeGlob("**\\foo\\..\\bar", { globstar: true });
 * assertEquals(normalized, "**\\bar");
 * ```
 *
 * @param glob The glob pattern to normalize.
 * @param options The options for glob pattern.
 * @returns The normalized glob pattern.
 */
export function normalizeGlob(glob, options = {}) {
  const { globstar = false } = options;
  if (glob.match(/\0/g)) {
    throw new Error(`Glob contains invalid characters: "${glob}"`);
  }
  if (!globstar) {
    return normalize(glob);
  }
  const s = SEPARATOR_PATTERN.source;
  const badParentPattern = new RegExp(
    `(?<=(${s}|^)\\*\\*${s})\\.\\.(?=${s}|$)`,
    "g",
  );
  return normalize(glob.replace(badParentPattern, "\0")).replace(/\0/g, "..");
}
