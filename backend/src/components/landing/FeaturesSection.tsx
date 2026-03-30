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
    <section className="py-12 md:py-28 bg-background relative">
      <div className="px-4 md:px-6 lg:px-12 xl:px-20 2xl:px-32 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4 tracking-tight">
            Key Features
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
            Built on research-driven design principles for studio apartment optimization.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-4 md:p-6 rounded-2xl border border-border/50 group cursor-default transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/25"
              style={{
                background: "hsl(var(--card) / 0.6)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl gradient-primary flex items-center justify-center mb-3 md:mb-4 transition-all duration-300 group-hover:shadow-glow group-hover:-translate-y-0.5"
              >
                <f.icon className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
              </div>
              <h3 className="font-display text-sm md:text-base font-semibold text-foreground mb-1 md:mb-2">
                {f.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
