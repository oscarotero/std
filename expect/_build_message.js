// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { buildMessage } from "../internal/build_message.js";
import { diff } from "../internal/diff.js";
import { diffStr } from "../internal/diff_str.js";
import { format } from "../internal/format.js";
function isString(value) {
  return typeof value === "string";
}
export function buildEqualErrorMessage(actual, expected, options) {
  const { formatter = format, msg } = options ?? {};
  const msgSuffix = msg ? `: ${msg}` : ".";
  const actualString = formatter(actual);
  const expectedString = formatter(expected);
  let message = `Values are not equal${msgSuffix}`;
  const stringDiff = isString(actual) && isString(expected);
  const diffResult = stringDiff
    ? diffStr(actual, expected)
    : diff(actualString.split("\n"), expectedString.split("\n"));
  const diffMsg = buildMessage(diffResult, { stringDiff }).join("\n");
  message = `${message}\n${diffMsg}`;
  return message;
}
export function buildNotEqualErrorMessage(actual, expected, options) {
  const { msg } = options ?? {};
  const actualString = String(actual);
  const expectedString = String(expected);
  const msgSuffix = msg ? `: ${msg}` : ".";
  return `Expected actual: ${actualString} not to be: ${expectedString}${msgSuffix}`;
}
