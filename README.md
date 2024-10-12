# Deno std

Import [Deno std library](https://jsr.io/@std) using HTTP modules, in a single
package, with no dependencies. Compatible with browsers, Node, Bun, and Deno.

## Use in browsers

The package can be imported from
[jsDelivr](https://www.jsdelivr.com/package/gh/oscarotero/std?tab=files) as
standard HTTPS JavaScript modules:

```html
<script type="module">
  import { basename } from "https://cdn.jsdelivr.net/gh/oscarotero/std@1.0.0/path/mod.js";

  console.log(basename("/hello/world.html"));
</script>
```

## Use in Node/Bun

This package is also published in
[NPM as `deno-std`](https://www.npmjs.com/package/deno-std).

```
npm install deno-std
```

```js
import { basename } from "deno-std/path/mod.js";

console.log(basename("/hello/world.html"));
```

## Use in Deno

In Deno you can import the official
[@std packages from jsr.io](https://jsr.io/@std). But if you prefer to manage a
single version including all stable packages, you can import it from
[deno.land/x/_std](https://deno.land/x/_std@1.0.0):

```ts
import { basename } from "https://deno.land/x/_std@1.0.0/path/mod.ts";

console.log(basename("/hello/world.html"));
```

Due `land/x` repository is not maintained anymore by Deno, you can import the
package
[from `jsDelivr`](https://www.jsdelivr.com/package/gh/oscarotero/std?tab=files),
which probably is faster and with higher availability.

```ts
import { basename } from "https://cdn.jsdelivr.net/gh/oscarotero/std@1.0.0/path/mod.ts";

console.log(basename("/hello/world.html"));
```
