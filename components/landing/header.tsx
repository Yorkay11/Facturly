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

export function Header() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const t = useTranslations('landing.header')
  const buttonText = isAuthenticated ? t('dashboard') : t('tryFree')
  const buttonHref = isAuthenticated ? "/dashboard" : "/login"

  const navItems = [
    { name: t('features'), href: "/features" },
    { name: t('pricing'), href: "/pricing" },
    { name: t('testimonials'), href: "/testimonials" },
  ]

  const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isAuthenticated) {
      e.preventDefault()
      router.push("/dashboard")
    }
  }

  return (
    <header className="w-full py-3 md:py-4 px-4 md:px-6">
      <div className="max-w-[1320px] mx-auto flex items-center justify-between px-2 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 shrink-0">
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
                className="text-[#888888] hover:text-foreground px-4 py-2 rounded-full font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link href={buttonHref} onClick={handleCTAClick} className="hidden md:block">
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-2 rounded-full font-medium shadow-sm">
              {buttonText}
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
                  <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-2 rounded-full font-medium shadow-sm">
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
