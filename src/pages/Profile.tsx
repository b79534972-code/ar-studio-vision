import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useOutletContext } from "react-router-dom";
import { User as UserIcon, Package, CreditCard, Settings, Eye, EyeOff } from "lucide-react";
import { PLAN_CONFIG, type User, type UserUsage, type Currency, formatPrice } from "@/types/subscription";
import { FeatureService } from "@/services/FeatureService";

interface DashboardContext {
  user: User;
  usage: UserUsage;
  currency: Currency;
}

const tabs = [
  { id: "account", label: "Account", icon: UserIcon },
  { id: "plan", label: "Plan & Usage", icon: Package },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "preferences", label: "Preferences", icon: Settings },
];

const Profile = () => {
  const { user, usage, currency } = useOutletContext<DashboardContext>();
  const [activeTab, setActiveTab] = useState("account");
  const [showPassword, setShowPassword] = useState(false);
  const plan = PLAN_CONFIG[user.subscriptionPlan];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
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
                <span className="text-sm font-medium text-foreground">Name</span>
                <input defaultValue={user.name} className="w-full px-4 py-2.5 bg-secondary/40 border border-border/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-foreground">Email</span>
                <input defaultValue={user.email} className="w-full px-4 py-2.5 bg-secondary/40 border border-border/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-foreground">Password</span>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} defaultValue="••••••••" className="w-full px-4 py-2.5 pr-10 bg-secondary/40 border border-border/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </label>
            </div>
            <div className="flex gap-3">
              <Button variant="hero" size="sm">Save Changes</Button>
              <Button variant="destructive" size="sm">Delete Account</Button>
            </div>
          </div>
        )}

        {activeTab === "plan" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-accent/20 rounded-xl border border-primary/10">
              <div>
                <p className="font-display font-bold text-foreground">{plan.name} Plan</p>
                <p className="text-sm text-muted-foreground">{plan.tagline}</p>
              </div>
              <p className="font-display text-xl font-bold text-primary">
                {formatPrice(user.subscriptionPlan, currency)}
                {user.subscriptionPlan !== "free" && <span className="text-xs text-muted-foreground font-normal"> /mo</span>}
              </p>
            </div>

            <div className="space-y-4">
              {[
                { label: "Models", current: usage.modelsCount, pct: FeatureService.getUsagePercentage(user, usage, "models") },
                { label: "Layouts", current: usage.layoutsCount, pct: FeatureService.getUsagePercentage(user, usage, "layouts") },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground font-medium">
                      {item.current} {item.pct !== null ? `/ ${PLAN_CONFIG[user.subscriptionPlan].limits[item.label === "Models" ? "maxModels" : "maxLayouts"]}` : "(unlimited)"}
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
                <span className="text-muted-foreground">AI Requests</span>
                <span className="text-foreground font-medium">{usage.aiRequestsCount}</span>
              </div>
            </div>

            <Button variant="hero" size="sm" onClick={() => window.location.href = "/pricing"}>
              Upgrade Plan
            </Button>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="space-y-6">
            <div className="p-4 bg-accent/20 rounded-xl border border-primary/10">
              <p className="text-sm font-medium text-foreground mb-1">Current Plan</p>
              <p className="text-muted-foreground text-sm">{plan.name} — {formatPrice(user.subscriptionPlan, currency)}/mo</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Payment Method</p>
              <div className="p-3 bg-secondary/40 rounded-xl border border-border/30 text-sm text-muted-foreground">
                No payment method on file
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Invoice History</p>
              <div className="p-3 bg-secondary/40 rounded-xl border border-border/30 text-sm text-muted-foreground text-center">
                No invoices yet
              </div>
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="space-y-5">
            {[
              { label: "Default Unit", desc: "Measurement unit for dimensions", options: ["cm", "m"] },
              { label: "Theme", desc: "Application color theme", options: ["Dark", "Light"] },
            ].map((pref) => (
              <div key={pref.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{pref.label}</p>
                  <p className="text-xs text-muted-foreground">{pref.desc}</p>
                </div>
                <select className="bg-secondary/40 border border-border/50 rounded-lg px-3 py-1.5 text-sm text-foreground">
                  {pref.options.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
              </div>
            ))}
            {[
              { label: "Auto-save layouts", desc: "Automatically save layout changes" },
              { label: "AR grid overlay", desc: "Show measurement grid in AR" },
              { label: "AI auto-suggest", desc: "Get AI suggestions while designing" },
            ].map((toggle) => (
              <div key={toggle.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{toggle.label}</p>
                  <p className="text-xs text-muted-foreground">{toggle.desc}</p>
                </div>
                <button className="w-10 h-6 bg-primary rounded-full relative">
                  <span className="absolute right-1 top-1 w-4 h-4 bg-primary-foreground rounded-full" />
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
