// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { globToRegExp } from "../path/glob_to_regexp.js";
import { joinGlobs } from "../path/join_globs.js";
import { isGlob } from "../path/is_glob.js";
import { isAbsolute } from "../path/is_absolute.js";
import { resolve } from "../path/resolve.js";
import { SEPARATOR_PATTERN } from "../path/constants.js";
import { walk, walkSync } from "./walk.js";
import { toPathString } from "./_to_path_string.js";
import { createWalkEntry, createWalkEntrySync } from "./_create_walk_entry.js";
const isWindows = Deno.build.os === "windows";
function split(path) {
  const s = SEPARATOR_PATTERN.source;
  const segments = path
    .replace(new RegExp(`^${s}|${s}$`, "g"), "")
    .split(SEPARATOR_PATTERN);
  const isAbsolute_ = isAbsolute(path);
  const split = {
    segments,
    isAbsolute: isAbsolute_,
    hasTrailingSep: path.match(new RegExp(`${s}$`)) !== null,
  };
  if (isWindows && isAbsolute_) {
    split.winRoot = segments.shift();
  }
  return split;
}
function throwUnlessNotFound(error) {
  if (!(error instanceof Deno.errors.NotFound)) {
    throw error;
  }
}
function comparePath(a, b) {
  if (a.path < b.path) {
    return -1;
  }
  if (a.path > b.path) {
    return 1;
  }
  return 0;
}
/**
 * Returns an async iterator that yields each file path matching the given glob
 * pattern.
 *
 * The file paths are absolute paths. If `root` is not provided, the current
 * working directory is used. The `root` directory is not included in the
 * yielded file paths.
 *
 * Requires `--allow-read` permission.
 *
 * @see {@link https://docs.deno.com/runtime/manual/basics/permissions#file-system-access}
 * for more information on Deno's permissions system.
 *
 * @param glob The glob pattern to expand.
 * @param options Additional options for the expansion.
 *
 * @returns An async iterator that yields each walk entry matching the glob
 * pattern.
 *
 * @example Basic usage
 *
 * File structure:
 * ```
 * folder
 * ├── script.ts
 * └── foo.ts
 * ```
 *
 * ```ts ignore
 * // script.ts
 * import { expandGlob } from "expand_glob.js";
 *
 * await Array.fromAsync(expandGlob("*.ts"));
 * // [
 * //   {
 * //     path: "/Users/user/folder/script.ts",
 * //     name: "script.ts",
 * //     isFile: true,
 * //     isDirectory: false,
 * //     isSymlink: false,
 * //   },
 * //   {
 * //     path: "/Users/user/folder/foo.ts",
 * //     name: "foo.ts",
 * //     isFile: true,
 * //     isDirectory: false,
 * //     isSymlink: false,
 * //   },
 * // ]
 * ```
 *
 * @example Define root directory
 *
 * Setting the `root` option to `/folder` will expand the glob pattern from the
 * `/folder` directory.
 *
 * File structure:
 * ```
 * folder
 * ├── subdir
 * │   └── bar.ts
 * ├── script.ts
 * └── foo.ts
 * ```
 *
 * ```ts ignore
 * // script.ts
 * import { expandGlob } from "expand_glob.js";
 *
 * await Array.fromAsync(expandGlob("*.ts", { root: "./subdir" }));
 * // [
 * //   {
 * //     path: "/Users/user/folder/subdir/bar.ts",
 * //     name: "bar.ts",
 * //     isFile: true,
 * //     isDirectory: false,
 * //     isSymlink: false,
 * //   },
 * // ]
 * ```
 *
 * @example Exclude files
 *
 * Setting the `exclude` option to `["foo.ts"]` will exclude the `foo.ts` file
 * from the expansion.
 *
 * File structure:
 * ```
 * folder
 * ├── script.ts
 * └── foo.ts
 * ```
 *
 * ```ts ignore
 * // script.ts
 * import { expandGlob } from "expand_glob.js";
 *
 * await Array.fromAsync(expandGlob("*.ts", { exclude: ["foo.ts"] }));
 * // [
 * //   {
 * //     path: "/Users/user/folder/script.ts",
 * //     name: "true.ts",
 * //     isFile: false,
 * //     isDirectory: false,
 * //     isSymlink: false,
 * //   },
 * // ]
 * ```
 *
 * @example Exclude directories
 *
 * Setting the `includeDirs` option to `false` will exclude directories from the
 * expansion.
 *
 * File structure:
 * ```
 * folder
 * ├── subdir
 * │   └── bar.ts
 * ├── script.ts
 * └── foo.ts
 * ```
 *
 * ```ts ignore
 * // script.ts
 * import { expandGlob } from "expand_glob.js";
 *
 * await Array.fromAsync(expandGlob("*", { includeDirs: false }));
 * // [
 * //   {
 * //     path: "/Users/user/folder/script.ts",
 * //     name: "script.ts",
 * //     isFile: true,
 * //     isDirectory: false,
 * //     isSymlink: false,
 * //   },
 * //   {
 * //     path: "/Users/user/folder/foo.ts",
 * //     name: "foo.ts",
 * //     isFile: true,
 * //     isDirectory: false,
 * //     isSymlink: false,
 * //   },
 * // ]
 * ```
 *
 * @example Follow symbolic links
 *
 * Setting the `followSymlinks` option to `true` will follow symbolic links.
 *
 * File structure:
 * ```
 * folder
 * ├── script.ts
 * └── link.ts -> script.ts (symbolic link)
 * ```
 *
 * ```ts ignore
 * // script.ts
 * import { expandGlob } from "expand_glob.js";
 *
 * await Array.fromAsync(expandGlob("*.ts", { followSymlinks: true }));
 * // [
 * //   {
 * //     path: "/Users/user/folder/script.ts",
 * //     name: "script.ts",
 * //     isFile: true,
 * //     isDirectory: false,
 * //     isSymlink: false,
 * //   },
 * //   {
 * //     path: "/Users/user/folder/symlink",
 * //     name: "symlink",
 * //     isFile: true,
 * //     isDirectory: false,
 * //     isSymlink: true,
 * //   },
 * // ]
 * ```
 */
export async function* expandGlob(glob, options) {
  let {
    root,
    exclude = [],
    includeDirs = true,
    extended = true,
    globstar = true,
    caseInsensitive = false,
    followSymlinks = false,
    canonicalize = true,
  } = options ?? {};
  const { segments, isAbsolute: isGlobAbsolute, hasTrailingSep, winRoot } =
    split(toPathString(glob));
  root ??= isGlobAbsolute ? winRoot ?? "/" : Deno.cwd();
  const globOptions = { extended, globstar, caseInsensitive };
  const absRoot = isGlobAbsolute ? root : resolve(root); // root is always string here
  const resolveFromRoot = (path) => resolve(absRoot, path);
  const excludePatterns = exclude
    .map(resolveFromRoot)
    .map((s) => globToRegExp(s, globOptions));
  const shouldInclude = (path) => !excludePatterns.some((p) => !!path.match(p));
  let fixedRoot = isGlobAbsolute ? winRoot ?? "/" : absRoot;
  while (segments.length > 0 && !isGlob(segments[0])) {
    const seg = segments.shift();
    fixedRoot = joinGlobs([fixedRoot, seg], globOptions);
  }
  let fixedRootInfo;
  try {
    fixedRootInfo = await createWalkEntry(fixedRoot);
  } catch (error) {
    return throwUnlessNotFound(error);
  }
  async function* advanceMatch(walkInfo, globSegment) {
    if (!walkInfo.isDirectory) {
      return;
    } else if (globSegment === "..") {
      const parentPath = joinGlobs([walkInfo.path, ".."], globOptions);
      if (shouldInclude(parentPath)) {
        return yield await createWalkEntry(parentPath);
      }
      return;
    } else if (globSegment === "**") {
      return yield* walk(walkInfo.path, {
        skip: excludePatterns,
        maxDepth: globstar ? Infinity : 1,
        followSymlinks,
        canonicalize,
      });
    }
    const globPattern = globToRegExp(globSegment, globOptions);
    for await (
      const walkEntry of walk(walkInfo.path, {
        maxDepth: 1,
        skip: excludePatterns,
        followSymlinks,
      })
    ) {
      if (
        walkEntry.path !== walkInfo.path &&
        walkEntry.name.match(globPattern)
      ) {
        yield walkEntry;
      }
    }
  }
  let currentMatches = [fixedRootInfo];
  for (const segment of segments) {
    // Advancing the list of current matches may introduce duplicates, so we
    // pass everything through this Map.
    const nextMatchMap = new Map();
    await Promise.all(currentMatches.map(async (currentMatch) => {
      for await (const nextMatch of advanceMatch(currentMatch, segment)) {
        nextMatchMap.set(nextMatch.path, nextMatch);
      }
    }));
    currentMatches = [...nextMatchMap.values()].sort(comparePath);
  }
  if (hasTrailingSep) {
    currentMatches = currentMatches.filter((entry) => entry.isDirectory);
  }
  if (!includeDirs) {
    currentMatches = currentMatches.filter((entry) => !entry.isDirectory);
  }
  yield* currentMatches;
}
/**
 * Returns an iterator that yields each file path matching the given glob
 * pattern. The file paths are relative to the provided `root` directory.
 * If `root` is not provided, the current working directory is used.
 * The `root` directory is not included in the yielded file paths.
 *
 * Requires the `--allow-read` flag.
 *
 * @see {@link https://docs.deno.com/runtime/manual/basics/permissions#file-system-access}
 * for more information on Deno's permissions system.
 *
 * @param glob The glob pattern to expand.
 * @param options Additional options for the expansion.
 *
 * @returns An iterator that yields each walk entry matching the glob pattern.
 *
 * @example Usage
 *
 * File structure:
 * ```
 * folder
 * ├── script.ts
 * └── foo.ts
 * ```
 *
 * ```ts ignore
 * // script.ts
 * import { expandGlobSync } from "expand_glob.js";
 *
 * const entries = [];
 * for (const entry of expandGlobSync("*.ts")) {
 *   entries.push(entry);
 * }
 *
 * entries[0]!.path; // "/Users/user/folder/script.ts"
 * entries[0]!.name; // "script.ts"
 * entries[0]!.isFile; // false
 * entries[0]!.isDirectory; // true
 * entries[0]!.isSymlink; // false
 *
 * entries[1]!.path; // "/Users/user/folder/foo.ts"
 * entries[1]!.name; // "foo.ts"
 * entries[1]!.isFile; // true
 * entries[1]!.isDirectory; // false
 * entries[1]!.isSymlink; // false
 * ```
 */
export function* expandGlobSync(glob, options) {
  let {
    root,
    exclude = [],
    includeDirs = true,
    extended = true,
    globstar = true,
    caseInsensitive = false,
    followSymlinks = false,
    canonicalize = true,
  } = options ?? {};
  const { segments, isAbsolute: isGlobAbsolute, hasTrailingSep, winRoot } =
    split(toPathString(glob));
  root ??= isGlobAbsolute ? winRoot ?? "/" : Deno.cwd();
  const globOptions = { extended, globstar, caseInsensitive };
  const absRoot = isGlobAbsolute ? root : resolve(root); // root is always string here
  const resolveFromRoot = (path) => resolve(absRoot, path);
  const excludePatterns = exclude
    .map(resolveFromRoot)
    .map((s) => globToRegExp(s, globOptions));
  const shouldInclude = (path) => !excludePatterns.some((p) => !!path.match(p));
  let fixedRoot = isGlobAbsolute ? winRoot ?? "/" : absRoot;
  while (segments.length > 0 && !isGlob(segments[0])) {
    const seg = segments.shift();
    fixedRoot = joinGlobs([fixedRoot, seg], globOptions);
  }
  let fixedRootInfo;
  try {
    fixedRootInfo = createWalkEntrySync(fixedRoot);
  } catch (error) {
    return throwUnlessNotFound(error);
  }
  function* advanceMatch(walkInfo, globSegment) {
    if (!walkInfo.isDirectory) {
      return;
    } else if (globSegment === "..") {
      const parentPath = joinGlobs([walkInfo.path, ".."], globOptions);
      if (shouldInclude(parentPath)) {
        return yield createWalkEntrySync(parentPath);
      }
      return;
    } else if (globSegment === "**") {
      return yield* walkSync(walkInfo.path, {
        skip: excludePatterns,
        maxDepth: globstar ? Infinity : 1,
        followSymlinks,
        canonicalize,
      });
    }
    const globPattern = globToRegExp(globSegment, globOptions);
    for (
      const walkEntry of walkSync(walkInfo.path, {
        maxDepth: 1,
        skip: excludePatterns,
        followSymlinks,
      })
    ) {
      if (
        walkEntry.path !== walkInfo.path &&
        walkEntry.name.match(globPattern)
      ) {
        yield walkEntry;
      }
    }
  }
  let currentMatches = [fixedRootInfo];
  for (const segment of segments) {
    // Advancing the list of current matches may introduce duplicates, so we
    // pass everything through this Map.
    const nextMatchMap = new Map();
    for (const currentMatch of currentMatches) {
      for (const nextMatch of advanceMatch(currentMatch, segment)) {
        nextMatchMap.set(nextMatch.path, nextMatch);
      }
    }
    currentMatches = [...nextMatchMap.values()].sort(comparePath);
  }
  if (hasTrailingSep) {
    currentMatches = currentMatches.filter((entry) => entry.isDirectory);
  }
  if (!includeDirs) {
    currentMatches = currentMatches.filter((entry) => !entry.isDirectory);
  }
  yield* currentMatches;
}