"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeHelp, Bell, Menu, Plus, LogOut, Settings, User } from "lucide-react";
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
import { useGetMeQuery, useGetCompanyQuery, useGetSubscriptionQuery } from "@/services/facturlyApi";

const navItems: Array<{
  label: string;
  href: string;
  description?: string;
  children?: Array<{ label: string; href: string; description?: string }>;
}> = [
  {
    label: "Tableau de bord",
    href: "/dashboard",
    description: "Vue d'ensemble de vos indicateurs",
  },
  {
    label: "Factures",
    href: "/invoices",
    description: "Suivre, créer et envoyer vos factures",
    children: [
      {
        label: "Toutes les factures",
        href: "/invoices",
        description: "Consultez vos factures par statut",
      },
      {
        label: "Nouvelle facture",
        href: "/invoices/new",
        description: "Construisez un document de facturation",
      },
    ],
  },
  {
    label: "Clients",
    href: "/clients",
    description: "Carnet d'adresses et historique",
  },
  {
    label: "Produits",
    href: "/items",
    description: "Catalogue de prestations et tarifs",
  },
  {
    label: "Relances",
    href: "/reminders",
    description: "Statistiques impayés et suivi des relances",
  },
  {
    label: "Paramètres",
    href: "/settings",
    description: "Configuration, mentions et branding",
  },
];

export const Topbar = () => {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isProfileOpen, setProfileOpen] = useState(false);
  const { handleNavigation } = useNavigationBlock();
  
  // Fetch user data from API
  const { data: user, isLoading: isLoadingUser } = useGetMeQuery();
  const { data: company, isLoading: isLoadingCompany } = useGetCompanyQuery();
  const { data: subscription, isLoading: isLoadingSubscription } = useGetSubscriptionQuery();
  
  // Generate avatar initials from user name
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    const first = firstName?.charAt(0).toUpperCase() || "";
    const last = lastName?.charAt(0).toUpperCase() || "";
    return `${first}${last}` || "U";
  };
  
  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "Utilisateur";
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : user.email;
  };
  
  // Get subscription plan name
  const getSubscriptionPlanName = () => {
    if (!subscription) return "Aucun plan";
    return subscription.plan.name;
  };
  
  // Get company location string
  const getCompanyLocation = () => {
    if (!company) return "";
    const parts = [company.name];
    if (company.city) parts.push(company.city);
    if (company.country) parts.push(company.country);
    return parts.filter(Boolean).join(" • ");
  };

  const isActive = (href: string, children?: Array<{ href: string }>) => {
     if (pathname === href || pathname?.startsWith(`${href}/`)) return true;
     if (!children?.length) return false;
     return children.some((child) => pathname === child.href || pathname?.startsWith(`${child.href}/`));
   };

  return (
    <header className="border-b border-primary/10 bg-white/85 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-[90vw] flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="flex items-center justify-between md:hidden">
          <div className="flex flex-col">
            <p className="text-xl font-bold text-primary">Facturly</p>
            <span className="text-xs text-foreground/60">Facturation simple & intelligente</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Ouvrir la navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side={isMobile ? "left" : "right"} className="w-full max-w-xs space-y-6">
              <SheetHeader className="space-y-1">
                <SheetTitle>Facturly</SheetTitle>
                <SheetDescription>Navigation principale</SheetDescription>
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

        <div className="hidden flex-wrap items-center gap-3 md:flex">
          <div className="flex flex-col">
            <p className="text-xl font-bold text-primary">Facturly</p>
            <span className="text-xs text-foreground/60">Facturation simple & intelligente</span>
          </div>
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

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-2 text-foreground/70">
            <BadgeHelp className="h-4 w-4 text-primary" />
            <span>Support</span>
          </div>
          <Separator orientation="vertical" className="hidden h-6 md:block" />
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("/invoices/new");
            }}
          >
            <Plus className="h-4 w-4" />
            Nouvelle facture
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </Button>
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 transition hover:bg-primary/20"
            aria-label="Ouvrir le profil utilisateur"
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
            <SheetTitle>Profil utilisateur</SheetTitle>
            <SheetDescription>
              {isLoadingUser || isLoadingCompany ? "Chargement..." : "Informations de votre compte"}
            </SheetDescription>
          </SheetHeader>
          {isLoadingUser || isLoadingCompany ? (
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
                  {isLoadingSubscription ? "Chargement..." : getSubscriptionPlanName()}
                </span>
              </div>
              <div className="space-y-3 text-sm text-foreground/70">
                {company && (
                  <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <User className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Entreprise</p>
                      <p className="text-xs">
                        {getCompanyLocation() || company.name}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <Settings className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Préférences</p>
                    <p className="text-xs">Notifications, mentions légales, branding</p>
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
                handleNavigation("/settings");
              }}
            >
              Gérer mon compte
            </Button>
 
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/logout");
              }}
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Topbar;
