'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { FaSpinner, FaFileAlt, FaDollarSign, FaQuestionCircle, FaExternalLinkAlt } from 'react-icons/fa';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdateSettingsMutation, useUploadSignatureImageMutation, useGetSettingsQuery, useGetWorkspaceQuery } from '@/services/facturlyApi';
import { toast } from 'sonner';
import { useMemo, useEffect, useState } from 'react';
import { LogoUploadModal } from '@/components/workspace/LogoUploadModal';
import { FaPencilAlt } from 'react-icons/fa';
import Image from 'next/image';

interface BillingSettingsFormProps {
  settingsSchema: z.ZodTypeAny;
}

export function BillingSettingsForm({ settingsSchema }: BillingSettingsFormProps) {
  const t = useTranslations('settings');
  const commonT = useTranslations('common');
  const { data: settings } = useGetSettingsQuery();
  const { data: workspace } = useGetWorkspaceQuery();
  const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();
  const [uploadSignatureImage, { isLoading: isUploadingSignature }] = useUploadSignatureImageMutation();
  const [signatureUploadOpen, setSignatureUploadOpen] = useState(false);
  const [signatureHelpOpen, setSignatureHelpOpen] = useState(false);

  const settingsForm = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      language: 'fr',
      timezone: 'Europe/Paris',
      invoicePrefix: 'FAC',
      dateFormat: 'dd/MM/yyyy',
      paymentTerms: 30,
    },
  });

  useEffect(() => {
    if (settings) {
      settingsForm.reset({
        language: settings.language || 'fr',
        timezone: settings.timezone || 'Europe/Paris',
        invoicePrefix: settings.invoicePrefix || 'FAC',
        dateFormat: settings.dateFormat || 'dd/MM/yyyy',
        paymentTerms: settings.paymentTerms || 30,
      });
    }
  }, [settings, settingsForm]);

  const onSettingsSubmit = async (values: any) => {
    try {
      await updateSettings({
        language: values.language,
        timezone: values.timezone,
        invoicePrefix: values.invoicePrefix,
        dateFormat: values.dateFormat,
        paymentTerms: values.paymentTerms,
      }).unwrap();
      toast.success(t('billing.success.updated'), {
        description: t('billing.success.updatedDescription'),
      });
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error
          ? (error.data as { message?: string })?.message ?? t('billing.errors.updateError')
          : t('billing.errors.genericError');

      toast.error(t('billing.errors.updateError'), {
        description: errorMessage,
      });
    }
  };

  return (
    <>
      <Card className="rounded-2xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {t('billing.title')}
          </h2>
          <CardDescription className="mt-1 text-[15px]">
            {t('billing.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
            {/* Section Format */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <FaFileAlt className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-primary">{t('billing.sections.format')}</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invoice-prefix" className="flex items-center gap-2">
                    {t('billing.fields.invoicePrefix')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="invoice-prefix"
                    placeholder="FAC"
                    {...settingsForm.register('invoicePrefix')}
                    disabled={isUpdatingSettings}
                    className={settingsForm.formState.errors.invoicePrefix ? 'border-destructive' : ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('billing.fields.invoicePrefixExample')}
                  </p>
                  {settingsForm.formState.errors.invoicePrefix && (
                    <p className="text-xs text-destructive">
                      {settingsForm.formState.errors.invoicePrefix.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format" className="flex items-center gap-2">
                    {t('billing.fields.dateFormat')} <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="dateFormat"
                    control={settingsForm.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || 'DD/MM/YYYY'}
                        disabled={isUpdatingSettings}
                      >
                        <SelectTrigger className={settingsForm.formState.errors.dateFormat ? 'border-destructive' : ''}>
                          <SelectValue placeholder={t('billing.fields.dateFormat')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {settingsForm.formState.errors.dateFormat && (
                    <p className="text-xs text-destructive">
                      {settingsForm.formState.errors.dateFormat.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section Financier */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <FaDollarSign className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-primary">{t('billing.sections.financial')}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('billing.fields.currencyDefinedInWorkspace', {
                  currency: workspace?.defaultCurrency ?? settings?.currency ?? 'XOF',
                })}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="payment-terms" className="flex items-center gap-2">
                    {t('billing.fields.paymentTerms')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="payment-terms"
                    type="number"
                    placeholder="30"
                    {...settingsForm.register('paymentTerms', { valueAsNumber: true })}
                    disabled={isUpdatingSettings}
                    className={settingsForm.formState.errors.paymentTerms ? 'border-destructive' : ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('billing.fields.paymentTermsHint')}
                  </p>
                  {settingsForm.formState.errors.paymentTerms && (
                    <p className="text-xs text-destructive">
                      {settingsForm.formState.errors.paymentTerms.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Signature */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <FaFileAlt className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-primary">{t('billing.fields.signature')}</h3>
              </div>
              <div className="flex flex-row items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>{t('billing.fields.signature')}</Label>
                    <button
                      type="button"
                      onClick={() => setSignatureHelpOpen(true)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title={t('billing.fields.signatureHelp')}
                    >
                      <FaQuestionCircle className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSignatureUploadOpen(true)}
                      className="relative group rounded-lg border border-border overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {settings?.signatureImageUrl ? (
                        <div className="h-28 w-48 rounded-lg border-0 overflow-hidden bg-muted flex items-center justify-center">
                          <Image
                            src={settings.signatureImageUrl}
                            alt="Signature"
                            width={192}
                            height={112}
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="h-28 w-48 rounded-lg border-0 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                          {t('billing.fields.noSignature')}
                        </div>
                      )}
                      <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaPencilAlt className="h-6 w-6 text-white" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isUpdatingSettings || !settingsForm.formState.isDirty}
              className="rounded-full px-6"
            >
              {isUpdatingSettings && <FaSpinner className="mr-2 h-4 w-4 animate-spin" />}
              {t('billing.buttons.save')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <LogoUploadModal
        open={signatureUploadOpen}
        onOpenChange={setSignatureUploadOpen}
        title={t('billing.fields.signature')}
        onFileChange={async (files) => {
          const file = files[0];
          if (!file) return;
          try {
            await uploadSignatureImage(file).unwrap();
            toast.success(t('billing.success.updated'), {
              description: t('billing.success.signatureUpdated'),
            });
          } catch {
            toast.error(t('billing.errors.updateError'), {
              description: t('billing.errors.genericError'),
            });
            throw new Error('Upload failed');
          }
        }}
      />

      {/* Modal d'aide pour créer une signature */}
      <Dialog open={signatureHelpOpen} onOpenChange={setSignatureHelpOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('billing.signatureHelp.title')}</DialogTitle>
            <DialogDescription>
              {t('billing.signatureHelp.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">{t('billing.signatureHelp.methods.title')}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">1.</span>
                  <div>
                    <p className="font-medium text-foreground mb-1">{t('billing.signatureHelp.methods.online.title')}</p>
                    <p className="mb-2">{t('billing.signatureHelp.methods.online.description')}</p>
                    <a
                      href="https://www.signature.io/fr/create-signature"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {t('billing.signatureHelp.methods.online.link')}
                      <FaExternalLinkAlt className="h-3 w-3" />
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">2.</span>
                  <div>
                    <p className="font-medium text-foreground mb-1">{t('billing.signatureHelp.methods.draw.title')}</p>
                    <p className="mb-2">{t('billing.signatureHelp.methods.draw.description')}</p>
                    <a
                      href="https://www.signature-maker.com/fr/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {t('billing.signatureHelp.methods.draw.link')}
                      <FaExternalLinkAlt className="h-3 w-3" />
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">3.</span>
                  <div>
                    <p className="font-medium text-foreground mb-1">{t('billing.signatureHelp.methods.photo.title')}</p>
                    <p>{t('billing.signatureHelp.methods.photo.description')}</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="font-medium text-foreground mb-1">{t('billing.signatureHelp.tip.title')}</p>
              <p className="text-muted-foreground">{t('billing.signatureHelp.tip.description')}</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSignatureHelpOpen(false)}>
              {commonT('close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
