import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useOutletContext } from "react-router-dom";
import { User as UserIcon, Package, CreditCard, Settings, Eye, EyeOff } from "lucide-react";
import { PLAN_CONFIG, type User, type UserUsage, type Currency, formatPrice } from "@/types/subscription";
import { FeatureService } from "@/services/FeatureService";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardContext {
  user: User;
  usage: UserUsage;
  currency: Currency;
}

const Profile = () => {
  const { user, usage, currency } = useOutletContext<DashboardContext>();
  const [activeTab, setActiveTab] = useState("account");
  const [showPassword, setShowPassword] = useState(false);
  const plan = PLAN_CONFIG[user.subscriptionPlan];
  const { t, language, setLanguage } = useLanguage();

  const tabs = [
    { id: "account", label: t("profile.tab.account"), icon: UserIcon },
    { id: "plan", label: t("profile.tab.plan"), icon: Package },
    { id: "billing", label: t("profile.tab.billing"), icon: CreditCard },
    { id: "preferences", label: t("profile.tab.preferences"), icon: Settings },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">{t("profile.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("profile.subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/40 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border/50 shadow-card p-6"
      >
        {activeTab === "account" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="font-display font-bold text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="grid gap-4">
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-foreground">{t("profile.name")}</span>
                <input defaultValue={user.name} className="w-full px-4 py-2.5 bg-secondary/40 border border-border/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-foreground">{t("profile.email")}</span>
                <input defaultValue={user.email} className="w-full px-4 py-2.5 bg-secondary/40 border border-border/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-foreground">{t("profile.password")}</span>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} defaultValue="••••••••" className="w-full px-4 py-2.5 pr-10 bg-secondary/40 border border-border/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </label>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="hero" size="sm" className="w-full sm:w-auto">{t("profile.save")}</Button>
              <Button variant="destructive" size="sm" className="w-full sm:w-auto">{t("profile.deleteAccount")}</Button>
            </div>
          </div>
        )}

        {activeTab === "plan" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-accent/20 rounded-xl border border-primary/10">
              <div>
                <p className="font-display font-bold text-foreground">{plan.name} {t("plan.plan")}</p>
                <p className="text-sm text-muted-foreground">{plan.tagline}</p>
              </div>
              <p className="font-display text-xl font-bold text-primary">
                {formatPrice(user.subscriptionPlan, currency)}
                {user.subscriptionPlan !== "free" && <span className="text-xs text-muted-foreground font-normal"> {t("profile.perMonth")}</span>}
              </p>
            </div>

            <div className="space-y-4">
              {[
                { label: t("overview.stats.models"), current: usage.modelsCount, pct: FeatureService.getUsagePercentage(user, usage, "models") },
                { label: t("overview.stats.layouts"), current: usage.layoutsCount, pct: FeatureService.getUsagePercentage(user, usage, "layouts") },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground font-medium">
                      {item.current} {item.pct !== null ? `/ ${PLAN_CONFIG[user.subscriptionPlan].limits[item.label === t("overview.stats.models") ? "maxModels" : "maxLayouts"]}` : `(${t("profile.unlimited")})`}
                    </span>
                  </div>
                  {item.pct !== null && (
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full gradient-primary rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                  )}
                </div>
              ))}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("overview.stats.ai")}</span>
                <span className="text-foreground font-medium">{usage.aiRequestsCount}</span>
              </div>
            </div>

            <Button variant="hero" size="sm" onClick={() => window.location.href = "/pricing"}>
              {t("billing.upgrade")}
            </Button>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="space-y-6">
            <div className="p-4 bg-accent/20 rounded-xl border border-primary/10">
              <p className="text-sm font-medium text-foreground mb-1">{t("profile.currentPlan")}</p>
              <p className="text-muted-foreground text-sm">{plan.name} — {formatPrice(user.subscriptionPlan, currency)}{t("profile.perMonth")}</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">{t("profile.paymentMethod")}</p>
              <div className="p-3 bg-secondary/40 rounded-xl border border-border/30 text-sm text-muted-foreground">
                {t("profile.noPayment")}
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">{t("profile.invoiceHistory")}</p>
              <div className="p-3 bg-secondary/40 rounded-xl border border-border/30 text-sm text-muted-foreground text-center">
                {t("profile.noInvoices")}
              </div>
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="space-y-5">
            {/* Language selector */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{t("profile.language")}</p>
                <p className="text-xs text-muted-foreground">{t("profile.languageDesc")}</p>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "en" | "vi")}
                className="bg-secondary/40 border border-border/50 rounded-lg px-3 py-1.5 text-sm text-foreground"
              >
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
              </select>
            </div>
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{t("profile.theme")}</p>
                <p className="text-xs text-muted-foreground">{t("profile.themeDesc")}</p>
              </div>
              <select className="bg-secondary/40 border border-border/50 rounded-lg px-3 py-1.5 text-sm text-foreground">
                <option>{t("profile.theme.dark")}</option>
                <option>{t("profile.theme.light")}</option>
              </select>
            </div>
            {/* Currency */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{t("profile.currency")}</p>
                <p className="text-xs text-muted-foreground">{t("profile.currencyDesc")}</p>
              </div>
              <select className="bg-secondary/40 border border-border/50 rounded-lg px-3 py-1.5 text-sm text-foreground">
                <option value="USD">USD ($)</option>
                <option value="VND">VND (₫)</option>
              </select>
            </div>
            {/* Toggles */}
            {[
              { label: t("profile.autoSave"), desc: t("profile.autoSaveDesc"), defaultOn: true },
              { label: t("profile.emailNotif"), desc: t("profile.emailNotifDesc"), defaultOn: false },
            ].map((toggle) => (
              <div key={toggle.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{toggle.label}</p>
                  <p className="text-xs text-muted-foreground">{toggle.desc}</p>
                </div>
                <button className={`w-10 h-6 rounded-full relative transition-colors ${toggle.defaultOn ? 'bg-primary' : 'bg-muted'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-primary-foreground rounded-full transition-all ${toggle.defaultOn ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;
