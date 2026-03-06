import { motion } from "framer-motion";
import { Ruler, Box, BrainCircuit, GitCompare } from "lucide-react";

const features = [
  {
    icon: Ruler,
    title: "Real-size Measurement",
    desc: "Accurate cm/m measurements ensure furniture fits perfectly in your space.",
  },
  {
    icon: Box,
    title: "3D GLB Models",
    desc: "High-fidelity 3D models rendered in real-time with physically-based materials.",
  },
  {
    icon: BrainCircuit,
    title: "AI Layout Suggestion",
    desc: "Spatial optimization algorithms recommend layouts based on room constraints.",
  },
  {
    icon: GitCompare,
    title: "Save & Compare",
    desc: "Store multiple layout configurations and compare them side by side.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Key Features
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Built on research-driven design principles for studio apartment optimization.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <f.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
