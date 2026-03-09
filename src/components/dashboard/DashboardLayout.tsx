import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";
import MobileSidebar from "./MobileSidebar";
import UpgradeModal from "./UpgradeModal";
import { useSubscription } from "@/hooks/useSubscription";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { AuthService } from "@/services/AuthService";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const subscription = useSubscription();
  const featureGate = useFeatureGate(subscription.user, subscription.usage);
  const isMobile = useIsMobile();

  const handleUploadModel = () => {
    if (!featureGate.canUploadModel()) return;
    toast({ title: "Upload Model", description: "Model upload will be available with Azure Cloud." });
  };

  const handleCreateRoom = () => {
    toast({ title: "Create Room", description: "Room creation will be available with Azure Cloud." });
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch {
      subscription.logout();
    } finally {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      {/* Desktop sidebar (hidden below 1024px) */}
      <div className="hidden lg:block">
        <DashboardSidebar user={subscription.user} collapsed={collapsed} />
      </div>

      <div
        className={cn(
          "min-h-screen flex flex-col transition-all duration-300 ease-in-out",
          "ml-0 lg:ml-64",
          collapsed && "lg:ml-[72px]"
        )}
      >
        <DashboardTopbar
          user={subscription.user}
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed(!collapsed)}
          onUploadModel={handleUploadModel}
          onCreateRoom={handleCreateRoom}
          onLogout={handleLogout}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto w-full">
            <Outlet
              context={{
                ...subscription,
                featureGate,
                useCredit: subscription.useCredit,
              }}
            />
          </div>
        </main>
      </div>

      {/* Mobile / Tablet slide-out sidebar */}
      <MobileSidebar
        user={subscription.user}
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
      />

      <UpgradeModal
        open={featureGate.showUpgrade}
        reason={featureGate.upgradeReason}
        onClose={() => featureGate.setShowUpgrade(false)}
      />
    </div>
  );
};

export default DashboardLayout;
