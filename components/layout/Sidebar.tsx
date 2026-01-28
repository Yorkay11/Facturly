"use client";

import { Link, usePathname, useRouter } from '@/i18n/routing';
import Image from "next/image";
import { 
  FaHouse,
  FaFileInvoice,
  FaUsers,
  FaBox,
  FaRepeat,
  FaChartBar,
  FaGear,
  FaRightFromBracket,
  FaUser,
  FaChevronDown,
  FaChevronRight,
  FaXmark,
  FaChevronLeft,
  FaBuilding,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useNavigationBlock } from "@/contexts/NavigationBlockContext";
import { useGetMeQuery, useGetWorkspaceQuery, useGetSubscriptionQuery, useLogoutMutation } from "@/services/facturlyApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useTranslations } from 'next-intl';
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SidebarProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  profileOpen?: boolean;
  onProfileOpenChange?: (open: boolean) => void;
}

// Composant pour les items de navigation en mode collapsed (sans enfants)
const CollapsedNavItem = ({ 
  item, 
  Icon, 
  active, 
  handleNavClick 
}: { 
  item: { href: string; label: string }; 
  Icon: React.ComponentType<{ className?: string }>; 
  active: boolean; 
  handleNavClick: (href: string) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Popover open={isHovered} onOpenChange={setIsHovered}>
      <PopoverTrigger asChild>
        <Link
          href={item.href}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={(e) => {
            e.preventDefault();
            handleNavClick(item.href);
            setIsHovered(false);
          }}
          className={cn(
            "w-full flex items-center justify-center rounded-md p-2 text-xs font-medium transition-colors",
            active
              ? "bg-primary/10 text-primary"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          )}
          title={item.label}
        >
          <Icon className="h-4 w-4" />
        </Link>
      </PopoverTrigger>
      <PopoverContent 
        side="right" 
        align="center"
        className="px-2 py-1.5 text-xs font-medium"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {item.label}
      </PopoverContent>
    </Popover>
  );
};

// Composant pour les items de navigation en mode collapsed (avec enfants)
const CollapsedNavItemWithChildren = ({ 
  item, 
  Icon, 
  active, 
  pathname,
  handleNavClick 
}: { 
  item: { href: string; label: string; children?: Array<{ href: string; label: string }> }; 
  Icon: React.ComponentType<{ className?: string }>; 
  active: boolean; 
  pathname: string;
  handleNavClick: (href: string) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => setIsHovered(true), 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => setIsHovered(false), 200);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Popover open={isHovered} onOpenChange={setIsHovered}>
      <PopoverTrigger asChild>
        <button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "w-full flex items-center justify-center rounded-md p-2 text-xs font-medium transition-all duration-200",
            active
              ? "bg-primary/10 text-primary"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          )}
          title={item.label}
        >
          <Icon className="h-4 w-4 transition-transform duration-200" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        side="right" 
        align="start"
        className="w-56 p-2 animate-in fade-in-0 zoom-in-95 slide-in-from-left-1 duration-200"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="space-y-1">
          <div className="px-2 py-1.5 text-xs font-semibold text-slate-900 border-b border-slate-200">
            {item.label}
          </div>
          {item.children?.map((child) => {
            const childActive = pathname === child.href || pathname?.startsWith(`${child.href}/`);
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(child.href);
                  setIsHovered(false);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors duration-150",
                  childActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const Sidebar = ({ 
  isOpen: controlledOpen, 
  onOpenChange,
  profileOpen: controlledProfileOpen,
  onProfileOpenChange
}: SidebarProps) => {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const router = useRouter();
  const { handleNavigation } = useNavigationBlock();
  
  const t = useTranslations('navigation');
  const tTopbar = useTranslations('topbar');
  const commonT = useTranslations('common');
  
  const { data: user, isLoading: isLoadingUser } = useGetMeQuery();
  const { data: workspace } = useGetWorkspaceQuery();
  const { data: subscription, isLoading: isLoadingSubscription } = useGetSubscriptionQuery();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const [internalProfileOpen, setInternalProfileOpen] = useState(false);
  const isProfileOpen = controlledProfileOpen !== undefined ? controlledProfileOpen : internalProfileOpen;
  const setProfileOpen = onProfileOpenChange || setInternalProfileOpen;
  
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { isCollapsed, toggleCollapsed } = useSidebar();

  // Navigation items
  const navItems = [
    {
      label: t('dashboard'),
      href: "/dashboard",
      icon: FaHouse,
      iconActive: FaHouse,
    },
    {
      label: t('invoices'),
      href: "/invoices",
      icon: FaFileInvoice,
      iconActive: FaFileInvoice,
      children: [
        { label: t('invoicesCreated'), href: "/invoices" },
        { label: t('recurringInvoices'), href: "/recurring-invoices" },
        { label: t('invoicesReceived'), href: "/bills" },
        { label: t('newInvoice'), href: "/invoices/new" },
      ],
    },
    {
      label: t('clients'),
      href: "/clients",
      icon: FaUsers,
      iconActive: FaUsers,
    },
    {
      label: t('items'),
      href: "/items",
      icon: FaBox,
      iconActive: FaBox,
    },
    {
      label: t('reminders'),
      href: "/reminders",
      icon: FaRepeat,
      iconActive: FaRepeat,
    },
    {
      label: t('reports'),
      href: "/reports",
      icon: FaChartBar,
      iconActive: FaChartBar,
    },
    {
      label: t('settings'),
      href: "/settings",
      icon: FaGear,
      iconActive: FaGear,
    },
  ];

  // Auto-expand if child is active
  useEffect(() => {
    navItems.forEach(item => {
      if (item.children?.some(child => 
        pathname === child.href || pathname?.startsWith(`${child.href}/`)
      )) {
        setExpandedItems(prev => new Set(prev).add(item.href));
      }
    });
  }, [pathname]);

  const isActive = (href: string, children?: Array<{ href: string }>) => {
    if (pathname === href || pathname?.startsWith(`${href}/`)) return true;
    if (!children?.length) return false;
    return children.some(child => pathname === child.href || pathname?.startsWith(`${child.href}/`));
  };

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      next.has(href) ? next.delete(href) : next.add(href);
      return next;
    });
  };

  const handleNavClick = (href: string) => {
    handleNavigation(href);
    if (isMobile) setIsOpen(false);
  };

  const getInitials = () => {
    if (!user) return "U";
    const first = user.firstName?.charAt(0).toUpperCase() || "";
    const last = user.lastName?.charAt(0).toUpperCase() || "";
    return `${first}${last}` || "U";
  };

  const getUserDisplayName = () => {
    if (!user) return tTopbar('user');
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : user.email;
  };

  const getSubscriptionPlanName = () => {
    if (!subscription) return tTopbar('noPlan');
    const planNames: Record<"free" | "pro" | "enterprise" | "pay_as_you_go", string> = {
      free: tTopbar('planFree'),
      pro: tTopbar('planPro'),
      enterprise: tTopbar('planEnterprise'),
      pay_as_you_go: tTopbar('planPayAsYouGo') || 'Pay-as-you-go'
    };
    return planNames[subscription.plan] || tTopbar('noPlan');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-slate-200 px-2">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center flex-1 min-w-0">
            <Image
              src="/logos/logo.png"
              alt="Facturly"
              width={120}
              height={40}
              className="h-6 w-auto object-contain"
            />
          </Link>
        )}
        {isCollapsed && (
          <Link href="/dashboard" className="flex items-center justify-center w-full">
            <Image
              src="/logos/icon.png"
              alt="Facturly"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
          </Link>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <FaChevronRight className="h-3.5 w-3.5" />
            ) : (
              <FaChevronLeft className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsOpen(false)}
          >
            <FaXmark className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Workspace Selection */}
      {!isCollapsed && workspace && (
        <div className="border-b border-slate-200 px-2 py-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors hover:bg-slate-50 text-left">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FaBuilding className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-900 truncate leading-tight">
                    {workspace.name || tTopbar('workspace')}
                  </p>
                  <p className="text-[9px] text-slate-500 truncate leading-tight mt-0.5">
                    {workspace.type === 'COMPANY' ? tTopbar('workspaceTypeCompany') : tTopbar('workspaceTypeIndividual')}
                  </p>
                </div>
                <FaChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-2">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FaBuilding className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {workspace.name || tTopbar('workspace')}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {workspace.type === 'COMPANY' ? tTopbar('workspaceTypeCompany') : tTopbar('workspaceTypeIndividual')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    handleNavigation("/settings?tab=workspace");
                    if (isMobile) setIsOpen(false);
                  }}
                >
                  <FaGear className="h-3.5 w-3.5 mr-2" />
                  {tTopbar('manageAccount')}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
      {isCollapsed && workspace && (
        <div className="border-b border-slate-200 px-2 py-1.5 flex justify-center">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <FaBuilding className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-2">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FaBuilding className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {workspace.name || tTopbar('workspace')}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {workspace.type === 'COMPANY' ? tTopbar('workspaceTypeCompany') : tTopbar('workspaceTypeIndividual')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    handleNavigation("/settings?tab=workspace");
                    if (isMobile) setIsOpen(false);
                  }}
                >
                  <FaGear className="h-3.5 w-3.5 mr-2" />
                  {tTopbar('manageAccount')}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-1.5 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href, item.children);
          const Icon = active ? item.iconActive : item.icon;
          const isExpanded = expandedItems.has(item.href);
          const hasActiveChild = item.children?.some(child => 
            pathname === child.href || pathname?.startsWith(`${child.href}/`)
          );

          // Mode collapsed: afficher avec tooltip/popover
          if (isCollapsed) {
            const [isHovered, setIsHovered] = useState(false);
            
            if (item.children) {
              // Item avec enfants en mode collapsed: popover au survol
              return (
                <Popover key={item.href} open={isHovered} onOpenChange={setIsHovered}>
                  <PopoverTrigger asChild>
                    <button
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      className={cn(
                        "w-full flex items-center justify-center rounded-md p-2 text-xs font-medium transition-colors",
                        active || hasActiveChild
                          ? "bg-primary/10 text-primary"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      )}
                      title={item.label}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent 
                    side="right" 
                    align="start"
                    className="w-56 p-2"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <div className="space-y-1">
                      <div className="px-2 py-1.5 text-xs font-semibold text-slate-900 border-b border-slate-200">
                        {item.label}
                      </div>
                      {item.children.map((child) => {
                        const childActive = pathname === child.href || pathname?.startsWith(`${child.href}/`);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleNavClick(child.href);
                              setIsHovered(false);
                            }}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                              childActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              );
            } else {
              // Item simple en mode collapsed: tooltip au survol
              return (
                <Popover key={item.href} open={isHovered} onOpenChange={setIsHovered}>
                  <PopoverTrigger asChild>
                    <Link
                      href={item.href}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(item.href);
                        setIsHovered(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-center rounded-md p-2 text-xs font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      )}
                      title={item.label}
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  </PopoverTrigger>
                  <PopoverContent 
                    side="right" 
                    align="center"
                    className="px-2 py-1.5 text-xs font-medium"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    {item.label}
                  </PopoverContent>
                </Popover>
              );
            }
          }

          // Mode expanded: affichage normal
          return (
            <div key={item.href}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpanded(item.href)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                      active || hasActiveChild
                        ? "bg-primary/10 text-primary"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-[16px] w-[16px] shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <FaChevronDown 
                      className={cn(
                        "h-3 w-3 shrink-0 transition-transform duration-200",
                        isExpanded ? "rotate-180" : ""
                      )} 
                    />
                  </button>
                  {isExpanded && (
                    <div className="ml-6 mt-0.5 space-y-0.5">
                      {item.children.map((child) => {
                        const childActive = pathname === child.href || pathname?.startsWith(`${child.href}/`);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleNavClick(child.href);
                            }}
                            className={cn(
                              "block rounded-md px-2 py-1 text-[11px] transition-colors",
                              childActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-[16px] w-[16px] shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="border-t border-slate-200 p-2">
        {isCollapsed ? (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="w-full flex items-center justify-center rounded-md border border-slate-200 bg-white p-2 transition-colors hover:bg-slate-50"
                title={getUserDisplayName()}
              >
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                    {isLoadingUser ? "..." : getInitials()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </PopoverTrigger>
            <PopoverContent 
              side="right" 
              align="end"
              className="w-56 p-2 animate-in fade-in-0 zoom-in-95 slide-in-from-left-1 duration-200"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {isLoadingUser ? "..." : getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {isLoadingUser ? "..." : getUserDisplayName()}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {isLoadingSubscription ? "..." : getSubscriptionPlanName()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    setProfileOpen(true);
                  }}
                >
                  <FaUser className="h-3.5 w-3.5 mr-2" />
                  {tTopbar('userProfile')}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="w-full flex items-center gap-2 rounded-md border border-slate-200 bg-white p-2 transition-colors hover:bg-slate-50"
          >
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                {isLoadingUser ? "..." : getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[11px] font-semibold text-slate-900 truncate leading-tight">
                {isLoadingUser ? "..." : getUserDisplayName()}
              </p>
              <p className="text-[9px] text-slate-500 truncate leading-tight mt-0.5">
                {isLoadingSubscription ? "..." : getSubscriptionPlanName()}
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  );

  const ProfileSheet = () => (
    <Sheet open={isProfileOpen} onOpenChange={setProfileOpen}>
      <SheetContent side="right" className="w-full max-w-sm space-y-6">
        <SheetHeader>
          <SheetTitle>{tTopbar('userProfile')}</SheetTitle>
          <SheetDescription>
            {tTopbar('accountInfo')}
          </SheetDescription>
        </SheetHeader>
        {isLoadingUser ? (
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 pt-2">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-base font-semibold text-foreground">
                  {getUserDisplayName()}
                </p>
                <p className="text-sm text-foreground/60">{user?.email}</p>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {isLoadingSubscription ? commonT('loading') : getSubscriptionPlanName()}
              </Badge>
            </div>
            <div className="space-y-3 text-sm">
              {workspace && (
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <FaUser className="h-4 w-4 text-slate-600" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{tTopbar('workspace')}</p>
                    <p className="text-xs text-slate-600 truncate">
                      {workspace.name || workspace.city || workspace.country || ''}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        <SheetFooter className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("/settings?tab=profile");
              setProfileOpen(false);
            }}
          >
            {tTopbar('manageAccount')}
          </Button>
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={async (e) => {
              e.preventDefault();
              try {
                await logout().unwrap();
                if (typeof window !== "undefined") {
                  document.cookie = "facturly_access_token=; path=/; max-age=0";
                  document.cookie = "facturly_refresh_token=; path=/; max-age=0";
                }
                toast.success(tTopbar('logoutSuccess'), {
                  description: tTopbar('logoutSuccessDescription'),
                });
                setProfileOpen(false);
                router.push("/login");
              } catch (error) {
                if (typeof window !== "undefined") {
                  document.cookie = "facturly_access_token=; path=/; max-age=0";
                  document.cookie = "facturly_refresh_token=; path=/; max-age=0";
                }
                toast.error(tTopbar('logoutError'), {
                  description: tTopbar('logoutErrorDescription'),
                });
                setProfileOpen(false);
                router.push("/login");
              }
            }}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {tTopbar('loggingOut')}
              </>
            ) : (
              <>
                <FaRightFromBracket className="h-4 w-4 mr-2" />
                {tTopbar('logout')}
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );

  if (isMobile) {
    return (
      <>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="w-[280px] p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <ProfileSheet />
      </>
    );
  }

  return (
    <>
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-slate-200 bg-white transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <SidebarContent />
      </aside>
      <ProfileSheet />
    </>
  );
};

export default Sidebar;
