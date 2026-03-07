import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-ar-demo.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section id="home" className="relative pt-20 pb-12 md:pt-0 md:pb-0 lg:min-h-screen overflow-hidden lg:flex lg:items-center">
      <div className="absolute inset-0 gradient-subtle" />
      <div className="w-full px-4 md:px-6 lg:px-12 xl:px-20 2xl:px-32 relative mx-auto max-w-[100vw]">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-4 md:mb-6 border border-border">
              <span className="w-1.5 h-1.5 rounded-full gradient-primary" />
              AI-Powered Spatial Design
            </div>
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 md:mb-6 tracking-tight">
              See Furniture in Your Room{" "}
              <span className="text-primary">Before You Buy</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6 md:mb-8 max-w-lg mx-auto lg:mx-0">
              Use AI + AR to place real-size furniture in your space instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center lg:justify-start">
              <Button variant="hero" size="xl" className="w-full sm:w-auto min-h-[52px] text-base" onClick={() => navigate("/ar-demo")}>
                <Flame className="w-5 h-5" />
                Try AR Now
              </Button>
              <Button variant="hero-outline" size="lg" className="w-full sm:w-auto min-h-[48px]" onClick={() => {
                document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
              }}>
                View Demo
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="relative mt-4 lg:mt-0"
          >
            <div className="rounded-2xl overflow-hidden shadow-elevated border border-border/50">
              <img
                src={heroImage}
                alt="AR demo showing furniture placement in a real room with measurement overlays"
                className="w-full h-auto"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-3 -left-2 md:-bottom-4 md:-left-4 bg-card rounded-xl p-2.5 md:p-3 shadow-card border border-border">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">3D</span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-xs">Real-time AR</p>
                  <p className="text-muted-foreground text-[10px] md:text-xs">True-scale models</p>
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
