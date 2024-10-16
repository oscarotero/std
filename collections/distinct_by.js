// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns all elements in the given array that produce a distinct value using
 * the given selector, preserving order by first occurrence.
 *
 * @typeParam T The type of the elements in the input array.
 * @typeParam D The type of the values produced by the selector function.
 *
 * @param array The array to filter for distinct elements.
 * @param selector The function to extract the value to compare for
 * distinctness.
 *
 * @returns An array of distinct elements in the input array.
 *
 * @example Basic usage
 * ```ts
 * import { distinctBy } from "distinct_by.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const names = ["Anna", "Kim", "Arnold", "Kate"];
 * const exampleNamesByFirstLetter = distinctBy(names, (name) => name.charAt(0));
 *
 * assertEquals(exampleNamesByFirstLetter, ["Anna", "Kim"]);
 * ```
 */
export function distinctBy(array, selector) {
  const selectedValues = new Set();
  const result = [];
  for (const element of array) {
    const selected = selector(element);
    if (!selectedValues.has(selected)) {
      selectedValues.add(selected);
      result.push(element);
    }
  }
  return result;
}
