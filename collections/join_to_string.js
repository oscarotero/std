// Copyright 2018-2026 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Transforms the elements in the given array to strings using the given
 * selector. Joins the produced strings into one using the given `separator`
 * and applying the given `prefix` and `suffix` to the whole string afterwards.
 *
 * If the array could be huge, you can specify a non-negative value of `limit`,
 * in which case only the first `limit` elements will be appended, followed by
 * the `truncated` string.
 *
 * @typeParam T The type of the elements in the input array.
 *
 * @param array The array to join elements from.
 * @param selector The function to transform elements to strings.
 * @param options The options to configure the joining.
 *
 * @returns The resulting string.
 *
 * @example Usage with options
 * ```ts
 * import { joinToString } from "join_to_string.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const users = [
 *   { name: "Kim" },
 *   { name: "Anna" },
 *   { name: "Tim" },
 * ];
 *
 * const message = joinToString(users, (user) => user.name, {
 *   suffix: " are winners",
 *   prefix: "result: ",
 *   separator: " and ",
 *   limit: 1,
 *   truncated: "others",
 * });
 *
 * assertEquals(message, "result: Kim and others are winners");
 * ```
 */
export function joinToString(array, selector, options = {}) {
  const {
    separator = ",",
    prefix = "",
    suffix = "",
    limit = -1,
    truncated = "...",
  } = options;
  let result = "";
  let index = 0;
  for (const el of array) {
    if (index > 0) {
      result += separator;
    }
    if (limit >= 0 && index >= limit) {
      result += truncated;
      break;
    }
    result += selector(el);
    index++;
  }
  return prefix + result + suffix;
}
