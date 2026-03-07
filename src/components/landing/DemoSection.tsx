import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useRef, useState } from "react";
import poster from "@/assets/demo-showcase.jpg"

const DemoSection = () => {
  const videoRef = useRef(null);
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
    <section id="demo" className="py-12 md:py-28 gradient-subtle">
      <div className="px-4 md:px-6 lg:px-12 xl:px-20 2xl:px-32 mx-auto">

        {/* TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
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


        {/* VIDEO CONTAINER */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-elevated border border-border/50 group cursor-pointer"
        >

          {/* VIDEO */}
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

          {/* PLAY BUTTON */}
          {!isPlaying && (
            <div
              onClick={handlePlay}
                className={`absolute inset-0 flex items-center justify-center 
                  bg-black/20 hover:bg-black/40 transition
                  transition-opacity duration-300
                  ${isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full gradient-cta flex items-center justify-center shadow-elevated hover:scale-110 transition">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
          )}

          {/* LABEL */}
          <div className={`absolute bottom-3 left-3 md:bottom-4 md:left-4 
            bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 md:px-4 md:py-2 
            border border-border/50 transition-opacity duration-300
            ${isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <p className="text-[10px] md:text-xs font-medium text-foreground">
              AR Demo Preview
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground">
              Real-time furniture placement
            </p>
          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default DemoSection;