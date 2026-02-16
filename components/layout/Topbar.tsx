"use client";

import { Link, usePathname } from '@/i18n/routing';
import Image from "next/image";
import {
  FaMagnifyingGlass,
  FaCircleQuestion,
  FaPlus
} from "react-icons/fa6";
import {
  LayoutGrid,
  FileText,
  Receipt,
  Users,
  Package,
  Bell,
  BarChart3,
  Settings,
  RotateCcw,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { useNavigationBlock } from "@/contexts/NavigationBlockContext";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useTranslations } from 'next-intl';
import { useSidebar } from "@/contexts/SidebarContext";
import AppleSpotlight, { type Shortcut, type SearchResult } from "@/components/apple-spotlight";
import MovingBorderButton from "@/components/moving-border-button";
import { BalanceDisplay } from "./BalanceDisplay";

export const Topbar = () => {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { handleNavigation } = useNavigationBlock();
  const [searchOpen, setSearchOpen] = useState(false);
  const t = useTranslations('navigation');
  const tTopbar = useTranslations('topbar');

  // Shortcuts and search results for Apple Spotlight (i18n)
  const spotlightShortcuts: Shortcut[] = useMemo(
    () => [
      { label: t('dashboard'), icon: <LayoutGrid />, link: '/dashboard', color: '#3b82f6' },
      { label: t('invoices'), icon: <FileText />, link: '/invoices', color: '#10b981' },
      { label: t('newInvoice'), icon: <Receipt />, link: '/invoices/new', color: '#8b5cf6' },
      { label: t('clients'), icon: <Users />, link: '/clients', color: '#f59e0b' },
    ],
    [t]
  );

  const spotlightSearchResults: SearchResult[] = useMemo(
    () => [
      { icon: <LayoutGrid />, label: t('dashboard'), description: t('dashboardDescription'), link: '/dashboard' },
      { icon: <FileText />, label: t('invoices'), description: t('invoicesDescription'), link: '/invoices' },
      { icon: <Receipt />, label: t('newInvoice'), description: t('newInvoiceDescription'), link: '/invoices/new' },
      { icon: <RotateCcw />, label: t('recurringInvoices'), description: t('recurringInvoicesDescription'), link: '/recurring-invoices' },
      { icon: <Users />, label: t('clients'), description: t('clientsDescription'), link: '/clients' },
      { icon: <Package />, label: t('items'), description: t('itemsDescription'), link: '/items' },
      { icon: <Bell />, label: t('reminders'), description: t('remindersDescription'), link: '/reminders' },
      { icon: <BarChart3 />, label: t('reports'), description: t('reportsDescription'), link: '/reports' },
      { icon: <Settings />, label: t('settings'), description: t('settingsDescription'), link: '/settings' },
    ],
    [t]
  );

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { isCollapsed } = useSidebar();

  return (
    <header className={cn(
      "fixed top-0 right-0 z-30 transition-[left] duration-300 ease-out",
      "h-14 border-b border-border/40",
      "bg-background/75 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60",
      "shadow-[0_1px_0_0_var(--border)]",
      isCollapsed ? "left-16" : "left-64"
    )}>
      <div className="flex h-full items-center justify-between gap-6 px-4 sm:px-5 lg:px-8">
        {/* Left: Logo + Spotlight-style search pill */}
        <div className="flex items-center gap-4 min-w-0 flex-1 max-w-2xl">
          <Link
            href="/dashboard"
            className="shrink-0 flex items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Image
              src="/logos/logo.png"
              alt="Facturly"
              width={100}
              height={32}
              className="h-7 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={t('spotlightPlaceholder')}
            className={cn(
              "flex items-center gap-2.5 min-w-0 flex-1 max-w-md",
              "h-9 pl-3.5 pr-3 rounded-full",
              "bg-muted/40 border border-border/50",
              "text-sm text-muted-foreground placeholder:text-muted-foreground/80",
              "hover:bg-muted/60 hover:border-border/70 hover:text-foreground/90",
              "transition-colors duration-200 ease-out"
            )}
          >
            <FaMagnifyingGlass className="h-4 w-4 shrink-0 text-muted-foreground/90" />
            <span className="hidden sm:inline truncate">{t('spotlightPlaceholder')}</span>
            <kbd className="hidden lg:inline-flex ml-auto shrink-0 h-5 items-center gap-0.5 rounded bg-muted/80 px-1.5 font-sans text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions — pill group */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
          <BalanceDisplay variant="default" className="rounded-full h-9 px-3.5 text-xs font-medium border-border/50 bg-muted/30 hover:bg-muted/50" />

          <MovingBorderButton
            wrapperClassName="shrink-0"
            className="gap-2 h-9 text-xs font-medium px-4 rounded-full"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("/invoices/new");
            }}
          >
            <FaPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('newInvoice')}</span>
          </MovingBorderButton>

          <div className="w-px h-5 bg-border/50 mx-0.5" aria-hidden />

          <NotificationDropdown />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors duration-200"
                aria-label={t('support')}
              >
                <FaCircleQuestion className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-64 rounded-2xl border-border/60 p-1.5 shadow-xl shadow-black/5 bg-background/95 backdrop-blur-xl"
              align="end"
              sideOffset={10}
            >
              <a
                href="https://docs.facturly.online"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors hover:bg-muted/60 focus:bg-muted/60"
              >
                {tTopbar('supportDocumentation')}
              </a>
              <a
                href="mailto:support@facturly.online"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors hover:bg-muted/60 focus:bg-muted/60 break-all"
              >
                {tTopbar('supportContact')} — {tTopbar('supportEmail')}
              </a>
            </PopoverContent>
          </Popover>

          <LanguageSwitcher />
        </div>
      </div>

      {/* Global search: Apple Spotlight (Cmd/Ctrl + K) */}
      <AppleSpotlight
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={(href) => {
          handleNavigation(href);
          setSearchOpen(false);
        }}
        shortcuts={spotlightShortcuts}
        searchResults={spotlightSearchResults}
        placeholder={t('spotlightPlaceholder')}
        emptyText={t('spotlightEmpty')}
      />
    </header>
  );
};

export default Topbar;
