// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.js";
import { basename as posixUnstableBasename } from "./posix/unstable_basename.js";
import { basename as windowsUnstableBasename } from "./windows/unstable_basename.js";
/**
 * Return the last portion of a path.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * The trailing directory separators are ignored, and optional suffix is
 * removed.
 *
 * @example Usage
 * ```ts
 * import { basename } from "unstable_basename.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * if (Deno.build.os === "windows") {
 *   assertEquals(basename("C:\\user\\Documents\\image.png"), "image.png");
 *   assertEquals(basename(new URL("file:///C:/user/Documents/image.png")), "image.png");
 * } else {
 *   assertEquals(basename("/home/user/Documents/image.png"), "image.png");
 *   assertEquals(basename(new URL("file:///home/user/Documents/image.png")), "image.png");
 * }
 * ```
 *
 * @param path Path to extract the name from.
 * @param suffix Suffix to remove from extracted name.
 *
 * @returns The basename of the path.
 */
export function basename(path, suffix = "") {
  return isWindows
    ? windowsUnstableBasename(path, suffix)
    : posixUnstableBasename(path, suffix);
}
