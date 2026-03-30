import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, Loader2, Check, LayoutGrid, Palette, Sofa } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFeatureCost } from "@/config/aiCreditCosts";
import { cn } from "@/lib/utils";

interface Props {
  creditsRemaining: number;
  useCredit: (amount?: number) => boolean;
}

const REDESIGN_SCOPES = [
  { value: "full", label: "Full Redesign", desc: "Layout + Style + Furniture", icon: LayoutGrid },
  { value: "style-furniture", label: "Style & Furniture", desc: "Keep layout, change everything else", icon: Palette },
  { value: "furniture-only", label: "Furniture Only", desc: "Keep layout & style, swap furniture", icon: Sofa },
];

const MOCK_REDESIGN = {
  name: "Modern Zen Retreat",
  score: 94,
  changes: [
    { area: "Layout", description: "Open-plan flow with floating furniture island", impact: "high" },
    { area: "Color Palette", description: "Warm neutrals with forest green accents", impact: "medium" },
    { area: "Furniture", description: "Low-profile Japanese-inspired pieces throughout", impact: "high" },
    { area: "Lighting", description: "Layered lighting with paper lanterns and recessed spots", impact: "medium" },
    { area: "Textiles", description: "Linen and raw cotton for a natural, breathable feel", impact: "low" },
  ],
};

export default function AIFullRedesign({ creditsRemaining, useCredit }: Props) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const cost = getFeatureCost("full_room_redesign");
  const [scope, setScope] = useState("full");
  const [vision, setVision] = useState("");
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
      await new Promise((r) => setTimeout(r, 100));
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
          <h2 className="font-display text-lg font-bold text-foreground">{t("ai.redesigning") || "Redesigning Room..."}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t("ai.redesigningDesc") || "AI is reimagining your entire space"}</p>
        </div>
        <div className="max-w-sm mx-auto space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-center gap-6 text-[10px] text-muted-foreground">
            <span>Analyzing space</span><span>Generating concepts</span><span>Refining details</span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (step === "results") {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">{MOCK_REDESIGN.name}</h2>
            <p className="text-xs text-muted-foreground">AI Confidence: {MOCK_REDESIGN.score}%</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setStep("config")}>{t("ai.tryAgain") || "Try Again"}</Button>
        </div>

        {/* Preview */}
        <div className="bg-card rounded-2xl border border-border/40 shadow-card overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-accent/50 to-muted/50 flex items-center justify-center">
            <Wand2 className="w-16 h-16 text-muted-foreground/20" />
          </div>
        </div>

        {/* Changes breakdown */}
        <div className="space-y-3">
          <h3 className="font-display text-sm font-bold text-foreground">{t("ai.proposedChanges") || "Proposed Changes"}</h3>
          {MOCK_REDESIGN.changes.map((c, i) => (
            <motion.div key={c.area} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl border border-border/40 p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm text-foreground">{c.area}</h4>
                  <Badge variant="outline" className={cn("text-[9px]",
                    c.impact === "high" ? "text-primary border-primary/30" :
                    c.impact === "medium" ? "text-yellow-500 border-yellow-500/30" :
                    "text-muted-foreground")}>
                    {c.impact} impact
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button className="flex-1 gap-1.5"><Check className="w-4 h-4" /> Apply Redesign</Button>
          <Button variant="outline" className="flex-1">Save as Draft</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-card rounded-2xl border border-border/40 shadow-card p-6 space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("ai.redesignScope") || "Redesign Scope"}</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {REDESIGN_SCOPES.map((s) => {
              const Icon = s.icon;
              return (
                <button key={s.value} onClick={() => setScope(s.value)}
                  className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center",
                    scope === s.value ? "border-primary bg-primary/5" : "border-border/40 hover:border-border")}>
                  <Icon className={cn("w-5 h-5", scope === s.value ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-xs font-medium">{s.label}</span>
                  <span className="text-[9px] text-muted-foreground">{s.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("ai.designVision") || "Your Design Vision"} <span className="text-muted-foreground font-normal">({t("aiGen.optional")})</span></Label>
          <Textarea value={vision} onChange={(e) => setVision(e.target.value)}
            placeholder="e.g., I want a calming Japanese-inspired space with natural materials and plenty of light..."
            className="min-h-[100px] text-sm resize-none" />
        </div>

        <Button className="w-full gap-2 h-11" onClick={handleGenerate} disabled={creditsRemaining < cost}>
          <Wand2 className="w-4 h-4" /> {t("ai.startRedesign") || "Start Full Redesign"}
          <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{cost} credits</Badge>
        </Button>
      </div>
    </motion.div>
  );
}
