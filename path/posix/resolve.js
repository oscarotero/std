// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { normalizeString } from "../_common/normalize_string.js";
import { assertPath } from "../_common/assert_path.js";
import { isPosixPathSeparator } from "./_util.js";
/**
 * Resolves path segments into a `path`.
 *
 * @example Usage
 * ```ts
 * import { resolve } from "resolve.js";
 * import { assertEquals } from "../../assert/mod.js";
 *
 * const path = resolve("/foo", "bar", "baz/asdf", "quux", "..");
 * assertEquals(path, "/foo/bar/baz/asdf");
 * ```
 *
 * @param pathSegments The path segments to resolve.
 * @returns The resolved path.
 */
export function resolve(...pathSegments) {
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    let path;
    if (i >= 0) {
      path = pathSegments[i];
    } else {
      // deno-lint-ignore no-explicit-any
      const { Deno } = globalThis;
      if (typeof Deno?.cwd !== "function") {
        throw new TypeError(
          "Resolved a relative path without a current working directory (CWD)",
        );
      }
      path = Deno.cwd();
    }
    assertPath(path);
    // Skip empty entries
    if (path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isPosixPathSeparator(path.charCodeAt(0));
  }
  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when Deno.cwd() fails)
  // Normalize the path
  resolvedPath = normalizeString(
    resolvedPath,
    !resolvedAbsolute,
    "/",
    isPosixPathSeparator,
  );
  if (resolvedAbsolute) {
    if (resolvedPath.length > 0) {
      return `/${resolvedPath}`;
    } else {
      return "/";
    }
  } else if (resolvedPath.length > 0) {
    return resolvedPath;
  } else {
    return ".";
  }
}
