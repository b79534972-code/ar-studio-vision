import { motion } from "framer-motion";

const ARScanOverlay = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {/* Perspective grid floor */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(hsla(235, 60%, 60%, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, hsla(235, 60%, 60%, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Scanning line — horizontal sweep */}
      <motion.div
        className="absolute left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, transparent 5%, hsl(210 70% 60% / 0.3) 30%, hsl(235 60% 60% / 0.4) 50%, hsl(210 70% 60% / 0.3) 70%, transparent 95%)",
          boxShadow: "0 0 20px 3px hsl(210 70% 60% / 0.1)",
        }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
      />

      {/* Corner markers — AR tracking */}
      {[
        "top-3 left-3",
        "top-3 right-3 rotate-90",
        "bottom-3 right-3 rotate-180",
        "bottom-3 left-3 -rotate-90",
      ].map((pos, i) => (
        <motion.div
          key={i}
          className={`absolute ${pos}`}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, delay: i * 0.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M2 8V2h6" stroke="hsl(210 70% 60%)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="2" cy="2" r="1.5" fill="hsl(210 70% 60%)" opacity="0.4" />
          </svg>
        </motion.div>
      ))}

      {/* Detection points with crosshairs */}
      {[
        { x: "25%", y: "35%", delay: 0, label: "Chair" },
        { x: "60%", y: "45%", delay: 1.5, label: "Table" },
        { x: "40%", y: "70%", delay: 3, label: "Shelf" },
        { x: "75%", y: "30%", delay: 0.8, label: null },
      ].map((dot, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: dot.x, top: dot.y }}
          animate={{ opacity: [0, 0.7, 0.5, 0.7, 0], scale: [0.5, 1, 1, 1, 0.5] }}
          transition={{ duration: 4, delay: dot.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Crosshair */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="-translate-x-1/2 -translate-y-1/2">
            <circle cx="8" cy="8" r="3" stroke="hsl(210 70% 60%)" strokeWidth="0.8" />
            <line x1="8" y1="0" x2="8" y2="5" stroke="hsl(210 70% 60%)" strokeWidth="0.6" />
            <line x1="8" y1="11" x2="8" y2="16" stroke="hsl(210 70% 60%)" strokeWidth="0.6" />
            <line x1="0" y1="8" x2="5" y2="8" stroke="hsl(210 70% 60%)" strokeWidth="0.6" />
            <line x1="11" y1="8" x2="16" y2="8" stroke="hsl(210 70% 60%)" strokeWidth="0.6" />
          </svg>
          {dot.label && (
            <div className="absolute top-3 left-3 px-1.5 py-0.5 rounded text-[8px] font-mono bg-primary/8 text-primary/50 backdrop-blur-sm whitespace-nowrap">
              {dot.label}
            </div>
          )}
        </motion.div>
      ))}

      {/* Bounding box — furniture detection */}
      <motion.div
        className="absolute rounded-md"
        style={{
          left: "15%",
          top: "30%",
          width: "30%",
          height: "40%",
          border: "1px solid hsl(210 70% 60% / 0.2)",
        }}
        animate={{ opacity: [0, 0.6, 0.4, 0.6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Corner dots */}
        {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-info/40`} />
        ))}
        <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[9px] font-mono text-primary/50 backdrop-blur-sm"
          style={{ background: "hsl(var(--card) / 0.4)" }}>
          Sofa · 180×85cm
        </div>
      </motion.div>

      {/* Measurement line with endpoints */}
      <motion.div
        className="absolute"
        style={{ left: "50%", top: "60%", width: "35%" }}
        animate={{ opacity: [0, 0.5, 0.5, 0] }}
        transition={{ duration: 6, delay: 1, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="h-px relative" style={{ background: "hsl(210 70% 60% / 0.3)" }}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-mono text-info/50 px-1 rounded"
            style={{ background: "hsl(var(--card) / 0.3)" }}>
            2.4m
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-3 bg-info/30" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-info/30" />
        </div>
      </motion.div>

      {/* Scanning status bar */}
      <motion.div
        className="absolute bottom-3 right-3 md:bottom-4 md:right-4 flex items-center gap-1.5 px-2 py-1 rounded-md"
        style={{
          background: "hsl(var(--card) / 0.4)",
          backdropFilter: "blur(8px)",
        }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
        <span className="text-[8px] font-mono text-muted-foreground">SCANNING</span>
      </motion.div>
    </div>
  );
};

export default ARScanOverlay;
