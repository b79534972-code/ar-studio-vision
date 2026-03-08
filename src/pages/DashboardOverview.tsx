import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Box, Home, Layers, Sparkles, Smartphone, Zap, Plus,
  Clock, ImagePlus, ArrowRight, TrendingUp, Upload,
  Eye, Layout, Cuboid, Palette,
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

/* ─── Sub-components ─── */

const StatCard = ({ stat, value, description, usageStats, index, t }: {
  stat: { label: string; icon: React.ElementType; key: string; color: string };
  value: number;
  description: string;
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
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-accent/60 flex items-center justify-center">
          <stat.icon className={`w-[18px] h-[18px] ${stat.color}`} />
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
          <p className="font-display text-2xl font-bold text-foreground leading-none mt-0.5">{value}</p>
        </div>
      </div>
      <TrendingUp className="w-3.5 h-3.5 text-success" />
    </div>
    <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
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

const WorkflowStep = ({ step, index, total }: {
  step: { icon: React.ElementType; label: string };
  index: number;
  total: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 + index * 0.08, duration: 0.4 }}
    className="flex items-center gap-3"
  >
    <div className="w-9 h-9 rounded-xl bg-accent/60 flex items-center justify-center shrink-0">
      <step.icon className="w-4 h-4 text-primary" />
    </div>
    <span className="text-sm font-medium text-foreground whitespace-nowrap">{step.label}</span>
    {index < total - 1 && (
      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 hidden sm:block" />
    )}
  </motion.div>
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

  const statDescriptions = [
    t("overview.stats.models.desc"),
    t("overview.stats.rooms.desc"),
    t("overview.stats.layouts.desc"),
    t("overview.stats.ai.desc"),
  ];

  const recentActivity = [
    { label: t("activity.uploadedSofa"), time: t("activity.2hAgo"), icon: Box },
    { label: t("activity.createdLayout"), time: t("activity.5hAgo"), icon: Layers },
    { label: t("activity.arSession"), time: t("activity.yesterday"), icon: Smartphone },
    { label: t("activity.editedRoom"), time: t("activity.2dAgo"), icon: Home },
  ];

  const workflowSteps = [
    { icon: Upload, label: t("workflow.upload") },
    { icon: Home, label: t("workflow.createRoom") },
    { icon: Layout, label: t("workflow.arrange") },
    { icon: Eye, label: t("workflow.viewAR") },
  ];

  const recentRooms = [
    { name: t("rooms.recent.living"), items: 8, lastEdited: t("activity.2hAgo") },
    { name: t("rooms.recent.bedroom"), items: 5, lastEdited: t("activity.yesterday") },
    { name: t("rooms.recent.office"), items: 3, lastEdited: t("activity.2dAgo") },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* ── Hero Banner — welcome + quick features ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="gradient-hero rounded-2xl shadow-elevated overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-primary-foreground/[0.03] rounded-full blur-2xl translate-y-1/2 pointer-events-none" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            {/* Left — text */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="px-2.5 py-1 rounded-full bg-primary-foreground/10 text-[10px] font-semibold text-primary-foreground/80 uppercase tracking-wider">
                  {t("plan.plan")}
                </div>
              </div>
              <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-primary-foreground mb-2 leading-tight">
                {t("overview.title")}
              </h1>
              <p className="text-primary-foreground/65 text-sm sm:text-base max-w-xl leading-relaxed">
                {t("overview.subtitle")}
              </p>
            </div>

            {/* Right — quick feature buttons */}
            <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:shrink-0">
              <button
                onClick={() => navigate("/dashboard/models")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground text-sm font-medium transition-colors duration-200 backdrop-blur-sm"
              >
                <Upload className="w-4 h-4" />
                Upload Model
              </button>
              <button
                onClick={() => navigate("/dashboard/rooms")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground text-sm font-medium transition-colors duration-200 backdrop-blur-sm"
              >
                <Plus className="w-4 h-4" />
                New Room
              </button>
              <button
                onClick={() => { featureGate.canUseAI() && navigate("/dashboard/ai-generator"); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground text-sm font-medium transition-colors duration-200 backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4" />
                AI Generate
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Workflow Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-card rounded-2xl border border-border/40 shadow-card p-4 sm:p-5"
      >
        <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wider">{t("workflow.title")}</p>
        <div className="flex flex-wrap gap-4 sm:gap-2 items-center">
          {workflowSteps.map((step, i) => (
            <WorkflowStep key={i} step={step} index={i} total={workflowSteps.length} />
          ))}
        </div>
      </motion.div>

      {/* ── Statistics Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard
            key={stat.key}
            stat={stat}
            value={usage[stat.key]}
            description={statDescriptions[i]}
            usageStats={usageStats}
            index={i}
            t={t}
          />
        ))}
      </div>

      {/* ── Quick Actions + Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground">{t("overview.quickActions")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickActionCard
              icon={Plus}
              title={t("overview.createLayout")}
              description="Start a new room layout in the editor"
              onClick={() => navigate("/dashboard/rooms")}
              delay={0.1}
              accent
            />
            <QuickActionCard
              icon={ImagePlus}
              title={t("overview.addFurniture")}
              description={t("overview.addFurniture.desc")}
              onClick={() => navigate("/dashboard/models")}
              delay={0.16}
            />
            <QuickActionCard
              icon={Sparkles}
              title={t("overview.aiLayout")}
              description={t("overview.aiOptimizer.desc")}
              onClick={() => { featureGate.canUseAI() && navigate("/dashboard/ai-generator"); }}
              delay={0.22}
            />
            <QuickActionCard
              icon={Zap}
              title={t("overview.upgradePlan")}
              description={t("overview.upgradePlan.desc")}
              onClick={() => navigate("/pricing")}
              delay={0.28}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground">{t("overview.recentActivity")}</h2>
          <div className="bg-card rounded-2xl border border-border/40 shadow-card divide-y divide-border/20">
            {recentActivity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
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

      {/* ── Recent Rooms ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">{t("overview.recentRooms")}</h2>
          <button
            onClick={() => navigate("/dashboard/rooms")}
            className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
          >
            {t("overview.viewAll")} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentRooms.map((room, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
              className="bg-card rounded-2xl border border-border/40 shadow-card p-5 hover:shadow-elevated transition-shadow duration-300 cursor-pointer group"
              onClick={() => navigate("/dashboard/rooms")}
            >
              <div className="w-full h-28 rounded-xl bg-accent/40 flex items-center justify-center mb-4 group-hover:bg-accent/60 transition-colors duration-200">
                <Cuboid className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="font-medium text-foreground text-sm">{room.name}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[11px] text-muted-foreground">{room.items} {t("overview.items")}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {room.lastEdited}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardOverview;
