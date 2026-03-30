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

export interface LayoutSnapshot {
  id: string;
  objects: PlacedObject[];
  savedAt: string;
}

export interface SavedLayout {
  id: string;
  roomId: string;
  name: string;
  objects: PlacedObject[];
  history: LayoutSnapshot[];
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
  if (storedLayouts) {
    layouts = JSON.parse(storedLayouts).map((l: any) => ({
      ...l,
      history: l.history || [],
    }));
  }
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
    const existing = layouts.find((l) => l.roomId === roomId && l.name === name);
    if (existing) {
      // Push current state to history before overwriting
      const snapshot: LayoutSnapshot = {
        id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        objects: existing.objects,
        savedAt: existing.updatedAt,
      };
      const updated: SavedLayout = {
        ...existing,
        objects,
        history: [...existing.history, snapshot],
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
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    layouts = [...layouts, layout];
    persist();
    notify();
    return layout;
  },

  restoreSnapshot: (layoutId: string, snapshotId: string) => {
    const layout = layouts.find((l) => l.id === layoutId);
    if (!layout) return;
    const snapshot = layout.history.find((s) => s.id === snapshotId);
    if (!snapshot) return;

    // Save current state to history before restoring
    const currentSnap: LayoutSnapshot = {
      id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      objects: layout.objects,
      savedAt: layout.updatedAt,
    };
    const updated: SavedLayout = {
      ...layout,
      objects: snapshot.objects,
      history: [...layout.history, currentSnap],
      updatedAt: new Date().toISOString(),
    };
    layouts = layouts.map((l) => (l.id === layoutId ? updated : l));
    persist();
    notify();
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
