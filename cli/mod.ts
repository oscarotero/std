// Copyright 2018-2026 the Deno authors. MIT license.

/**
 * Tools for creating interactive command line tools.
 *
 * ```ts
 * import { parseArgs } from "parse_args.ts";
 * import { assertEquals } from "../assert/mod.ts";
 *
 * // Same as running `deno run example.ts --foo --bar=baz ./quux.txt`
 * const args = parseArgs(["--foo", "--bar=baz", "./quux.txt"]);
 * assertEquals(args, { foo: true, bar: "baz", _: ["./quux.txt"] });
 * ```
 *
 * @module
 */

export * from "./parse_args.ts";
export * from "./prompt_secret.ts";
export * from "./unicode_width.ts";
