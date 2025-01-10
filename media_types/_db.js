// Copyright 2018-2025 the Deno authors. MIT license.
import db from "./vendor/db.js";
/** A map of the media type for a given extension */
export const types = new Map();
/** A map of extensions for a given media type. */
const extensions = new Map();
/** Internal function to populate the maps based on the Mime DB. */
const preference = ["nginx", "apache", undefined, "iana"];
for (const type of Object.keys(db)) {
  const mime = db[type];
  const exts = mime.extensions;
  if (!exts || !exts.length) {
    continue;
  }
  // @ts-ignore Work around https://github.com/denoland/dnt/issues/148
  extensions.set(type, exts);
  for (const ext of exts) {
    const current = types.get(ext);
    if (current) {
      const from = preference.indexOf(db[current].source);
      const to = preference.indexOf(mime.source);
      if (
        current !== "application/octet-stream" &&
        current !== "application/mp4" &&
        (from > to ||
          // @ts-ignore work around https://github.com/denoland/dnt/issues/148
          (from === to && current.startsWith("application/")))
      ) {
        continue;
      }
    }
    types.set(ext, type);
  }
}
export { db, extensions };
