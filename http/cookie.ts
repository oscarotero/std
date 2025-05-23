// Copyright 2018-2025 the Deno authors. MIT license.
// Structured similarly to Go's cookie.go
// https://github.com/golang/go/blob/master/src/net/http/cookie.go
// This module is browser compatible.

/**
 * Represents an HTTP Cookie.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc6265.html#section-4.2.1}
 */
export interface Cookie {
  /** Name of the cookie. */
  name: string;
  /** Value of the cookie. */
  value: string;
  /**
   * The cookie's `Expires` attribute, either as an explicit date or UTC
   * milliseconds. If `undefined`, the cookie will expire when the client's
   * session ends.
   *
   * @example <caption>Explicit date:</caption>
   *
   * ```ts
   * import { Cookie } from "cookie.ts";
   * const cookie: Cookie = {
   *   name: 'name',
   *   value: 'value',
   *   // expires on Fri Dec 30 2022
   *   expires: new Date('2022-12-31')
   * }
   * ```
   *
   * @example <caption>UTC milliseconds</caption>
   *
   * ```ts
   * import { Cookie } from "cookie.ts";
   * const cookie: Cookie = {
   *   name: 'name',
   *   value: 'value',
   *   // expires 10 seconds from now
   *   expires: Date.now() + 10000
   * }
   * ```
   */
  expires?: Date | number;
  /**
   * The cookie's `Max-Age` attribute, in seconds. Must be a non-negative
   * integer. A cookie with a `maxAge` of `0` expires immediately.
   */
  maxAge?: number;
  /**
   * The cookie's `Domain` attribute. Specifies those hosts to which the cookie
   * will be sent.
   */
  domain?: string;
  /**
   * The cookie's `Path` attribute. A cookie with a path will only be included
   * in the `Cookie` request header if the requested URL matches that path.
   */
  path?: string;
  /**
   * The cookie's `Secure` attribute. If `true`, the cookie will only be
   * included in the `Cookie` request header if the connection uses SSL and
   * HTTPS.
   *
   * @default {false}
   */
  secure?: boolean;
  /**
   * The cookie's `HTTPOnly` attribute. If `true`, the cookie cannot be accessed via JavaScript.
   *
   * @default {false}
   */
  httpOnly?: boolean;
  /**
   * The cookie's `Partitioned` attribute.
   * If `true`, the cookie will be only be included in the `Cookie` request header if
   * the domain it is embedded by matches the domain the cookie was originally set from.
   *
   * Warning: This is an attribute that has not been fully standardized yet.
   * It may change in the future without following the semver semantics of the package.
   * Clients may ignore the attribute until they understand it.
   *
   * @default {false}
   */
  partitioned?: boolean;
  /**
   * Allows servers to assert that a cookie ought not to
   * be sent along with cross-site requests.
   */
  sameSite?: "Strict" | "Lax" | "None";
  /**
   * Additional key value pairs with the form "key=value".
   *
   * @default {[]}
   */
  unparsed?: string[];
}

const FIELD_CONTENT_REGEXP = /^(?=[\x20-\x7E]*$)[^()@<>,;:\\"\[\]?={}\s]+$/;

function toString(cookie: Cookie): string {
  if (!cookie.name) {
    return "";
  }
  const out: string[] = [];
  validateName(cookie.name);
  validateValue(cookie.name, cookie.value);
  out.push(`${cookie.name}=${cookie.value}`);

  // Fallback for invalid Set-Cookie
  // ref: https://www.rfc-editor.org/rfc/rfc6265.html#section-3.1
  if (cookie.name.startsWith("__Secure")) {
    cookie.secure = true;
  }
  if (cookie.name.startsWith("__Host")) {
    cookie.path = "/";
    cookie.secure = true;
    delete cookie.domain;
  }

  if (cookie.secure) {
    out.push("Secure");
  }
  if (cookie.httpOnly) {
    out.push("HttpOnly");
  }
  if (cookie.partitioned) {
    out.push("Partitioned");
  }
  if (typeof cookie.maxAge === "number" && Number.isInteger(cookie.maxAge)) {
    if (cookie.maxAge < 0) {
      throw new RangeError(
        `Cannot serialize cookie as Max-Age must be >= 0: received ${cookie.maxAge}`,
      );
    }
    out.push(`Max-Age=${cookie.maxAge}`);
  }
  if (cookie.domain) {
    validateDomain(cookie.domain);
    out.push(`Domain=${cookie.domain}`);
  }
  if (cookie.sameSite) {
    out.push(`SameSite=${cookie.sameSite}`);
  }
  if (cookie.path) {
    validatePath(cookie.path);
    out.push(`Path=${cookie.path}`);
  }
  if (cookie.expires) {
    const { expires } = cookie;
    const date = typeof expires === "number" ? new Date(expires) : expires;
    out.push(`Expires=${date.toUTCString()}`);
  }
  if (cookie.unparsed) {
    out.push(cookie.unparsed.join("; "));
  }
  return out.join("; ");
}

/**
 * Validate Cookie Name.
 * @param name Cookie name.
 */
function validateName(name: string | undefined | null) {
  if (name && !FIELD_CONTENT_REGEXP.test(name)) {
    throw new SyntaxError(`Invalid cookie name: "${name}"`);
  }
}

/**
 * Validate Path Value.
 * See {@link https://www.rfc-editor.org/rfc/rfc6265.html#section-4.1.2.4}.
 * @param path Path value.
 */
function validatePath(path: string | null) {
  if (path === null) {
    return;
  }
  for (let i = 0; i < path.length; i++) {
    const c = path.charAt(i);
    if (
      c < String.fromCharCode(0x20) || c > String.fromCharCode(0x7E) ||
      c === ";"
    ) {
      throw new SyntaxError(
        `Cookie path "${path}" contains invalid character: "${c}"`,
      );
    }
  }
}

/**
 * Validate Cookie Value.
 * See {@link https://www.rfc-editor.org/rfc/rfc6265.html#section-4.1}.
 * @param value Cookie value.
 */
function validateValue(name: string, value: string | null) {
  if (value === null) return;
  for (let i = 0; i < value.length; i++) {
    const c = value.charAt(i);
    if (
      c < String.fromCharCode(0x21) || c === String.fromCharCode(0x22) ||
      c === String.fromCharCode(0x2c) || c === String.fromCharCode(0x3b) ||
      c === String.fromCharCode(0x5c) || c === String.fromCharCode(0x7f)
    ) {
      throw new SyntaxError(
        "RFC2616 cookie '" + name + "' cannot contain character '" + c + "'",
      );
    }
    if (c > String.fromCharCode(0x80)) {
      throw new SyntaxError(
        "RFC2616 cookie '" + name +
          "' can only have US-ASCII chars as value: It contains 0x" +
          c.charCodeAt(0).toString(16),
      );
    }
  }
}

/**
 * Validate Cookie Domain.
 * See {@link https://www.rfc-editor.org/rfc/rfc6265.html#section-4.1.2.3}.
 * @param domain Cookie domain.
 */
function validateDomain(domain: string) {
  const char1 = domain.charAt(0);
  const charN = domain.charAt(domain.length - 1);
  if (char1 === "-" || charN === "." || charN === "-") {
    throw new SyntaxError(
      "Invalid first/last char in cookie domain: " + domain,
    );
  }
}

/**
 * Parse cookies of a header
 *
 * @example Usage
 * ```ts
 * import { getCookies } from "cookie.ts";
 * import { assertEquals } from "../assert/mod.ts";
 *
 * const headers = new Headers();
 * headers.set("Cookie", "full=of; tasty=chocolate");
 *
 * const cookies = getCookies(headers);
 * assertEquals(cookies, { full: "of", tasty: "chocolate" });
 * ```
 *
 * @param headers The headers instance to get cookies from
 * @return Object with cookie names as keys
 */
export function getCookies(headers: Headers): Record<string, string> {
  const cookie = headers.get("Cookie");
  if (cookie !== null) {
    const out: Record<string, string> = {};
    const c = cookie.split(";");
    for (const kv of c) {
      const [cookieKey, ...cookieVal] = kv.split("=");
      if (cookieKey === undefined) {
        throw new SyntaxError("Cookie cannot start with '='");
      }
      const key = cookieKey.trim();
      out[key] = cookieVal.join("=");
    }
    return out;
  }
  return {};
}

/**
 * Set the cookie header properly in the headers
 *
 * @example Usage
 * ```ts
 * import { Cookie, setCookie } from "cookie.ts";
 * import { assertEquals } from "../assert/mod.ts";
 *
 * const headers = new Headers();
 * const cookie: Cookie = { name: "Space", value: "Cat" };
 * setCookie(headers, cookie);
 *
 * const cookieHeader = headers.get("set-cookie");
 *
 * assertEquals(cookieHeader, "Space=Cat");
 * ```
 *
 * @param headers The headers instance to set the cookie to
 * @param cookie Cookie to set
 */
export function setCookie(headers: Headers, cookie: Cookie) {
  // Parsing cookie headers to make consistent set-cookie header
  // ref: https://www.rfc-editor.org/rfc/rfc6265.html#section-4.1.1
  const v = toString(cookie);
  if (v) {
    headers.append("Set-Cookie", v);
  }
}

/**
 * Set the cookie header with empty value in the headers to delete it.
 *
 * The attributes (`path`, `domain`, `secure`, `httpOnly`, `partitioned`) need
 * to match the values when the cookie was set.
 *
 * > Note: Deleting a `Cookie` will set its expiration date before now. Forcing
 * > the browser to delete it.
 *
 * @example Usage
 * ```ts
 * import { deleteCookie } from "cookie.ts";
 * import { assertEquals } from "../assert/mod.ts";
 *
 * const headers = new Headers();
 * deleteCookie(headers, "deno");
 *
 * const cookieHeader = headers.get("set-cookie");
 *
 * assertEquals(cookieHeader, "deno=; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
 * ```
 *
 * @param headers The headers instance to delete the cookie from
 * @param name Name of cookie
 * @param attributes Additional cookie attributes
 */
export function deleteCookie(
  headers: Headers,
  name: string,
  attributes?: Pick<
    Cookie,
    "path" | "domain" | "secure" | "httpOnly" | "partitioned"
  >,
) {
  setCookie(headers, {
    name: name,
    value: "",
    expires: new Date(0),
    ...attributes,
  });
}

function parseSetCookie(value: string): Cookie | null {
  const attrs = value
    .split(";")
    .map((attr) => {
      const [key, ...values] = attr.trim().split("=");
      return [key!, values.join("=")] as const;
    });

  if (!attrs[0]) {
    return null;
  }

  const cookie: Cookie = {
    name: attrs[0][0],
    value: attrs[0][1],
  };

  for (const [key, value] of attrs.slice(1)) {
    switch (key.toLowerCase()) {
      case "expires":
        cookie.expires = new Date(value);
        break;
      case "max-age":
        cookie.maxAge = Number(value);
        if (cookie.maxAge < 0) {
          // deno-lint-ignore no-console
          console.warn(
            "Max-Age must be an integer superior or equal to 0. Cookie ignored.",
          );
          return null;
        }
        break;
      case "domain":
        cookie.domain = value;
        break;
      case "path":
        cookie.path = value;
        break;
      case "secure":
        cookie.secure = true;
        break;
      case "httponly":
        cookie.httpOnly = true;
        break;
      case "samesite":
        cookie.sameSite = value as NonNullable<Cookie["sameSite"]>;
        break;
      default:
        if (!Array.isArray(cookie.unparsed)) {
          cookie.unparsed = [];
        }
        cookie.unparsed.push([key, value].join("="));
    }
  }
  if (cookie.name.startsWith("__Secure-")) {
    /** This requirement is mentioned in https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie but not the RFC. */
    if (!cookie.secure) {
      // deno-lint-ignore no-console
      console.warn(
        "Cookies with names starting with `__Secure-` must be set with the secure flag. Cookie ignored.",
      );
      return null;
    }
  }
  if (cookie.name.startsWith("__Host-")) {
    if (!cookie.secure) {
      // deno-lint-ignore no-console
      console.warn(
        "Cookies with names starting with `__Host-` must be set with the secure flag. Cookie ignored.",
      );
      return null;
    }
    if (cookie.domain !== undefined) {
      // deno-lint-ignore no-console
      console.warn(
        "Cookies with names starting with `__Host-` must not have a domain specified. Cookie ignored.",
      );
      return null;
    }
    if (cookie.path !== "/") {
      // deno-lint-ignore no-console
      console.warn(
        "Cookies with names starting with `__Host-` must have path be `/`. Cookie has been ignored.",
      );
      return null;
    }
  }
  return cookie;
}

/**
 * Parse set-cookies of a header
 *
 * @example Usage
 * ```ts
 * import { getSetCookies } from "cookie.ts";
 * import { assertEquals } from "../assert/mod.ts";
 *
 * const headers = new Headers([
 *   ["Set-Cookie", "lulu=meow; Secure; Max-Age=3600"],
 *   ["Set-Cookie", "booya=kasha; HttpOnly; Path=/"],
 * ]);
 *
 * const cookies = getSetCookies(headers);
 *
 * assertEquals(cookies[0], {
 *   name: "lulu",
 *   value: "meow",
 *   secure: true,
 *   maxAge: 3600
 * });
 * ```
 *
 * @param headers The headers instance to get set-cookies from
 * @return List of cookies
 */
export function getSetCookies(headers: Headers): Cookie[] {
  return headers.getSetCookie()
    /** Parse each `set-cookie` header separately */
    .map(parseSetCookie)
    /** Skip empty cookies */
    .filter(Boolean) as Cookie[];
}
