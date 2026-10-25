import { useState } from "react";
import { Home, Loader2, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: "", success: "" });
    const result = mode === "signin"
      ? await signIn(form.email, form.password)
      : await signUp(form.email, form.password, form.name);

    if (result.error) {
      setStatus({ loading: false, error: result.error.message, success: "" });
      return;
    }
    setStatus({
      loading: false,
      error: "",
      success: mode === "signup" && !result.data.session
        ? "Check your email to confirm your account."
        : ""
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border bg-card shadow-2xl shadow-primary/10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative">
            <div className="mb-10 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Home className="h-5 w-5" />
              </span>
              <span className="font-headline text-xl font-bold">FlatMate<span className="text-primary">X</span></span>
            </div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Welcome home</p>
            <h1 className="max-w-md font-headline text-5xl font-bold leading-tight">A calmer, smarter way to share a home.</h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-sidebar-foreground/60">
              Keep expenses, chores, groceries, and plans in sync with the people you live with.
            </p>
          </div>
          <div className="relative flex items-center gap-2 text-sm text-sidebar-foreground/50">
            <Sparkles className="h-4 w-4 text-accent" />
            Built for better flatmate habits
          </div>
        </section>
        <section className="p-7 sm:p-12">
          <div className="mx-auto max-w-sm">
            <p className="mb-2 text-sm font-semibold text-primary">{mode === "signin" ? "Welcome back" : "Get started"}</p>
            <h2 className="font-headline text-3xl font-bold">{mode === "signin" ? "Sign in to your home" : "Create your account"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin" ? "Pick up where you left off." : "Your shared home is a few clicks away."}
            </p>
            <form onSubmit={submit} className="mt-8 space-y-5">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="auth-name">Your name</Label>
                  <Input id="auth-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="auth-email">Email</Label>
                <div className="relative"><Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="auth-email" type="email" className="pl-9" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-password">Password</Label>
                <div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="auth-password" type="password" minLength={6} className="pl-9" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></div>
              </div>
              {status.error && <p className="text-sm text-destructive">{status.error}</p>}
              {status.success && <p className="text-sm text-primary">{status.success}</p>}
              <Button className="h-11 w-full rounded-xl" disabled={status.loading}>
                {status.loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>
            <button type="button" className="mt-6 w-full text-sm text-muted-foreground hover:text-primary" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setStatus({ loading: false, error: "", success: "" }); }}>
              {mode === "signin" ? "New to FlatMateX? Create an account" : "Already have an account? Sign in"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
