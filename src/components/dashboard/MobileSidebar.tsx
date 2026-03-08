import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Box, Home, User, CreditCard, Settings, Sparkles,
  Armchair, Wand2, ScanLine,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@/types/subscription";
import { PLAN_CONFIG } from "@/types/subscription";
import { useLanguage } from "@/contexts/LanguageContext";

interface MobileSidebarProps {
  user: UserType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileSidebar = ({ user, open, onOpenChange }: MobileSidebarProps) => {
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        <SheetHeader className="h-16 flex flex-row items-center px-5 border-b border-border/30 shrink-0 space-y-0">
          <NavLink
            to="/dashboard/profile"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2.5 flex-1 min-w-0"
          >
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-display font-bold text-sm">{user.name.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-sm font-semibold text-foreground truncate">
                {user.name}
              </SheetTitle>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </NavLink>
        </SheetHeader>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px]",
                  active
                    ? "bg-primary/10 text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                )}
              >
                <item.icon className={cn("w-[18px] h-[18px] shrink-0", active && "text-primary")} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Plan badge */}
        <div className="mx-3 mb-3 p-3.5 rounded-xl bg-accent/40 border border-border/30">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">{planConfig.name} {t("plan.plan")}</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">{planConfig.tagline}</p>
        </div>

        {/* Bottom nav */}
        <div className="px-3 pb-4 space-y-1 border-t border-border/30 pt-3 shrink-0">
          {bottomItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px]",
                  active
                    ? "bg-primary/10 text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                )}
              >
                <item.icon className={cn("w-[18px] h-[18px] shrink-0", active && "text-primary")} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
