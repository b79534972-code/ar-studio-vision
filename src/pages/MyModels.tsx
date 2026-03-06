import { motion } from "framer-motion";
import { Box, Upload, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOutletContext } from "react-router-dom";
import type { User, UserUsage } from "@/types/subscription";

interface DashboardContext {
  user: User;
  usage: UserUsage;
  featureGate: { canUploadModel: () => boolean };
}

const mockModels = [
  { id: "1", name: "Modern Sofa", dimensions: "180 × 80 × 75 cm", format: "GLB" },
  { id: "2", name: "Coffee Table", dimensions: "90 × 50 × 45 cm", format: "GLB" },
  { id: "3", name: "Bookshelf", dimensions: "80 × 30 × 180 cm", format: "GLTF" },
];

const MyModels = () => {
  const { featureGate } = useOutletContext<DashboardContext>();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">My Models</h1>
          <p className="text-sm text-muted-foreground">Manage your 3D furniture models</p>
        </div>
        <Button variant="hero" size="sm" className="gap-1.5" onClick={() => featureGate.canUploadModel()}>
          <Upload className="w-3.5 h-3.5" /> Upload Model
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          placeholder="Search models…"
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockModels.map((model, i) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden group hover:shadow-elevated transition-shadow"
          >
            <div className="aspect-square bg-secondary/40 flex items-center justify-center">
              <Box className="w-12 h-12 text-muted-foreground/30" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground text-sm">{model.name}</p>
                <p className="text-xs text-muted-foreground">{model.dimensions}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded">
                  {model.format}
                </span>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MyModels;
