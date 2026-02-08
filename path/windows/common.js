// Copyright 2018-2026 the Deno authors. MIT license.
// This module is browser compatible.
import { common as _common } from "../_common/common.js";
import { SEPARATOR } from "./constants.js";
/**
 * Determines the common path from a set of paths for Windows systems.
 *
 * @example Usage
 * ```ts
 * import { common } from "common.js";
 * import { assertEquals } from "../../assert/mod.js";
 *
 * const path = common([
 *   "C:\\foo\\bar",
 *   "C:\\foo\\baz",
 * ]);
 * assertEquals(path, "C:\\foo\\");
 * ```
 *
 * @param paths The paths to compare.
 * @returns The common path.
 */
export function common(paths) {
  return _common(paths, SEPARATOR);
}
