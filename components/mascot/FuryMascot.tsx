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
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

const sizeMap = {
  xs: 32,
  sm: 80,
  md: 120,
  lg: 160,
  xl: 200,
};

/** Padding autour de l’image dans la bulle (par taille) */
const paddingMap = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
};

export function FuryMascot({
  mood,
  className,
  size = "md",
  animated = true,
}: FuryMascotProps) {
  const imageSize = sizeMap[size];
  const padding = paddingMap[size];
  const bubbleSize = imageSize + padding * 2;
  const imagePath = `/mascot/gifs/${mood}.gif` || `/mascot/fury_welcome.webp`;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center select-none",
        className
      )}
    >
      <div
        className={cn(
          "relative transition-transform duration-300 ease-out",
          animated && "animate-float"
        )}
      >
        {/* Ombre douce type Apple — pas de gros blur */}
        <div
          className="absolute rounded-full bg-black/[0.06] dark:bg-black/20"
          style={{
            width: bubbleSize,
            height: bubbleSize,
            bottom: -4,
            left: "50%",
            transform: "translateX(-50%)",
            filter: "blur(8px)",
          }}
        />

        {/* Bulle — dégradé discret, ring fin, ombres superposées */}
        <div
          className="relative rounded-full overflow-hidden bg-[#F9FBF8] dark:bg-white/95 shadow-[0_2px_12px_rgba(0,0,0,0.02),0_8px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.15)]"
          style={{
            width: bubbleSize,
            height: bubbleSize,
            padding,
          }}
        >
          <div className="w-full h-full flex items-center justify-center rounded-full">
            <Image
              src={imagePath}
              alt={`Fury ${mood}`}
              width={imageSize}
              height={imageSize}
              className="w-full h-full object-contain rounded-full"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
