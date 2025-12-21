"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface GlobalLoaderProps {
  isLoading: boolean;
  message?: string;
  whiteOverlay?: boolean;
}

export function GlobalLoader({
  isLoading,
  message,
  whiteOverlay = false,
}: GlobalLoaderProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center",
        whiteOverlay ? "bg-white" : "bg-black/40 backdrop-blur-sm",
        "transition-opacity duration-300 ease-out opacity-100"
      )}
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className={cn(
          "flex flex-col items-center gap-5 rounded-xl p-8",
          "animate-loader-pop",
          whiteOverlay ? "shadow-none" : "bg-white shadow-xl"
        )}
      >
        {/* Loader */}
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 rounded-xl border-4 border-primary/30 bg-white overflow-hidden">
            {/* Liquide */}
            <div className="absolute inset-0 liquid-container">
              <div className="liquid-wave" />
            </div>

            {/* Logo */}
            <div className="absolute inset-0 flex items-center justify-center logo-reveal">
              <Image
                src="/icon.png"
                alt="Facturly"
                width={80}
                height={80}
                priority
                className="w-20 h-20 object-contain rounded-xl"
              />
            </div>
          </div>
        </div>

        {message && (
          <p className="text-sm font-medium text-muted-foreground animate-fade-in">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
