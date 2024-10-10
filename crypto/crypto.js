// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Extensions to the
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API | Web Crypto API}
 * supporting additional encryption APIs, but also delegating to the built-in
 * APIs when possible.
 *
 * Provides additional digest algorithms that are not part of the WebCrypto
 * standard as well as a `subtle.digest` and `subtle.digestSync` methods.
 *
 * The {@linkcode KeyStack} export implements the {@linkcode KeyRing} interface
 * for managing rotatable keys for signing data to prevent tampering, like with
 * HTTP cookies.
 *
 * ## Supported algorithms
 *
 * Here is a list of supported algorithms. If the algorithm name in WebCrypto
 * and Wasm/Rust is the same, this library prefers to use the implementation
 * provided by WebCrypto.
 *
 * Length-adjustable algorithms support the
 * {@linkcode DigestAlgorithmObject.length} option.
 *
 * WebCrypto:
 * - `SHA-384`
 * - `SHA-256` (length-extendable)
 * - `SHA-512` (length-extendable)
 *
 * Wasm/Rust:
 * - `BLAKE2B`
 * - `BLAKE2B-128`
 * - `BLAKE2B-160`
 * - `BLAKE2B-224`
 * - `BLAKE2B-256`
 * - `BLAKE2B-384`
 * - `BLAKE2S`
 * - `BLAKE3` (length-adjustable)
 * - `KECCAK-224`
 * - `KECCAK-256`
 * - `KECCAK-384`
 * - `KECCAK-512`
 * - `SHA-384`
 * - `SHA3-224`
 * - `SHA3-256`
 * - `SHA3-384`
 * - `SHA3-512`
 * - `SHAKE128` (length-adjustable)
 * - `SHAKE256` (length-adjustable)
 * - `TIGER`
 * - `RIPEMD-160` (length-extendable)
 * - `SHA-224` (length-extendable)
 * - `SHA-256` (length-extendable)
 * - `SHA-512` (length-extendable)
 * - `MD4` (length-extendable and collidable)
 * - `MD5` (length-extendable and collidable)
 * - `SHA-1` (length-extendable and collidable)
 * - `FNV32` (non-cryptographic)
 * - `FNV32A` (non-cryptographic)
 * - `FNV64` (non-cryptographic)
 * - `FNV64A` (non-cryptographic)
 *
 * @example
 * ```ts
 * import { crypto } from "mod.js";
 *
 * // This will delegate to the runtime's WebCrypto implementation.
 * console.log(
 *   new Uint8Array(
 *     await crypto.subtle.digest(
 *       "SHA-384",
 *       new TextEncoder().encode("hello world"),
 *     ),
 *   ),
 * );
 *
 * // This will use a bundled Wasm/Rust implementation.
 * console.log(
 *   new Uint8Array(
 *     await crypto.subtle.digest(
 *       "BLAKE3",
 *       new TextEncoder().encode("hello world"),
 *     ),
 *   ),
 * );
 * ```
 *
 * @example Convert hash to a string
 *
 * ```ts
 * import {
 *   crypto,
 * } from "mod.js";
 * import { encodeHex } from "../encoding/hex.ts"
 * import { encodeBase64 } from "../encoding/base64.ts"
 *
 * const hash = await crypto.subtle.digest(
 *   "SHA-384",
 *   new TextEncoder().encode("You hear that Mr. Anderson?"),
 * );
 *
 * // Hex encoding
 * console.log(encodeHex(hash));
 *
 * // Or with base64 encoding
 * console.log(encodeBase64(hash));
 * ```
 *
 * @module
 */
import { DIGEST_ALGORITHM_NAMES, instantiateWasm } from "./_wasm/mod.js";
export { DIGEST_ALGORITHM_NAMES };
/** Digest algorithms supported by WebCrypto. */
const WEB_CRYPTO_DIGEST_ALGORITHM_NAMES = [
  "SHA-384",
  "SHA-256",
  "SHA-512",
  // insecure (length-extendable and collidable):
  "SHA-1",
];
/**
 * A copy of the global WebCrypto interface, with methods bound so they're
 * safe to re-export.
 */
const webCrypto = ((crypto) => ({
  getRandomValues: crypto.getRandomValues?.bind(crypto),
  randomUUID: crypto.randomUUID?.bind(crypto),
  subtle: {
    decrypt: crypto.subtle?.decrypt?.bind(crypto.subtle),
    deriveBits: crypto.subtle?.deriveBits?.bind(crypto.subtle),
    deriveKey: crypto.subtle?.deriveKey?.bind(crypto.subtle),
    digest: crypto.subtle?.digest?.bind(crypto.subtle),
    encrypt: crypto.subtle?.encrypt?.bind(crypto.subtle),
    exportKey: crypto.subtle?.exportKey?.bind(crypto.subtle),
    generateKey: crypto.subtle?.generateKey?.bind(crypto.subtle),
    importKey: crypto.subtle?.importKey?.bind(crypto.subtle),
    sign: crypto.subtle?.sign?.bind(crypto.subtle),
    unwrapKey: crypto.subtle?.unwrapKey?.bind(crypto.subtle),
    verify: crypto.subtle?.verify?.bind(crypto.subtle),
    wrapKey: crypto.subtle?.wrapKey?.bind(crypto.subtle),
  },
}))(globalThis.crypto);
function toUint8Array(data) {
  if (data instanceof Uint8Array) {
    return data;
  } else if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  } else if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }
  return undefined;
}
/**
 * An wrapper for WebCrypto adding support for additional non-standard
 * algorithms, but delegating to the runtime WebCrypto implementation whenever
 * possible.
 */
const stdCrypto = ((x) => x)({
  ...webCrypto,
  subtle: {
    ...webCrypto.subtle,
    /**
     * Polyfills stream support until the Web Crypto API does so:
     * @see {@link https://github.com/wintercg/proposal-webcrypto-streams}
     */
    async digest(algorithm, data) {
      const { name, length } = normalizeAlgorithm(algorithm);
      assertValidDigestLength(length);
      // We delegate to WebCrypto whenever possible,
      if (
        // if the algorithm is supported by the WebCrypto standard,
        WEB_CRYPTO_DIGEST_ALGORITHM_NAMES.includes(name) &&
        // and the data is a single buffer,
        isBufferSource(data)
      ) {
        return await webCrypto.subtle.digest(algorithm, data);
      } else if (DIGEST_ALGORITHM_NAMES.includes(name)) {
        if (isBufferSource(data)) {
          // Otherwise, we use our bundled Wasm implementation via digestSync
          // if it supports the algorithm.
          return stdCrypto.subtle.digestSync(algorithm, data);
        } else if (isIterable(data)) {
          return stdCrypto.subtle.digestSync(algorithm, data);
        } else if (isAsyncIterable(data)) {
          const wasmCrypto = instantiateWasm();
          const context = new wasmCrypto.DigestContext(name);
          for await (const chunk of data) {
            const chunkBytes = toUint8Array(chunk);
            if (!chunkBytes) {
              throw new TypeError(
                "Cannot digest the data: A chunk is not ArrayBuffer nor ArrayBufferView",
              );
            }
            context.update(chunkBytes);
          }
          return context.digestAndDrop(length).buffer;
        } else {
          throw new TypeError(
            "data must be a BufferSource or [Async]Iterable<BufferSource>",
          );
        }
      }
      // (TypeScript type definitions prohibit this case.) If they're trying
      // to call an algorithm we don't recognize, pass it along to WebCrypto
      // in case it's a non-standard algorithm supported by the the runtime
      // they're using.
      return await webCrypto.subtle.digest(algorithm, data);
    },
    digestSync(algorithm, data) {
      const { name, length } = normalizeAlgorithm(algorithm);
      assertValidDigestLength(length);
      const wasmCrypto = instantiateWasm();
      if (isBufferSource(data)) {
        const bytes = toUint8Array(data);
        return wasmCrypto.digest(name, bytes, length).buffer;
      }
      if (isIterable(data)) {
        const context = new wasmCrypto.DigestContext(name);
        for (const chunk of data) {
          const chunkBytes = toUint8Array(chunk);
          if (!chunkBytes) {
            throw new TypeError(
              "Cannot digest the data: A chunk is not ArrayBuffer nor ArrayBufferView",
            );
          }
          context.update(chunkBytes);
        }
        return context.digestAndDrop(length).buffer;
      }
      throw new TypeError(
        "data must be a BufferSource or Iterable<BufferSource>",
      );
    },
  },
});
/*
 * The largest digest length the current Wasm implementation can support. This
 * is the value of `isize::MAX` on 32-bit platforms like Wasm, which is the
 * maximum allowed capacity of a Rust `Vec<u8>`.
 */
const MAX_DIGEST_LENGTH = 0x7FFF_FFFF;
/**
 * Asserts that a number is a valid length for a digest, which must be an
 * integer that fits in a Rust `Vec<u8>`, or be undefined.
 */
function assertValidDigestLength(value) {
  if (
    value !== undefined &&
    (value < 0 || value > MAX_DIGEST_LENGTH ||
      !Number.isInteger(value))
  ) {
    throw new RangeError(
      `length must be an integer between 0 and ${MAX_DIGEST_LENGTH}, inclusive`,
    );
  }
}
function normalizeAlgorithm(algorithm) {
  return ((typeof algorithm === "string")
    ? { name: algorithm.toUpperCase() }
    : {
      ...algorithm,
      name: algorithm.name.toUpperCase(),
    });
}
function isBufferSource(obj) {
  return obj instanceof ArrayBuffer || ArrayBuffer.isView(obj);
}
function isIterable(obj) {
  return typeof obj[Symbol.iterator] === "function";
}
function isAsyncIterable(obj) {
  return typeof obj[Symbol.asyncIterator] === "function";
}
export { stdCrypto as crypto };