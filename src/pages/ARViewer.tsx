/**
 * AR Viewer — Mobile-optimized page for viewing room layouts in AR.
 * Accessed via QR code scanned from the Room Editor AR Preview modal.
 * Falls back to 3D viewer on desktop / unsupported devices.
 */

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Smartphone, Loader2, AlertTriangle, RotateCcw, Move } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutObject {
  id: string;
  n: string;
  c: string;
  p: [number, number, number];
  r: [number, number, number];
  s: [number, number, number];
  cl: string;
  d: { width: number; height: number; depth: number };
}

interface LayoutData {
  room: { w: number; d: number; h: number };
  objects: LayoutObject[];
}

// Simple furniture shape renderer
function FurnitureBlock({ obj }: { obj: LayoutObject }) {
  const dims = obj.d;
  return (
    <mesh
      position={obj.p}
      rotation={obj.r}
      scale={obj.s}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[dims.width, dims.height, dims.depth]} />
      <meshStandardMaterial color={obj.cl} roughness={0.5} metalness={0.1} />
    </mesh>
  );
}

function RoomFloor({ w, d }: { w: number; d: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color="hsl(225, 14%, 93%)" roughness={0.9} />
    </mesh>
  );
}

const ARViewer = () => {
  const { layoutId } = useParams<{ layoutId: string }>();
  const navigate = useNavigate();
  const [layout, setLayout] = useState<LayoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [arMode, setArMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!layoutId) {
      setError("No layout ID provided");
      setLoading(false);
      return;
    }

    // Try to load from localStorage (set by ARPreviewModal)
    try {
      const stored = localStorage.getItem(`ar-layout-${layoutId}`);
      if (stored) {
        setLayout(JSON.parse(stored));
      } else {
        setError("Layout not found. The QR code may have expired. Please generate a new one from the Room Editor.");
      }
    } catch {
      setError("Failed to load layout data");
    }
    setLoading(false);
  }, [layoutId]);

  // Check WebXR support
  useEffect(() => {
    if ("xr" in navigator) {
      (navigator as any).xr?.isSessionSupported?.("immersive-ar").then((supported: boolean) => {
        if (supported) setArMode(true);
      }).catch(() => {});
    }
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading AR layout…</p>
        </motion.div>
      </div>
    );
  }

  if (error || !layout) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-8 max-w-sm text-center shadow-card border border-border/40"
        >
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <h2 className="font-display font-bold text-lg mb-2">Layout Not Found</h2>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <Button variant="default" onClick={() => navigate("/")}>
            Go Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-14 bg-card/90 backdrop-blur-md border-b border-border/40 flex items-center px-4 gap-3 shrink-0 z-10"
      >
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => navigate("/")}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Button>
        <div className="h-5 w-px bg-border/40" />
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-primary" />
          <h1 className="font-display text-sm font-bold text-foreground">AR Viewer</h1>
        </div>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {layout.room.w}m × {layout.room.d}m • {layout.objects.length} objects
        </span>
      </motion.div>

      {/* Hints bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-accent/60 border-b border-border/20 px-4 py-2 flex items-center justify-center gap-4 text-[11px] text-muted-foreground shrink-0"
      >
        <span className="flex items-center gap-1.5">
          <RotateCcw className="w-3 h-3" /> Drag to rotate
        </span>
        <span className="flex items-center gap-1.5">
          <Move className="w-3 h-3" /> Pinch to zoom
        </span>
        {arMode && (
          <span className="flex items-center gap-1.5 text-primary font-medium">
            <Smartphone className="w-3 h-3" /> AR Available
          </span>
        )}
      </motion.div>

      {/* 3D Canvas */}
      <div className="flex-1">
        <Canvas
          shadows
          camera={{ position: [layout.room.w, layout.room.w * 0.8, layout.room.d], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          <RoomFloor w={layout.room.w} d={layout.room.d} />

          {layout.objects.map((obj, i) => (
            <FurnitureBlock key={i} obj={obj} />
          ))}

          <ContactShadows
            position={[0, -0.005, 0]}
            opacity={0.3}
            scale={Math.max(layout.room.w, layout.room.d) * 1.5}
            blur={2}
          />
          <Environment preset="apartment" />
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            maxPolarAngle={Math.PI / 2}
            minDistance={1}
            maxDistance={20}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default ARViewer;
