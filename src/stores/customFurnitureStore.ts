/**
 * Custom Furniture Store — holds user-generated furniture items across the app.
 * Uses a simple pub/sub pattern so FurnitureLibrary can react to new items.
 */

import type { FurnitureItem } from "@/types/editor";

type Listener = () => void;

const listeners = new Set<Listener>();
let items: FurnitureItem[] = [];

// Load from localStorage on init
try {
  const stored = localStorage.getItem("custom-furniture");
  if (stored) items = JSON.parse(stored);
} catch { /* ignore */ }

function persist() {
  try {
    localStorage.setItem("custom-furniture", JSON.stringify(items));
  } catch { /* storage full */ }
}

export const customFurnitureStore = {
  getItems: () => items,

  addItem: (item: FurnitureItem) => {
    items = [...items, item];
    persist();
    listeners.forEach((l) => l());
  },

  removeItem: (id: string) => {
    items = items.filter((i) => i.id !== id);
    persist();
    listeners.forEach((l) => l());
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
