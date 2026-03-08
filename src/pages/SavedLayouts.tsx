import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Search, Edit, Clock, Trash2, ArrowRight } from "lucide-react";
import { useRoomStore } from "@/hooks/useRoomStore";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SavedLayouts = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { layouts, rooms, removeLayout } = useRoomStore();
  const [search, setSearch] = useState("");

  const filtered = layouts.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  const getRoomName = (roomId: string) =>
    rooms.find((r) => r.id === roomId)?.name ?? "Unknown Room";

  const handleOpen = (layout: typeof layouts[0]) => {
    navigate(`/dashboard/editor?roomId=${layout.roomId}&layoutId=${layout.id}`);
  };

  const handleDelete = (id: string, name: string) => {
    removeLayout(id);
    toast({ title: "Deleted", description: `${name} removed` });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">{t("layouts.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("layouts.subtitle")}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("layouts.search")}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Layers className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">
            {layouts.length === 0
              ? "No saved layouts yet. Save a layout from the Room Editor!"
              : "No layouts match your search"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6">
          {filtered.map((layout, i) => {
            const gradients = [
              "from-primary/20 to-accent",
              "from-accent to-secondary",
              "from-secondary to-primary/10",
            ];
            return (
              <motion.div
                key={layout.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden hover:shadow-elevated transition-shadow cursor-pointer group"
                onClick={() => handleOpen(layout)}
              >
                <div className={`h-32 bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}>
                  <Layers className="w-8 h-8 text-muted-foreground/20" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-foreground text-sm">{layout.name}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="w-7 h-7 rounded-lg bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                          <Edit className="w-3 h-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpen(layout); }}>
                          <ArrowRight className="w-3.5 h-3.5 mr-2" /> Open in Editor
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleDelete(layout.id, layout.name); }}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getRoomName(layout.roomId)} · {layout.objects.length} {t("layouts.objects")}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Clock className="w-3 h-3 text-muted-foreground/50" />
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(layout.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 ml-auto">v{layout.version}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedLayouts;
