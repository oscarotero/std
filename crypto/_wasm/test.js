// Copyright 2018-2025 the Deno authors. MIT license.
import { assertEquals } from "../../assert/mod.js";
import { instantiateWasm } from "./mod.js";
const webCrypto = globalThis.crypto;
Deno.test("test", async () => {
  const input = new TextEncoder().encode("SHA-384");
  const wasmCrypto = instantiateWasm();
  const wasmDigest = wasmCrypto.digest("SHA-384", input, undefined);
  const webDigest = new Uint8Array(
    await webCrypto.subtle.digest("SHA-384", input),
  );
  assertEquals(wasmDigest, webDigest);
});
