import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useRef, useState } from "react";
import poster from "@/assets/demo-showcase.jpg";

const DemoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  return (
    <section id="demo" className="py-12 md:py-28 gradient-subtle relative">
      <div className="px-4 md:px-6 lg:px-12 xl:px-20 2xl:px-32 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4 tracking-tight">
            See It in Action
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            Watch how our AR system places true-scale furniture with real-time spatial analysis.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden border border-border/50 group cursor-pointer transition-all duration-500 hover:border-primary/20"
          style={{
            boxShadow: "var(--shadow-elevated), 0 0 40px hsl(235 60% 60% / 0.06)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "var(--shadow-elevated), 0 0 50px hsl(235 60% 52% / 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "var(--shadow-elevated), 0 0 40px hsl(235 60% 60% / 0.06)";
          }}
        >
          {/* AR corner markers */}
          {["top-2 left-2", "top-2 right-2 rotate-90", "bottom-2 right-2 rotate-180", "bottom-2 left-2 -rotate-90"].map((pos, i) => (
            <div key={i} className={`absolute ${pos} z-10 pointer-events-none`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M2 8V2h6" stroke="hsl(235 60% 60%)" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
              </svg>
            </div>
          ))}

          <video
            ref={videoRef}
            className="w-full h-auto"
            poster={poster}
            onPlay={() => setIsPlaying(true)}
            onPause={handlePause}
            onEnded={handlePause}
            controls
            playsInline
            webkit-playsinline="true"
          >
            <source src="/demo.mp4" type="video/mp4" />
          </video>

          {!isPlaying && (
            <div
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-foreground/10 hover:bg-foreground/20 transition-all duration-300"
            >
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-full gradient-cta flex items-center justify-center hover:scale-110 transition-transform"
                style={{ boxShadow: "0 0 30px hsl(235 60% 60% / 0.3)" }}
              >
                <Play className="w-8 h-8 text-primary-foreground ml-1" />
              </div>
            </div>
          )}

          <div className={`absolute bottom-3 left-3 md:bottom-4 md:left-4 
            rounded-lg px-3 py-1.5 md:px-4 md:py-2 
            border border-primary/15 transition-opacity duration-300
            ${isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            style={{
              background: "hsl(var(--card) / 0.7)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p className="text-[10px] md:text-xs font-medium text-foreground">AR Demo Preview</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">Real-time furniture placement</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoSection;
