import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Check, X, Zap, ArrowRight, RotateCcw, Move, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { PlacedObject, RoomConfig } from "@/types/editor";

interface AIOptimizePanelProps {
  open: boolean;
  onClose: () => void;
  objects: PlacedObject[];
  roomConfig: RoomConfig;
  creditsRemaining: number;
  useCredit: (amount?: number) => boolean;
  onApplySuggestion: (updatedObjects: PlacedObject[]) => void;
  onOutOfCredits?: () => void;
}

interface SuggestionAction {
  objectId?: string;
  type: "move" | "rotate" | "add" | "remove" | "swap";
  positionDelta?: [number, number, number];
  rotationDelta?: [number, number, number];
  newObject?: PlacedObject;
}

interface Suggestion {
  id: string;
  type: "move" | "rotate" | "add" | "remove" | "swap";
  icon: typeof Move;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  applied: boolean;
  action: SuggestionAction;
}

const CREDIT_COST = 1;

const AIOptimizePanel = ({
  open,
  onClose,
  objects,
  roomConfig,
  creditsRemaining,
  useCredit,
  onApplySuggestion,
  onOutOfCredits,
}: AIOptimizePanelProps) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<"idle" | "analyzing" | "results">("idle");
  const [progress, setProgress] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const generateMockSuggestions = (): Suggestion[] => {
    const result: Suggestion[] = [];

    if (objects.length > 0) {
      const obj = objects[0];
      // Calculate delta to push object closer to nearest wall
      const wallX = obj.position[0] > 0 ? roomConfig.width / 2 - 0.3 : -roomConfig.width / 2 + 0.3;
      const deltaX = wallX - obj.position[0];
      result.push({
        id: "s1",
        type: "move",
        icon: Move,
        title: t("ai.opt.moveForFlow") || "Improve traffic flow",
        description: t("ai.opt.moveForFlowDesc") || `Move "${obj.name}" towards the wall for better walking space`,
        impact: "high",
        applied: false,
        action: {
          objectId: obj.id,
          type: "move",
          positionDelta: [deltaX * 0.5, 0, 0],
        },
      });
    }

    if (objects.length > 1) {
      const obj = objects[1];
      result.push({
        id: "s2",
        type: "rotate",
        icon: RotateCcw,
        title: t("ai.opt.rotateAlign") || "Better alignment",
        description: t("ai.opt.rotateAlignDesc") || `Rotate "${obj.name}" 45° to face the room center`,
        impact: "medium",
        applied: false,
        action: {
          objectId: obj.id,
          type: "rotate",
          rotationDelta: [0, Math.PI / 4, 0],
        },
      });
    }

    // Add greenery suggestion
    const newPlantId = `obj-${Date.now()}-plant`;
    result.push({
      id: "s3",
      type: "add",
      icon: Lightbulb,
      title: t("ai.opt.addPlant") || "Add greenery",
      description: t("ai.opt.addPlantDesc") || "The far corner is underutilized — adding a plant would balance the composition",
      impact: "low",
      applied: false,
      action: {
        type: "add",
        newObject: {
          id: newPlantId,
          furnitureId: "plant-1",
          name: "Potted Plant",
          category: "plant",
          position: [roomConfig.width / 2 - 0.5, 0, roomConfig.depth / 2 - 0.5],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          color: "#4CAF50",
          dimensions: { width: 40, depth: 40, height: 80 },
        },
      },
    });

    return result;
  };

  const handleAnalyze = async () => {
    if (creditsRemaining < CREDIT_COST) return;
    if (!useCredit(CREDIT_COST)) return;

    setStep("analyzing");
    setProgress(0);

    for (let i = 0; i <= 100; i += 3) {
      await new Promise((r) => setTimeout(r, 40));
      setProgress(i);
    }

    setSuggestions(generateMockSuggestions());
    setStep("results");
  };

  const handleApply = (id: string) => {
    const suggestion = suggestions.find((s) => s.id === id);
    if (!suggestion || suggestion.applied) return;

    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, applied: true } : s))
    );

    const { action } = suggestion;
    let updatedObjects = [...objects];

    if (action.type === "move" && action.objectId && action.positionDelta) {
      updatedObjects = updatedObjects.map((o) => {
        if (o.id !== action.objectId) return o;
        return {
          ...o,
          position: [
            o.position[0] + action.positionDelta![0],
            o.position[1] + action.positionDelta![1],
            o.position[2] + action.positionDelta![2],
          ] as [number, number, number],
        };
      });
    } else if (action.type === "rotate" && action.objectId && action.rotationDelta) {
      updatedObjects = updatedObjects.map((o) => {
        if (o.id !== action.objectId) return o;
        return {
          ...o,
          rotation: [
            o.rotation[0] + action.rotationDelta![0],
            o.rotation[1] + action.rotationDelta![1],
            o.rotation[2] + action.rotationDelta![2],
          ] as [number, number, number],
        };
      });
    } else if (action.type === "add" && action.newObject) {
      updatedObjects.push(action.newObject);
    } else if (action.type === "remove" && action.objectId) {
      updatedObjects = updatedObjects.filter((o) => o.id !== action.objectId);
    }

    onApplySuggestion(updatedObjects);
  };

  const handleReset = () => {
    setStep("idle");
    setSuggestions([]);
    setProgress(0);
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="w-72 bg-card border-l border-border/40 flex flex-col shrink-0 overflow-hidden"
    >
      {/* Header */}
      <div className="h-11 flex items-center justify-between px-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-display text-sm font-bold text-foreground">
            {t("ai.opt.title") || "AI Optimize"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] gap-1 px-1.5 py-0">
            <Zap className="w-3 h-3" /> {creditsRemaining}
          </Badge>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="wait">
          {step === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="bg-accent/30 rounded-xl p-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t("ai.opt.analyzeTitle") || "Analyze Your Layout"}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {t("ai.opt.analyzeDesc") || "AI will analyze your current furniture arrangement and suggest improvements for flow, aesthetics, and space efficiency."}
                  </p>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {objects.length} {t("ai.opt.objectsInRoom") || "objects in room"} · {roomConfig.width}m × {roomConfig.depth}m
                </div>
              </div>

              <Button
                className="w-full gap-2 h-10"
                onClick={handleAnalyze}
                disabled={creditsRemaining < CREDIT_COST || objects.length === 0}
              >
                <Sparkles className="w-4 h-4" />
                {t("ai.opt.optimize") || "Optimize Layout"}
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{CREDIT_COST} credit</Badge>
              </Button>

              {objects.length === 0 && (
                <p className="text-[10px] text-muted-foreground text-center">
                  {t("ai.opt.addFirst") || "Add some furniture first to optimize"}
                </p>
              )}
            </motion.div>
          )}

          {step === "analyzing" && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 text-center py-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
              <div>
                <p className="text-sm font-medium text-foreground">{t("ai.opt.analyzing") || "Analyzing layout..."}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{t("ai.opt.analyzingDesc") || "Checking flow, spacing, and aesthetics"}</p>
              </div>
              <Progress value={progress} className="h-1.5" />
            </motion.div>
          )}

          {step === "results" && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-foreground">
                  {suggestions.length} {t("ai.opt.suggestionsFound") || "suggestions"}
                </p>
                <button onClick={handleReset} className="text-[10px] text-primary hover:underline">
                  {t("ai.opt.reanalyze") || "Re-analyze"}
                </button>
              </div>

              {suggestions.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={cn(
                      "rounded-xl border p-3 space-y-2 transition-all",
                      s.applied
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-border/40"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", s.applied ? "text-green-500" : "text-primary")} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-foreground">{s.title}</span>
                          <Badge variant="outline" className={cn("text-[8px] px-1 py-0",
                            s.impact === "high" ? "text-primary border-primary/30" :
                            s.impact === "medium" ? "text-yellow-500 border-yellow-500/30" :
                            "text-muted-foreground"
                          )}>
                            {s.impact}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
                      </div>
                    </div>

                    {!s.applied ? (
                      <Button size="sm" className="w-full h-7 text-[10px] gap-1" onClick={() => handleApply(s.id)}>
                        <Check className="w-3 h-3" /> {t("aiGen.apply") || "Apply"}
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-[10px] text-green-500 font-medium">
                        <Check className="w-3 h-3" /> {t("ai.opt.applied") || "Applied"}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AIOptimizePanel;
