// src/components/auth-check.tsx
'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthCheck() {
  const { status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])
  
  return null
}