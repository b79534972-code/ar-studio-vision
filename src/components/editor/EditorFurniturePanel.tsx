import { useState } from "react";
import { Search, Plus, Star, Upload, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FURNITURE_CATALOG, CATEGORIES } from "@/data/furnitureCatalog";
import { useCustomFurniture } from "@/hooks/useCustomFurniture";
import type { FurnitureItem } from "@/types/editor";
import { cn } from "@/lib/utils";

interface EditorFurniturePanelProps {
  onAddFurniture: (item: FurnitureItem) => void;
}

const EditorFurniturePanel = ({ onAddFurniture }: EditorFurniturePanelProps) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"library" | "my">("library");
  const { customItems } = useCustomFurniture();

  const sourceItems = activeTab === "library" ? FURNITURE_CATALOG : customItems;

  const filtered = sourceItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.includes(search.toLowerCase()));
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-64 bg-card border-r border-border/40 flex flex-col h-full">
      <div className="p-3 border-b border-border/30 space-y-3">
        <h3 className="font-display text-sm font-bold text-foreground">Furniture</h3>

        {/* Tabs */}
        <div className="flex rounded-lg bg-muted/50 p-0.5 gap-0.5">
          <button
            onClick={() => setActiveTab("library")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium transition-all",
              activeTab === "library"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="w-3 h-3" />
            Library
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium transition-all",
              activeTab === "my"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Upload className="w-3 h-3" />
            My Furniture
            {customItems.length > 0 && (
              <span className="bg-primary text-primary-foreground text-[9px] rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {customItems.length}
              </span>
            )}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="pl-8 h-8 text-xs rounded-lg"
          />
        </div>
        {activeTab === "library" && (
          <div className="flex flex-wrap gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-medium capitalize transition-colors",
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent/60 text-muted-foreground hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1.5">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => onAddFurniture(item)}
              className="w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left hover:bg-accent/50 transition-colors group"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-border/30 overflow-hidden"
                style={{ backgroundColor: item.color + "22" }}
              >
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: item.color }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                  {item.favorited && <Star className="w-2.5 h-2.5 text-warning fill-warning shrink-0" />}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {(item.dimensions.width * 100).toFixed(0)} × {(item.dimensions.depth * 100).toFixed(0)} cm
                </p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5">{item.material}</Badge>
                </div>
              </div>
              <Plus className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs text-muted-foreground">
                {activeTab === "my" && customItems.length === 0
                  ? "No custom furniture yet"
                  : "No furniture found"}
              </p>
              {activeTab === "my" && customItems.length === 0 && (
                <p className="text-[10px] text-muted-foreground">
                  Upload furniture from My Furniture page
                </p>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EditorFurniturePanel;
