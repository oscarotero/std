// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
export function minBy(array, selector) {
  let min;
  let minValue;
  for (const current of array) {
    const currentValue = selector(current);
    if (minValue === undefined || currentValue < minValue) {
      min = current;
      minValue = currentValue;
    }
  }
  return min;
}
