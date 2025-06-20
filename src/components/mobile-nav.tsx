"use client";

import { Home, MapPin, User, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Fonction utilitaire pour obtenir les éléments de navigation
const getNavItems = (isAdmin: boolean) => [
  {
    href: "/dashboard",
    icon: "home",
    label: "Accueil",
  },
  {
    href: "/journeys",
    icon: "map-pin",
    label: "Trajets",
  },
  {
    href: "/profile",
    icon: "user",
    label: "Profil",
  },
  ...(isAdmin ? [{ href: "/admin", icon: "settings", label: "Admin" }] : []),
];

// Fonction utilitaire pour mapper les chaînes aux composants d'icône
const getIcon = (icon: string) => {
  switch (icon) {
    case "home": return Home;
    case "map-pin": return MapPin;
    case "user": return User;
    case "settings": return Settings;
    default: return Home;
  }
};

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const navItems = getNavItems(isAdmin);

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="px-6 py-2 bg-white border-t border-gray-200">
        <nav className="flex items-center justify-around bg-white rounded-2xl shadow-lg border border-gray-100 py-2 px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = getIcon(item.icon);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative group"
              >
                <div className="flex flex-col items-center p-2">
                  <div className="relative">
                    {isActive && (
                      <motion.div
                        layoutId="navIndicator"
                        className="absolute inset-0 bg-primary/10 rounded-full -m-1 p-1"
                        initial={false}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                    <Icon 
                      className={cn(
                        "h-6 w-6 relative z-10 transition-colors duration-300",
                        isActive ? "text-primary" : "text-gray-500 group-hover:text-primary/70"
                      )} 
                    />
                  </div>
                  
                  <motion.span 
                    className={cn(
                      "text-xs mt-1 font-medium transition-colors duration-300",
                      isActive ? "text-primary" : "text-gray-500 group-hover:text-primary/70"
                    )}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {item.label}
                  </motion.span>
                  
                  {isActive && (
                    <motion.div 
                      className="absolute -bottom-1 w-1.5 h-1.5 bg-primary rounded-full"
                      layoutId="navDot"
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  )}
                </div>
                
                <motion.div
                  className="absolute -inset-1 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 -z-10"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.div>
  );
}