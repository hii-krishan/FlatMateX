"use client";
import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Trash2,
  Wallet,
  Users,
  Receipt,
  PieChart as PieIcon,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  TrendingDown
} from "lucide-react";
import { useData } from "@/context/data-context";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(215 70% 45%)",
  "hsl(45 90% 45%)"
];

export function ExpenseManager() {
  const { expenses, addExpense, deleteExpense, user, flatmates, allMembers } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("group");
  const [allFilter, setAllFilter] = useState("all"); // "all" | "group" | "individual" | "settlement"

  const membersList = allMembers && allMembers.length > 0 ? allMembers : [user, ...flatmates];

  // Helper to match user identifier (name, email, or id)
  const isCurrentUser = (identifier) => {
    if (!identifier) return false;
    const str = String(identifier).toLowerCase().trim();
    const myName = (user?.name || "").toLowerCase().trim();
    const myEmail = (user?.email || "").toLowerCase().trim();
    const myId = (user?.id || "").toLowerCase().trim();

    // Check allMembers for current user alias/name
    const currentMember = allMembers?.find(
      (m) =>
        m.isCurrentUser ||
        m.id === user?.id ||
        (user?.email && m.email?.toLowerCase() === user.email.toLowerCase())
    );
    const memberName = (currentMember?.name || "").toLowerCase().trim();
    const memberEmail = (currentMember?.email || "").toLowerCase().trim();
    const memberId = (currentMember?.id || "").toLowerCase().trim();

    return (
      str === myName ||
      str === myEmail ||
      str === myId ||
      (memberName && str === memberName) ||
      (memberEmail && str === memberEmail) ||
      (memberId && str === memberId) ||
      (myName && (str.includes(myName) || myName.includes(str))) ||
      (memberName && (str.includes(memberName) || memberName.includes(str)))
    );
  };

  const groupExpenses = useMemo(() => {
    return expenses.filter(
      (e) =>
        !e.isPersonal &&
        e.splitOption !== "no" &&
        !e.isSettlement &&
        e.category !== "Settlement" &&
        !e.name?.toLowerCase().startsWith("settlement:")
    );
  }, [expenses]);

  const totalGroupExpense = useMemo(() => {
    return groupExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [groupExpenses]);

  const groupDataByCategory = useMemo(() => {
    const map = new Map();
    groupExpenses.forEach((expense) => {
      const cat = expense.category || "Other";
      const amt = Number(expense.amount) || 0;
      map.set(cat, (map.get(cat) || 0) + amt);
    });

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [groupExpenses]);

  const perPersonAverage = membersList.length > 0
    ? (totalGroupExpense / membersList.length).toFixed(0)
    : totalGroupExpense;

  const individualTransactions = useMemo(() => {
    return expenses
      .map((e) => {
        const isSettlement = e.category === "Settlement" || e.isSettlement || e.name?.toLowerCase().startsWith("settlement:");
        const amt = Number(e.amount) || 0;

        if (isSettlement) {
          const payerName = e.payerName || e.paidBy || (e.name?.includes(" paid ") ? e.name.replace(/^Settlement:\s*/i, "").split(" paid ")[0]?.trim() : "");
          const receiverName = e.receivedBy || (e.split?.[0]?.name) || (e.name?.includes(" paid ") ? e.name.split(" paid ")[1]?.trim() : "");

          const isPayer =
            isCurrentUser(payerName) ||
            isCurrentUser(e.paidBy) ||
            isCurrentUser(e.flatmateId) ||
            isCurrentUser(e.payerId) ||
            isCurrentUser(e.user_id);

          const isReceiver =
            isCurrentUser(receiverName) ||
            isCurrentUser(e.receivedBy) ||
            isCurrentUser(e.receiverId) ||
            (e.split || []).some((s) => isCurrentUser(s.name) || isCurrentUser(s.email) || isCurrentUser(s.id));

          if (isPayer && !isReceiver) {
            // User paid a settlement to a flatmate -> DEBITED from user (Counts in My Expenses!)
            return {
              ...e,
              isRelevant: true,
              flowType: "settlement_paid",
              isDebited: true,
              isIncoming: false,
              displayAmount: amt,
              expenseImpact: amt, // Debited money is counted as expense!
              flowLabel: "Settlement Paid (Debited)",
              counterparty: receiverName || "Flatmate",
              noteText: `Paid ₹${amt.toLocaleString()} to ${receiverName || "flatmate"}`
            };
          } else if (isReceiver) {
            // A flatmate paid the user -> MONEY IS COMING IN!
            // Excluded from expense impact (₹0)
            return {
              ...e,
              isRelevant: true,
              flowType: "settlement_received",
              isDebited: false,
              isIncoming: true,
              displayAmount: amt,
              expenseImpact: 0, // EXCLUDED FROM EXPENSE!
              flowLabel: "Money Coming In (Credit)",
              counterparty: payerName || "Flatmate",
              noteText: `Received ₹${amt.toLocaleString()} from ${payerName || "flatmate"} (Credit)`
            };
          }
          return { ...e, isRelevant: false };
        }

        // Regular Purchases & Bills
        const isPayer = isCurrentUser(e.paidBy) || isCurrentUser(e.flatmateId) || isCurrentUser(e.user_id);
        if (isPayer) {
          // User paid the bill -> Money debited from user
          return {
            ...e,
            isRelevant: true,
            flowType: e.isPersonal ? "personal_expense" : "shared_expense_paid",
            isDebited: true,
            isIncoming: false,
            displayAmount: amt,
            expenseImpact: amt,
            flowLabel: e.isPersonal ? "Personal Purchase (Debited)" : "Shared Bill Paid (Debited)",
            counterparty: e.isPersonal ? "Self" : `${(e.split || []).length || membersList.length} flatmates`,
            noteText: e.isPersonal ? "Personal expense" : "Paid full bill for flat"
          };
        }

        // User didn't pay, but has a split share in a shared bill
        const mySplitShare = (e.split || []).find((s) => isCurrentUser(s.name) || isCurrentUser(s.email));
        if (mySplitShare) {
          const shareAmt = Number(mySplitShare.share || mySplitShare.amount) || 0;
          return {
            ...e,
            isRelevant: true,
            flowType: "split_share",
            isDebited: true,
            isIncoming: false,
            displayAmount: shareAmt,
            expenseImpact: shareAmt,
            flowLabel: "Your Split Share (Debited)",
            counterparty: e.paidBy || "Flatmate",
            noteText: `Your share of ${e.paidBy}'s payment`
          };
        }

        return { ...e, isRelevant: false };
      })
      .filter((t) => t.isRelevant);
  }, [expenses, user, membersList, allMembers]);

  // Total debited money for user (ONLY debited money counts as expense!)
  const myTotalDebitedExpense = useMemo(() => {
    return individualTransactions
      .filter((t) => t.isDebited)
      .reduce((sum, t) => sum + (t.expenseImpact || 0), 0);
  }, [individualTransactions]);

  // Total incoming money received (Settlements coming in - NOT taken as expense!)
  const myTotalIncomingMoney = useMemo(() => {
    return individualTransactions
      .filter((t) => t.isIncoming)
      .reduce((sum, t) => sum + (t.displayAmount || 0), 0);
  }, [individualTransactions]);

  const myNetCashflow = myTotalDebitedExpense - myTotalIncomingMoney;

  const filteredAllTransactions = useMemo(() => {
    if (allFilter === "group") {
      return groupExpenses;
    }
    if (allFilter === "settlement") {
      return expenses.filter((e) => e.category === "Settlement" || e.isSettlement || e.name?.toLowerCase().startsWith("settlement:"));
    }
    if (allFilter === "individual") {
      return expenses.filter((e) => {
        const isSettlement = e.category === "Settlement" || e.isSettlement || e.name?.toLowerCase().startsWith("settlement:");
        const payerName = e.payerName || e.paidBy || (e.name?.includes(" paid ") ? e.name.replace(/^Settlement:\s*/i, "").split(" paid ")[0]?.trim() : "");
        const receiverName = e.receivedBy || (e.split?.[0]?.name) || (e.name?.includes(" paid ") ? e.name.split(" paid ")[1]?.trim() : "");
        const isPayer = isCurrentUser(payerName) || isCurrentUser(e.paidBy) || isCurrentUser(e.payerId) || isCurrentUser(e.user_id);
        const isReceiver = isCurrentUser(receiverName) || isCurrentUser(e.receivedBy) || (e.split || []).some((s) => isCurrentUser(s.name) || isCurrentUser(s.email));
        return e.isPersonal || (isSettlement && (isPayer || isReceiver)) || isPayer;
      });
    }
    return expenses;
  }, [expenses, allFilter, user, allMembers]);

  // Add Expense submission handler
  const handleAddExpense = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get("amount")) || 0;
    const name = formData.get("name");
    const category = formData.get("category");
    const splitOption = formData.get("split");
    const isPersonal = splitOption === "no";

    const split = !isPersonal
      ? flatmates.map((flatmate) => ({
          name: flatmate.name,
          email: flatmate.email,
          share: parseFloat(formData.get(`share-${flatmate.id}`)) || (amount / (flatmates.length + 1))
        }))
      : [];

    addExpense({
      name,
      amount,
      category,
      paidBy: user.name,
      isPersonal,
      splitOption,
      split
    });

    setIsDialogOpen(false);
    e.currentTarget.reset();
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-3 h-11 p-1 bg-muted/60 rounded-xl">
            <TabsTrigger value="group" className="rounded-lg gap-2 font-semibold text-xs sm:text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span>Group Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="individual" className="rounded-lg gap-2 font-semibold text-xs sm:text-sm">
              <Wallet className="h-4 w-4 text-primary" />
              <span>My Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="rounded-lg gap-2 font-semibold text-xs sm:text-sm">
              <Receipt className="h-4 w-4 text-primary" />
              <span>All History</span>
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={() => setIsDialogOpen(true)}
            className="rounded-xl font-semibold gap-2 shadow-md shadow-primary/20 shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add New Expense</span>
          </Button>
        </div>

        <TabsContent value="group" className="space-y-6 mt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-2xl border-primary/20 bg-card/60 backdrop-blur shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Shared Expenses
                  </CardDescription>
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl font-bold font-mono text-primary">
                  ₹{totalGroupExpense.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Shared flat purchases (excl. settlements)
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-primary/20 bg-card/60 backdrop-blur shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Avg per Flatmate
                  </CardDescription>
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl font-bold font-mono text-foreground">
                  ₹{Number(perPersonAverage).toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Equal share across {membersList.length} roommates
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-primary/20 bg-card/60 backdrop-blur shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Shared Purchases
                  </CardDescription>
                  <Receipt className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl font-bold font-mono text-foreground">
                  {groupExpenses.length} entries
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Active shared group purchases
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-primary/20 bg-card/60 backdrop-blur shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Active Categories
                  </CardDescription>
                  <PieIcon className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl font-bold font-mono text-foreground">
                  {groupDataByCategory.length} categories
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Spread across flat living costs
              </CardContent>
            </Card>
          </div>

          {/* SPENDING OVERVIEW (FULL-WIDTH, ZERO DEAD MARGINS) */}
          <Card className="w-full rounded-2xl border-primary/20 shadow-sm overflow-hidden">
            <CardHeader className="border-b pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="font-headline text-xl font-bold flex items-center gap-2">
                    <PieIcon className="h-5 w-5 text-primary" />
                    Spending Overview & Category Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of shared apartment costs. Debt settlements are kept strictly separate.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="border border-primary/20 text-primary font-mono text-xs self-start sm:self-auto">
                  {groupDataByCategory.length} Active Categories
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {groupExpenses.length === 0 ? (
                <div className="h-64 w-full flex flex-col items-center justify-center text-muted-foreground italic gap-2">
                  <Wallet className="h-10 w-10 text-muted-foreground/30" />
                  <p>No shared flat expenses recorded yet. Click "Add New Expense" to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Donut Chart with Centered Total (lg:col-span-5) */}
                  <div className="lg:col-span-5 h-72 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={groupDataByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={75}
                          outerRadius={115}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {groupDataByCategory.map((entry, index) => (
                            <Cell
                              key={`group-cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              className="transition-all hover:opacity-85"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Amount"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Total Group Spend
                      </span>
                      <span className="font-headline text-xl sm:text-2xl font-extrabold text-foreground font-mono">
                        ₹{totalGroupExpense.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {groupExpenses.length} Shared Bills
                      </span>
                    </div>
                  </div>

                  {/* 2-Column Responsive Grid of Category Cards (lg:col-span-7) */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Category Breakdown
                      </span>
                      <span className="text-xs text-muted-foreground">Per Flatmate Share</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {groupDataByCategory.map((item, index) => {
                        const percent = totalGroupExpense > 0 ? Math.round((item.value / totalGroupExpense) * 100) : 0;
                        const color = COLORS[index % COLORS.length];
                        const perPerson = membersList.length > 0 ? (item.value / membersList.length).toFixed(0) : item.value;

                        return (
                          <div
                            key={item.name}
                            className="rounded-xl border bg-card/60 p-3.5 space-y-2.5 transition-all hover:bg-muted/40 hover:shadow-xs"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="h-3 w-3 rounded-full shrink-0 ring-2 ring-background"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="font-bold text-foreground truncate">{item.name}</span>
                              </div>
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-mono">
                                {percent}%
                              </Badge>
                            </div>

                            <div className="flex items-baseline justify-between text-xs">
                              <span className="font-mono text-base font-extrabold text-foreground">
                                ₹{item.value.toLocaleString()}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                ≈ ₹{Number(perPerson).toLocaleString()} / person
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${percent}%`, backgroundColor: color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GROUP EXPENSE TABLE */}
          <Card className="rounded-2xl border-primary/20 shadow-sm">
            <CardHeader className="border-b pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="font-headline text-xl font-bold">Group Expense History</CardTitle>
                  <CardDescription>
                    All shared purchases split among roommates (No settlements).
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="border border-primary/20 text-primary text-xs font-semibold self-start sm:self-auto">
                  {groupExpenses.length} Shared Purchases
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Paid By</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="w-[50px] text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">
                        No shared group expenses recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    groupExpenses.map((expense) => {
                      return (
                        <TableRow key={expense.id} className="hover:bg-muted/40">
                          <TableCell className="font-semibold">
                            <span>{expense.name}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {expense.category || "General"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-xs font-medium">{expense.paidBy || user.name}</TableCell>
                          <TableCell className="text-right font-mono font-bold text-foreground">
                            ₹{Number(expense.amount).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                              onClick={() => deleteExpense(expense.id)}
                              title="Delete expense"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-6 mt-0">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Card 1: Debited Outflows (Actual Expenses) */}
            <Card className="rounded-2xl border-primary/20 bg-card/60 backdrop-blur shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    My Debited Expenses
                  </CardDescription>
                  <ArrowUpRight className="h-4 w-4 text-destructive" />
                </div>
                <CardTitle className="font-headline text-2xl font-bold font-mono text-foreground">
                  ₹{myTotalDebitedExpense.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <p>Purchases paid by you + debt settlements paid out to flatmates.</p>
                <Badge variant="outline" className="mt-2 text-[10px] text-destructive border-destructive/30">
                  Counted as Expense (Debited)
                </Badge>
              </CardContent>
            </Card>

            {/* Card 2: Money Coming In (Credited - NOT AN EXPENSE) */}
            <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Incoming Money Received
                  </CardDescription>
                  <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="font-headline text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  +₹{myTotalIncomingMoney.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <p>Settlements received from roommates. Credited to you.</p>
                <Badge className="mt-2 text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                  Credit • Excluded from Expense (₹0)
                </Badge>
              </CardContent>
            </Card>

            {/* Card 3: Net Cashflow Out-of-Pocket */}
            <Card className="rounded-2xl border-primary/20 bg-card/60 backdrop-blur shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Net Cash Outflow
                  </CardDescription>
                  <TrendingDown className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl font-bold font-mono">
                  {myNetCashflow >= 0 ? `₹${myNetCashflow.toLocaleString()}` : `-₹${Math.abs(myNetCashflow).toLocaleString()}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <p>Debited expenses minus incoming settlements received.</p>
                <Badge variant="secondary" className="mt-2 text-[10px]">
                  Net Out-of-Pocket
                </Badge>
              </CardContent>
            </Card>
          </div>


          {/* INDIVIDUAL TRANSACTIONS TABLE */}
          <Card className="rounded-2xl border-primary/20 shadow-sm">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-headline text-xl font-bold">Individual Ledger</CardTitle>
                  <CardDescription>
                    All debited transactions and incoming settlement credits for {user.name || "you"}.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {individualTransactions.length} Transactions
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Type / Direction</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Counterparty</TableHead>
                    <TableHead className="text-right">Cashflow</TableHead>
                    <TableHead className="text-right">Expense Impact</TableHead>
                    <TableHead className="w-[50px] text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {individualTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground italic">
                        No individual transactions or settlements recorded for you yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    individualTransactions.map((tx) => (
                      <TableRow
                        key={tx.id}
                        className={tx.isIncoming ? "bg-emerald-500/5 hover:bg-emerald-500/10" : "hover:bg-muted/40"}
                      >
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="font-semibold text-sm">{tx.name}</p>
                            <p className="text-[11px] text-muted-foreground">{tx.noteText}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {tx.isIncoming ? (
                            <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px] gap-1">
                              <ArrowDownLeft className="h-3 w-3" /> Incoming Credit
                            </Badge>
                          ) : tx.flowType === "settlement_paid" ? (
                            <Badge variant="outline" className="text-destructive border-destructive/30 text-[11px] gap-1">
                              <ArrowUpRight className="h-3 w-3" /> Settlement Paid
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[11px]">
                              {tx.category || "Expense"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(tx.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs font-medium">{tx.counterparty}</TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {tx.isIncoming ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              +₹{Number(tx.displayAmount).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-foreground">
                              -₹{Number(tx.displayAmount).toFixed(2)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {tx.isIncoming ? (
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              ₹0 (Credit - Not Expense)
                            </span>
                          ) : (
                            <span className="font-mono font-bold text-destructive">
                              ₹{Number(tx.expenseImpact).toFixed(2)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                            onClick={() => deleteExpense(tx.id)}
                            title="Delete transaction"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4 mt-0">
          <Card className="rounded-2xl border-primary/20 shadow-sm">
            <CardHeader className="border-b pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="font-headline text-xl font-bold">Master Transaction History</CardTitle>
                  <CardDescription>
                    Complete log of shared purchases, personal expenses, and peer-to-peer settlements.
                  </CardDescription>
                </div>
                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 bg-muted/50 p-1 rounded-xl">
                  <Button
                    size="sm"
                    variant={allFilter === "all" ? "default" : "ghost"}
                    className="h-7 text-xs rounded-lg px-2.5"
                    onClick={() => setAllFilter("all")}
                  >
                    All ({expenses.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={allFilter === "group" ? "default" : "ghost"}
                    className="h-7 text-xs rounded-lg px-2.5"
                    onClick={() => setAllFilter("group")}
                  >
                    Group Only ({groupExpenses.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={allFilter === "settlement" ? "default" : "ghost"}
                    className="h-7 text-xs rounded-lg px-2.5"
                    onClick={() => setAllFilter("settlement")}
                  >
                    Settlements ({expenses.filter((e) => e.category === "Settlement" || e.isSettlement).length})
                  </Button>
                  <Button
                    size="sm"
                    variant={allFilter === "individual" ? "default" : "ghost"}
                    className="h-7 text-xs rounded-lg px-2.5"
                    onClick={() => setAllFilter("individual")}
                  >
                    My Transactions ({individualTransactions.length})
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category / Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Paid By</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[50px] text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAllTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground italic">
                        No transactions found for this filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAllTransactions.map((expense) => {
                      const isSettlement = expense.category === "Settlement" || expense.isSettlement;
                      return (
                        <TableRow key={expense.id} className="hover:bg-muted/40">
                          <TableCell className="font-semibold">{expense.name}</TableCell>
                          <TableCell>
                            {isSettlement ? (
                              <Badge variant="outline" className="text-primary border-primary/30 text-xs font-semibold">
                                Settlement
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                {expense.category || "General"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-xs font-medium">{expense.paidBy || user.name}</TableCell>
                          <TableCell>
                            {isSettlement ? (
                              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
                                Peer Settlement
                              </Badge>
                            ) : expense.isPersonal ? (
                              <Badge variant="outline" className="text-[10px]">
                                Personal
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">
                                Group Shared
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-foreground">
                            ₹{Number(expense.amount).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                              onClick={() => deleteExpense(expense.id)}
                              title="Delete transaction"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG: ADD NEW EXPENSE */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">Add a New Expense</DialogTitle>
            <DialogDescription>
              Record an expense paid by you or split with your flatmates.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddExpense} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Expense Name *</Label>
              <Input id="name" name="name" placeholder="e.g. WiFi Bill, Groceries, Pizza..." required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-xs">Amount (₹) *</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="1" placeholder="e.g. 1500" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs">Category *</Label>
              <Select name="category" defaultValue="Food" required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food">Food & Dining</SelectItem>
                  <SelectItem value="Groceries">Groceries</SelectItem>
                  <SelectItem value="Bills">Bills & Utilities</SelectItem>
                  <SelectItem value="Rent">Rent & Maintenance</SelectItem>
                  <SelectItem value="Household">Household Supplies</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 rounded-xl border bg-muted/30 p-3 text-xs">
              <Label className="text-xs font-semibold">Expense Scope</Label>
              <Select name="split" defaultValue="yes">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Shared Group Expense (Split with flatmates)</SelectItem>
                  <SelectItem value="no">Personal Expense (My Individual Expense only)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Shared group expenses update group balances in the Flatmate Group tab. Personal expenses remain strictly in your individual ledger.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-semibold">
                Add Expense
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
