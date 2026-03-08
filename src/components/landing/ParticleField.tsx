import { useEffect, useRef } from "react";

const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Floating spatial dots
    const dots: { x: number; y: number; vx: number; vy: number; r: number; o: number; phase: number }[] = [];
    for (let i = 0; i < 30; i++) {
      dots.push({
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.15 + 0.03,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Grid intersection markers
    const markers: { x: number; y: number; phase: number }[] = [];
    for (let i = 0; i < 8; i++) {
      markers.push({
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      time += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle perspective grid lines (horizontal)
      const gridSpacing = 120;
      const gridAlpha = 0.025;
      ctx.strokeStyle = `hsla(235, 60%, 60%, ${gridAlpha})`;
      ctx.lineWidth = 0.5;

      for (let y = 0; y < canvas.height; y += gridSpacing) {
        const offset = Math.sin(time * 0.3 + y * 0.002) * 2;
        ctx.beginPath();
        ctx.moveTo(0, y + offset);
        ctx.lineTo(canvas.width, y + offset);
        ctx.stroke();
      }

      // Vertical grid lines
      for (let x = 0; x < canvas.width; x += gridSpacing) {
        const offset = Math.cos(time * 0.2 + x * 0.002) * 2;
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x + offset, canvas.height);
        ctx.stroke();
      }

      // Grid intersection glow markers
      markers.forEach((m) => {
        const pulse = Math.sin(time * 1.5 + m.phase) * 0.5 + 0.5;
        const mx = m.x % canvas.width;
        const my = m.y % canvas.height;
        const size = 3 + pulse * 2;

        // Cross marker
        ctx.strokeStyle = `hsla(235, 60%, 65%, ${0.08 + pulse * 0.06})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(mx - size, my);
        ctx.lineTo(mx + size, my);
        ctx.moveTo(mx, my - size);
        ctx.lineTo(mx, my + size);
        ctx.stroke();

        // Glow dot at center
        const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, size * 2);
        gradient.addColorStop(0, `hsla(235, 60%, 65%, ${0.1 + pulse * 0.08})`);
        gradient.addColorStop(1, `hsla(235, 60%, 65%, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(mx - size * 2, my - size * 2, size * 4, size * 4);
      });

      // Floating dots with connections
      dots.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const pulse = Math.sin(time * 2 + p.phase) * 0.3 + 0.7;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(210, 70%, 65%, ${p.o * pulse})`;
        ctx.fill();
      });

      // Subtle connections between nearby dots
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `hsla(220, 60%, 65%, ${0.04 * (1 - dist / 180)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
};

export default ParticleField;
