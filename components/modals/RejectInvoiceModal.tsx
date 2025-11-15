"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, XCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
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

const rejectSchema = z.object({
  comment: z
    .string()
    .min(10, "Le commentaire doit contenir au moins 10 caractères")
    .max(1000, "Le commentaire ne doit pas dépasser 1000 caractères"),
  reason: z
    .enum(["none", "amount_discrepancy", "wrong_items", "wrong_client", "other"])
    .optional(),
});

type RejectFormValues = z.infer<typeof rejectSchema>;

interface RejectInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

const rejectionReasonOptions = [
  {
    value: "amount_discrepancy",
    label: "Différence de montant",
    description: "Le montant ne correspond pas à l'accord",
  },
  {
    value: "wrong_items",
    label: "Articles incorrects",
    description: "Les articles facturés ne correspondent pas",
  },
  {
    value: "wrong_client",
    label: "Mauvais client",
    description: "La facture a été émise pour le mauvais client",
  },
  {
    value: "other",
    label: "Autre raison",
    description: "Autre raison non listée",
  },
];

export const RejectInvoiceModal = ({
  open,
  onClose,
  onSuccess,
  token,
}: RejectInvoiceModalProps) => {
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

  useEffect(() => {
    if (isError && error) {
      const errorMessage =
        error && "data" in error
          ? (error.data as { message?: string })?.message ??
            "Une erreur est survenue lors du refus de la facture."
          : "Une erreur est survenue. Veuillez réessayer plus tard.";

      toast.error("Erreur", {
        description: errorMessage,
      });
    }
  }, [error, isError]);

  const onSubmit = async (values: RejectFormValues) => {
    if (!token) {
      toast.error("Erreur", {
        description: "Token invalide. Veuillez rafraîchir la page.",
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
    } catch (err) {
      // L'erreur sera gérée par le useEffect
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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Refuser la facture
          </DialogTitle>
          <DialogDescription>
            Veuillez indiquer la raison de votre refus. Un commentaire est obligatoire pour
            permettre à l&apos;émetteur de comprendre votre décision.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Raison du refus <span className="text-muted-foreground">(optionnel)</span>
            </Label>
            <Controller
              name="reason"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                  <SelectTrigger id="reason">
                    <SelectValue placeholder="Sélectionnez une raison (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune raison spécifique</SelectItem>
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
              Commentaire <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="comment"
              placeholder="Veuillez expliquer la raison de votre refus (minimum 10 caractères)..."
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
                {commentLength} / 1000 caractères (minimum 10)
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-700 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold text-yellow-700">Important</p>
                <p className="text-xs text-yellow-600">
                  Le refus de cette facture la marquera comme annulée. L&apos;émetteur pourra
                  modifier la facture et vous la renvoyer si nécessaire.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading || !form.formState.isValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Confirmer le refus
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RejectInvoiceModal;

