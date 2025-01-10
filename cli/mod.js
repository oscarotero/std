// Copyright 2018-2025 the Deno authors. MIT license.
/**
 * Tools for creating interactive command line tools.
 *
 * ```ts
 * import { parseArgs } from "parse_args.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * // Same as running `deno run example.ts --foo --bar=baz ./quux.txt`
 * const args = parseArgs(["--foo", "--bar=baz", "./quux.txt"]);
 * assertEquals(args, { foo: true, bar: "baz", _: ["./quux.txt"] });
 * ```
 *
 * @module
 */
export * from "./parse_args.js";
export * from "./prompt_secret.js";
export * from "./unicode_width.js";
