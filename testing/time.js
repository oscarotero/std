// Copyright 2018-2025 the Deno authors. MIT license.
/**
 * Utilities for mocking time while testing.
 *
 * ```ts
 * import {
 *   assertSpyCalls,
 *   spy,
 * } from "mock.js";
 * import { FakeTime } from "time.js";
 *
 * function secondInterval(cb: () => void): number {
 *   return setInterval(cb, 1000);
 * }
 *
 * Deno.test("secondInterval calls callback every second and stops after being cleared", () => {
 *   using time = new FakeTime();
 *
 *   const cb = spy();
 *   const intervalId = secondInterval(cb);
 *   assertSpyCalls(cb, 0);
 *   time.tick(500);
 *   assertSpyCalls(cb, 0);
 *   time.tick(500);
 *   assertSpyCalls(cb, 1);
 *   time.tick(3500);
 *   assertSpyCalls(cb, 4);
 *
 *   clearInterval(intervalId);
 *   time.tick(1000);
 *   assertSpyCalls(cb, 4);
 * });
 * ```
 *
 * @module
 */
import { RedBlackTree } from "../data-structures/red_black_tree.js";
import { ascend } from "../data-structures/comparators.js";
import { _internals } from "./_time.js";
/**
 * Represents an error when trying to execute an invalid operation on fake time,
 * given the state fake time is in.
 *
 * @example Usage
 * ```ts
 * import { FakeTime, TimeError } from "time.js";
 * import { assertThrows } from "../assert/mod.js";
 *
 * assertThrows(() => {
 *   const time = new FakeTime();
 *   time.restore();
 *   time.restore();
 * }, TimeError);
 * ```
 */
export class TimeError extends Error {
  /** Construct TimeError.
   *
   * @param message The error message
   */
  constructor(message) {
    super(message);
    this.name = "TimeError";
  }
}
function fakeTimeNow() {
  return time?.now ?? _internals.Date.now();
}
const FakeDate = new Proxy(Date, {
  construct(_target, args) {
    if (args.length === 0) {
      args.push(FakeDate.now());
    }
    // @ts-expect-error this is a passthrough
    return new _internals.Date(...args);
  },
  apply(_target, _thisArg, _args) {
    return new _internals.Date(fakeTimeNow()).toString();
  },
  get(target, prop, receiver) {
    if (prop === "now") {
      return fakeTimeNow;
    }
    return Reflect.get(target, prop, receiver);
  },
});
let time = undefined;
function assertIsCallbackFunction(callback, fnName) {
  if (typeof callback !== "function") {
    throw new TimeError(
      `FakeTime does not support non-function callbacks to ${fnName}`,
    );
  }
}
const fakeSetTimeout = function (callback, delay = 0, ...args) {
  assertIsCallbackFunction(callback, "setTimeout");
  if (!time) {
    throw new TimeError("Cannot set timeout: time is not faked");
  }
  return setTimer(callback, delay, args, false);
};
function fakeClearTimeout(id) {
  if (!time) {
    throw new TimeError("Cannot clear timeout: time is not faked");
  }
  if (typeof id === "number" && dueNodes.has(id)) {
    dueNodes.delete(id);
  }
}
const fakeSetInterval = function (callback, delay = 0, ...args) {
  assertIsCallbackFunction(callback, "setInterval");
  if (!time) {
    throw new TimeError("Cannot set interval: time is not faked");
  }
  return setTimer(callback, delay, args, true);
};
function fakeClearInterval(id) {
  if (!time) {
    throw new TimeError("Cannot clear interval: time is not faked");
  }
  if (typeof id === "number" && dueNodes.has(id)) {
    dueNodes.delete(id);
  }
}
function setTimer(
  // deno-lint-ignore no-explicit-any
  callback,
  delay = 0,
  args,
  repeat = false,
) {
  const id = timerId.next().value;
  delay = Math.max(repeat ? 1 : 0, Math.floor(delay));
  const due = now + delay;
  let dueNode = dueTree.find({ due });
  if (dueNode === null) {
    dueNode = { due, timers: [] };
    dueTree.insert(dueNode);
  }
  dueNode.timers.push({
    id,
    callback,
    args,
    delay,
    due,
    repeat,
  });
  dueNodes.set(id, dueNode);
  return id;
}
function fakeAbortSignalTimeout(delay) {
  const aborter = new AbortController();
  fakeSetTimeout(() => {
    aborter.abort(new DOMException("Signal timed out.", "TimeoutError"));
  }, delay);
  return aborter.signal;
}
function overrideGlobals() {
  globalThis.Date = FakeDate;
  globalThis.setTimeout = fakeSetTimeout;
  globalThis.clearTimeout = fakeClearTimeout;
  globalThis.setInterval = fakeSetInterval;
  globalThis.clearInterval = fakeClearInterval;
  AbortSignal.timeout = fakeAbortSignalTimeout;
}
function restoreGlobals() {
  globalThis.Date = _internals.Date;
  globalThis.setTimeout = _internals.setTimeout;
  globalThis.clearTimeout = _internals.clearTimeout;
  globalThis.setInterval = _internals.setInterval;
  globalThis.clearInterval = _internals.clearInterval;
  AbortSignal.timeout = _internals.AbortSignalTimeout;
}
function* timerIdGen() {
  let i = 1;
  while (true) {
    yield i++;
  }
}
function nextDueNode() {
  for (;;) {
    const dueNode = dueTree.min();
    if (!dueNode) {
      return null;
    }
    const hasTimer = dueNode.timers.some((timer) => dueNodes.has(timer.id));
    if (hasTimer) {
      return dueNode;
    }
    dueTree.remove(dueNode);
  }
}
let startedAt;
let now;
let initializedAt;
let advanceRate;
let advanceFrequency;
let advanceIntervalId;
let timerId;
let dueNodes;
let dueTree;
/**
 * Overrides the real Date object and timer functions with fake ones that can be
 * controlled through the fake time instance.
 *
 * Note: there is no setter for the `start` property, as it cannot be changed
 * after initialization.
 *
 * @example Usage
 * ```ts
 * import {
 *   assertSpyCalls,
 *   spy,
 * } from "mock.js";
 * import { FakeTime } from "time.js";
 *
 * function secondInterval(cb: () => void): number {
 *   return setInterval(cb, 1000);
 * }
 *
 * Deno.test("secondInterval calls callback every second and stops after being cleared", () => {
 *   using time = new FakeTime();
 *
 *   const cb = spy();
 *   const intervalId = secondInterval(cb);
 *   assertSpyCalls(cb, 0);
 *   time.tick(500);
 *   assertSpyCalls(cb, 0);
 *   time.tick(500);
 *   assertSpyCalls(cb, 1);
 *   time.tick(3500);
 *   assertSpyCalls(cb, 4);
 *
 *   clearInterval(intervalId);
 *   time.tick(1000);
 *   assertSpyCalls(cb, 4);
 * });
 * ```
 */
export class FakeTime {
  /**
   * Construct a FakeTime object. This overrides the real Date object and timer functions with fake ones that can be
   * controlled through the fake time instance.
   *
   * @param start The time to simulate. The default is the current time.
   * @param options The options
   *
   * @throws {TimeError} If time is already faked
   * @throws {TypeError} If the start is invalid
   */
  constructor(start, options) {
    if (time) {
      throw new TimeError("Cannot construct FakeTime: time is already faked");
    }
    initializedAt = _internals.Date.now();
    startedAt = start instanceof Date
      ? start.valueOf()
      : typeof start === "number"
      ? Math.floor(start)
      : typeof start === "string"
      ? (new Date(start)).valueOf()
      : initializedAt;
    if (Number.isNaN(startedAt)) {
      throw new TypeError(
        `Cannot construct FakeTime: invalid start time ${startedAt}`,
      );
    }
    now = startedAt;
    timerId = timerIdGen();
    dueNodes = new Map();
    dueTree = new RedBlackTree((a, b) => ascend(a.due, b.due));
    overrideGlobals();
    time = this;
    advanceRate = Math.max(0, options?.advanceRate ?? 0);
    advanceFrequency = Math.max(0, options?.advanceFrequency ?? 10);
    advanceIntervalId = advanceRate > 0
      ? _internals.setInterval.call(null, () => {
        this.tick(advanceRate * advanceFrequency);
      }, advanceFrequency)
      : undefined;
  }
  /**
   * Restores real time.
   *
   * @example Usage
   * ```ts
   * import { FakeTime } from "time.js";
   * import { assertEquals, assertNotEquals } from "../assert/mod.js";
   *
   * const setTimeout = globalThis.setTimeout;
   *
   * {
   *   using fakeTime = new FakeTime();
   *
   *   assertNotEquals(globalThis.setTimeout, setTimeout);
   *
   *   // test timer related things.
   *
   *   // You don't need to call fakeTime.restore() explicitly
   *   // as it's implicitly called via the [Symbol.dispose] method
   *   // when declared with `using`.
   * }
   *
   * assertEquals(globalThis.setTimeout, setTimeout);
   * ```
   */
  [Symbol.dispose]() {
    this.restore();
  }
  /**
   * Restores real time.
   *
   * @throws {TimeError} If time is already restored
   *
   * @example Usage
   * ```ts
   * import { FakeTime } from "time.js";
   * import { assertEquals, assertNotEquals } from "../assert/mod.ts"
   *
   * const setTimeout = globalThis.setTimeout;
   *
   * const fakeTime = new FakeTime();
   *
   * assertNotEquals(globalThis.setTimeout, setTimeout);
   *
   * FakeTime.restore();
   *
   * assertEquals(globalThis.setTimeout, setTimeout);
   * ```
   */
  static restore() {
    if (!time) {
      throw new TimeError("Cannot restore time: time is already restored");
    }
    time.restore();
  }
  /**
   * Restores real time temporarily until callback returns and resolves.
   *
   * @throws {TimeError} If time is not faked
   *
   * @example Usage
   * ```ts
   * import { FakeTime } from "time.js";
   * import { assertEquals, assertNotEquals } from "../assert/mod.ts"
   *
   * const setTimeout = globalThis.setTimeout;
   *
   * const fakeTime = new FakeTime();
   *
   * assertNotEquals(globalThis.setTimeout, setTimeout);
   *
   * FakeTime.restoreFor(() => {
   *   assertEquals(globalThis.setTimeout, setTimeout);
   * });
   * ```
   *
   * @typeParam T The returned value type of the callback
   * @param callback The callback to be called while FakeTime being restored
   * @param args The arguments to pass to the callback
   * @returns The returned value from the callback
   */
  static restoreFor(
    // deno-lint-ignore no-explicit-any
    callback,
    // deno-lint-ignore no-explicit-any
    ...args
  ) {
    if (!time) {
      return Promise.reject(
        new TimeError("Cannot restore time: time is not faked"),
      );
    }
    restoreGlobals();
    try {
      const result = callback.apply(null, args);
      if (result instanceof Promise) {
        return result.finally(() => overrideGlobals());
      } else {
        overrideGlobals();
        return Promise.resolve(result);
      }
    } catch (e) {
      overrideGlobals();
      return Promise.reject(e);
    }
  }
  /**
   * The number of milliseconds elapsed since the epoch (January 1, 1970 00:00:00 UTC) for the fake time.
   *
   * @example Usage
   * ```ts
   * import { FakeTime } from "time.js";
   * import { assertEquals } from "../assert/mod.js";
   *
   * const fakeTime = new FakeTime(15_000);
   *
   * assertEquals(fakeTime.now, 15_000);
   *
   * fakeTime.tick(5_000);
   *
   * assertEquals(fakeTime.now, 20_000);
   * ```
   *
   * @returns The number of milliseconds elapsed since the epoch (January 1, 1970 00:00:00 UTC) for the fake time
   */
  get now() {
    return now;
  }
  /**
   * Set the current time. It will call any functions waiting to be called between the current and new fake time.
   * If the timer callback throws, time will stop advancing forward beyond that timer.
   *
   * @throws {RangeError} If the time goes backwards
   *
   * @example Usage
   * ```ts
   * import { FakeTime } from "time.js";
   * import { assertEquals } from "../assert/mod.js";
   *
   * const fakeTime = new FakeTime(15_000);
   *
   * assertEquals(fakeTime.now, 15_000);
   *
   * fakeTime.now = 35_000;
   *
   * assertEquals(fakeTime.now, 35_000);
   * ```
   *
   * @param value The current time (in milliseconds)
   */
  set now(value) {
    if (value < now) {
      throw new RangeError(
        `Cannot set current time in the past, time must be >= ${now}: received ${value}`,
      );
    }
    let dueNode = dueTree.min();
    while (dueNode && dueNode.due <= value) {
      const timer = dueNode.timers.shift();
      if (timer && dueNodes.has(timer.id)) {
        now = timer.due;
        if (timer.repeat) {
          const due = timer.due + timer.delay;
          let dueNode = dueTree.find({ due });
          if (dueNode === null) {
            dueNode = { due, timers: [] };
            dueTree.insert(dueNode);
          }
          dueNode.timers.push({ ...timer, due });
          dueNodes.set(timer.id, dueNode);
        } else {
          dueNodes.delete(timer.id);
        }
        timer.callback.apply(null, timer.args);
      } else if (!timer) {
        dueTree.remove(dueNode);
        dueNode = dueTree.min();
      }
    }
    now = value;
  }
  /**
   * The initial number of milliseconds elapsed since the epoch (January 1, 1970 00:00:00 UTC) for the fake time.
   *
   * @example Usage
   * ```ts
   * import { FakeTime } from "time.js";
   * import { assertEquals } from "../assert/mod.js";
   *
   * const fakeTime = new FakeTime(15_000);
   *
   * assertEquals(fakeTime.start, 15_000);
   * ```
   *
   * @returns The initial number of milliseconds elapsed since the epoch (January 1, 1970 00:00:00 UTC) for the fake time.
   */
  get start() {
    return startedAt;
  }
  /**
   * Resolves after the given number of milliseconds using real time.
   *
   * @example Usage
   * ```ts
   * import { FakeTime } from "time.js";
   * import { assertEquals } from "../assert/mod.js";
   *
   * const fakeTime = new FakeTime(15_000);
   *
   * await fakeTime.delay(500); // wait 500 ms in real time.
   *
   * assertEquals(fakeTime.now, 15_000); // The simulated time doesn't advance.
   * ```
   *
   * @param ms The milliseconds to delay
   * @param options The options
   */
  async delay(ms, options = {}) {
    const { signal } = options;
    if (signal?.aborted) {
      return Promise.reject(
        new DOMException("Delay was aborted.", "AbortError"),
      );
    }
    return await new Promise((resolve, reject) => {
      let timer = null;
      const abort = () =>
        FakeTime
          .restoreFor(() => {
            if (timer) {
              clearTimeout(timer);
            }
          })
          .then(() =>
            reject(new DOMException("Delay was aborted.", "AbortError"))
          );
      const done = () => {
        signal?.removeEventListener("abort", abort);
        resolve();
      };
      FakeTime.restoreFor(() => setTimeout(done, ms))
        .then((id) => timer = id);
      signal?.addEventListener("abort", abort, { once: true });
    });
  }
  /**
   * Runs all pending microtasks.
   *
   * @example Usage
   * ```ts
   * import { FakeTime } from "time.js";
   * import { assert } from "../assert/mod.js";
   *
   * const fakeTime = new FakeTime(15_000);
   *
   * let called = false;
   *
   * Promise.resolve().then(() => { called = true });
   *
   * await fakeTime.runMicrotasks();
   *
   * assert(called);
   * ```
   */
  async runMicrotasks() {
    await this.delay(0);
  }
  /**
   * Adds the specified number of milliseconds to the fake time.
   * This will call any functions waiting to be called between the current and new fake time.
   *
   * @example Usage
   * ```ts
   * import {
   *   assertSpyCalls,
   *   spy,
   * } from "mock.js";
   * import { FakeTime } from "time.js";
   *
   * function secondInterval(cb: () => void): number {
   *   return setInterval(cb, 1000);
   * }
   *
   * Deno.test("secondInterval calls callback every second and stops after being cleared", () => {
   *   using time = new FakeTime();
   *
   *   const cb = spy();
   *   const intervalId = secondInterval(cb);
   *   assertSpyCalls(cb, 0);
   *   time.tick(500);
   *   assertSpyCalls(cb, 0);
   *   time.tick(500);
   *   assertSpyCalls(cb, 1);
   *   time.tick(3500);
   *   assertSpyCalls(cb, 4);
   *
   *   clearInterval(intervalId);
   *   time.tick(1000);
   *   assertSpyCalls(cb, 4);
   * });
   * ```
   *
   * @param ms The milliseconds to advance
   */
  tick(ms = 0) {
    this.now += ms;
  }
  /**
   * Runs all pending microtasks then adds the specified number of milliseconds to the fake time.
   * This will call any functions waiting to be called between the current and new fake time.
   *
   * @example Usage
   * ```ts
   * import { FakeTime } from "time.js";
   * import { assert, assertEquals } from "../assert/mod.js";
   *
   * const fakeTime = new FakeTime(15_000);
   *
   * let called = false;
   *
   * Promise.resolve().then(() => { called = true });
   *
   * await fakeTime.tickAsync(5_000);
   *
   * assert(called);
   * assertEquals(fakeTime.now, 20_000);
   * ```
   *
   * @param ms The milliseconds to advance
   */
  async tickAsync(ms = 0) {
    await this.runMicrotasks();
    this.now += ms;
  }
  /**
   * Advances time to when the next scheduled timer is due.
   * If there are no pending timers, time will not be changed.
   *
   * @example Usage
   * ```ts
   * import { FakeTime } from "time.js";
   * import { assert, assertEquals } from "../assert/mod.js";
   *
   * const fakeTime = new FakeTime(15_000);
   *
   * let called = false;
   *
   * setTimeout(() => { called = true }, 5000);
   *
   * fakeTime.next();
   *
   * assert(called);
   * assertEquals(fakeTime.now, 20_000);
   * ```
   *
   * @returns `true` when there is a scheduled timer and `false` when there is not.
   */
  next() {
    const next = nextDueNode();
    if (next) {
      this.now = next.due;
    }
    return !!next;
  }
  /**
   * Runs all pending microtasks then advances time to when the next scheduled timer is due.
   * If there are no pending timers, time will not be changed.
   *
   * @example Usage
   * ```ts
   * import { FakeTime } from "time.js";
   * import { assert, assertEquals } from "../assert/mod.js";
   *
   * const fakeTime = new FakeTime(15_000);
   *
   * let called0 = false;
   * let called1 = false;
   *
   * setTimeout(() => { called0 = true }, 5000);
   * Promise.resolve().then(() => { called1 = true });
   *
   * await fakeTime.nextAsync();
   *
   * assert(called0);
   * assert(called1);
   * assertEquals(fakeTime.now, 20_000);
   * ```
   *
   * @returns `true` if the pending timers existed and the time advanced, `false` if there was no pending timer and the time didn't advance.
   */
  async nextAsync() {
    await this.runMicrotasks();
    return this.next();
  }
  /**
   * Advances time forward to the next due timer until there are no pending timers remaining.
   * If the timers create additional timers, they will be run too. If there is an interval,
   * time will keep advancing forward until the interval is cleared.
   *
   * @example Usage
   * ```ts
   * import { FakeTime } from "time.js";
   * import { assertEquals } from "../assert/mod.js";
   *
   * const fakeTime = new FakeTime(15_000);
   *
   * let count = 0;
   *
   * setTimeout(() => { count++ }, 5_000);
   * setTimeout(() => { count++ }, 15_000);
   * setTimeout(() => { count++ }, 35_000);
   *
   * fakeTime.runAll();
   *
   * assertEquals(count, 3);
   * assertEquals(fakeTime.now, 50_000);
   * ```
   */
  runAll() {
    while (!dueTree.isEmpty()) {
      this.next();
    }
  }
  /**
   * Advances time forward to the next due timer until there are no pending timers remaining.
   * If the timers create additional timers, they will be run too. If there is an interval,
   * time will keep advancing forward until the interval is cleared.
   * Runs all pending microtasks before each timer.
   *
   * @example Usage
   * ```ts
   * import { FakeTime } from "time.js";
   * import { assertEquals } from "../assert/mod.js";
   *
   * const fakeTime = new FakeTime(15_000);
   *
   * let count = 0;
   *
   * setTimeout(() => { count++ }, 5_000);
   * setTimeout(() => { count++ }, 15_000);
   * setTimeout(() => { count++ }, 35_000);
   * Promise.resolve().then(() => { count++ });
   *
   * await fakeTime.runAllAsync();
   *
   * assertEquals(count, 4);
   * assertEquals(fakeTime.now, 50_000);
   * ```
   */
  async runAllAsync() {
    while (!dueTree.isEmpty()) {
      await this.nextAsync();
    }
  }
  /**
   * Restores time related global functions to their original state.
   *
   * @example Usage
   * ```ts
   * import { FakeTime } from "time.js";
   * import { assertEquals, assertNotEquals } from "../assert/mod.js";
   *
   * const setTimeout = globalThis.setTimeout;
   *
   * const fakeTime = new FakeTime(); // global timers are now faked
   *
   * assertNotEquals(globalThis.setTimeout, setTimeout);
   *
   * fakeTime.restore(); // timers are restored
   *
   * assertEquals(globalThis.setTimeout, setTimeout);
   * ```
   */
  restore() {
    if (!time) {
      throw new TimeError("Cannot restore time: time is already restored");
    }
    time = undefined;
    restoreGlobals();
    if (advanceIntervalId) {
      clearInterval(advanceIntervalId);
    }
  }
}
