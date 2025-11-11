'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Item } from '@/types/items';

interface ItemsState {
  items: Item[]; 
  addItem: (newItem: Omit<Item, 'id'>) => void; 
  updateItem: (id: string, data: Partial<Omit<Item, 'id'>>) => void;
  removeItem: (id: string) => void;
  clearItems: () => void; 
  setItems: (newItems: Item[]) => void; 
}

export const useItemsStore = create<ItemsState>((set) => ({
  items: [],

  addItem: (newItem) =>
    set((state) => ({
      items: [...state.items, { ...newItem, id: uuidv4() }],
    })),

  updateItem: (id, data) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...data } : item
      ),
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  clearItems: () => set({ items: [] }),

  setItems: (newItems) => set({ items: newItems }), 
}));
