import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, setToken } from "@/lib/api";

export function LoginView({ onAuthed }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.login(email, password);
      setToken(res.access_token);
      onAuthed(res.user);
    } catch (err) {
      const msg = (err.message || "").toLowerCase();
      const friendly =
        msg.includes("invalid") || msg.includes("credential") || msg.includes("password")
          ? "Wrong email or password. Try again."
          : "Couldn't sign in. Check your connection and try again.";
      toast.error(friendly);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-50">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center">
            <img
              src="/logo.png"
              alt="Gymstallations"
              className="h-10 w-auto sm:h-12"
              width={5171}
              height={1156}
            />
            <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Preventive Maintenance Reports
            </div>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-6 sm:p-7">
              <h1 className="mb-1 text-2xl font-bold tracking-tight text-navy">
                Sign in
              </h1>
              <p className="mb-5 text-sm text-muted-foreground">
                Use your work email and password.
              </p>
              <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="h-11 text-base"
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
                    autoComplete="current-password"
                    className="h-11 text-base"
                  />
                </div>
                <Button
                  type="submit"
                  size="xl"
                  className="mt-1 w-full"
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Don't have an account? Ask your admin to create one.
          </p>
        </div>
      </div>
    </div>
  );
}
