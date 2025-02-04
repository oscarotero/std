// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Contains the functions {@linkcode accepts}, {@linkcode acceptsEncodings}, and
 * {@linkcode acceptsLanguages} to provide content negotiation capabilities.
 *
 * @module
 */
import { preferredEncodings } from "./_negotiation/encoding.js";
import { preferredLanguages } from "./_negotiation/language.js";
import { preferredMediaTypes } from "./_negotiation/media_type.js";
export function accepts(request, ...types) {
  const accept = request.headers.get("accept");
  return types.length
    ? accept ? preferredMediaTypes(accept, types)[0] : types[0]
    : accept
    ? preferredMediaTypes(accept)
    : ["*/*"];
}
export function acceptsEncodings(request, ...encodings) {
  const acceptEncoding = request.headers.get("accept-encoding");
  return encodings.length
    ? acceptEncoding
      ? preferredEncodings(acceptEncoding, encodings)[0]
      : encodings[0]
    : acceptEncoding
    ? preferredEncodings(acceptEncoding)
    : ["*"];
}
export function acceptsLanguages(request, ...langs) {
  const acceptLanguage = request.headers.get("accept-language");
  return langs.length
    ? acceptLanguage ? preferredLanguages(acceptLanguage, langs)[0] : langs[0]
    : acceptLanguage
    ? preferredLanguages(acceptLanguage)
    : ["*"];
}
