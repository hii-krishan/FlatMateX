const mockUser = {
  id: "user-1",
  name: "Alex",
  email: "alex@flatmate.com",
  role: "owner",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
};

const mockFlatmates = [
  {
    id: "user-2",
    name: "Ben Sharma",
    email: "ben@flatmate.com",
    role: "member",
    status: "Active",
    joinedAt: "2024-01-10",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ben"
  },
  {
    id: "user-3",
    name: "Chloe Deshmukh",
    email: "chloe@flatmate.com",
    role: "member",
    status: "Active",
    joinedAt: "2024-01-15",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe"
  },
  {
    id: "user-4",
    name: "Dev Patel",
    email: "dev@flatmate.com",
    role: "member",
    status: "Active",
    joinedAt: "2024-02-01",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev"
  }
];

const mockGroupInfo = {
  id: "group-402",
  name: "Flat 402 - The Homies 🏠",
  code: "FLAT402X",
  description: "Official WhatsApp group for Flat 402. Track monthly rent, shared bills, house chores & parties. Rent due on 1st of every month!",
  createdAt: "2024-01-01T00:00:00.000Z",
  ownerId: "user-1"
};

const mockGroupMessages = [
  {
    id: "msg-1",
    senderId: "user-1",
    senderName: "Alex",
    text: "Hey everyone! Welcome to our FlatMateX group. All our shared expenses, bills, and grocery lists will be synced here.",
    timestamp: "10:00 AM",
    type: "system"
  },
  {
    id: "msg-2",
    senderId: "user-2",
    senderName: "Ben Sharma",
    text: "I paid the electricity bill for this month (₹1,600). Added it into the expense tracker!",
    timestamp: "11:15 AM",
    type: "chat"
  },
  {
    id: "msg-3",
    senderId: "user-3",
    senderName: "Chloe Deshmukh",
    text: "Awesome, I bought weekly groceries and snacks from supermarket. It came out to ₹2,400.",
    timestamp: "01:30 PM",
    type: "chat"
  },
  {
    id: "msg-4",
    senderId: "user-4",
    senderName: "Dev Patel",
    text: "Recharged the 300Mbps high-speed fiber WiFi today (₹999). Check Splitwise tab for who owes whom!",
    timestamp: "03:45 PM",
    type: "chat"
  }
];

const mockExpenses = [
  {
    id: "exp-1",
    name: "Monthly Flat Rent",
    amount: 16000,
    category: "Rent",
    date: "2024-07-01",
    paidBy: "Alex",
    flatmateId: "user-1",
    split: [
      { name: "Alex", email: "alex@flatmate.com", share: 4000 },
      { name: "Ben Sharma", email: "ben@flatmate.com", share: 4000 },
      { name: "Chloe Deshmukh", email: "chloe@flatmate.com", share: 4000 },
      { name: "Dev Patel", email: "dev@flatmate.com", share: 4000 }
    ]
  },
  {
    id: "exp-2",
    name: "Electricity Bill (AC + Geyser)",
    amount: 1600,
    category: "Bills",
    date: "2024-07-05",
    paidBy: "Ben Sharma",
    flatmateId: "user-2",
    split: [
      { name: "Alex", email: "alex@flatmate.com", share: 400 },
      { name: "Ben Sharma", email: "ben@flatmate.com", share: 400 },
      { name: "Chloe Deshmukh", email: "chloe@flatmate.com", share: 400 },
      { name: "Dev Patel", email: "dev@flatmate.com", share: 400 }
    ]
  },
  {
    id: "exp-3",
    name: "Supermarket Weekly Groceries",
    amount: 2400,
    category: "Groceries",
    date: "2024-07-08",
    paidBy: "Chloe Deshmukh",
    flatmateId: "user-3",
    split: [
      { name: "Alex", email: "alex@flatmate.com", share: 600 },
      { name: "Ben Sharma", email: "ben@flatmate.com", share: 600 },
      { name: "Chloe Deshmukh", email: "chloe@flatmate.com", share: 600 },
      { name: "Dev Patel", email: "dev@flatmate.com", share: 600 }
    ]
  },
  {
    id: "exp-4",
    name: "Weekend Pizza & Coke Feast",
    amount: 1200,
    category: "Food",
    date: "2024-07-10",
    paidBy: "Alex",
    flatmateId: "user-1",
    split: [
      { name: "Alex", email: "alex@flatmate.com", share: 300 },
      { name: "Ben Sharma", email: "ben@flatmate.com", share: 300 },
      { name: "Chloe Deshmukh", email: "chloe@flatmate.com", share: 300 },
      { name: "Dev Patel", email: "dev@flatmate.com", share: 300 }
    ]
  },
  {
    id: "exp-5",
    name: "High-Speed Fiber WiFi",
    amount: 999,
    category: "Bills",
    date: "2024-07-12",
    paidBy: "Dev Patel",
    flatmateId: "user-4",
    split: [
      { name: "Alex", email: "alex@flatmate.com", share: 249.75 },
      { name: "Ben Sharma", email: "ben@flatmate.com", share: 249.75 },
      { name: "Chloe Deshmukh", email: "chloe@flatmate.com", share: 249.75 },
      { name: "Dev Patel", email: "dev@flatmate.com", share: 249.75 }
    ]
  }
];

const mockNotes = [
  { id: "n1", content: "Pay electricity bill by Friday!", color: "bg-yellow-200", author: "Alex", createdAt: new Date("2024-07-22T10:00:00Z"), authorId: "user-1" },
  { id: "n2", content: "Weekend movie plan: Anyone up for a horror movie?", color: "bg-green-200", author: "Ben", createdAt: new Date("2024-07-21T14:30:00Z"), authorId: "user-2" },
  { id: "n3", content: "Remember to buy groceries for the party.", color: "bg-blue-200", author: "Chloe", createdAt: new Date("2024-07-20T09:00:00Z"), authorId: "user-3" }
];

const mockTasks = [
  { id: "1", title: "Submit Physics Assignment", completed: false, dueDate: "2024-07-25", flatmateId: "user-1" },
  { id: "2", title: "Prepare for Chemistry Mid-term", completed: false, dueDate: "2024-07-28", flatmateId: "user-1" },
  { id: "3", title: "Buy new notebook", completed: true, dueDate: "2024-07-20", flatmateId: "user-1" },
  { id: "4", title: "Group study session for Math", completed: false, dueDate: "2024-07-26", flatmateId: "user-1" }
];

const mockTimetable = [
  { id: "c1", name: "Data Structures", time: "09:00 - 10:00", day: "Monday", flatmateId: "user-1" },
  { id: "c2", name: "Algorithms", time: "10:00 - 11:00", day: "Monday", flatmateId: "user-1" },
  { id: "c3", name: "Database Systems", time: "09:00 - 10:00", day: "Tuesday", flatmateId: "user-1" },
  { id: "c4", name: "Operating Systems", time: "10:00 - 11:00", day: "Wednesday", flatmateId: "user-1" },
  { id: "c5", name: "Computer Networks", time: "11:00 - 12:00", day: "Thursday", flatmateId: "user-1" },
  { id: "c6", name: "Lab Session", time: "14:00 - 16:00", day: "Friday", flatmateId: "user-1" }
];

const mockGroceryList = [
  { id: "g1", name: "Milk", quantity: 2, purchased: false, flatmateId: "user-1" },
  { id: "g2", name: "Bread", quantity: 1, purchased: true, flatmateId: "user-2" },
  { id: "g3", name: "Eggs", quantity: 12, purchased: false, flatmateId: "user-3" },
  { id: "g4", name: "Coffee", quantity: 1, purchased: false, flatmateId: "user-1" }
];

const mockChores = [
  { id: "ch1", name: "Clean Kitchen", assignedTo: "Alex", completed: false, flatmateId: "user-1" },
  { id: "ch2", name: "Take out trash", assignedTo: "Ben", completed: true, flatmateId: "user-2" },
  { id: "ch3", name: "Water plants", assignedTo: "Chloe", completed: false, flatmateId: "user-3" },
  { id: "ch4", name: "Clean Bathroom", assignedTo: "Unassigned", completed: false, flatmateId: "user-1" }
];

const formatMockDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const generateRollingMockMoodData = () => {
  const now = new Date();
  const sampleMoods = [
    { offset: 6, mood: "Calm", sleepHours: 7.5, productivity: "Medium" },
    { offset: 5, mood: "Happy", sleepHours: 8.0, productivity: "High" },
    { offset: 4, mood: "Stressed", sleepHours: 6.0, productivity: "Medium" },
    { offset: 3, mood: "Productive", sleepHours: 8.5, productivity: "High" },
    { offset: 2, mood: "Calm", sleepHours: 7.0, productivity: "Medium" },
    { offset: 1, mood: "Happy", sleepHours: 7.5, productivity: "High" },
    { offset: 0, mood: "Productive", sleepHours: 8.0, productivity: "High" }
  ];

  return sampleMoods.map((item, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() - item.offset);
    return {
      id: `m${idx + 1}`,
      date: formatMockDate(d),
      day: d.toLocaleDateString("en-US", { weekday: "long" }),
      mood: item.mood,
      sleepHours: item.sleepHours,
      productivity: item.productivity,
      flatmateId: "user-1"
    };
  });
};

const mockMoodData = generateRollingMockMoodData();

const mockEvents = [
  { id: "e1", title: "Project Zenith Presentation", date: "2024-08-05", type: "College Fest", flatmateId: "user-1" },
  { id: "e2", title: "Alex's Birthday Bash", date: "2024-08-15", type: "Birthday", flatmateId: "user-2" },
  { id: "e3", title: "Movie Marathon: Sci-Fi Classics", date: "2024-07-27", type: "Movie Night", flatmateId: "user-3" }
];

const mockServicesData = [
  { id: "s1", name: "Tasty Meals Tiffin", type: "Tiffin", rating: 4.5, distance: "500m" },
  { id: "s2", name: "QuickWash Laundry", type: "Laundry", rating: 4.2, distance: "1.2km" },
  { id: "s3", name: "Daily Needs Grocery", type: "Grocery Store", rating: 4.8, distance: "800m" },
  { id: "s4", name: "The Food Hub", type: "Restaurant", rating: 4.6, distance: "2.5km" },
  { id: "s5", name: "Gadget World", type: "Electronics", rating: 4, distance: "300m" },
  { id: "s6", name: "Comfy Homes", type: "Furniture", rating: 4.3, distance: "1.5km" }
];

export {
  mockChores,
  mockEvents,
  mockExpenses,
  mockFlatmates,
  mockGroceryList,
  mockGroupInfo,
  mockGroupMessages,
  mockMoodData,
  mockNotes,
  mockServicesData,
  mockTasks,
  mockTimetable,
  mockUser
};
