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
import { mockExpenses, mockEvents, mockGroceryList } from "@/lib/data";

export default function DashboardPage() {
    const totalExpense = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const upcomingEventsCount = mockEvents.filter(event => new Date(event.date) >= new Date()).length;
    const groceryItemsCount = mockGroceryList.filter(item => !item.purchased).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCard
            title="Total Expenses"
            value={`₹${totalExpense.toLocaleString()}`}
            icon={Wallet}
            description="for this month"
        />
        <OverviewCard
            title="Upcoming Events"
            value={upcomingEventsCount.toString()}
            icon={PartyPopper}
            description="in the next 30 days"
        />
        <OverviewCard
            title="Grocery Items"
            value={groceryItemsCount.toString()}
            icon={ShoppingCart}
            description="to buy"
        />
        <OverviewCard
            title="Flatmates"
            value="3"
            icon={Users}
            description="active in the flat"
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
