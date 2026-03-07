import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";
import MobileBottomNav from "./MobileBottomNav";
import UpgradeModal from "./UpgradeModal";
import { useSubscription } from "@/hooks/useSubscription";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const subscription = useSubscription();
  const featureGate = useFeatureGate(subscription.user, subscription.usage);
  const isMobile = useIsMobile();

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
      {/* Desktop sidebar */}
      {!isMobile && <DashboardSidebar user={subscription.user} collapsed={collapsed} />}
      
      <div
        className={cn(
          "transition-all duration-300",
          isMobile ? "ml-0" : collapsed ? "ml-[68px]" : "ml-60"
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
        <main className={cn("p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12", isMobile && "pb-20")}>
          <Outlet
            context={{
              ...subscription,
              featureGate,
            }}
          />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      {isMobile && <MobileBottomNav />}

      <UpgradeModal
        open={featureGate.showUpgrade}
        reason={featureGate.upgradeReason}
        onClose={() => featureGate.setShowUpgrade(false)}
      />
    </div>
  );
};

export default DashboardLayout;
