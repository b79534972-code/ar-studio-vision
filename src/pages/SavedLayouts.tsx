import { motion } from "framer-motion";
import { Layers, Plus, Search, Edit, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOutletContext } from "react-router-dom";
import type { User, UserUsage } from "@/types/subscription";

interface DashboardContext {
  user: User;
  usage: UserUsage;
  featureGate: { canCreateLayout: () => boolean };
}

const mockLayouts = [
  { id: "1", name: "Studio Layout A", room: "Studio", date: "Feb 18, 2026", objects: 4, version: 2, color: "from-primary/20 to-accent" },
  { id: "2", name: "Bedroom Config", room: "Bedroom", date: "Feb 15, 2026", objects: 3, version: 1, color: "from-accent to-secondary" },
  { id: "3", name: "Living Room v2", room: "Living Room", date: "Feb 10, 2026", objects: 6, version: 3, color: "from-secondary to-primary/10" },
];

const SavedLayouts = () => {
  const { featureGate } = useOutletContext<DashboardContext>();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Saved Layouts</h1>
          <p className="text-sm text-muted-foreground">Your saved AR room configurations</p>
        </div>
        <Button variant="hero" size="sm" className="gap-1.5" onClick={() => featureGate.canCreateLayout()}>
          <Plus className="w-3.5 h-3.5" /> New Layout
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          placeholder="Search layouts…"
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockLayouts.map((layout, i) => (
          <motion.div
            key={layout.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden hover:shadow-elevated transition-shadow group"
          >
            <div className={`h-32 bg-gradient-to-br ${layout.color} flex items-center justify-center`}>
              <Layers className="w-8 h-8 text-muted-foreground/20" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-foreground text-sm">{layout.name}</p>
                <button className="w-7 h-7 rounded-lg bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Edit className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">{layout.room} · {layout.objects} objects</p>
              <div className="flex items-center gap-1.5 mt-2">
                <Clock className="w-3 h-3 text-muted-foreground/50" />
                <span className="text-[10px] text-muted-foreground">{layout.date}</span>
                <span className="text-[10px] text-muted-foreground/50 ml-auto">v{layout.version}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SavedLayouts;
