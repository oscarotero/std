// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns all elements in the given collection, sorted by their result using
 * the given selector. The selector function is called only once for each
 * element. Ascending or descending order can be specified through the `order`
 * option. By default, the elements are sorted in ascending order.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @typeParam T The type of the iterator elements.
 * @typeParam U The type of the selected values.
 *
 * @param iterator The iterator to sort.
 * @param selector The selector function to get the value to sort by.
 * @param options The options for sorting.
 *
 * @returns A new array containing all elements sorted by the selector.
 *
 * @example Usage with numbers
 * ```ts
 * import { sortBy } from "sort_by.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const people = [
 *   { name: "Anna", age: 34 },
 *   { name: "Kim", age: 42 },
 *   { name: "John", age: 23 },
 * ];
 * const sortedByAge = sortBy(people, (person) => person.age);
 *
 * assertEquals(sortedByAge, [
 *   { name: "John", age: 23 },
 *   { name: "Anna", age: 34 },
 *   { name: "Kim", age: 42 },
 * ]);
 *
 * const sortedByAgeDesc = sortBy(people, (person) => person.age, { order: "desc" });
 *
 * assertEquals(sortedByAgeDesc, [
 *   { name: "Kim", age: 42 },
 *   { name: "Anna", age: 34 },
 *   { name: "John", age: 23 },
 * ]);
 * ```
 *
 * @example Usage with strings
 * ```ts
 * import { sortBy } from "sort_by.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const people = [
 *   { name: "Anna" },
 *   { name: "Kim" },
 *   { name: "John" },
 * ];
 * const sortedByName = sortBy(people, (it) => it.name);
 *
 * assertEquals(sortedByName, [
 *   { name: "Anna" },
 *   { name: "John" },
 *   { name: "Kim" },
 * ]);
 * ```
 *
 * @example Usage with bigints
 * ```ts
 * import { sortBy } from "sort_by.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const people = [
 *   { name: "Anna", age: 34n },
 *   { name: "Kim", age: 42n },
 *   { name: "John", age: 23n },
 * ];
 *
 * const sortedByAge = sortBy(people, (person) => person.age);
 *
 * assertEquals(sortedByAge, [
 *   { name: "John", age: 23n },
 *   { name: "Anna", age: 34n },
 *   { name: "Kim", age: 42n },
 * ]);
 * ```
 *
 * @example Usage with Date objects
 * ```ts
 * import { sortBy } from "sort_by.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const people = [
 *   { name: "Anna", startedAt: new Date("2020-01-01") },
 *   { name: "Kim", startedAt: new Date("2020-03-01") },
 *   { name: "John", startedAt: new Date("2020-06-01") },
 * ];
 *
 * const sortedByStartedAt = sortBy(people, (people) => people.startedAt);
 *
 * assertEquals(sortedByStartedAt, [
 *   { name: "Anna", startedAt: new Date("2020-01-01") },
 *   { name: "Kim", startedAt: new Date("2020-03-01") },
 *   { name: "John", startedAt: new Date("2020-06-01") },
 * ]);
 * ```
 */
export function sortBy(iterator, selector, options) {
  const array = [];
  for (const item of iterator) {
    array.push({ value: item, selected: selector(item) });
  }
  array.sort((oa, ob) => {
    const a = oa.selected;
    const b = ob.selected;
    const order = options?.order === "desc" ? -1 : 1;
    if (Number.isNaN(a)) {
      return order;
    }
    if (Number.isNaN(b)) {
      return -order;
    }
    return order * (a > b ? 1 : a < b ? -1 : 0);
  });
  return array.map((item) => item.value);
}
