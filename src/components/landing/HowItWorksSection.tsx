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
    <section id="how-it-works" className="py-12 md:py-28 bg-background">
      <div className="px-4 md:px-6 lg:px-12 xl:px-20 2xl:px-32 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4 tracking-tight">
            How It Works
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
            Three simple steps to transform your space with AI-driven precision.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
          {/* Connecting line with glow */}
          <div
            className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.2), transparent)",
              boxShadow: "0 0 8px hsl(235 60% 60% / 0.1)",
            }}
          />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, scale: 0.95, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.15 }}
              className="relative text-center"
            >
              <motion.div
                className="w-14 h-14 md:w-16 md:h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 md:mb-6 relative z-10"
                style={{ boxShadow: "var(--shadow-soft), 0 0 20px hsl(235 60% 60% / 0.12)" }}
                whileHover={{ scale: 1.1, boxShadow: "var(--shadow-elevated), 0 0 30px hsl(235 60% 60% / 0.2)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <step.icon className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
              </motion.div>
              <div className="absolute -top-4 md:-top-6 left-1/2 -translate-x-1/2 text-sm md:text-base leading-none tracking-widest font-medium text-primary/30 font-display">
                0{i + 1}
              </div>
              <h3 className="font-display text-base md:text-lg font-semibold text-foreground mb-1.5 md:mb-2">
                {step.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
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
