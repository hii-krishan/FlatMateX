"use client";
import { jsx, jsxs } from "react/jsx-runtime";
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
import { useData } from "@/context/data-context";
function DashboardPage() {
  const { expenses, events, groceries } = useData();
  const [totalExpense, setTotalExpense] = useState(0);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
  const [groceryItemsCount, setGroceryItemsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const total = expenses.reduce((sum, doc) => sum + doc.amount, 0);
    setTotalExpense(total);
    const thirtyDaysFromNow = /* @__PURE__ */ new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const upcomingEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= /* @__PURE__ */ new Date() && eventDate <= thirtyDaysFromNow;
    });
    setUpcomingEventsCount(upcomingEvents.length);
    const itemsToBuy = groceries.filter((item) => !item.purchased);
    setGroceryItemsCount(itemsToBuy.length);
    setLoading(false);
  }, [expenses, events, groceries]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(
        OverviewCard,
        {
          title: "Total Expenses",
          value: `\u20B9${totalExpense.toLocaleString()}`,
          icon: Wallet,
          description: "for this month",
          loading
        }
      ),
      /* @__PURE__ */ jsx(
        OverviewCard,
        {
          title: "Upcoming Events",
          value: upcomingEventsCount.toString(),
          icon: PartyPopper,
          description: "in the next 30 days",
          loading
        }
      ),
      /* @__PURE__ */ jsx(
        OverviewCard,
        {
          title: "Grocery Items",
          value: groceryItemsCount.toString(),
          icon: ShoppingCart,
          description: "to buy",
          loading
        }
      ),
      /* @__PURE__ */ jsx(
        OverviewCard,
        {
          title: "Flatmates",
          value: "1",
          icon: Users,
          description: "active in the flat",
          loading: false
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "font-headline flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(LayoutDashboard, {}),
          "Weekly Mood & Productivity"
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(MoodChart, {}) })
      ] }),
      /* @__PURE__ */ jsx(AIAssistantPreview, {})
    ] })
  ] });
}
export {
  DashboardPage as default
};
