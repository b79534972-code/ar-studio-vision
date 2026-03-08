import { useEffect, useRef } from "react";

const AnimatedGradientBg = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let t = 0;
    let animId: number;

    const animate = () => {
      t += 0.0003; // Very slow
      const x1 = 20 + Math.sin(t) * 15;
      const y1 = 30 + Math.cos(t * 0.7) * 20;
      const x2 = 70 + Math.sin(t * 0.5 + 1) * 15;
      const y2 = 60 + Math.cos(t * 0.8 + 2) * 15;
      const x3 = 50 + Math.sin(t * 0.3 + 3) * 20;
      const y3 = 80 + Math.cos(t * 0.6 + 1) * 15;

      el.style.background = `
        radial-gradient(ellipse at ${x1}% ${y1}%, hsla(235, 60%, 52%, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at ${x2}% ${y2}%, hsla(200, 70%, 55%, 0.04) 0%, transparent 45%),
        radial-gradient(ellipse at ${x3}% ${y3}%, hsla(265, 50%, 58%, 0.04) 0%, transparent 50%),
        linear-gradient(180deg, hsl(225, 25%, 97%) 0%, hsl(225, 30%, 95%) 50%, hsl(230, 28%, 96%) 100%)
      `;
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        background: "linear-gradient(180deg, hsl(225, 25%, 97%) 0%, hsl(225, 30%, 95%) 50%, hsl(230, 28%, 96%) 100%)",
      }}
    />
  );
};

export default AnimatedGradientBg;
