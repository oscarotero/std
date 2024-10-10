// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Utility functions for working with text.
 *
 * ```ts
 * import { toCamelCase, compareSimilarity } from "mod.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * assertEquals(toCamelCase("snake_case"), "snakeCase");
 *
 * const words = ["hi", "help", "hello"];
 *
 * // Words most similar to "hep" will be at the front
 * assertEquals(words.sort(compareSimilarity("hep")), ["help", "hi", "hello"]);
 * ```
 *
 * @module
 */
export * from "./levenshtein_distance.js";
export * from "./closest_string.js";
export * from "./compare_similarity.js";
export * from "./word_similarity_sort.js";
export * from "./to_camel_case.js";
export * from "./to_kebab_case.js";
export * from "./to_pascal_case.js";
export * from "./to_snake_case.js";
