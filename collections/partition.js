// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
export function partition(array, predicate) {
  const matches = [];
  const rest = [];
  for (const element of array) {
    if (predicate(element)) {
      matches.push(element);
    } else {
      rest.push(element);
    }
  }
  return [matches, rest];
}
