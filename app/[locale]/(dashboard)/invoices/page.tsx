"use client";

import { Link } from "@/i18n/routing";
import {
  Plus,
  Trash2,
  XCircle,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const sortOptions: { value: SortType; labelKey: string }[] = [
    { value: "due-date-asc", labelKey: "sort.priority" },
    { value: "date-desc", labelKey: "sort.recent" },
    { value: "date-asc", labelKey: "sort.oldest" },
    { value: "amount-desc", labelKey: "sort.amountDesc" },
    { value: "amount-asc", labelKey: "sort.amountAsc" },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-muted/30 to-background">
      <div className="w-full px-4 py-8 sm:px-6 sm:py-10">
        <nav className="mb-8">
          <Breadcrumb
            items={[
              { label: t("breadcrumb.dashboard"), href: "/dashboard" },
              { label: t("breadcrumb.invoices") },
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
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 rounded-full h-9" asChild>
                <Link href="/recurring-invoices">
                  <Repeat className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("recurring")}</span>
                </Link>
              </Button>
              <Button size="sm" className="gap-2 rounded-full h-9" asChild>
                <Link href="/invoices/new">
                  <Plus className="h-4 w-4" />
                  {t("new.label")}
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 rounded-full h-9" asChild>
                <Link href="/invoices/templates">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("templates.breadcrumb.templates")}</span>
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Stats */}
        <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t("overdue")}
              </span>
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {stats.overdue}
            </p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t("stats.active")}
              </span>
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {stats.pending}
            </p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t("paid")}
              </span>
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {stats.paid}
            </p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t("stats.thisMonth")}
              </span>
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {stats.thisMonthPaid}
            </p>
          </div>
        </section>

        {/* Search + filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-muted/30 border-border rounded-xl"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as FilterType)}
            >
              <SelectTrigger className="w-[160px] h-10 rounded-xl border-border bg-muted/30">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder={t("allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatuses")}</SelectItem>
                <SelectItem value="draft">{t("draft")}</SelectItem>
                <SelectItem value="sent">{t("sent")}</SelectItem>
                <SelectItem value="paid">{t("paid")}</SelectItem>
                <SelectItem value="overdue">{t("overdue")}</SelectItem>
                <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
                <SelectItem value="rejected">{t("rejected")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortType)}>
              <SelectTrigger className="w-[180px] h-10 rounded-xl border-border bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground font-medium">
              {t("listPage.invoiceCount", { count: filteredAndSortedInvoices.length })}
            </span>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-6 text-sm text-destructive">
            <p className="font-semibold mb-2">{t("errors.loadingError")}</p>
            {error && "data" in error && (
              <p className="text-xs text-destructive/80">
                {typeof error.data === "object" &&
                error.data !== null &&
                "message" in error.data
                  ? String(error.data.message)
                  : t("errors.loadingError")}
              </p>
            )}
          </div>
        )}

        {!isLoading &&
          !isError &&
          filteredAndSortedInvoices.length > 0 && (
            <div className="space-y-3">
              {filteredAndSortedInvoices.map((invoice) => {
                const realStatus = invoice.realStatus;
                const canRemind =
                  realStatus === "overdue" && invoice.status !== "paid";
                return (
                  <div
                    key={invoice.id}
                    className={cn(
                      "group flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm transition-colors hover:border-border sm:flex-row sm:items-center sm:justify-between",
                      realStatus === "overdue" &&
                        "border-l-4 border-l-destructive/80 bg-destructive/5 dark:bg-destructive/10"
                    )}
                  >
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="min-w-0 flex-1 space-y-1 sm:pr-4"
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-semibold text-foreground">
                          {invoice.invoiceNumber}
                        </p>
                        <InvoiceStatusBadge
                          status={
                            realStatus as
                              | "draft"
                              | "sent"
                              | "paid"
                              | "overdue"
                              | "cancelled"
                              | "rejected"
                          }
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {invoice.client?.name || t("table.noClient")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("table.dueDate")} · {formatDate(invoice.dueDate)}
                      </p>
                    </Link>
                    <div className="flex items-center justify-between gap-4 sm:justify-end shrink-0">
                      <p className="text-lg font-semibold tabular-nums text-foreground">
                        {formatCurrency(invoice.totalAmount, invoice.currency)}
                      </p>
                      <div className="flex items-center gap-1">
                        {canRemind && (
                          <Button
                            variant="default"
                            size="sm"
                            className="gap-1.5 rounded-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSendReminder(invoice.id);
                            }}
                            disabled={
                              isSendingReminder && invoiceToRemind === invoice.id
                            }
                            title="Relancer"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            {isSendingReminder && invoiceToRemind === invoice.id
                              ? "..."
                              : "Relancer"}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          asChild
                          title={t("table.view")}
                        >
                          <Link href={`/invoices/${invoice.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDuplicate(invoice.id);
                          }}
                          disabled={isDuplicating}
                          title={t("duplicate.button")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.preventDefault();
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
                          {invoice.status === "draft" ? (
                            <Trash2 className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        {!isLoading &&
          !isError &&
          filteredAndSortedInvoices.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
              <FuryMascot
                mood={searchQuery || statusFilter !== "all" ? "sad" : "happy"}
                size="lg"
                className="mb-4"
              />
              {searchQuery || statusFilter !== "all" ? (
                <>
                  <p className="text-lg font-semibold text-foreground">
                    {t("listPage.noSearchResults")}
                  </p>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    {t("listPage.noSearchResultsDescription")}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 rounded-full"
                    onClick={resetFilters}
                  >
                    {t("listPage.resetFilters")}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-foreground">
                    {t("empty.title")}
                  </p>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    {t("empty.description")}
                  </p>
                  <Button className="mt-4 gap-2 rounded-full" asChild>
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
    </div>
  );
}
