"use client"

import React, { createContext, useContext, useState, lazy, Suspense, useEffect, startTransition } from "react"

interface WaitlistContextType {
  openWaitlist: () => void
}

const WaitlistContext = createContext<WaitlistContextType | undefined>(undefined)

// Lazy load du modal pour améliorer les performances
const WaitlistModal = lazy(() => 
  import("@/components/landing/waitlist-modal").then(module => ({ 
    default: module.WaitlistModal 
  }))
)

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
      {/* Ne charger le modal que quand il est ouvert */}
      {isOpen && (
        <Suspense fallback={null}>
          <WaitlistModal isOpen={isOpen} onClose={closeWaitlist} />
        </Suspense>
      )}
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
