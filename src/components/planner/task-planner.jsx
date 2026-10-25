"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Bell, CalendarDays, ListChecks, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/context/data-context";
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
function TaskPlanner() {
  const { tasks, addTask, toggleTask, timetable, updateTimetable } = useData();
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
  const handleSaveClass = (e) => {
    e.preventDefault();
    if (!editingClass) return;
    const formData = new FormData(e.currentTarget);
    const updatedClass = {
      ...editingClass,
      name: formData.get("className"),
      time: formData.get("classTime"),
      day: formData.get("classDay")
    };
    updateTimetable(updatedClass);
    setEditingClass(null);
    setIsClassDialogOpen(false);
  };
  const timetableByDay = daysOfWeek.map((day) => ({
    day,
    classes: timetable.filter((c) => c.day === day).sort((a, b) => a.time.localeCompare(b.time))
  }));
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "planner", className: "h-full flex flex-col", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "planner", children: [
          /* @__PURE__ */ jsx(ListChecks, { className: "mr-2" }),
          "Task Planner"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "timetable", children: [
          /* @__PURE__ */ jsx(CalendarDays, { className: "mr-2" }),
          "Class Timetable"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "planner", className: "flex-grow mt-6", children: /* @__PURE__ */ jsxs(Card, { className: "h-full flex flex-col", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "font-headline", children: "Daily Study Planner" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Organize your tasks and stay on top of your deadlines." })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4 flex-grow", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex w-full items-center space-x-2", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "Add a new task...",
                value: newTaskTitle,
                onChange: (e) => setNewTaskTitle(e.target.value),
                onKeyDown: (e) => e.key === "Enter" && handleAddTask()
              }
            ),
            /* @__PURE__ */ jsxs(Button, { onClick: handleAddTask, children: [
              /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
              " Add Task"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-[calc(100vh-24rem)] overflow-y-auto pr-2", children: tasks.map((task) => /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3 rounded-md border p-3 hover:bg-muted/50 transition-colors", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                id: `task-${task.id}`,
                checked: task.completed,
                onCheckedChange: () => toggleTask(task.id)
              }
            ),
            /* @__PURE__ */ jsx(
              "label",
              {
                htmlFor: `task-${task.id}`,
                className: `flex-1 text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`,
                children: task.title
              }
            ),
            task.dueDate && /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "Due: ",
              new Date(task.dueDate).toLocaleDateString()
            ] })
          ] }, task.id)) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "timetable", className: "flex-grow mt-6", children: /* @__PURE__ */ jsxs(Card, { className: "h-full", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "font-headline", children: "Weekly Timetable" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Your class schedule for the week. Click the pencil to edit." })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: timetableByDay.filter((d) => d.classes.length > 0).map(({ day, classes }) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-2 text-primary", children: day }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: classes.map((c) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3 bg-card shadow-sm hover:shadow-md transition-shadow", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: c.name }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: c.time })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleEditClassClick(c), children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", children: /* @__PURE__ */ jsx(Bell, { className: "h-4 w-4" }) })
            ] })
          ] }, c.id)) })
        ] }, day)) }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: isClassDialogOpen, onOpenChange: setIsClassDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Edit Class" }) }),
      editingClass && /* @__PURE__ */ jsxs("form", { onSubmit: handleSaveClass, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "className", children: "Class Name" }),
          /* @__PURE__ */ jsx(Input, { id: "className", name: "className", defaultValue: editingClass.name, required: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "classTime", children: "Time" }),
          /* @__PURE__ */ jsx(Input, { id: "classTime", name: "classTime", defaultValue: editingClass.time, required: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "classDay", children: "Day" }),
          /* @__PURE__ */ jsxs(Select, { name: "classDay", defaultValue: editingClass.day, required: true, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { id: "classDay", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select a day" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: daysOfWeek.map((day) => /* @__PURE__ */ jsx(SelectItem, { value: day, children: day }, day)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setIsClassDialogOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { type: "submit", children: "Save Changes" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  TaskPlanner
};
