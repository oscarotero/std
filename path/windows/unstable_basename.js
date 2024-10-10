// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { basename as stableBasename } from "./basename.js";
import { fromFileUrl } from "./from_file_url.js";
/**
 * Return the last portion of a `path`.
 * Trailing directory separators are ignored, and optional suffix is removed.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @example Usage
 * ```ts
 * import { basename } from "unstable_basename.js";
 * import { assertEquals } from "../../assert/mod.js";
 *
 * assertEquals(basename("C:\\user\\Documents\\"), "Documents");
 * assertEquals(basename("C:\\user\\Documents\\image.png"), "image.png");
 * assertEquals(basename("C:\\user\\Documents\\image.png", ".png"), "image");
 * assertEquals(basename(new URL("file:///C:/user/Documents/image.png")), "image.png");
 * assertEquals(basename(new URL("file:///C:/user/Documents/image.png"), ".png"), "image");
 * ```
 *
 * @param path The path to extract the name from.
 * @param suffix The suffix to remove from extracted name.
 * @returns The extracted name.
 */
export function basename(path, suffix = "") {
  path = path instanceof URL ? fromFileUrl(path) : path;
  return stableBasename(path, suffix);
}
