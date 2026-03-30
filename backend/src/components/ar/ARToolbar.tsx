/**
 * ARToolbar — Bottom toolbar for WebXR sessions.
 * Only shows: Reset, Color, Save (Rotate & Scale removed — gesture-only).
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Palette, Save } from "lucide-react";

interface ARToolbarProps {
  onReset: () => void;
  onSave: () => void;
  onColor: () => void;
}

const toolbarItems = [
  { icon: Trash2, label: "Reset", id: "reset" },
  { icon: Palette, label: "Color", id: "color" },
  { icon: Save, label: "Save", id: "save" },
];

const ARToolbar = ({ onReset, onSave, onColor }: ARToolbarProps) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleClick = (id: string) => {
    if (id === "save") {
      onSave();
      return;
    }
    if (id === "reset") {
      onReset();
      return;
    }
    if (id === "color") {
      onColor();
      return;
    }
    setActiveTool(activeTool === id ? null : id);
  };

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="absolute bottom-6 left-4 right-4 z-10"
    >
      <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/40 shadow-elevated p-2">
        <div className="flex items-center justify-around">
          {toolbarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                activeTool === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ARToolbar;
