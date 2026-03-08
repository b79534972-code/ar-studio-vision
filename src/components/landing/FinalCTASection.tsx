import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flame, Lightbulb, Move, Scan } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FinalCTASection = () => {
  const navigate = useNavigate();

  const tips = [
    { icon: Lightbulb, text: "Use your phone in a well-lit room" },
    { icon: Scan, text: "Move your phone slowly to scan surfaces" },
    { icon: Move, text: "Tap anywhere to place furniture in real scale" },
  ];

  return (
    <section className="py-14 md:py-28 gradient-subtle relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "var(--gradient-hero)" }}
      />

      <div className="px-4 md:px-6 lg:px-12 xl:px-20 2xl:px-32 mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 50, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6 tracking-tight">
            Tips for the Best{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-hero)" }}>
              AR Experience
            </span>
          </h2>

          <p className="text-sm md:text-lg text-muted-foreground mb-10 leading-relaxed">
            Follow these simple steps to place furniture accurately in your room using WebAR.
          </p>

          <div className="grid gap-4 md:grid-cols-3 mb-10">
            {tips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.15 }}
                  whileHover={{
                    y: -6,
                    scale: 1.03,
                    boxShadow: "var(--shadow-elevated), 0 0 28px hsl(235 60% 60% / 0.14)",
                    borderColor: "hsl(235 60% 52% / 0.25)",
                  }}
                  className="flex items-center gap-3 border border-primary/10 rounded-xl px-4 py-4 transition-all duration-300"
                  style={{
                    background: "hsl(var(--background) / 0.6)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">{tip.text}</span>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <Button
              variant="hero"
              size="xl"
              className="min-h-[52px] text-base group"
              onClick={() => navigate("/ar-demo")}
            >
              <Flame className="w-5 h-5 group-hover:animate-pulse" />
              Launch AR Experience
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;
