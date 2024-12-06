// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

import { splitToWords } from "./_util.ts";

/**
 * Converts a string into kebab-case.
 *
 * @example Usage
 * ```ts
 * import { toKebabCase } from "to_kebab_case.ts";
 * import { assertEquals } from "../assert/mod.ts";
 *
 * assertEquals(toKebabCase("deno is awesome"), "deno-is-awesome");
 * ```
 *
 * @param input The string that is going to be converted into kebab-case
 * @returns The string as kebab-case
 */
export function toKebabCase(input: string): string {
  input = input.trim();
  return splitToWords(input).join("-").toLowerCase();
}
