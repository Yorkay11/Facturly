"use client";

import { Plus, Trash2, Search, ChevronRight, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { useTranslations } from "next-intl";
import { IoCloudUploadOutline } from "react-icons/io5";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import Breadcrumb from "@/components/ui/breadcrumb";
import Skeleton from "@/components/ui/skeleton";
import ClientModal from "@/components/modals/ClientModal";
import ImportClientsModal from "@/components/modals/ImportClientsModal";

import { useClientsData } from "@/hooks/useClientsData";
import { FuryMascot } from "@/components/mascot";

export default function ClientsPage() {
  const navigationT = useTranslations("navigation");
  const t = useTranslations("clients");
  const commonT = useTranslations("common");

  const {
    clients,
    totalClients,
    totalPages,
    totalInvoices,
    lastClientDate,
    isLoading,
    isError,
    currentPage,
    goToPreviousPage,
    goToNextPage,
    isModalOpen,
    setModalOpen,
    isImportModalOpen,
    setImportModalOpen,
    clientToDelete,
    setClientToDelete,
    isDeleting,
    formatDate,
    handleDeleteClick,
    handleRowClick,
    handleConfirmDelete,
    handleClientModalSuccess,
    handleImportModalSuccess,
  } = useClientsData();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-muted/30 to-background">
      <div className="w-full px-4 py-8 sm:px-6 sm:py-10">
        <nav className="mb-8">
          <Breadcrumb
            items={[
              { label: navigationT("dashboard"), href: "/dashboard" },
              { label: t("title") },
            ]}
            className="text-xs text-muted-foreground"
          />
        </nav>

        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {t("title")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-full border-border/80 bg-background/80 shadow-sm backdrop-blur-sm"
                onClick={() => setImportModalOpen(true)}
              >
                <IoCloudUploadOutline className="h-4 w-4" />
                {t("importCSV")}
              </Button>
              <Button
                size="sm"
                className="h-9 gap-2 rounded-full px-4 font-medium"
                onClick={() => setModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {t("new")}
              </Button>
            </div>
          </div>
        </header>

        <div className="mb-8 grid grid-cols-3 gap-4">
          <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("activeClients")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-bold tabular-nums text-foreground">{totalClients}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("cumulativeInvoices")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-bold tabular-nums text-foreground">{totalInvoices}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("lastAdded")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-bold text-foreground">{lastClientDate}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("lastAddedDescription")}</p>
            </CardContent>
          </Card>
        </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-9 w-48" />
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Skeleton className="h-10 w-full pl-9" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-6 text-sm text-destructive">
          {t("loadError")}
        </div>
      ) : clients && clients.length ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t("directory")}</h2>
              <p className="text-sm text-muted-foreground">{t("directoryDescription")}</p>
            </div>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                className="h-10 pl-9 bg-muted/30 border-border"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {clients
              .filter((client) => client.id)
              .map((client) => {
                const getInitials = () => {
                  if (!client.name) return "?";
                  const parts = client.name.trim().split(/\s+/);
                  if (parts.length >= 2) {
                    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                  }
                  return client.name.substring(0, 2).toUpperCase();
                };

                return (
                  <Card
                    key={client.id}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/40 bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-border/60 hover:shadow-xl hover:shadow-black/5"
                    onClick={() => handleRowClick(client.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 shrink-0 border border-border/40 shadow-sm ring-2 ring-background">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-[15px]">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 space-y-1">
                          <h3 className="text-[15px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {client.name}
                          </h3>
                          {(client.city || client.country) && (
                            <p className="text-[13px] text-muted-foreground truncate">
                              {[client.city, client.country].filter(Boolean).join(", ")}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 rounded-lg opacity-0 transition-all group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(e, client);
                          }}
                          disabled={isDeleting}
                          title={t("deleteAction")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-4 space-y-2.5">
                        {client.email && (
                          <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                            <span className="truncate">{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                            <span className="truncate">{client.phone}</span>
                          </div>
                        )}
                        {(client.addressLine1 || client.city || client.country) && (
                          <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                            <span className="truncate">
                              {[client.addressLine1, client.city, client.country].filter(Boolean).join(", ")}
                            </span>
                          </div>
                        )}
                        {client.createdAt && (
                          <div className="flex items-center gap-2.5 pt-2.5 border-t border-border/30 text-[12px] text-muted-foreground/80">
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                            <span>{formatDate(client.createdAt)}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/30">
                        <div className="text-[12px] text-muted-foreground/60 font-medium">
                          Voir les détails
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/50 pt-6">
              <div className="text-sm text-muted-foreground">
                {t("pageInfo", {
                  current: currentPage,
                  total: totalPages,
                  count: totalClients,
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1 || isLoading}
                >
                  <IoChevronBackOutline className="h-4 w-4" />
                  {t("previous")}
                </Button>
                <div className="text-sm font-medium px-3">{currentPage} / {totalPages}</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || isLoading}
                >
                  {t("next")}
                  <IoChevronForwardOutline className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-border bg-card/50 py-16 shadow-sm">
          <FuryMascot mood="sleepy" size="lg" />
          <p className="text-xl font-semibold text-foreground">{t("noClients")}</p>
          <p className="max-w-md text-center text-sm text-muted-foreground">
            {t("noClientsDescription")}
          </p>
          <Button className="gap-2 rounded-full" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("add")}
          </Button>
        </div>
      )}
      </div>

      <ClientModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleClientModalSuccess}
      />
      <ImportClientsModal
        open={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={handleImportModalSuccess}
      />

      <AlertDialog
        open={!!clientToDelete}
        onOpenChange={(open) => !open && setClientToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDescription", {
                name: clientToDelete?.name ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{commonT("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? t("processing") : t("deleteAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
