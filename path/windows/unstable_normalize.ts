// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

import { normalize as stableNormalize } from "./normalize.ts";
import { fromFileUrl } from "./from_file_url.ts";

/**
 * Normalize the `path`, resolving `'..'` and `'.'` segments.
 * Note that resolving these segments does not necessarily mean that all will be eliminated.
 * A `'..'` at the top-level will be preserved, and an empty path is canonically `'.'`.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @example Usage
 * ```ts
 * import { normalize } from "unstable_normalize.ts";
 * import { assertEquals } from "../../assert/mod.ts";
 *
 * assertEquals(normalize("C:\\foo\\..\\bar"), "C:\\bar");
 * assertEquals(normalize(new URL("file:///C:/foo/../bar")), "C:\\bar");
 * ```
 *
 * @param path The path to normalize. Path can be a string or a file URL object.
 * @returns The normalized path
 */
export function normalize(path: string | URL): string {
  path = path instanceof URL ? fromFileUrl(path) : path;
  return stableNormalize(path);
}
