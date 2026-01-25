"use client"

import { useState } from "react"
import Image from "next/image"
import { Smartphone } from "lucide-react"

interface ProviderLogoProps {
  src: string
  alt: string
  name: string
}

export function ProviderLogo({ src, alt, name }: ProviderLogoProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div
        className="w-full h-full flex items-center justify-center text-center px-2"
        role="img"
        aria-label={name}
      >
        <div className="flex flex-col items-center gap-1">
          <Smartphone className="h-5 w-5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground leading-tight">
            {name}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt || name}
        fill
        sizes="(max-width: 768px) 80px, 112px"
        className="object-contain p-1 opacity-90 group-hover:opacity-100 transition-opacity duration-300"
        onError={() => setHasError(true)}
        priority={false}
      />
    </div>
  )
}