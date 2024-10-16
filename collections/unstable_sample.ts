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
 * import { sample } from "unstable_sample.ts";
 * import { assertArrayIncludes } from "../assert/mod.ts";
 *
 * const numbers = [1, 2, 3, 4];
 * const random = sample(numbers);
 *
 * assertArrayIncludes(numbers, [random]);
 * ```
 */
export function sample<T>(iterable: Iterable<T>): T | undefined {
  let array: readonly T[];
  if (Array.isArray(iterable)) {
    array = iterable;
  } else {
    array = Array.from(iterable);
  }
  const length: number = array.length;
  if (length === 0) {
    return undefined;
  }
  const randomIndex = Math.floor(Math.random() * length);
  return array[randomIndex];
}
