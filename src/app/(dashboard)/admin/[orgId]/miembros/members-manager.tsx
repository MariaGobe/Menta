"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Loader2,
  UserPlus,
  KeyRound,
  Trash2,
  Shield,
  ShieldCheck,
  User,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

interface Member {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "owner" | "admin" | "student";
  created_at: string;
  last_sign_in_at: string | null;
}

interface Props {
  orgId: string;
  orgName: string;
  currentUserId: string;
  members: Member[];
}

export function MembersManager({ orgId, orgName, currentUserId, members }: Props) {
  const router = useRouter();
  const t = useTranslations("AdminMembers");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; url?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Invite form
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"admin" | "owner">("admin");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);

  const nonStudent = members.filter((m) => m.role !== "student");
  const students = members.filter((m) => m.role === "student");

  async function changeRole(userId: string, newRole: "owner" | "admin") {
    if (!confirm(t("confirm_change_role", { role: t(`role_${newRole}`) }))) return;
    setBusyId(userId);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setBusyId(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(`Error: ${j.error ?? res.statusText}`);
      return;
    }
    router.refresh();
  }

  async function sendReset(userId: string, email: string | null) {
    if (!email) {
      alert(t("no_email"));
      return;
    }
    if (!confirm(t("confirm_reset", { email }))) return;
    setBusyId(userId);
    setNotice(null);
    const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
      method: "POST",
    });
    setBusyId(null);
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(`Error: ${j.error ?? res.statusText}`);
      return;
    }
    if (j.skippedEmail && j.resetUrl) {
      setNotice({ text: t("reset_link_manual", { email }), url: j.resetUrl });
    } else {
      setNotice({ text: t("reset_sent", { email }) });
    }
  }

  async function removeUser(userId: string, email: string | null) {
    if (userId === currentUserId) {
      alert(t("cannot_remove_self"));
      return;
    }
    if (!confirm(t("confirm_remove", { email: email ?? "?" }))) return;
    setBusyId(userId);
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setBusyId(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(`Error: ${j.error ?? res.statusText}`);
      return;
    }
    router.refresh();
  }

  async function invite() {
    setInviting(true);
    setInviteMsg(null);
    const res = await fetch(`/api/admin/organizations/${orgId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName, role }),
    });
    setInviting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setInviteMsg(j.error ?? t("invite_error"));
      return;
    }
    setInviteMsg(t("invite_sent"));
    setEmail("");
    setFullName("");
    setTimeout(() => {
      setInviteOpen(false);
      setInviteMsg(null);
      router.refresh();
    }, 1200);
  }

  function copyResetUrl() {
    if (!notice?.url) return;
    navigator.clipboard.writeText(notice.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {notice && (
        <div className="rounded-md border border-mint-300 bg-mint-50 p-4 text-sm text-mint-900">
          <p>{notice.text}</p>
          {notice.url && (
            <div className="mt-3 flex gap-2">
              <Input
                readOnly
                value={notice.url}
                className="font-mono text-xs bg-white"
              />
              <Button size="sm" variant="outline" onClick={copyResetUrl}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? t("copied") : t("copy")}
              </Button>
            </div>
          )}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">{t("team_title")}</CardTitle>
            <CardDescription>
              {t("team_subtitle", { org: orgName, count: nonStudent.length })}
            </CardDescription>
          </div>
          {!inviteOpen && (
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus className="h-4 w-4" />
              {t("invite_button")}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {inviteOpen && (
            <div className="space-y-3 rounded-md border bg-muted/30 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="i_email">{t("email_label")}</Label>
                  <Input
                    id="i_email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="i_name">{t("name_label")}</Label>
                  <Input
                    id="i_name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="i_role">{t("role_label")}</Label>
                <Select value={role} onValueChange={(v) => setRole(v as "admin" | "owner")}>
                  <SelectTrigger id="i_role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t("role_admin")}</SelectItem>
                    <SelectItem value="owner">{t("role_owner")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {inviteMsg && (
                <p className="rounded-md bg-mint-50 p-2 text-sm text-mint-800">
                  {inviteMsg}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInviteOpen(false)}
                  disabled={inviting}
                >
                  {t("cancel")}
                </Button>
                <Button
                  size="sm"
                  onClick={invite}
                  disabled={inviting || !email.trim()}
                >
                  {inviting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  {inviting ? t("sending") : t("send_invite")}
                </Button>
              </div>
            </div>
          )}

          <ul className="space-y-2">
            {nonStudent.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 text-sm"
              >
                <div className="min-w-[220px] flex-1">
                  <p className="font-medium">
                    {m.full_name ?? m.email ?? "—"}
                    {m.id === currentUserId && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({t("you")})
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("last_login")}:{" "}
                    {m.last_sign_in_at ? formatDate(m.last_sign_in_at) : t("never")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={m.role}
                    onValueChange={(v) =>
                      changeRole(m.id, v as "owner" | "admin")
                    }
                    disabled={busyId === m.id || m.id === currentUserId}
                  >
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">
                        <ShieldCheck className="mr-2 inline h-3 w-3" />
                        {t("role_owner")}
                      </SelectItem>
                      <SelectItem value="admin">
                        <Shield className="mr-2 inline h-3 w-3" />
                        {t("role_admin")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendReset(m.id, m.email)}
                    disabled={busyId === m.id}
                  >
                    {busyId === m.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="h-4 w-4" />
                    )}
                    {t("reset_password")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeUser(m.id, m.email)}
                    disabled={busyId === m.id || m.id === currentUserId}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
            {nonStudent.length === 0 && (
              <li className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                {t("empty_team")}
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("students_title", { count: students.length })}
            </CardTitle>
            <CardDescription>{t("students_subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {students.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {m.full_name ?? m.email ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <User className="h-3 w-3" />
                      {t("role_student")}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendReset(m.id, m.email)}
                      disabled={busyId === m.id}
                    >
                      {busyId === m.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <KeyRound className="h-4 w-4" />
                      )}
                      {t("reset_password")}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
