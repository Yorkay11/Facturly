"use client";

import React from "react";
import { FaList, FaBolt } from "react-icons/fa6";

/** Preview for intro step 2: Create your invoices — quick vs full (Apple premium) */
export function IntroStep2CreateInvoice() {
  return (
    <div className="w-full h-full min-h-[340px] flex flex-col items-center justify-center p-8 bg-gradient-to-b from-muted/20 via-background to-background">
      <p className="text-center text-[13px] text-muted-foreground tracking-tight mb-6">
        Two ways to create an invoice
      </p>
      <div className="w-full max-w-[320px] space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-primary/25 bg-primary/5 dark:bg-primary/10 p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 dark:bg-primary/20 mb-3">
              <FaBolt className="h-5 w-5 text-primary" />
            </div>
            <p className="text-[15px] font-semibold text-foreground tracking-tight">Quick invoice</p>
            <p className="mt-1 text-[13px] text-muted-foreground leading-snug">
              Client + amount, send in a few clicks
            </p>
          </div>
          <div className="rounded-2xl bg-muted/40 dark:bg-muted/20 border border-border/30 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background/80 dark:bg-background/60 text-muted-foreground mb-3">
              <FaList className="h-5 w-5" />
            </div>
            <p className="text-[15px] font-semibold text-foreground tracking-tight">Full invoice</p>
            <p className="mt-1 text-[13px] text-muted-foreground leading-snug">
              Line items, VAT, detailed quote
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-muted/30 dark:bg-muted/15 border border-border/20 px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/80 dark:bg-background/60 text-muted-foreground">
            <span className="text-lg font-medium text-foreground/70">👤</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Client
            </p>
            <p className="text-[15px] font-medium text-foreground tracking-tight truncate">
              Select or add client
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
