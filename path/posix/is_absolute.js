// Copyright 2018-2026 the Deno authors. MIT license.
// This module is browser compatible.
import { assertPath } from "../_common/assert_path.js";
import { isPosixPathSeparator } from "./_util.js";
/**
 * Verifies whether provided path is absolute.
 *
 * @example Usage
 * ```ts
 * import { isAbsolute } from "is_absolute.js";
 * import { assert, assertFalse } from "../../assert/mod.js";
 *
 * assert(isAbsolute("/home/user/Documents/"));
 * assertFalse(isAbsolute("home/user/Documents/"));
 * ```
 *
 * @param path The path to verify.
 * @returns Whether the path is absolute.
 */
export function isAbsolute(path) {
  assertPath(path);
  return path.length > 0 && isPosixPathSeparator(path.charCodeAt(0));
}
