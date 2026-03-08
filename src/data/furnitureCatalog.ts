import type { FurnitureItem } from "@/types/editor";

export const FURNITURE_CATALOG: FurnitureItem[] = [
  // Sofas
  { id: "sofa-1", name: "Modern Sectional", category: "sofa", style: "modern", material: "Fabric", color: "#6B7280", dimensions: { width: 2.4, height: 0.85, depth: 1.0 }, tags: ["seating", "large"], favorited: false },
  { id: "sofa-2", name: "Scandinavian Loveseat", category: "sofa", style: "scandinavian", material: "Linen", color: "#D1D5DB", dimensions: { width: 1.6, height: 0.8, depth: 0.85 }, tags: ["seating", "compact"], favorited: true },
  { id: "sofa-3", name: "Minimalist Futon", category: "sofa", style: "minimalist", material: "Cotton", color: "#1F2937", dimensions: { width: 1.8, height: 0.45, depth: 0.9 }, tags: ["seating", "low"], favorited: false },

  // Chairs
  { id: "chair-1", name: "Accent Chair", category: "chair", style: "modern", material: "Velvet", color: "#4F46E5", dimensions: { width: 0.7, height: 0.85, depth: 0.7 }, tags: ["seating", "accent"], favorited: false },
  { id: "chair-2", name: "Dining Chair", category: "chair", style: "scandinavian", material: "Wood", color: "#92400E", dimensions: { width: 0.5, height: 0.9, depth: 0.5 }, tags: ["dining", "wood"], favorited: false },
  { id: "chair-3", name: "Office Chair", category: "chair", style: "modern", material: "Mesh", color: "#374151", dimensions: { width: 0.6, height: 1.1, depth: 0.6 }, tags: ["office", "ergonomic"], favorited: true },

  // Tables
  { id: "table-1", name: "Coffee Table", category: "table", style: "minimalist", material: "Glass", color: "#93C5FD", dimensions: { width: 1.2, height: 0.45, depth: 0.6 }, tags: ["living", "glass"], favorited: false },
  { id: "table-2", name: "Dining Table", category: "table", style: "scandinavian", material: "Oak", color: "#B45309", dimensions: { width: 1.8, height: 0.75, depth: 0.9 }, tags: ["dining", "wood"], favorited: false },
  { id: "table-3", name: "Side Table", category: "table", style: "industrial", material: "Metal", color: "#4B5563", dimensions: { width: 0.45, height: 0.55, depth: 0.45 }, tags: ["accent", "small"], favorited: false },
  { id: "table-4", name: "Standing Desk", category: "table", style: "modern", material: "Bamboo", color: "#A3A389", dimensions: { width: 1.4, height: 1.1, depth: 0.7 }, tags: ["office", "adjustable"], favorited: false },

  // Storage
  { id: "storage-1", name: "Bookshelf", category: "shelf", style: "scandinavian", material: "Pine", color: "#D97706", dimensions: { width: 0.8, height: 1.8, depth: 0.3 }, tags: ["storage", "tall"], favorited: false },
  { id: "storage-2", name: "TV Console", category: "storage", style: "modern", material: "MDF", color: "#1F2937", dimensions: { width: 1.6, height: 0.5, depth: 0.4 }, tags: ["media", "low"], favorited: false },
  { id: "storage-3", name: "Wardrobe", category: "storage", style: "minimalist", material: "Laminate", color: "#F5F5F4", dimensions: { width: 1.2, height: 2.0, depth: 0.6 }, tags: ["bedroom", "tall"], favorited: false },

  // Beds
  { id: "bed-1", name: "Queen Bed Frame", category: "bed", style: "modern", material: "Upholstered", color: "#6B7280", dimensions: { width: 1.6, height: 0.5, depth: 2.1 }, tags: ["bedroom", "queen"], favorited: true },
  { id: "bed-2", name: "Platform Bed", category: "bed", style: "japanese", material: "Wood", color: "#78716C", dimensions: { width: 1.4, height: 0.25, depth: 2.0 }, tags: ["bedroom", "low"], favorited: false },

  // Lamps
  { id: "lamp-1", name: "Floor Lamp", category: "lamp", style: "minimalist", material: "Metal", color: "#F59E0B", dimensions: { width: 0.35, height: 1.6, depth: 0.35 }, tags: ["lighting", "tall"], favorited: false },
  { id: "lamp-2", name: "Table Lamp", category: "lamp", style: "scandinavian", material: "Ceramic", color: "#E5E7EB", dimensions: { width: 0.25, height: 0.5, depth: 0.25 }, tags: ["lighting", "small"], favorited: false },

  // Plants
  { id: "plant-1", name: "Fiddle Leaf Fig", category: "plant", style: "modern", material: "Ceramic pot", color: "#16A34A", dimensions: { width: 0.5, height: 1.5, depth: 0.5 }, tags: ["decor", "tall"], favorited: false },
  { id: "plant-2", name: "Snake Plant", category: "plant", style: "minimalist", material: "Concrete pot", color: "#22C55E", dimensions: { width: 0.3, height: 0.8, depth: 0.3 }, tags: ["decor", "medium"], favorited: false },

  // Rugs
  { id: "rug-1", name: "Area Rug", category: "rug", style: "modern", material: "Wool", color: "#A78BFA", dimensions: { width: 2.0, height: 0.02, depth: 3.0 }, tags: ["floor", "large"], favorited: false },
  { id: "rug-2", name: "Runner Rug", category: "rug", style: "minimalist", material: "Jute", color: "#D6D3D1", dimensions: { width: 0.7, height: 0.02, depth: 2.4 }, tags: ["floor", "narrow"], favorited: false },
];

export const CATEGORIES = ["all", "sofa", "chair", "table", "storage", "bed", "lamp", "plant", "rug", "shelf"] as const;
export const STYLES = ["all", "modern", "scandinavian", "minimalist", "industrial", "japanese"] as const;
