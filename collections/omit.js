// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Creates a new object by excluding the specified keys from the provided object.
 *
 * @typeParam T The type of the object.
 * @typeParam K The type of the keys to omit.
 *
 * @param obj The object to omit keys from.
 * @param keys The keys to omit from the object.
 *
 * @returns A new object with the specified keys omitted.
 *
 * @example Basic usage
 * ```ts
 * import { omit } from "omit.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const obj = { a: 5, b: 6, c: 7, d: 8 };
 * const omitted = omit(obj, ["a", "c"]);
 *
 * assertEquals(omitted, { b: 6, d: 8 });
 * ```
 */
export function omit(obj, keys) {
  const excludes = new Set(keys);
  return Object.fromEntries(
    Object.entries(obj).filter(([k, _]) => !excludes.has(k)),
  );
}
