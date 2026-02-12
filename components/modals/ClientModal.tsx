"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PhoneInput, PHONE_COUNTRY_CODES, detectCountryCode } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useCreateClientMutation, useUpdateClientMutation, useGetClientByIdQuery } from "@/services/facturlyApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
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
    phone: z.string().optional().refine(
      (val) => {
        if (!val || !val.trim()) return true; // Vide est valide si optionnel
        // Utiliser isValidPhoneNumber de react-phone-number-input
        return isValidPhoneNumber(val);
      },
      {
        message: tValidation('invalidPhone') || "Format de numéro de téléphone invalide",
      }
    ),
    phoneCountryCode: z.string().optional(),
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
      phoneCountryCode: PHONE_COUNTRY_CODES[0].code,
      addressLine1: "",
      postalCode: "",
      city: "",
    },
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>(PHONE_COUNTRY_CODES[0].code);

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (isEditMode && existingClient && open) {
      const detectedCode = existingClient.phone 
        ? (detectCountryCode(existingClient.phone) || PHONE_COUNTRY_CODES[0].code)
        : PHONE_COUNTRY_CODES[0].code;
      
      form.reset({
        name: existingClient.name || "",
        email: existingClient.email || "",
        phone: existingClient.phone || "",
        phoneCountryCode: detectedCode,
        addressLine1: existingClient.addressLine1 || "",
        postalCode: existingClient.postalCode || "",
        city: existingClient.city || "",
      });
      setPhoneCountryCode(detectedCode);
      
      const hasAddress =
        existingClient.addressLine1?.trim() ||
        existingClient.postalCode?.trim() ||
        existingClient.city?.trim();
      setShowAdvanced(Boolean(hasAddress));
    } else if (!isEditMode && open) {
      form.reset({
        name: "",
        email: "",
        phone: "",
        phoneCountryCode: PHONE_COUNTRY_CODES[0].code,
        addressLine1: "",
        postalCode: "",
        city: "",
      });
      setPhoneCountryCode(PHONE_COUNTRY_CODES[0].code);
      setShowAdvanced(false);
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

  const fieldDisabled = isLoading || isLoadingClient;

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}
      modalMaxWidth="sm:max-w-[440px]"
    >
      <DialogHeader className="pb-2">
        <DialogTitle className="text-base font-semibold">
          {isEditMode ? t("editTitle") : t("addTitle")}
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          {isEditMode ? t("editDescription") : t("description")}
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
            e.preventDefault();
            form.handleSubmit(onSubmit)();
          }
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="client-name" className="text-xs font-medium">
            {t("fields.fullName")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="client-name"
            placeholder={t("fields.fullNamePlaceholder")}
            {...form.register("name")}
            disabled={fieldDisabled}
            className={cn(form.formState.errors.name && "border-destructive")}
            autoFocus
          />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="client-email" className="text-xs font-medium">
            {t("fields.email")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="client-email"
            type="email"
            placeholder={t("fields.emailPlaceholder")}
            {...form.register("email")}
            disabled={fieldDisabled}
            className={cn(form.formState.errors.email && "border-destructive")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="client-phone" className="text-xs font-medium">
            {t("fields.phone")} <span className="text-xs text-muted-foreground">(optionnel)</span>
          </Label>
          <PhoneInput
            value={form.watch("phone") || ""}
            onChange={(value) => {
              form.setValue("phone", value, { shouldValidate: true });
              // Détecter et mettre à jour le country code
              const detected = detectCountryCode(value);
              if (detected) {
                setPhoneCountryCode(detected);
                form.setValue("phoneCountryCode", detected);
              }
            }}
            onBlur={() => form.trigger("phone")}
            countryCode={phoneCountryCode}
            onCountryCodeChange={(code) => {
              setPhoneCountryCode(code);
              form.setValue("phoneCountryCode", code);
              // Re-valider le téléphone avec le nouveau code
              const phone = form.getValues("phone");
              if (phone) {
                form.trigger("phone");
              }
            }}
            placeholder={t("fields.phonePlaceholder")}
            disabled={fieldDisabled}
            error={form.formState.errors.phone?.message}
            required={false}
          />
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <label htmlFor="advanced-options" className="text-xs font-medium text-foreground cursor-pointer">
              {t("advancedOptions")}
            </label>
            <Switch
              id="advanced-options"
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
              disabled={fieldDisabled}
            />
          </div>
          {showAdvanced && (
            <div className="pt-3 space-y-3">
              <p className="text-xs text-muted-foreground">
                {t("addressSection")}
              </p>
              <Input
                placeholder={t("fields.addressLine1Placeholder") || "Adresse"}
                {...form.register("addressLine1")}
                disabled={fieldDisabled}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder={t("fields.postalCodePlaceholder") || "Code postal"}
                  {...form.register("postalCode")}
                  disabled={fieldDisabled}
                />
                <Input
                  placeholder={t("fields.cityPlaceholder") || "Ville"}
                  {...form.register("city")}
                  disabled={fieldDisabled}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={fieldDisabled}
          >
            {t("buttons.cancel")}
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={fieldDisabled || !form.formState.isValid}
          >
            {isLoading || isLoadingClient ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                {isEditMode ? t("buttons.updating") : t("buttons.saving")}
              </>
            ) : (
              isEditMode ? t("buttons.update") : t("buttons.save")
            )}
          </Button>
        </DialogFooter>
      </form>
    </ResponsiveModal>
  );
};

export default ClientModal;
