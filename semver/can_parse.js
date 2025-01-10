// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { parse } from "./parse.js";
/**
 * Returns true if the string can be parsed as SemVer.
 *
 * @example Usage
 * ```ts
 * import { canParse } from "can_parse.js";
 * import { assert, assertFalse } from "../assert/mod.js";
 *
 * assert(canParse("1.2.3"));
 * assertFalse(canParse("invalid"));
 * ```
 *
 * @param value The version string to check
 * @returns `true` if the string can be parsed as SemVer, `false` otherwise
 */
export function canParse(value) {
  try {
    parse(value);
    return true;
  } catch {
    return false;
  }
}
