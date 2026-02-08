// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright the Browserify authors. MIT License.
// Ported mostly from https://github.com/browserify/path-browserify/
// This module is browser compatible.
/**
 * Utilities for working with POSIX-formatted paths.
 *
 * This module also provides some functions that help when working with URLs.
 * See the documentation for examples.
 *
 * Codes in the examples uses POSIX path but it automatically use Windows path
 * on Windows. Use methods under `posix` or `win32` object instead to handle non
 * platform specific path like:
 *
 * ```ts
 * import { fromFileUrl } from "from_file_url.js";
 * import { assertEquals } from "../../assert/mod.js";
 *
 * assertEquals(fromFileUrl("file:///home/foo"), "/home/foo");
 * ```
 *
 * @module
 */
export * from "./basename.js";
export * from "./constants.js";
export * from "./dirname.js";
export * from "./extname.js";
export * from "./format.js";
export * from "./from_file_url.js";
export * from "./is_absolute.js";
export * from "./join.js";
export * from "./normalize.js";
export * from "./parse.js";
export * from "./relative.js";
export * from "./resolve.js";
export * from "./to_file_url.js";
export * from "./to_namespaced_path.js";
export * from "./common.js";
export * from "../types.js";
export * from "./glob_to_regexp.js";
export * from "./is_glob.js";
export * from "./join_globs.js";
export * from "./normalize_glob.js";
