// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Vérifier les routes admin et fonctionalités réservées
    if (req.nextauth.token?.role !== "ADMIN" && (
      // Routes administratives
      req.nextUrl.pathname.startsWith("/admin") ||
      // API d'administration
      req.nextUrl.pathname.startsWith("/api/admin") ||
      // API de modification des trajets
      req.nextUrl.pathname.startsWith("/api/journeys/create") ||
      req.nextUrl.pathname.startsWith("/api/journeys/update") ||
      req.nextUrl.pathname.startsWith("/api/journeys/delete")
    )) {
      // Rediriger vers le tableau de bord avec un message d'erreur
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