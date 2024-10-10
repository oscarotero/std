// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

/**
 * This module provides functions to encode and decode MessagePack.
 *
 * MessagePack is an efficient binary serialization format that is language
 * agnostic. It is like JSON, but generally produces much smaller payloads.
 * {@link https://msgpack.org/ | Learn more about MessagePack}.
 *
 * ```ts
 * import { decode, encode } from "mod.ts";
 * import { assertEquals } from "../assert/mod.ts";
 *
 * const obj = {
 *   str: "deno",
 *   arr: [1, 2, 3],
 *   bool: true,
 *   nil: null,
 *   map: {
 *     foo: "bar"
 *   }
 * };
 *
 * const encoded = encode(obj);
 * assertEquals(encoded.length, 42);
 *
 * const decoded = decode(encoded);
 * assertEquals(decoded, obj);
 * ```
 *
 * MessagePack supports encoding and decoding the following types:
 *
 * - `number`
 * - `bigint`
 * - `string`
 * - `boolean`
 * - `null`
 * - `Uint8Array`
 * - arrays of values of these types
 * - objects with string or number keys, and values of these types
 *
 * @module
 */

export * from "./decode.ts";
export * from "./encode.ts";
