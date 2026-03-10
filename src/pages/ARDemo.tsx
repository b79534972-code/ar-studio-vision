/**
 * ARDemo Page — Platform-aware AR experience
 *
 * - WebXR (Android): Full AR session with HUD + toolbar (gesture-only rotate/scale)
 * - Desktop: Clean 3D viewer with OrbitControls + QR code for mobile AR
 * - iOS Quick Look: Should never reach this page (handled by ARLaunchButton)
 *
 * Supports `?model=<base64 JSON>` to receive furniture metadata from QR codes.
 */

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Smartphone, Loader2, Ruler, Palette, Monitor } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAREngine } from "@/ar";
import ARSessionHUD from "@/components/ar/ARSessionHUD";
import ARToolbar from "@/components/ar/ARToolbar";
import SaveLayoutModal from "@/components/ar/SaveLayoutModal";
import ARColorPicker from "@/components/ar/ARColorPicker";
import { useIsTouchDevice } from "@/hooks/use-touch-device";
import { decodeSharePayload, encodeSharePayload } from "@/lib/arShare";

/** Model metadata that can be passed via QR code URL */
interface ModelMetadata {
  name: string;
  color: string;
  category?: string;
  material?: string;
  dimensions: { width: number; height: number; depth: number };
  modelUrl?: string;
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

const ARDemo = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const isTouchDevice = useIsTouchDevice();

  // Parse model metadata from URL if present
  const modelData = useMemo<ModelMetadata>(() => {
    const param = searchParams.get("model");
    if (param) {
      const decoded = decodeSharePayload<ModelMetadata>(param);
      if (decoded?.name && decoded.dimensions) return decoded;
    }
    return DEFAULT_MODEL;
  }, [searchParams]);

  // Build mobile AR URL with model metadata encoded
  const mobileARUrl = useMemo(() => {
    const encoded = encodeSharePayload(modelData);
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
    setSessionStarted(false);
  };

  const handleGoBack = () => {
    disposeEngine();
    navigate(-1);
  };

  const showPreSession = !sessionStarted && !error;
  const showWebXRHUD =
    sessionStarted && !error && isWebXR &&
    (engineState === "scanning" || engineState === "ready" || engineState === "placed");
  const showDesktopViewer = sessionStarted && !error && isDesktop;

  return (
    <div ref={containerRef} className="fixed inset-0 bg-foreground/95 select-none">
      {/* ========== Pre-session start screen ========== */}
      {showPreSession && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 px-6 overflow-y-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 text-center max-w-sm w-full"
          >
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
              {isDesktop ? (
                <Monitor className="w-9 h-9 text-primary-foreground" />
              ) : (
                <Smartphone className="w-9 h-9 text-primary-foreground" />
              )}
            </div>

            <h2 className="font-display text-2xl font-bold text-primary-foreground">
              {isDesktop ? "3D Viewer & AR" : "AR Experience"}
            </h2>

            {/* Show model info if custom model data was passed */}
            {isCustomModel && (
              <div className="bg-card/10 backdrop-blur-md border border-border/20 rounded-xl px-5 py-3 space-y-1.5 w-full">
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
                ? "View this furniture in an interactive 3D viewer. Scan the QR code below with a phone to launch AR."
                : "Place this furniture in your space using your device camera and WebXR Hit-Test."}
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

            {/* QR Code — shown on desktop for mobile AR scanning */}
            {!detecting && isDesktop && (
              <div className="bg-card rounded-2xl p-4 shadow-elevated border border-border/50 space-y-4 w-full">
                <div className="bg-white rounded-xl p-4 inline-block border border-border/30">
                  <QRCodeSVG
                    value={mobileARUrl}
                    size={180}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="hsl(var(--foreground))"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Scan with phone or tablet for mobile AR experience
                </p>
              </div>
            )}

            {/* Action button — always shown */}
            {!detecting && (
              <Button variant="hero" size="lg" className="w-full" onClick={handleStartSession}>
                {isDesktop ? "Open 3D Viewer" : "Start AR Session"}
              </Button>
            )}

            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={handleGoBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </motion.div>
        </div>
      )}

      {/* ========== Desktop 3D viewer — back button overlay ========== */}
      {showDesktopViewer && (
        <div className="absolute top-4 left-4 z-20">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-card/80 backdrop-blur-sm"
            onClick={handleEndSession}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      )}

      {/* ========== Error overlay ========== */}
      {error && (
        <div className="absolute inset-0 z-30 flex items-center justify-center px-6">
          <div className="bg-card rounded-2xl p-8 max-w-sm text-center shadow-elevated border border-border/50">
            <p className="text-destructive font-semibold mb-2">Error</p>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <Button variant="hero" onClick={handleGoBack}>
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

      {/* ========== Save modal ========== */}
      <SaveLayoutModal open={showSaveModal} onClose={() => setShowSaveModal(false)} />
    </div>
  );
};

export default ARDemo;
