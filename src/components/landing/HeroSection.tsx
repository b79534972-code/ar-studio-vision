import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-ar-demo.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section id="home" className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
      <div className="absolute inset-0 gradient-subtle" />
      <div className="container mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-6 border border-border">
              <span className="w-1.5 h-1.5 rounded-full gradient-primary" />
              AI-Powered Spatial Design
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 tracking-tight">
              See Furniture in Your Room{" "}
              <span className="text-primary">Before You Buy</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Use AI + AR to place real-size furniture in your studio apartment instantly.
              Research-driven spatial optimization for small living spaces.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl" onClick={() => navigate("/ar-demo")}>
                <Flame className="w-5 h-5" />
                Try AR Demo
              </Button>
              <Button variant="hero-outline" size="lg" onClick={() => {
                document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
              }}>
                View Demo
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-elevated border border-border/50">
              <img
                src={heroImage}
                alt="AR demo showing furniture placement in a real room with measurement overlays"
                className="w-full h-auto"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card rounded-xl p-3 shadow-card border border-border">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">3D</span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-xs">Real-time AR</p>
                  <p className="text-muted-foreground text-xs">True-scale models</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
