"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown, Edit, Plus as PlusIcon, Trash2, FileDown, Clock, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { InvoiceProgress } from "./InvoiceProgress"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "../ui/input"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import React, { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Separator } from "../ui/separator"
import { Card } from "../ui/card"
import { Checkbox } from "../ui/checkbox"
import { devises } from "@/data/datas"
import { useItemsStore } from "@/hooks/useItemStore"
import type { Item } from "@/types/items"
import { SortableItem } from "./SortableItem"
import { useInvoiceMetadata } from "@/hooks/useInvoiceMetadata"
import { useItemModalControls } from "@/contexts/ItemModalContext"
import { useGetClientsQuery, useGetClientByIdQuery, useCreateInvoiceMutation, useUpdateInvoiceMutation, useGetInvoiceByIdQuery, useSendInvoiceMutation, useGetWorkspaceQuery, useGetSettingsQuery, useGetProductsQuery, useCreateRecurringInvoiceMutation, type Invoice } from "@/services/facturlyApi"
import { invoiceTemplates } from "@/types/invoiceTemplate"
import ClientModal from "@/components/modals/ClientModal"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useLoading } from "@/contexts/LoadingContext"
import { useRedirect } from "@/hooks/useRedirect"
import { Redirect } from "@/components/navigation"
import { Loader } from "@/components/ui/loader"
import { useTranslations, useLocale } from 'next-intl'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Link } from "@/i18n/routing"
import { getBackendTemplateName, getFrontendTemplateFromBackend } from "@/types/invoiceTemplate"
import { CommandPalette } from "@/components/invoices/CommandPalette"
import { WhatsAppMessageStyleSelector } from "@/components/whatsapp/WhatsAppMessageStyleSelector"
import type { WhatsAppMessageStyle } from "@/services/api/types/invoice.types"
import { useInvoiceDraftPersistence, clearInvoiceDraft } from "@/hooks/useInvoiceDraftPersistence"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Repeat } from "lucide-react"
import type { RecurrenceFrequency } from "@/services/api/types/recurring-invoice.types"

interface InvoiceDetailsProps {
    invoiceId?: string;
    initialRecurring?: boolean;
    onSaveDraftReady?: (saveFunction: (skipRedirect?: boolean) => Promise<void>) => void;
    onHasUnsavedChanges?: (hasChanges: boolean) => void;
}

const InvoiceDetails = ({ invoiceId, initialRecurring, onSaveDraftReady, onHasUnsavedChanges }: InvoiceDetailsProps = {}) => {
    const t = useTranslations('invoices.form');
    const previewT = useTranslations('invoices.preview');
    const locale = useLocale();
    const searchParams = useSearchParams();
    const clientIdFromUrl = searchParams ? searchParams.get("clientId") || undefined : undefined;
    const recurringFromUrl = searchParams?.get("recurring") === "1";
    const router = useRouter();
    const [advancedOpen, setAdvancedOpen] = useState(!!(initialRecurring ?? recurringFromUrl));
    const [isRecurring, setIsRecurring] = useState(!!(initialRecurring ?? recurringFromUrl));
    const [recurringFrequency, setRecurringFrequency] = useState<RecurrenceFrequency>("monthly");
    const [recurringDayOfMonth, setRecurringDayOfMonth] = useState(1);
    const [recurringAutoSend, setRecurringAutoSend] = useState(false);
    const [recurringRecipientEmail, setRecurringRecipientEmail] = useState("");
    const [recurringNotificationDaysBefore, setRecurringNotificationDaysBefore] = useState(0);
    const [recurringEndDate, setRecurringEndDate] = useState<Date | undefined>(undefined);
    const redirect = useRedirect({ checkUnsavedChanges: false });
    
    const [open, setOpen] = React.useState(false);
    const [clientOpen, setClientOpen] = React.useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = React.useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
    const [lastSavedAt, setLastSavedAt] = React.useState<Date | undefined>(undefined);
    const [redirectAfterSave, setRedirectAfterSave] = React.useState<string | null>(null);
    const [isSavingDraft, setIsSavingDraft] = React.useState(false);
    const clientSearchRef = React.useRef<HTMLButtonElement>(null);
    const { items, setItems, removeItem, clearItems, addItem, updateItem } = useItemsStore();
    const metadataStore = useInvoiceMetadata();
    const { setMetadata, reset: resetMetadata, currency: storedCurrency, clientId: storedClientId, receiver: storedReceiver, subject, issueDate, dueDate, notes, templateId } = metadataStore;
    
    const { data: workspace } = useGetWorkspaceQuery();
    const { data: settings } = useGetSettingsQuery();
    const workspaceCurrency = workspace?.defaultCurrency || "EUR";
    const paymentTermsDays = settings?.paymentTerms ?? 30;
    
    // Utiliser la devise du workspace comme valeur par défaut si aucune devise n'est stockée
    const defaultCurrency = storedCurrency || workspaceCurrency;
    const [value, setValue] = useState(defaultCurrency);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [whatsappMessageStyle, setWhatsappMessageStyle] = useState<WhatsAppMessageStyle>('professional_warm');
    const { openCreate, openEdit } = useItemModalControls();
    const { data: clientsResponse, isLoading: isLoadingClients, refetch: refetchClients } = useGetClientsQuery({ page: 1, limit: 100 });
    const { data: clientFromUrl, isLoading: isLoadingClientFromUrl } = useGetClientByIdQuery(clientIdFromUrl || "", {
        skip: !clientIdFromUrl,
    });
    const clients = clientsResponse?.data ?? [];
    
    // Précharger les produits au chargement de la page pour optimisation
    useGetProductsQuery({ page: 1, limit: 100 });
    const [createInvoice, { isLoading: isCreatingInvoice }] = useCreateInvoiceMutation();
    const [createRecurringInvoice, { isLoading: isCreatingRecurring }] = useCreateRecurringInvoiceMutation();
    const [updateInvoice, { isLoading: isUpdatingInvoice }] = useUpdateInvoiceMutation();
    const [sendInvoice, { isLoading: isSendingInvoice }] = useSendInvoiceMutation();
    const { data: client } = useGetClientByIdQuery(metadataStore.clientId || "", {
        skip: !metadataStore.clientId,
    });
    
    // Charger les données de la facture si on est en mode édition
    const { data: existingInvoice, isLoading: isLoadingInvoice } = useGetInvoiceByIdQuery(
        invoiceId || "",
        { skip: !invoiceId }
    );

    const isEditMode = !!invoiceId;
    const isSaving = isCreatingInvoice || isUpdatingInvoice || isSendingInvoice || isCreatingRecurring;
    
    // Utiliser le contexte de loading global pour griser la page
    const { setLoading } = useLoading();
    
    // Récupérer le template depuis le store, avec fallback sur le template par défaut
    // Utiliser useMemo pour que activeTemplate soit réactif aux changements de templateId
    const activeTemplate = useMemo(() => {
        const templateId = metadataStore.templateId || invoiceTemplates[0].id;
        // S'assurer que le templateId est toujours dans le store
        if (!metadataStore.templateId) {
            metadataStore.setMetadata({ templateId: templateId });
        }
        return templateId;
    }, [metadataStore.templateId]);

    // Créer le schéma de validation avec les traductions
    const FormSchema = useMemo(() => z.object({
        receiver: z.string().min(1, t('validation.receiverRequired')),
        subject: z.string().min(1, t('validation.subjectRequired')),
        issueDate: z.date({
            required_error: t('validation.issueDateRequired'),
        }),
        dueDate: z.date({
            required_error: t('validation.dueDateRequired'),
        }),
        currency: z.string().min(1, t('validation.currencyRequired')),
        notes: z.string().optional(),
    }), [t]);
    
    // Mettre à jour le loader global lors des mutations
    useEffect(() => {
        if (isCreatingInvoice || isUpdatingInvoice || isSendingInvoice || isCreatingRecurring) {
            if (isCreatingRecurring) {
                setLoading(true, t('advanced.recurring.creating'));
            } else if (isSendingInvoice) {
                setLoading(true, t('loading.sending'));
            } else {
                setLoading(true, isEditMode ? t('loading.updating') : t('loading.creating'));
            }
        } else {
            setLoading(false);
        }
    }, [isCreatingInvoice, isUpdatingInvoice, isSendingInvoice, isCreatingRecurring, isEditMode, setLoading, t]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

    // Date d'émission par défaut : date du jour si non définie (en mode création uniquement)
    const defaultIssueDate = issueDate || (isEditMode ? undefined : new Date());
    
    // Calculer la date d'échéance par défaut (délai des paramètres) si pas définie en mode création
    const calculateDefaultDueDate = (issueDateValue?: Date): Date | undefined => {
        if (isEditMode || !issueDateValue) return dueDate;
        const defaultDueDate = new Date(issueDateValue);
        defaultDueDate.setDate(defaultDueDate.getDate() + paymentTermsDays);
        return defaultDueDate;
    };
    
    const defaultDueDate = calculateDefaultDueDate(defaultIssueDate);
    
    // Récupérer le dernier client utilisé depuis localStorage
    const getLastUsedClientId = (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('facturly_last_client_id');
    };

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        mode: 'onChange', // Validation en temps réel
        defaultValues: {
            receiver: storedReceiver || "",
            subject: subject || "",
            currency: defaultCurrency,
            notes: notes || "",
            issueDate: defaultIssueDate,
            dueDate: defaultDueDate,
        },
    })
    
    // Calculer la complétude du formulaire
    const formValues = form.watch();
    const formErrors = form.formState.errors;
    const isFormValid = form.formState.isValid;

    // Persistence locale (localStorage) : brouillon auto-sauvegardé en cas de coupure de connexion
    const { didRestoreDraft } = useInvoiceDraftPersistence({
        form,
        items,
        metadata: {
            clientId: storedClientId,
            templateId: metadataStore.templateId,
            receiver: storedReceiver,
            subject,
            currency: storedCurrency,
        },
        isEditMode,
        setItems,
        setMetadata,
        onRestored: () => {
            toast.success(t('success.draftRestored'), {
                description: t('success.draftRestoredDescription'),
            });
        },
    });
    
    // Une ligne est valide si : description non vide, quantité > 0, prix unitaire > 0
    const isItemValid = (item: Item) =>
        (item.description?.trim() ?? "") !== "" &&
        Number(item.quantity) > 0 &&
        Number(item.unitPrice) > 0;

    const allItemsValid = items.length > 0 && items.every(isItemValid);
    const hasValidItems = items.length > 0 && allItemsValid;

    const getCompletenessInfo = () => {
        const requiredFields = ['receiver', 'subject', 'issueDate', 'dueDate', 'currency'];
        const missingFields: string[] = [];
        
        requiredFields.forEach(field => {
            if (!formValues[field as keyof typeof formValues]) {
                missingFields.push(field);
            } else if (formErrors[field as keyof typeof formErrors]) {
                missingFields.push(field);
            }
        });
        
        // Au moins un article et toutes les lignes valides (description, quantité > 0, prix > 0)
        const hasItems = hasValidItems;
        
        const totalChecks = requiredFields.length + 1; // +1 pour les articles
        const passedChecks = totalChecks - missingFields.length - (hasItems ? 0 : 1);
        const percentage = Math.round((passedChecks / totalChecks) * 100);
        
        return {
            percentage,
            missingFields,
            hasItems,
            isComplete: missingFields.length === 0 && hasItems && isFormValid,
            missingCount: missingFields.length + (hasItems ? 0 : 1)
        };
    };
    
    const completenessInfo = useMemo(() => getCompletenessInfo(), [formValues, formErrors, items.length, isFormValid]);
    
    // Calculer l'étape actuelle de la progression de la création de facture
    const currentStep = useMemo(() => {
        const hasClient = !!(storedClientId || clientIdFromUrl);
        const hasItems = hasValidItems;
        const hasDates = !!(issueDate && dueDate);
        const isComplete = completenessInfo.isComplete;
        
        if (!hasClient) return 1; // Étape 1 : Client
        if (!hasItems) return 2; // Étape 2 : Articles
        if (!hasDates) return 3; // Étape 3 : Dates
        if (isComplete) return 4; // Étape 4 : Prêt à envoyer
        return 3; // Dates renseignées mais pas encore complet
    }, [storedClientId, clientIdFromUrl, items.length, issueDate, dueDate, completenessInfo.isComplete]);
    
    // Initialiser la date d'émission dans le store si elle n'est pas définie (mode création)
    useEffect(() => {
        if (!isEditMode && !issueDate && !existingInvoice) {
            const today = new Date();
            setMetadata({ issueDate: today });
            form.setValue("issueDate", today);
            
            // Calculer et définir la date d'échéance automatiquement (+30 jours)
            const autoDueDate = new Date(today);
            autoDueDate.setDate(autoDueDate.getDate() + 30);
            setMetadata({ dueDate: autoDueDate });
            form.setValue("dueDate", autoDueDate);
        }
    }, [isEditMode, issueDate, existingInvoice, setMetadata, form]);
    
    // Calculer automatiquement la date d'échéance quand la date d'émission change (mode création uniquement)
    useEffect(() => {
        if (!isEditMode && !existingInvoice) {
            const currentIssueDate = form.watch("issueDate");
            const currentDueDate = form.getValues("dueDate");
            
            if (currentIssueDate && currentIssueDate instanceof Date) {
                // Calculer la nouvelle date d'échéance (délai des paramètres)
                const newDueDate = new Date(currentIssueDate);
                newDueDate.setDate(newDueDate.getDate() + paymentTermsDays);
                
                // Mettre à jour seulement si la date d'échéance actuelle n'a pas été modifiée manuellement
                // ou si elle n'existe pas
                if (!currentDueDate || currentDueDate.getTime() === defaultDueDate?.getTime()) {
                    setMetadata({ dueDate: newDueDate });
                    form.setValue("dueDate", newDueDate);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.watch("issueDate"), isEditMode, existingInvoice, paymentTermsDays]);
    
    // Générer automatiquement le sujet quand un client est sélectionné
    useEffect(() => {
        if (!isEditMode && !existingInvoice) {
            const currentReceiver = form.watch("receiver");
            const currentSubject = form.getValues("subject");
            
            // Générer le sujet automatiquement si :
            // - Un client est sélectionné
            // - Le sujet est vide ou correspond au format "Facture [ancien client]"
            if (currentReceiver && currentReceiver.trim() !== '') {
                const expectedSubject = `Facture ${currentReceiver}`;
                const currentSubjectLower = currentSubject?.toLowerCase() || '';
                const receiverLower = currentReceiver.toLowerCase();
                
                // Si le sujet est vide ou commence par "Facture" suivi d'un autre nom de client
                if (!currentSubject || 
                    (currentSubjectLower.startsWith('facture ') && !currentSubjectLower.includes(receiverLower))) {
                    form.setValue("subject", expectedSubject);
                    setMetadata({ subject: expectedSubject });
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.watch("receiver"), isEditMode, existingInvoice]);
    
    // Gérer la création d'un nouveau client
    const handleClientCreated = (newClient: { id: string; name: string }) => {
        // Rafraîchir la liste des clients
        refetchClients().then(() => {
            // Sélectionner automatiquement le nouveau client après le rafraîchissement
            form.setValue("receiver", newClient.name);
            
            // Générer automatiquement le sujet
            const autoSubject = `Facture ${newClient.name}`;
            form.setValue("subject", autoSubject);
            
            setMetadata({
                receiver: newClient.name,
                clientId: newClient.id,
                subject: autoSubject,
            });
            
            // Sauvegarder le dernier client utilisé dans localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('facturly_last_client_id', newClient.id);
            }
            
            // Afficher un toast de confirmation
            toast.success(t('success.clientCreated'), {
                description: t('success.clientCreatedDescription', { name: newClient.name }),
            });
        });
        // Fermer le modal
        setIsClientModalOpen(false);
    };
    
    // Pré-remplir le client si clientId est dans l'URL (sauf si brouillon restauré)
    useEffect(() => {
        if (didRestoreDraft || !clientFromUrl || isLoadingClientFromUrl) return;
        const currentReceiver = form.getValues("receiver");
        if (!currentReceiver || currentReceiver !== clientFromUrl.name) {
            form.setValue("receiver", clientFromUrl.name);
            
            // Générer automatiquement le sujet
            const autoSubject = `Facture ${clientFromUrl.name}`;
            form.setValue("subject", autoSubject);
            
            setMetadata({
                receiver: clientFromUrl.name,
                clientId: clientFromUrl.id,
                subject: autoSubject,
            });
            
            // Sauvegarder le dernier client utilisé dans localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('facturly_last_client_id', clientFromUrl.id);
            }
        }
    }, [didRestoreDraft, clientFromUrl, isLoadingClientFromUrl, form, setMetadata]);
    
    // Si un client est déjà sélectionné dans le store ou localStorage, le pré-remplir (sauf si brouillon restauré)
    useEffect(() => {
        if (didRestoreDraft || clientIdFromUrl || clients.length === 0 || isLoadingClients || isEditMode || existingInvoice) return;
        let clientToUse: (typeof clients)[0] | null = null;
        if (storedClientId) {
            clientToUse = clients.find((c) => c.id === storedClientId) ?? null;
        }
        if (!clientToUse) {
            const lastClientId = getLastUsedClientId();
            if (lastClientId) {
                clientToUse = clients.find((c) => c.id === lastClientId) ?? null;
            }
        }
        if (clientToUse) {
            const currentReceiver = form.getValues("receiver");
            if (!currentReceiver || currentReceiver !== clientToUse.name) {
                form.setValue("receiver", clientToUse.name);
                const autoSubject = `Facture ${clientToUse.name}`;
                form.setValue("subject", autoSubject);
                setMetadata({
                    receiver: clientToUse.name,
                    clientId: clientToUse.id,
                    subject: autoSubject,
                });
                if (typeof window !== 'undefined') {
                    localStorage.setItem('facturly_last_client_id', clientToUse.id);
                }
            }
        }
    }, [didRestoreDraft, storedClientId, clients, isLoadingClients, form, setMetadata, clientIdFromUrl, isEditMode, existingInvoice]);
    
    // Charger les données de la facture existante dans le formulaire si on est en mode édition
    useEffect(() => {
        if (existingInvoice && isEditMode && !isLoadingInvoice) {
            // Pré-remplir le formulaire avec les données de la facture
            form.setValue("receiver", existingInvoice.client.name);
            form.setValue("subject", existingInvoice.invoiceNumber);
            form.setValue("issueDate", new Date(existingInvoice.issueDate));
            form.setValue("dueDate", new Date(existingInvoice.dueDate));
            form.setValue("currency", existingInvoice.currency);
            form.setValue("notes", existingInvoice.notes || "");
            
            // Obtenir le template frontend à partir du templateName backend
            let templateId = invoiceTemplates[0].id; // Par défaut
            if (existingInvoice.templateName) {
                const frontendTemplate = getFrontendTemplateFromBackend(existingInvoice.templateName);
                templateId = frontendTemplate.id;
            }
            
            // Mettre à jour le store de métadonnées
            setMetadata({
                receiver: existingInvoice.client.name,
                clientId: existingInvoice.client.id,
                subject: existingInvoice.invoiceNumber,
                issueDate: new Date(existingInvoice.issueDate),
                dueDate: new Date(existingInvoice.dueDate),
                currency: existingInvoice.currency,
                notes: existingInvoice.notes || "",
                templateId: templateId,
            });
            
            // Charger les items dans le store
            if (existingInvoice.items && existingInvoice.items.length > 0) {
                const invoiceItems = existingInvoice.items.map((item) => ({
                    id: item.id,
                    description: item.description,
                    quantity: parseFloat(item.quantity) || 0,
                    unitPrice: parseFloat(item.unitPrice) || 0,
                    vatRate: 0, // Le taux de TVA n'est pas dans l'item de l'API
                }));
                setItems(invoiceItems);
            } else {
                setItems([]);
            }
        }
    }, [existingInvoice, isEditMode, isLoadingInvoice, form, setMetadata, setItems]);

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        try {
            if (isRecurring && !isEditMode) {
                const ok = await handleCreateRecurring();
                if (ok) return;
                return;
            }
            // Valider que le client est sélectionné
            const clientId = storedClientId || clientIdFromUrl;
            if (!clientId) {
                toast.error(t('errors.clientMissing'), {
                    description: t('errors.clientMissingDescription', { action: t('actions.send') }),
                });
                return;
            }
            
            // Valider que les dates sont définies
            if (!issueDate || !dueDate) {
                toast.error(t('errors.datesMissing'), {
                    description: t('errors.datesMissingDescription', { action: t('actions.send') }),
                });
                return;
            }
            
            // Valider qu'il y a au moins un article
            if (!items || items.length === 0) {
                toast.error(t('errors.noItems'), {
                    description: t('errors.noItemsDescription', { action: t('actions.send') }),
                });
                return;
            }
            if (!allItemsValid) {
                toast.error(t('errors.invalidItems'), {
                    description: t('errors.invalidItemsDescription'),
                });
                return;
            }
            
            // Valider que la devise est définie - utiliser la devise de l'entreprise si aucune n'est stockée
            const currencyToUse = storedCurrency || workspaceCurrency;
            if (!currencyToUse) {
                toast.error(t('errors.currencyMissing'), {
                    description: t('errors.currencyMissingDescription', { action: t('actions.send') }),
                });
                return;
            }

            let invoiceIdToSend: string;

            if (isEditMode && invoiceId) {
                // Mode édition: mettre à jour la facture existante puis l'envoyer
                try {
                    const response = await updateInvoice({
                        id: invoiceId,
                        payload: {
                            clientId: clientId,
                            issueDate: issueDate.toISOString().split('T')[0],
                            dueDate: dueDate.toISOString().split('T')[0],
                            currency: currencyToUse,
                            notes: notes || undefined,
                            status: "draft", // On garde draft pour l'instant, sendInvoice changera le statut
                        },
                    }).unwrap();
                    
                    invoiceIdToSend = invoiceId;
                } catch (updateError: any) {
                    const errorMessage = updateError?.data?.message || updateError?.message || t('errors.updateError');
                    toast.error(t('errors.updateError'), {
                        description: errorMessage,
                    });
                    return;
                }
            } else {
                // Mode création: créer une nouvelle facture puis l'envoyer
                const invoiceItems = items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity.toString(),
                    unitPrice: item.unitPrice.toFixed(2),
                }));
                
                try {
                    // Obtenir le nom du template backend à partir de l'ID frontend
                    // Utiliser directement metadataStore.templateId pour être sûr d'avoir la dernière valeur
                    const currentTemplateId = metadataStore.templateId || invoiceTemplates[0].id;
                    const backendTemplateName = getBackendTemplateName(currentTemplateId);
                    
                    console.log('Creating invoice with template:', {
                        templateId: currentTemplateId,
                        backendTemplateName: backendTemplateName,
                        metadataStoreTemplateId: metadataStore.templateId
                    });
                    
                    // Créer la facture sans envoyer l'email (sendEmail: false)
                    const response = await createInvoice({
                        clientId: clientId,
                        issueDate: issueDate.toISOString().split('T')[0],
                        dueDate: dueDate ? dueDate.toISOString().split('T')[0] : undefined,
                        currency: storedCurrency || workspaceCurrency || undefined,
                        items: invoiceItems,
                        notes: notes || undefined,
                        recipientEmail: undefined, // Pas d'email à la création
                        sendEmail: false, // Ne pas envoyer l'email automatiquement
                        templateName: backendTemplateName,
                    }).unwrap();
                    
                    const invoiceData = response as Invoice;
                    const newInvoiceId = invoiceData?.id;
                    
                    if (!newInvoiceId || typeof newInvoiceId !== 'string' || newInvoiceId === 'undefined' || newInvoiceId.trim() === '') {
                        toast.error(t('errors.idMissing'), {
                            description: t('errors.idMissing'),
                        });
                        return;
                    }
                    
                    invoiceIdToSend = newInvoiceId;
                } catch (createError: any) {
                    const errorMessage = createError?.data?.message || createError?.message || t('errors.createError');
                    toast.error(t('errors.createError'), {
                        description: errorMessage,
                    });
                    return;
                }
            }

            // Envoyer la facture (pour création et édition)
            const selectedClient = clients.find((c) => c.id === clientId) || clientFromUrl;

            // Envoyer la facture
            try {
                const sentInvoice = await sendInvoice({
                    id: invoiceIdToSend,
                    payload: {
                        sendEmail: true,
                        emailTo: selectedClient?.email || undefined,
                        whatsappMessageStyle,
                    },
                }).unwrap();

                toast.success(t('success.invoiceSent'), {
                    description: t('success.invoiceSentDescription', { 
                        number: sentInvoice.invoiceNumber || invoiceIdToSend,
                        email: sentInvoice.recipientEmail || selectedClient?.email || t('common.client')
                    }),
                });

                // Réinitialiser les stores et le brouillon local
                resetMetadata();
                clearItems();
                clearInvoiceDraft();

                // Rediriger vers la page de détails de la facture
                router.replace(`/invoices/${invoiceIdToSend}`);
            } catch (sendError: any) {
                const errorMessage = sendError?.data?.message || sendError?.message || t('errors.sendError');
                toast.error(t('errors.sendError'), {
                    description: errorMessage,
                });
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || t('errors.prepareError');
            toast.error(t('errors.prepareError'), {
                description: errorMessage,
            });
        }
    }

    // Créer une facture récurrente (depuis le formulaire facture)
    const handleCreateRecurring = async (): Promise<boolean> => {
        const clientId = storedClientId || clientIdFromUrl;
        if (!clientId) {
            toast.error(t('errors.clientMissing'), { description: t('errors.clientMissingDescription', { action: t('advanced.recurring.createAction') }) });
            return false;
        }
        if (!issueDate || !dueDate) {
            toast.error(t('errors.datesMissing'), { description: t('errors.datesMissingDescription', { action: t('advanced.recurring.createAction') }) });
            return false;
        }
        if (!items?.length) {
            toast.error(t('errors.noItems'), { description: t('errors.noItemsDescription', { action: t('advanced.recurring.createAction') }) });
            return false;
        }
        if (!allItemsValid) {
            toast.error(t('errors.invalidItems'), { description: t('errors.invalidItemsDescription') });
            return false;
        }
        const currencyToUse = storedCurrency || workspaceCurrency;
        if (!currencyToUse) {
            toast.error(t('errors.currencyMissing'), { description: t('errors.currencyMissingDescription', { action: t('advanced.recurring.createAction') }) });
            return false;
        }
        const currentTemplateId = metadataStore.templateId || invoiceTemplates[0].id;
        const templateName = getBackendTemplateName(currentTemplateId);
        const payload = {
            clientId,
            name: form.getValues("subject") || undefined,
            frequency: recurringFrequency,
            startDate: format(issueDate, "yyyy-MM-dd"),
            endDate: recurringEndDate ? format(recurringEndDate, "yyyy-MM-dd") : undefined,
            dayOfMonth: Math.min(31, Math.max(1, recurringDayOfMonth)),
            autoSend: recurringAutoSend,
            recipientEmail: recurringAutoSend ? (recurringRecipientEmail || undefined) : undefined,
            currency: currencyToUse,
            templateName,
            notes: notes || undefined,
            notificationDaysBefore: recurringNotificationDaysBefore,
            items: items.map((item) => ({
                description: item.description,
                quantity: item.quantity.toString(),
                unitPrice: item.unitPrice.toFixed(2),
            })),
        };
        try {
            const result = await createRecurringInvoice(payload).unwrap();
            resetMetadata();
            clearItems();
            clearInvoiceDraft();
            toast.success(t('advanced.recurring.createSuccess'));
            router.replace(`/recurring-invoices/${result.id}`);
            return true;
        } catch (err: unknown) {
            const msg = err && typeof err === "object" && "data" in err && (err as { data?: { message?: string } }).data?.message;
            toast.error(t('errors.prepareError'), { description: typeof msg === "string" ? msg : t('advanced.recurring.createError') });
            return false;
        }
    };

    // Fonction pour sauvegarder le brouillon (création ou mise à jour)
    const handleSaveDraft = async (skipRedirect: boolean = false) => {
        setIsSavingDraft(true);
        try {
            if (isRecurring && !isEditMode) {
                const ok = await handleCreateRecurring();
                setIsSavingDraft(false);
                return;
            }
            // Valider que le client est sélectionné
            const clientId = storedClientId || clientIdFromUrl;
            if (!clientId) {
                toast.error(t('errors.clientMissing'), {
                    description: t('errors.clientMissingDescription', { action: t('actions.save') }),
                });
                return;
            }
            
            // Valider que les dates sont définies
            if (!issueDate || !dueDate) {
                toast.error(t('errors.datesMissing'), {
                    description: t('errors.datesMissingDescription', { action: t('actions.save') }),
                });
                return;
            }
            
            // Valider qu'il y a au moins un article
            if (!items || items.length === 0) {
                toast.error(t('errors.noItems'), {
                    description: t('errors.noItemsDescription', { action: t('actions.save') }),
                });
                return;
            }
            if (!allItemsValid) {
                toast.error(t('errors.invalidItems'), {
                    description: t('errors.invalidItemsDescription'),
                });
                return;
            }
            
            // Valider que la devise est définie
            // Utiliser la devise de l'entreprise si aucune n'est stockée
            const currencyToUse = storedCurrency || workspaceCurrency;
            if (!currencyToUse) {
                toast.error(t('errors.currencyMissing'), {
                    description: t('errors.currencyMissingDescription', { action: t('actions.save') }),
                });
                return;
            }
            
            if (isEditMode && invoiceId) {
                // Mode édition: mettre à jour la facture existante
                try {
                    const response = await updateInvoice({
                        id: invoiceId,
                        payload: {
                            clientId: clientId,
                            issueDate: issueDate.toISOString().split('T')[0], // Format YYYY-MM-DD
                            dueDate: dueDate.toISOString().split('T')[0], // Format YYYY-MM-DD
                            currency: currencyToUse,
                            notes: notes || undefined,
                            status: "draft", // Maintenir le statut brouillon
                        },
                    }).unwrap();
                    
                    // Note: La mise à jour des items se fait via les endpoints spécifiques (createInvoiceItem, updateInvoiceItem, deleteInvoiceItem)
                    // Pour l'instant, on met uniquement à jour les métadonnées de la facture
                    // TODO: Gérer la synchronisation des items (création, mise à jour, suppression)
                    
                    console.log("✅ Invoice updated successfully:", response);
                    
                    // Afficher un toast de succès
                    toast.success(t('success.draftUpdated'), {
                        description: t('success.draftUpdatedDescription', { number: response?.invoiceNumber || invoiceId }),
                    });
                    
                    // Mettre à jour la date de dernière sauvegarde
                    setLastSavedAt(new Date());
                    
                    // Rediriger vers la page de détails de la facture seulement si skipRedirect est false
                    if (!skipRedirect) {
                        router.replace(`/invoices/${invoiceId}`);
                    }
                } catch (updateError: any) {
                    // Si l'erreur vient de la mise à jour, elle sera gérée par le catch principal
                    throw updateError;
                }
            } else {
                // Mode création: créer une nouvelle facture
                // Transformer les items en format API
                const invoiceItems = items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity.toString(),
                    unitPrice: item.unitPrice.toFixed(2),
                    // productId sera undefined si l'item n'est pas lié à un produit
                }));
                
                try {
                    // Obtenir le nom du template backend à partir de l'ID frontend
                    // Utiliser directement metadataStore.templateId pour être sûr d'avoir la dernière valeur
                    const currentTemplateId = metadataStore.templateId || invoiceTemplates[0].id;
                    const backendTemplateName = getBackendTemplateName(currentTemplateId);
                    
                    console.log('Saving draft with template:', {
                        templateId: currentTemplateId,
                        backendTemplateName: backendTemplateName,
                        metadataStoreTemplateId: metadataStore.templateId
                    });
                    
                    const response = await createInvoice({
                        clientId: clientId,
                        issueDate: issueDate.toISOString().split('T')[0], // Format YYYY-MM-DD
                        dueDate: dueDate ? dueDate.toISOString().split('T')[0] : undefined, // Format YYYY-MM-DD (optionnel)
                        currency: storedCurrency || workspaceCurrency || undefined, // Optionnel, utilise la devise de l'entreprise par défaut
                        items: invoiceItems,
                        notes: notes || undefined,
                        templateName: backendTemplateName,
                        // Note: sendEmail n'est pas inclus ici car c'est juste une sauvegarde de brouillon
                    }).unwrap();
                    
                    // RTK Query retourne directement les données de l'API
                    // La réponse devrait être de type Invoice avec un id
                    const invoiceData = response as Invoice;
                    
                    // Debug: afficher la réponse complète pour comprendre la structure
                    console.log("Invoice creation response:", invoiceData);
                    console.log("Invoice ID:", invoiceData?.id);
                    console.log("Invoice Number:", invoiceData?.invoiceNumber);
                    console.log("Response keys:", invoiceData ? Object.keys(invoiceData) : "response is null");
                    
                    // Extraire l'ID de la facture
                    const newInvoiceId = invoiceData?.id;
                    
                    // Valider que l'ID existe et est valide
                    if (!newInvoiceId || typeof newInvoiceId !== 'string' || newInvoiceId === 'undefined' || newInvoiceId.trim() === '') {
                        console.error("❌ Invoice ID is missing or invalid:", {
                            newInvoiceId,
                            invoiceData,
                            responseType: typeof invoiceData,
                            hasId: 'id' in (invoiceData || {}),
                            allKeys: invoiceData ? Object.keys(invoiceData) : [],
                        });
                        
                        toast.warning(t('success.draftSaved'), {
                            description: t('errors.idMissingRedirect'),
                        });
                        
                        // Rediriger vers la liste des factures au lieu de la page de détails
                        setTimeout(() => {
                            router.push('/invoices');
                        }, 1000);
                        return;
                    }
                    
                    console.log("✅ Invoice created successfully with ID:", newInvoiceId);
                    
                    // Afficher un toast de succès
                    toast.success(t('success.draftSaved'), {
                        description: t('success.draftSavedDescription', { number: invoiceData?.invoiceNumber || newInvoiceId }),
                    });
                    
                    // Mettre à jour la date de dernière sauvegarde
                    setLastSavedAt(new Date());
                    
                    // Réinitialiser les stores et le brouillon local après la création réussie seulement si skipRedirect est false
                    // Si skipRedirect est true, on laisse le parent gérer la navigation et la réinitialisation
                    if (!skipRedirect) {
                        resetMetadata();
                        clearItems();
                        clearInvoiceDraft();
                        
                        // Déclencher la redirection avec loader
                        setRedirectAfterSave(`/invoices/${newInvoiceId}`);
                    }
                } catch (createError: any) {
                    // Si l'erreur vient de la création, elle sera gérée par le catch principal
                    throw createError;
                }
            }
        } catch (error: any) {
            // Afficher un toast d'erreur
            const errorMessage = error?.data?.message || error?.message || t('errors.saveError');
            toast.error(t('errors.saveError'), {
                description: errorMessage,
            });
        } finally {
            setIsSavingDraft(false);
        }
    }

    // Exposer la fonction de sauvegarde au parent (après sa définition)
    useEffect(() => {
        if (onSaveDraftReady && !isEditMode) {
            onSaveDraftReady(handleSaveDraft);
        }
    }, [onSaveDraftReady, isEditMode]); // Note: handleSaveDraft n'est pas dans les dépendances pour éviter les re-renders infinis

    // Fonction pour générer le PDF
    const handleGeneratePDF = async () => {
        if (!invoiceId) {
            toast.error(previewT('pdf.errors.notSaved'), {
                description: previewT('pdf.errors.notSaved'),
            });
            return;
        }

        setIsGeneratingPDF(true);
        try {
            const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://facturlybackend-production.up.railway.app";
            
            // Obtenir le token d'authentification
            const cookies = document.cookie.split("; ");
            const tokenCookie = cookies.find((cookie) => cookie.startsWith("facturly_access_token="));
            const token = tokenCookie ? tokenCookie.split("=")[1] : null;

            if (!token) {
                toast.error(previewT('pdf.errors.notLoggedIn'), {
                    description: previewT('pdf.errors.notLoggedIn'),
                });
                setIsGeneratingPDF(false);
                return;
            }

            // Mapper le template frontend au nom backend
            // Utiliser directement metadataStore.templateId pour être sûr d'avoir la dernière valeur
            const currentTemplateId = metadataStore.templateId || invoiceTemplates[0].id;
            const backendTemplateName = getBackendTemplateName(currentTemplateId);
            
            // Construire l'URL avec le paramètre template optionnel
            const pdfUrl = `${BASE_URL}/invoices/${invoiceId}/pdf${backendTemplateName ? `?template=${backendTemplateName}` : ""}`;

            // Créer un lien temporaire pour télécharger le PDF
            const link = document.createElement("a");
            link.href = pdfUrl;
            link.download = `facture-${invoiceId}.pdf`;
            
            // Ajouter le token et la locale dans les headers via fetch puis créer un blob
            const currentLocale = locale || 'fr'; // Fallback sur 'fr' si locale n'est pas disponible
            const response = await fetch(pdfUrl, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-locale': currentLocale,
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error(previewT('pdf.errors.proOnly'));
                }
                throw new Error(previewT('pdf.errors.generic'));
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            link.href = url;
            link.click();
            
            // Nettoyer
            window.URL.revokeObjectURL(url);
            
            toast.success(previewT('pdf.success'), {
                description: previewT('pdf.successDescription'),
            });
        } catch (error: any) {
            console.error("Erreur lors de la génération du PDF:", error);
            toast.error(previewT('pdf.errors.generic'), {
                description: error?.message || previewT('pdf.errors.retry'),
            });
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // Détecter les modifications non sauvegardées
    useEffect(() => {
        if (!onHasUnsavedChanges || isEditMode) return;

        // Vérifier si des données ont été saisies
        const hasChanges = Boolean(
            (storedClientId || storedReceiver) || 
            items.length > 0 || 
            (storedCurrency || workspaceCurrency) || 
            issueDate || 
            dueDate || 
            subject || 
            notes
        );

        onHasUnsavedChanges(hasChanges);
    }, [storedClientId, storedReceiver, items.length, storedCurrency, workspaceCurrency, issueDate, dueDate, subject, notes, onHasUnsavedChanges, isEditMode]);

    useEffect(() => {
        const subscription = form.watch((values) => {
            // Trouver le client correspondant au receiver
            const matchingClient = clients.find((c) => c.name === values.receiver);
            const clientId = matchingClient?.id || storedClientId || undefined;
            
            setMetadata({
                receiver: values.receiver ?? "",
                clientId: clientId,
                subject: values.subject ?? "",
                issueDate: values.issueDate,
                dueDate: values.dueDate,
                currency: values.currency ?? "",
                notes: values.notes ?? "",
            })
        })

        return () => subscription.unsubscribe()
    }, [form, setMetadata, clients, storedClientId])

    useEffect(() => {
        // Si aucune devise n'est stockée, utiliser celle de l'entreprise
        const currentCurrency = storedCurrency || workspaceCurrency;
        if (currentCurrency && currentCurrency !== value) {
            setValue(currentCurrency);
            form.setValue("currency", currentCurrency);
            // Mettre à jour le store si nécessaire
            if (!storedCurrency) {
                setMetadata({ currency: currentCurrency });
            }
        }
    }, [storedCurrency, workspaceCurrency, value, form, setMetadata])

    const itemIds = useMemo(() => items.map((item) => item.id), [items])

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        setItems(arrayMove(items, oldIndex, newIndex))
    }

    // Gérer le focus sur le champ client
    const handleFocusClient = () => {
        setClientOpen(true);
        // Focus sera géré automatiquement par le Popover
    };

    // Gestionnaires de raccourcis clavier
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ne pas intercepter si on est dans un input, textarea, ou un modal
            const target = e.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
            const isContentEditable = target.isContentEditable;
            const isModalOpen = isClientModalOpen;
            
            // Ctrl/Cmd + K : Ouvrir palette de commandes
            if ((e.metaKey || e.ctrlKey) && e.key === 'k' && !isInput && !isContentEditable) {
                e.preventDefault();
                setCommandPaletteOpen((open) => !open);
                return;
            }

            // Ne pas intercepter les autres raccourcis si on est dans un input ou modal
            if (isInput || isContentEditable || isModalOpen) {
                // Mais permettre Escape pour fermer les modaux
                if (e.key === 'Escape') {
                    if (isClientModalOpen) {
                        setIsClientModalOpen(false);
                    }
                    if (clientOpen) {
                        setClientOpen(false);
                    }
                }
                return;
            }

            // Ctrl/Cmd + S : Sauvegarder le brouillon
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                // Appeler handleSaveDraft via la référence du formulaire
                const formData = form.getValues();
                const currentClientId = storedClientId || clientIdFromUrl;
                if (currentClientId && formData.issueDate && formData.dueDate) {
                    handleSaveDraft(false).catch(() => {});
                } else {
                    toast.error(t('errors.clientMissing'), {
                        description: t('errors.clientMissingDescription', { action: t('actions.save') }),
                    });
                }
                return;
            }

            // Ctrl/Cmd + Enter : Envoyer la facture
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                form.handleSubmit(onSubmit)();
                return;
            }

            // N : Ajouter un nouvel article (seulement si on est dans la section articles)
            if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                // Vérifier si on est focus sur la section articles (approximation)
                const invoiceLinesSection = document.querySelector('[data-section="invoice-lines"]');
                if (invoiceLinesSection && invoiceLinesSection.contains(target) || document.activeElement?.closest('[data-section="invoice-lines"]')) {
                    e.preventDefault();
                    openCreate();
                    return;
                }
            }

            // Escape : Fermer les modaux
            if (e.key === 'Escape') {
                if (clientOpen) {
                    setClientOpen(false);
                }
                if (commandPaletteOpen) {
                    setCommandPaletteOpen(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isClientModalOpen, clientOpen, commandPaletteOpen, openCreate, form, storedClientId, clientIdFromUrl, t]);

    // Redirection avec loader après sauvegarde
    if (redirectAfterSave) {
        return (
            <Redirect
                to={redirectAfterSave}
                type="replace"
                checkUnsavedChanges={false}
                showLoader={true}
                loaderType="saving"
                delay={300}
            />
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
                {/* Indicateur de progression (uniquement en mode création) */}
                {!isEditMode && (
                    <InvoiceProgress
                        currentStep={currentStep}
                        isSavingDraft={isSavingDraft}
                        lastSavedAt={lastSavedAt}
                        isEditMode={isEditMode}
                    />
                )}
                <section className="space-y-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div>
                        <p className="text-lg font-semibold text-slate-900">{t('sections.invoiceInfo.title')}</p>
                        <p className="text-sm text-slate-500">{t('sections.invoiceInfo.description')}</p>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="receiver"
                            render={({ field }) => (
                                <FormItem className="flex flex-col justify-end">
                                    <FormLabel>{t('fields.receiver.label')}</FormLabel>
                                    <Popover open={clientOpen} onOpenChange={setClientOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={clientOpen}
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? (clients.find((client) => client.name === field.value)?.name || 
                                                           clientFromUrl?.name || 
                                                           field.value)
                                                        : t('fields.receiver.placeholder')}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                            <Command shouldFilter={true}>
                                                <CommandInput 
                                                    placeholder={t('fields.receiver.searchPlaceholder') || "Rechercher un client..."} 
                                                    className="h-9"
                                                />
                                                <CommandList>
                                                    {isLoadingClients ? (
                                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                                            {t('fields.receiver.loading')}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <CommandEmpty>
                                                                <div className="py-6 text-center">
                                                                    <p className="text-sm text-muted-foreground mb-2">{t('fields.receiver.empty')}</p>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="gap-2"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            setClientOpen(false);
                                                                            // Utiliser un setTimeout pour s'assurer que le popover est fermé avant d'ouvrir le modal
                                                                            setTimeout(() => {
                                                                                setIsClientModalOpen(true);
                                                                            }, 100);
                                                                        }}
                                                                    >
                                                                        <PlusIcon className="h-4 w-4" />
                                                                        {t('fields.receiver.createNew')}
                                                                    </Button>
                                                                </div>
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {(() => {
                                                                    // Trier les clients : dernier utilisé en premier
                                                                    const lastUsedClientId = getLastUsedClientId();
                                                                    const sortedClients = [...clients].sort((a, b) => {
                                                                        if (a.id === lastUsedClientId) return -1;
                                                                        if (b.id === lastUsedClientId) return 1;
                                                                        return 0;
                                                                    });

                                                                    return sortedClients.length === 0 ? (
                                                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                                                            {t('fields.receiver.noClients')}
                                                                        </div>
                                                                    ) : (
                                                                        sortedClients.map((client) => {
                                                                            const isLastUsed = client.id === lastUsedClientId;
                                                                            return (
                                                                                <CommandItem
                                                                                    key={client.id}
                                                                                    value={`${client.name} ${client.email || ""} ${client.phone || ""} ${client.city || ""}`}
                                                                                    onSelect={() => {
                                                                                        field.onChange(client.name);
                                                                                        
                                                                                        // Générer automatiquement le sujet
                                                                                        const autoSubject = `Facture ${client.name}`;
                                                                                        form.setValue("subject", autoSubject);
                                                                                        
                                                                                        setMetadata({
                                                                                            receiver: client.name,
                                                                                            clientId: client.id,
                                                                                            subject: autoSubject,
                                                                                        });
                                                                                        
                                                                                        // Sauvegarder le dernier client utilisé dans localStorage
                                                                                        if (typeof window !== 'undefined') {
                                                                                            localStorage.setItem('facturly_last_client_id', client.id);
                                                                                        }
                                                                                        
                                                                                        setClientOpen(false);
                                                                                    }}
                                                                                    className={cn(
                                                                                        "cursor-pointer",
                                                                                        isLastUsed && "bg-accent/50"
                                                                                    )}
                                                                                >
                                                                                    <div className="flex flex-1 flex-col gap-0.5">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="font-medium">{client.name}</span>
                                                                                            {isLastUsed && (
                                                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-md">
                                                                                                    <Clock className="h-3 w-3" />
                                                                                                    {t('fields.receiver.recent') || "Récent"}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                        {(client.email || client.phone || client.city) && (
                                                                                            <span className="text-xs text-muted-foreground">
                                                                                                {[client.email, client.phone, client.city].filter(Boolean).join(" • ")}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    <Check
                                                                                        className={cn(
                                                                                            "ml-2 h-4 w-4 shrink-0",
                                                                                            field.value === client.name ? "opacity-100" : "opacity-0"
                                                                                        )}
                                                                                    />
                                                                                </CommandItem>
                                                                            );
                                                                        })
                                                                    );
                                                                })()}
                                                            </CommandGroup>
                                                            <CommandSeparator />
                                                            <CommandGroup>
                                                                <CommandItem
                                                                    onSelect={() => {
                                                                        setClientOpen(false);
                                                                        // Utiliser un setTimeout pour s'assurer que le popover est fermé avant d'ouvrir le modal
                                                                        setTimeout(() => {
                                                                            setIsClientModalOpen(true);
                                                                        }, 100);
                                                                    }}
                                                                    className="cursor-pointer text-primary font-medium"
                                                                >
                                                                    <PlusIcon className="mr-2 h-4 w-4" />
                                                                    <span>{t('fields.receiver.createNew')}</span>
                                                                </CommandItem>
                                                            </CommandGroup>
                                                        </>
                                                    )}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('fields.subject.label')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('fields.subject.placeholder')} className="w-full" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="issueDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>{t('fields.issueDate.label')}</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, locale === 'fr' ? "dd/MM/yyyy" : "MM/dd/yyyy")
                                                    ) : (
                                                        <span>{t('fields.issueDate.placeholder')}</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date("2100-01-01")}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>{t('fields.dueDate.label')}</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, locale === 'fr' ? "dd/MM/yyyy" : "MM/dd/yyyy")
                                                    ) : (
                                                        <span>{t('fields.dueDate.placeholder')}</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < form.getValues("issueDate")}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('fields.currency.label')}</FormLabel>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={open}
                                                    className="w-full justify-between"
                                                >
                                                    {value
                                                        ? devises.find((devise) => devise.value === value)?.label
                                                        : t('fields.currency.placeholder')}
                                                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[320px] p-0">
                                            <Command>
                                                <CommandInput placeholder={t('fields.currency.searchPlaceholder')} className="h-9" />
                                                <CommandList>
                                                    <CommandEmpty>{t('fields.currency.empty')}</CommandEmpty>
                                                    <CommandGroup>
                                                        {devises.map((devise) => (
                                                            <CommandItem
                                                                key={devise.value}
                                                                value={devise.value}
                                                                onSelect={(currentValue) => {
                                                                    const nextValue = currentValue === value ? "" : currentValue
                                                                    setValue(nextValue)
                                                                    field.onChange(nextValue)
                                                                    setOpen(false)
                                                                }}
                                                            >
                                                                {devise.label}
                                                                <Check
                                                                    className={cn(
                                                                        "ml-auto",
                                                                        value === devise.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>{t('fields.notes.label')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('fields.notes.placeholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </section>

                {/* Options avancées : facture récurrente (création uniquement) */}
                {!isEditMode && (
                    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                            <CollapsibleTrigger asChild>
                                <Button type="button" variant="ghost" className="w-full justify-between p-0 h-auto font-semibold text-slate-900 hover:bg-transparent">
                                    <span className="flex items-center gap-2">
                                        <Repeat className="h-4 w-4 text-primary" />
                                        {t('advanced.title')}
                                    </span>
                                    <ChevronDown className={cn("h-4 w-4 transition-transform", advancedOpen && "rotate-180")} />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="pt-4 space-y-4 border-t mt-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="recurring"
                                            checked={isRecurring}
                                            onCheckedChange={(v) => setIsRecurring(!!v)}
                                        />
                                        <label htmlFor="recurring" className="text-sm font-medium cursor-pointer">
                                            {t('advanced.recurring.label')}
                                        </label>
                                    </div>
                                    {isRecurring && (
                                        <div className="grid gap-4 md:grid-cols-2 pl-6">
                                            <div>
                                                <label className="text-sm font-medium mb-2 block">{t('advanced.recurring.frequency')}</label>
                                                <Select value={recurringFrequency} onValueChange={(v) => setRecurringFrequency(v as RecurrenceFrequency)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="monthly">{t('advanced.recurring.frequencyMonthly')}</SelectItem>
                                                        <SelectItem value="quarterly">{t('advanced.recurring.frequencyQuarterly')}</SelectItem>
                                                        <SelectItem value="yearly">{t('advanced.recurring.frequencyYearly')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-2 block">{t('advanced.recurring.dayOfMonth')}</label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={31}
                                                    value={recurringDayOfMonth}
                                                    onChange={(e) => setRecurringDayOfMonth(parseInt(e.target.value, 10) || 1)}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-sm font-medium mb-2 block">{t('advanced.recurring.endDate')}</label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                            {recurringEndDate ? format(recurringEndDate, "PPP") : t('advanced.recurring.endDateOptional')}
                                                            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={recurringEndDate}
                                                            onSelect={setRecurringEndDate}
                                                            disabled={(date) => issueDate ? date < issueDate : false}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <div className="flex items-center space-x-2 md:col-span-2">
                                                <Checkbox id="recurringAutoSend" checked={recurringAutoSend} onCheckedChange={(v) => setRecurringAutoSend(!!v)} />
                                                <label htmlFor="recurringAutoSend" className="text-sm font-medium cursor-pointer">{t('advanced.recurring.autoSend')}</label>
                                            </div>
                                            {recurringAutoSend && (
                                                <div className="md:col-span-2">
                                                    <label className="text-sm font-medium mb-2 block">{t('advanced.recurring.recipientEmail')}</label>
                                                    <Input
                                                        type="email"
                                                        placeholder={t('advanced.recurring.recipientEmailPlaceholder')}
                                                        value={recurringRecipientEmail}
                                                        onChange={(e) => setRecurringRecipientEmail(e.target.value)}
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <label className="text-sm font-medium mb-2 block">{t('advanced.recurring.notificationDaysBefore')}</label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={recurringNotificationDaysBefore}
                                                    onChange={(e) => setRecurringNotificationDaysBefore(parseInt(e.target.value, 10) || 0)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </section>
                )}

                <section data-section="invoice-lines" className="space-y-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-lg font-semibold text-slate-900">{t('sections.invoiceLines.title')}</p>
                            <p className="text-sm text-slate-500">{t('sections.invoiceLines.description')}</p>
                        </div>
                        <Button 
                            type="button" 
                            size="sm" 
                            className="gap-2" 
                            onClick={() => {
                                addItem({
                                    description: '',
                                    quantity: 1,
                                    unitPrice: 0,
                                    vatRate: workspace?.defaultTaxRate ? parseFloat(workspace.defaultTaxRate) * 100 : 18,
                                });
                            }}
                        >
                            <PlusIcon className="h-4 w-4" />
                            {t('lines.add')}
                        </Button>
                    </div>

                    <Separator />

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                            <div className="flex flex-col gap-2">
                                {/* En-têtes du tableau */}
                                <div className="hidden md:grid md:grid-cols-12 gap-2 px-2 py-1.5 text-[10px] font-semibold text-slate-600 border-b border-slate-200 bg-slate-50/50 rounded-t-md">
                                    <div className="col-span-5">{t('lines.description')}</div>
                                    <div className="col-span-1">{t('lines.quantity')}</div>
                                    <div className="col-span-2">{t('lines.unitPrice')}</div>
                                    <div className="col-span-1">{t('lines.vat')}</div>
                                    <div className="col-span-2 text-right">{t('lines.lineTotal')}</div>
                                    <div className="col-span-1"></div>
                                </div>
                                
                                {/* Lignes de produits */}
                                {items.length > 0 ? (
                                    items.map((item) => {
                                        const lineTotal = (parseFloat(item.unitPrice.toString()) || 0) * (parseFloat(item.quantity.toString()) || 0);
                                        return (
                                            <SortableItem key={item.id} id={item.id}>
                                                <Card className="rounded-md border border-slate-200 p-2 shadow-sm hover:shadow-md transition-all hover:border-primary/30 bg-white">
                                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                                                        {/* Description */}
                                                        <div className="col-span-1 md:col-span-3">
                                                            <label className="text-[10px] font-medium text-slate-600 mb-1 block md:hidden">
                                                                {t('lines.description')}
                                                            </label>
                                                            <Input
                                                                value={item.description}
                                                                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                                                placeholder={t('lines.description')}
                                                                className="text-xs h-7 border-slate-200 focus:border-primary focus:ring-1"
                                                            />
                                                        </div>
                                                        
                                                        {/* Quantité */}
                                                        <div className="col-span-1 md:col-span-2">
                                                            <label className="text-[10px]  font-medium text-slate-600 mb-1 block md:hidden">
                                                                {t('lines.quantity')}
                                                            </label>
                                                            <Input
                                                                type="number"
                                                                step="1"
                                                                min="0"
                                                                value={item.quantity}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    if (val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0)) {
                                                                        updateItem(item.id, { quantity: val === '' ? 0 : parseFloat(val) });
                                                                    }
                                                                }}
                                                                className="text-xs h-7 border-slate-200 focus:border-primary focus:ring-1 "
                                                            />
                                                        </div>
                                                        
                                                        {/* Prix unitaire */}
                                                        <div className="col-span-1 md:col-span-2">
                                                            <label className="text-[10px] font-medium text-slate-600 mb-1 block md:hidden">
                                                                {t('lines.unitPrice')}
                                                            </label>
                                                            <div className="relative">
                                                                <Input
                                                                    type="text"
                                                                    value={item.unitPrice}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        if (val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0)) {
                                                                            updateItem(item.id, { unitPrice: val === '' ? 0 : parseFloat(val) });
                                                                        }
                                                                    }}
                                                                    className="text-xs h-7 border-slate-200 focus:border-primary focus:ring-1 pr-7"
                                                                />
                                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 font-medium">
                                                                    {form.getValues("currency") || ""}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* TVA */}
                                                        <div className="col-span-1 md:col-span-2">
                                                            <label className="text-[10px] font-medium text-slate-600 mb-1 block md:hidden">
                                                                {t('lines.vat')}
                                                            </label>
                                                            <div className="relative">
                                                                <Input
                                                                    type="text"
                                                                    
                                                                    value={item.vatRate}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        if (val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100)) {
                                                                            updateItem(item.id, { vatRate: val === '' ? 0 : parseFloat(val) });
                                                                        }
                                                                    }}
                                                                    className="text-xs h-7 border-slate-200 focus:border-primary focus:ring-1 pr-5"
                                                                />
                                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 font-medium">%</span>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Total ligne */}
                                                        <div className="col-span-1 md:col-span-2 text-right">
                                                            <label className="text-[10px] font-medium text-slate-600 mb-1 block md:hidden">
                                                                {t('lines.lineTotal')}
                                                            </label>
                                                            <p className="text-xs font-semibold text-slate-900">
                                                                {lineTotal.toFixed(2)} {form.getValues("currency") || ""}
                                                            </p>
                                                        </div>
                                                        
                                                        {/* Actions */}
                                                        <div className="col-span-1 md:col-span-1 flex justify-end">
                                                            <Button 
                                                                variant="destructive" 
                                                                size="icon" 
                                                                className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                                                                onClick={() => removeItem(item.id)} 
                                                                aria-label={t('lines.delete', { description: item.description })}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </SortableItem>
                                        );
                                    })
                                ) : null}
                                
                                {/* Bouton pour ajouter une nouvelle ligne */}
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    className="gap-2 h-9 border-dashed border-slate-300 hover:border-primary hover:bg-primary/5"
                                    onClick={() => {
                                        addItem({
                                            description: '',
                                            quantity: 1,
                                            unitPrice: 0,
                                            vatRate: workspace?.defaultTaxRate ? parseFloat(workspace.defaultTaxRate) * 100 : 18,
                                        });
                                    }}
                                >
                                    <PlusIcon className="h-3.5 w-3.5" />
                                    <span className="text-xs">{t('lines.add')}</span>
                                </Button>
                            </div>
                        </SortableContext>
                    </DndContext>
                    
                    {items.length === 0 && (
                        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-slate-300 p-6 text-center">
                            <p className="text-sm font-semibold text-slate-600">{t('sections.invoiceLines.empty.title')}</p>
                            <p className="text-xs text-slate-500">{t('sections.invoiceLines.empty.description')}</p>
                            <Button 
                                type="button"
                                variant="outline" 
                                size="sm" 
                                className="gap-2" 
                                onClick={() => {
                                    addItem({
                                        description: '',
                                        quantity: 1,
                                        unitPrice: 0,
                                        vatRate: workspace?.defaultTaxRate ? parseFloat(workspace.defaultTaxRate) * 100 : 18,
                                    });
                                }}
                            >
                                <PlusIcon className="h-4 w-4" />
                                {t('lines.add')}
                            </Button>
                        </div>
                    )}
                </section>

                <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2">
                            <Checkbox id="discount" />
                            <label
                                htmlFor="discount"
                                className="text-sm font-medium leading-none"
                            >
                                {t('sections.discount.title')}
                            </label>
                        </div>
                        <Select disabled>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder={t('sections.discount.comingSoon')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="10">10%</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-2 text-sm text-slate-500">
                        <p>{t('sections.discount.description')}</p>
                    </div>
                </section>

                <div className="flex flex-col gap-3">
                    {isEditMode && invoiceId && (
                        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                            <Button 
                                type="button"
                                variant="outline" 
                                size="sm" 
                                className="w-full sm:w-auto gap-2"
                                onClick={handleGeneratePDF}
                                disabled={!workspace || !client || isGeneratingPDF}
                            >
                                <FileDown className={`h-4 w-4 ${isGeneratingPDF ? "animate-spin" : ""}`} />
                                {isGeneratingPDF ? previewT('pdf.generating') : previewT('pdf.generate')}
                            </Button>
                        </div>
                    )}
                    {/* Indicateur de complétude */}
                    {!isEditMode && (
                        <div className={cn(
                            "flex items-center gap-2 rounded-lg border p-3 transition-colors",
                            completenessInfo.isComplete
                                ? "border-green-200 bg-green-50"
                                : completenessInfo.percentage >= 60
                                ? "border-amber-200 bg-amber-50"
                                : "border-red-200 bg-red-50"
                        )}>
                            {completenessInfo.isComplete ? (
                                <>
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-green-900">
                                            {t('validation.readyToSend') || "Prêt à envoyer"}
                                        </p>
                                        <p className="text-xs text-green-700">
                                            {t('validation.readyToSendDescription') || "Tous les champs requis sont remplis et la facture contient au moins un article."}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className={cn(
                                        "h-5 w-5",
                                        completenessInfo.percentage >= 60 ? "text-amber-600" : "text-red-600"
                                    )} />
                                    <div className="flex-1">
                                        <p className={cn(
                                            "text-sm font-medium",
                                            completenessInfo.percentage >= 60 ? "text-amber-900" : "text-red-900"
                                        )}>
                                            {completenessInfo.missingCount === 1
                                                ? t('validation.missingFields_one', { count: completenessInfo.missingCount })
                                                : t('validation.missingFields_other', { count: completenessInfo.missingCount })}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                                                <div
                                                    className={cn(
                                                        "h-full transition-all duration-300",
                                                        completenessInfo.percentage >= 60 ? "bg-amber-500" : "bg-red-500"
                                                    )}
                                                    style={{ width: `${completenessInfo.percentage}%` }}
                                                />
                                            </div>
                                            <span className={cn(
                                                "text-xs font-medium",
                                                completenessInfo.percentage >= 60 ? "text-amber-700" : "text-red-700"
                                            )}>
                                                {completenessInfo.percentage}%
                                            </span>
                                        </div>
                                        {completenessInfo.missingFields.length > 0 && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {t('validation.missingFieldsHint') || "Champs requis manquants : "}
                                                {completenessInfo.missingFields.map((field, index) => {
                                                    const fieldNames: Record<string, string> = {
                                                        receiver: t('fields.receiver.label') || "Destinataire",
                                                        subject: t('fields.subject.label') || "Objet",
                                                        issueDate: t('fields.issueDate.label') || "Date d'émission",
                                                        dueDate: t('fields.dueDate.label') || "Date d'échéance",
                                                        currency: t('fields.currency.label') || "Devise",
                                                    };
                                                    return (
                                                        <span key={field}>
                                                            {index > 0 && ", "}
                                                            {fieldNames[field] || field}
                                                        </span>
                                                    );
                                                })}
                                                {!completenessInfo.hasItems && completenessInfo.missingFields.length > 0 && ", "}
                                                {!completenessInfo.hasItems && (t('sections.invoiceLines.title') || "Articles")}
                                            </p>
                                        )}
                                        {!completenessInfo.hasItems && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {t('validation.noItems') || "Au moins un article est requis."}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    {/* Sélection du style de message WhatsApp */}
                    <div className="pt-4 border-t">
                        <WhatsAppMessageStyleSelector
                            value={whatsappMessageStyle}
                            onChange={setWhatsappMessageStyle}
                        />
                    </div>
                    <div className="flex items-center justify-end gap-3">
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full sm:w-auto"
                            onClick={() => handleSaveDraft(false)}
                            disabled={isSaving || isLoadingInvoice}
                        >
                            {isSaving ? (isCreatingRecurring ? t('advanced.recurring.creating') : isEditMode ? t('buttons.updating') : t('buttons.saving')) : (isRecurring && !isEditMode ? t('advanced.recurring.submitButton') : isEditMode ? t('buttons.updateDraft') : t('buttons.saveDraft'))}
                        </Button>
                        <Button 
                            type="submit" 
                            className="w-full sm:w-auto" 
                            disabled={isSaving || (!isEditMode && !isRecurring && !completenessInfo.isComplete) || (!isEditMode && isRecurring && (completenessInfo.missingCount > 0 || !completenessInfo.hasItems))}
                            title={!isEditMode && !isRecurring && !completenessInfo.isComplete ? (t('validation.notReadyToSend') || "Complétez tous les champs requis") : undefined}
                        >
                            {isSaving && isCreatingRecurring ? t('advanced.recurring.creating') : isRecurring && !isEditMode ? t('advanced.recurring.submitButton') : (isSaving && isSendingInvoice ? t('buttons.sending') : t('buttons.send'))}
                        </Button>
                    </div>
                </div>
            </form>
            <ClientModal
                open={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                onSuccess={handleClientCreated}
            />
            <CommandPalette
                open={commandPaletteOpen}
                onOpenChange={setCommandPaletteOpen}
                onSaveDraft={() => handleSaveDraft(false)}
                onSendInvoice={() => form.handleSubmit(onSubmit)()}
                onAddItem={openCreate}
                onFocusClient={handleFocusClient}
                canSaveDraft={!!storedClientId || !!clientIdFromUrl}
                canSendInvoice={!!storedClientId || !!clientIdFromUrl}
            />
        </Form>
    )
}

export default InvoiceDetails
