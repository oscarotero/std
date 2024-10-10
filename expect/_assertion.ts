// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.

import { getAssertionState } from "../internal/assertion_state.ts";

const assertionState = getAssertionState();

export function hasAssertions() {
  assertionState.setAssertionCheck(true);
}

export function emitAssertionTrigger() {
  assertionState.setAssertionTriggered(true);
}
