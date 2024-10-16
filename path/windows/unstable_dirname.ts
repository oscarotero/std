// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

import { dirname as stableDirname } from "./dirname.ts";
import { fromFileUrl } from "./from_file_url.ts";

/**
 * Return the directory path of a file URL.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @example Usage
 * ```ts
 * import { dirname } from "unstable_dirname.ts";
 * import { assertEquals } from "../../assert/mod.ts";
 *
 * assertEquals(dirname("C:\\foo\\bar\\baz.ext"), "C:\\foo\\bar");
 * assertEquals(dirname(new URL("file:///C:/foo/bar/baz.ext")), "C:\\foo\\bar");
 * ```
 *
 * @param path The path to get the directory from.
 * @returns The directory path.
 */
export function dirname(path: string | URL): string {
  if (path instanceof URL) {
    path = fromFileUrl(path);
  }
  return stableDirname(path);
}
