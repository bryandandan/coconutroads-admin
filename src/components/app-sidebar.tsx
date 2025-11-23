'use client'

import * as React from 'react'
import Image from 'next/image'
import { IconCalendar, IconCalendarEvent, IconDashboard, IconTruck } from '@tabler/icons-react'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar'
import Link from 'next/link'

const data = {
  user: {
    name: 'CoconutRoads',
    email: 'contact@coconutroads.com',
    avatar: '/avatars/shadcn.jpg'
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: IconDashboard
    },
    {
      title: 'Bookings',
      url: '/bookings',
      icon: IconCalendar
    },
    {
      title: 'Campervans',
      url: '/campervans',
      icon: IconTruck
    },
    {
      title: 'Blocked Dates',
      url: '/calendar',
      icon: IconCalendarEvent
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <Image
                  src="/Logo Square - Icon Color - BG Pink.jpg"
                  alt="CoconutRoads"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-base font-semibold">CoconutRoads</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <SidebarGroup>
          <SidebarGroupLabel>Availability</SidebarGroupLabel>
          <AvailabilityCalendar />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
