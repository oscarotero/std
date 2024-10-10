// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/**
 * Routes requests to different handlers based on the request path and method.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @example Usage
 * ```ts ignore
 * import { route, type Route } from "unstable_route.js";
 * import { serveDir } from "file_server.js";
 *
 * const routes: Route[] = [
 *   {
 *     pattern: new URLPattern({ pathname: "/about" }),
 *     handler: () => new Response("About page"),
 *   },
 *   {
 *     pattern: new URLPattern({ pathname: "/users/:id" }),
 *     handler: (_req, _info, params) => new Response(params?.pathname.groups.id),
 *   },
 *   {
 *     pattern: new URLPattern({ pathname: "/static/*" }),
 *     handler: (req: Request) => serveDir(req)
 *   },
 *   {
 *     method: ["GET", "HEAD"],
 *     pattern: new URLPattern({ pathname: "/api" }),
 *     handler: (req: Request) => new Response(req.method === 'HEAD' ? null : 'ok'),
 *   },
 * ];
 *
 * function defaultHandler(_req: Request) {
 *   return new Response("Not found", { status: 404 });
 * }
 *
 * Deno.serve(route(routes, defaultHandler));
 * ```
 *
 * @param routes Route configurations
 * @param defaultHandler Default request handler that's returned when no route
 * matches the given request. Serving HTTP 404 Not Found or 405 Method Not
 * Allowed response can be done in this function.
 * @returns Request handler
 */
export function route(routes, defaultHandler) {
  // TODO(iuioiua): Use `URLPatternList` once available (https://github.com/whatwg/urlpattern/pull/166)
  return (request, info) => {
    for (const route of routes) {
      const match = route.pattern.exec(request.url);
      if (
        match &&
        (Array.isArray(route.method)
          ? route.method.includes(request.method)
          : request.method === (route.method ?? "GET"))
      ) {
        return route.handler(request, info, match);
      }
    }
    return defaultHandler(request, info);
  };
}
