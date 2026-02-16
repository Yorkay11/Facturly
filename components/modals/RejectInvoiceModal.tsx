"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, XCircle, AlertCircle } from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRejectPublicInvoiceMutation } from "@/services/facturlyApi";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';

interface RejectInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

export const RejectInvoiceModal = ({
  open,
  onClose,
  onSuccess,
  token,
}: RejectInvoiceModalProps) => {
  const t = useTranslations('invoices.rejectModal');
  const commonT = useTranslations('common');
  
  // Créer le schéma de validation avec les traductions
  const rejectSchema = useMemo(() => z.object({
    comment: z
      .string()
      .min(10, t('validation.commentMin'))
      .max(1000, t('validation.commentMax')),
    reason: z
      .enum(["none", "amount_discrepancy", "wrong_items", "wrong_client", "other"])
      .optional(),
  }), [t]);

  type RejectFormValues = z.infer<typeof rejectSchema>;

  // Options de raisons de refus traduites
  const rejectionReasonOptions = useMemo(() => [
    {
      value: "amount_discrepancy",
      label: t('reasons.amount_discrepancy.label'),
      description: t('reasons.amount_discrepancy.description'),
    },
    {
      value: "wrong_items",
      label: t('reasons.wrong_items.label'),
      description: t('reasons.wrong_items.description'),
    },
    {
      value: "wrong_client",
      label: t('reasons.wrong_client.label'),
      description: t('reasons.wrong_client.description'),
    },
    {
      value: "other",
      label: t('reasons.other.label'),
      description: t('reasons.other.description'),
    },
  ], [t]);

  const [rejectInvoice, { isLoading, isSuccess, isError, error }] =
    useRejectPublicInvoiceMutation();

  const form = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: {
      comment: "",
      reason: undefined,
    },
  });

  useEffect(() => {
    if (isSuccess) {
      form.reset();
      onSuccess();
    }
  }, [isSuccess, form, onSuccess]);

  const onSubmit = async (values: RejectFormValues) => {
    if (!token) {
      toast.error(commonT('error'), {
        description: t('errors.invalidToken'),
      });
      return;
    }

    try {
      await rejectInvoice({
        token,
        payload: {
          comment: values.comment.trim(),
          // Convertir "none" en undefined pour ne pas envoyer cette valeur au backend
          reason: values.reason === "none" ? undefined : values.reason,
        },
      }).unwrap();
    } catch (err: any) {
      const baseMessage = t('errors.rejectError');
      const errorMessage =
        err && typeof err === 'object' && 'data' in err
          ? (err.data as { message?: string })?.message ?? baseMessage
          : baseMessage;

      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      onClose();
    }
  };

  const commentLength = form.watch("comment")?.length || 0;

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}
      modalMaxWidth="sm:max-w-[600px]"
      contentClassName="rounded-2xl border border-border/40 bg-background shadow-2xl shadow-black/5 p-0 overflow-hidden"
      closeButtonClassName="right-4 top-4 h-8 w-8 rounded-full bg-muted/60 hover:bg-muted text-foreground/70"
    >
      <div className="px-5 pt-5 pb-4 border-b border-border/40">
        <DialogHeader className="p-0 text-left space-y-1">
          <DialogTitle className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight text-foreground">
            <XCircle className="h-5 w-5 text-destructive" />
            {t('title')}
          </DialogTitle>
          <DialogDescription className="text-[15px] text-muted-foreground">
            {t('description')}
          </DialogDescription>
        </DialogHeader>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="px-5 py-4 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="reason" className="text-[13px] font-medium text-foreground">
            {t('fields.reason.label')} <span className="text-muted-foreground">{t('fields.reason.optional')}</span>
          </Label>
          <Controller
            name="reason"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                <SelectTrigger id="reason" className="h-11 rounded-xl border-0 bg-muted/30 text-[15px]">
                  <SelectValue placeholder={t('fields.reason.placeholder')} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-border/40">
                  <SelectItem value="none" className="text-[15px]">{t('fields.reason.none')}</SelectItem>
                  {rejectionReasonOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-[15px]">
                      <div className="flex flex-col">
                        <span className="font-semibold">{option.label}</span>
                        <span className="text-[13px] text-muted-foreground">
                          {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.reason && (
            <p className="text-[13px] text-destructive mt-1">{form.formState.errors.reason.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="comment" className="text-[13px] font-medium text-foreground">
            {t('fields.comment.label')} <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="comment"
            placeholder={t('fields.comment.placeholder')}
            {...form.register("comment")}
            disabled={isLoading}
            rows={6}
            className={`h-auto rounded-xl border-0 bg-muted/30 text-[15px] resize-none ${
              form.formState.errors.comment ? "ring-2 ring-destructive/50" : ""
            }`}
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            {form.formState.errors.comment && (
              <p className="text-[13px] text-destructive">
                {form.formState.errors.comment.message}
              </p>
            )}
            <p
              className={`text-[13px] ml-auto ${
                commentLength < 10 ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {t('fields.comment.counter', { count: commentLength })}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <p className="text-[15px] font-semibold text-foreground">{t('alert.title')}</p>
              <p className="text-[13px] text-muted-foreground">
                {t('alert.description')}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="px-0 pt-4 border-t border-border/40 mt-4 flex-row justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose} 
            disabled={isLoading}
            className="h-9 rounded-xl px-4 text-[15px] font-medium border-border/60"
          >
            {t('buttons.cancel')}
          </Button>
          <Button
            type="submit"
            variant="destructive"
            disabled={isLoading || !form.formState.isValid}
            className="h-9 rounded-xl px-4 text-[15px] font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('buttons.processing')}
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                {t('buttons.confirm')}
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </ResponsiveModal>
  );
};

export default RejectInvoiceModal;

