// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { splitToWords } from "./_util.js";
/**
 * Converts a string into CONSTANT_CASE (also known as SCREAMING_SNAKE_CASE).
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @example Usage
 * ```ts
 * import { toConstantCase } from "unstable_to_constant_case.js";
 * import { assertEquals } from "../assert/equals.js";
 *
 * assertEquals(toConstantCase("deno is awesome"), "DENO_IS_AWESOME");
 * ```
 *
 * @param input The string that is going to be converted into CONSTANT_CASE
 * @returns The string as CONSTANT_CASE
 */
export function toConstantCase(input) {
  input = input.trim();
  return splitToWords(input).join("_").toLocaleUpperCase();
}
