// src/components/user-nav.tsx
"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { 
  User, 
  LogOut, 
  Settings, 
  ChevronDown, 
  Bell, 
  ChevronRight,
  Shield
} from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function UserNav() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  const userInitials = session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || '?'
  const isAdmin = session?.user?.role === "ADMIN"

  // Fermer le menu au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Animation variants
  const dropdownVariants = {
    hidden: { 
      opacity: 0,
      y: -5,
      scale: 0.95,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 350,
        damping: 25
      }
    }
  }

  const handleLogout = async () => {
    setIsOpen(false)
    await signOut({ redirect: false })
    router.push("/login")
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        {/* Notifications (optionnel) */}
        <button 
          onClick={() => setShowNotifs(!showNotifs)}
          className="hidden md:flex h-9 w-9 rounded-full items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {/* Indicateur de notification */}
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        
        {/* Avatar button avec dropdown */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1 md:pl-2 md:pr-3 md:py-1.5 rounded-full hover:bg-gray-100 transition-all duration-200"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="relative flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-sm">
              {session?.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt="Avatar" 
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <span className="text-white font-medium text-sm">
                  {userInitials.toUpperCase()}
                </span>
              )}
            </div>
            {isAdmin && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
                <Shield className="h-2.5 w-2.5 text-primary" />
              </div>
            )}
          </div>
          
          {/* Nom/email à afficher sur les grands écrans */}
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900 truncate max-w-[100px] lg:max-w-[150px]">
              {session?.user?.name || session?.user?.email?.split('@')[0] || 'Utilisateur'}
            </p>
            {session?.user?.email && (
              <p className="text-xs text-gray-500 truncate max-w-[100px] lg:max-w-[150px]">
                {session.user.email}
              </p>
            )}
          </div>
          
          <ChevronDown className="hidden md:block h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Menu dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-white border border-gray-100 z-40 origin-top-right overflow-hidden"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={dropdownVariants}
          >
            {/* Header mobile - visible uniquement sur petit écran */}
            <div className="md:hidden px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.name || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email}
              </p>
            </div>
            
            {/* Menu items */}
            <div className="py-1.5">
              <Link
                href="/profile"
                className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <span>Mon Profil</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <Settings className="h-4 w-4 text-primary" />
                    </div>
                    <span>Administration</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              )}

              <div className="border-t border-gray-100 my-1"></div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center mr-3">
                  <LogOut className="h-4 w-4 text-red-500" />
                </div>
                <span>Se déconnecter</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}