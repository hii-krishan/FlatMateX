

export type UserProfile = {
  id?: string;
  name: string;
};

export type Expense = {
  id?: string;
  name: string;
  amount: number;
  category: 'Rent' | 'Bills' | 'Groceries' | 'Food' | 'Other';
  date: string;
  paidBy: string;
  flatmateId?: string;
};

export type Task = {
  id?: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  flatmateId?: string;
};

export type Class = {
    id?: string;
    name: string;
    time: string;
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    flatmateId?: string;
};

export type GroceryItem = {
  id?: string;
  name: string;
  quantity: number;
  purchased: boolean;
  flatmateId?: string;
};

export type Chore = {
    id?: string;
    name: string;
    assignedTo: string;
    completed: boolean;
    flatmateId?: string;
};

export type MoodEntry = {
  id?: string;
  date: string;
  mood: 'Happy' | 'Stressed' | 'Sad' | 'Calm' | 'Productive';
  sleepHours: number;
  productivity: 'High' | 'Medium' | 'Low';
  flatmateId?: string;
};

export type Event = {
  id?: string;
  title: string;
  date: string;
  type: 'Movie Night' | 'Birthday' | 'College Fest' | 'Outing';
  flatmateId?: string;
};

export type PollOption = { 
  text: string; 
  votes: number;
  voters: string[];
};

export type Poll = {
  id?: string;
  question: string;
  options: PollOption[];
  flatmateId?: string;
};

export type Service = {
  id?: string;
  name: string;
  type: 'Tiffin' | 'Laundry' | 'Grocery Store' | 'Restaurant' | 'Electronics' | 'Furniture';
  rating: number;
  distance: string;
};

export type Note = {
  id?: string;
  content: string;
  color: string;
  createdAt: any; // Allow Date or serverTimestamp
  author: string;
  authorId?: string;
};
