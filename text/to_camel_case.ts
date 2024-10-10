// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

import { capitalizeWord, splitToWords } from "./_util.ts";

/**
 * Converts a string into camelCase.
 *
 * @example Usage
 * ```ts
 * import { toCamelCase } from "to_camel_case.ts";
 * import { assertEquals } from "../assert/mod.ts";
 *
 * assertEquals(toCamelCase("deno is awesome"),"denoIsAwesome");
 * ```
 *
 * @param input The string that is going to be converted into camelCase
 * @returns The string as camelCase
 */
export function toCamelCase(input: string): string {
  input = input.trim();
  const [first = "", ...rest] = splitToWords(input);
  return [first.toLocaleLowerCase(), ...rest.map(capitalizeWord)].join("");
}
