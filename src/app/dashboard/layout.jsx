"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { DataProvider } from "@/context/data-context";
function DashboardLayout({
  children
}) {
  return /* @__PURE__ */ jsx(DataProvider, { children: /* @__PURE__ */ jsxs(SidebarProvider, { children: [
    /* @__PURE__ */ jsx(Sidebar, { children: /* @__PURE__ */ jsx(DashboardSidebar, {}) }),
    /* @__PURE__ */ jsxs(SidebarInset, { className: "flex flex-col", children: [
      /* @__PURE__ */ jsx(DashboardHeader, {}),
      /* @__PURE__ */ jsx("main", { className: "flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto", children })
    ] })
  ] }) });
}
export {
  DashboardLayout as default
};
