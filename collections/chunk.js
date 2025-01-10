// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Splits the given array into chunks of the given size and returns them.
 *
 * @typeParam T Type of the elements in the input array.
 *
 * @param array The array to split into chunks.
 * @param size The size of the chunks. This must be a positive integer.
 *
 * @returns An array of chunks of the given size.
 *
 * @example Basic usage
 * ```ts
 * import { chunk } from "chunk.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const words = [
 *   "lorem",
 *   "ipsum",
 *   "dolor",
 *   "sit",
 *   "amet",
 *   "consetetur",
 *   "sadipscing",
 * ];
 * const chunks = chunk(words, 3);
 *
 * assertEquals(
 *   chunks,
 *   [
 *     ["lorem", "ipsum", "dolor"],
 *     ["sit", "amet", "consetetur"],
 *     ["sadipscing"],
 *   ],
 * );
 * ```
 */
export function chunk(array, size) {
  if (size <= 0 || !Number.isInteger(size)) {
    throw new RangeError(
      `Expected size to be an integer greater than 0 but found ${size}`,
    );
  }
  const result = [];
  let index = 0;
  while (index < array.length) {
    result.push(array.slice(index, index + size));
    index += size;
  }
  return result;
}
