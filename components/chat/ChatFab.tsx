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
} from "@/components/ui/drawer";
import { useChatConfig } from "@/hooks/useChatConfig";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { FuryMascot } from "@/components/mascot/FuryMascot";
import { ChatMessageList } from "@/components/chat/ChatPanel";
import AiInput from "@/components/ai-input";
import { cn } from "@/lib/utils";
import { logoutAndRedirect } from "@/services/api/base";

function ChatDrawerContent({
  chatApiUrl,
  chatHeaders,
  onNotReady,
}: {
  chatApiUrl: string;
  chatHeaders: Record<string, string>;
  onNotReady?: () => void;
}) {
  const transport = useMemo(() => {
    // Créer un fetch personnalisé qui intercepte les erreurs 401
    const authAwareFetch: typeof fetch = async (input, init) => {
      const response = await fetch(input, init);
      
      // Intercepter les erreurs 401 avant qu'elles ne soient traitées par le transport
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

  const { messages, sendMessage, status, error } = useChat({
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <>
      <DrawerHeader className="flex flex-row items-center gap-2 border-b bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-left text-white shadow-sm">
        <FuryMascot mood="focus" size="sm" animated={false} />
        <DrawerTitle className="text-base font-semibold text-white">FURY</DrawerTitle>
      </DrawerHeader>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <ChatMessageList messages={messages} isLoading={isLoading} />
      </div>

      {error && (
        <div className="shrink-0 px-4 py-2 bg-destructive/10 text-destructive text-xs">
          {error.message}
        </div>
      )}

      <DrawerFooter className="shrink-0 border-t bg-muted/30 pt-3">
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

export function ChatFab() {
  const [open, setOpen] = useState(false);
  const { chatApiUrl, chatHeaders, isReady } = useChatConfig();

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-20 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90 overflow-hidden md:bottom-6"
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
          "inset-x-auto left-auto right-0 top-0 bottom-0 mt-0 h-full w-full max-w-md rounded-l-[10px] rounded-t-none flex flex-col bg-card border-l",
          "[&>div:first-child]:hidden"
        )}
      >
        {!isReady || !chatApiUrl ? (
          <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
            <FuryMascot mood="sleepy" size="md" />
            <p className="text-sm text-muted-foreground">
              Connectez-vous pour discuter avec FURY.
            </p>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Fermer
            </Button>
          </div>
        ) : (
          <ChatDrawerContent
            chatApiUrl={chatApiUrl}
            chatHeaders={chatHeaders}
            onNotReady={() => setOpen(false)}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}
