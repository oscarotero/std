// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Produces a random number between the inclusive `lower` and `upper` bounds.
 */
function randomInteger(lower, upper) {
  return lower + Math.floor(Math.random() * (upper - lower + 1));
}
/**
 * Returns a random element from the given array.
 *
 * @typeParam T The type of the elements in the array.
 * @typeParam O The type of the accumulator.
 *
 * @param array The array to sample from.
 *
 * @returns A random element from the given array, or `undefined` if the array
 * is empty.
 *
 * @example Basic usage
 * ```ts
 * import { sample } from "sample.js";
 * import { assertArrayIncludes } from "../assert/mod.js";
 *
 * const numbers = [1, 2, 3, 4];
 * const random = sample(numbers);
 *
 * assertArrayIncludes(numbers, [random]);
 * ```
 */
export function sample(array) {
  const length = array.length;
  return length ? array[randomInteger(0, length - 1)] : undefined;
}
