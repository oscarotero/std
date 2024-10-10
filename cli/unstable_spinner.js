// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
const encoder = new TextEncoder();
const LINE_CLEAR = encoder.encode("\r\u001b[K"); // From cli/prompt_secret.ts
const COLOR_RESET = "\u001b[0m";
const DEFAULT_INTERVAL = 75;
const DEFAULT_SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const COLORS = {
  black: "\u001b[30m",
  red: "\u001b[31m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  blue: "\u001b[34m",
  magenta: "\u001b[35m",
  cyan: "\u001b[36m",
  white: "\u001b[37m",
  gray: "\u001b[90m",
};
/**
 * A spinner that can be used to indicate that something is loading.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @example Usage
 * ```ts ignore
 * import { Spinner } from "unstable_spinner.js";
 *
 * const spinner = new Spinner({ message: "Loading...", color: "yellow" });
 * spinner.start();
 *
 * setTimeout(() => {
 *  spinner.stop();
 *  console.log("Finished loading!");
 * }, 3_000);
 * ```
 */
export class Spinner {
  #spinner;
  /**
   * The message to display next to the spinner.
   * This can be changed while the spinner is active.
   *
   * @example Usage
   * ```ts ignore
   * import { Spinner } from "unstable_spinner.js";
   *
   * const spinner = new Spinner({ message: "Working..." });
   * spinner.start();
   *
   * for (let step = 0; step < 5; step++) {
   *   // do some work
   *   await new Promise((resolve) => setTimeout(resolve, 1000));
   *
   *   spinner.message = `Finished Step #${step}`;
   * }
   *
   * spinner.stop();
   * console.log("Done!");
   * ```
   */
  message;
  #interval;
  #color;
  #intervalId;
  #active = false;
  /**
   * Creates a new spinner.
   *
   * @param options Options for the spinner.
   */
  constructor(options) {
    const {
      spinner = DEFAULT_SPINNER,
      message = "",
      interval = DEFAULT_INTERVAL,
      color,
    } = options ?? {};
    this.#spinner = spinner;
    this.message = message;
    this.#interval = interval;
    this.color = color;
  }
  /**
   * Set the color of the spinner. This defaults to the default terminal color.
   * This can be changed while the spinner is active.
   *
   * Providing `undefined` will use the default terminal color.
   *
   * @param value Color to set.
   *
   * @example Usage
   * ```ts ignore
   * import { Spinner } from "unstable_spinner.js";
   *
   * const spinner = new Spinner({ message: "Loading...", color: "yellow" });
   * spinner.start();
   *
   * // do some work
   * await new Promise((resolve) => setTimeout(resolve, 1000));
   *
   * spinner.color = "magenta";
   * ```
   */
  set color(value) {
    this.#color = value ? COLORS[value] : undefined;
  }
  /**
   * Get the current color of the spinner.
   *
   * @example Usage
   * ```ts no-assert
   * import { Spinner } from "unstable_spinner.js";
   *
   * const spinner = new Spinner({ message: "Loading", color: "blue" });
   *
   * spinner.color; // Blue ANSI escape sequence
   * ```
   * @returns The color of the spinner or `undefined` if it's using the terminal default.
   */
  get color() {
    return this.#color;
  }
  /**
   * Starts the spinner.
   *
   * @example Usage
   * ```ts ignore
   * import { Spinner } from "unstable_spinner.js";
   *
   * const spinner = new Spinner({ message: "Loading..." });
   * spinner.start();
   * ```
   */
  start() {
    if (this.#active || Deno.stdout.writable.locked) {
      return;
    }
    this.#active = true;
    let i = 0;
    const noColor = Deno.noColor;
    // Updates the spinner after the given interval.
    const updateFrame = () => {
      const color = this.#color ?? "";
      const frame = encoder.encode(
        noColor
          ? this.#spinner[i] + " " + this.message
          : color + this.#spinner[i] + COLOR_RESET + " " + this.message,
      );
      // call writeSync once to reduce flickering
      const writeData = new Uint8Array(LINE_CLEAR.length + frame.length);
      writeData.set(LINE_CLEAR);
      writeData.set(frame, LINE_CLEAR.length);
      Deno.stdout.writeSync(writeData);
      i = (i + 1) % this.#spinner.length;
    };
    this.#intervalId = setInterval(updateFrame, this.#interval);
  }
  /**
   * Stops the spinner.
   *
   * @example Usage
   * ```ts ignore
   * import { Spinner } from "unstable_spinner.js";
   *
   * const spinner = new Spinner({ message: "Loading..." });
   * spinner.start();
   *
   * setTimeout(() => {
   *  spinner.stop();
   *  console.log("Finished loading!");
   * }, 3_000);
   * ```
   */
  stop() {
    if (this.#intervalId && this.#active) {
      clearInterval(this.#intervalId);
      Deno.stdout.writeSync(LINE_CLEAR); // Clear the current line
      this.#active = false;
    }
  }
}