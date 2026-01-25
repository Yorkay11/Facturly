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
    const planNames: Record<"free" | "pro" | "enterprise" | "pay_as_you_go", string> = {
      free: tTopbar('planFree'),
      pro: tTopbar('planPro'),
      enterprise: tTopbar('planEnterprise'),
      pay_as_you_go: tTopbar('planPayAsYouGo') || 'Pay-as-you-go'
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
          label: t('recurringInvoices'),
          href: "/recurring-invoices",
          description: t('recurringInvoicesDescription'),
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
      label: t('reports'),
      href: "/reports",
      description: t('reportsDescription'),
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

  return (
    <header className={cn(
      "sticky z-40 border-b border-primary/10 bg-white/85 backdrop-blur top-0",
      "py-2 md:py-3 lg:py-4"
    )}>
      <div className="mx-auto flex max-w-[90vw] flex-col gap-2 px-3 sm:px-4 md:flex-row md:items-center md:justify-between md:gap-3 md:px-6 lg:gap-4 lg:px-10">
        <div className="flex items-center justify-between w-full lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/logos/logo.png"
              alt="Facturly"
              width={120}
              height={40}
              className="h-6 md:h-7 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 md:h-10 md:w-10"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/invoices/new");
              }}
              aria-label={t('newInvoice')}
            >
              <IoAddOutline className="h-5 w-5 md:h-5 md:w-5" />
            </Button>
            <NotificationDropdown />
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 transition hover:bg-primary/20 flex-shrink-0"
              aria-label={t('openUserProfile')}
            >
              <Avatar className="h-7 w-7 md:h-8 md:w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs md:text-sm">
                  {isLoadingUser ? "..." : getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>

        <div className="hidden lg:flex flex-wrap items-center gap-3 lg:gap-4">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logos/logo.png"
              alt="Facturly"
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <Separator orientation="vertical" className="hidden h-6 lg:block" />
          <NavigationMenu className="hidden lg:flex">
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

        <div className="hidden lg:flex flex-wrap items-center gap-3 lg:gap-4 text-sm">
          <LanguageSwitcher />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors cursor-pointer">
            <IoHelpCircleOutline className="h-4 w-4 text-primary" />
            <span className="hidden xl:inline">{t('support')}</span>
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
            <span className="hidden xl:inline">{t('newInvoice')}</span>
            <span className="xl:hidden">{t('new')}</span>
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
                {/* Language Switcher sur mobile et tablette */}
                <div className="lg:hidden flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm mb-2">Langue / Language</p>
                    <LanguageSwitcher />
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
