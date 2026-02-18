'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { FaSpinner, FaPencilAlt } from 'react-icons/fa';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUpdateWorkspaceMutation, useUploadWorkspaceLogoMutation, useGetWorkspaceQuery } from '@/services/facturlyApi';
import { toast } from 'sonner';
import { useMemo, useEffect, useState } from 'react';
import { LogoUploadModal } from '@/components/workspace/LogoUploadModal';
import Image from 'next/image';

type WorkspaceFormType = 'INDIVIDUAL' | 'COMPANY' | 'FREELANCE';

type WorkspaceFormValues = {
  type: WorkspaceFormType;
  name: string;
  legalName: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  country: string;
  defaultCurrency: string;
};

interface WorkspaceSettingsFormProps {
  workspaceSchema: z.ZodTypeAny;
}

export function WorkspaceSettingsForm({ workspaceSchema }: WorkspaceSettingsFormProps) {
  const t = useTranslations('settings');
  const { data: workspace } = useGetWorkspaceQuery();
  const [updateWorkspace, { isLoading: isUpdatingWorkspace }] = useUpdateWorkspaceMutation();
  const [uploadWorkspaceLogo, { isLoading: isUploadingLogo }] = useUploadWorkspaceLogoMutation();
  const [logoUploadOpen, setLogoUploadOpen] = useState(false);

  const workspaceForm = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      type: 'INDIVIDUAL',
      name: '',
      legalName: '',
      addressLine1: '',
      addressLine2: '',
      postalCode: '',
      city: '',
      country: '',
      defaultCurrency: 'XOF',
    },
  });

  useEffect(() => {
    if (workspace) {
      workspaceForm.reset({
        type: workspace.type as WorkspaceFormType,
        name: workspace.name || '',
        legalName: workspace.legalName || '',
        addressLine1: workspace.addressLine1 || '',
        addressLine2: workspace.addressLine2 || '',
        postalCode: workspace.postalCode || '',
        city: workspace.city || '',
        country: workspace.country || '',
        defaultCurrency: workspace.defaultCurrency || 'XOF',
      });
    }
  }, [workspace, workspaceForm]);

  const onWorkspaceSubmit = async (values: any) => {
    try {
      await updateWorkspace(values).unwrap();
      toast.success(t('workspace.success.updated'), {
        description: t('workspace.success.updatedDescription'),
      });
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error
          ? (error.data as { message?: string })?.message ?? t('workspace.errors.updateError')
          : t('workspace.errors.genericError');

      toast.error(t('workspace.errors.updateError'), {
        description: errorMessage,
      });
    }
  };

  return (
    <>
      <Card className="rounded-2xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {t('workspace.title')}
          </h2>
          <CardDescription className="mt-1 text-[15px]">
            {t('workspace.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={workspaceForm.handleSubmit(onWorkspaceSubmit)} className="space-y-4">
            {/* Logo du workspace */}
            <div className="flex flex-row items-center gap-4">
              <div className="space-y-2">
                <Label>{t('workspace.fields.logo')}</Label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setLogoUploadOpen(true)}
                    className="relative group rounded-lg border border-border overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <Avatar className="h-28 w-28 rounded-lg border-0">
                      {workspace?.logoUrl ? (
                        <AvatarImage src={workspace.logoUrl} alt="Logo" className="object-cover" />
                      ) : null}
                      <AvatarFallback className="rounded-lg bg-muted text-muted-foreground text-lg">
                        {workspace?.name?.slice(0, 2)?.toUpperCase() ?? "WS"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaPencilAlt className="h-6 w-6 text-white" />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sélecteur de type (valeur depuis GET /workspaces/me) */}
            <div className="space-y-2">
              <Label htmlFor="workspace-type">
                {t('workspace.fields.type')} <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="type"
                control={workspaceForm.control}
                render={({ field }) => {
                  const typeValue = (workspace?.type ?? field.value ?? '') as string;
                  return (
                    <Select
                      key={workspace?.id ?? 'no-workspace'}
                      onValueChange={field.onChange}
                      value={typeValue}
                      disabled
                    >
                      <SelectTrigger className={workspaceForm.formState.errors.type ? "border-destructive" : ""}>
                        <SelectValue placeholder={t('workspace.fields.typePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INDIVIDUAL">{t('workspace.fields.typeIndividual')}</SelectItem>
                        <SelectItem value="COMPANY">{t('workspace.fields.typeCompany')}</SelectItem>
                        <SelectItem value="FREELANCE">{t('workspace.fields.typeFreelance')}</SelectItem>
                      </SelectContent>
                    </Select>
                  );
                }}
              />
            </div>

            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="workspace-name">{t('workspace.fields.name')}</Label>
              <Input
                id="workspace-name"
                placeholder={t('workspace.fields.namePlaceholder')}
                {...workspaceForm.register('name')}
                disabled={isUpdatingWorkspace}
                className={workspaceForm.formState.errors.name ? "border-destructive" : ""}
              />
              {workspaceForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {workspaceForm.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Devise */}
            <div className="space-y-2">
              <Label htmlFor="workspace-currency">
                {t('workspace.fields.defaultCurrency')} <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="defaultCurrency"
                control={workspaceForm.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isUpdatingWorkspace}>
                    <SelectTrigger className={workspaceForm.formState.errors.defaultCurrency ? "border-destructive" : ""}>
                      <SelectValue placeholder={t('workspace.fields.defaultCurrencyPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XOF">XOF (Franc CFA)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      <SelectItem value="USD">USD (Dollar US)</SelectItem>
                      <SelectItem value="XAF">XAF (Franc CFA BEAC)</SelectItem>
                      <SelectItem value="NGN">NGN (Naira)</SelectItem>
                      <SelectItem value="GHS">GHS (Cedi)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={isUpdatingWorkspace || !workspaceForm.formState.isDirty}
              className="rounded-full px-6"
            >
              {isUpdatingWorkspace && <FaSpinner className="mr-2 h-4 w-4 animate-spin" />}
              {t('workspace.buttons.update')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <LogoUploadModal
        open={logoUploadOpen}
        onOpenChange={setLogoUploadOpen}
        title={t('workspace.fields.logo')}
        onFileChange={async (files) => {
          const file = files[0];
          if (!file) return;
          try {
            await uploadWorkspaceLogo(file).unwrap();
            toast.success(t('workspace.success.updated'), {
              description: t('workspace.success.updatedDescription'),
            });
          } catch {
            toast.error(t('workspace.errors.updateError'), {
              description: t('workspace.errors.genericError'),
            });
            throw new Error('Upload failed');
          }
        }}
      />
    </>
  );
}
