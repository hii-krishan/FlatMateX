"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
function OverviewCard({ title, value, icon: Icon, description, loading }) {
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
      /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: title }),
      /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-muted-foreground" })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { children: [
      loading ? /* @__PURE__ */ jsx("div", { className: "h-8 w-24 bg-muted animate-pulse rounded-md" }) : /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold font-headline", children: value }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: description })
    ] })
  ] });
}
export {
  OverviewCard
};
