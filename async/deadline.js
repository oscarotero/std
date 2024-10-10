// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { abortable } from "./abortable.js";
/**
 * Create a promise which will be rejected with {@linkcode DOMException} when
 * a given delay is exceeded.
 *
 * Note: Prefer to use {@linkcode AbortSignal.timeout} instead for the APIs
 * that accept {@linkcode AbortSignal}.
 *
 * @throws {DOMException & { name: "TimeoutError" }} If the provided duration
 * runs out before resolving.
 * @throws {DOMException & { name: "AbortError" }} If the optional signal is
 * aborted with the default `reason` before resolving or timing out.
 * @throws {AbortSignal["reason"]} If the optional signal is aborted with a
 * custom `reason` before resolving or timing out.
 * @typeParam T The type of the provided and returned promise.
 * @param p The promise to make rejectable.
 * @param ms Duration in milliseconds for when the promise should time out.
 * @param options Additional options.
 * @returns A promise that will reject if the provided duration runs out before resolving.
 *
 * @example Usage
 * ```ts ignore
 * import { deadline } from "deadline.js";
 * import { delay } from "delay.js";
 *
 * const delayedPromise = delay(1_000);
 * // Below throws `DOMException` after 10 ms
 * const result = await deadline(delayedPromise, 10);
 * ```
 */
export async function deadline(p, ms, options = {}) {
  const signals = [AbortSignal.timeout(ms)];
  if (options.signal) {
    signals.push(options.signal);
  }
  return await abortable(p, AbortSignal.any(signals));
}
