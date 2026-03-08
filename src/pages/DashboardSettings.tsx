import { motion } from "framer-motion";
import { Settings as SettingsIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const DashboardSettings = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border/50 shadow-card p-8 text-center"
      >
        <SettingsIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">
          {t("settings.placeholder")}
        </p>
      </motion.div>
    </div>
  );
};

export default DashboardSettings;
