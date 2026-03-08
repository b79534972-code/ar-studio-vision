import type { FurnitureItem } from "@/types/editor";

/**
 * FURNITURE_CATALOG — Thư viện nội thất mặc định
 * 
 * Thay toàn bộ danh sách bên dưới bằng furniture thật của bạn khi deploy.
 * Mỗi item cần đầy đủ: id, name, category, style, material, color, dimensions (m), tags.
 * Custom furniture do user upload sẽ tự động merge vào từ customFurnitureStore.
 */
export const FURNITURE_CATALOG: FurnitureItem[] = [
  // ─── Sofas ─────────────────────────────────────────────
  { id: "sofa-1", name: "Modern Sectional", category: "sofa", style: "modern", material: "Fabric", color: "#6B7280", dimensions: { width: 2.4, height: 0.85, depth: 1.0 }, tags: ["seating", "large"], favorited: false },
  { id: "sofa-2", name: "Scandinavian Loveseat", category: "sofa", style: "scandinavian", material: "Linen", color: "#D1D5DB", dimensions: { width: 1.6, height: 0.8, depth: 0.85 }, tags: ["seating", "compact"], favorited: true },
  { id: "sofa-3", name: "Minimalist Futon", category: "sofa", style: "minimalist", material: "Cotton", color: "#1F2937", dimensions: { width: 1.8, height: 0.45, depth: 0.9 }, tags: ["seating", "low"], favorited: false },
  { id: "sofa-4", name: "Chesterfield Sofa", category: "sofa", style: "modern", material: "Leather", color: "#78350F", dimensions: { width: 2.2, height: 0.75, depth: 0.95 }, tags: ["seating", "classic", "leather"], favorited: false },
  { id: "sofa-5", name: "L-Shape Corner Sofa", category: "sofa", style: "modern", material: "Fabric", color: "#94A3B8", dimensions: { width: 2.8, height: 0.8, depth: 1.8 }, tags: ["seating", "large", "corner"], favorited: true },
  { id: "sofa-6", name: "Japanese Floor Sofa", category: "sofa", style: "japanese", material: "Cotton", color: "#A8A29E", dimensions: { width: 1.6, height: 0.35, depth: 0.8 }, tags: ["seating", "low", "floor"], favorited: false },

  // ─── Chairs ────────────────────────────────────────────
  { id: "chair-1", name: "Accent Chair", category: "chair", style: "modern", material: "Velvet", color: "#4F46E5", dimensions: { width: 0.7, height: 0.85, depth: 0.7 }, tags: ["seating", "accent"], favorited: false },
  { id: "chair-2", name: "Dining Chair", category: "chair", style: "scandinavian", material: "Wood", color: "#92400E", dimensions: { width: 0.5, height: 0.9, depth: 0.5 }, tags: ["dining", "wood"], favorited: false },
  { id: "chair-3", name: "Office Chair", category: "chair", style: "modern", material: "Mesh", color: "#374151", dimensions: { width: 0.6, height: 1.1, depth: 0.6 }, tags: ["office", "ergonomic"], favorited: true },
  { id: "chair-4", name: "Rocking Chair", category: "chair", style: "scandinavian", material: "Wood", color: "#A16207", dimensions: { width: 0.65, height: 1.0, depth: 0.8 }, tags: ["seating", "relaxation"], favorited: false },
  { id: "chair-5", name: "Bar Stool", category: "chair", style: "industrial", material: "Metal", color: "#27272A", dimensions: { width: 0.4, height: 0.75, depth: 0.4 }, tags: ["bar", "kitchen", "counter"], favorited: false },
  { id: "chair-6", name: "Bean Bag", category: "chair", style: "modern", material: "Fabric", color: "#F97316", dimensions: { width: 0.8, height: 0.7, depth: 0.8 }, tags: ["seating", "casual", "kids"], favorited: false },
  { id: "chair-7", name: "Lounge Armchair", category: "chair", style: "minimalist", material: "Leather", color: "#57534E", dimensions: { width: 0.8, height: 0.85, depth: 0.85 }, tags: ["seating", "luxury"], favorited: true },

  // ─── Tables ────────────────────────────────────────────
  { id: "table-1", name: "Coffee Table", category: "table", style: "minimalist", material: "Glass", color: "#93C5FD", dimensions: { width: 1.2, height: 0.45, depth: 0.6 }, tags: ["living", "glass"], favorited: false },
  { id: "table-2", name: "Dining Table", category: "table", style: "scandinavian", material: "Oak", color: "#B45309", dimensions: { width: 1.8, height: 0.75, depth: 0.9 }, tags: ["dining", "wood"], favorited: false },
  { id: "table-3", name: "Side Table", category: "table", style: "industrial", material: "Metal", color: "#4B5563", dimensions: { width: 0.45, height: 0.55, depth: 0.45 }, tags: ["accent", "small"], favorited: false },
  { id: "table-4", name: "Standing Desk", category: "table", style: "modern", material: "Bamboo", color: "#A3A389", dimensions: { width: 1.4, height: 1.1, depth: 0.7 }, tags: ["office", "adjustable"], favorited: false },
  { id: "table-5", name: "Round Dining Table", category: "table", style: "scandinavian", material: "Walnut", color: "#7C2D12", dimensions: { width: 1.2, height: 0.75, depth: 1.2 }, tags: ["dining", "round"], favorited: true },
  { id: "table-6", name: "Nested Tables Set", category: "table", style: "modern", material: "Metal & Glass", color: "#D4D4D8", dimensions: { width: 0.5, height: 0.5, depth: 0.5 }, tags: ["living", "nested", "set"], favorited: false },
  { id: "table-7", name: "Console Table", category: "table", style: "minimalist", material: "Marble", color: "#E7E5E4", dimensions: { width: 1.2, height: 0.8, depth: 0.35 }, tags: ["entryway", "slim"], favorited: false },
  { id: "table-8", name: "Nightstand", category: "table", style: "scandinavian", material: "Birch", color: "#EAB308", dimensions: { width: 0.45, height: 0.55, depth: 0.4 }, tags: ["bedroom", "small"], favorited: false },

  // ─── Storage ───────────────────────────────────────────
  { id: "storage-1", name: "Bookshelf", category: "shelf", style: "scandinavian", material: "Pine", color: "#D97706", dimensions: { width: 0.8, height: 1.8, depth: 0.3 }, tags: ["storage", "tall"], favorited: false },
  { id: "storage-2", name: "TV Console", category: "storage", style: "modern", material: "MDF", color: "#1F2937", dimensions: { width: 1.6, height: 0.5, depth: 0.4 }, tags: ["media", "low"], favorited: false },
  { id: "storage-3", name: "Wardrobe", category: "storage", style: "minimalist", material: "Laminate", color: "#F5F5F4", dimensions: { width: 1.2, height: 2.0, depth: 0.6 }, tags: ["bedroom", "tall"], favorited: false },
  { id: "storage-4", name: "Floating Shelves", category: "shelf", style: "minimalist", material: "Wood", color: "#A16207", dimensions: { width: 1.0, height: 0.05, depth: 0.25 }, tags: ["wall", "display"], favorited: false },
  { id: "storage-5", name: "Shoe Cabinet", category: "storage", style: "modern", material: "MDF", color: "#F5F5F4", dimensions: { width: 0.8, height: 1.0, depth: 0.35 }, tags: ["entryway", "shoes"], favorited: false },
  { id: "storage-6", name: "Dresser", category: "storage", style: "scandinavian", material: "Oak", color: "#D6D3D1", dimensions: { width: 1.2, height: 0.9, depth: 0.5 }, tags: ["bedroom", "drawers"], favorited: true },
  { id: "storage-7", name: "Open Display Shelf", category: "shelf", style: "industrial", material: "Metal & Wood", color: "#44403C", dimensions: { width: 1.0, height: 1.6, depth: 0.35 }, tags: ["display", "industrial"], favorited: false },

  // ─── Beds ──────────────────────────────────────────────
  { id: "bed-1", name: "Queen Bed Frame", category: "bed", style: "modern", material: "Upholstered", color: "#6B7280", dimensions: { width: 1.6, height: 0.5, depth: 2.1 }, tags: ["bedroom", "queen"], favorited: true },
  { id: "bed-2", name: "Platform Bed", category: "bed", style: "japanese", material: "Wood", color: "#78716C", dimensions: { width: 1.4, height: 0.25, depth: 2.0 }, tags: ["bedroom", "low"], favorited: false },
  { id: "bed-3", name: "King Bed Frame", category: "bed", style: "modern", material: "Upholstered", color: "#44403C", dimensions: { width: 1.9, height: 0.55, depth: 2.1 }, tags: ["bedroom", "king", "luxury"], favorited: false },
  { id: "bed-4", name: "Bunk Bed", category: "bed", style: "modern", material: "Metal", color: "#71717A", dimensions: { width: 1.0, height: 1.7, depth: 2.0 }, tags: ["bedroom", "kids", "compact"], favorited: false },
  { id: "bed-5", name: "Single Bed Frame", category: "bed", style: "scandinavian", material: "Wood", color: "#D6D3D1", dimensions: { width: 1.0, height: 0.45, depth: 2.0 }, tags: ["bedroom", "single", "kids"], favorited: false },

  // ─── Lamps ─────────────────────────────────────────────
  { id: "lamp-1", name: "Floor Lamp", category: "lamp", style: "minimalist", material: "Metal", color: "#F59E0B", dimensions: { width: 0.35, height: 1.6, depth: 0.35 }, tags: ["lighting", "tall"], favorited: false },
  { id: "lamp-2", name: "Table Lamp", category: "lamp", style: "scandinavian", material: "Ceramic", color: "#E5E7EB", dimensions: { width: 0.25, height: 0.5, depth: 0.25 }, tags: ["lighting", "small"], favorited: false },
  { id: "lamp-3", name: "Pendant Light", category: "lamp", style: "industrial", material: "Metal", color: "#292524", dimensions: { width: 0.4, height: 0.3, depth: 0.4 }, tags: ["lighting", "ceiling", "hanging"], favorited: true },
  { id: "lamp-4", name: "Desk Lamp", category: "lamp", style: "modern", material: "Aluminum", color: "#71717A", dimensions: { width: 0.2, height: 0.45, depth: 0.2 }, tags: ["lighting", "office", "desk"], favorited: false },
  { id: "lamp-5", name: "Arc Floor Lamp", category: "lamp", style: "modern", material: "Brass", color: "#CA8A04", dimensions: { width: 0.4, height: 1.8, depth: 0.4 }, tags: ["lighting", "tall", "statement"], favorited: false },

  // ─── Plants ────────────────────────────────────────────
  { id: "plant-1", name: "Fiddle Leaf Fig", category: "plant", style: "modern", material: "Ceramic pot", color: "#16A34A", dimensions: { width: 0.5, height: 1.5, depth: 0.5 }, tags: ["decor", "tall"], favorited: false },
  { id: "plant-2", name: "Snake Plant", category: "plant", style: "minimalist", material: "Concrete pot", color: "#22C55E", dimensions: { width: 0.3, height: 0.8, depth: 0.3 }, tags: ["decor", "medium"], favorited: false },
  { id: "plant-3", name: "Monstera", category: "plant", style: "modern", material: "Ceramic pot", color: "#15803D", dimensions: { width: 0.6, height: 1.0, depth: 0.6 }, tags: ["decor", "tropical", "large"], favorited: true },
  { id: "plant-4", name: "Pothos Hanging", category: "plant", style: "scandinavian", material: "Macrame", color: "#4ADE80", dimensions: { width: 0.3, height: 0.6, depth: 0.3 }, tags: ["decor", "hanging", "small"], favorited: false },
  { id: "plant-5", name: "Cactus Set", category: "plant", style: "minimalist", material: "Terracotta", color: "#65A30D", dimensions: { width: 0.2, height: 0.35, depth: 0.2 }, tags: ["decor", "small", "desert"], favorited: false },
  { id: "plant-6", name: "Bamboo Plant", category: "plant", style: "japanese", material: "Ceramic pot", color: "#166534", dimensions: { width: 0.35, height: 1.2, depth: 0.35 }, tags: ["decor", "zen", "tall"], favorited: false },

  // ─── Rugs ──────────────────────────────────────────────
  { id: "rug-1", name: "Area Rug", category: "rug", style: "modern", material: "Wool", color: "#A78BFA", dimensions: { width: 2.0, height: 0.02, depth: 3.0 }, tags: ["floor", "large"], favorited: false },
  { id: "rug-2", name: "Runner Rug", category: "rug", style: "minimalist", material: "Jute", color: "#D6D3D1", dimensions: { width: 0.7, height: 0.02, depth: 2.4 }, tags: ["floor", "narrow"], favorited: false },
  { id: "rug-3", name: "Round Rug", category: "rug", style: "scandinavian", material: "Cotton", color: "#FBBF24", dimensions: { width: 1.5, height: 0.02, depth: 1.5 }, tags: ["floor", "round", "accent"], favorited: false },
  { id: "rug-4", name: "Shag Rug", category: "rug", style: "modern", material: "Polyester", color: "#F5F5F4", dimensions: { width: 1.8, height: 0.04, depth: 2.5 }, tags: ["floor", "soft", "living"], favorited: true },
];

export const CATEGORIES = ["all", "sofa", "chair", "table", "storage", "bed", "lamp", "plant", "rug", "shelf"] as const;
export const STYLES = ["all", "modern", "scandinavian", "minimalist", "industrial", "japanese"] as const;
