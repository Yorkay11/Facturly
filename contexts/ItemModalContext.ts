"use client";

import { Item } from "@/types/items";
import { createContext, useContext } from "react";

type ItemModalMode = "create" | "edit";

export interface ItemModalControls {
  openCreate: () => void;
  openEdit: (item: Item) => void;
  close: () => void;
  mode: ItemModalMode;
  item?: Item;
}

export const ItemModalContext = createContext<ItemModalControls | null>(null);

export const useItemModalControls = () => {
  const ctx = useContext(ItemModalContext);
  if (!ctx) {
    throw new Error("useItemModalControls must be used within ItemModalContext provider");
  }
  return ctx;
};
