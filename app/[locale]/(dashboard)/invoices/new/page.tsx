"use client";

import { Suspense, useEffect } from 'react';
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
import { QuickInvoice } from '@/components/invoices/QuickInvoice'
import { InvoiceTutorial } from '@/components/invoices/InvoiceTutorial'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Zap, FileText } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

const InvoiceBuilderPage = () => {
  const t = useTranslations('invoices.new');
  const invoicesT = useTranslations('invoices');
  const searchParams = useSearchParams();
  const fromOnboarding = searchParams?.get('from') === 'onboarding';
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
      <div className='space-y-8 pb-10 lg:space-y-10'>
        <div className="flex items-center space-x-2 text-xs">
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
        <div className='space-y-2 text-center lg:text-left'>
          <p className='text-2xl font-bold text-primary lg:text-3xl'>{t('title')}</p>
          <p className='text-sm text-foreground/70'>{t('description')}</p>
        </div>

        {/* Toggle entre mode rapide et mode complet */}
        <Tabs value={invoiceMode} onValueChange={(value) => setInvoiceMode(value as 'quick' | 'full')} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="quick" className="gap-2">
              <Zap className="h-4 w-4" />
              {t('modes.quick')}
            </TabsTrigger>
            <TabsTrigger value="full" className="gap-2">
              <FileText className="h-4 w-4" />
              {t('modes.full')}
            </TabsTrigger>
          </TabsList>

          {/* Mode Rapide */}
          <TabsContent value="quick" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <QuickInvoice onSwitchToFullMode={() => setInvoiceMode('full')} />
              {showTutorial && (
                <InvoiceTutorial
                  onComplete={() => {
                    setShowTutorial(false);
                    // Sauvegarder dans localStorage que le tutoriel a été complété
                    localStorage.setItem('invoiceTutorialCompleted', 'true');
                  }}
                  onSkip={() => {
                    setShowTutorial(false);
                    localStorage.setItem('invoiceTutorialCompleted', 'true');
                  }}
                />
              )}
            </div>
          </TabsContent>

          {/* Mode Complet */}
          <TabsContent value="full" className="mt-6">
            <div className='flex flex-col gap-8 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] xl:items-start'>
              <div className='w-full order-1 xl:order-none'>
                <Suspense fallback={<div className="space-y-4"><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div>}>
                  <InvoiceDetails 
                    onSaveDraftReady={handleSaveDraftReady}
                    onHasUnsavedChanges={handleHasUnsavedChanges}
                  />
                </Suspense>
              </div>
              <div className='w-full order-2 xl:order-none'>
                <Preview />
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
