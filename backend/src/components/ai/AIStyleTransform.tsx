import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, Loader2, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFeatureCost } from "@/config/aiCreditCosts";
import { cn } from "@/lib/utils";

const STYLES = [
  { value: "minimalist", label: "Minimalist", color: "bg-gray-200" },
  { value: "scandinavian", label: "Scandinavian", color: "bg-yellow-200" },
  { value: "modern", label: "Modern", color: "bg-blue-200" },
  { value: "japanese", label: "Japanese", color: "bg-green-200" },
  { value: "industrial", label: "Industrial", color: "bg-zinc-300" },
  { value: "bohemian", label: "Bohemian", color: "bg-pink-200" },
  { value: "mid-century", label: "Mid-Century", color: "bg-orange-200" },
  { value: "coastal", label: "Coastal", color: "bg-cyan-200" },
  { value: "art-deco", label: "Art Deco", color: "bg-violet-200" },
];

interface Props {
  creditsRemaining: number;
  useCredit: (amount?: number) => boolean;
}

const MOCK_RESULTS = [
  { id: "1", name: "Warm Scandinavian", preview: "Soft wood tones, natural textiles, and ambient lighting create a cozy Nordic atmosphere.", score: 92 },
  { id: "2", name: "Clean Minimalist", preview: "Stripped-back elegance with monochrome palette and geometric forms.", score: 87 },
];

export default function AIStyleTransform({ creditsRemaining, useCredit }: Props) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const cost = getFeatureCost("style_transform");
  const [currentStyle, setCurrentStyle] = useState("modern");
  const [targetStyle, setTargetStyle] = useState("scandinavian");
  const [step, setStep] = useState<"config" | "generating" | "results">("config");
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    if (creditsRemaining < cost) {
      toast({ title: t("ai.noCredits"), description: t("ai.noCreditsDesc"), variant: "destructive" });
      return;
    }
    if (!useCredit(cost)) {
      toast({ title: t("ai.noCredits"), description: t("ai.noCreditsDesc"), variant: "destructive" });
      return;
    }
    setStep("generating");
    setProgress(0);
    for (let i = 0; i <= 100; i += 3) {
      await new Promise((r) => setTimeout(r, 50));
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
          <h2 className="font-display text-lg font-bold text-foreground">{t("ai.transforming") || "Transforming Style..."}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t("ai.transformingDesc") || "Applying style transformation to your room"}</p>
        </div>
        <div className="max-w-sm mx-auto"><Progress value={progress} className="h-2" /></div>
      </motion.div>
    );
  }

  if (step === "results") {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">{t("ai.styleResults") || "Style Transformation Results"}</h2>
          <Button variant="outline" size="sm" onClick={() => setStep("config")}>{t("ai.tryAgain") || "Try Again"}</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_RESULTS.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl border border-border/40 shadow-card overflow-hidden">
              <div className="aspect-video bg-accent/30 flex items-center justify-center">
                <Wand2 className="w-10 h-10 text-muted-foreground/20" />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-foreground">{r.name}</h3>
                  <Badge variant="outline" className="text-[9px]">{r.score}% match</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{r.preview}</p>
                <Button size="sm" className="w-full gap-1.5 text-xs h-8"><Check className="w-3 h-3" /> {t("aiGen.apply")}</Button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-card rounded-2xl border border-border/40 shadow-card p-6 space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("ai.currentStyle") || "Current Style"}</Label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {STYLES.map((s) => (
              <button key={s.value} onClick={() => setCurrentStyle(s.value)}
                className={cn("p-3 rounded-xl border text-center transition-all", currentStyle === s.value ? "border-primary bg-primary/5" : "border-border/40 hover:border-border")}>
                <div className={cn("w-6 h-6 rounded-full mx-auto mb-1.5", s.color)} />
                <span className="text-[10px] font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center"><ArrowRight className="w-5 h-5 text-muted-foreground" /></div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("ai.targetStyle") || "Target Style"}</Label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {STYLES.filter((s) => s.value !== currentStyle).map((s) => (
              <button key={s.value} onClick={() => setTargetStyle(s.value)}
                className={cn("p-3 rounded-xl border text-center transition-all", targetStyle === s.value ? "border-primary bg-primary/5" : "border-border/40 hover:border-border")}>
                <div className={cn("w-6 h-6 rounded-full mx-auto mb-1.5", s.color)} />
                <span className="text-[10px] font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full gap-2 h-11" onClick={handleGenerate} disabled={creditsRemaining < cost}>
          <Wand2 className="w-4 h-4" /> {t("ai.transform") || "Transform Style"}
          <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{cost} credits</Badge>
        </Button>
      </div>
    </motion.div>
  );
}
