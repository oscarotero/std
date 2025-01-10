// Copyright 2018-2025 the Deno authors. MIT license.
import { dirname } from "../path/dirname.js";
import { ensureDir, ensureDirSync } from "./ensure_dir.js";
import { toPathString } from "./_to_path_string.js";
/**
 * Asynchronously ensures that the hard link exists.
 *
 * If the parent directories for the hard link do not exist, they are created.
 *
 * Requires `--allow-read` and `--allow-write` permissions.
 *
 * @see {@link https://docs.deno.com/runtime/manual/basics/permissions#file-system-access}
 * for more information on Deno's permissions system.
 *
 * @param src The source file path as a string or URL. Directory hard links are
 * not allowed.
 * @param dest The destination link path as a string or URL.
 *
 * @returns A void promise that resolves once the hard link exists.
 *
 * @example Usage
 * ```ts ignore
 * import { ensureLink } from "ensure_link.js";
 *
 * await ensureLink("./folder/targetFile.dat", "./folder/targetFile.link.dat");
 * ```
 */
export async function ensureLink(src, dest) {
  dest = toPathString(dest);
  await ensureDir(dirname(dest));
  await Deno.link(toPathString(src), dest);
}
/**
 * Synchronously ensures that the hard link exists.
 *
 * If the parent directories for the hard link do not exist, they are created.
 *
 * Requires `--allow-read` and `--allow-write` permissions.
 *
 * @see {@link https://docs.deno.com/runtime/manual/basics/permissions#file-system-access}
 * for more information on Deno's permissions system.
 *
 * @param src The source file path as a string or URL. Directory hard links are
 * not allowed.
 * @param dest The destination link path as a string or URL.
 *
 * @returns A void value that returns once the hard link exists.
 *
 * @example Usage
 * ```ts ignore
 * import { ensureLinkSync } from "ensure_link.js";
 *
 * ensureLinkSync("./folder/targetFile.dat", "./folder/targetFile.link.dat");
 * ```
 */
export function ensureLinkSync(src, dest) {
  dest = toPathString(dest);
  ensureDirSync(dirname(dest));
  Deno.linkSync(toPathString(src), dest);
}
