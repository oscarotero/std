// Copyright 2018-2026 the Deno authors. MIT license.
// This module is browser compatible.

import type { GlobOptions } from "./_common/glob-to-reg-exp.ts";
import { isWindows } from "../internal/os.ts";
import { normalizeGlob as posixNormalizeGlob } from "./posix/normalize-glob.ts";
import {
  normalizeGlob as windowsNormalizeGlob,
} from "./windows/normalize-glob.ts";

export type { GlobOptions };

/**
 * Normalizes a glob string.
 *
 * Behaves like
 * {@linkcode https://jsr.io/@std/path/doc/~/normalize | normalize()}, but
 * doesn't collapse "**\/.." when `globstar` is true.
 *
 * @example Usage
 * ```ts
 * import { normalizeGlob } from "normalize-glob.ts";
 * import { assertEquals } from "../assert/mod.ts";
 *
 * if (Deno.build.os === "windows") {
 *   assertEquals(normalizeGlob("foo\\bar\\..\\baz"), "foo\\baz");
 *   assertEquals(normalizeGlob("foo\\**\\..\\bar\\..\\baz", { globstar: true }), "foo\\**\\..\\baz");
 * } else {
 *   assertEquals(normalizeGlob("foo/bar/../baz"), "foo/baz");
 *   assertEquals(normalizeGlob("foo/**\/../bar/../baz", { globstar: true }), "foo/**\/../baz");
 * }
 * ```
 *
 * @param glob Glob string to normalize.
 * @param options Glob options.
 * @returns The normalized glob string.
 */
export function normalizeGlob(
  glob: string,
  options: GlobOptions = {},
): string {
  return isWindows
    ? windowsNormalizeGlob(glob, options)
    : posixNormalizeGlob(glob, options);
}
