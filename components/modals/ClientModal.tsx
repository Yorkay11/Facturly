"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateClientMutation, useUpdateClientMutation, useGetClientByIdQuery } from "@/services/facturlyApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  clientId?: string;
  onSuccess?: (client: { id: string; name: string }) => void;
}

export const ClientModal = ({ open, onClose, clientId, onSuccess }: ClientModalProps) => {
  const t = useTranslations('clients.modal');
  const tValidation = useTranslations('clients.modal.validation');
  const tClients = useTranslations('clients');
  const commonT = useTranslations('common');
  
  const isEditMode = !!clientId;
  
  const { data: existingClient, isLoading: isLoadingClient } = useGetClientByIdQuery(clientId!, {
    skip: !isEditMode || !clientId,
  });
  
  const [createClient, { isLoading: isCreating }] = useCreateClientMutation();
  const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();
  
  const isLoading = isCreating || isUpdating;

  // Schéma simplifié - seulement les infos essentielles
  const clientSchema = z.object({
    name: z.string().min(2, tValidation('nameMinLength')),
    email: z.string().min(1, tValidation('emailRequired')).email(tValidation('invalidEmail')),
    phone: z.string().optional(),
    addressLine1: z.string().optional(),
    postalCode: z.string().optional(),
    city: z.string().optional(),
  });

  type ClientFormValues = z.infer<typeof clientSchema>;

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    mode: 'onChange',
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      addressLine1: "",
      postalCode: "",
      city: "",
    },
  });

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (isEditMode && existingClient && open) {
      form.reset({
        name: existingClient.name || "",
        email: existingClient.email || "",
        phone: existingClient.phone || "",
        addressLine1: existingClient.addressLine1 || "",
        postalCode: existingClient.postalCode || "",
        city: existingClient.city || "",
      });
    } else if (!isEditMode && open) {
      form.reset({
        name: "",
        email: "",
        phone: "",
        addressLine1: "",
        postalCode: "",
        city: "",
      });
    }
  }, [existingClient, isEditMode, open, form]);

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      onClose();
    }
  };

  const onSubmit = async (values: ClientFormValues) => {
    try {
      let updatedClient;
      
      // Préparer le payload : ne pas envoyer les champs vides ou undefined
      const preparePayload = () => {
        const payload: {
          name: string;
          email: string;
          phone?: string;
          addressLine1?: string;
          postalCode?: string;
          city?: string;
        } = {
          name: values.name,
          email: values.email,
        };
        
        // Ajouter les champs optionnels seulement s'ils ont une valeur
        if (values.phone && values.phone.trim()) {
          payload.phone = values.phone.trim();
        }
        if (values.addressLine1 && values.addressLine1.trim()) {
          payload.addressLine1 = values.addressLine1.trim();
        }
        if (values.postalCode && values.postalCode.trim()) {
          payload.postalCode = values.postalCode.trim();
        }
        if (values.city && values.city.trim()) {
          payload.city = values.city.trim();
        }
        
        return payload;
      };
      
      const payload = preparePayload();
      
      if (isEditMode && clientId) {
        updatedClient = await updateClient({
          id: clientId,
          payload,
        }).unwrap();
      } else {
        updatedClient = await createClient(payload).unwrap();
      }
      
      if (onSuccess && updatedClient) {
        form.reset();
        onSuccess({ id: updatedClient.id, name: updatedClient.name });
      } else {
        toast.success(
          isEditMode ? tClients('updateSuccess') : tClients('createSuccess'),
          {
            description: isEditMode 
              ? tClients('updateSuccessDescription')
              : tClients('createSuccessDescription'),
          }
        );
        form.reset();
        onClose();
      }
    } catch (err: any) {
      const errorData = err?.data || err;
      const errorMessage = errorData?.message || tValidation('createErrorGeneric');
      
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('editTitle') : t('addTitle')}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t('editDescription') : t('description')}
          </DialogDescription>
        </DialogHeader>

        <form 
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
              e.preventDefault();
              form.handleSubmit(onSubmit)();
            }
          }}
        >
          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="client-name" className="text-sm font-medium">
              {t('fields.fullName')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="client-name"
              placeholder={t('fields.fullNamePlaceholder')}
              {...form.register("name")}
              disabled={isLoading || isLoadingClient}
              className={cn(
                form.formState.errors.name && "border-destructive"
              )}
              autoFocus
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="client-email" className="text-sm font-medium">
              {t('fields.email')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="client-email"
              type="email"
              placeholder={t('fields.emailPlaceholder')}
              {...form.register("email")}
              disabled={isLoading || isLoadingClient}
              className={cn(
                form.formState.errors.email && "border-destructive"
              )}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Téléphone */}
          <div className="space-y-2">
            <Label htmlFor="client-phone" className="text-sm font-medium">
              {t('fields.phone')}
            </Label>
            <Input
              id="client-phone"
              type="tel"
              placeholder={t('fields.phonePlaceholder')}
              {...form.register("phone")}
              disabled={isLoading || isLoadingClient}
            />
          </div>

          {/* Adresse - version simplifiée */}
          <div className="space-y-3 pt-2 border-t">
            <p className="text-xs text-muted-foreground font-medium">
              {t('addressSection') || "Adresse (optionnel)"}
            </p>
            <div className="space-y-2">
              <Input
                placeholder={t('fields.addressLine1Placeholder') || "Adresse"}
                {...form.register("addressLine1")}
                disabled={isLoading || isLoadingClient}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder={t('fields.postalCodePlaceholder') || "Code postal"}
                {...form.register("postalCode")}
                disabled={isLoading || isLoadingClient}
              />
              <Input
                placeholder={t('fields.cityPlaceholder') || "Ville"}
                {...form.register("city")}
                disabled={isLoading || isLoadingClient}
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading || isLoadingClient}
            >
              {t('buttons.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isLoadingClient || !form.formState.isValid}
            >
              {isLoading || isLoadingClient ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? t('buttons.updating') : t('buttons.saving')}
                </>
              ) : (
                isEditMode ? t('buttons.update') : t('buttons.save')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientModal;
