"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerClose,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface ResponsiveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  /** Desktop: max width class (e.g. "max-w-3xl") */
  modalMaxWidth?: string
  /** Mobile: max height class (e.g. "max-h-[90vh]") */
  sheetMaxHeight?: string
  contentClassName?: string
  showCloseButton?: boolean
  closeButtonClassName?: string
  closeButtonContent?: React.ReactNode
}

export function ResponsiveModal({
  open,
  onOpenChange,
  children,
  modalMaxWidth = "sm:max-w-[1100px]",
  sheetMaxHeight,
  contentClassName,
  showCloseButton = true,
  closeButtonClassName,
  closeButtonContent,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
        <DrawerContent className={cn(sheetMaxHeight, contentClassName, "px-0")}>
          {showCloseButton && (
            <DrawerClose className={cn("absolute right-4 top-4 flex items-center justify-center rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary z-50", closeButtonClassName)}>
              {closeButtonContent || <X className="h-4 w-4" />}
              <span className="sr-only">Close</span>
            </DrawerClose>
          )}
          <div className="overflow-y-auto pb-4">
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(modalMaxWidth, contentClassName)}
        closeClassName={cn(
          closeButtonClassName,
          !showCloseButton && "hidden"
        )}
        closeIcon={closeButtonContent}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}
