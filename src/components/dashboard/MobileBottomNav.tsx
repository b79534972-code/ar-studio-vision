import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Box, Home, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/dashboard/models", label: "Models", icon: Box },
  { to: "/dashboard/rooms", label: "Rooms", icon: Home },
  { to: "/dashboard/profile", label: "Profile", icon: User },
];

const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/50 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = tab.end
            ? location.pathname === tab.to
            : location.pathname.startsWith(tab.to) && location.pathname !== "/dashboard";
          // Special case: "Home" tab should only be active on exact /dashboard
          const active = tab.end ? location.pathname === tab.to : (!tab.end && location.pathname.startsWith(tab.to));
          
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full text-[10px] font-medium transition-colors min-w-[44px]",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
