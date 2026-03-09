import { motion } from "framer-motion";
import { CreditCard, Sparkles, Zap, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useOutletContext } from "react-router-dom";
import { PLAN_CONFIG, formatPrice, type User, type UserUsage, type Currency, type CreditBatch } from "@/types/subscription";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardContext {
  user: User;
  usage: UserUsage;
  currency: Currency;
  creditBatches: CreditBatch[];
  totalCreditsRemaining: number;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

const Billing = () => {
  const { user, usage, currency, creditBatches, totalCreditsRemaining } = useOutletContext<DashboardContext>();
  const navigate = useNavigate();
  const plan = PLAN_CONFIG[user.subscriptionPlan];
  const { t } = useLanguage();

  const totalPurchased = creditBatches.reduce((s, b) => s + b.creditsPurchased, 0);
  const totalUsed = totalPurchased - totalCreditsRemaining;
  const creditPercentage = totalPurchased > 0
    ? Math.round((totalUsed / totalPurchased) * 100)
    : 0;

  // Invoice history from credit batches
  const invoiceHistory = creditBatches.length > 0
    ? creditBatches.map((b) => ({
        date: formatDate(b.purchasedAt),
        plan: PLAN_CONFIG[b.plan].name,
        credits: String(b.creditsPurchased),
        amount: formatPrice(b.plan, currency),
      })).reverse()
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">{t("billing.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("billing.subtitle")}</p>
      </div>

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border/50 shadow-card p-6 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-accent/20 rounded-xl border border-primary/10">
          <div>
            <p className="font-display font-bold text-foreground">{plan.name}</p>
            <p className="text-xs text-muted-foreground">{plan.tagline}</p>
          </div>
          <p className="font-display text-xl font-bold text-primary">
            {formatPrice(user.subscriptionPlan, currency)}
            {user.subscriptionPlan !== "free" && <span className="text-xs text-muted-foreground font-normal"> {t("profile.perMonth")}</span>}
          </p>
        </div>

        {/* Credit Usage Overview */}
        <div className="p-4 bg-secondary/20 rounded-xl border border-border/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{t("billing.creditUsage") || "AI Credit Usage"}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {totalUsed} / {totalPurchased} {t("billing.creditsUsedLabel") || "used"}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${creditPercentage}%` }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className={`h-full rounded-full ${
                creditPercentage < 50 ? "bg-green-500" :
                creditPercentage < 80 ? "bg-yellow-500" :
                "bg-red-500"
              }`}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {totalCreditsRemaining} {t("billing.creditsRemaining") || "credits remaining"}
            </p>
            {creditPercentage >= 80 && (
              <button
                onClick={() => navigate("/pricing")}
                className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
              >
                <Zap className="w-3 h-3" /> {t("billing.buyMore") || "Buy more credits"}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/20">
            <div className="text-center p-3 bg-card rounded-lg border border-border/20">
              <p className="font-display text-lg font-bold text-foreground">{usage.aiRequestsCount}</p>
              <p className="text-[10px] text-muted-foreground">{t("billing.aiRequests") || "AI Requests"}</p>
            </div>
            <div className="text-center p-3 bg-card rounded-lg border border-border/20">
              <p className="font-display text-lg font-bold text-foreground">{totalCreditsRemaining}</p>
              <p className="text-[10px] text-muted-foreground">{t("billing.remaining") || "Remaining"}</p>
            </div>
            <div className="text-center p-3 bg-card rounded-lg border border-border/20">
              <p className="font-display text-lg font-bold text-foreground">{creditBatches.length}</p>
              <p className="text-[10px] text-muted-foreground">Active Packs</p>
            </div>
          </div>
        </div>

        {/* Credit Batches (FIFO) */}
        {creditBatches.length > 0 && (
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Credit Packs</p>
            <div className="space-y-2">
              {creditBatches.map((batch, i) => {
                const days = daysUntil(batch.expiresAt);
                const isExpiringSoon = days <= 14;
                const usedPercent = Math.round(((batch.creditsPurchased - batch.creditsRemaining) / batch.creditsPurchased) * 100);
                return (
                  <div
                    key={batch.id}
                    className={`p-3 rounded-xl border transition-colors ${
                      isExpiringSoon
                        ? "border-destructive/30 bg-destructive/5"
                        : "border-border/30 bg-secondary/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                          {PLAN_CONFIG[batch.plan].name}
                        </span>
                        {i === 0 && (
                          <span className="text-[9px] text-muted-foreground font-medium">← next consumed</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {isExpiringSoon ? (
                          <AlertTriangle className="w-3 h-3 text-destructive" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span className={isExpiringSoon ? "text-destructive font-medium" : ""}>
                          {days}d left
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-foreground font-medium">
                        {batch.creditsRemaining}/{batch.creditsPurchased} credits
                      </span>
                      <span className="text-muted-foreground">
                        Expires {formatDate(batch.expiresAt)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isExpiringSoon ? "bg-destructive" : "bg-primary"
                        }`}
                        style={{ width: `${100 - usedPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No credits state */}
        {creditBatches.length === 0 && (
          <div className="p-6 bg-secondary/20 rounded-xl border border-border/30 text-center">
            <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">No credit packs</p>
            <p className="text-xs text-muted-foreground mb-3">Purchase a plan to get AI credits</p>
            <Button variant="hero" size="sm" onClick={() => navigate("/pricing")}>
              Get Credits
            </Button>
          </div>
        )}

        {/* Payment method */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">{t("profile.paymentMethod")}</p>
          <div className="p-4 bg-secondary/40 rounded-xl border border-border/30 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t("profile.noPayment")}</span>
          </div>
        </div>

        {/* Invoice history */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">{t("profile.invoiceHistory")}</p>
          <div className="rounded-xl border border-border/30 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/40 text-muted-foreground text-xs">
                  <th className="text-left px-4 py-2.5 font-medium">Date</th>
                  <th className="text-left px-4 py-2.5 font-medium">Plan</th>
                  <th className="text-left px-4 py-2.5 font-medium">Credits</th>
                  <th className="text-right px-4 py-2.5 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-muted-foreground text-xs">
                      {t("profile.noInvoices")}
                    </td>
                  </tr>
                ) : (
                  invoiceHistory.map((inv, i) => (
                    <tr key={i} className="border-t border-border/20 hover:bg-secondary/10 transition-colors">
                      <td className="px-4 py-2.5 text-foreground">{inv.date}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{inv.plan}</span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{inv.credits}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-foreground">{inv.amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex">
          <Button variant="hero" size="sm" className="w-full sm:w-auto" onClick={() => navigate("/pricing")}>
            {t("billing.upgrade") || "View All Plans"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Billing;
