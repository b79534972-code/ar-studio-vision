import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Flame, ArrowLeft, Zap, Crown, CreditCard, Loader2 } from "lucide-react";
import { PLAN_CONFIG, formatPrice, formatPerCredit, type SubscriptionPlan, type Currency } from "@/types/subscription";
import { subscriptionStore } from "@/stores/subscriptionStore";
import { useSyncExternalStore } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const plans: SubscriptionPlan[] = ["free", "basic", "advanced", "pro"];

const planIcons: Record<SubscriptionPlan, React.ReactNode> = {
  free: null,
  basic: <Zap className="w-4 h-4 text-primary" />,
  advanced: <Sparkles className="w-4 h-4 text-primary" />,
  pro: <Crown className="w-4 h-4 text-primary" />,
};

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currency, setCurrency] = useState<Currency>("VND");
  const currentPlan = useSyncExternalStore(subscriptionStore.subscribe, subscriptionStore.getPlan);
  const [confirmPlan, setConfirmPlan] = useState<SubscriptionPlan | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleUpgrade = (planKey: SubscriptionPlan) => {
    if (planKey === "free") return;
    setConfirmPlan(planKey);
  };

  const handleConfirm = async () => {
    if (!confirmPlan) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    subscriptionStore.upgradePlan(confirmPlan);
    setProcessing(false);
    setConfirmPlan(null);

    const isRepurchase = confirmPlan === currentPlan;
    toast({
      title: isRepurchase ? "Credits Added! 🎉" : "Upgrade Successful! 🎉",
      description: isRepurchase
        ? `${PLAN_CONFIG[confirmPlan].aiCredits} AI credits added to your account.`
        : `You're now on the ${PLAN_CONFIG[confirmPlan].name} plan with ${PLAN_CONFIG[confirmPlan].aiCredits} AI credits.`,
    });
    navigate("/dashboard/billing");
  };

  const getButtonLabel = (planKey: SubscriptionPlan) => {
    if (planKey === "free") return "Free Plan";
    if (planKey === currentPlan) return `Buy ${PLAN_CONFIG[planKey].aiCredits} More Credits`;
    const planIndex = plans.indexOf(planKey);
    const currentIndex = plans.indexOf(currentPlan);
    return planIndex > currentIndex ? `Upgrade to ${PLAN_CONFIG[planKey].name}` : `Switch to ${PLAN_CONFIG[planKey].name}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/30 bg-card/60 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-14 px-6">
          <button onClick={() => navigate("/")} className="font-display text-lg font-bold text-foreground tracking-tight">
            InteriorAR<span className="text-primary">.</span>
          </button>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            From basic AR to AI-powered interior design. Pick the plan that fits your workflow.
          </p>

          {/* Currency toggle */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrency("VND")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currency === "VND" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
            >
              VND (₫)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currency === "USD" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
            >
              USD ($)
            </button>
          </div>
        </motion.div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((planKey, i) => {
            const plan = PLAN_CONFIG[planKey];
            const isHighlighted = plan.highlighted;
            const isCurrent = planKey === currentPlan;
            const isFree = planKey === "free";

            return (
              <motion.div
                key={planKey}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-6 flex flex-col ${isHighlighted
                  ? "border-primary/40 bg-card shadow-elevated ring-1 ring-primary/20"
                  : isCurrent
                  ? "border-primary/30 bg-card shadow-card ring-1 ring-primary/10"
                  : "border-border/50 bg-card shadow-card"
                  }`}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-[11px] font-bold px-4 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                    <Flame className="w-3 h-3" /> Most Popular
                  </div>
                )}

                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    {planIcons[planKey]}
                    <h3 className="font-display text-lg font-bold text-foreground">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                </div>

                <div className="mb-1">
                  <span className="font-display text-3xl font-bold text-foreground">
                    {formatPrice(planKey, currency)}
                  </span>
                </div>

                {/* Credit info */}
                <div className="mb-5 min-h-[40px]">
                  {plan.aiCredits && !isFree ? (
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        {plan.aiCredits} AI credits · {plan.creditValidity}
                      </p>
                      {plan.aiCredits && !isFree && (
                        <p className="text-xs text-primary/70">
                          ~{formatPerCredit(planKey, currency)}/credit
                        </p>
                      )}
                    </div>
                  ) : isFree ? (
                    <p className="text-xs text-muted-foreground">5 credits/day · resets every 24h</p>
                  ) : null}
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isHighlighted ? "hero" : isCurrent ? "default" : "outline"}
                  size="lg"
                  className="w-full"
                  disabled={isFree}
                  onClick={() => handleUpgrade(planKey)}
                >
                  {getButtonLabel(planKey)}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Checkout Confirmation Dialog */}
      <Dialog open={!!confirmPlan} onOpenChange={(open) => !processing && !open && setConfirmPlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Confirm Upgrade</DialogTitle>
          </DialogHeader>
          {confirmPlan && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-accent/30 rounded-xl border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {planIcons[confirmPlan]}
                    <span className="font-display font-bold text-foreground">{PLAN_CONFIG[confirmPlan].name}</span>
                  </div>
                  <span className="font-display font-bold text-primary">{formatPrice(confirmPlan, currency)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{PLAN_CONFIG[confirmPlan].tagline}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">AI Credits</span>
                  <span className="font-medium text-foreground">{PLAN_CONFIG[confirmPlan].aiCredits} credits</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Validity</span>
                  <span className="font-medium text-foreground">{PLAN_CONFIG[confirmPlan].creditValidity}</span>
                </div>
              </div>

              <div className="p-3 bg-secondary/40 rounded-lg border border-border/20 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Payment will be processed via Stripe when connected. This is a demo upgrade.
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmPlan(null)} disabled={processing}>
              Cancel
            </Button>
            <Button variant="hero" onClick={handleConfirm} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Processing...
                </>
              ) : (
                "Confirm Upgrade"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;
