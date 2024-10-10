// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
const customEqualityTesters = [];
export function addCustomEqualityTesters(newTesters) {
  if (!Array.isArray(newTesters)) {
    throw new TypeError(
      `customEqualityTester expects an array of Testers. But got ${typeof newTesters}`,
    );
  }
  customEqualityTesters.push(...newTesters);
}
export function getCustomEqualityTesters() {
  return customEqualityTesters;
}
