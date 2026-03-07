import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flame, Lightbulb, Move, Scan } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FinalCTASection = () => {
  const navigate = useNavigate();

  const tips = [
    {
      icon: Lightbulb,
      text: "Use your phone in a well-lit room",
    },
    {
      icon: Scan,
      text: "Move your phone slowly to scan surfaces",
    },
    {
      icon: Move,
      text: "Tap anywhere to place furniture in real scale",
    },
  ];

  return (
    <section className="py-14 md:py-28 gradient-subtle">
      <div className="px-4 md:px-6 lg:px-12 xl:px-20 2xl:px-32 mx-auto">

        {/* MAIN CONTAINER */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto"
        >

          {/* TITLE */}
          <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6 tracking-tight">
            Tips for the Best{" "}
            <span className="text-primary">AR Experience</span>
          </h2>

          <p className="text-sm md:text-lg text-muted-foreground mb-10 leading-relaxed">
            Follow these simple steps to place furniture accurately in your room using WebAR.
          </p>

          {/* TIPS */}
          <div className="grid gap-4 md:grid-cols-3 mb-10">
            {tips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                    delay: index * 0.15,
                  }}
                  className="flex items-center gap-3 bg-background/60 backdrop-blur-sm border rounded-xl px-4 py-4 hover:shadow-md transition"
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {tip.text}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* CTA BUTTON */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <Button
              variant="hero"
              size="xl"
              className="min-h-[52px] text-base"
              onClick={() => navigate("/ar-demo")}
            >
              <Flame className="w-5 h-5" />
              Launch AR Experience
            </Button>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;