// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.

/**
 * Applies the given transformer to all keys in the given record's entries and
 * returns a new record containing the transformed entries.
 *
 * If the transformed entries contain the same key multiple times, only the last
 * one will appear in the returned record.
 *
 * @typeParam T The type of the values in the input record.
 *
 * @param record The record to map keys from.
 * @param transformer The function to transform each key.
 *
 * @returns A new record with all keys transformed by the given transformer.
 *
 * @example Basic usage
 * ```ts
 * import { mapKeys } from "map_keys.ts";
 * import { assertEquals } from "../assert/mod.ts";
 *
 * const counts = { a: 5, b: 3, c: 8 };
 *
 * assertEquals(
 *   mapKeys(counts, (key) => key.toUpperCase()),
 *   {
 *     A: 5,
 *     B: 3,
 *     C: 8,
 *   },
 * );
 * ```
 */
export function mapKeys<T>(
  record: Readonly<Record<string, T>>,
  transformer: (key: string) => string,
): Record<string, T> {
  const result: Record<string, T> = {};

  for (const [key, value] of Object.entries(record)) {
    const mappedKey = transformer(key);
    result[mappedKey] = value;
  }

  return result;
}
