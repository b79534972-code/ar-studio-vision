import { useEffect, useState } from "react";

export const useMouseParallax = (sensitivity = 0.02) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setOffset({
        x: (e.clientX - cx) * sensitivity,
        y: (e.clientY - cy) * sensitivity,
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [sensitivity]);

  return offset;
};
