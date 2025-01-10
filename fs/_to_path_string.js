// Copyright 2018-2025 the Deno authors. MIT license.
// Copyright the Browserify authors. MIT License.
import { fromFileUrl } from "../path/from_file_url.js";
/**
 * Convert a URL or string to a path.
 *
 * @param pathUrl A URL or string to be converted.
 *
 * @returns The path as a string.
 */
export function toPathString(pathUrl) {
  return pathUrl instanceof URL ? fromFileUrl(pathUrl) : pathUrl;
}
