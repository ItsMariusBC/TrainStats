// src/app/admin/layout.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  Settings, 
  Users, 
  Train, 
  Home,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { UserNav } from "@/components/user-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const navItems = [
    {
      href: "/admin",
      label: "Vue d'ensemble",
      icon: LayoutDashboard
    },
    {
      href: "/admin/trajets",
      label: "Trajets",
      icon: Train
    },
    {
      href: "/admin/users",
      label: "Utilisateurs",
      icon: Users
    },
    {
      href: "/admin/settings",
      label: "Paramètres",
      icon: Settings
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Navigation */}
            <div className="flex items-center gap-8">
              <Link 
                href="/admin" 
                className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity"
              >
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Train className="h-5 w-5" />
                </div>
                <span className="font-semibold text-lg">Admin</span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-2 rounded-lg text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-primary flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                <span className="hidden md:inline">Retour au dashboard</span>
              </Link>
              <UserNav />
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Navigation mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-2 text-gray-600 hover:text-primary"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}