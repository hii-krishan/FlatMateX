export type Expense = {
  id: string;
  name: string;
  amount: number;
  category: 'Rent' | 'Bills' | 'Groceries' | 'Food' | 'Other';
  date: string;
  paidBy: string;
};

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
};

export type Class = {
    id: string;
    name: string;
    time: string;
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
};

export type GroceryItem = {
  id: string;
  name: string;
  quantity: number;
  purchased: boolean;
};

export type Chore = {
    id: string;
    name: string;
    assignedTo: string;
    completed: boolean;
};

export type MoodEntry = {
  date: string;
  mood: 'Happy' | 'Stressed' | 'Sad' | 'Calm' | 'Productive';
  sleepHours: number;
  productivity: 'High' | 'Medium' | 'Low';
};

export type Event = {
  id: string;
  title: string;
  date: string;
  type: 'Movie Night' | 'Birthday' | 'College Fest' | 'Outing';
};

export type Poll = {
  id: string;
  question: string;
  options: { text: string; votes: number }[];
};

export type Service = {
  id: string;
  name: string;
  type: 'Tiffin' | 'Laundry' | 'Stationery' | 'Hospital' | 'ATM';
  rating: number;
  distance: string;
};
