// src/app/(public)/layout.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Train } from "lucide-react";
import Link from "next/link";
import { UserNav } from "@/components/user-nav";
import { MobileNav } from "@/components/mobile-nav";
import { DesktopNav } from "@/components/desktop-nav";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  // Utiliser des chaînes au lieu de composants React
  const navItems = [
    {
      href: "/dashboard",
      label: "Accueil",
      icon: "home"  // changer en chaîne
    },
    {
      href: "/journeys",
      label: "Trajets",
      icon: "map-pin"  // changer en chaîne
    },
    {
      href: "/profile",
      label: "Profil",
      icon: "user"  // changer en chaîne
    },
    ...(isAdmin ? [{
      href: "/admin",
      label: "Admin",
      icon: "settings"  // changer en chaîne
    }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header desktop */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 md:block hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Train className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  TrainStats
                </span>
              </Link>
              
              {/* Navigation desktop */}
              <DesktopNav items={navItems} />
            </div>
            
            <UserNav />
          </div>
        </div>
      </nav>

      {/* Header mobile */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 md:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Train className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-semibold text-gray-900">
              TrainStats
            </span>
          </Link>
          <UserNav />
        </div>
      </div>

      {/* Contenu principal avec padding-bottom pour la nav mobile */}
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6">
        {children}
      </main>

      {/* Navigation mobile */}
      <MobileNav />
    </div>
  );
}