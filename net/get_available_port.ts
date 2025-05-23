// Copyright 2018-2025 the Deno authors. MIT license.

/** Options for {@linkcode getAvailablePort}. */
export interface GetAvailablePortOptions {
  /**
   * A port to check availability of first. If the port isn't available, fall
   * back to another port.
   *
   * Defaults to port 0, which will let the operating system choose an available
   * port.
   *
   * @default {0}
   */
  preferredPort?: number;
}

/**
 * Returns an available network port.
 *
 * > [!IMPORTANT]
 * > In most cases, this function is not needed. Do not use it for trivial uses
 * > such as when using {@linkcode Deno.serve} or {@linkcode Deno.listen}
 * > directly. Instead, set the `port` option to `0` to automatically use an
 * > available port, then get the assigned port from the function's return
 * > object (see "Recommended Usage" example).
 *
 * @param options Options for getting an available port.
 * @returns An available network port.
 *
 * @example Recommended Usage
 *
 * Bad:
 * ```ts ignore no-assert
 * import { getAvailablePort } from "get_available_port.ts";
 *
 * const port = getAvailablePort();
 * Deno.serve({ port }, () => new Response("Hello, world!"));
 * ```
 *
 * Good:
 * ```ts ignore no-assert
 * const { port } = Deno.serve({ port: 0 }, () => new Response("Hello, world!")).addr;
 * ```
 *
 * Good:
 * ```ts ignore no-assert
 * import { getAvailablePort } from "get_available_port.ts";
 *
 * const command = new Deno.Command(Deno.execPath(), {
 *   args: ["test.ts", "--port", getAvailablePort().toString()],
 * });
 * // ...
 * ```
 */
export function getAvailablePort(options?: GetAvailablePortOptions): number {
  if (options?.preferredPort) {
    try {
      // Check if the preferred port is available
      using listener = Deno.listen({ port: options.preferredPort });
      return listener.addr.port;
    } catch (e) {
      // If the preferred port is not available, fall through and find an available port
      if (!(e instanceof Deno.errors.AddrInUse)) {
        throw e;
      }
    }
  }

  using listener = Deno.listen({ port: 0 });
  return listener.addr.port;
}
