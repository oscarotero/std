// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns a new array, containing all elements in the given array transformed
 * using the given transformer, except the ones that were transformed to `null`
 * or `undefined`.
 *
 * @typeParam T The type of the elements in the input array.
 * @typeParam O The type of the elements in the output array.
 *
 * @param array The array to map elements from.
 * @param transformer The function to transform each element.
 *
 * @returns A new array with all elements transformed by the given transformer,
 * except the ones that were transformed to `null` or `undefined`.
 *
 * @example Basic usage
 * ```ts
 * import { mapNotNullish } from "map_not_nullish.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const people = [
 *   { middleName: null },
 *   { middleName: "William" },
 *   { middleName: undefined },
 *   { middleName: "Martha" },
 * ];
 * const foundMiddleNames = mapNotNullish(people, (people) => people.middleName);
 *
 * assertEquals(foundMiddleNames, ["William", "Martha"]);
 * ```
 */
export function mapNotNullish(array, transformer) {
  const result = [];
  for (const element of array) {
    const transformedElement = transformer(element);
    if (transformedElement !== undefined && transformedElement !== null) {
      result.push(transformedElement);
    }
  }
  return result;
}
