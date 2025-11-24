
"use client";

import { useState } from 'react';
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
  LogOut,
  Pencil,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSidebar } from '@/components/ui/sidebar';
import { useData } from '@/context/data-context';


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
  const { user, updateUser } = useData();

  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  
  const { title, icon: Icon } = pageTitles[pathname] || { title: 'Dashboard', icon: LayoutDashboard };

  const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newName = formData.get('name') as string;
    updateUser({ ...user, name: newName });
    setIsProfileDialogOpen(false);
  };

  return (
    <>
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
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="https://picsum.photos/seed/user-avatar/100" alt="User Avatar" />
                  <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="flex items-center gap-2">
                  {user.name}
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input id="name" name="name" defaultValue={user.name} required />
                  </div>
                  <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setIsProfileDialogOpen(false)}>Cancel</Button>
                      <Button type="submit">Save Changes</Button>
                  </DialogFooter>
              </form>
          </DialogContent>
        </Dialog>
      </div>
    </header>
    </>
  );
}
