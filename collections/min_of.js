// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
export function minOf(array, selector) {
  let minimumValue;
  for (const element of array) {
    const currentValue = selector(element);
    if (minimumValue === undefined || currentValue < minimumValue) {
      minimumValue = currentValue;
      continue;
    }
    if (Number.isNaN(currentValue)) {
      return currentValue;
    }
  }
  return minimumValue;
}
