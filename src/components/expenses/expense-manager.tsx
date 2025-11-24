
"use client";

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Lightbulb, Trash2 } from 'lucide-react';
import type { Expense } from '@/lib/types';
import { useData } from '@/context/data-context';


const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export function ExpenseManager() {
  const { expenses, addExpense, deleteExpense, user } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const dataByCategory = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      const existing = acc.find(item => item.name === expense.category);
      if (existing) {
        existing.value += expense.amount;
      } else {
        acc.push({ name: expense.category, value: expense.amount });
      }
      return acc;
    }, [] as { name: string, value: number }[]);
  }, [expenses]);

  const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const newExpense: Omit<Expense, 'id' | 'flatmateId' | 'date' | 'paidBy'> = {
      name: formData.get('name') as string,
      amount: parseFloat(formData.get('amount') as string),
      category: formData.get('category') as Expense['category'],
    };

    addExpense(newExpense);
    setIsDialogOpen(false);
    e.currentTarget.reset();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Spending Overview</CardTitle>
            <CardDescription>Your expenses by category.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {expenses.length === 0 ? <div className="h-full w-full flex items-center justify-center">No expenses yet.</div> :
              <PieChart>
                <Pie
                  data={dataByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dataByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
              }
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 bg-accent/20 border-accent">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-accent-foreground/80">
              <Lightbulb className="text-accent" />
              AI Savings Tip
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-lg italic text-accent-foreground/90">
              “Looks like you’ve been ordering food a lot this week. Try cooking one day to save ₹250!”
            </p>
             <Button variant="link" className="mt-4">Explore Recipes</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Expense History</CardTitle>
            <CardDescription>All recorded expenses for the current period.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Expense Name</Label>
                  <Input id="name" name="name" placeholder="e.g., Coffee" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input id="amount" name="amount" type="number" placeholder="e.g., 150" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Groceries">Groceries</SelectItem>
                      <SelectItem value="Bills">Bills</SelectItem>
                      <SelectItem value="Rent">Rent</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Add Expense</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Paid By</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 && <TableRow><TableCell colSpan={6} className="text-center">No expenses recorded yet.</TableCell></TableRow>}
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.name}</TableCell>
                  <TableCell><Badge variant="secondary">{expense.category}</Badge></TableCell>
                  <TableCell>{new Date(expense.date as string).toLocaleDateString()}</TableCell>
                  <TableCell>{expense.paidBy}</TableCell>
                  <TableCell className="text-right font-mono">₹{expense.amount.toFixed(2)}</TableCell>
                  <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteExpense(expense.id!)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
