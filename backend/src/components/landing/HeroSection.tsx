import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-ar-demo.jpg";
import ARScanOverlay from "./ARScanOverlay";
import { useMouseParallax } from "@/hooks/useMouseParallax";

const HeroSection = () => {
  const navigate = useNavigate();
  const mouse = useMouseParallax(0.008);

  return (
    <section id="home" className="relative pt-20 pb-12 md:pt-0 md:pb-0 lg:min-h-screen overflow-hidden lg:flex lg:items-center">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 gradient-subtle" />
      <div className="absolute inset-0 gradient-mesh opacity-60" />

      {/* Background orb accents */}
      <div
        className="absolute -top-16 -right-16 w-60 h-60 rounded-full opacity-[0.085] blur-3xl pointer-events-none"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div
        className="absolute -bottom-26 -left-12 w-40 h-40 rounded-full opacity-[0.055] blur-3xl pointer-events-none"
        style={{ background: "hsl(200 80% 50% / 0.12)" }}
      />

      <div className="w-full px-4 md:px-6 lg:px-12 xl:px-20 2xl:px-32 relative mx-auto max-w-[100vw]">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center lg:text-left"
            style={{ transform: `translate(${mouse.x * 0.18}px, ${mouse.y * 0.18}px)` }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 md:mb-6 border border-primary/20"
              style={{
                background: "hsl(var(--accent) / 0.6)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full gradient-primary" />
              <span className="text-accent-foreground">AI-Powered Spatial Design</span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 md:mb-6 tracking-tight">
              See Furniture in Your Room{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-hero)" }}>
                Before You Buy
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6 md:mb-8 max-w-lg mx-auto lg:mx-0">
              Use AI + AR to place real-size furniture in your space instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center lg:justify-start">
              <Button variant="hero" size="xl" className="w-full sm:w-auto min-h-[52px] text-base group" onClick={() => navigate("/ar-demo")}>
                <Flame className="w-5 h-5 group-hover:animate-pulse" />
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
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="relative mt-4 lg:mt-0"
            style={{ transform: `translate(${mouse.x * 0.35}px, ${mouse.y * 0.35}px)` }}
          >
            <div
              className="rounded-2xl overflow-hidden border border-border/50 relative group transition-all duration-500"
              style={{
                boxShadow: "var(--shadow-elevated), 0 0 0px hsl(235 60% 52% / 0)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-elevated), 0 0 40px hsl(235 60% 52% / 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-elevated), 0 0 0px hsl(235 60% 52% / 0)";
              }}
            >
              <img
                src={heroImage}
                alt="AR demo showing furniture placement in a real room with measurement overlays"
                className="w-full h-auto transition-all duration-700 group-hover:scale-[1.04] group-hover:brightness-105 group-hover:contrast-[1.03]"
                style={{ filter: "brightness(1.02) contrast(1.02)" }}
                loading="eager"
              />
              <ARScanOverlay />
              {/* Glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-80" />
            </div>

            {/* Floating label - glassmorphism */}
            <div
              className="absolute -bottom-3 -left-2 md:-bottom-4 md:-left-4 rounded-xl p-2.5 md:p-3 border border-primary/15"
              style={{
                background: "hsl(var(--card) / 0.7)",
                backdropFilter: "blur(16px)",
                boxShadow: "var(--shadow-card), 0 0 20px hsl(235 60% 60% / 0.06)",
              }}
            >
              <div className="flex items-center gap-2 text-sm">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                  <span className="text-primary-foreground text-xs font-bold">3D</span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-xs">Real-time AR</p>
                  <p className="text-muted-foreground text-[10px] md:text-xs">True-scale models</p>
                </div>
              </div>
            </div>

            {/* Top-right floating label */}
            <div
              className="absolute -top-2 -right-2 md:-top-3 md:-right-3 rounded-lg px-2.5 py-1.5 border border-primary/15"
              style={{
                background: "hsl(var(--card) / 0.7)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-[10px] font-medium text-foreground">AI Active</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
