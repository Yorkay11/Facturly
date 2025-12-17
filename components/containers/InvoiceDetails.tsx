"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown, Edit, Plus as PlusIcon, Trash2, FileDown, Lock, ArrowRight } from "lucide-react"
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
} from "@/components/ui/command"
import React, { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Separator } from "../ui/separator"
import { Card } from "../ui/card"
import { Checkbox } from "../ui/checkbox"
import { devises } from "@/data/datas"
import { useItemsStore } from "@/hooks/useItemStore"
import { SortableItem } from "./SortableItem"
import { useInvoiceMetadata } from "@/hooks/useInvoiceMetadata"
import { useItemModalControls } from "@/contexts/ItemModalContext"
import { useGetClientsQuery, useGetClientByIdQuery, useCreateInvoiceMutation, useUpdateInvoiceMutation, useGetInvoiceByIdQuery, useSendInvoiceMutation, useGetSubscriptionQuery, useGetCompanyQuery, type Invoice } from "@/services/facturlyApi"
import { invoiceTemplates } from "@/types/invoiceTemplate"
import ClientModal from "@/components/modals/ClientModal"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useLoading } from "@/contexts/LoadingContext"
import { Loader } from "@/components/ui/loader"
import { useTranslations, useLocale } from 'next-intl'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { getBackendTemplateName, getFrontendTemplateFromBackend } from "@/types/invoiceTemplate"

interface InvoiceDetailsProps {
    invoiceId?: string;
    onSaveDraftReady?: (saveFunction: (skipRedirect?: boolean) => Promise<void>) => void;
    onHasUnsavedChanges?: (hasChanges: boolean) => void;
}

const InvoiceDetails = ({ invoiceId, onSaveDraftReady, onHasUnsavedChanges }: InvoiceDetailsProps = {}) => {
    const t = useTranslations('invoices.form');
    const previewT = useTranslations('invoices.preview');
    const locale = useLocale();
    const searchParams = useSearchParams();
    const clientIdFromUrl = searchParams ? searchParams.get("clientId") || undefined : undefined;
    const router = useRouter();
    
    const [open, setOpen] = React.useState(false);
    const [clientOpen, setClientOpen] = React.useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = React.useState(false);
    const { items, setItems, removeItem, clearItems } = useItemsStore();
    const metadataStore = useInvoiceMetadata();
    const { setMetadata, reset: resetMetadata, currency: storedCurrency, clientId: storedClientId, receiver: storedReceiver, subject, issueDate, dueDate, notes, templateId } = metadataStore;
    const [value, setValue] = useState(storedCurrency ?? "");
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const { openCreate, openEdit } = useItemModalControls();
    const { data: clientsResponse, isLoading: isLoadingClients, refetch: refetchClients } = useGetClientsQuery({ page: 1, limit: 100 });
    const { data: clientFromUrl, isLoading: isLoadingClientFromUrl } = useGetClientByIdQuery(clientIdFromUrl || "", {
        skip: !clientIdFromUrl,
    });
    const clients = clientsResponse?.data ?? [];
    const [createInvoice, { isLoading: isCreatingInvoice }] = useCreateInvoiceMutation();
    const [updateInvoice, { isLoading: isUpdatingInvoice }] = useUpdateInvoiceMutation();
    const [sendInvoice, { isLoading: isSendingInvoice }] = useSendInvoiceMutation();
    
    // Récupérer les données de l'entreprise et de la subscription pour le PDF
    const { data: company } = useGetCompanyQuery();
    const { data: subscription } = useGetSubscriptionQuery();
    const { data: client } = useGetClientByIdQuery(metadataStore.clientId || "", {
        skip: !metadataStore.clientId,
    });
    
    // Vérifier si l'utilisateur peut générer des PDF (Pro ou Enterprise uniquement)
    const canGeneratePDF = subscription?.plan === "pro" || subscription?.plan === "enterprise";
    const isFreePlan = subscription?.plan === "free";
    
    // Charger les données de la facture si on est en mode édition
    const { data: existingInvoice, isLoading: isLoadingInvoice } = useGetInvoiceByIdQuery(
        invoiceId || "",
        { skip: !invoiceId }
    );

    const isEditMode = !!invoiceId;
    const isSaving = isCreatingInvoice || isUpdatingInvoice || isSendingInvoice;
    
    // Utiliser le contexte de loading global pour griser la page
    const { setLoading } = useLoading();
    
    // Récupérer le template depuis le store, avec fallback sur le template par défaut
    const activeTemplate = metadataStore.templateId || invoiceTemplates[0].id;

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
        if (isCreatingInvoice || isUpdatingInvoice || isSendingInvoice) {
            if (isSendingInvoice) {
                setLoading(true, t('loading.sending'));
            } else {
                setLoading(true, isEditMode ? t('loading.updating') : t('loading.creating'));
            }
        } else {
            setLoading(false);
        }
    }, [isCreatingInvoice, isUpdatingInvoice, isSendingInvoice, isEditMode, setLoading, t]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            receiver: storedReceiver || "",
            subject: subject || "",
            currency: storedCurrency || "",
            notes: notes || "",
            issueDate: issueDate,
            dueDate: dueDate,
        },
    })
    
    // Gérer la création d'un nouveau client
    const handleClientCreated = (newClient: { id: string; name: string }) => {
        // Rafraîchir la liste des clients
        refetchClients().then(() => {
            // Sélectionner automatiquement le nouveau client après le rafraîchissement
            form.setValue("receiver", newClient.name);
            setMetadata({
                receiver: newClient.name,
                clientId: newClient.id,
            });
            // Afficher un toast de confirmation
            toast.success(t('success.clientCreated'), {
                description: t('success.clientCreatedDescription', { name: newClient.name }),
            });
        });
        // Fermer le modal
        setIsClientModalOpen(false);
    };
    
    // Pré-remplir le client si clientId est dans l'URL
    useEffect(() => {
        if (clientFromUrl && !isLoadingClientFromUrl) {
            const currentReceiver = form.getValues("receiver");
            if (!currentReceiver || currentReceiver !== clientFromUrl.name) {
                form.setValue("receiver", clientFromUrl.name);
                setMetadata({
                    receiver: clientFromUrl.name,
                    clientId: clientFromUrl.id,
                });
            }
        }
    }, [clientFromUrl, isLoadingClientFromUrl, form, setMetadata]);
    
    // Si un client est déjà sélectionné dans le store, le pré-remplir
    useEffect(() => {
        if (storedClientId && !clientIdFromUrl && clients.length > 0 && !isLoadingClients) {
            const storedClient = clients.find((c) => c.id === storedClientId);
            if (storedClient) {
                const currentReceiver = form.getValues("receiver");
                if (!currentReceiver || currentReceiver !== storedClient.name) {
                    form.setValue("receiver", storedClient.name);
                    setMetadata({
                        receiver: storedClient.name,
                        clientId: storedClient.id,
                    });
                }
            }
        }
    }, [storedClientId, clients, isLoadingClients, form, setMetadata, clientIdFromUrl]);
    
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
            
            // Valider que la devise est définie
            if (!storedCurrency) {
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
                            currency: storedCurrency,
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
                    const backendTemplateName = getBackendTemplateName(activeTemplate);
                    
                    // Trouver le client pour obtenir son email
                    const selectedClient = clients.find((c) => c.id === clientId) || clientFromUrl;
                    
                    const response = await createInvoice({
                        clientId: clientId,
                        issueDate: issueDate.toISOString().split('T')[0],
                        dueDate: dueDate ? dueDate.toISOString().split('T')[0] : undefined,
                        currency: storedCurrency || undefined,
                        items: invoiceItems,
                        notes: notes || undefined,
                        recipientEmail: selectedClient?.email || undefined,
                        sendEmail: true, // Envoyer l'email automatiquement lors de la création
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
                    
                    // La facture a été créée et envoyée directement (sendEmail: true dans le payload)
                    toast.success(t('success.invoiceSent'), {
                        description: t('success.invoiceSentDescription', { 
                            number: invoiceData.invoiceNumber || newInvoiceId,
                            email: invoiceData.recipientEmail ? ` à ${invoiceData.recipientEmail}` : ""
                        }),
                    });

                    // Réinitialiser les stores
                    resetMetadata();
                    clearItems();

                    // Rediriger vers la page de détails de la facture
                    router.replace(`/invoices/${newInvoiceId}`);
                    return;
                } catch (createError: any) {
                    const errorMessage = createError?.data?.message || createError?.message || t('errors.createError');
                    toast.error(t('errors.createError'), {
                        description: errorMessage,
                    });
                    return;
                }
            }

            // Mode édition: envoyer la facture après mise à jour
            const selectedClient = clients.find((c) => c.id === clientId) || clientFromUrl;

            // Envoyer la facture
            try {
                const sentInvoice = await sendInvoice({
                    id: invoiceIdToSend,
                    payload: {
                        sendEmail: true,
                        emailTo: selectedClient?.email || undefined,
                    },
                }).unwrap();

                toast.success(t('success.invoiceSent'), {
                    description: t('success.invoiceSentDescription', { 
                        number: sentInvoice.invoiceNumber || invoiceIdToSend,
                        email: sentInvoice.recipientEmail ? ` à ${sentInvoice.recipientEmail}` : ""
                    }),
                });

                // Réinitialiser les stores
                resetMetadata();
                clearItems();

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
    
    // Fonction pour sauvegarder le brouillon (création ou mise à jour)
    const handleSaveDraft = async (skipRedirect: boolean = false) => {
        try {
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
            
            // Valider que la devise est définie
            if (!storedCurrency) {
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
                            currency: storedCurrency,
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
                    const backendTemplateName = getBackendTemplateName(activeTemplate);
                    
                    const response = await createInvoice({
                        clientId: clientId,
                        issueDate: issueDate.toISOString().split('T')[0], // Format YYYY-MM-DD
                        dueDate: dueDate ? dueDate.toISOString().split('T')[0] : undefined, // Format YYYY-MM-DD (optionnel)
                        currency: storedCurrency || undefined, // Optionnel, utilise la devise de l'entreprise par défaut
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
                    
                    // Réinitialiser les stores après la création réussie seulement si skipRedirect est false
                    // Si skipRedirect est true, on laisse le parent gérer la navigation et la réinitialisation
                    if (!skipRedirect) {
                        resetMetadata();
                        clearItems();
                        
                        // Rediriger vers la page de détails de la facture
                        // Utiliser router.replace pour éviter de pouvoir revenir en arrière vers la page de création
                        console.log("Redirecting to:", `/invoices/${newInvoiceId}`);
                        router.replace(`/invoices/${newInvoiceId}`);
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
            const backendTemplateName = getBackendTemplateName(activeTemplate);
            
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
            storedCurrency || 
            issueDate || 
            dueDate || 
            subject || 
            notes
        );

        onHasUnsavedChanges(hasChanges);
    }, [storedClientId, storedReceiver, items.length, storedCurrency, issueDate, dueDate, subject, notes, onHasUnsavedChanges, isEditMode]);

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
        if (storedCurrency && storedCurrency !== value) {
            setValue(storedCurrency)
            form.setValue("currency", storedCurrency)
        }
    }, [storedCurrency, value, form])

    const itemIds = useMemo(() => items.map((item) => item.id), [items])

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        setItems(arrayMove(items, oldIndex, newIndex))
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
                <section className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
                                                <CommandInput placeholder={t('fields.receiver.searchPlaceholder')} className="h-9" />
                                                <CommandList>
                                                    {isLoadingClients ? (
                                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                                            {t('fields.receiver.loading')}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <CommandEmpty>{t('fields.receiver.empty')}</CommandEmpty>
                                                            <CommandGroup>
                                                                {clients.length === 0 ? (
                                                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                                                        {t('fields.receiver.noClients')}
                                                                    </div>
                                                                ) : (
                                                                    clients.map((client) => (
                                                                        <CommandItem
                                                                            key={client.id}
                                                                            value={`${client.name} ${client.email || ""} ${client.phone || ""} ${client.city || ""}`}
                                                                            onSelect={() => {
                                                                                field.onChange(client.name);
                                                                                setMetadata({
                                                                                    receiver: client.name,
                                                                                    clientId: client.id,
                                                                                });
                                                                                setClientOpen(false);
                                                                            }}
                                                                            className="cursor-pointer"
                                                                        >
                                                                            <div className="flex flex-1 flex-col gap-0.5">
                                                                                <span className="font-medium">{client.name}</span>
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
                                                                    ))
                                                                )}
                                                            </CommandGroup>
                                                            <CommandGroup>
                                                                <div className="border-t border-border p-1">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="w-full justify-start gap-2 text-primary hover:bg-primary/10"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            setClientOpen(false);
                                                                            setIsClientModalOpen(true);
                                                                        }}
                                                                    >
                                                                        <PlusIcon className="h-4 w-4" />
                                                                        {t('fields.receiver.createNew')}
                                                                    </Button>
                                                                </div>
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

                <section className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-lg font-semibold text-slate-900">{t('sections.invoiceLines.title')}</p>
                            <p className="text-sm text-slate-500">{t('sections.invoiceLines.description')}</p>
                        </div>
                        <Button type="button" size="sm" className="gap-2" onClick={openCreate}>
                            <PlusIcon className="h-4 w-4" />
                            {t('lines.add')}
                        </Button>
                    </div>

                    <Separator />

                    {items.length ? (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                                <div className="flex flex-col gap-3">
                                    {items.map((item) => (
                                        <SortableItem key={item.id} id={item.id}>
                                            <Card className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 shadow-sm">
                                                <div className="flex flex-wrap items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{item.description}</p>
                                                        <p className="text-xs text-slate-500">{item.quantity} × {item.unitPrice} {form.getValues("currency") || ""}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)} aria-label={t('lines.edit', { description: item.description })}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="destructive" size="icon" onClick={() => removeItem(item.id)} aria-label={t('lines.delete', { description: item.description })}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 md:grid-cols-4">
                                                    <div>
                                                        <p className="font-medium text-slate-700">{t('lines.unitPrice')}</p>
                                                        <p>{item.unitPrice}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-700">{t('lines.quantity')}</p>
                                                        <p>{item.quantity}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-700">{t('lines.vat')}</p>
                                                        <p>{item.vatRate}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-700">{t('lines.lineTotal')}</p>
                                                        <p>{(item.unitPrice * item.quantity).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </Card>
                                        </SortableItem>
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-slate-300 p-12 text-center">
                            <p className="text-lg font-semibold text-slate-600">{t('sections.invoiceLines.empty.title')}</p>
                            <p className="text-sm text-slate-500">{t('sections.invoiceLines.empty.description')}</p>
                            <Button variant="outline" size="sm" className="gap-2" onClick={openCreate}>
                                <PlusIcon className="h-4 w-4" />
                                {t('lines.add')}
                            </Button>
                        </div>
                    )}
                </section>

                <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
                            {isFreePlan && (
                                <Alert className="mb-2 border-amber-200 bg-amber-50">
                                    <Lock className="h-4 w-4 text-amber-600" />
                                    <AlertTitle className="text-amber-800">{previewT('pdf.restricted.title')}</AlertTitle>
                                    <AlertDescription className="text-amber-700">
                                        {previewT('pdf.restricted.description')}
                                        <Link 
                                            href="/settings?tab=subscription" 
                                            className="ml-1 inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-900 underline"
                                        >
                                            {previewT('pdf.restricted.upgrade')}
                                            <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </AlertDescription>
                                </Alert>
                            )}
                            <Button 
                                type="button"
                                variant="outline" 
                                size="sm" 
                                className="w-full sm:w-auto gap-2"
                                onClick={handleGeneratePDF}
                                disabled={!company || !client || isGeneratingPDF || !canGeneratePDF}
                            >
                                <FileDown className={`h-4 w-4 ${isGeneratingPDF ? "animate-spin" : ""}`} />
                                {isGeneratingPDF ? previewT('pdf.generating') : previewT('pdf.generate')}
                            </Button>
                        </div>
                    )}
                    <div className="flex items-center justify-end gap-3">
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full sm:w-auto"
                            onClick={() => handleSaveDraft(false)}
                            disabled={isSaving || isLoadingInvoice}
                        >
                            {isSaving ? (isEditMode ? t('buttons.updating') : t('buttons.saving')) : (isEditMode ? t('buttons.updateDraft') : t('buttons.saveDraft'))}
                        </Button>
                        <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                            {isSaving && isSendingInvoice ? t('buttons.sending') : t('buttons.send')}
                        </Button>
                    </div>
                </div>
            </form>
            <ClientModal
                open={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                onSuccess={handleClientCreated}
            />
        </Form>
    )
}

export default InvoiceDetails
