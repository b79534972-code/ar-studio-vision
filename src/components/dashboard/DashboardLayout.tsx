import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";
import UpgradeModal from "./UpgradeModal";
import { useSubscription } from "@/hooks/useSubscription";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const subscription = useSubscription();
  const featureGate = useFeatureGate(subscription.user, subscription.usage);

  const handleUploadModel = () => {
    if (!featureGate.canUploadModel()) return;
    toast({ title: "Upload Model", description: "Model upload will be available with Lovable Cloud." });
  };

  const handleCreateRoom = () => {
    toast({ title: "Create Room", description: "Room creation will be available with Lovable Cloud." });
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar user={subscription.user} collapsed={collapsed} />
      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "ml-[68px]" : "ml-60"
        )}
      >
        <DashboardTopbar
          user={subscription.user}
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed(!collapsed)}
          onUploadModel={handleUploadModel}
          onCreateRoom={handleCreateRoom}
          onLogout={handleLogout}
        />
        <main className="p-6">
          <Outlet
            context={{
              ...subscription,
              featureGate,
            }}
          />
        </main>
      </div>

      <UpgradeModal
        open={featureGate.showUpgrade}
        reason={featureGate.upgradeReason}
        onClose={() => featureGate.setShowUpgrade(false)}
      />
    </div>
  );
};

export default DashboardLayout;
