// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/**
 * Converts a string into a {@link https://en.wikipedia.org/wiki/Clean_URL#Slug | slug}.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @example Usage
 * ```ts
 * import { slugify } from "unstable_slugify.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * assertEquals(slugify("hello world"), "hello-world");
 * assertEquals(slugify("déjà vu"), "deja-vu");
 * ```
 *
 * @param input The string that is going to be converted into a slug
 * @returns The string as a slug
 */
export function slugify(input) {
  return input
    .trim()
    .normalize("NFD")
    .replaceAll(/[^a-zA-Z0-9\s-]/g, "")
    .replaceAll(/\s+|-+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .toLowerCase();
}
