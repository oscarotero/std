// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Transform a stream into a stream where each chunk is divided by a newline,
 * be it `\n` or `\r\n`. `\r` can be enabled via the `allowCR` option.
 *
 * If you want to split by a custom delimiter, consider using {@linkcode TextDelimiterStream}.
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
 *
 * @example Allow splitting by `\r`
 *
 * ```ts
 * import { TextLineStream } from "text_line_stream.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const stream = ReadableStream.from([
 *  "CR\rLF",
 *  "\nCRLF\r\ndone",
 * ]).pipeThrough(new TextLineStream({ allowCR: true }));
 *
 * const lines = await Array.fromAsync(stream);
 *
 * assertEquals(lines, ["CR", "LF", "CRLF", "done"]);
 * ```
 */
export class TextLineStream extends TransformStream {
  #currentLine = "";
  /**
   * Constructs a new instance.
   *
   * @param options Options for the stream.
   */
  constructor(options = { allowCR: false }) {
    super({
      transform: (chars, controller) => {
        chars = this.#currentLine + chars;
        while (true) {
          const lfIndex = chars.indexOf("\n");
          const crIndex = options.allowCR ? chars.indexOf("\r") : -1;
          if (
            crIndex !== -1 && crIndex !== (chars.length - 1) &&
            (lfIndex === -1 || (lfIndex - 1) > crIndex)
          ) {
            controller.enqueue(chars.slice(0, crIndex));
            chars = chars.slice(crIndex + 1);
            continue;
          }
          if (lfIndex === -1) {
            break;
          }
          const endIndex = chars[lfIndex - 1] === "\r" ? lfIndex - 1 : lfIndex;
          controller.enqueue(chars.slice(0, endIndex));
          chars = chars.slice(lfIndex + 1);
        }
        this.#currentLine = chars;
      },
      flush: (controller) => {
        if (this.#currentLine === "") {
          return;
        }
        const currentLine = options.allowCR && this.#currentLine.endsWith("\r")
          ? this.#currentLine.slice(0, -1)
          : this.#currentLine;
        controller.enqueue(currentLine);
      },
    });
  }
}
