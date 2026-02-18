'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import FileInput from '@/components/file-input';

const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

/** Contenu du dialog positionné en bas à droite */
const DialogContentBottomRight = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed right-6 bottom-6 left-auto top-auto z-[150] w-[340px] border bg-background p-4 shadow-xl rounded-xl',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:slide-out-to-right-4 data-[state=closed]:slide-out-to-bottom-4',
        'data-[state=open]:slide-in-from-right-4 data-[state=open]:slide-in-from-bottom-4',
        'duration-200',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className={cn(
          'absolute right-3 top-3 z-50 flex h-8 w-8 items-center justify-center rounded-lg',
          'opacity-70 ring-offset-background transition-opacity hover:opacity-100',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:pointer-events-none'
        )}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Fermer</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContentBottomRight.displayName = 'DialogContentBottomRight';

export interface LogoUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileChange: (files: FileList) => void | Promise<void>;
  title?: string;
}

export function LogoUploadModal({
  open,
  onOpenChange,
  onFileChange,
  title = 'Changer le logo',
}: LogoUploadModalProps) {
  const handleFileChange = async (files: FileList) => {
    await onFileChange(files);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentBottomRight className="pt-8">
        <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
        <p className="text-xs text-muted-foreground mb-3">
          PNG, JPEG, WebP ou GIF. Max 5 Mo.
        </p>
        <FileInput
          accept="image/jpeg, image/png, image/webp, image/gif"
          maxSizeInMB={5}
          className="w-full h-[180px]"
          onFileChange={handleFileChange}
        />
      </DialogContentBottomRight>
    </Dialog>
  );
}
