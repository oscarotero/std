// Copyright 2018-2025 the Deno authors. MIT license.
/**
 * Calculate the output size needed to encode a given input size for
 * {@linkcode encodeRawHex}.
 *
 * @param originalSize The size of the input buffer.
 * @returns The size of the output buffer.
 *
 * @example Basic Usage
 * ```ts
 * import { assertEquals } from "../assert/mod.js";
 * import { calcMax } from "unstable_hex.js";
 *
 * assertEquals(calcMax(1), 2);
 * ```
 */
export function calcMax(originalSize) {
  return originalSize * 2;
}
export function encode(buffer, i, o, alphabet) {
  for (; i < buffer.length; ++i) {
    const x = buffer[i];
    buffer[o++] = alphabet[x >> 4];
    buffer[o++] = alphabet[x & 0xF];
  }
  return o;
}
export function decode(buffer, i, o, alphabet) {
  if ((buffer.length - o) % 2 === 1) {
    throw new RangeError(
      `Cannot decode input as hex: Length (${
        buffer.length - o
      }) must be divisible by 2`,
    );
  }
  i += 1;
  for (; i < buffer.length; i += 2) {
    buffer[o++] = (getByte(buffer[i - 1], alphabet) << 4) |
      getByte(buffer[i], alphabet);
  }
  return o;
}
function getByte(char, alphabet) {
  const byte = alphabet[char] ?? 16;
  if (byte === 16) { // alphabet.Hex.length
    throw new TypeError(
      `Cannot decode input as hex: Invalid character (${
        String.fromCharCode(char)
      })`,
    );
  }
  return byte;
}
