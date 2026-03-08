import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Box, Home, User, CreditCard, Settings, Sparkles,
  Armchair, Wand2, PenTool, ScanLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@/types/subscription";
import { PLAN_CONFIG } from "@/types/subscription";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardSidebarProps {
  user: UserType;
  collapsed: boolean;
}

const DashboardSidebar = ({ user, collapsed }: DashboardSidebarProps) => {
  const location = useLocation();
  const { t } = useLanguage();
  const planConfig = PLAN_CONFIG[user.subscriptionPlan];

  const navItems = [
    { to: "/dashboard", label: t("nav.overview"), icon: LayoutDashboard, end: true },
    { to: "/dashboard/rooms", label: t("nav.rooms"), icon: Home },
    { to: "/dashboard/models", label: t("nav.models"), icon: Box },
    { to: "/dashboard/furniture", label: t("nav.furniture"), icon: Armchair },
    { to: "/dashboard/ai-generator", label: t("nav.aiGenerator"), icon: Wand2 },
    { to: "/dashboard/room-scan", label: t("nav.roomScan"), icon: ScanLine },
  ];

  const bottomItems = [
    { to: "/dashboard/profile", label: t("nav.profile"), icon: User },
    { to: "/dashboard/billing", label: t("nav.billing"), icon: CreditCard },
    { to: "/dashboard/settings", label: t("nav.settings"), icon: Settings },
  ];

  const isItemActive = (item: typeof navItems[0]) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-card border-r border-border/40 transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border/30 shrink-0">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl gradient-hero flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-display font-bold text-sm">A</span>
          </div>
          {!collapsed && (
            <span className="font-display text-base font-bold text-foreground tracking-tight whitespace-nowrap">
              InteriorAR
            </span>
          )}
        </NavLink>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isItemActive(item);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                active
                  ? "bg-primary/10 text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("w-[18px] h-[18px] shrink-0", active && "text-primary")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Plan badge */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3.5 rounded-xl bg-accent/40 border border-border/30">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">{planConfig.name} {t("plan.plan")}</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">{planConfig.tagline}</p>
        </div>
      )}

      {/* Bottom nav */}
      <div className="px-3 pb-4 space-y-1 border-t border-border/30 pt-3 shrink-0">
        {bottomItems.map((item) => {
          const active = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/10 text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("w-[18px] h-[18px] shrink-0", active && "text-primary")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default DashboardSidebar;
