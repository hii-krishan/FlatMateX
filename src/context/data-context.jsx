import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
  mockChores,
  mockEvents,
  mockExpenses,
  mockFlatmates,
  mockGroceryList,
  mockGroupInfo,
  mockGroupMessages,
  mockMoodData,
  mockNotes,
  mockTasks,
  mockTimetable,
  mockUser
} from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { supabase, checkDatabaseConnection } from "@/lib/supabase";

const DataContext = createContext(undefined);
const noteColors = ["bg-yellow-200", "bg-green-200", "bg-blue-200", "bg-pink-200", "bg-purple-200"];

const getInitialData = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const cached = localStorage.getItem(`flatmatex_${key}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed !== undefined && parsed !== null) return parsed;
    }
  } catch (e) {
    console.warn("Storage read error:", e);
  }
  return fallback;
};

const persistData = (key, val) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`flatmatex_${key}`, JSON.stringify(val));
  } catch (e) {
    console.warn("Storage write error:", e);
  }
};

const formatSupabaseError = (error) => {
  if (error?.message?.includes("public.group_members")) {
    return "The Supabase database schema is not installed. Run the complete supabase/schema.sql file in the Supabase SQL Editor, then refresh the app.";
  }
  return error?.message || "Supabase could not complete the request.";
};

export function DataProvider({ children }) {
  const { user: authUser, isGuest } = useAuth();
  const isValidUuid = (val) => typeof val === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
  const remote = Boolean(supabase && authUser && isValidUuid(authUser.id) && !isGuest);

   const [user, setUser] = useState(() => getInitialData("user", mockUser));
  const [expenses, setExpenses] = useState(() => getInitialData("expenses", mockExpenses));
  const [groceries, setGroceries] = useState(() => getInitialData("groceries", mockGroceryList));
  const [chores, setChores] = useState(() => getInitialData("chores", mockChores));
  const [events, setEvents] = useState(() => getInitialData("events", mockEvents));
  const [notes, setNotes] = useState(() => getInitialData("notes", mockNotes));
  const [tasks, setTasks] = useState(() => getInitialData("tasks", mockTasks));
  const [timetable, setTimetable] = useState(() => getInitialData("timetable", mockTimetable));
  const [flatmates, setFlatmates] = useState(() => getInitialData("flatmates", mockFlatmates));
  const [groupInfo, setGroupInfo] = useState(() => getInitialData("groupInfo", mockGroupInfo));
  const [groupMessages, setGroupMessages] = useState(() => getInitialData("groupMessages", mockGroupMessages));
  const [moodData, setMoodData] = useState(() => getInitialData("moodData", mockMoodData));

  const [groupId, setGroupId] = useState(null);
  const [supabaseConnectionError, setSupabaseConnectionError] = useState("");
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    checking: true,
    latency: 0,
    url: "",
    message: "Verifying Supabase connection...",
    verifiedAt: null
  });

  const { toast } = useToast();

   useEffect(() => { persistData("expenses", expenses); }, [expenses]);
  useEffect(() => { persistData("groceries", groceries); }, [groceries]);
  useEffect(() => { persistData("chores", chores); }, [chores]);
  useEffect(() => { persistData("events", events); }, [events]);
  useEffect(() => { persistData("notes", notes); }, [notes]);
  useEffect(() => { persistData("tasks", tasks); }, [tasks]);
  useEffect(() => { persistData("timetable", timetable); }, [timetable]);
  useEffect(() => { persistData("flatmates", flatmates); }, [flatmates]);
  useEffect(() => { persistData("groupInfo", groupInfo); }, [groupInfo]);
  useEffect(() => { persistData("groupMessages", groupMessages); }, [groupMessages]);
  useEffect(() => { persistData("moodData", moodData); }, [moodData]);
  useEffect(() => { persistData("user", user); }, [user]);

  const checkDb = async () => {
    setDbStatus((prev) => ({ ...prev, checking: true }));
    const result = await checkDatabaseConnection();
    setDbStatus({
      connected: result.connected,
      checking: false,
      latency: result.latency || 0,
      url: result.url || "",
      message: result.message || (result.connected ? "Database Connected" : "Connection Error"),
      verifiedAt: result.verifiedAt || new Date().toISOString()
    });
    return result;
  };

  useEffect(() => {
    checkDb();
  }, []);

  useEffect(() => {
    if (!authUser) {
      setUser((prev) => prev?.id ? prev : mockUser);
      return;
    }
    setUser({
      id: authUser.id,
      name: authUser.user_metadata?.display_name || authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Alex",
      email: authUser.email,
      role: "owner",
      avatarUrl: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authUser.email || "Alex")}`
    });
  }, [authUser]);

  const loadGroupData = useCallback(async (activeGroupId, ownerId = authUser?.id) => {
    if (!remote || !activeGroupId || !ownerId) return;

    try {
      const { data: groupData } = await supabase.from("groups").select("*").eq("id", activeGroupId).single();
      if (groupData) {
        setGroupInfo({
          id: groupData.id,
          name: groupData.name || "FlatMateX Group",
          code: groupData.id.slice(0, 8).toUpperCase(),
          description: groupData.description || "Shared apartment group for bills, chores, and flatmate living.",
          createdAt: groupData.created_at,
          ownerId: groupData.owner_id
        });
      }

      const queries = await Promise.allSettled([
        supabase.from("expenses").select("*").eq("group_id", activeGroupId).order("created_at", { ascending: false }),
        supabase.from("notes").select("*").eq("group_id", activeGroupId).order("created_at", { ascending: false }),
        supabase.from("groceries").select("*").eq("group_id", activeGroupId).order("created_at", { ascending: false }),
        supabase.from("events").select("*").eq("group_id", activeGroupId).order("event_date"),
        supabase.from("tasks").select("*").eq("group_id", activeGroupId).order("created_at"),
        supabase.from("chores").select("*").eq("group_id", activeGroupId).order("created_at"),
        supabase.from("timetable").select("*").eq("group_id", activeGroupId).order("day").order("start_time"),
        supabase.from("mood_entries").select("*").eq("user_id", ownerId).order("entry_date").limit(14),
        supabase.rpc("get_group_members", { target_group_id: activeGroupId }),
        supabase.from("flatmates").select("*").or(`group_id.eq.${activeGroupId},group_id.is.null`).order("created_at")
      ]);

      const getVal = (promiseResult) => (promiseResult.status === "fulfilled" ? promiseResult.value : { data: [] });
      const expenseResult = getVal(queries[0]);
      const noteResult = getVal(queries[1]);
      const groceryResult = getVal(queries[2]);
      const eventResult = getVal(queries[3]);
      const taskResult = getVal(queries[4]);
      const choreResult = getVal(queries[5]);
      const timetableResult = getVal(queries[6]);
      const moodResult = getVal(queries[7]);
      const flatmateResult = getVal(queries[8]);
      const customFlatmatesResult = getVal(queries[9]);

      setSupabaseConnectionError("");

      setExpenses((expenseResult?.data || []).map((item) => {
        const isSettle = item.category === "Settlement" || item.name?.toLowerCase().startsWith("settlement:");
        let toName = "";
        let fromName = item.paid_by;
        if (isSettle) {
          if (item.split_details?.[0]?.name) toName = item.split_details[0].name;
          else if (item.name?.includes(" paid ")) {
            const parts = item.name.replace(/^Settlement:\s*/i, "").split(" paid ");
            fromName = parts[0]?.trim() || item.paid_by;
            toName = parts[1]?.trim();
          }
        }
        return {
          ...item,
          amount: Number(item.amount),
          date: item.expense_date,
          paidBy: fromName,
          payerName: fromName,
          receivedBy: toName,
          split: item.split_details || [],
          isSettlement: isSettle,
          isPersonal: isSettle ? true : Boolean(item.is_personal),
          splitOption: isSettle ? "no" : (item.split_details?.length ? "custom" : "equal")
        };
      }));

      setNotes((noteResult?.data || []).map((item) => ({ ...item, author: user.name, createdAt: item.created_at })));
      setGroceries((groceryResult?.data || []).map((g) => ({
        ...g,
        unit: g.unit || (g.name?.includes("(") ? g.name.split("(")[1]?.replace(")", "") : "pcs")
      })));
      setEvents((eventResult?.data || []).map((item) => ({ ...item, date: item.event_date })));
      setTasks(taskResult?.data || []);
      setChores(choreResult?.data || []);
      setTimetable((timetableResult?.data || []).map((item) => ({
        ...item,
        startTime: item.start_time,
        endTime: item.end_time,
        time: `${item.start_time} - ${item.end_time}`
      })));
      setMoodData((moodResult?.data || []).map((item) => ({
        ...item,
        date: item.entry_date,
        day: new Date(item.entry_date).toLocaleDateString("en-US", { weekday: "long" }),
        sleepHours: Number(item.sleep_hours),
        productivity: item.productivity_level
      })));

      let rawRegisteredMembers = flatmateResult?.data || [];
      if (!rawRegisteredMembers?.length) {
        try {
          const { data: memberProfiles } = await supabase
            .from("group_members")
            .select("user_id, role, profiles(id, display_name, email)")
            .eq("group_id", activeGroupId);

          if (memberProfiles?.length) {
            rawRegisteredMembers = memberProfiles.map((m) => ({
              user_id: m.user_id,
              role: m.role,
              display_name: m.profiles?.display_name,
              email: m.profiles?.email
            }));
          }
        } catch {}
      }

      if (!rawRegisteredMembers?.length) {
        try {
          const { data: legacyRpcMembers } = await supabase.rpc("get_current_group_members");
          if (legacyRpcMembers?.length) rawRegisteredMembers = legacyRpcMembers;
        } catch {}
      }

      const registeredMembers = (rawRegisteredMembers || [])
        .filter((item) => item.user_id !== ownerId)
        .map((item) => ({
          id: item.user_id,
          email: item.email,
          name: item.display_name || item.email?.split("@")[0] || "Flatmate",
          status: "Active",
          role: item.role === "owner" ? "owner" : "member",
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.display_name || item.email || "Flatmate")}`
        }));

      const userEmail = authUser?.email?.trim().toLowerCase();
      let rawCustomFlatmates = customFlatmatesResult?.data || [];
      const customFlatmates = (rawCustomFlatmates || [])
        .filter((item) => item.email?.toLowerCase() !== userEmail)
        .map((item) => {
          let meta = {};
          try {
            if (item.status && item.status.startsWith("{")) meta = JSON.parse(item.status);
          } catch {}
          return {
            id: item.id,
            email: item.email,
            name: meta.name || item.email?.split("@")[0] || "Flatmate",
            status: meta.status || item.status || "Active",
            role: meta.role || "member",
            avatarUrl: meta.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(meta.name || item.email)}`
          };
        });

      const mergedFlatmates = [...registeredMembers];
      customFlatmates.forEach((cf) => {
        if (!mergedFlatmates.some((m) => m.email?.toLowerCase() === cf.email?.toLowerCase())) {
          mergedFlatmates.push(cf);
        }
      });
      setFlatmates(mergedFlatmates);
    } catch (e) {
      console.warn("loadGroupData error:", e);
    }
  }, [remote, authUser, user.name]);

  useEffect(() => {
    if (!remote || !authUser) return;
    let active = true;

    const init = async () => {
      const owner = authUser.id;
      const userEmail = authUser.email?.trim().toLowerCase();

      const cachedOwner = localStorage.getItem("flatmatex_current_user_id");
      if (cachedOwner && cachedOwner !== owner) {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith("flatmatex_") && k !== "flatmatex_last_invited_group" && !k.startsWith("flatmate_invite_")) {
            localStorage.removeItem(k);
          }
        });
      }
      localStorage.setItem("flatmatex_current_user_id", owner);

      if (userEmail) {
        try {
          await supabase.rpc("claim_user_invitations");
        } catch {}

        try {
          let tokenToClaim = null;
          try {
            const stored = localStorage.getItem(`flatmate_invite_${userEmail}`) || localStorage.getItem("flatmatex_last_invited_group");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed?.token) tokenToClaim = parsed.token;
            }
          } catch {}

          if (tokenToClaim) {
            const { error: claimErr } = await supabase.rpc("accept_group_invitation", { invite_token: tokenToClaim });
            if (!claimErr) {
              try { localStorage.removeItem(`flatmate_invite_${userEmail}`); } catch {}
            }
          }

          const { data: pendingInvites } = await supabase
            .from("group_invitations")
            .select("id, group_id, email, token")
            .ilike("email", userEmail);

          if (pendingInvites && pendingInvites.length > 0) {
            for (const inv of pendingInvites) {
              if (inv.token) await supabase.rpc("accept_group_invitation", { invite_token: inv.token });
            }
          }
        } catch (err) {
          console.warn("Auto-claim:", err);
        }
      }

      let { data: memberships } = await supabase
        .from("group_members")
        .select("group_id, user_id, role, created_at, groups(id, name, owner_id)")
        .eq("user_id", owner);

      if (!memberships?.some((m) => m.role === "member")) {
        try {
          const { data: matchedFlatmates } = await supabase
            .from("flatmates")
            .select("group_id, owner_id")
            .ilike("email", userEmail);

          if (matchedFlatmates && matchedFlatmates.length > 0) {
            for (const fm of matchedFlatmates) {
              if (fm.group_id) {
                await supabase.from("group_members").insert({
                  group_id: fm.group_id,
                  user_id: owner,
                  role: "member"
                });
              }
            }
            const { data: refetched } = await supabase
              .from("group_members")
              .select("group_id, user_id, role, created_at, groups(id, name, owner_id)")
              .eq("user_id", owner);
            if (refetched?.length) memberships = refetched;
          }
        } catch {}
      }

      if (!memberships?.length) {
        const pendingInvite = new URLSearchParams(window.location.search).get("invite");
        if (pendingInvite) return;
        const { data: group, error: groupError } = await supabase.rpc("ensure_default_group");
        if (groupError) {
          setSupabaseConnectionError(groupError.message);
          return;
        }
        memberships = [{ group_id: group, role: "owner" }];
      }

      const storedActiveGroupId = localStorage.getItem("flatmatex_active_group_id");
      let activeGroupId = null;

      if (storedActiveGroupId && memberships.some((m) => m.group_id === storedActiveGroupId)) {
        activeGroupId = storedActiveGroupId;
      } else {
        const sharedMembership = memberships.find((m) => m.role === "member") || memberships[0];
        activeGroupId = sharedMembership.group_id;
      }

      localStorage.setItem("flatmatex_active_group_id", activeGroupId);
      if (!active) return;
      setGroupId(activeGroupId);
      await loadGroupData(activeGroupId, owner);
    };

    init();
    return () => { active = false; };
  }, [authUser, remote, user.name, loadGroupData]);

  useEffect(() => {
    if (!remote || !groupId) return;

    const channel = supabase
      .channel(`flatmatex-sync-${groupId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", filter: `group_id=eq.${groupId}` },
        () => {
          loadGroupData(groupId, authUser?.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [remote, groupId, authUser?.id, loadGroupData]);

  // Combined list of all participants in the group
  const allMembers = useMemo(() => {
    const list = [
      {
        id: user.id || "user-1",
        name: user.name || "Alex",
        email: user.email || "",
        role: user.role || "owner",
        status: "Active",
        avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name || "Alex")}`,
        isCurrentUser: true
      }
    ];

    const seenNames = new Set();
    if (user.name) seenNames.add(user.name.trim().toLowerCase());
    const seenEmails = new Set();
    if (user.email) seenEmails.add(user.email.trim().toLowerCase());
    const seenIds = new Set([user.id]);

    flatmates.forEach((f) => {
      const fNameLower = f.name?.trim().toLowerCase();
      const fEmailLower = f.email?.trim().toLowerCase();
      const isDuplicate =
        f.id === user.id ||
        (f.id && seenIds.has(f.id)) ||
        (fEmailLower && seenEmails.has(fEmailLower)) ||
        (fNameLower && seenNames.has(fNameLower));

      if (!isDuplicate) {
        if (fNameLower) seenNames.add(fNameLower);
        if (fEmailLower) seenEmails.add(fEmailLower);
        if (f.id) seenIds.add(f.id);
        list.push({
          ...f,
          isCurrentUser: false
        });
      }
    });

    return list;
  }, [user, flatmates]);

  const addExpense = async (expense) => {
    const payload = {
      ...expense,
      id: expense.id || `exp-${Date.now()}`,
      flatmateId: expense.flatmateId || user.id,
      paidBy: expense.paidBy || user.name,
      date: expense.date || new Date().toISOString().slice(0, 10),
      split: expense.split || []
    };
    setExpenses((prev) => [payload, ...prev]);
    if (remote) {
      const { error } = await supabase.from("expenses").insert({
        user_id: authUser.id,
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        paid_by: payload.paidBy,
        expense_date: payload.date,
        split_details: expense.split || [],
        group_id: groupId
      });
      if (error) console.error("Unable to save expense:", error);
    }
    if (!expense.isSettlement && expense.category !== "Settlement") {
      toast({ title: "Expense added", description: `${payload.name} (₹${payload.amount}) recorded.` });
    }
  };

  const deleteExpense = async (id) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
    if (remote) await supabase.from("expenses").delete().eq("id", id).eq("user_id", authUser.id);
    toast({ title: "Expense deleted" });
  };

  // Add Flatmate
  const addFlatmate = async (memberData) => {
    const newMember = {
      id: memberData.id || `user-${Date.now()}`,
      name: memberData.name.trim(),
      email: memberData.email.trim(),
      role: memberData.role || "member",
      status: "Active",
      joinedAt: new Date().toISOString().slice(0, 10),
      avatarUrl: memberData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(memberData.name)}`
    };

    setFlatmates((prev) => [...prev, newMember]);

    sendGroupMessage({
      senderId: "system",
      senderName: "System",
      text: `${user.name} added ${newMember.name} to the group.`,
      type: "system"
    });

    const targetGroupId = groupId || groupInfo?.id;

    if (remote && authUser?.id && targetGroupId) {
      try {
        let inviteToken = null;

        // 1. Try add_group_member_by_email RPC (directly adds if account exists, otherwise creates invite)
        try {
          const { data: rpcRes, error: rpcErr } = await supabase.rpc("add_group_member_by_email", {
            target_group_id: targetGroupId,
            member_email: newMember.email.toLowerCase(),
            member_name: newMember.name
          });
          if (!rpcErr && rpcRes) {
            if (rpcRes.token) inviteToken = rpcRes.token;
            if (rpcRes.user_id) newMember.id = rpcRes.user_id;
          }
        } catch {}

        // 2. Fallback / ensure invitation in group_invitations table
        if (!inviteToken) {
          const { data: invData } = await supabase.from("group_invitations").insert({
            group_id: targetGroupId,
            email: newMember.email.toLowerCase(),
            invited_by: authUser.id
          }).select("token").single();

          if (invData?.token) {
            inviteToken = invData.token;
          }
        }

        // 3. Store flatmate in Supabase 'flatmates' table with group_id!
        const flatmatePayload = {
          owner_id: authUser.id,
          group_id: targetGroupId,
          email: newMember.email.toLowerCase(),
          status: JSON.stringify({
            name: newMember.name,
            role: newMember.role,
            status: "Active",
            avatarUrl: newMember.avatarUrl,
            joinedAt: newMember.joinedAt,
            token: inviteToken,
            groupId: targetGroupId
          })
        };

        let dbItem = null;
        const { data: itemWithGid, error: gidError } = await supabase
          .from("flatmates")
          .insert(flatmatePayload)
          .select()
          .single();

        if (gidError) {
          // If group_id column does not exist yet in DB, insert without group_id
          const { data: fallbackItem } = await supabase
            .from("flatmates")
            .insert({
              owner_id: authUser.id,
              email: newMember.email.toLowerCase(),
              status: flatmatePayload.status
            })
            .select()
            .single();
          dbItem = fallbackItem;
        } else {
          dbItem = itemWithGid;
        }

        if (dbItem?.id) {
          newMember.id = dbItem.id;
          setFlatmates((prev) => prev.map((f) => (f.email.toLowerCase() === newMember.email.toLowerCase() ? { ...f, id: dbItem.id } : f)));
        }

        // 4. Store invite in localStorage for instant local linking
        try {
          const invitePayload = {
            token: inviteToken,
            groupId: targetGroupId,
            groupName: groupInfo?.name || "Shared Flat",
            inviterName: user.name,
            inviterEmail: user.email,
            email: newMember.email.toLowerCase()
          };
          localStorage.setItem(`flatmate_invite_${newMember.email.toLowerCase()}`, JSON.stringify(invitePayload));
          localStorage.setItem("flatmatex_last_invited_group", JSON.stringify(invitePayload));
        } catch {}
      } catch (err) {
        console.warn("Could not save flatmate in supabase:", err);
      }
    }

    toast({
      title: "Flatmate Added!",
      description: remote
        ? `${newMember.name} has been added. When they log in with ${newMember.email}, they will automatically join this shared flat group!`
        : `${newMember.name} added to your flat group (guest mode).`
    });

    return { ok: true, member: newMember };
  };

  // Remove Flatmate
  const removeFlatmate = async (flatmateId) => {
    const target = flatmates.find((m) => m.id === flatmateId);
    const targetName = target?.name || "Flatmate";
    setFlatmates((prev) => prev.filter((m) => m.id !== flatmateId));

    sendGroupMessage({
      senderId: "system",
      senderName: "System",
      text: `${user.name} removed ${targetName} from the group.`,
      type: "system"
    });

    if (remote && authUser?.id) {
      try {
        await supabase.from("flatmates").delete().or(`id.eq.${flatmateId},email.eq.${target?.email || ""}`);
        if (groupId) {
          await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", flatmateId);
          await supabase.from("group_invitations").delete().eq("group_id", groupId).eq("email", target?.email || "");
        }
      } catch (err) {
        console.warn("Supabase remove error:", err);
      }
    }

    toast({
      title: "Flatmate removed",
      description: `${targetName} has been removed from this group.`
    });
    return { ok: true };
  };

  // Leave Group
  const leaveGroup = async () => {
    if (remote && groupId) {
      try {
        await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", authUser.id);
        await supabase.rpc("ensure_default_group");
      } catch (err) {
        console.warn("Supabase leave group error:", err);
      }
    }

    setFlatmates([]);
    setGroupInfo({
      id: `group-private-${Date.now()}`,
      name: `${user.name}'s Personal Home`,
      code: "SOLO",
      description: "Private single-flatmate workspace. Join or create a group to invite flatmates.",
      createdAt: new Date().toISOString(),
      ownerId: user.id
    });

    sendGroupMessage({
      senderId: "system",
      senderName: "System",
      text: `You have left the flat group.`,
      type: "system"
    });

    toast({
      title: "Left Group",
      description: "You have exited the flat group."
    });

    return { ok: true };
  };

  // WhatsApp-style Group Messages
  const sendGroupMessage = (msg) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const payload = typeof msg === "string" ? {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: user.id,
      senderName: user.name,
      text: msg,
      timestamp: timeStr,
      type: "chat"
    } : {
      id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: msg.timestamp || timeStr,
      ...msg
    };

    setGroupMessages((prev) => [...prev, payload]);
  };

  // Splitwise Settlement recording
  const recordSettlement = async ({ fromName, toName, amount, method = "UPI", note = "" }) => {
    const num = Number(amount);
    if (!num || num <= 0) return { ok: false, error: "Please enter a valid positive settlement amount." };

    const payer = allMembers.find((m) => m.name?.toLowerCase() === fromName.toLowerCase());
    const receiver = allMembers.find((m) => m.name?.toLowerCase() === toName.toLowerCase());

    const isCurrentPayer =
      payer?.isCurrentUser ||
      payer?.id === user?.id ||
      fromName?.toLowerCase() === user?.name?.toLowerCase() ||
      (user?.email && payer?.email?.toLowerCase() === user?.email?.toLowerCase());

    const isCurrentReceiver =
      receiver?.isCurrentUser ||
      receiver?.id === user?.id ||
      toName?.toLowerCase() === user?.name?.toLowerCase() ||
      (user?.email && receiver?.email?.toLowerCase() === user?.email?.toLowerCase());

    const settlementExpense = {
      id: `settle-${Date.now()}`,
      name: `Settlement: ${fromName} paid ${toName}`,
      amount: num,
      category: "Settlement",
      isSettlement: true,
      isPersonal: true, // Settlements are strictly personal transactions, NEVER shared group expenses!
      splitOption: "no",
      paidBy: fromName,
      payerName: fromName,
      receivedBy: toName,
      payerId: payer?.id || (isCurrentPayer ? user.id : `user-${Date.now()}`),
      receiverId: receiver?.id || (isCurrentReceiver ? user.id : `user-${Date.now()}`),
      flatmateId: payer?.id || (isCurrentPayer ? user.id : `user-${Date.now()}`),
      user_id: isCurrentPayer ? (authUser?.id || user.id) : (payer?.id || `user-${Date.now()}`),
      date: new Date().toISOString().slice(0, 10),
      split: [
        {
          id: receiver?.id,
          name: toName,
          email: receiver?.email,
          share: num
        }
      ],
      note: note || `Paid via ${method}`
    };

    await addExpense(settlementExpense);

    toast({
      title: "Debt Settled!",
      description: `Recorded ₹${num.toLocaleString()} payment from ${fromName} to ${toName}.`
    });

    return { ok: true };
  };

  const updateGroupInfo = (updates) => {
    setGroupInfo((prev) => ({ ...prev, ...updates }));
    toast({ title: "Group updated", description: "Group info has been saved." });
  };

  // --- Groceries with Unit and Removal ---
  const addGrocery = async (item) => {
    const payload = {
      id: `groc-${Date.now()}`,
      name: item.name,
      quantity: Number(item.quantity) || 1,
      unit: item.unit || "pcs",
      purchased: false,
      flatmateId: user.id
    };
    setGroceries((prev) => [payload, ...prev]);
    if (remote) {
      await supabase.from("groceries").insert({
        user_id: authUser.id,
        group_id: groupId,
        name: `${item.name}${item.unit ? ` (${item.unit})` : ""}`,
        quantity: payload.quantity
      });
    }
    toast({
      title: "Grocery added",
      description: `Added ${payload.quantity} ${payload.unit} of ${payload.name}.`
    });
  };

  const toggleGrocery = async (id) => {
    setGroceries((prev) => prev.map((item) => item.id === id ? { ...item, purchased: !item.purchased } : item));
    const item = groceries.find((entry) => entry.id === id);
    if (remote && item) await supabase.from("groceries").update({ purchased: !item.purchased }).eq("id", id).eq("user_id", authUser.id);
  };

  const deleteGrocery = async (id) => {
    setGroceries((prev) => prev.filter((item) => item.id !== id));
    if (remote) await supabase.from("groceries").delete().eq("id", id).eq("user_id", authUser.id);
    toast({ title: "Grocery removed" });
  };

  // --- Chores with Add, Assign, and Removal ---
  const addChore = async (chore) => {
    const payload = {
      id: `ch-${Date.now()}`,
      name: chore.name.trim(),
      assignedTo: chore.assignedTo || "Unassigned",
      day: chore.day || "Daily",
      completed: false,
      flatmateId: user.id
    };
    setChores((prev) => [...prev, payload]);
    if (remote) {
      await supabase.from("chores").insert({
        user_id: authUser.id,
        group_id: groupId,
        name: payload.name,
        assigned_to: payload.assignedTo
      });
    }
    toast({
      title: "Chore added",
      description: `"${payload.name}" assigned to ${payload.assignedTo} (${payload.day}).`
    });
  };

  const toggleChore = async (id) => {
    const chore = chores.find((item) => item.id === id);
    setChores((prev) => prev.map((item) => item.id === id ? { ...item, completed: !item.completed } : item));
    if (remote && chore) await supabase.from("chores").update({ completed: !chore.completed }).eq("id", id).eq("group_id", groupId);
  };

  const updateChore = async (item) => {
    setChores((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, ...item } : entry));
    if (remote) await supabase.from("chores").update({ name: item.name, assigned_to: item.assignedTo }).eq("id", item.id).eq("group_id", groupId);
    toast({ title: "Chore updated" });
  };

  const deleteChore = async (id) => {
    setChores((prev) => prev.filter((item) => item.id !== id));
    if (remote) await supabase.from("chores").delete().eq("id", id).eq("group_id", groupId);
    toast({ title: "Chore removed" });
  };

  // --- Timetable with explicit Start and End time ---
  const updateTimetable = async (item) => {
    const formattedSlot = {
      ...item,
      startTime: item.startTime || item.time?.split(" - ")[0],
      endTime: item.endTime || item.time?.split(" - ")[1],
      time: `${item.startTime || item.time?.split(" - ")[0]} - ${item.endTime || item.time?.split(" - ")[1]}`
    };
    setTimetable((prev) => prev.map((entry) => entry.id === item.id ? formattedSlot : entry));
    if (remote) {
      await supabase.from("timetable").update({
        name: formattedSlot.name,
        day: formattedSlot.day,
        start_time: formattedSlot.startTime,
        end_time: formattedSlot.endTime
      }).eq("id", item.id).eq("user_id", authUser.id);
    }
    toast({ title: "Class slot updated" });
  };

  const addTimetableSlot = async (item) => {
    const startTime = item.startTime || "09:00";
    const endTime = item.endTime || "10:00";
    const payload = {
      ...item,
      id: `class-${Date.now()}`,
      startTime,
      endTime,
      time: `${startTime} - ${endTime}`
    };
    setTimetable((prev) => [...prev, payload]);
    if (remote) {
      await supabase.from("timetable").insert({
        user_id: authUser.id,
        group_id: groupId,
        name: item.name,
        day: item.day,
        start_time: startTime,
        end_time: endTime
      });
    }
    toast({
      title: "Class added",
      description: `${payload.name} on ${payload.day} (${payload.time}).`
    });
  };

  const deleteTimetableSlot = async (id) => {
    setTimetable((prev) => prev.filter((item) => item.id !== id));
    if (remote) await supabase.from("timetable").delete().eq("id", id).eq("user_id", authUser.id);
    toast({ title: "Class removed" });
  };

  // --- Wellness & Mood with Day Feature ---
  const addMoodEntry = async (entry) => {
    const dateStr = entry.date;
    const dayName = entry.day || new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });

    const payload = {
      ...entry,
      id: `mood-${Date.now()}`,
      date: dateStr,
      day: dayName,
      sleepHours: Number(entry.sleepHours),
      productivity: entry.productivity,
      mood: entry.mood
    };

    setMoodData((prev) => {
      const filtered = prev.filter((item) => item.date !== dateStr);
      return [...filtered, payload].sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
    });

    if (remote) {
      await supabase.from("mood_entries").upsert({
        user_id: authUser.id,
        entry_date: dateStr,
        mood: entry.mood,
        sleep_hours: Number(entry.sleepHours),
        productivity_level: entry.productivity
      }, { onConflict: "user_id,entry_date" });
    }

    toast({
      title: "Wellness Logged",
      description: `Saved check-in for ${dayName} (${payload.sleepHours} hrs sleep, ${payload.mood} mood).`
    });
  };

  // Tasks & Events
  const addTask = async (task) => {
    const payload = { ...task, id: `task-${Date.now()}`, completed: false, user_id: user.id };
    setTasks((prev) => [...prev, payload]);
    if (remote) await supabase.from("tasks").insert({ user_id: authUser.id, group_id: groupId, title: task.title, due_date: task.dueDate || null });
  };
  const toggleTask = async (id) => {
    const task = tasks.find((item) => item.id === id);
    setTasks((prev) => prev.map((item) => item.id === id ? { ...item, completed: !item.completed } : item));
    if (remote && task) await supabase.from("tasks").update({ completed: !task.completed }).eq("id", id).eq("user_id", authUser.id);
  };
  const deleteTask = async (id) => {
    setTasks((prev) => prev.filter((item) => item.id !== id));
    if (remote) await supabase.from("tasks").delete().eq("id", id).eq("user_id", authUser.id);
    toast({
      title: "Task Deleted",
      description: "Task removed from Daily Study Planner."
    });
  };
  const addEvent = async (event) => {
    const payload = { ...event, id: `evt-${Date.now()}`, flatmateId: user.id };
    setEvents((prev) => [...prev, payload]);
    if (remote) await supabase.from("events").insert({ user_id: authUser.id, group_id: groupId, title: event.title, event_date: event.date, type: event.type });
  };
  const deleteEvent = async (id) => {
    setEvents((prev) => prev.filter((item) => item.id !== id));
    if (remote) await supabase.from("events").delete().eq("id", id).eq("user_id", authUser.id);
  };
  const addNote = async (note) => {
    const payload = { ...note, id: `note-${Date.now()}`, author: user.name, authorId: user.id, color: noteColors[notes.length % noteColors.length], createdAt: new Date() };
    setNotes((prev) => [payload, ...prev]);
    if (remote) await supabase.from("notes").insert({ user_id: authUser.id, group_id: groupId, content: note.content, color: payload.color });
  };
  const deleteNote = async (id) => {
    setNotes((prev) => prev.filter((item) => item.id !== id));
    if (remote) await supabase.from("notes").delete().eq("id", id).eq("user_id", authUser.id);
  };

  const createGroupLink = async () => {
    if (!supabase) return { ok: false, error: "Supabase is not configured. Add the Supabase URL and anon key to .env, then restart Vite." };
    if (!authUser) return { ok: false, error: "Sign in first, then create a group link." };
    if (!groupId) return { ok: false, error: "Your group is still loading. Refresh the page and try again." };
    const { data, error } = await supabase.from("group_invitations").insert({
      group_id: groupId,
      email: null,
      invited_by: authUser.id
    }).select("token").single();
    if (error) {
      console.error("Unable to create group link:", error);
      return { ok: false, error: "The group link could not be created. Run the updated Supabase SQL first." };
    }
    return { ok: true, link: `${window.location.origin}/dashboard/flatmates?invite=${data.token}` };
  };

  const acceptInvitation = async (token) => {
    if (!remote || !token) return { ok: false, error: "Sign in before joining this group." };
    const { error } = await supabase.rpc("accept_group_invitation", { invite_token: token });
    if (error) {
      console.error("Unable to join flat group:", error);
      return { ok: false, error: error.message };
    }
    window.history.replaceState({}, "", "/dashboard/flatmates");
    window.location.reload();
    return { ok: true };
  };

  const updateUser = (nextUser) => { setUser(nextUser); toast({ title: "Profile updated" }); };
  const noop = () => {};

  return (
    <DataContext.Provider value={{
      user, updateUser, expenses, addExpense, deleteExpense,
      groceries, addGrocery, toggleGrocery, deleteGrocery,
      chores, addChore, toggleChore, updateChore, deleteChore,
      events, addEvent, deleteEvent, notes, addNote, deleteNote,
      tasks, addTask, toggleTask, deleteTask,
      timetable, updateTimetable, addTimetableSlot, deleteTimetableSlot,
      flatmates, allMembers, addFlatmate, removeFlatmate, leaveGroup, groupInfo, updateGroupInfo,
      groupMessages, sendGroupMessage, recordSettlement,
      remote, dbStatus, checkDbStatus: checkDb,
      moodData, addMoodEntry, updateMoodEntry: noop,
      createGroupLink, acceptInvitation, groupId, supabaseConnectionError,
      reloadGroupData: loadGroupData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
}
