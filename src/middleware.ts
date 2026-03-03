import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const { token } = req.nextauth

    // Protect admin routes - only ADMIN, EDITOR, and AUTHOR can access
    if (pathname.startsWith("/admin")) {
      if (!token || !["ADMIN", "EDITOR", "AUTHOR"].includes(token.role as string)) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }

    // Only ADMIN can access user management
    if (pathname.startsWith("/admin/users")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized() {
        // This is handled in the middleware function above
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*"],
}
