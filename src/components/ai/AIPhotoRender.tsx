import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Loader2, Download, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFeatureCost } from "@/config/aiCreditCosts";
import { cn } from "@/lib/utils";

interface Props {
  creditsRemaining: number;
  useCredit: (amount?: number) => boolean;
}

const RENDER_STYLES = [
  { value: "photorealistic", label: "Photorealistic" },
  { value: "architectural", label: "Architectural" },
  { value: "warm", label: "Warm & Cozy" },
  { value: "magazine", label: "Magazine Editorial" },
];

const LIGHTING = [
  { value: "natural", label: "Natural Daylight" },
  { value: "evening", label: "Evening Warm" },
  { value: "studio", label: "Studio Light" },
  { value: "dramatic", label: "Dramatic" },
];

const RESOLUTIONS = [
  { value: "1080p", label: "1080p", desc: "Standard" },
  { value: "2k", label: "2K", desc: "High Quality" },
  { value: "4k", label: "4K", desc: "Ultra HD" },
];

export default function AIPhotoRender({ creditsRemaining, useCredit }: Props) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const cost = getFeatureCost("photorealistic_render");
  const [renderStyle, setRenderStyle] = useState("photorealistic");
  const [lighting, setLighting] = useState("natural");
  const [resolution, setResolution] = useState("2k");
  const [step, setStep] = useState<"config" | "generating" | "results">("config");
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    if (creditsRemaining < cost) {
      toast({ title: t("ai.noCredits"), description: t("ai.noCreditsDesc"), variant: "destructive" });
      return;
    }
    if (!useCredit(cost)) return;
    setStep("generating");
    setProgress(0);
    for (let i = 0; i <= 100; i += 1) {
      await new Promise((r) => setTimeout(r, 80));
      setProgress(i);
    }
    setStep("results");
  };

  if (step === "generating") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl border border-border/40 shadow-card p-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto">
          <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">{t("ai.rendering") || "Rendering..."}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t("ai.renderingDesc") || "Creating photorealistic image of your design"}</p>
        </div>
        <div className="max-w-sm mx-auto space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">{progress}%</p>
        </div>
      </motion.div>
    );
  }

  if (step === "results") {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">{t("ai.renderResult") || "Render Complete"}</h2>
          <Button variant="outline" size="sm" onClick={() => setStep("config")}>{t("ai.renderAnother") || "Render Another"}</Button>
        </div>
        <div className="bg-card rounded-2xl border border-border/40 shadow-card overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-accent/50 to-muted/50 flex items-center justify-center relative">
            <Camera className="w-16 h-16 text-muted-foreground/20" />
            <div className="absolute bottom-3 right-3 flex gap-2">
              <Button size="sm" variant="secondary" className="gap-1.5 text-xs h-8"><ZoomIn className="w-3 h-3" /> Preview</Button>
              <Button size="sm" className="gap-1.5 text-xs h-8"><Download className="w-3 h-3" /> Download</Button>
            </div>
            <Badge className="absolute top-3 left-3 text-[9px]">{resolution.toUpperCase()} · {renderStyle}</Badge>
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground">Rendered with {lighting} lighting · {renderStyle} style · {resolution} resolution</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-card rounded-2xl border border-border/40 shadow-card p-6 space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("ai.renderStyle") || "Render Style"}</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {RENDER_STYLES.map((s) => (
              <button key={s.value} onClick={() => setRenderStyle(s.value)}
                className={cn("p-3 rounded-xl border text-xs font-medium transition-all text-center",
                  renderStyle === s.value ? "border-primary bg-primary/5 text-primary" : "border-border/40 hover:border-border text-muted-foreground")}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("ai.lighting") || "Lighting"}</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LIGHTING.map((l) => (
              <button key={l.value} onClick={() => setLighting(l.value)}
                className={cn("p-3 rounded-xl border text-xs font-medium transition-all text-center",
                  lighting === l.value ? "border-primary bg-primary/5 text-primary" : "border-border/40 hover:border-border text-muted-foreground")}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("ai.resolution") || "Resolution"}</Label>
          <div className="flex gap-2">
            {RESOLUTIONS.map((r) => (
              <button key={r.value} onClick={() => setResolution(r.value)}
                className={cn("flex-1 p-3 rounded-xl border text-center transition-all",
                  resolution === r.value ? "border-primary bg-primary/5" : "border-border/40 hover:border-border")}>
                <p className="text-sm font-bold">{r.label}</p>
                <p className="text-[9px] text-muted-foreground">{r.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full gap-2 h-11" onClick={handleGenerate} disabled={creditsRemaining < cost}>
          <Camera className="w-4 h-4" /> {t("ai.startRender") || "Start Render"}
          <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{cost} credits</Badge>
        </Button>
      </div>
    </motion.div>
  );
}
