"use client";

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import InvoiceDetails from '@/components/containers/InvoiceDetails'
import Preview from '@/components/containers/Preview'
import Breadcrumb from '@/components/ui/breadcrumb'
import { useState } from 'react'
import { ItemModalContext } from '@/contexts/ItemModalContext'
import { Item } from '@/types/items'
import { AddItemModal } from '@/components/smallComponents/AddItem'
import { useItemsStore } from '@/hooks/useItemStore'
import Skeleton from '@/components/ui/skeleton'
import { useGetInvoiceByIdQuery } from '@/services/facturlyApi'

const InvoiceEditPage = () => {
  const params = useParams();
  const invoiceId = typeof params?.id === "string" && params.id !== "undefined" && params.id.trim() !== "" 
    ? params.id 
    : undefined;

  const { data: invoice, isLoading: isLoadingInvoice, isError: isErrorInvoice } = useGetInvoiceByIdQuery(
    invoiceId || "",
    { skip: !invoiceId }
  );

  const [isModalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [currentItem, setCurrentItem] = useState<Item | undefined>(undefined)
  const { addItem, updateItem } = useItemsStore()

  const openCreate = () => {
    setCurrentItem(undefined)
    setModalMode('create')
    setModalOpen(true)
  }

  const openEdit = (item: Item) => {
    setCurrentItem(item)
    setModalMode('edit')
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)

  const handleSubmitItem = (data: Omit<Item, 'id'>, existingId?: string) => {
    if (existingId) {
      updateItem(existingId, data)
    } else {
      addItem(data)
    }
  }

  if (!invoiceId) {
    return (
      <div className="space-y-4">
        <Breadcrumb
          items={[
            { label: "Tableau de bord", href: "/dashboard" },
            { label: "Factures", href: "/invoices" },
            { label: "Modifier" },
          ]}
          className="text-xs"
        />
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold mb-2">ID de facture invalide</p>
          <p className="mb-4">L&apos;identifiant de la facture est manquant ou invalide.</p>
        </div>
      </div>
    )
  }

  if (isLoadingInvoice) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="space-y-4">
        <Breadcrumb
          items={[
            { label: "Tableau de bord", href: "/dashboard" },
            { label: "Factures", href: "/invoices" },
            { label: "Modifier" },
          ]}
          className="text-xs"
        />
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold mb-2">Facture introuvable</p>
          <p className="mb-4">La facture demandée n&apos;existe pas ou vous n&apos;avez pas les permissions pour la modifier.</p>
        </div>
      </div>
    )
  }

  // Vérifier que la facture est en brouillon
  if (invoice.status !== "draft") {
    return (
      <div className="space-y-4">
        <Breadcrumb
          items={[
            { label: "Tableau de bord", href: "/dashboard" },
            { label: "Factures", href: "/invoices" },
            { label: invoice.invoiceNumber },
          ]}
          className="text-xs"
        />
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold mb-2">Impossible de modifier cette facture</p>
          <p className="mb-4">Seules les factures en brouillon peuvent être modifiées. Cette facture est actuellement en statut &quot;{invoice.status}&quot;.</p>
        </div>
      </div>
    )
  }

  return (
    <ItemModalContext.Provider value={{ openCreate, openEdit, close: closeModal, mode: modalMode, item: currentItem }}>
      <div className='space-y-8 pb-10 lg:space-y-10'>
        <Breadcrumb
          items={[
            { label: "Tableau de bord", href: "/dashboard" },
            { label: "Factures", href: "/invoices" },
            { label: invoice.invoiceNumber, href: `/invoices/${invoiceId}` },
            { label: "Modifier" },
          ]}
          className='text-xs'
        />
        <div className='space-y-2 text-center lg:text-left'>
          <p className='text-2xl font-bold text-primary lg:text-3xl'>Modifier la facture</p>
          <p className='text-sm text-foreground/70'>Modifiez les informations et visualisez le rendu en temps réel.</p>
        </div>
        <div className='flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] xl:items-start'>
          <div className='w-full order-1 xl:order-none'>
            <Suspense fallback={<div className="space-y-4"><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div>}>
              <InvoiceDetails invoiceId={invoiceId} />
            </Suspense>
          </div>
          <div className='w-full order-2 xl:order-none'>
            <Preview invoiceId={invoiceId} />
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
  )
}

export default InvoiceEditPage

