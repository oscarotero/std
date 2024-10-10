// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { compare } from "./compare.js";
/**
 * Greater than comparison for two SemVers.
 *
 * This is equal to `compare(version1, version2) > 0`.
 *
 * @example Usage
 * ```ts
 * import { parse, greaterThan } from "mod.js";
 * import { assert } from "../assert/mod.js";
 *
 * const version1 = parse("1.2.3");
 * const version2 = parse("1.2.4");
 *
 * assert(greaterThan(version2, version1));
 * assert(!greaterThan(version1, version2));
 * assert(!greaterThan(version1, version1));
 * ```
 *
 * @param version1 The first version to compare
 * @param version2 The second version to compare
 * @returns `true` if `version1` is greater than `version2`, `false` otherwise
 */
export function greaterThan(version1, version2) {
  return compare(version1, version2) > 0;
}
