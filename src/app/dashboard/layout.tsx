
'use client';

import type { Metadata } from 'next';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';

// export const metadata: Metadata = {
//   title: 'FlatMateX Dashboard',
//   description: 'Your Smart Flat & Hostel Companion',
// };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SidebarProvider>
        <Sidebar>
            <DashboardSidebar />
        </Sidebar>
        <SidebarInset className="flex flex-col">
            <DashboardHeader />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
