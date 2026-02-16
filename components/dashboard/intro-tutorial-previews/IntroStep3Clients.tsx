"use client";

import React from "react";
import { FaBuilding } from "react-icons/fa6";
import { cn } from "@/lib/utils";

/** Preview for intro step 3: Manage your clients — address book (Apple premium) */
export function IntroStep3Clients() {
  const clients = [
    { name: "Acme Corp", email: "contact@acme.com", invoices: "3" },
    { name: "Startup SAS", email: "hello@startup.io", invoices: "7" },
    { name: "Freelance Co", email: "billing@freelance.co", invoices: "2" },
  ];

  return (
    <div className="w-full h-full min-h-[340px] flex flex-col items-center justify-center p-8 bg-gradient-to-b from-muted/20 via-background to-background">
      <p className="text-center text-[13px] text-muted-foreground tracking-tight mb-6">
        Your clients and their invoice history
      </p>
      <div className="w-full max-w-[300px] space-y-3">
        <div className="rounded-2xl bg-muted/40 dark:bg-muted/20 border border-border/30 overflow-hidden shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] dark:shadow-none">
          {clients.map((c, i) => (
            <div
              key={c.name}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5",
                i < clients.length - 1 && "border-b border-border/20"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/80 dark:bg-background/60 text-primary">
                <FaBuilding className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-foreground tracking-tight truncate">
                  {c.name}
                </p>
                <p className="text-[13px] text-muted-foreground truncate mt-0.5">{c.email}</p>
              </div>
              <span className="text-[13px] text-muted-foreground tabular-nums font-medium">
                {c.invoices} inv.
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
