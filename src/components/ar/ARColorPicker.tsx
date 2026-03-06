/**
 * ARColorPicker — Slide-up panel for changing furniture color/material in AR.
 * Triggered by the "Color" button in ARToolbar.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

interface ColorOption {
  id: string;
  label: string;
  hsl: string; // HSL string for preview swatch
}

interface MaterialOption {
  id: string;
  label: string;
}

interface ARColorPickerProps {
  open: boolean;
  onClose: () => void;
  onColorChange?: (colorId: string) => void;
  onMaterialChange?: (materialId: string) => void;
}

const COLORS: ColorOption[] = [
  { id: "charcoal", label: "Charcoal", hsl: "0 0% 25%" },
  { id: "ivory", label: "Ivory", hsl: "40 30% 90%" },
  { id: "ocean", label: "Ocean Blue", hsl: "210 60% 45%" },
  { id: "sage", label: "Sage", hsl: "140 20% 55%" },
  { id: "blush", label: "Blush", hsl: "350 40% 75%" },
  { id: "mustard", label: "Mustard", hsl: "45 80% 55%" },
  { id: "walnut", label: "Walnut", hsl: "25 40% 30%" },
  { id: "natural", label: "Natural Oak", hsl: "35 40% 65%" },
];

const MATERIALS: MaterialOption[] = [
  { id: "fabric", label: "Fabric" },
  { id: "leather", label: "Leather" },
  { id: "velvet", label: "Velvet" },
  { id: "wood", label: "Wood" },
];

const ARColorPicker = ({
  open,
  onClose,
  onColorChange,
  onMaterialChange,
}: ARColorPickerProps) => {
  const [selectedColor, setSelectedColor] = useState("charcoal");
  const [selectedMaterial, setSelectedMaterial] = useState("fabric");

  const handleColorSelect = (id: string) => {
    setSelectedColor(id);
    onColorChange?.(id);
  };

  const handleMaterialSelect = (id: string) => {
    setSelectedMaterial(id);
    onMaterialChange?.(id);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 z-20 rounded-t-2xl bg-card/90 backdrop-blur-xl border-t border-border/40 shadow-elevated"
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3">
            <h3 className="font-display text-sm font-semibold text-foreground">
              Customize
            </h3>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Colors */}
          <div className="px-5 pb-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">
              Color
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleColorSelect(color.id)}
                  className="flex flex-col items-center gap-1.5 shrink-0"
                >
                  <div
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedColor === color.id
                        ? "border-primary scale-110"
                        : "border-border/40 hover:border-muted-foreground/50"
                    }`}
                    style={{ backgroundColor: `hsl(${color.hsl})` }}
                  >
                    {selectedColor === color.id && (
                      <Check className="w-4 h-4 text-primary-foreground drop-shadow-sm" />
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {color.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div className="px-5 pb-6">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">
              Material
            </p>
            <div className="flex gap-2">
              {MATERIALS.map((mat) => (
                <button
                  key={mat.id}
                  onClick={() => handleMaterialSelect(mat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    selectedMaterial === mat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {mat.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ARColorPicker;
