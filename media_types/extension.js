// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { allExtensions } from "./all_extensions.js";
/**
 * Returns the most relevant extension for the given media type, or `undefined`
 * if no extension can be found.
 *
 * Extensions are returned without a leading `.`.
 *
 * @param type The media type to get the extension for.
 *
 * @returns The extension for the given media type, or `undefined` if no
 * extension is found.
 *
 * @example Usage
 * ```ts
 * import { extension } from "../media-types/extension.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * assertEquals(extension("text/plain"), "txt");
 * assertEquals(extension("application/json"), "json");
 * assertEquals(extension("text/html; charset=UTF-8"), "html");
 * assertEquals(extension("application/foo"), undefined);
 * ```
 */
export function extension(type) {
  return allExtensions(type)?.[0];
}
