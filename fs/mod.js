// Copyright 2018-2025 the Deno authors. MIT license.
/**
 * Helpers for working with the filesystem.
 *
 * ```ts ignore
 * import { ensureFile, copy, ensureDir, move } from "mod.js";
 *
 * await ensureFile("example.txt");
 *
 * await copy("example.txt", "example_copy.txt");
 *
 * await ensureDir("subdir");
 *
 * await move("example_copy.txt", "subdir/example_copy.txt");
 * ```
 *
 * @module
 */
export * from "./empty_dir.js";
export * from "./ensure_dir.js";
export * from "./ensure_file.js";
export * from "./ensure_link.js";
export * from "./ensure_symlink.js";
export * from "./exists.js";
export * from "./expand_glob.js";
export * from "./move.js";
export * from "./copy.js";
export * from "./walk.js";
export * from "./eol.js";
