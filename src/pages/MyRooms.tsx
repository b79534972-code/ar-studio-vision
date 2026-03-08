import { motion } from "framer-motion";
import { Home, Plus, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const mockRooms = [
  { id: "1", name: "Living Room", dimensions: "5m × 4m × 2.8m", layouts: 3 },
  { id: "2", name: "Bedroom", dimensions: "4m × 3.5m × 2.8m", layouts: 1 },
  { id: "3", name: "Studio", dimensions: "6m × 5m × 3m", layouts: 2 },
];

const MyRooms = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">{t("rooms.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("rooms.subtitle")}</p>
        </div>
        <Button variant="hero" size="sm" className="gap-1.5 w-full sm:w-auto">
          <Plus className="w-3.5 h-3.5" /> {t("rooms.create")}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          placeholder={t("rooms.search")}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6">
        {mockRooms.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden hover:shadow-elevated transition-shadow"
          >
            <div className="h-36 bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center">
              <Home className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-foreground text-sm">{room.name}</p>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">{room.dimensions}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">{room.layouts} {t("rooms.layouts")}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MyRooms;
