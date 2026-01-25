"use client";

import { useState, useRef, TouchEvent } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Send, CreditCard, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SwipeableInvoiceRowProps {
  children: React.ReactNode;
  onSwipeSend?: () => void;
  onSwipePay?: () => void;
  onSwipeDelete?: () => void;
  canSend?: boolean;
  canPay?: boolean;
  canDelete?: boolean;
  className?: string;
}

const SWIPE_THRESHOLD = 100; // Minimum distance to trigger swipe
const SWIPE_VELOCITY_THRESHOLD = 0.3; // Minimum velocity for quick swipe

export function SwipeableInvoiceRow({
  children,
  onSwipeSend,
  onSwipePay,
  onSwipeDelete,
  canSend = true,
  canPay = true,
  canDelete = true,
  className,
}: SwipeableInvoiceRowProps) {
  const isMobile = useIsMobile();
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!isMobile) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
    setIsSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isMobile || !isSwiping) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchStartX.current;
    
    // Limit swipe to left only (negative values)
    if (deltaX < 0) {
      setSwipeOffset(Math.max(deltaX, -200)); // Max swipe distance
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile || !isSwiping) return;
    
    const swipeDistance = Math.abs(swipeOffset);
    const swipeDuration = Date.now() - touchStartTime.current;
    const swipeVelocity = swipeDistance / swipeDuration;
    
    // Determine action based on swipe distance and velocity
    if (swipeDistance > SWIPE_THRESHOLD || swipeVelocity > SWIPE_VELOCITY_THRESHOLD) {
      if (swipeOffset < -SWIPE_THRESHOLD * 2 && canPay && onSwipePay) {
        // Swipe far left = Pay
        onSwipePay();
      } else if (swipeOffset < -SWIPE_THRESHOLD && canSend && onSwipeSend) {
        // Swipe left = Send
        onSwipeSend();
      } else if (swipeOffset < -SWIPE_THRESHOLD * 1.5 && canDelete && onSwipeDelete) {
        // Swipe very far left = Delete (if no pay action)
        if (!canPay) {
          onSwipeDelete();
        }
      }
    }
    
    // Reset
    setSwipeOffset(0);
    setIsSwiping(false);
  };

  // Don't apply swipe on desktop
  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Action buttons (revealed on swipe) */}
      <div
        className={cn(
          "absolute right-0 top-0 h-full flex items-center gap-2 pr-4 transition-transform duration-200",
          swipeOffset < 0 ? "translate-x-0" : "translate-x-full"
        )}
        style={{ transform: `translateX(${Math.abs(swipeOffset)}px)` }}
      >
        {canSend && onSwipeSend && (
          <Button
            size="icon"
            className="h-10 w-10 bg-primary text-primary-foreground rounded-full shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onSwipeSend();
              setSwipeOffset(0);
            }}
          >
            <Send className="h-5 w-5" />
          </Button>
        )}
        {canPay && onSwipePay && (
          <Button
            size="icon"
            className="h-10 w-10 bg-emerald-600 text-white rounded-full shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onSwipePay();
              setSwipeOffset(0);
            }}
          >
            <CreditCard className="h-5 w-5" />
          </Button>
        )}
        {canDelete && onSwipeDelete && !canPay && (
          <Button
            size="icon"
            variant="destructive"
            className="h-10 w-10 rounded-full shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onSwipeDelete();
              setSwipeOffset(0);
            }}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Main content (slides on swipe) */}
      <div
        className={cn(
          "transition-transform duration-200 bg-background",
          swipeOffset < 0 && "translate-x-[-80px]"
        )}
        style={{
          transform: swipeOffset < 0 ? `translateX(${swipeOffset}px)` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
