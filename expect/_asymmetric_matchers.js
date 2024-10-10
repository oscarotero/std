// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// deno-lint-ignore-file no-explicit-any
export class AsymmetricMatcher {
  value;
  constructor(value) {
    this.value = value;
  }
}
export class Anything extends AsymmetricMatcher {
  equals(other) {
    return other !== null && other !== undefined;
  }
}
export function anything() {
  return new Anything();
}
export class Any extends AsymmetricMatcher {
  constructor(value) {
    if (value === undefined) {
      throw new TypeError("Expected a constructor function");
    }
    super(value);
  }
  equals(other) {
    if (typeof other === "object") {
      return other instanceof this.value;
    } else {
      if (this.value === Number) {
        return typeof other === "number";
      }
      if (this.value === String) {
        return typeof other === "string";
      }
      if (this.value === Number) {
        return typeof other === "number";
      }
      if (this.value === Function) {
        return typeof other === "function";
      }
      if (this.value === Boolean) {
        return typeof other === "boolean";
      }
      if (this.value === BigInt) {
        return typeof other === "bigint";
      }
      if (this.value === Symbol) {
        return typeof other === "symbol";
      }
    }
    return false;
  }
}
export function any(c) {
  return new Any(c);
}
export class ArrayContaining extends AsymmetricMatcher {
  constructor(arr) {
    super(arr);
  }
  equals(other) {
    return Array.isArray(other) && this.value.every((e) => other.includes(e));
  }
}
export function arrayContaining(c) {
  return new ArrayContaining(c);
}
export class CloseTo extends AsymmetricMatcher {
  #precision;
  constructor(num, precision = 2) {
    super(num);
    this.#precision = precision;
  }
  equals(other) {
    if (typeof other !== "number") {
      return false;
    }
    if (
      (this.value === Number.POSITIVE_INFINITY &&
        other === Number.POSITIVE_INFINITY) ||
      (this.value === Number.NEGATIVE_INFINITY &&
        other === Number.NEGATIVE_INFINITY)
    ) {
      return true;
    }
    return Math.abs(this.value - other) < Math.pow(10, -this.#precision) / 2;
  }
}
export function closeTo(num, numDigits) {
  return new CloseTo(num, numDigits);
}
export class StringContaining extends AsymmetricMatcher {
  constructor(str) {
    super(str);
  }
  equals(other) {
    if (typeof other !== "string") {
      return false;
    }
    return other.includes(this.value);
  }
}
export function stringContaining(str) {
  return new StringContaining(str);
}
export class StringMatching extends AsymmetricMatcher {
  constructor(pattern) {
    super(new RegExp(pattern));
  }
  equals(other) {
    if (typeof other !== "string") {
      return false;
    }
    return this.value.test(other);
  }
}
export function stringMatching(pattern) {
  return new StringMatching(pattern);
}
