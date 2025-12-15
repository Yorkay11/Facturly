"use client";

export function BetaBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground shadow-lg border-b border-primary/20">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-3 text-sm">
          <div className="flex items-center gap-2 flex-1">
            <span className="px-2 py-0.5 rounded-full bg-primary-foreground/20 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
              Bêta
            </span>
            <p className="font-medium text-center sm:text-left">
              Facturly est actuellement en version bêta. Merci de votre patience pendant que nous améliorons la plateforme.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

