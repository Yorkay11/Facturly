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
    >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              {t('fields.reason.label')} <span className="text-muted-foreground">{t('fields.reason.optional')}</span>
            </Label>
            <Controller
              name="reason"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                  <SelectTrigger id="reason">
                    <SelectValue placeholder={t('fields.reason.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('fields.reason.none')}</SelectItem>
                    {rejectionReasonOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span className="font-semibold">{option.label}</span>
                          <span className="text-xs text-muted-foreground">
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
              <p className="text-xs text-destructive">{form.formState.errors.reason.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">
              {t('fields.comment.label')} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="comment"
              placeholder={t('fields.comment.placeholder')}
              {...form.register("comment")}
              disabled={isLoading}
              rows={6}
              className={form.formState.errors.comment ? "border-destructive" : ""}
              maxLength={1000}
            />
            <div className="flex items-center justify-between">
              {form.formState.errors.comment && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.comment.message}
                </p>
              )}
              <p
                className={`text-xs ml-auto ${
                  commentLength < 10 ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {t('fields.comment.counter', { count: commentLength })}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-700 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold text-yellow-700">{t('alert.title')}</p>
                <p className="text-xs text-yellow-600">
                  {t('alert.description')}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              {t('buttons.cancel')}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading || !form.formState.isValid}
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

