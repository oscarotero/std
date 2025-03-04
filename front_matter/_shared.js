// Copyright 2018-2025 the Deno authors. MIT license.
export function extractFrontMatter(input, extractRegExp) {
  const groups = extractRegExp.exec(input)?.groups;
  if (!groups) {
    throw new TypeError("Unexpected end of input");
  }
  const { frontMatter = "", body = "" } = groups;
  return { frontMatter, body };
}
