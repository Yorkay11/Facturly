"use client";

import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

interface GlobalLoaderProps {
  isLoading: boolean;
  message?: string;
}

export function GlobalLoader({ isLoading, message }: GlobalLoaderProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center",
        "bg-black/40 backdrop-blur-sm",
        "transition-opacity duration-200",
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-6 shadow-lg">
        <Loader size="lg" className="text-primary" />
        {message && (
          <p className="text-sm font-medium text-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}

