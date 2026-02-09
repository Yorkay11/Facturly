"use client";

import { Link } from "@/i18n/routing";
import {
  Plus,
  Trash2,
  Copy,
  Repeat,
  Palette,
  Eye,
  MessageSquare,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import InvoiceStatusBadge from "@/components/invoices/InvoiceStatusBadge";
import { useInvoicesData, type FilterType, type SortType } from "@/hooks/useInvoicesData";
import { FuryMascot } from "@/components/mascot";

export default function InvoicesPage() {
  const t = useTranslations("invoices");
  const {
    filteredAndSortedInvoices,
    stats,
    isLoading,
    isError,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    resetFilters,
    invoiceToDelete,
    setInvoiceToDelete,
    invoiceToRemind,
    isDeleting,
    isCancelling,
    isDuplicating,
    isSendingReminder,
    formatCurrency,
    formatDate,
    handleDeleteClick,
    handleConfirmDelete,
    handleDuplicate,
    handleSendReminder,
  } = useInvoicesData();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t("breadcrumb.dashboard"), href: "/dashboard" },
          { label: t("breadcrumb.invoices") },
        ]}
        className="text-xs"
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">
              {t("title")}
            </h1>
            <p className="mt-1 text-sm text-foreground/70">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
              asChild
            >
              <Link href="/recurring-invoices">
                <Repeat className="h-4 w-4" />
                <span className="hidden sm:inline">{t("recurring")}</span>
              </Link>
            </Button>
            <Button className="gap-2" asChild>
              <Link href="/invoices/new">
                <Plus className="h-4 w-4" />
                {t("new.label")}
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href="/invoices/templates">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("templates.breadcrumb.templates")}
                </span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">
                En retard
              </span>
            </div>
            <p className="text-2xl font-black text-red-700 dark:text-red-300">
              {stats.overdue}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
                En attente
              </span>
            </div>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-300">
              {stats.pending}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">
                Payées
              </span>
            </div>
            <p className="text-2xl font-black text-green-700 dark:text-green-300">
              {stats.paid}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">
                Ce mois
              </span>
            </div>
            <p className="text-2xl font-black text-purple-700 dark:text-purple-300">
              {stats.thisMonthPaid}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  t("searchPlaceholder") ||
                  "Rechercher (client, numéro, montant...)"
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === "overdue" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setStatusFilter(statusFilter === "overdue" ? "all" : "overdue")
                }
                className="gap-1.5"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                En retard ({stats.overdue})
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setStatusFilter(statusFilter === "pending" ? "all" : "pending")
                }
                className="gap-1.5"
              >
                <Clock className="h-3.5 w-3.5" />
                En attente ({stats.pending})
              </Button>
              <Button
                variant={statusFilter === "paid" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setStatusFilter(statusFilter === "paid" ? "all" : "paid")}
                className="gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Payées ({stats.paid})
              </Button>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as FilterType)}
            >
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatuses")}</SelectItem>
                <SelectItem value="draft">{t("draft")}</SelectItem>
                <SelectItem value="sent">{t("sent")}</SelectItem>
                <SelectItem value="paid">{t("paid")}</SelectItem>
                <SelectItem value="overdue">{t("overdue")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortType)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due-date-asc">
                  Priorité (En retard)
                </SelectItem>
                <SelectItem value="date-desc">Plus récentes</SelectItem>
                <SelectItem value="date-asc">Plus anciennes</SelectItem>
                <SelectItem value="amount-desc">Montant décroissant</SelectItem>
                <SelectItem value="amount-asc">Montant croissant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-foreground/60 font-medium">
            {filteredAndSortedInvoices.length}{" "}
            {filteredAndSortedInvoices.length > 1 ? "factures" : "facture"}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold mb-2">{t("errors.loadingError")}</p>
          {error && "data" in error && (
            <p className="text-xs text-destructive/70">
              {typeof error.data === "object" &&
              error.data !== null &&
              "message" in error.data
                ? String(error.data.message)
                : "Erreur lors du chargement des factures"}
            </p>
          )}
        </div>
      )}

      {!isLoading &&
        !isError &&
        filteredAndSortedInvoices.length > 0 && (
          <div className="relative z-0 overflow-x-auto rounded-xl border border-primary/20 bg-card shadow-sm">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow>
                  <TableHead className="w-[140px]">
                    {t("table.number")}
                  </TableHead>
                  <TableHead>{t("table.client")}</TableHead>
                  <TableHead>{t("table.dueDate")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead className="text-right">{t("table.amount")}</TableHead>
                  <TableHead className="w-[180px] text-right">
                    {t("table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedInvoices.map((invoice) => {
                  const realStatus = invoice.realStatus;
                  const canRemind =
                    realStatus === "overdue" && invoice.status !== "paid";
                  return (
                    <TableRow
                      key={invoice.id}
                      className={cn(
                        "hover:bg-primary/5 transition-colors",
                        realStatus === "overdue" &&
                          "bg-red-50/50 dark:bg-red-950/20 border-l-4 border-l-red-500"
                      )}
                    >
                      <TableCell className="font-medium">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-primary hover:underline font-bold"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground">
                          {invoice.client?.name || t("table.noClient") || "Sans client"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground/70">
                          {formatDate(invoice.dueDate)}
                          {realStatus === "overdue" && (
                            <Badge
                              variant="destructive"
                              className="ml-2 text-[10px]"
                            >
                              {Math.ceil(
                                (new Date().getTime() -
                                  new Date(invoice.dueDate).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )}
                              j
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge
                          status={
                            realStatus as
                              | "draft"
                              | "sent"
                              | "paid"
                              | "overdue"
                              | "cancelled"
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary text-lg">
                        {formatCurrency(invoice.totalAmount, invoice.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canRemind && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendReminder(invoice.id);
                              }}
                              disabled={
                                isSendingReminder &&
                                invoiceToRemind === invoice.id
                              }
                              className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                              title="Relancer sur WhatsApp"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              {isSendingReminder &&
                              invoiceToRemind === invoice.id
                                ? "..."
                                : "Relancer"}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            asChild
                            title={t("table.view") ?? "Voir"}
                          >
                            <Link href={`/invoices/${invoice.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicate(invoice.id);
                            }}
                            disabled={isDuplicating}
                            title={
                              t("duplicate.button") ?? "Dupliquer la facture"
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(invoice);
                            }}
                            disabled={
                              isDeleting ||
                              isCancelling ||
                              invoice.status === "cancelled"
                            }
                            title={
                              invoice.status === "draft"
                                ? t("deleteDialog.delete")
                                : t("deleteDialog.cancelAction")
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

      {!isLoading &&
        !isError &&
        filteredAndSortedInvoices.length === 0 && (
          <div className="flex flex-col items-center gap-6 rounded-xl border border-dashed border-primary/30 bg-card py-16 shadow-sm">
            <FuryMascot mood="sad" size="lg" />
            {searchQuery || statusFilter !== "all" ? (
              <>
                <p className="text-xl font-semibold text-primary">
                  Aucune facture trouvée
                </p>
                <p className="max-w-md text-center text-sm text-foreground/60">
                  Aucune facture ne correspond à vos critères de recherche.
                </p>
                <Button variant="outline" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              </>
            ) : (
              <>
                <p className="text-xl font-semibold text-primary">
                  {t("empty.title")}
                </p>
                <p className="max-w-md text-center text-sm text-foreground/60">
                  {t("empty.description")}
                </p>
                <Button className="gap-2" asChild>
                  <Link href="/invoices/new">
                    <Plus className="h-4 w-4" />
                    {t("create")}
                  </Link>
                </Button>
              </>
            )}
          </div>
        )}

      <AlertDialog
        open={!!invoiceToDelete}
        onOpenChange={(open) => !open && setInvoiceToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {invoiceToDelete?.status === "draft"
                ? t("deleteDialog.deleteTitle")
                : t("deleteDialog.cancelTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {invoiceToDelete?.status === "draft"
                ? t("deleteDialog.deleteDescription", {
                    number: invoiceToDelete?.number ?? "",
                  })
                : t("deleteDialog.cancelDescription", {
                    number: invoiceToDelete?.number ?? "",
                  })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting || isCancelling}
            >
              {isDeleting || isCancelling
                ? t("deleteDialog.processing")
                : invoiceToDelete?.status === "draft"
                  ? t("deleteDialog.delete")
                  : t("deleteDialog.cancelAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
