
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Task, Class } from '@/lib/types';
import { Plus, Bell, CalendarDays, ListChecks, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/context/data-context';

const daysOfWeek: Class['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function TaskPlanner() {
  const { tasks, addTask, toggleTask, timetable, updateTimetable } = useData();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask({ title: newTaskTitle.trim() });
      setNewTaskTitle('');
    }
  };

  const handleEditClassClick = (classItem: Class) => {
    setEditingClass(classItem);
    setIsClassDialogOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingClass) return;

    const formData = new FormData(e.currentTarget);
    const updatedClass: Class = {
      ...editingClass,
      name: formData.get('className') as string,
      time: formData.get('classTime') as string,
      day: formData.get('classDay') as Class['day'],
    };

    updateTimetable(updatedClass);
    setEditingClass(null);
    setIsClassDialogOpen(false);
  };
  
  const timetableByDay = daysOfWeek.map(day => ({
      day,
      classes: timetable.filter(c => c.day === day).sort((a,b) => a.time.localeCompare(b.time))
  }));

  return (
    <>
    <Tabs defaultValue="planner" className="h-full flex flex-col">
      <div className="flex-shrink-0">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="planner"><ListChecks className="mr-2" />Task Planner</TabsTrigger>
            <TabsTrigger value="timetable"><CalendarDays className="mr-2"/>Class Timetable</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="planner" className="flex-grow mt-6">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Daily Study Planner</CardTitle>
            <CardDescription>Organize your tasks and stay on top of your deadlines.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow">
            <div className="flex w-full items-center space-x-2">
              <Input 
                placeholder="Add a new task..." 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              />
              <Button onClick={handleAddTask}><Plus className="mr-2 h-4 w-4" /> Add Task</Button>
            </div>
            <div className="space-y-2 max-h-[calc(100vh-24rem)] overflow-y-auto pr-2">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center space-x-3 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    id={`task-${task.id}`} 
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id!)}
                  />
                  <label 
                    htmlFor={`task-${task.id}`}
                    className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {task.title}
                  </label>
                  {task.dueDate && <span className="text-xs text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="timetable" className="flex-grow mt-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-headline">Weekly Timetable</CardTitle>
            <CardDescription>Your class schedule for the week. Click the pencil to edit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timetableByDay.filter(d => d.classes.length > 0).map(({day, classes}) => (
                    <div key={day}>
                        <h3 className="font-semibold mb-2 text-primary">{day}</h3>
                        <div className="space-y-2">
                            {classes.map(c => (
                                <div key={c.id} className="flex items-center justify-between rounded-lg border p-3 bg-card shadow-sm hover:shadow-md transition-shadow">
                                    <div>
                                        <p className="font-medium">{c.name}</p>
                                        <p className="text-sm text-muted-foreground">{c.time}</p>
                                    </div>
                                    <div className="flex items-center">
                                      <Button variant="ghost" size="icon" onClick={() => handleEditClassClick(c)}>
                                          <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon">
                                          <Bell className="h-4 w-4" />
                                      </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
        </DialogHeader>
        {editingClass && (
        <form onSubmit={handleSaveClass} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="className">Class Name</Label>
            <Input id="className" name="className" defaultValue={editingClass.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="classTime">Time</Label>
            <Input id="classTime" name="classTime" defaultValue={editingClass.time} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="classDay">Day</Label>
            <Select name="classDay" defaultValue={editingClass.day} required>
              <SelectTrigger id="classDay">
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsClassDialogOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}

    