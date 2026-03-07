import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useOutletContext } from "react-router-dom";
import { PLAN_CONFIG, formatPrice, type User, type Currency } from "@/types/subscription";

interface DashboardContext {
  user: User;
  currency: Currency;
}

const Billing = () => {
  const { user, currency } = useOutletContext<DashboardContext>();
  const navigate = useNavigate();
  const plan = PLAN_CONFIG[user.subscriptionPlan];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and payments</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border/50 shadow-card p-6 space-y-6"
      >
        {/* Current plan */}
        <div className="flex items-center justify-between p-4 bg-accent/20 rounded-xl border border-primary/10">
          <div>
            <p className="font-display font-bold text-foreground">{plan.name}</p>
            <p className="text-xs text-muted-foreground">{plan.tagline}</p>
          </div>
          <p className="font-display text-xl font-bold text-primary">
            {formatPrice(user.subscriptionPlan, currency)}
            {user.subscriptionPlan !== "free" && <span className="text-xs text-muted-foreground font-normal"> /mo</span>}
          </p>
        </div>

        {/* Payment method */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Payment Method</p>
          <div className="p-4 bg-secondary/40 rounded-xl border border-border/30 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">No payment method on file</span>
          </div>
        </div>

        {/* Invoices */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Invoice History</p>
          <div className="p-4 bg-secondary/40 rounded-xl border border-border/30 text-center text-sm text-muted-foreground">
            No invoices yet
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="hero" size="sm" onClick={() => navigate("/pricing")}>
            Upgrade Plan
          </Button>
          {user.subscriptionPlan !== "free" && (
            <Button variant="destructive" size="sm">
              Cancel Subscription
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Billing;
