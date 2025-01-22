// Copyright 2018-2025 the Deno authors. MIT license.
export function toDirEntry(s) {
  return {
    name: s.name,
    isFile: s.isFile(),
    isDirectory: s.isDirectory(),
    isSymlink: s.isSymbolicLink(),
  };
}
