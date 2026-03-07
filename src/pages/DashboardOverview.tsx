import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Box, Home, Layers, Sparkles, Smartphone, Zap, Plus } from "lucide-react";
import { ApplicationService } from "@/services/ApplicationService";
import type { User, UserUsage, Currency } from "@/types/subscription";

interface DashboardContext {
  user: User;
  usage: UserUsage;
  currency: Currency;
  featureGate: { canUseAI: () => boolean; canUseAdvancedAI: () => boolean };
}

const stats = [
  { label: "Models", icon: Box, key: "modelsCount" as const, color: "text-primary" },
  { label: "Rooms", icon: Home, key: "arSessionsCount" as const, color: "text-accent-foreground" },
  { label: "Layouts", icon: Layers, key: "layoutsCount" as const, color: "text-primary" },
  { label: "AI Suggestions", icon: Sparkles, key: "aiRequestsCount" as const, color: "text-accent-foreground" },
];

const DashboardOverview = () => {
  const { user, usage, featureGate } = useOutletContext<DashboardContext>();
  const navigate = useNavigate();
  const usageStats = ApplicationService.getUsageStats(user, usage);

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-primary rounded-2xl p-5 md:p-8 lg:p-10 xl:p-12 shadow-elevated"
      >
        <h1 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground mb-1 lg:mb-2">
          Your AR Workspace
        </h1>
        <p className="text-primary-foreground/70 text-xs md:text-sm lg:text-base mb-4 md:mb-6">
          Design, visualize, and optimize interior spaces
        </p>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <Button variant="secondary" size="lg" className="gap-2 min-h-[44px] w-full sm:w-auto" onClick={() => navigate("/dashboard/layouts")}>
            <Plus className="w-4 h-4" /> Create Layout
          </Button>
          <Button variant="secondary" size="lg" className="gap-2 min-h-[44px] w-full sm:w-auto" onClick={() => navigate("/dashboard/models")}>
            <Box className="w-4 h-4" /> Upload Model
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="gap-2 min-h-[44px] w-full sm:w-auto"
            onClick={() => featureGate.canUseAI() && navigate("/dashboard/layouts")}
          >
            <Sparkles className="w-4 h-4" /> AI Layout
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 xl:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border/50 shadow-card p-4 md:p-5 xl:p-6"
          >
            <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
              <stat.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${stat.color}`} />
              <span className="text-[10px] md:text-xs text-muted-foreground font-medium">{stat.label}</span>
            </div>
            <p className="font-display text-xl md:text-2xl xl:text-3xl font-bold text-foreground">
              {usage[stat.key]}
            </p>
            {stat.key === "modelsCount" && usageStats.models.percentage !== null && (
              <div className="mt-2">
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-primary rounded-full transition-all"
                    style={{ width: `${usageStats.models.percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{usageStats.models.percentage}% used</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="font-display text-base md:text-lg xl:text-xl font-bold text-foreground mb-3 md:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 xl:gap-6">
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            onClick={() => navigate("/ar-demo")}
            className="bg-card rounded-xl border border-border/50 shadow-card p-4 md:p-5 xl:p-6 text-left hover:shadow-elevated transition-shadow group min-h-[80px]"
          >
            <Smartphone className="w-5 h-5 text-primary mb-2 md:mb-3" />
            <p className="font-medium text-foreground text-sm">Launch AR Session</p>
            <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">Place furniture in your real room</p>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            onClick={() => featureGate.canUseAdvancedAI() && undefined}
            className="bg-card rounded-xl border border-border/50 shadow-card p-4 md:p-5 xl:p-6 text-left hover:shadow-elevated transition-shadow group min-h-[80px]"
          >
            <Zap className="w-5 h-5 text-accent-foreground mb-2 md:mb-3" />
            <p className="font-medium text-foreground text-sm">AI Space Optimizer</p>
            <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">Automatically optimize room layout</p>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.49 }}
            onClick={() => navigate("/pricing")}
            className="bg-card rounded-xl border border-primary/20 shadow-card p-4 md:p-5 xl:p-6 text-left hover:shadow-elevated transition-shadow group min-h-[80px]"
          >
            <Sparkles className="w-5 h-5 text-primary mb-2 md:mb-3" />
            <p className="font-medium text-foreground text-sm">Upgrade Plan</p>
            <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">Unlock AI features and unlimited resources</p>
          </motion.button>
        </div>
      </section>
    </div>
  );
};

export default DashboardOverview;
