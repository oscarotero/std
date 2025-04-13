// Copyright 2018-2025 the Deno authors. MIT license.
/** A snapshotting library.
 *
 * The `assertSnapshot` function will create a snapshot of a value and compare it
 * to a reference snapshot, which is stored alongside the test file in the
 * `__snapshots__` directory.
 *
 * ```ts
 * // example_test.ts
 * import { assertSnapshot } from "snapshot.js";
 *
 * Deno.test("isSnapshotMatch", async function (t): Promise<void> {
 *   const a = {
 *     hello: "world!",
 *     example: 123,
 *   };
 *   await assertSnapshot(t, a);
 * });
 * ```
 *
 * ```ts no-assert
 * // __snapshots__/example_test.ts.snap
 * export const snapshot: Record<string, string> = {};
 *
 * snapshot["isSnapshotMatch 1"] = `
 * {
 *   example: 123,
 *   hello: "world!",
 * }
 * `;
 * ```
 *
 * Calling `assertSnapshot` in a test will throw an `AssertionError`, causing the
 * test to fail, if the snapshot created during the test does not match the one in
 * the snapshot file.
 *
 * ## Updating Snapshots:
 *
 * When adding new snapshot assertions to your test suite, or when intentionally
 * making changes which cause your snapshots to fail, you can update your snapshots
 * by running the snapshot tests in update mode. Tests can be run in update mode by
 * passing the `--update` or `-u` flag as an argument when running the test. When
 * this flag is passed, then any snapshots which do not match will be updated.
 *
 * ```sh
 * deno test --allow-all -- --update
 * ```
 *
 * Additionally, new snapshots will only be created when this flag is present.
 *
 * ## Permissions:
 *
 * When running snapshot tests, the `--allow-read` permission must be enabled, or
 * else any calls to `assertSnapshot` will fail due to insufficient permissions.
 * Additionally, when updating snapshots, the `--allow-write` permission must also
 * be enabled, as this is required in order to update snapshot files.
 *
 * The `assertSnapshot` function will only attempt to read from and write to
 * snapshot files. As such, the allow list for `--allow-read` and `--allow-write`
 * can be limited to only include existing snapshot files, if so desired.
 *
 * ## Options:
 *
 * The `assertSnapshot` function optionally accepts an options object.
 *
 * ```ts
 * // example_test.ts
 * import { assertSnapshot } from "snapshot.js";
 *
 * Deno.test("isSnapshotMatch", async function (t): Promise<void> {
 *   const a = {
 *     hello: "world!",
 *     example: 123,
 *   };
 *   await assertSnapshot(t, a, {
 *     // options
 *   });
 * });
 * ```
 *
 * You can also configure default options for `assertSnapshot`.
 *
 * ```ts
 * // example_test.ts
 * import { createAssertSnapshot } from "snapshot.js";
 *
 * const assertSnapshot = createAssertSnapshot({
 *   // options
 * });
 * ```
 *
 * When configuring default options like this, the resulting `assertSnapshot`
 * function will function the same as the default function exported from the
 * snapshot module. If passed an optional options object, this will take precedence
 * over the default options, where the value provided for an option differs.
 *
 * It is possible to "extend" an `assertSnapshot` function which has been
 * configured with default options.
 *
 * ```ts
 * // example_test.ts
 * import { createAssertSnapshot } from "snapshot.js";
 * import { stripAnsiCode } from "../fmt/colors.js";
 *
 * const assertSnapshot = createAssertSnapshot({
 *   dir: ".snaps",
 * });
 *
 * const assertMonochromeSnapshot = createAssertSnapshot<string>(
 *   { serializer: stripAnsiCode },
 *   assertSnapshot,
 * );
 *
 * Deno.test("isSnapshotMatch", async function (t): Promise<void> {
 *   const a = "\x1b[32mThis green text has had its colors stripped\x1b[39m";
 *   await assertMonochromeSnapshot(t, a);
 * });
 * ```
 *
 * ```ts no-assert
 * // .snaps/example_test.ts.snap
 * export const snapshot: Record<string, string> = {};
 *
 * snapshot["isSnapshotMatch 1"] = "This green text has had its colors stripped";
 * ```
 *
 * ## Version Control:
 *
 * Snapshot testing works best when changes to snapshot files are committed
 * alongside other code changes. This allows for changes to reference snapshots to
 * be reviewed along side the code changes that caused them, and ensures that when
 * others pull your changes, their tests will pass without needing to update
 * snapshots locally.
 *
 * @module
 */
import { fromFileUrl } from "../path/from_file_url.js";
import { parse } from "../path/parse.js";
import { resolve } from "../path/resolve.js";
import { toFileUrl } from "../path/to_file_url.js";
import { ensureFile, ensureFileSync } from "../fs/ensure_file.js";
import { assert } from "../assert/assert.js";
import { AssertionError } from "../assert/assertion_error.js";
import { equal } from "../assert/equal.js";
import { diff } from "../internal/diff.js";
import { diffStr } from "../internal/diff_str.js";
import { buildMessage } from "../internal/build_message.js";
const SNAPSHOT_DIR = "__snapshots__";
const SNAPSHOT_EXT = "snap";
function getErrorMessage(message, options) {
  return typeof options.msg === "string" ? options.msg : message;
}
/**
 * Default serializer for `assertSnapshot`.
 *
 * @example Usage
 * ```ts
 * import { serialize } from "snapshot.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * assertEquals(serialize({ foo: 42 }), "{\n  foo: 42,\n}")
 * ```
 *
 * @param actual The value to serialize
 * @returns The serialized string
 */
export function serialize(actual) {
  return Deno.inspect(actual, {
    depth: Infinity,
    sorted: true,
    trailingComma: true,
    compact: false,
    iterableLimit: Infinity,
    strAbbreviateSize: Infinity,
    breakLength: Infinity,
    escapeSequences: false,
  }).replaceAll("\r", "\\r");
}
/**
 * Converts a string to a valid JavaScript string which can be wrapped in backticks.
 *
 * @example
 *
 * "special characters (\ ` $) will be escaped" -> "special characters (\\ \` \$) will be escaped"
 */
function escapeStringForJs(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");
}
let _mode;
/**
 * Get the snapshot mode.
 */
function getMode(options) {
  if (options.mode) {
    return options.mode;
  } else if (_mode) {
    return _mode;
  } else {
    _mode = Deno.args.some((arg) => arg === "--update" || arg === "-u")
      ? "update"
      : "assert";
    return _mode;
  }
}
/**
 * Return `true` when snapshot mode is `update`.
 */
function getIsUpdate(options) {
  return getMode(options) === "update";
}
class AssertSnapshotContext {
  static contexts = new Map();
  /**
   * Returns an instance of `AssertSnapshotContext`. This will be retrieved from
   * a cache if an instance was already created for a given snapshot file path.
   */
  static fromOptions(testContext, options) {
    let path;
    const testFilePath = fromFileUrl(testContext.origin);
    const { dir, base } = parse(testFilePath);
    if (options.path) {
      path = resolve(dir, options.path);
    } else if (options.dir) {
      path = resolve(dir, options.dir, `${base}.${SNAPSHOT_EXT}`);
    } else {
      path = resolve(dir, SNAPSHOT_DIR, `${base}.${SNAPSHOT_EXT}`);
    }
    let context = this.contexts.get(path);
    if (context) {
      return context;
    }
    context = new this(toFileUrl(path));
    this.contexts.set(path, context);
    return context;
  }
  #teardownRegistered = false;
  #currentSnapshots;
  #updatedSnapshots = new Map();
  #snapshotCounts = new Map();
  #snapshotsUpdated = new Array();
  #snapshotFileUrl;
  snapshotUpdateQueue = new Array();
  constructor(snapshotFileUrl) {
    this.#snapshotFileUrl = snapshotFileUrl;
  }
  /**
   * Asserts that `this.#currentSnapshots` has been initialized and then returns it.
   *
   * Should only be called when `this.#currentSnapshots` has already been initialized.
   */
  #getCurrentSnapshotsInitialized() {
    assert(
      this.#currentSnapshots,
      "Snapshot was not initialized. This is a bug in `assertSnapshot`.",
    );
    return this.#currentSnapshots;
  }
  /**
   * Write updates to the snapshot file and log statistics.
   */
  #teardown = () => {
    const buf = ["export const snapshot = {};"];
    const currentSnapshots = this.#getCurrentSnapshotsInitialized();
    const currentSnapshotNames = Array.from(currentSnapshots.keys());
    const removedSnapshotNames = currentSnapshotNames.filter((name) =>
      !this.snapshotUpdateQueue.includes(name)
    );
    this.snapshotUpdateQueue.forEach((name) => {
      const updatedSnapshot = this.#updatedSnapshots.get(name);
      const currentSnapshot = currentSnapshots.get(name);
      let formattedSnapshot;
      if (typeof updatedSnapshot === "string") {
        formattedSnapshot = updatedSnapshot;
      } else if (typeof currentSnapshot === "string") {
        formattedSnapshot = currentSnapshot;
      } else {
        // This occurs when `assertSnapshot` is called in "assert" mode but
        // the snapshot doesn't exist and `assertSnapshot` is also called in
        // "update" mode. In this case, we have nothing to write to the
        // snapshot file so we can just exit early
        return;
      }
      formattedSnapshot = escapeStringForJs(formattedSnapshot);
      formattedSnapshot = formattedSnapshot.includes("\n")
        ? `\n${formattedSnapshot}\n`
        : formattedSnapshot;
      const formattedName = escapeStringForJs(name);
      buf.push(`\nsnapshot[\`${formattedName}\`] = \`${formattedSnapshot}\`;`);
    });
    const snapshotFilePath = fromFileUrl(this.#snapshotFileUrl);
    ensureFileSync(snapshotFilePath);
    Deno.writeTextFileSync(snapshotFilePath, buf.join("\n") + "\n");
    const updated = this.getUpdatedCount();
    if (updated > 0) {
      // deno-lint-ignore no-console
      console.log(
        `%c\n > ${updated} ${
          updated === 1 ? "snapshot" : "snapshots"
        } updated.`,
        "color: green; font-weight: bold;",
      );
    }
    const removed = removedSnapshotNames.length;
    if (removed > 0) {
      // deno-lint-ignore no-console
      console.log(
        `%c\n > ${removed} ${
          removed === 1 ? "snapshot" : "snapshots"
        } removed.`,
        "color: red; font-weight: bold;",
      );
      for (const snapshotName of removedSnapshotNames) {
        // deno-lint-ignore no-console
        console.log(`%c   • ${snapshotName}`, "color: red;");
      }
    }
  };
  /**
   * Returns `this.#currentSnapshots` and if necessary, tries to initialize it by reading existing
   * snapshots from the snapshot file. If the snapshot mode is `update` and the snapshot file does
   * not exist then it will be created.
   */
  async #readSnapshotFile(options) {
    if (this.#currentSnapshots) {
      return this.#currentSnapshots;
    }
    if (getIsUpdate(options)) {
      await ensureFile(fromFileUrl(this.#snapshotFileUrl));
    }
    try {
      const snapshotFileUrl = this.#snapshotFileUrl.toString();
      const { snapshot } = await import(snapshotFileUrl);
      this.#currentSnapshots = typeof snapshot === "undefined"
        ? new Map()
        : new Map(
          Object.entries(snapshot).map(([name, snapshot]) => {
            if (typeof snapshot !== "string") {
              throw new AssertionError(
                getErrorMessage(
                  `Corrupt snapshot:\n\t(${name})\n\t${snapshotFileUrl}`,
                  options,
                ),
              );
            }
            return [
              name,
              snapshot.includes("\n") ? snapshot.slice(1, -1) : snapshot,
            ];
          }),
        );
      return this.#currentSnapshots;
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.startsWith("Module not found")
      ) {
        throw new AssertionError(
          getErrorMessage("Missing snapshot file.", options),
        );
      }
      throw error;
    }
  }
  /**
   * Register a teardown function which writes the snapshot file to disk and logs the number
   * of snapshots updated after all tests have run.
   *
   * This method can safely be called more than once and will only register the teardown
   * function once in a context.
   */
  async registerTeardown() {
    if (!this.#teardownRegistered) {
      const permission = await Deno.permissions.query({
        name: "write",
        path: this.#snapshotFileUrl,
      });
      if (permission.state !== "granted") {
        throw new Deno.errors.PermissionDenied(
          `Missing write access to snapshot file (${this.#snapshotFileUrl}). This is required because assertSnapshot was called in update mode. Please pass the --allow-write flag.`,
        );
      }
      globalThis.addEventListener("unload", this.#teardown);
      this.#teardownRegistered = true;
    }
  }
  /**
   * Gets the number of snapshots which have been created with the same name and increments
   * the count by 1.
   */
  getCount(snapshotName) {
    let count = this.#snapshotCounts.get(snapshotName) ?? 0;
    this.#snapshotCounts.set(snapshotName, ++count);
    return count;
  }
  /**
   * Get an existing snapshot by name or returns `undefined` if the snapshot does not exist.
   */
  async getSnapshot(snapshotName, options) {
    const snapshots = await this.#readSnapshotFile(options);
    return snapshots.get(snapshotName);
  }
  /**
   * Update a snapshot by name. Updates will be written to the snapshot file when all tests
   * have run. If the snapshot does not exist, it will be created.
   *
   * Should only be called when mode is `update`.
   */
  updateSnapshot(snapshotName, snapshot) {
    if (!this.#snapshotsUpdated.includes(snapshotName)) {
      this.#snapshotsUpdated.push(snapshotName);
    }
    const currentSnapshots = this.#getCurrentSnapshotsInitialized();
    if (!currentSnapshots.has(snapshotName)) {
      currentSnapshots.set(snapshotName, undefined);
    }
    this.#updatedSnapshots.set(snapshotName, snapshot);
  }
  /**
   * Get the number of updated snapshots.
   */
  getUpdatedCount() {
    return this.#snapshotsUpdated.length;
  }
  /**
   * Add a snapshot to the update queue.
   *
   * Tracks the order in which snapshots were created so that they can be written to
   * the snapshot file in the correct order.
   *
   * Should be called with each snapshot, regardless of the mode, as a future call to
   * `assertSnapshot` could cause updates to be written to the snapshot file if the
   * `update` mode is passed in the options.
   */
  pushSnapshotToUpdateQueue(snapshotName) {
    this.snapshotUpdateQueue.push(snapshotName);
  }
  /**
   * Check if exist snapshot
   */
  hasSnapshot(snapshotName) {
    return this.#currentSnapshots
      ? this.#currentSnapshots.has(snapshotName)
      : false;
  }
}
export async function assertSnapshot(context, actual, msgOrOpts) {
  const options = getOptions();
  const assertSnapshotContext = AssertSnapshotContext.fromOptions(
    context,
    options,
  );
  const testName = getTestName(context, options);
  const count = assertSnapshotContext.getCount(testName);
  const name = `${testName} ${count}`;
  const snapshot = await assertSnapshotContext.getSnapshot(name, options);
  assertSnapshotContext.pushSnapshotToUpdateQueue(name);
  const _serialize = options.serializer || serialize;
  const _actual = _serialize(actual);
  if (getIsUpdate(options)) {
    await assertSnapshotContext.registerTeardown();
    if (!equal(_actual, snapshot)) {
      assertSnapshotContext.updateSnapshot(name, _actual);
    }
  } else {
    if (
      !assertSnapshotContext.hasSnapshot(name) ||
      typeof snapshot === "undefined"
    ) {
      throw new AssertionError(
        getErrorMessage(`Missing snapshot: ${name}`, options),
      );
    }
    if (equal(_actual, snapshot)) {
      return;
    }
    const stringDiff = !_actual.includes("\n");
    const diffResult = stringDiff
      ? diffStr(_actual, snapshot)
      : diff(_actual.split("\n"), snapshot.split("\n"));
    const diffMsg = buildMessage(diffResult, { stringDiff }).join("\n");
    const message =
      `Snapshot does not match:\n${diffMsg}\nTo update snapshots, run\n    deno test --allow-read --allow-write [files]... -- --update\n`;
    throw new AssertionError(getErrorMessage(message, options));
  }
  function getOptions() {
    if (typeof msgOrOpts === "object" && msgOrOpts !== null) {
      return msgOrOpts;
    }
    return {
      msg: msgOrOpts,
    };
  }
  function getTestName(context, options) {
    if (options && options.name) {
      return options.name;
    } else if (context.parent) {
      return `${getTestName(context.parent)} > ${context.name}`;
    }
    return context.name;
  }
}
/**
 * Create {@linkcode assertSnapshot} function with the given options.
 *
 * The specified option becomes the default for returned {@linkcode assertSnapshot}
 *
 * @example Usage
 * ```ts
 * import { createAssertSnapshot } from "snapshot.js";
 *
 * const assertSnapshot = createAssertSnapshot({
 *   // Uses the custom directory for saving snapshot files.
 *   dir: "my_snapshot_dir",
 * });
 *
 * Deno.test("a snapshot test case", async (t) => {
 *   await assertSnapshot(t, {
 *     foo: "Hello",
 *     bar: "World",
 *   });
 * })
 * ```
 *
 * @typeParam T The type of the snapshot
 * @param options The options
 * @param baseAssertSnapshot {@linkcode assertSnapshot} function implementation. Default to the original {@linkcode assertSnapshot}
 * @returns {@linkcode assertSnapshot} function with the given default options.
 */
export function createAssertSnapshot(
  options,
  baseAssertSnapshot = assertSnapshot,
) {
  return async function _assertSnapshot(context, actual, messageOrOptions) {
    const mergedOptions = {
      ...options,
      ...(typeof messageOrOptions === "string"
        ? {
          msg: messageOrOptions,
        }
        : messageOrOptions),
    };
    await baseAssertSnapshot(context, actual, mergedOptions);
  };
}
