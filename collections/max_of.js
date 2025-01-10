// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
export function maxOf(array, selector) {
  let maximumValue;
  for (const element of array) {
    const currentValue = selector(element);
    if (maximumValue === undefined || currentValue > maximumValue) {
      maximumValue = currentValue;
      continue;
    }
    if (Number.isNaN(currentValue)) {
      return currentValue;
    }
  }
  return maximumValue;
}
