import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useOutletContext } from "react-router-dom";
import { PLAN_CONFIG, formatPrice, type User, type Currency } from "@/types/subscription";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardContext {
  user: User;
  currency: Currency;
}

const Billing = () => {
  const { user, currency } = useOutletContext<DashboardContext>();
  const navigate = useNavigate();
  const plan = PLAN_CONFIG[user.subscriptionPlan];
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">{t("billing.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("billing.subtitle")}</p>
      </div>

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

        <div>
          <p className="text-sm font-medium text-foreground mb-2">{t("profile.paymentMethod")}</p>
          <div className="p-4 bg-secondary/40 rounded-xl border border-border/30 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t("profile.noPayment")}</span>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-2">{t("profile.invoiceHistory")}</p>
          <div className="p-4 bg-secondary/40 rounded-xl border border-border/30 text-center text-sm text-muted-foreground">
            {t("profile.noInvoices")}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="hero" size="sm" className="w-full sm:w-auto" onClick={() => navigate("/pricing")}>
            {t("billing.upgrade")}
          </Button>
          {user.subscriptionPlan !== "free" && (
            <Button variant="destructive" size="sm" className="w-full sm:w-auto">
              {t("billing.cancel")}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Billing;
