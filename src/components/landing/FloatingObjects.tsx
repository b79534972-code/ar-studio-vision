import { motion } from "framer-motion";

/**
 * Floating AR/spatial-themed elements — holographic panels, room blocks,
 * and spatial markers that evoke a digital room-planning environment.
 */

const FloatingPanel = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
    animate={{
      y: [0, -10, 0, 6, 0],
      rotateX: [0, 2, 0, -2, 0],
      rotateY: [0, 3, 0, -3, 0],
    }}
    transition={{ duration: 8, delay, repeat: Infinity, ease: "easeInOut" }}
  >
    <div
      className="rounded-lg border border-primary/10"
      style={{
        width: "60px",
        height: "40px",
        background: "linear-gradient(135deg, hsl(235 60% 60% / 0.06), hsl(210 70% 60% / 0.03))",
        backdropFilter: "blur(4px)",
        boxShadow: "0 0 12px hsl(235 60% 60% / 0.05)",
      }}
    >
      {/* Mini grid lines inside panel */}
      <div className="w-full h-full relative overflow-hidden rounded-lg">
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(hsla(235, 60%, 60%, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, hsla(235, 60%, 60%, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: "10px 10px",
          }}
        />
      </div>
    </div>
  </motion.div>
);

const RoomBlock = ({ className, delay = 0, size = 28 }: { className?: string; delay?: number; size?: number }) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
    animate={{
      y: [0, -8, 0, 5, 0],
      rotate: [0, 2, 0, -2, 0],
    }}
    transition={{ duration: 7, delay, repeat: Infinity, ease: "easeInOut" }}
  >
    {/* Isometric room block */}
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="hsl(235 60% 60%)" strokeWidth="0.8" opacity="0.12" />
      <path d="M16 4L28 10L16 16L4 10L16 4Z" fill="hsl(235 60% 60%)" opacity="0.04" />
      <path d="M16 16V28M4 10L16 16L28 10" stroke="hsl(235 60% 60%)" strokeWidth="0.5" opacity="0.08" />
    </svg>
  </motion.div>
);

const SpatialMarker = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
    animate={{
      opacity: [0.15, 0.3, 0.15],
      scale: [1, 1.1, 1],
    }}
    transition={{ duration: 5, delay, repeat: Infinity, ease: "easeInOut" }}
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="3" stroke="hsl(210 70% 60%)" strokeWidth="0.8" opacity="0.3" />
      <circle cx="10" cy="10" r="7" stroke="hsl(210 70% 60%)" strokeWidth="0.5" opacity="0.15" strokeDasharray="2 3" />
      <line x1="10" y1="2" x2="10" y2="6" stroke="hsl(210 70% 60%)" strokeWidth="0.5" opacity="0.2" />
      <line x1="10" y1="14" x2="10" y2="18" stroke="hsl(210 70% 60%)" strokeWidth="0.5" opacity="0.2" />
      <line x1="2" y1="10" x2="6" y2="10" stroke="hsl(210 70% 60%)" strokeWidth="0.5" opacity="0.2" />
      <line x1="14" y1="10" x2="18" y2="10" stroke="hsl(210 70% 60%)" strokeWidth="0.5" opacity="0.2" />
    </svg>
  </motion.div>
);

const FloatingObjects = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Holographic panels */}
      <FloatingPanel className="left-[3%] top-[18%]" delay={0} />
      <FloatingPanel className="right-[5%] top-[12%]" delay={1.5} />
      <FloatingPanel className="right-[8%] bottom-[25%]" delay={3} />
      
      {/* Room blocks */}
      <RoomBlock className="left-[-2%] top-[55%]" delay={0.5} size={30} />
      <RoomBlock className="right-[2%] top-[60%]" delay={2} size={24} />
      
      {/* Spatial markers */}
      <SpatialMarker className="left-[10%] top-[35%]" delay={1} />
      <SpatialMarker className="right-[12%] top-[40%]" delay={2.5} />
      <SpatialMarker className="left-[5%] bottom-[20%]" delay={0.8} />
    </div>
  );
};

export default FloatingObjects;
