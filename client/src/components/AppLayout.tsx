import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import {
  Zap, LayoutDashboard, Dumbbell, Brain, TrendingUp,
  Crown, Settings, LogOut, Menu, X, Building2, ChevronRight
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/workouts", icon: Dumbbell, label: "Workouts" },
  { path: "/ai-coach", icon: Brain, label: "AI Coach" },
  { path: "/progress", icon: TrendingUp, label: "Progress" },
  { path: "/upgrade", icon: Crown, label: "Upgrade PRO", highlight: true },
];

const ADMIN_ITEMS = [
  { path: "/admin", icon: Building2, label: "Admin Panel" },
];

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: profileData } = trpc.profile.get.useQuery(undefined, {
    enabled: !!user,
  });

  const isPro = profileData?.subscription?.plan === "pro" && profileData?.subscription?.status === "active";
  const isAdmin = user?.role === "admin";
  const displayName = profileData?.profile?.displayName || user?.name || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-bold text-sm text-sidebar-foreground">AuraFit</span>
          <span className="text-gradient-primary font-bold text-sm"> Pro</span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const isActive = location === item.path || (item.path !== "/dashboard" && location.startsWith(item.path));
          return (
            <Link key={item.path} href={item.path}>
              <a
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : item.highlight
                    ? "text-amber-400 hover:bg-amber-400/10"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
                {item.highlight && !isPro && (
                  <span className="ml-auto pro-badge">PRO</span>
                )}
                {item.highlight && isPro && (
                  <Crown className="ml-auto w-3.5 h-3.5 text-amber-400" />
                )}
              </a>
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="pt-2 pb-1 px-3">
              <span className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">Admin</span>
            </div>
            {ADMIN_ITEMS.map(item => {
              const isActive = location.startsWith(item.path);
              return (
                <Link key={item.path} href={item.path}>
                  <a
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User Profile */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <Link href="/profile">
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sidebar-accent transition-colors cursor-pointer">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</p>
                {isPro && <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />}
              </div>
              <p className="text-xs text-sidebar-foreground/50 truncate">{user?.email || ""}</p>
            </div>
          </a>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start gap-3 px-3 mt-1 text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border flex-shrink-0">
        <NavContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
            <NavContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-border/50 bg-background/80 backdrop-blur-sm flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="w-9 h-9">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md gradient-primary flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm">AuraFit <span className="text-gradient-primary">Pro</span></span>
          </div>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{initials}</AvatarFallback>
          </Avatar>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
