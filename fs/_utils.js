// Copyright 2018-2025 the Deno authors. MIT license.
// deno-lint-ignore-file no-explicit-any
/**
 * True if the runtime is Deno, false otherwise.
 */
export const isDeno = navigator.userAgent?.includes("Deno");
/** True if the platform is windows, false otherwise */
export const isWindows = checkWindows();
/**
 * @returns true if the platform is Windows, false otherwise.
 */
function checkWindows() {
  if (typeof navigator !== "undefined" && navigator.platform) {
    return navigator.platform.startsWith("Win");
  } else if (typeof globalThis.process !== "undefined") {
    return globalThis.platform === "win32";
  }
  return false;
}
/**
 * @returns The Node.js `fs` module.
 */
export function getNodeFs() {
  return globalThis.process.getBuiltinModule("node:fs");
}
