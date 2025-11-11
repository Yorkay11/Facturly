"use client";

import InvoiceDetails from '@/components/containers/InvoiceDetails'
import Preview from '@/components/containers/Preview'
import { toast } from '@/hooks/use-toast'
import Breadcrumb from '@/components/ui/breadcrumb'
import { useState } from 'react'
import { ItemModalContext } from '@/contexts/ItemModalContext'
import { Item } from '@/types/items'
import { AddItemModal } from '@/components/smallComponents/AddItem'
import { useItemsStore } from '@/hooks/useItemStore'

const InvoiceBuilderPage = () => {
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
      toast.success({
        title: 'Ligne mise à jour',
        description: `${data.description} a été modifiée.`
      })
    } else {
      addItem(data)
      toast.success({
        title: 'Ligne ajoutée',
        description: `${data.description} a été ajoutée.`
      })
    }
  }

  const handleMockSave = () => {
    toast.success({
      title: "Brouillon enregistré",
      description: "Votre facture mock a bien été sauvegardée.",
    });
  };

  return (
    <ItemModalContext.Provider value={{ openCreate, openEdit, close: closeModal, mode: modalMode, item: currentItem }}>
      <div className='space-y-8 pb-10 lg:space-y-10'>
        <Breadcrumb
          items={[
            { label: "Tableau de bord", href: "/dashboard" },
            { label: "Factures", href: "/invoices" },
            { label: "Nouvelle facture" },
          ]}
          className='text-xs'
        />
        <div className='space-y-2 text-center lg:text-left'>
          <p className='text-2xl font-bold text-primary lg:text-3xl'>Créer une facture</p>
          <p className='text-sm text-foreground/70'>Complétez les informations et visualisez le rendu en temps réel.</p>
        </div>
        <div className='flex flex-col gap-8 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] xl:items-start'>
          <div className='w-full order-1 xl:order-none'>
            <InvoiceDetails />
          </div>
          <div className='w-full order-2 xl:order-none'>
            <Preview />
          </div>
        </div>
        <div className='flex justify-end'>
          <button
            onClick={handleMockSave}
            className='text-sm text-primary underline underline-offset-4'
          >
            Simuler une sauvegarde (toast)
          </button>
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

export default InvoiceBuilderPage
