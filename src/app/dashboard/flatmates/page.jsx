import { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  LogOut,
  Share2,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  CreditCard,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Pencil,
  Trash2,
  Mail,
  Scale
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/context/data-context";
import {
  calculateNetBalances,
  simplifyDebts,
  getPairwiseMatrix
} from "@/lib/splitwise";

export default function FlatmatesPage() {
  const {
    user,
    flatmates,
    allMembers,
    groupInfo,
    updateGroupInfo,
    expenses,
    addFlatmate,
    removeFlatmate,
    leaveGroup,
    groupMessages,
    sendGroupMessage,
    recordSettlement,
    createGroupLink,
    acceptInvitation,
    remote,
    supabaseConnectionError
  } = useData();

  const [activeTab, setActiveTab] = useState("debts");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [generatingLink, setGeneratingLink] = useState(false);

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isLeaveGroupOpen, setIsLeaveGroupOpen] = useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);

  const [settlePayer, setSettlePayer] = useState("");
  const [settleReceiver, setSettleReceiver] = useState("");
  const [settleAmount, setSettleAmount] = useState("");
  const [settleMethod, setSettleMethod] = useState("UPI");
  const [settleNote, setSettleNote] = useState("");

  // Edit Group Form State
  const [editGroupName, setEditGroupName] = useState(groupInfo?.name || "Flat 402 - The Homies 🏠");
  const [editGroupDesc, setEditGroupDesc] = useState(groupInfo?.description || "");

  // Add Member Form State
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("member");

  // Invite Token in URL (if someone clicked a shared invite link)
  const token = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("invite") : null;
  const [acceptingInvite, setAcceptingInvite] = useState(false);

  // --- Splitwise Debt Calculations ---
  const netBalances = useMemo(() => {
    return calculateNetBalances(allMembers, expenses);
  }, [allMembers, expenses]);

  const simplifiedTransactions = useMemo(() => {
    return simplifyDebts(netBalances);
  }, [netBalances]);

  const pairwiseMatrix = useMemo(() => {
    return getPairwiseMatrix(allMembers, expenses);
  }, [allMembers, expenses]);

  // Current user's personal balance
  const currentUserBalanceObj = useMemo(() => {
    return netBalances.find((b) => b.member.isCurrentUser || b.member.id === user.id || b.member.name === user.name);
  }, [netBalances, user]);

  const currentUserNet = currentUserBalanceObj?.balance || 0;

  // Filtered members list
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return allMembers;
    const q = searchQuery.toLowerCase();
    return allMembers.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q)
    );
  }, [allMembers, searchQuery]);

  // Total shared group expenses (strictly excluding settlements and personal expenses)
  const sharedGroupExpenses = useMemo(() => {
    return expenses.filter((e) => e.category !== "Settlement" && !e.isSettlement && !e.isPersonal);
  }, [expenses]);

  const totalGroupExpense = useMemo(() => {
    return sharedGroupExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [sharedGroupExpenses]);

  // Settlement transactions history
  const settlementHistory = useMemo(() => {
    return expenses
      .filter((e) => e.category === "Settlement" || e.isSettlement || e.name?.toLowerCase().startsWith("settlement:"))
      .sort((a, b) => new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0));
  }, [expenses]);

  // Handle Join Invite
  const handleAcceptInvite = async () => {
    setAcceptingInvite(true);
    await acceptInvitation(token);
    setAcceptingInvite(false);
  };

  // Generate Group Invite Link
  const handleGenerateLink = async () => {
    setGeneratingLink(true);
    const res = await createGroupLink();
    if (res.ok) {
      setInviteUrl(res.link);
    } else {
      const fallback = `${window.location.origin}/dashboard/flatmates?invite=${groupInfo?.code || "FLAT402X"}`;
      setInviteUrl(fallback);
    }
    setGeneratingLink(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getWhatsAppShareUrl = (linkUrl) => {
    const text = `Hey! Join our flatmate group "${groupInfo?.name || "FlatMateX"}" to split bills and track expenses: ${linkUrl || window.location.href}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const openSettleDialog = (fromPerson, toPerson, defaultAmount) => {
    const currentMember = allMembers.find((m) => m.isCurrentUser) || user;
    setSettlePayer(fromPerson?.name || currentMember?.name || user?.name || "");
    setSettleReceiver(toPerson?.name || "");
    setSettleAmount(defaultAmount ? String(defaultAmount) : "");
    setSettleMethod("UPI");
    setSettleNote("");
    setIsSettleUpOpen(true);
  };

  const handleSettleSubmit = async (e) => {
    e.preventDefault();
    if (!settlePayer || !settleReceiver || !settleAmount) {
      toast({
        title: "Missing details",
        description: "Please select both flatmates and enter the payment amount.",
        variant: "destructive"
      });
      return;
    }
    if (settlePayer.trim().toLowerCase() === settleReceiver.trim().toLowerCase()) {
      toast({
        title: "Invalid settlement",
        description: "Payer and recipient cannot be the same person.",
        variant: "destructive"
      });
      return;
    }

    await recordSettlement({
      fromName: settlePayer,
      toName: settleReceiver,
      amount: parseFloat(settleAmount),
      method: settleMethod,
      note: settleNote
    });

    setSettleAmount("");
    setSettlePayer("");
    setSettleReceiver("");
    setSettleNote("");
    setIsSettleUpOpen(false);
  };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    await addFlatmate({
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      role: newMemberRole
    });

    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberRole("member");
    setIsAddMemberOpen(false);
  };

  const handleEditGroupSubmit = (e) => {
    e.preventDefault();
    updateGroupInfo({
      name: editGroupName,
      description: editGroupDesc
    });
    setIsEditGroupOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Invitation Alert banner if URL has ?invite=... */}
      {token && (
        <Card className="rounded-2xl border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              You've been invited to join this flat group!
            </CardTitle>
            <CardDescription>
              Accepting will add you to the shared flat feed, chores, and Splitwise expense balance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAcceptInvite} disabled={acceptingInvite}>
              {acceptingInvite ? "Joining group..." : "Accept & Join Group"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Supabase Error notice if schema needs setup */}
      {supabaseConnectionError && (
        <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Database notice
            </p>
            <p className="mt-1 text-sm text-destructive/80">{supabaseConnectionError}</p>
          </CardContent>
        </Card>
      )}

      {/* Group Identity Banner - Unified Theme (Primary Blues/Purples, No Green) */}
      <Card className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-card via-card to-primary/5 shadow-md">
        <div className="h-2 bg-gradient-to-r from-primary via-indigo-500 to-primary/80" />

        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Group Profile */}
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="relative">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-3xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                  🏠
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow ring-2 ring-background text-[10px]">
                  ✓
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-headline text-2xl font-bold tracking-tight sm:text-3xl">
                    {groupInfo?.name || "Flat 402 - The Homies 🏠"}
                  </h1>
                  <Badge variant="secondary" className="border border-primary/20 text-primary font-semibold text-xs px-2.5 py-0.5">
                    Flatmate Group
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setEditGroupName(groupInfo?.name || "");
                      setEditGroupDesc(groupInfo?.description || "");
                      setIsEditGroupOpen(true);
                    }}
                    title="Edit group details"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>Group · <strong>{allMembers.length} participants</strong></span>
                  <span>•</span>
                  <span className="text-primary flex items-center gap-1 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" /> Splitwise Active
                  </span>
                </p>

                <p className="text-xs sm:text-sm text-muted-foreground/90 max-w-2xl line-clamp-2 pt-0.5">
                  {groupInfo?.description || "Shared flat group for rent, utility bills, groceries & chores. Rent due on 1st of every month!"}
                </p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-2 lg:pt-0">
              {/* Add Flatmate Button */}
              <Button
                onClick={() => setIsAddMemberOpen(true)}
                className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 font-semibold"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Flatmate</span>
              </Button>

              {/* Settle Up Button */}
              <Button
                variant="outline"
                onClick={() => openSettleDialog(null, null, "")}
                className="gap-2 rounded-xl font-semibold border-border"
              >
                <CreditCard className="h-4 w-4 text-primary" />
                <span>Settle Up</span>
              </Button>

              {/* Share Group Link Button */}
              <Button
                variant="outline"
                onClick={handleGenerateLink}
                disabled={generatingLink}
                className="gap-2 rounded-xl border-border"
              >
                <Share2 className="h-4 w-4 text-primary" />
                <span>{generatingLink ? "Generating..." : "Share Link"}</span>
              </Button>

              {/* Leave Group Button */}
              <Button
                variant="ghost"
                onClick={() => setIsLeaveGroupOpen(true)}
                className="gap-1.5 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                title="Leave this flat group"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Leave</span>
              </Button>
            </div>
          </div>

          {/* Generated Share Link Box */}
          {inviteUrl && (
            <div className="mt-5 rounded-2xl border border-primary/20 bg-muted/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5" /> Group Invite Link Ready
                </span>
                <span className="text-xs text-muted-foreground">Anyone with link can join</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input readOnly value={inviteUrl} className="min-w-0 flex-1 font-mono text-xs" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(inviteUrl)}
                  className="gap-1.5"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedLink ? "Copied!" : "Copy"}</span>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="gap-1.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <a href={getWhatsAppShareUrl(inviteUrl)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>Share on WhatsApp</span>
                  </a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Splitwise Balance Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Your Net Balance */}
        <Card className="rounded-2xl border-primary/20 bg-card/60 backdrop-blur">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Your Balance</CardDescription>
            <CardTitle className="font-headline text-2xl font-bold">
              {currentUserNet > 0.01 ? (
                <span className="text-primary flex items-center gap-1">
                  <ArrowDownLeft className="h-5 w-5" /> +₹{currentUserNet.toFixed(2)}
                </span>
              ) : currentUserNet < -0.01 ? (
                <span className="text-destructive flex items-center gap-1">
                  <ArrowUpRight className="h-5 w-5" /> -₹{Math.abs(currentUserNet).toFixed(2)}
                </span>
              ) : (
                <span className="text-muted-foreground flex items-center gap-1">
                  <Check className="h-5 w-5 text-primary" /> All Settled Up
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {currentUserNet > 0.01
              ? "You are owed by flatmates overall"
              : currentUserNet < -0.01
              ? "You owe money to the flat group"
              : "You have no outstanding debts"}
          </CardContent>
        </Card>

        {/* Card 2: Total Group Spending */}
        <Card className="rounded-2xl border-primary/20 bg-card/60 backdrop-blur">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Total Group Spend</CardDescription>
            <CardTitle className="font-headline text-2xl font-bold text-primary font-mono">
              ₹{totalGroupExpense.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {sharedGroupExpenses.length} shared flat expenses (excl. settlements)
          </CardContent>
        </Card>

        {/* Card 3: Active Debts to Settle */}
        <Card className="rounded-2xl border-primary/20 bg-card/60 backdrop-blur">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Pending Settlements</CardDescription>
            <CardTitle className="font-headline text-2xl font-bold">
              {simplifiedTransactions.length > 0 ? (
                <span className="text-foreground">
                  {simplifiedTransactions.length} {simplifiedTransactions.length === 1 ? "Debt" : "Debts"}
                </span>
              ) : (
                <span className="text-primary">0 Debts</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {simplifiedTransactions.length > 0
              ? "Simplified minimal cash transfers"
              : "All flatmates are square!"}
          </CardContent>
        </Card>

        {/* Card 4: Group Members Count */}
        <Card className="rounded-2xl border-primary/20 bg-card/60 backdrop-blur">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Flatmates</CardDescription>
            <CardTitle className="font-headline text-2xl font-bold">
              {allMembers.length} <span className="text-sm font-normal text-muted-foreground">in group</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            <span>All members active & ready to split</span>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Sections: Splitwise Debts, Members, Group Chat */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-3">
          <TabsList className="grid w-full sm:w-auto grid-cols-2 h-11 p-1 bg-muted/60 rounded-xl">
            <TabsTrigger value="debts" className="rounded-lg gap-2 text-xs sm:text-sm font-semibold">
              <Scale className="h-4 w-4 text-primary" />
              <span>Splitwise Debts</span>
              {simplifiedTransactions.length > 0 && (
                <span className="ml-1 rounded-full bg-primary/20 text-primary px-1.5 py-0.2 text-[10px] font-bold">
                  {simplifiedTransactions.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="members" className="rounded-lg gap-2 text-xs sm:text-sm font-semibold">
              <Users className="h-4 w-4 text-primary" />
              <span>Participants ({allMembers.length})</span>
            </TabsTrigger>
          </TabsList>

          {activeTab === "members" && (
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search flatmates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 rounded-xl text-xs"
              />
            </div>
          )}
        </div>

        {/* TAB 1: SPLITWISE DEBT SIMPLIFICATION ("WHO OWES WHOM") */}
        <TabsContent value="debts" className="space-y-6 mt-0">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-headline text-lg font-bold flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  Who Owes Whom (Splitwise Debt Simplification)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Simplified multi-person flat expenses into the minimum number of settlements.
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => openSettleDialog(null, null, "")}
                className="gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Record Settle Up</span>
              </Button>
            </div>

            {simplifiedTransactions.length === 0 ? (
              <Card className="rounded-2xl border-primary/20 bg-primary/5 p-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
                <h4 className="mt-3 font-headline text-lg font-bold">Everyone is Settled Up!</h4>
                <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                  No one in {groupInfo?.name || "the group"} owes anyone anything right now. When anyone logs a new expense, debts will be calculated here automatically.
                </p>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {simplifiedTransactions.map((tx) => {
                  const isUserPayer = tx.from.isCurrentUser || tx.from.id === user.id || tx.from.name === user.name;
                  const isUserReceiver = tx.to.isCurrentUser || tx.to.id === user.id || tx.to.name === user.name;

                  return (
                    <Card
                      key={tx.id}
                      className={`relative overflow-hidden rounded-2xl border transition-all hover:shadow-md ${
                        isUserPayer
                          ? "border-destructive/40 bg-gradient-to-br from-card via-card to-destructive/5"
                          : isUserReceiver
                          ? "border-primary/40 bg-gradient-to-br from-card via-card to-primary/5"
                          : "border-border/70 bg-card"
                      }`}
                    >
                      <CardContent className="p-4 space-y-3.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                            {isUserPayer ? "You Owe" : isUserReceiver ? "Owes You" : "Flatmate Debt"}
                          </span>
                          <Badge
                            variant="secondary"
                            className="font-mono text-xs font-bold text-primary"
                          >
                            ₹{tx.amount.toFixed(2)}
                          </Badge>
                        </div>

                        {/* Visual Debt Flow */}
                        <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/40 p-2.5">
                          {/* Debtor */}
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar className="h-8 w-8 ring-2 ring-destructive/30 shrink-0">
                              <AvatarImage src={tx.from.avatarUrl} alt={tx.from.name} />
                              <AvatarFallback className="text-xs bg-destructive/10 text-destructive font-bold">
                                {tx.from.name?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold">
                                {tx.from.name} {isUserPayer && "(You)"}
                              </p>
                              <p className="text-[10px] text-muted-foreground">Debtor</p>
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="flex flex-col items-center shrink-0 px-1">
                            <span className="text-[10px] font-bold text-primary">
                              owes
                            </span>
                            <ArrowRight className="h-4 w-4 text-primary animate-pulse" />
                          </div>

                          {/* Creditor */}
                          <div className="flex items-center gap-2 min-w-0 justify-end text-right">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold">
                                {tx.to.name} {isUserReceiver && "(You)"}
                              </p>
                              <p className="text-[10px] text-muted-foreground">Receiver</p>
                            </div>
                            <Avatar className="h-8 w-8 ring-2 ring-primary/30 shrink-0">
                              <AvatarImage src={tx.to.avatarUrl} alt={tx.to.name} />
                              <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                                {tx.to.name?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </div>

                        {/* Settle Up Action Button */}
                        <Button
                          size="sm"
                          onClick={() => openSettleDialog(tx.from, tx.to, tx.amount)}
                          className="w-full gap-1.5 rounded-xl h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>Settle ₹{tx.amount.toFixed(2)}</span>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pairwise Direct Debts Breakdown */}
          <div className="space-y-4 pt-4">
            <div>
              <h3 className="font-headline text-lg font-bold">Direct Pairwise Balances</h3>
              <p className="text-xs text-muted-foreground">
                Detailed peer-to-peer balance between every pair of flatmates in {groupInfo?.name || "the group"}.
              </p>
            </div>

            {pairwiseMatrix.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No pairwise transactions recorded yet.</p>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {pairwiseMatrix.map((pair, idx) => (
                  <div
                    key={`pair-${idx}`}
                    className="flex items-center justify-between rounded-xl border bg-card/60 p-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold truncate">{pair.from.name}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="font-semibold truncate">{pair.to.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-primary">
                        ₹{pair.amount.toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openSettleDialog(pair.from, pair.to, pair.amount)}
                        className="h-6 px-2 text-[10px] text-primary"
                      >
                        Settle
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settle Up History & Records */}
          <div className="space-y-4 pt-4 border-t border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-headline text-lg font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Settlement History ({settlementHistory.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Official log of recorded debt payments and settle ups between flatmates.
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => openSettleDialog(null, null, "")}
                className="gap-1.5 rounded-xl border-border font-semibold text-xs"
              >
                <CreditCard className="h-3.5 w-3.5 text-primary" />
                <span>Record Settle Up</span>
              </Button>
            </div>

            {settlementHistory.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 p-6 text-center text-xs text-muted-foreground">
                No debt settlements recorded yet. Use the "Record Settle Up" button when someone transfers money.
              </div>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {settlementHistory.map((s) => {
                  const recipient = s.split?.[0]?.name || "Flatmate";
                  return (
                    <Card key={s.id} className="rounded-xl border bg-card/70 p-3.5 text-xs shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5" /> Settled
                        </span>
                        <Badge variant="secondary" className="font-mono font-bold text-xs">
                          ₹{Number(s.amount).toFixed(2)}
                        </Badge>
                      </div>
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="font-bold text-foreground">{s.paidBy}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-bold text-foreground">{recipient}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                        <span>{s.date || "Recently"}</span>
                        <span className="truncate max-w-[140px]">{s.note || "Settlement"}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: GROUP PARTICIPANTS */}
        <TabsContent value="members" className="space-y-4 mt-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-headline text-lg font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Group Participants ({filteredMembers.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Flatmates who can view shared expenses, split bills, and receive group notices.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => setIsAddMemberOpen(true)}
              className="gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add Flatmate</span>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {filteredMembers.map((member) => {
              const balanceObj = netBalances.find(
                (b) => b.member.id === member.id || b.member.name === member.name
              );
              const balance = balanceObj?.balance || 0;
              const isCurrentUser = member.isCurrentUser || member.id === user.id || member.email === user.email;
              const isOwner = member.role === "owner" || member.id === groupInfo?.ownerId;

              return (
                <Card
                  key={member.id}
                  className={`rounded-2xl border transition-all ${
                    isCurrentUser ? "border-primary/40 bg-primary/5" : "hover:border-border"
                  }`}
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback className="bg-primary/10 font-bold text-primary">
                              {member.name?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary ring-2 ring-background" title="Active" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate font-headline font-bold text-sm sm:text-base">
                              {member.name}
                            </p>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-semibold">
                                You
                              </Badge>
                            )}
                            {isOwner && (
                              <Badge className="bg-primary/20 text-primary text-[10px] py-0 px-1.5 border-primary/30">
                                Admin
                              </Badge>
                            )}
                          </div>

                          <p className="truncate text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                            <Mail className="h-3 w-3" /> {member.email || "No email"}
                          </p>
                        </div>
                      </div>

                      {/* Balance Badge */}
                      <div className="text-right shrink-0">
                        {balance > 0.01 ? (
                          <div className="rounded-xl bg-primary/10 px-2.5 py-1 text-right border border-primary/20">
                            <p className="text-[10px] uppercase font-bold text-primary">
                              Gets back
                            </p>
                            <p className="font-mono text-sm font-bold text-primary">
                              +₹{balance.toFixed(2)}
                            </p>
                          </div>
                        ) : balance < -0.01 ? (
                          <div className="rounded-xl bg-destructive/10 px-2.5 py-1 text-right border border-destructive/20">
                            <p className="text-[10px] uppercase font-bold text-destructive">
                              Owes
                            </p>
                            <p className="font-mono text-sm font-bold text-destructive">
                              -₹{Math.abs(balance).toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-xl bg-muted/60 px-2.5 py-1 text-right">
                            <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                              Settled
                            </p>
                            <p className="font-mono text-xs text-muted-foreground">₹0.00</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Member Action buttons */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs">
                      <div className="flex items-center gap-2">
                        {!isCurrentUser && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openSettleDialog(member, user, Math.abs(balance) || "")}
                            className="h-7 text-xs text-primary hover:bg-primary/10"
                          >
                            <CreditCard className="mr-1 h-3 w-3" />
                            <span>Settle</span>
                          </Button>
                        )}
                      </div>

                      {!isCurrentUser && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFlatmate(member.id)}
                          className="h-7 text-xs text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          <span>Remove</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* DIALOG 1: ADD FLATMATE MODAL */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline">
              <UserPlus className="h-5 w-5 text-primary" />
              Add Flatmate to Group
            </DialogTitle>
            <DialogDescription>
              Add a new flatmate directly or share an invite link.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddMemberSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="memberName" className="text-xs">Full Name *</Label>
              <Input
                id="memberName"
                placeholder="e.g. Rahul Sharma"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="memberEmail" className="text-xs">Email Address *</Label>
              <Input
                id="memberEmail"
                type="email"
                placeholder="e.g. rahul@example.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="memberRole" className="text-xs">Role in Flat</Label>
              <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                <SelectTrigger id="memberRole">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Flatmate (Member)</SelectItem>
                  <SelectItem value="owner">Co-Admin / Leaseholder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border bg-muted/40 p-3 space-y-1 text-xs">
              <span className="font-semibold text-muted-foreground">Share invite link:</span>
              <p className="text-[11px] text-muted-foreground">
                Flatmates can also join anytime by opening your shared group invite link.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setIsAddMemberOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
                Add Flatmate Instantly
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: RECORD SETTLE UP (SPLITWISE) */}
      <Dialog open={isSettleUpOpen} onOpenChange={setIsSettleUpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline">
              <CreditCard className="h-5 w-5 text-primary" />
              Record Debt Settlement
            </DialogTitle>
            <DialogDescription>
              Record a payment between two flatmates to clear or reduce balances.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSettleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Who Paid? (Debtor)</Label>
              <Select value={settlePayer} onValueChange={setSettlePayer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select who paid money" />
                </SelectTrigger>
                <SelectContent>
                  {allMembers.map((m) => (
                    <SelectItem key={`payer-${m.id}`} value={m.name}>
                      {m.name} {m.isCurrentUser && "(You)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Who Received? (Creditor)</Label>
              <Select value={settleReceiver} onValueChange={setSettleReceiver}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {allMembers
                    .filter((m) => m.name.toLowerCase() !== (settlePayer || "").toLowerCase())
                    .map((m) => (
                      <SelectItem key={`receiver-${m.id}`} value={m.name}>
                        {m.name} {m.isCurrentUser && "(You)"}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="settleAmount" className="text-xs">Amount Paid (₹) *</Label>
              <Input
                id="settleAmount"
                type="number"
                step="0.01"
                placeholder="e.g. 500"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Payment Method</Label>
              <Select value={settleMethod} onValueChange={setSettleMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI (Google Pay / PhonePe / Paytm)</SelectItem>
                  <SelectItem value="Cash">Cash in Hand</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer (IMPS / NEFT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="settleNote" className="text-xs">Optional Note</Label>
              <Input
                id="settleNote"
                placeholder="e.g. Rent share settled"
                value={settleNote}
                onChange={(e) => setSettleNote(e.target.value)}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setIsSettleUpOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
                Confirm Settlement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: LEAVE GROUP CONFIRMATION */}
      <Dialog open={isLeaveGroupOpen} onOpenChange={setIsLeaveGroupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline text-destructive">
              <LogOut className="h-5 w-5" />
              Leave Flatmate Group?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to exit {groupInfo?.name || "this flat group"}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            {currentUserNet < -0.01 ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-destructive space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  You still owe ₹{Math.abs(currentUserNet).toFixed(2)} to flatmates!
                </p>
                <p className="text-[11px] opacity-90">
                  Please settle up your outstanding expenses before leaving so your roommates aren't left with unsettled bills.
                </p>
              </div>
            ) : currentUserNet > 0.01 ? (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3.5 text-primary space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Flatmates still owe you ₹{currentUserNet.toFixed(2)}!
                </p>
                <p className="text-[11px] opacity-90">
                  Leaving now means you won't be part of the active group balance tracking.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                All your balances are square. Leaving will remove you from this flat group and switch you to your personal home workspace.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setIsLeaveGroupOpen(false)}>
              Stay in Group
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                await leaveGroup();
                setIsLeaveGroupOpen(false);
              }}
            >
              Confirm & Leave Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 4: EDIT GROUP DETAILS */}
      <Dialog open={isEditGroupOpen} onOpenChange={setIsEditGroupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline">
              <Pencil className="h-5 w-5 text-primary" />
              Edit Group Info
            </DialogTitle>
            <DialogDescription>
              Customize your flatmate group name and house rules.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditGroupSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="editName" className="text-xs">Group Name</Label>
              <Input
                id="editName"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editDesc" className="text-xs">House Rules & Description</Label>
              <Input
                id="editDesc"
                value={editGroupDesc}
                onChange={(e) => setEditGroupDesc(e.target.value)}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setIsEditGroupOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
