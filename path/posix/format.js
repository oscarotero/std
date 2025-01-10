// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { _format, assertArg } from "../_common/format.js";
/**
 * Generate a path from `ParsedPath` object.
 *
 * @example Usage
 * ```ts
 * import { format } from "format.js";
 * import { assertEquals } from "../../assert/mod.js";
 *
 * const path = format({
 *   root: "/",
 *   dir: "/path/dir",
 *   base: "file.txt",
 *   ext: ".txt",
 *   name: "file"
 * });
 * assertEquals(path, "/path/dir/file.txt");
 * ```
 *
 * @param pathObject The path object to format.
 * @returns The formatted path.
 */
export function format(pathObject) {
  assertArg(pathObject);
  return _format("/", pathObject);
}
