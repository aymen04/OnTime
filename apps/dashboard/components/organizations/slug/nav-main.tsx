'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { baseUrl, getPathname } from '@workspace/routes';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarGroupProps
} from '@workspace/ui/components/sidebar';
import { cn } from '@workspace/ui/lib/utils';

import { createMainNavItems } from '~/components/organizations/slug/nav-items';
import { useActiveOrganization } from '~/hooks/use-active-organization';

// 1. On crée une interface pour dire que NavMain accepte un userRole
interface NavMainProps extends SidebarGroupProps {
  userRole?: string;
}

// 2. On récupère le userRole (avec 'employee' par défaut en sécurité)
export function NavMain({ userRole = 'employee', ...props }: NavMainProps): React.JSX.Element {
  const pathname = usePathname();
  const activeOrganization = useActiveOrganization();

  return (
    <SidebarGroup {...props}>
      <SidebarMenu>
        {/* 3. On passe le rôle à la fonction qui génère les liens */}
        {createMainNavItems(activeOrganization.slug, userRole).map((item, index) => {
          const isActive = pathname.startsWith(
            getPathname(item.href, baseUrl.Dashboard)
          );
          return (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                <Link href={item.disabled ? '~/' : item.href} target={item.external ? '_blank' : undefined}>
                  <item.icon className={cn('size-4 shrink-0', isActive ? 'text-foreground' : 'text-muted-foreground')} />
                  <span className={isActive ? 'dark:text-foreground' : 'dark:text-muted-foreground'}>
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}