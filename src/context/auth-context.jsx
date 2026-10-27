import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [guestUser, setGuestUser] = useState(() => {
    try {
      return localStorage.getItem("flatmatex_guest") === "true";
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      if (localStorage.getItem("flatmatex_guest") === "true") return false;
      const supabaseKey = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
      if (supabaseKey) return false;
    } catch {}
    return isSupabaseConfigured;
  });

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error("Unable to restore Supabase session:", error);
      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        try {
          localStorage.removeItem("flatmatex_guest");
        } catch {}
        setGuestUser(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => {
    const effectiveUser = session?.user ?? (guestUser ? {
      id: "user-1",
      email: "alex@flatmate.com",
      user_metadata: {
        display_name: "Alex",
        full_name: "Alex",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
      }
    } : null);

    return {
      session,
      user: effectiveUser,
      isGuest: Boolean(guestUser && !session?.user),
      loading,
      isConfigured: isSupabaseConfigured,
      signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
      signUp: (email, password, displayName) => supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } }
      }),
      signInAsGuest: () => {
        try {
          localStorage.setItem("flatmatex_guest", "true");
        } catch {}
        setGuestUser(true);
      },
      signInWithGoogle: () => supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin }
      }),
      signOut: async () => {
        try {
          localStorage.removeItem("flatmatex_guest");
          // Clear cached user data so next user loads their own fresh data
          Object.keys(localStorage).forEach((key) => {
            if (
              key.startsWith("flatmatex_") &&
              key !== "flatmatex_last_invited_group" &&
              !key.startsWith("flatmate_invite_")
            ) {
              localStorage.removeItem(key);
            }
          });
        } catch {}
        setGuestUser(false);
        if (supabase) {
          const result = await supabase.auth.signOut();
          window.location.assign("/dashboard");
          return result;
        }
        window.location.assign("/dashboard");
        return { error: null };
      },
      updateProfile: (displayName) => {
        if (session?.user && supabase) {
          return supabase.auth.updateUser({
            data: { display_name: displayName }
          });
        }
        return Promise.resolve({ error: null });
      },
      resetPassword: (email) => supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard/settings`
      })
    };
  }, [loading, session, guestUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
