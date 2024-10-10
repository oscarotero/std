// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { bytesToUuid, uuidToBytes } from "./_common.js";
import { concat } from "../bytes/concat.js";
import { validate as validateCommon } from "./common.js";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/**
 * Determines whether a string is a valid
 * {@link https://www.rfc-editor.org/rfc/rfc9562.html#section-5.5 | UUIDv5}.
 *
 * @param id UUID value.
 *
 * @returns `true` if the string is a valid UUIDv5, otherwise `false`.
 *
 * @example Usage
 * ```ts
 * import { validate } from "v5.js";
 * import { assert, assertFalse } from "../assert/mod.js";
 *
 * assert(validate("7af94e2b-4dd9-50f0-9c9a-8a48519bdef0"));
 * assertFalse(validate(crypto.randomUUID()));
 * ```
 */
export function validate(id) {
  return UUID_RE.test(id);
}
/**
 * Generates a
 * {@link https://www.rfc-editor.org/rfc/rfc9562.html#section-5.5 | UUIDv5}.
 *
 * @param namespace The namespace to use, encoded as a UUID.
 * @param data The data to hash to calculate the SHA-1 digest for the UUID.
 *
 * @returns A UUIDv5 string.
 *
 * @throws {TypeError} If the namespace is not a valid UUID.
 *
 * @example Usage
 * ```ts
 * import { NAMESPACE_URL } from "constants.js";
 * import { generate, validate } from "v5.js";
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
  const buffer = await crypto.subtle.digest("sha-1", toHash);
  const bytes = new Uint8Array(buffer);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytesToUuid(bytes);
}
