"use client";

import { usePathname } from '@/i18n/routing';
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
      { label: t('dashboard'), icon: <LayoutGrid />, link: '/dashboard' },
      { label: t('invoices'), icon: <FileText />, link: '/invoices' },
      { label: t('newInvoice'), icon: <Receipt />, link: '/invoices/new' },
      { label: t('clients'), icon: <Users />, link: '/clients' },
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
      "fixed top-0 right-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80",
      "h-12 transition-all duration-300",
      isCollapsed ? "left-16" : "left-64"
    )}>
      <div className="flex h-full items-center justify-between px-2 lg:px-3">
        {/* Left: Search button */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          onClick={() => setSearchOpen(true)}
          aria-label={t('spotlightPlaceholder')}
        >
          <FaMagnifyingGlass className="h-4 w-4" />
        </Button>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 ml-2">
          {/* Balance Display */}
          <BalanceDisplay variant="default" />
          
          {/* New Invoice Button */}
          <MovingBorderButton
            wrapperClassName="shrink-0"
            className="gap-1.5 h-8 text-xs px-3"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("/invoices/new");
            }}
          >
            <FaPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('newInvoice')}</span>
          </MovingBorderButton>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Help/Support */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={t('support')}
              >
                <FaCircleQuestion className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-1" align="end" sideOffset={8}>
              <a
                href="https://docs.facturly.online"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {tTopbar('supportDocumentation')}
              </a>
              <a
                href="mailto:support@facturly.online"
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground break-all"
              >
                {tTopbar('supportContact')} — {tTopbar('supportEmail')}
              </a>
            </PopoverContent>
          </Popover>

          {/* Language Switcher */}
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
