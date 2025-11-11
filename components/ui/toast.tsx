"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from "lucide-react";

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

export const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border border-primary/30 bg-white text-foreground",
        destructive:
          "destructive group border border-accent/50 bg-accent text-accent-foreground",
        success: "border border-emerald-200 bg-emerald-50 text-emerald-700",
        info: "border border-primary/40 bg-primary/10 text-primary",
        warning: "border border-amber-200 bg-amber-50 text-amber-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type ToastVariant = NonNullable<VariantProps<typeof toastVariants>["variant"]>;

const icons: Record<ToastVariant, React.ReactNode> = {
  default: null,
  destructive: <XCircle className="h-5 w-5" />,
  success: <CheckCircle2 className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
  warning: <TriangleAlert className="h-5 w-5" />,
};

type ToastProps = React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
  variant?: ToastVariant;
};

type ToastActionElement = React.ReactElement<typeof ToastAction>;

const ToastComponent = React.forwardRef<HTMLLIElement, ToastProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <ToastPrimitives.Root
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <div className="flex w-full items-start gap-3">
          {variant !== "default" ? (
            <div className="mt-0.5 flex-shrink-0 text-inherit">
              {icons[variant]}
            </div>
          ) : null}
          <div className="flex-1 space-y-1 text-left">{props.children}</div>
        </div>
        <ToastClose className="absolute right-2 top-2 rounded-full bg-transparent p-1 text-foreground/60 transition hover:bg-foreground/10" />
      </ToastPrimitives.Root>
    )
  }
)
ToastComponent.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold [&+div]:text-xs", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

export {
  ToastProvider,
  ToastViewport,
  ToastComponent as Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  type ToastProps,
  type ToastActionElement,
}
