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

  const inputClass = "h-11 rounded-xl border-0 bg-muted/30 text-[15px] focus-visible:ring-2 focus-visible:ring-ring/20";

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}
      modalMaxWidth="sm:max-w-[420px]"
      contentClassName="rounded-2xl sm:rounded-[20px] border border-border/40 bg-background shadow-2xl shadow-black/5 p-0 overflow-hidden"
      closeButtonClassName="right-4 top-4 h-8 w-8 rounded-full bg-muted/60 hover:bg-muted text-foreground/70"
    >
      <div className="px-5 pt-5 pb-5">
        <DialogHeader className="p-0 pb-4 text-left space-y-1">
          <DialogTitle className="text-[17px] font-semibold tracking-tight text-foreground">
            {isEditMode ? t("editTitle") : t("addTitle")}
          </DialogTitle>
          <DialogDescription className="text-[15px] text-muted-foreground">
            {isEditMode ? t("editDescription") : t("description")}
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
          <div className="space-y-1.5">
            <Label htmlFor="client-name" className="text-[13px] font-medium text-foreground">
              {t("fields.fullName")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="client-name"
              placeholder={t("fields.fullNamePlaceholder")}
              {...form.register("name")}
              disabled={fieldDisabled}
              className={cn(inputClass, form.formState.errors.name && "border border-destructive focus-visible:ring-destructive/30")}
              autoFocus
            />
            {form.formState.errors.name && (
              <p className="text-[13px] text-destructive mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="client-email" className="text-[13px] font-medium text-foreground">
              {t("fields.email")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="client-email"
              type="email"
              placeholder={t("fields.emailPlaceholder")}
              {...form.register("email")}
              disabled={fieldDisabled}
              className={cn(inputClass, form.formState.errors.email && "border border-destructive focus-visible:ring-destructive/30")}
            />
            {form.formState.errors.email && (
              <p className="text-[13px] text-destructive mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="client-phone" className="text-[13px] font-medium text-foreground">
              {t("fields.phone")} <span className="text-[13px] font-normal text-muted-foreground">(optionnel)</span>
            </Label>
            <PhoneInput
              value={form.watch("phone") || ""}
              onChange={(value) => {
                form.setValue("phone", value, { shouldValidate: true });
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
                const phone = form.getValues("phone");
                if (phone) form.trigger("phone");
              }}
              placeholder={t("fields.phonePlaceholder")}
              disabled={fieldDisabled}
              error={form.formState.errors.phone?.message}
              required={false}
              className={cn(
                "[&_input]:h-11 [&_input]:rounded-xl [&_input]:border-0 [&_input]:bg-muted/30 [&_input]:text-[15px] [&_input]:focus-visible:ring-2 [&_input]:focus-visible:ring-ring/20",
                "[&_button]:h-11 [&_button]:rounded-xl [&_button]:border-0 [&_button]:bg-muted/30",
                form.formState.errors.phone && "[&_input]:border [&_input]:border-destructive"
              )}
            />
            {form.formState.errors.phone && (
              <p className="text-[13px] text-destructive mt-1">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="border-t border-border/40 pt-4">
            <div className="flex items-center justify-between">
              <label htmlFor="advanced-options" className="text-[13px] font-medium text-foreground cursor-pointer">
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
              <div className="pt-4 space-y-4 rounded-2xl bg-muted/30 dark:bg-muted/20 border border-border/40 mt-3 p-4">
                <p className="text-[13px] text-muted-foreground">
                  {t("addressSection")}
                </p>
                <Input
                  placeholder={t("fields.addressLine1Placeholder") || "Adresse"}
                  {...form.register("addressLine1")}
                  disabled={fieldDisabled}
                  className={inputClass}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder={t("fields.postalCodePlaceholder") || "Code postal"}
                    {...form.register("postalCode")}
                    disabled={fieldDisabled}
                    className={inputClass}
                  />
                  <Input
                    placeholder={t("fields.cityPlaceholder") || "Ville"}
                    {...form.register("city")}
                    disabled={fieldDisabled}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-row justify-end gap-2 pt-4 border-t border-border/40 mt-4">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-xl text-[15px] font-medium border-border/60"
              onClick={handleClose}
              disabled={fieldDisabled}
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              type="submit"
              className="h-9 rounded-xl px-4 text-[15px] font-semibold"
              disabled={fieldDisabled || !form.formState.isValid}
            >
              {isLoading || isLoadingClient ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? t("buttons.updating") : t("buttons.saving")}
                </>
              ) : (
                isEditMode ? t("buttons.update") : t("buttons.save")
              )}
            </Button>
          </DialogFooter>
        </form>
      </div>
    </ResponsiveModal>
  );
};

export default ClientModal;
