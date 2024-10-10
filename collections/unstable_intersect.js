// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns all distinct elements that appear at least once in each of the given
 * iterables.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @typeParam T The type of the elements in the input iterables.
 *
 * @param iterables The iterables to intersect.
 *
 * @returns An array of distinct elements that appear at least once in each of
 * the given iterables.
 *
 * @example Basic usage
 * ```ts
 * import { intersect } from "unstable_intersect.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const lisaInterests = ["Cooking", "Music", "Hiking"];
 * const kimInterests = ["Music", "Tennis", "Cooking"];
 * const commonInterests = intersect(lisaInterests, kimInterests);
 *
 * assertEquals(commonInterests, ["Cooking", "Music"]);
 * ```
 */
export function intersect(...iterables) {
  const [iterable, ...otherIterables] = iterables;
  let set = new Set(iterable);
  if (set.size === 0) {
    return [];
  }
  for (const iterable of otherIterables) {
    set = set.intersection(new Set(iterable));
    if (set.size === 0) {
      return [];
    }
  }
  return [...set];
}
