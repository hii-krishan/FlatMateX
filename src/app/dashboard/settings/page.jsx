import { useState } from "react";
import { Check, KeyRound, LogOut, UserRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const { user, signOut, resetPassword } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.display_name ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateProfile = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({
      data: { display_name: name }
    });
    if (updateError) setError(updateError.message);
    else setMessage("Profile updated successfully.");
  };

  const sendResetEmail = async () => {
    setMessage("");
    setError("");
    const { error: resetError } = await resetPassword(user.email);
    if (resetError) setError(resetError.message);
    else setMessage("Password reset instructions sent to your email.");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">Workspace preferences</p>
        <h2 className="mt-1 font-headline text-3xl font-bold">Settings</h2>
        <p className="mt-2 text-muted-foreground">Manage your profile and account security.</p>
      </div>
      {message && <p className="rounded-xl bg-primary/10 p-3 text-sm text-primary"><Check className="mr-2 inline h-4 w-4" />{message}</p>}
      {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="flex items-center gap-2 font-headline"><UserRound className="h-5 w-5 text-primary" />Profile</CardTitle><CardDescription>How your name appears around the flat.</CardDescription></CardHeader>
          <CardContent><form onSubmit={updateProfile} className="space-y-4"><div className="space-y-2"><Label htmlFor="settings-name">Display name</Label><Input id="settings-name" value={name} onChange={(event) => setName(event.target.value)} required /></div><div className="space-y-2"><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div><Button type="submit" className="rounded-xl">Save profile</Button></form></CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="flex items-center gap-2 font-headline"><KeyRound className="h-5 w-5 text-primary" />Security</CardTitle><CardDescription>Keep your FlatMateX account protected.</CardDescription></CardHeader>
          <CardContent className="space-y-4"><Button variant="outline" className="w-full justify-start rounded-xl" onClick={sendResetEmail}>Send password reset email</Button><Button variant="destructive" className="w-full justify-start rounded-xl" onClick={signOut}><LogOut className="h-4 w-4" />Sign out</Button></CardContent>
        </Card>
      </div>
    </div>
  );
}
