// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { assertArg } from "../_common/normalize.js";
import { normalizeString } from "../_common/normalize_string.js";
import { isPosixPathSeparator } from "./_util.js";
/**
 * Normalize the `path`, resolving `'..'` and `'.'` segments.
 * Note that resolving these segments does not necessarily mean that all will be eliminated.
 * A `'..'` at the top-level will be preserved, and an empty path is canonically `'.'`.
 *
 * @example Usage
 * ```ts
 * import { normalize } from "normalize.js";
 * import { assertEquals } from "../../assert/mod.js";
 *
 * const path = normalize("/foo/bar//baz/asdf/quux/..");
 * assertEquals(path, "/foo/bar/baz/asdf");
 * ```
 *
 * Note: If you are working with file URLs,
 * use the new version of `normalize` from `@std/path/posix/unstable-normalize`.
 *
 * @param path The path to normalize.
 * @returns The normalized path.
 */
export function normalize(path) {
  assertArg(path);
  const isAbsolute = isPosixPathSeparator(path.charCodeAt(0));
  const trailingSeparator = isPosixPathSeparator(
    path.charCodeAt(path.length - 1),
  );
  // Normalize the path
  path = normalizeString(path, !isAbsolute, "/", isPosixPathSeparator);
  if (path.length === 0 && !isAbsolute) {
    path = ".";
  }
  if (path.length > 0 && trailingSeparator) {
    path += "/";
  }
  if (isAbsolute) {
    return `/${path}`;
  }
  return path;
}
