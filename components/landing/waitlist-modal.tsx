"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import WaitlistForm from "./waitlist-form"
import { useTranslations } from "next-intl"

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const t = useTranslations("landing.waitlist")

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={onClose} 
      >
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">{t("title")}</DialogTitle>
          <DialogDescription className="text-center">
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <WaitlistForm />
        </div>
      </DialogContent>
    </Dialog>
  )
}
