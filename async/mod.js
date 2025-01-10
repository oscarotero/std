// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Provide helpers with asynchronous tasks like {@linkcode delay | delays},
 * {@linkcode debounce | debouncing}, {@linkcode retry | retrying}, or
 * {@linkcode pooledMap | pooling}.
 *
 * ```ts no-assert
 * import { delay } from "delay.js";
 *
 * await delay(100); // waits for 100 milliseconds
 * ```
 *
 * @module
 */
export * from "./abortable.js";
export * from "./deadline.js";
export * from "./debounce.js";
export * from "./delay.js";
export * from "./mux_async_iterator.js";
export * from "./pool.js";
export * from "./tee.js";
export * from "./retry.js";
