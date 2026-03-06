import { motion } from "framer-motion";
import { Settings as SettingsIcon } from "lucide-react";

const DashboardSettings = () => {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Application and workspace settings</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border/50 shadow-card p-8 text-center"
      >
        <SettingsIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">
          Settings will be available when Lovable Cloud is connected.
        </p>
      </motion.div>
    </div>
  );
};

export default DashboardSettings;
