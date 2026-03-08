import { useEffect, useRef } from "react";

const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: {
      x: number; y: number; vx: number; vy: number;
      r: number; o: number; depth: number; baseO: number;
    }[] = [];
    const count = 55;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouse);

    for (let i = 0; i < count; i++) {
      const depth = Math.random(); // 0 = far, 1 = near
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (0.1 + depth * 0.3),
        vy: (Math.random() - 0.5) * (0.1 + depth * 0.3),
        r: 0.5 + depth * 2,
        o: 0,
        baseO: 0.04 + depth * 0.15,
        depth,
      });
    }

    let time = 0;
    const draw = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach((p) => {
        // Parallax based on depth
        const parallaxX = (mx - canvas.width / 2) * p.depth * 0.008;
        const parallaxY = (my - canvas.height / 2) * p.depth * 0.008;

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        // Subtle breathing
        p.o = p.baseO + Math.sin(time + p.x * 0.01) * 0.03;

        const drawX = p.x + parallaxX;
        const drawY = p.y + parallaxY;

        // Glow for larger particles
        if (p.depth > 0.6) {
          const grad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, p.r * 3);
          grad.addColorStop(0, `hsla(235, 60%, 60%, ${p.o * 0.4})`);
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.fillRect(drawX - p.r * 3, drawY - p.r * 3, p.r * 6, p.r * 6);
        }

        ctx.beginPath();
        ctx.arc(drawX, drawY, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(235, 60%, 60%, ${p.o})`;
        ctx.fill();
      });

      // Connections between nearby particles (depth-aware)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          if (Math.abs(particles[i].depth - particles[j].depth) > 0.4) continue;
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const avgDepth = (particles[i].depth + particles[j].depth) / 2;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(235, 60%, 60%, ${0.04 * avgDepth * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
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
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
};

export default ParticleField;
