"use client";

import { cn } from "@/lib/utils";
import { FaMagic } from "react-icons/fa";
import { IoArrowForwardOutline } from "react-icons/io5";

interface Suggestion {
  id: string;
  category: string;
  message: string;
  actionLabel?: string;
  actionLink?: string;
}

interface AISuggestionsPanelProps {
  title: string;
  suggestions: Suggestion[];
  className?: string;
}

export const AISuggestionsPanel = ({ title, suggestions, className }: AISuggestionsPanelProps) => {
  if (suggestions.length === 0) return null;

  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white p-5 shadow-sm", className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FaMagic className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
                  {suggestion.category}
                </p>
                <p className="text-sm text-slate-900 leading-relaxed">
                  {suggestion.message}
                </p>
              </div>
              {suggestion.actionLink && (
                <a
                  href={suggestion.actionLink}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors shrink-0"
                >
                  {suggestion.actionLabel || "Voir"}
                  <IoArrowForwardOutline className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AISuggestionsPanel;
