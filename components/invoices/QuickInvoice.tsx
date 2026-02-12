"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus, Loader2, Zap, ArrowRight, Copy, Repeat, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetClientsQuery, useCreateClientMutation, useCreateInvoiceMutation, useSendInvoiceMutation, useGetWorkspaceQuery, useGetInvoicesQuery, useGetDefaultInvoiceTemplateQuery, facturlyApi } from "@/services/facturlyApi";
import { InvoiceTemplateSelector } from "./InvoiceTemplateSelector";
import { store } from "@/lib/redux/store";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import ClientModal from "@/components/modals/ClientModal";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { WhatsAppMessageStyleSelector } from "@/components/whatsapp/WhatsAppMessageStyleSelector";
import type { WhatsAppMessageStyle } from "@/services/api/types/invoice.types";

interface QuickInvoiceProps {
  onSwitchToFullMode?: () => void;
  initialClientId?: string;
}

export function QuickInvoice({ onSwitchToFullMode, initialClientId }: QuickInvoiceProps) {
  const t = useTranslations("invoices.quick");
  const tValidation = useTranslations("invoices.quick.validation");
  const router = useRouter();
  const isMobile = useIsMobile();
  const [clientOpen, setClientOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [whatsappMessageStyle, setWhatsappMessageStyle] = useState<WhatsAppMessageStyle>('professional_warm');
  const amountInputRef = useRef<HTMLInputElement>(null);

  const { data: clientsResponse, isLoading: isLoadingClients } = useGetClientsQuery({ page: 1, limit: 100 });
  const clients = clientsResponse?.data ?? [];
  const { data: workspace } = useGetWorkspaceQuery();
  const workspaceCurrency = workspace?.defaultCurrency || "XOF";

  const [createInvoice, { isLoading: isCreatingInvoice }] = useCreateInvoiceMutation();
  const [sendInvoice, { isLoading: isSendingInvoice }] = useSendInvoiceMutation();

  const { data: defaultTemplate } = useGetDefaultInvoiceTemplateQuery();

  const quickInvoiceSchema = useMemo(
    () =>
      z.object({
        clientId: z.string().min(1, tValidation("clientRequired")),
        amount: z
          .string()
          .min(1, tValidation("amountRequired"))
          .transform((s) => s.trim().replace(/\s/g, "").replace(",", "."))
          .refine(
            (val) => val !== "" && !isNaN(Number(val)) && Number(val) > 0,
            tValidation("amountInvalid")
          ),
        invoiceType: z.enum(["one-time", "recurring"]).optional(),
        templateId: z.string().optional(),
      }),
    [tValidation]
  );

  type QuickInvoiceFormValues = z.infer<typeof quickInvoiceSchema>;

  const form = useForm<QuickInvoiceFormValues>({
    resolver: zodResolver(quickInvoiceSchema),
    mode: 'onTouched', // Afficher les erreurs après interaction
    defaultValues: {
      clientId: initialClientId || "",
      amount: "",
      invoiceType: 'one-time', // Par défaut : facture ponctuelle
      templateId: defaultTemplate?.id || undefined,
    },
  });

  // Mettre à jour le clientId si initialClientId change (ex: depuis l'URL)
  useEffect(() => {
    if (initialClientId && initialClientId !== form.getValues("clientId")) {
      form.reset({
        clientId: initialClientId,
        amount: form.getValues("amount"),
        invoiceType: form.getValues("invoiceType"),
        templateId: form.getValues("templateId"),
      });
    }
  }, [initialClientId, form]);

  const selectedClientId = form.watch("clientId");
  const selectedClient = clients.find((c) => c.id === selectedClientId);
  
  // Récupérer la dernière facture du client sélectionné pour la duplication
  const { data: lastInvoiceResponse } = useGetInvoicesQuery(
    { clientId: selectedClientId, page: 1, limit: 1 },
    { skip: !selectedClientId }
  );
  const lastInvoice = lastInvoiceResponse?.data?.[0];

  // Focus sur le champ montant après sélection du client
  useEffect(() => {
    if (selectedClientId && amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, [selectedClientId]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter ou Cmd+Enter : Envoyer la facture
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (form.formState.isValid) {
          handleSubmit(form.getValues());
        }
      }
      // Ctrl+N : Nouveau client
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setIsClientModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [form]);


  // Dupliquer la dernière facture du client
  const handleDuplicateLastInvoice = async () => {
    if (!selectedClientId || !lastInvoice) return;
    
    setIsDuplicating(true);
    try {
      // Récupérer la facture complète avec RTK Query
      const invoiceResult = await store.dispatch(
        facturlyApi.endpoints.getInvoiceById.initiate(lastInvoice.id)
      );
      
      if ('error' in invoiceResult || !invoiceResult.data) {
        throw new Error('Erreur lors de la récupération de la facture');
      }
      
      const fullInvoice = invoiceResult.data;

      // Préparer les données de la nouvelle facture
      const today = new Date().toISOString().split('T')[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const newDueDate = dueDate.toISOString().split('T')[0];

      const duplicatePayload = {
        clientId: fullInvoice.client.id,
        issueDate: today,
        dueDate: newDueDate,
        currency: fullInvoice.currency,
        items: fullInvoice.items?.map((item: any) => ({
          productId: item.product?.id || undefined,
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
        })) || [],
        notes: fullInvoice.notes || undefined,
        recipientEmail: fullInvoice.recipientEmail || undefined,
        templateName: fullInvoice.templateName || undefined,
      };

      // Créer la nouvelle facture
      const newInvoice = await createInvoice(duplicatePayload).unwrap();
      
      toast.success(t('duplicate.success'), {
        description: t('duplicate.successDescription', { number: lastInvoice.invoiceNumber }),
      });

      // Rediriger vers la page d'édition de la facture dupliquée
      router.push(`/invoices/${newInvoice.id}/edit`);
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || t('duplicate.error'));
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleSubmit = async (data: QuickInvoiceFormValues) => {
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      // Déterminer le template à utiliser
      let templateName: string | undefined = undefined;
      if (data.templateId && !data.templateId.startsWith('base:')) {
        // Template personnalisé (ID)
        templateName = data.templateId;
      } else if (data.templateId && data.templateId.startsWith('base:')) {
        // Template de base (nom)
        templateName = data.templateId.replace('base:', '');
      } else if (defaultTemplate) {
        // Template par défaut du workspace
        templateName = defaultTemplate.id;
      }

      // Créer la facture avec un seul article
      const invoiceData = {
        clientId: data.clientId,
        currency: workspaceCurrency,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 jours
        templateName,
        items: [
          {
            description: data.invoiceType === 'recurring' 
              ? t('defaultItemDescriptionRecurring', { clientName: selectedClient?.name || '' })
              : t('defaultItemDescription'),
            quantity: "1",
            unitPrice: data.amount,
          },
        ],
      };

      const invoice = await createInvoice(invoiceData).unwrap();
      
      // Envoyer la facture immédiatement
      await sendInvoice({ id: invoice.id }).unwrap();
      
      toast.success(t('invoiceSent'), {
        description: t('invoiceSentDescription', { clientName: selectedClient?.name || '' }),
      });

      // Réinitialiser le formulaire
      form.reset({
        clientId: data.clientId, // Garder le client sélectionné
        amount: "",
        invoiceType: data.invoiceType, // Garder le type de facture
      });
      
      // Rediriger vers la liste des factures
      router.push('/invoices');
    } catch (error: any) {
      toast.error(error?.data?.message || t('invoiceError'));
    } finally {
      setIsCreating(false);
    }
  };

  const isLoading = isCreatingInvoice || isSendingInvoice || isCreating;

  const {
    ref: amountFormRef,
    ...amountRegisterProps
  } = form.register("amount", {
    setValueAs: (v) =>
      v === "" || v == null ? "" : String(v).trim().replace(/\s/g, "").replace(",", "."),
  });

  return (
    <Card className={cn("border-2 border-primary/20 shadow-lg", isMobile && "mx-0")}>
      <CardHeader className={cn("pb-4", isMobile && "pb-3")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className={cn("text-primary", isMobile ? "h-6 w-6" : "h-5 w-5")} />
            <CardTitle className={cn(isMobile ? "text-lg" : "text-xl")}>{t('title')}</CardTitle>
          </div>
          {onSwitchToFullMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSwitchToFullMode}
              className={cn(
                isMobile ? "min-h-[44px] text-sm" : "text-xs"
              )}
            >
              {t('switchToFullMode')}
            </Button>
          )}
        </div>
        <CardDescription className={cn(isMobile && "text-sm")}>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(handleSubmit, (errors) => {
            const messages = [
              errors.clientId?.message,
              errors.amount?.message,
            ].filter((m): m is string => typeof m === "string");
            const description = messages.length
              ? messages.join(" • ")
              : tValidation("clientRequired");
            toast.error(t("validationErrorTitle"), { description });
          })}
          className={cn("space-y-6", isMobile && "space-y-4")}
        >
          {/* Étape 1 : Sélectionner un client */}
          <div className="space-y-2">
            <Label htmlFor="client" className="text-sm font-semibold">
              {t('step1.client')} <span className="text-destructive">*</span>
            </Label>
            <Popover open={clientOpen} onOpenChange={setClientOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={clientOpen}
                  className={cn(
                    "w-full justify-between text-left font-normal",
                    isMobile ? "h-12 min-h-[44px]" : "h-11"
                  )}
                  disabled={isLoading}
                  data-tutorial="client-select"
                >
                  {selectedClient ? (
                    <span className="truncate">{selectedClient.name}</span>
                  ) : (
                    <span className="text-muted-foreground">{t('step1.selectClient')}</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder={t('step1.searchClient')} />
                  <CommandList>
                    <CommandEmpty>
                      <div className="py-4 text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          {t('step1.noClient')}
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setClientOpen(false);
                            setIsClientModalOpen(true);
                          }}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          {t('step1.createClient')}
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={client.id}
                          onSelect={() => {
                            form.setValue("clientId", client.id);
                            setClientOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedClientId === client.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{client.name}</span>
                            {client.email && (
                              <span className="text-xs text-muted-foreground">{client.email}</span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <div className="border-t p-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-2",
                          isMobile ? "min-h-[44px]" : ""
                        )}
                        onClick={() => {
                          setClientOpen(false);
                          setIsClientModalOpen(true);
                        }}
                      >
                        <Plus className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
                        {t('step1.createNewClient')}
                      </Button>
                    </div>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {form.formState.errors.clientId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.clientId.message}
              </p>
            )}
            
            {/* Bouton "Dupliquer la dernière facture" - Afficher si un client est sélectionné et qu'il a une facture */}
            {selectedClientId && lastInvoice && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDuplicateLastInvoice}
                disabled={isDuplicating || isLoading}
                className={cn(
                  "w-full gap-2",
                  isMobile ? "h-12 min-h-[44px] text-sm" : "text-xs"
                )}
              >
                {isDuplicating ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t('duplicate.duplicating')}
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    {t('duplicate.lastInvoice', { number: lastInvoice.invoiceNumber })}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Sélection du type de facture */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t('invoiceType.title')}</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => form.setValue('invoiceType', 'one-time')}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border-2 transition-all",
                  isMobile ? "p-4 min-h-[44px]" : "p-3",
                  form.watch('invoiceType') === 'one-time'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
              >
                <FileText className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
                <span className={cn("font-medium", isMobile ? "text-base" : "text-sm")}>{t('invoiceType.oneTime')}</span>
              </button>
              <button
                type="button"
                onClick={() => form.setValue('invoiceType', 'recurring')}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border-2 transition-all",
                  isMobile ? "p-4 min-h-[44px]" : "p-3",
                  form.watch('invoiceType') === 'recurring'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
              >
                <Repeat className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
                <span className={cn("font-medium", isMobile ? "text-base" : "text-sm")}>{t('invoiceType.recurring')}</span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('invoiceType.hint')}
            </p>
          </div>

          {/* Sélection du template (optionnel) */}
          <InvoiceTemplateSelector
            value={form.watch("templateId")}
            onChange={(templateId) => form.setValue("templateId", templateId)}
            className={isMobile ? "space-y-2" : ""}
          />

          {/* Sélection du style de message WhatsApp */}
          <WhatsAppMessageStyleSelector
            value={whatsappMessageStyle}
            onChange={setWhatsappMessageStyle}
            className={isMobile ? "space-y-2" : ""}
          />

          {/* Étape 2 : Entrer le montant */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-semibold">
              {t('step2.amount')} <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder={t('step2.amountPlaceholder')}
                {...amountRegisterProps}
                ref={(el) => {
                  amountFormRef(el);
                  (amountInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                }}
                disabled={isLoading || !selectedClientId}
                className={cn(
                  "font-semibold pr-16",
                  isMobile ? "h-12 min-h-[44px] text-xl" : "h-11 text-lg"
                )}
                data-tutorial="amount-input"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                {workspaceCurrency}
              </div>
            </div>
            {form.formState.errors.amount && (
              <p className="text-xs text-destructive">
                {form.formState.errors.amount.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {t('step2.hint')}
            </p>
          </div>

          {/* Étape 3 : Envoyer */}
          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              className={cn(
                "w-full font-semibold gap-2",
                isMobile ? "h-14 min-h-[44px] text-lg" : "h-12 text-base"
              )}
              disabled={isLoading || !form.formState.isValid}
              data-tutorial="send-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('sending')}
                </>
              ) : (
                <>
                  {t('sendInvoice')}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              {t('shortcuts')}
            </p>
          </div>
        </form>
      </CardContent>

      {/* Modal de création de client rapide */}
      <ClientModal
        open={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSuccess={(client) => {
          form.setValue("clientId", client.id);
          setIsClientModalOpen(false);
          toast.success(t('clientCreated'));
          // Focus sur le champ montant
          setTimeout(() => {
            amountInputRef.current?.focus();
          }, 100);
        }}
      />
    </Card>
  );
}
