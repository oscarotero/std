// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2025 the Deno authors. MIT license.
export const merge = {
  tag: "tag:yaml.org,2002:merge",
  kind: "scalar",
  resolve: (data) => data === "<<" || data === null,
  construct: (data) => data,
};
