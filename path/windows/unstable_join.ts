// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

import { join as stableJoin } from "./join.ts";
import { fromFileUrl } from "./from_file_url.ts";

/**
 * Join all given a sequence of `paths`, then normalizes the resulting path.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @example Usage
 * ```ts
 * import { join } from "unstable_join.ts";
 * import { assertEquals } from "../../assert/mod.ts";
 *
 * assertEquals(join("C:\\foo", "bar", "baz\\.."), "C:\\foo\\bar");
 * assertEquals(join(new URL("file:///C:/foo"), "bar", "baz\\.."), "C:\\foo\\bar");
 * ```
 *
 * @param path The path to join. This can be string or file URL.
 * @param paths The paths to join.
 * @returns The joined path.
 */
export function join(path?: URL | string, ...paths: string[]): string {
  path = path instanceof URL ? fromFileUrl(path) : path;
  paths = path ? [path, ...paths] : paths;
  return stableJoin(...paths);
}
