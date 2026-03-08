import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, ArrowUp, ShoppingCart, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { PLAN_CONFIG, formatPrice, type SubscriptionPlan, type Currency } from "@/types/subscription";
import { useLanguage } from "@/contexts/LanguageContext";

interface OutOfCreditsModalProps {
  open: boolean;
  onClose: () => void;
  currentPlan: SubscriptionPlan;
  currency?: Currency;
  onBuyMore: () => void;
}

const OutOfCreditsModal = ({ open, onClose, currentPlan, currency = "VND", onBuyMore }: OutOfCreditsModalProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const currentConfig = PLAN_CONFIG[currentPlan];
  const plans: SubscriptionPlan[] = ["free", "basic", "advanced", "pro"];
  const currentIndex = plans.indexOf(currentPlan);
  const nextPlan = currentIndex < plans.length - 1 ? plans[currentIndex + 1] : null;
  const nextConfig = nextPlan ? PLAN_CONFIG[nextPlan] : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl p-8 mx-4 max-w-md w-full shadow-elevated border border-border/50 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-1">
                {t("credits.outTitle") || "Out of AI Credits"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("credits.outDesc") || "You've used all your AI credits. Choose an option to continue designing."}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {/* Option 1: Buy more credits (same plan) */}
              {currentPlan !== "free" && (
                <button
                  onClick={() => {
                    onClose();
                    onBuyMore();
                  }}
                  className="w-full p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display text-sm font-bold text-foreground">
                          {t("credits.buyMore") || "Buy More Credits"}
                        </span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-primary border-primary/30">
                          {currentConfig.name}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("credits.buyMoreDesc") || `Get ${currentConfig.aiCredits} more credits for ${formatPrice(currentPlan, currency)}`}
                      </p>
                    </div>
                  </div>
                </button>
              )}

              {/* Option 1b: For free plan, buy Basic */}
              {currentPlan === "free" && (
                <button
                  onClick={() => {
                    onClose();
                    navigate("/pricing");
                  }}
                  className="w-full p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display text-sm font-bold text-foreground">
                          {t("credits.getBasic") || "Get a Credit Pack"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("credits.getBasicDesc") || `Starting from ${formatPrice("basic", currency)} for 20 AI credits`}
                      </p>
                    </div>
                  </div>
                </button>
              )}

              {/* Option 2: Upgrade to higher plan */}
              {nextPlan && nextConfig && (
                <button
                  onClick={() => {
                    onClose();
                    navigate("/pricing");
                  }}
                  className="w-full p-4 rounded-xl border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                      <ArrowUp className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display text-sm font-bold text-foreground">
                          {t("credits.upgrade") || `Upgrade to ${nextConfig.name}`}
                        </span>
                        {nextConfig.highlighted && (
                          <Badge className="text-[9px] px-1.5 py-0 bg-primary text-primary-foreground">
                            <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Best Value
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {nextConfig.aiCredits} credits for {formatPrice(nextPlan, currency)} · {nextConfig.creditValidity}
                      </p>
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* Footer */}
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={onClose}>
              {t("credits.later") || "Maybe Later"}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OutOfCreditsModal;
