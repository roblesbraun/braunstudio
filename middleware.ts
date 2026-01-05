import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const isProtectedRoute = createRouteMatcher(["/app/admin(.*)", "/app/couple(.*)"]);

// Main domain (without protocol)
const MAIN_DOMAIN = "braunstud.io";
const APP_SUBDOMAIN = "app";

/**
 * Parse the host header to determine routing context.
 * Returns:
 *  - { type: "app" } for app.braunstud.io
 *  - { type: "root" } for braunstud.io (or www.braunstud.io)
 *  - { type: "wedding", slug: string } for {slug}.braunstud.io
 *  - { type: "local" } for localhost development
 */
function parseHost(host: string): 
  | { type: "app" }
  | { type: "root" }
  | { type: "wedding"; slug: string }
  | { type: "local" } {
  // Remove port if present
  const hostWithoutPort = host.split(":")[0];

  // Local development
  if (hostWithoutPort === "localhost" || hostWithoutPort === "127.0.0.1") {
    return { type: "local" };
  }

  // Check if it's our main domain
  if (!hostWithoutPort.endsWith(MAIN_DOMAIN)) {
    // Could be a custom domain in the future, treat as local for now
    return { type: "local" };
  }

  // Extract subdomain
  const subdomain = hostWithoutPort.replace(`.${MAIN_DOMAIN}`, "");

  // No subdomain or www = root domain
  if (subdomain === MAIN_DOMAIN || subdomain === "" || subdomain === "www") {
    return { type: "root" };
  }

  // App subdomain
  if (subdomain === APP_SUBDOMAIN) {
    return { type: "app" };
  }

  // Any other subdomain is a wedding slug
  return { type: "wedding", slug: subdomain };
}

export default convexAuthNextjsMiddleware(
  async (request: NextRequest, { convexAuth }) => {
    const host = request.headers.get("host") || "";
    const hostInfo = parseHost(host);
    const { pathname } = request.nextUrl;

    // ─────────────────────────────────────────────────────────────────────
    // Wedding subdomain: rewrite to /w/[slug]
    // ─────────────────────────────────────────────────────────────────────
    if (hostInfo.type === "wedding") {
      const url = request.nextUrl.clone();
      url.pathname = `/w/${hostInfo.slug}${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Protected routes: require authentication
    // ─────────────────────────────────────────────────────────────────────
    if (isProtectedRoute(request)) {
      const isAuthenticated = await convexAuth.isAuthenticated();
      if (!isAuthenticated) {
        return nextjsMiddlewareRedirect(request, "/login");
      }
    }

    // ─────────────────────────────────────────────────────────────────────
    // All other routes: continue normally
    // ─────────────────────────────────────────────────────────────────────
    return NextResponse.next();
  }
);

export const config = {
  // Match all routes except static assets and Next.js internals
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

