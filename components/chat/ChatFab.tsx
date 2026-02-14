"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { useChatConfig } from "@/hooks/useChatConfig";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { FuryMascot } from "@/components/mascot/FuryMascot";
import { ChatMessageList } from "@/components/chat/ChatPanel";
import AiInput from "@/components/ai-input";
import { cn } from "@/lib/utils";
import { logoutAndRedirect } from "@/services/api/base";
import { ChevronRight } from "lucide-react";

/** UI du contenu du chat (présentation seule). L’état du chat vit dans le parent pour persister à la fermeture du drawer. */
function ChatDrawerUI({
  messages,
  sendMessage,
  isLoading,
  error,
}: {
  messages: { id: string; role: string; content?: unknown; parts?: unknown[] }[];
  sendMessage: (opts: { text: string }) => void;
  isLoading: boolean;
  error: Error | null | undefined;
}) {
  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto relative bg-gradient-to-b from-violet-50/30 dark:from-violet-950/10 to-muted/20">
        <ChatMessageList messages={messages} isLoading={isLoading} />
      </div>

      {error && (
        <div className="shrink-0 px-5 py-3 bg-destructive/10 text-destructive text-sm border-t border-destructive/20">
          {error.message}
        </div>
      )}

      <DrawerFooter className="shrink-0 border-t border-border/80 bg-card/80 backdrop-blur-sm px-5 py-4">
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
      </DrawerFooter>
    </>
  );
}

/** Garde l’état useChat dans un composant toujours monté pour que les messages survivent à la fermeture du drawer. */
function ChatFabWithPersistedState({
  chatApiUrl,
  chatHeaders,
}: {
  chatApiUrl: string;
  chatHeaders: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);

  const transport = useMemo(() => {
    const authAwareFetch: typeof fetch = async (input, init) => {
      const response = await fetch(input, init);
      if (!response.ok && response.status === 401) {
        logoutAndRedirect();
      }
      return response;
    };
    return new DefaultChatTransport({
      api: chatApiUrl,
      headers: chatHeaders,
      fetch: authAwareFetch,
    });
  }, [chatApiUrl, chatHeaders]);

  const { messages, sendMessage, status, error } = useChat({ transport });
  const isLoading = status === "submitted" || status === "streaming";

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-20 right-6 z-50 h-14 w-14 rounded-full shadow-xl shadow-black/25 transition-transform hover:scale-105 hover:shadow-2xl hover:shadow-black/30 active:scale-95 bg-primary hover:bg-primary/90 overflow-hidden md:bottom-6"
          aria-label="Ouvrir le chat FURY"
        >
          <Image
            src="/mascot/fury_focus.webp"
            alt="FURY"
            width={40}
            height={40}
            className="w-full h-full object-cover"
            priority
          />
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className={cn(
          "inset-x-auto left-auto right-0 top-0 bottom-0 mt-0 h-full w-full max-w-md rounded-l-2xl rounded-t-none flex flex-col bg-card border-l border-border/80 shadow-2xl shadow-black/20",
          "[&>div:first-child]:hidden"
        )}
      >
        <div className="relative shrink-0 overflow-hidden rounded-b-2xl shadow-lg shadow-violet-900/25">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-500 to-pink-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10" />
          <DrawerHeader className="relative flex flex-row items-center gap-3 border-0 px-5 py-5 text-left text-white">
            <FuryMascot mood="focus" size="sm" animated={false} className="shrink-0 ring-2 ring-white/30 rounded-full shadow-md" />
            <DrawerTitle className="text-lg font-semibold text-white tracking-tight flex-1 drop-shadow-sm">FURY</DrawerTitle>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-9 w-9 text-white/90 hover:text-white hover:bg-white/25 rounded-full transition-colors"
                aria-label="Fermer"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-violet-950/40 to-transparent pointer-events-none" />
        </div>
        <ChatDrawerUI
          messages={messages}
          sendMessage={sendMessage}
          isLoading={isLoading}
          error={error}
        />
      </DrawerContent>
    </Drawer>
  );
}

export function ChatFab() {
  const { chatApiUrl, chatHeaders, isReady } = useChatConfig();

  if (!isReady || !chatApiUrl) {
    return (
      <Drawer direction="right">
        <DrawerTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-20 right-6 z-50 h-14 w-14 rounded-full shadow-xl shadow-black/25 transition-transform hover:scale-105 hover:shadow-2xl hover:shadow-black/30 active:scale-95 bg-primary hover:bg-primary/90 overflow-hidden md:bottom-6"
            aria-label="Ouvrir le chat FURY"
          >
            <Image
              src="/mascot/fury_focus.webp"
              alt="FURY"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              priority
            />
          </Button>
        </DrawerTrigger>
        <DrawerContent
          className={cn(
            "inset-x-auto left-auto right-0 top-0 bottom-0 mt-0 h-full w-full max-w-md rounded-l-2xl rounded-t-none flex flex-col bg-card border-l border-border/80 shadow-2xl shadow-black/20",
            "[&>div:first-child]:hidden"
          )}
        >
          <div className="flex flex-col items-center justify-center gap-6 p-8 text-center min-h-[280px]">
            <div className="rounded-2xl bg-muted/50 p-4 ring-1 ring-border/50">
              <FuryMascot mood="sleepy" size="md" />
            </div>
            <p className="text-sm text-muted-foreground max-w-[240px]">
              Connectez-vous pour discuter avec FURY.
            </p>
            <DrawerClose asChild>
              <Button variant="outline" size="sm">
                Fermer
              </Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return <ChatFabWithPersistedState chatApiUrl={chatApiUrl} chatHeaders={chatHeaders} />;
}
