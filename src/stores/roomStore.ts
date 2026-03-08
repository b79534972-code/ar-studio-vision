/**
 * Saved Room & Layout Store — persists rooms and their layouts in localStorage.
 */

import type { PlacedObject, RoomConfig } from "@/types/editor";

export interface SavedRoom {
  id: string;
  name: string;
  config: RoomConfig;
  createdAt: string;
  updatedAt: string;
}

export interface SavedLayout {
  id: string;
  roomId: string;
  name: string;
  objects: PlacedObject[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

type Listener = () => void;

const listeners = new Set<Listener>();
let rooms: SavedRoom[] = [];
let layouts: SavedLayout[] = [];

// Load from localStorage
try {
  const storedRooms = localStorage.getItem("saved-rooms");
  if (storedRooms) rooms = JSON.parse(storedRooms);
  const storedLayouts = localStorage.getItem("saved-layouts");
  if (storedLayouts) layouts = JSON.parse(storedLayouts);
} catch { /* ignore */ }

function persist() {
  try {
    localStorage.setItem("saved-rooms", JSON.stringify(rooms));
    localStorage.setItem("saved-layouts", JSON.stringify(layouts));
  } catch { /* storage full */ }
}

function notify() {
  listeners.forEach((l) => l());
}

export const roomStore = {
  getRooms: () => rooms,
  getLayouts: () => layouts,

  getLayoutsForRoom: (roomId: string) => layouts.filter((l) => l.roomId === roomId),

  addRoom: (name: string, config: RoomConfig): SavedRoom => {
    const room: SavedRoom = {
      id: `room-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    rooms = [...rooms, room];
    persist();
    notify();
    return room;
  },

  updateRoom: (id: string, updates: Partial<Pick<SavedRoom, "name" | "config">>) => {
    rooms = rooms.map((r) =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    );
    persist();
    notify();
  },

  removeRoom: (id: string) => {
    rooms = rooms.filter((r) => r.id !== id);
    layouts = layouts.filter((l) => l.roomId !== id);
    persist();
    notify();
  },

  saveLayout: (roomId: string, name: string, objects: PlacedObject[]): SavedLayout => {
    // Check if layout with same name for this room exists → update version
    const existing = layouts.find((l) => l.roomId === roomId && l.name === name);
    if (existing) {
      const updated: SavedLayout = {
        ...existing,
        objects,
        version: existing.version + 1,
        updatedAt: new Date().toISOString(),
      };
      layouts = layouts.map((l) => (l.id === existing.id ? updated : l));
      persist();
      notify();
      return updated;
    }

    const layout: SavedLayout = {
      id: `layout-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      roomId,
      name,
      objects,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    layouts = [...layouts, layout];
    persist();
    notify();
    return layout;
  },

  removeLayout: (id: string) => {
    layouts = layouts.filter((l) => l.id !== id);
    persist();
    notify();
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
