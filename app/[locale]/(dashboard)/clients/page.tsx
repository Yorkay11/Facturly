"use client";

import { Plus, Trash2 } from "lucide-react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { useTranslations } from "next-intl";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";
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
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: navigationT("dashboard"), href: "/dashboard" },
          { label: t("title") },
        ]}
        className="text-xs"
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">
              {t("title")}
            </h1>
            <p className="mt-1 text-sm text-foreground/70">{t("subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setImportModalOpen(true)}
            >
              <IoCloudUploadOutline className="h-4 w-4" />
              {t("importCSV")}
            </Button>
            <Button className="gap-2" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("new")}
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row">
          <Card className="flex-1 border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">
                {t("activeClients")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">
                {totalClients}
              </p>
            </CardContent>
          </Card>
          <Card className="flex-1 border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">
                {t("cumulativeInvoices")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">
                {totalInvoices}
              </p>
            </CardContent>
          </Card>
          <Card className="flex-1 border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">
                {t("lastAdded")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">
                {lastClientDate}
              </p>
              <p className="text-xs text-foreground/60">
                {t("lastAddedDescription")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-full max-w-sm" />
            </CardHeader>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {t("loadError")}
        </div>
      ) : clients && clients.length ? (
        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-primary">{t("directory")}</CardTitle>
                <p className="text-sm text-foreground/60">
                  {t("directoryDescription")}
                </p>
              </div>
              <Input
                placeholder={t("searchPlaceholder")}
                className="max-w-sm"
              />
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {clients
              .filter((client) => client.id)
              .map((client) => {
                const getInitials = () => {
                  if (!client.name) return "?";
                  const parts = client.name.trim().split(/\s+/);
                  if (parts.length >= 2) {
                    return (
                      parts[0][0] + parts[parts.length - 1][0]
                    ).toUpperCase();
                  }
                  return client.name.substring(0, 2).toUpperCase();
                };

                return (
                  <Card
                    key={client.id}
                    className="group relative border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => handleRowClick(client.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {client.name}
                          </h3>
                          {client.city && client.country && (
                            <p className="text-xs text-muted-foreground truncate">
                              {client.city}, {client.country}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(e, client);
                          }}
                          disabled={isDeleting}
                          title={t("deleteAction")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {client.email && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FaEnvelope className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FaPhone className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{client.phone}</span>
                          </div>
                        )}
                        {client.city && !client.country && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FaMapMarkerAlt className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{client.city}</span>
                          </div>
                        )}
                        {client.createdAt && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border">
                            <FaCalendarAlt className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span>{formatDate(client.createdAt)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          {totalPages > 1 && (
            <Card className="border-primary/20">
              <CardContent className="px-6 py-4">
                <div className="flex items-center justify-between">
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
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <IoChevronBackOutline className="h-4 w-4" />
                      {t("previous")}
                    </Button>
                    <div className="text-sm font-medium px-3">
                      {currentPage} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages || isLoading}
                    >
                      {t("next")}
                      <IoChevronForwardOutline className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 rounded-xl border border-dashed border-primary/30 bg-card py-16 shadow-sm">
          <FuryMascot mood="sleepy" size="lg" />
          <p className="text-xl font-semibold text-primary">
            {t("noClients")}
          </p>
          <p className="max-w-md text-center text-sm text-foreground/60">
            {t("noClientsDescription")}
          </p>
          <Button className="gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("add")}
          </Button>
        </div>
      )}

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
