"use client";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LayoutDashboard,
  Wallet,
  PartyPopper,
  ShoppingCart,
  Users,
  Activity
} from "lucide-react";
import { OverviewCard } from "@/components/dashboard/overview-cards";
import { MoodChart } from "@/components/dashboard/mood-chart";
import { useData } from "@/context/data-context";

export default function DashboardPage() {
  const { expenses, events, groceries, allMembers, flatmates } = useData();

  const totalExpense = useMemo(() => {
    return expenses
      .filter(
        (doc) =>
          !doc.isPersonal &&
          doc.splitOption !== "no" &&
          !doc.isSettlement &&
          doc.category !== "Settlement" &&
          !doc.name?.toLowerCase().startsWith("settlement:")
      )
      .reduce((sum, doc) => sum + (Number(doc.amount) || 0), 0);
  }, [expenses]);

  const upcomingEventsCount = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= thirtyDaysFromNow;
    }).length;
  }, [events]);

  const groceryItemsCount = useMemo(() => {
    return groceries.filter((item) => !item.purchased).length;
  }, [groceries]);

  const flatmatesCount = useMemo(() => {
    if (allMembers && allMembers.length > 0) return allMembers.length;
    return flatmates.length + 1;
  }, [allMembers, flatmates]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCard
          title="Total Expenses"
          value={`₹${totalExpense.toLocaleString()}`}
          icon={Wallet}
          description="recorded in your flat"
          loading={false}
        />
        <OverviewCard
          title="Upcoming Events"
          value={upcomingEventsCount.toString()}
          icon={PartyPopper}
          description="in the next 30 days"
          loading={false}
        />
        <OverviewCard
          title="Grocery Items"
          value={groceryItemsCount.toString()}
          icon={ShoppingCart}
          description="to buy on shopping list"
          loading={false}
        />
        <OverviewCard
          title="Flatmates"
          value={flatmatesCount.toString()}
          icon={Users}
          description="active in flat group"
          loading={false}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-3 rounded-2xl border-primary/20 shadow-sm">
          <CardHeader className="border-b pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="font-headline text-xl font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Weekly Sleep & Mood Trends
                </CardTitle>
                <CardDescription>
                  Dynamically synchronized with your daily check-ins from the Wellness tracker.
                </CardDescription>
              </div>
              <a
                href="/dashboard/wellness"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Log today's wellness →
              </a>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <MoodChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
