// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// Copyright the Browserify authors. MIT License.

import { resolve } from "../path/resolve.ts";
import { toPathString } from "./_to_path_string.ts";

/**
 * Checks if two paths are the same.
 *
 * @param src Source file path as a string or URL.
 * @param dest Destination file path as a string or URL.
 *
 * @returns `true` if the paths are the same, `false` otherwise.
 */
export function isSamePath(
  src: string | URL,
  dest: string | URL,
): boolean {
  src = toPathString(src);
  dest = toPathString(dest);

  return resolve(src) === resolve(dest);
}
