"use client";
import { Fragment } from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, CalendarDays, ListChecks, Pencil, Trash2, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/context/data-context";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function TaskPlanner() {
  const { tasks, addTask, toggleTask, deleteTask, timetable, updateTimetable, addTimetableSlot, deleteTimetableSlot } = useData();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask({ title: newTaskTitle.trim() });
      setNewTaskTitle("");
    }
  };

  const handleEditClassClick = (classItem) => {
    setEditingClass(classItem);
    setIsClassDialogOpen(true);
  };

  const handleAddClassClick = () => {
    setEditingClass({
      name: "",
      startTime: "09:00",
      endTime: "10:00",
      time: "09:00 - 10:00",
      day: "Monday",
      isNew: true
    });
    setIsClassDialogOpen(true);
  };

  const handleSaveClass = (e) => {
    e.preventDefault();
    if (!editingClass) return;
    const formData = new FormData(e.currentTarget);
    const startTime = formData.get("classStartTime");
    const endTime = formData.get("classEndTime");

    const updatedClass = {
      ...editingClass,
      name: formData.get("className"),
      startTime,
      endTime,
      time: `${startTime} - ${endTime}`,
      day: formData.get("classDay")
    };

    if (editingClass.isNew) addTimetableSlot(updatedClass);
    else updateTimetable(updatedClass);

    setEditingClass(null);
    setIsClassDialogOpen(false);
  };

  const timetableByDay = daysOfWeek.map((day) => ({
    day,
    classes: timetable.filter((c) => c.day === day).sort((a, b) => {
      const timeA = a.startTime || a.time || "";
      const timeB = b.startTime || b.time || "";
      return timeA.localeCompare(timeB);
    })
  }));

  return (
    <Fragment>
      <Tabs defaultValue="timetable" className="h-full flex flex-col space-y-6">
        <div className="flex-shrink-0">
          <TabsList className="grid w-full sm:w-80 grid-cols-2 h-11 p-1 bg-muted/60 rounded-xl">
            <TabsTrigger value="timetable" className="rounded-lg gap-2 font-semibold">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span>Class Timetable</span>
            </TabsTrigger>
            <TabsTrigger value="planner" className="rounded-lg gap-2 font-semibold">
              <ListChecks className="h-4 w-4 text-primary" />
              <span>Task Planner</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* CLASS TIMETABLE TAB */}
        <TabsContent value="timetable" className="flex-grow mt-0">
          <Card className="rounded-2xl border-primary/20 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
              <div>
                <CardTitle className="font-headline text-2xl font-bold">Weekly Class Timetable</CardTitle>
                <CardDescription>
                  Keep track of all class lectures, lab sessions, and study hours with explicit start and end times.
                </CardDescription>
              </div>
              <Button onClick={handleAddClassClick} className="gap-2 rounded-xl bg-primary shadow-md shadow-primary/20 font-semibold">
                <Plus className="h-4 w-4" />
                <span>Add Class Slot</span>
              </Button>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {timetableByDay.map(({ day, classes }) => (
                  <div key={day} className="rounded-2xl border bg-card/60 p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b">
                      <h3 className="font-headline font-bold text-base text-primary">{day}</h3>
                      <Badge variant="outline" className="text-[10px]">
                        {classes.length} {classes.length === 1 ? "Class" : "Classes"}
                      </Badge>
                    </div>

                    <div className="space-y-2.5">
                      {classes.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic py-3 text-center">
                          No classes scheduled for {day}.
                        </p>
                      ) : (
                        classes.map((c) => {
                          const startTime = c.startTime || c.time?.split(" - ")[0] || "N/A";
                          const endTime = c.endTime || c.time?.split(" - ")[1] || "N/A";

                          return (
                            <div
                              key={c.id}
                              className="group relative flex flex-col gap-2 rounded-xl border bg-muted/30 p-3 hover:bg-muted/60 transition-all hover:shadow-xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-bold text-sm text-foreground">{c.name}</p>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                                    onClick={() => handleEditClassClick(c)}
                                    title="Edit class"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => deleteTimetableSlot(c.id)}
                                    title="Remove class slot"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>

                              {/* Explicit Start and End Time Display */}
                              <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-background/80 px-2.5 py-1.5 border border-border/60 text-xs">
                                <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="text-muted-foreground">Start:</span>
                                <strong className="font-mono text-foreground font-semibold">{startTime}</strong>
                                <span className="text-muted-foreground mx-0.5">•</span>
                                <span className="text-muted-foreground">End:</span>
                                <strong className="font-mono text-foreground font-semibold">{endTime}</strong>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TASK PLANNER TAB */}
        <TabsContent value="planner" className="flex-grow mt-0">
          <Card className="rounded-2xl border-primary/20 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b">
              <div>
                <CardTitle className="font-headline text-2xl font-bold">Daily Study Planner</CardTitle>
                <CardDescription>Organize your tasks, check off completed work, or remove finished items.</CardDescription>
              </div>
              {tasks.some((t) => t.completed) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/30 shrink-0 self-start sm:self-auto"
                  onClick={() => {
                    const completedTasks = tasks.filter((t) => t.completed);
                    completedTasks.forEach((t) => deleteTask(t.id));
                  }}
                  title="Remove all completed tasks"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  <span>Clear Completed</span>
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex w-full items-center space-x-2">
                <Input
                  placeholder="Add a new study task or assignment..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  className="rounded-xl"
                />
                <Button onClick={handleAddTask} className="rounded-xl gap-1.5">
                  <Plus className="h-4 w-4" />
                  <span>Add Task</span>
                </Button>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-24rem)] overflow-y-auto pr-2">
                {tasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-4 text-center">No tasks in planner yet.</p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="group flex items-center justify-between space-x-3 rounded-xl border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id)}
                        />
                        <label
                          htmlFor={`task-${task.id}`}
                          className={`text-sm cursor-pointer select-none transition-all ${task.completed ? "line-through text-muted-foreground" : "font-medium text-foreground"}`}
                        >
                          {task.title}
                        </label>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {task.dueDate && (
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          onClick={() => deleteTask(task.id)}
                          title="Delete task from study planner"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG: ADD/EDIT CLASS WITH EXPLICIT START AND END TIME */}
      <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline">
              <CalendarDays className="h-5 w-5 text-primary" />
              {editingClass?.isNew ? "Add Class Slot" : "Edit Class"}
            </DialogTitle>
            <DialogDescription>
              Specify the subject name, day of the week, and explicit start and end times.
            </DialogDescription>
          </DialogHeader>

          {editingClass && (
            <form onSubmit={handleSaveClass} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="className" className="text-xs">Class / Subject Name *</Label>
                <Input
                  id="className"
                  name="className"
                  placeholder="e.g. Data Structures & Algorithms"
                  defaultValue={editingClass.name}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="classDay" className="text-xs">Day of Week *</Label>
                <Select name="classDay" defaultValue={editingClass.day} required>
                  <SelectTrigger id="classDay">
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Explicit Start Time and End Time in the Time Section */}
              <div className="rounded-xl border bg-muted/30 p-3.5 space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Time Schedule (Start & End Time)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="classStartTime" className="text-xs font-medium text-foreground">
                      Start Time *
                    </Label>
                    <Input
                      id="classStartTime"
                      name="classStartTime"
                      type="time"
                      defaultValue={editingClass.startTime || editingClass.time?.split(" - ")[0] || "09:00"}
                      required
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="classEndTime" className="text-xs font-medium text-foreground">
                      End Time *
                    </Label>
                    <Input
                      id="classEndTime"
                      name="classEndTime"
                      type="time"
                      defaultValue={editingClass.endTime || editingClass.time?.split(" - ")[1] || "10:00"}
                      required
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Specify exact start time and end time for this class slot.
                </p>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="ghost" onClick={() => setIsClassDialogOpen(false)}>
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
