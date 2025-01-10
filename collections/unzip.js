// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Builds two separate arrays from the given array of 2-tuples, with the first
 * returned array holding all first tuple elements and the second one holding
 * all the second elements.
 *
 * @typeParam T The type of the first tuple elements.
 * @typeParam U The type of the second tuple elements.
 *
 * @param pairs The array of 2-tuples to unzip.
 *
 * @returns A tuple containing two arrays, the first one holding all first tuple
 * elements and the second one holding all second elements.
 *
 * @example Basic usage
 * ```ts
 * import { unzip } from "unzip.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const parents = [
 *   ["Maria", "Jeff"],
 *   ["Anna", "Kim"],
 *   ["John", "Leroy"],
 * ] as [string, string][];
 *
 * const [moms, dads] = unzip(parents);
 *
 * assertEquals(moms, ["Maria", "Anna", "John"]);
 * assertEquals(dads, ["Jeff", "Kim", "Leroy"]);
 * ```
 */
export function unzip(pairs) {
  const { length } = pairs;
  const result = [
    new Array(length),
    new Array(length),
  ];
  for (let i = 0; i < length; ++i) {
    const pair = pairs[i];
    result[0][i] = pair[0];
    result[1][i] = pair[1];
  }
  return result;
}
