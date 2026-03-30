/**
 * AR Object Viewer — Mobile-optimized page for viewing a single furniture item in AR.
 * Accessed via QR code from the Furniture Library.
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Smartphone, Loader2, AlertTriangle, RotateCcw, Move, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";

interface FurniturePayload {
  id: string;
  name: string;
  category: string;
  color: string;
  material: string;
  dimensions: { width: number; height: number; depth: number };
}

function FurnitureModel({ data }: { data: FurniturePayload }) {
  const { width, height, depth } = data.dimensions;

  return (
    <group>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={data.color} roughness={0.45} metalness={0.1} />
      </mesh>
      {/* Subtle base shadow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <circleGeometry args={[Math.max(width, depth) * 0.8, 32]} />
        <meshStandardMaterial color="hsl(225, 14%, 90%)" roughness={1} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function FloorGrid() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="hsl(225, 14%, 93%)" roughness={0.9} />
    </mesh>
  );
}

const ARObjectViewer = () => {
  const { furnitureId } = useParams<{ furnitureId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<FurniturePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [arAvailable, setArAvailable] = useState(false);

  useEffect(() => {
    if (!furnitureId) {
      setError("No furniture ID provided");
      setLoading(false);
      return;
    }
    try {
      const stored = localStorage.getItem(`ar-object-${furnitureId}`);
      if (stored) {
        setData(JSON.parse(stored));
      } else {
        setError("Furniture data not found. The QR code may have expired. Please generate a new one.");
      }
    } catch {
      setError("Failed to load furniture data");
    }
    setLoading(false);
  }, [furnitureId]);

  useEffect(() => {
    if ("xr" in navigator) {
      (navigator as any).xr?.isSessionSupported?.("immersive-ar").then((supported: boolean) => {
        if (supported) setArAvailable(true);
      }).catch(() => {});
    }
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading furniture model…</p>
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-8 max-w-sm text-center shadow-card border border-border/40"
        >
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <h2 className="font-display font-bold text-lg mb-2">Furniture Not Found</h2>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <Button variant="default" onClick={() => navigate("/")}>Go Home</Button>
        </motion.div>
      </div>
    );
  }

  const maxDim = Math.max(data.dimensions.width, data.dimensions.height, data.dimensions.depth);
  const camDist = maxDim * 2.5;

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-14 bg-card/90 backdrop-blur-md border-b border-border/40 flex items-center px-4 gap-3 shrink-0 z-10"
      >
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Button>
        <div className="h-5 w-px bg-border/40" />
        <div className="flex items-center gap-2 min-w-0">
          <Smartphone className="w-4 h-4 text-primary shrink-0" />
          <h1 className="font-display text-sm font-bold text-foreground truncate">{data.name}</h1>
        </div>
      </motion.div>

      {/* Info bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-accent/60 border-b border-border/20 px-4 py-2 flex items-center justify-center gap-4 text-[11px] text-muted-foreground shrink-0 flex-wrap"
      >
        <span className="flex items-center gap-1.5">
          <Maximize2 className="w-3 h-3" />
          {(data.dimensions.width * 100).toFixed(0)} × {(data.dimensions.depth * 100).toFixed(0)} × {(data.dimensions.height * 100).toFixed(0)} cm
        </span>
        <span className="w-px h-3 bg-border/40" />
        <span>{data.material}</span>
        <span className="w-px h-3 bg-border/40" />
        <span className="flex items-center gap-1.5">
          <RotateCcw className="w-3 h-3" /> Drag to rotate
        </span>
        <span className="flex items-center gap-1.5">
          <Move className="w-3 h-3" /> Pinch to zoom
        </span>
        {arAvailable && (
          <span className="flex items-center gap-1.5 text-primary font-medium">
            <Smartphone className="w-3 h-3" /> AR Available
          </span>
        )}
      </motion.div>

      {/* 3D Canvas */}
      <div className="flex-1">
        <Canvas
          shadows
          camera={{ position: [camDist * 0.7, camDist * 0.6, camDist * 0.7], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[3, 6, 4]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          <FloorGrid />
          <FurnitureModel data={data} />

          <ContactShadows
            position={[0, -0.005, 0]}
            opacity={0.35}
            scale={maxDim * 4}
            blur={2.5}
          />
          <Environment preset="apartment" />
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            maxPolarAngle={Math.PI / 2}
            minDistance={maxDim * 0.5}
            maxDistance={maxDim * 6}
            target={[0, data.dimensions.height / 2, 0]}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default ARObjectViewer;
