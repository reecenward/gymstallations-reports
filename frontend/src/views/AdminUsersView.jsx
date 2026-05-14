import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, KeyRound, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { api } from "@/lib/api";

const blankForm = { email: "", full_name: "", password: "", is_admin: false };

export function AdminUsersView({ currentUser, onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blankForm);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pwTarget, setPwTarget] = useState(null);
  const [pwValue, setPwValue] = useState("");

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

  const openResetPassword = (u) => {
    setPwTarget(u);
    setPwValue("");
  };

  const submitResetPassword = async () => {
    if (!pwTarget) return;
    if (pwValue.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      await api.updateUser(pwTarget.id, { password: pwValue });
      toast.success(`Password reset for ${pwTarget.email}`);
      setPwTarget(null);
      setPwValue("");
    } catch (err) {
      toast.error(err.message || "Failed to reset password");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteUser(deleteTarget.id);
      toast.success(`Deleted ${deleteTarget.email}`);
      setDeleteTarget(null);
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
                    <Button size="sm" variant="outline" onClick={() => openResetPassword(u)}>
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
                      onClick={() => setDeleteTarget(u)}
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

      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget ? `Delete ${deleteTarget.email}?` : "Delete user?"}
        description="This removes the user and their access. Their submitted reports remain."
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {pwTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm sm:items-center"
          onClick={() => setPwTarget(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl"
          >
            <div className="mb-1 text-base font-bold text-navy">
              Reset password
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              New password for{" "}
              <span className="font-semibold text-navy">{pwTarget.email}</span>.
            </p>
            <Input
              autoFocus
              type="password"
              value={pwValue}
              onChange={(e) => setPwValue(e.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitResetPassword();
              }}
              className="mb-4"
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setPwTarget(null)}>
                Cancel
              </Button>
              <Button onClick={submitResetPassword}>Set password</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
