// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Format milliseconds to time duration.
 *
 * ```ts
 * import { format } from "duration.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * assertEquals(format(99674, { style: "digital" }), "00:00:01:39:674:000:000");
 *
 * assertEquals(format(99674), "0d 0h 1m 39s 674ms 0µs 0ns");
 *
 * assertEquals(format(99674, { ignoreZero: true }), "1m 39s 674ms");
 *
 * assertEquals(format(99674, { style: "full", ignoreZero: true }), "1 minutes, 39 seconds, 674 milliseconds");
 * ```
 * @module
 */
function addZero(num, digits) {
  return String(num).padStart(digits, "0");
}
const keyList = {
  d: "days",
  h: "hours",
  m: "minutes",
  s: "seconds",
  ms: "milliseconds",
  us: "microseconds",
  ns: "nanoseconds",
};
/** Parse milliseconds into a duration. */
function millisecondsToDurationObject(ms) {
  // Duration cannot be negative
  const millis = Math.abs(ms);
  const millisFraction = millis.toFixed(7).slice(-7, -1);
  return {
    d: Math.trunc(millis / 86400000),
    h: Math.trunc(millis / 3600000) % 24,
    m: Math.trunc(millis / 60000) % 60,
    s: Math.trunc(millis / 1000) % 60,
    ms: Math.trunc(millis) % 1000,
    us: +millisFraction.slice(0, 3),
    ns: +millisFraction.slice(3, 6),
  };
}
function durationArray(duration) {
  return [
    { type: "d", value: duration.d },
    { type: "h", value: duration.h },
    { type: "m", value: duration.m },
    { type: "s", value: duration.s },
    { type: "ms", value: duration.ms },
    { type: "us", value: duration.us },
    { type: "ns", value: duration.ns },
  ];
}
/**
 * Format milliseconds to time duration.
 *
 * @example Usage
 * ```ts
 * import { format } from "duration.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * assertEquals(format(99674, { style: "digital" }), "00:00:01:39:674:000:000");
 *
 * assertEquals(format(99674), "0d 0h 1m 39s 674ms 0µs 0ns");
 *
 * assertEquals(format(99674, { ignoreZero: true }), "1m 39s 674ms");
 *
 * assertEquals(format(99674, { style: "full", ignoreZero: true }), "1 minutes, 39 seconds, 674 milliseconds");
 * ```
 *
 * @param ms The milliseconds value to format
 * @param options The options for formatting
 * @returns The formatted string
 */
export function format(ms, options) {
  const { style = "narrow", ignoreZero = false } = options ?? {};
  const duration = millisecondsToDurationObject(ms);
  const durationArr = durationArray(duration);
  switch (style) {
    case "narrow": {
      if (ignoreZero) {
        return `${
          durationArr.filter((x) => x.value).map((x) =>
            `${x.value}${x.type === "us" ? "µs" : x.type}`
          )
            .join(" ")
        }`;
      }
      return `${
        durationArr.map((x) => `${x.value}${x.type === "us" ? "µs" : x.type}`)
          .join(" ")
      }`;
    }
    case "full": {
      if (ignoreZero) {
        return `${
          durationArr.filter((x) => x.value).map((x) =>
            `${x.value} ${keyList[x.type]}`
          ).join(", ")
        }`;
      }
      return `${
        durationArr.map((x) => `${x.value} ${keyList[x.type]}`).join(", ")
      }`;
    }
    case "digital": {
      const arr = durationArr.map((x) =>
        ["ms", "us", "ns"].includes(x.type)
          ? addZero(x.value, 3)
          : addZero(x.value, 2)
      );
      if (ignoreZero) {
        let cont = true;
        while (cont) {
          if (!Number(arr[arr.length - 1])) {
            arr.pop();
          } else {
            cont = false;
          }
        }
      }
      return arr.join(":");
    }
    default: {
      throw new TypeError(`style must be "narrow", "full", or "digital"!`);
    }
  }
}
