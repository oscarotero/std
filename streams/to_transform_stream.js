// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Convert the generator function into a {@linkcode TransformStream}.
 *
 * @typeparam I The type of the chunks in the source stream.
 * @typeparam O The type of the chunks in the transformed stream.
 * @param transformer A function to transform.
 * @param writableStrategy An object that optionally defines a queuing strategy for the stream.
 * @param readableStrategy An object that optionally defines a queuing strategy for the stream.
 * @returns A {@linkcode TransformStream} that transforms the source stream as defined by the provided transformer.
 *
 * @example Build a transform stream that multiplies each value by 100
 * ```ts
 * import { toTransformStream } from "to_transform_stream.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const stream = ReadableStream.from([0, 1, 2])
 *   .pipeThrough(toTransformStream(async function* (src) {
 *     for await (const chunk of src) {
 *       yield chunk * 100;
 *     }
 *   }));
 *
 * assertEquals(
 *   await Array.fromAsync(stream),
 *   [0, 100, 200],
 * );
 * ```
 *
 * @example JSON Lines
 * ```ts
 * import { TextLineStream } from "text_line_stream.js";
 * import { toTransformStream } from "to_transform_stream.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const stream = ReadableStream.from([
 *   '{"name": "Alice", "age": ',
 *   '30}\n{"name": "Bob", "age"',
 *   ": 25}\n",
 * ]);
 *
 * type Person = { name: string; age: number };
 *
 * // Split the stream by newline and parse each line as a JSON object
 * const jsonStream = stream.pipeThrough(new TextLineStream())
 *   .pipeThrough(toTransformStream(async function* (src) {
 *     for await (const chunk of src) {
 *       if (chunk.trim().length === 0) {
 *         continue;
 *       }
 *       yield JSON.parse(chunk) as Person;
 *     }
 *   }));
 *
 * assertEquals(
 *   await Array.fromAsync(jsonStream),
 *   [{ "name": "Alice", "age": 30 }, { "name": "Bob", "age": 25 }],
 * );
 * ```
 */
// deno-lint-ignore deno-style-guide/exported-function-args-maximum
export function toTransformStream(
  transformer,
  writableStrategy,
  readableStrategy,
) {
  const { writable, readable } = new TransformStream(
    undefined,
    writableStrategy,
  );
  const iterable = transformer(readable);
  const iterator = iterable[Symbol.asyncIterator]?.() ??
    iterable[Symbol.iterator]?.();
  return {
    writable,
    readable: new ReadableStream({
      async pull(controller) {
        let result;
        try {
          result = await iterator.next();
        } catch (error) {
          // Propagate error to stream from iterator
          // If the stream status is "errored", it will be thrown, but ignore.
          await readable.cancel(error).catch(() => {});
          controller.error(error);
          return;
        }
        if (result.done) {
          controller.close();
          return;
        }
        controller.enqueue(result.value);
      },
      async cancel(reason) {
        // Propagate cancellation to readable and iterator
        if (typeof iterator.throw === "function") {
          try {
            await iterator.throw(reason);
          } catch {
            /* `iterator.throw()` always throws on site. We catch it. */
          }
        }
        await readable.cancel(reason);
      },
    }, readableStrategy),
  };
}
