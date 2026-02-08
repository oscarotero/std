// Copyright 2018-2026 the Deno authors. MIT license.
// This module is browser compatible.
const rawToEntityEntries = [
  ["&", "&amp;"],
  ["<", "&lt;"],
  [">", "&gt;"],
  ['"', "&quot;"],
  ["'", "&#39;"],
];
const defaultEntityList = Object.fromEntries([
  ...rawToEntityEntries.map(([raw, entity]) => [entity, raw]),
  ["&apos;", "'"],
  ["&nbsp;", "\xa0"],
]);
const rawToEntity = new Map(rawToEntityEntries);
const rawRe = new RegExp(`[${[...rawToEntity.keys()].join("")}]`, "g");
/**
 * Escapes text for safe interpolation into HTML text content and quoted attributes.
 *
 * @example Usage
 * ```ts
 * import { escape } from "entities.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * assertEquals(escape("<>'&AA"), "&lt;&gt;&#39;&amp;AA");
 *
 * // Characters that don't need to be escaped will be left alone,
 * // even if named HTML entities exist for them.
 * assertEquals(escape("þð"), "þð");
 * ```
 *
 * @param str The string to escape.
 * @returns The escaped string.
 */
export function escape(str) {
  return str.replaceAll(rawRe, (m) => rawToEntity.get(m));
}
const defaultUnescapeOptions = {
  entityList: defaultEntityList,
};
const MAX_CODE_POINT = 0x10ffff;
const RX_DEC_ENTITY = /&#([0-9]+);/g;
const RX_HEX_ENTITY = /&#x(\p{AHex}+);/gu;
const entityListRegexCache = new WeakMap();
/**
 * Unescapes HTML entities in text.
 *
 * Default options only handle `&<>'"` and numeric entities.
 *
 * @example Basic usage
 * ```ts
 * import { unescape } from "entities.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * assertEquals(unescape("&lt;&gt;&#39;&amp;AA"), "<>'&AA");
 * assertEquals(unescape("&thorn;&eth;"), "&thorn;&eth;");
 * ```
 *
 * @example Using a custom entity list
 *
 * This uses the full named entity list from the HTML spec (~47K un-minified)
 *
 * ```ts
 * import { unescape } from "entities.js";
 * import entityList from "named_entity_list.json.ts" with { type: "json" };
 * import { assertEquals } from "../assert/mod.js";
 *
 * assertEquals(unescape("&lt;&gt;&#39;&amp;AA", { entityList }), "<>'&AA");
 * ```
 *
 * @param str The string to unescape.
 * @param options Options for unescaping.
 * @returns The unescaped string.
 */
export function unescape(str, options = {}) {
  const { entityList } = { ...defaultUnescapeOptions, ...options };
  let entityRe = entityListRegexCache.get(entityList);
  if (!entityRe) {
    entityRe = new RegExp(
      `(${
        Object.keys(entityList)
          .sort((a, b) => b.length - a.length)
          .join("|")
      })`,
      "g",
    );
    entityListRegexCache.set(entityList, entityRe);
  }
  return str
    .replaceAll(entityRe, (m) => entityList[m])
    .replaceAll(RX_DEC_ENTITY, (_, dec) => codePointStrToChar(dec, 10))
    .replaceAll(RX_HEX_ENTITY, (_, hex) => codePointStrToChar(hex, 16));
}
function codePointStrToChar(codePointStr, radix) {
  const codePoint = parseInt(codePointStr, radix);
  return codePoint > MAX_CODE_POINT ? "�" : String.fromCodePoint(codePoint);
}
