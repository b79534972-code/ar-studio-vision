import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Box, Home, Layers, Sparkles, Smartphone, Zap, Plus,
  Clock, ImagePlus, ArrowRight, TrendingUp, Eye,
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

/* ─── Extracted Sub-components ─── */

const HeroStatCard = ({ stat, value, index }: {
  stat: { label: string; icon: React.ElementType; color: string };
  value: number;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15 + index * 0.06, duration: 0.4 }}
    className="bg-primary-foreground/[0.08] backdrop-blur-sm rounded-2xl p-4 border border-primary-foreground/[0.08] hover:bg-primary-foreground/[0.12] transition-colors duration-200"
  >
    <div className="flex items-center gap-2 mb-2">
      <div className="w-7 h-7 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
        <stat.icon className="w-3.5 h-3.5 text-primary-foreground/70" />
      </div>
      <span className="text-[11px] text-primary-foreground/60 font-medium">{stat.label}</span>
    </div>
    <p className="font-display text-2xl font-bold text-primary-foreground">{value}</p>
  </motion.div>
);

const StatDetailCard = ({ stat, value, usageStats, index, t }: {
  stat: { label: string; icon: React.ElementType; key: string; color: string };
  value: number;
  usageStats: ReturnType<typeof ApplicationService.getUsageStats>;
  index: number;
  t: (key: string) => string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.4 }}
    className="bg-card rounded-2xl border border-border/40 shadow-card p-5 hover:shadow-elevated transition-shadow duration-300"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className={`w-9 h-9 rounded-xl bg-accent/60 flex items-center justify-center`}>
          <stat.icon className={`w-4 h-4 ${stat.color}`} />
        </div>
        <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
      </div>
      <TrendingUp className="w-3.5 h-3.5 text-success" />
    </div>
    <p className="font-display text-3xl font-bold text-foreground">{value}</p>
    {stat.key === "modelsCount" && usageStats.models.percentage !== null && (
      <div className="mt-3">
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${usageStats.models.percentage}%` }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-full gradient-primary rounded-full"
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          {usageStats.models.percentage}% {t("overview.used")}
        </p>
      </div>
    )}
  </motion.div>
);

const QuickActionCard = ({ icon: Icon, title, description, onClick, delay, accent = false }: {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  delay: number;
  accent?: boolean;
}) => (
  <motion.button
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    onClick={onClick}
    className={`bg-card rounded-2xl border shadow-card p-5 text-left hover:shadow-elevated transition-all duration-300 group ${
      accent ? "border-primary/20" : "border-border/40"
    }`}
  >
    <div className="w-10 h-10 rounded-xl bg-accent/60 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <p className="font-medium text-foreground text-sm">{title}</p>
    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
  </motion.button>
);

/* ─── Main Component ─── */

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
    <div className="space-y-6 lg:space-y-8">
      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="gradient-hero rounded-2xl shadow-elevated overflow-hidden relative"
      >
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-primary-foreground/[0.03] rounded-full blur-2xl translate-y-1/2 pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row gap-6 p-6 sm:p-8">
          {/* Left: Content */}
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="px-2.5 py-1 rounded-full bg-primary-foreground/10 text-[10px] font-semibold text-primary-foreground/80 uppercase tracking-wider">
                {t("plan.plan")}
              </div>
            </div>
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-primary-foreground mb-2 leading-tight">
              {t("overview.title")}
            </h1>
            <p className="text-primary-foreground/65 text-sm sm:text-base mb-6 max-w-lg leading-relaxed">
              {t("overview.subtitle")}
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="secondary"
                size="default"
                className="gap-2 min-h-[44px] rounded-xl font-medium"
                onClick={() => navigate("/dashboard/layouts")}
              >
                <Plus className="w-4 h-4" /> {t("overview.createLayout")}
              </Button>
              <Button
                variant="secondary"
                size="default"
                className="gap-2 min-h-[44px] rounded-xl font-medium"
                onClick={() => navigate("/dashboard/models")}
              >
                <ImagePlus className="w-4 h-4" /> {t("overview.addFurniture")}
              </Button>
              <Button
                variant="secondary"
                size="default"
                className="gap-2 min-h-[44px] rounded-xl font-medium"
                onClick={() => featureGate.canUseAI() && navigate("/dashboard/layouts")}
              >
                <Sparkles className="w-4 h-4" /> {t("overview.aiLayout")}
              </Button>
            </div>
          </div>

          {/* Right: Mini stat cards */}
          <div className="grid grid-cols-2 gap-3 lg:w-[340px] xl:w-[380px] shrink-0 self-center">
            {stats.map((stat, i) => (
              <HeroStatCard key={stat.key} stat={stat} value={usage[stat.key]} index={i} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatDetailCard key={stat.key} stat={stat} value={usage[stat.key]} usageStats={usageStats} index={i} t={t} />
        ))}
      </div>

      {/* ── Quick Actions + Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <section className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground">{t("overview.quickActions")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <QuickActionCard
              icon={Smartphone}
              title={t("overview.launchAR")}
              description={t("overview.launchAR.desc")}
              onClick={() => navigate("/ar-demo")}
              delay={0.3}
            />
            <QuickActionCard
              icon={Zap}
              title={t("overview.aiOptimizer")}
              description={t("overview.aiOptimizer.desc")}
              onClick={() => { featureGate.canUseAdvancedAI(); }}
              delay={0.36}
            />
            <QuickActionCard
              icon={Sparkles}
              title={t("overview.upgradePlan")}
              description={t("overview.upgradePlan.desc")}
              onClick={() => navigate("/pricing")}
              delay={0.42}
              accent
            />
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground">{t("overview.recentActivity")}</h2>
          <div className="bg-card rounded-2xl border border-border/40 shadow-card divide-y divide-border/20">
            {recentActivity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.06, duration: 0.4 }}
                className="flex items-center gap-3 p-4 hover:bg-accent/30 transition-colors duration-200 first:rounded-t-2xl"
              >
                <div className="w-9 h-9 rounded-xl bg-accent/50 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {item.time}
                  </p>
                </div>
              </motion.div>
            ))}
            <div className="p-3">
              <button className="w-full text-xs text-primary font-medium flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-accent/40 transition-colors duration-200">
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
