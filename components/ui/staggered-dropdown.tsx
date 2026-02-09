"use client";

import React, { createContext, useContext, useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const wrapperVariants = {
  open: {
    scaleY: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.04 },
  },
  closed: {
    scaleY: 0,
    transition: { when: "afterChildren", staggerChildren: 0.04 },
  },
};

const iconVariants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

type StaggeredDropdownContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement>;
};

const StaggeredDropdownContext = createContext<StaggeredDropdownContextValue | null>(null);

function useStaggeredDropdown() {
  const ctx = useContext(StaggeredDropdownContext);
  if (!ctx) throw new Error("StaggeredDropdown components must be used within StaggeredDropdown");
  return ctx;
}

interface StaggeredDropdownProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function StaggeredDropdown({
  children,
  open: controlledOpen,
  onOpenChange,
  className,
}: StaggeredDropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <StaggeredDropdownContext.Provider
      value={{ open, setOpen, triggerRef }}
    >
      <div className={cn("relative", className)}>{children}</div>
    </StaggeredDropdownContext.Provider>
  );
}

interface TriggerProps {
  children: React.ReactNode;
  className?: string;
}

function Trigger({ children, className }: TriggerProps) {
  const { open, setOpen, triggerRef } = useStaggeredDropdown();
  return (
    <div
      ref={triggerRef}
      role="button"
      tabIndex={0}
      className={cn("inline-flex cursor-pointer", className)}
      onClick={() => setOpen(!open)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen(!open);
        }
      }}
    >
      {children}
    </div>
  );
}

interface ContentProps {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  sideOffset?: number;
  className?: string;
}

function Content({
  children,
  align = "right",
  sideOffset = 4,
  className,
}: ContentProps) {
  const { open, setOpen, triggerRef } = useStaggeredDropdown();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        open &&
        contentRef.current &&
        !contentRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen, triggerRef]);

  const alignClass =
    align === "center"
      ? "left-1/2 -translate-x-1/2"
      : align === "right"
        ? "right-0"
        : "left-0";

  return (
    <motion.div
      ref={contentRef}
      initial={false}
      animate={open ? "open" : "closed"}
      variants={wrapperVariants}
      style={{ originY: 0, transformOrigin: "top" }}
      className={cn(
        "absolute z-50 overflow-hidden rounded-lg border bg-background shadow-lg",
        alignClass,
        `top-[calc(100%+${sideOffset}px)]`,
        "min-w-[12rem]",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

StaggeredDropdown.Trigger = Trigger;
StaggeredDropdown.Content = Content;

// Option item with optional icon and stagger (for simple action menus)
const itemVariants = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 0, y: -8 },
};

interface OptionProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

function Option({ children, onClick, className }: OptionProps) {
  const { setOpen } = useStaggeredDropdown();
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium text-foreground rounded-md hover:bg-muted transition-colors",
        className
      )}
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
    >
      {children}
    </motion.div>
  );
}

StaggeredDropdown.Option = Option;

export const staggeredDropdownIconVariants = iconVariants;
export const staggeredDropdownItemVariants = itemVariants;
