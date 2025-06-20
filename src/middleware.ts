import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (req.nextauth.token?.role !== "ADMIN" && (
      req.nextUrl.pathname.startsWith("/admin") ||
      req.nextUrl.pathname.startsWith("/api/admin") ||
      req.nextUrl.pathname.startsWith("/api/journeys/create") ||
      req.nextUrl.pathname.startsWith("/api/journeys/update") ||
      req.nextUrl.pathname.startsWith("/api/journeys/delete")
    )) {
      const url = new URL("/dashboard", req.url);
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/admin/:path*", 
    "/api/admin/:path*",
    "/api/journeys/:path*"
  ],
};