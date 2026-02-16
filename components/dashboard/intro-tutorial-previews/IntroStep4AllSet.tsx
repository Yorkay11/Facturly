"use client";

import React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Preview for intro step 4: You're all set — ready to invoice (Apple premium) */
export function IntroStep4AllSet() {
  const items = [
    "Create your first invoice",
    "Manage clients",
    "Track payments",
  ];

  return (
    <div className="w-full h-full min-h-[340px] flex flex-col items-center justify-center p-8 bg-gradient-to-b from-muted/20 via-background to-background">
      <div className="w-full max-w-[280px] space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 dark:bg-primary/15 p-5 ring-[1px] ring-primary/20">
            <CheckIcon className="h-9 w-9 text-primary" strokeWidth={2.5} />
          </div>
        </div>
        <p className="text-center text-[17px] font-semibold text-foreground tracking-tight">
          You're ready to use Facturly
        </p>
        <ul className="space-y-2.5">
          {items.map((label, i) => (
            <li
              key={i}
              className={cn(
                "flex items-center gap-3 text-[15px] text-muted-foreground",
                "rounded-xl px-3 py-2.5 bg-muted/30 dark:bg-muted/15 border border-border/20"
              )}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 dark:bg-primary/20">
                <CheckIcon className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
              </div>
              {label}
            </li>
          ))}
        </ul>
        <p className="text-center text-[13px] text-muted-foreground leading-relaxed">
          Start from the dashboard or explore settings to customize your workspace.
        </p>
      </div>
    </div>
  );
}
