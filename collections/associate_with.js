// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Associates each string element of an array with a value returned by a selector
 * function.
 *
 * If any of two pairs would have the same value, the latest one will be used
 * (overriding the ones before it).
 *
 * @typeParam T The type of the values returned by the selector function.
 *
 * @param array The array of elements to associate with values.
 * @param selector The selector function that returns a value for each element.
 *
 * @returns An object where each element of the array is associated with a value
 * returned by the selector function.
 *
 * @example Basic usage
 * ```ts
 * import { associateWith } from "associate_with.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const names = ["Kim", "Lara", "Jonathan"];
 *
 * const namesToLength = associateWith(names, (person) => person.length);
 *
 * assertEquals(namesToLength, {
 *   "Kim": 3,
 *   "Lara": 4,
 *   "Jonathan": 8,
 * });
 * ```
 */
export function associateWith(array, selector) {
  const result = {};
  for (const element of array) {
    result[element] = selector(element);
  }
  return result;
}
