// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
export function maxBy(array, selector) {
  let max;
  let maxValue;
  for (const current of array) {
    const currentValue = selector(current);
    if (maxValue === undefined || currentValue > maxValue) {
      max = current;
      maxValue = currentValue;
    }
  }
  return max;
}
