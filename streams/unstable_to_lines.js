// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { TextLineStream } from "./text_line_stream.js";
/**
 * Converts a {@linkcode ReadableStream} of {@linkcode Uint8Array}s into one of
 * lines delimited by `\n` or `\r\n`. Trims the last line if empty.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @param readable A stream of {@linkcode Uint8Array}s.
 * @param options Stream options.
 * @returns A stream of lines delimited by `\n` or `\r\n`.
 *
 * @example Usage
 * ```ts
 * import { toLines } from "unstable_to_lines.js";
 * import { assertEquals } from "../assert/equals.js";
 *
 * const readable = ReadableStream.from([
 *   "qwertzu",
 *   "iopasd\r\nmnbvc",
 *   "xylk\rjhgfds\napoiuzt\r",
 *   "qwr\r09ei\rqwrjiowqr\r",
 * ]).pipeThrough(new TextEncoderStream());
 *
 * assertEquals(await Array.fromAsync(toLines(readable)), [
 *   "qwertzuiopasd",
 *   "mnbvcxylk\rjhgfds",
 *   "apoiuzt\rqwr\r09ei\rqwrjiowqr\r",
 * ]);
 * ```
 */
export function toLines(readable, options) {
  return readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream(), options);
}
