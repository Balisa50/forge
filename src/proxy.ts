import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// NextAuth v5 cookie names differ from v4: secure deploys use the
// `__Secure-authjs.session-token` prefix, non-HTTPS dev uses
// `authjs.session-token`. The shared secret is `AUTH_SECRET` (v5
// renamed it from NEXTAUTH_SECRET). We try both env vars so an
// older deploy with only NEXTAUTH_SECRET still decrypts.
const AUTH_COOKIE = process.env.NODE_ENV === "production"
  ? "__Secure-authjs.session-token"
  : "authjs.session-token";

export async function proxy(req: NextRequest) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret, cookieName: AUTH_COOKIE });
  const { pathname } = req.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if ((isDashboard || isOnboarding) && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/login", "/register"],
};
