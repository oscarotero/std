// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
// Copyright 2019 Allain Lalonde. All rights reserved. ISC License.
// Copyright (c) Meta Platforms, Inc. and affiliates.
// The documentation is extracted from https://github.com/jestjs/jest/blob/main/website/versioned_docs/version-29.7/ExpectAPI.md
// and updated for the Deno ecosystem.
import { AssertionError } from "../assert/assertion_error.js";
import {
  assertions,
  emitAssertionTrigger,
  hasAssertions,
} from "./_assertions.js";
import {
  addCustomEqualityTesters,
  getCustomEqualityTesters,
} from "./_custom_equality_tester.js";
import { equal } from "./_equal.js";
import { getExtendMatchers, setExtendMatchers } from "./_extend.js";
import {
  toBe,
  toBeCloseTo,
  toBeDefined,
  toBeFalsy,
  toBeGreaterThan,
  toBeGreaterThanOrEqual,
  toBeInstanceOf,
  toBeLessThan,
  toBeLessThanOrEqual,
  toBeNaN,
  toBeNull,
  toBeTruthy,
  toBeUndefined,
  toContain,
  toContainEqual,
  toEqual,
  toHaveBeenCalled,
  toHaveBeenCalledTimes,
  toHaveBeenCalledWith,
  toHaveBeenLastCalledWith,
  toHaveBeenNthCalledWith,
  toHaveLastReturnedWith,
  toHaveLength,
  toHaveNthReturnedWith,
  toHaveProperty,
  toHaveReturned,
  toHaveReturnedTimes,
  toHaveReturnedWith,
  toMatch,
  toMatchObject,
  toStrictEqual,
  toThrow,
} from "./_matchers.js";
import { addSerializer } from "./_serializer.js";
import { isPromiseLike } from "./_utils.js";
import * as asymmetricMatchers from "./_asymmetric_matchers.js";
const matchers = {
  lastCalledWith: toHaveBeenLastCalledWith,
  lastReturnedWith: toHaveLastReturnedWith,
  nthCalledWith: toHaveBeenNthCalledWith,
  nthReturnedWith: toHaveNthReturnedWith,
  toBeCalled: toHaveBeenCalled,
  toBeCalledTimes: toHaveBeenCalledTimes,
  toBeCalledWith: toHaveBeenCalledWith,
  toBeCloseTo,
  toBeDefined,
  toBeFalsy,
  toBeGreaterThanOrEqual,
  toBeGreaterThan,
  toBeInstanceOf,
  toBeLessThanOrEqual,
  toBeLessThan,
  toBeNaN,
  toBeNull,
  toBeTruthy,
  toBeUndefined,
  toBe,
  toContainEqual,
  toContain,
  toEqual,
  toHaveBeenCalledTimes,
  toHaveBeenCalledWith,
  toHaveBeenCalled,
  toHaveBeenLastCalledWith,
  toHaveBeenNthCalledWith,
  toHaveLength,
  toHaveLastReturnedWith,
  toHaveNthReturnedWith,
  toHaveProperty,
  toHaveReturnedTimes,
  toHaveReturnedWith,
  toHaveReturned,
  toMatchObject,
  toMatch,
  toReturn: toHaveReturned,
  toReturnTimes: toHaveReturnedTimes,
  toReturnWith: toHaveReturnedWith,
  toStrictEqual,
  toThrow,
};
/**
 * **Note:** the documentation for this module is taken from [Jest](https://github.com/jestjs/jest/blob/main/website/versioned_docs/version-29.7/ExpectAPI.md)
 * and the examples are updated for Deno.
 *
 * The `expect` function is used to test a value. You will use `expect` along with a
 * "matcher" function to assert something about a value.
 *
 * @example Usage
 * ```ts no-assert
 * import { expect } from "mod.js";
 *
 * function bestLaCroixFlavor(): string {
 *  return "grapefruit";
 * }
 *
 * Deno.test("the best flavor is grapefruit", () => {
 *  expect(bestLaCroixFlavor()).toBe("grapefruit");
 * });
 * ```
 *
 * In this case, `toBe` is the matcher function. There are a lot of different
 * matcher functions, documented in the main module description.
 *
 * The argument to `expect` should be the value that your code produces, and any
 * argument to the matcher should be the correct value. If you mix them up, your
 * tests will still work, but the error messages on failing tests will look
 * strange.
 *
 * @param value The value to perform assertions on.
 * @param customMessage An optional custom message to include in the assertion error.
 * @returns An expected object that can be used to chain matchers.
 *
 * @typeParam T The interface used for `expect`. This is usually needed only if you want to use `expect.extend` to create custom matchers.
 */
export function expect(value, customMessage) {
  let isNot = false;
  let isPromised = false;
  const self = new Proxy({}, {
    get(_, name) {
      if (name === "not") {
        isNot = !isNot;
        return self;
      }
      if (name === "resolves") {
        if (!isPromiseLike(value)) {
          throw new AssertionError("Expected value must be PromiseLike");
        }
        isPromised = true;
        return self;
      }
      if (name === "rejects") {
        if (!isPromiseLike(value)) {
          throw new AssertionError("Expected value must be a PromiseLike");
        }
        value = value.then((value) => {
          throw new AssertionError(
            `Promise did not reject: resolved to ${value}`,
          );
        }, (err) => err);
        isPromised = true;
        return self;
      }
      const extendMatchers = getExtendMatchers();
      const allMatchers = {
        ...matchers,
        ...extendMatchers,
      };
      const matcher = allMatchers[name];
      if (!matcher) {
        throw new TypeError(
          typeof name === "string"
            ? `matcher not found: ${name}`
            : "matcher not found",
        );
      }
      return (...args) => {
        function applyMatcher(value, args) {
          const context = {
            value,
            equal,
            isNot: false,
            customMessage,
            customTesters: getCustomEqualityTesters(),
          };
          if (isNot) {
            context.isNot = true;
          }
          if (name in extendMatchers) {
            const result = matcher(context, ...args);
            if (context.isNot) {
              if (result.pass) {
                throw new AssertionError(result.message());
              }
            } else if (!result.pass) {
              throw new AssertionError(result.message());
            }
          } else {
            matcher(context, ...args);
          }
          emitAssertionTrigger();
        }
        return isPromised
          ? value.then((value) => applyMatcher(value, args))
          : applyMatcher(value, args);
      };
    },
  });
  return self;
}
/**
 * You can use `expect.addEqualityTesters` to add your own methods to test if two
 * objects are equal. For example, let's say you have a class in your code that
 * represents volume and can determine if two volumes using different units are
 * equal. You may want `toEqual` (and other equality matchers) to use this custom
 * equality method when comparing to Volume classes. You can add a custom equality
 * tester to have `toEqual` detect and apply custom logic when comparing Volume
 * classes:
 *
 * @example
 * ```ts
 * import { expect } from "mod.js";
 *
 * class Volume {
 *   amount: number;
 *   unit: "L" | "mL";
 *
 *   constructor(amount: number, unit: "L" | "mL") {
 *     this.amount = amount;
 *     this.unit = unit;
 *   }
 *
 *   toString() {
 *     return `[Volume ${this.amount}${this.unit}]`;
 *   }
 *
 *   equals(other: Volume) {
 *     if (this.unit === other.unit) {
 *       return this.amount === other.amount;
 *     } else if (this.unit === "L" && other.unit === "mL") {
 *       return this.amount * 1000 === other.amount;
 *     } else {
 *       return this.amount === other.amount * 1000;
 *     }
 *   }
 * }
 *
 * function areVolumesEqual(a: Volume, b: Volume) {
 *   const isAVolume = a instanceof Volume;
 *   const isBVolume = b instanceof Volume;
 *   if (isAVolume && isBVolume) {
 *     return a.equals(b);
 *   } else if (isAVolume === isBVolume) {
 *     return undefined;
 *   } else {
 *     return false;
 *   }
 * }
 *
 * expect.addEqualityTesters([areVolumesEqual]);
 *
 * Deno.test("are equal with different units", () => {
 *   expect(new Volume(1, "L")).toEqual(new Volume(1000, "mL"));
 * });
 * ```
 */
expect.addEqualityTesters = addCustomEqualityTesters;
/**
 * Extend `expect()` with custom provided matchers.
 *
 * To do so, you will need to extend the interface `Expected` to define the new signature of the `expect`.
 *
 * ```ts
 * import type { Async, Expected } from "./expect.js";
 * import { expect } from "./expect.js";
 *
 * // Extends the `Expected` interface with your new matchers signatures
 * interface ExtendedExpected<IsAsync = false> extends Expected<IsAsync> {
 *   // Matcher that asserts value is a dinosaur
 *   toBeDinosaur: (options?: { includeTrexs?: boolean }) => unknown;
 *
 *   // NOTE: You also need to overrides the following typings to allow modifiers to correctly infer typing
 *   not: IsAsync extends true ? Async<ExtendedExpected<true>>
 *     : ExtendedExpected<false>;
 *   resolves: Async<ExtendedExpected<true>>;
 *   rejects: Async<ExtendedExpected<true>>;
 * }
 *
 * // Call `expect.extend()` with your new matchers definitions
 * expect.extend({
 *   toBeDinosaur(context, options) {
 *     const dino = `${context.value}`;
 *     const allowed = ["🦕"];
 *     if (options?.includeTrexs) {
 *       allowed.push("🦖");
 *     }
 *     const pass = allowed.includes(dino);
 *     if (context.isNot) {
 *       // Note: when `context.isNot` is set, the test is considered successful when `pass` is false
 *       return {
 *         message: () => `Expected "${dino}" to NOT be a dinosaur`,
 *         pass,
 *       };
 *     }
 *     return { message: () => `Expected "${dino}" to be a dinosaur`, pass };
 *   },
 * });
 *
 * // Alias expect to avoid having to pass the generic typing argument each time
 * // This is probably what you want to export and reuse across your tests
 * const myexpect = expect<ExtendedExpected>;
 *
 * // Perform some tests
 * myexpect("🦕").toBeDinosaur();
 * myexpect("🦧").not.toBeDinosaur();
 * await myexpect(Promise.resolve("🦕")).resolves.toBeDinosaur();
 * await myexpect(Promise.resolve("🦧")).resolves.not.toBeDinosaur();
 *
 * // Regular matchers will still be available
 * myexpect("foo").not.toBeNull()
 * myexpect.anything
 * ```
 */
expect.extend = setExtendMatchers;
/**
 * `expect.anything()` matches anything but `null` or `undefined`. You can use it
 * inside `toEqual` or `toHaveBeenCalledWith` instead of a literal value.
 *
 * @example
 * ```ts
 * import { expect, fn } from "mod.js";
 *
 * Deno.test("map calls its argument with a non-null argument", () => {
 *   const mock = fn();
 *   [1].map((x) => mock(x));
 *   expect(mock).toHaveBeenCalledWith(expect.anything());
 * });
```
 */
expect.anything = asymmetricMatchers.anything;
/**
 * `expect.any(constructor)` matches anything that was created with the given
 * constructor or if it's a primitive that is of the passed type. You can use it
 * inside `toEqual` or `toHaveBeenCalledWith` instead of a literal value.
 *
 * @example
 * ```ts
 * import { expect } from "mod.js";
 *
 * class Cat {}
 * Deno.test("expect.any()", () => {
 *   expect(new Cat()).toEqual(expect.any(Cat));
 *   expect("Hello").toEqual(expect.any(String));
 *   expect(1).toEqual(expect.any(Number));
 *   expect(() => {}).toEqual(expect.any(Function));
 *   expect(false).toEqual(expect.any(Boolean));
 *   expect(BigInt(1)).toEqual(expect.any(BigInt));
 *   expect(Symbol("sym")).toEqual(expect.any(Symbol));
 * });
 * ```
 */
expect.any = asymmetricMatchers.any;
/**
 * `expect.arrayContaining(array)` matches a received array which contains all of
 * the elements in the expected array. That is, the expected array is a **subset**
 * of the received array. Therefore, it matches a received array which contains
 * elements that are **not** in the expected array.
 *
 * You can use it instead of a literal value:
 *
 * - in `toEqual` or `toHaveBeenCalledWith`
 * - to match a property in `objectContaining` or `toMatchObject`
 *
 * @example
 * ```ts
 * import { expect } from "mod.js";
 *
 * Deno.test("expect.arrayContaining() with array of numbers", () => {
 *   const arr = [1, 2, 3];
 *   expect([1, 2, 3, 4]).toEqual(expect.arrayContaining(arr));
 *   expect([4, 5, 6]).not.toEqual(expect.arrayContaining(arr));
 *   expect([1, 2, 3]).toEqual(expect.arrayContaining(arr));
 * });
 * ```
 */
expect.arrayContaining = asymmetricMatchers.arrayContaining;
/**
 * `expect.closeTo(number, numDigits?)` is useful when comparing floating point
 * numbers in object properties or array item. If you need to compare a number,
 * please use `.toBeCloseTo` instead.
 *
 * The optional `numDigits` argument limits the number of digits to check **after**
 * the decimal point. For the default value `2`, the test criterion is
 * `Math.abs(expected - received) < 0.005 (that is, 10 ** -2 / 2)`.
 *
 * @example
 * ```ts
 * import { expect } from "mod.js";
 *
 * Deno.test("compare float in object properties", () => {
 *   expect({
 *     title: "0.1 + 0.2",
 *     sum: 0.1 + 0.2,
 *   }).toEqual({
 *     title: "0.1 + 0.2",
 *     sum: expect.closeTo(0.3, 5),
 *   });
 * });
 * ```
 */
expect.closeTo = asymmetricMatchers.closeTo;
/**
 * `expect.stringContaining(string)` matches the received value if it is a string
 * that contains the exact expected string.
 *
 * @example
 * ```ts
 * import { expect } from "mod.js";
 *
 * Deno.test("expect.stringContaining() with strings", () => {
 *   expect("https://deno.com/").toEqual(expect.stringContaining("deno"));
 *   expect("function").toEqual(expect.stringContaining("func"));
 *
 *   expect("Hello, World").not.toEqual(expect.stringContaining("hello"));
 *   expect("foobar").not.toEqual(expect.stringContaining("bazz"));
 * });
 * ```
 */
expect.stringContaining = asymmetricMatchers.stringContaining;
/**
 * `expect.stringMatching(string | regexp)` matches the received value if it is a
 * string that matches the expected string or regular expression.
 *
 * You can use it instead of a literal value:
 *
 * - in `toEqual` or `toHaveBeenCalledWith`
 * - to match an element in `arrayContaining`
 * - to match a property in `objectContaining` (not available yet) or `toMatchObject`
 *
 * @example
 * ```ts
 * import { expect } from "mod.js";
 *
 * Deno.test("example", () => {
 *   expect("deno_std").toEqual(expect.stringMatching(/std/));
 *   expect("0123456789").toEqual(expect.stringMatching(/\d+/));
 *   expect("e").not.toEqual(expect.stringMatching(/\s/));
 *   expect("queue").not.toEqual(expect.stringMatching(/en/));
 * });
 * ```
 */
expect.stringMatching = asymmetricMatchers.stringMatching;
/**
 * `expect.hasAssertions` verifies that at least one assertion is called during a test.
 *
 * Note: expect.hasAssertions only can use in bdd function test suite, such as `test` or `it`.
 *
 * @example
 * ```ts
 *
 * import { test } from "../testing/bdd.js";
 * import { expect } from "mod.js";
 *
 * test("it works", () => {
 *   expect.hasAssertions();
 *   expect("a").not.toBe("b");
 * });
 * ```
 */
expect.hasAssertions = hasAssertions;
/**
 * `expect.assertions` verifies that a certain number of assertions are called during a test.
 *
 * Note: expect.assertions only can use in bdd function test suite, such as `test` or `it`.
 *
 * @example
 * ```ts
 *
 * import { test } from "../testing/bdd.js";
 * import { expect } from "mod.js";
 *
 * test("it works", () => {
 *   expect.assertions(1);
 *   expect("a").not.toBe("b");
 * });
 * ```
 */
expect.assertions = assertions;
/**
 * `expect.objectContaining(object)` matches any received object that recursively matches the expected properties.
 * That is, the expected object is not a subset of the received object. Therefore, it matches a received object
 * which contains properties that are not in the expected object.
 *
 * @example
 * ```ts
 * import { expect } from "mod.js";
 *
 * Deno.test("example", () => {
 *   expect({ bar: 'baz' }).toEqual(expect.objectContaining({ bar: 'baz'}));
 *   expect({ bar: 'baz' }).not.toEqual(expect.objectContaining({ foo: 'bar'}));
 * });
 * ```
 */
expect.objectContaining = asymmetricMatchers.objectContaining;
/**
 * `expect.not.arrayContaining` matches a received array which does not contain
 * all of the elements in the expected array. That is, the expected array is not
 * a subset of the received array.
 *
 * `expect.not.objectContaining` matches any received object that does not recursively
 * match the expected properties. That is, the expected object is not a subset of the
 * received object. Therefore, it matches a received object which contains properties
 * that are not in the expected object.
 *
 * `expect.not.stringContaining` matches the received value if it is not a string
 * or if it is a string that does not contain the exact expected string.
 *
 * `expect.not.stringMatching` matches the received value if it is not a string
 * or if it is a string that does not match the expected string or regular expression.
 *
 * @example
 * ```ts
 * import { expect } from "mod.js";
 *
 * Deno.test("expect.not.arrayContaining", () => {
 *   const expected = ["Samantha"];
 *   expect(["Alice", "Bob", "Eve"]).toEqual(expect.not.arrayContaining(expected));
 * });
 *
 * Deno.test("expect.not.objectContaining", () => {
 *   const expected = { foo: "bar" };
 *   expect({ bar: "baz" }).toEqual(expect.not.objectContaining(expected));
 * });
 *
 * Deno.test("expect.not.stringContaining", () => {
 *   const expected = "Hello world!";
 *   expect("How are you?").toEqual(expect.not.stringContaining(expected));
 * });
 *
 * Deno.test("expect.not.stringMatching", () => {
 *   const expected = /Hello world!/;
 *   expect("How are you?").toEqual(expect.not.stringMatching(expected));
 * });
 * ```
 */
expect.not = {
  arrayContaining: asymmetricMatchers.arrayNotContaining,
  objectContaining: asymmetricMatchers.objectNotContaining,
  stringContaining: asymmetricMatchers.stringNotContaining,
  stringMatching: asymmetricMatchers.stringNotMatching,
};
/**
 * `expect.addSnapshotSerializer` adds a module that formats application-specific data structures.
 *
 * For an individual test file, an added module precedes any modules from snapshotSerializers configuration,
 * which precede the default snapshot serializers for built-in JavaScript types.
 * The last module added is the first module tested.
 *
 * @example
 * ```ts
 * import { expect } from "mod.js";
 * import serializerAnsi from "npm:jest-snapshot-serializer-ansi";
 *
 * expect.addSnapshotSerializer(serializerAnsi);
 * ```
 */
expect.addSnapshotSerializer = addSerializer;
