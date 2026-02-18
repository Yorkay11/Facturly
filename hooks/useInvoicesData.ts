import { useState, useMemo } from "react";
import { useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  useGetInvoicesQuery,
  useDeleteInvoiceMutation,
  useCancelInvoiceMutation,
  useCreateInvoiceMutation,
  useSendReminderMutation,
  facturlyApi,
} from "@/services/facturlyApi";
import type { InvoiceItem } from "@/services/api/types/invoice.types";
import { store } from "@/lib/redux/store";

export type FilterType = "all" | "overdue" | "pending" | "paid" | "draft" | "sent" | "cancelled" | "rejected";
export type SortType =
  | "date-desc"
  | "date-asc"
  | "amount-desc"
  | "amount-asc"
  | "due-date-asc";

type InvoiceForList = {
  id: string;
  invoiceNumber: string;
  status: string;
  dueDate: string;
  issueDate: string;
  totalAmount: string;
  currency: string;
  client: { name: string };
  rejectedAt?: string | null;
};

export function useInvoicesData() {
  const t = useTranslations("invoices");
  const commonT = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("due-date-asc");
  const [invoiceToDelete, setInvoiceToDelete] = useState<{
    id: string;
    number: string;
    status: string;
  } | null>(null);
  const [invoiceToDuplicate, setInvoiceToDuplicate] = useState<string | null>(null);
  const [invoiceToRemind, setInvoiceToRemind] = useState<string | null>(null);

  const { data: invoicesResponse, isLoading, isError, error } = useGetInvoicesQuery(
    { page: 1, limit: 100 },
    { refetchOnMountOrArgChange: true }
  );
  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();
  const [cancelInvoice, { isLoading: isCancelling }] = useCancelInvoiceMutation();
  const [createInvoice, { isLoading: isDuplicating }] = useCreateInvoiceMutation();
  const [sendReminder, { isLoading: isSendingReminder }] = useSendReminderMutation();

  const invoices = invoicesResponse?.data ?? [];
  const totalInvoices = invoicesResponse?.meta?.total ?? 0;

  const isOverdue = (dueDate: string, status: string) => {
    if (status === "paid" || status === "cancelled") return false;
    return new Date(dueDate) < new Date();
  };

  /** Statut affiché : "rejected" = refusée par le client (rejectedAt renseigné), "cancelled" = annulée par l'émetteur. */
  const getRealStatus = (invoice: { status: string; dueDate: string; rejectedAt?: string | null }) => {
    if (
      invoice.status === "sent" &&
      isOverdue(invoice.dueDate, invoice.status)
    ) {
      return "overdue";
    }
    if (invoice.status === "cancelled" && invoice.rejectedAt) {
      return "rejected"; // Refusée par le client
    }
    return invoice.status; // "cancelled" sans rejectedAt = annulée par l'émetteur
  };

  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = invoices.map((invoice: InvoiceForList) => ({
      ...invoice,
      realStatus: getRealStatus(invoice),
    }));

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (invoice: InvoiceForList & { realStatus: string }) =>
          invoice.invoiceNumber.toLowerCase().includes(query) ||
          invoice.client.name.toLowerCase().includes(query) ||
          invoice.totalAmount.includes(query)
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "pending") {
        filtered = filtered.filter(
          (invoice: InvoiceForList & { realStatus: string }) =>
            invoice.realStatus === "sent"
        );
      } else if (statusFilter === "overdue") {
        filtered = filtered.filter(
          (invoice: InvoiceForList & { realStatus: string }) =>
            invoice.realStatus === "overdue"
        );
      } else {
        filtered = filtered.filter(
          (invoice: InvoiceForList & { realStatus: string }) =>
            invoice.realStatus === statusFilter
        );
      }
    }

    const priority = {
      overdue: 0,
      sent: 1,
      paid: 2,
      draft: 3,
      cancelled: 4,
      rejected: 5,
    };

    if (sortBy === "due-date-asc") {
      filtered.sort(
        (
          a: InvoiceForList & { realStatus: string },
          b: InvoiceForList & { realStatus: string }
        ) => {
          const priorityDiff =
            priority[a.realStatus as keyof typeof priority] -
            priority[b.realStatus as keyof typeof priority];
          if (priorityDiff !== 0) return priorityDiff;
          return (
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          );
        }
      );
    } else if (sortBy === "date-desc") {
      filtered.sort(
        (a: InvoiceForList, b: InvoiceForList) =>
          new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
      );
    } else if (sortBy === "date-asc") {
      filtered.sort(
        (a: InvoiceForList, b: InvoiceForList) =>
          new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
      );
    } else if (sortBy === "amount-desc") {
      filtered.sort(
        (a: InvoiceForList, b: InvoiceForList) =>
          parseFloat(b.totalAmount) - parseFloat(a.totalAmount)
      );
    } else if (sortBy === "amount-asc") {
      filtered.sort(
        (a: InvoiceForList, b: InvoiceForList) =>
          parseFloat(a.totalAmount) - parseFloat(b.totalAmount)
      );
    }

    return filtered;
  }, [invoices, searchQuery, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const overdue = invoices.filter(
      (inv: InvoiceForList) => getRealStatus(inv) === "overdue"
    ).length;
    const pending = invoices.filter(
      (inv: InvoiceForList) => getRealStatus(inv) === "sent"
    ).length;
    const paid = invoices.filter(
      (inv: InvoiceForList) => inv.status === "paid"
    ).length;
    const thisMonthPaid = invoices.filter((inv: InvoiceForList) => {
      if (inv.status !== "paid") return false;
      const paidDate = (inv as InvoiceForList & { createdAt?: string }).createdAt
        ? new Date((inv as InvoiceForList & { createdAt?: string }).createdAt!)
        : new Date();
      const now = new Date();
      return (
        paidDate.getMonth() === now.getMonth() &&
        paidDate.getFullYear() === now.getFullYear()
      );
    }).length;
    return { overdue, pending, paid, thisMonthPaid };
  }, [invoices]);

  const formatCurrency = (value: string | number, currency: string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const formatDate = (value: string) =>
    format(new Date(value), locale === "fr" ? "dd/MM/yyyy" : "MM/dd/yyyy");

  const handleDeleteClick = (invoice: {
    id: string;
    invoiceNumber: string;
    status: string;
  }) => {
    setInvoiceToDelete({
      id: invoice.id,
      number: invoice.invoiceNumber,
      status: invoice.status,
    });
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      if (invoiceToDelete.status === "draft") {
        await deleteInvoice(invoiceToDelete.id).unwrap();
        toast.success(t("deleteDialog.deleteSuccess"), {
          description: t("deleteDialog.deleteSuccessDescription", {
            number: invoiceToDelete.number,
          }),
        });
      } else {
        await cancelInvoice(invoiceToDelete.id).unwrap();
        toast.success(t("deleteDialog.cancelSuccess"), {
          description: t("deleteDialog.cancelSuccessDescription", {
            number: invoiceToDelete.number,
          }),
        });
      }
      setInvoiceToDelete(null);
    } catch (err) {
      let errorMessage = t("deleteDialog.error");
      if (err && typeof err === "object" && "data" in err) {
        errorMessage =
          (err.data as { message?: string })?.message ?? errorMessage;
      }
      toast.error(commonT("error"), {
        description: errorMessage,
      });
    }
  };

  const handleDuplicate = async (invoiceId: string) => {
    try {
      const invoiceResult = await store.dispatch(
        facturlyApi.endpoints.getInvoiceById.initiate(invoiceId)
      );
      if ("error" in invoiceResult) {
        throw new Error("Erreur lors de la récupération de la facture");
      }
      const invoice = invoiceResult.data;
      if (!invoice) {
        throw new Error("Facture introuvable");
      }
      const today = new Date().toISOString().split("T")[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const newDueDate = dueDate.toISOString().split("T")[0];
      const duplicatePayload = {
        clientId: invoice.client.id,
        issueDate: today,
        dueDate: newDueDate,
        currency: invoice.currency,
        items:
          invoice.items?.map((item: InvoiceItem) => ({
            productId: item.product?.id || undefined,
            description: item.description,
            quantity: item.quantity.toString(),
            unitPrice: item.unitPrice.toString(),
          })) ?? [],
        notes: invoice.notes || undefined,
        recipientEmail: invoice.recipientEmail || undefined,
        templateName: invoice.templateName || undefined,
      };
      const newInvoice = await createInvoice(duplicatePayload).unwrap();
      toast.success(t("duplicate.success") ?? "Facture dupliquée avec succès", {
        description:
          t("duplicate.successDescription", {
            number: invoice.invoiceNumber,
          }) ??
          `La facture ${invoice.invoiceNumber} a été dupliquée`,
      });
      router.push(`/invoices/${newInvoice.id}/edit`);
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string };
      const errorMessage =
        errObj?.data?.message ||
        errObj?.message ||
        t("duplicate.error") ||
        "Erreur lors de la duplication";
      toast.error(commonT("error"), {
        description: errorMessage,
      });
    } finally {
      setInvoiceToDuplicate(null);
    }
  };

  const handleSendReminder = async (invoiceId: string) => {
    try {
      setInvoiceToRemind(invoiceId);
      await sendReminder(invoiceId).unwrap();
      toast.success("Relance envoyée", {
        description:
          "La relance a été envoyée avec succès sur WhatsApp",
      });
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string };
      const errorMessage =
        errObj?.data?.message ||
        errObj?.message ||
        "Erreur lors de l'envoi de la relance";
      toast.error(commonT("error"), {
        description: errorMessage,
      });
    } finally {
      setInvoiceToRemind(null);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  return {
    // Data
    invoices,
    totalInvoices,
    filteredAndSortedInvoices,
    stats,
    isLoading,
    isError,
    error,
    // Filters & sort
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    resetFilters,
    // Modals state
    invoiceToDelete,
    setInvoiceToDelete,
    invoiceToRemind,
    // Loading states
    isDeleting,
    isCancelling,
    isDuplicating,
    isSendingReminder,
    // Formatters
    formatCurrency,
    formatDate,
    // Handlers
    handleDeleteClick,
    handleConfirmDelete,
    handleDuplicate,
    handleSendReminder,
  };
}
