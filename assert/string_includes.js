// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { AssertionError } from "./assertion_error.js";
/**
 * Make an assertion that actual includes expected. If not
 * then throw.
 *
 * @example Usage
 * ```ts ignore
 * import { assertStringIncludes } from "mod.js";
 *
 * assertStringIncludes("Hello", "ello"); // Doesn't throw
 * assertStringIncludes("Hello", "world"); // Throws
 * ```
 *
 * @param actual The actual string to check for inclusion.
 * @param expected The expected string to check for inclusion.
 * @param msg The optional message to display if the assertion fails.
 */
export function assertStringIncludes(actual, expected, msg) {
  if (actual.includes(expected)) {
    return;
  }
  const msgSuffix = msg ? `: ${msg}` : ".";
  msg = `Expected actual: "${actual}" to contain: "${expected}"${msgSuffix}`;
  throw new AssertionError(msg);
}
