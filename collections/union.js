// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Returns all distinct elements that appear in any of the given arrays.
 *
 * @typeParam T The type of the array elements.
 *
 * @param arrays The arrays to get the union of.
 *
 * @returns A new array containing all distinct elements from the given arrays.
 *
 * @example Basic usage
 * ```ts
 * import { union } from "union.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const soupIngredients = ["Pepper", "Carrots", "Leek"];
 * const saladIngredients = ["Carrots", "Radicchio", "Pepper"];
 *
 * const shoppingList = union(soupIngredients, saladIngredients);
 *
 * assertEquals(shoppingList, ["Pepper", "Carrots", "Leek", "Radicchio"]);
 * ```
 */
export function union(...arrays) {
  const set = new Set();
  for (const array of arrays) {
    for (const element of array) {
      set.add(element);
    }
  }
  return Array.from(set);
}
