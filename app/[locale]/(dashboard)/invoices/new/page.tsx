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
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
// import { QuickInvoice } from '@/components/invoices/QuickInvoice'
import { InvoiceTutorial } from '@/components/invoices/InvoiceTutorial'
import { DirectionAwareTabs } from '@/components/ui/direction-aware-tabs'
import { useSearchParams } from 'next/navigation'
import { QuickInvoice } from '@/components/invoices/QuickInvoice';

const InvoiceBuilderPage = () => {
  const t = useTranslations('invoices.new');
  const invoicesT = useTranslations('invoices');
  const searchParams = useSearchParams();
  const fromOnboarding = searchParams?.get('from') === 'onboarding';
  const clientIdFromUrl = searchParams?.get('clientId') || undefined;
  const [isModalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [currentItem, setCurrentItem] = useState<Item | undefined>(undefined)
  const [invoiceMode, setInvoiceMode] = useState<'quick' | 'full'>('quick') // Mode rapide par défaut
  const [showTutorial, setShowTutorial] = useState(fromOnboarding) // Afficher le tutoriel si on vient de l'onboarding
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

  const handleMockSave = () => {
    toast.success({
      title: t('toasts.draftSaved'),
      description: t('toasts.draftSavedDescription'),
    });
  };

  return (
    <ItemModalContext.Provider value={{ openCreate, openEdit, close: closeModal, mode: modalMode, item: currentItem }}>
      <div className='space-y-4 pb-6 lg:space-y-5'>
        <div className="flex items-center space-x-1.5 text-[10px]">
          <Link 
            href="/dashboard" 
            onClick={(e) => {
              e.preventDefault()
              handleNavigation('/dashboard')
            }}
            className="text-foreground/60 hover:text-foreground"
          >
            {invoicesT('breadcrumb.dashboard')}
          </Link>
          <span className="text-foreground/40">/</span>
          <Link 
            href="/invoices" 
            onClick={(e) => {
              e.preventDefault()
              handleNavigation('/invoices')
            }}
            className="text-foreground/60 hover:text-foreground"
          >
            {invoicesT('breadcrumb.invoices')}
          </Link>
          <span className="text-foreground/40">/</span>
          <span className="text-foreground">{t('breadcrumb.newInvoice')}</span>
        </div>
        <div className='space-y-1 text-center lg:text-left'>
          <p className='text-xl font-bold text-primary lg:text-2xl'>{t('title')}</p>
          <p className='text-xs text-foreground/70'>{t('description')}</p>
        </div>

        {/* Toggle entre mode rapide et mode complet — pattern DirectionAwareTabs (id, label, content) */}
        <DirectionAwareTabs
          className="w-full mb-4"
          tabs={useMemo(
            () => [
              {
                id: 0,
                label: t("modes.quick"),
                content: (
                  <div className="w-full">
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
                  <div className="flex flex-col gap-3 xl:grid xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start">
                    <div className="w-full order-1 xl:order-none">
                      <Suspense
                        fallback={
                          <div className="space-y-3">
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-48 w-full" />
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
                    <div className="w-full order-2 xl:order-none relative p-4 rounded-lg bg-muted/50 min-h-[600px]">
                      <div
                        className="absolute inset-0 rounded-lg pointer-events-none border-border"
                        style={{
                          backgroundImage: `
                            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                          `,
                          backgroundSize: "24px 24px",
                          opacity: 0.5,
                        }}
                      />
                      <div
                        className="absolute inset-0 rounded-lg pointer-events-none"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle, hsl(var(--muted-foreground) / 0.4) 1.5px, transparent 1.5px)",
                          backgroundSize: "20px 20px",
                          opacity: 0.4,
                        }}
                      />
                      <div className="relative z-10">
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
