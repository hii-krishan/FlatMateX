import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Wallet,
  UsersRound,
  CalendarCheck,
  ShoppingCart,
  HeartPulse,
  PartyPopper,
  PanelLeft,
  StickyNote,
  LogOut,
  Pencil,
  ChevronRight,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSidebar } from "@/components/ui/sidebar";
import { useData } from "@/context/data-context";
import { useAuth } from "@/context/auth-context";

const pageTitles = {
  "/dashboard": { title: "Overview", icon: LayoutDashboard },
  "/dashboard/expenses": { title: "Expense Manager", icon: Wallet },
  "/dashboard/flatmates": { title: "Flatmate Group & Splitwise", icon: UsersRound },
  "/dashboard/planner": { title: "Timetable & Tasks", icon: CalendarCheck },
  "/dashboard/groceries": { title: "Groceries & Chores", icon: ShoppingCart },
  "/dashboard/wellness": { title: "Wellness Tracker", icon: HeartPulse },
  "/dashboard/events": { title: "Event Planner", icon: PartyPopper },
  "/dashboard/notes": { title: "Shared Notes", icon: StickyNote },
  "/dashboard/settings": { title: "Settings", icon: Pencil }
};

export function DashboardHeader() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const { toggleSidebar } = useSidebar();
  const { user, updateUser, groupInfo } = useData();
  const { user: authUser, isConfigured, updateProfile, signOut } = useAuth();
  const { title, icon: Icon } = pageTitles[pathname] || { title: "Dashboard", icon: LayoutDashboard };

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleProfileUpdate = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    if (isConfigured) {
      updateProfile(name).then(({ error }) => {
        if (!error) setIsProfileDialogOpen(false);
      });
    } else {
      updateUser({ ...user, name });
      setIsProfileDialogOpen(false);
    }
  };

  const displayName = user.name || "Flatmate";
  const avatarUrl = user.avatarUrl || authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4f46e5&color=fff`;

  return (
    <header className="sticky top-0 z-10 flex min-h-20 items-center gap-4 border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary md:hidden"
        onClick={toggleSidebar}
      >
        <PanelLeft className="h-5 w-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>

      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="hidden items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70 sm:flex">
            <span>FlatMateX</span>
            <ChevronRight className="h-3 w-3" />
            <span>Workspace</span>
          </div>
          <h1 className="truncate font-headline text-xl font-bold tracking-tight md:text-2xl">{title}</h1>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Button
          className="hidden rounded-xl shadow-md shadow-primary/20 sm:flex gap-1.5"
          onClick={() => window.location.assign("/dashboard/flatmates")}
        >
          <Users className="h-4 w-4" />
          <span>{groupInfo?.name || "Flatmate Group"}</span>
        </Button>

        <ThemeToggle />

        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 gap-2 rounded-xl px-1.5 sm:pl-2.5">
                <Avatar className="h-8 w-8 ring-2 ring-primary/15">
                  <AvatarImage src={avatarUrl} alt={`${displayName}'s profile`} />
                  <AvatarFallback className="bg-primary/10 font-bold text-primary">{displayName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-24 truncate text-sm font-semibold sm:block">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span className="truncate">{displayName}</span>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DialogContent>
            <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" name="name" defaultValue={displayName} required />
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
  );
}
