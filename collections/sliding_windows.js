// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Generates sliding views of the given iterable of the given size and returns an
 * array containing all of them.
 *
 * If step is set, each window will start that many elements after the last
 * window's start. (Default: 1)
 *
 * If partial is set, windows will be generated for the last elements of the
 * collection, resulting in some undefined values if size is greater than 1.
 *
 * @typeParam T The type of the array elements.
 *
 * @param iterable The iterable to generate sliding windows from.
 * @param size The size of the sliding windows.
 * @param options The options for generating sliding windows.
 *
 * @returns An array containing all sliding windows of the given size.
 *
 * @example Usage
 * ```ts
 * import { slidingWindows } from "sliding_windows.js";
 * import { assertEquals } from "../assert/mod.js";
 * const numbers = [1, 2, 3, 4, 5];
 *
 * const windows = slidingWindows(numbers, 3);
 * assertEquals(windows, [
 *   [1, 2, 3],
 *   [2, 3, 4],
 *   [3, 4, 5],
 * ]);
 *
 * const windowsWithStep = slidingWindows(numbers, 3, { step: 2 });
 * assertEquals(windowsWithStep, [
 *   [1, 2, 3],
 *   [3, 4, 5],
 * ]);
 *
 * const windowsWithPartial = slidingWindows(numbers, 3, { partial: true });
 * assertEquals(windowsWithPartial, [
 *   [1, 2, 3],
 *   [2, 3, 4],
 *   [3, 4, 5],
 *   [4, 5],
 *   [5],
 * ]);
 * ```
 */
export function slidingWindows(iterable, size, options = {}) {
  const { step = 1, partial = false } = options;
  if (!Number.isInteger(size) || size <= 0) {
    throw new RangeError(
      `Cannot create sliding windows: size must be a positive integer, current value is ${size}`,
    );
  }
  if (!Number.isInteger(step) || step <= 0) {
    throw new RangeError(
      `Cannot create sliding windows: step must be a positive integer, current value is ${step}`,
    );
  }
  const array = Array.isArray(iterable) ? iterable : Array.from(iterable);
  const len = array.length;
  const result = [];
  for (let i = 0; i <= len; i += step) {
    let last = i + size;
    if (last > len) {
      last = len;
    }
    const window = array.slice(i, last);
    if ((partial && window.length) || window.length === size) {
      result.push(window);
    }
  }
  return result;
}
