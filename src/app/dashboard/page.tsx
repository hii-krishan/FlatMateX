
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  Wallet,
  PartyPopper,
  ShoppingCart,
  Users
} from "lucide-react";
import { OverviewCard } from "@/components/dashboard/overview-cards";
import { MoodChart } from "@/components/dashboard/mood-chart";
import { AIAssistantPreview } from "@/components/dashboard/ai-assistant-preview";
import { useEffect, useState } from "react";
import { mockExpenses, mockEvents, mockGroceryList } from "@/lib/data";


export default function DashboardPage() {
    
    const [totalExpense, setTotalExpense] = useState(0);
    const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
    const [groceryItemsCount, setGroceryItemsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        // Calculate total expenses
        const total = mockExpenses.reduce((sum, doc) => sum + doc.amount, 0);
        setTotalExpense(total);

        // Calculate upcoming events
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const upcomingEvents = mockEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= new Date() && eventDate <= thirtyDaysFromNow;
        });
        setUpcomingEventsCount(upcomingEvents.length);
        
        // Calculate grocery items to buy
        const itemsToBuy = mockGroceryList.filter(item => !item.purchased);
        setGroceryItemsCount(itemsToBuy.length);

        setLoading(false);
    }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCard
            title="Total Expenses"
            value={`₹${totalExpense.toLocaleString()}`}
            icon={Wallet}
            description="for this month"
            loading={loading}
        />
        <OverviewCard
            title="Upcoming Events"
            value={upcomingEventsCount.toString()}
            icon={PartyPopper}
            description="in the next 30 days"
            loading={loading}
        />
        <OverviewCard
            title="Grocery Items"
            value={groceryItemsCount.toString()}
            icon={ShoppingCart}
            description="to buy"
            loading={loading}
        />
        <OverviewCard
            title="Flatmates"
            value="1" // This will be dynamic later
            icon={Users}
            description="active in the flat"
            loading={false}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <LayoutDashboard />
                    Weekly Mood & Productivity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <MoodChart />
            </CardContent>
        </Card>
        
        <AIAssistantPreview />
      </div>
    </div>
  );
}
