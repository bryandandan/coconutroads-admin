'use client'

import { usePathname } from 'next/navigation'

export function SiteHeader() {
  const pathname = usePathname()

  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard'
    if (pathname === '/bookings') return 'Bookings'
    if (pathname.startsWith('/bookings/')) return 'Booking Details'
    if (pathname === '/campervans') return 'Campervans'
    if (pathname.startsWith('/campervans/')) return 'Campervan Details'
    if (pathname === '/calendar') return 'Calendar'
    return 'CoconutRoads Admin'
  }

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">{getPageTitle()}</h2>
      </div>
    </header>
  )
}
