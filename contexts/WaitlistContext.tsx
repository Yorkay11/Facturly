"use client"

import React, { createContext, useContext, useState } from "react"
import { WaitlistModal } from "@/components/landing/waitlist-modal"

interface WaitlistContextType {
  openWaitlist: () => void
}

const WaitlistContext = createContext<WaitlistContextType | undefined>(undefined)

export function WaitlistProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openWaitlist = () => setIsOpen(true)
  const closeWaitlist = () => setIsOpen(false)

  return (
    <WaitlistContext.Provider value={{ openWaitlist }}>
      {children}
      <WaitlistModal isOpen={isOpen} onClose={closeWaitlist} />
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
