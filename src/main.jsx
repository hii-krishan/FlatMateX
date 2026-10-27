import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import DashboardLayout from "@/app/dashboard/layout";
import DashboardPage from "@/app/dashboard/page";
import EventsPage from "@/app/dashboard/events/page";
import ExpensesPage from "@/app/dashboard/expenses/page";
import GroceriesPage from "@/app/dashboard/groceries/page";
import NotesPage from "@/app/dashboard/notes/page";
import PlannerPage from "@/app/dashboard/planner/page";
import FlatmatesPage from "@/app/dashboard/flatmates/page";
import WellnessPage from "@/app/dashboard/wellness/page";
import SettingsPage from "@/app/dashboard/settings/page";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { AuthPage } from "@/components/auth-page";

const pages = {
  "/dashboard": DashboardPage,
  "/dashboard/events": EventsPage,
  "/dashboard/expenses": ExpensesPage,
  "/dashboard/groceries": GroceriesPage,
  "/dashboard/notes": NotesPage,
  "/dashboard/planner": PlannerPage,
  "/dashboard/flatmates": FlatmatesPage,
  "/dashboard/wellness": WellnessPage,
  "/dashboard/settings": SettingsPage,
};

function AppContent() {
  const { loading, user, isConfigured } = useAuth();
  if (isConfigured && loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading your home...</div>;
  }
  if (isConfigured && !user) return <AuthPage />;
  const Page = pages[window.location.pathname] || DashboardPage;
  return (
    <ThemeProvider>
      <DashboardLayout>
        <Page />
      </DashboardLayout>
      <Toaster />
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </StrictMode>,
);
