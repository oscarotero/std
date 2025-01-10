// Copyright 2018-2025 the Deno authors. MIT license.
/**
 * Utilities for working with the
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Streams API}.
 *
 * Includes buffering and conversion.
 *
 * ```ts
 * import { toText } from "mod.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const stream = ReadableStream.from(["Hello, world!"]);
 * const text = await toText(stream);
 *
 * assertEquals(text, "Hello, world!");
 * ```
 *
 * @module
 */
export * from "./buffer.js";
export * from "./byte_slice_stream.js";
export * from "./concat_readable_streams.js";
export * from "./delimiter_stream.js";
export * from "./early_zip_readable_streams.js";
export * from "./limited_bytes_transform_stream.js";
export * from "./limited_transform_stream.js";
export * from "./merge_readable_streams.js";
export * from "./text_delimiter_stream.js";
export * from "./text_line_stream.js";
export * from "./to_array_buffer.js";
export * from "./to_blob.js";
export * from "./to_json.js";
export * from "./to_text.js";
export * from "./to_transform_stream.js";
export * from "./zip_readable_streams.js";
