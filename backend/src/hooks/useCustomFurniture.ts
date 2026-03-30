import { useSyncExternalStore } from "react";
import { customFurnitureStore } from "@/stores/customFurnitureStore";

export function useCustomFurniture() {
  const items = useSyncExternalStore(
    customFurnitureStore.subscribe,
    customFurnitureStore.getItems
  );

  return {
    customItems: items,
    addItem: customFurnitureStore.addItem,
    removeItem: customFurnitureStore.removeItem,
  };
}
