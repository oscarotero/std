// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { bytesToUuid, uuidToBytes } from "./_common.js";
import { concat } from "../bytes/concat.js";
import { crypto } from "../crypto/crypto.js";
import { validate as validateCommon } from "./common.js";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[3][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/**
 * Determines whether a string is a valid
 * {@link https://www.rfc-editor.org/rfc/rfc9562.html#section-5.3 | UUIDv3}.
 *
 * @param id UUID value.
 *
 * @returns `true` if the string is a valid UUIDv3, otherwise `false`.
 *
 * @example Usage
 * ```ts
 * import { validate } from "v3.js";
 * import { assert, assertFalse } from "../assert/mod.js";
 *
 * assert(validate("22fe6191-c161-3d86-a432-a81f343eda08"));
 * assertFalse(validate("this-is-not-a-uuid"));
 * ```
 */
export function validate(id) {
  return UUID_RE.test(id);
}
/**
 * Generates a
 * {@link https://www.rfc-editor.org/rfc/rfc9562.html#section-5.3 | UUIDv3}.
 *
 * @param namespace The namespace to use, encoded as a UUID.
 * @param data The data to hash to calculate the MD5 digest for the UUID.
 *
 * @returns A UUIDv3 string.
 *
 * @throws {TypeError} If the namespace is not a valid UUID.
 *
 * @example Usage
 * ```ts
 * import { NAMESPACE_URL } from "constants.js";
 * import { generate, validate } from "v3.js";
 * import { assert } from "../assert/mod.js";
 *
 * const data = new TextEncoder().encode("python.org");
 * const uuid = await generate(NAMESPACE_URL, data);
 *
 * assert(validate(uuid));
 * ```
 */
export async function generate(namespace, data) {
  if (!validateCommon(namespace)) {
    throw new TypeError(`Cannot generate UUID: invalid namespace ${namespace}`);
  }
  const namespaceBytes = uuidToBytes(namespace);
  const toHash = concat([namespaceBytes, data]);
  const buffer = await crypto.subtle.digest("MD5", toHash);
  const bytes = new Uint8Array(buffer);
  bytes[6] = (bytes[6] & 0x0f) | 0x30;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytesToUuid(bytes);
}
