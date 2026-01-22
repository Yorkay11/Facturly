"use client";

import { Link, usePathname, useRouter } from '@/i18n/routing';
import Image from "next/image";
import { IoHelpCircleOutline, IoNotificationsOutline, IoMenuOutline, IoAddOutline, IoLogOutOutline, IoSettingsOutline, IoPersonOutline } from "react-icons/io5";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigationBlock } from "@/contexts/NavigationBlockContext";
import { useGetMeQuery, useGetWorkspaceQuery, useGetSubscriptionQuery, useLogoutMutation } from "@/services/facturlyApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useBetaBanner } from "@/hooks/useBetaBanner";
import { useTranslations } from 'next-intl';

export const Topbar = () => {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isProfileOpen, setProfileOpen] = useState(false);
  const { handleNavigation } = useNavigationBlock();
  const router = useRouter();
  const t = useTranslations('navigation');
  const tTopbar = useTranslations('topbar');
  const commonT = useTranslations('common');
  
  // Fetch user data from API
  const { data: user, isLoading: isLoadingUser } = useGetMeQuery();
  const { data: workspace, isLoading: isLoadingWorkspace } = useGetWorkspaceQuery();
  const { data: subscription, isLoading: isLoadingSubscription } = useGetSubscriptionQuery();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  
  // Generate avatar initials from user name
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    const first = firstName?.charAt(0).toUpperCase() || "";
    const last = lastName?.charAt(0).toUpperCase() || "";
    return `${first}${last}` || "U";
  };
  
  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return tTopbar('user');
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : user.email;
  };
  
  // Get subscription plan name
  const getSubscriptionPlanName = () => {
    if (!subscription) return tTopbar('noPlan');
    const planNames: Record<"free" | "pro" | "enterprise", string> = {
      free: tTopbar('planFree'),
      pro: tTopbar('planPro'),
      enterprise: tTopbar('planEnterprise')
    };
    return planNames[subscription.plan] || tTopbar('noPlan');
  };
  
  // Navigation items with translations
  const navItems: Array<{
    label: string;
    href: string;
    description?: string;
    children?: Array<{ label: string; href: string; description?: string }>;
  }> = [
    {
      label: t('dashboard'),
      href: "/dashboard",
      description: t('dashboardDescription'),
    },
    {
      label: t('invoices'),
      href: "/invoices",
      description: t('invoicesDescription'),
      children: [
        {
          label: t('invoicesCreated'),
          href: "/invoices",
          description: t('invoicesCreatedDescription'),
        },
        {
          label: t('invoicesReceived'),
          href: "/bills",
          description: t('invoicesReceivedDescription'),
        },
        {
          label: t('newInvoice'),
          href: "/invoices/new",
          description: t('newInvoiceDescription'),
        },
      ],
    },
    {
      label: t('clients'),
      href: "/clients",
      description: t('clientsDescription'),
    },
    {
      label: t('items'),
      href: "/items",
      description: t('itemsDescription'),
    },
    {
      label: t('reminders'),
      href: "/reminders",
      description: t('remindersDescription'),
    },
    {
      label: t('settings'),
      href: "/settings",
      description: t('settingsDescription'),
    },
  ];
  
  // Get workspace location string
  const getWorkspaceLocation = () => {
    if (!workspace) return "";
    const parts = workspace.name ? [workspace.name] : [];
    if (workspace.city) parts.push(workspace.city);
    if (workspace.country) parts.push(workspace.country);
    return parts.filter(Boolean).join(" • ");
  };

  const isActive = (href: string, children?: Array<{ href: string }>) => {
     if (pathname === href || pathname?.startsWith(`${href}/`)) return true;
     if (!children?.length) return false;
     return children.some((child) => pathname === child.href || pathname?.startsWith(`${child.href}/`));
   };

  const isBetaBannerVisible = useBetaBanner();

  return (
    <header className={cn(
      "sticky z-40 border-b border-primary/10 bg-white/85 backdrop-blur",
      isBetaBannerVisible ? "top-[44px] md:top-[42px]" : "top-0",
      "py-2 md:py-4"
    )}>
      <div className="mx-auto flex max-w-[90vw] flex-col gap-2 px-3 md:flex-row md:items-center md:justify-between md:gap-4 md:px-10">
        <div className="flex items-center justify-between w-full md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/logos/logo.png"
              alt="Facturly"
              width={120}
              height={40}
              className="h-7 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10 h-8 px-2"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/invoices/new");
              }}
            >
              <IoAddOutline className="h-4 w-4" />
              <span className="hidden xs:inline">{t('new')}</span>
            </Button>
            <NotificationDropdown />
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 transition hover:bg-primary/20 flex-shrink-0"
              aria-label={t('openUserProfile')}
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {isLoadingUser ? "..." : getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
            </button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <IoMenuOutline className="h-5 w-5" />
                  <span className="sr-only">{t('openNavigation')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side={isMobile ? "left" : "right"} className="w-full max-w-xs space-y-6">
              <SheetHeader className="space-y-1">
                <SheetTitle>Facturly</SheetTitle>
                <SheetDescription>{t('mainNavigation')}</SheetDescription>
              </SheetHeader>
              <nav className="space-y-4 text-sm">
                {navItems.map((item) => {
                  const active =
                    pathname === item.href || pathname?.startsWith(`${item.href}/`) ||
                    item.children?.some((child) => pathname === child.href || pathname?.startsWith(`${child.href}/`));

                  return (
                    <div key={item.href} className="space-y-2">
                      <SheetClose asChild>
                        <Link
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavigation(item.href);
                          }}
                          className={cn(
                            "block rounded-lg px-3 py-2 font-medium",
                            active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-foreground/80"
                          )}
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                      {item.children ? (
                        <div className="space-y-1 pl-3">
                          {item.children.map((child) => {
                            const childActive = pathname === child.href || pathname?.startsWith(`${child.href}/`);
                            return (
                              <SheetClose asChild key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleNavigation(child.href);
                                  }}
                                  className={cn(
                                    "block rounded-md px-3 py-2 text-xs",
                                    childActive ? "bg-primary/20 text-primary" : "text-foreground/70 hover:bg-primary/10"
                                  )}
                                >
                                  {child.label}
                                </Link>
                              </SheetClose>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="hidden flex-wrap items-center gap-3 md:flex">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logos/logo.png"
              alt="Facturly"
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <Separator orientation="vertical" className="hidden h-6 md:block" />
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="flex-wrap gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href, item.children);

                return (
                  <NavigationMenuItem key={item.href}>
                    {item.children ? (
                      <>
                        <NavigationMenuTrigger
                          className={cn(
                            navigationMenuTriggerStyle,
                            "rounded-none border-b-2",
                            active
                              ? "border-b-primary text-primary"
                              : "border-b-transparent text-foreground/70 hover:border-b-primary/40 hover:text-primary"
                          )}
                        >
                          {item.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid gap-2 p-4 sm:w-[320px]">
                            <li className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                              <p className="font-semibold text-slate-800">{item.label}</p>
                              {item.description ? (
                                <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                              ) : null}
                            </li>
                            {item.children.map((child) => {
                              const childActive = pathname === child.href || pathname?.startsWith(`${child.href}/`);
                              return (
                                <NavigationMenuLink asChild key={child.href}>
                                  <Link
                                    href={child.href}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleNavigation(child.href);
                                    }}
                                    className={cn(
                                      "rounded-lg border border-transparent p-3 text-sm transition-colors",
                                      childActive
                                        ? "border-primary/40 bg-primary/10 text-primary"
                                        : "text-foreground/70 hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
                                    )}
                                  >
                                    <div className="font-medium">{child.label}</div>
                                    {child.description ? (
                                      <p className="text-xs text-slate-500">{child.description}</p>
                                    ) : null}
                                  </Link>
                                </NavigationMenuLink>
                              );
                            })}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavigation(item.href);
                          }}
                          className={cn(
                            navigationMenuTriggerStyle,
                            "rounded-none border-b-2",
                            active
                              ? "border-b-primary text-primary"
                              : "border-b-transparent text-foreground/70 hover:border-b-primary/40 hover:text-primary"
                          )}
                        >
                          {item.label}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="hidden md:flex flex-wrap items-center gap-3 text-sm">
          <LanguageSwitcher />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2 text-foreground/70">
            <IoHelpCircleOutline className="h-4 w-4 text-primary" />
            <span>{t('support')}</span>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("/invoices/new");
            }}
          >
            <IoAddOutline className="h-4 w-4" />
            {t('newInvoice')}
          </Button>
          <NotificationDropdown />
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
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
      </div>
      <Sheet open={isProfileOpen} onOpenChange={setProfileOpen}>
        <SheetContent side="right" className="w-full max-w-sm space-y-6">
          <SheetHeader>
            <SheetTitle>{tTopbar('userProfile')}</SheetTitle>
            <SheetDescription>
              {isLoadingUser || isLoadingWorkspace ? commonT('loading') : tTopbar('accountInfo')}
            </SheetDescription>
          </SheetHeader>
          {isLoadingUser || isLoadingWorkspace ? (
            <div className="flex flex-col items-center gap-3 pt-2">
              <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-3 pt-2">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="text-base font-semibold text-foreground">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-sm text-foreground/60">{user?.email}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {isLoadingSubscription ? commonT('loading') : getSubscriptionPlanName()}
                </span>
              </div>
              <div className="space-y-3 text-sm text-foreground/70">
                {workspace && (
                  <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <IoPersonOutline className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{tTopbar('workspace')}</p>
                      <p className="text-xs">
                        {getWorkspaceLocation() || workspace.name || ''}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <IoSettingsOutline className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{tTopbar('preferences')}</p>
                    <p className="text-xs">{tTopbar('preferencesDescription')}</p>
                  </div>
                </div>
              </div>
            </>
          )}
          <SheetFooter className="flex flex-col sm:flex-col gap-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/settings?tab=profile");
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
                  // Appeler la mutation de logout
                  await logout().unwrap();
                  
                  // Supprimer le cookie d'authentification
                  if (typeof window !== "undefined") {
                    document.cookie = "facturly_access_token=; path=/; max-age=0";
                    document.cookie = "facturly_refresh_token=; path=/; max-age=0";
                  }
                  
                  // Afficher un message de succès
                  toast.success(tTopbar('logoutSuccess'), {
                    description: tTopbar('logoutSuccessDescription'),
                  });
                  
                  // Fermer le sheet de profil
                  setProfileOpen(false);
                  
                  // Rediriger vers la page de connexion
                  router.push("/login");
                } catch (error) {
                  // En cas d'erreur, supprimer quand même le cookie et rediriger
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
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {tTopbar('loggingOut')}
                </>
              ) : (
                <>
                  <IoLogOutOutline className="h-4 w-4" />
                  {tTopbar('logout')}
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Topbar;
