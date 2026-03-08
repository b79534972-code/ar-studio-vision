/**
 * Room Editor Types
 */

export interface FurnitureItem {
  id: string;
  name: string;
  category: "sofa" | "chair" | "table" | "storage" | "bed" | "lamp" | "plant" | "rug" | "shelf";
  style: "modern" | "scandinavian" | "minimalist" | "industrial" | "japanese";
  material: string;
  color: string;
  dimensions: { width: number; height: number; depth: number };
  thumbnail?: string;
  /** URL to .glb/.gltf model for WebXR & Desktop viewer */
  modelUrl?: string;
  /** URL to .usdz model for iOS AR Quick Look */
  usdzUrl?: string;
  tags: string[];
  favorited?: boolean;
}

export interface PlacedObject {
  id: string;
  furnitureId: string;
  name: string;
  category: FurnitureItem["category"];
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  dimensions: { width: number; height: number; depth: number };
}

export interface RoomConfig {
  width: number;
  depth: number;
  height: number;
  wallColor: string;
  floorColor: string;
}

export interface AILayoutSuggestion {
  id: string;
  name: string;
  style: string;
  score: number;
  description: string;
  objects: PlacedObject[];
  thumbnail?: string;
}
