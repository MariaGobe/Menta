"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface Props {
  studentId: string;
  studentName: string;
}

export function DeleteStudentButton({ studentId, studentName }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("StudentDelete");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const typed = window.prompt(t("confirm_message", { name: studentName }));
    if (typed === null) return;
    if (typed.trim() !== studentName.trim()) {
      setError(t("no_match"));
      return;
    }

    setLoading(true);
    setError(null);

    await supabase.from("profiles").update({ student_id: null }).eq("student_id", studentId);

    const { error: err } = await supabase.from("students").delete().eq("id", studentId);
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }
    router.push("/alumnos");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        onClick={handleDelete}
        disabled={loading}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        {t("button")}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
