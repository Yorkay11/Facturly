import { useState, useMemo, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  useGetClientsQuery,
  useGetInvoicesQuery,
  useDeleteClientMutation,
} from "@/services/facturlyApi";

const ITEMS_PER_PAGE = 20;

type ClientForList = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  createdAt?: string;
};

export function useClientsData() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("clients");
  const commonT = useTranslations("common");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    data: clientsResponse,
    isLoading,
    isError,
  } = useGetClientsQuery({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
  });
  const { data: invoicesResponse } = useGetInvoicesQuery({
    page: 1,
    limit: 1,
  });
  const [deleteClient, { isLoading: isDeleting }] = useDeleteClientMutation();

  const clients = clientsResponse?.data ?? [];
  const totalClients = clientsResponse?.meta?.total ?? 0;
  const totalPages = clientsResponse?.meta?.totalPages ?? 1;
  const totalInvoices = invoicesResponse?.meta?.total ?? 0;

  const formatDate = useCallback(
    (value: string) =>
      new Date(value).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    [locale]
  );

  const lastClientDate = useMemo(() => {
    if (clients.length === 0) return "—";
    const clientsWithDates = clients.filter(
      (client: ClientForList) => client.createdAt
    );
    if (clientsWithDates.length === 0) return "—";
    const mostRecentClient = clientsWithDates.reduce(
      (latest: ClientForList | null, client: ClientForList) => {
        if (!latest) return client;
        if (!client.createdAt) return latest;
        if (!latest.createdAt) return client;
        const clientDate = new Date(client.createdAt).getTime();
        const latestDate = new Date(latest.createdAt).getTime();
        return clientDate > latestDate ? client : latest;
      },
      clientsWithDates[0] as ClientForList
    );
    return mostRecentClient?.createdAt
      ? formatDate(mostRecentClient.createdAt)
      : "—";
  }, [clients, formatDate]);

  const handleDeleteClick = (
    e: React.MouseEvent,
    client: { id: string; name: string }
  ) => {
    e.stopPropagation();
    setClientToDelete({ id: client.id, name: client.name });
  };

  const handleRowClick = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    try {
      await deleteClient(clientToDelete.id).unwrap();
      toast.success(t("deleteSuccess"), {
        description: t("deleteSuccessDescription", {
          name: clientToDelete.name,
        }),
      });
      setClientToDelete(null);
    } catch (err) {
      let errorMessage = t("deleteError");
      if (err && typeof err === "object" && "data" in err) {
        errorMessage =
          (err.data as { message?: string })?.message ?? errorMessage;
      }
      toast.error(commonT("error"), {
        description: errorMessage,
      });
    }
  };

  const handleClientModalSuccess = () => {
    toast.success(t("createSuccess"), {
      description: t("createSuccessDescription"),
    });
    setModalOpen(false);
  };

  const handleImportModalSuccess = () => {
    toast.success(t("importSuccess"), {
      description: t("importSuccessDescription"),
    });
    setImportModalOpen(false);
  };

  const goToPreviousPage = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  return {
    clients,
    totalClients,
    totalPages,
    totalInvoices,
    lastClientDate,
    isLoading,
    isError,
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery: handleSearchChange,
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
  };
}
