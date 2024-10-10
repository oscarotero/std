// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns a tuple of two records with the first one containing all entries of
 * the given record that match the given predicate and the second one containing
 * all that do not.
 *
 * @typeParam T The type of the values in the record.
 *
 * @param record The record to partition.
 * @param predicate The predicate function to determine which entries go where.
 *
 * @returns A tuple containing two records, the first one containing all entries
 * that match the predicate and the second one containing all that do not.
 *
 * @example Basic usage
 * ```ts
 * import { partitionEntries } from "partition_entries.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const menu = {
 *   Salad: 11,
 *   Soup: 8,
 *   Pasta: 13,
 * };
 * const myOptions = partitionEntries(
 *   menu,
 *   ([item, price]) => item !== "Pasta" && price < 10,
 * );
 *
 * assertEquals(
 *   myOptions,
 *   [
 *     { Soup: 8 },
 *     { Salad: 11, Pasta: 13 },
 *   ],
 * );
 * ```
 */
export function partitionEntries(record, predicate) {
  const match = {};
  const rest = {};
  const entries = Object.entries(record);
  for (const [key, value] of entries) {
    if (predicate([key, value])) {
      match[key] = value;
    } else {
      rest[key] = value;
    }
  }
  return [match, rest];
}
