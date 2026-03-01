import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ADMIN_ROLES = ["MANAGER", "RECEPTIONIST", "HOUSEKEEPER"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Check for session token (set by NextAuth)
  const token =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value

  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    // Role-based checks would be done in the admin layout's server-side auth check
    // Middleware just ensures user is logged in
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
