"use client";

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import InvoiceDetails from '@/components/containers/InvoiceDetails';
import Preview from '@/components/containers/Preview';
import Breadcrumb from '@/components/ui/breadcrumb';
import { useState } from 'react';
import { ItemModalContext } from '@/contexts/ItemModalContext';
import { Item } from '@/types/items';
import { AddItemModal } from '@/components/smallComponents/AddItem';
import { useItemsStore } from '@/hooks/useItemStore';
import Skeleton from '@/components/ui/skeleton';
import { useGetInvoiceByIdQuery } from '@/services/facturlyApi';
import { useTranslations } from 'next-intl';

const InvoiceEditPage = () => {
  const params = useParams();
  const t = useTranslations('invoices.editPage');
  const invoicesT = useTranslations('invoices');
  const invoiceId = typeof params?.id === "string" && params.id !== "undefined" && params.id.trim() !== ""
    ? params.id
    : undefined;

  const { data: invoice, isLoading: isLoadingInvoice, isError: isErrorInvoice } = useGetInvoiceByIdQuery(
    invoiceId || "",
    { skip: !invoiceId }
  );

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentItem, setCurrentItem] = useState<Item | undefined>(undefined);
  const { addItem, updateItem } = useItemsStore();

  const openCreate = () => {
    setCurrentItem(undefined);
    setModalMode('create');
    setModalOpen(true);
  };

  const openEdit = (item: Item) => {
    setCurrentItem(item);
    setModalMode('edit');
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmitItem = (data: Omit<Item, 'id'>, existingId?: string) => {
    if (existingId) {
      updateItem(existingId, data);
    } else {
      addItem(data);
    }
  };

  if (!invoiceId) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-muted/30 to-background">
        <div className="w-full px-4 py-8 sm:px-6 sm:py-10">
          <nav className="mb-8">
            <Breadcrumb
              items={[
                { label: invoicesT('breadcrumb.dashboard'), href: '/dashboard' },
                { label: invoicesT('breadcrumb.invoices'), href: '/invoices' },
                { label: t('breadcrumb.edit') },
              ]}
              className="text-xs text-muted-foreground"
            />
          </nav>
          <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-semibold mb-2">ID de facture invalide</p>
            <p className="mb-4">L&apos;identifiant de la facture est manquant ou invalide.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingInvoice) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-muted/30 to-background">
        <div className="w-full px-4 py-8 sm:px-6 sm:py-10">
          <Skeleton className="h-6 w-48 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-muted/30 to-background">
        <div className="w-full px-4 py-8 sm:px-6 sm:py-10">
          <nav className="mb-8">
            <Breadcrumb
              items={[
                { label: invoicesT('breadcrumb.dashboard'), href: '/dashboard' },
                { label: invoicesT('breadcrumb.invoices'), href: '/invoices' },
                { label: t('breadcrumb.edit') },
              ]}
              className="text-xs text-muted-foreground"
            />
          </nav>
          <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-semibold mb-2">Facture introuvable</p>
            <p className="mb-4">La facture demandée n&apos;existe pas ou vous n&apos;avez pas les permissions pour la modifier.</p>
          </div>
        </div>
      </div>
    );
  }

  const canEdit = invoice.status === "draft" || invoice.status === "cancelled";
  if (!canEdit) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-muted/30 to-background">
        <div className="w-full px-4 py-8 sm:px-6 sm:py-10">
          <nav className="mb-8">
            <Breadcrumb
              items={[
                { label: invoicesT('breadcrumb.dashboard'), href: '/dashboard' },
                { label: invoicesT('breadcrumb.invoices'), href: '/invoices' },
                { label: invoice.invoiceNumber },
              ]}
              className="text-xs text-muted-foreground"
            />
          </nav>
          <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-semibold mb-2">Impossible de modifier cette facture</p>
            <p className="mb-4">Seules les factures en brouillon ou annulées peuvent être modifiées. Cette facture est actuellement en statut &quot;{invoice.status}&quot;.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ItemModalContext.Provider value={{ openCreate, openEdit, close: closeModal, mode: modalMode, item: currentItem }}>
      <div className="min-h-screen w-full bg-gradient-to-b from-muted/30 to-background">
        <div className="w-full px-4 py-8 pb-6 sm:px-6 sm:py-10">
          <nav className="mb-8">
            <Breadcrumb
              items={[
                { label: invoicesT('breadcrumb.dashboard'), href: '/dashboard' },
                { label: invoicesT('breadcrumb.invoices'), href: '/invoices' },
                { label: invoice.invoiceNumber, href: `/invoices/${invoiceId}` },
                { label: t('breadcrumb.edit') },
              ]}
              className="text-xs text-muted-foreground"
            />
          </nav>

          <header className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t('title')}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('description')}
            </p>
          </header>

          <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start">
            <div className="w-full order-1 xl:order-none">
              <Suspense
                fallback={
                  <div className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-xl bg-muted/60" />
                    <Skeleton className="h-48 w-full rounded-xl bg-muted/60" />
                  </div>
                }
              >
                <InvoiceDetails invoiceId={invoiceId} />
              </Suspense>
            </div>
            <div className="w-full order-2 xl:order-none relative min-h-[560px]">
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.35] rounded-2xl"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                    linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="relative z-10 p-6">
                <Preview invoiceId={invoiceId} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddItemModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitItem}
        initialItem={currentItem}
        mode={modalMode}
      />
    </ItemModalContext.Provider>
  );
};

export default InvoiceEditPage;
