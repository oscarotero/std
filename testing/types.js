// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// Copyright @dsherret and dsherret/conditional-type-checks contributors. All rights reserved. MIT license.
/**
 * Testing utilities for types.
 *
 * ```ts expect-error ignore
 * import { assertType, IsExact, IsNullable } from "types.js";
 *
 * const result = "some result" as string | number;
 *
 * // compile error if the type of `result` is not exactly `string | number`
 * assertType<IsExact<typeof result, string | number>>(true);
 *
 * // causes a compile error that `true` is not assignable to `false`
 * assertType<IsNullable<string>>(true); // error: string is not nullable
 * ```
 *
 * @module
 */
/**
 * Asserts at compile time that the provided type argument's type resolves to the expected boolean literal type.
 *
 * @example Usage
 * ```ts expect-error ignore
 * import { assertType, IsExact, IsNullable } from "types.js";
 *
 * const result = "some result" as string | number;
 *
 * // compile error if the type of `result` is not exactly `string | number`
 * assertType<IsExact<typeof result, string | number>>(true);
 *
 * // causes a compile error that `true` is not assignable to `false`
 * assertType<IsNullable<string>>(true); // error: string is not nullable
 * ```
 *
 * @typeParam T The expected type (`true` or `false`)
 * @param expectTrue True if the passed in type argument resolved to true.
 */
export function assertType(
  // deno-lint-ignore no-unused-vars
  expectTrue,
) {}
