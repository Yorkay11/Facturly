"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useCreateClientMutation, useUpdateClientMutation, useGetClientByIdQuery } from "@/services/facturlyApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from 'next-intl';

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  clientId?: string; // ID du client à modifier (si fourni, mode édition)
  onSuccess?: (client: { id: string; name: string }) => void;
}

export const ClientModal = ({ open, onClose, clientId, onSuccess }: ClientModalProps) => {
  const t = useTranslations('clients.modal');
  const tValidation = useTranslations('clients.modal.validation');
  const tClients = useTranslations('clients');
  const commonT = useTranslations('common');
  
  const isEditMode = !!clientId;
  
  // Charger les données du client en mode édition
  const { data: existingClient, isLoading: isLoadingClient } = useGetClientByIdQuery(clientId!, {
    skip: !isEditMode || !clientId,
  });
  
  const [createClient, { isLoading: isCreating, isSuccess: isCreateSuccess, isError: isCreateError, error: createError }] = useCreateClientMutation();
  const [updateClient, { isLoading: isUpdating, isSuccess: isUpdateSuccess, isError: isUpdateError, error: updateError }] = useUpdateClientMutation();
  
  const isLoading = isCreating || isUpdating;
  const isSuccess = isCreateSuccess || isUpdateSuccess;
  const isError = isCreateError || isUpdateError;
  const error = createError || updateError;
  
  const [activeTab, setActiveTab] = useState("informations");

  const clientSchema = z.object({
    name: z.string().min(2, tValidation('nameMinLength')),
    email: z.string().min(1, tValidation('emailRequired')).email(tValidation('invalidEmail')),
    phone: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    postalCode: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    taxId: z.string().optional(),
    notes: z.string().optional(),
  });

  type ClientFormValues = z.infer<typeof clientSchema>;

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      postalCode: "",
      city: "",
      country: "",
      taxId: "",
      notes: "",
    },
  });

  // Pré-remplir le formulaire avec les données du client en mode édition
  useEffect(() => {
    if (isEditMode && existingClient && open) {
      form.reset({
        name: existingClient.name || "",
        email: existingClient.email || "",
        phone: existingClient.phone || "",
        addressLine1: existingClient.addressLine1 || "",
        addressLine2: existingClient.addressLine2 || "",
        postalCode: existingClient.postalCode || "",
        city: existingClient.city || "",
        country: existingClient.country || "",
        taxId: existingClient.taxId || "",
        notes: existingClient.notes || "",
      });
    } else if (!isEditMode && open) {
      // Réinitialiser le formulaire en mode création
      form.reset({
        name: "",
        email: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        postalCode: "",
        city: "",
        country: "",
        taxId: "",
        notes: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingClient, isEditMode, open]);

  // Note: La gestion du succès est maintenant dans onSubmit
  // Ce useEffect est gardé uniquement pour les cas où onSuccess n'est pas fourni
  // (compatibilité avec l'ancien comportement)
  useEffect(() => {
    if (isSuccess && !onSuccess) {
      if (isEditMode) {
        toast.success(tClients('updateSuccess'), {
          description: tClients('updateSuccessDescription'),
        });
      } else {
        toast.success(tClients('createSuccess'), {
          description: tClients('createSuccessDescription'),
        });
      }
      form.reset();
      setActiveTab("informations");
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, isEditMode, tClients, onSuccess, onClose]);

  useEffect(() => {
    if (isError && error) {
      let errorMessage = tValidation('createErrorGeneric');
      
      if (error && "data" in error) {
        const errorData = error.data as { message?: string; code?: string; field?: string; errors?: Array<{ field: string; message: string }> };
        const backendMessage = errorData?.message || '';
        
        // Si le backend retourne des erreurs de validation détaillées
        if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          const firstError = errorData.errors[0];
          const fieldName = firstError.field || '';
          const fieldMessage = firstError.message || '';
          
          // Traduire le nom du champ si possible
          let translatedField = fieldName;
          if (fieldName.toLowerCase() === 'email' || fieldName.toLowerCase() === 'e-mail') {
            translatedField = t('fields.email');
          } else if (fieldName.toLowerCase() === 'name' || fieldName.toLowerCase() === 'nom') {
            translatedField = t('fields.fullName');
          }
          
          errorMessage = fieldMessage || tValidation('missingField', { field: translatedField });
        } else if (backendMessage) {
          // Parser les messages d'erreur du backend pour être plus explicite
          const lowerMessage = backendMessage.toLowerCase();
          
          if (lowerMessage.includes('email') || lowerMessage.includes('e-mail') || lowerMessage.includes('courriel')) {
            errorMessage = tValidation('emailRequired');
          } else if (lowerMessage.includes('name') || lowerMessage.includes('nom') || lowerMessage.includes('name is required')) {
            errorMessage = tValidation('nameRequired');
          } else if (lowerMessage.includes('required') || lowerMessage.includes('manquant') || lowerMessage.includes('obligatoire') || lowerMessage.includes('missing')) {
            // Essayer d'extraire le nom du champ du message
            // Si le message contient "information manquante" ou similaire, afficher le message tel quel
            errorMessage = backendMessage;
          } else {
            errorMessage = backendMessage;
          }
        } else {
          errorMessage = tValidation('createError');
        }
      }
      
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  }, [error, isError, tValidation, commonT, t]);

  const onSubmit = async (values: ClientFormValues) => {
    // S'assurer qu'on est sur la dernière étape avant de soumettre
    if (!isLastTab) {
      handleNext();
      return;
    }

    try {
      let updatedClient;
      
      if (isEditMode && clientId) {
        // Mode édition
        updatedClient = await updateClient({
          id: clientId,
          payload: {
            name: values.name,
            email: values.email,
            phone: values.phone || undefined,
            addressLine1: values.addressLine1 || undefined,
            addressLine2: values.addressLine2 || undefined,
            postalCode: values.postalCode || undefined,
            city: values.city || undefined,
            country: values.country || undefined,
            taxId: values.taxId || undefined,
            notes: values.notes || undefined,
          },
        }).unwrap();
      } else {
        // Mode création
        updatedClient = await createClient({
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
          addressLine1: values.addressLine1 || undefined,
          addressLine2: values.addressLine2 || undefined,
          postalCode: values.postalCode || undefined,
          city: values.city || undefined,
          country: values.country || undefined,
          taxId: values.taxId || undefined,
          notes: values.notes || undefined,
        }).unwrap();
      }
      
      // Appeler le callback onSuccess si fourni (il gérera le toast et la fermeture)
      if (onSuccess && updatedClient) {
        form.reset();
        setActiveTab("informations");
        onSuccess({ id: updatedClient.id, name: updatedClient.name });
      } else if (!onSuccess) {
        // Sinon, afficher le toast et fermer le modal (comportement par défaut)
        if (isEditMode) {
          toast.success(tClients('updateSuccess'), {
            description: tClients('updateSuccessDescription'),
          });
        } else {
          toast.success(tClients('createSuccess'), {
            description: tClients('createSuccessDescription'),
          });
        }
        form.reset();
        setActiveTab("informations");
        onClose();
      }
    } catch (err: any) {
      // Parser l'erreur pour afficher un message plus explicite
      const errorData = err?.data || err;
      const errorMessage = errorData?.message || '';
      
      // Si le message est générique, essayer de le rendre plus explicite
      if (errorMessage && (
        errorMessage.toLowerCase().includes('information manquante') ||
        errorMessage.toLowerCase().includes('missing information') ||
        errorMessage.toLowerCase().includes('required') ||
        errorMessage.toLowerCase().includes('manquant')
      )) {
        // Vérifier quels champs sont remplis pour déterminer ce qui manque
        const filledFields = Object.entries(values).filter(([key, value]) => {
          if (key === 'email' || key === 'phone' || key === 'addressLine1' || key === 'addressLine2' || 
              key === 'postalCode' || key === 'city' || key === 'country' || key === 'taxId' || key === 'notes') {
            return false; // Ces champs sont optionnels
          }
          return value && String(value).trim().length > 0;
        });
        
        // Si seul le nom est rempli, suggérer que l'email pourrait être requis par le backend
        if (filledFields.length === 1 && filledFields[0][0] === 'name' && !values.email) {
          toast.error(commonT('error'), {
            description: tValidation('emailRequired'),
          });
        } else {
          // Sinon, afficher le message d'erreur tel quel
          toast.error(commonT('error'), {
            description: errorMessage || tValidation('createErrorGeneric'),
          });
        }
      } else {
        // L'erreur sera aussi gérée par le useEffect existant
        // Mais on affiche ici pour être sûr que l'utilisateur voit l'erreur
        if (errorMessage) {
          toast.error(commonT('error'), {
            description: errorMessage,
          });
        }
      }
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      setActiveTab("informations");
      onClose();
    }
  };

  // Réinitialiser l'onglet actif quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setActiveTab("informations");
    }
  }, [open]);

  const tabs = [
    { id: "informations", label: t('tabs.informations') },
    { id: "adresse", label: t('tabs.adresse') },
    { id: "complementaires", label: t('tabs.complementaires') },
  ];

  const handleNext = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const currentTabIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === tabs.length - 1;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('editTitle') : t('addTitle')}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t('editDescription') : t('description')}
          </DialogDescription>
        </DialogHeader>

        {/* Indicateur de progression avec dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {tabs.map((tab, index) => (
            <div key={tab.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === currentTabIndex
                    ? "bg-primary w-8"
                    : index < currentTabIndex
                    ? "bg-primary/60"
                    : "bg-muted"
                )}
              />
            </div>
          ))}
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (isLastTab) {
              form.handleSubmit(onSubmit)(e);
            }
          }} 
          className="space-y-4"
          onKeyDown={(e) => {
            // Empêcher la soumission avec Entrée si on n'est pas sur la dernière étape
            if (e.key === "Enter" && !isLastTab) {
              e.preventDefault();
              handleNext();
            }
          }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} />
              ))}
            </TabsList>

            {/* Section 1: Informations de base */}
            <TabsContent value="informations" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-name">
                    {t('fields.fullName')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="client-name"
                    placeholder={t('fields.fullNamePlaceholder')}
                    {...form.register("name")}
                    disabled={isLoading || isLoadingClient}
                    className={form.formState.errors.name ? "border-destructive" : ""}
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="client-email">
                      {t('fields.email')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="client-email"
                      type="email"
                      placeholder={t('fields.emailPlaceholder')}
                      {...form.register("email")}
                      disabled={isLoading || isLoadingClient}
                      className={form.formState.errors.email ? "border-destructive" : ""}
                    />
                    {form.formState.errors.email && (
                      <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-phone">{t('fields.phone')}</Label>
                    <Input
                      id="client-phone"
                      placeholder={t('fields.phonePlaceholder')}
                      {...form.register("phone")}
                      disabled={isLoading || isLoadingClient}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Section 2: Adresse */}
            <TabsContent value="adresse" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-addressLine1">{t('fields.addressLine1')}</Label>
                  <Input
                    id="client-addressLine1"
                    placeholder={t('fields.addressLine1Placeholder')}
                    {...form.register("addressLine1")}
                    disabled={isLoading || isLoadingClient}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-addressLine2">{t('fields.addressLine2')}</Label>
                  <Input
                    id="client-addressLine2"
                    placeholder={t('fields.addressLine2Placeholder')}
                    {...form.register("addressLine2")}
                    disabled={isLoading || isLoadingClient}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="client-postalCode">{t('fields.postalCode')}</Label>
                    <Input
                      id="client-postalCode"
                      placeholder={t('fields.postalCodePlaceholder')}
                      {...form.register("postalCode")}
                      disabled={isLoading || isLoadingClient}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-city">{t('fields.city')}</Label>
                    <Input
                      id="client-city"
                      placeholder={t('fields.cityPlaceholder')}
                      {...form.register("city")}
                      disabled={isLoading || isLoadingClient}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-country">{t('fields.country')}</Label>
                    <Input
                      id="client-country"
                      placeholder={t('fields.countryPlaceholder')}
                      {...form.register("country")}
                      disabled={isLoading || isLoadingClient}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Section 3: Informations complémentaires */}
            <TabsContent value="complementaires" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-taxId">{t('fields.taxId')}</Label>
                  <Input
                    id="client-taxId"
                    placeholder={t('fields.taxIdPlaceholder')}
                    {...form.register("taxId")}
                    disabled={isLoading || isLoadingClient}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-notes">{t('fields.notes')}</Label>
                  <Input
                    id="client-notes"
                    placeholder={t('fields.notesPlaceholder')}
                    {...form.register("notes")}
                    disabled={isLoading || isLoadingClient}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <DialogFooter className="flex items-center justify-between">
            <div className="flex gap-2">
              {!isFirstTab && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isLoading || isLoadingClient}
                  className="gap-2"
                >
                  <IoChevronBackOutline className="h-4 w-4" />
                  {t('buttons.previous')}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading || isLoadingClient}
              >
                {t('buttons.cancel')}
              </Button>
              {!isLastTab ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading || isLoadingClient}
                  className="gap-2"
                >
                  {t('buttons.next')}
                  <IoChevronForwardOutline className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading || isLoadingClient}>
                  {(isLoading || isLoadingClient) ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {isEditMode ? t('buttons.updating') : t('buttons.saving')}
                    </div>
                  ) : (
                    isEditMode ? t('buttons.update') : t('buttons.save')
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientModal;
