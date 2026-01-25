"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";

// Lazy load Recharts pour réduire le bundle initial
// Recharts est une bibliothèque lourde (~200KB), donc on la charge uniquement quand nécessaire

export const LazyBarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  {
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center text-muted-foreground">Chargement du graphique...</div>,
  }
) as ComponentType<any>;

export const LazyBar = dynamic(
  () => import("recharts").then((mod) => mod.Bar),
  { ssr: false }
) as ComponentType<any>;

export const LazyXAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false }
) as ComponentType<any>;

export const LazyYAxis = dynamic(
  () => import("recharts").then((mod) => mod.YAxis),
  { ssr: false }
) as ComponentType<any>;

export const LazyCartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false }
) as ComponentType<any>;

export const LazyTooltip = dynamic(
  () => import("recharts").then((mod) => mod.Tooltip),
  { ssr: false }
) as ComponentType<any>;

export const LazyResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  {
    ssr: false,
    loading: () => <div className="h-64 w-full" />,
  }
) as ComponentType<any>;

export const LazyPieChart = dynamic(
  () => import("recharts").then((mod) => mod.PieChart),
  {
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center text-muted-foreground">Chargement du graphique...</div>,
  }
) as ComponentType<any>;

export const LazyPie = dynamic(
  () => import("recharts").then((mod) => mod.Pie),
  { ssr: false }
) as ComponentType<any>;

export const LazyCell = dynamic(
  () => import("recharts").then((mod) => mod.Cell),
  { ssr: false }
) as ComponentType<any>;

export const LazyLineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  {
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center text-muted-foreground">Chargement du graphique...</div>,
  }
) as ComponentType<any>;

export const LazyLine = dynamic(
  () => import("recharts").then((mod) => mod.Line),
  { ssr: false }
) as ComponentType<any>;

export const LazyArea = dynamic(
  () => import("recharts").then((mod) => mod.Area),
  { ssr: false }
) as ComponentType<any>;

export const LazyAreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  {
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center text-muted-foreground">Chargement du graphique...</div>,
  }
) as ComponentType<any>;
