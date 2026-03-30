import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Loader2, ExternalLink, Star } from "lucide-react";
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

const ROOM_CONTEXTS = [
  { value: "living", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "office", label: "Home Office" },
  { value: "dining", label: "Dining Room" },
  { value: "kids", label: "Kids Room" },
];

const MOCK_PRODUCTS = [
  { id: "1", name: "IKEA KIVIK Sofa", price: "$499", rating: 4.5, reason: "Perfect size for your room dimensions. Neutral tone fits your minimalist palette.", category: "Sofa" },
  { id: "2", name: "HAY DLM Side Table", price: "$189", rating: 4.7, reason: "Compact footprint ideal for the corner space. Pairs well with KIVIK.", category: "Table" },
  { id: "3", name: "Muuto Leaf Floor Lamp", price: "$329", rating: 4.3, reason: "Provides ambient lighting for the reading area without taking floor space.", category: "Lighting" },
  { id: "4", name: "IKEA KALLAX Shelf", price: "$79", rating: 4.6, reason: "Versatile storage that doubles as room divider for your open-plan space.", category: "Storage" },
];

export default function AIProductRecommend({ creditsRemaining, useCredit }: Props) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const cost = getFeatureCost("product_recommend");
  const [roomContext, setRoomContext] = useState("living");
  const [preferences, setPreferences] = useState("");
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
        <h2 className="font-display text-lg font-bold text-foreground">{t("ai.findingProducts") || "Finding Products..."}</h2>
        <div className="max-w-sm mx-auto"><Progress value={progress} className="h-2" /></div>
      </motion.div>
    );
  }

  if (step === "results") {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">{t("ai.recommendations") || "Recommended Products"}</h2>
          <Button variant="outline" size="sm" onClick={() => setStep("config")}>{t("ai.tryAgain") || "Try Again"}</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_PRODUCTS.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl border border-border/40 shadow-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-foreground text-sm">{p.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[9px]">{p.category}</Badge>
                    <span className="text-xs font-bold text-primary">{p.price}</span>
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {p.rating}
                    </span>
                  </div>
                </div>
                <ShoppingBag className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.reason}</p>
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs h-8">
                <ExternalLink className="w-3 h-3" /> View Product
              </Button>
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
          <Label className="text-sm font-medium">{t("ai.roomContext") || "Room Context"}</Label>
          <div className="flex flex-wrap gap-2">
            {ROOM_CONTEXTS.map((r) => (
              <button key={r.value} onClick={() => setRoomContext(r.value)}
                className={cn("px-4 py-2 rounded-xl border text-xs font-medium transition-all",
                  roomContext === r.value ? "border-primary bg-primary/5 text-primary" : "border-border/40 hover:border-border text-muted-foreground")}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("ai.preferences") || "Preferences"} <span className="text-muted-foreground font-normal">({t("aiGen.optional")})</span></Label>
          <Textarea value={preferences} onChange={(e) => setPreferences(e.target.value)}
            placeholder="e.g., I prefer natural materials, budget under $2000, need storage solutions..."
            className="min-h-[80px] text-sm resize-none" />
        </div>

        <Button className="w-full gap-2 h-11" onClick={handleGenerate} disabled={creditsRemaining < cost}>
          <ShoppingBag className="w-4 h-4" /> {t("ai.getRecommendations") || "Get Recommendations"}
          <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{cost} credit</Badge>
        </Button>
      </div>
    </motion.div>
  );
}
