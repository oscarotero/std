// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { parseRange } from "./parse_range.js";
/**
 * Parses the given range string and returns a Range object. If the range string
 * is invalid, `undefined` is returned.
 *
 * @example Usage
 * ```ts
 * import { tryParseRange } from "mod.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * assertEquals(tryParseRange(">=1.2.3 <1.2.4"), [
 *  [
 *    { operator: ">=", major: 1, minor: 2, patch: 3, prerelease: [], build: [] },
 *    { operator: "<", major: 1, minor: 2, patch: 4, prerelease: [], build: [] },
 *  ],
 * ]);
 * ```
 *
 * @param value The range string
 * @returns A Range object if valid otherwise `undefined`
 */
export function tryParseRange(value) {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return parseRange(value);
  } catch {
    return undefined;
  }
}
