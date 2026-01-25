"use client";

import { useEffect, useState } from "react";

const TABLET_BREAKPOINT_MIN = 768;
const TABLET_BREAKPOINT_MAX = 1024;

export const useIsTablet = () => {
  const [isTablet, setIsTablet] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }
    const width = window.innerWidth;
    return width >= TABLET_BREAKPOINT_MIN && width < TABLET_BREAKPOINT_MAX;
  });

  useEffect(() => {
    const handler = () => {
      const width = window.innerWidth;
      setIsTablet(width >= TABLET_BREAKPOINT_MIN && width < TABLET_BREAKPOINT_MAX);
    };

    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return isTablet;
};
