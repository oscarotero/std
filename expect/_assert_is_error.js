// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { AssertionError } from "../assert/assertion_error.js";
import { stripAnsiCode } from "../internal/styles.js";
/**
 * Make an assertion that `error` is an `Error`.
 * If not then an error will be thrown.
 * An error class and a string that should be included in the
 * error message can also be asserted.
 *
 * @typeParam E The type of the error to assert.
 * @param error The error to assert.
 * @param ErrorClass The optional error class to assert.
 * @param msgMatches The optional string or RegExp to assert in the error message.
 * @param msg The optional message to display if the assertion fails.
 */
export function assertIsError(
  error,
  // deno-lint-ignore no-explicit-any
  ErrorClass,
  msgMatches,
  msg,
) {
  const msgPrefix = msg ? `${msg}: ` : "";
  if (!(error instanceof Error)) {
    throw new AssertionError(
      `${msgPrefix}Expected "error" to be an Error object.`,
    );
  }
  if (ErrorClass && !(error instanceof ErrorClass)) {
    msg =
      `${msgPrefix}Expected error to be instance of "${ErrorClass.name}", but was "${error?.constructor?.name}".`;
    throw new AssertionError(msg);
  }
  let msgCheck;
  if (typeof msgMatches === "string") {
    msgCheck = stripAnsiCode(error.message).includes(stripAnsiCode(msgMatches));
  }
  if (msgMatches instanceof RegExp) {
    msgCheck = msgMatches.test(stripAnsiCode(error.message));
  }
  if (msgMatches && !msgCheck) {
    msg = `${msgPrefix}Expected error message to include ${
      msgMatches instanceof RegExp
        ? msgMatches.toString()
        : JSON.stringify(msgMatches)
    }, but got ${JSON.stringify(error?.message)}.`;
    throw new AssertionError(msg);
  }
}
