"use client";

import { Suspense, useEffect, useMemo } from 'react';
import InvoiceDetails from '@/components/containers/InvoiceDetails'
import Preview from '@/components/containers/Preview'
import { toast } from '@/hooks/use-toast'
import { useState } from 'react'
import { ItemModalContext } from '@/contexts/ItemModalContext'
import { Item } from '@/types/items'
import { AddItemModal } from '@/components/smallComponents/AddItem'
import { useItemsStore } from '@/hooks/useItemStore'
import { useInvoiceMetadata } from '@/hooks/useInvoiceMetadata'
import Skeleton from '@/components/ui/skeleton'
import { useNavigationBlock } from '@/contexts/NavigationBlockContext'
import { useTranslations } from 'next-intl'
import { InvoiceTutorial } from '@/components/invoices/InvoiceTutorial'
import { DirectionAwareTabs } from '@/components/ui/direction-aware-tabs'
import { useSearchParams } from 'next/navigation'
import { QuickInvoice } from '@/components/invoices/QuickInvoice'
import Breadcrumb from '@/components/ui/breadcrumb'

const InvoiceBuilderPage = () => {
  const t = useTranslations('invoices.new');
  const invoicesT = useTranslations('invoices');
  const searchParams = useSearchParams();
  const fromCreateWorkspace = searchParams?.get('from') === 'create-workspace' || searchParams?.get('from') === 'onboarding';
  const clientIdFromUrl = searchParams?.get('clientId') || undefined;
  const [isModalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [currentItem, setCurrentItem] = useState<Item | undefined>(undefined)
  const [invoiceMode, setInvoiceMode] = useState<'quick' | 'full'>('quick') // Mode rapide par défaut
  const [showTutorial, setShowTutorial] = useState(fromCreateWorkspace) // Afficher le tutoriel si on vient de create-workspace
  const { addItem, updateItem, clearItems } = useItemsStore()
  const { reset: resetMetadata } = useInvoiceMetadata()
  
  // Utiliser le contexte de navigation pour gérer les modifications non sauvegardées
  const {
    setHasUnsavedChanges,
    saveDraftRef,
    handleNavigation,
  } = useNavigationBlock()

  // Réinitialiser les stores quand on entre sur la page de création
  // Cela évite que les données précédentes persistent
  useEffect(() => {
    resetMetadata()
    clearItems()
    setHasUnsavedChanges(false)
    
    // Vérifier si le tutoriel a déjà été complété
    const tutorialCompleted = localStorage.getItem('invoiceTutorialCompleted');
    if (tutorialCompleted === 'true') {
      setShowTutorial(false);
    }
  }, [resetMetadata, clearItems, setHasUnsavedChanges])

  // Gérer la sauvegarde du brouillon depuis InvoiceDetails
  const handleSaveDraftReady = (saveFunction: (skipRedirect?: boolean) => Promise<void>) => {
    saveDraftRef.current = saveFunction
  }

  // Détecter les modifications non sauvegardées depuis InvoiceDetails
  const handleHasUnsavedChanges = (hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges)
  }

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
        title: t('toasts.itemUpdated'),
        description: t('toasts.itemUpdatedDescription', { description: data.description })
      })
    } else {
      addItem(data)
      toast.success({
        title: t('toasts.itemAdded'),
        description: t('toasts.itemAddedDescription', { description: data.description })
      })
    }
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
                { label: t('breadcrumb.newInvoice') },
              ]}
              className="text-xs text-muted-foreground"
            />
          </nav>

          <header className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {t('title')}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{t('description')}</p>
              </div>
            </div>
          </header>

          {/* Tabs: mode rapide / mode complet */}
          <div className="space-y-6">
            <DirectionAwareTabs
              className="w-full"
              tabs={useMemo(
                () => [
                  {
                    id: 0,
                    label: t("modes.quick"),
                    content: (
                      <div className="w-full pt-2">
                        <QuickInvoice
                          onSwitchToFullMode={() => setInvoiceMode("full")}
                          initialClientId={clientIdFromUrl}
                        />
                        {showTutorial && (
                          <InvoiceTutorial
                            onComplete={() => {
                              setShowTutorial(false);
                              localStorage.setItem("invoiceTutorialCompleted", "true");
                            }}
                            onSkip={() => {
                              setShowTutorial(false);
                              localStorage.setItem("invoiceTutorialCompleted", "true");
                            }}
                          />
                        )}
                      </div>
                    ),
                  },
                  {
                    id: 1,
                    label: t("modes.full"),
                    content: (
                      <div className="w-full pt-2 flex flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start">
                        <div className="w-full order-1 xl:order-none">
                          <Suspense
                            fallback={
                              <div className="space-y-3">
                                <Skeleton className="h-48 w-full rounded-xl bg-muted/60" />
                                <Skeleton className="h-48 w-full rounded-xl bg-muted/60" />
                              </div>
                            }
                          >
                            <InvoiceDetails
                              initialRecurring={searchParams?.get("recurring") === "1"}
                              onSaveDraftReady={handleSaveDraftReady}
                              onHasUnsavedChanges={handleHasUnsavedChanges}
                            />
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
                              backgroundSize: "20px 20px",
                            }}
                          />
                          <div className="relative z-10 p-6">
                            <Preview />
                          </div>
                        </div>
                      </div>
                    ),
                  },
                ],
                [t, showTutorial, searchParams]
              )}
              value={invoiceMode === "quick" ? 0 : 1}
              onValueChange={(id) => setInvoiceMode(id === 0 ? "quick" : "full")}
            />
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

export default InvoiceBuilderPage
