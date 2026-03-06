import { motion } from "framer-motion";
import { Play } from "lucide-react";
import demoImage from "@/assets/demo-showcase.jpg";

const DemoSection = () => {
  return (
    <section id="demo" className="py-20 md:py-28 gradient-subtle">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            See It in Action
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Watch how our AR system places true-scale furniture with real-time spatial analysis and AI-powered optimization.
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
            alt="AR demonstration showing a chair being placed in a living room with measurement overlays"
            className="w-full h-auto"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
            <div className="w-20 h-20 rounded-full gradient-cta flex items-center justify-center shadow-elevated group-hover:scale-110 transition-transform duration-300">
              <Play className="w-8 h-8 text-primary-foreground ml-1" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border/50">
            <p className="text-xs font-medium text-foreground">AR Demo Preview</p>
            <p className="text-xs text-muted-foreground">Real-time furniture placement</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoSection;
