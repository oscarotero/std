// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.

/**
 * Utility functions for media types (MIME types).
 *
 * This API is inspired by the GoLang {@linkcode https://pkg.go.dev/mime | mime}
 * package and {@link https://github.com/jshttp/mime-types | jshttp/mime-types},
 * and is designed to integrate and improve the APIs from
 * {@link https://deno.land/x/media_types | x/media_types}.
 *
 * The `vendor` folder contains copy of the
 * {@link https://github.com/jshttp/mime-types | jshttp/mime-db} `db.json` file,
 * along with its license.
 *
 * ```ts
 * import { contentType, allExtensions, getCharset } from "../media-types/mod.ts";
 * import { assertEquals } from "../assert/mod.ts";
 *
 * assertEquals(allExtensions("application/json"), ["json", "map"]);
 *
 * assertEquals(contentType(".json"), "application/json; charset=UTF-8");
 *
 * assertEquals(getCharset("text/plain"), "UTF-8");
 * ```
 *
 * @module
 */

export * from "./content_type.ts";
export * from "./extension.ts";
export * from "./all_extensions.ts";
export * from "./format_media_type.ts";
export * from "./get_charset.ts";
export * from "./parse_media_type.ts";
export * from "./type_by_extension.ts";
