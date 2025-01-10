// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { AssertionError } from "./assertion_error.js";
/**
 * Forcefully throws a failed assertion.
 *
 * @example Usage
 * ```ts ignore
 * import { fail } from "mod.js";
 *
 * fail("Deliberately failed!"); // Throws
 * ```
 *
 * @param msg Optional message to include in the error.
 * @returns Never returns, always throws.
 */
export function fail(msg) {
  const msgSuffix = msg ? `: ${msg}` : ".";
  throw new AssertionError(`Failed assertion${msgSuffix}`);
}
