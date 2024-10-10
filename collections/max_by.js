// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
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
