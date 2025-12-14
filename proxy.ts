import { NextRequest, NextResponse } from "next/server";
import {
    convexAuthNextjsMiddleware,
    createRouteMatcher,
    nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const ROOT_DOMAIN = process.env.ROOT_DOMAIN || "braunstud.io";

// Define public routes that don't require authentication
const isPublicPage = createRouteMatcher([
    "/",
    "/app/sign-in",
    "/sign-in",
    "/w/(.*)", // Wedding sites are public
    "/preview/(.*)", // Preview pages are public
]);

export default convexAuthNextjsMiddleware(
    async (request: NextRequest, { convexAuth }) => {
        const url = request.nextUrl.clone();
        const hostname = request.headers.get("host") || "";

        // Remove port for local development
        const currentHost = hostname.replace(/:\d+$/, "");

        // Handle localhost for development
        const isLocalhost =
            currentHost === "localhost" || currentHost === "127.0.0.1";

        // If on localhost, check for custom header or query param to simulate subdomains
        // In production, we parse the actual subdomain
        let subdomain: string | null = null;

        if (isLocalhost) {
            // For local dev, use query param ?subdomain=app or ?subdomain=slug
            // or x-subdomain header for easier testing
            subdomain =
                url.searchParams.get("subdomain") ||
                request.headers.get("x-subdomain");
        } else {
            // Extract subdomain from hostname
            // e.g., "app.braunstud.io" -> "app"
            // e.g., "john-jane.braunstud.io" -> "john-jane"
            // e.g., "braunstud.io" -> null
            const hostParts = currentHost.split(".");
            const domainParts = ROOT_DOMAIN.split(".");

            if (hostParts.length > domainParts.length) {
                subdomain = hostParts
                    .slice(0, hostParts.length - domainParts.length)
                    .join(".");
            }
        }

        // Route based on subdomain
        if (subdomain === "app") {
            // Platform app (admin + couple dashboards)
            // Rewrite to /app/* routes
            url.pathname = `/app${url.pathname}`;
            return NextResponse.rewrite(url);
        }

        if (subdomain && subdomain !== "www") {
            // Wedding site subdomain (e.g., john-jane.braunstud.io)
            // Rewrite to /w/[slug]/* routes
            url.pathname = `/w/${subdomain}${url.pathname}`;
            return NextResponse.rewrite(url);
        }

        // Root domain or www subdomain
        // Marketing site + preview routes (handled normally)
        // /preview/[token] is already at root level
        const response = NextResponse.next();

        // Check authentication for protected routes
        if (!isPublicPage(request) && !(await convexAuth.isAuthenticated())) {
            return nextjsMiddlewareRedirect(request, "/app/sign-in");
        }

        return response;
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
