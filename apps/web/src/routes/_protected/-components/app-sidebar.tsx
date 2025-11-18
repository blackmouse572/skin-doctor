'use client';

import { CommandIcon } from '@phosphor-icons/react/dist/csr/Command';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@repo/ui/components/sidebar';
import * as React from 'react';
import type { AuthUser } from '@/clients/authClient';
import { NavItems } from '../-config/nav-config';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { cn } from '@repo/ui/lib/utils';
export function AppSidebar({
  user,
  children,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: AuthUser;
}) {
  const { state } = useSidebar();
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader
        className={cn('flex flex-row  items-center', {
          'justify-center': state === 'collapsed',
          'justify-between': state !== 'collapsed',
        })}
      >
        {state === 'collapsed' ? null : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="#">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <CommandIcon className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={NavItems.main} />
        {/* <NavProjects projects={data.projects} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      {children}
    </Sidebar>
  );
}
