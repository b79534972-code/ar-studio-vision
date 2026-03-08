import { useSyncExternalStore } from "react";
import { roomStore } from "@/stores/roomStore";

export function useRoomStore() {
  const rooms = useSyncExternalStore(roomStore.subscribe, roomStore.getRooms);
  const layouts = useSyncExternalStore(roomStore.subscribe, roomStore.getLayouts);

  return {
    rooms,
    layouts,
    addRoom: roomStore.addRoom,
    updateRoom: roomStore.updateRoom,
    removeRoom: roomStore.removeRoom,
    saveLayout: roomStore.saveLayout,
    removeLayout: roomStore.removeLayout,
    getLayoutsForRoom: roomStore.getLayoutsForRoom,
  };
}
