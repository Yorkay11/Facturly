"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export type FuryMood = 
  | "welcome"
  | "happy"
  | "smile"
  | "sad"
  | "angry"
  | "focus"
  | "reminder"
  | "security"
  | "sleepy";

interface FuryMascotProps {
  mood: FuryMood;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

const sizeMap = {
  sm: 80,
  md: 120,
  lg: 160,
  xl: 200,
};

export function FuryMascot({ 
  mood, 
  className,
  size = "md",
  animated = true 
}: FuryMascotProps) {
  const imageSize = sizeMap[size];
  const imagePath = `/mascot/fury_${mood}.webp`;

  return (
    <div 
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
    >
      {/* Bulle flottante avec animation */}
      <div 
        className={cn(
          "relative",
          animated && "animate-float"
        )}
      >
        {/* Ombre portée pour effet de profondeur */}
        <div className="absolute inset-0 translate-y-1 rounded-full bg-black/10 blur-xl" />
        
        {/* Bulle principale */}
        <div 
          className="relative rounded-full bg-gradient-to-br from-white via-white to-slate-50 shadow-lg ring-2 ring-white/50 overflow-hidden"
          style={{
            width: `${imageSize + 24}px`,
            height: `${imageSize + 24}px`,
            padding: '12px'
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <Image
              src={imagePath}
              alt={`Fury ${mood}`}
              width={imageSize}
              height={imageSize}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
