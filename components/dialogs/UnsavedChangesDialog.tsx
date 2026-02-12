"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Save, ArrowLeft } from "lucide-react";

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => Promise<void> | void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onSave,
  onCancel,
  isSaving = false,
}: UnsavedChangesDialogProps) {
  const handleSave = async () => {
    try {
      await onSave();
      // Le dialog sera fermé dans onSave après la navigation
    } catch (error) {
      // En cas d'erreur, ne pas fermer le dialog pour permettre de réessayer
      console.error('Error in handleSave:', error);
    }
  };

  const handleCancel = () => {
    onCancel();
    // Le dialog sera fermé dans onCancel
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg sm:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Modifications non enregistrées</AlertDialogTitle>
          <AlertDialogDescription>
            Vous avez des modifications non enregistrées. Que souhaitez-vous faire ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-3 sm:gap-3 sm:justify-start pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="w-full sm:w-auto order-2 sm:order-1 min-w-[120px]"
          >
            {!isSaving && <ArrowLeft className="mr-2 h-4 w-4" />}
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 order-1 sm:order-2 min-w-[180px]"
          >
            {isSaving ? (
              <>
                <Loader className="mr-2 h-4 w-4" size="sm" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer le brouillon
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

