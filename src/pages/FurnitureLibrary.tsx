import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, Filter, Grid3X3, List, Heart, Box, ArrowUpDown, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FURNITURE_CATALOG, CATEGORIES, STYLES } from "@/data/furnitureCatalog";
import FurnitureARModal from "@/components/ar/FurnitureARModal";
import type { FurnitureItem } from "@/types/editor";
import { cn } from "@/lib/utils";
import { useCustomFurniture } from "@/hooks/useCustomFurniture";
import { useLanguage } from "@/contexts/LanguageContext";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(normalized)) return null;
  const full = normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized;

  const parsed = Number.parseInt(full, 16);
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

function tintColor(hex: string, delta: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const mix = (channel: number) => clamp(Math.round(channel + (255 - channel) * delta), 0, 255);
  return `rgb(${mix(rgb.r)}, ${mix(rgb.g)}, ${mix(rgb.b)})`;
}

const FurnitureModelVisual = ({ item, compact = false }: { item: FurnitureItem; compact?: boolean }) => {
  if (item.thumbnail) {
    return <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />;
  }

  const { width, height, depth } = item.dimensions;
  const maxDim = Math.max(width, height, depth, 0.001);
  const nw = width / maxDim;
  const nh = height / maxDim;
  const nd = depth / maxDim;

  const frontW = compact ? clamp(14 + nw * 24, 14, 34) : clamp(56 + nw * 86, 56, 128);
  const frontH = compact ? clamp(10 + nh * 26, 10, 34) : clamp(32 + nh * 86, 32, 124);
  const depthX = compact ? clamp(4 + nd * 6, 4, 11) : clamp(10 + nd * 18, 10, 24);
  const depthY = compact ? clamp(2 + nd * 4, 2, 8) : clamp(6 + nd * 10, 6, 14);

  const baseColor = item.color;
  const topColor = tintColor(baseColor, 0.18);
  const sideColor = tintColor(baseColor, -0.16);

  if (item.category === "lamp") {
    const stemHeightPct = compact ? clamp(34 + nh * 28, 34, 62) : clamp(36 + nh * 34, 36, 74);
    const shadeWidthPct = compact ? clamp(28 + nw * 18, 28, 46) : clamp(26 + nw * 22, 26, 52);
    const shadeHeightPct = compact ? 14 : 16;
    const baseSizePct = compact ? clamp(16 + nd * 12, 16, 28) : clamp(14 + nd * 10, 14, 26);
    return (
      <div className="relative w-full h-full">
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: `${baseSizePct}%`,
            height: compact ? "10%" : "9%",
            bottom: compact ? "8%" : "10%",
            backgroundColor: sideColor,
            boxShadow: "0 0 0 1px rgba(255,255,255,0.34)",
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: compact ? "3.5%" : "3%",
            height: `${stemHeightPct}%`,
            bottom: compact ? "16%" : "18%",
            backgroundColor: baseColor,
            boxShadow: "0 0 0 1px rgba(255,255,255,0.22)",
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: `${shadeWidthPct}%`,
            height: `${shadeHeightPct}%`,
            bottom: compact ? "44%" : "56%",
            backgroundColor: topColor,
            boxShadow: "0 0 0 1px rgba(255,255,255,0.34)",
          }}
        />
      </div>
    );
  }

  if (item.category === "sofa") {
    const seatW = compact ? clamp(58 + nw * 18, 58, 86) : clamp(52 + nw * 26, 52, 84);
    const seatH = compact ? clamp(20 + nh * 10, 20, 34) : clamp(18 + nh * 14, 18, 36);
    const backH = compact ? clamp(26 + nh * 12, 26, 44) : clamp(24 + nh * 18, 24, 44);
    const baseBottom = compact ? 16 : 18;
    return (
      <div className="relative w-full h-full">
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full blur-md"
          style={{
            width: `${seatW * 0.98}%`,
            height: compact ? "9%" : "10%",
            bottom: compact ? "8%" : "9%",
            background: "rgba(0,0,0,0.16)",
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-md"
          style={{
            width: `${seatW}%`,
            height: `${seatH}%`,
            bottom: `${baseBottom}%`,
            backgroundColor: baseColor,
            boxShadow: "0 0 0 1px rgba(255,255,255,0.26)",
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-md"
          style={{
            width: `${seatW * 0.96}%`,
            height: `${backH}%`,
            bottom: `${baseBottom + seatH - (compact ? 3 : 5)}%`,
            backgroundColor: topColor,
            boxShadow: "0 0 0 1px rgba(255,255,255,0.26)",
          }}
        />
        <div
          className="absolute rounded-md"
          style={{
            width: compact ? "7%" : "8%",
            height: `${seatH + (compact ? 8 : 10)}%`,
            bottom: `${baseBottom}%`,
            left: `calc(50% - ${seatW / 2}%)`,
            backgroundColor: sideColor,
            boxShadow: "0 0 0 1px rgba(255,255,255,0.18)",
          }}
        />
        <div
          className="absolute rounded-md"
          style={{
            width: compact ? "7%" : "8%",
            height: `${seatH + (compact ? 8 : 10)}%`,
            bottom: `${baseBottom}%`,
            left: `calc(50% + ${seatW / 2 - (compact ? 7 : 8)}%)`,
            backgroundColor: sideColor,
            boxShadow: "0 0 0 1px rgba(255,255,255,0.18)",
          }}
        />
      </div>
    );
  }

  if (item.category === "chair") {
    const seatW = compact ? clamp(12 + nw * 10, 12, 22) : clamp(42 + nw * 44, 42, 92);
    const seatH = compact ? clamp(5 + nh * 5, 5, 11) : clamp(16 + nh * 20, 16, 42);
    const backH = compact ? clamp(8 + nh * 10, 8, 18) : clamp(28 + nh * 40, 28, 68);
    return (
      <div className="relative w-full h-full">
        <div className="absolute left-1/2 -translate-x-1/2 rounded-full blur-md" style={{ width: seatW * 1.15, height: compact ? 4 : 12, bottom: compact ? 1 : 6, background: "rgba(0,0,0,0.15)" }} />
        <div className="absolute left-1/2 -translate-x-1/2 rounded-md" style={{ width: seatW, height: seatH, bottom: compact ? 5 : 14, backgroundColor: baseColor }} />
        <div className="absolute left-1/2 -translate-x-1/2 rounded-md" style={{ width: seatW * 0.78, height: backH, bottom: (compact ? 5 : 14) + seatH - (compact ? 2 : 4), backgroundColor: topColor }} />
        <div className="absolute rounded-sm" style={{ width: compact ? 1 : 4, height: compact ? 5 : 14, bottom: compact ? 1 : 4, left: `calc(50% - ${seatW / 2}px)`, backgroundColor: sideColor }} />
        <div className="absolute rounded-sm" style={{ width: compact ? 1 : 4, height: compact ? 5 : 14, bottom: compact ? 1 : 4, left: `calc(50% + ${seatW / 2 - (compact ? 1 : 4)}px)`, backgroundColor: sideColor }} />
      </div>
    );
  }

  if (item.category === "table") {
    const topW = compact ? clamp(14 + nw * 16, 14, 30) : clamp(54 + nw * 64, 54, 132);
    const topD = compact ? clamp(8 + nd * 8, 8, 16) : clamp(24 + nd * 34, 24, 60);
    const legH = compact ? clamp(8 + nh * 10, 8, 18) : clamp(28 + nh * 46, 28, 76);
    return (
      <div className="relative w-full h-full">
        <div className="absolute left-1/2 -translate-x-1/2 rounded-full blur-md" style={{ width: topW * 1.05, height: compact ? 4 : 12, bottom: compact ? 1 : 6, background: "rgba(0,0,0,0.14)" }} />
        <div className="absolute left-1/2 -translate-x-1/2 rounded-md" style={{ width: topW, height: compact ? 3 : 8, bottom: legH + (compact ? 6 : 12), backgroundColor: topColor }} />
        <div className="absolute left-1/2 -translate-x-1/2" style={{ width: topW, height: topD, bottom: legH + (compact ? 6 : 8), transform: "skewX(-20deg)", backgroundColor: tintColor(baseColor, 0.08), opacity: 0.55 }} />
        <div className="absolute rounded-sm" style={{ width: compact ? 1 : 4, height: legH, bottom: compact ? 2 : 6, left: `calc(50% - ${topW / 2}px)`, backgroundColor: sideColor }} />
        <div className="absolute rounded-sm" style={{ width: compact ? 1 : 4, height: legH, bottom: compact ? 2 : 6, left: `calc(50% + ${topW / 2 - (compact ? 1 : 4)}px)`, backgroundColor: sideColor }} />
      </div>
    );
  }

  if (item.category === "bed") {
    const frameW = compact ? clamp(16 + nw * 16, 16, 32) : clamp(64 + nw * 64, 64, 140);
    const frameH = compact ? clamp(7 + nh * 8, 7, 14) : clamp(20 + nh * 24, 20, 44);
    return (
      <div className="relative w-full h-full">
        <div className="absolute left-1/2 -translate-x-1/2 rounded-full blur-md" style={{ width: frameW * 1.1, height: compact ? 4 : 14, bottom: compact ? 1 : 6, background: "rgba(0,0,0,0.16)" }} />
        <div className="absolute left-1/2 -translate-x-1/2 rounded-md" style={{ width: frameW, height: frameH, bottom: compact ? 4 : 12, backgroundColor: baseColor }} />
        <div className="absolute left-1/2 -translate-x-1/2 rounded-md border border-white/40" style={{ width: frameW * 0.92, height: frameH * 0.62, bottom: (compact ? 4 : 12) + frameH * 0.22, backgroundColor: tintColor(baseColor, 0.28) }} />
        <div className="absolute left-1/2 -translate-x-1/2 rounded-md" style={{ width: frameW * 0.96, height: compact ? 4 : 12, bottom: (compact ? 4 : 12) + frameH - (compact ? 1 : 3), backgroundColor: sideColor }} />
      </div>
    );
  }

  if (item.category === "shelf" || item.category === "storage") {
    const bodyW = compact ? clamp(10 + nw * 10, 10, 20) : clamp(40 + nw * 44, 40, 94);
    const bodyH = compact ? clamp(12 + nh * 16, 12, 30) : clamp(40 + nh * 70, 40, 130);
    return (
      <div className="relative w-full h-full">
        <div className="absolute left-1/2 -translate-x-1/2 rounded-full blur-md" style={{ width: bodyW * 1.18, height: compact ? 4 : 12, bottom: compact ? 1 : 5, background: "rgba(0,0,0,0.14)" }} />
        <div className="absolute left-1/2 -translate-x-1/2 rounded-md border border-white/30" style={{ width: bodyW, height: bodyH, bottom: compact ? 4 : 12, backgroundColor: baseColor }} />
        {[0.25, 0.5, 0.75].map((row) => (
          <div
            key={row}
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              width: bodyW * 0.9,
              height: compact ? 1 : 3,
              bottom: (compact ? 4 : 12) + bodyH * row,
              backgroundColor: topColor,
              opacity: 0.9,
            }}
          />
        ))}
      </div>
    );
  }

  if (item.category === "rug") {
    const rugW = compact ? clamp(15 + nw * 16, 15, 34) : clamp(62 + nw * 66, 62, 140);
    const rugH = compact ? clamp(2 + nh * 2, 2, 5) : clamp(4 + nh * 8, 4, 12);
    return (
      <div className="relative w-full h-full">
        <div className="absolute left-1/2 -translate-x-1/2 rounded-full blur-md" style={{ width: rugW * 0.95, height: compact ? 3 : 10, bottom: compact ? 1 : 8, background: "rgba(0,0,0,0.12)" }} />
        <div className="absolute left-1/2 -translate-x-1/2 rounded-md border border-white/40" style={{ width: rugW, height: rugH, bottom: compact ? 5 : 14, backgroundColor: baseColor }} />
      </div>
    );
  }

  if (item.category === "plant") {
    return (
      <div className="relative w-full h-full">
        <div className={cn("absolute left-1/2 -translate-x-1/2 rounded-full", compact ? "w-5 h-3 bottom-3" : "w-16 h-10 bottom-14")} style={{ backgroundColor: "#2f8f52" }} />
        <div className={cn("absolute left-1/2 -translate-x-1/2 rounded-full", compact ? "w-4 h-4 bottom-6" : "w-12 h-12 bottom-22")} style={{ backgroundColor: "#49a96b" }} />
        <div className={cn("absolute left-1/2 -translate-x-1/2 rounded-b-xl", compact ? "w-3 h-2 bottom-1.5" : "w-10 h-8 bottom-6")} style={{ backgroundColor: sideColor }} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-end justify-center">
      <div
        className="absolute rounded-full blur-md"
        style={{
          width: compact ? frontW * 1.05 : frontW * 1.18,
          height: compact ? 6 : 16,
          bottom: compact ? 1 : 6,
          background: "rgba(0,0,0,0.16)",
        }}
      />

      <div
        className="absolute"
        style={{
          width: frontW,
          height: frontH,
          bottom: compact ? 4 : 14,
          transform: `translateX(${-depthX / 2}px)`,
        }}
      >
        <div className="absolute inset-0 rounded-md" style={{ backgroundColor: baseColor }} />
        <div
          className="absolute rounded-md"
          style={{
            top: -depthY,
            left: depthX,
            width: frontW,
            height: depthY,
            backgroundColor: topColor,
            clipPath: "polygon(0 100%, 100% 100%, calc(100% - var(--dx)) 0, var(--dx) 0)",
            ["--dx" as string]: `${depthX}px`,
          }}
        />
        <div
          className="absolute rounded-md"
          style={{
            top: 0,
            right: -depthX,
            width: depthX,
            height: frontH,
            backgroundColor: sideColor,
            clipPath: "polygon(0 0, 100% var(--dy), 100% calc(100% + var(--dy)), 0 100%)",
            ["--dy" as string]: `${depthY}px`,
          }}
        />
      </div>
    </div>
  );
};

const FurnitureLibrary = () => {
  const { t } = useLanguage();
  const { customItems } = useCustomFurniture();
  const allFurniture = [...FURNITURE_CATALOG, ...customItems];
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [style, setStyle] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(FURNITURE_CATALOG.filter((f) => f.favorited).map((f) => f.id))
  );
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [arItem, setArItem] = useState<FurnitureItem | null>(null);

  const filtered = allFurniture.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.includes(search.toLowerCase()));
    const matchCat = category === "all" || item.category === category;
    const matchStyle = style === "all" || item.style === style;
    const matchFav = !showFavOnly || favorites.has(item.id);
    return matchSearch && matchCat && matchStyle && matchFav;
  });

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-2xl font-bold text-foreground">{t("furnitureLib.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("furnitureLib.subtitle")}</p>
      </motion.div>

      {/* Filters bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-card rounded-2xl border border-border/40 shadow-card p-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("furnitureLib.search")}
              className="pl-9 h-9 text-sm"
            />
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue placeholder={t("furnitureLib.category")} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="capitalize text-xs">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <ArrowUpDown className="w-3 h-3 mr-1" />
              <SelectValue placeholder={t("furnitureLib.style")} />
            </SelectTrigger>
            <SelectContent>
              {STYLES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showFavOnly ? "default" : "outline"}
            size="sm"
            className="h-9 gap-1.5 text-xs"
            onClick={() => setShowFavOnly(!showFavOnly)}
          >
            <Heart className={cn("w-3.5 h-3.5", showFavOnly && "fill-current")} />
            {t("furnitureLib.favorites")}
          </Button>

          <div className="flex gap-1 ml-auto">
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" className="h-9 w-9 p-0"
              onClick={() => setViewMode("grid")}>
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" className="h-9 w-9 p-0"
              onClick={() => setViewMode("list")}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">{filtered.length} {t("furnitureLib.items")}</p>

      {/* Grid view */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item, i) => (
            <FurnitureCard key={item.id} item={item} index={i} isFav={favorites.has(item.id)} onToggleFav={toggleFav} onARPreview={setArItem} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, i) => (
            <FurnitureListItem key={item.id} item={item} index={i} isFav={favorites.has(item.id)} onToggleFav={toggleFav} onARPreview={setArItem} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Box className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t("furnitureLib.empty")}</p>
        </div>
      )}

      <FurnitureARModal open={!!arItem} onClose={() => setArItem(null)} item={arItem} />
    </div>
  );
};

const FurnitureCard = ({ item, index, isFav, onToggleFav, onARPreview }: {
  item: FurnitureItem; index: number; isFav: boolean; onToggleFav: (id: string) => void; onARPreview: (item: FurnitureItem) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.03, duration: 0.4 }}
    className="bg-card rounded-2xl border border-border/40 shadow-card overflow-hidden hover:shadow-elevated transition-all duration-300 group"
  >
    {/* Preview */}
    <div className="aspect-square relative flex items-center justify-center"
      style={{ backgroundColor: item.color + "15" }}>
      <div className="absolute inset-0 p-4 group-hover:scale-[1.03] transition-transform duration-500">
        <FurnitureModelVisual item={item} />
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFav(item.id); }}
        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
      >
        <Star className={cn("w-3.5 h-3.5", isFav ? "text-warning fill-warning" : "text-muted-foreground")} />
      </button>
      <Badge className="absolute top-2.5 left-2.5 text-[9px] capitalize" variant="secondary">{item.style}</Badge>
    </div>

    {/* Info */}
    <div className="p-4 space-y-2">
      <h3 className="font-medium text-sm text-foreground">{item.name}</h3>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>{(item.dimensions.width * 100).toFixed(0)} × {(item.dimensions.depth * 100).toFixed(0)} × {(item.dimensions.height * 100).toFixed(0)} cm</span>
      </div>
      <div className="flex flex-wrap gap-1">
        <Badge variant="outline" className="text-[9px] px-1.5 py-0">{item.material}</Badge>
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 capitalize">{item.category}</Badge>
      </div>
      {/* AR Preview button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full mt-2 h-8 text-xs gap-1.5"
        onClick={(e) => { e.stopPropagation(); onARPreview(item); }}
      >
        <Smartphone className="w-3.5 h-3.5" />
        Preview in AR
      </Button>
    </div>
  </motion.div>
);

const FurnitureListItem = ({ item, index, isFav, onToggleFav, onARPreview }: {
  item: FurnitureItem; index: number; isFav: boolean; onToggleFav: (id: string) => void; onARPreview: (item: FurnitureItem) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.02, duration: 0.3 }}
    className="bg-card rounded-xl border border-border/40 shadow-card p-3 flex items-center gap-4 hover:shadow-elevated transition-shadow"
  >
    <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
      style={{ backgroundColor: item.color + "20" }}>
      <FurnitureModelVisual item={item} compact />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
      <p className="text-[10px] text-muted-foreground">
        {item.material} · {(item.dimensions.width * 100).toFixed(0)} × {(item.dimensions.depth * 100).toFixed(0)} cm
      </p>
    </div>
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={(e) => { e.stopPropagation(); onARPreview(item); }}
        title="Preview in AR"
      >
        <Smartphone className="w-3.5 h-3.5 text-primary" />
      </Button>
      <Badge variant="secondary" className="text-[9px] capitalize">{item.style}</Badge>
      <button onClick={() => onToggleFav(item.id)}>
        <Star className={cn("w-3.5 h-3.5", isFav ? "text-warning fill-warning" : "text-muted-foreground")} />
      </button>
    </div>
  </motion.div>
);

export default FurnitureLibrary;
