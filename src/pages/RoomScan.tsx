/**
 * Room Scan AI — Upload a room photo, mock-detect walls/floor,
 * and generate a room config for the editor.
 */

import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Upload,
  Camera,
  ScanLine,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Loader2,
  Image as ImageIcon,
  Box,
  Ruler,
} from "lucide-react";

type ScanPhase = "upload" | "processing" | "result";

interface DetectedRoom {
  width: number;
  depth: number;
  height: number;
  wallColor: string;
  floorColor: string;
  confidence: number;
  walls: { id: string; from: [number, number]; to: [number, number] }[];
}

// Mock AI analysis that produces a room config
function mockAnalyzeRoom(): Promise<DetectedRoom> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const w = +(3 + Math.random() * 5).toFixed(1);
      const d = +(3 + Math.random() * 4).toFixed(1);
      resolve({
        width: w,
        depth: d,
        height: 2.7,
        wallColor: "#F5F5F4",
        floorColor: "#D6D3D1",
        confidence: +(75 + Math.random() * 20).toFixed(0),
        walls: [
          { id: "w1", from: [0, 0], to: [w, 0] },
          { id: "w2", from: [w, 0], to: [w, d] },
          { id: "w3", from: [w, d], to: [0, d] },
          { id: "w4", from: [0, d], to: [0, 0] },
        ],
      });
    }, 3500);
  });
}

const RoomScan = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<ScanPhase>("upload");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [detectedRoom, setDetectedRoom] = useState<DetectedRoom | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      startProcessing();
    };
    reader.readAsDataURL(file);
  }, []);

  const startProcessing = useCallback(async () => {
    setPhase("processing");
    setProgress(0);

    // Animate progress
    const steps = [12, 28, 45, 62, 78, 88, 95];
    for (const step of steps) {
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 200));
      setProgress(step);
    }

    const result = await mockAnalyzeRoom();
    setProgress(100);
    await new Promise((r) => setTimeout(r, 400));
    setDetectedRoom(result);
    setPhase("result");
  }, []);

  const handleUseLayout = () => {
    if (!detectedRoom) return;
    // Store detected room config and navigate to editor
    const roomConfig = {
      width: detectedRoom.width,
      depth: detectedRoom.depth,
      height: detectedRoom.height,
      wallColor: detectedRoom.wallColor,
      floorColor: detectedRoom.floorColor,
    };
    sessionStorage.setItem("scanned-room", JSON.stringify(roomConfig));
    navigate("/dashboard/editor?source=scan");
  };

  const handleReset = () => {
    setPhase("upload");
    setImagePreview(null);
    setDetectedRoom(null);
    setProgress(0);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFileSelect(file);
  }, [handleFileSelect]);

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{t("roomScan.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("roomScan.subtitle")}</p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ====== UPLOAD PHASE ====== */}
          {phase === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div
                className="border-2 border-dashed border-border/60 rounded-2xl p-12 text-center cursor-pointer
                  hover:border-primary/40 hover:bg-accent/30 transition-all duration-300 group"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5
                  group-hover:bg-primary/15 transition-colors">
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{t("roomScan.uploadTitle")}</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                  {t("roomScan.uploadDesc")}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button variant="default" className="gap-2">
                    <Camera className="w-4 h-4" /> {t("roomScan.choosePhoto")}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground/60 mt-4">{t("roomScan.fileHint")}</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />

              {/* Tips */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { icon: Camera, title: t("roomScan.tipWide"), desc: t("roomScan.tipWideDesc") },
                  { icon: Ruler, title: t("roomScan.tipLight"), desc: t("roomScan.tipLightDesc") },
                  { icon: Box, title: t("roomScan.tipClear"), desc: t("roomScan.tipClearDesc") },
                ].map((tip, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border/30 p-4 text-center">
                    <tip.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-xs font-semibold text-foreground">{tip.title}</p>
                    <p className="text-[11px] text-muted-foreground">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ====== PROCESSING PHASE ====== */}
          {phase === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="bg-card rounded-2xl border border-border/30 p-8 max-w-md mx-auto">
                {/* Image preview */}
                {imagePreview && (
                  <div className="mb-6 rounded-xl overflow-hidden border border-border/20 relative">
                    <img src={imagePreview} alt="Room" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-primary/5" />
                    {/* Scan line animation */}
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-primary/60"
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                )}

                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {t("roomScan.analyzing")}
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  {t("roomScan.analyzingDesc")}
                </p>

                <Progress value={progress} className="h-2 mb-3" />
                <p className="text-xs text-muted-foreground">{progress}% {t("roomScan.complete")}</p>

                {/* Analysis steps */}
                <div className="mt-5 space-y-2 text-left">
                  {[
                    { label: t("roomScan.stepFloor"), done: progress > 30 },
                    { label: t("roomScan.stepWalls"), done: progress > 55 },
                    { label: t("roomScan.stepDimensions"), done: progress > 80 },
                    { label: t("roomScan.stepModel"), done: progress >= 100 },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {step.done ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-border/60" />
                      )}
                      <span className={step.done ? "text-foreground" : "text-muted-foreground"}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ====== RESULT PHASE ====== */}
          {phase === "result" && detectedRoom && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
                {/* Image with overlay */}
                {imagePreview && (
                  <div className="relative h-52">
                    <img src={imagePreview} alt="Scanned room" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-card/80 backdrop-blur-md rounded-lg px-3 py-1.5">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-semibold text-foreground">{t("roomScan.detected")}</span>
                      </div>
                      <div className="bg-card/80 backdrop-blur-md rounded-lg px-3 py-1.5">
                        <span className="text-xs font-semibold text-foreground">
                          {detectedRoom.confidence}% {t("roomScan.confidence")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="font-display font-bold text-lg text-foreground mb-4">{t("roomScan.detectedTitle")}</h3>

                  {/* Room preview - top-down */}
                  <div className="bg-accent/30 rounded-xl border border-border/20 p-6 mb-5">
                    <svg viewBox={`-0.5 -0.5 ${detectedRoom.width + 1} ${detectedRoom.depth + 1}`}
                      className="w-full max-h-48 mx-auto"
                    >
                      {/* Floor */}
                      <rect
                        x={0} y={0}
                        width={detectedRoom.width} height={detectedRoom.depth}
                        fill="hsl(225, 14%, 93%)" stroke="hsl(235, 60%, 52%)" strokeWidth={0.06}
                        rx={0.08}
                      />
                      {/* Grid */}
                      {Array.from({ length: Math.ceil(detectedRoom.width) }).map((_, i) => (
                        <line key={`gv-${i}`} x1={i + 1} y1={0} x2={i + 1} y2={detectedRoom.depth}
                          stroke="hsl(225, 15%, 85%)" strokeWidth={0.02} strokeDasharray="0.1 0.1" />
                      ))}
                      {Array.from({ length: Math.ceil(detectedRoom.depth) }).map((_, i) => (
                        <line key={`gh-${i}`} x1={0} y1={i + 1} x2={detectedRoom.width} y2={i + 1}
                          stroke="hsl(225, 15%, 85%)" strokeWidth={0.02} strokeDasharray="0.1 0.1" />
                      ))}
                      {/* Dimensions */}
                      <text x={detectedRoom.width / 2} y={-0.2} textAnchor="middle"
                        fontSize={0.25} fill="hsl(235, 60%, 52%)" fontWeight="600">
                        {detectedRoom.width}m
                      </text>
                      <text x={detectedRoom.width + 0.3} y={detectedRoom.depth / 2}
                        textAnchor="middle" fontSize={0.25} fill="hsl(235, 60%, 52%)" fontWeight="600"
                        transform={`rotate(90, ${detectedRoom.width + 0.3}, ${detectedRoom.depth / 2})`}>
                        {detectedRoom.depth}m
                      </text>
                    </svg>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: t("roomScan.width"), value: `${detectedRoom.width}m` },
                      { label: t("roomScan.depth"), value: `${detectedRoom.depth}m` },
                      { label: t("roomScan.height"), value: `${detectedRoom.height}m` },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-accent/40 rounded-xl px-4 py-3 text-center">
                        <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                        <p className="text-lg font-bold font-display text-foreground">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 gap-2" onClick={handleReset}>
                      <RotateCcw className="w-4 h-4" /> Upload Another
                    </Button>
                    <Button variant="default" className="flex-1 gap-2" onClick={handleUseLayout}>
                      <ArrowRight className="w-4 h-4" /> Use This Layout
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RoomScan;
