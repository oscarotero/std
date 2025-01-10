// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
export function sortBy(array, selector, options) {
  const len = array.length;
  const indexes = new Array(len);
  const selectors = new Array(len);
  const order = options?.order ?? "asc";
  array.forEach((element, index) => {
    indexes[index] = index;
    const selected = selector(element);
    selectors[index] = Number.isNaN(selected) ? null : selected;
  });
  indexes.sort((ai, bi) => {
    let a = selectors[ai];
    let b = selectors[bi];
    if (order === "desc") {
      [a, b] = [b, a];
    }
    if (a === null) {
      return 1;
    }
    if (b === null) {
      return -1;
    }
    return a > b ? 1 : a < b ? -1 : 0;
  });
  for (let i = 0; i < len; i++) {
    indexes[i] = array[indexes[i]];
  }
  return indexes;
}
