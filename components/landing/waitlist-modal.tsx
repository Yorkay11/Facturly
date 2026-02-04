"use client"

import { lazy, Suspense, memo } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogPortal
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useTranslations } from "next-intl"
import { FaSpinner } from "react-icons/fa6"
import { useIsMobile } from "@/hooks/use-mobile"

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
}

// Optimisation du Lazy Load : préchargement au survol possible si besoin
const WaitlistForm = lazy(() => import("./waitlist-form"))

const WaitlistFormContent = memo(() => {
  return (
    <Suspense 
      fallback={
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <FaSpinner className="animate-spin text-primary h-8 w-8" />
          <span className="text-xs text-muted-foreground animate-pulse">
            Chargement...
          </span>
        </div>
      }
    >
      <WaitlistForm />
    </Suspense>
  )
})
WaitlistFormContent.displayName = "WaitlistFormContent"

// Version Desktop avec Dialog
const WaitlistDialogContent = memo(({ onClose }: { onClose: () => void }) => {
  const t = useTranslations("landing.waitlist")

  return (
    <DialogPortal>
      <DialogContent 
        className="sm:max-w-md bg-background border-primary/20 shadow-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold text-center tracking-tight">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <WaitlistFormContent />
        </div>
      </DialogContent>
    </DialogPortal>
  )
})
WaitlistDialogContent.displayName = "WaitlistDialogContent"

// Version Mobile avec Sheet
const WaitlistSheetContent = memo(({ onClose }: { onClose: () => void }) => {
  const t = useTranslations("landing.waitlist")

  return (
    <SheetContent 
      side="bottom"
      className="bg-background border-primary/20 rounded-t-2xl max-h-[90vh] overflow-y-auto"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <SheetHeader className="space-y-2 pb-4">
        <SheetTitle className="text-2xl font-bold text-center tracking-tight">
          {t("title")}
        </SheetTitle>
        <SheetDescription className="text-center text-muted-foreground">
          {t("subtitle")}
        </SheetDescription>
      </SheetHeader>

      <div className="py-2">
        <WaitlistFormContent />
      </div>
    </SheetContent>
  )
})
WaitlistSheetContent.displayName = "WaitlistSheetContent"

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const isMobile = useIsMobile()

  // Mobile: Sheet depuis le bas
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        {isOpen && <WaitlistSheetContent onClose={onClose} />}
      </Sheet>
    )
  }

  // Desktop: Dialog centré
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {isOpen && <WaitlistDialogContent onClose={onClose} />}
    </Dialog>
  )
}