import { motion } from "framer-motion";
import { Armchair, ScanLine, Move } from "lucide-react";

const steps = [
  {
    icon: Armchair,
    title: "Choose Furniture",
    desc: "Browse our curated catalog of 3D models optimized for small spaces.",
  },
  {
    icon: ScanLine,
    title: "Scan Your Room",
    desc: "Use your camera to capture your room dimensions automatically.",
  },
  {
    icon: Move,
    title: "Place & Adjust in AR",
    desc: "Position, rotate, and resize furniture in real-time augmented reality.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Three simple steps to transform your space with AI-driven precision.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-border" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-soft relative z-10">
                <step.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-base leading-none tracking-widest font-medium text-primary/40 font-display">
                0{i + 1}
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
