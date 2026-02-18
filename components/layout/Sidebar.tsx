"use client";

import { Link, usePathname, useRouter } from '@/i18n/routing';
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
import { CreateWorkspaceModal } from "@/components/workspace/CreateWorkspaceModal";

interface SidebarProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  profileOpen?: boolean;
  onProfileOpenChange?: (open: boolean) => void;
  /** Quand true, ouvre le modal de création de workspace (profil incomplet) au lieu de rediriger vers /create-workspace */
  openCreateWorkspaceModal?: boolean;
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
      <PopoverTrigger asChild className='border-none'>
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
            "relative w-full flex items-center justify-center rounded-xl py-2.5 text-xs font-medium transition-all duration-200",
            active
              ? "bg-white/[0.1] text-white"
              : "text-white/90 hover:bg-white/[0.06] hover:text-white"
          )}
          title={item.label}
        >
          <Icon className="h-4 w-4" />
          {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white rounded-r-full" aria-hidden />}
        </Link>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="center"
        className="px-3 py-2 text-xs font-medium rounded-xl border-border/60 shadow-xl shadow-black/10 bg-background/95 backdrop-blur-xl w-fit whitespace-nowrap"
        sideOffset={12}
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
      <PopoverTrigger asChild className='border-none'>
        <button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "relative w-full flex items-center justify-center rounded-xl py-2.5 text-xs font-medium transition-all duration-200",
            active
              ? "bg-white/[0.1] text-white"
              : "text-white/90 hover:bg-white/[0.06] hover:text-white"
          )}
          title={item.label}
        >
          <Icon className="h-4 w-4" />
          {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white rounded-r-full" aria-hidden />}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className="w-56 p-2 rounded-2xl border-border/60 shadow-xl shadow-black/10 bg-background/95 backdrop-blur-xl"
        sideOffset={12}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="space-y-0.5">
          <div className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                  "flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors duration-200",
                  childActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/80"
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
  onProfileOpenChange,
  openCreateWorkspaceModal = false,
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
  const [workspacePopoverOpen, setWorkspacePopoverOpen] = useState(false);
  const isChangingWorkspaceRef = useRef(false);
  
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const [internalProfileOpen, setInternalProfileOpen] = useState(false);
  const isProfileOpen = controlledProfileOpen !== undefined ? controlledProfileOpen : internalProfileOpen;
  const setProfileOpen = onProfileOpenChange || setInternalProfileOpen;

  const [createWorkspaceModalOpen, setCreateWorkspaceModalOpen] = useState(false);
  const isCreateWorkspaceModalOpen = openCreateWorkspaceModal || createWorkspaceModalOpen;
  
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
    <div className="flex h-full flex-col min-h-0 overflow-hidden bg-transparent">
      {/* Header: collapse/close only — logo is in Topbar */}
      <div className={cn(
        "flex items-center justify-center border-b border-white/10",
        isMobile ? "h-14 min-h-14" : "h-12"
      )}>
        {!isMobile && (
          <Button
            variant="default"
            className="h-4 w-4 shrink-0 text-white hover:bg-white/10 bg-transparent focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-0 shadow-none"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <FaChevronRight className="h-4 w-4" />
            ) : (
              <FaChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
        {isMobile && (
          <Button
            variant="default"
            className="h-4 w-4 shrink-0 text-white hover:bg-white/10 bg-transparent focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-0 shadow-none"
            onClick={() => setIsOpen(false)}
            aria-label="Fermer le menu"
          >
            <FaXmark className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Workspace Selection */}
      {!effectiveCollapsed && (workspace || isLoadingWorkspaces) && (
        <div className={cn(
          "border-b border-white/[0.06] flex-shrink-0",
          isMobile ? "px-3 py-2" : "px-2.5 py-2"
        )}>
          <Popover open={workspacePopoverOpen} onOpenChange={setWorkspacePopoverOpen}>
            <PopoverTrigger asChild>
              <button className={cn(
                "w-full flex items-center gap-2.5 rounded-xl text-left touch-manipulation transition-colors duration-200",
                "hover:bg-white/[0.06] active:bg-white/[0.08]",
                isMobile ? "px-3 py-2.5" : "px-2.5 py-2"
              )}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-white overflow-hidden">
                  {workspace?.logoUrl ? (
                    <img
                      src={workspace.logoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FaBuilding className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate leading-tight">
                    {workspace?.name || tTopbar('workspace')}
                  </p>
                  <p className="text-[10px] text-white/70 truncate leading-tight mt-0.5">
                    {workspace 
                      ? workspace.type === 'COMPANY' 
                        ? tTopbar('workspaceTypeCompany')
                        : workspace.type === 'FREELANCE'
                        ? tTopbar('workspaceTypeFreelance')
                        : tTopbar('workspaceTypeIndividual')
                      : '…'}
                  </p>
                </div>
                <FaChevronDown className="h-3.5 w-3.5 text-white/60 shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 rounded-2xl border-border/60 p-2 shadow-xl shadow-black/10 bg-background/95 backdrop-blur-xl" align="start" sideOffset={12}>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5">{tTopbar('yourWorkspaces')}</p>
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
                      "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                      w.id === currentWorkspaceId
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/80 text-foreground"
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-primary/10 text-primary">
                      {w.logoUrl ? (
                        <img src={w.logoUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <FaBuilding className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{w.name || tTopbar('workspace')}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {w.type === 'COMPANY' 
                          ? tTopbar('workspaceTypeCompany')
                          : w.type === 'FREELANCE'
                          ? tTopbar('workspaceTypeFreelance')
                          : tTopbar('workspaceTypeIndividual')}
                      </p>
                    </div>
                  </button>
                ))}
                <div className="border-t border-border/60 pt-2 mt-2 space-y-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs rounded-xl hover:bg-muted/80 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    onClick={() => {
                      setCreateWorkspaceModalOpen(true);
                      setWorkspacePopoverOpen(false);
                      if (isMobile) setIsOpen(false);
                    }}
                  >
                    <FaPlus className="h-3.5 w-3.5 mr-2" />
                    {tTopbar('createWorkspace')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs rounded-xl hover:bg-muted/80 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
        <div className="border-b border-white/[0.06] py-2 flex justify-center">
          <Popover open={workspacePopoverOpen} onOpenChange={setWorkspacePopoverOpen}>
            <PopoverTrigger asChild>
              <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08] text-white hover:bg-white/[0.12] transition-colors duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 overflow-hidden" aria-label={tTopbar('workspace')}>
                {workspace?.logoUrl ? (
                  <img
                    src={workspace.logoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FaBuilding className="h-4 w-4" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 rounded-2xl border-border/60 p-2 shadow-xl shadow-black/10 bg-background/95 backdrop-blur-xl" align="start" sideOffset={12}>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5">{tTopbar('yourWorkspaces')}</p>
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
                      "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                      w.id === currentWorkspaceId
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/80 text-foreground"
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-primary/10 text-primary">
                      {w.logoUrl ? (
                        <img src={w.logoUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <FaBuilding className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{w.name || tTopbar('workspace')}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {w.type === 'COMPANY' 
                          ? tTopbar('workspaceTypeCompany')
                          : w.type === 'FREELANCE'
                          ? tTopbar('workspaceTypeFreelance')
                          : tTopbar('workspaceTypeIndividual')}
                      </p>
                    </div>
                  </button>
                ))}
                <div className="border-t border-border/60 pt-2 mt-2 space-y-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs rounded-xl hover:bg-muted/80 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    onClick={() => {
                      setCreateWorkspaceModalOpen(true);
                      setWorkspacePopoverOpen(false);
                      if (isMobile) setIsOpen(false);
                    }}
                  >
                    <FaPlus className="h-3.5 w-3.5 mr-2" />
                    {tTopbar('createWorkspace')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs rounded-xl hover:bg-muted/80 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
        "flex-1 overflow-y-auto overscroll-contain py-2 space-y-0.5",
        isMobile && "py-3 space-y-1 px-2"
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

          const padX = isMobile ? "px-3" : "px-2.5";
          const padY = isMobile ? "py-3" : "py-2";
          const childPadY = isMobile ? "py-2.5 pl-5" : "py-1.5 pl-5";
          const childMl = isMobile ? "ml-2" : "ml-2";

          return (
            <div key={item.href} className={padX}>
              {item.children ? (
                <div className="space-y-0.5">
                  <button
                    onClick={() => toggleExpanded(item.href)}
                    className={cn(
                      "relative w-full flex items-center justify-between rounded-xl text-xs font-medium transition-all duration-200 touch-manipulation",
                      padY,
                      active || hasActiveChild
                        ? "bg-white/[0.1] text-white"
                        : "text-white/90 hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {(active || hasActiveChild) && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white rounded-r-full" aria-hidden />
                    )}
                    <FaChevronDown 
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 text-white/70 transition-transform duration-200",
                        isExpanded ? "rotate-180" : ""
                      )} 
                    />
                  </button>
                  {isExpanded && (
                    <div className={cn(childMl, "space-y-0.5")}>
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
                              "relative flex items-center rounded-xl text-[11px] font-medium transition-all duration-200 touch-manipulation",
                              childPadY,
                              childActive
                                ? "bg-white/[0.1] text-white"
                                : "text-white/80 hover:bg-white/[0.06] hover:text-white"
                            )}
                          >
                            {childActive && (
                              <span className="absolute left-0 top-1 bottom-1 w-1 bg-white rounded-r-full" aria-hidden />
                            )}
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
                    "relative flex items-center gap-2.5 rounded-xl text-xs font-medium transition-all duration-200 touch-manipulation w-full",
                    padY,
                    active
                      ? "bg-white/[0.1] text-white"
                      : "text-white/90 hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white rounded-r-full" aria-hidden />
                  )}
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
        "border-t border-white/[0.06] p-2.5 flex-shrink-0",
        isMobile && "p-3"
      )}>
        {effectiveCollapsed ? (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="w-full flex items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.06] p-2 transition-colors duration-200 hover:bg-white/[0.1] focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                title={getUserDisplayName()}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {isLoadingUser ? "..." : getInitials()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </PopoverTrigger>
            <PopoverContent 
              side="right" 
              align="end"
              className="w-60 rounded-2xl border-border/60 p-2 shadow-xl shadow-black/10 bg-background/95 backdrop-blur-xl"
              sideOffset={12}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-muted/50">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {isLoadingUser ? "..." : getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {isLoadingUser ? "..." : getUserDisplayName()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs rounded-xl hover:bg-muted/80 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  onClick={() => setProfileOpen(true)}
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
              "w-full flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.06] transition-colors duration-200 hover:bg-white/[0.1] touch-manipulation text-white focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
              isMobile ? "p-3" : "p-2.5"
            )}
          >
            <Avatar className={cn("shrink-0", isMobile ? "h-9 w-9" : "h-8 w-8")}>
              <AvatarFallback className={cn(
                "bg-white/20 text-white border border-white/20",
                isMobile ? "text-xs" : "text-[10px]"
              )}>
                {isLoadingUser ? "..." : getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <p className={cn(
                "font-medium text-white truncate leading-tight",
                isMobile ? "text-sm" : "text-xs"
              )}>
                {isLoadingUser ? "..." : getUserDisplayName()}
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  );

  const workspaceTypeLabel = workspace
    ? workspace.type === 'COMPANY'
      ? tTopbar('workspaceTypeCompany')
      : workspace.type === 'FREELANCE'
        ? tTopbar('workspaceTypeFreelance')
        : tTopbar('workspaceTypeIndividual')
    : null;
  const workspaceSubline = [
    workspace?.name || workspaceTypeLabel,
    workspace?.defaultCurrency,
    [workspace?.city, workspace?.country].filter(Boolean).join(', ') || null,
  ].filter(Boolean).join(' · ') || (workspaceTypeLabel ?? '');

  const ProfileSheet = () => (
    <Sheet open={isProfileOpen} onOpenChange={setProfileOpen}>
      <SheetContent
        side="right"
        className="w-full max-w-[360px] p-0 gap-0 overflow-hidden rounded-l-[28px] border-l border-border/40 bg-background/95 dark:bg-background/98 backdrop-blur-2xl shadow-2xl shadow-black/5 [&>button]:right-4 [&>button]:top-5 [&>button]:h-9 [&>button]:w-9 [&>button]:rounded-full [&>button]:bg-muted/60 [&>button]:hover:bg-muted [&>button]:opacity-80 [&>button]:hover:opacity-100 [&>button]:text-foreground/70 [&>button]:focus:outline-none [&>button]:focus:ring-0 [&>button]:focus-visible:ring-0 data-[state=open]:duration-300 data-[state=closed]:duration-250"
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Barre titre — minimal Apple */}
          <div className="flex items-center justify-between px-5 pt-5 pb-1 shrink-0">
            <SheetTitle className="text-[17px] font-semibold text-foreground tracking-tight">
              {tTopbar('userProfile')}
            </SheetTitle>
          </div>

          {isLoadingUser ? (
            <div className="flex flex-col items-center gap-4 px-6 py-10">
              <div className="h-20 w-20 rounded-full bg-muted/80 animate-pulse" />
              <div className="h-4 w-40 bg-muted/80 rounded-lg animate-pulse" />
              <div className="h-3 w-32 bg-muted/60 rounded-lg animate-pulse" />
            </div>
          ) : (
            <>
              {/* Hero profil — centré, typo premium */}
              <div className="px-6 pt-2 pb-8 flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 rounded-full ring-[1px] ring-border/50 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground text-xl font-medium rounded-full">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <p className="mt-4 text-[19px] font-semibold text-foreground tracking-tight">
                  {getUserDisplayName()}
                </p>
                <p className="mt-1 text-[15px] text-muted-foreground">
                  {user?.email}
                </p>
              </div>

              {/* Liste groupée type Réglages iOS */}
              <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6">
                <div className="rounded-2xl bg-muted/40 dark:bg-muted/20 overflow-hidden">
                  {workspace && (
                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-background/80 dark:bg-background/60">
                        {workspace.logoUrl ? (
                          <img src={workspace.logoUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <FaBuilding className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground">
                          {tTopbar('workspace')}
                        </p>
                        <p className="text-[12px] text-muted-foreground truncate mt-0.5">
                          {workspace.name || workspaceTypeLabel || tTopbar('workspace')}
                        </p>
                        {workspaceSubline ? (
                          <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5">
                            {workspaceSubline}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation("/settings?tab=profile");
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/60 dark:hover:bg-muted/40 active:bg-muted/80 rounded-b-2xl focus:outline-none focus:ring-0"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background/80 dark:bg-background/60">
                      <FaUser className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-[15px] font-medium text-foreground flex-1">
                      {tTopbar('manageAccount')}
                    </span>
                    <FaChevronRight className="h-4 w-4 text-muted-foreground/70 shrink-0" />
                  </button>
                </div>

                {/* Déconnexion — ligne destructive */}
                <div className="mt-4 rounded-2xl bg-muted/40 dark:bg-muted/20 overflow-hidden">
                  <button
                    type="button"
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
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-[15px] font-medium text-destructive hover:bg-destructive/10 active:bg-destructive/15 transition-colors disabled:opacity-60 focus:outline-none focus:ring-0"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FaRightFromBracket className="h-4 w-4" />
                    )}
                    {isLoggingOut ? tTopbar('loggingOut') : tTopbar('logout')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  if (isMobile) {
    return (
      <>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent
            side="left"
            className="w-[85vw] max-w-[300px] p-0 gap-0 [&>button]:hidden h-full flex flex-col overflow-hidden rounded-r-2xl border-r border-white/[0.06] bg-gradient-to-b from-[#2e1065] via-[#3b0764] to-[#4c0519] backdrop-blur-2xl shadow-xl"
          >
            <div className="flex flex-col h-full overflow-hidden min-h-0">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
        <ProfileSheet />
        <CreateWorkspaceModal
          open={isCreateWorkspaceModalOpen}
          onOpenChange={setCreateWorkspaceModalOpen}
          isAdditionalWorkspace={createWorkspaceModalOpen}
        />
      </>
    );
  }

  return (
    <>
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-[width] duration-300 ease-out",
        "rounded-r-2xl border-r border-white/[0.06]",
        "bg-gradient-to-b from-[#2e1065] via-[#3b0764] to-[#4c0519]",
        "backdrop-blur-2xl shadow-[4px_0_24px_-4px_rgba(0,0,0,0.2)]",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <SidebarContent />
      </aside>
      <ProfileSheet />
      <CreateWorkspaceModal
        open={isCreateWorkspaceModalOpen}
        onOpenChange={setCreateWorkspaceModalOpen}
        isAdditionalWorkspace={createWorkspaceModalOpen}
      />
    </>
  );
};

export default Sidebar;
