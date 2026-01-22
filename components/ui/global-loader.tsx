"use client";

import { cn } from "@/lib/utils";

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
        whiteOverlay ? "bg-white" : "bg-black/50 backdrop-blur-sm",
        "transition-opacity duration-200 ease-out"
      )}
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className={cn(
          "flex flex-col items-center gap-6",
          "animate-loader-fade-in"
        )}
      >
        {/* Loader carré avec barre de progression */}
        <div className="relative w-20 h-20">
          {/* Conteneur carré avec bordure */}
          <div className="absolute inset-0 rounded-lg border border-primary/30 bg-white overflow-hidden">
            {/* Barre de progression animée */}
            <div className="absolute bottom-0 left-0 right-0 h-0 bg-primary animate-progress-fill" />
          </div>
        </div>

        {/* Message */}
        {message && (
          <p className="text-sm font-medium text-foreground/90">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
