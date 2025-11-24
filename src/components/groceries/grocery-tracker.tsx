"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, Trash2, Loader2, Pencil } from 'lucide-react';
import { getSmartGrocerySuggestions } from '@/ai/flows/smart-grocery-suggestions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from "@/components/ui/label";
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { GroceryItem, Chore } from '@/lib/types';


export function GroceryTracker() {
  const [newGrocery, setNewGrocery] = useState('');
  const [newGroceryQty, setNewGroceryQty] = useState(1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isChoreDialogOpen, setIsChoreDialogOpen] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);

  const firestore = useFirestore();
  const { toast } = useToast();

  const groceriesCollection = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'groceries');
  }, [firestore]);
  const { data: groceries, loading: groceriesLoading } = useCollection<GroceryItem>(groceriesCollection);
  
  const choresCollection = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'chores');
  }, [firestore]);
  const { data: chores, loading: choresLoading } = useCollection<Chore>(choresCollection);


  const fetchSuggestions = async () => {
    if (!groceries) return;
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
    if (groceries) {
      fetchSuggestions();
    }
  }, [groceries]);

  const addGrocery = async () => {
    if (newGrocery.trim() && firestore) {
      const item: Omit<GroceryItem, 'id'> = { 
        name: newGrocery.trim(), 
        quantity: newGroceryQty, 
        purchased: false,
      };
      await addDoc(collection(firestore, 'groceries'), item);
      setNewGrocery('');
      setNewGroceryQty(1);
      toast({ title: 'Grocery item added!' });
    }
  };

  const toggleGrocery = async (id: string, currentStatus: boolean) => {
    if (!firestore) return;
    const itemDoc = doc(firestore, 'groceries', id);
    await updateDoc(itemDoc, { purchased: !currentStatus });
  };

  const deleteGrocery = async (id: string) => {
    if (!firestore) return;
    await deleteDoc(doc(firestore, 'groceries', id));
    toast({ title: 'Grocery item deleted.' });
  }
  
  const toggleChore = async (id: string, currentStatus: boolean) => {
    if (!firestore) return;
    const choreDoc = doc(firestore, 'chores', id);
    await updateDoc(choreDoc, { completed: !currentStatus });
  };

  const handleEditChoreClick = (chore: Chore) => {
    setEditingChore(chore);
    setIsChoreDialogOpen(true);
  };

  const handleSaveChore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingChore || !firestore) return;

    const formData = new FormData(e.currentTarget);
    const updatedChore = {
        name: formData.get('choreName') as string,
        assignedTo: formData.get('assignedTo') as string,
    };
    
    const choreDoc = doc(firestore, 'chores', editingChore.id!);
    await updateDoc(choreDoc, updatedChore);

    setEditingChore(null);
    setIsChoreDialogOpen(false);
    toast({ title: 'Chore updated!' });
  };

  return (
    <>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline">Shared Grocery List</CardTitle>
          <CardDescription>Manage your flat's shopping list together.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2 mb-4">
            <Input placeholder="e.g., Apples" value={newGrocery} onChange={e => setNewGrocery(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGrocery()} className="flex-grow" />
            <Input type="number" min="1" value={newGroceryQty} onChange={e => setNewGroceryQty(parseInt(e.target.value))} className="w-20" />
            <Button onClick={addGrocery}><Plus className="mr-2 h-4 w-4" /> Add</Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {groceriesLoading && <p>Loading groceries...</p>}
            {groceries?.map(item => (
              <div key={item.id} className="flex items-center space-x-3 rounded-md border p-3 group">
                <Checkbox id={`g-${item.id}`} checked={item.purchased} onCheckedChange={() => toggleGrocery(item.id!, item.purchased)} />
                <label htmlFor={`g-${item.id}`} className={`flex-1 text-sm ${item.purchased ? 'line-through text-muted-foreground' : ''}`}>
                  {item.name}
                </label>
                <Badge variant="outline">{item.quantity} pc(s)</Badge>
                
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => deleteGrocery(item.id!)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                
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
            {choresLoading && <p>Loading chores...</p>}
            {chores?.map(chore => (
              <div key={chore.id} className="flex items-center space-x-3 rounded-md border p-3">
                <Checkbox id={`c-${chore.id}`} checked={chore.completed} onCheckedChange={() => toggleChore( chore.id!, chore.completed)} />
                <label htmlFor={`c-${chore.id}`} className={`flex-1 text-sm ${chore.completed ? 'line-through text-muted-foreground' : ''}`}>{chore.name}</label>
                <Badge variant={chore.assignedTo === 'Unassigned' ? 'destructive' : 'default'}>{chore.assignedTo}</Badge>
                
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditChoreClick(chore)}>
                      <Pencil className="h-4 w-4" />
                  </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
    
    <Dialog open={isChoreDialogOpen} onOpenChange={setIsChoreDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Chore</DialogTitle>
            </DialogHeader>
            {editingChore && (
            <form onSubmit={handleSaveChore} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="choreName">Chore Name</Label>
                    <Input id="choreName" name="choreName" defaultValue={editingChore.name} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assign To</Label>
                    <Input id="assignedTo" name="assignedTo" defaultValue={editingChore.assignedTo} required />
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsChoreDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </DialogFooter>
            </form>
            )}
        </DialogContent>
    </Dialog>
    </>
  );
}
