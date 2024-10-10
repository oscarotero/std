// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Utilities for encoding and decoding to and from base32hex in a streaming manner.
 *
 * ```ts
 * import { assertEquals } from "../assert/mod.js";
 * import { Base32HexDecoderStream } from "unstable_base32hex_stream.js";
 * import { toText } from "../streams/to_text.js";
 *
 * const stream = ReadableStream.from(["91IMOR3F5GG7ERRI", "DHI22==="])
 *   .pipeThrough(new Base32HexDecoderStream())
 *   .pipeThrough(new TextDecoderStream());
 *
 * assertEquals(await toText(stream), "Hello, world!");
 * ```
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @module
 */
import { decodeBase32Hex, encodeBase32Hex } from "./unstable_base32hex.js";
/**
 * Converts a Uint8Array stream into a base32hex-encoded stream.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc4648.html#section-6}
 *
 * @example Usage
 * ```ts
 * import { assertEquals } from "../assert/mod.js";
 * import { encodeBase32Hex } from "unstable_base32hex.js";
 * import { Base32HexEncoderStream } from "unstable_base32hex_stream.js";
 * import { toText } from "../streams/to_text.js";
 *
 * const stream = ReadableStream.from(["Hello,", " world!"])
 *   .pipeThrough(new TextEncoderStream())
 *   .pipeThrough(new Base32HexEncoderStream());
 *
 * assertEquals(await toText(stream), encodeBase32Hex(new TextEncoder().encode("Hello, world!")));
 * ```
 */
export class Base32HexEncoderStream extends TransformStream {
  constructor() {
    let push = new Uint8Array(0);
    super({
      transform(chunk, controller) {
        const concat = new Uint8Array(push.length + chunk.length);
        concat.set(push);
        concat.set(chunk, push.length);
        const remainder = -concat.length % 5;
        controller.enqueue(
          encodeBase32Hex(concat.slice(0, remainder || undefined)),
        );
        push = remainder ? concat.slice(remainder) : new Uint8Array(0);
      },
      flush(controller) {
        if (push.length) {
          controller.enqueue(encodeBase32Hex(push));
        }
      },
    });
  }
}
/**
 * Decodes a base32hex-encoded stream into a Uint8Array stream.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc4648.html#section-6}
 *
 * @example Usage
 * ```ts
 * import { assertEquals } from "../assert/mod.js";
 * import { Base32HexDecoderStream } from "unstable_base32hex_stream.js";
 * import { toText } from "../streams/to_text.js";
 *
 * const stream = ReadableStream.from(["91IMOR3F5GG7ERRI", "DHI22==="])
 *   .pipeThrough(new Base32HexDecoderStream())
 *   .pipeThrough(new TextDecoderStream());
 *
 * assertEquals(await toText(stream), "Hello, world!");
 * ```
 */
export class Base32HexDecoderStream extends TransformStream {
  constructor() {
    let push = "";
    super({
      transform(chunk, controller) {
        push += chunk;
        if (push.length < 8) {
          return;
        }
        const remainder = -push.length % 8;
        controller.enqueue(
          decodeBase32Hex(push.slice(0, remainder || undefined)),
        );
        push = remainder ? chunk.slice(remainder) : "";
      },
      flush(controller) {
        if (push.length) {
          controller.enqueue(decodeBase32Hex(push));
        }
      },
    });
  }
}
