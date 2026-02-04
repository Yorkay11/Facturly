"use client"

import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useEffect, useState } from "react"

export function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Pour mobile : utiliser des offsets différents pour déclencher l'animation plus tard
  // Pour desktop : animation normale
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: isMobile 
      ? ["start 1", "start 0"] // Mobile : déclencher quand l'élément entre complètement dans le viewport (100% à 0%)
      : ["start end", "end start"], // Desktop : animation normale
  })

  // Animation de rotation/scale/opacity/y
  // Sur mobile, on ajuste les valeurs pour une animation plus subtile et qui démarre plus tard
  const rotateX = useTransform(
    scrollYProgress, 
    isMobile ? [0, 0.5, 1] : [0, 0.2, 0.5],
    isMobile ? [35, 10, 0] : [35, 10, 0] // Inclinaison très prononcée : de 35° à 0°
  )
  const opacity = useTransform(
    scrollYProgress, 
    isMobile ? [0, 0.3, 0.7, 1] : [0, 0.15, 0.4, 1],
    isMobile ? [0.6, 0.8, 1, 0.9] : [0.6, 0.9, 1, 0.9]
  )
  const scale = useTransform(
    scrollYProgress, 
    isMobile ? [0, 0.5, 1] : [0, 0.2, 0.5],
    isMobile ? [0.9, 0.95, 1] : [0.9, 0.95, 1]
  )
  const y = useTransform(
    scrollYProgress, 
    isMobile ? [0, 0.5, 1] : [0, 0.2, 0.5],
    isMobile ? [30, 15, 0] : [30, 10, 0]
  )

  return (
    <div ref={ref} className="relative w-[calc(100vw-32px)] md:w-[1160px] mt-44 md:mt-0" suppressHydrationWarning>
      <motion.div
        style={{
          rotateX,
          opacity,
          scale,
          y,
          transformStyle: "preserve-3d",
          transformPerspective: 1000,
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
        }}
        className="bg-primary-dark/50 rounded-xl p-2 shadow-2xl origin-center"
      >
        <Image
          src="/images/dashboard-preview.png"
          alt="Dashboard preview"
          width={1160}
          height={700}
          className="w-full h-full object-cover rounded-lg shadow-lg"
          priority
        />
      </motion.div>
    </div>
  )
}
