// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/**
 * A transform stream that resize {@linkcode Uint8Array} chunks into perfectly
 * `size` chunks with the exception of the last chunk.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @example Usage
 * ```ts
 * import { FixedChunkStream } from "unstable_fixed_chunk_stream.js";
 * import { assertEquals } from "../assert/equals.js";
 *
 * const readable = ReadableStream.from(function* () {
 *   let count = 0
 *   for (let i = 0; i < 100; ++i) {
 *     const array = new Uint8Array(Math.floor(Math.random() * 1000));
 *     count += array.length;
 *     yield array;
 *   }
 *   yield new Uint8Array(512 - count % 512)
 * }())
 *   .pipeThrough(new FixedChunkStream(512))
 *   .pipeTo(new WritableStream({
 *     write(chunk, _controller) {
 *       assertEquals(chunk.length, 512)
 *     }
 *   }))
 * ```
 */
export class FixedChunkStream extends TransformStream {
  /**
   * Constructs a new instance.
   *
   * @param size The size of the chunks to be resized to.
   */
  constructor(size) {
    let push;
    super({
      transform(chunk, controller) {
        if (push !== undefined) {
          const concat = new Uint8Array(push.length + chunk.length);
          concat.set(push);
          concat.set(chunk, push.length);
          chunk = concat;
        }
        for (let i = size; i <= chunk.length; i += size) {
          controller.enqueue(chunk.slice(i - size, i));
        }
        const remainder = -chunk.length % size;
        push = remainder ? chunk.slice(remainder) : undefined;
      },
      flush(controller) {
        if (push?.length) {
          controller.enqueue(push);
        }
      },
    });
  }
}
