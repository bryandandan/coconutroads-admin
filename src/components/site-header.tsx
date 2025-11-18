'use client'

import { useAuth } from './auth-provider'
import { Button } from './ui/button'
import { LogOut } from 'lucide-react'

export function SiteHeader() {
  const { logout } = useAuth()

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">CoconutRoads Admin</h2>
      </div>
      <Button variant="ghost" size="sm" onClick={logout}>
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </header>
  )
}
