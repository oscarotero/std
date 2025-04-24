// Copyright 2018-2025 the Deno authors. MIT license.
export const padding = "=".charCodeAt(0);
export const alphabet = {
  base32: new TextEncoder().encode("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"),
  base32hex: new TextEncoder().encode("0123456789ABCDEFGHIJKLMNOPQRSTUV"),
  base32crockford: new TextEncoder().encode("0123456789ABCDEFGHJKMNPQRSTVWXYZ"),
};
export const rAlphabet = {
  base32: new Uint8Array(128).fill(32), // alphabet.base32.length
  base32hex: new Uint8Array(128).fill(32),
  base32crockford: new Uint8Array(128).fill(32),
};
alphabet.base32
  .forEach((byte, i) => rAlphabet.base32[byte] = i);
alphabet.base32hex
  .forEach((byte, i) => rAlphabet.base32hex[byte] = i);
alphabet.base32crockford
  .forEach((byte, i) => rAlphabet.base32crockford[byte] = i);
/**
 * Calculate the output size needed to encode a given input size for
 * {@linkcode encodeIntoBase32}.
 *
 * @param rawSize The size of the input buffer.
 * @returns The size of the output buffer.
 *
 * @example Basic Usage
 * ```ts
 * import { assertEquals } from "../assert/mod.js";
 * import { calcSizeBase32 } from "unstable_base32.js";
 *
 * assertEquals(calcSizeBase32(1), 8);
 * ```
 */
export function calcSizeBase32(rawSize) {
  return ((rawSize + 4) / 5 | 0) * 8;
}
export function encode(buffer, i, o, alphabet, padding) {
  i += 4;
  for (; i < buffer.length; i += 5) {
    let x = (buffer[i - 4] << 16) | (buffer[i - 3] << 8) | buffer[i - 2];
    buffer[o++] = alphabet[x >> 19];
    buffer[o++] = alphabet[x >> 14 & 0x1F];
    buffer[o++] = alphabet[x >> 9 & 0x1F];
    buffer[o++] = alphabet[x >> 4 & 0x1F];
    x = (x << 16) | (buffer[i - 1] << 8) | buffer[i];
    buffer[o++] = alphabet[x >> 15 & 0x1F];
    buffer[o++] = alphabet[x >> 10 & 0x1F];
    buffer[o++] = alphabet[x >> 5 & 0x1F];
    buffer[o++] = alphabet[x & 0x1F];
  }
  switch (i) {
    case buffer.length + 3: {
      const x = buffer[i - 4] << 16;
      buffer[o++] = alphabet[x >> 19];
      buffer[o++] = alphabet[x >> 14 & 0x1F];
      buffer[o++] = padding;
      buffer[o++] = padding;
      buffer[o++] = padding;
      buffer[o++] = padding;
      buffer[o++] = padding;
      buffer[o++] = padding;
      break;
    }
    case buffer.length + 2: {
      const x = (buffer[i - 4] << 16) | (buffer[i - 3] << 8);
      buffer[o++] = alphabet[x >> 19];
      buffer[o++] = alphabet[x >> 14 & 0x1F];
      buffer[o++] = alphabet[x >> 9 & 0x1F];
      buffer[o++] = alphabet[x >> 4 & 0x1F];
      buffer[o++] = padding;
      buffer[o++] = padding;
      buffer[o++] = padding;
      buffer[o++] = padding;
      break;
    }
    case buffer.length + 1: {
      let x = (buffer[i - 4] << 16) | (buffer[i - 3] << 8) | buffer[i - 2];
      buffer[o++] = alphabet[x >> 19];
      buffer[o++] = alphabet[x >> 14 & 0x1F];
      buffer[o++] = alphabet[x >> 9 & 0x1F];
      buffer[o++] = alphabet[x >> 4 & 0x1F];
      x <<= 16;
      buffer[o++] = alphabet[x >> 15 & 0x1F];
      buffer[o++] = padding;
      buffer[o++] = padding;
      buffer[o++] = padding;
      break;
    }
    case buffer.length: {
      let x = (buffer[i - 4] << 16) | (buffer[i - 3] << 8) | buffer[i - 2];
      buffer[o++] = alphabet[x >> 19];
      buffer[o++] = alphabet[x >> 14 & 0x1F];
      buffer[o++] = alphabet[x >> 9 & 0x1F];
      buffer[o++] = alphabet[x >> 4 & 0x1F];
      x = (x << 16) | (buffer[i - 1] << 8);
      buffer[o++] = alphabet[x >> 15 & 0x1F];
      buffer[o++] = alphabet[x >> 10 & 0x1F];
      buffer[o++] = alphabet[x >> 5 & 0x1F];
      buffer[o++] = padding;
      break;
    }
  }
  return o;
}
export function decode(buffer, i, o, alphabet, padding) {
  for (let x = buffer.length - 6; x < buffer.length; ++x) {
    if (buffer[x] === padding) {
      for (let y = x + 1; y < buffer.length; ++y) {
        if (buffer[y] !== padding) {
          throw new TypeError(
            `Cannot decode input as base32: Invalid character (${
              String.fromCharCode(buffer[y])
            })`,
          );
        }
      }
      buffer = buffer.subarray(0, x);
      break;
    }
  }
  switch ((buffer.length - o) % 8) {
    case 6:
    case 3:
    case 1:
      throw new RangeError(
        `Cannot decode input as base32: Length (${
          buffer.length - o
        }), excluding padding, must not have a remainder of 1, 3, or 6 when divided by 8`,
      );
  }
  i += 7;
  for (; i < buffer.length; i += 8) {
    let x = (getByte(buffer[i - 7], alphabet) << 19) |
      (getByte(buffer[i - 6], alphabet) << 14) |
      (getByte(buffer[i - 5], alphabet) << 9) |
      (getByte(buffer[i - 4], alphabet) << 4);
    buffer[o++] = x >> 16;
    buffer[o++] = x >> 8 & 0xFF;
    x = (x << 16) |
      (getByte(buffer[i - 3], alphabet) << 15) |
      (getByte(buffer[i - 2], alphabet) << 10) |
      (getByte(buffer[i - 1], alphabet) << 5) |
      getByte(buffer[i], alphabet);
    buffer[o++] = x >> 16 & 0xFF;
    buffer[o++] = x >> 8 & 0xFF;
    buffer[o++] = x & 0xFF;
  }
  switch (i) {
    case buffer.length + 5: {
      const x = (getByte(buffer[i - 7], alphabet) << 19) |
        (getByte(buffer[i - 6], alphabet) << 14);
      buffer[o++] = x >> 16;
      break;
    }
    case buffer.length + 3: {
      const x = (getByte(buffer[i - 7], alphabet) << 19) |
        (getByte(buffer[i - 6], alphabet) << 14) |
        (getByte(buffer[i - 5], alphabet) << 9) |
        (getByte(buffer[i - 4], alphabet) << 4);
      buffer[o++] = x >> 16;
      buffer[o++] = x >> 8 & 0xFF;
      break;
    }
    case buffer.length + 2: {
      let x = (getByte(buffer[i - 7], alphabet) << 19) |
        (getByte(buffer[i - 6], alphabet) << 14) |
        (getByte(buffer[i - 5], alphabet) << 9) |
        (getByte(buffer[i - 4], alphabet) << 4);
      buffer[o++] = x >> 16;
      buffer[o++] = x >> 8 & 0xFF;
      x = (x << 16) |
        (getByte(buffer[i - 3], alphabet) << 15);
      buffer[o++] = x >> 16 & 0xFF;
      break;
    }
    case buffer.length: {
      let x = (getByte(buffer[i - 7], alphabet) << 19) |
        (getByte(buffer[i - 6], alphabet) << 14) |
        (getByte(buffer[i - 5], alphabet) << 9) |
        (getByte(buffer[i - 4], alphabet) << 4);
      buffer[o++] = x >> 16;
      buffer[o++] = x >> 8 & 0xFF;
      x = (x << 16) |
        (getByte(buffer[i - 3], alphabet) << 15) |
        (getByte(buffer[i - 2], alphabet) << 10) |
        (getByte(buffer[i - 1], alphabet) << 5);
      buffer[o++] = x >> 16 & 0xFF;
      buffer[o++] = x >> 8 & 0xFF;
      break;
    }
  }
  return o;
}
function getByte(char, alphabet) {
  const byte = alphabet[char] ?? 32;
  if (byte === 32) { // alphabet.Base32.length
    throw new TypeError(
      `Cannot decode input as base32: Invalid character (${
        String.fromCharCode(char)
      })`,
    );
  }
  return byte;
}
