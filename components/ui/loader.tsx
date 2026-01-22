"use client";

import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Loader({ className, size = "md" }: LoaderProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const strokeWidth = {
    sm: 2,
    md: 2.5,
    lg: 3,
  };

  return (
    <svg
      className={cn("animate-spin", sizeClasses[size], className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={strokeWidth[size]}
        strokeOpacity="0.15"
        className="text-current"
      />
      <path
        d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12"
        stroke="currentColor"
        strokeWidth={strokeWidth[size]}
        strokeLinecap="round"
        strokeDasharray="62.83"
        strokeDashoffset="47.12"
        className="text-current animate-spinner-arc"
      />
    </svg>
  );
}

