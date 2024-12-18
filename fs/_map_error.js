// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import * as errors from "./unstable_errors.js";
const mapper = (Ctor) => (err) =>
  Object.assign(new Ctor(err.message), {
    stack: err.stack,
  });
const map = {
  EEXIST: mapper(errors.AlreadyExists),
  ENOENT: mapper(errors.NotFound),
  EBADF: mapper(errors.BadResource),
};
const isNodeErr = (e) => {
  return e instanceof Error && "code" in e;
};
export function mapError(e) {
  if (!isNodeErr(e)) {
    return e;
  }
  return map[e.code]?.(e) || e;
}
