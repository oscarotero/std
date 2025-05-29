import { diff } from "../internal/diff.js";
import { diffStr } from "../internal/diff_str.js";
import { buildMessage } from "../internal/build_message.js";
export function getErrorMessage(message, options) {
  return typeof options.msg === "string" ? options.msg : message;
}
/**
 * Default serializer for `assertSnapshot`.
 *
 * @example Usage
 * ```ts
 * import { serialize } from "snapshot.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * assertEquals(serialize({ foo: 42 }), "{\n  foo: 42,\n}")
 * ```
 *
 * @param actual The value to serialize
 * @returns The serialized string
 */
export function serialize(actual) {
  return Deno.inspect(actual, {
    depth: Infinity,
    sorted: true,
    trailingComma: true,
    compact: false,
    iterableLimit: Infinity,
    strAbbreviateSize: Infinity,
    breakLength: Infinity,
    escapeSequences: false,
  }).replaceAll("\r", "\\r");
}
/**
 * Converts a string to a valid JavaScript string which can be wrapped in backticks.
 *
 * @example
 *
 * "special characters (\ ` $) will be escaped" -> "special characters (\\ \` \$) will be escaped"
 */
export function escapeStringForJs(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");
}
let _mode;
/**
 * Get the snapshot mode.
 */
export function getMode(options) {
  if (options.mode) {
    return options.mode;
  } else if (_mode) {
    return _mode;
  } else {
    _mode = Deno.args.some((arg) => arg === "--update" || arg === "-u")
      ? "update"
      : "assert";
    return _mode;
  }
}
/**
 * Return `true` when snapshot mode is `update`.
 */
export function getIsUpdate(options) {
  return getMode(options) === "update";
}
export function getOptions(msgOrOpts) {
  if (msgOrOpts === undefined) {
    return {};
  }
  if (typeof msgOrOpts === "object" && msgOrOpts !== null) {
    return msgOrOpts;
  }
  return { msg: msgOrOpts };
}
export function getSnapshotNotMatchMessage(
  actualSnapshot,
  expectedSnapshot,
  options,
) {
  const stringDiff = !actualSnapshot.includes("\n");
  const diffResult = stringDiff
    ? diffStr(actualSnapshot, expectedSnapshot)
    : diff(actualSnapshot.split("\n"), expectedSnapshot.split("\n"));
  const diffMsg = buildMessage(diffResult, { stringDiff }).join("\n");
  const message =
    `Snapshot does not match:\n${diffMsg}\nTo update snapshots, run\n    deno test --allow-read --allow-write [files]... -- --update\n`;
  return getErrorMessage(message, options);
}
// TODO (WWRS): Remove this when we drop support for Deno 1.x
export const LINT_SUPPORTED = !Deno.version.deno.startsWith("1.");
