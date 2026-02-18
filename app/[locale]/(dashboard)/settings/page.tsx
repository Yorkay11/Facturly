"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from '@/i18n/routing';
import { z } from "zod";
import { useTranslations, useLocale } from 'next-intl';
import { DirectionAwareTabs } from "@/components/ui/direction-aware-tabs";
import Breadcrumb from "@/components/ui/breadcrumb";
import Skeleton from "@/components/ui/skeleton";
import {
  useGetMeQuery,
  useGetWorkspaceQuery,
  useGetSettingsQuery,
} from "@/services/facturlyApi";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";
import { WorkspaceSettingsForm } from "@/components/settings/WorkspaceSettingsForm";
import { BillingSettingsForm } from "@/components/settings/BillingSettingsForm";
import { GeneralSettingsSection } from "@/components/settings/GeneralSettingsSection";


function SettingsContent() {
  const t = useTranslations('settings');

  
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  
  // Sections avec traductions
  const sections = useMemo(() => [
    { value: "profile", label: t('tabs.profile') },
    { value: "workspace", label: t('tabs.workspace') },
    { value: "billing", label: t('tabs.billing') },
    { value: "general", label: t('tabs.general') },
  ], [t]);
  
  // Valider que le tab est dans la liste des sections valides
  const validTabs = useMemo(() => sections.map(s => s.value), [sections]);
  const defaultTab = tabParam && validTabs.includes(tabParam) ? tabParam : "profile";
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const activeTabId = sections.findIndex((s) => s.value === activeTab);

  // Créer les schémas de validation avec les traductions
  const userSchema = useMemo(() => z.object({
    firstName: z.string().min(2, t('profile.validation.firstNameMin')),
    lastName: z.string().min(2, t('profile.validation.lastNameMin')),
    password: z.string().min(8, t('profile.validation.passwordMin')).optional().or(z.literal("")),
  }), [t]);
  
  const workspaceSchema = useMemo(() => z.object({
    type: z.enum(['INDIVIDUAL', 'COMPANY'], {
      required_error: t('workspace.validation.typeRequired'),
    }),
    name: z.string().min(2, t('workspace.validation.nameMin')).nullable().optional(),
    legalName: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    postalCode: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    defaultCurrency: z.string().min(1, t('workspace.validation.currencyRequired')),
  }).refine((data) => {
    // Pour COMPANY, le name est recommandé mais pas obligatoire
    // Pour INDIVIDUAL, le name peut être null
    if (data.type === 'COMPANY' && !data.name) {
      return false; // On peut rendre le name optionnel même pour COMPANY
    }
    return true;
  }, {
    message: t('workspace.validation.nameRequiredForCompany'),
    path: ['name'],
  }), [t]);
  
  const settingsSchema = useMemo(() => z.object({
    language: z.string().min(1, t('billing.validation.languageRequired')),
    timezone: z.string().min(1, t('billing.validation.timezoneRequired')),
    invoicePrefix: z.string().min(1, t('billing.validation.invoicePrefixRequired')),
    dateFormat: z.string().min(1, t('billing.validation.dateFormatRequired')),
    paymentTerms: z.number().min(0, t('billing.validation.paymentTermsPositive')),
  }), [t]);

  // Mettre à jour l'onglet actif si le paramètre change depuis l'URL
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam, validTabs, activeTab]);

  // Gérer le changement de tab et mettre à jour l'URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/settings?tab=${value}`, { scroll: false });
  };
  // Queries pour le loading state
  const { isLoading: isLoadingUser } = useGetMeQuery();
  const { isLoading: isLoadingWorkspace } = useGetWorkspaceQuery();
  const { isLoading: isLoadingSettings } = useGetSettingsQuery();

  const isLoading = isLoadingUser || isLoadingWorkspace || isLoadingSettings;
  

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-muted/30 to-background">
      <div className="w-full px-4 py-8 sm:px-6 sm:py-10 space-y-8">
        <nav className="mb-8">
          <Breadcrumb
            items={[
              { label: t('breadcrumb.dashboard'), href: "/dashboard" },
              { label: t('breadcrumb.settings') },
            ]}
            className="text-xs text-muted-foreground"
          />
        </nav>
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('subtitle')}</p>
        </header>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : (
          <DirectionAwareTabs
            className="w-full mb-4"
            tabs={[
              {
                id: 0,
                label: sections[0].label,
                content: <ProfileSettingsForm userSchema={userSchema} />,
            },
            {
              id: 1,
              label: sections[1].label,
              content: <WorkspaceSettingsForm workspaceSchema={workspaceSchema} />,
            },
            {
              id: 2,
              label: sections[2].label,
              content: <BillingSettingsForm settingsSchema={settingsSchema} />,
            },
            {
              id: 3,
              label: sections[3].label,
              content: <GeneralSettingsSection />,
            },
          ]}
          value={activeTabId >= 0 ? activeTabId : 0}
          onValueChange={(id) => handleTabChange(sections[id].value)}
        />
      )}

      </div>
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslations('settings');
  
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: t('breadcrumb.dashboard'), href: "/dashboard" },
            { label: t('breadcrumb.settings'), href: "/settings" },
          ]}
        />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
