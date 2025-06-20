// src/components/navbar.tsx
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Train } from "lucide-react";

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Train className="h-6 w-6 text-primary" />
            <Link 
              href="/dashboard" 
              className="text-xl font-semibold text-primary"
            >
              TrainStats
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}