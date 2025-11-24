"use client";

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
  PanelLeft,
  StickyNote,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth, useUser } from '@/firebase';
import { getAuth, signOut } from 'firebase/auth';

const pageTitles: { [key: string]: { title: string, icon: React.ElementType } } = {
  '/dashboard': { title: 'Overview', icon: LayoutDashboard },
  '/dashboard/expenses': { title: 'Expense Manager', icon: Wallet },
  '/dashboard/assistant': { title: 'AI Room Assistant', icon: Bot },
  '/dashboard/services': { title: 'Nearby Services', icon: Map },
  '/dashboard/planner': { title: 'Timetable & Tasks', icon: CalendarCheck },
  '/dashboard/groceries': { title: 'Groceries & Chores', icon: ShoppingCart },
  '/dashboard/wellness': { title: 'Wellness Tracker', icon: HeartPulse },
  '/dashboard/events': { title: 'Event Planner', icon: PartyPopper },
  '/dashboard/notes': { title: 'Shared Notes', icon: StickyNote },
};

export function DashboardHeader() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const { user } = useUser();
  const auth = useAuth();
  
  const { title, icon: Icon } = pageTitles[pathname] || { title: 'Dashboard', icon: LayoutDashboard };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleSidebar}
      >
        <PanelLeft className="h-5 w-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>

      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-muted-foreground" />
        <h1 className="font-headline text-xl font-semibold md:text-2xl">{title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.photoURL ?? undefined} alt="User Avatar" />
                <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.displayName || 'My Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Settings</DropdownMenuItem>
            <DropdownMenuItem disabled>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
