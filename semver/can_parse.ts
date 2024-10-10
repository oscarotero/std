// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { parse } from "./parse.ts";

/**
 * Returns true if the string can be parsed as SemVer.
 *
 * @example Usage
 * ```ts
 * import { canParse } from "can_parse.ts";
 * import { assert, assertFalse } from "../assert/mod.ts";
 *
 * assert(canParse("1.2.3"));
 * assertFalse(canParse("invalid"));
 * ```
 *
 * @param value The version string to check
 * @returns `true` if the string can be parsed as SemVer, `false` otherwise
 */
export function canParse(value: string): boolean {
  try {
    parse(value);
    return true;
  } catch {
    return false;
  }
}