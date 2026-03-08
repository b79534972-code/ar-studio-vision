import { motion } from "framer-motion";
import { Ruler, Box, BrainCircuit, GitCompare } from "lucide-react";

const features = [
  {
    icon: Ruler,
    title: "Real-size Measurement",
    desc: "Accurate cm/m measurements ensure furniture fits perfectly in your space.",
    anim: { rotate: [0, 0, 15, 0, 0], x: [0, 8, 8, 0, 0] },
  },
  {
    icon: Box,
    title: "3D GLB Models",
    desc: "High-fidelity 3D models rendered in real-time with physically-based materials.",
    anim: { rotateY: [0, 180, 360] },
  },
  {
    icon: BrainCircuit,
    title: "AI Layout Suggestion",
    desc: "Spatial optimization algorithms recommend layouts based on room constraints.",
    anim: { scale: [1, 1.15, 1], opacity: [1, 0.7, 1] },
  },
  {
    icon: GitCompare,
    title: "Save & Compare",
    desc: "Store multiple layout configurations and compare them side by side.",
    anim: { x: [0, 4, 0, -4, 0] },
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-12 md:py-28 bg-background relative">
      <div className="px-4 md:px-6 lg:px-12 xl:px-20 2xl:px-32 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: false, amount: 0.3 }}
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
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.95, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
              whileHover={{
                y: -8,
                scale: 1.03,
                boxShadow: "var(--shadow-elevated), 0 0 32px hsl(235 60% 60% / 0.14)",
                borderColor: "hsl(235 60% 52% / 0.25)",
              }}
              className="p-4 md:p-6 rounded-2xl border border-border/50 group cursor-default transition-all duration-300"
              style={{
                background: "hsl(var(--card) / 0.6)",
                backdropFilter: "blur(12px)",
              }}
            >
              <motion.div
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl gradient-primary flex items-center justify-center mb-3 md:mb-4 transition-shadow duration-300 group-hover:shadow-glow"
                whileInView={f.anim}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 2, delay: i * 0.2 + 0.3, repeat: Infinity, repeatDelay: 3 }}
              >
                <f.icon className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
              </motion.div>
              <h3 className="font-display text-sm md:text-base font-semibold text-foreground mb-1 md:mb-2">
                {f.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
