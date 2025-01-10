// Copyright 2018-2025 the Deno authors. MIT license.
// Copyright the Browserify authors. MIT License.
import { basename } from "../path/basename.js";
import { normalize } from "../path/normalize.js";
import { toPathString } from "./_to_path_string.js";
/** Create {@linkcode WalkEntry} for the `path` synchronously. */
export function createWalkEntrySync(path) {
  path = toPathString(path);
  path = normalize(path);
  const name = basename(path);
  const info = Deno.statSync(path);
  return {
    path,
    name,
    isFile: info.isFile,
    isDirectory: info.isDirectory,
    isSymlink: info.isSymlink,
  };
}
/** Create {@linkcode WalkEntry} for the `path` asynchronously. */
export async function createWalkEntry(path) {
  path = toPathString(path);
  path = normalize(path);
  const name = basename(path);
  const info = await Deno.stat(path);
  return {
    path,
    name,
    isFile: info.isFile,
    isDirectory: info.isDirectory,
    isSymlink: info.isSymlink,
  };
}
