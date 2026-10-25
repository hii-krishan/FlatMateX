"use client";
import { jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
import { mockExpenses, mockGroceryList, mockChores, mockEvents, mockPolls, mockNotes, mockTasks, mockTimetable, mockMoodData, mockUser, mockServicesData } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
const DataContext = createContext(void 0);
const noteColors = [
  "bg-yellow-200",
  "bg-green-200",
  "bg-blue-200",
  "bg-pink-200",
  "bg-purple-200"
];
function DataProvider({ children }) {
  const [user, setUser] = useState(mockUser);
  const [expenses, setExpenses] = useState(mockExpenses);
  const [groceries, setGroceries] = useState(mockGroceryList);
  const [chores, setChores] = useState(mockChores);
  const [events, setEvents] = useState(mockEvents);
  const [polls, setPolls] = useState(mockPolls);
  const [notes, setNotes] = useState(mockNotes);
  const [tasks, setTasks] = useState(mockTasks);
  const [timetable, setTimetable] = useState(mockTimetable);
  const [moodData, setMoodData] = useState(mockMoodData);
  const [services, setServices] = useState(mockServicesData);
  const { toast } = useToast();
  const updateUser = (user2) => {
    setUser(user2);
    toast({ title: "Profile updated!" });
  };
  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: `exp-${Date.now()}`,
      flatmateId: "user-1",
      paidBy: user.name,
      date: (/* @__PURE__ */ new Date()).toISOString()
    };
    setExpenses((prev) => [...prev, newExpense]);
    toast({ title: "Expense Added!" });
  };
  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    toast({ title: "Expense Deleted" });
  };
  const addGrocery = (item) => {
    const newGrocery = {
      ...item,
      id: `groc-${Date.now()}`,
      purchased: false,
      flatmateId: "user-1"
    };
    setGroceries((prev) => [...prev, newGrocery]);
    toast({ title: "Grocery item added!" });
  };
  const toggleGrocery = (id) => {
    setGroceries((prev) => prev.map((g) => g.id === id ? { ...g, purchased: !g.purchased } : g));
  };
  const deleteGrocery = (id) => {
    setGroceries((prev) => prev.filter((g) => g.id !== id));
    toast({ title: "Grocery item deleted." });
  };
  const toggleChore = (id) => {
    setChores((prev) => prev.map((c) => c.id === id ? { ...c, completed: !c.completed } : c));
  };
  const updateChore = (chore) => {
    setChores((prev) => prev.map((c) => c.id === chore.id ? chore : c));
    toast({ title: "Chore updated!" });
  };
  const addEvent = (event) => {
    const newEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      flatmateId: "user-1"
    };
    setEvents((prev) => [...prev, newEvent]);
    toast({ title: "Event Created!" });
  };
  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    toast({ title: "Event deleted." });
  };
  const updatePoll = (poll) => {
    setPolls((prev) => prev.map((p) => p.id === poll.id ? poll : p));
    toast({ title: "Poll updated!" });
  };
  const voteOnPoll = (pollId, optionIndex) => {
    setPolls((prevPolls) => prevPolls.map((poll) => {
      if (poll.id === pollId) {
        const newOptions = poll.options.map((option, idx) => {
          if (idx === optionIndex) {
            return { ...option, votes: option.votes + 1 };
          }
          return option;
        });
        return { ...poll, options: newOptions };
      }
      return poll;
    }));
    toast({ title: "Vote counted!" });
  };
  const addNote = (note) => {
    const newNote = {
      ...note,
      id: `note-${Date.now()}`,
      author: user.name,
      authorId: "user-1",
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
      createdAt: /* @__PURE__ */ new Date()
    };
    setNotes((prev) => [newNote, ...prev]);
  };
  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };
  const addTask = (task) => {
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      completed: false
    };
    setTasks((prev) => [...prev, newTask]);
  };
  const toggleTask = (id) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  };
  const updateTimetable = (classItem) => {
    setTimetable((prev) => prev.map((c) => c.id === classItem.id ? classItem : c));
  };
  const updateMoodEntry = (id, data) => {
    setMoodData((prev) => prev.map((entry) => entry.id === id ? { ...entry, ...data } : entry));
    toast({ title: "Sleep data updated!" });
  };
  const addService = (service) => {
    const newService = {
      id: `service-${Date.now()}`,
      ...service
    };
    setServices((prev) => [newService, ...prev]);
    toast({ title: "Service Added!" });
  };
  const updateService = (service) => {
    setServices((prev) => prev.map((s) => s.id === service.id ? service : s));
    toast({ title: "Service Updated!" });
  };
  const deleteService = (id) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Service Deleted" });
  };
  return /* @__PURE__ */ jsx(DataContext.Provider, { value: {
    user,
    updateUser,
    expenses,
    addExpense,
    deleteExpense,
    groceries,
    addGrocery,
    toggleGrocery,
    deleteGrocery,
    chores,
    toggleChore,
    updateChore,
    events,
    addEvent,
    deleteEvent,
    polls,
    updatePoll,
    voteOnPoll,
    notes,
    addNote,
    deleteNote,
    tasks,
    addTask,
    toggleTask,
    timetable,
    updateTimetable,
    moodData,
    updateMoodEntry,
    services,
    addService,
    updateService,
    deleteService
  }, children });
}
function useData() {
  const context = useContext(DataContext);
  if (context === void 0) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
export {
  DataProvider,
  useData
};
