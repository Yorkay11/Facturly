"use client";

import React from "react";
import { FaFileInvoice, FaEuroSign, FaUsers } from "react-icons/fa6";

/** Preview for intro step 1: Welcome to Facturly — dashboard overview (Apple premium) */
export function IntroStep1Welcome() {
  return (
    <div className="w-full h-full min-h-[340px] flex flex-col items-center justify-center p-8 bg-gradient-to-b from-muted/20 via-background to-background">
      <p className="text-center text-[13px] text-muted-foreground tracking-tight mb-6">
        Your invoicing space at a glance
      </p>
      <div className="w-full max-w-[300px] space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { Icon: FaFileInvoice, label: "Invoices", value: "12" },
            { Icon: FaEuroSign, label: "Revenue", value: "8.4k" },
            { Icon: FaUsers, label: "Clients", value: "5" },
          ].map(({ Icon, label, value }) => (
            <div
              key={label}
              className="rounded-2xl bg-muted/40 dark:bg-muted/20 border border-border/30 p-4 text-center shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] dark:shadow-none"
            >
              <div className="flex justify-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/80 dark:bg-background/60 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <p className="mt-1 text-[17px] font-semibold tabular-nums tracking-tight text-foreground">
                {value}
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-muted/30 dark:bg-muted/15 border border-border/20 px-5 py-4 text-center">
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Create invoices, track payments, manage clients — all in one place.
          </p>
        </div>
      </div>
    </div>
  );
}
