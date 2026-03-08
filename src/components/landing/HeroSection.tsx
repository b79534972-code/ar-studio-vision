import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-ar-demo.jpg";
import ARScanOverlay from "./ARScanOverlay";
import FloatingObjects from "./FloatingObjects";
import { useMouseParallax } from "@/hooks/useMouseParallax";

const HeroSection = () => {
  const navigate = useNavigate();
  const mouse = useMouseParallax(0.015);

  return (
    <section id="home" className="relative pt-20 pb-12 md:pt-0 md:pb-0 lg:min-h-screen overflow-hidden lg:flex lg:items-center">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 gradient-subtle" />
      <div className="absolute inset-0 gradient-mesh opacity-60" />

      {/* Animated gradient orb */}
      <motion.div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "var(--gradient-hero)" }}
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 20, 0],
          y: [0, -15, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-48 -left-24 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "hsl(200 80% 50% / 0.3)" }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <FloatingObjects />

      <div className="w-full px-4 md:px-6 lg:px-12 xl:px-20 2xl:px-32 relative mx-auto max-w-[100vw]">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center lg:text-left"
            style={{ transform: `translate(${mouse.x * 0.3}px, ${mouse.y * 0.3}px)` }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 md:mb-6 border border-primary/20"
              style={{
                background: "hsl(var(--accent) / 0.6)",
                backdropFilter: "blur(8px)",
              }}
              animate={{ boxShadow: ["0 0 0px hsl(235 60% 60% / 0)", "0 0 12px hsl(235 60% 60% / 0.15)", "0 0 0px hsl(235 60% 60% / 0)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="w-1.5 h-1.5 rounded-full gradient-primary animate-pulse" />
              <span className="text-accent-foreground">AI-Powered Spatial Design</span>
            </motion.div>
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
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="relative mt-4 lg:mt-0"
            style={{ transform: `translate(${mouse.x * 0.8}px, ${mouse.y * 0.8}px)` }}
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

            {/* Reflective floor effect */}
            <div
              className="mt-1 h-16 md:h-24 rounded-b-2xl overflow-hidden opacity-40"
              style={{
                background: "linear-gradient(180deg, hsl(var(--border) / 0.3), transparent)",
                maskImage: "linear-gradient(180deg, rgba(0,0,0,0.4), transparent)",
                WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.4), transparent)",
                transform: "scaleY(-1) translateY(-1px)",
              }}
            >
              <img
                src={heroImage}
                alt=""
                className="w-full h-auto blur-[2px] opacity-50"
                style={{ filter: "brightness(0.9) blur(2px)" }}
                aria-hidden="true"
              />
            </div>

            {/* Floating label - glassmorphism */}
            <motion.div
              className="absolute -bottom-3 -left-2 md:-bottom-4 md:-left-4 rounded-xl p-2.5 md:p-3 border border-primary/15"
              style={{
                background: "hsl(var(--card) / 0.7)",
                backdropFilter: "blur(16px)",
                boxShadow: "var(--shadow-card), 0 0 20px hsl(235 60% 60% / 0.06)",
              }}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
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
            </motion.div>

            {/* Top-right floating label */}
            <motion.div
              className="absolute -top-2 -right-2 md:-top-3 md:-right-3 rounded-lg px-2.5 py-1.5 border border-primary/15"
              style={{
                background: "hsl(var(--card) / 0.7)",
                backdropFilter: "blur(16px)",
              }}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 5, delay: 1, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] font-medium text-foreground">AI Active</span>
              </div>
            </motion.div>

            {/* Spatial coordinates label */}
            <motion.div
              className="absolute top-3 left-3 md:top-4 md:left-4"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="font-mono text-[8px] md:text-[9px] text-primary/40 space-y-0.5">
                <div>x: 4.2m</div>
                <div>y: 3.1m</div>
                <div>z: 2.8m</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
