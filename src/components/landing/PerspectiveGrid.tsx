import { useEffect, useRef } from "react";

const PerspectiveGrid = () => {
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

    const draw = () => {
      time += 0.002;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const horizon = canvas.height * 0.35;
      const gridLines = 12;
      const gridCols = 16;
      const pulse = Math.sin(time) * 0.3 + 0.7;

      // Horizontal lines (receding into distance)
      for (let i = 0; i < gridLines; i++) {
        const t = i / gridLines;
        const y = horizon + (canvas.height - horizon) * Math.pow(t, 1.5);
        const spread = 0.3 + t * 0.7;
        const x1 = cx - canvas.width * spread * 0.6;
        const x2 = cx + canvas.width * spread * 0.6;
        const alpha = (0.03 + t * 0.02) * pulse;

        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = `hsla(235, 60%, 60%, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Vertical lines (converging to vanishing point)
      for (let i = 0; i < gridCols; i++) {
        const t = (i / (gridCols - 1)) * 2 - 1; // -1 to 1
        const bottomX = cx + t * canvas.width * 0.6;
        const topX = cx + t * canvas.width * 0.08;
        const alpha = (0.025 - Math.abs(t) * 0.008) * pulse;

        ctx.beginPath();
        ctx.moveTo(topX, horizon);
        ctx.lineTo(bottomX, canvas.height);
        ctx.strokeStyle = `hsla(235, 60%, 60%, ${Math.max(0, alpha)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Vanishing point glow
      const glowAlpha = 0.04 + Math.sin(time * 1.5) * 0.015;
      const grad = ctx.createRadialGradient(cx, horizon, 0, cx, horizon, 120);
      grad.addColorStop(0, `hsla(235, 60%, 60%, ${glowAlpha})`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(cx - 120, horizon - 120, 240, 240);

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

export default PerspectiveGrid;
