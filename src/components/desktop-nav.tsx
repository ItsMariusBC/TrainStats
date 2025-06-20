"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, MapPin, User, Settings, LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: string;  // Maintenant une chaîne de caractères
}

interface DesktopNavProps {
  items: NavItem[];
}

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

export function DesktopNav({ items }: DesktopNavProps) {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex items-center space-x-1">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = getIcon(item.icon);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}