// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.js";
import { normalize as posixUnstableNormalize } from "./posix/unstable_normalize.js";
import { normalize as windowsUnstableNormalize } from "./windows/unstable_normalize.js";
/**
 * Normalize the path, resolving `'..'` and `'.'` segments.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * Note: Resolving these segments does not necessarily mean that all will be
 * eliminated. A `'..'` at the top-level will be preserved, and an empty path is
 * canonically `'.'`.
 *
 * @example Usage
 * ```ts
 * import { normalize } from "unstable_normalize.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * if (Deno.build.os === "windows") {
 *   assertEquals(normalize("C:\\foo\\bar\\..\\baz\\quux"), "C:\\foo\\baz\\quux");
 *   assertEquals(normalize(new URL("file:///C:/foo/bar/../baz/quux")), "C:\\foo\\baz\\quux");
 * } else {
 *   assertEquals(normalize("/foo/bar/../baz/quux"), "/foo/baz/quux");
 *   assertEquals(normalize(new URL("file:///foo/bar/../baz/quux")), "/foo/baz/quux");
 * }
 * ```
 *
 * @param path Path to be normalized. Path can be a string or a file URL object.
 * @returns The normalized path.
 */
export function normalize(path) {
  return isWindows
    ? windowsUnstableNormalize(path)
    : posixUnstableNormalize(path);
}
