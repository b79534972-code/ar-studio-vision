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
<<<<<<< HEAD
import { ArrowLeft, Smartphone, Loader2, Ruler, Palette, Monitor, X, Eye, EyeOff } from "lucide-react";
=======
import { ArrowLeft, Smartphone, Loader2, Ruler, Palette, Monitor } from "lucide-react";
>>>>>>> a93783387677c98379d47214b58d5647e53ffeb6
import { QRCodeSVG } from "qrcode.react";
import { useAREngine } from "@/ar";
import ARSessionHUD from "@/components/ar/ARSessionHUD";
import ARToolbar from "@/components/ar/ARToolbar";
import SaveLayoutModal from "@/components/ar/SaveLayoutModal";
import ARColorPicker from "@/components/ar/ARColorPicker";
import { useIsTouchDevice } from "@/hooks/use-touch-device";
import { decodeSharePayload, encodeSharePayload } from "@/lib/arShare";
import type { ARPlatform } from "@/ar/types";

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
  modelUrl: "/models/demo_sofa.glb",
  usdzUrl: "/models/demo_sofa.usdz",
};

const ARDemo = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);
  const [showViewerHelp, setShowViewerHelp] = useState(true);
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
    const url = new URL("/ar-demo", window.location.origin);
    url.searchParams.set("model", encoded);
    url.searchParams.set("mode", "ar");
    return url.toString();
  }, [modelData]);

  const isCustomModel = searchParams.has("model");
  const requestedMode = searchParams.get("mode");
  const isForcedViewerMode = requestedMode === "viewer";
  const isForcedARMode = requestedMode === "ar";

  const forcedPlatform = useMemo<ARPlatform | undefined>(() => {
    if (requestedMode === "viewer") return "desktop";
    if (requestedMode === "ar") return undefined;
    return undefined;
  }, [requestedMode]);

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
    glb: modelData.modelUrl || "/models/demo_sofa.glb",
    usdz: modelData.usdzUrl || "/models/demo_sofa.usdz",
    forcePlatform: forcedPlatform,
  });

  const isDesktop = platform === "desktop";
  const isWebXR = platform === "webxr";
<<<<<<< HEAD
  const qrSize = isTouchDevice
    ? (isForcedViewerMode ? 132 : 144)
    : (isForcedViewerMode ? 164 : 180);
  const titleText = isDesktop
    ? (isForcedViewerMode ? "3D Viewer" : "3D Viewer & AR")
    : (isForcedARMode ? "AR Camera" : "AR Experience");
  const subtitleText = isDesktop
    ? "Inspect the model in a desktop-style 3D scene with grid and orbit controls."
    : "Place this furniture in your space using your device camera.";
=======
>>>>>>> a93783387677c98379d47214b58d5647e53ffeb6

  const handleStartSession = async () => {
    await startEngine();
    setSessionStarted(true);
    setShowViewerHelp(true);
  };

  const handleEndSession = () => {
    disposeEngine();
    setSessionStarted(false);
<<<<<<< HEAD
    setQrExpanded(false);
=======
>>>>>>> a93783387677c98379d47214b58d5647e53ffeb6
  };

  const handleGoBack = () => {
    disposeEngine();
<<<<<<< HEAD
    setQrExpanded(false);
=======
>>>>>>> a93783387677c98379d47214b58d5647e53ffeb6
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
<<<<<<< HEAD
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 sm:px-6 py-4 sm:py-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full max-h-[100dvh] w-full max-w-sm flex flex-col items-center justify-center gap-3 sm:gap-4 text-center"
          >
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full gradient-primary flex items-center justify-center shadow-elevated max-[760px]:w-12 max-[760px]:h-12">
              {isDesktop ? (
                <Monitor className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground max-[760px]:w-5 max-[760px]:h-5" />
=======
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 px-6 overflow-y-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 text-center max-w-sm w-full"
          >
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
              {isDesktop ? (
                <Monitor className="w-9 h-9 text-primary-foreground" />
>>>>>>> a93783387677c98379d47214b58d5647e53ffeb6
              ) : (
                <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground max-[760px]:w-5 max-[760px]:h-5" />
              )}
            </div>

<<<<<<< HEAD
            <div className="inline-flex items-center gap-2 rounded-full border border-border/30 bg-card/20 px-3 py-1 text-[11px] text-primary-foreground/85 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {isForcedViewerMode ? "Viewer Mode" : isForcedARMode ? "AR Mode" : "Auto Mode"}
            </div>

            <h2 className="font-display text-[28px] leading-tight font-bold text-primary-foreground max-[760px]:text-[24px]">
              {titleText}
=======
            <h2 className="font-display text-2xl font-bold text-primary-foreground">
              {isDesktop ? "3D Viewer & AR" : "AR Experience"}
>>>>>>> a93783387677c98379d47214b58d5647e53ffeb6
            </h2>

            {/* Show model info if custom model data was passed */}
            {isCustomModel && (
<<<<<<< HEAD
              <div className="bg-card/20 backdrop-blur-md border border-border/30 rounded-2xl px-4 py-2.5 space-y-1 w-full">
=======
              <div className="bg-card/10 backdrop-blur-md border border-border/20 rounded-xl px-5 py-3 space-y-1.5 w-full">
>>>>>>> a93783387677c98379d47214b58d5647e53ffeb6
                <p className="font-display font-semibold text-primary-foreground text-sm">{modelData.name}</p>
                <div className="flex items-center justify-center gap-3 text-[11px] text-primary-foreground/75 max-[760px]:text-[10px]">
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

<<<<<<< HEAD
            <p className="text-primary-foreground/75 max-w-xs text-sm leading-relaxed max-[760px]:text-xs">
              {subtitleText}
=======
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
              {isDesktop
                ? "View this furniture in an interactive 3D viewer. Scan the QR code below with a phone to launch AR."
                : "Place this furniture in your space using your device camera and WebXR Hit-Test."}
>>>>>>> a93783387677c98379d47214b58d5647e53ffeb6
            </p>

            {detecting && (
              <div className="flex items-center gap-2 text-primary-foreground/70 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                Detecting platform…
              </div>
            )}

            {!detecting && detectionReason && !requestedMode && (
              <p className="text-primary-foreground/60 text-[11px] bg-secondary/25 rounded-full px-3 py-1">
                {detectionReason}
              </p>
            )}

            {/* QR Code — shown on desktop for mobile AR scanning */}
            {!detecting && isDesktop && (
<<<<<<< HEAD
              <div className="rounded-2xl p-3 border border-white/12 bg-slate-900/34 backdrop-blur-md shadow-[0_14px_36px_rgba(2,6,23,0.34)] space-y-2.5 w-full">
                <button
                  type="button"
                  onClick={() => setQrExpanded(true)}
                  className="group mx-auto inline-block rounded-2xl bg-slate-950/10 p-2 border border-white/20 transition-transform duration-200 ease-out hover:scale-[1.03]"
                  aria-label="Enlarge QR code"
                >
                  <div className="rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-inner shadow-slate-900/5 transition-shadow duration-200 group-hover:shadow-[0_8px_20px_rgba(15,23,42,0.18)]">
                    <QRCodeSVG
                      value={mobileARUrl}
                      size={qrSize}
                      level="M"
                      includeMargin
                      bgColor="#ffffff"
                      fgColor="#0f172a"
                    />
                  </div>
                </button>
                <p className="text-xs text-primary-foreground/75 leading-relaxed max-[760px]:text-[11px]">
                  Scan with another phone/tablet to open AR mode instantly.
=======
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
>>>>>>> a93783387677c98379d47214b58d5647e53ffeb6
                </p>
              </div>
            )}

            {/* Action button — always shown */}
            {!detecting && (
<<<<<<< HEAD
              <Button
                variant="hero"
                size="lg"
                className="w-auto min-w-[220px] px-6 h-11 max-[760px]:h-10 whitespace-nowrap"
                onClick={handleStartSession}
              >
=======
              <Button variant="hero" size="lg" className="w-full" onClick={handleStartSession}>
>>>>>>> a93783387677c98379d47214b58d5647e53ffeb6
                {isDesktop ? "Open 3D Viewer" : "Start AR Session"}
              </Button>
            )}

            <Button
              variant="ghost"
<<<<<<< HEAD
              className="text-muted-foreground h-9"
=======
              className="text-muted-foreground"
>>>>>>> a93783387677c98379d47214b58d5647e53ffeb6
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
<<<<<<< HEAD
        <>
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

          {showViewerHelp ? (
            <div className="absolute right-4 top-4 z-20 max-w-xs rounded-2xl border border-border/40 bg-card/82 p-4 text-xs text-muted-foreground shadow-elevated backdrop-blur-md">
              <button
                type="button"
                onClick={() => setShowViewerHelp(false)}
                className="absolute top-2 right-2 h-7 w-7 rounded-md border border-border/40 bg-background/70 text-foreground/80 hover:text-foreground flex items-center justify-center"
                aria-label="Hide controls help"
                title="Hide controls"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
              {isTouchDevice ? (
                <>
                  <p className="font-medium text-foreground">Touch controls</p>
                  <p className="mt-2">Drag with one finger to orbit around the furniture.</p>
                  <p className="mt-1">Pinch with two fingers to zoom in and out.</p>
                  <p className="mt-1">Drag with two fingers to pan across the scene.</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-foreground">Laptop controls</p>
                  <p className="mt-2">Drag to orbit around the furniture.</p>
                  <p className="mt-1">Scroll to zoom in and out.</p>
                  <p className="mt-1">Right-click drag to pan across the scene.</p>
                  <p className="mt-3 text-[11px] text-muted-foreground/80">Scan the QR code on the previous screen if you want to place the same item in mobile AR.</p>
                </>
              )}
            </div>
          ) : (
            <div className="absolute right-4 top-4 z-20">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 bg-card/80 backdrop-blur-sm"
                onClick={() => setShowViewerHelp(true)}
              >
                <Eye className="w-4 h-4" />
                Show Controls
              </Button>
            </div>
          )}
        </>
=======
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
>>>>>>> a93783387677c98379d47214b58d5647e53ffeb6
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

      {showPreSession && qrExpanded && (
        <div className="absolute inset-0 z-40 bg-black/72 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setQrExpanded(false)}>
          <div className="relative rounded-2xl bg-card p-4 border border-border/40 shadow-elevated" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setQrExpanded(false)}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border border-border/50 flex items-center justify-center"
              aria-label="Close enlarged QR"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="rounded-xl bg-white p-3 border border-slate-200/80">
              <QRCodeSVG
                value={mobileARUrl}
                size={320}
                level="M"
                includeMargin
                bgColor="#ffffff"
                fgColor="#0f172a"
              />
            </div>
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
