import { motion } from "framer-motion";

const ARScanOverlay = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {/* Scanning grid */}
      <div className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(hsla(235, 60%, 60%, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsla(235, 60%, 60%, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(235 60% 60% / 0.4), transparent)",
          boxShadow: "0 0 20px 2px hsl(235 60% 60% / 0.15)",
        }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
      />

      {/* Corner markers */}
      {[
        "top-3 left-3",
        "top-3 right-3 rotate-90",
        "bottom-3 right-3 rotate-180",
        "bottom-3 left-3 -rotate-90",
      ].map((pos, i) => (
        <div key={i} className={`absolute ${pos}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M2 8V2h6M2 2l6 6" stroke="hsl(235 60% 60%)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          </svg>
        </div>
      ))}

      {/* Detection dots */}
      {[
        { x: "25%", y: "35%", delay: 0 },
        { x: "60%", y: "45%", delay: 1.5 },
        { x: "40%", y: "70%", delay: 3 },
        { x: "75%", y: "30%", delay: 0.8 },
      ].map((dot, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: dot.x,
            top: dot.y,
            background: "hsl(235 60% 60%)",
            boxShadow: "0 0 8px 2px hsl(235 60% 60% / 0.4)",
          }}
          animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, delay: dot.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Bounding box - furniture outline */}
      <motion.div
        className="absolute border border-primary/30 rounded-lg"
        style={{ left: "15%", top: "30%", width: "30%", height: "40%" }}
        animate={{ opacity: [0, 0.5, 0.3, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[9px] font-mono bg-primary/10 text-primary/60 backdrop-blur-sm">
          Sofa · 180×85cm
        </div>
      </motion.div>

      {/* Measurement line */}
      <motion.div
        className="absolute"
        style={{ left: "50%", top: "60%", width: "35%" }}
        animate={{ opacity: [0, 0.4, 0.4, 0] }}
        transition={{ duration: 5, delay: 1, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="h-px bg-primary/30 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-mono text-primary/50">
            2.4m
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2 border-l border-primary/30" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-2 border-r border-primary/30" />
        </div>
      </motion.div>
    </div>
  );
};

export default ARScanOverlay;
