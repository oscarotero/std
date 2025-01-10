// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.js";
import { normalize as posixNormalize } from "./posix/normalize.js";
import { normalize as windowsNormalize } from "./windows/normalize.js";
/**
 * Normalize the path, resolving `'..'` and `'.'` segments.
 *
 * Note: Resolving these segments does not necessarily mean that all will be
 * eliminated. A `'..'` at the top-level will be preserved, and an empty path is
 * canonically `'.'`.
 *
 * @example Usage
 * ```ts
 * import { normalize } from "normalize.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * if (Deno.build.os === "windows") {
 *   assertEquals(normalize("C:\\foo\\bar\\..\\baz\\quux"), "C:\\foo\\baz\\quux");
 * } else {
 *   assertEquals(normalize("/foo/bar/../baz/quux"), "/foo/baz/quux");
 * }
 * ```
 *
 * Note: If you are working with file URLs,
 * use the new version of `normalize` from `@std/path/unstable-normalize`.
 *
 * @param path Path to be normalized
 * @returns The normalized path.
 */
export function normalize(path) {
  return isWindows ? windowsNormalize(path) : posixNormalize(path);
}
