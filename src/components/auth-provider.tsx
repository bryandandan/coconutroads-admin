'use client'

import { createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

type AuthContextType = {
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return <AuthContext.Provider value={{ logout }}>{children}</AuthContext.Provider>
}
