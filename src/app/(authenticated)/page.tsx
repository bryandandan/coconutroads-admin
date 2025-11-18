'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Car, FileText } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/bookings')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Bookings</CardTitle>
                  <CardDescription>Manage reservations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                View and manage all campervan bookings, approve or reject requests, and track booking status.
              </p>
              <Button variant="ghost" className="mt-4 w-full">
                View Bookings
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/campervans')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Car className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Campervans</CardTitle>
                  <CardDescription>Manage fleet</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Add, edit, and manage your campervan fleet. Set availability and track vehicle status.
              </p>
              <Button variant="ghost" className="mt-4 w-full">
                View Campervans
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-50 cursor-not-allowed">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <CardTitle className="text-gray-400">Reports</CardTitle>
                  <CardDescription>Coming soon</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Analytics and reports for bookings, revenue, and fleet utilization.
              </p>
              <Button variant="ghost" className="mt-4 w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
