// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Applies the given selector to elements in the given array until a value is
 * produced that is neither `null` nor `undefined` and returns that value.
 * Returns `undefined` if no such value is produced.
 *
 * @typeParam T The type of the elements in the input array.
 * @typeParam O The type of the value produced by the selector function.
 *
 * @param array The array to select a value from.
 * @param selector The function to extract a value from an element.
 *
 * @returns The first non-`null` and non-`undefined` value produced by the
 * selector function, or `undefined` if no such value is produced.
 *
 * @example Basic usage
 * ```ts
 * import { firstNotNullishOf } from "first_not_nullish_of.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const tables = [
 *   { number: 11, order: null },
 *   { number: 12, order: "Soup" },
 *   { number: 13, order: "Salad" },
 * ];
 *
 * const nextOrder = firstNotNullishOf(tables, (table) => table.order);
 *
 * assertEquals(nextOrder, "Soup");
 * ```
 */
export function firstNotNullishOf(array, selector) {
  for (const current of array) {
    const selected = selector(current);
    if (selected !== null && selected !== undefined) {
      return selected;
    }
  }
  return undefined;
}
