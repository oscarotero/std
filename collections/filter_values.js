// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Returns a new record with all entries of the given record except the ones
 * that have a value that does not match the given predicate.
 *
 * @typeParam T The type of the values in the input record.
 *
 * @param record The record to filter values from.
 * @param predicate The function to test each value for a condition.
 *
 * @returns A new record with all entries that have a value that matches the
 * given predicate.
 *
 * @example Basic usage
 * ```ts
 * import { filterValues } from "filter_values.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const people = {
 *   Arnold: 37,
 *   Sarah: 7,
 *   Kim: 23,
 * };
 * const adults = filterValues(people, (person) => person >= 18);
 *
 * assertEquals(
 *   adults,
 *   {
 *     Arnold: 37,
 *     Kim: 23,
 *   },
 * );
 * ```
 */
export function filterValues(record, predicate) {
  const result = {};
  const entries = Object.entries(record);
  for (const [key, value] of entries) {
    if (predicate(value)) {
      result[key] = value;
    }
  }
  return result;
}
