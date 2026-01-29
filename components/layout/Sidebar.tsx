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
  FaPlus,
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
import { useGetMeQuery, useLogoutMutation } from "@/services/facturlyApi";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { CreateWorkspaceModal } from "@/components/workspace/CreateWorkspaceModal";
import { clearWorkspaceIdCookie } from "@/lib/workspace-cookie";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useTranslations } from 'next-intl';
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
  const {
    currentWorkspace: workspace,
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspaceId,
    isLoadingWorkspaces,
  } = useWorkspace();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [workspacePopoverOpen, setWorkspacePopoverOpen] = useState(false);
  const isChangingWorkspaceRef = useRef(false);
  
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const [internalProfileOpen, setInternalProfileOpen] = useState(false);
  const isProfileOpen = controlledProfileOpen !== undefined ? controlledProfileOpen : internalProfileOpen;
  const setProfileOpen = onProfileOpenChange || setInternalProfileOpen;
  
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const effectiveCollapsed = isCollapsed && !isMobile;
  
  // Fermer le popover quand le workspace change
  useEffect(() => {
    if (currentWorkspaceId) {
      setWorkspacePopoverOpen(false);
    }
  }, [currentWorkspaceId]);

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

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white min-h-0 overflow-hidden">
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between border-b border-slate-200 px-2",
        isMobile ? "h-14 min-h-14" : "h-12"
      )}>
        {!effectiveCollapsed && (
          <Link href="/dashboard" className="flex items-center flex-1 min-w-0" onClick={() => isMobile && setIsOpen(false)}>
            <Image
              src="/logos/logo.png"
              alt="Facturly"
              width={120}
              height={40}
              className="h-6 w-auto object-contain"
            />
          </Link>
        )}
        {effectiveCollapsed && (
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
            className="h-9 w-9 -mr-1 touch-manipulation"
            onClick={() => setIsOpen(false)}
            aria-label="Fermer le menu"
          >
            <FaXmark className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Workspace Selection */}
      {!effectiveCollapsed && (workspace || isLoadingWorkspaces) && (
        <div className={cn(
          "border-b border-slate-200 flex-shrink-0",
          isMobile ? "px-3 py-2" : "px-2 py-1.5"
        )}>
          <Popover open={workspacePopoverOpen} onOpenChange={setWorkspacePopoverOpen}>
            <PopoverTrigger asChild>
              <button className={cn(
                "w-full flex items-center gap-2 rounded-md text-xs font-medium transition-colors hover:bg-slate-50 text-left touch-manipulation",
                isMobile ? "px-3 py-2.5" : "px-2 py-1.5"
              )}>
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FaBuilding className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-900 truncate leading-tight">
                    {workspace?.name || tTopbar('workspace')}
                  </p>
                  <p className="text-[9px] text-slate-500 truncate leading-tight mt-0.5">
                    {workspace ? (workspace.type === 'COMPANY' ? tTopbar('workspaceTypeCompany') : tTopbar('workspaceTypeIndividual')) : '…'}
                  </p>
                </div>
                <FaChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 px-1">{tTopbar('yourWorkspaces')}</p>
                {workspaces.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      if (isChangingWorkspaceRef.current || w.id === currentWorkspaceId) return;
                      isChangingWorkspaceRef.current = true;
                      setWorkspacePopoverOpen(false);
                      setCurrentWorkspaceId(w.id);
                      if (isMobile) setIsOpen(false);
                      setTimeout(() => {
                        isChangingWorkspaceRef.current = false;
                      }, 500);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      w.id === currentWorkspaceId
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-slate-100 text-slate-700"
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FaBuilding className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{w.name || tTopbar('workspace')}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {w.type === 'COMPANY' ? tTopbar('workspaceTypeCompany') : tTopbar('workspaceTypeIndividual')}
                      </p>
                    </div>
                  </button>
                ))}
                <div className="border-t border-slate-200 pt-2 space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => {
                      setCreateModalOpen(true);
                      setWorkspacePopoverOpen(false);
                    }}
                  >
                    <FaPlus className="h-3.5 w-3.5 mr-2" />
                    {tTopbar('createWorkspace')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => {
                      handleNavigation("/settings?tab=workspace");
                      setWorkspacePopoverOpen(false);
                      if (isMobile) setIsOpen(false);
                    }}
                  >
                    <FaGear className="h-3.5 w-3.5 mr-2" />
                    {tTopbar('manageAccount')}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
      {effectiveCollapsed && (workspace || isLoadingWorkspaces) && (
        <div className="border-b border-slate-200 px-2 py-1.5 flex justify-center">
          <Popover open={workspacePopoverOpen} onOpenChange={setWorkspacePopoverOpen}>
            <PopoverTrigger asChild>
              <button className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <FaBuilding className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 px-1">{tTopbar('yourWorkspaces')}</p>
                {workspaces.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      if (isChangingWorkspaceRef.current || w.id === currentWorkspaceId) return;
                      isChangingWorkspaceRef.current = true;
                      setWorkspacePopoverOpen(false);
                      setCurrentWorkspaceId(w.id);
                      if (isMobile) setIsOpen(false);
                      setTimeout(() => {
                        isChangingWorkspaceRef.current = false;
                      }, 500);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      w.id === currentWorkspaceId
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-slate-100 text-slate-700"
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FaBuilding className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{w.name || tTopbar('workspace')}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {w.type === 'COMPANY' ? tTopbar('workspaceTypeCompany') : tTopbar('workspaceTypeIndividual')}
                      </p>
                    </div>
                  </button>
                ))}
                <div className="border-t border-slate-200 pt-2 space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => {
                      setCreateModalOpen(true);
                      setWorkspacePopoverOpen(false);
                    }}
                  >
                    <FaPlus className="h-3.5 w-3.5 mr-2" />
                    {tTopbar('createWorkspace')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => {
                      handleNavigation("/settings?tab=workspace");
                      setWorkspacePopoverOpen(false);
                      if (isMobile) setIsOpen(false);
                    }}
                  >
                    <FaGear className="h-3.5 w-3.5 mr-2" />
                    {tTopbar('manageAccount')}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto overscroll-contain px-2 py-1.5 space-y-0.5",
        isMobile && "py-2 space-y-1"
      )}>
        {navItems.map((item) => {
          const active = isActive(item.href, item.children);
          const Icon = active ? item.iconActive : item.icon;
          const isExpanded = expandedItems.has(item.href);
          const hasActiveChild = item.children?.some(child => 
            pathname === child.href || pathname?.startsWith(`${child.href}/`)
          );

          if (effectiveCollapsed) {
            if (item.children) {
              return (
                <CollapsedNavItemWithChildren
                  key={item.href}
                  item={{ ...item, children: item.children }}
                  Icon={Icon}
                  active={active || !!hasActiveChild}
                  pathname={pathname ?? ""}
                  handleNavClick={handleNavClick}
                />
              );
            }
            return (
              <CollapsedNavItem
                key={item.href}
                item={item}
                Icon={Icon}
                active={active}
                handleNavClick={handleNavClick}
              />
            );
          }

          const btnCls = "w-full flex items-center justify-between rounded-md text-xs font-medium transition-colors touch-manipulation";
          const linkCls = "w-full flex items-center gap-2 rounded-md text-xs font-medium transition-colors touch-manipulation";
          const navClsActive = "bg-primary/10 text-primary";
          const navClsInactive = "text-slate-700 hover:bg-slate-100 hover:text-slate-900";
          const padY = isMobile ? "py-3 px-3" : "px-2 py-1.5";
          const childPadY = isMobile ? "py-2.5 px-3" : "px-2 py-1";
          const childMl = isMobile ? "ml-4" : "ml-6";

          return (
            <div key={item.href}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpanded(item.href)}
                    className={cn(
                      btnCls, padY,
                      active || hasActiveChild ? navClsActive : navClsInactive
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <FaChevronDown 
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                        isExpanded ? "rotate-180" : ""
                      )} 
                    />
                  </button>
                  {isExpanded && (
                    <div className={cn(childMl, "mt-0.5 space-y-0.5")}>
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
                              "block rounded-md text-[11px] transition-colors touch-manipulation",
                              childPadY,
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
                    linkCls, padY,
                    active ? navClsActive : navClsInactive
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* User profile */}
      <div className={cn(
        "border-t border-slate-200 p-2 flex-shrink-0",
        isMobile && "p-3"
      )}>
        {effectiveCollapsed ? (
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
            className={cn(
              "w-full flex items-center gap-2 rounded-md border border-slate-200 bg-white transition-colors hover:bg-slate-50 touch-manipulation",
              isMobile ? "p-3" : "p-2"
            )}
          >
            <Avatar className={cn("shrink-0", isMobile ? "h-9 w-9" : "h-7 w-7")}>
              <AvatarFallback className={cn(
                "bg-primary text-primary-foreground",
                isMobile ? "text-xs" : "text-[10px]"
              )}>
                {isLoadingUser ? "..." : getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <p className={cn(
                "font-semibold text-slate-900 truncate leading-tight",
                isMobile ? "text-sm" : "text-[11px]"
              )}>
                {isLoadingUser ? "..." : getUserDisplayName()}
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
                  clearWorkspaceIdCookie();
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
          <SheetContent
            side="left"
            className="w-[85vw] max-w-[300px] p-0 gap-0 [&>button]:hidden h-full flex flex-col overflow-hidden"
          >
            <div className="flex flex-col h-full overflow-hidden min-h-0">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
        <ProfileSheet />
        <CreateWorkspaceModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
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
      <CreateWorkspaceModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </>
  );
};

export default Sidebar;
