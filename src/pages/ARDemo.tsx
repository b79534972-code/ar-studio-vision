/**
 * ARDemo Page — Platform-aware AR experience
 *
 * - WebXR (Android): Full AR session with HUD + toolbar (gesture-only rotate/scale)
 * - Desktop: Clean 3D viewer with OrbitControls, no AR HUD
 * - iOS Quick Look: Should never reach this page (handled by ARLaunchButton)
 *
 * Supports `?model=<base64 JSON>` to receive furniture metadata from QR codes.
 */

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Smartphone, Monitor, Loader2, QrCode, X, Ruler, Palette } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAREngine } from "@/ar";
import ARSessionHUD from "@/components/ar/ARSessionHUD";
import ARToolbar from "@/components/ar/ARToolbar";
import SaveLayoutModal from "@/components/ar/SaveLayoutModal";
import ARColorPicker from "@/components/ar/ARColorPicker";

/** Model metadata that can be passed via QR code URL */
interface ModelMetadata {
  name: string;
  color: string;
  category?: string;
  material?: string;
  dimensions: { width: number; height: number; depth: number };
  /** URL to .glb model — used by WebXR & Desktop viewer */
  modelUrl?: string;
  /** URL to .usdz model — used by iOS AR Quick Look */
  usdzUrl?: string;
}

const DEFAULT_MODEL: ModelMetadata = {
  name: "Demo Sofa",
  color: "#4355db",
  category: "sofa",
  material: "Fabric",
  dimensions: { width: 1.8, height: 0.8, depth: 0.8 },
  modelUrl: "/models/sofa.glb",
  usdzUrl: "/models/sofa.usdz",
};

/** Encode model data to base64 for URL */
function encodeModelData(data: ModelMetadata): string {
  return btoa(JSON.stringify(data));
}

/** Decode model data from base64 URL param */
function decodeModelData(encoded: string): ModelMetadata | null {
  try {
    const parsed = JSON.parse(atob(encoded));
    if (parsed && parsed.name && parsed.dimensions) return parsed as ModelMetadata;
  } catch { /* invalid */ }
  return null;
}

const ARDemo = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Parse model metadata from URL if present
  const modelData = useMemo<ModelMetadata>(() => {
    const param = searchParams.get("model");
    if (param) {
      const decoded = decodeModelData(param);
      if (decoded) return decoded;
    }
    return DEFAULT_MODEL;
  }, [searchParams]);

  // Build mobile AR URL with model metadata encoded
  const mobileARUrl = useMemo(() => {
    const encoded = encodeModelData(modelData);
    return `${window.location.origin}/ar-demo?model=${encoded}`;
  }, [modelData]);

  const isCustomModel = searchParams.has("model");

  const {
    platform,
    detectionReason,
    detecting,
    engineState,
    error,
    startEngine,
    disposeEngine,
    resetPlacement,
    containerRef,
  } = useAREngine({
    glb: modelData.modelUrl || "/models/sofa.glb",
    usdz: modelData.usdzUrl || "/models/sofa.usdz",
  });

  const isDesktop = platform === "desktop";
  const isWebXR = platform === "webxr";

  const handleStartSession = async () => {
    await startEngine();
    setSessionStarted(true);
  };

  const handleEndSession = () => {
    disposeEngine();
    navigate(-1);
  };

  const showPreSession = !sessionStarted && !error;
  const showWebXRHUD =
    sessionStarted && !error && isWebXR &&
    (engineState === "scanning" || engineState === "ready" || engineState === "placed");

  return (
    <div ref={containerRef} className="fixed inset-0 bg-foreground/95 select-none">
      {/* ========== Pre-session start screen ========== */}
      {showPreSession && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
              {isDesktop ? (
                <Monitor className="w-9 h-9 text-primary-foreground" />
              ) : (
                <Smartphone className="w-9 h-9 text-primary-foreground" />
              )}
            </div>

            <h2 className="font-display text-2xl font-bold text-primary-foreground">
              {isDesktop ? "3D Furniture Viewer" : "WebXR AR Demo"}
            </h2>

            {/* Show model info if custom model data was passed */}
            {isCustomModel && (
              <div className="bg-card/10 backdrop-blur-md border border-border/20 rounded-xl px-5 py-3 space-y-1.5 max-w-xs w-full">
                <p className="font-display font-semibold text-primary-foreground text-sm">{modelData.name}</p>
                <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Ruler className="w-3 h-3" />
                    {(modelData.dimensions.width * 100).toFixed(0)} × {(modelData.dimensions.depth * 100).toFixed(0)} × {(modelData.dimensions.height * 100).toFixed(0)} cm
                  </span>
                  <span className="flex items-center gap-1">
                    <Palette className="w-3 h-3" />
                    <span className="w-3 h-3 rounded-full border border-border/30" style={{ backgroundColor: modelData.color }} />
                    {modelData.material || "Mixed"}
                  </span>
                </div>
              </div>
            )}

            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
              {isDesktop
                ? "Explore furniture in 3D with orbit controls. Rotate, zoom, and inspect from every angle."
                : "This demo uses your device camera and WebXR Hit-Test to place real-size furniture on detected surfaces."}
            </p>

            {detecting && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                Detecting platform…
              </div>
            )}

            {!detecting && detectionReason && (
              <p className="text-muted-foreground/60 text-[11px] bg-secondary/40 rounded-full px-3 py-1">
                {detectionReason}
              </p>
            )}

            {!detecting && (
              <Button variant="hero" size="lg" onClick={handleStartSession}>
                {isDesktop ? "Open 3D Viewer" : "Start AR Session"}
              </Button>
            )}

            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </motion.div>
        </div>
      )}

      {/* ========== Error overlay ========== */}
      {error && (
        <div className="absolute inset-0 z-30 flex items-center justify-center px-6">
          <div className="bg-card rounded-2xl p-8 max-w-sm text-center shadow-elevated border border-border/50">
            <p className="text-destructive font-semibold mb-2">Error</p>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <Button variant="hero" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      )}

      {/* ========== WebXR HUD (Android only) ========== */}
      {showWebXRHUD && (
        <>
          <ARSessionHUD engineState={engineState} onEndSession={handleEndSession} />
          <ARToolbar
            onReset={resetPlacement}
            onSave={() => setShowSaveModal(true)}
            onColor={() => setShowColorPicker(true)}
          />
          <ARColorPicker
            open={showColorPicker}
            onClose={() => setShowColorPicker(false)}
          />
        </>
      )}

      {/* ========== Desktop: back button + QR + model info ========== */}
      {sessionStarted && !error && isDesktop && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 left-4 z-10 flex gap-2"
          >
            <Button
              variant="ghost"
              size="sm"
              className="bg-card/80 backdrop-blur-md border border-border/40"
              onClick={handleEndSession}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </motion.div>

          {/* Model info badge — top right */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-4 right-4 z-10 bg-card/80 backdrop-blur-md border border-border/40 rounded-lg px-4 py-2.5 flex items-center gap-3"
          >
            <span
              className="w-5 h-5 rounded-md border border-border/30 shrink-0"
              style={{ backgroundColor: modelData.color }}
            />
            <div className="text-left">
              <p className="text-xs font-semibold text-foreground leading-tight">{modelData.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {(modelData.dimensions.width * 100).toFixed(0)} × {(modelData.dimensions.depth * 100).toFixed(0)} × {(modelData.dimensions.height * 100).toFixed(0)} cm
                {modelData.material ? ` · ${modelData.material}` : ""}
              </p>
            </div>
          </motion.div>

          {/* QR Code button — bottom right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-6 right-6 z-10"
          >
            <Button
              variant="ghost"
              size="sm"
              className="bg-card/80 backdrop-blur-md border border-border/40 gap-2"
              onClick={() => setShowQR(true)}
            >
              <QrCode className="w-4 h-4" />
              View on Phone
            </Button>
          </motion.div>

          {/* QR Code overlay */}
          <AnimatePresence>
            {showQR && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 flex items-center justify-center bg-foreground/60 backdrop-blur-sm"
                onClick={() => setShowQR(false)}
              >
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ type: "spring", damping: 22, stiffness: 300 }}
                  className="relative bg-card rounded-2xl p-6 shadow-elevated border border-border/50 max-w-sm w-full mx-4 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowQR(false)}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-6 h-6 text-primary-foreground" />
                  </div>

                  <h3 className="font-display text-lg font-bold text-foreground mb-1">
                    View in AR on your phone
                  </h3>

                  {/* Model metadata in QR modal */}
                  <div className="bg-muted/50 rounded-lg px-4 py-2.5 mb-4 inline-flex items-center gap-3 border border-border/20">
                    <span
                      className="w-6 h-6 rounded-md border border-border/30 shrink-0"
                      style={{ backgroundColor: modelData.color }}
                    />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-foreground leading-tight">{modelData.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {(modelData.dimensions.width * 100).toFixed(0)} × {(modelData.dimensions.depth * 100).toFixed(0)} × {(modelData.dimensions.height * 100).toFixed(0)} cm
                        {modelData.material ? ` · ${modelData.material}` : ""}
                      </p>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4">
                    Scan to see <strong className="text-foreground">{modelData.name}</strong> in your real space
                  </p>

                  <div className="bg-background rounded-xl p-4 inline-block mb-4 border border-border/30">
                    <QRCodeSVG
                      value={mobileARUrl}
                      size={180}
                      level="M"
                      bgColor="transparent"
                      fgColor="hsl(var(--foreground))"
                    />
                  </div>

                  <p className="text-muted-foreground/60 text-[11px]">
                    Model data is encoded in the QR — works on iOS & Android
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ========== Save modal ========== */}
      <SaveLayoutModal open={showSaveModal} onClose={() => setShowSaveModal(false)} />
    </div>
  );
};

export default ARDemo;
