// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { bytesToUuid } from "./_common.js";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/**
 * Determines whether a string is a valid
 * {@link https://www.rfc-editor.org/rfc/rfc9562.html#section-5.1 | UUIDv1}.
 *
 * @param id UUID value.
 *
 * @returns `true` if the string is a valid UUIDv1, otherwise `false`.
 *
 * @example Usage
 * ```ts
 * import { validate } from "v1.js";
 * import { assert, assertFalse } from "../assert/mod.js";
 *
 * assert(validate("ea71fc60-a713-11ee-af61-8349da24f689"));
 * assertFalse(validate("fac8c1e0-ad1a-4204-a0d0-8126ae84495d"));
 * ```
 */
export function validate(id) {
  return UUID_RE.test(id);
}
let _nodeId;
let _clockseq;
let _lastMSecs = 0;
let _lastNSecs = 0;
/**
 * Generates a
 * {@link https://www.rfc-editor.org/rfc/rfc9562.html#section-5.1 | UUIDv1}.
 *
 * @param options Can use RFC time sequence values as overwrites.
 *
 * @returns Returns a UUIDv1 string or an array of 16 bytes.
 *
 * @example Usage
 * ```ts
 * import { generate, validate } from "v1.js";
 * import { assert } from "../assert/mod.js";
 *
 * const options = {
 *   node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
 *   clockseq: 0x1234,
 *   msecs: new Date("2011-11-01").getTime(),
 *   nsecs: 5678,
 * };
 *
 * const uuid = generate(options);
 * assert(validate(uuid as string));
 * ```
 */
export function generate(options = {}) {
  let i = 0;
  const b = [];
  let { node = _nodeId, clockseq = _clockseq } = options;
  if (node === undefined || clockseq === undefined) {
    // deno-lint-ignore no-explicit-any
    const seedBytes = options.random ??
      options.rng?.() ??
      crypto.getRandomValues(new Uint8Array(16));
    if (node === undefined) {
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1],
        seedBytes[2],
        seedBytes[3],
        seedBytes[4],
        seedBytes[5],
      ];
    }
    if (clockseq === undefined) {
      clockseq = _clockseq = ((seedBytes[6] << 8) | seedBytes[7]) & 0x3fff;
    }
  }
  let { msecs = new Date().getTime(), nsecs = _lastNSecs + 1 } = options;
  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000;
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = (clockseq + 1) & 0x3fff;
  }
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }
  if (nsecs > 10000) {
    throw new Error("Cannot create more than 10M uuids/sec");
  }
  if (node.length !== 6) {
    throw new Error(
      "Cannot create UUID: the node option must be an array of 6 bytes",
    );
  }
  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;
  // We have to add this value because "msecs" here is the number of
  // milliseconds since January 1, 1970, not since October 15, 1582.
  // This is also the milliseconds from October 15, 1582 to January 1, 1970.
  msecs += 12219292800000;
  const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = (tl >>> 24) & 0xff;
  b[i++] = (tl >>> 16) & 0xff;
  b[i++] = (tl >>> 8) & 0xff;
  b[i++] = tl & 0xff;
  const tmh = ((msecs / 0x100000000) * 10000) & 0xfffffff;
  b[i++] = (tmh >>> 8) & 0xff;
  b[i++] = tmh & 0xff;
  b[i++] = ((tmh >>> 24) & 0xf) | 0x10;
  b[i++] = (tmh >>> 16) & 0xff;
  b[i++] = (clockseq >>> 8) | 0x80;
  b[i++] = clockseq & 0xff;
  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }
  return bytesToUuid(b);
}
