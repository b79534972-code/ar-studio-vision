import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FinalCTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 md:py-28 gradient-subtle">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
            Start Designing Your Room{" "}
            <span className="text-primary">Today</span>
          </h2>
          <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
            Experience AI-powered spatial design with augmented reality visualization — purpose-built for compact living spaces.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="hero" size="xl" onClick={() => navigate("/ar-demo")}>
              <Flame className="w-5 h-5" />
              Try AR Now
            </Button>
            <Button variant="hero-outline" size="lg">
              View Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;
