// Copyright 2018-2026 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Returns an array that drops all elements in the given iterable until the
 * last element that does not match the given predicate.
 *
 * @typeParam T The type of the elements in the input iterable.
 *
 * @param iterable The iterable to drop elements from.
 * @param predicate The function to test each element for a condition.
 *
 * @returns An array that drops all elements until the last element that does
 * not match the given predicate.
 *
 * @example Basic usage
 * ```ts
 * import { dropLastWhile } from "drop_last_while.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const numbers = [11, 42, 55, 20, 33, 44];
 *
 * const notFortyFour = dropLastWhile(numbers, (number) => number > 30);
 *
 * assertEquals(notFortyFour, [11, 42, 55, 20]);
 * ```
 */
export function dropLastWhile(iterable, predicate) {
  const array = Array.isArray(iterable) ? iterable : Array.from(iterable);
  let offset = array.length - 1;
  while (offset >= 0 && predicate(array[offset])) {
    offset--;
  }
  return array.slice(0, offset + 1);
}
