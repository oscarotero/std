import {
  BlobReader,
  TextWriter,
  ZipReader,
} from "https://deno.land/x/zipjs@v2.7.52/index.js";

import {
  dirname,
  relative,
} from "https://deno.land/x/_std@1.0.0/path/posix/mod.ts";

// Fetch the latest release of the std repository
const release = await (await fetch(
  "https://api.github.com/repos/denoland/std/releases/latest",
)).json();

const { zipball_url } = release;

const stablePackages = [
  "assert",
  "async",
  "bytes",
  "cli",
  "collections",
  "crypto",
  "csv",
  "data-structures",
  "encoding",
  "expect",
  "fmt",
  "front-matter",
  // "fs",
  // "ini",
  "html",
  "http",
  "internal",
  "json",
  "jsonc",
  "media-types",
  "msgpack",
  // "net",
  "path",
  "regexp",
  "semver",
  "streams",
  // "testing",
  "text",
  "toml",
  "ulid",
  "uuid",
  "yaml",
];

// Remove the previous std code
for await (const entry of Deno.readDir(".")) {
  if (![".git", "convert.ts", "README.md"].includes(entry.name)) {
    await Deno.remove(entry.name, { recursive: true });
  }
}

// Read the zip file
const zip = await (await fetch(zipball_url)).arrayBuffer();
const reader = new ZipReader(new BlobReader(new Blob([zip])));

// Filters to exclude certain files
const filters = [
  "/.",
  "/_tools/",
  "/testdata/",
  "/_test_",
  "_test.ts",
  "/unstable_",
  "/http",
];

const filterExceptions = [
  "/_test_comparator_set.ts",
  "/_test_comparator_get.ts",
  "/yaml/unstable_parse.ts",
  "/yaml/unstable_stringify.ts",
  "/http/_negotiation",
  "/http/negotiation.ts",
];

// Extract the files from the std repository
for await (const entry of reader.getEntriesGenerator()) {
  // Exclude directories and non-TS files
  if (
    entry.directory || !entry.filename.endsWith(".ts") ||
    (filters.some((filter) => entry.filename.includes(filter)) &&
      !filterExceptions.some((filter) => entry.filename.includes(filter)))
  ) {
    continue;
  }
  // Exclude unstable packages
  const dir = entry.filename.replace(/^[^/]+\//, "/"); // Remove the root directory
  if (
    !stablePackages.some((pkg) =>
      dir.startsWith(`/${pkg.replaceAll("-", "_")}/`)
    )
  ) {
    continue;
  }

  const [, filename] = entry.filename.match(/[^/]+\/(.*)$/)!;
  const path = convertPath(filename);

  try {
    await Deno.mkdir(dirname(path), { recursive: true });
  } catch {
    // Ignore
  }

  const writer = new TextWriter();
  const data = await entry.getData?.(writer);

  if (!data) {
    continue;
  }
  const code = fixImports(dirname(path), data);
  await Deno.writeTextFile(path, code);
}

await reader.close();

// Run tsc to compile the std repository
await Deno.writeTextFile(
  "tsconfig.json",
  JSON.stringify(
    {
      compilerOptions: {
        target: "es2022",
        allowImportingTsExtensions: true,
        moduleResolution: "NodeNext",
        rewriteRelativeImportExtensions: true,
        declaration: true,
      },
      exclude: ["convert.ts"],
    },
    null,
    2,
  ),
);

await new Deno.Command("deno", {
  args: ["run", "-A", "npm:typescript@^7/tsc", "-p", "."],
}).output();

await Deno.remove("tsconfig.json");

// Create a package.json file to publish on npm
await Deno.writeTextFile(
  "package.json",
  JSON.stringify(
    {
      name: "deno-std",
      version: "1.6.0",
      description: "Deno std packages in a single package",
      type: "module",
      repository: {
        "type": "git",
        "url": "git+https://github.com/oscarotero/std.git",
      },
      keywords: [
        "deno",
        "std",
      ],
      author: "Óscar Otero",
      license: "MIT",
      bugs: {
        url: "https://github.com/oscarotero/std/issues",
      },
      homepage: "https://github.com/oscarotero/std#readme",
      files: [
        "**/*.js",
        "**/*.d.ts",
      ],
      exports: {
        "./*.ts": {
          types: "./*.d.ts",
          import: "./*.js",
        },
        "./*.js": {
          types: "./*.d.ts",
          import: "./*.js",
        },
      },
    },
    null,
    2,
  ),
);

// Run Deno to format the std repository
await new Deno.Command("deno", {
  args: ["fmt", "."],
}).output();

function fixImports(base: string, code: string): string {
  return code.replaceAll(
    /from "([^"]+)"/g,
    (_, mod) => `from "${resolve(base, mod)}"`,
  );
}

function resolve(base: string, path: string): string {
  const isStd = path.match(/@std\/([^/]+)(\/.*)?/);

  if (isStd) {
    const [, mod, filename] = isStd;

    path = relative(
      base,
      filename ? `${mod}/${filename.replaceAll("-", "_")}.ts` : `${mod}/mod.ts`,
    );
  }

  return convertPath(path);
}

// Convert underscore to hyphen (ie: front_matter -> front-matter)
function convertPath(path: string) {
  return path.replaceAll(/(\w)_(\w)/g, "$1-$2");
}
