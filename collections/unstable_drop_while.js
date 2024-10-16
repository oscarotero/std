// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns an array that drops all elements in the given iterable until the
 * first element that does not match the given predicate.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @typeParam T The type of the elements in the input array.
 *
 * @param array The iterable to drop elements from.
 * @param predicate The function to test each element for a condition.
 *
 * @returns An array that drops all elements until the first element that
 * does not match the given predicate.
 *
 * @example Basic usage
 * ```ts
 * import { dropWhile } from "unstable_drop_while.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const numbers = [3, 2, 5, 2, 5];
 * const dropWhileNumbers = dropWhile(numbers, (number) => number !== 2);
 *
 * assertEquals(dropWhileNumbers, [2, 5, 2, 5]);
 * ```
 */
export function dropWhile(iterable, predicate) {
  if (Array.isArray(iterable)) {
    const idx = iterable.findIndex((el) => !predicate(el));
    if (idx === -1) {
      return [];
    }
    return iterable.slice(idx);
  }
  const array = [];
  let found = false;
  for (const item of iterable) {
    if (found || !predicate(item)) {
      found = true;
      array.push(item);
    }
  }
  return array;
}
