import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { Upload, Plus, PanelLeftClose, PanelLeft, ChevronRight, Globe, Menu } from "lucide-react";
import type { User } from "@/types/subscription";
import ProfileDropdown from "./ProfileDropdown";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardTopbarProps {
  user: User;
  collapsed: boolean;
  onToggleSidebar: () => void;
  onUploadModel: () => void;
  onCreateRoom: () => void;
  onLogout: () => void;
  onOpenMobileSidebar?: () => void;
}

const DashboardTopbar = ({
  user,
  collapsed,
  onToggleSidebar,
  onUploadModel,
  onCreateRoom,
  onLogout,
  onOpenMobileSidebar,
}: DashboardTopbarProps) => {
  const location = useLocation();
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
    <header className="h-16 border-b border-border/30 glass-strong flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      {/* Left: toggle + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile/Tablet hamburger (below lg) */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all duration-200"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Desktop sidebar toggle (lg+) */}
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex w-9 h-9 rounded-xl items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all duration-200"
        >
          {collapsed ? <PanelLeft className="w-[18px] h-[18px]" /> : <PanelLeftClose className="w-[18px] h-[18px]" />}
        </button>
        <div className="flex items-center gap-1.5 text-sm min-w-0">
          <span className="lg:hidden font-display font-bold text-foreground">
            InteriorAR<span className="text-primary">.</span>
          </span>
          <div className="hidden lg:flex items-center gap-1.5">
            <span className="text-muted-foreground">{t("topbar.dashboard")}</span>
            {currentLabel !== t("nav.overview") && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                <span className="text-foreground font-medium truncate">{currentLabel}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setLanguage(language === "en" ? "vi" : "en")}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all duration-200"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{language === "en" ? "EN" : "VI"}</span>
        </button>
        <Button variant="outline" size="sm" className="hidden md:flex gap-1.5 rounded-xl" onClick={onUploadModel}>
          <Upload className="w-3.5 h-3.5" />
          {t("topbar.uploadModel")}
        </Button>
        <Button variant="outline" size="sm" className="hidden md:flex gap-1.5 rounded-xl" onClick={onCreateRoom}>
          <Plus className="w-3.5 h-3.5" />
          {t("topbar.createRoom")}
        </Button>
        <div className="w-px h-7 bg-border/40 mx-1 hidden md:block" />
        <ProfileDropdown user={user} onLogout={onLogout} />
      </div>
    </header>
  );
};

export default DashboardTopbar;
