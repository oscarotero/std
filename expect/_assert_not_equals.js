// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This file is copied from `std/assert`.
import { AssertionError } from "../assert/assertion_error.js";
import { buildNotEqualErrorMessage } from "./_build_message.js";
import { equal } from "./_equal.js";
/**
 * Make an assertion that `actual` and `expected` are not equal, deeply.
 * If not then throw.
 *
 * Type parameter can be specified to ensure values under comparison have the same type.
 *
 * @example
 * ```ts ignore
 * import { assertNotEquals } from "../assert/mod.js";
 *
 * assertNotEquals(1, 2); // Doesn't throw
 * assertNotEquals(1, 1); // Throws
 * ```
 */
export function assertNotEquals(actual, expected, options = {}) {
  if (!equal(actual, expected, options)) {
    return;
  }
  const message = buildNotEqualErrorMessage(actual, expected, options ?? {});
  throw new AssertionError(message);
}
