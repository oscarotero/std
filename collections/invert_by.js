// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Composes a new record with all keys and values inverted.
 *
 * The new record is generated from the result of running each element of the
 * input record through the given transformer function.
 *
 * The corresponding inverted value of each inverted key is an array of keys
 * responsible for generating the inverted value.
 *
 * @typeParam R The type of the input record.
 * @typeParam T The type of the iterator function.
 *
 * @param record The record to invert.
 * @param transformer The function to transform keys.
 *
 * @returns A new record with all keys and values inverted.
 *
 * @example Basic usage
 * ```ts
 * import { invertBy } from "invert_by.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const record = { a: "x", b: "y", c: "z" };
 *
 * assertEquals(
 *   invertBy(record, (key) => String(key).toUpperCase()),
 *   { X: ["a"], Y: ["b"], Z: ["c"] }
 * );
 * ```
 */
export function invertBy(record, transformer) {
  const result = {};
  for (const [key, value] of Object.entries(record)) {
    const mappedKey = transformer(value);
    if (!Object.hasOwn(result, mappedKey)) {
      result[mappedKey] = [key];
    } else {
      result[mappedKey].push(key);
    }
  }
  return result;
}
