"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface MagicCardProps {
  children?: React.ReactNode
  className?: string
  gradientFrom?: string
  gradientTo?: string
}

export function MagicCard({
  children,
  className,
  gradientFrom = "#9E7AFF",
  gradientTo = "#67062E",
}: MagicCardProps) {
  return (
    <div
      className={cn("group relative rounded-[inherit]", className)}
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        padding: "1px",
      }}
    >
      <div className="relative min-h-0 rounded-[inherit] bg-background">
        {children}
      </div>
    </div>
  )
}
