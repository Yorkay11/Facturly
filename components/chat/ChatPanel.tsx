"use client";

import { useMemo, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useChatConfig } from "@/hooks/useChatConfig";
import { Button } from "@/components/ui/button";
import { FuryMascot } from "@/components/mascot/FuryMascot";
import AiInput from "@/components/ai-input";
import { cn } from "@/lib/utils";

type Part = {
  type?: string;
  text?: string;
  output?: Record<string, unknown>;
  input?: Record<string, unknown>;
};

function formatToolOutput(part: Part): string {
  if (part.type === "tool-getDashboardSummary" && part.output && typeof part.output === "object") {
    const o = part.output as { currency?: string; monthlyRevenue?: string; totalPaid?: string; totalUnpaid?: string; invoicesSent?: number };
    const cur = o.currency ?? "";
    const revenue = o.monthlyRevenue ?? "0";
    const sent = o.invoicesSent ?? 0;
    return `Résumé du mois : chiffre d'affaires ${revenue} ${cur}, ${sent} facture(s) envoyée(s).`;
  }
  if (part.type === "tool-getInvoiceStatus" && part.output && typeof part.output === "object") {
    const o = part.output as { status?: string; invoiceNumber?: string; totalAmount?: string; currency?: string };
    if ((o as { error?: string }).error) return (o as { error: string }).error;
    return `Facture ${o.invoiceNumber ?? "?"} : statut ${o.status ?? "?"}, montant ${o.totalAmount ?? "?"} ${o.currency ?? ""}.`;
  }
  if (part.type === "tool-listRecentInvoices" && part.output && Array.isArray(part.output)) {
    const list = part.output as Array<{ title?: string; amount?: string; currency?: string }>;
    if (list.length === 0) return "Aucune facture récente.";
    return list.map((i) => `${i.title ?? "Facture"} — ${i.amount ?? "?"} ${i.currency ?? ""}`).join("\n");
  }
  if (part.type === "tool-getRequiredActions" && part.output && typeof part.output === "object") {
    const o = part.output as { notSent?: unknown[]; overdue?: unknown[] };
    const n = (o.notSent?.length ?? 0) + (o.overdue?.length ?? 0);
    if (n === 0) return "Aucune action requise.";
    return `${n} action(s) requise(s) (factures non envoyées ou en retard).`;
  }
  return "";
}

function getMessageText(m: { content?: unknown; parts?: Part[] }): string {
  if (Array.isArray(m.parts) && m.parts.length > 0) {
    const textFromParts = m.parts
      .map((part) => ("text" in part && typeof part.text === "string" ? part.text : ""))
      .join("");
    if (textFromParts) return textFromParts;
    const fromTools = m.parts.map(formatToolOutput).filter(Boolean).join(" ");
    if (fromTools) return fromTools;
  }
  if (typeof m.content === "string") return m.content;
  if (Array.isArray(m.content)) {
    return (m.content as Part[])
      .map((part) => (part.type === "text" ? part.text ?? "" : ""))
      .join("");
  }
  return "";
}

export type ChatMessageListItem = {
  id: string;
  role: string;
  content?: unknown;
  parts?: unknown[];
};

export function ChatMessageList({
  messages,
  isLoading,
}: {
  messages: ChatMessageListItem[];
  isLoading: boolean;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col gap-4 p-5">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="rounded-2xl bg-muted/40 p-4 mb-4 ring-1 ring-border/40">
            <FuryMascot mood="focus" size="sm" animated={false} />
          </div>
          <p className="text-sm font-medium text-foreground">Posez une question à FURY</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
            Factures, tableau de bord, statuts…
          </p>
          <p className="text-xs text-muted-foreground/80 mt-2">
            Ex : &quot;Résumé de mon mois&quot;, &quot;Où en est la facture #42 ?&quot;
          </p>
        </div>
      )}
      {messages.map((m) => (
        <div
          key={m.id}
          className={cn(
            "flex gap-2.5 items-end",
            m.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          {m.role === "assistant" && (
            <FuryMascot
              mood="focus"
              size="xs"
              animated={false}
              className="shrink-0 mb-0.5"
            />
          )}
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm max-w-[85%] shadow-sm",
              m.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted/80 rounded-bl-md"
            )}
          >
            <p className="whitespace-pre-wrap leading-relaxed">
              {getMessageText(m as { content?: unknown; parts?: Part[] }) ||
                (m.role === "assistant" ? "…" : "")}
            </p>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex gap-2.5 justify-start items-end">
          <FuryMascot
            mood="focus"
            size="xs"
            animated={false}
            className="shrink-0 mb-0.5"
          />
          <div className="rounded-2xl rounded-bl-md px-4 py-2.5 bg-muted/80 text-sm text-muted-foreground shadow-sm animate-pulse">
            …
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

function ChatPanelReady({
  chatApiUrl,
  chatHeaders,
  className,
}: {
  chatApiUrl: string;
  chatHeaders: Record<string, string>;
  className?: string;
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: chatApiUrl,
        headers: chatHeaders,
      }),
    [chatApiUrl, chatHeaders]
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={cn(
        "flex flex-col h-full min-h-0 rounded-lg border overflow-hidden bg-card",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3 shrink-0">
        <FuryMascot mood="smile" size="sm" animated={false} />
        <span className="font-medium text-sm">FURY</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground text-sm">
            <p>Posez une question sur vos factures, votre tableau de bord…</p>
            <p className="mt-1">
              Ex : &quot;Résumé de mon mois&quot;, &quot;Où en est la facture #42 ?&quot;
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex gap-2 items-start",
              m.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {m.role === "assistant" && (
              <FuryMascot
                mood="focus"
                size="xs"
                animated={false}
                className="shrink-0"
              />
            )}
            <div
              className={cn(
                "rounded-lg px-3 py-2 text-sm max-w-[85%]",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <p className="whitespace-pre-wrap">
                {getMessageText(m as { content?: unknown; parts?: Part[] }) || (m.role === "assistant" ? "…" : "")}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 justify-start items-start">
            <FuryMascot
              mood="focus"
              size="xs"
              animated={false}
              className="shrink-0"
            />
            <div className="rounded-lg px-3 py-2 bg-muted text-sm text-muted-foreground">
              …
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-xs">
          {error.message}
        </div>
      )}

      <div className="shrink-0 px-4 pb-4 pt-3 border-t bg-muted/30">
        <AiInput
          width="100%"
          placeholder="Votre message…"
          rows={2}
          loading={isLoading}
          mainColor="hsl(var(--primary))"
          onSubmit={async (value) => {
            const text = value?.trim();
            if (!text) return;
            sendMessage({ text });
          }}
          animationStyle="orbit"
        />
      </div>
    </div>
  );
}

type ChatPanelProps = {
  className?: string;
  onNotReady?: () => void;
};

export function ChatPanel({ className, onNotReady }: ChatPanelProps) {
  const { chatApiUrl, chatHeaders, isReady } = useChatConfig();

  if (!isReady || !chatApiUrl) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-4 rounded-lg border bg-card p-6 text-center",
          className
        )}
      >
        <FuryMascot mood="sleepy" size="md" />
        <p className="text-sm text-muted-foreground">
          Connectez-vous pour discuter avec FURY.
        </p>
        {onNotReady && (
          <Button variant="outline" size="sm" onClick={onNotReady}>
            Fermer
          </Button>
        )}
      </div>
    );
  }

  return (
    <ChatPanelReady
      chatApiUrl={chatApiUrl}
      chatHeaders={chatHeaders}
      className={className}
    />
  );
}
