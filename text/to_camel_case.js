// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { capitalizeWord, splitToWords } from "./_util.js";
/**
 * Converts a string into camelCase.
 *
 * @example Usage
 * ```ts
 * import { toCamelCase } from "to_camel_case.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * assertEquals(toCamelCase("deno is awesome"),"denoIsAwesome");
 * ```
 *
 * @param input The string that is going to be converted into camelCase
 * @returns The string as camelCase
 */
export function toCamelCase(input) {
  input = input.trim();
  const [first = "", ...rest] = splitToWords(input);
  return [first.toLowerCase(), ...rest.map(capitalizeWord)].join("");
}
