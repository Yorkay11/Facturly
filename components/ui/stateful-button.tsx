"use client";

import { AnimatePresence, motion } from "motion/react";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FaSpinner } from "react-icons/fa6";
import { Check, X } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  status?: "idle" | "loading" | "success" | "error";
}

export const StatefulButton = ({
  className,
  children,
  onClick,
  isLoading: externalIsLoading,
  status: externalStatus,
  ...props
}: ButtonProps) => {
  const [internalStatus, setInternalStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Sync internal state with external props if provided
  useEffect(() => {
    if (externalStatus) {
      setInternalStatus(externalStatus);
    } else if (externalIsLoading !== undefined) {
      setInternalStatus(externalIsLoading ? "loading" : "idle");
    }
  }, [externalStatus, externalIsLoading]);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // If external control is used, just call onClick
    if (externalStatus !== undefined || externalIsLoading !== undefined) {
      onClick?.(event);
      return;
    }

    // Otherwise handle internal state logic
    if (onClick) {
      setInternalStatus("loading");
      try {
        await onClick(event);
        setInternalStatus("success");
        setTimeout(() => {
          setInternalStatus("idle");
        }, 2000);
      } catch (error) {
        setInternalStatus("error");
        setTimeout(() => {
          setInternalStatus("idle");
        }, 2000);
      }
    }
  };

  return (
    <button
      disabled={internalStatus === "loading" || props.disabled}
      className={cn(
        "relative rounded-lg px-6 py-2 font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70",
        internalStatus === "idle" && "bg-primary text-primary-foreground hover:bg-primary/90",
        internalStatus === "loading" && "bg-primary text-primary-foreground cursor-wait",
        internalStatus === "success" && "bg-emerald-500 text-white hover:bg-emerald-600",
        internalStatus === "error" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={internalStatus}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          className="flex items-center justify-center gap-2"
        >
          {internalStatus === "loading" && (
            <FaSpinner className="h-4 w-4 animate-spin" />
          )}
          {internalStatus === "success" && (
            <Check className="h-4 w-4" />
          )}
          {internalStatus === "error" && (
            <X className="h-4 w-4" />
          )}
          <span>
            {internalStatus === "idle" && children}
            {internalStatus === "loading" && children}
            {internalStatus === "success" && "Envoyé !"}
            {internalStatus === "error" && "Erreur"}
          </span>
        </motion.div>
      </AnimatePresence>
    </button>
  );
};
