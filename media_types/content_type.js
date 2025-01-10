// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { parseMediaType } from "./parse_media_type.js";
import { getCharset } from "./get_charset.js";
import { formatMediaType } from "./format_media_type.js";
import { typeByExtension } from "./type_by_extension.js";
/**
 * Returns the full `Content-Type` or `Content-Disposition` header value for the
 * given extension or media type.
 *
 * The function will treat the `extensionOrType` as a media type when it
 * contains a `/`, otherwise it will process it as an extension, with or without
 * the leading `.`.
 *
 * Returns `undefined` if unable to resolve the media type.
 *
 * @typeParam T Type of the extension or media type to resolve.
 *
 * @param extensionOrType The extension or media type to resolve.
 *
 * @returns The full `Content-Type` or `Content-Disposition` header value, or
 * `undefined` if unable to resolve the media type.
 *
 * @example Usage
 * ```ts
 * import { contentType } from "../media-types/content_type.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * assertEquals(contentType(".json"), "application/json; charset=UTF-8");
 * assertEquals(contentType("text/html"), "text/html; charset=UTF-8");
 * assertEquals(contentType("text/html; charset=UTF-8"), "text/html; charset=UTF-8");
 * assertEquals(contentType("txt"), "text/plain; charset=UTF-8");
 * assertEquals(contentType("foo"), undefined);
 * assertEquals(contentType("file.json"), undefined);
 * ```
 */
export function contentType(extensionOrType) {
  try {
    const [mediaType, params = {}] = extensionOrType.includes("/")
      ? parseMediaType(extensionOrType)
      : [typeByExtension(extensionOrType), undefined];
    if (!mediaType) {
      return undefined;
    }
    if (!("charset" in params)) {
      const charset = getCharset(mediaType);
      if (charset) {
        params.charset = charset;
      }
    }
    return formatMediaType(mediaType, params);
  } catch {
    // just swallow returning undefined
  }
  return undefined;
}
