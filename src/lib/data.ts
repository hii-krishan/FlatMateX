import type { Expense, Task, Class, GroceryItem, Chore, MoodEntry, Event, Poll, Service, Note } from './types';

export const mockExpenses: Expense[] = [
  { id: '1', name: 'Monthly Rent', amount: 12000, category: 'Rent', date: '2024-07-01', paidBy: 'Alex' },
  { id: '2', name: 'Electricity Bill', amount: 1500, category: 'Bills', date: '2024-07-05', paidBy: 'Ben' },
  { id: '3', name: 'Weekly Groceries', amount: 2500, category: 'Groceries', date: '2024-07-08', paidBy: 'Chloe' },
  { id: '4', name: 'Pizza Night', amount: 800, category: 'Food', date: '2024-07-10', paidBy: 'Alex' },
  { id: '5', name: 'Internet Bill', amount: 999, category: 'Bills', date: '2024-07-12', paidBy: 'Ben' },
];

export const mockTasks: Task[] = [
  { id: '1', title: 'Submit Physics Assignment', completed: false, dueDate: '2024-07-25' },
  { id: '2', title: 'Prepare for Chemistry Mid-term', completed: false, dueDate: '2024-07-28' },
  { id: '3', title: 'Buy new notebook', completed: true, dueDate: '2024-07-20' },
  { id: '4', title: 'Group study session for Math', completed: false, dueDate: '2024-07-26' },
];

export const mockTimetable: Class[] = [
    { id: 'c1', name: 'Data Structures', time: '09:00 - 10:00', day: 'Monday' },
    { id: 'c2', name: 'Algorithms', time: '10:00 - 11:00', day: 'Monday' },
    { id: 'c3', name: 'Database Systems', time: '09:00 - 10:00', day: 'Tuesday' },
    { id: 'c4', name: 'Operating Systems', time: '10:00 - 11:00', day: 'Wednesday' },
    { id: 'c5', name: 'Computer Networks', time: '11:00 - 12:00', day: 'Thursday' },
    { id: 'c6', name: 'Lab Session', time: '14:00 - 16:00', day: 'Friday' },
];

export const mockGroceryList: GroceryItem[] = [
  { id: 'g1', name: 'Milk', quantity: 2, purchased: false },
  { id: 'g2', name: 'Bread', quantity: 1, purchased: true },
  { id: 'g3', name: 'Eggs', quantity: 12, purchased: false },
  { id: 'g4', name: 'Coffee', quantity: 1, purchased: false },
];

export const mockChoreList: Chore[] = [
    { id: 'ch1', name: 'Clean Kitchen', assignedTo: 'Alex', completed: false },
    { id: 'ch2', name: 'Take out trash', assignedTo: 'Ben', completed: true },
    { id: 'ch3', name: 'Water plants', assignedTo: 'Chloe', completed: false },
    { id: 'ch4', name: 'Clean Bathroom', assignedTo: 'Unassigned', completed: false },
];

export const mockMoodData: MoodEntry[] = [
  { date: '2024-07-18', mood: 'Happy', sleepHours: 8, productivity: 'High' },
  { date: '2024-07-19', mood: 'Stressed', sleepHours: 6, productivity: 'Medium' },
  { date: '2024-07-20', mood: 'Stressed', sleepHours: 5, productivity: 'Low' },
  { date: '2024-07-21', mood: 'Stressed', sleepHours: 6, productivity: 'Medium' },
  { date: '2024-07-22', mood: 'Calm', sleepHours: 7, productivity: 'Medium' },
  { date: '2024-07-23', mood: 'Productive', sleepHours: 8, productivity: 'High' },
  { date: '2024-07-24', mood: 'Happy', sleepHours: 7, productivity: 'High' },
];

export const mockEvents: Event[] = [
  { id: 'e1', title: 'Project Zenith Presentation', date: '2024-08-05', type: 'College Fest' },
  { id: 'e2', title: 'Alex\'s Birthday Bash', date: '2024-08-15', type: 'Birthday' },
  { id: 'e3', title: 'Movie Marathon: Sci-Fi Classics', date: '2024-07-27', type: 'Movie Night' },
];

export const mockPolls: Poll[] = [
    {
        id: 'p1',
        question: 'Pizza night or game night?',
        options: [
            { text: 'Pizza Night 🍕', votes: 8 },
            { text: 'Game Night 🎮', votes: 5 },
        ]
    }
];


export const mockServices: Service[] = [
  { id: 's1', name: 'Tasty Meals Tiffin', type: 'Tiffin', rating: 4.5, distance: '500m' },
  { id: 's2', name: 'QuickWash Laundry', type: 'Laundry', rating: 4.2, distance: '1.2km' },
  { id: 's3', name: 'The Book Nook', type: 'Stationery', rating: 4.8, distance: '800m' },
  { id: 's4', 'name': 'City General Hospital', 'type': 'Hospital', 'rating': 4.6, 'distance': '2.5km' },
  { id: 's5', 'name': 'Central Bank ATM', 'type': 'ATM', 'rating': 4.0, 'distance': '300m' },
];

export const mockNotes: Note[] = [
    { id: 'n1', content: 'Rent due on the 5th!', color: 'bg-yellow-200 dark:bg-yellow-800' },
    { id: 'n2', content: 'Submit electricity bill receipt to owner by Friday.', color: 'bg-blue-200 dark:bg-blue-800' },
    { id: 'n3', content: 'Group meeting for project at 6 PM.', color: 'bg-green-200 dark:bg-green-800' },
];
