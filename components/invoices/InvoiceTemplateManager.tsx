"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  useGetInvoiceTemplatesQuery,
  useCreateInvoiceTemplateMutation,
  useUpdateInvoiceTemplateMutation,
  useDeleteInvoiceTemplateMutation,
  useDuplicateInvoiceTemplateMutation,
  type InvoiceTemplate,
  type CreateInvoiceTemplateDto,
} from "@/services/facturlyApi";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Copy, Palette, Image, Layout } from "lucide-react";
import { InvoiceTemplateForm } from "./InvoiceTemplateForm";

export function InvoiceTemplateManager() {
  const t = useTranslations("invoices.templates");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(
    null,
  );

  const { data: templatesResponse, isLoading } = useGetInvoiceTemplatesQuery();
  const templates = templatesResponse?.data || [];

  const [createTemplate] = useCreateInvoiceTemplateMutation();
  const [updateTemplate] = useUpdateInvoiceTemplateMutation();
  const [deleteTemplate] = useDeleteInvoiceTemplateMutation();
  const [duplicateTemplate] = useDuplicateInvoiceTemplateMutation();

  const handleCreate = async (data: CreateInvoiceTemplateDto) => {
    try {
      await createTemplate(data).unwrap();
      toast.success(t("created") || "Template créé avec succès");
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast.error(
        error?.data?.message || t("createError") || "Erreur lors de la création",
      );
    }
  };

  const handleUpdate = async (
    id: string,
    data: Partial<CreateInvoiceTemplateDto>,
  ) => {
    try {
      await updateTemplate({ id, data }).unwrap();
      toast.success(t("updated") || "Template mis à jour avec succès");
      setEditingTemplate(null);
    } catch (error: any) {
      toast.error(
        error?.data?.message || t("updateError") || "Erreur lors de la mise à jour",
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        t("deleteConfirm") ||
          "Êtes-vous sûr de vouloir supprimer ce template ?",
      )
    ) {
      return;
    }

    try {
      await deleteTemplate(id).unwrap();
      toast.success(t("deleted") || "Template supprimé avec succès");
    } catch (error: any) {
      toast.error(
        error?.data?.message || t("deleteError") || "Erreur lors de la suppression",
      );
    }
  };

  const handleDuplicate = async (id: string) => {
    const template = templates.find((t: InvoiceTemplate) => t.id === id);
    if (!template) return;

    const newName = prompt(
      t("duplicatePrompt") || "Nom du nouveau template :",
      `${template.name} (Copie)`,
    );

    if (!newName) return;

    try {
      await duplicateTemplate({ id, name: newName }).unwrap();
      toast.success(t("duplicated") || "Template dupliqué avec succès");
    } catch (error: any) {
      toast.error(
        error?.data?.message || t("duplicateError") || "Erreur lors de la duplication",
      );
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {t("title") || "Templates de factures"}
          </h2>
          <p className="text-muted-foreground">
            {t("description") ||
              "Personnalisez l'apparence de vos factures avec des templates"}
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("create") || "Créer un template"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("create") || "Créer un template"}</DialogTitle>
              <DialogDescription>
                {t("createDescription") ||
                  "Personnalisez votre template de facture"}
              </DialogDescription>
            </DialogHeader>
            <InvoiceTemplateForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {t("noTemplates") ||
                "Aucun template personnalisé. Créez votre premier template !"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template: InvoiceTemplate) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>
                      Basé sur: {template.baseTemplate}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    {template.isDefault && (
                      <Badge variant="default">Par défaut</Badge>
                    )}
                    {!template.isActive && (
                      <Badge variant="secondary">Inactif</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Aperçu des couleurs */}
                  <div className="flex gap-2">
                    <div
                      className="h-8 w-8 rounded border"
                      style={{ backgroundColor: template.accentColor }}
                      title="Couleur d'accent"
                    />
                    <div
                      className="h-8 w-8 rounded border"
                      style={{ backgroundColor: template.textColor }}
                      title="Couleur du texte"
                    />
                    <div
                      className="h-8 w-8 rounded border"
                      style={{ backgroundColor: template.backgroundColor }}
                      title="Couleur de fond"
                    />
                  </div>

                  {/* Options activées */}
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {template.showLogo && (
                      <div className="flex items-center gap-1">
                        <Image className="h-3 w-3" />
                        Logo
                      </div>
                    )}
                    {template.showCompanyDetails && (
                      <div className="flex items-center gap-1">
                        <Layout className="h-3 w-3" />
                        Détails
                      </div>
                    )}
                    {template.showPaymentTerms && (
                      <div className="flex items-center gap-1">
                        <Palette className="h-3 w-3" />
                        Conditions
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                      className="flex-1"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(template.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      disabled={templates.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog d'édition */}
      {editingTemplate && (
        <Dialog
          open={!!editingTemplate}
          onOpenChange={(open) => !open && setEditingTemplate(null)}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {t("edit") || "Modifier le template"}
              </DialogTitle>
              <DialogDescription>
                {t("editDescription") || "Modifiez les paramètres du template"}
              </DialogDescription>
            </DialogHeader>
            <InvoiceTemplateForm
              template={editingTemplate}
              onSubmit={(data) => handleUpdate(editingTemplate.id, data)}
              onCancel={() => setEditingTemplate(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
