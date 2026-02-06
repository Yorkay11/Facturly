"use client"

import React, { createContext, useContext, useState, useEffect, startTransition } from "react"
import { WaitlistExpandable } from "@/components/landing/waitlist-expandable"

interface WaitlistContextType {
  openWaitlist: () => void
}

const WaitlistContext = createContext<WaitlistContextType | undefined>(undefined)

export function WaitlistProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  // Précharger le modal ET le formulaire de manière proactive dès que possible
  useEffect(() => {
    // Précharger immédiatement en arrière-plan (idle time)
    const preloadModal = () => {
      import("@/components/landing/waitlist-modal")
      // Précharger aussi le formulaire en même temps
      import("@/components/landing/waitlist-form")
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(preloadModal, { timeout: 300 })
    } else {
      // Fallback pour navigateurs sans requestIdleCallback
      const timer = setTimeout(preloadModal, 300)
      return () => clearTimeout(timer)
    }
  }, [])

  const openWaitlist = () => {
    // Utiliser startTransition pour rendre l'ouverture non-bloquante
    startTransition(() => {
      setIsOpen(true)
    })
  }
  const closeWaitlist = () => setIsOpen(false)

  return (
    <WaitlistContext.Provider value={{ openWaitlist }}>
      {children}
      <WaitlistExpandable isOpen={isOpen} onClose={closeWaitlist} />
    </WaitlistContext.Provider>
  )
}

export function useWaitlist() {
  const context = useContext(WaitlistContext)
  if (context === undefined) {
    throw new Error("useWaitlist must be used within a WaitlistProvider")
  }
  return context
}
