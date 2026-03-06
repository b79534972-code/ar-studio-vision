import { motion } from "framer-motion";
import { RotateCcw, Save, Lightbulb, Move3D } from "lucide-react";
import solutionImage from "@/assets/solution-3d-viz.jpg";

const features = [
  { icon: Move3D, text: "Place true-scale 3D furniture" },
  { icon: RotateCcw, text: "Rotate and adjust instantly" },
  { icon: Save, text: "Save different layouts" },
  { icon: Lightbulb, text: "Get AI suggestions optimized for small spaces" },
];

const SolutionSection = () => {
  return (
    <section className="py-12 md:py-28 gradient-subtle">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4 tracking-tight">
              The Smart Way to Design{" "}
              <span className="text-primary">Small Spaces</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8 leading-relaxed">
              Our AI-powered AR system delivers optimized furniture placement for compact living environments.
            </p>
            <div className="space-y-2 md:space-y-3">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-center gap-3 p-2.5 md:p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                    <f.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-foreground" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-foreground">{f.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="rounded-2xl overflow-hidden shadow-card border border-border/50">
              <img
                src={solutionImage}
                alt="3D furniture model with measurement annotations"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
