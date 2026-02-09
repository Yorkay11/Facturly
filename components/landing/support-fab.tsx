"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { AnimatePresence, motion } from "motion/react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function SupportFab() {
  const [isOpen, setIsOpen] = useState(false)
  const fabRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>
      <div ref={fabRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="origin-bottom-right"
          >
            <div className="w-[350px] rounded-lg border bg-card p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Support Rapide</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Besoin d'aide ? Discutez avec notre équipe ou consultez notre FAQ.
              </p>
              <div className="flex flex-col gap-2">
                <Button 
                  className="w-full justify-start bg-[#25D366] text-white hover:bg-[#128C7E]" 
                  onClick={() => {
                    window.open('https://wa.me/22891592659?text=Bonjour,%20j%27aimerais%20avoir%20plus%20d%27informations%20sur%20Facturly.', '_blank')
                    setIsOpen(false)
                  }}
                >
                  <FaWhatsapp className="mr-2 h-4 w-4" />
                  Discuter sur WhatsApp
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' })
                    setIsOpen(false)
                  }}
                >
                  📚 Consulter la FAQ
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    window.location.href = 'mailto:support@facturly.online?subject=Aide%20Facturly'
                    setIsOpen(false)
                  }}
                >
                  📧 Envoyer un email
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90 overflow-hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <X className="h-6 w-6 text-primary-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="fury"
              initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center w-full h-full"
            >
              <Image
                src="/mascot/fury_happy.webp"
                alt="FURY - Support"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
      </div>
    </>
  )
}
