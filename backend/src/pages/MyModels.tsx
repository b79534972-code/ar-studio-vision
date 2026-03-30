import { useState } from "react";
import { motion } from "framer-motion";
import { Box, Search, ImagePlus, Trash2, Smartphone, AlertTriangle, FlaskConical, Wrench, Clock3, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOutletContext } from "react-router-dom";
import type { User, UserUsage } from "@/types/subscription";
import AddFurnitureModal from "@/components/dashboard/AddFurnitureModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCustomFurniture } from "@/hooks/useCustomFurniture";
import FurnitureARModal from "@/components/ar/FurnitureARModal";
import type { FurnitureItem } from "@/types/editor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DashboardContext {
  user: User;
  usage: UserUsage;
  featureGate: { canUploadModel: () => boolean };
}

const MyModels = () => {
  const { featureGate } = useOutletContext<DashboardContext>();
  const [showAdd, setShowAdd] = useState(false);
  const [showFeatureNotice, setShowFeatureNotice] = useState(true);
  const [search, setSearch] = useState("");
  const [arItem, setArItem] = useState<FurnitureItem | null>(null);
  const { t } = useLanguage();
  const { customItems, removeItem } = useCustomFurniture();

  const filtered = customItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">{t("models.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("models.subtitle")}</p>
        </div>
        <Button variant="hero" size="sm" className="gap-1.5 w-full sm:w-auto" onClick={() => setShowAdd(true)}>
          <ImagePlus className="w-3.5 h-3.5" /> {t("models.add")}
        </Button>
      </div>

      <div className="rounded-2xl border border-amber-300/40 bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-900">3D Upload is in Demo Mode</p>
            <p className="text-xs sm:text-sm text-amber-800/90 mt-1 leading-relaxed">
              Current upload-from-image flow is a demo prototype. Generated result may not fully reconstruct real object geometry from photo yet.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowFeatureNotice(true)}>
                <Info className="w-3.5 h-3.5 mr-1" /> View Details
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          placeholder={t("models.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Box className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-foreground">
            {customItems.length === 0 ? t("models.empty") : t("models.noResults")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {customItems.length === 0 ? t("models.emptyDesc") : t("models.noResultsDesc")}
          </p>
          {customItems.length === 0 && (
            <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => setShowAdd(true)}>
              <ImagePlus className="w-3.5 h-3.5" /> {t("models.add")}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden group hover:shadow-elevated transition-shadow"
            >
              <div className="aspect-square bg-secondary/40 flex items-center justify-center overflow-hidden">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <Box className="w-12 h-12 text-muted-foreground/30" />
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(item.dimensions.width * 100)} × {Math.round(item.dimensions.height * 100)} × {Math.round(item.dimensions.depth * 100)} cm
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded shrink-0">
                    {item.category}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1 text-xs h-7"
                    onClick={() => setArItem(item)}
                  >
                    <Smartphone className="w-3 h-3" /> AR
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AddFurnitureModal open={showAdd} onClose={() => setShowAdd(false)} />

      <Dialog open={showFeatureNotice} onOpenChange={setShowFeatureNotice}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FlaskConical className="w-4.5 h-4.5 text-amber-600" />
              My Furniture Upload is Currently in Demo Stage
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              You can upload images and test the pipeline, but automatic extraction and true 3D reconstruction from a single photo is not fully production-ready yet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <div className="rounded-xl border border-border/60 bg-secondary/20 p-3">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Wrench className="w-4 h-4 text-primary" />
                Why this happens
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Converting a real furniture photo into accurate 3D mesh needs advanced segmentation, multi-view reconstruction, and heavy optimization.
                This requires more engineering time to stabilize for all object shapes and image qualities.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-secondary/20 p-3">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Current limitation in demo
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Uploaded image may not load into a fully realistic 3D object from your exact photo yet. Output is currently best-effort demo quality.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-secondary/20 p-3">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-emerald-600" />
                What will be improved next
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Better object-background separation, more accurate geometry generation, and improved texture quality for real furniture photos.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowFeatureNotice(false)} className="w-full sm:w-auto">
              I Understand, Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {arItem && (
        <FurnitureARModal
          item={arItem}
          open={!!arItem}
          onClose={() => setArItem(null)}
        />
      )}
    </div>
  );
};

export default MyModels;
