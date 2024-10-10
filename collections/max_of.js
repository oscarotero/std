// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
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
