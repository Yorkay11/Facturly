"use client";

import * as React from "react";
import { Link } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: Crumb[];
  className?: string;
}

export const Breadcrumb = ({ items, className }: BreadcrumbProps) => (
  <nav aria-label="Fil d 19ariane" className={cn("flex items-center gap-2 text-sm", className)}>
    {items.map((item, index) => {
      const isLast = index === items.length - 1;
      return (
        <React.Fragment key={`${item.label}-${index}`}>
          {item.href && !isLast ? (
            <Link href={item.href} className="text-foreground/60 transition hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground/80 font-semibold">{item.label}</span>
          )}
          {!isLast && <ChevronRight className="h-4 w-4 text-foreground/40" />}
        </React.Fragment>
      );
    })}
  </nav>
);

export default Breadcrumb;
