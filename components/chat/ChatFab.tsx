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
      <div className="flex-1 min-h-0 overflow-y-auto relative bg-muted/20 dark:bg-muted/10">
        <ChatMessageList messages={messages} isLoading={isLoading} />
      </div>

      {error && (
        <div className="shrink-0 px-5 py-3 bg-destructive/5 text-destructive text-[15px] border-t border-destructive/20">
          {error.message}
        </div>
      )}

      <DrawerFooter className="shrink-0 border-t border-border/40 bg-background/95 dark:bg-background/98 backdrop-blur-sm px-5 py-4">
        <AiInput
          variant="drawer"
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
          className="fixed bottom-20 right-6 z-50 h-14 w-14 rounded-full shadow-lg shadow-black/15 transition-transform hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90 overflow-hidden md:bottom-6 border-0"
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
          "inset-x-auto left-auto right-0 top-0 bottom-0 mt-0 h-full w-full max-w-md !rounded-l-[28px] rounded-t-none rounded-r-none flex flex-col bg-background/95 dark:bg-background/98 backdrop-blur-2xl border-l border-border/40 shadow-2xl shadow-black/5 overflow-hidden outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:ring-0 [&:focus]:ring-0 [&:focus]:outline-none",
          "[&>div:first-child]:hidden"
        )}
      >
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
            className="fixed bottom-20 right-6 z-50 h-14 w-14 rounded-full shadow-lg shadow-black/15 transition-transform hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90 overflow-hidden md:bottom-6 border-0"
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
            "inset-x-auto left-auto right-0 top-0 bottom-0 mt-0 h-full w-full max-w-md !rounded-l-[28px] rounded-t-none rounded-r-none flex flex-col bg-background/95 dark:bg-background/98 backdrop-blur-2xl border-l border-border/40 shadow-2xl shadow-black/5 overflow-hidden outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:ring-0 [&:focus]:ring-0 [&:focus]:outline-none",
            "[&>div:first-child]:hidden"
          )}
        >
          <div className="flex flex-col items-center justify-center gap-6 p-8 text-center min-h-[280px]">
            <div className="rounded-2xl bg-muted/40 dark:bg-muted/20 p-4 border border-border/40">
              <FuryMascot mood="sleepy" size="md" />
            </div>
            <p className="text-[15px] text-muted-foreground max-w-[260px]">
              Connectez-vous pour discuter avec FURY.
            </p>
            <DrawerClose asChild>
              <Button variant="outline" size="sm" className="rounded-full h-9 px-4 text-[15px] font-medium">
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
