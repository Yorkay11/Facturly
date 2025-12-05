"use client"

import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Animation de rotation qui se redresse progressivement suivant l'axe X
  const rotateX = useTransform(scrollYProgress, [0, 0.2, 0.5], [20, 5, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.4, 1], [0.4, 0.9, 1, 0.9])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.5], [0.85, 0.95, 1])
  const y = useTransform(scrollYProgress, [0, 0.2, 0.5], [50, 15, 0])

  return (
    <div ref={ref} className="w-[calc(100vw-32px)] md:w-[1160px]">
      <motion.div
        style={{
          rotateX,
          opacity,
          scale,
          y,
          transformStyle: "preserve-3d",
          transformPerspective: 1000,
          willChange: "transform, opacity",
          backfaceVisibility: "hidden"
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
