// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// deno-lint-ignore-file
export function inspectArgs(args) {
  return args.map(inspectArg).join(", ");
}
export function inspectArg(arg) {
  const { Deno } = globalThis;
  return typeof Deno !== "undefined" && Deno.inspect
    ? Deno.inspect(arg)
    : String(arg);
}
