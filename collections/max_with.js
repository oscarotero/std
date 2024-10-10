// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns the first element having the largest value according to the provided
 * comparator or undefined if there are no elements.
 *
 * The comparator is expected to work exactly like one passed to `Array.sort`,
 * which means that `comparator(a, b)` should return a negative number if
 * `a < b`, a positive number if `a > b` and `0` if `a === b`.
 *
 * @typeParam T The type of the elements in the array.
 *
 * @param array The array to find the maximum element in.
 * @param comparator The function to compare elements.
 *
 * @returns The first element that is the largest value of the given function or
 * undefined if there are no elements.
 *
 * @example Basic usage
 * ```ts
 * import { maxWith } from "max_with.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const people = ["Kim", "Anna", "John", "Arthur"];
 * const largestName = maxWith(people, (a, b) => a.length - b.length);
 *
 * assertEquals(largestName, "Arthur");
 * ```
 */
export function maxWith(array, comparator) {
  let max;
  let isFirst = true;
  for (const current of array) {
    if (isFirst || comparator(current, max) > 0) {
      max = current;
      isFirst = false;
    }
  }
  return max;
}
