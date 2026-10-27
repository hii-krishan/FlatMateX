"use client";
import { Fragment } from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, ShoppingCart, Sparkles, CheckCircle2, UserCheck, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/context/data-context";

const GROCERY_UNITS = [
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "kg", label: "Kilograms (kg)" },
  { value: "g", label: "Grams (g)" },
  { value: "litres", label: "Litres (L)" },
  { value: "ml", label: "Millilitres (ml)" },
  { value: "packets", label: "Packets" },
  { value: "dozen", label: "Dozen" },
  { value: "bottles", label: "Bottles" },
  { value: "boxes", label: "Boxes" }
];

const CHORE_DAYS = [
  "Daily",
  "Weekly",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export function GroceryTracker() {
  const {
    groceries,
    addGrocery,
    toggleGrocery,
    deleteGrocery,
    chores,
    addChore,
    updateChore,
    deleteChore,
    toggleChore,
    allMembers
  } = useData();

  // Grocery State
  const [newGroceryName, setNewGroceryName] = useState("");
  const [newGroceryQty, setNewGroceryQty] = useState(1);
  const [newGroceryUnit, setNewGroceryUnit] = useState("pcs");

  // Chore Dialog States
  const [isAddChoreOpen, setIsAddChoreOpen] = useState(false);
  const [isEditChoreOpen, setIsEditChoreOpen] = useState(false);
  const [editingChore, setEditingChore] = useState(null);

  // Add Chore Form State
  const [newChoreName, setNewChoreName] = useState("");
  const [newChoreAssignedTo, setNewChoreAssignedTo] = useState("Alex");
  const [newChoreDay, setNewChoreDay] = useState("Daily");

  // Flatmates names for dropdown
  const memberNames = allMembers && allMembers.length > 0
    ? allMembers.map((m) => m.name)
    : ["Alex", "Ben Sharma", "Chloe Deshmukh", "Dev Patel"];

  // Add Grocery Handler
  const handleAddGrocery = (e) => {
    if (e) e.preventDefault();
    if (!newGroceryName.trim()) return;

    addGrocery({
      name: newGroceryName.trim(),
      quantity: Number(newGroceryQty) || 1,
      unit: newGroceryUnit || "pcs"
    });

    setNewGroceryName("");
    setNewGroceryQty(1);
    setNewGroceryUnit("pcs");
  };

  // Add Chore Handler
  const handleAddChoreSubmit = (e) => {
    e.preventDefault();
    if (!newChoreName.trim()) return;

    addChore({
      name: newChoreName.trim(),
      assignedTo: newChoreAssignedTo || "Unassigned",
      day: newChoreDay || "Daily"
    });

    setNewChoreName("");
    setNewChoreAssignedTo(memberNames[0] || "Alex");
    setNewChoreDay("Daily");
    setIsAddChoreOpen(false);
  };

  // Edit Chore Handler
  const handleEditChoreClick = (chore) => {
    setEditingChore(chore);
    setIsEditChoreOpen(true);
  };

  const handleSaveEditChore = (e) => {
    e.preventDefault();
    if (!editingChore) return;
    const formData = new FormData(e.currentTarget);

    updateChore({
      ...editingChore,
      name: formData.get("choreName"),
      assignedTo: formData.get("assignedTo"),
      day: formData.get("choreDay") || editingChore.day || "Daily"
    });

    setEditingChore(null);
    setIsEditChoreOpen(false);
  };

  const pendingGroceries = groceries.filter((g) => !g.purchased);
  const purchasedGroceries = groceries.filter((g) => g.purchased);

  return (
    <Fragment>
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* LEFT COLUMN: SHARED GROCERY LIST (col-span-3) */}
        <Card className="lg:col-span-3 rounded-2xl border-primary/20 shadow-sm flex flex-col">
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline text-2xl font-bold flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  Shared Grocery List
                </CardTitle>
                <CardDescription>
                  Add items with units (kg, litres, pcs) and check them off when purchased.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {pendingGroceries.length} to buy
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-5 space-y-5 flex-1 flex flex-col">
            {/* Add Grocery Form with Name, Quantity, and Unit Dropdown */}
            <form onSubmit={handleAddGrocery} className="rounded-2xl border bg-muted/30 p-3 sm:p-4 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Add Grocery Item
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-end">
                {/* Item Name */}
                <div className="sm:col-span-6 space-y-1">
                  <Label htmlFor="groceryName" className="text-xs text-muted-foreground">Item Name *</Label>
                  <Input
                    id="groceryName"
                    placeholder="e.g. Milk, Rice, Eggs..."
                    value={newGroceryName}
                    onChange={(e) => setNewGroceryName(e.target.value)}
                    className="rounded-xl h-10"
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="sm:col-span-2 space-y-1">
                  <Label htmlFor="groceryQty" className="text-xs text-muted-foreground">Qty *</Label>
                  <Input
                    id="groceryQty"
                    type="number"
                    min="0.1"
                    step="any"
                    value={newGroceryQty}
                    onChange={(e) => setNewGroceryQty(e.target.value)}
                    className="rounded-xl h-10"
                    required
                  />
                </div>

                {/* Unit Selector (pcs, kg, litres, etc.) */}
                <div className="sm:col-span-2 space-y-1">
                  <Label htmlFor="groceryUnit" className="text-xs text-muted-foreground">Unit *</Label>
                  <Select value={newGroceryUnit} onValueChange={setNewGroceryUnit}>
                    <SelectTrigger id="groceryUnit" className="rounded-xl h-10">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {GROCERY_UNITS.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Add Button */}
                <div className="sm:col-span-2">
                  <Button type="submit" className="w-full rounded-xl h-10 font-semibold gap-1.5 shadow-sm">
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </Button>
                </div>
              </div>
            </form>

            {/* Grocery Items List */}
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 flex-1">
              {groceries.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground italic space-y-2">
                  <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <p>Your grocery list is empty. Add milk, vegetables, or snacks above!</p>
                </div>
              ) : (
                groceries.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-all ${
                      item.purchased
                        ? "bg-muted/40 opacity-75 border-border/50"
                        : "bg-card hover:bg-muted/30 border-border shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Checkbox
                        id={`g-${item.id}`}
                        checked={item.purchased}
                        onCheckedChange={() => toggleGrocery(item.id)}
                        className="h-4 w-4 rounded-md"
                      />
                      <label
                        htmlFor={`g-${item.id}`}
                        className={`truncate text-sm cursor-pointer select-none ${
                          item.purchased ? "line-through text-muted-foreground" : "font-medium text-foreground"
                        }`}
                      >
                        {item.name}
                      </label>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Quantity + Unit Badge */}
                      <Badge
                        variant={item.purchased ? "secondary" : "outline"}
                        className="font-mono text-xs font-semibold px-2.5 py-0.5"
                      >
                        {item.quantity} {item.unit || "pcs"}
                      </Badge>

                      {/* Remove Option Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        onClick={() => deleteGrocery(item.id)}
                        title="Remove grocery item"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN: CHORE TRACKER (col-span-2) */}
        <Card className="lg:col-span-2 rounded-2xl border-primary/20 shadow-sm flex flex-col">
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline text-2xl font-bold flex items-center gap-2">
                  <UserCheck className="h-6 w-6 text-primary" />
                  Chore Tracker
                </CardTitle>
                <CardDescription>
                  Assign and manage house cleaning duties.
                </CardDescription>
              </div>

              {/* Add Chore Button */}
              <Button
                size="sm"
                onClick={() => setIsAddChoreOpen(true)}
                className="rounded-xl gap-1.5 font-semibold shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Chore</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-5 space-y-3 flex-1 flex flex-col">
            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1 flex-1">
              {chores.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground italic space-y-2">
                  <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <p>No chores assigned. Click "Add Chore" to assign cleaning duties!</p>
                </div>
              ) : (
                chores.map((chore) => (
                  <div
                    key={chore.id}
                    className={`flex items-start justify-between gap-2 rounded-xl border p-3 transition-all ${
                      chore.completed
                        ? "bg-muted/40 opacity-75 border-border/50"
                        : "bg-card hover:bg-muted/30 border-border shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1 pt-0.5">
                      <Checkbox
                        id={`c-${chore.id}`}
                        checked={chore.completed}
                        onCheckedChange={() => toggleChore(chore.id)}
                        className="mt-0.5 h-4 w-4 rounded-md"
                      />
                      <div className="min-w-0">
                        <label
                          htmlFor={`c-${chore.id}`}
                          className={`text-sm cursor-pointer select-none block leading-tight ${
                            chore.completed ? "line-through text-muted-foreground" : "font-semibold text-foreground"
                          }`}
                        >
                          {chore.name}
                        </label>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <Badge
                            variant={chore.assignedTo === "Unassigned" ? "destructive" : "default"}
                            className="text-[10px] py-0 px-2 font-medium"
                          >
                            {chore.assignedTo}
                          </Badge>
                          {chore.day && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Calendar className="h-3 w-3" /> {chore.day}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Edit and Remove Chore Options */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary rounded-lg"
                        onClick={() => handleEditChoreClick(chore)}
                        title="Edit chore"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        onClick={() => deleteChore(chore.id)}
                        title="Remove chore"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DIALOG: ADD NEW CHORE */}
      <Dialog open={isAddChoreOpen} onOpenChange={setIsAddChoreOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline">
              <Plus className="h-5 w-5 text-primary" />
              Add New House Chore
            </DialogTitle>
            <DialogDescription>
              Assign a cleaning duty or maintenance task to a flatmate.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddChoreSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="addChoreName" className="text-xs">Chore Name *</Label>
              <Input
                id="addChoreName"
                placeholder="e.g. Clean Kitchen, Take out trash, Mop floor..."
                value={newChoreName}
                onChange={(e) => setNewChoreName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="addChoreAssignedTo" className="text-xs">Assign To Flatmate *</Label>
              <Select value={newChoreAssignedTo} onValueChange={setNewChoreAssignedTo}>
                <SelectTrigger id="addChoreAssignedTo">
                  <SelectValue placeholder="Select flatmate" />
                </SelectTrigger>
                <SelectContent>
                  {memberNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Unassigned">Unassigned (Anyone)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="addChoreDay" className="text-xs">Day / Frequency *</Label>
              <Select value={newChoreDay} onValueChange={setNewChoreDay}>
                <SelectTrigger id="addChoreDay">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {CHORE_DAYS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setIsAddChoreOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-semibold">
                Add Chore
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: EDIT CHORE */}
      <Dialog open={isEditChoreOpen} onOpenChange={setIsEditChoreOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline">
              <Pencil className="h-5 w-5 text-primary" />
              Edit Chore
            </DialogTitle>
            <DialogDescription>
              Update chore assignment and schedule.
            </DialogDescription>
          </DialogHeader>

          {editingChore && (
            <form onSubmit={handleSaveEditChore} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="editChoreName" className="text-xs">Chore Name *</Label>
                <Input
                  id="editChoreName"
                  name="choreName"
                  defaultValue={editingChore.name}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editChoreAssignedTo" className="text-xs">Assign To *</Label>
                <Select name="assignedTo" defaultValue={editingChore.assignedTo || "Alex"}>
                  <SelectTrigger id="editChoreAssignedTo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {memberNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editChoreDay" className="text-xs">Day / Frequency</Label>
                <Select name="choreDay" defaultValue={editingChore.day || "Daily"}>
                  <SelectTrigger id="editChoreDay">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHORE_DAYS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="ghost" onClick={() => setIsEditChoreOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}
