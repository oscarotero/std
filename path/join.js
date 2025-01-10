// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.js";
import { join as posixJoin } from "./posix/join.js";
import { join as windowsJoin } from "./windows/join.js";
/**
 * Joins a sequence of paths, then normalizes the resulting path.
 *
 * @example Usage
 * ```ts
 * import { join } from "join.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * if (Deno.build.os === "windows") {
 *   assertEquals(join("C:\\foo", "bar", "baz\\quux", "garply", ".."), "C:\\foo\\bar\\baz\\quux");
 * } else {
 *   assertEquals(join("/foo", "bar", "baz/quux", "garply", ".."), "/foo/bar/baz/quux");
 * }
 * ```
 *
 * Note: If you are working with file URLs,
 * use the new version of `join` from `@std/path/unstable-join`.
 *
 * @param paths Paths to be joined and normalized.
 * @returns The joined and normalized path.
 */
export function join(...paths) {
  return isWindows ? windowsJoin(...paths) : posixJoin(...paths);
}
