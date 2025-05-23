// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Returns a new record with all entries of the given record except the ones
 * that do not match the given predicate.
 *
 * @typeParam T The type of the values in the input record.
 *
 * @param record The record to filter entries from.
 * @param predicate The function to test each entry for a condition.
 *
 * @returns A new record with all entries that match the given predicate.
 *
 * @example Basic usage
 * ```ts
 * import { filterEntries } from "filter_entries.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const menu = {
 *   Salad: 11,
 *   Soup: 8,
 *   Pasta: 13,
 * };
 *
 * const myOptions = filterEntries(
 *   menu,
 *   ([item, price]) => item !== "Pasta" && price < 10,
 * );
 *
 * assertEquals(myOptions, { Soup: 8 });
 * ```
 */
export function filterEntries(record, predicate) {
  const result = {};
  const entries = Object.entries(record);
  for (const [key, value] of entries) {
    if (predicate([key, value])) {
      result[key] = value;
    }
  }
  return result;
}
