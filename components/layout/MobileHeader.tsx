"use client";

import { Link } from '@/i18n/routing';
import Image from "next/image";
import { IoMenuOutline, IoAddOutline, IoNotificationsOutline } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGetMeQuery, useGetSubscriptionQuery } from "@/services/facturlyApi";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useTranslations } from 'next-intl';
import { useNavigationBlock } from "@/contexts/NavigationBlockContext";
import { BalanceDisplay } from "./BalanceDisplay";

interface MobileHeaderProps {
  onMenuClick: () => void;
  onProfileClick: () => void;
}

export const MobileHeader = ({ onMenuClick, onProfileClick }: MobileHeaderProps) => {
  const isMobile = useIsMobile();
  const { handleNavigation } = useNavigationBlock();
  const { data: user, isLoading: isLoadingUser } = useGetMeQuery();
  const { data: subscription } = useGetSubscriptionQuery();
  const t = useTranslations('navigation');
  const tTopbar = useTranslations('topbar');
  
  // Generate avatar initials
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    const first = firstName?.charAt(0).toUpperCase() || "";
    const last = lastName?.charAt(0).toUpperCase() || "";
    return `${first}${last}` || "U";
  };

  if (!isMobile) return null;

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <IoMenuOutline className="h-5 w-5" />
      </Button>
      
      <Link href="/dashboard" className="flex items-center">
        <Image
          src="/logos/logo.png"
          alt="Facturly"
          width={100}
          height={33}
          className="h-6 w-auto object-contain"
        />
      </Link>

      <div className="flex items-center gap-2">
        <BalanceDisplay variant="compact" />
        <Button 
          variant="ghost" 
          size="icon"
          className="h-9 w-9"
          onClick={(e) => {
            e.preventDefault();
            handleNavigation("/invoices/new");
          }}
          aria-label={t('newInvoice')}
        >
          <IoAddOutline className="h-5 w-5" />
        </Button>
        <NotificationDropdown />
        <button
          type="button"
          onClick={onProfileClick}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 transition hover:bg-primary/20"
          aria-label={t('openUserProfile')}
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {isLoadingUser ? "..." : getInitials(user?.firstName, user?.lastName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;
