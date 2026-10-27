import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Wallet,
  UsersRound,
  CalendarCheck,
  ShoppingCart,
  HeartPulse,
  PartyPopper,
  Home,
  StickyNote,
  Quote,
  Sparkles,
  Settings
} from "lucide-react";
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator
} from "@/components/ui/sidebar";

const primaryNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/expenses", icon: Wallet, label: "Expenses" },
  { href: "/dashboard/notes", icon: StickyNote, label: "Shared Notes" }
];

const homeNav = [
  { href: "/dashboard/flatmates", icon: UsersRound, label: "Flatmate Group", badge: "Group" },
  { href: "/dashboard/planner", icon: CalendarCheck, label: "Planner" },
  { href: "/dashboard/groceries", icon: ShoppingCart, label: "Groceries" },
  { href: "/dashboard/wellness", icon: HeartPulse, label: "Wellness" },
  { href: "/dashboard/events", icon: PartyPopper, label: "Events" }
];

function NavGroup({ label, items, pathname }) {
  return (
    <div className="space-y-2">
      <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/45 group-[[data-collapsible=icon]]:hidden">
        {label}
      </p>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={{ children: item.label }}
              className="h-11 rounded-xl px-3 transition-all duration-200 hover:translate-x-0.5 hover:bg-white/10 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-lg data-[active=true]:shadow-primary/20"
            >
              <a href={item.href}>
                <item.icon className="h-[18px] w-[18px]" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-accent-foreground group-[[data-collapsible=icon]]:hidden">
                    {item.badge}
                  </span>
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}

export function DashboardSidebar() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <>
      <SidebarHeader className="border-b border-white/10 px-4 py-5">
        <a href="/dashboard" className="group flex items-center gap-3">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-blue-700 text-primary-foreground shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
            <Home className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-sidebar bg-accent" />
          </span>
          <span className="flex flex-col group-[[data-collapsible=icon]]:hidden">
            <span className="font-headline text-lg font-bold tracking-tight text-sidebar-foreground">
              FlatMate<span className="text-primary">X</span>
            </span>
            <span className="text-[11px] font-medium text-sidebar-foreground/50">Your home, in sync</span>
          </span>
        </a>
      </SidebarHeader>

      <SidebarContent className="space-y-7 px-3 py-6">
        <NavGroup label="Workspace" items={primaryNav} pathname={pathname} />
        <NavGroup label="Home life" items={homeNav} pathname={pathname} />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={{ children: "Settings" }}
              className="h-11 rounded-xl px-3 text-sidebar-foreground/65 hover:bg-white/10 hover:text-sidebar-foreground"
            >
              <a href="/dashboard/settings">
                <Settings className="h-[18px] w-[18px]" />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-3 group-[[data-collapsible=icon]]:hidden">
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold">Home pulse</span>
          </div>
          <p className="text-xs leading-relaxed text-sidebar-foreground/65">
            Keep your flat running smoothly, one small win at a time.
          </p>
        </div>
        <SidebarSeparator className="my-3 bg-white/10" />
        <div className="flex items-start gap-2 px-2 text-sidebar-foreground/45 group-[[data-collapsible=icon]]:hidden">
          <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p className="text-[11px] italic leading-relaxed">"Good homes grow from good habits."</p>
        </div>
      </SidebarFooter>
    </>
  );
}
