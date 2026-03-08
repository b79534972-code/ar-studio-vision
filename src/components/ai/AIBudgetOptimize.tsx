import { useState } from "react";
import { motion } from "framer-motion";
import { PiggyBank, Loader2, TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFeatureCost } from "@/config/aiCreditCosts";
import { cn } from "@/lib/utils";

interface Props {
  creditsRemaining: number;
  useCredit: (amount?: number) => boolean;
}

const PRIORITIES = [
  { value: "quality", label: "Quality First" },
  { value: "balanced", label: "Balanced" },
  { value: "savings", label: "Max Savings" },
];

const MOCK_RESULTS = {
  totalOriginal: 4500,
  totalOptimized: 2850,
  savings: 1650,
  items: [
    { name: "Sofa", original: "$1200", optimized: "$699", alt: "IKEA FRIHETEN → same comfort, 42% less", saving: 42 },
    { name: "Coffee Table", original: "$450", optimized: "$189", alt: "HAY DLM → similar aesthetic, smaller footprint", saving: 58 },
    { name: "Floor Lamp", original: "$380", optimized: "$129", alt: "IKEA HEKTAR → industrial look, 66% less", saving: 66 },
    { name: "Bookshelf", original: "$600", optimized: "$279", alt: "KALLAX 4x4 → modular, expandable", saving: 54 },
  ],
};

export default function AIBudgetOptimize({ creditsRemaining, useCredit }: Props) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const cost = getFeatureCost("budget_optimize");
  const [budget, setBudget] = useState("3000");
  const [priority, setPriority] = useState("balanced");
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
    for (let i = 0; i <= 100; i += 4) {
      await new Promise((r) => setTimeout(r, 40));
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
        <h2 className="font-display text-lg font-bold text-foreground">{t("ai.optimizingBudget") || "Optimizing Budget..."}</h2>
        <div className="max-w-sm mx-auto"><Progress value={progress} className="h-2" /></div>
      </motion.div>
    );
  }

  if (step === "results") {
    const savingsPercent = Math.round((MOCK_RESULTS.savings / MOCK_RESULTS.totalOriginal) * 100);
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">{t("ai.budgetResults") || "Budget Optimization"}</h2>
          <Button variant="outline" size="sm" onClick={() => setStep("config")}>{t("ai.tryAgain") || "Try Again"}</Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl border border-border/40 p-4 text-center">
            <TrendingUp className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-lg font-bold text-foreground">${MOCK_RESULTS.totalOriginal.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Original Cost</p>
          </div>
          <div className="bg-card rounded-2xl border border-primary/30 p-4 text-center">
            <TrendingDown className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-lg font-bold text-primary">${MOCK_RESULTS.totalOptimized.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Optimized</p>
          </div>
          <div className="bg-card rounded-2xl border border-green-500/30 p-4 text-center">
            <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-2" />
            <p className="text-lg font-bold text-green-500">{savingsPercent}%</p>
            <p className="text-[10px] text-muted-foreground">Savings</p>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {MOCK_RESULTS.items.map((item, i) => (
            <motion.div key={item.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl border border-border/40 p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm text-foreground">{item.name}</h3>
                  <Badge variant="outline" className="text-[9px] text-green-500 border-green-500/30">-{item.saving}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{item.alt}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground line-through">{item.original}</p>
                <p className="text-sm font-bold text-primary">{item.optimized}</p>
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
          <Label className="text-sm font-medium">{t("ai.totalBudget") || "Total Budget"} (USD)</Label>
          <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="text-lg font-bold" />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("ai.priority") || "Optimization Priority"}</Label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button key={p.value} onClick={() => setPriority(p.value)}
                className={cn("flex-1 p-3 rounded-xl border text-center transition-all text-xs font-medium",
                  priority === p.value ? "border-primary bg-primary/5 text-primary" : "border-border/40 hover:border-border text-muted-foreground")}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full gap-2 h-11" onClick={handleGenerate} disabled={creditsRemaining < cost}>
          <PiggyBank className="w-4 h-4" /> {t("ai.optimizeBudget") || "Optimize Budget"}
          <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{cost} credit</Badge>
        </Button>
      </div>
    </motion.div>
  );
}
