"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, UserPlus, Check, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Member {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "owner" | "admin" | "student";
}

interface Props {
  currentUserId: string;
  currentRole: "owner" | "admin" | "student";
  members: Member[];
}

export function TeamPanel({ currentUserId, currentRole, members }: Props) {
  const router = useRouter();
  const t = useTranslations("Team");
  const canInvite = currentRole === "owner" || currentRole === "admin";

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"admin" | "owner">("admin");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function invite() {
    setLoading(true);
    setError(null);
    setSent(false);
    const res = await fetch("/api/organization/invite-member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName, role }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? t("error"));
      return;
    }
    setSent(true);
    setEmail("");
    setFullName("");
    router.refresh();
    setTimeout(() => {
      setOpen(false);
      setSent(false);
    }, 1500);
  }

  const nonStudentMembers = members.filter((m) => m.role !== "student");

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">{t("card_title")}</CardTitle>
          <CardDescription>{t("card_desc")}</CardDescription>
        </div>
        {canInvite && !open && (
          <Button size="sm" onClick={() => setOpen(true)}>
            <UserPlus className="h-4 w-4" />
            {t("invite_button")}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {open && canInvite && (
          <div className="space-y-3 rounded-md border bg-muted/30 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="m_email">{t("email_label")}</Label>
                <Input
                  id="m_email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m_name">{t("name_label")}</Label>
                <Input
                  id="m_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="m_role">{t("role_label")}</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "admin" | "owner")}>
                <SelectTrigger id="m_role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t("role_admin")}</SelectItem>
                  <SelectItem value="owner">{t("role_owner")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={loading}>
                {t("cancel")}
              </Button>
              <Button size="sm" onClick={invite} disabled={loading || !email.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : sent ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {sent ? t("sent") : loading ? t("sending") : t("send")}
              </Button>
            </div>
          </div>
        )}

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("members_title")}
          </p>
          <ul className="space-y-2">
            {nonStudentMembers.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {m.full_name ?? m.email ?? "—"}
                    {m.id === currentUserId && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {t("you")}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                </div>
                <Badge
                  variant={m.role === "owner" ? "success" : "secondary"}
                  className="gap-1"
                >
                  <Shield className="h-3 w-3" />
                  {m.role === "owner" ? t("role_owner") : t("role_admin")}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
