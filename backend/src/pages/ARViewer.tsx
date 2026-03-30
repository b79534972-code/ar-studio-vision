/**
 * AR Viewer — Mobile-optimized page for viewing room layouts in AR.
 * Accessed via QR code scanned from the Room Editor AR Preview modal.
 * Falls back to 3D viewer on desktop / unsupported devices.
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Smartphone, Loader2, AlertTriangle, RotateCcw, Move } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useIsTouchDevice } from "@/hooks/use-touch-device";
import { decodeSharePayload } from "@/lib/arShare";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface LayoutObject {
  id: string;
  n: string;
  c: string;
  m?: string;
  u?: string;
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

function FurnitureBlock({ obj }: { obj: LayoutObject }) {
  const dims = obj.d;

  const [modelScene, setModelScene] = useState<THREE.Object3D | null>(null);
  const [modelFailed, setModelFailed] = useState(false);

  useEffect(() => {
    if (!obj.m) {
      setModelScene(null);
      setModelFailed(false);
      return;
    }

    let cancelled = false;
    const loader = new GLTFLoader();

    setModelFailed(false);
    loader.load(
      obj.m,
      (gltf) => {
        if (cancelled) return;
        setModelScene(gltf.scene.clone(true));
      },
      undefined,
      () => {
        if (cancelled) return;
        setModelScene(null);
        setModelFailed(true);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [obj.m]);

  const modelTransform = useMemo(() => {
    if (!modelScene) {
      return {
        scale: 1,
        position: [0, 0, 0] as [number, number, number],
      };
    }

    const box = new THREE.Box3().setFromObject(modelScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const safeW = size.x || 1;
    const safeH = size.y || 1;
    const safeD = size.z || 1;
    const fitScale = Math.min(dims.width / safeW, dims.height / safeH, dims.depth / safeD);

    return {
      scale: fitScale,
      position: [
        -center.x * fitScale,
        -box.min.y * fitScale,
        -center.z * fitScale,
      ] as [number, number, number],
    };
  }, [modelScene, dims.width, dims.height, dims.depth]);

  const showFallbackGeometry = !modelScene || modelFailed;

  return (
    <group position={obj.p} rotation={obj.r} scale={obj.s}>
      {modelScene && !modelFailed && (
        <primitive
          object={modelScene}
          position={modelTransform.position}
          scale={modelTransform.scale}
        />
      )}

      {showFallbackGeometry && (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[dims.width, dims.height, dims.depth]} />
          <meshStandardMaterial color={obj.cl} roughness={0.5} metalness={0.1} />
        </mesh>
      )}
    </group>
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
  const [searchParams] = useSearchParams();
  const [layout, setLayout] = useState<LayoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [arMode, setArMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTouchDevice = useIsTouchDevice();
  const shareUrl = window.location.href;
  const showDesktopQR = !isTouchDevice;

  useEffect(() => {
    if (!layoutId) {
      setError("No layout ID provided");
      setLoading(false);
      return;
    }

    const sharedLayout = decodeSharePayload<LayoutData>(searchParams.get("payload"));

    try {
      if (sharedLayout) {
        setLayout(sharedLayout);
        localStorage.setItem(`ar-layout-${layoutId}`, JSON.stringify(sharedLayout));
      } else {
        const stored = localStorage.getItem(`ar-layout-${layoutId}`);
        if (stored) {
          setLayout(JSON.parse(stored));
        } else {
          setError("Layout not found. The QR code may have expired. Please generate a new one from the Room Editor.");
        }
      }
    } catch {
      setError("Failed to load layout data");
    }
    setLoading(false);
  }, [layoutId, searchParams]);

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

  if (showDesktopQR) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col">
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
            <h1 className="font-display text-sm font-bold text-foreground truncate">Open AR on phone or tablet</h1>
          </div>
          <span className="text-[10px] text-muted-foreground ml-auto">
            {layout.room.w}m × {layout.room.d}m • {layout.objects.length} objects
          </span>
        </motion.div>

        <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-background to-accent/40">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full rounded-3xl border border-border/40 bg-card/90 backdrop-blur p-6 text-center shadow-elevated space-y-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Smartphone className="w-7 h-7 text-primary" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-xl font-bold text-foreground">Scan to continue in AR</h2>
              <p className="text-sm text-muted-foreground">
                This room layout is meant to open on a phone or tablet. Scan the QR code below to view it on a mobile device.
              </p>
            </div>

            <div className="mx-auto w-fit rounded-2xl border border-border/30 bg-white p-4 shadow-soft">
              <QRCodeSVG
                value={shareUrl}
                size={220}
                level="M"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="hsl(var(--foreground))"
              />
            </div>

            <div className="rounded-2xl bg-accent/50 px-4 py-3 text-left text-sm text-muted-foreground space-y-1">
              <p><span className="font-semibold text-foreground">1.</span> Open the camera app on your phone or tablet.</p>
              <p><span className="font-semibold text-foreground">2.</span> Scan this QR code.</p>
              <p><span className="font-semibold text-foreground">3.</span> Open the link to launch the mobile AR viewer.</p>
            </div>
          </motion.div>
        </div>
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
