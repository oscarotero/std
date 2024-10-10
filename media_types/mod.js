// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
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
 * import { contentType, allExtensions, getCharset } from "../media-types/mod.js";
 * import { assertEquals } from "../assert/mod.js";
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
export * from "./content_type.js";
export * from "./extension.js";
export * from "./all_extensions.js";
export * from "./format_media_type.js";
export * from "./get_charset.js";
export * from "./parse_media_type.js";
export * from "./type_by_extension.js";
