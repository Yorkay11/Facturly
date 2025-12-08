"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ReactNode } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useAnalytics } from "@/components/analytics/Analytics"

interface CTAButtonProps {
  href?: string
  children: ReactNode
  className?: string
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  defaultText?: string
  authenticatedText?: string
  defaultHref?: string
  authenticatedHref?: string
}

export function CTAButton({
  href,
  children,
  className,
  variant = "default",
  size = "default",
  defaultText,
  authenticatedText,
  defaultHref = "/login",
  authenticatedHref = "/dashboard",
}: CTAButtonProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { trackEvent } = useAnalytics()
  const displayText = isAuthenticated ? authenticatedText || "Accéder au tableau de bord" : defaultText || children
  const targetHref = isAuthenticated ? authenticatedHref : (href || defaultHref)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Tracker le clic sur le CTA
    trackEvent("cta_click", {
      location: className?.includes("hero") ? "hero_section" : "other",
      text: typeof displayText === "string" ? displayText : "CTA Button",
      destination: targetHref,
      is_authenticated: isAuthenticated,
    })

    if (isAuthenticated) {
      e.preventDefault()
      router.push(authenticatedHref)
    }
  }

  return (
    <Link href={targetHref} onClick={handleClick} className={className}>
      <Button variant={variant} size={size} className={className}>
        {displayText}
      </Button>
    </Link>
  )
}

