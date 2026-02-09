"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { IoMenuOutline } from "react-icons/io5"
import { Link } from '@/i18n/routing'
import Image from "next/image"
import { useRouter } from '@/i18n/routing'
import { useAuth } from "@/hooks/useAuth"
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useWaitlist } from "@/contexts/WaitlistContext"

export function Header() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { openWaitlist } = useWaitlist()
  const t = useTranslations('landing.header')
  const buttonText = isAuthenticated ? t('dashboard') : t('tryFree')
  const buttonHref = isAuthenticated ? "/dashboard" : "#"

  const navItems = [
    { name: t('home'), href: "/?landing=1" },
    { name: t('howItWorks'), href: "/how-it-works" },
    { name: t('features'), href: "/features" },
    { name: t('pricing'), href: "/pricing" },
    { name: t('testimonials'), href: "/testimonials" },
  ]

  const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isAuthenticated) {
      e.preventDefault()
      router.push("/dashboard")
    } else {
      e.preventDefault()
      openWaitlist()
    }
  }

  return (
    <header className="w-full py-3 md:py-4 px-1 md:px-2">
      <div className="max-w-[1320px] mx-auto flex items-center justify-between px-2 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/?landing=1" className="flex items-center gap-3 shrink-0">
            <Image
              src="/logos/logo.png"
              alt="Facturly"
              width={100}
              height={32}
              className="h-7 md:h-8 w-auto object-contain max-w-[100px] md:max-w-[120px]"
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-black text-sm hover:text-foreground px-4 py-2 rounded-full font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link href={buttonHref} onClick={handleCTAClick} className="hidden md:block">
            <Button className="relative bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-2 rounded-full font-medium shadow-sm overflow-hidden group">
              <span className="relative z-10">{buttonText}</span>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
            </Button>
          </Link>
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <IoMenuOutline className="h-7 w-7" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-background border-t border-border text-foreground">
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-semibold text-foreground">{t('navigation')}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-[#888888] hover:text-foreground justify-start text-lg py-2"
                  >
                    {item.name}
                  </Link>
                ))}
                <Link href={buttonHref} onClick={handleCTAClick} className="w-full mt-4">
                  <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-2 rounded-full font-medium shadow-sm shimmer-effect">
                    {buttonText}
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
