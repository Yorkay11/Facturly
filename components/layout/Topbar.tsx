"use client";

import { usePathname } from '@/i18n/routing';
import { 
  FaMagnifyingGlass,
  FaCircleQuestion,
  FaPlus
} from "react-icons/fa6";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useNavigationBlock } from "@/contexts/NavigationBlockContext";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useTranslations } from 'next-intl';
import { useSidebar } from "@/contexts/SidebarContext";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { BalanceDisplay } from "./BalanceDisplay";

export const Topbar = () => {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { handleNavigation } = useNavigationBlock();
  const [searchOpen, setSearchOpen] = useState(false);
  const t = useTranslations('navigation');
  const tTopbar = useTranslations('topbar');

  // Quick navigation items for search
  const quickNavItems = [
    { label: t('dashboard'), href: "/dashboard", keywords: ["dashboard", "accueil", "home"] },
    { label: t('invoices'), href: "/invoices", keywords: ["factures", "invoices", "facture"] },
    { label: t('invoicesCreated'), href: "/invoices", keywords: ["factures créées", "created"] },
    { label: t('recurringInvoices'), href: "/recurring-invoices", keywords: ["récurrentes", "recurring"] },
    { label: t('newInvoice'), href: "/invoices/new", keywords: ["nouvelle facture", "new invoice"] },
    { label: t('clients'), href: "/clients", keywords: ["clients", "client"] },
    { label: t('items'), href: "/items", keywords: ["articles", "items", "produits"] },
    { label: t('reminders'), href: "/reminders", keywords: ["relances", "reminders"] },
    { label: t('reports'), href: "/reports", keywords: ["rapports", "reports"] },
    { label: t('settings'), href: "/settings", keywords: ["paramètres", "settings"] },
  ];

  const handleSearchSelect = (href: string) => {
    handleNavigation(href);
    setSearchOpen(false);
  };

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
        {/* Left: Search */}
        <div className="flex-1 max-w-2xl">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full justify-start text-left text-slate-500 h-8",
              "hover:bg-slate-50 border-slate-200 text-xs"
            )}
            onClick={() => setSearchOpen(true)}
          >
            <FaMagnifyingGlass className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline text-xs">Rechercher...</span>
            <span className="sm:hidden text-xs">Recherche</span>
            <kbd className="pointer-events-none ml-auto hidden h-4 select-none items-center gap-0.5 rounded border bg-muted px-1 font-mono text-[9px] font-medium opacity-100 sm:flex">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          </Button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 ml-2">
          {/* Balance Display */}
          <BalanceDisplay variant="default" />
          
          {/* New Invoice Button */}
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 bg-primary hover:bg-primary/90 h-8 text-xs px-2.5"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("/invoices/new");
            }}
          >
            <FaPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('newInvoice')}</span>
          </Button>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Help/Support */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              window.open("https://docs.facturly.app", "_blank");
            }}
            aria-label={t('support')}
          >
            <FaCircleQuestion className="h-4 w-4" />
          </Button>

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>
      </div>

      {/* Command Dialog for Search */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Rechercher une page..." />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {quickNavItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => handleSearchSelect(item.href)}
                className="cursor-pointer"
              >
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
};

export default Topbar;
