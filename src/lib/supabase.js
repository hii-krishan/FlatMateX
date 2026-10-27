import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;


export async function checkDatabaseConnection() {
  if (!supabase || !supabaseUrl || !supabaseAnonKey) {
    return {
      connected: false,
      status: "disconnected",
      message: "Supabase credentials are not configured in .env",
      url: supabaseUrl || "Not configured",
      latency: 0
    };
  }

  const startTime = typeof performance !== "undefined" ? performance.now() : Date.now();

  try {
   
    const { count, error } = await supabase
      .from("groups")
      .select("*", { count: "exact", head: true });

    const endTime = typeof performance !== "undefined" ? performance.now() : Date.now();
    const latency = Math.round(endTime - startTime);

    if (error) {
      return {
        connected: false,
        status: "error",
        message: error.message || "Database connection error",
        url: supabaseUrl,
        latency,
        error
      };
    }

    return {
      connected: true,
      status: "connected",
      message: "Connected to Supabase PostgreSQL Database",
      url: supabaseUrl,
      latency,
      verifiedAt: new Date().toISOString()
    };
  } catch (err) {
    return {
      connected: false,
      status: "unreachable",
      message: err.message || "Network error reaching Supabase endpoint",
      url: supabaseUrl,
      latency: 0,
      error: err
    };
  }
}
