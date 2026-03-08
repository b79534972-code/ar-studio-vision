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
              <SelectValue placeholder="Style" />
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
            Favorites
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
      <p className="text-xs text-muted-foreground">{filtered.length} items</p>

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
          <p className="text-sm text-muted-foreground">No furniture found matching your filters</p>
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
      <div
        className="rounded-lg group-hover:scale-110 transition-transform duration-500"
        style={{
          width: `${Math.min(80, item.dimensions.width * 40)}%`,
          height: `${Math.min(80, item.dimensions.depth * 40)}%`,
          backgroundColor: item.color,
          opacity: 0.7,
          minWidth: 40,
          minHeight: 40,
        }}
      />
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
      <div className="w-6 h-6 rounded-sm" style={{ backgroundColor: item.color, opacity: 0.7 }} />
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
