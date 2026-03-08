/**
 * ARDemo Page — Platform-aware AR experience
 *
 * - WebXR (Android): Full AR session with HUD + toolbar (gesture-only rotate/scale)
 * - Desktop: Clean 3D viewer with OrbitControls, no AR HUD
 * - iOS Quick Look: Should never reach this page (handled by ARLaunchButton)
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, Monitor, Loader2, QrCode, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAREngine } from "@/ar";
import ARSessionHUD from "@/components/ar/ARSessionHUD";
import ARToolbar from "@/components/ar/ARToolbar";
import SaveLayoutModal from "@/components/ar/SaveLayoutModal";
import ARColorPicker from "@/components/ar/ARColorPicker";

const ARDemo = () => {
  const navigate = useNavigate();
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Build mobile AR URL for QR code
  const mobileARUrl = `${window.location.origin}/ar-demo`;

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
    glb: "/models/sofa.glb",
    usdz: "/models/sofa.usdz",
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

      {/* ========== Desktop back button (no HUD) ========== */}
      {sessionStarted && !error && isDesktop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 left-4 z-10"
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
      )}

      {/* ========== Save modal ========== */}
      <SaveLayoutModal open={showSaveModal} onClose={() => setShowSaveModal(false)} />
    </div>
  );
};

export default ARDemo;
