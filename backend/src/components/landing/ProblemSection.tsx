import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import problemImage from "@/assets/small-room-problem.jpg";

const problems = [
  "Hard to imagine furniture size in your space",
  "Afraid it won't fit through the door or in the corner",
  "No space for layout mistakes — every centimeter counts",
];

const ProblemSection = () => {
  return (
    <section className="py-12 md:py-28 bg-background">
      <div className="px-4 md:px-6 lg:px-12 xl:px-20 2xl:px-32 mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div
              className="rounded-2xl overflow-hidden border border-border/50 relative group transition-all duration-500"
              style={{
                boxShadow: "var(--shadow-card), 0 0 0px hsl(235 60% 52% / 0)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-elevated), 0 0 32px hsl(235 60% 52% / 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-card), 0 0 0px hsl(235 60% 52% / 0)";
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.015, 1],
                  x: [0, 3, 0, -2, 0],
                  y: [0, -2, 0, 1, 0],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src={problemImage}
                  alt="A small studio apartment with oversized furniture that barely fits"
                  className="w-full h-auto transition-all duration-700 group-hover:scale-[1.03]"
                  style={{ filter: "brightness(1.02) contrast(1.01)" }}
                  loading="lazy"
                />
              </motion.div>

              {/* Soft breathing lamp glow */}
              <motion.div
                className="absolute rounded-full blur-3xl pointer-events-none"
                style={{
                  left: "68%",
                  top: "17%",
                  width: "30%",
                  height: "30%",
                  background: "radial-gradient(circle, hsl(42 100% 66% / 0.3) 0%, hsl(42 100% 66% / 0) 70%)",
                }}
                animate={{ opacity: [0.13, 0.19, 0.14], scale: [1, 1.03, 1] }}
                transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Warm light gradient shift on the wall */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at 74% 22%, hsl(42 95% 64% / 0.16) 0%, hsl(42 95% 64% / 0) 58%)",
                  mixBlendMode: "screen",
                }}
                animate={{
                  opacity: [0.08, 0.12, 0.09],
                  x: [0, 6, -4, 0],
                  y: [0, -2, 0],
                }}
                transition={{ duration: 9.5, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-background/10 via-transparent to-white/5 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          >
            <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-4 md:mb-6 tracking-tight">
              Living in a Small Apartment?
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8 leading-relaxed">
              Studio apartments demand precision. One wrong furniture choice can make your space feel cramped and unusable.
            </p>
            <div className="space-y-3 md:space-y-4">
              {problems.map((problem, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 md:p-4 rounded-xl border border-border/50 transition-all duration-300 hover:translate-x-1 hover:scale-[1.01] hover:border-primary/20"
                  style={{
                    background: "hsl(var(--secondary) / 0.6)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-xs md:text-sm text-foreground font-medium">{problem}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
