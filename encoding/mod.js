// Copyright 2018-2025 the Deno authors. MIT license.
/**
 * Utilities for encoding and decoding common formats like hex, base64, and varint.
 *
 * ```ts
 * import { encodeBase64, decodeBase64 } from "mod.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const foobar = new TextEncoder().encode("foobar");
 * assertEquals(encodeBase64(foobar), "Zm9vYmFy");
 * assertEquals(decodeBase64("Zm9vYmFy"), foobar);
 * ```
 *
 * @module
 */
export * from "./ascii85.js";
export * from "./base32.js";
export * from "./base58.js";
export * from "./base64.js";
export * from "./base64url.js";
export * from "./hex.js";
export * from "./varint.js";
