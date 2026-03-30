import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Shield, Database, Download, Trash2, RefreshCw, Lock, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const DashboardSettings = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("notifications");
  const [emailNotif, setEmailNotif] = useState(true);
  const [marketingNotif, setMarketingNotif] = useState(false);
  const [layoutNotif, setLayoutNotif] = useState(true);

  const tabs = [
    { id: "notifications", label: t("settings.tab.notifications"), icon: Bell },
    { id: "security", label: t("settings.tab.security"), icon: Shield },
    { id: "data", label: t("settings.tab.data"), icon: Database },
  ];

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`w-10 h-6 rounded-full relative transition-colors ${on ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-primary-foreground rounded-full transition-all ${on ? "right-1" : "left-1"}`} />
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
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
        {/* Notifications */}
        {activeTab === "notifications" && (
          <div className="space-y-5">
            {[
              { label: t("settings.notif.email"), desc: t("settings.notif.emailDesc"), on: emailNotif, toggle: () => setEmailNotif(!emailNotif) },
              { label: t("settings.notif.marketing"), desc: t("settings.notif.marketingDesc"), on: marketingNotif, toggle: () => setMarketingNotif(!marketingNotif) },
              { label: t("settings.notif.layoutSaved"), desc: t("settings.notif.layoutSavedDesc"), on: layoutNotif, toggle: () => setLayoutNotif(!layoutNotif) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Toggle on={item.on} onToggle={item.toggle} />
              </div>
            ))}
          </div>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Change password */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">{t("settings.security.changePassword")}</h3>
              </div>
              <div className="grid gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("settings.security.currentPassword")}</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("settings.security.newPassword")}</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("settings.security.confirmPassword")}</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
              <Button size="sm" onClick={() => toast({ title: t("settings.security.update") })}>
                {t("settings.security.update")}
              </Button>
            </div>

            <div className="h-px bg-border/40" />

            {/* 2FA */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{t("settings.security.twoFactor")}</p>
                <p className="text-xs text-muted-foreground">{t("settings.security.twoFactorDesc")}</p>
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                {t("settings.security.enable2FA")}
              </Button>
            </div>

            <div className="h-px bg-border/40" />

            {/* Sessions */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">{t("settings.security.sessions")}</p>
                <p className="text-xs text-muted-foreground">{t("settings.security.sessionsDesc")}</p>
              </div>
              <div className="p-3 bg-secondary/40 rounded-xl border border-border/30 flex items-center gap-3">
                <Monitor className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">{t("settings.security.currentSession")}</p>
                  <p className="text-[10px] text-muted-foreground">Chrome · {new Date().toLocaleDateString()}</p>
                </div>
                <span className="text-[9px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast({ title: t("settings.security.logoutAll") })}>
                {t("settings.security.logoutAll")}
              </Button>
            </div>
          </div>
        )}

        {/* Data Management */}
        {activeTab === "data" && (
          <div className="space-y-5">
            {/* Export */}
            <div className="flex items-center justify-between p-4 bg-secondary/40 rounded-xl border border-border/30">
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{t("settings.data.export")}</p>
                  <p className="text-xs text-muted-foreground">{t("settings.data.exportDesc")}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs shrink-0" onClick={() => toast({ title: t("settings.data.export") })}>
                {t("settings.data.exportBtn")}
              </Button>
            </div>

            {/* Clear cache */}
            <div className="flex items-center justify-between p-4 bg-secondary/40 rounded-xl border border-border/30">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{t("settings.data.cache")}</p>
                  <p className="text-xs text-muted-foreground">{t("settings.data.cacheDesc")}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs shrink-0" onClick={() => toast({ title: t("settings.data.cache") })}>
                {t("settings.data.cacheBtn")}
              </Button>
            </div>

            {/* Delete all */}
            <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-xl border border-destructive/20">
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-destructive shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{t("settings.data.delete")}</p>
                  <p className="text-xs text-muted-foreground">{t("settings.data.deleteDesc")}</p>
                </div>
              </div>
              <Button variant="destructive" size="sm" className="text-xs shrink-0">
                {t("settings.data.deleteBtn")}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardSettings;