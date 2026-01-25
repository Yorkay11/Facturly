"use client";

import { Link, usePathname } from '@/i18n/routing';
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslations } from 'next-intl';
import * as React from "react";
import { 
  IoHomeOutline, 
  IoHome, 
  IoDocumentTextOutline, 
  IoDocumentText,
  IoPeopleOutline,
  IoPeople,
  IoSettingsOutline,
  IoSettings
} from "react-icons/io5";
import { cn } from "@/lib/utils";
import { useGetUnreadNotificationsCountQuery } from "@/services/facturlyApi";

export function BottomTabs() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const t = useTranslations('navigation');

  // Récupérer le nombre de notifications non lues
  const { data: unreadCountResponse } = useGetUnreadNotificationsCountQuery(undefined, {
    pollingInterval: 30000,
  });
  const unreadCount = unreadCountResponse?.count ?? 0;

  // Ne pas afficher sur certaines pages
  const hiddenPaths = ['/onboarding'];
  const shouldHide = hiddenPaths.some(path => pathname?.includes(path));
  
  // Afficher sur mobile et tablettes (jusqu'à lg: 1024px)
  if (shouldHide) {
    return null;
  }
  
  // Vérifier si on est sur mobile ou tablette (< 1024px)
  const [isTabletOrMobile, setIsTabletOrMobile] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 1024;
  });

  React.useEffect(() => {
    const handler = () => {
      setIsTabletOrMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  if (!isTabletOrMobile) {
    return null;
  }

  const tabs = [
    {
      href: "/dashboard",
      label: t('dashboard'),
      icon: IoHomeOutline,
      activeIcon: IoHome,
      isActive: pathname === "/dashboard" || pathname?.startsWith("/dashboard"),
    },
    {
      href: "/invoices",
      label: t('invoices'),
      icon: IoDocumentTextOutline,
      activeIcon: IoDocumentText,
      isActive: pathname?.startsWith("/invoices"),
    },
    {
      href: "/clients",
      label: t('clients'),
      icon: IoPeopleOutline,
      activeIcon: IoPeople,
      isActive: pathname?.startsWith("/clients"),
    },
    {
      href: "/settings",
      label: t('settings'),
      icon: IoSettingsOutline,
      activeIcon: IoSettings,
      isActive: pathname?.startsWith("/settings"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border lg:hidden shadow-lg">
      <div className="flex items-center justify-around h-16 md:h-20 px-2 md:px-4">
        {tabs.map((tab) => {
          const Icon = tab.isActive ? tab.activeIcon : tab.icon;
          const showBadge = tab.href === "/dashboard" && unreadCount > 0;
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors relative min-h-[44px] min-w-[44px]",
                tab.isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-primary"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5 md:h-6 md:w-6" />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] md:text-xs font-bold flex items-center justify-center border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs md:text-sm font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
