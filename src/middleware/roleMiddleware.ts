import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Liste des routes protégées et leur niveau d'accès requis
const protectedRoutes = [
  { path: '/admin', role: 'ADMIN' },
  { path: '/api/admin', role: 'ADMIN' },
  { path: '/api/journeys/update', role: 'ADMIN' },
  { path: '/api/journeys/create', role: 'ADMIN' },
  { path: '/api/journeys/delete', role: 'ADMIN' },
];

export async function roleMiddleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(url);
  }

  // Vérifier le rôle pour les routes restreintes
  const userRole = token.role as string;
  const path = request.nextUrl.pathname;

  // Vérifier si la route actuelle est protégée
  for (const route of protectedRoutes) {
    if (path.startsWith(route.path)) {
      // Si la route nécessite un rôle spécifique que l'utilisateur n'a pas
      if (route.role === 'ADMIN' && userRole !== 'ADMIN') {
        // Rediriger vers une page d'erreur d'autorisation
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  // Autoriser la requête si tout est en ordre
  return NextResponse.next();
}
