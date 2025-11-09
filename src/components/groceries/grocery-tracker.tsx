"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockGroceryList, mockChoreList } from '@/lib/data';
import type { GroceryItem, Chore } from '@/lib/types';
import { Plus, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { getSmartGrocerySuggestions } from '@/ai/flows/smart-grocery-suggestions';

export function GroceryTracker() {
  const [groceries, setGroceries] = useState<GroceryItem[]>(mockGroceryList);
  const [newGrocery, setNewGrocery] = useState('');
  const [chores, setChores] = useState<Chore[]>(mockChoreList);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const pastPurchases = groceries.filter(g => g.purchased).map(g => g.name);
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
  }, []); // Run once on mount

  const addGrocery = () => {
    if (newGrocery.trim()) {
      const item: GroceryItem = { id: `g-${Date.now()}`, name: newGrocery.trim(), quantity: 1, purchased: false };
      setGroceries([...groceries, item]);
      setNewGrocery('');
    }
  };

  const toggleGrocery = (id: string) => {
    setGroceries(groceries.map(g => g.id === id ? { ...g, purchased: !g.purchased } : g));
  };
  
  const toggleChore = (id: string) => {
    setChores(chores.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline">Shared Grocery List</CardTitle>
          <CardDescription>Manage your flat's shopping list together.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2 mb-4">
            <Input placeholder="e.g., Apples" value={newGrocery} onChange={e => setNewGrocery(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGrocery()} />
            <Button onClick={addGrocery}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {groceries.map(item => (
              <div key={item.id} className="flex items-center space-x-3 rounded-md border p-3">
                <Checkbox id={`g-${item.id}`} checked={item.purchased} onCheckedChange={() => toggleGrocery(item.id)} />
                <label htmlFor={`g-${item.id}`} className={`flex-1 text-sm ${item.purchased ? 'line-through text-muted-foreground' : ''}`}>
                  {item.name}
                </label>
                <Badge variant="outline">{item.quantity} pc(s)</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-primary">
              <Sparkles /> AI Smart Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSuggestions ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <ul className="space-y-2">
                {suggestions.map((s, i) => (
                  <li key={i} className="flex items-center text-sm">
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setNewGrocery(s)}>
                      <Plus className="h-4 w-4 mr-2 text-primary" /> {s}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <Button variant="outline" size="sm" className="w-full mt-4" onClick={fetchSuggestions} disabled={isLoadingSuggestions}>Refresh Suggestions</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Chore Tracker</CardTitle>
            <CardDescription>Assign and track cleaning duties.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {chores.map(chore => (
              <div key={chore.id} className="flex items-center space-x-3 rounded-md border p-3">
                <Checkbox id={`c-${chore.id}`} checked={chore.completed} onCheckedChange={() => toggleChore(chore.id)} />
                <label htmlFor={`c-${chore.id}`} className={`flex-1 text-sm ${chore.completed ? 'line-through text-muted-foreground' : ''}`}>{chore.name}</label>
                <Badge variant={chore.assignedTo === 'Unassigned' ? 'destructive' : 'default'}>{chore.assignedTo}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
