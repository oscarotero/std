/**
 * Checks if a function is a spy.
 *
 * @typeParam Self The self type of the function.
 * @typeParam Args The arguments type of the function.
 * @typeParam Return The return type of the function.
 * @param func The function to check
 * @return `true` if the function is a spy, `false` otherwise.
 */
export function isSpy(func) {
  const spy = func;
  return typeof spy === "function" &&
    typeof spy.original === "function" &&
    typeof spy.restored === "boolean" &&
    typeof spy.restore === "function" &&
    Array.isArray(spy.calls);
}
// deno-lint-ignore no-explicit-any
export const sessions = [];
// deno-lint-ignore no-explicit-any
function getSession() {
  if (sessions.length === 0) {
    sessions.push(new Set());
  }
  return sessions.at(-1);
}
// deno-lint-ignore no-explicit-any
export function registerMock(spy) {
  const session = getSession();
  session.add(spy);
}
// deno-lint-ignore no-explicit-any
export function unregisterMock(spy) {
  const session = getSession();
  session.delete(spy);
}
