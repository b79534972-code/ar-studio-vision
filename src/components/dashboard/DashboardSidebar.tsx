import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Box,
  Home,
  Layers,
  User,
  CreditCard,
  Settings,
  Sparkles,
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
    { to: "/dashboard/models", label: t("nav.models"), icon: Box },
    { to: "/dashboard/rooms", label: t("nav.rooms"), icon: Home },
    { to: "/dashboard/layouts", label: t("nav.layouts"), icon: Layers },
  ];

  const bottomItems = [
    { to: "/dashboard/profile", label: t("nav.profile"), icon: User },
    { to: "/dashboard/billing", label: t("nav.billing"), icon: CreditCard },
    { to: "/dashboard/settings", label: t("nav.settings"), icon: Settings },
  ];

  const linkClass = (isActive: boolean) =>
    cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
    );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-30 flex flex-col border-r border-border/50 bg-card/60 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-[68px]" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-border/30">
        <NavLink to="/dashboard" className="font-display text-lg font-bold text-foreground tracking-tight">
          {collapsed ? "S" : <>InteriorAR<span className="text-primary">.</span></>}
        </NavLink>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          return (
            <NavLink key={item.to} to={item.to} className={linkClass(isActive)}>
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Plan badge */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-accent/30 border border-border/30">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">{planConfig.name} {t("plan.plan")}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{planConfig.tagline}</p>
        </div>
      )}

      {/* Bottom nav */}
      <div className="px-3 pb-4 space-y-1 border-t border-border/30 pt-3">
        {bottomItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink key={item.to} to={item.to} className={linkClass(isActive)}>
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default DashboardSidebar;
