// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { minOf } from "./min_of.js";
/**
 * Builds N-tuples of elements from the given N arrays with matching indices,
 * stopping when the smallest array's end is reached.
 *
 * @typeParam T the type of the tuples produced by this function.
 *
 * @param arrays The arrays to zip.
 *
 * @returns A new array containing N-tuples of elements from the given arrays.
 *
 * @example Basic usage
 * ```ts
 * import { zip } from "zip.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const numbers = [1, 2, 3, 4];
 * const letters = ["a", "b", "c", "d"];
 * const pairs = zip(numbers, letters);
 *
 * assertEquals(
 *   pairs,
 *   [
 *     [1, "a"],
 *     [2, "b"],
 *     [3, "c"],
 *     [4, "d"],
 *   ],
 * );
 * ```
 */
export function zip(...arrays) {
  const minLength = minOf(arrays, (element) => element.length) ?? 0;
  const result = new Array(minLength);
  for (let i = 0; i < minLength; i += 1) {
    const arr = arrays.map((it) => it[i]);
    result[i] = arr;
  }
  return result;
}