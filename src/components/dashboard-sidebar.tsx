"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  Bot,
  Map,
  CalendarCheck,
  ShoppingCart,
  HeartPulse,
  PartyPopper,
  Settings,
  LogOut,
  Home,
  StickyNote,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/expenses', icon: Wallet, label: 'Expenses' },
  { href: '/dashboard/assistant', icon: Bot, label: 'AI Assistant' },
  { href: '/dashboard/notes', icon: StickyNote, label: 'Shared Notes' },
  { href: '/dashboard/services', icon: Map, label: 'Nearby Services' },
  { href: '/dashboard/planner', icon: CalendarCheck, label: 'Planner' },
  { href: '/dashboard/groceries', icon: ShoppingCart, label: 'Groceries' },
  { href: '/dashboard/wellness', icon: HeartPulse, label: 'Wellness' },
  { href: '/dashboard/events', icon: PartyPopper, label: 'Events' },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    // No logout without auth
  };

  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-2">
            <Home className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
                <h2 className="font-headline text-xl font-bold tracking-tight">FlatMateX</h2>
                <p className="text-xs text-muted-foreground">Smart Living</p>
            </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton asChild tooltip={{ children: 'Settings' }}>
              <Link href="#">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} asChild tooltip={{ children: 'Logout' }} disabled>
              <Link href="#">
                <LogOut />
                <span>Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
