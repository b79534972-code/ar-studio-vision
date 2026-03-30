import type { FurnitureItem } from "@/types/editor";

/**
 * FURNITURE_CATALOG — Thư viện nội thất mặc định
 * 
 * Thay toàn bộ danh sách bên dưới bằng furniture thật của bạn khi deploy.
 * Mỗi item cần đầy đủ: id, name, category, style, material, color, dimensions (m), tags.
 * Custom furniture do user upload sẽ tự động merge vào từ customFurnitureStore.
 */
export const FURNITURE_CATALOG: FurnitureItem[] = [
  { id: "sofa-1", name: "Modern Sectional", category: "sofa", style: "modern", material: "Fabric", color: "#6B7280", dimensions: { width: 2.4, height: 0.85, depth: 1.0 }, modelUrl: "/models/sofa-1.glb", usdzUrl: "/models/sofa-1.usdz", tags: ["seating", "large"], favorited: false },
  { id: "sofa-2", name: "Scandinavian Loveseat", category: "sofa", style: "scandinavian", material: "Linen", color: "#D1D5DB", dimensions: { width: 1.6, height: 0.8, depth: 0.85 }, modelUrl: "/models/sofa-2.glb", usdzUrl: "/models/sofa-2.usdz", tags: ["seating", "compact"], favorited: true },
  { id: "chair-1", name: "Accent Chair", category: "chair", style: "modern", material: "Velvet", color: "#4F46E5", dimensions: { width: 0.7, height: 0.85, depth: 0.7 }, modelUrl: "/models/chair-1.glb", usdzUrl: "/models/chair-1.usdz", tags: ["seating", "accent"], favorited: false },
  { id: "chair-3", name: "Office Chair", category: "chair", style: "modern", material: "Mesh", color: "#374151", dimensions: { width: 0.6, height: 1.1, depth: 0.6 }, modelUrl: "/models/chair-3.glb", usdzUrl: "/models/chair-3.usdz", tags: ["office", "ergonomic"], favorited: true },
  { id: "table-2", name: "Dining Table", category: "table", style: "scandinavian", material: "Oak", color: "#B45309", dimensions: { width: 1.8, height: 0.75, depth: 0.9 }, modelUrl: "/models/table-2.glb", usdzUrl: "/models/table-2.usdz", tags: ["dining", "wood"], favorited: false },
  { id: "storage-1", name: "Bookshelf", category: "shelf", style: "scandinavian", material: "Pine", color: "#D97706", dimensions: { width: 0.8, height: 1.8, depth: 0.3 }, modelUrl: "/models/storage-1.glb", usdzUrl: "/models/storage-1.usdz", tags: ["storage", "tall"], favorited: false },
  { id: "bed-1", name: "Queen Bed Frame", category: "bed", style: "modern", material: "Upholstered", color: "#6B7280", dimensions: { width: 1.6, height: 0.5, depth: 2.1 }, modelUrl: "/models/bed-1.glb", usdzUrl: "/models/bed-1.usdz", tags: ["bedroom", "queen"], favorited: true },
  { id: "lamp-1", name: "Floor Lamp", category: "lamp", style: "minimalist", material: "Metal", color: "#F59E0B", dimensions: { width: 0.35, height: 1.6, depth: 0.35 }, modelUrl: "/models/lamp-1.glb", usdzUrl: "/models/lamp-1.usdz", tags: ["lighting", "tall"], favorited: false },
];

export const CATEGORIES = ["all", "sofa", "chair", "table", "storage", "bed", "lamp", "plant", "rug", "shelf"] as const;
export const STYLES = ["all", "modern", "scandinavian", "minimalist", "industrial", "japanese"] as const;