"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Send, Sparkles, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Props {
  studentId: string;
  studentName: string;
  initialMessages: Message[];
}

const SUGGESTIONS = [
  "¿Qué tareas tengo hoy?",
  "¿Cómo abordo mi próxima entrega?",
  "Tengo dificultades con una tarea, ayúdame",
  "¿Voy bien de tiempo?",
];

export function MentorChat({ studentId, studentName, initialMessages }: Props) {
  const t = useTranslations("MentorChat");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setLoading(true);
    setInput("");

    // Append user message inmediatamente
    const userMsg: Message = {
      id: `local-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);

    try {
      const res = await fetch("/api/mentor/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, message: text }),
      });
      const data = (await res.json()) as { reply?: string };
      const assistantMsg: Message = {
        id: `local-${Date.now() + 1}`,
        role: "assistant",
        content: data.reply ?? "No he podido responder, intenta de nuevo.",
        created_at: new Date().toISOString(),
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `local-err-${Date.now()}`,
          role: "assistant",
          content: "He tenido un problema. Inténtalo de nuevo en un momento.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div
        ref={scrollRef}
        className="h-[400px] space-y-3 overflow-y-auto rounded-lg border bg-muted/30 p-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Sparkles className="h-10 w-10 text-primary" />
            <p className="mt-3 text-sm font-medium">
              Hola {studentName.split(" ")[0]}, soy tu mentor.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Hazme cualquier pregunta sobre tus prácticas o elige una sugerencia.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex",
                m.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-white border",
                )}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border bg-white px-4 py-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border bg-card px-3 py-1 text-xs hover:bg-accent"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{t("disclaimer")}</span>
      </p>
    </div>
  );
}
