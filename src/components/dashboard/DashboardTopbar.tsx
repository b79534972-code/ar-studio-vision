import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { Upload, Plus, PanelLeftClose, PanelLeft, ChevronRight, Globe } from "lucide-react";
import type { User } from "@/types/subscription";
import ProfileDropdown from "./ProfileDropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardTopbarProps {
  user: User;
  collapsed: boolean;
  onToggleSidebar: () => void;
  onUploadModel: () => void;
  onCreateRoom: () => void;
  onLogout: () => void;
}

const DashboardTopbar = ({
  user,
  collapsed,
  onToggleSidebar,
  onUploadModel,
  onCreateRoom,
  onLogout,
}: DashboardTopbarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { t, language, setLanguage } = useLanguage();

  const routeLabels: Record<string, string> = {
    "/dashboard": t("nav.overview"),
    "/dashboard/models": t("nav.models"),
    "/dashboard/rooms": t("nav.rooms"),
    "/dashboard/layouts": t("nav.layouts"),
    "/dashboard/profile": t("nav.profile"),
    "/dashboard/billing": t("nav.billing"),
    "/dashboard/settings": t("nav.settings"),
  };

  const currentLabel = routeLabels[location.pathname] || t("topbar.dashboard");

  return (
    <header className="h-14 border-b border-border/30 bg-card/60 backdrop-blur-xl flex items-center justify-between px-3 md:px-4 sticky top-0 z-20">
      {/* Left: toggle + breadcrumb */}
      <div className="flex items-center gap-2 md:gap-3">
        {!isMobile && (
          <button
            onClick={onToggleSidebar}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}
        <div className="flex items-center gap-1.5 text-sm">
          {isMobile ? (
            <span className="font-display font-bold text-foreground">InteriorAR<span className="text-primary">.</span></span>
          ) : (
            <>
              <span className="text-muted-foreground">{t("topbar.dashboard")}</span>
              {currentLabel !== t("nav.overview") && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                  <span className="text-foreground font-medium">{currentLabel}</span>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === "en" ? "vi" : "en")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          {language === "en" ? "EN" : "VI"}
        </button>
        <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5" onClick={onUploadModel}>
          <Upload className="w-3.5 h-3.5" />
          {t("topbar.uploadModel")}
        </Button>
        <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5" onClick={onCreateRoom}>
          <Plus className="w-3.5 h-3.5" />
          {t("topbar.createRoom")}
        </Button>
        <div className="w-px h-6 bg-border/50 mx-1 hidden sm:block" />
        <ProfileDropdown user={user} onLogout={onLogout} />
      </div>
    </header>
  );
};

export default DashboardTopbar;
