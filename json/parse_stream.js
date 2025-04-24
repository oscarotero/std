// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { parse } from "./_common.js";
const blanks = /^[ \t\r\n]*$/;
function isBlankSpace(str) {
  return blanks.test(str);
}
/**
 * Parse each chunk as JSON.
 *
 * This can be used to parse {@link https://jsonlines.org/ | JSON lines},
 * {@link https://en.wikipedia.org/wiki/JSON_streaming#Newline-delimited_JSON | NDJSON} and
 * {@link https://www.rfc-editor.org/rfc/rfc7464.html | JSON Text Sequences}.
 * Chunks consisting of spaces, tab characters, or newline characters will be ignored.
 *
 * @example Basic usage
 *
 * ```ts
 * import { JsonParseStream } from "parse_stream.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const stream = ReadableStream.from([
 *   `{"foo":"bar"}\n`,
 *   `{"baz":100}\n`
 * ]).pipeThrough(new JsonParseStream());
 *
 * assertEquals(await Array.fromAsync(stream), [
 *   { foo: "bar" },
 *   { baz: 100 }
 * ]);
 * ```
 *
 * @example parse JSON lines or NDJSON from a file
 * ```ts
 * import { TextLineStream } from "../streams/text_line_stream.js";
 * import { JsonParseStream } from "parse_stream.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const file = await Deno.open("json/testdata/test.jsonl");
 *
 * const readable = file.readable
 *   .pipeThrough(new TextDecoderStream())  // convert Uint8Array to string
 *   .pipeThrough(new TextLineStream()) // transform into a stream where each chunk is divided by a newline
 *   .pipeThrough(new JsonParseStream()); // parse each chunk as JSON
 *
 * assertEquals(await Array.fromAsync(readable), [
 *  {"hello": "world"},
 *  ["👋", "👋", "👋"],
 *  {"deno": "🦕"},
 * ]);
 * ```
 */
export class JsonParseStream extends TransformStream {
  /**
   * Constructs new instance.
   */
  constructor() {
    super({
      transform(chunk, controller) {
        if (!isBlankSpace(chunk)) {
          controller.enqueue(parse(chunk));
        }
      },
    });
  }
}
