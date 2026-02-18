'use client';

import { useTranslations } from 'next-intl';
import { FaExternalLinkAlt } from 'react-icons/fa';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SignatureHelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignatureHelpModal({ open, onOpenChange }: SignatureHelpModalProps) {
  const t = useTranslations('settings.billing.signatureHelp');
  const commonT = useTranslations('common');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{t('methods.title')}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">1.</span>
                <div>
                  <p className="font-medium text-foreground mb-1">{t('methods.online.title')}</p>
                  <p className="mb-2">{t('methods.online.description')}</p>
                  <a
                    href="https://www.signature.io/fr/create-signature"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {t('methods.online.link')}
                    <FaExternalLinkAlt className="h-3 w-3" />
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">2.</span>
                <div>
                  <p className="font-medium text-foreground mb-1">{t('methods.draw.title')}</p>
                  <p className="mb-2">{t('methods.draw.description')}</p>
                  <a
                    href="https://www.signature-maker.com/fr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {t('methods.draw.link')}
                    <FaExternalLinkAlt className="h-3 w-3" />
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">3.</span>
                <div>
                  <p className="font-medium text-foreground mb-1">{t('methods.photo.title')}</p>
                  <p>{t('methods.photo.description')}</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-medium text-foreground mb-1">{t('tip.title')}</p>
            <p className="text-muted-foreground">{t('tip.description')}</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>{commonT('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
