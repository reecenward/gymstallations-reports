import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, KeyRound, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

const blankForm = { email: "", full_name: "", password: "", is_admin: false };

export function AdminUsersView({ currentUser, onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blankForm);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    try {
      const list = await api.listUsers();
      setUsers(list);
    } catch (err) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const submitCreate = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    try {
      await api.createUser({
        email: form.email,
        password: form.password,
        full_name: form.full_name || null,
        is_admin: form.is_admin,
      });
      toast.success(`Created ${form.email}`);
      setForm(blankForm);
      refresh();
    } catch (err) {
      toast.error(err.message || "Failed to create user");
    } finally {
      setBusy(false);
    }
  };

  const togglePromote = async (u) => {
    try {
      await api.updateUser(u.id, { is_admin: !u.is_admin });
      toast.success(`${u.email} is now ${!u.is_admin ? "an admin" : "a regular user"}`);
      refresh();
    } catch (err) {
      toast.error(err.message || "Failed to update user");
    }
  };

  const resetPassword = async (u) => {
    const pw = prompt(`New password for ${u.email}:`);
    if (!pw) return;
    if (pw.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      await api.updateUser(u.id, { password: pw });
      toast.success(`Password reset for ${u.email}`);
    } catch (err) {
      toast.error(err.message || "Failed to reset password");
    }
  };

  const removeUser = async (u) => {
    if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    try {
      await api.deleteUser(u.id);
      toast.success(`Deleted ${u.email}`);
      refresh();
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy">Users</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-bold text-navy">Create user</h2>
          <form onSubmit={submitCreate} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="new_email">Email</Label>
              <Input
                id="new_email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new_name">Name</Label>
              <Input
                id="new_name"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new_password">Password</Label>
              <Input
                id="new_password"
                type="password"
                minLength={6}
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                autoComplete="new-password"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_admin}
                  onChange={(e) => setForm((f) => ({ ...f, is_admin: e.target.checked }))}
                  className="size-4"
                />
                Admin (can manage users)
              </label>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={busy}>
                <Plus className="size-4" />
                {busy ? "Creating…" : "Create user"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading…</div>
          ) : users.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No users yet.</div>
          ) : (
            <ul className="divide-y">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-medium text-navy">
                      <span className="truncate">{u.email}</span>
                      {u.is_admin && <Badge variant="secondary">Admin</Badge>}
                      {u.id === currentUser.id && <Badge variant="outline">You</Badge>}
                    </div>
                    {u.full_name && (
                      <div className="text-sm text-muted-foreground">{u.full_name}</div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => resetPassword(u)}>
                      <KeyRound className="size-4" /> Reset password
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePromote(u)}
                      disabled={u.id === currentUser.id}
                    >
                      {u.is_admin ? (
                        <>
                          <ShieldOff className="size-4" /> Demote
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="size-4" /> Promote
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeUser(u)}
                      disabled={u.id === currentUser.id}
                    >
                      <Trash2 className="size-4" /> Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
