// Copyright 2018-2026 the Deno authors. MIT license.
// This module is browser compatible.
import { parseMediaType } from "./parse_media_type.js";
import { extensions } from "./_db.js";
/**
 * Returns all the extensions known to be associated with the media type `type`, or
 * `undefined` if no extensions are found.
 *
 * Extensions are returned without a leading `.`.
 *
 * @param type The media type to get the extensions for.
 *
 * @returns The extensions for the given media type, or `undefined` if no
 * extensions are found.
 *
 * @example Usage
 * ```ts
 * import { allExtensions } from "../media-types/all_extensions.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * assertEquals(allExtensions("application/json"), ["json", "map"]);
 * assertEquals(allExtensions("text/html; charset=UTF-8"), ["html", "htm", "shtml"]);
 * assertEquals(allExtensions("application/foo"), undefined);
 * ```
 */
export function allExtensions(type) {
  try {
    const [mediaType] = parseMediaType(type);
    return extensions.get(mediaType);
  } catch {
    // just swallow errors, returning undefined
  }
}
