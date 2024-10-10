// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { extname as stableExtname } from "./extname.js";
import { fromFileUrl } from "./from_file_url.js";
/**
 * Return the extension of the `path` with leading period.
 *
 * Note: Hashes and query parameters are ignore when constructing a URL.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @example Usage
 *
 * ```ts
 * import { extname } from "unstable_extname.js";
 * import { assertEquals } from "../../assert/mod.js";
 *
 * assertEquals(extname("/home/user/Documents/file.ts"), ".ts");
 * assertEquals(extname("/home/user/Documents/"), "");
 * assertEquals(extname("/home/user/Documents/image.png"), ".png");
 * assertEquals(extname(new URL("file:///home/user/Documents/file.ts")), ".ts");
 * assertEquals(extname(new URL("file:///home/user/Documents/file.ts?a=b")), ".ts");
 * assertEquals(extname(new URL("file:///home/user/Documents/file.ts#header")), ".ts");
 * ```
 *
 * @param path The path to get the extension from.
 * @returns The extension (ex. for `file.ts` returns `.ts`).
 */
export function extname(path) {
  if (path instanceof URL) {
    path = fromFileUrl(path);
  }
  return stableExtname(path);
}
