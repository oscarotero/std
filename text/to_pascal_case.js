// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { capitalizeWord, splitToWords } from "./_util.js";
/**
 * Converts a string into PascalCase.
 *
 * @example Usage
 * ```ts
 * import { toPascalCase } from "to_pascal_case.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * assertEquals(toPascalCase("deno is awesome"), "DenoIsAwesome");
 * ```
 *
 * @param input The string that is going to be converted into PascalCase
 * @returns The string as PascalCase
 */
export function toPascalCase(input) {
  input = input.trim();
  return splitToWords(input).map(capitalizeWord).join("");
}
