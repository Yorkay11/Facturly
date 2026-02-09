"use client";

import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface LegalPageHeaderProps {
  icon: React.ReactNode;
  lastUpdated: string;
  backToHome: string;
}

export function LegalPageHeader({ icon, lastUpdated, backToHome }: LegalPageHeaderProps) {
  return (
    <header className={cn(
      "border-b bg-background/80 backdrop-blur-sm sticky z-40 top-0"
    )}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/?landing=1" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">{backToHome}</span>
          </Link>
          <div className="flex items-center gap-2 text-muted-foreground">
            {icon}
            <span className="text-sm">{lastUpdated}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
