// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

import { isWindows } from "./_os.ts";
import { dirname as posixUnstableDirname } from "./posix/unstable_dirname.ts";
import { dirname as windowsUnstableDirname } from "./windows/unstable_dirname.ts";

/**
 * Return the directory path of a file URL.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @example Usage
 * ```ts
 * import { dirname } from "unstable_dirname.ts";
 * import { assertEquals } from "../assert/mod.ts";
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
export function dirname(path: string | URL): string {
  return isWindows ? windowsUnstableDirname(path) : posixUnstableDirname(path);
}
