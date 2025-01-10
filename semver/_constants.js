// Copyright 2018-2025 the Deno authors. MIT license.
/**
 * The minimum valid SemVer object. Equivalent to `0.0.0`.
 */
export const MIN = {
  major: 0,
  minor: 0,
  patch: 0,
  prerelease: [],
  build: [],
};
/**
 * ANY is a sentinel value used by some range calculations. It is not a valid
 * SemVer object and should not be used directly.
 */
export const ANY = {
  major: Number.NaN,
  minor: Number.NaN,
  patch: Number.NaN,
  prerelease: [],
  build: [],
};
/**
 * A comparator which will span all valid semantic versions
 */
export const ALL = {
  operator: undefined,
  ...ANY,
};
export const OPERATORS = [
  undefined,
  "=",
  "!=",
  ">",
  ">=",
  "<",
  "<=",
];
