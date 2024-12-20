// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns all distinct elements in the given array, preserving order by first
 * occurrence.
 *
 * @typeParam T The type of the elements in the input array.
 *
 * @param array The array to filter for distinct elements.
 *
 * @returns An array of distinct elements in the input array.
 *
 * @example Basic usage
 * ```ts
 * import { distinct } from "distinct.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const numbers = [3, 2, 5, 2, 5];
 * const distinctNumbers = distinct(numbers);
 *
 * assertEquals(distinctNumbers, [3, 2, 5]);
 * ```
 */
export function distinct(array) {
  const set = new Set(array);
  return Array.from(set);
}
