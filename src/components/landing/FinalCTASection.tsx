import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FinalCTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-14 md:py-28 gradient-subtle">
      <div className="px-4 md:px-6 lg:px-12 xl:px-20 2xl:px-32 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6 tracking-tight">
            Start Designing Your Room{" "}
            <span className="text-primary">Today</span>
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground mb-8 md:mb-10 leading-relaxed">
            Experience AI-powered spatial design with augmented reality visualization.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Button variant="hero" size="xl" className="w-full sm:w-auto min-h-[52px] text-base" onClick={() => navigate("/ar-demo")}>
              <Flame className="w-5 h-5" />
              Launch AR Experience
            </Button>
            <Button variant="hero-outline" size="lg" className="w-full sm:w-auto min-h-[48px]">
              View Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;
