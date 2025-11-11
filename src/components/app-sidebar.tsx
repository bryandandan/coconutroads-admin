'use client'

import * as React from 'react'
import Image from 'next/image'
import { IconCalendar, IconDashboard } from '@tabler/icons-react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

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
              <a href="/">
                <Image
                  src="/Logo Square - Icon Color - BG Pink.jpg"
                  alt="CoconutRoads"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-base font-semibold">CoconutRoads</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
