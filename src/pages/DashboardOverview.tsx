import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Box, Home, Layers, Sparkles, Smartphone, Zap, Plus,
  TrendingUp, Clock, ImagePlus, ArrowRight,
} from "lucide-react";
import { ApplicationService } from "@/services/ApplicationService";
import type { User, UserUsage, Currency } from "@/types/subscription";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardContext {
  user: User;
  usage: UserUsage;
  currency: Currency;
  featureGate: { canUseAI: () => boolean; canUseAdvancedAI: () => boolean };
}

const DashboardOverview = () => {
  const { user, usage, featureGate } = useOutletContext<DashboardContext>();
  const navigate = useNavigate();
  const usageStats = ApplicationService.getUsageStats(user, usage);
  const { t } = useLanguage();

  const stats = [
    { label: t("overview.stats.models"), icon: Box, key: "modelsCount" as const, color: "text-primary" },
    { label: t("overview.stats.rooms"), icon: Home, key: "arSessionsCount" as const, color: "text-accent-foreground" },
    { label: t("overview.stats.layouts"), icon: Layers, key: "layoutsCount" as const, color: "text-primary" },
    { label: t("overview.stats.ai"), icon: Sparkles, key: "aiRequestsCount" as const, color: "text-accent-foreground" },
  ];

  const recentActivity = [
    { label: t("activity.uploadedSofa"), time: t("activity.2hAgo"), icon: Box },
    { label: t("activity.createdLayout"), time: t("activity.5hAgo"), icon: Layers },
    { label: t("activity.arSession"), time: t("activity.yesterday"), icon: Smartphone },
  ];

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Hero — two-column on desktop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-primary rounded-2xl shadow-elevated overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-5 md:p-8 lg:p-10 xl:p-12">
            <h1 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground mb-1 lg:mb-2">
              {t("overview.title")}
            </h1>
            <p className="text-primary-foreground/70 text-xs md:text-sm lg:text-base mb-4 md:mb-6">
              {t("overview.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <Button variant="secondary" size="lg" className="gap-2 min-h-[44px] w-full sm:w-auto" onClick={() => navigate("/dashboard/layouts")}>
                <Plus className="w-4 h-4" /> {t("overview.createLayout")}
              </Button>
              <Button variant="secondary" size="lg" className="gap-2 min-h-[44px] w-full sm:w-auto" onClick={() => navigate("/dashboard/models")}>
                <ImagePlus className="w-4 h-4" /> {t("overview.addFurniture")}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="gap-2 min-h-[44px] w-full sm:w-auto"
                onClick={() => featureGate.canUseAI() && navigate("/dashboard/layouts")}
              >
                <Sparkles className="w-4 h-4" /> {t("overview.aiLayout")}
              </Button>
            </div>
          </div>

          {/* Right: mini stat cards inside hero */}
          <div className="grid grid-cols-2 gap-3 p-5 md:p-8 lg:p-10 lg:pl-0 lg:max-w-sm xl:max-w-md">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.07 }}
                className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-primary-foreground/10"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <stat.icon className="w-3.5 h-3.5 text-primary-foreground/70" />
                  <span className="text-[10px] md:text-xs text-primary-foreground/60 font-medium">{stat.label}</span>
                </div>
                <p className="font-display text-lg md:text-xl xl:text-2xl font-bold text-primary-foreground">
                  {usage[stat.key]}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats row with progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 xl:gap-6">
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
                <p className="text-[10px] text-muted-foreground mt-1">{usageStats.models.percentage}% {t("overview.used")}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Two-column: Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 xl:gap-8">
        {/* Quick Actions */}
        <section className="lg:col-span-2">
          <h2 className="font-display text-base md:text-lg xl:text-xl font-bold text-foreground mb-3 md:mb-4">{t("overview.quickActions")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 xl:gap-6">
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              onClick={() => navigate("/ar-demo")}
              className="bg-card rounded-xl border border-border/50 shadow-card p-4 md:p-5 xl:p-6 text-left hover:shadow-elevated transition-shadow group min-h-[80px]"
            >
              <Smartphone className="w-5 h-5 text-primary mb-2 md:mb-3" />
              <p className="font-medium text-foreground text-sm">{t("overview.launchAR")}</p>
              <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">{t("overview.launchAR.desc")}</p>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              onClick={() => featureGate.canUseAdvancedAI() && undefined}
              className="bg-card rounded-xl border border-border/50 shadow-card p-4 md:p-5 xl:p-6 text-left hover:shadow-elevated transition-shadow group min-h-[80px]"
            >
              <Zap className="w-5 h-5 text-accent-foreground mb-2 md:mb-3" />
              <p className="font-medium text-foreground text-sm">{t("overview.aiOptimizer")}</p>
              <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">{t("overview.aiOptimizer.desc")}</p>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.49 }}
              onClick={() => navigate("/pricing")}
              className="bg-card rounded-xl border border-primary/20 shadow-card p-4 md:p-5 xl:p-6 text-left hover:shadow-elevated transition-shadow group min-h-[80px]"
            >
              <Sparkles className="w-5 h-5 text-primary mb-2 md:mb-3" />
              <p className="font-medium text-foreground text-sm">{t("overview.upgradePlan")}</p>
              <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">{t("overview.upgradePlan.desc")}</p>
            </motion.button>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="font-display text-base md:text-lg xl:text-xl font-bold text-foreground mb-3 md:mb-4">{t("overview.recentActivity")}</h2>
          <div className="bg-card rounded-xl border border-border/50 shadow-card divide-y divide-border/30">
            {recentActivity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center gap-3 p-4"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/50 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.time}
                  </p>
                </div>
              </motion.div>
            ))}
            <div className="p-3">
              <button className="w-full text-xs text-primary font-medium flex items-center justify-center gap-1 hover:underline">
                {t("overview.viewAll")} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardOverview;
