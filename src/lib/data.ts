

import type { Expense, Task, Class, GroceryItem, Chore, MoodEntry, Event, Poll, Service, Note, UserProfile } from './types';

export const mockUser: UserProfile = {
  id: 'user-1',
  name: 'Alex',
};

export const mockNotes: Note[] = [
  { id: 'n1', content: 'Pay electricity bill by Friday!', color: 'bg-yellow-200', author: 'Alex', createdAt: new Date('2024-07-22T10:00:00Z'), authorId: 'user-1' },
  { id: 'n2', content: 'Weekend movie plan: Anyone up for a horror movie?', color: 'bg-green-200', author: 'Ben', createdAt: new Date('2024-07-21T14:30:00Z'), authorId: 'user-2' },
  { id: 'n3', content: 'Remember to buy groceries for the party.', color: 'bg-blue-200', author: 'Chloe', createdAt: new Date('2024-07-20T09:00:00Z'), authorId: 'user-3' },
];

export const mockExpenses: Expense[] = [
  { id: '1', name: 'Monthly Rent', amount: 12000, category: 'Rent', date: '2024-07-01', paidBy: 'Alex', flatmateId: 'user-1' },
  { id: '2', name: 'Electricity Bill', amount: 1500, category: 'Bills', date: '2024-07-05', paidBy: 'Ben', flatmateId: 'user-2' },
  { id: '3', name: 'Weekly Groceries', amount: 2500, category: 'Groceries', date: '2024-07-08', paidBy: 'Chloe', flatmateId: 'user-3' },
  { id: '4', name: 'Pizza Night', amount: 800, category: 'Food', date: '2024-07-10', paidBy: 'Alex', flatmateId: 'user-1' },
  { id: '5', name: 'Internet Bill', amount: 999, category: 'Bills', date: '2024-07-12', paidBy: 'Ben', flatmateId: 'user-2' },
];

export const mockTasks: Task[] = [
  { id: '1', title: 'Submit Physics Assignment', completed: false, dueDate: '2024-07-25', flatmateId: 'user-1' },
  { id: '2', title: 'Prepare for Chemistry Mid-term', completed: false, dueDate: '2024-07-28', flatmateId: 'user-1' },
  { id: '3', title: 'Buy new notebook', completed: true, dueDate: '2024-07-20', flatmateId: 'user-1' },
  { id: '4', title: 'Group study session for Math', completed: false, dueDate: '2024-07-26', flatmateId: 'user-1' },
];

export const mockTimetable: Class[] = [
    { id: 'c1', name: 'Data Structures', time: '09:00 - 10:00', day: 'Monday', flatmateId: 'user-1' },
    { id: 'c2', name: 'Algorithms', time: '10:00 - 11:00', day: 'Monday', flatmateId: 'user-1' },
    { id: 'c3', name: 'Database Systems', time: '09:00 - 10:00', day: 'Tuesday', flatmateId: 'user-1' },
    { id: 'c4', name: 'Operating Systems', time: '10:00 - 11:00', day: 'Wednesday', flatmateId: 'user-1' },
    { id: 'c5', name: 'Computer Networks', time: '11:00 - 12:00', day: 'Thursday', flatmateId: 'user-1' },
    { id: 'c6', name: 'Lab Session', time: '14:00 - 16:00', day: 'Friday', flatmateId: 'user-1' },
];

export const mockGroceryList: GroceryItem[] = [
  { id: 'g1', name: 'Milk', quantity: 2, purchased: false, flatmateId: 'user-1' },
  { id: 'g2', name: 'Bread', quantity: 1, purchased: true, flatmateId: 'user-2' },
  { id: 'g3', name: 'Eggs', quantity: 12, purchased: false, flatmateId: 'user-3' },
  { id: 'g4', name: 'Coffee', quantity: 1, purchased: false, flatmateId: 'user-1' },
];

export const mockChores: Chore[] = [
    { id: 'ch1', name: 'Clean Kitchen', assignedTo: 'Alex', completed: false, flatmateId: 'user-1' },
    { id: 'ch2', name: 'Take out trash', assignedTo: 'Ben', completed: true, flatmateId: 'user-2' },
    { id: 'ch3', name: 'Water plants', assignedTo: 'Chloe', completed: false, flatmateId: 'user-3' },
    { id: 'ch4', name: 'Clean Bathroom', assignedTo: 'Unassigned', completed: false, flatmateId: 'user-1' },
];

export const mockMoodData: MoodEntry[] = [
  { id: 'm1', date: '2024-07-18', mood: 'Happy', sleepHours: 8, productivity: 'High', flatmateId: 'user-1' },
  { id: 'm2', date: '2024-07-19', mood: 'Stressed', sleepHours: 6, productivity: 'Medium', flatmateId: 'user-1' },
  { id: 'm3', date: '2024-07-20', mood: 'Stressed', sleepHours: 5, productivity: 'Low', flatmateId: 'user-1' },
  { id: 'm4', date: '2024-07-21', mood: 'Stressed', sleepHours: 6, productivity: 'Medium', flatmateId: 'user-1' },
  { id: 'm5', date: '2024-07-22', mood: 'Calm', sleepHours: 7, productivity: 'Medium', flatmateId: 'user-1' },
  { id: 'm6', date: '2024-07-23', mood: 'Productive', sleepHours: 8, productivity: 'High', flatmateId: 'user-1' },
  { id: 'm7', date: '2024-07-24', mood: 'Happy', sleepHours: 7, productivity: 'High', flatmateId: 'user-1' },
];

export const mockEvents: Event[] = [
  { id: 'e1', title: 'Project Zenith Presentation', date: '2024-08-05', type: 'College Fest', flatmateId: 'user-1' },
  { id: 'e2', title: 'Alex\'s Birthday Bash', date: '2024-08-15', type: 'Birthday', flatmateId: 'user-2' },
  { id: 'e3', title: 'Movie Marathon: Sci-Fi Classics', date: '2024-07-27', type: 'Movie Night', flatmateId: 'user-3' },
];

export const mockPolls: Poll[] = [
    {
        id: 'p1',
        question: 'Pizza night or game night?',
        options: [
            { text: 'Pizza Night 🍕', votes: 8, voters: [] },
            { text: 'Game Night 🎮', votes: 5, voters: [] },
        ],
        flatmateId: 'user-1'
    }
];

export const mockServicesData: Service[] = [
    { id: 's1', name: 'Tasty Meals Tiffin', type: 'Tiffin', rating: 4.5, distance: '500m' },
    { id: 's2', name: 'QuickWash Laundry', type: 'Laundry', rating: 4.2, distance: '1.2km' },
    { id: 's3', name: 'Daily Needs Grocery', type: 'Grocery Store', rating: 4.8, distance: '800m' },
    { id: 's4', name: 'The Food Hub', type: 'Restaurant', rating: 4.6, distance: '2.5km' },
    { id: 's5', name: 'Gadget World', type: 'Electronics', rating: 4.0, distance: '300m' },
    { id: 's6', name: 'Comfy Homes', type: 'Furniture', rating: 4.3, distance: '1.5km' },
];
