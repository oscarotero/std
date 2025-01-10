// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { format } from "./format.js";
import { isWildcardComparator } from "./_shared.js";
function formatComparator(comparator) {
  const { operator } = comparator;
  return `${operator === undefined ? "" : operator}${
    isWildcardComparator(comparator) ? "*" : format(comparator)
  }`;
}
/**
 * Formats the SemVerrange into a string.
 *
 * @example Usage
 * ```ts
 * import { formatRange, parseRange } from "mod.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const range = parseRange(">=1.2.3 <1.2.4");
 * assertEquals(formatRange(range), ">=1.2.3 <1.2.4");
 * ```
 *
 * @param range The range to format
 * @returns A string representation of the SemVer range
 */
export function formatRange(range) {
  return range.map((c) => c.map((c) => formatComparator(c)).join(" "))
    .join("||");
}
