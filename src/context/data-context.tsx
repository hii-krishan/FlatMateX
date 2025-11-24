
"use client";

import React, { createContext, useContext, useState } from 'react';
import { mockExpenses, mockGroceryList, mockChores, mockEvents, mockPolls, mockNotes, mockTasks, mockTimetable, mockMoodData, mockUser } from '@/lib/data';
import type { Expense, GroceryItem, Chore, Event, Poll, Note, Task, Class, MoodEntry, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface DataContextType {
  user: UserProfile;
  updateUser: (user: UserProfile) => void;

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'flatmateId'>) => void;
  deleteExpense: (id: string) => void;
  
  groceries: GroceryItem[];
  addGrocery: (item: Omit<GroceryItem, 'id' | 'flatmateId' | 'purchased'>) => void;
  toggleGrocery: (id: string) => void;
  deleteGrocery: (id: string) => void;

  chores: Chore[];
  toggleChore: (id: string) => void;
  updateChore: (chore: Chore) => void;

  events: Event[];
  addEvent: (event: Omit<Event, 'id'| 'flatmateId'>) => void;
  deleteEvent: (id: string) => void;

  polls: Poll[];
  updatePoll: (poll: Poll) => void;
  voteOnPoll: (pollId: string, optionIndex: number) => void;

  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'authorId' | 'author' | 'color' | 'createdAt'>) => void;
  deleteNote: (id: string) => void;

  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  toggleTask: (id: string) => void;

  timetable: Class[];
  updateTimetable: (classItem: Class) => void;

  moodData: MoodEntry[];
  updateMoodEntry: (id: string, data: Partial<MoodEntry>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const noteColors = [
  'bg-yellow-200',
  'bg-green-200',
  'bg-blue-200',
  'bg-pink-200',
  'bg-purple-200',
];


export function DataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [groceries, setGroceries] = useState<GroceryItem[]>(mockGroceryList);
  const [chores, setChores] = useState<Chore[]>(mockChores);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [polls, setPolls] = useState<Poll[]>(mockPolls);
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [timetable, setTimetable] = useState<Class[]>(mockTimetable);
  const [moodData, setMoodData] = useState<MoodEntry[]>(mockMoodData);

  const { toast } = useToast();

  const updateUser = (user: UserProfile) => {
    setUser(user);
    toast({ title: 'Profile updated!' });
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'flatmateId'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      flatmateId: 'user-1',
      paidBy: user.name,
      date: new Date().toISOString()
    };
    setExpenses(prev => [...prev, newExpense]);
    toast({ title: 'Expense Added!' });
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    toast({ title: 'Expense Deleted' });
  };

  const addGrocery = (item: Omit<GroceryItem, 'id' | 'flatmateId' | 'purchased'>) => {
    const newGrocery: GroceryItem = {
      ...item,
      id: `groc-${Date.now()}`,
      purchased: false,
      flatmateId: 'user-1'
    };
    setGroceries(prev => [...prev, newGrocery]);
    toast({ title: 'Grocery item added!' });
  };

  const toggleGrocery = (id: string) => {
    setGroceries(prev => prev.map(g => g.id === id ? { ...g, purchased: !g.purchased } : g));
  };

  const deleteGrocery = (id: string) => {
    setGroceries(prev => prev.filter(g => g.id !== id));
    toast({ title: 'Grocery item deleted.' });
  };

  const toggleChore = (id: string) => {
    setChores(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  const updateChore = (chore: Chore) => {
    setChores(prev => prev.map(c => c.id === chore.id ? chore : c));
    toast({ title: 'Chore updated!' });
  };

  const addEvent = (event: Omit<Event, 'id' | 'flatmateId'>) => {
    const newEvent: Event = {
      ...event,
      id: `evt-${Date.now()}`,
      flatmateId: 'user-1'
    };
    setEvents(prev => [...prev, newEvent]);
    toast({ title: 'Event Created!' });
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    toast({ title: "Event deleted." });
  };
  
  const updatePoll = (poll: Poll) => {
    setPolls(prev => prev.map(p => p.id === poll.id ? poll : p));
    toast({ title: 'Poll updated!' });
  };

  const voteOnPoll = (pollId: string, optionIndex: number) => {
    setPolls(prevPolls => prevPolls.map(poll => {
      if (poll.id === pollId) {
        // Prevent user from voting multiple times - for now, anyone can vote multiple times.
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
  

  const addNote = (note: Omit<Note, 'id' | 'authorId' | 'author'| 'color'| 'createdAt'>) => {
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}`,
      author: user.name,
      authorId: 'user-1',
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
      createdAt: new Date(),
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const addTask = (task: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      completed: false,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const updateTimetable = (classItem: Class) => {
    setTimetable(prev => prev.map(c => c.id === classItem.id ? classItem : c));
  };

  const updateMoodEntry = (id: string, data: Partial<MoodEntry>) => {
    setMoodData(prev => prev.map(entry => entry.id === id ? { ...entry, ...data } : entry));
    toast({ title: "Sleep data updated!" });
  }

  return (
    <DataContext.Provider value={{
      user, updateUser,
      expenses, addExpense, deleteExpense,
      groceries, addGrocery, toggleGrocery, deleteGrocery,
      chores, toggleChore, updateChore,
      events, addEvent, deleteEvent,
      polls, updatePoll, voteOnPoll,
      notes, addNote, deleteNote,
      tasks, addTask, toggleTask,
      timetable, updateTimetable,
      moodData, updateMoodEntry
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
