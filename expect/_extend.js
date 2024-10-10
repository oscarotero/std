// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
let extendMatchers = {};
export function getExtendMatchers() {
  return extendMatchers;
}
export function setExtendMatchers(newExtendMatchers) {
  extendMatchers = {
    ...extendMatchers,
    ...newExtendMatchers,
  };
}
