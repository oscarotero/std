// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Functions for HTML tasks such as escaping or unescaping HTML entities.
 *
 * ```ts
 * import { unescape } from "entities.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * assertEquals(unescape("&lt;&gt;&#39;&amp;AA"), "<>'&AA");
 * assertEquals(unescape("&thorn;&eth;"), "&thorn;&eth;");
 * ```
 *
 * @module
 */
export * from "./entities.js";
