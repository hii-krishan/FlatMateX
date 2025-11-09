"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockTasks, mockTimetable } from '@/lib/data';
import type { Task, Class } from '@/lib/types';
import { Plus, Bell, CalendarDays, ListChecks } from 'lucide-react';

const daysOfWeek: Class['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function TaskPlanner() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: `task-${Date.now()}`,
        title: newTask.trim(),
        completed: false,
      };
      setTasks([...tasks, task]);
      setNewTask('');
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };
  
  const timetableByDay = daysOfWeek.map(day => ({
      day,
      classes: mockTimetable.filter(c => c.day === day).sort((a,b) => a.time.localeCompare(b.time))
  }));

  return (
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
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
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
                    onCheckedChange={() => toggleTask(task.id)}
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
            <CardDescription>Your class schedule for the week. Click the bell to set a reminder.</CardDescription>
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
                                    <Button variant="ghost" size="icon">
                                        <Bell className="h-4 w-4" />
                                    </Button>
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
  );
}
