"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, Trash2, Loader2, Pencil } from "lucide-react";
import { getSmartGrocerySuggestions } from "@/ai/flows/smart-grocery-suggestions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useData } from "@/context/data-context";
function GroceryTracker() {
  const { groceries, addGrocery, toggleGrocery, deleteGrocery, chores, updateChore, toggleChore: toggleChoreContext } = useData();
  const [newGroceryName, setNewGroceryName] = useState("");
  const [newGroceryQty, setNewGroceryQty] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isChoreDialogOpen, setIsChoreDialogOpen] = useState(false);
  const [editingChore, setEditingChore] = useState(null);
  const fetchSuggestions = async () => {
    if (!groceries) return;
    setIsLoadingSuggestions(true);
    try {
      const pastPurchases = groceries.filter((g) => g.purchased).map((g) => g.name);
      if (pastPurchases.length > 0) {
        const result = await getSmartGrocerySuggestions({ pastPurchases });
        setSuggestions(result.suggestions);
      } else {
        setSuggestions(["Start by adding items to your list!"]);
      }
    } catch (error) {
      console.error("Failed to get grocery suggestions:", error);
      setSuggestions(["Could not load suggestions."]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };
  useEffect(() => {
    fetchSuggestions();
  }, [groceries]);
  const handleAddGrocery = () => {
    if (newGroceryName.trim()) {
      addGrocery({ name: newGroceryName.trim(), quantity: newGroceryQty });
      setNewGroceryName("");
      setNewGroceryQty(1);
    }
  };
  const handleEditChoreClick = (chore) => {
    setEditingChore(chore);
    setIsChoreDialogOpen(true);
  };
  const handleSaveChore = async (e) => {
    e.preventDefault();
    if (!editingChore) return;
    const formData = new FormData(e.currentTarget);
    const updatedChore = {
      ...editingChore,
      name: formData.get("choreName"),
      assignedTo: formData.get("assignedTo")
    };
    updateChore(updatedChore);
    setEditingChore(null);
    setIsChoreDialogOpen(false);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "font-headline", children: "Shared Grocery List" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Manage your flat's shopping list together." })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex w-full items-center space-x-2 mb-4", children: [
            /* @__PURE__ */ jsx(Input, { placeholder: "e.g., Apples", value: newGroceryName, onChange: (e) => setNewGroceryName(e.target.value), onKeyDown: (e) => e.key === "Enter" && handleAddGrocery(), className: "flex-grow" }),
            /* @__PURE__ */ jsx(Input, { type: "number", min: "1", value: newGroceryQty, onChange: (e) => setNewGroceryQty(parseInt(e.target.value)), className: "w-20" }),
            /* @__PURE__ */ jsxs(Button, { onClick: handleAddGrocery, children: [
              /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
              " Add"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 max-h-96 overflow-y-auto pr-2", children: [
            groceries.length === 0 && /* @__PURE__ */ jsx("p", { children: "No groceries in the list." }),
            groceries.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3 rounded-md border p-3 group", children: [
              /* @__PURE__ */ jsx(Checkbox, { id: `g-${item.id}`, checked: item.purchased, onCheckedChange: () => toggleGrocery(item.id) }),
              /* @__PURE__ */ jsx("label", { htmlFor: `g-${item.id}`, className: `flex-1 text-sm ${item.purchased ? "line-through text-muted-foreground" : ""}`, children: item.name }),
              /* @__PURE__ */ jsxs(Badge, { variant: "outline", children: [
                item.quantity,
                " pc(s)"
              ] }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 opacity-0 group-hover:opacity-100", onClick: () => deleteGrocery(item.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
            ] }, item.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { className: "bg-primary/5 border-primary/20", children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "font-headline flex items-center gap-2 text-primary", children: [
            /* @__PURE__ */ jsx(Sparkles, {}),
            " AI Smart Suggestions"
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            isLoadingSuggestions ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-24", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-primary" }) }) : /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: suggestions.map((s, i) => /* @__PURE__ */ jsx("li", { className: "flex items-center text-sm", children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", className: "w-full justify-start", onClick: () => setNewGroceryName(s), children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2 text-primary" }),
              " ",
              s
            ] }) }, i)) }),
            /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "w-full mt-4", onClick: fetchSuggestions, disabled: isLoadingSuggestions, children: "Refresh Suggestions" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "font-headline", children: "Chore Tracker" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Assign and track cleaning duties." })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2", children: [
            chores.length === 0 && /* @__PURE__ */ jsx("p", { children: "No chores assigned." }),
            chores.map((chore) => /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3 rounded-md border p-3", children: [
              /* @__PURE__ */ jsx(Checkbox, { id: `c-${chore.id}`, checked: chore.completed, onCheckedChange: () => toggleChoreContext(chore.id) }),
              /* @__PURE__ */ jsx("label", { htmlFor: `c-${chore.id}`, className: `flex-1 text-sm ${chore.completed ? "line-through text-muted-foreground" : ""}`, children: chore.name }),
              /* @__PURE__ */ jsx(Badge, { variant: chore.assignedTo === "Unassigned" ? "destructive" : "default", children: chore.assignedTo }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => handleEditChoreClick(chore), children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) })
            ] }, chore.id))
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: isChoreDialogOpen, onOpenChange: setIsChoreDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Edit Chore" }) }),
      editingChore && /* @__PURE__ */ jsxs("form", { onSubmit: handleSaveChore, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "choreName", children: "Chore Name" }),
          /* @__PURE__ */ jsx(Input, { id: "choreName", name: "choreName", defaultValue: editingChore.name, required: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "assignedTo", children: "Assign To" }),
          /* @__PURE__ */ jsx(Input, { id: "assignedTo", name: "assignedTo", defaultValue: editingChore.assignedTo, required: true })
        ] }),
        /* @__PURE__ */ jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setIsChoreDialogOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { type: "submit", children: "Save Changes" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  GroceryTracker
};
