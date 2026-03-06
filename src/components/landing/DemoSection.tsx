import { motion } from "framer-motion";
import { Play } from "lucide-react";
import demoImage from "@/assets/demo-showcase.jpg";

const DemoSection = () => {
  return (
    <section id="demo" className="py-12 md:py-28 gradient-subtle">
      <div className="px-4 md:px-6 lg:px-12 xl:px-20 2xl:px-32 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
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
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-elevated border border-border/50 group cursor-pointer"
        >
          <img
            src={demoImage}
            alt="AR demonstration showing a chair being placed in a living room"
            className="w-full h-auto"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-full gradient-cta flex items-center justify-center shadow-elevated group-hover:scale-110 transition-transform duration-300">
              <Play className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground ml-0.5" />
            </div>
          </div>
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 md:px-4 md:py-2 border border-border/50">
            <p className="text-[10px] md:text-xs font-medium text-foreground">AR Demo Preview</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">Real-time furniture placement</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoSection;
