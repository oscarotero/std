// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/**
 * Check the test suite internal state
 *
 * @example Usage
 * ```ts ignore
 * import { AssertionState } from "mod.js";
 *
 * const assertionState = new AssertionState();
 * ```
 */
export class AssertionState {
  #state;
  constructor() {
    this.#state = {
      assertionCheck: false,
      assertionTriggered: false,
    };
  }
  /**
   * If `expect.hasAssertions` called, then through this method to update #state.assertionCheck value.
   *
   * @param val Set #state.assertionCheck's value
   *
   * @example Usage
   * ```ts ignore
   * import { AssertionState } from "mod.js";
   *
   * const assertionState = new AssertionState();
   * assertionState.setAssertionCheck(true);
   * ```
   */
  setAssertionCheck(val) {
    this.#state.assertionCheck = val;
  }
  /**
   * If any matchers was called, `#state.assertionTriggered` will be set through this method.
   *
   * @param val Set #state.assertionTriggered's value
   *
   * @example Usage
   * ```ts ignore
   * import { AssertionState } from "mod.js";
   *
   * const assertionState = new AssertionState();
   * assertionState.setAssertionTriggered(true);
   * ```
   */
  setAssertionTriggered(val) {
    this.#state.assertionTriggered = val;
  }
  /**
   * Check Assertion internal state, if `#state.assertionCheck` is set true, but
   * `#state.assertionTriggered` is still false, then should throw an Assertion Error.
   *
   * @returns a boolean value, that the test suite is satisfied with the check. If not,
   * it should throw an AssertionError.
   *
   * @example Usage
   * ```ts ignore
   * import { AssertionState } from "mod.js";
   *
   * const assertionState = new AssertionState();
   * if (assertionState.checkAssertionErrorStateAndReset()) {
   *   // throw AssertionError("");
   * }
   * ```
   */
  checkAssertionErrorStateAndReset() {
    const result = this.#state.assertionCheck &&
      !this.#state.assertionTriggered;
    this.#resetAssertionState();
    return result;
  }
  #resetAssertionState() {
    this.#state = {
      assertionCheck: false,
      assertionTriggered: false,
    };
  }
}
const assertionState = new AssertionState();
/**
 * return an instance of AssertionState
 *
 * @returns AssertionState
 *
 * @example Usage
 * ```ts ignore
 * import { getAssertionState } from "mod.js";
 *
 * const assertionState = getAssertionState();
 * assertionState.setAssertionTriggered(true);
 * ```
 */
export function getAssertionState() {
  return assertionState;
}
