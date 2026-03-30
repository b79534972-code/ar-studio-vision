/**
 * ARSessionHUD — Top bar + state indicator for active WebXR sessions.
 * Only rendered on Android/WebXR. Desktop and iOS never see this.
 */

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Crosshair } from "lucide-react";
import type { AREngineState } from "@/ar";

interface ARSessionHUDProps {
  engineState: AREngineState;
  onEndSession: () => void;
}

const stateLabel: Record<string, string> = {
  scanning: "Move phone slowly toward floor/table to detect a surface",
  ready: "Tap to place furniture",
  placed: "Object placed — pinch & rotate to adjust",
};

const ARSessionHUD = ({ engineState, onEndSession }: ARSessionHUDProps) => {
  const label = stateLabel[engineState];

  return (
    <>
      {/* Top bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute top-0 left-0 right-0 z-10"
      >
        <div className="bg-card/70 backdrop-blur-xl border-b border-border/30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={onEndSession}
              className="w-9 h-9 rounded-lg bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <div className="text-center">
              <h2 className="font-display text-sm font-bold text-foreground">Modern Sofa</h2>
              <p className="text-[11px] text-muted-foreground">180 × 80 × 75 cm</p>
            </div>
            <div className="w-9" />
          </div>
        </div>
      </motion.div>

      {/* State indicator */}
      {label && (
        <div className="absolute top-20 left-0 right-0 z-10 flex justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={engineState}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="bg-card/80 backdrop-blur-md rounded-full px-5 py-2 border border-border/50 flex items-center gap-2"
            >
              {engineState === "scanning" && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Crosshair className="w-4 h-4 text-primary" />
                </motion.div>
              )}
              <p className="text-foreground text-xs font-medium">{label}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

export default ARSessionHUD;
