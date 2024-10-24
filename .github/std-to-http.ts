import {
  BlobReader,
  TextWriter,
  ZipReader,
} from "https://deno.land/x/zipjs@v2.7.52/index.js";

import {
  dirname,
  relative,
} from "https://deno.land/x/_std@1.0.0/path/posix/mod.ts";
import { walk } from "https://deno.land/x/_std@1.0.0/fs/walk.ts";
import versions from "./versions.json" with { type: "json" };

// Fetch the latest release of the std repository
const release = await (await fetch(
  "https://api.github.com/repos/denoland/std/releases/latest",
)).json();

const { tag_name, zipball_url } = release;

if (versions[tag_name]) {
  console.log(`The version ${tag_name} is already published as ${versions[tag_name]}`);
  Deno.exit();
}

// Remove the previous std code
for await (const entry of Deno.readDir(".")) {
  if (![".git", ".github", "README.md"].includes(entry.name)) {
    await Deno.remove(entry.name, { recursive: true });
  }
}

const last = Object.values(versions).pop()!;

// Increment patch version
const [major, minor, patch] = last.split(".").map(Number);
const version = `${major}.${minor}.${patch + 1}`;
versions[tag_name] = version;
Deno.writeTextFile(".github/versions.json", JSON.stringify(versions, null, 2));

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
  "/archive/",
  "/cache/",
  "/cbor/",
  "/datetime/",
  "/dotenv/",
  "/ini/",
  "/io/",
  "/log/",
  "/random/",
  "/tar/",
  "/webgpu/",
];

// Extract the files from the std repository
for await (const entry of reader.getEntriesGenerator()) {
  // Exclude directories and non-TS files
  if (
    entry.directory || !entry.filename.endsWith(".ts") ||
    filters.some((filter) => entry.filename.includes(filter))
  ) {
    continue;
  }

  const [, filename] = entry.filename.match(/[^/]+\/(.*)$/)!;
  const path = `${filename}`;

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
      },
    },
    null,
    2,
  ),
);

await new Deno.Command("deno", {
  args: ["run", "-A", "npm:typescript/tsc", "-p", "."],
}).output();

await Deno.remove("tsconfig.json");

// Replace .ts extensions with .js in the imports of JavaScript files
for await (const { path } of walk(".", { exts: [".js"] })) {
  const code = await Deno.readTextFile(path);
  Deno.writeTextFile(path, code.replaceAll(/\.ts";/g, '.js";'));
}

// Create a package.json file to publish on npm
await Deno.writeTextFile(
  "package.json",
  JSON.stringify(
    {
      name: "deno-std",
      version,
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
      files: ["*/*.js"],
      exports: Object.fromEntries(
        Array.from(Deno.readDirSync("."))
          .sort((a, b) => a.name.localeCompare(b.name))
          .filter((entry) => entry.isDirectory && !entry.name.startsWith("."))
          .map((entry) => [`./${entry.name}/*.js`, `./${entry.name}/*.js`]),
      ),
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
    /from "(@std\/[^"]+)"/g,
    (_, mod) => `from "${resolve(base, mod)}"`,
  );
}

function resolve(base: string, path: string): string {
  const [, mod, filename] = path.match(/@std\/([^/]+)(\/.*)?/)!;
  return relative(
    base,
    filename ? `${mod}/${filename.replaceAll("-", "_")}.ts` : `${mod}/mod.ts`,
  );
}
