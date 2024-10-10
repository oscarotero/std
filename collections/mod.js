// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Pure functions for common tasks around collection types like arrays and
 * objects.
 *
 * Inspired by
 * {@link https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/ | Kotlin's Collections}
 * package and {@link https://lodash.com/ | Lodash}.
 *
 * ```ts
 * import { intersect, sample, pick } from "mod.js";
 * import { assertEquals, assertArrayIncludes } from "../assert/mod.js";
 *
 * const lisaInterests = ["Cooking", "Music", "Hiking"];
 * const kimInterests = ["Music", "Tennis", "Cooking"];
 *
 * assertEquals(intersect(lisaInterests, kimInterests), ["Cooking", "Music"]);
 *
 * assertArrayIncludes(lisaInterests, [sample(lisaInterests)]);
 *
 * const cat = { name: "Lulu", age: 3, breed: "Ragdoll" };
 *
 * assertEquals(pick(cat, ["name", "breed"]), { name: "Lulu", breed: "Ragdoll"});
 * ```
 *
 * @module
 */
export * from "./aggregate_groups.js";
export * from "./associate_by.js";
export * from "./associate_with.js";
export * from "./chunk.js";
export * from "./deep_merge.js";
export * from "./distinct.js";
export * from "./distinct_by.js";
export * from "./drop_last_while.js";
export * from "./drop_while.js";
export * from "./filter_entries.js";
export * from "./filter_keys.js";
export * from "./filter_values.js";
export * from "./find_single.js";
export * from "./first_not_nullish_of.js";
export * from "./includes_value.js";
export * from "./intersect.js";
export * from "./invert_by.js";
export * from "./invert.js";
export * from "./join_to_string.js";
export * from "./map_entries.js";
export * from "./map_keys.js";
export * from "./map_not_nullish.js";
export * from "./map_values.js";
export * from "./max_by.js";
export * from "./max_of.js";
export * from "./max_with.js";
export * from "./min_by.js";
export * from "./min_of.js";
export * from "./min_with.js";
export * from "./omit.js";
export * from "./partition.js";
export * from "./partition_entries.js";
export * from "./permutations.js";
export * from "./pick.js";
export * from "./reduce_groups.js";
export * from "./running_reduce.js";
export * from "./sample.js";
export * from "./sliding_windows.js";
export * from "./sort_by.js";
export * from "./sum_of.js";
export * from "./take_last_while.js";
export * from "./take_while.js";
export * from "./union.js";
export * from "./unzip.js";
export * from "./without_all.js";
export * from "./zip.js";
