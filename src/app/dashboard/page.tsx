
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
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, where, getDocs, sum, getCountFromServer } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import type { Expense, Event, GroceryItem, FirestoreDocument } from "@/lib/types";


export default function DashboardPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    
    const [totalExpense, setTotalExpense] = useState(0);
    const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
    const [groceryItemsCount, setGroceryItemsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const expensesCollection = useMemo(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'expenses');
    }, [firestore, user]);

    const eventsCollection = useMemo(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'events');
    }, [firestore, user]);

    const groceriesCollection = useMemo(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'groceries');
    }, [firestore, user]);

    useEffect(() => {
        const fetchData = async () => {
            if (!firestore || !user) return;
            setLoading(true);

            // Fetch expenses
            const expensesQuery = query(expensesCollection!);
            const expensesSnap = await getDocs(expensesQuery);
            const total = expensesSnap.docs.reduce((sum, doc) => sum + doc.data().amount, 0);
            setTotalExpense(total);

            // Fetch events
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            const eventsQuery = query(eventsCollection!, where('date', '>=', new Date().toISOString().split('T')[0]), where('date', '<=', thirtyDaysFromNow.toISOString().split('T')[0]));
            const eventsSnap = await getCountFromServer(eventsQuery);
            setUpcomingEventsCount(eventsSnap.data().count);
            
            // Fetch grocery items
            const groceriesQuery = query(groceriesCollection!, where('purchased', '==', false));
            const groceriesSnap = await getCountFromServer(groceriesQuery);
            setGroceryItemsCount(groceriesSnap.data().count);

            setLoading(false);
        }
        fetchData();
    }, [firestore, user, expensesCollection, eventsCollection, groceriesCollection]);

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
            loading={loading}
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

