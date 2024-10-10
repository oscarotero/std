// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns all elements in the given array after the last element that does not
 * match the given predicate.
 *
 * @typeParam T The type of the array elements.
 *
 * @param array The array to take elements from.
 * @param predicate The predicate function to determine if an element should be
 * included.
 *
 * @returns A new array containing all elements after the last element that does
 * not match the predicate.
 *
 * @example Basic usage
 * ```ts
 * import { takeLastWhile } from "take_last_while.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const numbers = [1, 2, 3, 4, 5, 6];
 *
 * const result = takeLastWhile(numbers, (number) => number > 4);
 *
 * assertEquals(result, [5, 6]);
 * ```
 */
export function takeLastWhile(array, predicate) {
  let offset = array.length;
  while (0 < offset && predicate(array[offset - 1])) {
    offset--;
  }
  return array.slice(offset, array.length);
}
