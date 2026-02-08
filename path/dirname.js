// Copyright 2018-2026 the Deno authors. MIT license.
// This module is browser compatible.
import { isWindows } from "../internal/os.js";
import { dirname as posixDirname } from "./posix/dirname.js";
import { dirname as windowsDirname } from "./windows/dirname.js";
/**
 * Return the directory path of a path.
 *
 * @example Usage
 * ```ts
 * import { dirname } from "dirname.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * if (Deno.build.os === "windows") {
 *   assertEquals(dirname("C:\\home\\user\\Documents\\image.png"), "C:\\home\\user\\Documents");
 *   assertEquals(dirname(new URL("file:///C:/home/user/Documents/image.png")), "C:\\home\\user\\Documents");
 * } else {
 *   assertEquals(dirname("/home/user/Documents/image.png"), "/home/user/Documents");
 *   assertEquals(dirname(new URL("file:///home/user/Documents/image.png")), "/home/user/Documents");
 * }
 * ```
 *
 * @param path Path to extract the directory from.
 * @returns The directory path.
 */
export function dirname(path) {
  return isWindows ? windowsDirname(path) : posixDirname(path);
}
