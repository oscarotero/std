// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns a random element from the given iterable.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @typeParam T The type of the elements in the iterable.
 *
 * @param array The iterable to sample from.
 *
 * @returns A random element from the given iterable, or `undefined` if the iterable has no elements.
 *
 * @example Basic usage
 * ```ts
 * import { sample } from "unstable_sample.js";
 * import { assertArrayIncludes } from "../assert/mod.js";
 *
 * const numbers = [1, 2, 3, 4];
 * const random = sample(numbers);
 *
 * assertArrayIncludes(numbers, [random]);
 * ```
 */
export function sample(iterable) {
  let array;
  if (Array.isArray(iterable)) {
    array = iterable;
  } else {
    array = Array.from(iterable);
  }
  const length = array.length;
  if (length === 0) {
    return undefined;
  }
  const randomIndex = Math.floor(Math.random() * length);
  return array[randomIndex];
}
