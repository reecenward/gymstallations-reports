import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, setToken } from "@/lib/api";

export function LoginView({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res =
        mode === "login"
          ? await api.login(email, password)
          : await api.register(email, password, fullName || null);
      setToken(res.access_token);
      onAuthed(res.user);
    } catch (err) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-xl font-black text-white shadow-sm">
          G
        </div>
        <div className="text-2xl font-extrabold tracking-tight text-navy">
          Gymstallations
        </div>
        <div className="text-sm text-muted-foreground">
          Preventive Maintenance Reports
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="mb-4 text-lg font-bold text-navy">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>
          <form className="space-y-4" onSubmit={submit}>
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Name</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "login"
                ? "Sign in"
                : "Create account"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                No account?{" "}
                <button
                  className="font-medium text-primary hover:underline"
                  onClick={() => setMode("register")}
                  type="button"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Have an account?{" "}
                <button
                  className="font-medium text-primary hover:underline"
                  onClick={() => setMode("login")}
                  type="button"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
