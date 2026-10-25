"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Lightbulb, Trash2 } from "lucide-react";
import { useData } from "@/context/data-context";
const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
function ExpenseManager() {
  const { expenses, addExpense, deleteExpense, user } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dataByCategory = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      const existing = acc.find((item) => item.name === expense.category);
      if (existing) {
        existing.value += expense.amount;
      } else {
        acc.push({ name: expense.category, value: expense.amount });
      }
      return acc;
    }, []);
  }, [expenses]);
  const handleAddExpense = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newExpense = {
      name: formData.get("name"),
      amount: parseFloat(formData.get("amount")),
      category: formData.get("category")
    };
    addExpense(newExpense);
    setIsDialogOpen(false);
    e.currentTarget.reset();
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-5", children: [
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-3", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "font-headline", children: "Spending Overview" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Your expenses by category." })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "h-80", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: expenses.length === 0 ? /* @__PURE__ */ jsx("div", { className: "h-full w-full flex items-center justify-center", children: "No expenses yet." }) : /* @__PURE__ */ jsxs(PieChart, { children: [
          /* @__PURE__ */ jsx(
            Pie,
            {
              data: dataByCategory,
              cx: "50%",
              cy: "50%",
              labelLine: false,
              outerRadius: 110,
              fill: "#8884d8",
              dataKey: "value",
              label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`,
              children: dataByCategory.map((entry, index) => /* @__PURE__ */ jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))
            }
          ),
          /* @__PURE__ */ jsx(Tooltip, { formatter: (value) => `\u20B9${value.toLocaleString()}` }),
          /* @__PURE__ */ jsx(Legend, {})
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2 bg-accent/20 border-accent", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "font-headline flex items-center gap-2 text-accent-foreground/80", children: [
          /* @__PURE__ */ jsx(Lightbulb, { className: "text-accent" }),
          "AI Savings Tip"
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col items-center justify-center h-full text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-lg italic text-accent-foreground/90", children: "\u201CLooks like you\u2019ve been ordering food a lot this week. Try cooking one day to save \u20B9250!\u201D" }),
          /* @__PURE__ */ jsx(Button, { variant: "link", className: "mt-4", children: "Explore Recipes" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "font-headline", children: "Expense History" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "All recorded expenses for the current period." })
        ] }),
        /* @__PURE__ */ jsxs(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: [
          /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
            /* @__PURE__ */ jsx(PlusCircle, { className: "mr-2 h-4 w-4" }),
            " Add Expense"
          ] }) }),
          /* @__PURE__ */ jsxs(DialogContent, { children: [
            /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Add a New Expense" }) }),
            /* @__PURE__ */ jsxs("form", { onSubmit: handleAddExpense, className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Expense Name" }),
                /* @__PURE__ */ jsx(Input, { id: "name", name: "name", placeholder: "e.g., Coffee", required: true })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "amount", children: "Amount (\u20B9)" }),
                /* @__PURE__ */ jsx(Input, { id: "amount", name: "amount", type: "number", placeholder: "e.g., 150", required: true })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "category", children: "Category" }),
                /* @__PURE__ */ jsxs(Select, { name: "category", required: true, children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { id: "category", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select a category" }) }),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "Food", children: "Food" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "Groceries", children: "Groceries" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "Bills", children: "Bills" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "Rent", children: "Rent" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "Other", children: "Other" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", children: "Add Expense" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Name" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Category" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Date" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Paid By" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Amount" }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-[50px]", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxs(TableBody, { children: [
          expenses.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 6, className: "text-center", children: "No expenses recorded yet." }) }),
          expenses.map((expense) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: expense.name }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: expense.category }) }),
            /* @__PURE__ */ jsx(TableCell, { children: new Date(expense.date).toLocaleDateString() }),
            /* @__PURE__ */ jsx(TableCell, { children: expense.paidBy }),
            /* @__PURE__ */ jsxs(TableCell, { className: "text-right font-mono", children: [
              "\u20B9",
              expense.amount.toFixed(2)
            ] }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => deleteExpense(expense.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) }) })
          ] }, expense.id))
        ] })
      ] }) })
    ] })
  ] });
}
export {
  ExpenseManager
};
