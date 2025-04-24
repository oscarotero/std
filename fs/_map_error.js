// Copyright 2018-2025 the Deno authors. MIT license.
import * as errors from "./unstable_errors.js";
function mapper(Ctor) {
  return (err) =>
    Object.assign(new Ctor(err.message), {
      stack: err.stack,
    });
}
const map = {
  EEXIST: mapper(errors.AlreadyExists),
  ENOENT: mapper(errors.NotFound),
  EBADF: mapper(errors.BadResource),
};
function isNodeErr(e) {
  return e instanceof Error && "code" in e;
}
export function mapError(e) {
  if (!isNodeErr(e)) {
    return e;
  }
  return map[e.code]?.(e) || e;
}
