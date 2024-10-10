// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { dirname as stableDirname } from "./dirname.js";
import { fromFileUrl } from "./from_file_url.js";
/**
 * Return the directory path of a file URL.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @example Usage
 * ```ts
 * import { dirname } from "unstable_dirname.js";
 * import { assertEquals } from "../../assert/mod.js";
 *
 * assertEquals(dirname("/home/user/Documents/"), "/home/user");
 * assertEquals(dirname("/home/user/Documents/image.png"), "/home/user/Documents");
 * assertEquals(dirname(new URL("file:///home/user/Documents/image.png")), "/home/user/Documents");
 * ```
 *
 * @param path The file url to get the directory from.
 * @returns The directory path.
 */
export function dirname(path) {
  if (path instanceof URL) {
    path = fromFileUrl(path);
  }
  return stableDirname(path);
}
