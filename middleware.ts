import { getServerEnv } from "@/lib/env";
import { copyCookies, updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

// First path segments that are NOT tenant slugs. Anything else is treated
// as `/[orgSlug]/...` and therefore requires an authenticated session.
// Membership verification itself happens in the layout (defense in depth).
const RESERVED_FIRST_SEGMENTS = new Set([
  "",
  "login",
  "admin",
  "auth",
  "api",
  "p",
  "tv",
  "embed",
  "superadmin",
  "dev",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "manifest.webmanifest",
  "~offline",
]);

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  const firstSegment = pathname.split("/")[1] ?? "";
  const isTenantRoute = !RESERVED_FIRST_SEGMENTS.has(firstSegment);

  // Auth gate for tenant-scoped routes.
  if (isTenantRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?redirectTo=${encodeURIComponent(pathname + search)}`;
    return copyCookies(response, NextResponse.redirect(url));
  }

  // Already-authed users on /login or /admin bounce to home.
  if ((pathname === "/login" || pathname === "/admin") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return copyCookies(response, NextResponse.redirect(url));
  }

  // Security headers.
  if (firstSegment === "embed") {
    // Embed route must be frameable by whitelisted origins (LEV intranet etc.).
    const { EMBED_FRAME_ANCESTORS } = getServerEnv();
    response.headers.set("Content-Security-Policy", `frame-ancestors ${EMBED_FRAME_ANCESTORS}`);
    response.headers.delete("X-Frame-Options");
  } else {
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
  }

  return response;
}

export const config = {
  matcher: [
    // Run on all paths except static assets, service worker, and favicon.
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|swe-worker-.*\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
