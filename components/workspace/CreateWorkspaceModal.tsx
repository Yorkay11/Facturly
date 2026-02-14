"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";

type WorkspaceType = "FREELANCE" | "INDIVIDUAL" | "COMPANY";

export function CreateWorkspaceModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("topbar");
  const tCommon = useTranslations("common");
  const tOnboard = useTranslations("onboarding");
  const { createWorkspace, createWorkspaceStatus, setCurrentWorkspaceId } =
    useWorkspace();
  const [type, setType] = useState<WorkspaceType>("INDIVIDUAL");
  const [name, setName] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("XOF");

  const isCompany = type === "COMPANY";
  const isIndividualOrFreelance = type === "INDIVIDUAL" || type === "FREELANCE";
  const canSubmit = !isCompany || name.trim().length >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      const res = await createWorkspace({
        type,
        name: isCompany ? name.trim() : null,
        defaultCurrency,
      }).unwrap();
      toast.success(tOnboard("success.title"), {
        description: tOnboard("success.description"),
      });
      setCurrentWorkspaceId(res.id);
      onOpenChange(false);
      setType("FREELANCE");
      setName("");
      setDefaultCurrency("XOF");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(tOnboard("errors.title"), {
        description: msg || tOnboard("errors.description"),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t("createWorkspace")}</DialogTitle>
          <DialogDescription>
            {tOnboard("type.description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{tOnboard("type.title")}</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "FREELANCE" ? "default" : "outline"}
                size="sm"
                onClick={() => setType("FREELANCE")}
              >
                {tOnboard("type.freelance.title")}
              </Button>
              <Button
                type="button"
                variant={type === "INDIVIDUAL" ? "default" : "outline"}
                size="sm"
                onClick={() => setType("INDIVIDUAL")}
              >
                {tOnboard("type.individual.title")}
              </Button>
              <Button
                type="button"
                variant={type === "COMPANY" ? "default" : "outline"}
                size="sm"
                onClick={() => setType("COMPANY")}
              >
                {tOnboard("type.workspaceCompany.title")}
              </Button>
            </div>
          </div>
          {isCompany && (
            <div className="space-y-2">
              <Label htmlFor="create-ws-name">
                {tOnboard("basic.fields.nameLabelCompany")} *
              </Label>
              <Input
                id="create-ws-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tOnboard("basic.fields.namePlaceholder")}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>{tOnboard("basic.fields.defaultCurrency")}</Label>
            <Select
              value={defaultCurrency}
              onValueChange={setDefaultCurrency}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XOF">FCFA (XOF) - UEMOA</SelectItem>
                <SelectItem value="XAF">FCFA (XAF) - CEMAC</SelectItem>
                <SelectItem value="NGN">NGN</SelectItem>
                <SelectItem value="GHS">GHS</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={!canSubmit || createWorkspaceStatus.isPending}>
              {createWorkspaceStatus.isPending ? "…" : t("createWorkspace")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
