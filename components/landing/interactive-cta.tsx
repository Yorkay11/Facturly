'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconMail, IconX } from '@tabler/icons-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface NavigationLink {
  href: string;
  text: string;
  icon?: React.ReactNode;
  target?: '_self' | '_blank' | '_parent' | '_top';
}

export interface InteractiveCTAProps {
  heading?: string;
  subheading?: string;
  navigationLinks?: NavigationLink[];
  initialOpen?: boolean;
  className?: string;
}

const DEFAULT_NAVIGATION_LINKS: NavigationLink[] = [
  {
    href: 'mailto:support@facturly.online',
    text: 'Nous contacter',
    icon: <IconMail size={16} />,
    target: '_blank'
  }
];

const InteractiveCTA = ({
  heading = 'Besoin d\'aide ?',
  subheading = 'Contactez-nous',
  navigationLinks = DEFAULT_NAVIGATION_LINKS,
  initialOpen = false,
  className
}: InteractiveCTAProps) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <div className={cn('fixed z-50 bottom-4 right-4', className)}>
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="open-btn"
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
            aria-label="Ouvrir le menu contact"
          >
            <IconMail size={24} />
          </motion.button>
        ) : (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-xl w-72"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{heading}</p>
                <p className="text-base font-semibold text-foreground">{subheading}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Fermer"
              >
                <IconX size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {navigationLinks.map((link, index) => (
                <Link key={index} href={link.href} target={link.target ?? '_blank'}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                  >
                    {link.icon}
                    {link.text}
                  </Button>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveCTA;
