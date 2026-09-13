// Copyright 2018-2026 the Deno authors. MIT license.
// This module is browser compatible.
const NEWLINE_REGEXP = /\r\n|\r|\n/;
/**
 * Parses a field line and updates the message accumulator.
 * Returns true if a field was added to the message.
 */
function parseLine(line, message, ignoreComments) {
  // Lines starting with colon are comments
  if (line[0] === ":") {
    if (ignoreComments) {
      return false;
    }
    const value = line.slice(1);
    message.comment = message.comment !== undefined
      ? `${message.comment}\n${value}`
      : value;
    return true;
  }
  // Parse field:value
  const colonIndex = line.indexOf(":");
  let field;
  let value;
  if (colonIndex === -1) {
    // No colon means field name only, empty value
    field = line;
    value = "";
  } else {
    field = line.slice(0, colonIndex);
    // Remove single leading space from value if present
    value = line[colonIndex + 1] === " "
      ? line.slice(colonIndex + 2)
      : line.slice(colonIndex + 1);
  }
  switch (field) {
    case "event":
      message.event = value;
      return true;
    case "data":
      // Accumulate data with newlines between
      message.data = message.data !== undefined
        ? `${message.data}\n${value}`
        : value;
      return true;
    case "id":
      // Per spec: ignore if value contains null character
      if (!value.includes("\0")) {
        message.id = value;
        return true;
      }
      return false;
    case "retry":
      // Per spec: only set if value consists of ASCII digits only
      if (/^\d+$/.test(value)) {
        message.retry = parseInt(value, 10);
        return true;
      }
      return false;
    default:
      // Unknown fields are ignored per spec
      return false;
  }
}
/**
 * Transforms a byte stream of server-sent events into parsed message objects.
 *
 * This enables consuming server-sent events using the Fetch API instead of
 * {@linkcode EventSource}, which is useful when you need custom headers,
 * request bodies, or HTTP methods other than GET.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events}
 *
 * @example Basic usage with fetch
 * ```ts ignore
 * import { ServerSentEventParseStream } from "server_sent_event_parse_stream.js";
 *
 * const response = await fetch("https://example.com/sse", {
 *   headers: { "Authorization": "Bearer token" },
 * });
 *
 * const stream = response.body!
 *   .pipeThrough(new ServerSentEventParseStream());
 *
 * for await (const event of stream) {
 *   console.log(event.event, event.data);
 * }
 * ```
 *
 * @example Roundtrip with ServerSentEventStream
 * ```ts
 * import { ServerSentEventParseStream } from "server_sent_event_parse_stream.js";
 * import { ServerSentEventStream } from "server_sent_event_stream.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const original = [
 *   { data: "hello" },
 *   { event: "update", data: "world" },
 *   { id: "1", data: "with id" },
 * ];
 *
 * const encoded = ReadableStream.from(original)
 *   .pipeThrough(new ServerSentEventStream());
 *
 * const decoded = encoded.pipeThrough(new ServerSentEventParseStream());
 * const result = await Array.fromAsync(decoded);
 *
 * assertEquals(result, original);
 * ```
 *
 * @example Ignoring comments
 * ```ts
 * import { ServerSentEventParseStream } from "server_sent_event_parse_stream.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const stream = ReadableStream.from([
 *   new TextEncoder().encode(":keepalive\ndata: hello\n\n"),
 * ]).pipeThrough(new ServerSentEventParseStream({ ignoreComments: true }));
 *
 * const result = await Array.fromAsync(stream);
 *
 * assertEquals(result, [{ data: "hello" }]);
 * ```
 */
export class ServerSentEventParseStream extends TransformStream {
  /**
   * Constructs a new instance.
   *
   * @param options Options for the stream.
   */
  constructor(options = {}) {
    const { ignoreComments = false } = options;
    // Note: TextDecoder automatically strips the UTF-8 BOM (U+FEFF) from the
    // start of the stream per the WHATWG Encoding Standard, so we don't need
    // to handle it manually.
    const decoder = new TextDecoder();
    let buffer = "";
    let message = {};
    let hasFields = false;
    super({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        // Preserve trailing \r - it might be part of \r\n split across chunks
        let trailingCR = "";
        if (buffer[buffer.length - 1] === "\r") {
          trailingCR = "\r";
          buffer = buffer.slice(0, -1);
        }
        // Process complete lines
        const lines = buffer.split(NEWLINE_REGEXP);
        // Keep incomplete last line in buffer, restore any trailing \r
        buffer = lines.pop() + trailingCR;
        for (const line of lines) {
          if (line === "") {
            // Empty line signals end of message - dispatch if non-empty
            if (hasFields) {
              controller.enqueue(message);
            }
            message = {};
            hasFields = false;
          } else if (parseLine(line, message, ignoreComments)) {
            hasFields = true;
          }
        }
      },
      flush(controller) {
        // Handle any remaining content in buffer
        buffer += decoder.decode();
        // Trailing \r at end of stream is a line ending
        if (buffer[buffer.length - 1] === "\r") {
          buffer = buffer.slice(0, -1);
          if (parseLine(buffer, message, ignoreComments)) {
            hasFields = true;
          }
          // The \r was a line ending, so dispatch if we have fields
          if (hasFields) {
            controller.enqueue(message);
            return;
          }
        } else if (buffer) {
          if (parseLine(buffer, message, ignoreComments)) {
            hasFields = true;
          }
        }
        // Dispatch final message if non-empty
        if (hasFields) {
          controller.enqueue(message);
        }
      },
    });
  }
}
